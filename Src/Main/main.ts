//Setup

//Extra helpers
interface Vector2D {
    x: number
    y: number
}
const Vector = (x: number, y: number) => {
    return { x: x, y: y };
}
const toRadians = (degrees: number) => {
  var pi = Math.PI;
  return degrees * (pi/180);
}
declare const isMobile: boolean;


//Canvas Setup
linkCanvas("renderingWindow");
const RenderDecorations = () => {
    drawShape([ //blue side
        [-canvasWidth / 2, 0],
        [canvasWidth / 2, 0],
        [canvasWidth / 2, -(canvasHeight / 2)],
        [-canvasWidth / 2, -(canvasHeight / 2)]
    ], BOTTOM_COLOUR + "50");

    drawShape([ //red side
        [-canvasWidth / 2, 0],
        [canvasWidth / 2, 0],
        [canvasWidth / 2, (canvasHeight / 2)],
        [-canvasWidth / 2, (canvasHeight / 2)]
    ], TOP_COLOUR + "50");

    drawLine([-(canvasWidth / 2), 0], [canvasWidth / 2, 0], "black");

    //get counter's velocity and draw a trail
    //since the velocity is just a vector, we can just that to calculate the 2 points to draw the line, this also takes into account its magnitude so I dont have to scale them myself
    if (COUNTER.mBody.speed > 5) {
        let colour = "rgb(120, 120, 120)"; //"rgb(85, 77, 88)";
        if (COUNTER.mBody.speed > 30) {
            colour = "rgb(80, 80, 80)"; //"#7542f5";
        }
        if (COUNTER.mBody.speed > 40) {
            colour = "rgb(40, 40, 40)"; //"purple";
        }
        let thickness = 1 + (0.2 * COUNTER.mBody.speed);
        if (thickness > 6) {
            thickness = 6;
        }

        const normalized = Matter.Vector.normalise(COUNTER.mBody.velocity); //work out normalized vector, then scale it back perfectly to fit behind the counter
        const point1Vector = Matter.Vector.add(COUNTER.mBody.position, Matter.Vector.mult(normalized, -(Counter.mRadius + 5)));
        const point2Vector = Matter.Vector.add(COUNTER.mBody.position, Matter.Vector.mult(COUNTER.mBody.velocity, -5));
        drawLine([point1Vector.x, point1Vector.y], [point2Vector.x, point2Vector.y], colour, thickness);

        //to draw extra lines we just find the perpendicular vector to the direction vector, normalize it and then add our offset
        const perpendicularNormalized = Vector(normalized.y, normalized.x);
        const scale = 10;

        drawLine([point1Vector.x + (scale * perpendicularNormalized.x), point1Vector.y + (scale * perpendicularNormalized.y)], [point2Vector.x + (scale / 5 * perpendicularNormalized.x), point2Vector.y + (scale / 5 * perpendicularNormalized.y)], colour, thickness); //can create a cool effect by adding more lines
        drawLine([point1Vector.x - (scale * perpendicularNormalized.x), point1Vector.y - (scale * perpendicularNormalized.y)], [point2Vector.x - (scale / 5 * perpendicularNormalized.x), point2Vector.y - (scale / 5 * perpendicularNormalized.y)], colour, thickness);
    }
}


//Matter Setup
const ENGINE = Matter.Engine.create();
ENGINE.gravity.y = 0; //no gravity since players just hit it

const InitBorders = () => {
    const borderThickness = 200;
    const topWall = Matter.Bodies.rectangle(0, (canvasHeight / 2) + (borderThickness / 2), canvasWidth, borderThickness, { isStatic: true });
    const bottomWall = Matter.Bodies.rectangle(0, (-(canvasHeight / 2)) - (borderThickness / 2), canvasWidth, borderThickness, { isStatic: true });
    const leftWall = Matter.Bodies.rectangle((-(canvasWidth / 2)) - (borderThickness / 2), 0, borderThickness, canvasHeight, { isStatic: true });
    const rightWall = Matter.Bodies.rectangle((canvasWidth / 2) + (borderThickness / 2), 0, borderThickness, canvasHeight, { isStatic: true });

    [topWall.restitution, bottomWall.restitution, leftWall.restitution, rightWall.restitution] = [1, 1, 1, 1];
    Matter.Composite.add(ENGINE.world, [topWall, bottomWall, leftWall, rightWall]);
}

const RenderBodies = () => {
    for (const body of BODIES) {
        const vertices = body.mBody.vertices;
        const points: number[][] = [];
        for (const vertex of vertices) {
            points.push([vertex.x, vertex.y]);
        }

        const colour = (body.colour == undefined) ? "#ffffff60" : body.colour;
        drawShape(points, colour, true);
    }
}


//Game setup
Goal.mWidth = (200 > canvasWidth / 3) ? 200 : canvasWidth / 3; //min goal width is 200px
if (isMobile == true) {
    Paddle.mRadius = 55;
}
const urlParams = new URLSearchParams(window.location.search);
const NUM_PLAYERS = Number(urlParams.get('players')!);

BOTTOM_COLOUR = getComputedStyle(document.body).getPropertyValue('--colour1');
TOP_COLOUR = getComputedStyle(document.body).getPropertyValue('--colour2');

let BOTTOM_SCORE = 0;
let TOP_SCORE = 0;
const WIN_SCORE = 5;
const UpdateScores = () => {
    document.getElementById("bottomScore")!.innerText = String(BOTTOM_SCORE);
    document.getElementById("topScore")!.innerText = String(TOP_SCORE);
    CheckForWin();
}
const CheckForWin = () => {
    if (BOTTOM_SCORE == WIN_SCORE || TOP_SCORE == WIN_SCORE) {
        GameOver();
    }
}






//Listeners
const KEYS_DOWN: String[] = []; //every key which is currently being pressed down, then handled in the gameloop
let [BOTTOM_X, BOTTOM_Y] = [0, -(canvasHeight / 4)]; //information about where the finger is current positioned, always correct
let [TOP_X, TOP_Y] = [0, canvasHeight / 4];
const InitListeners = () => {
    if (isMobile == true) {
        document.getElementById("renderingWindow")!.addEventListener('touchmove', ($e) => {
            //Read this to understand about JS touch events - https://stackoverflow.com/questions/7056026/variation-of-e-touches-e-targettouches-and-e-changedtouches
            const targetTouches = $e.targetTouches;
            for (const touch of targetTouches) {
                const touchY = GridY(touch.clientY);
    
                if (touchY < 0) { //halfline - halfRacquetHeight
                    if (touchY < (0 - (Paddle.mRadius) - Paddle.touchOffsetY)) {
                        [BOTTOM_X, BOTTOM_Y] = [GridX(touch.clientX), GridY(touch.clientY)];
                    }
                    else {
                        [BOTTOM_X, BOTTOM_Y] = [GridX(touch.clientX), -1 - (Paddle.mRadius) - Paddle.touchOffsetY];
                    }
                }
                else if (touchY > 0 && NUM_PLAYERS == 2) { //dont want the player to be able to control top when it is against the AI
                    if (touchY > (0 + (Paddle.mRadius) + Paddle.touchOffsetY)) {
                        [TOP_X, TOP_Y] = [GridX(touch.clientX), GridY(touch.clientY)];
                    }
                    else {
                        [TOP_X, TOP_Y] = [GridX(touch.clientX), 1 + (Paddle.mRadius) + Paddle.touchOffsetY];
                    }
                }
            }
        });
    }
    else {
        document.onkeydown = ($e) => { //if you just use the regular onkeydown method there is a slight delay
            const key = $e.key.toLowerCase();
            if (KEYS_DOWN.includes(key) == false) { KEYS_DOWN.push(key); }
        }
        document.onkeyup = ($e) => {
            const key = $e.key.toLowerCase();
            if (KEYS_DOWN.includes(key) == true) { KEYS_DOWN.splice(KEYS_DOWN.indexOf(key), 1); }
        }
    }
}
const HandleKeys = () => {
    for (const key of KEYS_DOWN) {
        switch (key) {
            case "w":
                if (TOP_Y <= canvasHeight / 2 - Paddle.mRadius + Paddle.touchOffsetY / 2 && NUM_PLAYERS == 2) {
                    TOP_Y += Paddle.moveSpeed;
                }
                break;
            case "a":
                if (TOP_X >= -(canvasWidth / 2) + Paddle.mRadius && NUM_PLAYERS == 2) {
                    TOP_X -= Paddle.moveSpeed;
                }
                break;
            case "s":
                if (TOP_Y >= 0 + Paddle.mRadius + Paddle.touchOffsetY && NUM_PLAYERS == 2) {
                    TOP_Y -= Paddle.moveSpeed;
                }
                break;
            case "d":
                if (TOP_X <= canvasWidth / 2 - Paddle.mRadius && NUM_PLAYERS == 2) {
                    TOP_X += Paddle.moveSpeed;
                }
                break;

            case "arrowup":
                if (BOTTOM_Y <= 0 - Paddle.mRadius + Paddle.touchOffsetY / 2 - Paddle.touchOffsetY) {
                    BOTTOM_Y += Paddle.moveSpeed;
                }
                break;
            case "arrowleft":
                if (BOTTOM_X >= -(canvasWidth / 2) + Paddle.mRadius) {
                    BOTTOM_X -= Paddle.moveSpeed;
                }
                break;
            case "arrowdown":
                if (BOTTOM_Y >= -(canvasHeight / 2) + Paddle.mRadius / 2) {
                    BOTTOM_Y -= Paddle.moveSpeed;
                }
                break;
            case "arrowright":
                if (BOTTOM_X <= canvasWidth / 2 - Paddle.mRadius) {
                    BOTTOM_X += Paddle.moveSpeed;
                }
                break;
            
            default:
                break;
        }
    }
}
const TickAI = () => {
    //AI controls top paddle, every tick it will try and go towards the paddle
    if (COUNTER.mBody.position.y < 0) { 
        return; //only go for it when it is on its own side
    }

    const AICounterVector = Matter.Vector.sub(Vector(COUNTER.mBody.position.x, COUNTER.mBody.position.y + Counter.mRadius * 2), Vector(TOP_X, TOP_Y));
    const normalized = Matter.Vector.normalise(AICounterVector);
    TOP_X += normalized.x * Paddle.moveSpeed;
    TOP_Y += normalized.y * Paddle.moveSpeed;

    if (TOP_X < -(canvasWidth / 2)) {
        TOP_X = -(canvasWidth / 2);
    }
    else if (TOP_X > canvasWidth / 2) {
        TOP_X = canvasWidth / 2;
    }
    if (TOP_Y < 0 + (Paddle.mRadius) + Paddle.touchOffsetY) {
        TOP_Y = 0 + (Paddle.mRadius) + Paddle.touchOffsetY;
    }
    else if (TOP_Y > canvasHeight / 2) {
        TOP_Y = canvasHeight / 2;
    }
}





// Objects
const BOTTOM_PADDLE = new Paddle(Vector(0, -(canvasHeight / 4)));
const TOP_PADDLE = new Paddle(Vector(0, canvasHeight / 4));
BOTTOM_PADDLE.touchOffset.y = Paddle.touchOffsetY;
TOP_PADDLE.touchOffset.y = -Paddle.touchOffsetY;
Matter.Composite.add(ENGINE.world, [BOTTOM_PADDLE.mBody, TOP_PADDLE.mBody]);

const COUNTER = new Counter();
Matter.Composite.add(ENGINE.world, [COUNTER.mBody]);

const BOTTOM_GOAL = new Goal(Vector(0, -(canvasHeight / 2) + (Goal.mHeight / 2)), BOTTOM_COLOUR);
const TOP_GOAL = new Goal(Vector(0, (canvasHeight / 2) - (Goal.mHeight / 2)), TOP_COLOUR);
Matter.Composite.add(ENGINE.world, [BOTTOM_GOAL.mBody, TOP_GOAL.mBody]);







//Game loop
const TICK_INTERVAL = 16;
const Tick = (delta: number) => {
    Matter.Engine.update(ENGINE, delta);

    if (isMobile == false) {
        HandleKeys();
    }

    if (NUM_PLAYERS == 1) {
        TickAI();
    }
    BOTTOM_PADDLE.updatePosition(BOTTOM_X, BOTTOM_Y);
    TOP_PADDLE.updatePosition(TOP_X, TOP_Y);

    BOTTOM_PADDLE.checkCounterInteraction();
    TOP_PADDLE.checkCounterInteraction();
    
    COUNTER.checkGoalInteraction();

    clearCanvas();
    RenderDecorations();
    RenderBodies();
}


let GAME_LOOP!: number;
const MAIN = () => {
    document.getElementById("gameOver")!.style.display = "none";

    InitBorders();
    InitListeners();

    GAME_LOOP = setInterval(() => {
        Tick(TICK_INTERVAL);
    }, TICK_INTERVAL);
}

const GameOver = () => {
    clearInterval(GAME_LOOP);
    document.getElementById("gameOver")!.style.display = "block";
    if (TOP_SCORE == WIN_SCORE) {
        document.getElementById("whoWon")!.innerText = "Red Won";
    }
    else {
        document.getElementById("whoWon")!.innerText = "Blue Won";
    }

    document.getElementById("rematchButton")!.onclick = () => {
        location.reload();
    }

    document.getElementById("doneButton")!.onclick = () => {
        location.href = "/Src/Title/title.html";
    }
}

MAIN();