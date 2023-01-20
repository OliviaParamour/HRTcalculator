"use strict";

export { gallery, chosenMeds, populateGallery};

/**
 * Loads a json file, when loaded enable start button
 * @param {String} url url of the json file
 * @returns the json file
 */
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

/**
 * Retrieves the price of the medication
 * @param {String} hospital the hospital shortform code, i.e. TTSH, CGH
 * @param {String} medicineBrand the brand name of the medicine
 * @returns the price of the medicine
 */
function getPrice(hospital, medicineBrand) {
    for (const hospitalMed of data.hospitals[hospital].hrt) {
        if (hospitalMed.brand == medicineBrand) {
            return hospitalMed.price;
        }
    }
    return -1;
}

/**
 * Populate prices for hospital button
 * @param {Node} medicineCard The medicine card Node
 * @param {Object} med The medicine data tree
 * @param {String} key The specific hormone type name
 * @param {String} hormoneName The name of the hormone
 */
function populatePrices(medicineCard, med, key, hormoneName) {
    let i = 1;
    const hospitalOptions = medicineCard.querySelector(
        ".hospital-options-container");
    const id = medicineCard.querySelector("input").id;
    const dosage = medicineCard.querySelector(".dose");
    const interval = medicineCard.querySelector(".interval");

    for (const hospital of med.sources) {
        const hospitalOption = hospitalTemplate.content.cloneNode(true);

        const label = hospitalOption.querySelector(".hospital-option");
        const graphic = hospitalOption.querySelector(".hospital-option-graphic")
        const input = hospitalOption.querySelector("input");
        label.tabIndex = 0;
        label.htmlFor = id + "-hospital-" + i;
        input.id = id + "-hospital-" + i;
        input.name = key + "hospital";
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
                    "hormone": hormoneName,
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

/**
 * Updates the value with the right number of zeroes
 * @param {Number} value A floating point value
 * @param {Number} step The step of the range input
 * @param {String} unitName The unit name, mg, mcg, ml, etc
 * @returns a corrected fixed string representation of the number
 */
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

/**
 * Sets the input ranges of dose and interval on the medicine card
 * @param {Node} medicineCard The medicine card Node
 * @param {Object} med The medicine data tree
 * @param {String} id The id of the medicine card
 */
function setMedicineInputRanges(medicineCard, med, id) {
    const dosage = medicineCard.querySelector(".dose");
    const interval = medicineCard.querySelector(".interval");
    const medTypeData = data.medicineType[med.type];
    const unitName = med.type == "injection" ? medTypeData.unitSizeName
                                             : medTypeData.itemNamePlural;
    const dosageOutput = medicineCard.querySelector(".dosageOutput");
    const intervalOutput = medicineCard.querySelector(".intervalOutput");

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

/**
 * Sets the Medicine Card's information
 * @param {Node} medicineCard The medicine card node
 * @param {Object} med The medicine data tree
 * @param {String} id The id of the medicine type node
 * @param {Number} i The local id number for the current medicine node
 * @param {String} hormoneName The name of the hormone
 */
function setMedicineInfo(medicineCard, med, id, i, hormoneName) {
    const label = medicineCard.querySelector("label");
    const input = medicineCard.querySelector("input");
    const img = medicineCard.querySelector(".medicine-choice-logo");
    const brandText = medicineCard.querySelector("h4");
    const activeIngredientText = medicineCard.querySelector("p");
    const medInfo = medicineCard.querySelector(".medicine-info");
    const soldSize = medInfo.querySelector(".sold-size");
    const unitSize = medInfo.querySelector(".unit-size");
    const medTypeData = data.medicineType[med.type];

    img.src = medTypeData.logo;
    img.alt = med.type;

    label.tabIndex = 0;
    label.htmlFor = id + "-option-" + i;
    input.id = label.htmlFor;
    input.name = hormoneName;
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

/**
 * Populates the medicine category with medicine cards
 * @param {Node} category The medicine category/hormone type node to populate
 * @param {Object} hormone The hormone data tree for the hormone type
 * @param {String} key The specific hormone type name
 * @param {String} id The id of medicine/hormone type node
 */
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


/**
 * Populates the gallery with a hormone type and hands it off to other functions
 * to populate that hormone type, i.e. medicine category
 * @param {Event} e
 */
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