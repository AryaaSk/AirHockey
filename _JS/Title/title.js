"use strict";
const UpdateColours = () => {
    const bottomColour = getComputedStyle(document.body).getPropertyValue('--colour1');
    const topColour = getComputedStyle(document.body).getPropertyValue('--colour2');
    document.body.style.setProperty('--colour1Transparent', bottomColour + "50");
    document.body.style.setProperty('--colour2Transparent', topColour + "50");
};
const InitButtonListeners = () => {
    document.getElementById("playButton").onclick = () => {
        location.href = "/Src/Main/main.html";
    };
    document.getElementById("installButton").onclick = () => {
        alert("1. Click on the share button in the bottom tab bar\n2. Click on 'Add to Home Screen'\n3. Once you have done that you can use this game like a regular app");
    };
};
const MAIN_TITLE = () => {
    UpdateColours();
    InitButtonListeners();
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
        document.getElementById("installButton").style.display = "none";
    }
};
MAIN_TITLE();
