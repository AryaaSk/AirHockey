"use strict";
const InitButtonListeners = () => {
    document.getElementById("playButton").onclick = () => {
        location.href = "/Src/Main/main.html";
    };
    document.getElementById("installButton").onclick = () => {
        alert("1. Click on the share button in the bottom tab bar\n2. On the menu, click on 'Add to Home Screen'\n3. Once you have done that you can use this game like a regular app");
    };
};
const MAIN_TITLE = () => {
    InitButtonListeners();
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
        document.getElementById("installButton").style.display = "none";
    }
};
MAIN_TITLE();
