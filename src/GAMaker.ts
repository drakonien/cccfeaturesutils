"use strict";

let isPreview = false;

import { Uri, window, ProgressLocation } from "vscode";
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

export async function ConvertToGA(uri: Uri) {

    if (utils.ValidateServiceFolderPath(uri) === false) {
        return;
    }

    let serviceInfo: iServiceData = utils.GetServiceInfo(uri);

    try {
        await window.withProgress({
            location: ProgressLocation.Notification,
            title: "Convert to GA",
            cancellable: cts.constants.CAN_CANCEL_OPERATIONS
        }, async (progress, token) => {
            token.onCancellationRequested(() => {
                LogManager.LogDebug("User canceled the Convert to GA long running operation");
            });
            await new Promise(resolve => {
                progress.report({ increment: 0, message: `for ${serviceInfo.serviceName} v${serviceInfo.version.Major}` });
                setTimeout(() => {
                    resolve();
                }, 1000);
            });


            let operations: string[]
            await new Promise(resolve => {
                progress.report({ increment: 25, message: `updating Task files` });

                operations = getDirectories(serviceInfo.tasksPath);
                // foreach operation in ServiceVersion
                operations.forEach(op => {
                    let pathTaskJSON = path.join(serviceInfo.tasksPath, op, cts.constants.TASK_JSON_NAME_STRING);
                    if (!fs.existsSync(pathTaskJSON)) {
                        LogManager.LogError(`Task.json in path ${pathTaskJSON} was not found.`);
                    } else {
                        // update task.json
                        let rawdata = fs.readFileSync(pathTaskJSON);
                        let taskJSON = JSON.parse(rawdata.toString());
                        taskJSON.preview = isPreview;
                        fs.writeFileSync(pathTaskJSON, JSON.stringify(taskJSON, null, 1), cts.constants.FILE_ENCODING_STRING);
                    }
                });
                progress.report({ increment: 25, message: `updating Task files completed` });
                resolve();
            });

            await new Promise(resolve => {
                progress.report({ increment: 25, message: `updating Readme file` });

                // reading readme
                let pathReadme = path.join(serviceInfo.fullPath, cts.constants.README_FILE_NAME_STRING);
                let readme = fs.readFileSync(pathReadme, cts.constants.FILE_ENCODING_STRING);
                // update readme
                let releaseNotes = readmeManager.ExtractFragmentText(readme, "### 1.2. Release Notes", "## 2. Architecture", true);
                let releaseNotesUpdated = releaseNotes.replace(" (current version)", "");
                const date = new Date();
                const dateRelease = date.getFullYear() + "." + ("0" + (date.getMonth() + 1)).slice(-2) + "." + ("0" + date.getDate()).slice(-2);
                let newReleaseLine = `**[${dateRelease}] ${serviceInfo.serviceName} ${serviceInfo.version.Major}.${serviceInfo.version.Minor} GA (current version)** \n\n> + General availability release.`;
                releaseNotesUpdated = releaseNotesUpdated.replace("### 1.2. Release Notes", `### 1.2. Release Notes\n\n${newReleaseLine}`);
                readme = readme.replace(releaseNotes, releaseNotesUpdated);
                // write to file
                fs.writeFileSync(pathReadme, readme, cts.constants.FILE_ENCODING_STRING);
                progress.report({ increment: 25, message: `completed!` });
                LogManager.LogSucceeded(`Updated ${serviceInfo.serviceName} ${serviceInfo.version.Major}.${serviceInfo.version.Minor} for GA`);
                resolve();
            });
        });
    } catch (error) {
        LogManager.LogError(`Error converting to GA: ${error}`);
    }
}
