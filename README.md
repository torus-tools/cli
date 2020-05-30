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
$ npm install -g arjan-cli
$ arjan COMMAND
running command...
$ arjan (-v|--version|version)
arjan-cli/0.1.0 linux-x64 node-v12.13.1
$ arjan --help [COMMAND]
USAGE
  $ arjan COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`arjan audit`](#arjan-audit)
* [`arjan deploy SITE ACTION [SETUP]`](#arjan-deploy-site-action-setup)
* [`arjan help [COMMAND]`](#arjan-help-command)
* [`arjan init [REGION] [PROFILE]`](#arjan-init-region-profile)
* [`arjan localize FILENAME FROM [TO]`](#arjan-localize-filename-from-to)
* [`arjan optimize [FILENAME]`](#arjan-optimize-filename)

## `arjan audit`

Describe the command here

```
USAGE
  $ arjan audit

OPTIONS
  -d, --dir=dir              Directory path to serve. default is root (relative to the path in which you run the
                             command)

  -f, --file=file            Path of the page you want to audit. default is index.html

  -p, --port=port            Port used for the test server. Default is 8080.

  -t, --threshold=threshold  Integer value from 0 to 1 that represents what you consider to be an acceptable lighthouse
                             score for your site. Its very similar to what you would consider an acceptable school test
                             grade.

DESCRIPTION
  ...
  Extra documentation goes here
```

_See code: [src/commands/audit.js](https://github.com/arjan-tools/cli/blob/v0.1.0/src/commands/audit.js)_

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

  -h, --https          creates and validates a TLS certificate for your site. If you arent using a route53 DNS you must
                       create a CNAME record manually in your DNS.

  -i, --index=index    [default: index.html] name of the index document. default is index.html

  -r, --route53        creates a Hosted Zone in route 53. Have your current DNS provider page open and ready to add a
                       custom DNS.

  -u, --upload=upload  name of a specific file you want to upload to your site. all uploads all of the files

  -w, --www            creates a www s3 bucket that reroutes requests to the index.

DESCRIPTION
  ...
  Extra documentation goes here
```

_See code: [src/commands/deploy.js](https://github.com/arjan-tools/cli/blob/v0.1.0/src/commands/deploy.js)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.0.1/src/commands/help.ts)_

## `arjan init [REGION] [PROFILE]`

Describe the command here

```
USAGE
  $ arjan init [REGION] [PROFILE]

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

_See code: [src/commands/init.js](https://github.com/arjan-tools/cli/blob/v0.1.0/src/commands/init.js)_

## `arjan localize FILENAME FROM [TO]`

Describe the command here

```
USAGE
  $ arjan localize FILENAME FROM [TO]

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

_See code: [src/commands/localize.js](https://github.com/arjan-tools/cli/blob/v0.1.0/src/commands/localize.js)_

## `arjan optimize [FILENAME]`

Describe the command here

```
USAGE
  $ arjan optimize [FILENAME]

ARGUMENTS
  FILENAME  name of the file i.e. index.html

OPTIONS
  -c, --css     minifiy css using cssnano
  -h, --html    compress html using html-minifier
  -i, --images  compress images and if possible maintain the format. otherwise its converted to png.
  -j, --js      minify js using uglify js

  -w, --webp    saves a webp version of each image, then replaces each image instance in the html files with a picture
                tag.

DESCRIPTION
  ...
  Extra documentation goes here
```

_See code: [src/commands/optimize.js](https://github.com/arjan-tools/cli/blob/v0.1.0/src/commands/optimize.js)_
<!-- commandsstop -->
