Wrapper for using a node serial port as a communicator
for Tappy devices.

## Installation
NPM
```
npm install @taptrack/tappy-nodeserialcommunicator
```

## Usage
Note that this wrapper is not intended to be used directly, rather
it is to be used to back a Tappy object in order to provide an 
abstraction from the underlying communication method.

```javascript
var NodeSerialCommunicator = require("@taptrack/tappy-nodeserialcommunicator");
var Tappy = require("@taptrack/tappy");
var SystemFamily = require("@taptrack/tappy-systemfamily");

/**
 * If you want to use a different serial port driver that is
 * API compatible with serialport, you can pass an instance of it
 * using the serial param instead of path. If this is done, the 
 * serialport should be passed in in an unopened state
 */
var comm = new NodeSerialCommunicator({path: "/dev/ttyUSB0"});
var tappy = new Tappy({communicator: comm});

tappy.setMessageListener(function(msg) {
    console.log("Received Message:");
    console.log("Command Family: "+msg.getCommandFamily());
    console.log("Command Code: "+msg.getCommandCode().toString());
    console.log("Payload: "+msg.getPayload().toString()+"\n");
});

tappy.connect(function() {
    var cmd = new SystemFamily.Commands.Ping();
    tappy.sendMessage(cmd);
});
```
