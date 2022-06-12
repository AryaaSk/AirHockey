const BOTTOM_COLOUR = "#3350d4";
const BOTTOM_COLOUR_BACKGROUND = "rgb(183, 186, 239)";

const TOP_COLOUR = "#ad0909";
const TOP_COLOUR_BACKGROUND = "rgb(221, 161, 163)";

const MENU_COLOUR = "#fff9e2";
const MENU_COLOUR_ACTIVE = "#fdf0bd";

const UpdateCSS = () => {
    document.body.style.setProperty('--colour1', BOTTOM_COLOUR);
    document.body.style.setProperty('--colour2', TOP_COLOUR);
    document.body.style.setProperty('--colour1Transparent', BOTTOM_COLOUR_BACKGROUND);
    document.body.style.setProperty('--colour2Transparent', TOP_COLOUR_BACKGROUND);
    document.body.style.setProperty('--menuColour', MENU_COLOUR);
    document.body.style.setProperty('--menuColourActive', MENU_COLOUR_ACTIVE);
};
UpdateCSS();