import * as ts from 'typescript';
import * as path from 'path';
import * as ijson from 'siamese';

const init = require('./index');
const Server = require('socket.io');
const io = new Server(3981, {});


const clients = [];

function getCount() {
  return ' => connection count:' + clients.length;
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

          compileFiles(parsed, function (err) {

            if (err) {
              socket.emit('tsc-request-error', {
                error: err.stack || err
              });
            }
            else {
              socket.emit('tsc-request-complete', {
                files: parsed
              });
            }

          });

        });
      });

    }, function (err) {

      socket.emit('tsc-options-error', {
        error: err.stack || err
      });
    });


  });

});
