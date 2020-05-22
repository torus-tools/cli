arjancli
========

Mutli CLI for arjan tools

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/arjancli.svg)](https://npmjs.org/package/arjancli)
[![Downloads/week](https://img.shields.io/npm/dw/arjancli.svg)](https://npmjs.org/package/arjancli)
[![License](https://img.shields.io/npm/l/arjancli.svg)](https://github.com/arjan-tools/cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g arjancli
$ arjan COMMAND
running command...
$ arjan (-v|--version|version)
arjancli/0.0.0 linux-x64 node-v12.13.1
$ arjan --help [COMMAND]
USAGE
  $ arjan COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`arjan build [REGION] [PROFILE]`](#arjan-build-region-profile)
* [`arjan deploy SITE ACTION [SETUP]`](#arjan-deploy-site-action-setup)
* [`arjan hello`](#arjan-hello)
* [`arjan help [COMMAND]`](#arjan-help-command)
* [`arjan optimize`](#arjan-optimize)
* [`arjan translate FILENAME FROM [TO]`](#arjan-translate-filename-from-to)

## `arjan build [REGION] [PROFILE]`

Describe the command here

```
USAGE
  $ arjan build [REGION] [PROFILE]

ARGUMENTS
  REGION   [default: us-east-1] AWS Region
  PROFILE  [default: default] AWS Profile

OPTIONS
  -a, --audit     builds required files/dirs for arjan audit
  -d, --deploy    builds required files/dirs for arjan deploy
  -l, --localize  builds required files/dirs for arjan localize
  -o, --optimize  builds required files/dirs for arjan optimize

DESCRIPTION
  ...
  Extra documentation goes here
```

_See code: [src/commands/build.js](https://github.com/arjan-tools/cli/blob/v0.0.0/src/commands/build.js)_

## `arjan deploy SITE ACTION [SETUP]`

Describe the command here

```
USAGE
  $ arjan deploy SITE ACTION [SETUP]

ARGUMENTS
  SITE    name of the site i.e. yoursite.com

  ACTION  (create|update|import|delete|upload) choose an action to perform. you can create, update, import your stack or
          upload files to your bucket.

  SETUP   (dev|test|prod|custom) [default: dev] setup for the site - dev, test, production or custom

OPTIONS
  -c, --cdn            creates a CloudFront distribution for your site.
  -e, --error=error    [default: error.html] name of the error document
  -f, --upload=upload  name of a specific file you want to upload to your site. all uploads all of the files

  -h, --https          creates and validates a TLS certificate for your site. If you arent using a route53 DNS you must
                       create a CNAME record manually in your DNS.

  -i, --index=index    [default: index.html] name of the index document. default is index.html

  -r, --route53        creates a Hosted Zone in route 53. Have your current DNS provider page open and ready to add a
                       custom DNS.

  -w, --www            creates a www s3 bucket that reroutes requests to the index.

DESCRIPTION
  ...
  Extra documentation goes here
```

_See code: [src/commands/deploy.js](https://github.com/arjan-tools/cli/blob/v0.0.0/src/commands/deploy.js)_

## `arjan hello`

Describe the command here

```
USAGE
  $ arjan hello

OPTIONS
  -n, --name=name  name to print

DESCRIPTION
  ...
  Extra documentation goes here
```

_See code: [src/commands/hello.js](https://github.com/arjan-tools/cli/blob/v0.0.0/src/commands/hello.js)_

## `arjan help [COMMAND]`

display help for arjan

```
USAGE
  $ arjan help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.0.0/src/commands/help.ts)_

## `arjan optimize`

Describe the command here

```
USAGE
  $ arjan optimize

OPTIONS
  -n, --name=name  name to print

DESCRIPTION
  ...
  Extra documentation goes here
```

_See code: [src/commands/optimize.js](https://github.com/arjan-tools/cli/blob/v0.0.0/src/commands/optimize.js)_

## `arjan translate FILENAME FROM [TO]`

Describe the command here

```
USAGE
  $ arjan translate FILENAME FROM [TO]

ARGUMENTS
  FILENAME  [default: all] name of the file you want to translate -only html files accepted. Use all to translate all of
            your html files (default).

  FROM      origin language of the file

  TO        desired translation language

OPTIONS
  -b, --backwards  Update JSON locale accoridng to changes made in the HTML file. Must be used together with the update
                   flag.

  -c, --create     Create locales for your html website. if a destination language isnt provided it wont be translated.

  -e, --export     Creates a CSV file for your JSON locale.

  -i, --import     Update JSON locale from changes made in the CSV file

  -u, --update     Update HTML file accoridng to changes made in the JSON locale.

DESCRIPTION
  ...
  Extra documentation goes here
```

_See code: [src/commands/translate.js](https://github.com/arjan-tools/cli/blob/v0.0.0/src/commands/translate.js)_
<!-- commandsstop -->
