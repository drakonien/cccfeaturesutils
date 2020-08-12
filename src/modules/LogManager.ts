import { window, OutputChannel } from "vscode";

export { LogDebug, LogWarning, LogReview, LogError, LogSucceeded };

let channel: OutputChannel = window.createOutputChannel("CCCFeaturesUtils");

function LogDebug(msg: string) {
    let msgComplete: string = `[DEBUG]### ${msg}`;
    console.log("\x1b[37m", msgComplete, "\x1b[0m");
    channel.appendLine(msgComplete);
}

function LogWarning(msg: string) {
    let msgComplete: string = `[WARNING]### ${msg}`;
    console.log("\x1b[33m", msgComplete, "\x1b[0m");
    channel.appendLine(msgComplete);
    window.showWarningMessage(msg);
}

function LogReview(msg: string) {
    let msgComplete: string = `[REVIEW]### ${msg}`;
    console.log("\x1b[94m", `${msgComplete} Please, review this in the generated swagger.yml `, "\x1b[0m");
    channel.appendLine(msgComplete);
    window.showWarningMessage(msg);
}

function LogError(msg: string) {
    let msgComplete: string = `[ERROR]### ${msg}`;
    console.log("\x1b[31m", msgComplete, "\x1b[0m");
    channel.appendLine(msgComplete);
    window.showErrorMessage(msg);
}

function LogSucceeded(msg: string) {
    let msgComplete: string = `[SUCCEEDED]### ${msg}`;
    console.log("\x1b[32m", msgComplete, "\x1b[0m");
    channel.appendLine(msgComplete);
    window.showInformationMessage(msg);
}
