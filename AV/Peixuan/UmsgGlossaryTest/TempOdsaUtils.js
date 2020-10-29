"use strict";
/*global alert: true, console: true, warn: true, ODSA, JSAV_EXERCISE_OPTIONS, JSAV_OPTIONS */

/**
 * This file defines utility functions used by both AVs and modules
 *
 * It is responsible for:
 *
 *   1) Creating function stubs for console to support IE without developer tools
 *
 *   2) Defining default JSAV_OPTIONS and JSAV_EXERCISE_OPTIONS
 *
 *   3) Defining extensions to JSAV and various utility functions for use in AVs
 *      and on modules
 *
 *   4) Automatically parsing URL parameters and using them to initialize
 *      ODSA.SETTINGS (if applicable, i.e. on embedded pages)
 *
 *   5) Defining functions related to loading and automatically applying
 *      language translations
 *
 *   6) Defining logging functions and automatically attaching some of them to
 *      elements
 *
 *   7) Automatically parsing glossaries inside the content of the JSAV umsg function and
 *      build links to the glossary module
 *
 * This file is required by both AVs and modules and should be
 * referenced before odsaAV.js and odsaMOD.js, respectively
 *
 * Author: Dan Breakiron
 * Last Modified: 2020-10-29
 */

/**
 * Dictionary of exercise parameters parsed from the URL
 */
var PARAMS = {};

(function($) {
  //*****************************************************************************
  //*************                  GLOBAL VARIBALES                 *************
  //*****************************************************************************

  /**
   * Local settings object that makes it easier to access ODSA.SETTINGS and allows better minification
   */
  var settings;

  /**
   * Local moduleName object that makes it easier to access ODSA.SETTINGS.MODULE_NAME and allows better minification
   */
  var moduleName;

  /**
   * A unique instance identifier, used to group interaction events from a single instance
   */
  var uiid = +new Date();

  /**
   * Stores book stranslation text
   */
  var langDict = {};

  //*****************************************************************************
  //*************                  JSAV Extensions                  *************
  //*****************************************************************************
  /**
   * Extends the JSAV AV array to have the slice functionality of JavaScript arrays
   */
  JSAV._types.ds.AVArray.prototype.slice = function(start, end) {
    var array = [];

    for (var i = 0; i < (end - start); i++) {
      array[i] = this.value(start + i);
    }

    return array;
  };

  /**
   * Convenience function for highlighting the pivot value in blue
   */
  JSAV._types.ds.AVArray.prototype.highlightBlue = function(index) {
    return this.addClass(index, "processing");
  };

  JSAV._types.ds.AVArray.prototype.unhighlightBlue = function(index) {
    return this.removeClass(index, "processing");
  };

  /**
   * Convenience function for highlighting sorted values
   */
  JSAV._types.ds.AVArray.prototype.markSorted = function(index) {
    this.removeClass(index, "processing");
    return this.addClass(index, "sorted");
  };

  /**
   * toString function for JSAV arrays, useful for debugging
   */
  JSAV._types.ds.AVArray.prototype.toString = function() {
    var size = this.size();
    var str = '[';
    for (var i = 0; i < size; i++) {
      str += this.value(i);

      if (i < size - 1) {
        str += ', ';
      }
    }
    str += ']';

    return str;
  };

  //*****************************************************************************
  //***********                   Utility Functions                   ***********
  //*****************************************************************************

  /**
   * Loops through all the keys in a dictionary of parameters and sets
   * the appropriate JSAV_EXERCISE_OPTIONS or JSAV_OPTIONS setting if the
   * key begins with JXOP- or JOP-, respectively
   */
  function setJSAVOpt(key, value) {
    if (key.indexOf('JXOP-') === 0) {
      // Arguments that begin with the prefix 'JXOP-' are JSAV_EXERCISE_OPTIONS settings
      // Strip the 'JXOP-' flag from the setting name and apply the specified value
      JSAV_EXERCISE_OPTIONS[key.replace('JXOP-', '')] = value;
    } else if (key.indexOf('JOP-') === 0) {
      // Arguments that begin with the prefix 'JOP-' are JSAV_OPTIONS settings
      // Strip the 'JOP-' flag from the setting name and apply the specified value
      JSAV_OPTIONS[key.replace('JOP-', '')] = value;
    }
  }

  /**
   * Parses parameters from the URL, supports exercise configuration and changing the default JSAV options
   * If an AV author changes any of the default JSAV options set above, they must call this function
   * (ODSA.UTILS.parseURLParams();) to apply any URL parameters and ensure their exercise remains configurable
   */
  function parseURLParams() {
    // Parse the querystring from the URL
    var query_params = JSAV.utils.getQueryParameter();

    // Automatically set any JSAV_EXERCISE_OPTIONS or JSAV_OPTIONS, if applicable
    for (var key in query_params) {
      if (query_params.hasOwnProperty(key)) {
        setJSAVOpt(key, query_params[key]);
      }
    }

    // Make PARAMS include all of the parameters (including the JXOP- and JOP- ones)
    PARAMS = query_params;
  }

  /**
   * Function to translate module pages, fetches translation in language_msg.json  file
   * returns a JSON object
   */
  function loadLangMod() {
    var langText = {};
    var url = '_static/language_msg.json';
    if (loggingServerEnabled()) {
      if (hasBook()) {
        url = "/OpenDSA/Books/" + ODSA.SETTINGS.BOOK_NAME + '/html/_static/language_msg.json';
      }
      else {
        url = '/OpenDSA/tools/language_msg.json';
      }
    }


    $.ajax({
      url: url,
      async: false,
      dataType: "json",
      success: function(data) {
        var langFile = getJSON(data);
        var tmpLD = langFile[ODSA.SETTINGS.BOOK_LANG].jinja;
        var tmpLD1 = langFile[ODSA.SETTINGS.BOOK_LANG].js;
        langText = $.extend({}, tmpLD, tmpLD1);
      },
      error: function(data) {
        data = getJSON(data);

        if (data.hasOwnProperty('status') && data.status === 200) {
          console.error('JSON language file is malformed. Please make sure your JSON is valid.');
        } else {
          console.error('Unable to load JSON language file (' + url + ')');
        }
      }
    });

    return langText;
  }

  /**
   * Returns correct type information.  Bypasses broken behavior of 'typeof'.
   * `typeof` should be avoided at all costs (unless checking if a var is defined).
   *
   * Based on 'is' from: http://bonsaiden.github.com/JavaScript-Garden/
   * See https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/ for more information
   */
  function getType(obj) {
    if (typeof obj !== "undefined") {
      // Parse the type from the Object toString output
      return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
    }
    return "undefined";
  }

  function hasBook() {
    return typeof ODSA.TP.instBookId !== "undefined";
  }

  function isFullModule() {
    return typeof ODSA.TP.instChapterModuleId !== "undefined";
  }

  function isStandaloneModule() {
    return typeof ODSA.TP.instModuleVersionId !== "undefined";
  }

  /**
   * Returns the URL of the book
   */
  function getBookURL() {
    if (typeof ODSA.SETTINGS.BOOK_URL === "undefined") {
      var loc = location.href;
      ODSA.SETTINGS.BOOK_URL = loc.substring(0, loc.lastIndexOf('/') + 1);
    }

    return ODSA.SETTINGS.BOOK_URL;
  }

  function getBookID() {
    return ODSA.TP.instBookId;
  }

  function getSectionID() {
    return ODSA.TP.instSectionId;
  }

  function getChapterModuleID() {
    return ODSA.TP.instChapterModuleId;
  }

  function getInstModuleVersionId() {
    return ODSA.TP.instModuleVersionId;
  }

  function getExerciseSettings(shortName) {
    return ODSA.TP.exerciseSettings[shortName];
  }

  function getInstCourseOfferingExerciseId() {
    return ODSA.TP.instCourseOfferingExerciseId;
  }

  /**
   * Returns true if the system is configured with a metrics collection server
   */
  function loggingServerEnabled() {
    return !!ODSA.TP;
  }

  /**
   * Returns true if the system is configured with a scoring server
   */
  function scoringServerEnabled() {
    return !!ODSA.TP;
  }

  function getUserEmail() {
    return ODSA.TP.userEmail;
  }

  /**
   * Rounds the given number to a max of 2 decimal places
   */
  function roundPercent(number) {
    return Math.round(number * 100) / 100;
  }

  /**
   * Returns true if the given element is a JSAV managed control
   * Relies on JSAV controls being in a container with a class that matches '.*jsav\w*control.*'
   * include "jsavexercisecontrols" and "jsavcontrols"
   */
  function isJSAVControl(item) {
    /*jslint regexp: true */
    return (item && item.parentElement && item.parentElement.className.match(/.*jsav\w*control.*/) !== null);
  }

  /**
   * Returns the given data as a JSON object
   * If given a string, converts it to JSON
   * If given a JSON object, does nothing
   */
  function getJSON(data) {
    if (typeof data === 'undefined') {
      console.warn("getJSON() error: data is undefined");
      return {};
    }

    if (getType(data) === "string") {
      try {
        data = jQuery.parseJSON(data);
      } catch(e) {
        return null;
      }
    }
    return data;
  }

  // Randomly scramble the contents of an array
  function permute(arr) {
    for (var i = 0; i < arr.length; i++) { // for each i
      var randompos = Math.floor(Math.random() * arr.length);
      var temp = arr[i];
      arr[i] = arr[randompos];
      arr[randompos] = temp;
    }
  }

  // Process the message data coming from OpenPop Back end
  function handleMsg(message, lineNum, fileName, className, element) {

    var newmessage = message.join(',');
    var re = "Try Again";
    newmessage = newmessage.replace(/\n/gi, "");

    if (newmessage.indexOf(re) == -1) { // /studentlisttest.java:/gi
      var re = new RegExp(fileName, 'g');
      newmessage = newmessage.replace(re, "Error:line# ");
      newmessage = newmessage.replace(className, "");
      newmessage = newmessage.replace(/\^/gi, "");

      var numbers = newmessage.match(/\d+\.?\d*/g);

      for (var i = numbers.length - 2; i >= 0; i--) {
        var newnumber = numbers[i] - lineNum;
        var stringnum = numbers[i] + '';
        var newstringnumber = newnumber + '';
        newmessage = newmessage.replace(stringnum, newstringnumber);
      }
    }

    var msg = newmessage.split(",");

    $('#' + element).empty();
    for (var i = 0; i < msg.length; i++) {
      var msgLine = $("<div>" + msg[i] + "</div>")
      $('#' + element).append(msgLine);
    }
  }

  //*****************************************************************************
  //***********        Dynamic Exercise Configuration Functions       ***********
  //*****************************************************************************

  /**
   * Loads a JSON exercise configuration file that contains natural
   * language translations, multiple code languages, and default parameters
   * Uses this config file to reset the language of common elements, then
   * returns an object that contains a JSAV interpreter, code object, and
   * a parameters object
   *
   * Parameters:
   *   Takes an object as its parameter which contains optional arguments
   *   (described below)
   *
   *  - av_name - the name of the AV (required for mini-slideshows because there
   *              could be multiple AVs per page, optional for standalone AVs
   *              because ODSA.SETTINGS.AV_NAME is used by default)
   *
   *  - json_path - the path to the JSON file containing language data,
   *                relative to the root OpenDSA directory defaults to
   *                av_name (convention for standalone AVs)
   *
   *  - av_container - ID of the container containing the AV (defaults to
   *                   '#container' for standalone AVs and  '#[av_name]' for
   *                    mini-slideshows
   *
   * Return:
   *   - Returns an object containing a JSAV interpreter and code
   *   - Ex: {interpreter: ..., code: ..., params: ...}
   */
  function loadConfig(args) {
    // Initialize args, if no object was provided
    if (typeof args === 'undefined') {
      args = {};
    }
    // If av_name is provided as an argument (necessary for mini-slideshows)
    // use it, otherwise default to ODSA.SETTINGS.AV_NAME (valid for standalone AVs)
    var av_name = (args.hasOwnProperty('av_name')) ? args.av_name : settings.AV_NAME;
    // Default the JSON URL to the name of the AV (convention for standalone AVs)
    var json_url = av_name;

    // If json_filepath was provided as an argument, attempt to calculate the
    // relative path to the OpenDSA root directory, then append the filepath
    if (args.hasOwnProperty('json_path')) {
      if (loggingServerEnabled()) {
        var fixed = args.json_path.replace(/\.\.\//g, '');
        fixed = fixed.indexOf('/') === 0 ? fixed : '/' + fixed;
        json_url = "/OpenDSA" + fixed;
      } else {
        json_url = args.json_path;
      }

    }

    // Default av_container to #container (the av_container for standalone AVs)
    var av_container = $('#container');
    var configurationFile;
    var result = {
      interpreter: function(tag) {
        return tag;
      },
      code: undefined,
      getSettings: function() {
        return new JSAV.utils.Settings($(".jsavsettings"));
      },
      params: {}
    };

    // Use intelligent defaults to try and set the av_container
    if (args.hasOwnProperty('av_container') && $('#' + args.av_container).length > 0) {
      // Set av_container using provided parameter
      av_container = $('#' + args.av_container);
    } else if ($('#' + av_name).length > 0) {
      // If the container is named for the AV it is a mini-slideshow

      // If the AV is a mini-slideshow and does not provide a json_path
      // argument, assume the name of the JS file where the AV is defined,
      // the JSON exercise config file, and the AV name are the same
      // Use this assumption to auto-detect the path to the JSON file
      if (!args.hasOwnProperty('json_path')) {
        json_url = $('script[src*="/' + av_name + '.js"]')[0].src + 'on';
      }

      // Set av_container to av_name (default for mini-slideshows)
      av_container = $('#' + av_name);
    } else if ($(av_container).length === 0) {
      // If av_container is not provided as a parameter, does not match the av_name or '#container', then print an error message
      console.warn('ERROR: Unable to apply translation because #' + av_container + ', #' + av_name + ', and #container do not exist');
    }

    // Append '.json' to the end of the JSON URL, if it doesn't already exist
    if (json_url.indexOf('.json') === -1) {
      json_url += '.json';
    }

    // Initialize the selected natural language and code language
    // Ensure lang and code are lowercase so that everything will be in a predictable case
    var lang = (JSAV_EXERCISE_OPTIONS.lang || JSAV_OPTIONS.lang || "en").toLowerCase();
    var code_lang = (JSAV_EXERCISE_OPTIONS.code || JSAV_OPTIONS.code || args.default_code || '').toLowerCase();

    // Initialize the list of natural and programming languages to empty lists
    var langs = [],
    code_langs = [];

    // download the entire configuration file
    $.ajax({
      url: json_url,
      async: false,
      dataType: "json",
      success: function(data) {
        configurationFile = ODSA.UTILS.getJSON(data);

        // URL where the language information can be downloaded from
        var langUrl = '';

        // Obtain the translation data
        if (typeof configurationFile !== 'undefined' && configurationFile.hasOwnProperty('translations')) {
          var translation;

          if (typeof configurationFile.translations === "string") {
            // If 'translations' is a generic URL, replace the '{lang}' placeholder with the language we are trying to load
            langUrl = configurationFile.translations.replace('{lang}', lang);
          } else {
            // We assume 'translations' is an object

            // Save the keys in langs
            langs = Object.keys(configurationFile.translations);

            // If the preferred language doesn't exist in the translation file, default to English
            if (!configurationFile.translations.hasOwnProperty(lang)) {
              console.warn('Desired language (' + lang + ') does not exist, falling back to English');
              lang = 'en';
            }

            if (typeof configurationFile.translations[lang] === "object") {
              // If 'translations' is an object containing translations, we found the translation data
              translation = configurationFile.translations[lang];
            } else if (typeof configurationFile.translations[lang] === "string") {
              // Looks for a JSON file at the path (relative to the AV HTML file) specified in association with a given langauge
              langUrl = json_url.split("/");
              langUrl.pop();
              langUrl = langUrl.join("/");
              if (langUrl !== "") {
                langUrl += "/";
              }
              langUrl += configurationFile.translations[lang];
            }
          }

          // If langUrl is initialized, download the language data
          if (langUrl !== '') {
            // download the language object from the url
            var langData;

            // TODO: Add a failure condition that tries again with 'en' if translations is a string containing '{lang}'
            $.ajax({
              url: langUrl,
              async: false,
              dataType: "json",
              success: function(data) {
                langData = data;
              }
            });

            translation = langData;
          }

          // Initialize the interpreter object
          result.interpreter = JSAV.utils.getInterpreter(translation);

          // Update the language of text used in the AV
          if (typeof translation === 'undefined') {
            console.error('There is no translation support for language ' + JSAV_OPTIONS.lang);
          } else {
            var elem;
            for (var field in translation) {
              if (translation.hasOwnProperty(field) && field.indexOf("av_") !== 0) {
                elem = av_container.find(field);
                if (elem.size() > 0) {
                  if (elem.is('input')) {
                    elem.attr('value', translation[field]);
                  } else {
                    elem.html(translation[field]);
                  }
                }
              }
            }
          }
        } else {
          console.error('JSON language file does not contain a "translations" key.  Please make sure your JSON file follows the correct format.');
        }

        // Save a list of all the code languages and 'none' in the configuration file
        if (configurationFile && configurationFile.code) {
          code_langs = ['none'].concat(Object.keys(configurationFile.code));
        }

        // If code_lang is set to 'none' or the configuration file doesn't contain a 'code' object,
        // then disable code for the AV
        if (code_lang !== 'none' && typeof configurationFile !== 'undefined' && configurationFile.hasOwnProperty('code')) {
          // If the preferred code language does not exist in the translation
          // file, use the first language that does or print a warning if not code is provided
          if (!configurationFile.code.hasOwnProperty(code_lang)) {
            var keys = Object.keys(configurationFile.code);

            if (keys.length > 0) {
              if (code_lang !== '') {
                console.warn('Translation file (' + json_url + ') does not contain ' + code_lang + ' code, defaulting to ' + keys[0]);
              }
              code_lang = keys[0];
            } else {
              console.warn('Translation file (' + json_url + ') does not contain any code');
              code_lang = '';
            }
          }

          // If a code language is specified, read the code translation from the
          // configuration file
          if (code_lang !== '') {
            result.code = configurationFile.code[code_lang];
          }
        }

        /*
         * Add any default parameters defined in the config file to PARAMS
         * (and apply and JXOP- or JOP- parameters)
         *
         * NOTE: Will overwrite conflicting keys if they already exist in
         * PARAMS, but will not overwrite values set via URL parameters
         * This allows the config file to reset the default JXOP- or JOP-
         * settings defined in this file
         */
        var key, value;
        var query_string = JSAV.utils.getQueryParameter();

        if (configurationFile.hasOwnProperty('params')) {
          for (key in configurationFile.params) {
            // Allow the JSON exercise config file to set exercise defaults
            if (configurationFile.params.hasOwnProperty(key) && !query_string.hasOwnProperty(key)) {
              value = configurationFile.params[key];

              setJSAVOpt(key, value);
              PARAMS[key] = value;
            }
          }
        }
      },
      error: function(data) {
        data = ODSA.UTILS.getJSON(data);

        if (data.hasOwnProperty('status') && data.status === 200) {
          console.error('JSON language file is malformed. Please make sure your JSON is valid.');
        } else {
          console.error('Unable to load JSON language file (' + json_url + ')');
        }
      }
    });

    // helper function for creating natural/programming language selector for the JSAV settings
    // type should be either "lang" for natural language or "code_lang" for programming language
    function settingsSelector(type) {
      return function() {
        var options = {
          lang: {
            id: 'jsavsettings-language',
            label: 'language',
            param: 'JOP-lang='
          },
          code_lang: {
            id: 'jsavsettings-code',
            label: 'programming',
            param: 'JXOP-code='
          }
        };
        // helper function for capitalizing the first letter in a string
        function getLabel(string) {
          if (translations[string]) {
            return translations[string].language_name;
          }
          return string.charAt(0).toUpperCase() + string.slice(1);
        }
        // temporary translations
        var translations = {
          en: {
            language_name: 'English',
            language: 'Language:',
            programming: 'Programming language:'
          },
          fi: {
            language_name: 'Suomi',
            language: 'Kieli:',
            programming: 'Ohjelmointikieli:'
          },
          sv: {
            language_name: 'Svenska',
            language: 'Språk:',
            programming: 'Programmeringsspråk:'
          }
        };
        var opts = options[type] || options.lang,
        // The label 'Language'/'Programming Language' (translated if possible)
        label = (translations[lang] ? translations[lang] : translations.en)[opts.label],
        // the element we append to the JSAV settings window
        $elem = $('<div class="jsavrow">' +
                  '<label for="' + opts.id + '">' + label + ' </label>' +
                  '<select id="' + opts.id + '"></select></div>'),
        // the selector element
        $select = $elem.find('#' + opts.id),
        // the value options for the selector
        vals = (type === 'lang' ? langs : code_langs),
        // the currently selected value
        selected = (type === 'lang' ? lang : code_lang),
        // string with HTML option elements
        optElems = '';
        // add the options to optElems
        vals.forEach(function(val) {
          optElems += '<option value="' + val + '" ' + (val === selected ? 'selected' : '') + '>' +
            getLabel(val) + '</option>';
        });
        // append the options to the selector
        $select.append(optElems);
        // add change listener to the selector
        $select.change(function() {
          // get the url of the AV
          var url = window.location.href,
          // create a regular expression for finding the current URL key-value parameter pair
          regexp = new RegExp(opts.param + '[^&]*'),
          // value of the new URL key-value parameter pair
          newParameter = opts.param + $select.val();
          if (url.search(regexp) !== -1) {
            // the url parameter is in the current url -> replace it
            url = url.replace(regexp, newParameter);
          } else {
            // append the url parameter to the url
            var appendChar = (url.search(/\?/) === -1 ? '?' : '&');
            url += (appendChar + newParameter);
          }
          // reload the AV
          window.location.href = url;
        });
        // return the element to JSAV settings
        return $elem;
      };
    }

    // getSettings() will return a new JSAV Settings instance that has selectors for
    // natural and programming language if there are at least two choices available.
    result.getSettings = function() {
      var settings = new JSAV.utils.Settings($(".jsavsettings"));
      if (langs.length > 1) { // add a language selector to JSAV settings
        settings.add(settingsSelector('lang'));
      }
      if (code_langs.length > 1) { // add a programming language selector to JSAV settings
        settings.add(settingsSelector('code_lang'));
      }
      return settings;
    };

    // correct code url path
    if (result.code) {
      var url = "";
      if (loggingServerEnabled()) {
        if (Array.isArray(result.code)) {
          for (var i = 0; i < result.code.length; i++) {
            url = result.code[i].url;
            result.code[i].url = "/OpenDSA/" + url.slice(url.indexOf("SourceCode"));
          }
        } else {
          url = result.code.url;
          result.code.url = "/OpenDSA/" + url.slice(url.indexOf("SourceCode"));
        }
      }
    }
    return result;
  }

  //*****************************************************************************
  //***********                   Logging Functions                   ***********
  //*****************************************************************************

  /**
   * Checks the given JSON object to ensure it has the correct fields
   *     data - a JSON object representing an event
   */
  function isValidEvent(data) {
    // If av and uiid are not provided, give them default values
    if (typeof data.av === "undefined") {
      data.av = '';
    }
    if (typeof data.uiid === "undefined") {
      data.uiid = uiid;
    }

    var missingFields = [];

    if (typeof data.type === "undefined") {
      missingFields.push('type');
    }
    if (typeof data.desc === "undefined") {
      missingFields.push('desc');
    }

    if (missingFields.length > 0) {
      if (missingFields.length === 1) {
        console.warn("Invalid event, '" + missingFields[0] + "' is undefined");
      } else {
        console.warn("Invalid event, '" + missingFields.join(', ') + "' are undefined");
      }
      return false;
    }

    return true;
  }

  /**
   * Appends the given data to the event log
   * 'module_name' and 'tstamp' will be appended automatically by this function
   *
   *   data - A JSON string or object containing event data, must contain
   *          the following fields: 'av', 'type', 'desc', 'uiid'
   */
  function logEvent(data) {
    if (loggingServerEnabled()) {
      data = getJSON(data);

      // List of attributes the event data is required to have
      var reqAttrib = ['av', 'desc', 'module_name', 'steps_fixed', 'tstamp', 'type', 'uiid'];

      // Loop through all attributes and remove any unnecessary ones
      // (if the server will ignore them, no reason for us to store and send them)
      for (var prop in data) {
        if (data.hasOwnProperty(prop) && reqAttrib.indexOf(prop) === -1) {
          // Data has a property that the server will ignore, discard it
          delete data.prop;
        }
      }

      // Ensure given JSON data is a valid event
      if (!isValidEvent(data)) {
        console.warn('logEvent() error: Invalid event');
        console.log(data);
        return;
      }

      // Don't log events without either an AV name or a module name
      // Getting duplicates of some events where one is missing both
      // Currently all legitimate events should have one or the other
      if (data.av === "" && moduleName === "") {
        console.warn('Exercise name and moduleName cannot both be ""');
        return;
      }

      data.module = moduleName;

      // Store username and book ID with each event because all events will be grouped together, allowing any user to submit everyone's events to ensure we collect as much data as possible
      if (odsaUtils.scoringServerEnabled()) {
        data.user_email = getUserEmail();
        if (hasBook()) {
          data.inst_book_id = getBookID();
          if (isFullModule()) {
            data.inst_chapter_module_id = getChapterModuleID();
          }
          else {
            data.inst_section_id = getSectionID();
          }
        }
        else if (isStandaloneModule()) {
          data.inst_module_version_id = getInstModuleVersionId();
        }
        else {
          data.inst_course_offering_exercise_id = getInstCourseOfferingExerciseId();
        }
      }

      // Add a timestamp to the data
      if (data.tstamp) {
        // Convert existing JSAV timestamp from ISO format to milliseconds
        data.tstamp = new Date(data.tstamp).getTime();
      } else {
        data.tstamp = (new Date()).getTime();
      }

      // Convert the description field into a string so the server can handle it properly
      data.desc = JSON.stringify(data.desc);

      // Store the event in localStorage
      // The random number is used to reduce the likelihood of collisions where multiple events get logged at the same time
      var rand = Math.floor(Math.random() * 101);
      localStorage[['event', data.tstamp, rand].join('-')] = JSON.stringify(data);
    }
  }

  /**
   * Logs a custom user interaction
   *     type - String identifying the type of action
   *     desc - Human-readable string describing the action
   *     exerName - Name of the exercise with which the action is associated
   *     eventUiid - A value that identifies a unique exercise instance, used to tie exercise events to a specific instance
   */
  function logUserAction(type, desc, exerName, eventUiid) {
    if (loggingServerEnabled()) {
      var eventData = {};
      eventData.type = type;
      eventData.desc = desc;
      eventData.av = (exerName) ? exerName : settings.AV_NAME;
      eventData.uiid = (eventUiid) ? eventUiid : uiid;
      logEvent(eventData);
    }
  }

  /**
   * Sends the event data logged in localStorage to the server
   */
  function sendEventData() {
    if (loggingServerEnabled()) {
      var tstamp = (new Date()).getTime(),
      keysToPurge = [],
      userInteractions = {},
      eventObj;
      if (hasBook()) {
        userInteractions['inst_book_id'] = getBookID();
      }
      userInteractions.eventList = [];

      // Loop through localStorage looking for any events that occurred before tstamp
      for (var key in localStorage) {
        // indexOf is used rather than startsWith because startsWith isn't supported in Chrome
        if (key.indexOf('event-') === 0 && parseInt(key.split('-')[1], 10) < tstamp) {
          eventObj = getJSON(localStorage[key]);
          if (eventObj.user_email == getUserEmail() && eventObj.inst_book_id == getBookID()) {
            // Keep track of which objects to remove if the AJAX message is successful
            keysToPurge.push(key);
            userInteractions.eventList.push(getJSON(localStorage[key]));
          }
        }
      }

      // TODO: What about if the AJAX communication is successful, but the user closes the browser before the response returns and the values are removed - they will still be in local storage and they will be sent again

      // Return if there is no data to send
      if (userInteractions.eventList.length === 0) {
        return true;
      }
      // Send the data to the server
      jQuery.ajax({
        url: "/odsa_user_interactions",
        type: "POST",
        data: JSON.stringify(userInteractions), // TODO: Work with Eric to get the server to accept the new format
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        xhrFields: {
          withCredentials: true
        },
        success: function(data) {
          data = getJSON(data);

          // Client successfully contacted the server, data was either successfully stored or rejected for being invalid, either way remove the events that were sent from localStorage
          for (var i in keysToPurge) {
            if (keysToPurge.hasOwnProperty(i)) {
              localStorage.removeItem(keysToPurge[i]);
            }
          }
        },
        error: function(data) {
          data = getJSON(data);

          if (data.status === 400) {
            // If status === 400 (Bad request) it means some of the data was rejected
            // by the server and that we should discard that data to prevent future failures
            console.group('Event data rejected by server');
            console.debug(JSON.stringify(eventList));
            console.groupEnd();

            for (var i in keysToPurge) {
              if (keysToPurge.hasOwnProperty(i)) {
                localStorage.removeItem(keysToPurge[i]);
              }
            }
          } else if (data.status === 401) {
            // Trigger event which will cause the expired session to be handled appropriately
            $('body').trigger('odsa-session-expired', [sessionKey]);
          } else {
            console.group("Error sending event data");
            console.debug(data);
            console.groupEnd();
          }
        }
      });
    }
  }

  /**
   * Default function to handle logging button clicks
   */
  function buttonLogger() {
    /*jslint validthis: true */
    if (loggingServerEnabled()) {
      var type = "",
      desc = "";

      if (this.id !== "") {
        type = this.type + "-" + this.id;
      } else {
        type = this.type;
        console.warn(this.value + " button does not have an ID");
      }

      // TODO: Find a better way to get the description for a button
      if (this.hasAttribute('data-desc')) {
        desc = this.getAttribute('data-desc');
      } else if (this.value !== "") {
        desc = this.value;
      } else if (this.id !== "") {
        desc = this.id;
      } else if (this.name !== "") {
        desc = this.name;
      }

      logUserAction(type, desc);
    }
  }

  /**
   * Default function to handle logging hyperlink clicks
   */
  function linkLogger() {
    /*jslint validthis: true */
    if (loggingServerEnabled()) {
      var href = this.href;
      if (href.indexOf('#') !== -1) {
        href = href.slice(href.indexOf('#'))
      }

      var type = "",
      desc = {
        href: href,
        text: $(this).html
      };

      if (settings.AV_NAME === "" && this.form) {
        settings.AV_NAME = this.form.id;
      }

      if (this.id !== "") {
        type = "hyperlink-" + this.id;
      } else {
        type = "hyperlink";
        console.warn("Link (" + this.href + ") does not have an ID");
      }

      // TODO: Find a better way to log links
      logUserAction(type, desc);
    }
  }

  //*****************************************************************************
  //*************                   INITIALIZATION                  *************
  //*****************************************************************************

  // Define the console object if it doesn't exist to support IE without developer tools
  if (!(window.console && console.log)) {
    console = {
      log: function() {},
      debug: function() {},
      info: function() {},
      warn: function() {},
      error: function() {}
    };
  }

  if (typeof JSAV_EXERCISE_OPTIONS === "undefined") {
    window.JSAV_EXERCISE_OPTIONS = {};
  }

  if (typeof window.JSAV_OPTIONS === "undefined") {
    window.JSAV_OPTIONS = {};
  }

  // Set default grading options for JSAV exercises (so that standalone or non-configured exercises use sensible options)
  JSAV_EXERCISE_OPTIONS.feedback = "continuous";
  JSAV_EXERCISE_OPTIONS.fixmode = "fix";

  parseURLParams();

  // Initialize applicable settings on embedded pages using URL parameters
  // The ODSA namespace is initialized in _static/config.js on module pages
  if (typeof ODSA === "undefined") {
    var odsaSettings = {};
    odsaSettings.BOOK_ID = PARAMS.book;
    odsaSettings.EXERCISE_SERVER = PARAMS.exerciseServer;
    odsaSettings.LOGGING_SERVER = PARAMS.loggingServer;
    odsaSettings.SCORE_SERVER = PARAMS.scoreServer;
    odsaSettings.MODULE_ORIGIN = PARAMS.moduleOrigin;
    odsaSettings.MODULE_NAME = PARAMS.module;
    odsaSettings.NARRATION_ENABLED = PARAMS.narrationEnabled;

    // If MODULE_ORIGIN is not specified, assume they are on the same domain
    if (!odsaSettings.MODULE_ORIGIN) {
      odsaSettings.MODULE_ORIGIN = location.origin;
    }

    window.ODSA = {};
    window.ODSA.SETTINGS = odsaSettings;
  } else {
    // Only load translations on module pages (translations on loaded on
    // AVs using a different function)
    langDict = loadLangMod();
  }

  settings = ODSA.SETTINGS;

  // IMPORTANT: Uses parent.location so that the MODULE_ORIGIN doesn't have to be
  // specified in the config file in order for postMessage to work
  // Only works if module and exercises are hosted on the same domain
  // settings.MODULE_ORIGIN = parent.location.protocol + '//' + parent.location.host;
  settings.EXERCISE_ORIGIN = settings.MODULE_ORIGIN;
  settings.AV_ORIGIN = settings.MODULE_ORIGIN;

  /*
   * Constant storing the name of the AV that loaded this file
   * If this file is loaded on a module page, this value will remain ""
   * Otherwise, if loaded on an AV page, this value will be initialized in odsaAV.js
   */
  settings.AV_NAME = '';
  /*
   * IMPORTANT: Special case for local testing. If the page is accessed
   * via the loopback address, set the MODULE_ORIGIN, AV_ORIGIN, and
   * EXERCISE_ORIGIN to the loopback origin
   */
  if (location.hostname === '127.0.0.1' || location.hostname === 'localhost') {
    settings.MODULE_ORIGIN = settings.AV_ORIGIN = settings.EXERCISE_ORIGIN = location.origin;
  }
  /*
   * Makes sure ODSA.SETTINGS.MODULE_NAME is initialized
   *
   * IMPORTANT: Must be done before document.ready() so that the value
   * can be used by logging functions called by AV initialize() methods
   * that are run before document.ready()
   */
  settings.MODULE_NAME = (settings.hasOwnProperty('MODULE_NAME')) ? settings.MODULE_NAME : '';
  moduleName = settings.MODULE_NAME;

  /**
   * Enable text-to-speech if specified by book config, or if this is an
   * plain html book, or if this is a standalone exercise
   */
  if (settings.NARRATION_ENABLED === false) {
    JSAV_OPTIONS.narration.enabled = false;
  }
  else {
    JSAV_OPTIONS.narration.enabled = true;
  }

  // Provide a warning if HTTPS is not used for communication with the backend
  // if (scoringServerEnabled() && !settings.SCORE_SERVER.match(/^https:/)) {
  //   console.warn('Score server communication should use HTTPS');
  // }
  $(document).ready(function() {
    // Ensure moduleName has been initialized
    // IMPORTANT: Might have to be initialized here because
    // ODSA.SETTINGS.MODULE_NAME is contained within the HTML of modules pages
    moduleName = settings.MODULE_NAME;

    // set contact us link; make it a little harder for spambots to scrape the link
    var a = "to:opendsa";
    var b = "cs.vt.edu";
    var c = "%40"
    var d = "mail"
    $("#contact_us").attr("href", d + a + c + b)
      .on("click", function() {
        // makes link work in an iframe
        window.top.location = $(this).prop("href");
        return false;
      });

    // Make sure localStorage is enabled
    var localStorageEnabled = function() {
      var enabled, uid = +new Date();
      try {
        localStorage[uid] = uid;
        enabled = (localStorage[uid] === uid);
        localStorage.removeItem(uid);
        return enabled;
      } catch (e) {
        return false;
      }
    };

    if (!localStorageEnabled) {
      if (jQuery) {
        warn("You must enable DOM storage in your browser.", false);
      }
      return;
    }

    // Add buttonLogger to all buttons on the page
    $(':button').each(function(index, item) {
      // Don't attach handler to JSAV managed controls in order to prevent double logging
      if (!isJSAVControl(item)) {
        $(item).click(buttonLogger);
      }
    });

    // Add linkLogger to all links on the page
    $('a').each(function(index, item) {
      // Don't attach handler to JSAV managed controls in order to prevent double logging
      if (!isJSAVControl(item) && $(item).attr("id") !== "logon" && $(item).attr("class") !== "close") {
        $(item).click(linkLogger);
      }
    });
  });

  //conver all the RST formated glossaries inside a string into glossary links
  //will direct the link to the local glossary module if ODSA.TP is undefined
  //or will direct the link to the corresponding canvas assignment if ODSA.TP is defined
  function parseGlossaries(msg){
    //ODSA.TP will be definded when running on a lti environment
    if(ODSA.TP){
      //get lti config data from server
      var json_url = $('script[src*="/config.js"]')[0].src.replace("html/_static/config.js","lti_html/lti_config.json");
      var json_data;
      $.ajax({
        url: json_url,
        dataType: "json",
        async: false,
        success: function(data) {
          json_data = data;
        }
      });
    }

    var parsedMsg = msg;
    var glossaries = [...msg.matchAll(/:term:`(.*?)`/g)];
    for(var i = 0 ; i < glossaries.length ; i++){
      var parsedGlossary  = glossaries[i][1].match(/\<([^>]+)\>/);
      var refGlossary = "";;
      var displayGlossary = "";
      if(parsedGlossary){
        refGlossary = parsedGlossary[1];
        displayGlossary = glossaries[i][1].slice(0, parsedGlossary.index - 1);
      }
      else{
        refGlossary = glossaries[i][1];
        displayGlossary = glossaries[i][1];
      }

      if (!ODSA.TP){
        //local support
        parsedMsg = parsedMsg.replace(glossaries[i][0], "<a class=\"reference internal\" href=\"Glossary.html#term-" +
        refGlossary.replace(" ", "-") + "\" target=\"_blank\"><em class=\"xref std std-term\">" + displayGlossary + "</em></a>")
      }
      else if (!json_data){
        //if couldn't retrive the lti configuration file
        console.error("GLossary parser failed to access lti configuration file! Please check the post-processor!");
      }
      else if (!json_data["module_map"]["Glossary"]){
        //if user didn't add a Glossary module
        console.error("You must include a glossary module to use build the link!");
      }
      else {
        //canvas support
        var canvasID = ODSA.TP.toParams.launch_params.custom_canvas_course_id;
        var glossaryPageID = json_data["module_map"]["Glossary"]["module_item_id"];
        var canvasGlossaryPageLink = "https://canvas.instructure.com/courses/" + canvasID + "/modules/items/" + glossaryPageID;
        parsedMsg = parsedMsg.replace(glossaries[i][0], "<a class=\"reference internal\" href=\"" + canvasGlossaryPageLink + "#term-" +
        refGlossary.replace(" ", "-") + "\" target=\"_blank\"><em class=\"xref std std-term\">" + displayGlossary + "</em></a>");
      }
    }
    return parsedMsg;
  }

  //override JSAV's umsg function to apply the term parser globally
  //need this to keep running so it must be in odsaMOD or odsaUtils
  JSAV.prototype.constructor.ext.umsg = function(msg, options) {
    this._msg.umsg(parseGlossaries(msg), options);
  }

  //*****************************************************************************
  //***********            Creates global ODSA.UTILS object           ***********
  //*****************************************************************************

  // Add publically available functions to a globally accessible ODSA.UTILS object
  var odsaUtils = {};
  odsaUtils.params = PARAMS;
  odsaUtils.langDict = langDict;
  odsaUtils.hasBook = hasBook;
  odsaUtils.isFullModule = isFullModule;
  odsaUtils.isStandaloneModule = isStandaloneModule;
  odsaUtils.getBookID = getBookID;
  odsaUtils.getSectionID = getSectionID;
  odsaUtils.getChapterModuleID = getChapterModuleID;
  odsaUtils.getInstModuleVersionId = getInstModuleVersionId;
  odsaUtils.getExerciseSettings = getExerciseSettings;
  odsaUtils.getInstCourseOfferingExerciseId = getInstCourseOfferingExerciseId;
  odsaUtils.getBookURL = getBookURL;
  odsaUtils.getUserEmail = getUserEmail;
  odsaUtils.scoringServerEnabled = scoringServerEnabled;
  odsaUtils.getJSON = getJSON;
  odsaUtils.permute = permute;
  odsaUtils.handleMsg = handleMsg;
  odsaUtils.loadConfig = loadConfig;
  odsaUtils.logUserAction = logUserAction;
  odsaUtils.logEvent = logEvent;
  odsaUtils.sendEventData = sendEventData;
  odsaUtils.roundPercent = roundPercent;
  odsaUtils.getType = getType;
  odsaUtils.parseURLParams = parseURLParams;
  odsaUtils.discardEvents = ["jsav-init", "jsav-recorded", "jsav-exercise-init", "jsav-exercise-model-init", "jsav-exercise-model-recorded"];
  odsaUtils.ssEvents = ['jsav-forward', 'jsav-backward', 'jsav-begin', 'jsav-end', 'jsav-exercise-model-forward', 'jsav-exercise-model-backward', 'jsav-exercise-model-begin', 'jsav-exercise-model-end', 'jsav-narration-on', 'jsav-narration-off'];
  odsaUtils.parseGlossaries = parseGlossaries;
  window.ODSA.UTILS = odsaUtils;

}(jQuery));
