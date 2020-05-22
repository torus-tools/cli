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
* [`arjan build`](#arjan-build)
* [`arjan deploy`](#arjan-deploy)
* [`arjan hello`](#arjan-hello)
* [`arjan help [COMMAND]`](#arjan-help-command)
* [`arjan translate FILENAME FROM [TO]`](#arjan-translate-filename-from-to)

## `arjan build`

Describe the command here

```
USAGE
  $ arjan build

OPTIONS
  -n, --name=name  name to print

DESCRIPTION
  ...
  Extra documentation goes here
```

_See code: [src/commands/build.js](https://github.com/arjan-tools/cli/blob/v0.0.0/src/commands/build.js)_

## `arjan deploy`

Describe the command here

```
USAGE
  $ arjan deploy

OPTIONS
  -n, --name=name  name to print

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
