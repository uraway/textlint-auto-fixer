'use babel';

export default {
  textlintPath: {
    description:
  'Custom path to textlint binary. It will be used when no textlint binary found in your project.',
    type: 'string',
    default: '',
  },
  textlintConfigPath: {
    description:
  'Custom path to textlint config. It will be used when no .textlintrc found in your project.',
    type: 'string',
    default: '',
  },
  fixOnSave: {
    description:
  'Have textlint attempt to fix some errors automatically when saving the current file.',
    type: 'boolean',
    default: false,
  },
  allowNotifications: {
    description: 'Allow notifications of output from the textlint execution.',
    type: 'boolean',
    default: false,
  },
};
