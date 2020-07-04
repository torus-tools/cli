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
arjan-cli/0.3.4 linux-x64 node-v14.4.0
$ arjan --help [COMMAND]
USAGE
  $ arjan COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`arjan audit`](#arjan-audit)
* [`arjan delete DOMAIN [FILES]`](#arjan-delete-domain-files)
* [`arjan deploy DOMAIN ACTION [SETUP]`](#arjan-deploy-domain-action-setup)
* [`arjan help [COMMAND]`](#arjan-help-command)
* [`arjan init [PROFILE] [REGION]`](#arjan-init-profile-region)
* [`arjan localize LANGUAGE [FILES]`](#arjan-localize-language-files)
* [`arjan optimize [FILES]`](#arjan-optimize-files)
* [`arjan start`](#arjan-start)
* [`arjan upload DOMAIN [FILES]`](#arjan-upload-domain-files)

## `arjan audit`

Audit your sites performance during development

```
USAGE
  $ arjan audit

OPTIONS
  -d, --dir=dir              Directory path to serve. default is root (relative to the path in which you run the
                             command)

  -f, --file=file            Path of the page you want to audit. default is index.html

  -p, --port=port            Port used for the test server. Default is 8080.

  -t, --threshold=threshold  [default: 0.8] Integer value from 0 to 1 that represents what you consider to be an
                             acceptable lighthouse score for your site. Its very similar to what you would consider an
                             acceptable school test grade.

DESCRIPTION
  ...
  Audit your sites performance and SEO using Google's lighhouse 6.
```

_See code: [src/commands/audit.js](https://github.com/arjan-tools/cli/blob/v0.3.4/src/commands/audit.js)_

## `arjan delete DOMAIN [FILES]`

Describe the command here

```
USAGE
  $ arjan delete DOMAIN [FILES]

ARGUMENTS
  DOMAIN  root domain of your site

  FILES   path of the file/s you want to upload. Providing none or / will upload all the files in your current
          directory.

DESCRIPTION
  ...
  Extra documentation goes here
```

_See code: [src/commands/delete.js](https://github.com/arjan-tools/cli/blob/v0.3.4/src/commands/delete.js)_

## `arjan deploy DOMAIN ACTION [SETUP]`

Deploy static sites to AWS

```
USAGE
  $ arjan deploy DOMAIN ACTION [SETUP]

ARGUMENTS
  DOMAIN  name of the site i.e. yoursite.com

  ACTION  (create|update|import|delete) choose an action to perform. you can create, update, import your stack or upload
          files to your bucket.

  SETUP   (dev|test|prod|custom) [default: dev] setup for the site - dev, test, production or custom

OPTIONS
  -c, --cdn            creates a CloudFront distribution for your site.
  -e, --error=error    [default: error.html] name of the error document

  -h, --https          creates and validates a TLS certificate for your site. If you arent using a route53 DNS you must
                       create a CNAME record manually in your DNS.

  -i, --index=index    [default: index.html] name of the index document. default is index.html

  -r, --route53        creates a Hosted Zone in route 53. Have your current DNS provider page open and ready to add a
                       custom DNS.

  -u, --upload=upload  name of a specific file or directory to add to your site. To add all files/dirs from your root
                       use / or *

  -w, --www            creates a www s3 bucket that reroutes requests to the index.

DESCRIPTION
  ...
  Deploy static sites to the AWS Cloud using Cloudformation templates.
```

_See code: [src/commands/deploy.js](https://github.com/arjan-tools/cli/blob/v0.3.4/src/commands/deploy.js)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.1.0/src/commands/help.ts)_

## `arjan init [PROFILE] [REGION]`

Describe the command here

```
USAGE
  $ arjan init [PROFILE] [REGION]

ARGUMENTS
  PROFILE  [default: default] AWS Profile
  REGION   [default: us-east-1] AWS Region

OPTIONS
  -g, --global  Guides you through your first time setup. Including AWS IAM user creation.

DESCRIPTION
  ...
  Extra documentation goes here
```

_See code: [src/commands/init.js](https://github.com/arjan-tools/cli/blob/v0.3.4/src/commands/init.js)_

## `arjan localize LANGUAGE [FILES]`

Localize and translate HTML files

```
USAGE
  $ arjan localize LANGUAGE [FILES]

ARGUMENTS
  LANGUAGE  origin language of the file/s.

  FILES     name of the file you want to translate -only html files accepted. Use all to translate all of your html
            files (default).

OPTIONS
  -b, --backwards            Update JSON locale accoridng to changes made in the HTML file. Must be used together with
                             the update flag.

  -c, --create               Create locale/s for your site. When used with translate flags, it generates a translated
                             version of the locale and the HTML.

  -e, --export               Creates a CSV file for your JSON locale.

  -i, --import               Update JSON locale from changes made in the CSV file

  -t, --translate=translate  desired translation language. You may apply this flag multiple times to translate into
                             multiple languages.

  -u, --update               Update HTML file accoridng to changes made in the JSON locale.

DESCRIPTION
  ...
  Automatically localize and translate your HTML sites. Uses Amazon translate for translations.
```

_See code: [src/commands/localize.js](https://github.com/arjan-tools/cli/blob/v0.3.4/src/commands/localize.js)_

## `arjan optimize [FILES]`

Optimize static assets 

```
USAGE
  $ arjan optimize [FILES]

ARGUMENTS
  FILES  path of the files you want to optimize. Ommit the argument or use / to translate all of your html files
         (default).

OPTIONS
  -c, --css            minifiy css using cssnano

  -i, --input=input    Name of the input directory that contains all the scripts for your project. Default is js. To use
                       the root use

  -j, --js             compress javascript with terser.

  -o, --output=output  desired output directory. Default is dep_pack.

  -w, --webp           saves a webp version of each image, then replaces each image instance in the html files with a
                       picture tag.

  --img                compress images and if possible maintain the format. otherwise its converted to png.

DESCRIPTION
  ...
  Uses Webpack to minify your html/css/js files, compress your pictures and more.
```

_See code: [src/commands/optimize.js](https://github.com/arjan-tools/cli/blob/v0.3.4/src/commands/optimize.js)_

## `arjan start`

Describe the command here

```
USAGE
  $ arjan start

OPTIONS
  -i, --index=index  [default: index.html] index document. usually index.html
  -p, --port=port    [default: 8080] number of the desired port

DESCRIPTION
  ...
  Extra documentation goes here
```

_See code: [src/commands/start.js](https://github.com/arjan-tools/cli/blob/v0.3.4/src/commands/start.js)_

## `arjan upload DOMAIN [FILES]`

Describe the command here

```
USAGE
  $ arjan upload DOMAIN [FILES]

ARGUMENTS
  DOMAIN  root domain of your site

  FILES   path of the file/s you want to upload. Providing none or / will upload all the files in your current
          directory.

OPTIONS
  -d, --dir=dir  path of a directory you want to upload to your site

DESCRIPTION
  ...
  Extra documentation goes here
```

_See code: [src/commands/upload.js](https://github.com/arjan-tools/cli/blob/v0.3.4/src/commands/upload.js)_
<!-- commandsstop -->
