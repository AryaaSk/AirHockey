"use strict";
const Vector = (x, y) => {
    return { x: x, y: y };
};
const toRadians = (degrees) => {
    var pi = Math.PI;
    return degrees * (pi / 180);
};
//Canvas Setup
linkCanvas("renderingWindow");
const RenderDecorations = () => {
    drawShape([
        [-canvasWidth / 2, 0],
        [canvasWidth / 2, 0],
        [canvasWidth / 2, -(canvasHeight / 2)],
        [-canvasWidth / 2, -(canvasHeight / 2)]
    ], "#3350d450");
    drawShape([
        [-canvasWidth / 2, 0],
        [canvasWidth / 2, 0],
        [canvasWidth / 2, (canvasHeight / 2)],
        [-canvasWidth / 2, (canvasHeight / 2)]
    ], "#ad090950");
};
//Matter Setup
const ENGINE = Matter.Engine.create();
ENGINE.gravity.y = 0; //no gravity since players just hit it
const InitBorders = () => {
    const borderThickness = 50;
    const topWall = Matter.Bodies.rectangle(0, (canvasHeight / 2) + (borderThickness / 2), canvasWidth, borderThickness, { isStatic: true });
    const bottomWall = Matter.Bodies.rectangle(0, (-(canvasHeight / 2)) - (borderThickness / 2), canvasWidth, borderThickness, { isStatic: true });
    const leftWall = Matter.Bodies.rectangle((-(canvasWidth / 2)) - (borderThickness / 2), 0, borderThickness, canvasHeight, { isStatic: true });
    const rightWall = Matter.Bodies.rectangle((canvasWidth / 2) + (borderThickness / 2), 0, borderThickness, canvasHeight, { isStatic: true });
    [topWall.restitution, bottomWall.restitution, leftWall.restitution, rightWall.restitution] = [1, 1, 1, 1];
    Matter.Composite.add(ENGINE.world, [topWall, bottomWall, leftWall, rightWall]);
};
const RenderBodies = () => {
    let bodies = Matter.Composite.allBodies(ENGINE.world);
    for (const body of bodies) {
        const vertices = body.vertices;
        const points = [];
        for (const vertex of vertices) {
            points.push([vertex.x, vertex.y]);
        }
        drawShape(points, "#ffffff80", true);
    }
};
let [BOTTOM_X, BOTTOM_Y] = [0, -(canvasHeight / 4)]; //information about where the finger is current positioned, always correct
let [TOP_X, TOP_Y] = [0, canvasHeight / 4];
const InitListeners = () => {
    document.getElementById("renderingWindow").addEventListener('touchmove', ($e) => {
        //Read this to understand about JS touch events - https://stackoverflow.com/questions/7056026/variation-of-e-touches-e-targettouches-and-e-changedtouches
        const targetTouches = $e.targetTouches;
        for (const touch of targetTouches) {
            const touchY = GridY(touch.clientY);
            if (touchY < (0 - (Paddle.mHeight / 2) - Paddle.touchOffsetY)) { //halfline - halfRacquetHeight
                [BOTTOM_X, BOTTOM_Y] = [GridX(touch.clientX), GridY(touch.clientY)];
            }
            else if (touchY > (0 + (Paddle.mHeight / 2) + Paddle.touchOffsetY)) {
                [TOP_X, TOP_Y] = [GridX(touch.clientX), GridY(touch.clientY)];
            }
        }
    });
};
// Objects
class Paddle {
    constructor() {
        this.currentPosition = Vector(0, 0);
        this.previousPosition = Vector(0, 0);
        this.touchOffset = Vector(0, 0); //usually you want the finger to be behind the paddle, so that the user can still see the paddle
        const mBody = Matter.Bodies.rectangle(canvasHeight / 2, 0, Paddle.mWidth, Paddle.mHeight, { isStatic: true }); //just spawn at canvasHeight/2 to stop it from clamping the counter, the position gets reset by the BOTTOM_X etc... anyway as soon as the game starts
        this.mBody = mBody;
    }
    updatePosition(x, y) {
        [this.previousPosition.x, this.previousPosition.y] = [this.currentPosition.x, this.currentPosition.y];
        [this.currentPosition.x, this.currentPosition.y] = [x + this.touchOffset.x, y + this.touchOffset.y];
        Matter.Body.set(this.mBody, "position", this.currentPosition);
    }
    updateBearing(bearing) {
        Matter.Body.setAngle(this.mBody, toRadians(bearing));
    }
    checkCOUNTERInteraction() {
        const collision = Matter.Collision.collides(this.mBody, COUNTER.mBody);
        if (collision != null) {
            const [xDamping, yDamping] = [0.2, 1];
            const travelVector = [(this.currentPosition.x - this.previousPosition.x) * xDamping, (this.currentPosition.y - this.previousPosition.y) * yDamping]; //find travel vector which is currentXY - previousXY
            const distance = Math.sqrt(travelVector[0] ** 2 + travelVector[1] ** 2); //work out speed by using pythagorus on travelVector to find distance, and time is 16ms.
            const speed = distance / TICK_INTERVAL; //speed unit: pixels/ms
            let force = 1 * speed ** 2 * 0.5; //force = (mv^2) / 2
            if (force > 0.15) {
                force = 0.15; //to prevent a really powerful hit
            }
            const travelVectorNormalized = [travelVector[0] / distance, travelVector[1] / distance]; //calculate force vector, by normalizing travel vector to be of length force 
            const forceVector = [travelVectorNormalized[0] * force, travelVectorNormalized[1] * force];
            if (isNaN(forceVector[0]) || isNaN(forceVector[1])) {
                return;
            }
            Matter.Body.applyForce(COUNTER.mBody, COUNTER.mBody.position, { x: forceVector[0], y: forceVector[1] });
        }
    }
}
Paddle.mHeight = 30;
Paddle.mWidth = 150;
Paddle.touchOffsetY = 20;
class Counter {
    constructor() {
        //Matter.Bodies.rectangle(-(canvasWidth / 4), 0, Counter.mRadius * 2, Counter.mRadius * 2)
        this.mBody = Matter.Bodies.circle(0, 0, Counter.mRadius);
        this.mBody.restitution = 1;
        this.mBody.friction = 0;
        this.mBody.frictionAir = 0.003;
    }
    reset() {
        if (this.mBody.position.x >= 0) {
            Matter.Body.set(COUNTER.mBody, "position", Vector(canvasWidth / 4, 0));
        }
        else {
            Matter.Body.set(COUNTER.mBody, "position", Vector(-(canvasWidth / 4), 0));
        }
    }
}
Counter.mRadius = 30;
const BOTTOM_PADDLE = new Paddle();
const TOP_PADDLE = new Paddle();
const COUNTER = new Counter();
BOTTOM_PADDLE.touchOffset.y = Paddle.touchOffsetY;
TOP_PADDLE.touchOffset.y = -Paddle.touchOffsetY;
Matter.Composite.add(ENGINE.world, [BOTTOM_PADDLE.mBody, TOP_PADDLE.mBody, COUNTER.mBody]);
const TICK_INTERVAL = 5;
const Tick = (delta) => {
    Matter.Engine.update(ENGINE, delta);
    BOTTOM_PADDLE.updatePosition(BOTTOM_X, BOTTOM_Y);
    TOP_PADDLE.updatePosition(TOP_X, TOP_Y);
    BOTTOM_PADDLE.checkCOUNTERInteraction();
    TOP_PADDLE.checkCOUNTERInteraction();
    clearCanvas();
    RenderDecorations();
    RenderBodies();
};
const MAIN = () => {
    InitBorders();
    InitListeners();
    setInterval(() => {
        Tick(TICK_INTERVAL);
    }, TICK_INTERVAL);
};
MAIN();
