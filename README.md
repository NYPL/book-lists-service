# Book Lists Service

This is a simple CRU[D] service for BookLists backed by S3, deployed as a lambda behind api gateway.

## Purpose

This app provides get/fetch capability for Book Lists

### Routes

This app serves the following routes:

 * `GET /api/v0.1/book-lists/{type}/{date}`: Get BookList by slug (i.e. {type}/{date})
 * `GET /api/v0.1/book-lists`: Get all BookLists (optionally by type)
 * `POST /api/v0.1/book-lists`: Save a new/updated booklist
 * `GET /api/v0.1/book-lists/context.json`: Retrieve JSON-LD context document
 * `GET /docs/book-lists`: Retrieve [Swagger](https://swagger.io/specification/) document describing endpoints & models
 
See [swagger.v0.1.json](swagger.v0.1.json) for detailed route & model documentation.

## Requirements

You must have a `nypl-sandbox` or `nypl-digital-dev` profile to run anything against real data.

Running the app behind a local API Gateway requires `sam` to be installed globally (or locally if you can get that to work).

## Dependencies

See package.json

Also requires a global install of [aws-sam-local](https://www.npmjs.com/package/aws-sam-local) (because local installs on OSX fail currently).

## Installation

`npm i`

## Usage

This app uses `node-lambda` to deploy, `sam` for local ad hoc testing. (It has to be installed globally, currently, so is not a part of `package.json`.)

### Run locally

`SAM` has proven really nice for running a server locally because it runs the app in a docker instance and requires zero extra `listen` code.

Initialize your environment sam template for the relevant environment (development, qa, production):

```
cp sam-template.sample.yml sam-template.[environment].yml`
```

To run against Dev data:
`npm run run-development`

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

We use `node-lambda` for deploy, so make sure you have a .env file with deployable variables in `./config/[environment].env`, e.g.

`cp config/sample.env config/development.env`

Development:
`npm run deploy-development`

QA:
`npm run deploy-qa`

Prod:
`npm run deploy-production`
