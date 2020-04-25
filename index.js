let WebSocketClient = require('ws');
const fs = require('fs');
const colors = require("colors")
const EventEmitter = require('events');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let zM = {}; //thx vnx for that
let visit = [];

zM.dos = function(dx, dy, items, gridSpace) {
  let gridX = 400 / gridSpace,
    gridY = 300 / gridSpace;
  let grid = [];
  visit = [];
  for (let i = 0; i < gridY; i++) {
    grid[i] = [];
    visit[i] = [];
    for (let j = 0; j < gridX; j++) grid[i][j] = 0, visit[i][j] = 0;
  }
  items.forEach(function(d) {
    if (d.type === 1) {
      for (let i = 0; i < d.h; i += gridSpace) {
        for (let j = 0; j < d.w; j += gridSpace) {
          grid[(d.y + i) / gridSpace][(d.x + j) / gridSpace] = 3;
        }
      }
    }
  });
  let bfs = [
      [dx, dy]
    ],
    bfs2 = [];
  while (bfs.length) {
    bfs.forEach(function(dat) {
      let x = dat[0],
        y = dat[1];
      if (grid[y][x] == 3) return;
      grid[y][x] = 3;
      for (let X = x + 1; X < gridX && !(grid[y][X] & 1); X++) {
        grid[y][X] |= 1;
        if (!visit[y][X]) {
          visit[y][X] = [x, y], bfs2.push([X, y]);
        }
      }
      for (let X = x - 1; X >= 0 && !(grid[y][X] & 1); X--) {
        grid[y][X] |= 1;
        if (!visit[y][X]) {
          visit[y][X] = [x, y], bfs2.push([X, y]);
        }
      }
      for (let Y = y + 1; Y < gridY && !(grid[Y][x] & 2); Y++) {
        grid[Y][x] |= 2;
        if (!visit[Y][x]) {
          visit[Y][x] = [x, y], bfs2.push([x, Y]);
        }
      }
      for (let Y = y - 1; Y >= 0 && !(grid[Y][x] & 2); Y--) {
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

  let rdx = dx,
    rdy = dy;
  ox /= grid;
  oy /= grid;
  dx /= grid;
  dy /= grid;

  ox |= 0;
  oy |= 0;
  dx |= 0;
  dy |= 0;

  let mov = [];
  if (!(ox == dx && oy == dy)) {
    zM.dos(ox, oy, items, grid);
    let xy2 = [dx, dy];
    while (visit[xy2[1]][xy2[0]]) {
      mov.push(xy2);
      xy2 = visit[xy2[1]][xy2[0]];
    }

    mov.reverse();
  }

  for (let i = 0; i < mov.length; ++i) {
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
    let local = dat.readUInt16LE(offset, true);

    offset += 2;

    let players = [];
    //console.log(local)
    for (let i = 0; i < local; ++i) {
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
    let count = dat.readUInt16LE(offset, true);
    let clicks = [];

    offset += 2;
    for (let i = 0; i < count; ++i) {
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
    let count = dat.readUInt16LE(offset, true);
    let drawings = [];

    offset += 2;
    for (let i = 0; i < count; ++i) {
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
    let count = dat.readUInt16LE(offset, true);
    let ids = [];

    offset += 2;
    for (let i = 0; i < count; ++i) {
      ids.push(dat.readUInt32LE(offset, true));
      offset += 4;
    }

    return [ids, offset];
  },

  /**
   * Parses objdata (string) and outputs as objects.
   */
  objData: function(objdata) {
    let obj = objdata;
    let nObj = [];

    for (let i = 0; i < obj.length; ++i) {
      let nO = {};
      obj[i] = obj[i].split(/\.+/g);
      nO.id = parseInt(obj[i].shift());
      let type = obj[i].shift();
      switch (type) {
        case '0': {
          nO.type = 0;
          nO.x = parseInt(obj[i].shift());
          nO.y = parseInt(obj[i].shift());
          nO.size = parseInt(obj[i].shift());
          nO.isCentered = obj[i].shift() === 'false' ? false : true;

          nO.content = obj[i].join('');
          break;
        }
        case '1': {
          nO.type = 1;
          nO.x = parseInt(obj[i].shift());
          nO.y = parseInt(obj[i].shift());
          nO.w = parseInt(obj[i].shift());
          nO.h = parseInt(obj[i].shift());
          nO.color = obj[i].shift();
          break;
        }
        case '2': {
          nO.type = 2;
          nO.x = parseInt(obj[i].shift());
          nO.y = parseInt(obj[i].shift());
          nO.w = parseInt(obj[i].shift());
          nO.h = parseInt(obj[i].shift());
          nO.isBad = obj[i].shift() === 'false' ? false : true;
          break;
        }
        case '3': {
          nO.type = 3;
          nO.x = parseInt(obj[i].shift());
          nO.y = parseInt(obj[i].shift());
          nO.w = parseInt(obj[i].shift());
          nO.h = parseInt(obj[i].shift());
          nO.count = parseInt(obj[i].shift());
          nO.color = obj[i].shift();
          break;
        }
        case '4': {
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
    let count = dat.readUInt16LE(offset, true);
    let objdata = [];

    offset += 2;
    for (let i = 0; i < count; ++i) {
      let id = dat.readUInt32LE(offset, true);
      offset += 4;
      let type = dat.readUInt8(offset);
      let objdat = id + '.';
      ++offset;
      switch (type) {
        case 0: {
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
        }
        case 1: {
          objdat += '1.';
          objdat += `${dat.readUInt16LE(offset, true)}.`;
          objdat += `${dat.readUInt16LE(offset+2, true)}.`;
          objdat += `${dat.readUInt16LE(offset+4, true)}.`;
          objdat += `${dat.readUInt16LE(offset+6, true)}.`;
          let color = dat.readUInt32LE(offset + 8, true).toString(16);
          for (; color.length < 6;) color = '0' + color;
          objdat += '#' + color + '.';

          offset += 12;
          break;
        }
        case 2: {
          objdat += '2.';
          objdat += `${dat.readUInt16LE(offset, true)}.`;
          objdat += `${dat.readUInt16LE(offset+2, true)}.`;
          objdat += `${dat.readUInt16LE(offset+4, true)}.`;
          objdat += `${dat.readUInt16LE(offset+6, true)}.`;
          objdat += `${!!dat.readUInt8(offset+8)}.`;
          offset += 9;
          break;
        }
        case 3: {
          objdat += '3.';
          objdat += `${dat.readUInt16LE(offset, true)}.`;
          objdat += `${dat.readUInt16LE(offset+2, true)}.`;
          objdat += `${dat.readUInt16LE(offset+4, true)}.`;
          objdat += `${dat.readUInt16LE(offset+6, true)}.`;
          objdat += `${dat.readUInt16LE(offset+8, true)}.`;
          let color = dat.readUInt32LE(offset + 10, true).toString(16);
          for (; color.length < 6;) color = '0' + color;
          objdat += '#' + color + '.';

          offset += 14;
          break;
        }
        case 4: {
          objdat += '4.';
          objdat += `${dat.readUInt16LE(offset, true)}.`;
          objdat += `${dat.readUInt16LE(offset+2, true)}.`;
          objdat += `${dat.readUInt16LE(offset+4, true)}.`;
          objdat += `${dat.readUInt16LE(offset+6, true)}.`;
          objdat += `${dat.readUInt16LE(offset+8, true)}.`;
          let color = dat.readUInt32LE(offset + 10, true).toString(16);
          for (; color.length < 6;) color = '0' + color;
          objdat += '#' + color + '.';
          offset += 14;
          break;
        }
      }
      objdata.push(objdat);
    }

    return [objdata, offset];
  }
}

let alphabet = {
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

class Client extends EventEmitter {
  constructor(options = {}) {
    super();
    let that = this;

    this._options = options;

    if (!options.ws) options.ws = "ws://157.245.226.69:2828";
    if (!options.origin) options.origin = "http://cursors.io"; //options.ws.replace(/http/, "ws");
    if (typeof options.reconnectTimeout !== "number") options.reconnectTimeout = 5000;


    if (options.controller) {
      let stdin = process.openStdin()
      stdin.on("data", function(d) {
        let msg = d.toString().trim();

        try {
          return String(eval(msg));
        } catch (e) {
          console.log('[ERROR]:' + e.name + ":" + e.message + "\n" + e.stack);
        }
      })
    }
    this.players = {};
    this.levelClicks = [];
    this.levelDrawings = [];

    this.usersOnline = 0;
    this.id = 0;
    this.grid = 5;
    this.level = -1;
    this.levelObjects = [];
    this.prevLevels = [];
    this.drawing = false;

    let messageHandler = msg => {
      this.emit("message", msg);
      let len = msg.length;

      switch (msg.readUInt8(0)) {
        case 0: //get id
          this.id = msg.readUInt32LE(1, true);
          this.emit("gotId", this.id);
          break
        case 1: //player moves draws and changes of map
          //players
          this.usersOnline = msg.readUInt32LE(len - 4, true);

          let out = zM.parse.cursors(msg, 1);
          let local = out.shift();
          let newPlayers = out.shift();
          let offset = out.shift();

          let replacementPlayers = {};
          if (!options.memorySaver)
            for (let i = 0; i < newPlayers.length; i++) {
              let player = newPlayers[i];
              let oldPlayer = this.players[player.id];
              let playerToReplace = {};
              let playerIsNew = !oldPlayer;
              let playerMoved;
              if (playerIsNew) {
                playerToReplace = player;

                playerToReplace.joinedLevel = Date.now();
                playerToReplace.oldX = playerToReplace.x = player.x;
                playerToReplace.oldY = playerToReplace.y = player.y;

                this.emit("newPlayer", playerToReplace) //its not know if he joined for real or just passed level before
              } else {
                playerToReplace = oldPlayer;

                playerToReplace.oldX = playerToReplace.x
                playerToReplace.oldY = playerToReplace.y

                playerToReplace.x = player.x
                playerToReplace.y = player.y
              }

              playerMoved = playerToReplace.x !== playerToReplace.oldX || playerToReplace.y !== playerToReplace.oldY;

              if (playerMoved) {
                this.emit("playerMoved", playerToReplace);
              }

              replacementPlayers[playerToReplace.id] = playerToReplace;
            }
          for (let i in this.players) {
            if (!replacementPlayers[i]) {
              this.emit("playerLeft", this.players[i]); //its not known if he left for real he can pass level too
            }
          }

          this.players = replacementPlayers;

          //clicks

          out = zM.parse.clicks(msg, offset);
          let clicks = out.shift();
          offset = out.shift();

          if (!options.memorySaver)
            while (clicks.length) {
              if(this.levelClicks.length > 100) this.levelClicks.shift();
              let click = clicks.shift();
              this.levelClicks.push(click)
              this.emit("click", click)
            }

          out = zM.parse.remove(msg, offset);

          let objToRemove = out.shift();
          offset = out.shift();

          for (let i = 0; i < objToRemove.length; i++) {
            let index = this.levelObjects.findIndex(obj => obj.id === objToRemove[i])
            this.emit("objectRemoved", this.levelObjects[index])
            this.levelObjects.splice(index, 1)
          }


          out = zM.parse.objects(msg, offset);

          let objToAdd = zM.parse.objData(out.shift());
          offset = out.shift();
          for (let i = 0; i < objToAdd.length; i++) {
            let index = this.levelObjects.findIndex(obj => obj.id === objToAdd[i].id);
            if (index === -1) {
              this.levelObjects.push(objToAdd[i])
              this.emit("objectAdded", objToAdd[i])
            } else {
              this.levelObjects[index] = objToAdd[i]
              this.emit("objectUpdated", objToAdd[i])
            }
          }

          out = zM.parse.drawing(msg, offset)

          if (!options.memorySaver)
            for (let i = 0; i < out[0].length; i++) {
              if(this.levelDrawings.length > 100) this.levelDrawings.shift();
              let drawing = out[0];
              this.levelDrawings.push(drawing)
              this.emit("newDrawing", drawing)
            }



          //console.log(9 + (msg.readUInt16LE(1, true)) * 8)
          //console.log(getObjects(msg, 9 + (msg.readUInt16LE(1, true)-1) * 8))
          break
        case 4: //level change
          if (this.level === -1) this.level++
            this.players = {};
            this.drawings = [];
            this.levelClicks = [];

          this.position.x = msg.readUInt16LE(1)
          this.position.y = msg.readUInt16LE(3)
          let objdata = zM.parse.objects(msg, 5);

          this.levelObjects = zM.parse.objData(objdata[0]);

          let grid = 100;
          for (let i = 0; i < this.levelObjects.length; ++i) {
            if (grid <= 1) {
              grid = 1;
              break;
            }
            if (this.levelObjects[i].type === 1)
              if (
                (this.levelObjects[i].x / grid | 0) != (this.levelObjects[i].x / grid) ||
                (this.levelObjects[i].y / grid | 0) != (this.levelObjects[i].y / grid) ||
                (this.levelObjects[i].w / grid | 0) != (this.levelObjects[i].w / grid) ||
                (this.levelObjects[i].h / grid | 0) != (this.levelObjects[i].h / grid)
              ) --grid, i = -1;
          }

          this.grid = grid; //pathFinder thing

          let compare = [];
          for (let i = 0; i < this.levelObjects.length; ++i) {
            let o = this.levelObjects[i];
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
          let i = this.prevLevels.indexOf(compare);
          if (i != -1) this.level = i;
          else ++this.level, this.prevLevels.push(compare);

          this.emit("level", this.level)
          break
        case 5: //trying to go through walls or an weird move
          this.position.x = msg.readUInt16LE(1)
          this.position.y = msg.readUInt16LE(3)
          this.emit("cheats")
          break
      }
    }
    void function makeSocket() {
      let ws = new WebSocketClient(options.ws, {
        headers: {
          'Origin': options.origin
        },
        agent: options.agent
      });
      ws.on("message", messageHandler);
      ws.on("open", function() {
        that.emit("open");
      });
      ws.on("close", function(reason) {
        that.emit("close", reason);
        if(options.reconnect) setTimeout(makeSocket, options.reconnectTimeout);
      });
      that.ws = ws;
    }()


    this.position = {
      x: 0,
      y: 0
    }
  }
  async move(x = this.position.x, y = this.position.y, pathFinder = true, pathFinderTimeout = 5) {
    if (pathFinder) {
      let moves = zM.path(this.position.x, this.position.y, x, y, this.levelObjects, this.grid);

      for (let i = 0; i < moves.length; i++) {
        this._move(moves[i][0], moves[i][1]);
        await sleep(pathFinderTimeout)
      }
    } else {
      this._move(x, y);
    }
  }
  _move(x, y) {
    if (this.ws.readyState === 1) {
      let array = new ArrayBuffer(9);
      let dv = new DataView(array);
      dv.setUint8(0, 1);
      dv.setUint16(1, x, true);
      dv.setUint16(3, y, true);
      dv.setUint32(5, -1, true);
      this.ws.send(array);
      this.position.x = x;
      this.position.y = y;
    }
  }
  click(x = this.position.x, y = this.position.y) {
    if (this.ws.readyState === 1) {
      let array = new ArrayBuffer(9);
      let dv = new DataView(array);
      dv.setUint8(0, 2);
      dv.setUint16(1, x, true);
      dv.setUint16(3, y, true);
      dv.setUint32(5, -1, true);
      this.ws.send(array);
      this.position.x = x;
      this.position.y = y;
    }
  }
  async drawArray(array, x = this.position.x, y = this.position.y, scale = 1, timeout = 70) {
    for (let i = 0; i < array.length; i++) {
      this.draw(x + array[i][1] * scale, y + array[i][0] * scale, x + array[i][3] * scale, y + array[i][2] * scale)
      await sleep(timeout)
    }
  }
  draw(x1 = this.position.x, y1 = this.position.y, x2 = this.position.x, y2 = this.position.y) {
    if (this.ws.readyState === 1) {
      let array = new ArrayBuffer(9);
      let dv = new DataView(array);
      dv.setUint8(0, 3);
      dv.setUint16(1, x1, true);
      dv.setUint16(3, y1, true);
      dv.setUint16(5, x2, true);
      dv.setUint16(7, y2, true);
      this.ws.send(array);
      this.position.y = y2;
      this.position.x = x2;
    }
  }
  async drawWord(str, x = this.position.x, y = this.position.y, fontSize = 2, kerning = 3, timeout = 250) {
    str = str.trim()
    if (typeof str !== "string"  || this.drawing === true) return false;
    await this.move(x, y);

    for (let i = 0; i < str.length; i++) {
      let scale = 1
      if (str[i] === str[i].toLowerCase()) scale = 0.75;
      let letter = alphabet[str.toLowerCase().charCodeAt(i)] || alphabet[63] || []
      for (let line of letter) {
        let x1 = x + (line[1] * scale + kerning * i) * fontSize;
        let y1 = y + (line[0] * scale * fontSize);
        let x2 = x + (line[3] * scale + kerning * i) * fontSize;
        let y2 = y + (line[2] * scale * fontSize);
        this.draw(x1, y1, x2, y2)
        await sleep(Math.floor(timeout / letter.length))
      }
    }
    this.drawing = false;
    await this.move(x, y)
  }
}

module.exports = {
  Client,
  zM,
  alphabet
}
