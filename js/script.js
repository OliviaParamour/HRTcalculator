"use strict";

// import data from './hrt.json' assert {type: 'json'};
// console.log("Test")


async function populate(url) {
    const request = new Request(url);
    const response = await fetch(request);
    return  await response.json();
}
const data = await populate("./js/hrt.json");




const eBased = document.getElementById("choice-estrogen");
const tBased = document.getElementById("choice-testosterone");
const gallery = document.getElementsByClassName("gallery-options")[0];
const hrtTypeTemplate = document.querySelector('#hrt-option-template');
// console.log(hrtTypeTemplate)
const medicineTemplate = document.querySelector('#medicine-option-template');
const hospitalTemplate = document.querySelector('#hospital-option-template');
// console.log(gallery)

function getPrice(hospital, medicineBrand) {
    for (const hospitalMed of data.hospitals[hospital].hrt) {
        if(hospitalMed.brand == medicineBrand) {
            return hospitalMed.price;
        }
    }
    return -1;
}

function populatePrices(hospitalOptions, sources, brand, id, category) {
    let i = 1;
    for(const hospital of sources) {
        const hospitalOption = hospitalTemplate.content.cloneNode(true);

        const label = hospitalOption.querySelector(".hospital-option");
        const input = hospitalOption.querySelector("input");
        label.tabIndex = 0;
        label.htmlFor = id + "-hospital-" + i;
        input.id = id + "-hospital-" + i;
        input.name = category +"hospital";
        hospitalOption.querySelector("h6").textContent = hospital;

        const price = getPrice(hospital, brand);
        if (price>0) {
            hospitalOption.querySelector("p").textContent = "$" + price.toFixed(2)
            hospitalOptions.appendChild(hospitalOption);
        }
        i++;
    }
}

function populateMedicineCategory(container, meds, id, category) {
    let i = 1;
    for(const med of meds) {
        const medicineOption = medicineTemplate.content.cloneNode(true);
        const label = medicineOption.querySelector("label");
        const input = medicineOption.querySelector("input");
        const img = medicineOption.querySelector("img");

        if(med.type == "pills") {
          img.src = "https://cdn.glitch.global/e41cbd5e-2d0c-4097-956a-79ca94cd4f3b/pills.png"
          img.alt = "Pills"
        }
        else if(med.type == "patches") {
          img.src = "https://cdn.glitch.global/e41cbd5e-2d0c-4097-956a-79ca94cd4f3b/patch.png"
          img.alt = "Patches"
        }
        else if(med.type == "injection") {
          img.src = "https://cdn.glitch.global/e41cbd5e-2d0c-4097-956a-79ca94cd4f3b/syringe.png"
          img.alt = "Syringe"
        }
        label.tabIndex = 0;

        label.htmlFor  = id + "-option-" + i;
        input.id = id + "-option-" + i;
        input.name = category;
        medicineOption.querySelector("h4").textContent = med.brand;
        medicineOption.querySelector("p").textContent = med.activeIngredient;
        medicineOption.querySelector("p").textContent = med.activeIngredient;
        const hospitalOptions = medicineOption.querySelector(".hospital-options-container")
        populatePrices(hospitalOptions, med.sources, med.brand,  input.id, category);
        container.appendChild(medicineOption);
        i++;
    }
}

function populateGallery(e) {
    console.log(data);
    while (gallery.lastElementChild) {
        gallery.removeChild(gallery.lastElementChild);
    }
    let hormones;
    if(e.target.id == "choice-estrogen") {
        hormones = data.hormones.estrogenBased;
    } else if (e.target.id =="choice-testosterone") {
        hormones = data.hormones.testosteroneBased;
    }
    let i = 1;
    for (const key in hormones) {
        const category = hrtTypeTemplate.content.cloneNode(true);
        category.querySelector(".medicine-type").id = "type-"+i;
        category.querySelector("h3").textContent = hormones[key].string;
        const container = category.querySelector("div");
        populateMedicineCategory(container, hormones[key].meds, "type-"+i, key);
        gallery.appendChild(category);
        i++;
        //Do stuff where key would be 0 and value would be the object
    }
}

const progressBar = document.getElementById("progress");
const mainContent = document.getElementById("main");
mainContent.addEventListener("scroll", (e) => {
  progressBar.value = (100 * mainContent.scrollTop/(mainContent.scrollHeight-window.innerHeight)).toFixed(2);
});


document.getElementById("choice-testosterone").addEventListener("click", (e) => {
    console.log(document.querySelector("#medicine-select-page"))
    document.querySelector("#medicine-select-page").classList.add("blue");
    document.querySelector("#medicine-select-page").classList.remove("pink");
});

document.getElementById("choice-estrogen").addEventListener("click", (e) => {
    console.log(document.querySelector("#medicine-select-page"))
    document.querySelector("#medicine-select-page").classList.add("pink");
    document.querySelector("#medicine-select-page").classList.remove("blue");
});

//  var btn = document.createElement("button");
//  document.body.appendChild(btn);
eBased.addEventListener("click", populateGallery);
tBased.addEventListener("click", populateGallery);