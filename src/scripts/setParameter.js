const argv = require("minimist")(process.argv.slice(2));
const teamcity = require("teamcity-rest-api");

(function(){
    const mandatoryArguments = [
        'username', 'password', 'serverUrl', 'projectId', 'paramName', 'paramValue'
    ]
    
    const missingArguments = mandatoryArguments.filter(arg => !argv.hasOwnProperty(arg));
    if (missingArguments.length > 0){
        throw new Error(`Missing arguments: ${missingArguments.join(', ')}`)
    }
}())

const username = argv.username;
const password = argv.password;
const serverUrl = argv.serverUrl;
const projectId = argv.projectId;
const paramName = argv.paramName;
const paramValue = argv.paramValue;

const client = teamcity.create({ username, password, url: serverUrl });

(async function () {
    try {
        const project = await client.projects.get(projectId);
        const parameters = project.parameters.property;

        let foundParam = false;
        for (var param of parameters) {
            if (param.name == paramName) {
                param.value = paramValue;
                foundParam = true;
            }
        }

        if (!foundParam) {
            parameters.push({
                name: paramName,
                value: paramValue
            })
        }

        await client.projects.setParameters({ id: projectId }, parameters)
    } catch (error) {
        console.error(error);
        process.exitCode = 2;
    }
}())