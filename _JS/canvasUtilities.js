"use strict";
//Canvas Utilites - from Aryaa3D (https://github.com/AryaaSk/3D-Engine/blob/master/Source/aryaa3D.ts)
let dpi = window.devicePixelRatio;
let canvas = undefined;
let c = undefined;
let canvasWidth = 0;
let canvasHeight = 0;
const linkCanvas = (canvasID) => {
    canvas = document.getElementById(canvasID);
    c = canvas.getContext('2d');
    canvasHeight = document.getElementById(canvasID).getBoundingClientRect().height; //Fix blury lines
    canvasWidth = document.getElementById(canvasID).getBoundingClientRect().width;
    canvas.setAttribute('height', String(canvasHeight * dpi));
    canvas.setAttribute('width', String(canvasWidth * dpi));
    //Removed onresize since iPhone screen is not likely to resize, and it was causing bugs where nothing was drawing
};
//ACTUAL DRAWING FUNCTIONS - MatterJS doesn't use ScreenX and ScreenY, so I disabled those functions
const ScreenX = (x) => {
    if (c == undefined) {
        console.error("Cannot draw, canvas is not linked, please use the linkCanvas(canvasID) before rendering any shapes");
        return;
    }
    return ((canvasWidth / 2) + x) * dpi;
};
const ScreenY = (y) => {
    if (c == undefined) {
        console.error("Cannot draw, canvas is not linked, please use the linkCanvas(canvasID) before rendering any shapes");
        return;
    }
    return ((canvasHeight / 2) - y) * dpi;
};
const GridX = (screenX) => {
    return (screenX) - (canvasWidth / 2);
};
const GridY = (screenY) => {
    return -((screenY) - (canvasHeight / 2));
};
const plotPoint = (p, colour, label) => {
    if (c == undefined) {
        console.error("Cannot draw, canvas is not linked, please use the linkCanvas(canvasID) before rendering any shapes");
        return;
    }
    //point will be in format: [x, y]
    c.fillStyle = colour;
    c.fillRect(ScreenX(p[0]), ScreenY(p[1]), 10, 10);
    if (label != undefined) {
        c.font = `${20 * dpi}px Arial`;
        c.fillText(label, ScreenX(p[0]) + 10, ScreenY(p[1]) + 10);
    }
};
const drawLine = (p1, p2, colour, thickness) => {
    if (c == undefined) {
        console.error("Cannot draw, canvas is not linked, please use the linkCanvas(canvasID) before rendering any shapes");
        return;
    }
    const linKThickness = (thickness == undefined) ? 1 : thickness;
    //points will be in format: [x, y]
    //I need to convert the javascript x and y into actual grid x and y
    c.strokeStyle = colour;
    c.lineWidth = linKThickness;
    c.beginPath();
    c.moveTo(ScreenX(p1[0]), ScreenY(p1[1]));
    c.lineTo(ScreenX(p2[0]), ScreenY(p2[1]));
    c.stroke();
};
const drawShape = (points, colour, outline, outlineColour) => {
    if (c == undefined) {
        console.error("Cannot draw, canvas is not linked, please use the linkCanvas(canvasID) before rendering any shapes");
        return;
    }
    if (points.length == 2) {
        drawLine(points[0], points[1], colour);
        return;
    }
    else if (points.length < 3) {
        console.error("Cannot draw shape, need at least 3 points to draw a shape");
        return;
    }
    c.fillStyle = colour;
    c.beginPath();
    c.moveTo(ScreenX(points[0][0]), ScreenY(points[0][1]));
    for (let pointsIndex = 1; pointsIndex != points.length; pointsIndex += 1) {
        c.lineTo(ScreenX(points[pointsIndex][0]), ScreenY(points[pointsIndex][1]));
    }
    c.closePath();
    c.fill();
    if (outline == true) {
        const lineColour = (outlineColour == undefined) ? "#000000" : outlineColour;
        if (outlineColour != undefined) { }
        for (let i = 1; i != points.length; i += 1) {
            drawLine(points[i - 1], points[i], lineColour);
        }
        drawLine(points[points.length - 1], points[0], lineColour); //to cover the line from last point to first point
    }
};
const clearCanvas = () => {
    if (c == undefined) {
        console.error("Cannot draw, canvas is not linked, please use the linkCanvas(canvasID) before rendering any shapes");
        return;
    }
    c.clearRect(0, 0, canvas.width, canvas.height);
};
