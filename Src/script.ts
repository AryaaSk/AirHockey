// create an engine
let ENGINE = Matter.Engine.create();

// create a renderer

// create two boxes and a ground
let boxA = Matter.Bodies.rectangle(400, 200, 80, 80);
let boxB = Matter.Bodies.rectangle(450, 50, 80, 80);
let ground = Matter.Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

// add all of the bodies to the world
Matter.Composite.add(ENGINE.world, [boxA, boxB, ground]);






let [mouseX, mouseY] = [0, 0];
const InitListeners = () => {
    document.getElementById("renderingWindow")!.onmousemove = ($e) => {
        [mouseX, mouseY] = [$e.clientX, $e.clientY];
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
const GameLoop = () => {
    linkCanvas("renderingWindow");

    setInterval(() => {
        Matter.Engine.update(ENGINE, 1000 / 60); //step physics world

        Matter.Body.set(ground, "position", {x: mouseX, y: mouseY}); //update grounds position to the mouse's position

        clearCanvas();
        RenderBodies();
    }, 16);
}






const MAIN = () => {
    InitListeners();
    GameLoop();
}
MAIN();