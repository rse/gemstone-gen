/*
**  Gemstone -- Best-of-Breed for JavaScript Single-Page-Apps <http://gemstonejs.com>
**  Copyright (c) 2014 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the GNU General Public
**  License (GPL), version 3.0. If a copy of the GPL was not distributed
**  with this file, You can obtain one at http://www.gnu.org/licenses/.
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
        console.error("yo: gemstone: ERROR: " + e.message);
        process.exit(1);
    }

    /*  perform own usage displaying
        (Yo does not display the helpArg from above!)  */
    if (this.optionResult.help) {
        var help = parser.help().trimRight();
        console.log("yo: gemstone: USAGE: yo gemstone [options] [arguments]\nSupported options:\n" + help);
        process.exit(0)
    }

    /*  load the package.json content  */
    this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, "../package.json")));

    /*  hook into the "config" sub-generator  */
    this.hookFor("gemstone:config", {
        args: [],
        options: {
            options: {
                "skip-install": options["skip-install"]
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

