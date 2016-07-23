'use babel';

export default {
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
