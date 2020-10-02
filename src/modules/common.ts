"use strict";

import { Uri, workspace, env } from "vscode";
import path = require("path");
import fs = require("fs");
import LogManager = require("./LogManager");

export { ValidateFolderPath, ValidateServiceFolderPath, ValidateTaskPath, GetServiceInfo, GetServiceInfoFromTask, CreateServiceInfo, GetDefaultPath, CopyFolder, GetDirsAndFiles, ReplaceAll };

function ValidateFolderPath(uri: Uri, showErrorMesagae: boolean = true): boolean {

    let regEspStr = workspace.getConfiguration("ccc", null).get<string>("FolderRegExp");
    let errorMessage = "Invalid path for selected action. The action must be launched from the path containing the services matching";

    return ValidatePath(uri, showErrorMesagae, regEspStr, errorMessage);
}

function ValidateServiceFolderPath(uri: Uri, showErrorMesagae: boolean = true): boolean {

    let regEspStr = workspace.getConfiguration("ccc", null).get<string>("FolderServiceRegExp");
    let errorMessage = "Invalid path for selected action. The action must be launched from the service path matching";

    return ValidatePath(uri, showErrorMesagae, regEspStr, errorMessage);
}

function ValidateTaskPath(uri: Uri, showErrorMesagae: boolean = true): boolean {

    let regEspStr = workspace.getConfiguration("ccc", null).get<string>("FolderTaskRegExp");
    let errorMessage = "Invalid Task folder path. The action must be launched from the path matching";

    return ValidatePath(uri, showErrorMesagae, regEspStr, errorMessage);
}

function GetServiceInfoFromTask(uri: Uri): iServiceData {
    let parts: string[] = uri.fsPath.split(path.sep);
    let serviceFullPath = parts.slice(0, parts.length - 3).join(path.sep);

    return GetServiceInfo(Uri.parse(serviceFullPath))
}

function GetServiceInfo(uri: Uri): iServiceData {
    let parts: string[] = uri.fsPath.split(path.sep);

    if (parts[parts.length - 1].trim() === "") {
        parts.pop();
    }

    let serviceFullPath = parts.slice(0, parts.length - 1).join(path.sep);

    let serviceData: iServiceData = {
        serviceName: parts[parts.length - 2],
        version: GetVersionInfo(parts[parts.length - 1]),
        fullPath: uri.fsPath.toString(),
        servicePath: serviceFullPath,
        tasksPath: path.join(uri.fsPath.toString(), "Tasks"),
        isComponent: uri.fsPath.toString().toLowerCase().indexOf("component") > 0
    };

    return serviceData;
}

function CreateServiceInfo(uri: Uri, serviceName: string, serviceVersion: string) {

    const serviceFullPath = path.join(uri.fsPath.toString(), serviceName);
    const servicePath = path.join(serviceFullPath, serviceVersion);
    const serviceTasksPath = path.join(servicePath, "Tasks");

    let serviceData: iServiceData = {
        serviceName: serviceName,
        version: GetVersionInfo(serviceVersion),
        fullPath: servicePath,
        servicePath: serviceFullPath,
        tasksPath: serviceTasksPath,
        isComponent: false
    };
    return serviceData;
}

function GetDefaultPath(): Uri {
    if (workspace.rootPath !== undefined) {
        return Uri.file(workspace.rootPath);
    }
    return Uri.file(env.appRoot);
}

async function CopyFolder(originalPath: string, newPath: string, exclusions?: string[]) {
    const list = fs.readdirSync(originalPath);
    let src, dst;
    list.forEach(function (file: string) {
        if (exclusions !== undefined && exclusions.indexOf(file) !== -1) {
            // the specified file is in exclusions, skipping iteration
            return;
        }
        src = path.join(originalPath, file);
        dst = path.join(newPath, file);
        const stat = fs.statSync(src);
        if (stat && stat.isDirectory()) {
            try {
                console.log("creating dir: " + dst);
                fs.mkdirSync(dst, { recursive: true });
                // recursively copy contents of folder
                CopyFolder(src, dst, exclusions);
            } catch (e) {
                throw (`error creating directory '${dst}' -> ${e.message}`);
            }
        } else {
            try {
                console.log("copying file: " + dst);
                let dirname = path.dirname(dst);
                if (!fs.existsSync(dirname)) {
                    // ensure destination path exists
                    fs.mkdirSync(dirname, { recursive: true });
                }
                fs.copyFileSync(src, dst);
            } catch (e) {
                throw (`error copying file '${dst}' -> ${e.message}`);
            }
        }
    });
}

function GetDirsAndFiles(dirPath: string): iFiles {
    let files = fs.readdirSync(dirPath)

    let arrayOfFiles: iFiles = {
        Directories: [],
        Files: []
    };

    files.forEach(function (file) {
        let auxDir = path.join(dirPath, file);
        if (fs.statSync(auxDir).isDirectory()) {
            if (arrayOfFiles.Directories.indexOf(auxDir) === -1) {
                arrayOfFiles.Directories.push(auxDir);
            }
            let aux = GetDirsAndFiles(auxDir)
            arrayOfFiles.Files = arrayOfFiles.Files.concat(aux.Files);
            arrayOfFiles.Directories = arrayOfFiles.Directories.concat(aux.Directories);
        } else {
            arrayOfFiles.Files.push(auxDir);
        }
    })

    return arrayOfFiles;
}

function ReplaceAll(string: string, find: string, replace: string, caseInsensitive: boolean = false) {
    return string.replace(new RegExp(escapeRegExp(find, caseInsensitive), 'g'), replace);
}

//#region Private functions

const escapeRegExp = (string: string, caseInsensitive: boolean) => {
    if (caseInsensitive) {
        return string.replace(/[.*+?^${}()|[\]\\]/gi, '\\$&')
    }
    else {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }
}

function GetVersionInfo(version: string): iVersion {
    const parts = version.split(".");
    let ver: iVersion = {
        Major: Number.parseFloat(parts[0]),
        Minor: Number.parseFloat(parts[1])
    };
    return ver;
}

function ValidatePath(uri: Uri, showErrorMesagae: boolean = true, regEspStr: string | any, errorMessage: string): boolean {
    let valid: boolean = false;

    if (regEspStr === undefined) {
        LogManager.LogError("Could not read regular expression for validation. Check application settings.");
    } else {
        var regexp = new RegExp(regEspStr);
        var test = regexp.test(uri.fsPath);

        if (!test) {
            if (showErrorMesagae) {
                LogManager.LogError(`${errorMessage} '${regEspStr}'. Selected path: "${uri}"`);
            }
        } else {
            valid = true;
        }
    }
    return valid;
}

//#endregion
