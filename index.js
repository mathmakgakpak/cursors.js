let WebSocketClient = require('ws');
const fs = require('fs');
const colors = require("colors")
const EventEmitter = require('events');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var zM = {}; //thx vnx for that
var visit = [];

zM.dos = function(dx, dy, items, gridSpace) {
  var gridX = 400 / gridSpace,
    gridY = 300 / gridSpace;
  var grid = [];
  visit = [];
  for (var i = 0; i < gridY; i++) {
    grid[i] = [];
    visit[i] = [];
    for (var j = 0; j < gridX; j++) grid[i][j] = 0, visit[i][j] = 0;
  }
  items.forEach(function(d) {
    if (d.type === 1) {
      for (var i = 0; i < d.h; i += gridSpace) {
        for (var j = 0; j < d.w; j += gridSpace) {
          grid[(d.y + i) / gridSpace][(d.x + j) / gridSpace] = 3;
        }
      }
    }
  });
  var bfs = [
      [dx, dy]
    ],
    bfs2 = [];
  while (bfs.length) {
    bfs.forEach(function(dat) {
      var x = dat[0],
        y = dat[1];
      if (grid[y][x] == 3) return;
      grid[y][x] = 3;
      for (var X = x + 1; X < gridX && !(grid[y][X] & 1); X++) {
        grid[y][X] |= 1;
        if (!visit[y][X]) {
          visit[y][X] = [x, y], bfs2.push([X, y]);
        }
      }
      for (var X = x - 1; X >= 0 && !(grid[y][X] & 1); X--) {
        grid[y][X] |= 1;
        if (!visit[y][X]) {
          visit[y][X] = [x, y], bfs2.push([X, y]);
        }
      }
      for (var Y = y + 1; Y < gridY && !(grid[Y][x] & 2); Y++) {
        grid[Y][x] |= 2;
        if (!visit[Y][x]) {
          visit[Y][x] = [x, y], bfs2.push([x, Y]);
        }
      }
      for (var Y = y - 1; Y >= 0 && !(grid[Y][x] & 2); Y--) {
        grid[Y][x] |= 2;
        if (!visit[Y][x]) {
          visit[Y][x] = [x, y], bfs2.push([x, Y]);
        }
      }
    });
    bfs = bfs2;
    bfs2 = [];
  }
}

zM.path = function(ox, oy, dx, dy, items, grid) {

  var rdx = dx,
    rdy = dy;
  ox /= grid;
  oy /= grid;
  dx /= grid;
  dy /= grid;

  ox |= 0;
  oy |= 0;
  dx |= 0;
  dy |= 0;

  var mov = [];
  if (!(ox == dx && oy == dy)) {
    zM.dos(ox, oy, items, grid);
    var xy2 = [dx, dy];
    while (visit[xy2[1]][xy2[0]]) {
      mov.push(xy2);
      xy2 = visit[xy2[1]][xy2[0]];
    }

    mov.reverse();
  }

  for (var i = 0; i < mov.length; ++i) {
    mov[i][0] *= grid;
    mov[i][0] += grid / 2;
    mov[i][1] *= grid;
    mov[i][1] += grid / 2;
  }
  mov.push([rdx, rdy]);
  return mov;
}
zM.parse = {
  /**
   * Returns an array as [local, players, offset]
   */
  cursors: function(dat, offset) {
    var local = dat.readUInt16LE(offset, true);

    offset += 2;

    var players = [];
    //console.log(local)
    for (var i = 0; i < local; ++i) {
      players.push({
        id: dat.readUInt32LE(offset, true),
        x: dat.readUInt16LE(offset + 4, true),
        y: dat.readUInt16LE(offset + 6, true),
      });
      offset += 8;
    }

    return [local, players, offset];
  },

  /**
   * Returns an array as [clicks, offset]
   */
  clicks: function(dat, offset) {
    var count = dat.readUInt16LE(offset, true);
    var clicks = [];

    offset += 2;
    for (var i = 0; i < count; ++i) {
      clicks.push({
        x: dat.readUInt16LE(offset, true),
        y: dat.readUInt16LE(offset + 2, true),
        time: Date.now()
      });
      offset += 4;
    }

    return [clicks, offset];
  },

  /**
   * Returns an array as [clicks, offset]
   */
  drawing: function(dat, offset) {
    var count = dat.readUInt16LE(offset, true);
    var drawings = [];

    offset += 2;
    for (var i = 0; i < count; ++i) {
      drawings.push({
        x: dat.readUInt16LE(offset, true),
        y: dat.readUInt16LE(offset + 2, true),
        x2: dat.readUInt16LE(offset + 4, true),
        y2: dat.readUInt16LE(offset + 6, true),
        time: Date.now()
      });
      offset += 8;
    }

    return [drawings, offset];
  },

  /**
   * Returns an array as [ids, offset]
   */
  remove: function(dat, offset) {
    var count = dat.readUInt16LE(offset, true);
    var ids = [];

    offset += 2;
    for (var i = 0; i < count; ++i) {
      ids.push(dat.readUInt32LE(offset, true));
      offset += 4;
    }

    return [ids, offset];
  },

  /**
   * Parses objdata (string) and outputs as objects.
   */
  objData: function(objdata) {
    var obj = objdata;
    var nObj = [];

    for (var i = 0; i < obj.length; ++i) {
      var nO = {};
      obj[i] = obj[i].split(/\.+/g);
      nO.id = parseInt(obj[i].shift());
      var type = obj[i].shift();
      switch (type) {
        case '0':
          nO.type = 0;
          nO.x = parseInt(obj[i].shift());
          nO.y = parseInt(obj[i].shift());
          nO.size = parseInt(obj[i].shift());
          nO.isCentered = obj[i].shift() === 'false' ? false : true;

          nO.content = obj[i].join('');
          break;
        case '1':
          nO.type = 1;
          nO.x = parseInt(obj[i].shift());
          nO.y = parseInt(obj[i].shift());
          nO.w = parseInt(obj[i].shift());
          nO.h = parseInt(obj[i].shift());
          nO.color = obj[i].shift();
          break;
        case '2':
          nO.type = 2;
          nO.x = parseInt(obj[i].shift());
          nO.y = parseInt(obj[i].shift());
          nO.w = parseInt(obj[i].shift());
          nO.h = parseInt(obj[i].shift());
          nO.isBad = obj[i].shift() === 'false' ? false : true;
          break;
        case '3':
          nO.type = 3;
          nO.x = parseInt(obj[i].shift());
          nO.y = parseInt(obj[i].shift());
          nO.w = parseInt(obj[i].shift());
          nO.h = parseInt(obj[i].shift());
          nO.count = parseInt(obj[i].shift());
          nO.color = obj[i].shift();
          break;
        case '4':
          nO.type = 4;
          nO.x = parseInt(obj[i].shift());
          nO.y = parseInt(obj[i].shift());
          nO.w = parseInt(obj[i].shift());
          nO.h = parseInt(obj[i].shift());
          nO.count = parseInt(obj[i].shift());
          nO.color = obj[i].shift();
          nO.lastClickAt = 0;
          break;
      }

      nObj.push(nO);
    }

    return nObj;
  },

  /**
   * Returns an array as [objdata, offset]
   * objdata is required to be further parsed with zM.parse.objData()
   */
  objects: function(dat, offset) {
    var count = dat.readUInt16LE(offset, true);
    var objdata = [];

    offset += 2;
    for (var i = 0; i < count; ++i) {
      var id = dat.readUInt32LE(offset, true);
      offset += 4;
      var type = dat.readUInt8(offset);
      var objdat = id + '.';
      ++offset;
      switch (type) {
        case 0:
          objdat += '0.';
          objdat += `${dat.readUInt16LE(offset, true)}.`;
          objdat += `${dat.readUInt16LE(offset+2, true)}.`;
          objdat += `${dat.readUInt8(offset+4)}.`;
          objdat += `${!!dat.readUInt8(offset+5)}.`;
          offset += 5;
          for (; 1;)
            if (dat.readUInt8(++offset) != 0) objdat += String.fromCharCode(dat.readUInt8(offset));
            else break;

          ++offset;
          break;
        case 1:
          objdat += '1.';
          objdat += `${dat.readUInt16LE(offset, true)}.`;
          objdat += `${dat.readUInt16LE(offset+2, true)}.`;
          objdat += `${dat.readUInt16LE(offset+4, true)}.`;
          objdat += `${dat.readUInt16LE(offset+6, true)}.`;
          var color = dat.readUInt32LE(offset + 8, true).toString(16);
          for (; color.length < 6;) color = '0' + color;
          objdat += '#' + color + '.';

          offset += 12;

          break;

        case 2:
          objdat += '2.';
          objdat += `${dat.readUInt16LE(offset, true)}.`;
          objdat += `${dat.readUInt16LE(offset+2, true)}.`;
          objdat += `${dat.readUInt16LE(offset+4, true)}.`;
          objdat += `${dat.readUInt16LE(offset+6, true)}.`;
          objdat += `${!!dat.readUInt8(offset+8)}.`;
          offset += 9;
          break;

        case 3:
          objdat += '3.';
          objdat += `${dat.readUInt16LE(offset, true)}.`;
          objdat += `${dat.readUInt16LE(offset+2, true)}.`;
          objdat += `${dat.readUInt16LE(offset+4, true)}.`;
          objdat += `${dat.readUInt16LE(offset+6, true)}.`;
          objdat += `${dat.readUInt16LE(offset+8, true)}.`;
          var color = dat.readUInt32LE(offset + 10, true).toString(16);
          for (; color.length < 6;) color = '0' + color;
          objdat += '#' + color + '.';

          offset += 14;
          break;

        case 4:
          objdat += '4.';
          objdat += `${dat.readUInt16LE(offset, true)}.`;
          objdat += `${dat.readUInt16LE(offset+2, true)}.`;
          objdat += `${dat.readUInt16LE(offset+4, true)}.`;
          objdat += `${dat.readUInt16LE(offset+6, true)}.`;
          objdat += `${dat.readUInt16LE(offset+8, true)}.`;
          var color = dat.readUInt32LE(offset + 10, true).toString(16);
          for (; color.length < 6;) color = '0' + color;
          objdat += '#' + color + '.';
          offset += 14;
          break;
      }
      objdata.push(objdat);
    }

    return [objdata, offset];
  }
}


class cjs extends EventEmitter {
  constructor(options = {}) {
    super()
    let cjs = this;
    cjs.drawing = false

    cjs.alphabet = {
      32: [],
      33: [
        [0, 1, 1.5, 1],
        [2, 1, 2.5, 1]
      ], //!
      34: [
        [0, 0.5, 1, 0.5],
        [0, 1.25, 1, 1.25]
      ], //"
      35: [
        [0.5, -0.25, 0.5, 2.3],
        [1.5, -0.25, 1.5, 2.3],
        [-0.25, 0.5, 2.3, 0.5],
        [-0.25, 1.5, 2.3, 1.5]
      ], //#
      36: [
        [0, 0, 0, 2],
        [1, 0, 1, 2],
        [2, 0, 2, 2],
        [0, 0, 1, 0],
        [1, 2, 2, 2],
        [-0.5, 1, 0, 1],
        [2, 1, 2.5, 1]
      ], //$
      37: [
        [1, 0, 0, 0],
        [0, 0, 0, 1],
        [0, 1, 2, 1],
        [2, 1, 2, 2],
        [2, 2, 1, 2],
        [1, 2, 1, 0],
        [2, 0, 0, 2]
      ], //% v1
      //37:[[0,0,0,0.75],[0,0.75,0.75,0.75],[0.75,0.75,0.75,0],[0.75,0,0,0],[2,0,0,2],[1.25,1.25,1.25,2],[1.25,2,2,2],[2,2,2,1.25],[2,1.25,1.25,1.25]],//% v2
      //37:[[1,0.5,0.5,0],[0.5,0,0,0.5],[0,0.5,0.5,1],[0.5,1,1,0.5],[2,0,0,2],[2,1.5,1.5,1],[1.5,1,1,1.5],[1,1.5,1.5,2],[1.5,2,2,1.5]],//% v3
      38: [
        [0.5, 1, 0, 1],
        [0, 1, 0, 0],
        [0, 0, 2, 0],
        [2, 0, 2, 0.5],
        [2, 0.5, 1, 1.5],
        [1, 0, 1, 0.5],
        [1, 0.5, 2, 1.5]
      ], //&
      39: [
        [0, 0.5, 1, 0.5]
      ], // '
      40: [
        [0, 2, 0.5, 1],
        [0.5, 1, 1.5, 1],
        [1.5, 1, 2, 2]
      ], //(
      41: [
        [0, 0, 0.5, 1],
        [0.5, 1, 1.5, 1],
        [1.5, 1, 2, 0]
      ], //)
      42: [
        [0.5, 0, 1.5, 2],
        [1.5, 0, 0.5, 2],
        [0, 1, 2, 1]
      ], //*
      43: [
        [0, 1, 2, 1],
        [1, 0, 1, 2]
      ], //+
      44: [
        [2, 0, 3, 0]
      ], //,
      45: [
        [0.6, 0.3, 0.6, 1.7]
      ], //-
      46: [
        [1.5, 0, 2, 0]
      ], //.
      47: [
        [2, 0.4, 0, 1.6]
      ], //  /
      48: [
        [2, 0, 0, 0],
        [0, 0, 0, 2],
        [0, 2, 2, 2],
        [2, 2, 2, 0],
        [2, 0, 0, 2]
      ], //0
      49: [
        [0, 1, 2, 1],
        [1, 0, 0, 1],
        [2, 0, 2, 2]
      ], //1
      50: [
        [0, 0, 0, 2],
        [0, 2, 1, 2],
        [1, 2, 1, 0],
        [1, 0, 2, 0],
        [2, 0, 2, 2]
      ], //2
      51: [
        [0, 0, 0, 2],
        [0, 2, 2, 2],
        [2, 2, 2, 0],
        [1, 0, 1, 2]
      ],
      52: [
        [0, 0, 1, 0],
        [1, 0, 1, 2],
        [0, 2, 2, 2]
      ],
      53: [
        [0, 2, 0, 0],
        [0, 0, 1, 0],
        [1, 0, 1, 2],
        [1, 2, 2, 2],
        [2, 2, 2, 0]
      ],
      54: [
        [0, 2, 0, 0],
        [0, 0, 2, 0],
        [2, 0, 2, 2],
        [2, 2, 1, 2],
        [1, 2, 1, 0]
      ],
      55: [
        [0, 0, 0, 2],
        [0, 2, 2, 0]
      ],
      56: [
        [0, 0, 0, 2],
        [0, 2, 2, 2],
        [2, 2, 2, 0],
        [2, 0, 0, 0],
        [1, 0, 1, 2]
      ],
      57: [
        [0, 0, 1, 0],
        [1, 0, 1, 2],
        [0, 2, 2, 2],
        [0, 0, 0, 2],
        [2, 0, 2, 2]
      ], //9
      58: [
        [0, 1, 0.5, 1],
        [1.5, 1, 2, 1]
      ], //:
      59: [
        [0, 1, 0.5, 1],
        [2, 1, 3, 1]
      ], //;
      60: [
        [0, 2, 1, 0],
        [1, 0, 2, 2]
      ], //<
      61: [
        [0.5, 0, 0.5, 2],
        [1.5, 0, 1.5, 2]
      ], //=
      62: [
        [0, 0, 1, 2],
        [1, 2, 2, 0]
      ], //>
      63: [
        [1, 0, 0, 0],
        [0, 0, 0, 2],
        [0, 2, 1, 2],
        [1, 2, 1, 1],
        [1, 1, 1.5, 1],
        [2, 1, 2.5, 1]
      ], //?
      64: [
        [2.5, 2, 2.5, 0],
        [2.5, 0, -0.5, 0],
        [-0.5, 0, -0.5, 2],
        [-0.5, 2, 1.5, 2],
        [1.5, 2, 1.5, 1],
        [1.5, 1, 0.5, 1],
        [0.5, 1, 0.5, 2]
      ], //@
      91: [
        [0, 1.5, 0, 0.5],
        [0, 0.5, 2, 0.5],
        [2, 0.5, 2, 1.5]
      ], // [
      92: [
        [0, 0.4, 2, 1.6]
      ], // backslash
      93: [
        [0, 0.5, 0, 1.5],
        [0, 1.5, 2, 1.5],
        [2, 1.5, 2, 0.5]
      ], // ]
      94: [
        [1.5, 0, 0, 1],
        [0, 1, 1.5, 2]
      ], //^
      95: [
        [2, 0, 2, 2]
      ], //_
      96: [
        [0, 0.5, 1, 0.5]
      ], // ` display same as 39
      97: [
        [2, 0, 0, 0],
        [0, 2, 0, 0],
        [0, 2, 2, 2],
        [1, 0, 1, 2]
      ], //a
      98: [
        [2, 0, 0, 0],
        [0, 0, 0, 1],
        [1, 0, 1, 1],
        [2, 0, 2, 1],
        [0, 1, 0.5, 2],
        [0.5, 2, 1, 1],
        [1, 1, 1.5, 2],
        [1.5, 2, 2, 1]
      ], //b
      99: [
        [2, 2, 2, 0],
        [2, 0, 0, 0],
        [0, 0, 0, 2]
      ], //c
      100: [
        [2, 0, 0, 0],
        [0, 0, 0, 1],
        [0, 1, 1, 2],
        [1, 2, 2, 1],
        [2, 1, 2, 0]
      ],
      101: [
        [2, 2, 2, 0],
        [2, 0, 0, 0],
        [0, 0, 0, 2],
        [1, 0, 1, 2]
      ],
      102: [
        [2, 0, 0, 0],
        [0, 0, 0, 2],
        [1, 0, 1, 2]
      ],
      103: [
        [1, 1, 1, 2],
        [1, 2, 2, 2],
        [2, 2, 2, 0],
        [2, 0, 0, 0],
        [0, 0, 0, 2]
      ],
      104: [
        [0, 0, 2, 0],
        [0, 2, 2, 2],
        [1, 0, 1, 2]
      ],
      105: [
        [0, 0, 0, 2],
        [0, 1, 2, 1],
        [2, 0, 2, 2]
      ],
      //106:[[0,0,0,2],[0,1,2,1],[2,0,2,1]], //j v1
      106: [
        [1.5, 0, 2, 0],
        [2, 0, 2, 1.5],
        [0, 1.5, 2, 1.5],
        [0, 0.85, 0, 2.25]
      ], //j v2
      107: [
        [0, 0, 2, 0],
        [1, 0, 0, 2],
        [1, 0, 2, 2]
      ],
      108: [
        [0, 0, 2, 0],
        [2, 0, 2, 2]
      ],
      109: [
        [0, 0, 2, 0],
        [0, 0, 2, 1],
        [2, 1, 0, 2],
        [0, 2, 2, 2]
      ],
      110: [
        [0, 0, 2, 0],
        [0, 0, 2, 2],
        [0, 2, 2, 2]
      ],
      111: [
        [2, 0, 0, 0],
        [0, 0, 0, 2],
        [0, 2, 2, 2],
        [2, 2, 2, 0]
      ],
      112: [
        [2, 0, 0, 0],
        [0, 0, 0, 2],
        [0, 2, 1, 2],
        [1, 2, 1, 0]
      ],
      113: [
        [2, 0, 0, 0],
        [0, 0, 0, 2],
        [0, 2, 2, 2],
        [2, 2, 2, 0],
        [1, 1, 2, 2]
      ],
      114: [
        [2, 0, 0, 0],
        [0, 0, 0, 2],
        [0, 2, 1, 2],
        [1, 2, 1, 0],
        [1, 1, 2, 2]
      ],
      115: [
        [0, 0, 0, 2],
        [1, 0, 1, 2],
        [2, 0, 2, 2],
        [0, 0, 1, 0],
        [1, 2, 2, 2]
      ],
      116: [
        [0, 0, 0, 2],
        [0, 1, 2, 1]
      ],
      117: [
        [0, 0, 2, 0],
        [0, 2, 2, 2],
        [2, 0, 2, 2]
      ],
      118: [
        [0, 0, 2, 1],
        [0, 2, 2, 1]
      ],
      119: [
        [0, 0, 2, 0],
        [0, 2, 2, 2],
        [2, 0, 1, 1],
        [2, 2, 1, 1]
      ],
      120: [
        [0, 0, 2, 2],
        [2, 0, 0, 2]
      ],
      121: [
        [0, 0, 1, 1],
        [0, 2, 1, 1],
        [2, 1, 1, 1]
      ],
      122: [
        [0, 0, 0, 2],
        [0, 2, 2, 0],
        [2, 0, 2, 2]
      ], //z
      123: [
        [0, 1.5, 0, 0.5],
        [0, 0.5, 0.5, 0.5],
        [0.5, 0.5, 1, 0],
        [1, 0, 1.5, 0.5],
        [1.5, 0.5, 2, 0.5],
        [2, 0.5, 2, 1.5]
      ], // {
      124: [
        [0, 1, 2, 1]
      ], // |
      125: [
        [0, 0.5, 0, 1.5],
        [0, 1.5, 0.5, 1.5],
        [0.5, 1.5, 1, 2],
        [1, 2, 1.5, 1.5],
        [1.5, 1.5, 2, 1.5],
        [2, 1.5, 2, 0.5]
      ], // }
      126: [
        [0.5, 0, 0, 0.75],
        [0, 0.75, 0.5, 1.5],
        [0.5, 1.5, 0, 2.25]
      ], // ~
    };

    cjs.ws = new WebSocketClient(options.ws || "ws://157.245.226.69:2828", {
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

          return console.log(JSON.stringify(eval(msg), undefined, 2)); //String(eval(msg))
        } catch (e) {
          console.log('[ERROR]:' + e.name + ":" + e.message + "\n" + e.stack)
        }

      })
    }
    if (!options.memorySaver) cjs.players = {};
    cjs.usersOnline = 0;
    cjs.id = 0;
    cjs.grid = 5;
    cjs.level = -1;
    cjs.levelObjects = [];
    cjs.prevLevels = [];
    if (!options.memorySaver) cjs.levelClicks = [];
    if (!options.memorySaver) cjs.levelDrawings = [];
    cjs.ws.on("message", function(msg) {
      cjs.emit("message", msg)
      var len = msg.length
      switch (msg.readUInt8(0)) {
        case 0: //get id
          cjs.id = msg.readUInt32LE(1, true)
          break
        case 1: //player moves draws and changes of map
          //players
          cjs.usersOnline = msg.readUInt32LE(len - 4, true);

          var out = zM.parse.cursors(msg, 1);
          var local = out.shift();
          var newPlayers = out.shift();
          var offset = out.shift();

          var replacementPlayers = {};
          if (!options.memorySaver)
            for (var i = 0; i < newPlayers.length; i++) {
              var player = newPlayers[i];
              var oldPlayer = cjs.players[player.id];
              var playerToReplace = {};
              var playerIsNew = !oldPlayer;
              var playerMoved;
              if (playerIsNew) {
                playerToReplace = player;

                playerToReplace.joinedLevel = Date.now();
                playerToReplace.oldX = player.x;
                playerToReplace.oldY = player.y;

                cjs.emit("newPlayer", playerToReplace) //its not know if he joined for real or just passed level before
              } else {
                playerToReplace = oldPlayer;

                playerToReplace.oldX = playerToReplace.x
                playerToReplace.oldY = playerToReplace.y

                playerToReplace.x = player.x
                playerToReplace.y = player.y
              }

              playerMoved = playerToReplace.x !== playerToReplace.oldX || playerToReplace.y !== playerToReplace.oldY;

              if (playerMoved) {
                cjs.emit("playerMoved", playerToReplace);
              }

              replacementPlayers[playerToReplace.id] = playerToReplace;
            }
          for (var i in cjs.players) {
            if (!replacementPlayers[i]) {
              cjs.emit("playerLeft", cjs.players[i]); //its not known if he left for real he can pass level too
            }
          }

          if (!options.memorySaver) cjs.players = replacementPlayers

          //clicks

          out = zM.parse.clicks(msg, offset);
          var clicks = out.shift();
          offset = out.shift();

          if (!options.memorySaver)
            while (clicks.length) { //better for bots i think
              var click = clicks.shift();
              cjs.levelClicks.push(click)
              cjs.emit("click", click)
            }

          out = zM.parse.remove(msg, offset);

          var objToRemove = out.shift();
          offset = out.shift();

          for (var i = 0; i < objToRemove.length; i++) {
            cjs.levelObjects.splice(cjs.levelObjects.findIndex(obj => obj.id === objToRemove[i]), 1)
          }


          out = zM.parse.objects(msg, offset);

          var objToAdd = out.shift();
          offset = out.shift();

          for (var i = 0; i < objToAdd.length; i++) {
            var index = cjs.levelObjects.findIndex(obj => obj.id === objToAdd[i].id);
            if (index === -1) {
              cjs.levelObjects.push(objToAdd[i])
            } else {
              cjs.levelObjects[index] = objToAdd[i]
            }
          }

          out = zM.parse.drawing(msg, offset)

          if (!options.memorySaver)
            for (var i = 0; i < out[0].length; i++) {
              var drawing = out[0];
              cjs.levelDrawings.push(drawing)
              cjs.emit("newDrawing", drawing)
            }



          //console.log(9 + (msg.readUInt16LE(1, true)) * 8)
          //console.log(getObjects(msg, 9 + (msg.readUInt16LE(1, true)-1) * 8))
          break
        case 4: //level change
          if (cjs.level === -1) cjs.level++
          if (!options.memorySaver) {
            cjs.players = {};
            cjs.drawings = [];
            cjs.levelClicks = [];
          }

          cjs.position.x = msg.readUInt16LE(1)
          cjs.position.y = msg.readUInt16LE(3)
          var objdata = zM.parse.objects(msg, 5);

          cjs.levelObjects = zM.parse.objData(objdata[0]);

          var grid = 100;
          for (var i = 0; i < cjs.levelObjects.length; ++i) {
            if (grid <= 1) {
              grid = 1;
              break;
            }
            if (cjs.levelObjects[i].type === 1)
              if (
                (cjs.levelObjects[i].x / grid | 0) != (cjs.levelObjects[i].x / grid) ||
                (cjs.levelObjects[i].y / grid | 0) != (cjs.levelObjects[i].y / grid) ||
                (cjs.levelObjects[i].w / grid | 0) != (cjs.levelObjects[i].w / grid) ||
                (cjs.levelObjects[i].h / grid | 0) != (cjs.levelObjects[i].h / grid)
              ) --grid, i = -1;
          }

          cjs.grid = grid; //pathFinder thing

          var compare = [];
          for (var i = 0; i < cjs.levelObjects.length; ++i) {
            var o = cjs.levelObjects[i];
            if (o.type === 0) {
              compare.push({
                x: o.x,
                y: o.y,
                size: o.size,
                content: o.content
              });
            } else if (o.type === 1) {
              if (o.color === '#000000') compare.push({
                x: o.x,
                y: o.y,
                w: o.w,
                h: o.h
              });
            } else if (o.type === 2) {
              compare.push({
                x: o.x,
                y: o.y,
                w: o.w,
                h: o.h,
                isBad: o.isBad
              });
            } else {
              compare.push({
                x: o.x,
                y: o.y,
                w: o.w,
                h: o.h,
                color: o.color
              });
            }
          }
          compare = JSON.stringify(compare);
          var i = cjs.prevLevels.indexOf(compare);
          if (i != -1) cjs.level = i;
          else ++cjs.level, cjs.prevLevels.push(compare);

          cjs.emit("level")
          break
        case 5: //trying to go through walls or an weird move
          cjs.position.x = msg.readUInt16LE(1)
          cjs.position.y = msg.readUInt16LE(3)
          cjs.emit("cheats")
          break
      }
    })
    cjs.ws.on("open", function() {
      cjs.emit("open")
    })
    cjs.ws.on("close", function(reason) {
      cjs.emit("close", reason)
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
    cjs.move = function(x = cjs.position.x, y = cjs.position.y, pathFinder = true, pathFinderTimeout = 5) {
      return new Promise(async function(resolve) {
        function move(x, y) {
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
        if (pathFinder) {
          var moves = zM.path(cjs.position.x, cjs.position.y, x, y, cjs.levelObjects, cjs.grid)
          for (var i = 0; i < moves.length; i++) {
            move(moves[i][0], moves[i][1]);
            await sleep(pathFinderTimeout)
          }
        } else {
          move(x, y)
        }
        resolve()
      })
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
  cjs.drawArray = async function(array, x = cjs.position.x, y = cjs.position.y, scale = 1, timeout = 70) {
    for (var i = 0; i < array.length; i++) {
      cjs.draw(x + array[i][1] * scale, y + array[i][0] * scale, x + array[i][3] * scale, y + array[i][2] * scale)
      await sleep(timeout)
    }
  }
  cjs.drawWord = function(str, x = cjs.position.x, y = cjs.position.y, fontSize = 2, kerning = 3, timeout = 250) {
    str = str.trim()
    if (str == undefined || str.length <= 0 || cjs.drawing == true) return;

    let i = 0;
    cjs.drawing = true;

    function func() {
      var scale = 1
      if (str.charAt(i) == str.charAt(i).toLowerCase()) scale /= 1.3;
      let letter = cjs.alphabet[str.toLowerCase().charCodeAt(i)] || cjs.alphabet[63] || []

      for (let line of letter) {
        let x1 = x + (line[1] * scale + kerning * i) * fontSize;
        let y1 = y + (line[0] * scale * fontSize);
        let x2 = x + (line[3] * scale + kerning * i) * fontSize;
        let y2 = y + (line[2] * scale * fontSize);
        cjs.draw(x1, y1, x2, y2)
      }
      i++
      if (str.charCodeAt(i)) {
        setTimeout(func, timeout)
      } else {
        cjs.drawing = false;
        cjs.move(x, y)
      }
    }
    func()
  }

}

}

module.exports = {
  cjs,
  path: zm.path
}
