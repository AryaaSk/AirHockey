const InitButtonListeners = () => {
    document.getElementById("playButton")!.onclick = () => {
        location.href = "/Src/Main/main.html";
    }
    document.getElementById("installButton")!.onclick = () => {
        console.log("Instructions on how to install as app");
    }
}

const MAIN_TITLE = () => {
    InitButtonListeners();
}
MAIN_TITLE();