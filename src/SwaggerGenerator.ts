"use strict";

import { Uri, window, ProgressLocation } from "vscode";
import fs = require("fs");
import path = require("path");
import yaml = require("js-yaml");
import LogManager = require("./modules/LogManager");
import schemaManager = require("./modules/SchemaManager");
import swaggerPathManager = require("./modules/SwaggerPathManager");
import readmeManager = require("./modules/ReadmeManager");
import utils = require("./modules/common");
import cts = require("./modules/constants");

const getDirectories = (source: fs.PathLike) =>
    fs.readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

export async function GenerateSwagger(uri: Uri, extensionPath: string) {

    if (utils.ValidateServiceFolderPath(uri) === false) {
        return;
    }

    let serviceInfo: iServiceData = utils.GetServiceInfo(uri);
    let serviceName: string;
    let version: iVersion;
    let serviceVersionPath: string;
    let tasksPath: string;
    let constructedVersion: string;

    await window.withProgress({
        location: ProgressLocation.Notification,
        title: "Generating Swagger",
        cancellable: cts.constants.CAN_CANCEL_OPERATIONS
    }, async (progress, token) => {
        token.onCancellationRequested(() => {
            LogManager.LogDebug("User canceled the Generating Swagger long running operation");
        });

        await new Promise(resolve => {
            progress.report({ increment: 0, message: `for ${serviceInfo.serviceName} v${serviceInfo.version.Major}` });
            setTimeout(() => {
                resolve();
            }, 1000);
        });

        await new Promise(resolve => {
            progress.report({ increment: 1, message: `configuring process` });
            serviceName = serviceInfo.serviceName;
            version = serviceInfo.version;
            serviceVersionPath = serviceInfo.fullPath;
            tasksPath = serviceInfo.tasksPath;
            constructedVersion = `${version.Major}.${version.Minor}`;

            resolve();
        });

        let swaggerBase: any[];
        await new Promise(resolve => {
            progress.report({ increment: 20, message: `reading and loading template file` });
            let fileContents = fs.readFileSync(`${extensionPath}/resources/swaggerBase.yml`, cts.constants.FILE_ENCODING_STRING);
            fileContents = fileContents
                .replace(/\$ServiceName\$/g, serviceName)
                .replace(/\$Version\$/g, constructedVersion)
                .replace(/\$VersionNumber\$/g, `${version.Major}`);
            swaggerBase = yaml.safeLoadAll(fileContents);

            resolve();
        });

        let readme: string;
        await new Promise(resolve => {
            progress.report({ increment: 20, message: `reading and loading Readme file` });
            readme = fs.readFileSync(path.join(serviceVersionPath, cts.constants.README_FILE_NAME_STRING), cts.constants.FILE_ENCODING_STRING);
            // description
            swaggerBase[0].info.description = readmeManager.GetDescription(readme);
            LogManager.LogReview(`Remember to update externalDocs.url.`);
            swaggerBase[0].info.version = constructedVersion;

            resolve();
        });

        await new Promise(resolve => {
            progress.report({ increment: 20, message: `generating file` });
            let operations = getDirectories(tasksPath);
            // foreach operation in ServiceVersion
            operations.forEach(op => {
                let rawdata = fs.readFileSync(path.join(tasksPath, op, cts.constants.TASK_JSON_NAME_STRING));
                let taskJSON: ITaskJSON = JSON.parse(rawdata.toString());
                let newSchema = schemaManager.CreateSchema(taskJSON);
                let summary = taskJSON.description;
                let description = readmeManager.GetPathDescription(readme, op);
                swaggerBase[0].paths["/" + op + "/start"] = swaggerPathManager.CreateSwaggerServicePath(op, summary, description);
                swaggerBase[0].components.schemas[op] = newSchema;
            });
            resolve();
        });

        await new Promise(resolve => {
            progress.report({ increment: 20, message: `saving Yaml file` });
            // saving yaml
            let yamlStr = yaml.safeDump(swaggerBase[0]);
            let swaggerPath = path.join(serviceVersionPath, "swagger.yml");
            fs.writeFileSync(swaggerPath, yamlStr, cts.constants.FILE_ENCODING_STRING);
            LogManager.LogSucceeded(`Swagger has been successfully generated in: "${swaggerPath}"`);
            resolve();
        });
    });
}
