const argv = require("minimist")(process.argv.slice(2));
const teamcity = require("teamcity-rest-api");
const moment = require("moment");

const username = argv.username;
const password = argv.password;
const serverUrl = argv.serverUrl;
const buildTypeToTrigger = argv.buildTypeToTrigger;
const projectId = argv.projectId;
const delayInHours = argv.delayInHours;
const overrideTriggers = (argv.overrideTriggers == "true") || false;

const client = teamcity.create({ username, password, url: serverUrl });

(async function () {
    const project = await client.projects.get(projectId);
    const buildType = findBuildTypeInProject({ project, buildTypeName: buildTypeToTrigger });

    const buildConfiguration = await client.buildConfigurations.get(buildType.id);
    const buildTriggers = buildConfiguration.triggers;

    const delayedMoment = getDelayedMoment(delayInHours);

    const newTrigger = createSchedulingTrigger(delayedMoment);
    const newBuildTriggers = createConfigurationBuildTriggers(buildTriggers, newTrigger, overrideTriggers);

    return client.buildConfigurations.setTriggers({ id: buildType.id }, newBuildTriggers)
}())

const getDelayedMoment = hoursToDelay => moment().add(hoursToDelay, 'hours');

const createConfigurationBuildTriggers = (currentBuildTriggers, newTrigger, isOverride) => {
    if (isOverride) {
        return {
            count: 1,
            trigger: [newTrigger]
        }
    } else {
        const newBuildTriggers = Object.assign({}, currentBuildTriggers);
        newBuildTriggers.count += 1;

        // in case there are no existing triggers, the .trigger prop is undefined
        newBuildTriggers.trigger = newBuildTriggers.trigger || [];
        
        newBuildTriggers.trigger.push(newTrigger);
        return newBuildTriggers;
    }
}

const createSchedulingTrigger = scheduleMoment => {

    // Flag as utc, so when we format we get utc components, and set the cron timezone to utc also
    const scheduleMomentUtc = scheduleMoment.utc();
    console.log("Schedule time: ", scheduleMomentUtc.format());
    const timeComponents = extractTimeComponents(scheduleMomentUtc);

    return {
        type: "schedulingTrigger",
        properties: {
            property: [
                { name: "cronExpression_dm", value: timeComponents.dayOfMonth },
                { name: "cronExpression_dw", value: "?" },
                { name: "cronExpression_hour", value: timeComponents.hour },
                { name: "cronExpression_min", value: timeComponents.minute },
                { name: "cronExpression_month", value: timeComponents.month },
                { name: "cronExpression_sec", value: timeComponents.second },
                { name: "cronExpression_year", value: timeComponents.year },
                { name: "promoteWatchedBuild", value: "true" },
                { name: "schedulingPolicy", value: "cron" },
                { name: "timezone", value: "UTC" },
            ]
        }
    }
}

const extractTimeComponents = momentTime => ({
    dayOfMonth: momentTime.format("D"),
    dayOfWeek: momentTime.format("e"),
    hour: momentTime.format("H"),
    minute: momentTime.format("m"),
    second: momentTime.format("s"),
    year: momentTime.format("Y"),
    month: momentTime.format("M")
})

const findBuildTypeInProject = ({ project, buildTypeName }) => {
    const buildTypes = project.buildTypes.buildType.filter(buildType => buildType.name == buildTypeName);
    if (buildTypes.length > 1) {
        throw new Error(`Found to many build types with the name: ${buildTypeName}`)
    }

    if (buildTypes.length == 0) {
        throw new Error(`Found no build types with the name: ${buildTypeName}`)
    }

    return buildTypes[0];
}