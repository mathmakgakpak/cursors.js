# cjs documentation
### connecting bot
to connect bot you need use  
```js
const cjs = new cursorsjs.cjs({ws: "ws://serverip", origin: "http://site.name"}) //optionaly you can put agent to change ip

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
# Credits
mathias377 did everything