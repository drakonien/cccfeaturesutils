interface ITaskJSON {
    description: string;
    friendlyName: string;
    inputs: [{
        name: string;
        required: boolean;
        type: string;
        helpMarkDown: string;
        defaultValue: string;
    }];
}

interface iProperties {
    [key: string]: iProperty;
 }

interface iProperty {
    type: string;
    description: string;
    example: string;
    default?: string;
}

interface iVersion {
    Major: number,
    Minor: number
}

interface iFiles {
    Directories: string[],
    Files: string[]
}

interface iServiceData {
    fullPath: string,
    servicePath: string,
    tasksPath: string,
    version: iVersion,
    serviceName: string,
    isComponent: boolean
}
