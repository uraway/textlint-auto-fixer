'use babel';

const directory = atom.project.rootDirectories[0];

export default {
  textlintPath: {
    description: 'Path to textlint binary',
    type: 'string',
    default: directory.resolve('./node_modules/.bin/textlint'),
  },
  textlintConfigPath: {
    description: 'Path to .textlintrc',
    type: 'string',
    default: directory.resolve('./.textlintrc'),
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
