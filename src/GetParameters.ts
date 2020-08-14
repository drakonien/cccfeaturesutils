"use strict";

import { Uri, window, ProgressLocation, workspace, Progress } from "vscode";
import fs = require("fs");
import LogManager = require("./modules/LogManager");
import utils = require("./modules/common");
import cts = require("./modules/constants");

export async function GetParameters(uri: Uri) {

    try {
        let serviceInfo: iServiceData = utils.GetServiceInfoFromTask(uri);

        await window.withProgress({
            location: ProgressLocation.Notification,
            title: "Get Parameters",
            cancellable: cts.constants.CAN_CANCEL_OPERATIONS
        }, async (progress, token) => {
            token.onCancellationRequested(() => {
                LogManager.LogDebug("User canceled the Get Parameters long running operation");
            });
            await new Promise(resolve => {
                progress.report({ increment: 0, message: `for ${serviceInfo.serviceName} v${serviceInfo.version.Major}` });
                setTimeout(() => {
                    resolve();
                }, 1000);
            });

            await new Promise(resolve => {
                GetHeaders(uri, serviceInfo, progress);
                progress.report({ increment: 40, message: `Parameters calculated for ${serviceInfo.serviceName} ${serviceInfo.version.Major}.${serviceInfo.version.Minor}` });
                LogManager.LogSucceeded(`Parameters calculated for ${serviceInfo.serviceName} ${serviceInfo.version.Major}.${serviceInfo.version.Minor}`);
                resolve();
            });
        });
    } catch (error) {
        LogManager.LogError(`Error restoring packages: ${error}`);
    }
}

async function GetHeaders(uri: Uri, serviceInfo: iServiceData, progressItem: Progress<{ message?: string | undefined; increment?: number | undefined; }>) {

    progressItem.report({ increment: 20, message: `reading task.json file` });
    var data = fs.readFileSync(uri.fsPath, cts.constants.FILE_ENCODING_STRING);
    const info = require("serviceinfoutils");

    const operation = getOperationFromTaskUri(uri);
    progressItem.report({ increment: 20, message: `getting headers from task.json` });
    const header: string = info.getOperationHeader(JSON.parse(data), operation ,serviceInfo.serviceName, true)

    progressItem.report({ increment: 20, message: `opening new document with header info` });
    workspace.openTextDocument({
        language: "powershell",
        content: header
    }).then(doc => {
        window.showTextDocument(doc);
    });
}

function getOperationFromTaskUri(uri: Uri): string {
    const parts = uri.fsPath.split("\\");
    return parts[parts.length - 2];
}