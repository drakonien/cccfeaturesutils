# Tips for extension usage: debug, build, package and installation

## To debug the extension

Launch VSCode directly from the extension folder. In this case `cccfeaturesutils\1.0`.

```powershell
code absolutepath\cccfeaturesutils\1.0
```

Put the following JSON in the `launch.json` file, inside the `.vscode` folder to configure extension debugging in VSCode

```json
// A launch configuration that compiles the extension and then opens it inside a new window
// Use IntelliSense to learn about possible attributes.
// Hover to view descriptions of existing attributes.
// For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Run Extension",
            "type": "extensionHost",
            "request": "launch",
            "runtimeExecutable": "${execPath}",
            "args": [
                "--extensionDevelopmentPath=${workspaceFolder}"
            ],
            "outFiles": [
                "${workspaceFolder}/dist/**/*.js"
            ],
            "preLaunchTask": "npm: webpack"
        },
        {
            "name": "Run Extension Clean VSCode",
            "type": "extensionHost",
            "request": "launch",
            "runtimeExecutable": "${execPath}",
            "args": [
                "--disable-extensions",
                "--extensionDevelopmentPath=${workspaceFolder}"
            ],
            "outFiles": [
                "${workspaceFolder}/dist/**/*.js"
            ],
            "preLaunchTask": "npm: webpack"
        }
    ]
}
```

Use `F5` to launch another VSCode with the extension installed.
Note that the extension won't be activated untill the first call of any method.

## To build the extension

```npm
tsc -p ./
```

## To package extension

```npm
vsce package
```

## To package extension with webpack (preferred method)

For debbuging:

```npm
npm run webpack
```

or for production:

```npm
npm run vscode:prepublish
```

## To install extension

Use the `Extensions: Install from VSIX...` form the command palette.
