let WebSocketClient = require('ws');
const fs = require('fs');
const colors = require("colors")
const EventEmitter = require('events');


class cjs extends EventEmitter {
	constructor(options = {}) {
		let cjs = this
		cjs.drawing = false

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
		cjs.ws.on("message", function(msg) {
			cjs.emit("message", msg)
			switch (msg.readUInt8(0)) {
				case 0:
					break
				case 1:
					break
				case 4:
					cjs.position.x = msg.readUInt16LE(1)
					cjs.position.y = msg.readUInt16LE(3)
					cjs.level++
					cjs.emit("level")
					break
				case 5:
					cjs.position.x = msg.readUInt16LE(1)
					cjs.position.y = msg.readUInt16LE(3)
					cjs.emit("cheats")
					break
			}
		})
		cjs.ws.on("open", function() {
			cjs.emit("open")
		})
		cjs.ws.on("error", function(err) {
			cjs.emit("error", error)
		})
		cjs.ws.on("connecting", function() {
			cjs.emit("connecting")
		})
		cjs.ws.on("closing", function() {
			cjs.emit("closing")
		})
		
		cjs.level = 0;
		cjs.position = {
			x: 0,
			y: 0
		}

		cjs.draw = function(x1 = cjs.position.x, y1 = cjs.position.y, x2 = cjs.position.x, y2 = cjs.position.y) {
			if (cjs.ws.readyState == 1) {
				let array = new ArrayBuffer(9);
				let dv = new DataView(array);
				dv.setUint8(0, 3);
				dv.setUint16(1, x1, true);
				dv.setUint16(3, y1, true);
				dv.setUint16(5, x2, true);
				dv.setUint16(7, y2, true);
				cjs.ws.send(array);
				cjs.position.y = y2;
				cjs.position.x = x2;
			}
		}
		cjs.move = function(x = cjs.position.x, y = cjs.position.y) {
			if (cjs.ws.readyState == 1) {
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
		}

		cjs.click = function(x = cjs.position.x, y = cjs.position.y) {
			if (cjs.ws.readyState == 1) {
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
		cjs.drawArray = function(array, x = cjs.position.x, y = cjs.position.y, scale = 1, timeout = 70) {
			let i = 0;

			function func() {
				cjs.draw(x + array[i][1] * scale, y + array[i][0] * scale, x + array[i][3] * scale, y + array[i][2] * scale)
				i++
				if (i < array.length) setTimeout(func, timeout)
			}
			func()
		}
		cjs.drawWord = function(str, x = cjs.position.x, y = cjs.position.y, fontSize = 2, kerning = 3, timeout = 250) {
			str = str.trim()
			if (str == undefined || str.length <= 0 || cjs.drawing == true) return;

			let i = 0;
			cjs.drawing = true;

			function func() {
				let letter = alphabet[str.toLowerCase().charCodeAt(i)] || alphabet[63] || []
				for (let line of letter) {
					let x1 = x + (line[1] + kerning * i) * fontSize;
					let y1 = y + line[0] * fontSize;
					let x2 = x + (line[3] + kerning * i) * fontSize;
					let y2 = y + line[2] * fontSize;
					cjs.draw(x1, y1, x2, y2)
				}
				i++
				if (str.charCodeAt(i)) {
					setTimeout(func, timeout)
				} else {
					cjs.drawing = false;
				}
			}
			func()
		}

	}

}

module.exports = {
	cjs
}