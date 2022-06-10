"use strict";
//Canvas Setup
linkCanvas("renderingWindow");
const Vector = (x, y) => {
    return { x: x, y: y };
};
//Matter Setup
const ENGINE = Matter.Engine.create();
ENGINE.gravity.y = -1;
const InitBorders = () => {
    const borderThickness = 1;
    const topWall = Matter.Bodies.rectangle(0, canvasHeight / 2, canvasWidth, borderThickness, { isStatic: true });
    const bottomWall = Matter.Bodies.rectangle(0, -(canvasHeight / 2), canvasWidth, borderThickness, { isStatic: true });
    const leftWall = Matter.Bodies.rectangle(-(canvasWidth / 2), 0, borderThickness, canvasHeight, { isStatic: true });
    const rightWall = Matter.Bodies.rectangle(canvasWidth / 2, 0, borderThickness, canvasHeight, { isStatic: true });
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
let [LEFT_X, LEFT_Y] = [-(canvasWidth / 4), 0]; //information about where the finger is current positioned, always correct
let [RIGHT_X, RIGHT_Y] = [canvasWidth / 4, 0];
const InitListeners = () => {
    document.getElementById("renderingWindow").addEventListener('touchmove', ($e) => {
        //Read this to understand about JS touch events - https://stackoverflow.com/questions/7056026/variation-of-e-touches-e-targettouches-and-e-changedtouches
        const targetTouches = $e.targetTouches;
        for (const touch of targetTouches) {
            if (touch.clientX < (canvasWidth / 2) - (Racket.mWidth / 2) - (Net.mWidth / 2)) { //- halfNetWidth - halfRacquetWidth
                [LEFT_X, LEFT_Y] = [GridX(touch.clientX), GridY(touch.clientY)];
            }
            else if (touch.clientX > (canvasWidth / 2) + (Racket.mWidth / 2) + (Net.mWidth / 2)) {
                [RIGHT_X, RIGHT_Y] = [GridX(touch.clientX), GridY(touch.clientY)];
            }
        }
    });
};
// Objects
class Racket {
    constructor(mBody) {
        this.currentPosition = Vector(0, 0);
        this.previousPosition = Vector(0, 0);
        this.mBody = mBody;
    }
    updatePosition(x, y) {
        [this.previousPosition.x, this.previousPosition.y] = [this.currentPosition.x, this.currentPosition.y];
        [this.currentPosition.x, this.currentPosition.y] = [x, y];
        Matter.Body.set(this.mBody, "position", this.currentPosition);
    }
    checkShuttleInteraction() {
        const collision = Matter.Collision.collides(this.mBody, SHUTTLE);
        if (collision != null) {
            const [xDamping, yDamping] = [0.2, 1];
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
            Matter.Body.applyForce(SHUTTLE, SHUTTLE.position, { x: forceVector[0], y: forceVector[1] });
        }
    }
}
Racket.mHeight = 150;
Racket.mWidth = 30;
const LEFT_RACKET = new Racket(Matter.Bodies.rectangle(-(canvasWidth / 4), 0, Racket.mWidth, Racket.mHeight, { isStatic: true }));
const RIGHT_RACKET = new Racket(Matter.Bodies.rectangle(canvasWidth / 4, 0, Racket.mWidth, Racket.mHeight, { isStatic: true }));
Matter.Composite.add(ENGINE.world, [LEFT_RACKET.mBody, RIGHT_RACKET.mBody]);
class Net {
    constructor(mBody) {
        this.mBody = mBody;
    }
    checkShuttleCollision() {
        const collision = Matter.Collision.collides(this.mBody, SHUTTLE);
        if (collision != null) {
            return true;
        }
        else {
            return false;
        }
    }
}
Net.mHeight = 150;
Net.mWidth = 20;
const NET = new Net(Matter.Bodies.rectangle(0, -(canvasHeight / 4), Net.mWidth, Net.mHeight, { isStatic: true }));
Matter.Composite.add(ENGINE.world, [NET.mBody]);
const SHUTTLE = Matter.Bodies.circle(-(canvasWidth / 4), canvasHeight, 25);
console.log(SHUTTLE);
Matter.Body.set(SHUTTLE, "restitution", 0);
Matter.Composite.add(ENGINE.world, [SHUTTLE]);
const Reset = () => {
    Matter.Body.set(SHUTTLE, "position", Vector(-(canvasWidth / 4), 0));
};
const Tick = (delta) => {
    Matter.Engine.update(ENGINE, delta);
    LEFT_RACKET.updatePosition(LEFT_X, LEFT_Y);
    RIGHT_RACKET.updatePosition(RIGHT_X, RIGHT_Y);
    LEFT_RACKET.checkShuttleInteraction();
    RIGHT_RACKET.checkShuttleInteraction();
    if (NET.checkShuttleCollision() == true) {
        console.log("Game over");
        Reset();
    }
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
