'use babel';

import path from 'path';

export default {
  textlintPath: {
    description: 'Path to textlint binary',
    type: 'string',
    default: path.join(__dirname, '..', 'node_modules', '.bin', 'textlint'),
  },
  textlintConfigPath: {
    description: 'Path to .textlintrc',
    type: 'string',
    default: path.join(__dirname, '..', '.textlintrc'),
  },
  fixOnSave: {
    type: 'boolean',
    default: false,
  },
  allowNotifications: {
    type: 'boolean',
    default: false,
  },
};
