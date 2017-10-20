# Book Lists Service

This is a simple CRU[D] service for BookLists backed by S3, deployed as a lambda behind api gateway.

## Purpose

This app provides get/fetch capability for Book Lists

## Requirements

You must have a `nypl-sandbox` or `nypl-digital-dev` profile to run anything against real data.

Running the app behind a local API Gateway requires `sam` to be installed globally (or locally if you can get that to work).

## Dependencies

See package.json

## Installation

`npm i`

## Usage

This app uses `node-lambda` to deploy, `sam` for local ad hoc testing. (It has to be installed globally, currently, so is not a part of `package.json`.)

### Run locally

`SAM` has proven really nice for running a server locally because it runs the app in a docker instance and requires zero extra `listen` code.

To run against QA data:
`npm run run-qa`

To run against Production data:
`npm run run-production`

If that's way too convenient, you can invoke lambda locally against an artisinal API gateway event like this:

`sam local invoke "ListsService" --event sample-get-event.json --profile nypl-sandbox`

The above was generated from `sam local generate-event api --method GET > sample-get-event.json` (and then further edited).

### Testing

`npm test`

### Deploy

QA:
`npm run deploy-qa`

Prod:
`npm run deploy-production`
