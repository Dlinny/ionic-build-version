#!/usr/bin/env node
'use strict';

var _meow = require('meow');

var _meow2 = _interopRequireDefault(_meow);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _xml2js = require('xml2js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var chalk = require('chalk');
var ME = 'ionic-build-version';
var DefaultConfigPath = './config.xml';
var DefaultTag = '@NPM_VERSION@';

var help = '\n    Usage\n      $ ' + ME + ' [-v|--version <version>] [-b|--build-number <build-number>] [-c|--config <' + DefaultConfigPath + '>] [file1.ts] [file2.js]\n    \n    Options\n      -c, --config config.xml file path, default is ' + DefaultConfigPath + '\n      -v, --version Version to set, package.json version by default\n      -b, --build-number Build number to set, package.json version by default\n      -t, --tag Tag to lookup in code, ' + DefaultTag + ' by default\n      \n    Examples\n      $ ' + ME + ' -v 2.4.9\n      $ ' + ME + ' -b 86\n      $ ' + ME + ' -v 2.4.9 -b 86\n';

var cli = (0, _meow2.default)({
  version: false,
  help: help
}, {
  alias: {
    c: 'config',
    v: 'version',
    b: 'buildNumber',
    t: 'tag'
  }
});

var configPath = cli.flags.config || DefaultConfigPath;
var version = cli.flags.version || null;
var buildNumber = +cli.flags.buildNumber || null;
var tag = cli.flags.tag || DefaultTag;

if (typeof configPath !== 'string') {
  console.error(chalk.bold.red(new TypeError('"configPath" argument must be a string')));
}

if (version && typeof version !== 'string') {
  console.error(chalk.bold.red(new TypeError('"version" argument must be a string')));
}

if (buildNumber && typeof buildNumber !== 'number') {
  console.error(chalk.bold.red(new TypeError('"buildNumber" argument must be an integer')));
}

ionicBuildVersion(configPath, version, buildNumber, tag, cli.input);

function setXmlVersion(configPath, version, buildNumber, complete) {
  var xmlParser = new _xml2js.Parser();
  var xmlBuilder = new _xml2js.Builder();

  _fs2.default.readFile(configPath, 'UTF-8', function (error, data) {
    if (error) {
      console.error(chalk.bold.red(error));
      return;
    }

    xmlParser.parseString(data, function (error, xml) {
      if (error) {
        console.error(chalk.bold.red(error));
        return;
      }

      if (version) {
        xml.widget.$.version = version;
      }

      if (buildNumber) {
        if (xml.widget.$['android-versionCode']) {
          xml.widget.$['android-versionCode'] = buildNumber;
        }
        if (xml.widget.$['ios-CFBundleVersion']) {
          xml.widget.$['ios-CFBundleVersion'] = buildNumber;
        }
        if (xml.widget.$['osx-CFBundleVersion']) {
          xml.widget.$['osx-CFBundleVersion'] = buildNumber;
        }
      }

      var newData = xmlBuilder.buildObject(xml);
      _fs2.default.writeFile(configPath, newData, { encoding: 'UTF-8' }, function () {
        return complete();
      });
    });
  });
}

function setFileVersion(filePath, version, tag, complete) {
  _fs2.default.readFile(filePath, 'UTF-8', function (error, data) {
    console.log('Set tag ' + tag + ' for ' + filePath + ' to ' + version);
    if (error) {
      console.error(chalk.bold.red(error));
      return;
    }
    _fs2.default.writeFile(filePath, data.toString().replace(tag, version), { encoding: 'UTF-8' }, function () {
      return complete();
    });
  });
}

function ionicBuildVersion(configPath, version, buildNumber, tag, files) {
  function doUpdate() {
    console.log('Set version for ' + configPath + ' to ' + version);
    setXmlVersion(configPath, version, buildNumber, function () {
      var fileFunc = function fileFunc() {
        var file = files.pop();
        if (file) {
          setFileVersion(file, version, tag, fileFunc);
        } else {
          console.log(chalk.bold.green('Version set finished'));
        }
      };
      fileFunc();
    });
  }

  if (version) {
    doUpdate();
  } else {
    _fs2.default.readFile('./package.json', 'UTF-8', function (error, data) {
      if (error) {
        console.error(chalk.bold.red(error));
        return;
      }

      var pkg = JSON.parse(data);
      version = pkg.version;
      doUpdate();
    });
  }
}