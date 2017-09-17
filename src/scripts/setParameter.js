const argv = require("minimist")(process.argv.slice(2));
const teamcity = require("teamcity-rest-api");

const username = argv.username;
const password = argv.password;
const serverUrl = argv.serverUrl;
const projectId = argv.projectId;
const paramName = argv.paramName;
const paramValue = argv.paramValue;

const client = teamcity.create({ username, password, url: serverUrl });

(async function () {
    const result = await client.projects.setParameters({ id: projectId }, [{
        name: paramName, value: paramValue 
    }])
}())