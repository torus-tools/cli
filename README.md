Torus CLI
========

Mutli CLI for torus tools

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/toruscli.svg)](https://npmjs.org/package/toruscli)
[![Downloads/week](https://img.shields.io/npm/dw/@torus-tools/cli.svg)](https://npmjs.org/package/@torus-tools/cli)
[![License](https://img.shields.io/npm/l/@torus-tools/cli.svg)](https://github.com/torus-tools/cli/blob/master/package.json)

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
@torus-tools/cli/0.0.11 linux-x64 node-v14.4.0
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
* [`torus stack ACTION [SETUP]`](#torus-stack-action-setup)

## `torus content ACTION [FILES]`

List/download/upload/delete all of your content (or the specified files).

```
USAGE
  $ torus content ACTION [FILES]

ARGUMENTS
  ACTION  (list|download|upload|delete) given action to carry out with the content of your site

  FILES   local paths or object keys of the files/directories you want to upload/download to/from your bucket. For
          example suppose theres a directory img inside the cwd the path of image1.jpg would be img/image1.jpg. For
          local files the root is the current working directory unless specifiecd otherwise with the -i flag. By
          default, if no paths are provided all files/dirs in the root will be used.

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

_See code: [src/commands/content.js](https://github.com/torus-tools/cli/blob/v0.0.11/src/commands/content.js)_

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

Configure torus globally in your machine, or on a per-project basis

```
USAGE
  $ torus init

OPTIONS
  -d, --domain=domain
      The valid desired/existing domain of your site i.e. yoursite.com

  -g, --global
      Create a global torus configuration file. The command will guide you through the steps to generate the required API 
      keys for each of your desired providers, set up your global environment variables and your deisred default settings.

  -p, --providers=aws|godaddy
      Desired cloud/domain providers to be used with torus. You must have an existing account in all of the providers you 
      choose.

  -r, 
  --region=us-east-2|us-east-1|us-west-1|us-west-2|af-south-1|ap-east-1|ap-south-1|ap-northeast-2|ap-southeast-1|ap-sout
  heast-2|ap-northeast-1|ca-central-1|cn-north-1|cn-northwest-1|eu-central-1|eu-west-1|eu-west-2|eu-west-3|eu-north-1|me
  -south-1|sa-east-1|us-gov-east-1|us-gov-west-1
      [default: us-east-1] Desired AWS region

  -u, --user=user
      [default: torus_admin] Desired name for the AWS IAM user

DESCRIPTION
  ...
  The init command helps you configure torus in your site/project. Providing the -g (--global) flag helps you configure 
  torus globally (for all of your projects). When using the torus CLI, you can always overwrite global settings by 
  including a project config file. You can also overwrite global environment variables by including a .env file. If you 
  are using the init command without the -g flag make sure to run it from the root of your project.
```

_See code: [src/commands/init.js](https://github.com/torus-tools/cli/blob/v0.0.11/src/commands/init.js)_

## `torus stack ACTION [SETUP]`

Deploy static sites to AWS

```
USAGE
  $ torus stack ACTION [SETUP]

ARGUMENTS
  ACTION  (create|update|import|delete|pull|push) choose an action to perform. you can create, update, import your stack
          or upload files to your bucket.

  SETUP   (dev|test|prod|custom) [default: dev] setup for the site - dev, test, production or custom

OPTIONS
  -b, --bucket=aws|true                   Enables a cloud storage bucket to be used as the websites origin. You can
                                          provide this flag without the =string to use aws s3.

  -c, --cdn=aws|true                      Add a CDN to your site. CDNs enable faster website load times by caching your
                                          content around the globe (the edge). You can provide this flag without the
                                          =string to use aws Cloudfront.

  -d, --domain=domain                     The domain of your site i.e. yoursite.com

  -e, --error=error                       name of the error document. Default is error.html

  -i, --index=index                       name of the index document. Default is index.html

  -o, --overwrite                         By default, torus always reads your template in the cloud and only adds
                                          changes (updated resources or additional resources). If you want to eliminate
                                          the resources that arent prvoided in the CLI flags you can add this flag.

  -p, --publish                           Publish the sites content

  -r, --registrar=aws|godaddy|other|true  The current domain name registrar of your sites domain. Using AWS or godaddy
                                          enables automatic namserver updates if the DNS provider is different to the
                                          registrar. Selecting other will require manual nameserver updates. true
                                          evaluates to other.

  -s, --ssl=aws|true                      Enables https by creating and validating an SSL certificate for your site. You
                                          can provide this flag without the =string to use aws certificate manager.

  -w, --www=true                          creates a www reroute bucket.

  --dns=aws|godaddy|other|true            Desired DNS provider for your site. The aws option adds a route53 hosted zone
                                          to your stack. You can provide this flag without the =string to use aws.

DESCRIPTION
  ...
  Deploy static sites to the AWS Cloud using Cloudformation templates.
```

_See code: [src/commands/stack.js](https://github.com/torus-tools/cli/blob/v0.0.11/src/commands/stack.js)_
<!-- commandsstop -->
