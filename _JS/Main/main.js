"use strict";
//Canvas Setup
linkCanvas("renderingWindow");
const Vector = (x, y) => {
    return { x: x, y: y };
};
function toRadians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}
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
        const leftTouches = [];
        const rightTouches = [];
        for (const touch of targetTouches) {
            if (touch.clientX < (canvasWidth / 2) - (Racket.mWidth / 2) - (Net.mWidth / 2)) { //- halfNetWidth - halfRacquetWidth
                leftTouches.push(touch);
            }
            else if (touch.clientX > (canvasWidth / 2) + (Racket.mWidth / 2) + (Net.mWidth / 2)) {
                rightTouches.push(touch);
            }
        }
        if (leftTouches.length == 0) { }
        else if (leftTouches.length == 1) {
            const touch = leftTouches[0];
            [LEFT_X, LEFT_Y] = [GridX(touch.clientX), GridY(touch.clientY)];
        }
        else if (leftTouches.length > 1) {
            const bottomTouch = (leftTouches[0].clientY <= leftTouches[1].clientY) ? leftTouches[0] : leftTouches[1];
            const topTouch = (leftTouches[0].clientY > leftTouches[1].clientY) ? leftTouches[0] : leftTouches[1];
            const [x, y] = [(bottomTouch.clientX + topTouch.clientX) / 2, (bottomTouch.clientY + topTouch.clientY) / 2];
            [LEFT_X, LEFT_Y] = [GridX(x), GridY(y)];
        }
        if (rightTouches.length == 0) { }
        else if (rightTouches.length == 1) {
            const touch = rightTouches[0];
            [RIGHT_X, RIGHT_Y] = [GridX(touch.clientX), GridY(touch.clientY)];
        }
        else if (rightTouches.length > 1) {
            const bottomTouch = (rightTouches[0].clientY <= rightTouches[1].clientY) ? rightTouches[0] : rightTouches[1];
            const topTouch = (rightTouches[0].clientY > rightTouches[1].clientY) ? rightTouches[0] : rightTouches[1];
            const [x, y] = [(bottomTouch.clientX + topTouch.clientX) / 2, (bottomTouch.clientY + topTouch.clientY) / 2];
            [RIGHT_X, RIGHT_Y] = [GridX(x), GridY(y)];
        }
    });
};
// Objects
class Racket {
    constructor(position) {
        this.currentPosition = Vector(0, 0);
        this.previousPosition = Vector(0, 0);
        const mBody = Matter.Bodies.rectangle(position.x, position.y, Racket.mWidth, Racket.mHeight, { isStatic: true });
        this.mBody = mBody;
    }
    updatePosition(x, y) {
        [this.previousPosition.x, this.previousPosition.y] = [this.currentPosition.x, this.currentPosition.y];
        [this.currentPosition.x, this.currentPosition.y] = [x, y - 100]; //will have to change the offset to also include the angle
        Matter.Body.set(this.mBody, "position", this.currentPosition);
    }
    updateBearing(bearing) {
        Matter.Body.setAngle(this.mBody, toRadians(bearing));
    }
    checkShuttleInteraction() {
        const collision = Matter.Collision.collides(this.mBody, SHUTTLE.mBody);
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
            Matter.Body.applyForce(SHUTTLE.mBody, SHUTTLE.mBody.position, { x: forceVector[0], y: forceVector[1] });
        }
    }
}
Racket.mHeight = 150;
Racket.mWidth = 30;
const LEFT_RACKET = new Racket(Vector(-(canvasWidth / 4), 0));
const RIGHT_RACKET = new Racket(Vector(canvasWidth / 4, 0));
LEFT_RACKET.updateBearing(70);
RIGHT_RACKET.updateBearing(-70);
Matter.Composite.add(ENGINE.world, [LEFT_RACKET.mBody, RIGHT_RACKET.mBody]);
class Net {
    constructor(mBody) {
        this.mBody = mBody;
    }
    checkShuttleCollision() {
        const collision = Matter.Collision.collides(this.mBody, SHUTTLE.mBody);
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
const NET = new Net(Matter.Bodies.rectangle(0, -(canvasHeight / 2) + Net.mHeight / 2, Net.mWidth, Net.mHeight, { isStatic: true }));
Matter.Composite.add(ENGINE.world, [NET.mBody]);
class Shuttle {
    constructor(mBody) {
        this.mBody = mBody;
        Matter.Body.set(this.mBody, "restitution", 0.2);
    }
    reset() {
        if (this.mBody.position.x >= 0) {
            Matter.Body.set(SHUTTLE.mBody, "position", Vector(canvasWidth / 4, 0));
        }
        else {
            Matter.Body.set(SHUTTLE.mBody, "position", Vector(-(canvasWidth / 4), 0));
        }
    }
}
Shuttle.mLength = 50;
//const SHUTTLE = Matter.Bodies.circle(-(canvasWidth / 4), 0, 25);
const SHUTTLE = new Shuttle(Matter.Bodies.rectangle(-(canvasWidth / 4), 0, 50, 50));
Matter.Composite.add(ENGINE.world, [SHUTTLE.mBody]);
const Tick = (delta) => {
    Matter.Engine.update(ENGINE, delta);
    LEFT_RACKET.updatePosition(LEFT_X, LEFT_Y);
    RIGHT_RACKET.updatePosition(RIGHT_X, RIGHT_Y);
    LEFT_RACKET.checkShuttleInteraction();
    RIGHT_RACKET.checkShuttleInteraction();
    if (NET.checkShuttleCollision() == true) {
        console.log("Game over");
        SHUTTLE.reset();
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
