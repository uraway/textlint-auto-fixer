path = require "path"
fs = require "fs"
temp = require "temp"
{TextLintEngine} = require "textlint"

textlintPath = path.join(__dirname, "node_modules", ".bin", "textlint")
textlintConfigPath = path.join(__dirname, ".textlintrc")
engine = new TextLintEngine({
  configFile: textlintConfigPath
})

describe "TextlintAutoFixer", ->
  [editor, buffer, workspaceElement, filePath, activatePromise] = []

  beforeEach ->
    directory = atom.project.rootDirectories[0]
    workspaceElement = atom.views.getView(atom.workspace)
    filePath = directory.resolve("./fix.md")
    fs.writeFileSync(filePath, "")

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
      buffer.setText("Isnt She Lovely")
      atom.config.set("textlint-auto-fixer.fixOnSave", false)

    it "manually fix errors", ->
      bufferChangedSpy = jasmine.createSpy()
      buffer.onDidChange(bufferChangedSpy)

      atom.commands.dispatch(workspaceElement, "textlint-auto-fixer:fix-current-file")

      waitsFor ->
        bufferChangedSpy.callCount > 0

      runs ->
        expect(buffer.getText()).toBe "Isn\'t She Lovely"

  describe "when 'fixOnSave' is true", ->
    beforeEach ->
      buffer.setText("Isnt She Lovely")
      atom.config.set("textlint-auto-fixer.fixOnSave", true)

    it "fix errors on save", ->
      bufferChangedSpy = jasmine.createSpy()
      buffer.onDidChange(bufferChangedSpy)

      editor.save()

      waitsFor ->
        bufferChangedSpy.callCount > 0

      runs ->
        expect(buffer.getText()).toBe "Isn\'t She Lovely"
