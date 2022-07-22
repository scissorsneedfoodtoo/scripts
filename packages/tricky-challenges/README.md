# Tricky Challenge Tool

This tool checks the forum for posts that follow the title format generated by our `Ask For Help` button.

## Querying Challenges

Clone this repository. Run `npm ci` to install the dependencies.

`cd` into `packages/tricky-challenges`, and run `npm run build` to compile the TypeScript.

Then run `npm start` to query the last 100 forum posts.

## Parameters

Run `npm start -- posts=1000` to query the last 1000 forum posts. (The default is 100).

Run `npm start -- block="Learn HTML by Building a Cat Photo App"` to query posts related to the cat photo project.

These can be combined if desired.