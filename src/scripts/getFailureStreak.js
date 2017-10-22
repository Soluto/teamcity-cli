const argv = require("minimist")(process.argv.slice(2));
const teamcity = require("teamcity-rest-api");

const SUCCESS_STATUS = "SUCCESS";

(function(){
    const mandatoryArguments = [
        'username', 'password', 'serverUrl', 'buildConfigurationId', 'maxCount'
    ]
    
    const missingArguments = mandatoryArguments.filter(arg => !argv.hasOwnProperty(arg));
    if (missingArguments.length > 0){
        throw new Error(`Missing arguments: ${missingArguments.join(', ')}`)
    }
}());

const {
    username, password, serverUrl, buildConfigurationId, maxCount
} = argv;

const client = teamcity.create({ username, password, url: serverUrl });

Array.prototype.takeWhile = function(predicate){
    const res = [];
    for (let idx = 0; idx < this.length; ++idx){
        const element = this[idx];
        if (!predicate(element)){
            break;
        }

        res.push(element);
    }

    return res;
};

(async function () {
    try {
        const build = await client.builds.getByBuildTypeWithCount({
            id: buildConfigurationId
        }, {
            dimensions: {
                count: maxCount
            }
        })

        const failureStreak = build.build
            .map(({ status, number }) => ({
                number: parseInt(number),
                isFailure: status !== SUCCESS_STATUS
            }))
            .sort((a, b) => b.number - a.number)
            .filter(build => build.number < 1432)
            .takeWhile(build => build.isFailure)

        console.log(` - Failure Streak: ${failureStreak.length}`);
    } catch (error) {
        console.error(error);
        process.exitCode = 2;
    }
}())