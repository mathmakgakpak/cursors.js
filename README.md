# cjs documentation
### connecting bot
to connect bot you need use  
```js
//const cjs = new cursorsjs.cjs({ws: "ws://serverip", origin: "http://site.name"}) //optionaly you can put agent to change ip

const cjs = new cursorsjs.cjs({ws: "ws://159.65.78.102:2828", origin: "http://cursors.io"}) //connects to cursors.io
const cjs = new cursorsjs.cjs({ws: "ws://kursors.io/ws/", origin: "http://kursors.io"}) //connects to kursors.io
```

### cjs.move(x, y)
this function allows you to move your bot  
```js
cjs.move(cjs.position.x + 10); //moves 10 pixels to right
cjs.move(undefined, cjs.position.y + 10); //moves 10 pixels to down
cjs.move(300,175); // moves to x:300, y:175
```

### cjs.click(x, y)
this function allows you to click using bot  
```js
cjs.click(cjs.position.x + 10); //moves 10 pixels to right and clicks 1 time
cjs.click(); //clicks 1 time on your position
cjs.click(300,175); // clicks on x:300, y:175
```

### cjs.draw(x1, y1,x2, y2)
this function allows you to draw using bot  
```js
cjs.draw(undefined,undefined, cjs.position.x + 10); //draw from your position to your position x + 10 pixels
```

### cjs.drawArray(array, x, y, scale, timeout)
this function allows you to draw images  
```js
cjs.draw([[1,2,1,1],[2,2,1,2],[2,1,2,2],[1,1,2,1],[2,2,1,1],[1,2,2,1],[2,4,1,4],[2,5,2,4],[1,5,2,5],[1,4,1,5],[2,5,1,4],[1,5,2,4],[3,5,3,1],[4,5,3,5],[5,4,4,5],[5,3,5,4],[5,2,5,3],[4,1,5,2],[3,1,4,1]]) //draws smile on your position
//defualt x and y is cjs.position
//defualt scale is 1
//defualt timeout is 70ms
```

### cjs.drawWord(word, x, y, fontSize, kerning, timeout)
this function allows you to draw words  
some of leters are weird well sorry  
```js
cjs.drawWord("Hello I'm using cursorsjs by mathias377") //< it will be drawed
//defualt x and y is cjs.position
//defualt fontSize is 2
//defualt kerning (spaces between letters) is 3
//defualt timeout is 250ms
```
### cjs.position
It's bot position  
```js
console.log(cjs.position.x, cjs.position.y)// logs position of your bot
```

### Events cjs.on() open, closed, connecting, error, closing, level, message, cheat  
```js
cjs.on("cheat") //this emits when your bot trying to go through wall but anticheat see that
cjs.on("level") //this emits when your bot going to another level
cjs.on("message") //this is hard if you don't know how to use it don't use it
```

### cjs.level
This is level counter but its not perfect because it adds level more when you will go to wrong exit.  
```js
cjs.on("level", function() {
	console.log(cjs.level) //when level changes it logs your bot level
})
```

### cjs.players
This gives you players array.  

### cjs.id
It's your bot id.  

# Credits
mathias377 (mathmakgakpak) did everything