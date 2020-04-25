# cjs documentation
## connecting bot
to connect bot you need use  
```js
//const cjs = new cursorsjs.cjs({ws: "ws://serverip", origin: "http://site.name"}) //optionaly you can put agent to change ip
const cursorsjs = require("cursors-js");

//^ returns object with alphabet Client zm(parser)

const cjs = new cursorsjs.Client(); //connects to cursors.io
const cjs = new cursorsjs.Client({memorySaver: true}); //enables memory saver good for making bots
//memorySaver disables playerMoved, newPlayer, playerLeft, click, newDrawing and variables like cjs.levelDrawings, cjs.players, cjs.levelClicks


const cjs = new cursorsjs.Client({ws: "ws://kursors.io/ws/", origin: "http://kursors.io"}); //connects to kursors.io
```

## options
name (type) - description

memorySaver (boolean) - enables memory saver I think that it can be helpful
ws (string) - WebSocket which bot connects to
origin (string) - url
reconnect (boolean) - should bot reconect after disconnected
reconnectTimeout (number) - timeout after bot should reconnect

I think that I forgot about something `¯\_(ツ)_/¯`


### async (that means you can wait for bot move) cjs.move(x, y)
this function allows you to move your bot using pathfinder  
```js
cjs.move(cjs.position.x + 10); //moves 10 pixels to right
cjs.move(undefined, cjs.position.y + 10); //moves 10 pixels to down
cjs.move(300,175); // moves to x:300, y:175
```

### cjs.click(x, y)
this function allows you to click using bot  
```js
cjs.click(cjs.position.x + 10); //moves 10 pixels to right and clicks 1 time
cjs.click(); //clicks 1 time at your position
cjs.click(300,175); // clicks at x:300, y:175
```

### cjs.draw(x1, y1,x2, y2)
this function allows you to draw using bot  
```js
cjs.draw(undefined,undefined, cjs.position.x + 10); //draw from your position to your position x + 10 pixels
```

### async cjs.drawArray(array, x, y, scale, timeout) async
this function allows you to draw images  
```js
cjs.drawArray([[1,2,1,1],[2,2,1,2],[2,1,2,2],[1,1,2,1],[2,2,1,1],[1,2,2,1],[2,4,1,4],[2,5,2,4],[1,5,2,5],[1,4,1,5],[2,5,1,4],[1,5,2,4],[3,5,3,1],[4,5,3,5],[5,4,4,5],[5,3,5,4],[5,2,5,3],[4,1,5,2],[3,1,4,1]]) //draws smile on your position
//default x and y is cjs.position
//default scale is 1
//default timeout is 70ms
```

### async cjs.drawWord(word, x, y, fontSize, kerning, timeout)
this function allows you to draw words  
some of leters are weird well sorry  
```js
cjs.drawWord("Hello I'm using cursorsjs by mathias377") //< it will be written
//default x and y is cjs.position
//default fontSize is 2
//default kerning (spaces between letters) is 3
//default timeout is 250ms
```
### cjs.position
It's bot position  
```js
console.log(cjs.position.x, cjs.position.y)// logs position of your bot
```

### cjs.on() Events open, close, level, message, cheat, playerMoved, newPlayer, playerLeft, click, newDrawing, objectAdded, objectRemoved, objectUpdated  
if you will use memorySaver this events will wont work  
playerMoved, newPlayer, playerLeft, click, newDrawing  

```js
cjs.on("cheat") //this emits when your bot trying to go through wall but anticheat see that
cjs.on("level") //this emits when your bot going to another level
cjs.on("message") //this is hard if you don't know how to use it don't use it
cjs.on("playerMoved", function(player) {
	console.log(player) // logs player which moved
});
```

### cjs.level
This is level counter but its not perfect because it adds level more when you will go to wrong exit.  
```js
cjs.on("level", function(level) {
	console.log(level) //when level changes it logs your bot level
})
```

### cjs.players
returns level players array, but if you will use memorySaver it will return undefined  

### cjs.levelObjects
returns level Objects array, but if you will use memorySaver it will return undefined

### cjs.levelClicks
returns level Clicks array, but if you will use memorySaver it will return undefined

### cjs.levelDrawings
returns level drawings array, but if you will use memorySaver it will return undefined

### cjs.id
It's your bot id.  

# Credits
mathias377 (mathmakgakpak) did module
vnx did some things without which the bot wouldn't work
