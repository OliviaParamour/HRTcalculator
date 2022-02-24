var audio = new Audio("Audio/choose_your_character.ogg");
var audio2 = new Audio("chiptune_bombard_and_biniou.mp3");
document.addEventListener("DOMContentLoaded", function(){
    hide_page()
});
a = document.getElementsByClassName("choices")

function play_audio() {
    audio.play();
    // audio2.play();
};

function hide_page() {
    a = document.getElementsByClassName("instructions")[0].style.visibility = "hidden";
    // b = document.getElementsByClassName("choices")[0].style.visibility = "hidden";
    c = document.getElementsByTagName("footer")[0].style.visibility = "hidden";
    b = document.getElementsByClassName("choice_logo_shape");
    d = document.getElementsByClassName("choice_text");
    e = document.getElementsByClassName("screen");
    for(i=0;i<b.length;i++) {
        b[i].style.visibility = "hidden";
        d[i].style.visibility = "hidden";
        e[i].style.visibility = "hidden";
    }
};

function load_page() {
    a = document.getElementsByClassName("instructions")[0].style.visibility = "visible";
    // b = document.getElementsByClassName("choices")[0].style.visibility = "visible";
    c = document.getElementsByTagName("footer")[0].style.visibility = "visible";
    d = document.getElementsByClassName("starter")[0].style.visibility = "hidden";
    b = document.getElementsByClassName("choice_logo_shape");
    d = document.getElementsByClassName("choice_text");
    e = document.getElementsByClassName("screen");
    for(let i=0;i<b.length;i++) {
        b[i].style.visibility = "visible";
        d[i].style.visibility = "visible";
        e[i].style.visibility = "visible";
    }
    // a.classList.add('animate__animated');
    play_audio();
};