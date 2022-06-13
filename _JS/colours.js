"use strict";
let BOTTOM_COLOUR = "";
let BOTTOM_COLOUR_BACKGROUND = "";
let TOP_COLOUR = "";
let TOP_COLOUR_BACKGROUND = "";
let COUNTER_COLOUR = "";
let OBJECT_COLOUR = ""; //for the line dividing the 2 sides
let MENU_COLOUR = "";
let MENU_BUTTON_COLOUR = "";
let MENU_COLOUR_ACTIVE = "";
let BORDER_COLOUR = "";
let FONT_COLOUR = "";
const url = new URLSearchParams(window.location.search);
const CURRENT_THEME_INDEX = Number(url.get('theme')); //if it is not there then it goes to 0 which is the default anyway
const LoadTheme = [
    () => {
        BOTTOM_COLOUR = "#3350d490";
        BOTTOM_COLOUR_BACKGROUND = "rgb(183, 186, 239)";
        TOP_COLOUR = "#ad090990";
        TOP_COLOUR_BACKGROUND = "rgb(221, 161, 163)";
        COUNTER_COLOUR = "#ffffff80";
        OBJECT_COLOUR = "#000000";
        MENU_COLOUR = "#fff9e2";
        MENU_BUTTON_COLOUR = "#fff9e2";
        MENU_COLOUR_ACTIVE = "#fdf0bd";
        BORDER_COLOUR = "#000000";
        FONT_COLOUR = "#000000";
    },
    () => {
        BOTTOM_COLOUR = "#51d43390";
        BOTTOM_COLOUR_BACKGROUND = "#101010";
        TOP_COLOUR = "#ff000090";
        TOP_COLOUR_BACKGROUND = "#101010";
        COUNTER_COLOUR = "#ffffff80";
        OBJECT_COLOUR = "#ffffff";
        MENU_COLOUR = "#970ae2";
        MENU_BUTTON_COLOUR = "#970ae2";
        MENU_COLOUR_ACTIVE = "#6f07a7";
        BORDER_COLOUR = "#000000";
        FONT_COLOUR = "#ffffff";
    },
    () => {
        BOTTOM_COLOUR = "#ffffff90";
        BOTTOM_COLOUR_BACKGROUND = "#0064e8";
        TOP_COLOUR = "#ffffff90";
        TOP_COLOUR_BACKGROUND = "#c71515";
        COUNTER_COLOUR = "#ffffff80";
        OBJECT_COLOUR = "#ffffff";
        MENU_COLOUR = "#ffffff";
        MENU_BUTTON_COLOUR = "rgb(245, 245, 245)";
        MENU_COLOUR_ACTIVE = "rgb(225, 225, 225)";
        BORDER_COLOUR = "#000000";
        FONT_COLOUR = "#000000";
    },
    () => {
        BOTTOM_COLOUR = "#ffffff";
        BOTTOM_COLOUR_BACKGROUND = "#1da30b";
        TOP_COLOUR = "#ffffff";
        TOP_COLOUR_BACKGROUND = "#ffd000";
        COUNTER_COLOUR = "#9101e4";
        OBJECT_COLOUR = "#000000";
        MENU_COLOUR = "#ffffff";
        MENU_BUTTON_COLOUR = "rgb(245, 245, 245)";
        MENU_COLOUR_ACTIVE = "rgb(225, 225, 225)";
        BORDER_COLOUR = "#000000";
        FONT_COLOUR = "#000000";
    }
];
const ChangeTheme = () => {
    const nextThemeIndex = (CURRENT_THEME_INDEX == LoadTheme.length - 1) ? 0 : CURRENT_THEME_INDEX + 1;
    location.href = "/Src/Title/title.html?theme=" + String(nextThemeIndex);
};
const UpdateCSS = () => {
    document.body.style.setProperty('--colour1', BOTTOM_COLOUR);
    document.body.style.setProperty('--colour2', TOP_COLOUR);
    document.body.style.setProperty('--colour1Transparent', BOTTOM_COLOUR_BACKGROUND);
    document.body.style.setProperty('--colour2Transparent', TOP_COLOUR_BACKGROUND);
    document.body.style.setProperty('--objectColour', OBJECT_COLOUR);
    document.body.style.setProperty('--menuColour', MENU_COLOUR);
    document.body.style.setProperty('--menuButtonColour', MENU_BUTTON_COLOUR);
    document.body.style.setProperty('--menuColourActive', MENU_COLOUR_ACTIVE);
    document.body.style.setProperty('--borderColour', BORDER_COLOUR);
    document.body.style.setProperty('--fontColour', FONT_COLOUR);
};
LoadTheme[CURRENT_THEME_INDEX]();
UpdateCSS();
