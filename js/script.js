"use strict";

// import data from './hrt.json' assert {type: 'json'};

window.addEventListener("keydown", checkKeyPressed, false);

let escapeTimerHandle = 0;
let escapeCount = 0;
function checkKeyPressed(evt) {
    if (evt.key === "Escape" || evt.key === "Esc") {
        clearTimeout(escapeTimerHandle);
        escapeCount++;
        if (escapeCount == 3) {
            window.location.replace("https://classroom.google.com/h");
        } else {
            escapeTimerHandle = setTimeout(function () {
                escapeCount = 0;
            }, 1000);
        }
    }
}

let data;

async function populate(url) {
    const request = new Request(url);
    const btn = document.getElementById("start-btn");

    btn.disabled = true;
    btn.querySelector(".btn-graphics").textContent = "loading..."
    const response = await fetch(request);

    const req = response.json();
    req.then(() => {
        btn.disabled = false;
        btn.querySelector(".btn-graphics").textContent = "Start"
        console.log(response)
    })
    data = await req;
}
populate("./js/hrt.json");

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const eBased = document.getElementById("choice-estrogen");
const tBased = document.getElementById("choice-testosterone");
const gallery = document.querySelector(".gallery-options");
const medicineNextBtn = document.getElementById("medicine-next");
const ageNextBtn = document.getElementById("age-next");
const hrtTypeTemplate = document.querySelector('#hrt-option-template');
const medicineTemplate = document.querySelector('#medicine-option-template');
const hospitalTemplate = document.querySelector('#hospital-option-template');
const summary = document.getElementById("summary-table-content");
const checkedStyle = document.styleSheets[4].cssRules[16].cssText;
const hospitalHoverStyle = document.styleSheets[4].cssRules[22].cssText;
const hospitalCheckedStyle = document.styleSheets[4].cssRules[17].cssText;
const hospitalBorderStyle = document.styleSheets[4].cssRules[21].cssText;
const itemRow = document.getElementById("item-row");
const groupHeader = document.querySelector("#group-group-header")
const itemGroupHeader = document.querySelector("#item-group-header")
const totalData = document.getElementById("summary-total");
const ageSelect = document.getElementById("age-select");
let age = null;

ageNextBtn.addEventListener("click", (e) => {
    const parentsWarning = document.querySelector("#warning-under-21");
    const under18Warning = document.querySelector("#warning-under-18")
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
        under18Warning.textContent = "";
        under18Warning.classList.add("hidden");
    }
});

let lifeTimeCheckbox = false;

document.getElementById("lifetime-checkbox").addEventListener("input", (e) => {
    lifeTimeCheckbox = e.target.checked;
});

function populateTablePrices(rows, medicine, total) {
    const times = [1, 30, 365.2425, (100 - age) * 365.2425]
    if (lifeTimeCheckbox) times.pop(3)

    let dailyPrice = (medicine.price * parseFloat(medicine.dose)) / parseFloat(medicine.interval);
    if (medicine.type == "injection") {
        dailyPrice /= medicine.unitSize;
    }
    for (let i = 0; i < times.length; i++) {
        rows[i + 1].textContent = (dailyPrice * times[i]).toFixed(2);
        total[i + 2].textContent = (dailyPrice * times[i] + parseFloat(total[i + 2].textContent)).toFixed(2);
    }
}

ageSelect.addEventListener("change", (e) => {
    age = parseInt(e.target.value);
})

medicineNextBtn.addEventListener("click", (e) => {
    const headData = document.querySelector("#summary-table-head")
    if (lifeTimeCheckbox) {

        if (headData.querySelectorAll("td").length > 5) {
            headData.removeChild(headData.lastElementChild)
        }
        if (totalData.querySelectorAll("td").length > 5) {
            totalData.removeChild(totalData.lastElementChild)
        }
    } else {
        if (headData.querySelectorAll("td").length < 6) {
            const lifeTimeHeader = document.createElement("td")
            lifeTimeHeader.className = "align-right";
            lifeTimeHeader.textContent = "Lifetime Cost"
            headData.appendChild(lifeTimeHeader)
        }

        if (totalData.querySelectorAll("td").length < 6) {
            const lifeTimeTotal = document.createElement("td")
            lifeTimeTotal.className = "align-right";
            totalData.appendChild(lifeTimeTotal)
        }
    }
    while (summary.lastElementChild) {
        summary.removeChild(summary.lastElementChild);
    }
    let headerRow = groupHeader.content.cloneNode(true);
    const header = headerRow.querySelector("th");

    let currentRow = headerRow.querySelector("tr");
    for (let i = 0; i < 4 - 1 * lifeTimeCheckbox; i++) {
        totalData.querySelectorAll("td")[i + 2].textContent = 0;
    }
    for (const medicine of chosenMeds) {
        if (medicine != null) {
            const head = itemGroupHeader.content.cloneNode(true);
            if (lifeTimeCheckbox) head.colspan = 4;
            const row = itemRow.content.cloneNode(true).querySelector("tr");
            if (lifeTimeCheckbox) row.removeChild(row.lastElementChild)
            const rowData = row.querySelectorAll("td");
            if (currentRow == null) {
                currentRow = document.createElement("tr");

            } else {
                header.rowSpan += 2;
            }

            head.querySelector("th").textContent = medicine.hormone;
            currentRow.appendChild(head);
            rowData[0].textContent = medicine.brand;
            populateTablePrices(rowData, medicine, totalData.querySelectorAll("td"));
            summary.appendChild(currentRow);
            currentRow = null;
            summary.appendChild(row);
        }
    }
});

function getPrice(hospital, medicineBrand) {
    for (const hospitalMed of data.hospitals[hospital].hrt) {
        if (hospitalMed.brand == medicineBrand) {
            return hospitalMed.price;
        }
    }
    return -1;
}


const chosenMeds = [null, null];

function populatePrices(hospitalOptions, med, id, category, dosage, interval, hormoneType) {
    let i = 1;
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
    const unitName = med.type == "injection" ? medTypeData.unitSizeName : medTypeData.itemNamePlural

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
    const dosageOutput = medicineOption.querySelector(".dosageOutput");
    const intervalOutput = medicineOption.querySelector(".intervalOutput");
    dosageOutput.textContent = updateValue(dosage.value, dosage.step, unitName);
    intervalOutput.textContent = updateValue(
        interval.value, med.interval.step, "days");

    interval.min = med.interval.min;
    interval.max = med.interval.max;
    interval.step = med.interval.step;
    interval.value = med.interval.default;

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

function addMedicineInfo(medicineOption, med, id, i, category) {
    const label = medicineOption.querySelector("label");
    const input = medicineOption.querySelector("input");
    const img = medicineOption.querySelector("img");
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
    input.id = id + "-option-" + i;
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

function populateMedicineCategory(container, meds, id, category, hormoneType) {
    let i = 1;
    for (const med of meds) {
        const medicineOption = medicineTemplate.content.cloneNode(true);
        const hospitalOptions = medicineOption.querySelector(
            ".hospital-options-container");
        const input = medicineOption.querySelector("input");
        const dosage = medicineOption.querySelector(".dose");
        const interval = medicineOption.querySelector(".interval");

        addMedicineInfo(medicineOption, med, id, i, category);
        setMedicineInputRanges(
            medicineOption, med, parseInt(id.charAt(5)) - 1);
        container.append(medicineOption.querySelector("article"));
        populatePrices(hospitalOptions, med, input.id, category, dosage,
            interval, hormoneType);
        i++;
    }
}
let hormones;
function populateGallery(e) {
    while (gallery.lastElementChild) {
        gallery.removeChild(gallery.lastElementChild);
    }
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
        const container = category.querySelector("div");
        populateMedicineCategory(container, hormones[key].meds, "type-" + i, key, hormones[key].string);
        gallery.append(category.querySelector("section"));
        i++;
        //Do stuff where key would be 0 and value would be the object
    }
}

const progressBar = document.getElementById("progress");
const mainContent = document.getElementById("main");
mainContent.addEventListener("scroll", (e) => {
    progressBar.value = (100 * mainContent.scrollTop / (mainContent.scrollHeight - window.innerHeight)).toFixed(2);
});

function changeMedicineStyles(e) {
    chosenMeds[0] = null;
    chosenMeds[1] = null;
    document.styleSheets[4].deleteRule(22)
    document.styleSheets[4].deleteRule(21)
    document.styleSheets[4].deleteRule(17)
    document.styleSheets[4].deleteRule(16);
    let first = "pink";
    let second = "blue";
    if (e.currentTarget.id == "choice-testosterone") {
        first = "blue";
        second = "pink";
    }
    document.querySelector("#medicine-select-page").classList.add(first);
    document.querySelector("#medicine-select-page").classList.remove(second);
    document.styleSheets[4].insertRule(
        checkedStyle.replace("--light" + second, "--light" + first), 16)
    document.styleSheets[4].insertRule(
        hospitalCheckedStyle.replace("--" + first, "--" + second), 17)
    document.styleSheets[4].insertRule(
        hospitalBorderStyle.replace("--" + first, "--" + second), 21)
    document.styleSheets[4].insertRule(
        hospitalHoverStyle.replace("--" + first, "--" + second), 22)
}

tBased.addEventListener("pointerdown", (e) => {
    // alert("pointer")
    changeMedicineStyles(e);
    populateGallery(e);
});

eBased.addEventListener("pointerdown", (e) => {
    // alert("pointer")
    changeMedicineStyles(e);
    populateGallery(e);
});

tBased.addEventListener("mousedown", (e) => {
    // alert("mouse")
    changeMedicineStyles(e);
    populateGallery(e);
});

eBased.addEventListener("mousedown", (e) => {
    // alert("mouse")
    changeMedicineStyles(e);
    populateGallery(e);
});

const medForwardBtn = document.getElementById("medicine-forward");
const medBackwardBtn = document.getElementById("medicine-backward");
const itemWidth = 293.24
medForwardBtn.addEventListener("click", (e) => {
    gallery.scrollBy({
        left: itemWidth,
        behavior: 'smooth'
    });
    // console.log(gallery.scrollLeft)
});

medBackwardBtn.addEventListener("click", (e) => {
    gallery.scrollBy({
        left: -itemWidth,
        behavior: 'smooth'
    });
    // console.log(gallery.scrollLeft)
});