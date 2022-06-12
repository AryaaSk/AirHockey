# Air Hockey
## A 2D Air Hockey game, I built to learn more about 2D physics, and new styles

## URL: https://airhockey-fc617.web.app
### PWA
I also converted this into a PWA, using the guide on [Grapher](https://github.com/AryaaSk/Native/tree/master/Grapher), I created the Icons on Figma, and again used the same colour scheme. The user sees an install button when viewing from the website, when clicked it shows them the instructions on how to download onto an iOS device.

I decided I use Matter.js for physics to try it out, and it works quite nicely. For the rendering I just used my basic [CanvasUtilites](Src/canvasUtilities.ts), with a HTML canvas. Matter.js actually handles all the vertices, so all I have to do is draw them to the canvas to display the game.

Here are a few previews of what it looks like on mobile:

<p float="left"> 
  <img src="Previews/TitleScreen.png?raw=true" width="233" />
  <img src="Previews/MidGame.png?raw=true" width="233" /> 
  <img src="Previews/FinishedGame.png?raw=true" width="233" /> 
</p>

For this project I wanted to try out a new style, so instead of using the regular Apple font I usually use, I decided to use [Impact](Assets/impact.ttf), to create an **old-fashioned look**, since Air Hockey is generally seen in old arcades. I also used a washed out colour scheme, as you can see above as well. The two colours are:
- #3350d4 (blue)
- #ad0909 (red)\
Finally I made a lot of use of borders around the outsides of objects and menus, to again give it the old fashioned internet look. Overall I would say that it worked quite well.

## Controls
The aim of the game is to get the counter into the other person's goal, you hit the counters with your paddle.

### Mobile
On mobile each player just controls their paddle using touch, and just click and drag anywhere on the respective half of the screen to move the counter.
### PC
On pc each player uses either WASD or ARROW KEYS to move their respective paddle.

## How it works
Since this was mobile optimized, I had to learn a bit about touch events. There are 2 sets of coordinates, (TOP_X, TOP_Y) and (BOTTOM_X, BOTTOM_Y), these are updated whenever either of the users moves pointer (touch). I detect if the touch is above or below the half-way point on the screen, and then change the TOP or BOTTOM coordinates accordingly.

Every tick the top and bottom paddle's positions are updated to the new TOP and BOTTOM coordinates, and I also store thir previous positions. This is to later calculate their velocity/speed, speed = distance/time.

I also check if either of the paddles have collided with the counter, if so then I calculate the force exterted on the counter:
- First find speed at which the paddle was travelling. Distance is just (current position) - (previous position), and time is the tick speed, so 16ms. Then work out the speed using the speed-distance-time equation.
- Once you know the speed, you need to calculate force exerted on the counter, using: Force = (Mass * Speed^(2)) / 2. I just use mass as 1, and then this gives me the force which I have to extert on the counter.
- Then I apply a this force in the direction the paddle was travelling onto the counter, which is what allows the paddles to hit the couter at different strengths.

Then I also check for a collision between the counter and either of the goals, if there is a collision then I add 1 point to the opposing player's score, and reset the counter. The first person to reach a score of 5 wins.

### AI
There is also a single player option, where you control the bottom paddle and an AI controls the top. In reality it is not using any AI at all, it just finds the Vector from Paddle -> Counter, then normalizes it, then scales it by the Paddle's AISpeed, and finally just translates its position based on this vector. When the counter is not on its own side, it still moves, but only at half the regular pace, and it just shadows the counter's position. Although it is very simple, it does produce some decent gameplay, where the bot is actually able to hold a rally:

![AI Gif](Previews/AIDemo.gif?raw=true)

One problem I am having with the bot is that sometimes it starts following the counter, but then just clamps it into the wall and then there is no way to get the ball back. One solution to this problem may be to check if the counter is near an edge, if so then go towards it from the other side.

## Design
Here is the original sketch of before doing any work:\
![Sketch](Previews/Sketch.png?raw=true)\
*This was originally going to be a badminton game, which is why there is a sketch of a badminton game in the Previews as well.*

## Difficulties
I had a few difficulties with this project:
- The design does not look very appealing, although I tried to make the game look old fashioned, it does not make it seem any more appealing. Although this was bad it is also a good thing, since it allowed me to learn about different website styles.
- Inconsitent constants, there were many constants involved in the physics side, such as the friction and max-speed of the counter, as well as the x/y damping on the paddles. I had to tweak them a lot and I ended up adding a lot more other constants, it started to become very complex as if I changed one constant it would alter how another one would behave. There were also a lot of problems due to the different screen sizes of mobile and pc, the game feels very fast on mobile, but on desktop if feels very slow, I tried to fix this by changing the speedLimit based on screen size, but it still doesn't feel right.
- Decorations, the trails coming off the counter often look out of place, as they are sometimes misaligned or in the wrong direction. I also had trouble coming up with the colours, originally I had a blue and purple colour scheme, but decided to make it greyscale later on to fit in with the board.
- Difficulty making the AI/bot, currently the bot is very basic, and it often is too easy or too difficult, depending on its speed. Making the AI behave like a human is very difficult, and I also had a lot of glitches where it just starts shaking. Later I learned this problem was due to the way Matter.js handles movement, specifically because the counter's velocity keeps switching between positive and negative, so the AI kept going forwards and then reverting backwards.