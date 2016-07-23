path = require "path"
{TextLintEngine} = require "textlint"

textlintPath = path.join(__dirname, "node_modules", "textlint", "bin", "textlint.js")
textlintConfigPath = path.join(__dirname, ".textlintrc")
filePath = path.join(__dirname, "fixtures", "fix.md")
engine = new TextLintEngine({
  configFile: textlintConfigPath
})

describe "TextlintAutoFixer", ->
  [editor, buffer, workspaceElement] = []

  beforeEach ->
    workspaceElement = atom.views.getView(atom.workspace)
    atom.config.set("textlint-auto-fixer.textlintPath", textlintPath)
    atom.config.set("textlint-auto-fixer.textlintConfigPath", textlintConfigPath)

    waitsForPromise ->
      atom.workspace.open(filePath).then (o) -> editor = o

    runs ->
      buffer = editor.getBuffer()

    waitsForPromise ->
      atom.packages.activatePackage("textlint-auto-fixer")

  describe "when 'fixOnSave' is false", ->
    beforeEach ->
      atom.config.set("textlint-auto-fixer.fixOnSave", false)

    it "fix errors", ->
      editor.setText("Isnt She Lovely")
      atom.commands.dispatch(workspaceElement, "textlint-auto-fixer:fix-current-file")
      waitsForPromise ->
        engine.executeOnFiles([editor.getPath()]).then (results) ->
          expect(results[0].messages.length).toBe(0)
###
  describe "when 'fixOnSave' is true", ->
    beforeEach ->
      atom.config.set("textlint-auto-fixer.fixOnSave", true)

    it "fix errors on save", ->
      editor.setText("Isnt She Lovely")
      editor.save()
      expect(editor.getText()).toBe "Isn\'t She Lovely"
      waitsForPromise ->
        engine.executeOnFiles([editor.getPath()]).then (results) ->
          expect(results[0].messages.length).toBe(0)
###
