// the module 'vscode' contains the VS Code extensibility API
// import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { GenerateSwagger } from "./SwaggerGenerator";
import { ConvertToGA } from "./GAMaker";
import { GetDefaultPath } from "./modules/common";
import { DeprecateService } from "./DeprecateService";
import LogManager = require("./modules/LogManager");
import { NewTask } from "./NewTask";
import { IncreaseVersion } from "./IncreaseVersion";
import { RestorePackages } from "./RestorePackages";
import { CreateService } from "./CreateService";
import { GetParameters } from "./GetParameters";
import { GetUseCaseTable } from "./GetUseCaseTable";
import { GetTestParameters } from "./GetTestParameters";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // use the console to output diagnostic information (LogManager.LogDebug) and errors (console.error)
  // this line of code will only be executed once when your extension is activated
  LogManager.LogDebug("Congratulations, your extension 'CCFeaturesUtils' is now active!");

  LogManager.LogDebug("Registering commands...");
  // the command has been defined in the package.json file
  // now provide the implementation of the command with registerCommand
  // the commandId parameter must match the command field in package.json

  //#region GenerateSwagger

  let swaggerMaker = vscode.commands.registerCommand("ccc.GenerateSwagger", () => {
    // call to start the scaffolding process
    // read configuration values
    LogManager.LogDebug("Context [GenerateSwagger] activated");

    let uri: vscode.Uri = GetDefaultPath();

    vscode.window
      .showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "Select folder with version of Service",
        defaultUri: uri
      })
      .then(fileUri => {
        if (fileUri && fileUri[0]) {
          LogManager.LogDebug(`Selected folder is: ${fileUri[0].fsPath}`);

          let path = vscode.Uri.file(fileUri[0].fsPath);
          // start scaffolding process
          GenerateSwagger(path, context.extensionPath);
        }
      });
  });

  let swaggerMakerContext = vscode.commands.registerCommand("ccc.GenerateSwaggerContext", (uri: vscode.Uri) => {
    LogManager.LogDebug("Context [GenerateSwaggerContext] activated for folder: " + uri.fsPath);
    // start scaffolding process
    GenerateSwagger(uri, context.extensionPath);
  });

  //#endregion

  //#region ConvertToGA

  let convertToGA = vscode.commands.registerCommand("ccc.ConvertToGA", () => {
    // call to start the scaffolding process
    // read configuration values
    LogManager.LogDebug("Context [ConvertToGA] activated");

    let uri: vscode.Uri = GetDefaultPath();

    vscode.window
      .showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "Select folder with version of Service",
        defaultUri: uri
      })
      .then(fileUri => {
        if (fileUri && fileUri[0]) {
          LogManager.LogDebug(`Selected folder is: ${fileUri[0].fsPath}`);

          let path = vscode.Uri.file(fileUri[0].fsPath);
          // start process
          ConvertToGA(path);
        }
      });
  });

  let convertToGAContext = vscode.commands.registerCommand("ccc.ConvertToGAContext", (uri: vscode.Uri) => {
    LogManager.LogDebug("Context [ConvertToGAContext] activated for folder: " + uri.fsPath);
    // start process
    ConvertToGA(uri);
  });

  //#endregion

  //#region DeprecateService

  let deprecateService = vscode.commands.registerCommand("ccc.DeprecateService", () => {
    // call to start the scaffolding process
    // read configuration values
    LogManager.LogDebug("Context [DeprecateService] activated");

    let uri: vscode.Uri = GetDefaultPath();

    vscode.window
      .showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "Select folder with version of Service",
        defaultUri: uri
      })
      .then(fileUri => {
        if (fileUri && fileUri[0]) {
          LogManager.LogDebug(`Selected folder is: ${fileUri[0].fsPath}`);

          let path = vscode.Uri.file(fileUri[0].fsPath);
          // start process
          DeprecateService(path, context.extensionPath);
        }
      });
  });

  let deprecateServiceContext = vscode.commands.registerCommand("ccc.DeprecateServiceContext", (uri: vscode.Uri) => {
    LogManager.LogDebug("Context [DeprecateServiceContext] activated for folder: " + uri.fsPath);
    // start process
    DeprecateService(uri, context.extensionPath);
  });

  //#endregion

  //#region New Task

  let newTask = vscode.commands.registerCommand("ccc.AddNewTask", () => {
    // call to start the scaffolding process
    // read configuration values
    LogManager.LogDebug("Context [AddNewTask] activated");

    let uri: vscode.Uri = GetDefaultPath();

    vscode.window
      .showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "Select task folder within version of Service",
        defaultUri: uri
      })
      .then(fileUri => {
        if (fileUri && fileUri[0]) {
          LogManager.LogDebug(`Selected folder is: ${fileUri[0].fsPath}`);

          let path = vscode.Uri.file(fileUri[0].fsPath);
          // start process
          NewTask(path, context.extensionPath);
        }
      });
  });

  let newTaskContext = vscode.commands.registerCommand("ccc.AddNewTaskContext", (uri: vscode.Uri) => {
    LogManager.LogDebug("Context [AddNewTaskContext] activated for folder: " + uri.fsPath);
    // start process
    NewTask(uri, context.extensionPath);
  });

  //#endregion

  //#region Increase Version

  let increaseVersion = vscode.commands.registerCommand("ccc.IncreaseVersion", () => {
    // call to start the scaffolding process
    // read configuration values
    LogManager.LogDebug("Context [IncreaseVersion] activated");

    let uri: vscode.Uri = GetDefaultPath();

    vscode.window
      .showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "Select folder version of Service",
        defaultUri: uri
      })
      .then(fileUri => {
        if (fileUri && fileUri[0]) {
          LogManager.LogDebug(`Selected folder is: ${fileUri[0].fsPath}`);

          let path = vscode.Uri.file(fileUri[0].fsPath);
          // start process
          IncreaseVersion(path, context.extensionPath);
        }
      });
  });

  let increaseVersionContext = vscode.commands.registerCommand("ccc.IncreaseVersionContext", (uri: vscode.Uri) => {
    LogManager.LogDebug("Context [IncreaseVersionContext] activated for folder: " + uri.fsPath);
    // start process
    IncreaseVersion(uri, context.extensionPath);
  });

  //#endregion

  //#region Restore Packages

  let restorePackages = vscode.commands.registerCommand("ccc.RestorePackages", () => {
    // call to start the restoring packages process
    // read configuration values
    LogManager.LogDebug("Context [RestorePackages] activated");

    let uri: vscode.Uri = GetDefaultPath();

    vscode.window
      .showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "Select folder version of Service",
        defaultUri: uri
      })
      .then(fileUri => {
        if (fileUri && fileUri[0]) {
          LogManager.LogDebug(`Selected folder is: ${fileUri[0].fsPath}`);

          let path = vscode.Uri.file(fileUri[0].fsPath);
          // start process
          RestorePackages(path);
        }
      });
  });

  let restorePackagesContext = vscode.commands.registerCommand("ccc.RestorePackagesContext", (uri: vscode.Uri) => {
    LogManager.LogDebug("Context [RestorePackagesContext] activated for folder: " + uri.fsPath);
    // start process
    RestorePackages(uri);
  });

  //#endregion

  //#region Create Service

  let newService = vscode.commands.registerCommand("ccc.CreateService", () => {
    // call to start the scaffolding process
    // read configuration values
    LogManager.LogDebug("Context [CreateService] activated");

    let uri: vscode.Uri = GetDefaultPath();

    vscode.window
      .showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "Select 'Services' folder",
        defaultUri: uri
      })
      .then(fileUri => {
        if (fileUri && fileUri[0]) {
          LogManager.LogDebug(`Selected folder is: ${fileUri[0].fsPath}`);

          let path = vscode.Uri.file(fileUri[0].fsPath);
          // start process
          CreateService(path, context.extensionPath);
        }
      });
  });

  let newServiceContext = vscode.commands.registerCommand("ccc.CreateServiceContext", (uri: vscode.Uri) => {
    LogManager.LogDebug("Context [CreateServiceContext] activated for folder: " + uri.fsPath);
    // start process
    CreateService(uri, context.extensionPath);
  });

  //#endregion

  //#region Get Parameters

  let getParameters = vscode.commands.registerCommand("ccc.GetParameters", () => {
    // call to start the restoring packages process
    // read configuration values
    LogManager.LogDebug("Context [GetParameters] activated");

    let uri: vscode.Uri = GetDefaultPath();

    vscode.window
      .showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: "Select Task.json file",
        defaultUri: uri,
        filters: {
          'Task.json': ['json']
        }
      })
      .then(fileUri => {
        if (fileUri && fileUri[0]) {
          LogManager.LogDebug(`Selected file is: ${fileUri[0].fsPath}`);
          // test for a task.json file
          if (fileUri[0].fsPath.toLowerCase().endsWith('task.json')) {
            let path = vscode.Uri.file(fileUri[0].fsPath);
            // start process
            GetParameters(path);
          }
          else {
            LogManager.LogError("Only 'Task.json' files must be selected.")
          }
        }
      });
  });

  let getParametersContext = vscode.commands.registerCommand("ccc.GetParametersContext", (uri: vscode.Uri) => {
    LogManager.LogDebug("Context [GetParametersContext] activated for folder: " + uri.fsPath);
    // start process
    GetParameters(uri);
  });

  //#endregion

  //#region Get Use Case Table

  let getUseCaseTable = vscode.commands.registerCommand("ccc.GetUseCaseTable", () => {
    // call to start the restoring packages process
    // read configuration values
    LogManager.LogDebug("Context [GetUseCaseTable] activated");

    let uri: vscode.Uri = GetDefaultPath();

    vscode.window
      .showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: "Select Task.json file",
        defaultUri: uri,
        filters: {
          'Task.json': ['json']
        }
      })
      .then(fileUri => {
        if (fileUri && fileUri[0]) {
          LogManager.LogDebug(`Selected file is: ${fileUri[0].fsPath}`);
          // test for a task.json file
          if (fileUri[0].fsPath.toLowerCase().endsWith('task.json')) {
            let path = vscode.Uri.file(fileUri[0].fsPath);
            // start process
            GetUseCaseTable(path);
          }
          else {
            LogManager.LogError("Only 'Task.json' files must be selected.")
          }
        }
      });
  });

  let getUseCaseTableContext = vscode.commands.registerCommand("ccc.GetUseCaseTableContext", (uri: vscode.Uri) => {
    LogManager.LogDebug("Context [GetUseCaseTableContext] activated for folder: " + uri.fsPath);
    // start process
    GetUseCaseTable(uri);
  });

  //#endregion

  //#region Get Test Parameters

  let getTestParameters = vscode.commands.registerCommand("ccc.GetTestParameters", () => {
    // call to start the restoring packages process
    // read configuration values
    LogManager.LogDebug("Context [GetTestParameters] activated");

    let uri: vscode.Uri = GetDefaultPath();

    vscode.window
      .showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: "Select Task.json file",
        defaultUri: uri,
        filters: {
          'Task.json': ['json']
        }
      })
      .then(fileUri => {
        if (fileUri && fileUri[0]) {
          LogManager.LogDebug(`Selected file is: ${fileUri[0].fsPath}`);
          // test for a task.json file
          if (fileUri[0].fsPath.toLowerCase().endsWith('task.json')) {
            let path = vscode.Uri.file(fileUri[0].fsPath);
            // start process
            GetTestParameters(path);
          }
          else {
            LogManager.LogError("Only 'Task.json' files must be selected.")
          }
        }
      });
  });

  let getTestParametersContext = vscode.commands.registerCommand("ccc.GetTestParametersContext", (uri: vscode.Uri) => {
    LogManager.LogDebug("Context [GetTestParametersContext] activated for folder: " + uri.fsPath);
    // start process
    GetTestParameters(uri);
  });

  //#endregion

  //#region Register subscriptions

  context.subscriptions.push(swaggerMaker);
  context.subscriptions.push(swaggerMakerContext);
  context.subscriptions.push(convertToGA);
  context.subscriptions.push(convertToGAContext);
  context.subscriptions.push(deprecateService);
  context.subscriptions.push(deprecateServiceContext);
  context.subscriptions.push(newTask);
  context.subscriptions.push(newTaskContext);
  context.subscriptions.push(increaseVersion);
  context.subscriptions.push(increaseVersionContext);
  context.subscriptions.push(restorePackages);
  context.subscriptions.push(restorePackagesContext);
  context.subscriptions.push(newService);
  context.subscriptions.push(newServiceContext);
  context.subscriptions.push(getParameters);
  context.subscriptions.push(getParametersContext);
  context.subscriptions.push(getUseCaseTable);
  context.subscriptions.push(getUseCaseTableContext);
  context.subscriptions.push(getTestParameters);
  context.subscriptions.push(getTestParametersContext);

  //#endregion

  LogManager.LogDebug("Commands registered!");

  //#region Service configuration
  checkConfiguration();
  //#endregion
}

function checkConfiguration() {
  LogManager.LogDebug("Cheking configuration...");

  let config = vscode.workspace.getConfiguration("ccc", null);

  //#region FolderRegExp
  checkConfig(config, "FolderRegExp", "regular expression used to validate service container folder");
  //#endregion

  //#region FolderServiceRegExp
  checkConfig(config, "FolderServiceRegExp", "regular expression used to validate service folders");
  //#endregion

  //#region FolderTaskRegExp
  checkConfig(config, "FolderTaskRegExp", "regular expression used to validate task folders");
  //#endregion

  //#region NewTaskPreview
  checkConfig(config, "NewTaskPreview", "set as preview in new tasks");
  //#endregion

  //#region NewTaskOverwrite
  checkConfig(config, "NewTaskOverwrite", "behaviour for overwriting in new task creation");
  //#endregion

  LogManager.LogDebug("Configuration checked!");
}

function checkConfig(config: vscode.WorkspaceConfiguration, value: string, msg: string) {
  let auxConfig = config.get<string>(value);

  if (auxConfig === undefined) {
    LogManager.LogWarning(`Please review the extension configuration! The '${msg}' is not configured.`);
  } else {
    if (auxConfig === null) {
      LogManager.LogWarning(`Please review the extension configuration! The '${msg}' is empty.`);
    }
  }
}

// this method is called when your extension is deactivated
// tslint:disable-next-line:no-empty
export function deactivate() { }
