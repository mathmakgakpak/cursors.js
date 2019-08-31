let WebSocketClient = require('ws');
const fs = require('fs');
const colors = require("colors")
const EventEmitter = require('events');


class cjs extends EventEmitter {
	constructor(options = {}) {
		super()
		let cjs = this
		cjs.drawing = false
		
		this.alphabet = {
			32: [],
			33:[[0,1,1.5,1],[2,1,2.5,1]],//!
			34:[[0,0.5,1,0.5],[0,1.25,1,1.25]],//"
			35:[[0.5,-0.25,0.5,2.3],[1.5,-0.25,1.5,2.3],[-0.25,0.5,2.3,0.5],[-0.25,1.5,2.3,1.5]],//#
			36:[[0,0,0,2],[1,0,1,2],[2,0,2,2],[0,0,1,0],[1,2,2,2],[-0.5,1,0,1],[2,1,2.5,1]],//$
			37:[[1,0,0,0],[0,0,0,1],[0,1,2,1],[2,1,2,2],[2,2,1,2],[1,2,1,0],[2,0,0,2]],//% v1
			//37:[[0,0,0,0.75],[0,0.75,0.75,0.75],[0.75,0.75,0.75,0],[0.75,0,0,0],[2,0,0,2],[1.25,1.25,1.25,2],[1.25,2,2,2],[2,2,2,1.25],[2,1.25,1.25,1.25]],//% v2
			//37:[[1,0.5,0.5,0],[0.5,0,0,0.5],[0,0.5,0.5,1],[0.5,1,1,0.5],[2,0,0,2],[2,1.5,1.5,1],[1.5,1,1,1.5],[1,1.5,1.5,2],[1.5,2,2,1.5]],//% v3
			38:[[0.5,1,0,1],[0,1,0,0],[0,0,2,0],[2,0,2,0.5],[2,0.5,1,1.5],[1,0,1,0.5],[1,0.5,2,1.5]],//&
			39:[[0,0.5,1,0.5]], // '
			40:[[0,2,0.5,1],[0.5,1,1.5,1],[1.5,1,2,2]],//(
			41:[[0,0,0.5,1],[0.5,1,1.5,1],[1.5,1,2,0]],//)
			42:[[0.5,0,1.5,2],[1.5,0,0.5,2],[0,1,2,1]],//*
			43:[[0,1,2,1],[1,0,1,2]],//+
			44:[[2,0,3,0]],//,
			45:[[0.6,0.3,0.6,1.7]],//-
			46:[[1.5,0,2,0]],//.
			47:[[2,0.4,0,1.6]],//  /
			48:[[2,0,0,0],[0,0,0,2],[0,2,2,2],[2,2,2,0],[2,0,0,2]],//0
			49:[[0,1,2,1],[1,0,0,1],[2,0,2,2]],//1
			50:[[0,0,0,2],[0,2,1,2],[1,2,1,0],[1,0,2,0],[2,0,2,2]],//2
			51:[[0,0,0,2],[0,2,2,2],[2,2,2,0],[1,0,1,2]],
			52:[[0,0,1,0],[1,0,1,2],[0,2,2,2]],
			53:[[0,2,0,0],[0,0,1,0],[1,0,1,2],[1,2,2,2],[2,2,2,0]],
			54:[[0,2,0,0],[0,0,2,0],[2,0,2,2],[2,2,1,2],[1,2,1,0]],
			55:[[0,0,0,2],[0,2,2,0]],
			56:[[0,0,0,2],[0,2,2,2],[2,2,2,0],[2,0,0,0],[1,0,1,2]],
			57:[[0,0,1,0],[1,0,1,2],[0,2,2,2],[0,0,0,2],[2,0,2,2]],//9
			58:[[0,1,0.5,1],[1.5,1,2,1]],//:
			59:[[0,1,0.5,1],[2,1,3,1]],//;
			60:[[0,2,1,0],[1,0,2,2]],//<
			61:[[0.5,0,0.5,2],[1.5,0,1.5,2]],//=
			62:[[0,0,1,2],[1,2,2,0]],//>
			63:[[1,0,0,0],[0,0,0,2],[0,2,1,2],[1,2,1,1],[1,1,1.5,1],[2,1,2.5,1]  ],//?
			64:[[2.5,2,2.5,0],[2.5,0,-0.5,0],[-0.5,0,-0.5,2],[-0.5,2,1.5,2],[1.5,2,1.5,1],[1.5,1,0.5,1],[0.5,1,0.5,2]],//@
			91:[[0,1.5,0,0.5],[0,0.5,2,0.5],[2,0.5,2,1.5]],// [
			92:[[0,0.4,2,1.6]],// backslash
			93:[[0,0.5,0,1.5],[0,1.5,2,1.5],[2,1.5,2,0.5]],// ]
			94:[[1.5,0,0,1],[0,1,1.5,2]],//^
			95:[[2,0,2,2] ],//_
			96:[[0,0.5,1,0.5]], // ` display same as 39
			97:[[2,0,0,0],[0,2,0,0],[0,2,2,2],[1,0,1,2]],//a
			98:[[2,0,0,0],[0,0,0,1],[1,0,1,1],[2,0,2,1],[0,1,0.5,2],[0.5,2,1,1],[1,1,1.5,2],[1.5,2,2,1]],//b
			99:[[2,2,2,0],[2,0,0,0],[0,0,0,2]],//c
			100:[[2,0,0,0],[0,0,0,1],[0,1,1,2],[1,2,2,1],[2,1,2,0]],
			101:[[2,2,2,0],[2,0,0,0],[0,0,0,2],[1,0,1,2]],
			102:[[2,0,0,0],[0,0,0,2],[1,0,1,2]],
			103:[[1,1,1,2],[1,2,2,2],[2,2,2,0],[2,0,0,0],[0,0,0,2]],
			104:[[0,0,2,0],[0,2,2,2],[1,0,1,2]],
			105:[[0,0,0,2],[0,1,2,1],[2,0,2,2]],
			//106:[[0,0,0,2],[0,1,2,1],[2,0,2,1]], //j v1
			106:[[1.5,0,2,0],[2,0,2,1.5],[0,1.5,2,1.5],[0,0.85,0,2.25]], //j v2
			107:[[0,0,2,0],[1,0,0,2],[1,0,2,2]],
			108:[[0,0,2,0],[2,0,2,2]],
			109:[[0,0,2,0],[0,0,2,1],[2,1,0,2],[0,2,2,2]],
			110:[[0,0,2,0],[0,0,2,2],[0,2,2,2]],
			111:[[2,0,0,0],[0,0,0,2],[0,2,2,2],[2,2,2,0]],
			112:[[2,0,0,0],[0,0,0,2],[0,2,1,2],[1,2,1,0]],
			113:[[2,0,0,0],[0,0,0,2],[0,2,2,2],[2,2,2,0],[1,1,2,2]],
			114:[[2,0,0,0],[0,0,0,2],[0,2,1,2],[1,2,1,0],[1,1,2,2]],
			115:[[0,0,0,2],[1,0,1,2],[2,0,2,2],[0,0,1,0],[1,2,2,2]],
			116:[[0,0,0,2],[0,1,2,1]],
			117:[[0,0,2,0],[0,2,2,2],[2,0,2,2]],
			118:[[0,0,2,1],[0,2,2,1]],
			119:[[0,0,2,0],[0,2,2,2],[2,0,1,1],[2,2,1,1]],
			120:[[0,0,2,2],[2,0,0,2]],
			121:[[0,0,1,1],[0,2,1,1],[2,1,1,1]],
			122:[[0,0,0,2],[0,2,2,0],[2,0,2,2]],//z
			123:[[0,1.5,0,0.5],[0,0.5,0.5,0.5],[0.5,0.5,1,0],[1,0,1.5,0.5],[1.5,0.5,2,0.5],[2,0.5,2,1.5]],// {
			124:[[0,1,2,1]],// |
			125:[[0,0.5,0,1.5],[0,1.5,0.5,1.5],[0.5,1.5,1,2],[1,2,1.5,1.5],[1.5,1.5,2,1.5],[2,1.5,2,0.5]],// }
			126:[[0.5,0,0,0.75],[0,0.75,0.5,1.5],[0.5,1.5,0,2.25]],// ~
		};

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
				let letter = this.alphabet[str.toLowerCase().charCodeAt(i)] || this.alphabet[63] || []
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