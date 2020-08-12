/// <reference path="../Interfaces.d.ts" />

function GetExampleKey(descriptionInput: string){
    let key1 = "Example:";
    let key2 = "E.g. of valid value:";
    let exampleKey;
    if (descriptionInput.indexOf(key1) > 0){
        exampleKey = key1;
    } else if (descriptionInput.indexOf(key2) > 0) {
        exampleKey = key2;
    }
    return exampleKey;
}

function CreateSchema(taskJSON: ITaskJSON) {
    let propertiesInput: iProperties = {};
    let requiredInputs :string[] = [];
    let excludedInputs = ["ConnectedServiceNameARM", "ParameterSetSelector", "PathToParameters", "overrideParameters", "errorActionPreference", "FailOnStandardError", "FailOnStandardError", "VerboseActivated"];

    taskJSON.inputs.forEach(input => {
        // ignoring excluded inputs
        if (!excludedInputs.includes(input.name)) {
            // required inputs
            if (input.required) {
                requiredInputs.push(input.name);
            }
            let typeInput = input.type;
            let descriptionInput = input.helpMarkDown.replace(/&nbsp;/g, "").replace(/\n\n/g, " ").replace(/\n/g, " ");
            let exampleKey = GetExampleKey(descriptionInput);
            let exampleInput;
            if (exampleKey){
                exampleInput = descriptionInput.substr(descriptionInput.indexOf(exampleKey));
                if (exampleInput) {
                    // remove the example in the description field
                    descriptionInput = descriptionInput.replace(exampleInput, "");
                    // cleaning example
                    exampleInput = exampleInput.replace(exampleKey, "").replace(/`/g, "").replace(/"/g, "");
                    if (IsValidJSONString(exampleInput)) {
                        typeInput = "string";
                        exampleInput = JSON.parse(exampleInput);
                    }
                }
            }

            if (typeInput.toLowerCase() === "picklist" ||
                typeInput.toLowerCase() === "filepath" ||
                typeInput.toLowerCase() === "multiline" ||
                typeInput.toLowerCase() === "radio") {
                typeInput = "string";
            } else if (typeInput.toLowerCase() === "int"){
                typeInput = "integer";
            }

            // if we do not have example we indicate that it needs to be completed manually
            if (!exampleInput) {
                exampleInput = "[ToComplete]";
            }
            // fill the properties
            propertiesInput[input.name] = {
                type: typeInput,
                description: descriptionInput,
                example: exampleInput
            };
            // if we have default values
            if (input.defaultValue != null) {
                propertiesInput[input.name].default = input.defaultValue;
            }
        }
    });

    return {
        type: "object",
        required: requiredInputs,
        properties: propertiesInput
    };
}

export { CreateSchema };

// private functions
function IsValidJSONString(str: string) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
