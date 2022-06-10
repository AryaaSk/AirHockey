//Canvas Setup
linkCanvas("renderingWindow");

interface Vector2D {
    x: number
    y: number
}
const Vector = (x: number, y: number) => {
    return { x: x, y: y };
}
function toRadians(degrees: number)
{
  var pi = Math.PI;
  return degrees * (pi/180);
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
}

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
}






let [LEFT_X, LEFT_Y] = [-(canvasWidth / 4), 0]; //information about where the finger is current positioned, always correct
let [RIGHT_X, RIGHT_Y] = [canvasWidth / 4, 0];
let [LEFT_ANGLE, RIGHT_ANGLE] = [0, 0]; //the bearing from the bottom touch -> top touch

const InitListeners = () => {
    document.getElementById("renderingWindow")!.addEventListener('touchmove', ($e) => {
        //Read this to understand about JS touch events - https://stackoverflow.com/questions/7056026/variation-of-e-touches-e-targettouches-and-e-changedtouches
        const targetTouches = $e.targetTouches;

        const leftTouches: Touch[] = [];
        const rightTouches: Touch[] = [];
        for (const touch of targetTouches) {
            if (touch.clientX < (canvasWidth / 2) - (Racket.mWidth / 2) - (Net.mWidth / 2)) { //- halfNetWidth - halfRacquetWidth
                leftTouches.push(touch);
            }
            else if (touch.clientX > (canvasWidth / 2) + (Racket.mWidth / 2) + (Net.mWidth / 2)) {
                rightTouches.push(touch);
            }
        }

        if (leftTouches.length == 0) {}
        else if (leftTouches.length == 1) {
            const touch = leftTouches[0];
            [LEFT_X, LEFT_Y] = [GridX(touch.clientX), GridY(touch.clientY)];
        }
        else if (leftTouches.length > 1) {
            const bottomTouch = (leftTouches[0].clientY <= leftTouches[1].clientY) ? leftTouches[0] : leftTouches[1];
            const topTouch = (leftTouches[0].clientY > leftTouches[1].clientY) ? leftTouches[0] : leftTouches[1];
            const [x, y] = [(bottomTouch.clientX + topTouch.clientX) / 2, (bottomTouch.clientY + topTouch.clientY) / 2];
            [LEFT_X, LEFT_Y] = [GridX(x), GridY(y)];

            //work out bearing - https://stackoverflow.com/questions/34562518/javascript-maths-get-a-bearing-angle-from-a-point-a-to-b-properly
            const A = Vector(GridX(bottomTouch.clientX), GridY(bottomTouch.clientY));
            const B = Vector(GridX(topTouch.clientX), GridY(topTouch.clientY));
            var angle = ( ( ( -(Math.atan2((A.x-B.x),(A.y-B.y))*(180/Math.PI)) % 360) + 360) % 360); 
            LEFT_ANGLE = (Math.round(angle) % 90) * 2;
        }

        if (rightTouches.length == 0) {}
        else if (rightTouches.length == 1) {
            const touch = rightTouches[0];
            [RIGHT_X, RIGHT_Y] = [GridX(touch.clientX), GridY(touch.clientY)];
        }
        else if (rightTouches.length > 1) {
            const bottomTouch = (rightTouches[0].clientY <= rightTouches[1].clientY) ? rightTouches[0] : rightTouches[1];
            const topTouch = (rightTouches[0].clientY > rightTouches[1].clientY) ? rightTouches[0] : rightTouches[1];
            const [x, y] = [(bottomTouch.clientX + topTouch.clientX) / 2, (bottomTouch.clientY + topTouch.clientY) / 2];
            [RIGHT_X, RIGHT_Y] = [GridX(x), GridY(y)];

            //work out bearing
            const A = Vector(GridX(bottomTouch.clientX), GridY(bottomTouch.clientY));
            const B = Vector(GridX(topTouch.clientX), GridY(topTouch.clientY));
            var angle = ( ( ( -(Math.atan2((A.x-B.x),(A.y-B.y))*(180/Math.PI)) % 360) + 360) % 360); 
            RIGHT_ANGLE = (Math.round(angle) % 90) * 2;
        }
    });
}






// Objects
class Racket {
    mBody: Matter.Body;
    static mHeight = 150;
    static mWidth = 30;

    currentPosition: Vector2D = Vector(0, 0);
    previousPosition: Vector2D = Vector(0, 0);

    updatePosition(x: number, y: number) {
        [this.previousPosition.x, this.previousPosition.y] = [this.currentPosition.x, this.currentPosition.y];
        [this.currentPosition.x, this.currentPosition.y] = [x, y + 50]; //will have to change the offset to also include the angle
        Matter.Body.set(this.mBody, "position", this.currentPosition);
    }
    updateBearing(bearing: number) {
        Matter.Body.setAngle(this.mBody, toRadians(bearing));
    }

    checkShuttleInteraction() {
        const collision = Matter.Collision.collides(this.mBody, SHUTTLE);
        if (collision != null) {
            const [xDamping, yDamping] = [0.2, 1];
    
            const travelVector = [(this.currentPosition.x - this.previousPosition.x) * xDamping, (this.currentPosition.y - this.previousPosition.y) * yDamping]; //find travel vector which is currentXY - previousXY
            const distance = Math.sqrt(travelVector[0]**2 + travelVector[1]**2); //work out speed by using pythagorus on forceVector to find distance, and time is 16ms.
            const speed = distance / 16; //speed unit: pixels/ms
    
            let force = 1 * speed**2 * 0.5; //force = (mv^2) / 2
            if (force > 0.1) {
                force = 0.1; //to prevent a really powerful hit
            }
    
            //calculate force vector, by normalizing travel vector to be of length force 
            const travelVectorNormalized = [travelVector[0] / distance, travelVector[1] / distance];
            const forceVector = [travelVectorNormalized[0] * force, travelVectorNormalized[1] * force];
    
            if (isNaN(forceVector[0]) || isNaN(forceVector[1])) {
                return;
            }
    
            Matter.Body.applyForce(SHUTTLE, SHUTTLE.position, {x: forceVector[0], y: forceVector[1]});
        }
    }

    constructor (position: Vector2D) {
        const mBody = Matter.Bodies.rectangle(position.x, position.y, Racket.mWidth, Racket.mHeight, { isStatic: true })
        this.mBody = mBody;
    }
}

const LEFT_RACKET = new Racket(Vector(-(canvasWidth / 4), 0));
const RIGHT_RACKET = new Racket(Vector(canvasWidth / 4, 0));
Matter.Composite.add(ENGINE.world, [LEFT_RACKET.mBody, RIGHT_RACKET.mBody]);

class Net {
    mBody: Matter.Body;
    static mHeight = 150;
    static mWidth = 20;

    checkShuttleCollision() {
        const collision = Matter.Collision.collides(this.mBody, SHUTTLE);
        if (collision != null) {
            return true;
        }
        else {
            return false;
        }
    }

    constructor (mBody: Matter.Body) {
        this.mBody = mBody;
    }
}
const NET = new Net(Matter.Bodies.rectangle(0, -(canvasHeight / 4), Net.mWidth, Net.mHeight, { isStatic: true }));
Matter.Composite.add(ENGINE.world, [NET.mBody]);

//const SHUTTLE = Matter.Bodies.circle(-(canvasWidth / 4), 0, 25);
const SHUTTLE = Matter.Bodies.rectangle(-(canvasWidth / 4), 0, 50, 50);
Matter.Body.set(SHUTTLE, "restitution", 0.2);
Matter.Composite.add(ENGINE.world, [SHUTTLE]);






const Reset = () => {
    Matter.Body.set(SHUTTLE, "position", Vector(-(canvasWidth / 4), 0));
}

const Tick = (delta: number) => {
    Matter.Engine.update(ENGINE, delta);

    LEFT_RACKET.updatePosition(LEFT_X, LEFT_Y);
    RIGHT_RACKET.updatePosition(RIGHT_X, RIGHT_Y);

    //LEFT_RACKET.updateBearing(LEFT_ANGLE);
    //RIGHT_RACKET.updateBearing(RIGHT_ANGLE);

    LEFT_RACKET.checkShuttleInteraction();
    RIGHT_RACKET.checkShuttleInteraction();

    if (NET.checkShuttleCollision() == true) {
        console.log("Game over");
        Reset();
    }

    clearCanvas();
    RenderBodies();
}






const MAIN = () => {
    InitBorders();
    InitListeners();

    setInterval(() => {
        Tick(16);
    }, 16);
}
MAIN();