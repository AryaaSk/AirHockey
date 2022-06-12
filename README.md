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
There is also a single player option, where you control the bottom paddle and an AI controls the top. In reality it is not using any AI at all, it just finds the Vector from Paddle -> Counter, then normalizes it, then scales it by the Paddle's move speed, and finally just translates its position based on this vector. Although it is very simple, it does produce some decent gameplay, where the bot is actually able to hold a rally:

![AI Gif](Previews/AIDemo.gif?raw=true)

## Design
Here is the original sketch of before doing any work:\
![Sketch](Previews/Sketch.png?raw=true)\
*This was originally going to be a badminton game, which is why there is a sketch of a badminton game in the Previews as well.*