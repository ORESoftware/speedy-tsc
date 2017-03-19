"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ijson = require("siamese");
var init = require('./index');
var Server = require('socket.io');
var io = new Server(3981, {});
var clients = [];
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
            var compileFiles = init(parsed);
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
