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
$ npm install -g @torus-tools/cli
$ torus COMMAND
running command...
$ torus (-v|--version|version)
@torus-tools/cli/0.0.1 linux-x64 node-v14.4.0
$ torus --help [COMMAND]
USAGE
  $ torus COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`torus content ACTION [FILES]`](#torus-content-action-files)
* [`torus help [COMMAND]`](#torus-help-command)
* [`torus init`](#torus-init)
* [`torus stack ACTION DOMAIN [SETUP]`](#torus-stack-action-domain-setup)

## `torus content ACTION [FILES]`

List/download/upload/delete all of your content (or the specified files).

```
USAGE
  $ torus content ACTION [FILES]

ARGUMENTS
  ACTION  (list|download|upload|delete) given action to carry out with the content of your site

  FILES   path/s of the files/directories you want to upload. Providing none will select all files in your current
          working directory.

OPTIONS
  -a, --all            Upload all files. By default only updated files are uploaded.
  -d, --domain=domain  Domain of your site (i.e. yoursite.com).
  -i, --input=input    Path of the root directory of your project (if different to the current working driectory).
  -o, --output=output  [default: ./] Path to save downloaded content into. Default is the current working directory.
  -r, --reset          Reset the cache in all edge locations for the given files.
  -s, --sort           Sorts listed files by last modified date.

DESCRIPTION
  ...
  By default only modified files are uploaded; to upload all files provide the --all flag. To automatically update cache 
  in cloudfront for the given files add the --reset flag.
```

_See code: [src/commands/content.js](https://github.com/torus-tools/cli/blob/v0.0.1/src/commands/content.js)_

## `torus help [COMMAND]`

display help for torus

```
USAGE
  $ torus help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_

## `torus init`

Describe the command here

```
USAGE
  $ torus init

OPTIONS
  -d, --domain=domain
      Valid domain for your project

  -g, --global
      Global setup should by run atleast once after the first installation of torus

  -p, --providers=aws|godaddy
      desired cloud providers

  -r, 
  --region=us-east-2|us-east-1|us-west-1|us-west-2|af-south-1|ap-east-1|ap-south-1|ap-northeast-2|ap-southeast-1|ap-sout
  heast-2|ap-northeast-1|ca-central-1|cn-north-1|cn-northwest-1|eu-central-1|eu-west-1|eu-west-2|eu-west-3|eu-north-1|me
  -south-1|sa-east-1|us-gov-east-1|us-gov-west-1
      [default: us-east-1] Desired AWS region

  -u, --user=user
      [default: torus_admin] Desired name for the AWS IAM user

DESCRIPTION
  ...
  Extra documentation goes here
```

_See code: [src/commands/init.js](https://github.com/torus-tools/cli/blob/v0.0.1/src/commands/init.js)_

## `torus stack ACTION DOMAIN [SETUP]`

Deploy static sites to AWS

```
USAGE
  $ torus stack ACTION DOMAIN [SETUP]

ARGUMENTS
  ACTION  (create|update|import|delete|pull|push) choose an action to perform. you can create, update, import your stack
          or upload files to your bucket.

  DOMAIN  name of the site i.e. yoursite.com

  SETUP   (dev|test|prod|custom) [default: dev] setup for the site - dev, test, production or custom

OPTIONS
  -b, --bucket=bucket  creates an s3 bucket with a public policy
  -c, --cdn=cdn        creates a CloudFront distribution for your site.

  -d, --dns=dns        creates a Hosted Zone in route 53. Have your current DNS provider page open and ready to add a
                       custom DNS.

  -e, --error=error    name of the error document

  -h, --https=https    creates and validates a TLS certificate for your site. If you arent using a route53 DNS you must
                       create a CNAME record manually in your DNS.

  -i, --index=index    name of the index document. default is index.html

  -o, --overwrite      overwrite all existing resources with newly generated resources

  -p, --publish        Publish the sites content

  -r, --domain=domain  change the domain name registrar being used

  -w, --www=www        creates an s3 bucket with a public policy

DESCRIPTION
  ...
  Deploy static sites to the AWS Cloud using Cloudformation templates.
```

_See code: [src/commands/stack.js](https://github.com/torus-tools/cli/blob/v0.0.1/src/commands/stack.js)_
<!-- commandsstop -->
