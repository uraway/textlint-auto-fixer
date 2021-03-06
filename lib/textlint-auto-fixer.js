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

function makeTempFile(filename) {
  const directory = temp.mkdirSync();
  const filePath = path.join(directory, filename);
  fs.writeFileSync(filePath, '');
  return filePath;
}

function isExistFile(file) {
  try {
    fs.statSync(file);
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') return false;
  }
  return false;
}

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

    if (!directory) return;

    textlintPath = directory.resolve('./node_modules/.bin/textlint');
    textlintConfigPath = directory.resolve('./.textlintrc');

    allowNotifications = atom.config.get(
      'textlint-auto-fixer.allowNotifications'
    );
    atom.config.observe('textlint-auto-fixer.allowNotifications', value => {
      allowNotifications = value;
    });
    fixOnSave = atom.config.get('textlint-auto-fixer.fixOnSave');
    atom.config.observe('textlint-auto-fixer.fixOnSave', value => {
      fixOnSave = value;
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(
      atom.workspace.observeTextEditors(editor => {
        if (editor.getGrammar().scopeName.match(/text\.md|text\.plain/)) {
          const buffer = editor.getBuffer();
          const bufferSavedSubscription = buffer.onDidSave(() => {
            buffer.transact(() => {
              if (fixOnSave) {
                this.fix(editor, true);
              }
            });
          });

          this.subscriptions.add(bufferSavedSubscription);
        }
      })
    );

    this.subscriptions.add(
      atom.commands.add('atom-text-editor', {
        'textlint-auto-fixer:fix-current-file': () =>
          this.fix(atom.workspace.getActiveTextEditor(), false),
      })
    );
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {},

  fix(editor, isAuto) {
    if (!isExistFile(textlintPath)) {
      atom.notifications.addError('textlint-auto-fixer: textlint not found', {
        dismissable: true,
      });
      return;
    }

    const tempFilePath = makeTempFile('tempfile.md');
    const buffer = editor.getBuffer();
    fs.writeFileSync(tempFilePath, buffer.getText());

    const command = textlintPath;
    const args = [tempFilePath, '--fix', '--config', textlintConfigPath];
    const options = { cwd: path.dirname(editor.getPath()), encoding: 'utf-8' };

    const textlint = spawnSync(command, args, options);

    if (textlint.stdout) {
      const tempFileText = fs.readFileSync(tempFilePath, 'utf-8');
      buffer.setTextViaDiff(tempFileText);
      editor.save();
      const msg = 'textlint-auto-fixer: Fix complete';

      if (allowNotifications) {
        atom.notifications.addSuccess(msg, { dismissable: true });
      }
    }

    if (textlint.stderr) {
      atom.notifications.addError(textlint.stderr, { dismissable: true });
    }

    if (textlint.error) {
      atom.notifications.addError(textlint.error.message, {
        dismissable: true,
      });
    }

    if (
      !textlint.stdout &&
      !textlint.stderr &&
      textlint.status === 0 &&
      isAuto === false
    ) {
      atom.notifications.addInfo('textlint-auto-fixer: Nothing to fix', {
        dismissable: true,
      });
    }
  },
};
