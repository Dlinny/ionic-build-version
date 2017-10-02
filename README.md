# ionic-build-version

## Features

- Writes `version` and `buildNumber` to Cordova `config.xml`
- Can read `version` from local `package.json`
- Has CLI
- Can update version tag in your files

## Install

```sh
$ npm install ionic-build-version
```

## Usage

### ionic-build-version [-v|--version <version>] [-b|--build-number <build-number>] [-c|--config <./config.xml>] [file1.ts] [file2.js]

Options:

- `-v`/`--version` - version to set
- `-b`/`--build-number` - build number to set
- `-c`/`--config` - path to config.xml file
- `-t`/`--tag` - tag to replace in files to version string
- `--help` - display help
    
Examples

```
$ ionic-build-version -v 2.4.9

```