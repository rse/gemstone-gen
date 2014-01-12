/*
**  ComponentJS-Yeoman -- ComponentJS Scaffolding for Yeoman
**  Copyright (c) 2009-2014 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

"use strict";

/*  load external requirements  */
var util     = require("util");
var path     = require("path");
var yeoman   = require("yeoman-generator");
var nunjuck  = require("nunjucks");
var dashdash = require("dashdash");
var _        = require("lodash");

/*  define the generator  */
var Generator = module.exports = function (args, options, config) {
    yeoman.generators.Base.apply(this, arguments);

    console.log("APP");

    /*  perform own command-line parsing
        (Yo uses "nopt" which does no [good] error handling)  */
    this.optionConfig = [
        { names: [ "help", "h" ],
          type: "bool", "default": false,
          help: "Print usage help" },
        { names: [ "reconfigure", "c" ],
          type: "bool", "default": false,
          help: "Reconfigure only" },
        { names: [ "app-id", "i" ], helpArg: "ID",
          type: "string", "default": "example",
          help: "Application Id", 
          persist: true },
        { names: [ "app-name", "n" ], helpArg: "NAME",
          type: "string", "default": "Example App",
          help: "Application Name",
          persist: true },
        { names: [ "app-desc", "d" ], helpArg: "DESCRIPTION",
          type: "string", "default": "The Example Application",
          help: "Application Description",
          persist: true }
    ];
    _.forEach(this.optionConfig, function (config) {
        if (!config.persist)
            return;
        var name = config.names[0];
        var defaults = this.config.get(name);
        if (typeof defaults !== "undefined")
            config["default"] = defaults;
    }.bind(this));
    var parser = dashdash.createParser({
        options: this.optionConfig,
        interspersed: false 
    });
    try {
        this.optionResult = parser.parse(
            [ this.options.argv.original[0] ].concat(this.options.argv.original));
    }
    catch (e) {
        console.error("yo: componentjs: ERROR: " + e.message);
        process.exit(1);
    }

    /*  perform own usage displaying
        (Yo does not display the helpArg from above!)  */
    if (this.optionResult.help) {
        var help = parser.help().trimRight();
        console.log("yo: componentjs: USAGE: yo componentjs [options] [arguments]\nSupported options:\n" + help);
        process.exit(0)
    }

    /*  load the package.json content  */
    this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, "../package.json")));

    /*  override the Lodash template engine with Nunjucks  */
    this.options.engine = function (source, data, options) {
        return nunjucks.Template(source).render(data);
    };
    this.options.engine.detect = function (body) {
        return true;
    };

    this.hookFor("componentjs:env", {
        args: [ 1, 2, 3 ],
        options: {
            options: {
                'skip-install': true
            }
        }
    });

    this.on("end", function () {
        // this.installDependencies({ skipInstall: options["skip-install"] });
    });
};

util.inherits(Generator, yeoman.generators.Base);

/*  process configuration  */
Generator.prototype.doConfig = function () {
    /*  persist options  */
    var save = false;
    _.forEach(this.optionConfig, function (config) {
        if (!config.persist)
            return;
        var name = config.names[0];
        var key = name.replace(/-/g, "_");
        var value = this.config.get(name);
        if (typeof this.optionResult[key] !== "undefined" && value !== this.optionResult[key]) {
            value = this.optionResult[key];
            this.config.set(name, value);
            save = true;
        }
    }.bind(this));
    if (save)
        this.config.forceSave();

    /*  provide a "re-configure only" possibility  */
    if (this.options["reconfigure"]) {
        console.log("reconfigured only");
        process.exit(0);
    }
};

Generator.prototype.askFor = function () {
    /*
    var prompts = [
    {
        type:    "input",
        name:    "app-name",
        message: "Applicaton Name?",
        default: "Example"
    },
    {
        type:    "list",
        name:    "app-type",
        message: "Applicaton Type?",
        choices: [ "ES5", "ES6", "TS" ]
    },
    {
        type:    "checkbox",
        name:    "app-type",
        message: "Applicaton Type?",
        choices: [ "ES5", "ES6", "TS" ]
    },
    {
        type:    "confirm",
        name:    "someOption",
        message: "Would you like to enable this option?",
        default: true
    }
    ];
    var cb = this.async();
    this.prompt(prompts, function (props) {
        this.someOption = props.someOption;
        cb();
    }.bind(this));
    */
};

Generator.prototype.doApp = function () {
    console.log("APP:doApp");
    this.mkdir('app');
    this.mkdir('lib');
    this.template('package.json', 'package.json');
    this.template('bower.json',   'bower.json');
};

