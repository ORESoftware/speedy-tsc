"use strict";
var ts = require("typescript");
var util = require("util");
function init(options) {
    console.log(' => Compiler options to be used => ', util.inspect(options));
    return function compile(fileNames, cb) {
        console.log('filenames to be transpiled => ', fileNames);
        var program = ts.createProgram(fileNames, options);
        var emitResult = program.emit();
        var allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
        allDiagnostics.forEach(function (diagnostic) {
            var _a = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start), line = _a.line, character = _a.character;
            var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
            console.log(diagnostic.file.fileName + " (" + (line + 1) + "," + (character + 1) + "): " + message);
        });
        var exitCode = emitResult.emitSkipped ? 1 : 0;
        console.log("Process exiting with code '" + exitCode + "'.");
        cb(null, {
            code: exitCode
        });
    };
}
module.exports = init;
