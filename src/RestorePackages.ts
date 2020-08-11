"use strict";

import { Uri, window, ProgressLocation } from "vscode";
import LogManager = require("./modules/LogManager");
import utils = require("./modules/common");
import cts = require("./modules/constants");

export async function RestorePackages(uri: Uri) {

    if (utils.ValidateServiceFolderPath(uri) === false) {
        return;
    }

    try {
        let serviceInfo: iServiceData = utils.GetServiceInfo(uri);

        await window.withProgress({
            location: ProgressLocation.Notification,
            title: "Restoring Packages",
            cancellable: cts.constants.CAN_CANCEL_OPERATIONS
        }, async (progress, token) => {
            token.onCancellationRequested(() => {
                LogManager.LogDebug("User canceled the Restoring Packages long running operation");
            });
            await new Promise(resolve => {
                progress.report({ increment: 0, message: `for ${serviceInfo.serviceName} v${serviceInfo.version.Major}` });
                setTimeout(() => {
                    resolve();
                }, 1000);
            });

            await new Promise(resolve => {
                NugetRestore(serviceInfo);
                progress.report({ increment: 100, message: `Packages restored for ${serviceInfo.serviceName} ${serviceInfo.version.Major}.${serviceInfo.version.Minor}` });
                LogManager.LogSucceeded(`Packages restored for ${serviceInfo.serviceName} ${serviceInfo.version.Major}.${serviceInfo.version.Minor}`);
                resolve();
            });

        });
    } catch (error) {
        LogManager.LogError(`Error restoring packages: ${error}`);
    }
}

async function NugetRestore(serviceInfo: iServiceData) {

    const command = `${cts.constants.NUGET_RESTORE_STRING} ${cts.constants.NUGET_PACKAGES_DIR_STRING} ${cts.constants.PACKAGES_DIRECTORY_STRING}`;

    const { execSync } = require("child_process");
    let stdout = execSync(command, { cwd: serviceInfo.fullPath });

    LogManager.LogDebug(`Nuget Restore output: ${stdout}`);
}
