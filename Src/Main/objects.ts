const BODIES: Body[] = [];
class Body {
    mBody!: Matter.Body;
    colour?: string;

    constructor() {
        BODIES.push(this);
    }
}

class Paddle extends Body{
    static mRadius = 1; //set dynamically
    static touchOffsetY = 20;
    static moveSpeed = 20;
    static AISpeed = 15;

    currentPosition: Vector2D = Vector(0, 0);
    previousPosition: Vector2D = Vector(0, 0);
    touchOffset: Vector2D = Vector(0, 0); //usually you want the finger to be behind the paddle, so that the user can still see the paddle

    updatePosition(x: number, y: number) {
        [this.previousPosition.x, this.previousPosition.y] = [this.currentPosition.x, this.currentPosition.y];
        [this.currentPosition.x, this.currentPosition.y] = [x + this.touchOffset.x, y + this.touchOffset.y];
        Matter.Body.set(this.mBody, "position", this.currentPosition);
    }
    updateBearing(bearing: number) {
        Matter.Body.setAngle(this.mBody, toRadians(bearing));
    }
    translate(x: number, y: number) {
        [this.previousPosition.x, this.previousPosition.y] = [this.currentPosition.x, this.currentPosition.y];
        this.currentPosition.x += x;
        this.currentPosition.y += y;
        Matter.Body.set(this.mBody, "position", this.currentPosition);
    }

    checkCounterInteraction() {
        const collision = Matter.Collision.collides(this.mBody, COUNTER.mBody);
        if (collision != null) {
            let [xDamping, yDamping] = [0.15, 1];
            if (isMobile == false) {
                xDamping *= 1.5;
                yDamping *= 1.5;
            }
    
            const travelVector = [(this.currentPosition.x - this.previousPosition.x) * xDamping, (this.currentPosition.y - this.previousPosition.y) * yDamping]; //find travel vector which is currentXY - previousXY
            const distance = Math.sqrt(travelVector[0]**2 + travelVector[1]**2); //work out speed by using pythagorus on travelVector to find distance, and time is 16ms.
            const speed = distance / TICK_INTERVAL; //speed unit: pixels/ms
    
            let force = 1 * speed**2 * 0.5; //force = (mv^2) / 2
            if (force > 0.15) {
                force = 0.15; //to prevent a really powerful hit
            }
    
            const travelVectorNormalized = [travelVector[0] / distance, travelVector[1] / distance]; //calculate force vector, by normalizing travel vector to be of length force 
            const forceVector = [travelVectorNormalized[0] * force, travelVectorNormalized[1] * force];
            if (isNaN(forceVector[0]) || isNaN(forceVector[1])) {
                return;
            }

            Matter.Body.applyForce(COUNTER.mBody, COUNTER.mBody.position, {x: forceVector[0], y: forceVector[1]});
        }
    }

    constructor (position: Vector2D) {
        super();
        const mBody = Matter.Bodies.circle(position.x, position.y, Paddle.mRadius, { isStatic: true });
        this.mBody = mBody;
        this.mBody.friction = 0;
        this.mBody.frictionAir = 0;
        this.mBody.frictionStatic = 0;

        [this.previousPosition.x, this.previousPosition.y] = [position.x, position.y];
        [this.currentPosition.x, this.currentPosition.y] = [position.x, position.y];
    }
}

class Counter extends Body {
    static mRadius = 1; //set dynamically
    static speedLimit = 1; //set dynamically

    reset() {
        Matter.Body.setAngularVelocity(this.mBody, 0);
        Matter.Body.setVelocity(this.mBody, Vector(0, 0));
        Matter.Body.set(this.mBody, "position", Vector(0, 0));
    }
    limitSpeed() {
        if (this.mBody.speed > Counter.speedLimit) {
            const normalizedVelocity = Matter.Vector.normalise(this.mBody.velocity);
            Matter.Body.setAngularVelocity(this.mBody, 0);
            Matter.Body.setVelocity(this.mBody, Matter.Vector.mult(normalizedVelocity, Counter.speedLimit));
        }
    }

    checkGoalInteraction() {
        const bottomCollision = Matter.Collision.collides(this.mBody, BOTTOM_GOAL.mBody);
        const topCollision = Matter.Collision.collides(this.mBody, TOP_GOAL.mBody);

        if (bottomCollision != null) { //has collided with bottom's goal, so top wins
            TOP_SCORE += 1;
            UpdateScores();
            this.reset();
        }
        else if (topCollision != null) {
            BOTTOM_SCORE += 1;
            UpdateScores();
            this.reset();
        }
    }
    checkOutOfBounds() {
        const position = this.mBody.position;
        const top = position.y > (canvas.canvasHeight / 2) + Counter.mRadius;
        const bottom = position.y < -(canvas.canvasHeight / 2) - Counter.mRadius;
        const left = position.x < -(canvas.canvasWidth / 2) - Counter.mRadius;
        const right = position.x > canvas.canvasWidth / 2 + Counter.mRadius;
        if (top || bottom || left || right) {
            this.reset();
        }
    }

    constructor () {
        super();
        this.mBody = Matter.Bodies.circle(0, 0, Counter.mRadius);
        Matter.Body.setMass(this.mBody, 4.374988784);
        this.mBody.restitution = 0.9;
        this.mBody.friction = 0;
        this.mBody.frictionAir = 0.02;
    }
}


class Goal extends Body {
    static mHeight = 10;
    static mWidth = 200;

    constructor (position: Vector2D, colour: string) {
        super();
        this.mBody = Matter.Bodies.rectangle(position.x, position.y, Goal.mWidth, Goal.mHeight, { isStatic: true });
        this.colour = colour;
    }
}