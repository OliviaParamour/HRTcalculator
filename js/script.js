"use strict";

import {changeMedicineStyles} from "./hrtpage.js"
import { gallery, chosenMeds, populateGallery} from "./medicine.js"
import { generateTable } from "./summary.js";

// age select
let age = null;
let lifeTimeCheckbox = false;
const ageSelect = document.getElementById("age-select");
ageSelect.addEventListener("change", (e) => {
    age = parseInt(e.target.value);
})

document.getElementById("age-next").addEventListener("click", (e) => {
    const parentsWarning = document.querySelector("#warning-under-21");
    const under18Warning = document.querySelector("#warning-under-18");
    if (ageSelect.value == "") {
        ageSelect.value = 13;
        age = 13;
    }
    if (age < 21) {
        parentsWarning.classList.remove("hidden");
    } else {
        parentsWarning.classList.add("hidden");
    }
    if (age < 18) {
        under18Warning.classList.remove("hidden");
        under18Warning.textContent = "At age " + age + ", you may have to wait until you are 18 to start HRT in Singapore."
    } else {
        // under18Warning.textContent = "";
        under18Warning.classList.add("hidden");
    }
});

document.getElementById("lifetime-checkbox").addEventListener("input", (e) => {
    lifeTimeCheckbox = e.target.checked;
});

//HRT Page
const itemWidth = 293.24

for(const button of document.getElementsByClassName("hrt-btn")) {
    button.addEventListener("pointerdown", (e) => {
        // alert("pointer")
        chosenMeds[0] = null;
        chosenMeds[1] = null;
        changeMedicineStyles(e);
        populateGallery(e);
        console.log("populated")
    });
    button.addEventListener("pointerdown", (e) => {
        mainContent.scrollBy({top:50, behavior:"smooth"})
        console.log("scroll")
    });
}

document.getElementById("medicine-forward").addEventListener("click", (e) => {
    gallery.scrollBy({
        left: itemWidth,
        behavior: 'smooth'
    });
});

document.getElementById("medicine-backward").addEventListener("click", (e) => {
    gallery.scrollBy({
        left: -itemWidth,
        behavior: 'smooth'
    });
});

// summary page
document.getElementById("medicine-next").addEventListener("click", (e) => {
    generateTable(e, chosenMeds, lifeTimeCheckbox, age);
});

// progress bar
const progressBar = document.getElementById("progress");
const mainContent = document.getElementById("main");
document.getElementById("progress").addEventListener("scroll", (e) => {
    progressBar.value = (100 * mainContent.scrollTop
                             / (mainContent.scrollHeight
                             - window.innerHeight)).toFixed(2);
});