# Changelog

## 1.9.0 (2020-08-13)

### Added

- Two new funtionalities:
  - `GetParameters`
  - `GetTableInput`

## 1.8.3 (2020-08-12)

### Changed

- Changes workflow action to run on "pull request" changes.

## 1.8.2 (2020-08-12)

### Changed

- Changes workflow action to run on "master" changes.

## 1.8.1 (2020-08-12)

### Added

- Changes to launch extension bundling, release creation and asset upload from a github action.

## 1.8.0 (2020-08-10)

### Added

- In `iServiceData` there is a new flag (`isComponent`), so behaviour can change if the extension is working with a component vs. a service. For future use.
- New internal constant (`CAN_CANCEL_OPERATIONS`) to configure if operations that are running can be cancelled. It's value is false.

### Changed

- Improve all progress notifications with progress bars.
- Bundle extension to improve size and loading time.
- Update packages to avoid security flaws.

## 1.7.2 (2020-06-26)

### Fixed and changed

- DeprecateService:
  - Version in finish message has been corrected from `MajorVersion.MajorVersion` to `MajorVersion.MinorVersion`.
- GAMaker:
  - Major version and minor version now appear correctly in release note title.
  - Text has been corrected to avoid unnecessary uppercase letters in release notes.
  - Version in finish message has been corrected from `MajorVersion.MajorVersion` to `MajorVersion.MinorVersion`.
- NewTask:
  - New tasks by default now are created with the preview tag set to true.
- RestorePackages:
  - Version in finish message has been corrected from `MajorVersion.MajorVersion` to `MajorVersion.MinorVersion`.
- SwaggerGenerator:
  - Service version now is correct.
  - Link to Features Team wiki has been updated so the new one is in use.
  - Secret section generation was not working properly due to different names of the section that can be found after secret section, which is use cases.
  - A whitespace now is correctly placed between sentences in the parameter's description.

## 1.7.1 (2020-05-11)

### Changed

- Modify regular expressions so the functionality can be used from `Components` folder too.
- Update finish messages to unify them with complete version number.
- Context menu image now has only default + extension options (without extra items).

## 1.7.0 (2020-05-06)

### Added

- New functionality: create a new service (initialize a service folder).
- Added a new function `ValidateFolderPath` for the folder containing all services.
- New setting:
  - Regular expression to validate service version number.
- New functionality in common:
  - Function to replace all instances of a string. Unlike `string.replace` that only changes the first occurrence.
  - Function to read all files and directories in a given path. It returns an object with two lists, files and directories.

### Changed

- Last changelog entry was marked as "Added" when it must be "Changed", fixed.
- The Regular Expressions that matches directories and tasks now supports `CloudFoundation` as origin path.
- Changed the name of the Regular Expression to validate service folder from `FolderRegExp` to `FolderServiceRegExp`.
- Rename `ValidateFolderPath` to `ValidateServiceFolderPath`, as it's more accurate.

### Fixed

- The Regular Expressions now detect better wrong path structures.

## 1.6.2 (2020-04-27)

### Changed

- Swagger Generator: Integer parameters now have the correct type.

## 1.6.1 (2020-04-17)

### Added

- Markdownlint configuration file to remove CHANGELOG alerts:
  - MD024: duplicate headers.
  - MD013: line length.
- Status information in all services.

### Changed

- Images now working on README file after setting repository on packages.json.
- Change progress bar (not working properly) for custom status bar text.
- Improved features section in README.

### Removed

- Unused common method (Succeeded).

## 1.6.0 (2020-04-05)

### Added

- New operation to restore nuget packages.
- Generic constants for the new operation.

### Changed

- Moves `Success` method to common.

### Fixed

- Removed extra whitespace and changed `-` for `+` when adding the `General Availability Release` text in the `Convert to a GA` action.

## 1.5.0 (2020-03-30)

### Added

- New operation to increase the version of an already existing service. Eg.: from 3.0 to 4.0.
- Configuration setting to exclude files/folder when increasing a version.
- Configuration setting to create the swagger file when increasing a version.
- Generic constants.

### Changed

- Changed the `Error` when deprecating tasks, if a file doesn't exists, to a `Warning`.
- Improved configuration checking.
- Chanded messages in `ValidatePath` and `ValidateTaskPath` so they are more general and not action specific.
- Minor changes and code cleanup to improve README modifications.
- Added the ps1 file when creating a new task.

## 1.4.1 (2020-03-30)

### Fixed

- In `SchemaManager` the type `radio` for tasks is also supported.

## 1.4.0 (2020-03-27)

### Added

- New operation to add a task.
- Progress window when running add task.
- SwaggerGenerator: "Example" attribute from iProperty interface now is mandatory. If this information is not found on the readme its value will be "[ToComplete]".
- SwaggerGenerator: The description of the path section now includes the next information:
  - Prerequisites.
  - Security.
  - Outputs.
  - Secrets.
- New configuration options:
  - Regular expresion to validate `Tasks` folder.
  - Boolean to force overwrite when new task already exists. Defaults to `true`.
  - Boolean to set new task as GA. Defaults to `false`.

### Fixed

- The attribute called "DefaultValue" from iProperty interface has been renamed to "Default" because there were validation problems.

### Changed

- Created internal function `ValidatePath` to make it more reusable.
- Added two new functions `ValidateFolderPath` and `ValidateTaskPath` that, internally, use the old `ValidatePath`.
- SwaggerGenerator: the summary of path section now comes from the description of the task.json file of the operation instead, of the friendly name.
- README to reflect new operation and configurations.

## 1.3.0 (2020-03-19)

### Added

- Ability to deprecate an already existing service:
  - Changes in each Operation by:
    - Modifing the `task.json` file:
      - Adding the `deprecated: true` property. Note: it's added to the bottom of the file.
      - Change `Node.target` property to `Deprecated.js`.
      - Add `[DEPRECATED]` to the `friendlyName`, `description` and `instanceNameFormat` properties.
    - Converting the `icon.png` to grayscale and adding the `forbidden` image on top.
  - Adding an entry in the README file in `Release Notes`.

## 1.2.1 (2020-03-17)

### Fixed

- Folder validation was returning OK even when the validation was not passed.

### Changed

- Reverse the changelog entries. Now are from new to old.
- Added `Installation` section and `Extension Settings` info to README.
- Improved error messages in folder validation.

## 1.2.0 (2020-03-16)

### Added

- Ability to change the regular expression used for folder validation using the extension configuration.
- Information output to own channel CCCFeaturesUTils.

## 1.1.1 (2020-03-16)

### Changed

- Improved the CHANGELOG.
- Improved the README.

## 1.1.0 (2020-03-16)

### Added

- Added `Convert to GA` functionality.
- Functionality, one more time, build upon a TS script from Luis (thanks!!).

## 1.0.1 (2020-03-15)

### Changed

- Improved texts on commands.

## 1.0.0 (2020-03-14)

### Added

- Initial release of the extension.
- It implements the `Generate Swagger` functionality.
- Functionality build upon a TS script from Luis (thanks!!).
