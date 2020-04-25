const cursorsjs = require("cursors-js");

const cjs = new cursorsjs.Client({
  ws: "ws://159.65.78.102:2828",
  origin: "http://cursors.io",
	controller: true,
	reconnect: true,
	recconectTimeout: 5000
})


cjs.on("gotId", async function() {
  console.log("Connected. Your id is " + cjs.id);
  await cjs.move(300, 175); // first level
})
cjs.on("close", function() {
  console.log("Disconnected");
})
