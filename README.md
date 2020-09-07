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
* [`arjan content`](#arjan-content)
* [`arjan delete DOMAIN [FILES]`](#arjan-delete-domain-files)
* [`arjan help [COMMAND]`](#arjan-help-command)
* [`arjan init [PROFILE] [REGION]`](#arjan-init-profile-region)
* [`arjan upload DOMAIN [FILES]`](#arjan-upload-domain-files)

## `arjan content`

Describe the command here

```
USAGE
  $ arjan content

OPTIONS
  -n, --name=name  name to print

DESCRIPTION
  ...
  Extra documentation goes here
```

_See code: [src/commands/content.js](https://github.com/arjan-tools/cli/blob/v0.3.4/src/commands/content.js)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_

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
