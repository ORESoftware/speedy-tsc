import * as ts from 'typescript';
import * as path from 'path';
import * as ijson from 'siamese';

const Server = require('socket.io');
const io = new Server(3980, {});


function init(options: ts.CompilerOptions): Function {

  return function compile(fileNames: string[], cb: Function): void {

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


const clients = [];

function getCount() {
  return ' => connection count:' + clients.length
}

io.on('connection', function (socket) {

  clients.push(socket);
  console.log(' => new dev server connection! ' + getCount());

  socket.on('disconnect', function () {

    console.log('dev server user disconnected ' + getCount());
    clients.splice(clients.indexOf(socket), 1);

  });

  socket.on('tsc-options', function (opts) {

    ijson.parse(opts).then(function (parsed) {

      const compileFiles = init(parsed);

      socket.emit('tsc-options-received');

      socket.on('tsc-request', function (files) {

        ijson.parse(files).then(function (parsed) {


        });


      });

    }, function (err) {

      socket.emit('tsc-options-error', {
        error: err.stack || err
      });
    });


  });

});


compile(process.argv.slice(2), {
  noEmitOnError: true, noImplicitAny: true,
  target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS
});