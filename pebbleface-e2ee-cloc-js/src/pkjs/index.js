var Clay = require('@rebble/clay');
var clayConfig = require('./config');
var customClay = require('./custom-clay');
var clay = new Clay(clayConfig, customClay, { autoHandleEvents: true });

const moddableProxy = require("@moddable/pebbleproxy");
Pebble.addEventListener('ready', moddableProxy.readyReceived);
Pebble.addEventListener('appmessage', moddableProxy.appMessageReceived);