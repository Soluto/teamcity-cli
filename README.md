# teamcity-cli

## Scripts
npm run [script] -- [arguments]

### setParameter
```npm run setParameter```   
Sets a project parameter

#### Arguments
 - username - username for teamcity authentication
 - password - password for teamcity authentication
 - serverUrl - teamcity's server url
 - projectId - the id of the project containing the build to trogger
 - paramName - the name of the parameter to set
 - paramValue - the value to set the parameter to

### scheduleBuild
```npm run scheduleBuild```   
Schedule a build execution

#### Arguments
 - username - username for teamcity authentication
 - password - password for teamcity authentication
 - serverUrl - teamcity's server url
 - buildTypeToTrigger - the name of the build to trigger
 - projectId - the id of the project containing the build to trogger
 - delayInHours - time, in hours from now, to schedule the build
 - overrideTriggers - if true, clears all existing triggers (default false)