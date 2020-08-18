"use strict";

import { Uri, window, ProgressLocation, workspace, Progress } from "vscode";
import fs = require("fs");
import LogManager = require("./modules/LogManager");
import utils = require("./modules/common");
import cts = require("./modules/constants");

export async function GetUseCaseTable(uri: Uri) {

    try {
        let serviceInfo: iServiceData = utils.GetServiceInfoFromTask(uri);

        await window.withProgress({
            location: ProgressLocation.Notification,
            title: "Get Use Case Table",
            cancellable: cts.constants.CAN_CANCEL_OPERATIONS
        }, async (progress, token) => {
            token.onCancellationRequested(() => {
                LogManager.LogDebug("User canceled the Get Use Case Table long running operation");
            });
            await new Promise(resolve => {
                progress.report({ increment: 0, message: `for ${serviceInfo.serviceName} v${serviceInfo.version.Major}` });
                setTimeout(() => {
                    resolve();
                }, 1000);
            });

            await new Promise(resolve => {
                GetTable(uri, progress);
                progress.report({ increment: 40, message: `Table calculated for ${serviceInfo.serviceName} ${serviceInfo.version.Major}.${serviceInfo.version.Minor}` });
                LogManager.LogSucceeded(`Table calculated for ${serviceInfo.serviceName} ${serviceInfo.version.Major}.${serviceInfo.version.Minor}`);
                resolve();
            });
        });
    } catch (error) {
        LogManager.LogError(`Error getting table: ${error}`);
    }
}

async function GetTable(uri: Uri, progressItem: Progress<{ message?: string | undefined; increment?: number | undefined; }>) {

    progressItem.report({ increment: 20, message: `reading task.json file` });
    var data = fs.readFileSync(uri.fsPath, cts.constants.FILE_ENCODING_STRING);
    const info = require("serviceinfoutils");

    progressItem.report({ increment: 20, message: `getting info from task.json` });
    const useCaseTable: string = info.getUseCaseTask(JSON.parse(data))

    progressItem.report({ increment: 20, message: `opening new document with use case table` });
    workspace.openTextDocument({
        language: "markdown",
        content: useCaseTable
    }).then(doc => {
        window.showTextDocument(doc);
    });
}
