(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(["serialport"], factory);
    } else {
        // Node, CommonJS-like
        module.exports = factory(require("serialport"));
    } 
}(this, function (SerialPort) {
    NodeSerialCommunicator = function(params) {
        var self = this;

        if(typeof params !== "undefined" && 
                params !== null && 
                typeof params.serial === "object") {
            this.serial = params.serial;
        }
        else if(typeof params !== "undefined" &&
                params !== null &&
                typeof params.path === "string") {
            this.serial = new SerialPort.SerialPort(params.path,{baudRate: 115200}, false);
        } else {
            throw new Error("Must either specify a path or a constructed serial port");
        }

        this.isConnecting = false;
        this.hasAttached = false;
        this.disconnectImmediately = false;
        this.disconnectCb = function() {};

        this.dataReceivedCallback = function(bytes) {

        };
        this.errorCallback = function(data) {

        };
        this.readCallback = function(buff) {
            self.dataReceivedCallback(new Uint8Array(buff));
        };
    };

    NodeSerialCommunicator.prototype = {
        attachReadWrite: function() {
            var self = this;
            if(!self.hasAttached) {
                self.hasAttached = true;
                self.serial.on('data',self.readCallback);
            }
        },

        connect: function(cb) {
            var self = this;
            if(!self.isConnecting && !self.isConnected()) {
                self.isConnecting = true;
                self.serial.open(function(err) {
                        self.isConnecting = false;
                        self.attachReadWrite();

                        if(typeof cb === "function") {
                            cb(err);
                        }

                        if(self.disconnectImmediately) {
                            self.disconnectUnsafe();
                        }
                });
            }
        },

        flush: function(cb) {
            var self = this;
            if(self.isConnected()) {
                self.serial.flush(function(result) {
                    if(typeof cb ==="function") {
                        cb(result);
                    }
                });
            } else {
                throw new Error("Can't flush when not connected");
            }
        }, 

        isConnected: function() {
            var self = this;
            return self.serial.isOpen();
        },
 
        disconnectUnsafe: function() {
            var self = this;
            if(self.isConnecting) {
                throw "Connection still in the process of being established";
            }
            if(self.isConnected()) {
                self.serial.close(function(result) {
                    if(typeof self.disconnectCb === "function") {
                        self.disconnectCb(result);
                    }
                });
            }
        },

        /**
         * This usage of disconnectImmediately may not be necessary depending on
         * how race conditions are handled in node serialport
         */
        disconnect: function(cb) {
            var self = this;
            self.disconnectImmediately = true;
            if(typeof cb === "function") {
                self.disconnectCb = cb;
            }
            if(!self.isConnecting && self.isConnected()) {
                self.disconnectUnsafe();
            }
        },

        send: function(buffer) {
            var self = this;
            self.serial.write(new Buffer(buffer),function(err) {
                if(err) {
                    if(typeof self.errorCallback === 'function') {
                        var data = {buffer: buffer, nodeError: err};
                        self.errorCallback(data);
                    }
                }
            });
        },

        setDataCallback: function(cb) {
            var self = this;
            self.dataReceivedCallback = cb;
        },

        setErrorCallback: function(cb) {
            var self = this;
            self.errorCallback = cb;
        },
    };

    return NodeSerialCommunicator;
}));
