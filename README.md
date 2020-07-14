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


### Notes
As of version 2.0.0, this is now based on serialport version 9.0.0, which has a slightly different API than 
version 3.1.2 that was previously used. The primary change that will affect custom serial ports written used
with this communicator is that isOpen is now a boolean value on the serial port object instead of a method.
