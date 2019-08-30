var WebSocketClient = require('ws');
const fs = require('fs');
const colors = require("colors")

class cjs {
	constructor(options = {}) {
		let cjs = this

		cjs.ws = new WebSocketClient(options.ws || "ws://159.65.78.102:2828", {
			headers: {
				'Origin': options.origin || "http://cursors.io"
			},
			agent: options.agent || undefined
		})

		cjs.enableConsoleControl = function() {
			let stdin = process.openStdin()
			stdin.on("data", function(d) {
				let msg = d.toString().trim();

				try {
					return console.log(String(eval(msg)))
				} catch (e) {
					console.log('[ERROR]:' + e.name + ":" + e.message + "\n" + e.stack)
				}

			})
		}
		cjs.ws.on("message",function(msg){


					switch(msg.readUInt8(0)) {
						case 0:
						break
						case 1:
						break
						case 4:
						cjs.position.x = msg.readUInt16LE(1)
						cjs.position.y = msg.readUInt16LE(3)
						break
						case 5:
						cjs.position.x = msg.readUInt16LE(1)
						cjs.position.y = msg.readUInt16LE(3)
						break
					}
})
		cjs.position = {
			x: 0,
			y: 0
		}

		cjs.draw = function(x1, y1, x2, y2) {
			let array = new ArrayBuffer(9);
			let dv = new DataView(array);
			if(!x1) x1 = cjs.position.x
			if(!y1) y1 = cjs.position.y
			if(!x2) x2 = cjs.position.x
			if(!y2) y2 = cjs.position.y
			dv.setUint8(0, 3);
			dv.setUint16(1, x1, true);
			dv.setUint16(3, y1, true);
			dv.setUint16(5, x2, true);
			dv.setUint16(7, y2, true);
			cjs.ws.send(array);
			cjs.position.y = y2;
			cjs.position.x = x2;
		}
		cjs.move = function(x, y) {
			if(!x) x = cjs.position.x
			if(!y) x = cjs.position.y
			let array = new ArrayBuffer(9);
			let dv = new DataView(array);
			dv.setUint8(0, 1);
			dv.setUint16(1, x, true);
			dv.setUint16(3, y, true);
			dv.setUint32(5, -1, true);
			cjs.ws.send(array);
			cjs.position.x = x;
			cjs.position.y = y;
		}
		cjs.click = function(x, y) {
			if(!x) x = cjs.position.x
			if(!y) x = cjs.position.y
			let array = new ArrayBuffer(9);
			let dv = new DataView(array);
			dv.setUint8(0, 2);
			dv.setUint16(1, x, true);
			dv.setUint16(3, y, true);
			dv.setUint32(5, -1, true);
			cjs.ws.send(array);
			cjs.position.x = x;
			cjs.position.y = y;
		}

	}

}

module.exports = {
	cjs
}