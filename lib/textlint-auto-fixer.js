'use babel';

import { CompositeDisposable } from 'atom';
import path from 'path';
import temp from 'temp';
import fs from 'fs';
import { spawnSync } from 'child_process';
import config from './config';

export default {
  config,
  subscriptions: null,

  activate() {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.workspace.observeTextEditors((editor) => {
      if (editor.getGrammar().scopeName.match(/text\.md|text\.plain/)) {
        if (this.getFixOnSave()) {
          editor.onDidSave(() => {
            this.fix(editor);
          });
        }
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

  getCurrentFilePath() {
    return atom.workspace.getActiveTextEditor().getPath();
  },

  getTextlintPath() {
    return atom.config.get('textlint-auto-fixer.textlintPath');
  },

  getTextlintConfigPath() {
    return atom.config.get('textlint-auto-fixer.textlintConfigPath');
  },

  getAllowNotifications() {
    return atom.config.get('textlint-auto-fixer.allowNotifications');
  },

  getFixOnSave() {
    return atom.config.get('textlint-auto-fixer.fixOnSave');
  },

  fix(editor) {
    const tempFilePath = this.makeTempFile('tempfile.md');
    const buffer = editor.getBuffer();
    fs.writeFileSync(tempFilePath, buffer.getText());

    const command = this.getTextlintPath();
    const args = [
      `${tempFilePath}`, '--fix', `--config ${this.getTextlintConfigPath()}`,
    ];
    const options = { cwd: path.dirname(this.getCurrentFilePath()), encoding: 'utf-8' };

    const textlint = spawnSync(command, args, options);

    if (textlint.stdout) {
      const tempFileText = fs.readFileSync(tempFilePath, 'utf-8');
      buffer.setTextViaDiff(tempFileText);
      if (this.getAllowNotifications()) {
        atom.notifications.addWarning(textlint.stdout);
      }
    }

    if (textlint.stderr) {
      if (this.getAllowNotifications()) {
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
