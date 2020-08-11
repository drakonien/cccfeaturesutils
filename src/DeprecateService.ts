"use strict";

import { Uri, window, ProgressLocation, Progress } from "vscode";
import fs = require("fs");
import path = require("path");
import LogManager = require("./modules/LogManager");
import readmeManager = require("./modules/ReadmeManager");
import utils = require("./modules/common");
import cts = require("./modules/constants");

const getDirectories = (source: fs.PathLike) =>
    fs.readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

export async function DeprecateService(uri: Uri, extensionPath: string) {

    if (utils.ValidateServiceFolderPath(uri) === false) {
        return;
    }

    let serviceInfo: iServiceData = utils.GetServiceInfo(uri);

    try {
        await window.withProgress({
            location: ProgressLocation.Notification,
            title: "Deprecate Service",
            cancellable: cts.constants.CAN_CANCEL_OPERATIONS
        }, async (progress, token) => {
            token.onCancellationRequested(() => {
                LogManager.LogDebug("User canceled the Deprecate Service long running operation");
            });
            await new Promise(resolve => {
                progress.report({ increment: 0, message: `for ${serviceInfo.serviceName} v${serviceInfo.version.Major}` });
                setTimeout(() => {
                    resolve();
                }, 1000);
            });

            DeprecateTasks(serviceInfo.tasksPath, extensionPath, progress);
            DeprecateReadme(serviceInfo, progress);
            progress.report({ increment: 10, message: `Service ${serviceInfo.serviceName} deprecated!` });
            LogManager.LogSucceeded(`Service ${serviceInfo.serviceName} ${serviceInfo.version.Major}.${serviceInfo.version.Minor} deprecated`);
        });
    } catch (error) {
        LogManager.LogError(`Error deprecating service: ${error}`);
    }
}

//#region icon

async function DeprecateImage(imageName: string, deprecatedName: string) {
    try {
        var Jimp = require("jimp-compact");
        const image = await Jimp.read(imageName);
        const deprecatedImage = await Jimp.read(deprecatedName);

        image.greyscale().blit(deprecatedImage, 0, 0).write(imageName);
    } catch (error) {
        LogManager.LogError(`Error deprecating image [${imageName}]: ${error}`);
    }
}

//#endregion

//#region Tasks

async function DeprecateTasks(tasksPath: string, extensionPath: string, progressItem: Progress<{ message?: string | undefined; increment?: number | undefined; }>) {
    progressItem.report({ increment: 10, message: `processing Tasks` });

    // foreach operation in ServiceVersion
    let operations = getDirectories(tasksPath);

    let incrementPerStep = 70 / operations.length;

    operations.forEach(op => {
        progressItem.report({ increment: incrementPerStep });

        let pathTaskJSON = path.join(tasksPath, op, cts.constants.TASK_JSON_NAME_STRING);
        if (!fs.existsSync(pathTaskJSON)) {
            LogManager.LogWarning(`Task.json in path ${pathTaskJSON} was not found.`);
        } else {
            DeprecateTask(pathTaskJSON);
        }
        let pathTaskImg = path.join(tasksPath, op, "icon.png");
        if (!fs.existsSync(pathTaskImg)) {
            LogManager.LogWarning(`icon.png in path ${pathTaskImg} was not found.`);
        } else {
            DeprecateImage(pathTaskImg, extensionPath + "/resources/deprecated.png");
        }
    });
}

async function DeprecateTask(pathTaskJSON: string) {
    const deprecatedLiteral: string = "[DEPRECATED] ";
    // update task.json
    let rawdata = fs.readFileSync(pathTaskJSON);
    let taskJSON = JSON.parse(rawdata.toString());
    taskJSON.deprecated = true;
    taskJSON.friendlyName = deprecatedLiteral + taskJSON.friendlyName;
    taskJSON.description = deprecatedLiteral + taskJSON.description;
    taskJSON.instanceNameFormat = deprecatedLiteral + taskJSON.instanceNameFormat;
    taskJSON.execution.Node.target = "Deprecated.js";
    fs.writeFileSync(pathTaskJSON, JSON.stringify(taskJSON, null, 1), cts.constants.FILE_ENCODING_STRING);
}

//#endregion

//#region README

async function DeprecateReadme(serviceInfo: iServiceData, progressItem: Progress<{ message?: string | undefined; increment?: number | undefined; }>) {
    progressItem.report({ increment: 10, message: `processing Readme file` });

    // reading readme
    let pathReadme = path.join(serviceInfo.fullPath, cts.constants.README_FILE_NAME_STRING);
    let readme = fs.readFileSync(pathReadme, cts.constants.FILE_ENCODING_STRING);
    // update readme
    let releaseNotes = readmeManager.ExtractFragmentText(readme, "### 1.2. Release Notes", "## 2. Architecture", true);
    let releaseNotesUpdated = releaseNotes.replace(" (current version)", "");
    let date = new Date();
    let dateRelease = date.getFullYear() + "." + ("0" + (date.getMonth() + 1)).slice(-2) + "." + ("0" + date.getDate()).slice(-2);
    let newReleaseLine = `**[${dateRelease}] ${serviceInfo.serviceName} ${serviceInfo.version.Major} (current version)** \n\n > + This version of the service has been deprecated.`;
    releaseNotesUpdated = releaseNotesUpdated.replace("### 1.2. Release Notes", `### 1.2. Release Notes\n\n${newReleaseLine}`);
    readme = readme.replace(releaseNotes, releaseNotesUpdated);
    // write to file
    fs.writeFileSync(pathReadme, readme, cts.constants.FILE_ENCODING_STRING);
}

//#endregion