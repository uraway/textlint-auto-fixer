'use babel';

import { CompositeDisposable } from 'atom';
import path from 'path';
import temp from 'temp';
import fs from 'fs';
import { spawnSync } from 'child_process';
import config from './config';

let textlintPath;
let textlintConfigPath;
let fixOnSave;
let allowNotifications;

export default {
  config,
  subscriptions: null,

  activate() {
    /*
    textlintPath = atom.config.get('textlint-auto-fixer.textlintPath');
    atom.config.observe('textlint-auto-fixer.textlintPath', (value) => {
      textlintPath = value;
    });
    textlintConfigPath = atom.config.get('textlint-auto-fixer.textlintConfigPath');
    atom.config.observe('textlint-auto-fixer.textlintConfigPath', (value) => {
      textlintConfigPath = value;
    });
    */
    const directory = atom.project.rootDirectories[0];

    if (!directory) {
      return;
    }
    textlintPath = directory.resolve('./node_modules/.bin/textlint');
    textlintConfigPath = directory.resolve('./.textlintrc');

    allowNotifications = atom.config.get('textlint-auto-fixer.allowNotifications');
    atom.config.observe('textlint-auto-fixer.allowNotifications', (value) => {
      allowNotifications = value;
    });
    fixOnSave = atom.config.get('textlint-auto-fixer.fixOnSave');
    atom.config.observe('textlint-auto-fixer.fixOnSave', (value) => {
      fixOnSave = value;
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.workspace.observeTextEditors((editor) => {
      if (editor.getGrammar().scopeName.match(/text\.md|text\.plain/)) {
        const buffer = editor.getBuffer();
        const bufferSavedSubscription = buffer.onDidSave(() => {
          buffer.transact(() => {
            if (fixOnSave) {
              this.fix(editor);
            }
          });
        });

        this.subscriptions.add(bufferSavedSubscription);
      }
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'textlint-auto-fixer:fix-current-file': () => this.fix(atom.workspace.getActiveTextEditor()),
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {},

  fix(editor) {
    const tempFilePath = this.makeTempFile('tempfile.md');
    const buffer = editor.getBuffer();
    fs.writeFileSync(tempFilePath, buffer.getText());

    const command = textlintPath;
    const args = [
      `${tempFilePath}`, '--fix', `--config ${textlintConfigPath}`,
    ];
    const options = { cwd: path.dirname(editor.getPath()), encoding: 'utf-8' };

    const textlint = spawnSync(command, args, options);

    if (textlint.stdout) {
      const tempFileText = fs.readFileSync(tempFilePath, 'utf-8');
      buffer.setTextViaDiff(tempFileText);
      editor.save();
      if (allowNotifications) {
        atom.notifications.addWarning(textlint.stdout);
      }
    }

    if (textlint.stderr) {
      if (allowNotifications) {
        atom.notifications.addError(textlint.stderr);
      }
    }

    // new BufferedNodeProcess({ command, args, options, stdout, stderr });
  },

  makeTempFile(filename) {
    const directory = temp.mkdirSync();
    const filePath = path.join(directory, filename);
    fs.writeFileSync(filePath, '');
    return filePath;
  },
};
