'use babel';

import { CompositeDisposable, BufferedNodeProcess } from 'atom';
import path from 'path';
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
            this.fix();
          });
        }
      }
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'textlint-auto-fixer:fix-current-file': () => this.fix(),
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

  getTextlintrcPath() {
    return atom.config.get('textlint-auto-fixer.textlintConfigPath');
  },

  getAllowNotifications() {
    return atom.config.get('textlint-auto-fixer.allowNotifications');
  },

  getFixOnSave() {
    return atom.config.get('textlint-auto-fixer.fixOnSave');
  },

  fix() {
    const command = this.getTextlintPath();
    const args = [`${this.getCurrentFilePath()}`, '--fix', `--config ${this.getTextlintrcPath()}`];
    const options = { cwd: path.dirname(this.getCurrentFilePath()) };

    const stdout = (msg) => {
      if (this.getAllowNotifications()) {
        atom.notifications.addWarning(msg);
      }
    };

    const stderr = (msg) => {
      if (this.getAllowNotifications()) {
        atom.notifications.addError(msg);
      }
    };

    new BufferedNodeProcess({ command, args, options, stdout, stderr });
    // see more info: https://github.com/atom/atom/blob/master/src/buffered-node-process.coffee
  },
};
