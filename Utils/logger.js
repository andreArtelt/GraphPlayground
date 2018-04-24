"use strict";

var logger = logger || {};

const logger_LEVELS = {ALL: 0, WARNINGS: 1, EXCEPTIONS: 2};

logger.level = logger_LEVELS.ALL;

logger.info = function(data, stack) {
    if(logger.level == logger_LEVELS.ALL) {
        stack = stack == undefined ? "" : stack;
        console.log(`%c ${new Date().toLocaleString()}\n ${JSON.stringify(data)}\n ${stack}`, "color: green");
    }
};

logger.warning = function(data, stack) {
    if(logger.level == logger_LEVELS.ALL || logger.level == logger_LEVELS.WARNINGS) {
        stack = stack == undefined ? "" : stack;
        console.log(`%c ${new Date().toLocaleString()}\n ${JSON.stringify(data)}\n ${stack}`, "color: orange");
    }
};

logger.exception = function(data) {
    console.log(`%c ${new Date().toLocaleString()}\n ${data}\n ${data.stack}`, "color: red");

    alert(data);
};