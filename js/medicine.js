"use strict";

export { gallery, chosenMeds, populateGallery};

async function populate(url) {
    const request = new Request(url);
    const btn = document.getElementById("start-btn");

    btn.disabled = true;
    btn.querySelector(".btn-graphics").textContent = "loading..."
    const response = await fetch(request);

    const req = await response.json();
    btn.disabled = false;
    btn.querySelector(".btn-graphics").textContent = "Start";
    return req;
}

const data = await populate("./js/hrt.json");
console.log(data)
const hrtTypeTemplate = document.querySelector('#hrt-option-template');
const medicineTemplate = document.querySelector('#medicine-option-template');
const hospitalTemplate = document.querySelector('#hospital-option-template');
const gallery = document.querySelector(".gallery-options");
const currency = new Intl.NumberFormat(
    'en-US', { style: 'currency', currency: 'USD' });
const chosenMeds = [null, null];

function getPrice(hospital, medicineBrand) {
    for (const hospitalMed of data.hospitals[hospital].hrt) {
        if (hospitalMed.brand == medicineBrand) {
            return hospitalMed.price;
        }
    }
    return -1;
}

function populatePrices(medicineOption, med, category, hormoneType) {
    let i = 1;
    const hospitalOptions = medicineOption.querySelector(
        ".hospital-options-container");
    const id = medicineOption.querySelector("input").id;
    const dosage = medicineOption.querySelector(".dose");
    const interval = medicineOption.querySelector(".interval");

    for (const hospital of med.sources) {
        const hospitalOption = hospitalTemplate.content.cloneNode(true);

        const label = hospitalOption.querySelector(".hospital-option");
        const graphic = hospitalOption.querySelector(".hospital-option-graphic")
        const input = hospitalOption.querySelector("input");
        label.tabIndex = 0;
        label.htmlFor = id + "-hospital-" + i;
        input.id = id + "-hospital-" + i;
        input.name = category + "hospital";
        graphic.querySelector("h6").textContent = hospital;

        const price = getPrice(hospital, med.brand);
        if (price > 0) {
            graphic.querySelector("p").textContent = "$" + price.toFixed(2)
            hospitalOptions.append(hospitalOption);
            input.addEventListener("click", (e) => {
                chosenMeds[parseInt(id.charAt(5)) - 1] = {
                    "brand": med.brand,
                    "dose": dosage.value,
                    "interval": interval.value,
                    "type": med.type,
                    "price": price,
                    "hormone": hormoneType,
                    "unitSize": med.unitSize
                }
            })
        }
        i++;
    }
}

function capitalise(text) {
    return text[0].toUpperCase() + text.slice(1, text.length);
}

function updateValue(value, step, unitName) {
    if (step % 1 == 0) return value + " " + unitName;
    let i = 1;
    do {
        if (step * (10 ** i) % 1 == 0) return parseFloat(value).toFixed(i) + " " + unitName;
        i++;
    }
    while (step * i % 1 != 0 && i < 5)
    return value + unitName;
}

function setMedicineInputRanges(medicineOption, med, id) {
    const dosage = medicineOption.querySelector(".dose");
    const interval = medicineOption.querySelector(".interval");
    const medTypeData = data.medicineType[med.type];
    const unitName = med.type == "injection" ? medTypeData.unitSizeName
                                             : medTypeData.itemNamePlural;
    const dosageOutput = medicineOption.querySelector(".dosageOutput");
    const intervalOutput = medicineOption.querySelector(".intervalOutput");

    dosage.min = med.dose.min;
    dosage.max = med.dose.max;
    dosage.step = med.dose.step;
    dosage.value = med.dose.default;
    if (med.type == "injection") {
        dosage.min *= med.unitSize;
        dosage.max *= med.unitSize;
        dosage.step *= med.unitSize;
        dosage.value *= med.unitSize;
    }

    interval.min = med.interval.min;
    interval.max = med.interval.max;
    interval.step = med.interval.step;
    interval.value = med.interval.default;

    dosageOutput.textContent = updateValue(dosage.value, dosage.step, unitName);
    intervalOutput.textContent = updateValue(
        interval.value, med.interval.step, "days");

    dosage.addEventListener("input", (e) => {
        dosageOutput.textContent = updateValue(e.target.value, e.target.step, unitName);
        if (chosenMeds[id] != null && chosenMeds[id].brand == med.brand)
            chosenMeds[id].dose = e.target.value;
    });

    interval.addEventListener("input", (e) => {
        intervalOutput.textContent = updateValue(e.target.value, e.target.step, "days");
        if (chosenMeds[id] != null && chosenMeds[id].brand == med.brand)
            chosenMeds[id].interval = e.target.value;
    });
}

function setMedicineInfo(medicineOption, med, id, i, category) {
    const label = medicineOption.querySelector("label");
    const input = medicineOption.querySelector("input");
    const img = medicineOption.querySelector(".medicine-choice-logo");
    const brandText = medicineOption.querySelector("h4");
    const activeIngredientText = medicineOption.querySelector("p");
    const medInfo = medicineOption.querySelector(".medicine-info");
    const soldSize = medInfo.querySelector(".sold-size");
    const unitSize = medInfo.querySelector(".unit-size");
    const medTypeData = data.medicineType[med.type];

    img.src = medTypeData.logo;
    img.alt = med.type;

    label.tabIndex = 0;
    label.htmlFor = id + "-option-" + i;
    input.id = label.htmlFor;
    input.name = category;
    brandText.textContent = med.brand;
    activeIngredientText.textContent = med.activeIngredient;

    let soldSizeText = "Sold in " + med.groupSize + " ";
    soldSizeText += med.groupSize > 1 ? medTypeData.itemNamePlural
        : medTypeData.itemName;
    if (med.type != "injection") soldSizeText += " per " + medTypeData.groupName;

    soldSize.textContent = soldSizeText;
    unitSize.textContent = capitalise(medTypeData.itemName)
                         + " size: "
                         + med.unitSize
                         + medTypeData.unitSizeName;
}

function populateMedicineCategory(category, hormone, key, id) {
    const container = category.querySelector(".medicine-choices");
    let i = 1;
    for (const med of hormone.meds) {
        const medicineOption = medicineTemplate.content.cloneNode(true);
        setMedicineInfo(medicineOption, med, id, i, key);
        setMedicineInputRanges(
                medicineOption, med, parseInt(id.charAt(5)) - 1);
        populatePrices(medicineOption, med, key, hormone.string);
        container.append(medicineOption.querySelector("article"));
        i++;
    }
}

function populateGallery(e) {
    while (gallery.lastElementChild) {
        gallery.removeChild(gallery.lastElementChild);
    }
    let hormones;
    // const warning = document.querySelector("#warning-not-loaded");
    if (e.currentTarget.id == "choice-estrogen") {
        hormones = data.hormones.estrogenBased;
        // warning.classList.add("hidden");
    } else if (e.currentTarget.id == "choice-testosterone") {
        hormones = data.hormones.testosteroneBased;
        // warning.classList.add("hidden");
    } else {
        console.log("content not loaded", e.currentTarget);
        // warning.classList.remove("hidden");
    }
    let i = 1;
    for (const key in hormones) {
        const category = hrtTypeTemplate.content.cloneNode(true);
        category.querySelector(".medicine-type").id = "type-" + i;
        category.querySelector("h3").textContent = hormones[key].string;
        populateMedicineCategory(category, hormones[key], key, "type-" + i);
        gallery.append(category.querySelector("section"));
        i++;
    }
}