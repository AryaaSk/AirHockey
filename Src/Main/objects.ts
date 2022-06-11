const BODIES: Body[] = [];
const BOTTOM_COLOUR = "#3350d4";
const TOP_COLOUR = "#ad0909";

class Body {
    mBody!: Matter.Body;
    colour?: string;

    constructor() {
        BODIES.push(this);
    }
}

class Paddle extends Body{
    static mHeight = 30;
    static mWidth = 150;
    static touchOffsetY = 20;

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

    checkCounterInteraction() {
        const collision = Matter.Collision.collides(this.mBody, COUNTER.mBody);
        if (collision != null) {
            const [xDamping, yDamping] = [0.2, 1];
    
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

    constructor () {
        super();
        const mBody = Matter.Bodies.rectangle(canvasHeight / 2, 0, Paddle.mWidth, Paddle.mHeight, { isStatic: true }); //just spawn at canvasHeight/2 to stop it from clamping the counter, the position gets reset by the BOTTOM_X etc... anyway as soon as the game starts
        this.mBody = mBody;
    }
}

class Counter extends Body {
    static mRadius = 30;

    reset() {
        Matter.Body.setAngularVelocity(this.mBody, 0);
        Matter.Body.setVelocity(this.mBody, Vector(0, 0));
        Matter.Body.set(this.mBody, "position", Vector(0, 0));
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

    constructor () {
        super();
        this.mBody = Matter.Bodies.circle(0, 0, Counter.mRadius);
        this.mBody.restitution = 0.9;
        this.mBody.friction = 0;
        this.mBody.frictionAir = 0.003;
    }
}


class Goal extends Body {
    static mHeight = 20;
    static mWidth = 200;

    constructor (position: Vector2D, colour: string) {
        super();
        this.mBody = Matter.Bodies.rectangle(position.x, position.y, Goal.mWidth, Goal.mHeight, { isStatic: true });
        this.colour = colour;
    }
}