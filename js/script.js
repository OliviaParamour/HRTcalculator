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
const gallery = document.querySelector(".gallery-options");
const medicineNextBtn = document.getElementById("medicine-next");
const ageNextBtn = document.getElementById("age-next");
const hrtTypeTemplate = document.querySelector('#hrt-option-template');
// console.log(hrtTypeTemplate)
const medicineTemplate = document.querySelector('#medicine-option-template');
const hospitalTemplate = document.querySelector('#hospital-option-template');
const summary = document.getElementById("summary-table-content");
const checkedStyle = document.styleSheets[4].cssRules[8].cssText;
const itemRow = document.getElementById("item-row");
const groupHeader = document.querySelector("#group-group-header")
const itemGroupHeader = document.querySelector("#item-group-header")
const totalData = document.getElementById("summary-total").querySelectorAll("td");
// console.log(checkedStyle)
const ageSelect = document.getElementById("age-select");
let age = null;

ageNextBtn.addEventListener("click", (e) => {
    if(ageSelect.value=="") {
        ageSelect.value = 13;
        age = 13;
    }
    if(age < 18) {
        document.querySelector(".warning").textContent = "At age " + age +", you will need to wait until you are 18 to start HRT in Singapore."
    } else {
        document.querySelector(".warning").textContent = "";
    }
});

function populateTablePrices(rows, medicine, total) {
    const times = [1, 30, 365.2425, (100-age) * 365.2425]
    console.log((100-age), times[3], medicine.price)

    const dailyPrice = (medicine.price * parseFloat(medicine.dose))/parseFloat(medicine.interval);
    console.log(dailyPrice, medicine.dose, medicine.interval);
    for (let i = 0; i < 4; i++) {
        rows[i+1].textContent = (dailyPrice * times[i]).toFixed(2);
        // console.log(total)
        total[i+2].textContent = (dailyPrice * times[i] + parseFloat(total[i+2].textContent)).toFixed(2);
        // console.log(rows[i].textContent);
    }
}

ageSelect.addEventListener("change", (e) => {
    age = parseInt(e.target.value);
    console.log(age);
})

medicineNextBtn.addEventListener("click", (e) => {
    while (summary.lastElementChild) {
        summary.removeChild(summary.lastElementChild);
    }
    let headerRow = groupHeader.content.cloneNode(true);
    const header = headerRow.querySelector("th");
    let currentRow = headerRow
    for (let i = 0; i < 4; i++) {
        totalData[i+2].textContent = 0;
    }
    for (const medicine of chosenMeds) {
        if (medicine != null) {
            const head = itemGroupHeader.content.cloneNode(true);
            const row = itemRow.content.cloneNode(true);
            if (currentRow == null) {
                currentRow = document.createElement("td");
                currentRow.appendChild(document.createElement("tr"));
                header.rowSpan += 2;
            }
            head.querySelector("th").textContent = medicine.type;
            const rowData = row.querySelectorAll("td");
            rowData[0].textContent = medicine.brand;
            populateTablePrices(rowData, medicine, totalData);
            currentRow.querySelector("tr").appendChild(head);
            summary.appendChild(currentRow);
            currentRow = null;
            summary.appendChild(row);
        }
    }
});

function getPrice(hospital, medicineBrand) {
    for (const hospitalMed of data.hospitals[hospital].hrt) {
        if(hospitalMed.brand == medicineBrand) {
            return hospitalMed.price;
        }
    }
    return -1;
}


const chosenMeds = [null, null];

function populatePrices(hospitalOptions, sources, brand, id, category, dosage, interval, hormoneType) {
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
            input.addEventListener("click", (e) => {
                console.log(brand, hospital.name, price);
                chosenMeds[parseInt(id.charAt(5))-1] = {
                    "brand": brand,
                    "dose": dosage.value,
                    "interval":interval.value,
                    "price" :price,
                    "type": hormoneType
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
    if(step % 1 == 0) return value + " " + unitName;
    let i = 1;
    do {
        if(step * 10 ** i % 1 == 0) return parseFloat(value).toFixed(i)  + " " + unitName;
        i++;
    }
    while (step * i % 1 != 0 && i < 5)
    return value + unitName;
}

function populateMedicineCategory(container, meds, id, category, hormoneType) {
    let i = 1;
    for(const med of meds) {
        const medicineOption = medicineTemplate.content.cloneNode(true);
        const label = medicineOption.querySelector("label");
        const input = medicineOption.querySelector("input");
        const img = medicineOption.querySelector("img");
        const medTypeData = data.medicineType[med.type];
        const medInfo = medicineOption.querySelector(".medicine-info");
        const dosage = medicineOption.querySelector(".dose");
        const interval = medicineOption.querySelector(".interval");

        const dosageOutput = medicineOption.querySelector(".dosageOutput");
        const intervalOutput = medicineOption.querySelector(".intervalOutput");
        img.src = medTypeData.logo;
        img.alt = med.type;

        label.tabIndex = 0;
        label.htmlFor  = id + "-option-" + i;
        input.id = id + "-option-" + i;
        input.name = category;

        medicineOption.querySelector("h4").textContent = med.brand;
        medicineOption.querySelector("p").textContent = med.activeIngredient;

        let soldSizeText = "Sold in " + med.groupSize + " ";
        soldSizeText += med.groupSize > 1 ? medTypeData.itemNamePlural : medTypeData.itemName;
        if(med.type != "injection") soldSizeText += " per " + medTypeData.groupName;

        medInfo.querySelector(".sold-size").textContent = soldSizeText;
        medInfo.querySelector(".unit-size").textContent = capitalise(medTypeData.itemName) + " size: " + med.unitSize + medTypeData.unitSizeName;
        dosage.min = med.dose.min;
        dosage.max = med.dose.max;
        dosage.step = med.dose.step;
        dosage.value = med.dose.default;
        dosageOutput.textContent = updateValue(dosage.value, med.dose.step, medTypeData.itemNamePlural);
        dosage.addEventListener("input", (e) => {
            dosageOutput.textContent = updateValue(e.target.value, e.target.step, medTypeData.itemNamePlural);
            if(chosenMeds[parseInt(id.charAt(5))-1].brand == med.brand) {
                chosenMeds[parseInt(id.charAt(5))-1].dose = e.target.value;
            }
        });


        // console.log(dosage.min, dosage.max, dosage.step, dosage.value);

        interval.min = med.interval.min;
        interval.max = med.interval.max;
        interval.step = med.interval.step;
        interval.value = med.interval.default;
        intervalOutput.textContent = updateValue(interval.value, med.interval.step, "days")
        interval.addEventListener("input", (e) => {
            intervalOutput.textContent = updateValue(e.target.value, e.target.step, "days");
            if(chosenMeds[parseInt(id.charAt(5))-1].brand == med.brand) {
                chosenMeds[parseInt(id.charAt(5))-1].interval = e.target.value;
            }
        })

        const hospitalOptions = medicineOption.querySelector(".hospital-options-container")
        populatePrices(hospitalOptions, med.sources, med.brand,  input.id, category, dosage, interval, hormoneType);
        container.appendChild(medicineOption);
        i++;
    }
}

function populateGallery(e) {
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
        populateMedicineCategory(container, hormones[key].meds, "type-"+i, key, hormones[key].string);
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


tBased.addEventListener("click", (e) => {
    document.querySelector("#medicine-select-page").classList.add("blue");
    document.querySelector("#medicine-select-page").classList.remove("pink");
    document.styleSheets[4].deleteRule(8)
    document.styleSheets[4].insertRule(checkedStyle.replace("--blue", "--pink"), 8)
});

eBased.addEventListener("click", (e) => {
    document.querySelector("#medicine-select-page").classList.add("pink");
    document.querySelector("#medicine-select-page").classList.remove("blue");
    document.styleSheets[4].deleteRule(8)
    document.styleSheets[4].insertRule(checkedStyle, 8)
});

//  var btn = document.createElement("button");
//  document.body.appendChild(btn);
eBased.addEventListener("click", populateGallery);
tBased.addEventListener("click", populateGallery);