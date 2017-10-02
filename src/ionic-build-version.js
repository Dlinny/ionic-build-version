#!/usr/bin/env node

import meow from 'meow'
import fs from 'fs'
import { Parser, Builder } from 'xml2js'

const ME = 'ionic-build-version'
const DefaultConfigPath = './config.xml'
const DefaultTag = '@NPM_VERSION@'

const help = `
    Usage
      $ ` + ME + ` [-v|--version <version>] [-b|--build-number <build-number>] [-c|--config <` + DefaultConfigPath + `>] [file1.ts] [file2.js]
    
    Options
      -c, --config config.xml file path, default is ` + DefaultConfigPath + `
      -v, --version Version to set, package.json version by default
      -b, --build-number Build number to set, package.json version by default
      -t, --tag Tag to lookup in code, ` + DefaultTag + ` by default
      
    Examples
      $ ` + ME + ` -v 2.4.9
      $ ` + ME + ` -b 86
      $ ` + ME + ` -v 2.4.9 -b 86
`

const cli = meow(
  {
    version: false,
    help
  }, {
    alias: {
      c: 'config',
      v: 'version',
      b: 'buildNumber',
      t: 'tag'
    }
  }
)

let configPath = cli.flags.config || DefaultConfigPath
let version = cli.flags.version || null
let buildNumber = +cli.flags.buildNumber || null
let tag = cli.flags.tag || DefaultTag

if (typeof configPath !== 'string') {
  throw new TypeError('"configPath" argument must be a string')
}

if (version && typeof version !== 'string') {
  throw new TypeError('"version" argument must be a string')
}

if (buildNumber && typeof buildNumber !== 'number') {
  throw new TypeError('"buildNumber" argument must be an integer')
}

ionicBuildVersion(configPath, version, buildNumber, tag, cli.input)

function setXmlVersion(configPath, version, buildNumber) {
  const xmlParser = new Parser()
  const xmlBuilder = new Builder()  

  fs.readFile(configPath, 'UTF-8', (error, data) => {
    if (error) {
      throw error;
      return
    }

    xmlParser.parseString(data, (error, xml) => {
      if (error) {
        throw error
        return
      }

      if (version) {
        xml.widget.$.version = version
      }

      if (buildNumber) {
        if (xml.widget.$['android-versionCode']) {
          xml.widget.$['android-versionCode'] = buildNumber
        }
        if (xml.widget.$['ios-CFBundleVersion']) {
          xml.widget.$['ios-CFBundleVersion'] = buildNumber
        }
        if (xml.widget.$['osx-CFBundleVersion']) {
          xml.widget.$['osx-CFBundleVersion'] = buildNumber
        }
      }

      let newData = xmlBuilder.buildObject(xml)
      fs.writeFile(configPath, newData, { encoding: 'UTF-8' })
    })
  })
}

function setFileVersion(filePath, version, tag) {
  fs.readFile(filePath, 'UTF-8', (error, data) => {
    if (error) {
      throw error;
      return
    }
    fs.writeFile(filePath, data.toString().replace(tag, version), { encoding: 'UTF-8' })
  })
}

function ionicBuildVersion(configPath, version, buildNumber, tag, files) {
  function doUpdate() {
    console.log('Set version for '+configPath+' to '+version);
    setXmlVersion(configPath, version, buildNumber);
    for(let filePath of files) {
      console.log('Set version for '+filePath+' to '+version);
      setFileVersion(filePath, version, tag)
    }
    console.log('Version set done')
  }

  if (version) {
    doUpdate()
  } else {
    fs.readFile('./package.json', 'UTF-8', (error, data) => {
      if (error) {
        throw error
        return
      }

      let pkg = JSON.parse(data);
      version = pkg.version;
      doUpdate()
    });
  }
}