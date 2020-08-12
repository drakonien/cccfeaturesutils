"use strict";

import { Uri, window, workspace, ProgressLocation, Progress } from "vscode";
import fs = require("fs");
import path = require("path");
import yaml = require("js-yaml");
import LogManager = require("./modules/LogManager");
import ReadManager = require("./modules/ReadmeManager");
import SwaggerGenerator = require("./SwaggerGenerator");
import utils = require("./modules/common");
import cts = require("./modules/constants");
import { resolve } from "path";

export async function IncreaseVersion(uri: Uri, extensionPath: string) {

    if (!utils.ValidateServiceFolderPath(uri)) {
        return;
    }

    let serviceInfo: iServiceData = utils.GetServiceInfo(uri);
    let newUri = Uri.parse(uri.toString().replace(`${serviceInfo.version.Major}.${serviceInfo.version.Minor}`, `${serviceInfo.version.Major + 1}.0`));
    let serviceInfoIncreased: iServiceData = utils.GetServiceInfo(newUri);

    try {
        await window.withProgress({
            location: ProgressLocation.Notification,
            title: "Increase Version",
            cancellable: cts.constants.CAN_CANCEL_OPERATIONS
        }, async (progress, token) => {
            token.onCancellationRequested(() => {
                LogManager.LogDebug("User canceled the Increase Version long running operation");
            });
            await new Promise(resolve => {
                progress.report({ increment: 0, message: `for ${serviceInfo.serviceName} v${serviceInfo.version.Major}` });
                setTimeout(() => {
                    resolve();
                }, 1000);
            });
            CopyDirectory(serviceInfo.fullPath, serviceInfoIncreased.fullPath, progress);
            ProcessTaskJson(serviceInfoIncreased, progress);
            ProcessYaml(serviceInfo, serviceInfoIncreased, progress);
            ProcessReadme(serviceInfo, serviceInfoIncreased, progress);
            ProcessSwagger(serviceInfoIncreased, extensionPath, progress);
            progress.report({ message: (`New version created!.`) });
            LogManager.LogSucceeded(`New version ${serviceInfoIncreased.version.Major}.${serviceInfoIncreased.version.Minor} of Service ${serviceInfo.serviceName} created.`);
        });
    } catch (error) {
        LogManager.LogError(`Error increasing version: ${error}`);
        console.log(error);
    }
}

async function CopyDirectory(originalPath: string, newPath: string, progressItem: Progress<{ message?: string | undefined; increment?: number | undefined; }>) {

    progressItem.report({ increment: 20, message: `copying original version to new one` });

    try {
        let config = workspace.getConfiguration("ccc", null);
        let exclusions = config.get<string[]>("IncreaseVersionExclusions");
        if (exclusions === undefined) {
            exclusions = [];
        }
        await utils.CopyFolder(originalPath, newPath, exclusions);
    } catch (error) {
        LogManager.LogError(`Error increasing version: ${error.message}`);
        throw (error);
    }
}

async function ProcessTaskJson(serviceInfo: iServiceData, progressItem: Progress<{ message?: string | undefined; increment?: number | undefined; }>) {

    progressItem.report({ increment: 20, message: `processing task.json files` });

    try {
        fs.readdirSync(serviceInfo.tasksPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)
            .forEach(op => {
                let pathTaskJSON = path.join(serviceInfo.tasksPath, op, cts.constants.TASK_JSON_NAME_STRING);
                if (!fs.existsSync(pathTaskJSON)) {
                    LogManager.LogWarning(`Task.json in path ${pathTaskJSON} was not found.`);
                } else {
                    // update task.json
                    let rawdata = fs.readFileSync(pathTaskJSON);
                    let taskJSON = JSON.parse(rawdata.toString());
                    taskJSON.preview = true;
                    taskJSON.version.Major = serviceInfo.version.Major;
                    taskJSON.version.Minor = serviceInfo.version.Minor;
                    fs.writeFileSync(pathTaskJSON, JSON.stringify(taskJSON, null, 1), cts.constants.FILE_ENCODING_STRING);
                }
            });
    } catch (error) {
        LogManager.LogError(`Error processing task.json files: ${error.message}`);
        throw (error);
    }
}

async function ProcessYaml(serviceInfo: iServiceData, serviceInfoInc: iServiceData, progressItem: Progress<{ message?: string | undefined; increment?: number | undefined; }>) {

    progressItem.report({ increment: 20, message: `processing yaml root file` });

    try {
        const originalVersion = `${serviceInfo.serviceName}/${serviceInfo.version.Major}.${serviceInfo.version.Minor}`;
        const newVersion = `${serviceInfoInc.serviceName}/${serviceInfoInc.version.Major}.${serviceInfoInc.version.Minor}`;
        fs.readdirSync(serviceInfoInc.fullPath, { withFileTypes: true })
            .filter(dirent => dirent.isFile())
            .map(dirent => dirent.name)
            .forEach(op => {
                const extension = path.extname(op).toLowerCase();
                // process al yaml files, except the swagger file
                if ((extension === ".yml" || extension === ".yaml") && op !== cts.constants.SWAGGER_FILE_NAME_STRING) {
                    const filePath = path.join(serviceInfoInc.fullPath, op);
                    let rawdata = fs.readFileSync(filePath);
                    let newContent = rawdata.toString().replace(originalVersion, newVersion);
                    newContent = replaceLine(newContent, "CertifiedServiceVersion:", ` ${serviceInfoInc.version.Major}.${serviceInfoInc.version.Minor}`);
                    newContent = replaceLine(newContent, "CertifiedServiceVersionPath:", ` v${serviceInfoInc.version.Major}`);
                    fs.writeFileSync(filePath, newContent, cts.constants.FILE_ENCODING_STRING);
                }
            });
    } catch (error) {
        LogManager.LogError(`Error processing yaml root file: ${error.message}`);
        throw (error);
    }
}

async function ProcessReadme(serviceInfo: iServiceData, serviceInfoInc: iServiceData, progressItem: Progress<{ message?: string | undefined; increment?: number | undefined; }>) {

    progressItem.report({ increment: 20, message: `processing README file` });

    try {
        // read README
        let pathReadme = path.join(serviceInfoInc.fullPath, cts.constants.README_FILE_NAME_STRING);
        let readme = fs.readFileSync(pathReadme, cts.constants.FILE_ENCODING_STRING);

        // update README
        readme = replaceLine(readme, "# ", `${serviceInfoInc.serviceName} ${serviceInfoInc.version.Major}.${serviceInfoInc.version.Minor}`);
        let releaseNotes = ReadManager.ExtractFragmentText(readme, "### 1.2. Release Notes", "## 2. Architecture", true);

        let date = new Date();
        let dateRelease = date.getFullYear() + "." + ("0" + (date.getMonth() + 1)).slice(-2) + "." + ("0" + date.getDate()).slice(-2);
        let newReleaseLine = `**[${dateRelease}] ${serviceInfo.serviceName} ${serviceInfoInc.version.Major} (current version)** \n\n > - Initial Release.\n\n`;
        let releaseNotesUpdated = `### 1.2. Release Notes\n\n${newReleaseLine}`;
        readme = readme.replace(releaseNotes, releaseNotesUpdated);
        // write to file
        fs.writeFileSync(pathReadme, readme, cts.constants.FILE_ENCODING_STRING);
    } catch (error) {
        LogManager.LogError(`Error processing README file: ${error.message}`);
        throw (error);
    }
}

async function ProcessSwagger(serviceInfo: iServiceData, extensionPath: string, progressItem: Progress<{ message?: string | undefined; increment?: number | undefined; }>) {

    progressItem.report({ increment: 20, message: `processing swagger file` });

    try {
        const pathSwagger = path.join(serviceInfo.fullPath, cts.constants.SWAGGER_FILE_NAME_STRING);
        if (!fs.existsSync(pathSwagger)) {
            const config = workspace.getConfiguration("ccc", null);
            const createSwagger = config.get<boolean>("IncreaseVersionSwagger");
            if (createSwagger) {
                // auto generate swagger file
                SwaggerGenerator.GenerateSwagger(Uri.parse(serviceInfo.fullPath), extensionPath);
            }
        } else {
            // update swagger.yml
            let yamlFile = yaml.load(fs.readFileSync(pathSwagger, cts.constants.FILE_ENCODING_STRING));
            yamlFile.info.version = `${serviceInfo.version.Major}.${serviceInfo.version.Minor}`;
            yamlFile.externalDocs.description = `${serviceInfo.serviceName} ${serviceInfo.version.Major}.${serviceInfo.version.Minor} documentation`;
            yamlFile.servers[0].url = `${cts.constants.APIURL_ENG_STRING}${serviceInfo.serviceName}/v${serviceInfo.version.Major}`;
            yamlFile.servers[1].url = `${cts.constants.APIURL_PRO_STRING}${serviceInfo.serviceName}/v${serviceInfo.version.Major}`;
            // write modified file
            fs.writeFileSync(pathSwagger, yaml.dump(yamlFile), cts.constants.FILE_ENCODING_STRING);
        }
    } catch (error) {
        LogManager.LogError(`Error processing swagger file: ${error.message}`);
        throw (error);
    }
}

function replaceLine(data: string, lineDefinitor: string, newContent: string, keepLineDefinitor: boolean = true) {
    try {
        LogManager.LogDebug(`Extracting line that contains : "${lineDefinitor}"`);

        const beginPosition = data.indexOf(lineDefinitor);
        if (data.indexOf(lineDefinitor) === -1) {
            LogManager.LogWarning(`Error replacing line, "${lineDefinitor}" was not found in data.`);
        }
        const endPosition = data.indexOf("\n", beginPosition);
        if (endPosition === -1) {
            LogManager.LogWarning(`Error replacing line end of line was not found.`);
        }
        let initialData = data.substr(0, beginPosition);
        let finalData = data.substr(endPosition, data.length - endPosition);
        if (keepLineDefinitor) {
            return `${initialData}${lineDefinitor}${newContent}${finalData}`;
        } else {
            return `${initialData}${newContent}${finalData}`;
        }
    } catch (error) {
        LogManager.LogWarning(`${error}`);
        throw (`Error in 'replaceLine': ${error.message}`);
    }
}