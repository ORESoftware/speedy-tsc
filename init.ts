import * as ts from 'typescript';
import * as path from 'path';
import * as ijson from 'siamese';
import * as util from 'util';
////////////////////////////////

/*

 options example

 {
 noEmitOnError: true,
 noImplicitAny: true,
 target: ts.ScriptTarget.ES5,
 module: ts.ModuleKind.CommonJS
 }

 */

////////////////////////////////

function init(options: ts.CompilerOptions): Function {

  console.log(' => Compiler options to be used => ', util.inspect(options));

  return function compile(fileNames: string[], cb: Function): void {

    console.log('filenames to be transpiled => ', fileNames);
    let program = ts.createProgram(fileNames, options);
    let emitResult = program.emit();

    let allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

    allDiagnostics.forEach(diagnostic => {
      let {line, character} = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    });

    let exitCode = emitResult.emitSkipped ? 1 : 0;
    console.log(`Process exiting with code '${exitCode}'.`);

    cb(null, {
      code: exitCode
    });

  }

}



export = init;