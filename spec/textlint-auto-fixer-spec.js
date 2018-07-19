'use babel';

const path = require('path');

const fixturesDir = path.join(__dirname, 'fixtures');

const fixtures = {
  empty: ['files', 'empty.md'],
  fixable: ['files', 'fixable.md'],
  valid: ['files', 'valid.md'],
};

const paths = Object.keys(fixtures).reduce((accumulator, fixture) => {
  const acc = accumulator;
  acc[fixture] = path.join(fixturesDir, ...fixtures[fixture]);
  return acc;
}, {});

describe('textlint-auto-fixer in empty file', () => {
  let textEditor;
  let textEditorElement;

  beforeEach(() => {
    waitsForPromise(() => atom.workspace.open(paths.empty));
    waitsForPromise(() => atom.packages.activatePackage('textlint-auto-fixer'));
    runs(() => {
      textEditor = atom.workspace.getActiveTextEditor();
      textEditorElement = atom.views.getView(textEditor);
    });
  });
  afterEach(() => {
    atom.packages.deactivatePackage('textlint-auto-fixer');
  });

  describe('when the textlint-auto-fixer:fix-current-file event is triggered', () => {
    beforeEach(() => {
      atom.commands.dispatch(
        textEditorElement,
        'textlint-auto-fixer:fix-current-file'
      );
    });
    it('should be nothing wrong', () => {
      expect(textEditor.getText()).toEqual('');
    });
  });
});

describe('textlint-auto-fixer in valid file', () => {
  let textEditor;
  let textEditorElement;

  beforeEach(() => {
    waitsForPromise(() => atom.workspace.open(paths.valid));
    waitsForPromise(() => atom.packages.activatePackage('textlint-auto-fixer'));
    runs(() => {
      textEditor = atom.workspace.getActiveTextEditor();
      textEditorElement = atom.views.getView(textEditor);
    });
  });
  afterEach(() => {
    atom.packages.deactivatePackage('textlint-auto-fixer');
  });

  describe('when the textlint-auto-fixer:fix-current-file event is triggered', () => {
    beforeEach(() => {
      atom.commands.dispatch(
        textEditorElement,
        'textlint-auto-fixer:fix-current-file'
      );
    });
    it('should be nothing wrong', () => {
      expect(textEditor.getText()).toEqual("Isn't She Lovely\n");
    });
  });
});

describe('textlint-auto-fixer in fixable file', () => {
  let textEditor;
  let textEditorElement;

  beforeEach(() => {
    waitsForPromise(() => atom.workspace.open(paths.fixable));
    waitsForPromise(() => atom.packages.activatePackage('textlint-auto-fixer'));
    runs(() => {
      textEditor = atom.workspace.getActiveTextEditor();
      textEditorElement = atom.views.getView(textEditor);
    });
  });
  afterEach(() => {
    atom.packages.deactivatePackage('textlint-auto-fixer');
  });

  describe('when the textlint-auto-fixer:fix-current-file event is triggered', () => {
    beforeEach(() => {
      atom.commands.dispatch(
        textEditorElement,
        'textlint-auto-fixer:fix-current-file'
      );
    });
    it('should fix the file', () => {
      expect(textEditor.getText()).toEqual("Isn't She Lovely\n");
    });
  });
});
