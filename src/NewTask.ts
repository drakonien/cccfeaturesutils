"use strict";

import { Uri, window, ProgressLocation, Progress, workspace } from "vscode";
import fs = require("fs");
import path = require("path");
import LogManager = require("./modules/LogManager");
import utils = require("./modules/common");
import cts = require("./modules/constants");

export async function NewTask(uri: Uri, extensionPath: string) {

    if (uri.toString().endsWith("Tasks")) {
        if (!utils.ValidateTaskPath(uri)) {
            // the path is not valid.
            return;
        } else {
            // the path is valid, remove 'Tasks'
            uri = Uri.parse(uri.toString().replace("Tasks", ""));
        }
    } else {
        if (!utils.ValidateServiceFolderPath(uri, false)) {
            // the path is not valid, is neither Vesion number folder nor Tasks folder
            LogManager.LogError("Invalid path to add a new Task. The task addition must be done from the 'Tasks' path or the service version path.");
            return;
        }
    }

    const taskName = await window.showInputBox({ prompt: "Especify the new task name", placeHolder: "E.g.: Rotate" });
    if (taskName === undefined) {
        return;
    }
    let serviceInfo: iServiceData = utils.GetServiceInfo(uri);
    const newTaskPath = path.join(serviceInfo.tasksPath, taskName);
    const overwriteCfg = workspace.getConfiguration("ccc", null).get<boolean>("NewTaskOverwrite");
    let copyFlags = 0;
    let overwrite = true;
    if (overwriteCfg !== undefined) {
        overwrite = overwriteCfg;
    }
    if (!overwrite) {
        // fail if file already exists
        copyFlags = fs.constants.COPYFILE_EXCL;
    }

    try {
        await window.withProgress({
            location: ProgressLocation.Notification,
            title: `New Task [${taskName}]`,
            cancellable: cts.constants.CAN_CANCEL_OPERATIONS
        }, async (progress, token) => {
            token.onCancellationRequested(() => {
                LogManager.LogDebug("User canceled the New Task long running operation");
            });
            await new Promise(resolve => {
                progress.report({ increment: 0, message: `for ${serviceInfo.serviceName} v${serviceInfo.version.Major}` });
                setTimeout(() => {
                    resolve();
                }, 1000);
            });

            await CreateDirectory(newTaskPath, overwrite, progress);
            await CopyIconFile(extensionPath, newTaskPath, copyFlags, progress);
            await CopyMakeFile(extensionPath, newTaskPath, copyFlags, progress);
            await CopyPs1File(extensionPath, taskName, serviceInfo, copyFlags, progress);
            await ProcessPs1File(taskName, serviceInfo, overwrite, progress);
            const data = await Promise.resolve(ReadTaskFile(extensionPath, taskName, serviceInfo, progress));
            await WriteTaskFile(newTaskPath, overwrite, data, progress);
            progress.report({ increment: 10, message: `New Task ${taskName} in Service ${serviceInfo.serviceName} ${serviceInfo.version.Major}.${serviceInfo.version.Minor} created.` });
            LogManager.LogSucceeded(`New Task ${taskName} in Service ${serviceInfo.serviceName} ${serviceInfo.version.Major}.${serviceInfo.version.Minor} created. Please check missing tokens in 'task.json' file.`);
        });

    } catch (error) {
        console.log(error);
    }
}

async function CreateDirectory(newTaskPath: string, overwrite: boolean, progressBarItem: Progress<{ message?: string | undefined; increment?: number | undefined; }>) {

    progressBarItem.report({ increment: 10, message: `creating task folder` });

    try {
        fs.mkdirSync(newTaskPath, { recursive: overwrite });
    } catch (error) {
        LogManager.LogError(`Error creating directory for new task: ${error.message}`);
        throw (error);
    }
}

async function CopyIconFile(extensionPath: string, newTaskPath: string, copyFlags: number, progressBarItem: Progress<{ message?: string | undefined; increment?: number | undefined; }>) {

    progressBarItem.report({ increment: 10, message: `copying icon file to new folder` });
    try {
        fs.copyFileSync(extensionPath + "/resources/NewTask/icon.png", `${newTaskPath}/icon.png`, copyFlags);
    } catch (error) {
        LogManager.LogError(`Error copying icon file to new folder: ${error.message}`);
        throw (error);
    }
}

async function CopyMakeFile(extensionPath: string, newTaskPath: string, copyFlags: number, progressBarItem: Progress<{ message?: string | undefined; increment?: number | undefined; }>) {

    progressBarItem.report({ increment: 10, message: `copying make.json file to new folder` });
    try {
        fs.copyFileSync(extensionPath + "/resources/NewTask/make.json", `${newTaskPath}/make.json`, copyFlags);
    } catch (error) {
        LogManager.LogError(`Error copying make.json file to new folder: ${error.message}`);
        throw (error);
    }
}

async function CopyPs1File(extensionPath: string, taskName: string, serviceInfo: iServiceData, copyFlags: number, progressBarItem: Progress<{ message?: string | undefined; increment?: number | undefined; }>) {

    progressBarItem.report({ increment: 10, message: `copying ps1 file to Scripts folder` });
    try {
        fs.copyFileSync(`${extensionPath}/resources/NewTask/TaskTemplate.ps1`,
            `${serviceInfo.fullPath}/Scripts/${taskName}-${serviceInfo.serviceName}.ps1`, copyFlags);
    } catch (error) {
        LogManager.LogError(`Error copying pas1 file to Services folder: ${error.message}`);
        throw (error);
    }
}

async function ProcessPs1File(taskName: string, serviceInfo: iServiceData, overwrite: boolean, progressBarItem: Progress<{ message?: string | undefined; increment?: number | undefined; }>) {

    progressBarItem.report({ increment: 10, message: `reading task.json file` });
    try {
        const ps1File = `${serviceInfo.fullPath}/Scripts/${taskName}-${serviceInfo.serviceName}.ps1`;
        var data = fs.readFileSync(ps1File, cts.constants.FILE_ENCODING_STRING);

        progressBarItem.report({ increment: 10, message: `replacing tokens in ps1 file` });
        data = data
            .replace(/\[ServiceName\]/g, serviceInfo.serviceName)
            .replace(/\[Operation\]/g, taskName);

        let writeFlags = "w"; // write to file
        if (!overwrite) {
            // but fails if the file already exists
            writeFlags += "x";
        }
        fs.writeFileSync(ps1File, data, { flag: writeFlags });

    } catch (error) {
        LogManager.LogError(`Error processing ps1 file: ${error.message}`);
        throw (error);
    }
}

async function ReadTaskFile(extensionPath: string, taskName: string, serviceInfo: iServiceData, progressBarItem: Progress<{ message?: string | undefined; increment?: number | undefined; }>): Promise<string> {

    progressBarItem.report({ increment: 10, message: `reading task.json file` });
    try {
        const path = `${extensionPath}/resources/NewTask/${cts.constants.TASK_JSON_NAME_STRING}`;
        var data = fs.readFileSync(path, cts.constants.FILE_ENCODING_STRING);
        let isPreview = workspace.getConfiguration("ccc", null).get<boolean>("NewTaskPreview");
        if (isPreview === undefined) {
            isPreview = true;
        }

        progressBarItem.report({ increment: 10, message: `replacing tokens in task.json file` });
        data = data
            .replace(/\[ServiceName\]/g, serviceInfo.serviceName)
            .replace(/\[IsPreview\]/g, isPreview.toString())
            .replace(/\[MajorVersion\]/g, `${serviceInfo.version.Major}`)
            .replace(/\[MinorVersion\]/g, `${serviceInfo.version.Minor}`)
            .replace(/\[Operation\]/g, taskName);

        return data;

    } catch (error) {
        LogManager.LogError(`Error reading task.json file: ${error.message}`);
        throw (error);
    }
}

async function WriteTaskFile(newTaskPath: string, overwrite: boolean, data: string, progressBarItem: Progress<{ message?: string | undefined; increment?: number | undefined; }>) {

    progressBarItem.report({ increment: 10, message: `writing task.json file` });
    let writeFlags = "w"; // write to file
    if (!overwrite) {
        // but fails if the file already exists
        writeFlags += "x";
    }
    try {
        const taskFile = path.join(newTaskPath, cts.constants.TASK_JSON_NAME_STRING);
        fs.writeFileSync(taskFile, data, { flag: writeFlags });
    } catch (error) {
        LogManager.LogError(`Error writing task.json file in new folder: ${error.message}`);
        throw (error);
    }
}
