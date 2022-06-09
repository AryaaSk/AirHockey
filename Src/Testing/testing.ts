// create an engine
let ENGINE = Matter.Engine.create();
ENGINE.gravity.y = -1;

// create two boxes and a ground
let box = Matter.Bodies.rectangle(0, 400, 80, 80);
let ground = Matter.Bodies.rectangle(0, 0, 1000, 50, { isStatic: true });

// add all of the bodies to the world
Matter.Composite.add(ENGINE.world, [box, ground]);





let [mouseX, mouseY] = [0, 0]; //these are always correct at any point in time
const InitListeners = () => {
    document.getElementById("renderingWindow")!.onmousemove = ($e) => {
        [mouseX, mouseY] = [GridX($e.clientX), GridY($e.clientY)];
    }
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
let [previousX, previousY] = [0, 0];
let [currentX, currentY] = [0, 0];
const GameLoop = () => {
    linkCanvas("renderingWindow");

    setInterval(() => {
        Matter.Engine.update(ENGINE, 1000 / 60); //step physics world

        [previousX, previousY] = [currentX, currentY];
        [currentX, currentY] = [mouseX, mouseY];

        Matter.Body.set(ground, "position", {x: mouseX, y: mouseY}); //update grounds position to the mouse's position
        CheckForInteraction();

        LimitBoxSpeed();

        clearCanvas();
        RenderBodies();
    }, 16);
}



const CheckForInteraction = () => {
    const collision = Matter.Collision.collides(ground, box);
    if (collision != null) {
        const [xDamping, yDamping] = [0.2, 1];

        const travelVector = [(currentX - previousX) * xDamping, (currentY - previousY) * yDamping]; //find travel vector which is currentXY - previousXY
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

        Matter.Body.applyForce(box, box.position, {x: forceVector[0], y: forceVector[1]});
    }
}



const LimitBoxSpeed = () => {
    box.speed = 10;
}


const MAIN = () => {
    InitListeners();
    GameLoop();
}
MAIN();