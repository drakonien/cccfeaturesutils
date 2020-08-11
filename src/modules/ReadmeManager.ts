const LogManager = require("./LogManager");

export { GetDescription, GetPathDescription, ExtractFragmentText };

function GetDescription(readme: string) {
    let table = ExtractFragmentText(readme, "Current certification:", "[![Build Status]", true);
    if (!table) {
        LogManager.LogWarning(`Retrying to find Table for description.`);
        table = ExtractFragmentText(readme, "Current certification:", "## 1.	Introduction", true);
    }
    LogManager.LogDebug(`Table for description: ${table}`);

    let serviceDescription = ExtractFragmentText(readme, "### 1.1. Service Description", "### 1.2. Release Notes");
    if (!serviceDescription) {
        LogManager.LogWarning(`Retrying to find ServiceDescription for description.`);
        serviceDescription = ExtractFragmentText(readme, "### 1.1.	Service Description", "### 1.2. Release Notes");
    }
    LogManager.LogDebug(`ServiceDescription for description: ${serviceDescription}`);

    return `${table} # Service description ${serviceDescription}`;
}

function GetPrerequisites(readme: string, operation: string) {
    // mapping operation to section in readme
    let beginKey = "";
    let endKey = "";
    let prerequisites = "";
    switch (operation) {
        case "Deploy":
            beginKey = "### 3.1. Prerequisites";
            endKey = "### 3.2. Deployment parameters";
            break;
        case "Remove":
            beginKey = "### 4.1. Prerequisites";
            endKey = "### 4.2. Decommissioning parameters";
            break;
        default:
            break;
    }
    if (beginKey) {
        prerequisites = ExtractFragmentText(readme, beginKey, endKey);
    }
    if (!prerequisites) {
        prerequisites = "[ToComplete]\n";
        LogManager.LogReview(`Prerequisites for operation "${operation}" were not found.`);
    }
    prerequisites = "## Prerequisites\n" + prerequisites;
    return prerequisites;
}

function GetSecurity(operation: string) {
    let customPart;
    switch (operation) {
        case "Deploy":
            customPart = "deployment of the service";
            break;
        case "Remove":
            customPart = "decommissioning of the service";
            break;
        case "KeyRotation":
        case "RotateKeys":
            customPart = "key rotation";
            break;
        default:
            customPart = "operation";
            break;
    }
    let securityPart = "## Security \nThe following validations will be checked in order to authorize the " +
        customPart + ":\n+ Access token identity must correspond to an AAD Service Principal. \
        User accounts are not accepted.\n+ The Service Principal must be `Repsol Resource Group Owner` \
        of the resource group where the service is going to be deployed (request body parameter `resourceGroup`).\n";
    return securityPart;
}

function GetOutputs(readme: string, operation: string) {
    // mapping operation to section in readme
    let outputPart = "";
    if (operation === "Deploy"){
        let beginKey = "#### 3.3.1. Outputs";
        let endKey = "#### 3.3.2. Secrets";
        outputPart = ExtractFragmentText(readme, beginKey, endKey);
        if (!outputPart) {
            LogManager.LogReview(`Outputs for operation "${operation}" were not found.`);
            outputPart = "[ToComplete] [If there were no outputs this sentence would be correct:] This service will create no outputs.\n";
        }
        outputPart = "## Outputs\n" + outputPart;
    }
    return outputPart;
}

function GetSecrets(readme: string, operation: string) {
    // mapping operation to section in readme
    let secretPart = "";
    if (operation === "Deploy"){
        let beginKey = "#### 3.3.2. Secrets";
        let endKey = "### 3.4";
        secretPart = ExtractFragmentText(readme, beginKey, endKey);
        if (!secretPart) {
            LogManager.LogReview(`Secrets for operation "${operation}" were not found.`);
            secretPart = "[ToComplete] [If there were no outputs this sentence would be correct:] This service will create no secrets.\n";
        }
        secretPart = "## Secrets\n" + secretPart;
    }
    return secretPart;
}

function GetPathDescription(readme: string, operation: string) {
    let prerequisites = GetPrerequisites(readme, operation);
    let security = GetSecurity(operation);
    let outputs = GetOutputs(readme, operation);
    let secrets = GetSecrets(readme, operation);
    let pathDescription = prerequisites + security + outputs + secrets;
    return pathDescription;
}

// private functions
function ExtractFragmentText(readme: string, beginKey: string, endKey: string, includeBeginKey: boolean = false) {
    try {
        const lowerCaseReadme = readme.toLowerCase();
        beginKey = beginKey.toLowerCase();
        endKey = endKey.toLowerCase();
        LogManager.LogDebug(`Extracting text from: "${beginKey}" until: "${endKey}"`);
        let existBothKeys = true;
        const beginKeyPosition = lowerCaseReadme.indexOf(beginKey);
        const endKeyPosition = lowerCaseReadme.indexOf(endKey);
        if (beginKeyPosition === -1) {
            LogManager.LogWarning(`ExtractFragmentText "${beginKey}" was not found in readme file.`);
            existBothKeys = false;
        }
        if (endKeyPosition === -1) {
            LogManager.LogWarning(`ExtractFragmentText "${endKey}" was not found in readme file.`);
            existBothKeys = false;
        }
        if (!existBothKeys) {
            return "";
        }
        let length = endKeyPosition - beginKeyPosition;
        let displacement = includeBeginKey ? 0 : beginKey.length;
        return readme.substr(beginKeyPosition + displacement, length - displacement);
    } catch (error) {
        LogManager.LogWarning(`${error}`);
        return "";
    }
}