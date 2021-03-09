"use strict";

import { Uri, window, ProgressLocation, Progress, workspace } from "vscode";

import fs = require("fs");
import path = require("path");
import LogManager = require("./modules/LogManager");
import utils = require("./modules/common");
import cts = require("./modules/constants");

export async function CreateService(uri: Uri, extensionPath: string) {

    if (!utils.ValidateFolderPath(uri, false)) {
        // the path is not the Services folder
        LogManager.LogError("Invalid path to create a new service. The new service must be created in the 'Services' folder.");
        return;
    }

    let serviceName = await window.showInputBox({ prompt: "Especify the new service name", placeHolder: "E.g.: DataBricks" });
    if (serviceName === undefined) {
        return;
    }
    else {
        serviceName = serviceName.trim();
    }

    let serviceVersion = await window.showInputBox({
        prompt: "Especify the new service version (defaults to '1.0')", placeHolder: "E.g.: 1.0", value: "1.0",
        validateInput: (text: string): string | undefined => {
            return ValidateVersionNumber(text);
        }
    });
    if (serviceVersion === undefined) {
        return;
    }

    let serviceInfo: iServiceData = utils.CreateServiceInfo(uri, serviceName, serviceVersion);
    const newServicePath = serviceInfo.servicePath;

    if (fs.existsSync(newServicePath)) {
        LogManager.LogError("The specified service already exists (or at least the directory where to create it)")
        return;
    }

    try {
        await window.withProgress({
            location: ProgressLocation.Notification,
            title: "Create Service",
            cancellable: cts.constants.CAN_CANCEL_OPERATIONS
        }, async (progress, token) => {
            token.onCancellationRequested(() => {
                LogManager.LogDebug("User canceled the Create Service long running operation");
            });
            await new Promise(resolve => {
                progress.report({ increment: 0, message: `for ${serviceInfo.serviceName} v${serviceInfo.version.Major}` });
                setTimeout(() => {
                    resolve();
                }, 1000);
            });

            await CreateDirectory(extensionPath + "/resources/[ServiceName]", newServicePath, progress);
            await RenameVersion(newServicePath, serviceInfo.fullPath, progress);
            await RenameFiles(serviceInfo, progress);
            await ReplaceTokensInFiles(serviceInfo, progress);

            progress.report({ increment: 20, message: `Service ${serviceInfo.serviceName} created!` });
            LogManager.LogSucceeded(`New Service '${serviceInfo.serviceName} v${serviceInfo.version.Major}.${serviceInfo.version.Minor}' created.`);
        });
    } catch (error) {
        LogManager.LogError(`Error creating service: ${error}`);
    }
}

async function CreateDirectory(templatePath: string, newTaskPath: string, progressItem: Progress<{ message?: string | undefined; increment?: number | undefined; }>) {

    progressItem.report({ increment: 20, message: `creating service folder` });

    try {
        await utils.CopyFolder(templatePath, newTaskPath, []);
    } catch (error) {
        LogManager.LogError(`Error creating directory for new service: ${error.message}`);
        throw (error);
    }
}

async function RenameVersion(newServicePath: string, fullServicePath: string, progressItem: Progress<{ message?: string | undefined; increment?: number | undefined; }>) {

    progressItem.report({ increment: 20, message: `Setting version folder` });

    try {
        fs.renameSync(path.join(newServicePath, "[version]"), fullServicePath);
    } catch (error) {
        LogManager.LogError(`Error setting version folder: ${error.message}`);
        throw (error);
    }
}

async function RenameFiles(serviceInfo: iServiceData, progressItem: Progress<{ message?: string | undefined; increment?: number | undefined; }>) {

    progressItem.report({ increment: 20, message: `Renaming files with service name` });

    try {
        const serviceName = serviceInfo.serviceName;
        const files: iFiles = utils.GetDirsAndFiles(serviceInfo.fullPath);
        // create new directories if needed
        files.Directories.forEach(dir => {
            let newDir: string = ReplaceTokensInPath(dir, serviceName);
            if (!fs.existsSync(newDir)) {
                fs.mkdirSync(newDir);
            }
        });

        // rename/move files with tokens
        files.Files.forEach(file => {
            let newfile: string = ReplaceTokensInPath(file, serviceName);
            if (file !== newfile) {
                fs.renameSync(file, newfile);
            }
        });

        // clean empty directories
        files.Directories.forEach(dir => {
            if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
                fs.rmdirSync(dir);
            }
        });

    } catch (error) {
        LogManager.LogError(`Error renaming files: ${error.message}`);
        throw (error);
    }
}

async function ReplaceTokensInFiles(serviceInfo: iServiceData, progressItem: Progress<{ message?: string | undefined; increment?: number | undefined; }>) {

    progressItem.report({ increment: 20, message: `Replacing tokens in files` });

    try {
        const files: iFiles = utils.GetDirsAndFiles(serviceInfo.fullPath);
        files.Files.forEach(file => {
            ReplaceTokensInContent(file, serviceInfo);
        });
    } catch (error) {
        LogManager.LogError(`Error replacing tokens in files: ${error.message}`);
        throw (error);
    }
}

async function ReplaceTokensInContent(path: string, serviceInfo: iServiceData) {
    try {
        const operation = "Deploy";
        const testNumber = "1";
        const testName = "Test1"
        const version = `${serviceInfo.version.Major}.${serviceInfo.version.Minor}`;
        const serviceNameSeparated = "";
        const { v4: uuidv4 } = require('uuid');

        // read file content
        let fileContent = fs.readFileSync(path).toString();

        // replace tokens
        fileContent = utils.ReplaceAll(fileContent, "[Operation]", operation);
        fileContent = utils.ReplaceAll(fileContent, "[ServiceName]", serviceInfo.serviceName);
        fileContent = utils.ReplaceAll(fileContent, "[ServiceNameSeparated]", serviceNameSeparated);
        fileContent = utils.ReplaceAll(fileContent, "[TestNumber]", testNumber);
        fileContent = utils.ReplaceAll(fileContent, "[TestName]", testName);
        fileContent = utils.ReplaceAll(fileContent, "[version]", version);
        fileContent = utils.ReplaceAll(fileContent, "[Version]", version);
        fileContent = utils.ReplaceAll(fileContent, "[CertifiedServiceMajorVersion]", serviceInfo.version.Major.toString());
        fileContent = utils.ReplaceAll(fileContent, "[CertifiedServiceMinorVersion]", serviceInfo.version.Minor.toString());
        fileContent = utils.ReplaceAll(fileContent, "[VersionString]", version);
        fileContent = utils.ReplaceAll(fileContent, "[NewGUID]", uuidv4());

        // write file back
        fs.writeFileSync(path, fileContent);

    } catch (error) {
        LogManager.LogError(`Error replacing tokens in file '${path}': ${error.message}`);
        throw (error);
    }
}

//#region Auxiliary functions

function ValidateVersionNumber(text: string): string | undefined {

    let regEspStr = workspace.getConfiguration("ccc", null).get<string>("TaskVersionNumber");
    if (regEspStr === undefined) {
        return `Can't read the version number validation format, please check configuration`;
    }
    else {
        var regexp = new RegExp(regEspStr);
        var test = regexp.test(text);

        if (!test) {
            return `The version number must be in format: Major.Minor`;
        } else {
            return undefined;
        }
    }
}

function ReplaceTokensInPath(path: string, serviceName: string): string {

    const operation = "Deploy";
    const testNumber = "1";
    const testName = "Test1"

    let newFilePath: string = path.replace("[Operation]", operation);
    newFilePath = newFilePath.replace("[ServiceName]", serviceName);
    newFilePath = newFilePath.replace("[TestNumber]", testNumber);
    newFilePath = newFilePath.replace("[TestName]", testName);

    return newFilePath;
}

//#region
