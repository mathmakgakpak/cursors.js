const cursorsjs = require("cursorsjs");

const cjs = new cursorsjs.cjs({ws: "ws://159.65.78.102:2828", origin: "http://cursors.io"})


cjs.on("open", function(){
	console.log("Connected")
	cjs.enableConsoleControl()
	cjs.move(300, 175) // first level 
})
cjs.on("close",  function(){
	console.log("Disconnected")
})
