"use strict";
//Canvas Setup
linkCanvas("renderingWindow");
const Vector = (x, y) => {
    return { x: x, y: y };
};
const toRadians = (degrees) => {
    var pi = Math.PI;
    return degrees * (pi / 180);
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
    Matter.Composite.add(ENGINE.world, [topWall, bottomWall, leftWall, rightWall]);
};
const RenderBodies = () => {
    let bodies = Matter.Composite.allBodies(ENGINE.world);
    for (const body of bodies) {
        const vertices = body.vertices;
        let a = 0;
        while (a != vertices.length - 1) {
            const [point1, point2] = [[vertices[a].x, vertices[a].y], [vertices[a + 1].x, vertices[a + 1].y]];
            drawLine(point1, point2, "black", 2);
            a += 1;
        }
        const [point1, point2] = [[vertices[a].x, vertices[a].y], [vertices[0].x, vertices[0].y]]; //final line
        drawLine(point1, point2, "black", 2);
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
    constructor(position) {
        this.currentPosition = Vector(0, 0);
        this.previousPosition = Vector(0, 0);
        this.touchOffset = Vector(0, 0); //usually you want the finger to be behind the paddle, so that the user can still see the paddle
        const mBody = Matter.Bodies.rectangle(position.x, position.y, Paddle.mWidth, Paddle.mHeight, { isStatic: true });
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
            const [xDamping, yDamping] = [0.15, 1];
            const travelVector = [(this.currentPosition.x - this.previousPosition.x) * xDamping, (this.currentPosition.y - this.previousPosition.y) * yDamping]; //find travel vector which is currentXY - previousXY
            const distance = Math.sqrt(travelVector[0] ** 2 + travelVector[1] ** 2); //work out speed by using pythagorus on forceVector to find distance, and time is 16ms.
            const speed = distance / 16; //speed unit: pixels/ms
            let force = 1 * speed ** 2 * 0.5; //force = (mv^2) / 2
            if (force > 0.1) {
                force = 0.1; //to prevent a really powerful hit
            }
            //calculate force vector, by normalizing travel vector to be of length force 
            const travelVectorNormalized = [travelVector[0] / distance, travelVector[1] / distance];
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
Paddle.touchOffsetY = 50;
class Counter {
    constructor(mBody) {
        this.mBody = mBody;
        Matter.Body.set(this.mBody, "restitution", 0.2);
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
Counter.mLength = 50;
const BOTTOM_PADDLE = new Paddle(Vector(0, -(canvasHeight / 4)));
const TOP_PADDLE = new Paddle(Vector(0, canvasHeight / 4));
BOTTOM_PADDLE.touchOffset.y = Paddle.touchOffsetY;
TOP_PADDLE.touchOffset.y = -Paddle.touchOffsetY;
const COUNTER = new Counter(Matter.Bodies.circle(0, 0, 25));
//const COUNTER = new Counter(Matter.Bodies.rectangle(-(canvasWidth / 4), 0, 50, 50));
Matter.Composite.add(ENGINE.world, [BOTTOM_PADDLE.mBody, TOP_PADDLE.mBody, COUNTER.mBody]);
const Tick = (delta) => {
    Matter.Engine.update(ENGINE, delta);
    BOTTOM_PADDLE.updatePosition(BOTTOM_X, BOTTOM_Y);
    TOP_PADDLE.updatePosition(TOP_X, TOP_Y);
    BOTTOM_PADDLE.checkCOUNTERInteraction();
    TOP_PADDLE.checkCOUNTERInteraction();
    clearCanvas();
    RenderBodies();
};
const MAIN = () => {
    InitBorders();
    InitListeners();
    setInterval(() => {
        Tick(16);
    }, 16);
};
MAIN();
