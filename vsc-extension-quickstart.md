# Tips for extension usage: debug, build, package and installation

## To debug the extension

Launch VSCode directly from the extension folder. In this case `cccfeaturesutils\1.0`.

```powershell
code absolutepath\cccfeaturesutils\1.0
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

## To install extension

Use the `Extensions: Install from VSIX...` form the command palette.
