var audio = new Audio("Audio/choose_your_character.ogg");
var audio2 = new Audio("Audio/2021-08-30_-_Boss_Time_-_www.FesliyanStudios.com.mp3");
var audio3 = new Audio("Audio/coin1.wav");
document.addEventListener("DOMContentLoaded", function(){
    hide_page()
});
a = document.getElementsByClassName("choices")

function play_audio() {
    audio2.play();
    audio2.currentTime=1;
    audio.play();
};
var ismute = false
function toggle_mute() {
    audio3.cloneNode(true).play();
    a = document.getElementById("mute")
    if (audio2.paused) {
        audio2.play();
        a.innerHTML="Mute"
        a.style = "border-color: var(--darkblue); color: var(--darkblue)";
        ismute = false;
        console.log(ismute)
    }
    else {
        audio2.pause();
        a.innerHTML="Unmute"
        a.style = "border-color: var(--lightblue);  color:var(--lightblue)";
        ismute = true;
        console.log(ismute)
    }
}

function hide_page() {
    a = document.getElementById("instructions").style.visibility = "hidden";
    // b = document.getElementsByClassName("choices")[0].style.visibility = "hidden";
    c = document.getElementsByTagName("footer")[0].style.visibility = "hidden";
    b = document.getElementsByClassName("choice_logo_shape");
    d = document.getElementsByClassName("choice_text");
    e = document.getElementsByClassName("screen");
    f = document.getElementById("mute").style.visibility = "hidden"
    for(i=0;i<b.length;i++) {
        b[i].style.visibility = "hidden";
        d[i].style.visibility = "hidden";
        e[i].style.visibility = "hidden";
    }
};

function load_page() {
    a = document.getElementById("instructions").style.visibility = "visible";
    // b = document.getElementsByClassName("choices")[0].style.visibility = "visible";
    c = document.getElementsByTagName("footer")[0].style.visibility = "visible";
    d = document.getElementsByClassName("starter")[0].style.visibility = "hidden";
    b = document.getElementsByClassName("choice_logo_shape");
    d = document.getElementsByClassName("choice_text");
    e = document.getElementsByClassName("screen");
    f = document.getElementById("mute").style.visibility = "visible"
    for(let i=0;i<b.length;i++) {
        b[i].style.visibility = "visible";
        d[i].style.visibility = "visible";
        e[i].style.visibility = "visible";
    }
    // a.classList.add('animate__animated');
    play_audio();
};

function select_option() {
    if (!ismute) {
        audio3.cloneNode(true).play();
    }

}