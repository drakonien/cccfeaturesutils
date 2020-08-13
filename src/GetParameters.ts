"use strict";

import { Uri, window, ProgressLocation, workspace } from "vscode";
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
                OpenDocument("", serviceInfo);
                progress.report({ increment: 100, message: `Parameters calculated for ${serviceInfo.serviceName} ${serviceInfo.version.Major}.${serviceInfo.version.Minor}` });
                LogManager.LogSucceeded(`Parameters calculated for ${serviceInfo.serviceName} ${serviceInfo.version.Major}.${serviceInfo.version.Minor}`);
                resolve();
            });

        });
    } catch (error) {
        LogManager.LogError(`Error restoring packages: ${error}`);
    }
}

async function OpenDocument(documentContent:string, serviceInfo: iServiceData) {

    workspace.openTextDocument({
        language: "powershell",
        content: "# hello world"
      }).then(doc => {
        window.showTextDocument(doc);
      });
}
