const Promise = require('bluebird');
const async = Promise.promisifyAll(require('async'));
const merge = require('merge');

class ipc {

    constructor(connectionConfig){
        this.conCFG = connectionConfig;
        this.ipc = require('node-ipc');

        this.ipc.config = merge(connectionConfig, {
            id: require('os').hostname(),
            encoding: 'utf8',
            logInColor: true,
            retry: 500
        });

        this.serve = this.serve.bind(this);
        this.registerEvent = this.registerEvent.bind(this);
        this.registerFunction = this.registerFunction.bind(this);
    }

    serve() {
        const self = this;
        return new Promise((resolve) => {
            self.ipc.serve(function () {
                resolve();
            });
            self.ipc.server.start();
        });
    }

    registerEvent(name, Function){
        const self = this;
        self.ipc.server.on(name, function (data) {
            Function(data, self);
        });
    }

    registerFunction(name, Function){
        const self = this;
        self.ipc.server.on(name, function (data) {
            Function(data, self).then((Rdata) => {
                self.ipc.server.emit(data.responseID, Rdata);
            });
        });
    }
}