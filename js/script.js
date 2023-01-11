"use strict";

// import data from './hrt.json' assert {type: 'json'};
// console.log("Test")

let data;

async function populate(url) {
    const request = new Request(url);
    const btn = document.getElementById("start-btn");

    btn.disabled = true;
    console.log(btn);
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
// console.log(hrtTypeTemplate)
const medicineTemplate = document.querySelector('#medicine-option-template');
const hospitalTemplate = document.querySelector('#hospital-option-template');
const summary = document.getElementById("summary-table-content");
const checkedStyle = document.styleSheets[4].cssRules[8].cssText;
const itemRow = document.getElementById("item-row");
const groupHeader = document.querySelector("#group-group-header")
const itemGroupHeader = document.querySelector("#item-group-header")
const totalData = document.getElementById("summary-total");
// console.log(checkedStyle)
const ageSelect = document.getElementById("age-select");
let age = null;

ageNextBtn.addEventListener("click", (e) => {
    if(ageSelect.value=="") {
        ageSelect.value = 13;
        age = 13;
    }
    if(age < 18) {
        document.querySelector(".warning").textContent = "At age " + age +", you may have to wait until you are 18 to start HRT in Singapore and you will need parental consent."
    } else {
        document.querySelector(".warning").textContent = "";
    }
});

let lifeTimeCheckbox = false;

document.getElementById("lifetime-checkbox").addEventListener("input", (e) => {
    lifeTimeCheckbox = e.target.checked;
});

function populateTablePrices(rows, medicine, total) {
    const times = [1, 30, 365.2425, (100-age) * 365.2425]
    if (lifeTimeCheckbox) times.pop(3)
    console.log((100-age), times[3], medicine.price)

    let dailyPrice = (medicine.price * parseFloat(medicine.dose))/parseFloat(medicine.interval);
    if(medicine.type=="injection") {
        console.log("injection");
        dailyPrice /= medicine.unitSize;
    }
    console.log(times.length);
    console.log(dailyPrice, medicine.dose, medicine.interval);
    for (let i = 0; i < times.length; i++) {
        rows[i+1].textContent = (dailyPrice * times[i]).toFixed(2);
        total[i+2].textContent = (dailyPrice * times[i] + parseFloat(total[i+2].textContent)).toFixed(2);
    }
}

ageSelect.addEventListener("change", (e) => {
    age = parseInt(e.target.value);
    console.log(age);
})

medicineNextBtn.addEventListener("click", (e) => {
    const headData = document.querySelector("#summary-table-head")
    console.log(totalData.querySelectorAll("td").length )
    if(lifeTimeCheckbox) {

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
    console.log(totalData.querySelectorAll("td").length )
    while (summary.lastElementChild) {
        summary.removeChild(summary.lastElementChild);
    }
    let headerRow = groupHeader.content.cloneNode(true);
    const header = headerRow.querySelector("th");

    let currentRow = headerRow.querySelector("tr");
    for (let i = 0; i < 4-1*lifeTimeCheckbox; i++) {
        totalData.querySelectorAll("td")[i+2].textContent = 0;
    }
    for (const medicine of chosenMeds) {
        if (medicine != null) {
            const head = itemGroupHeader.content.cloneNode(true);
            if (lifeTimeCheckbox) head.colspan=4;
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
            console.log(row, rowData)
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
        if(hospitalMed.brand == medicineBrand) {
            return hospitalMed.price;
        }
    }
    return -1;
}


const chosenMeds = [null, null];

function populatePrices(hospitalOptions, med, id, category, dosage, interval, hormoneType) {
    let i = 1;
    for(const hospital of med.sources) {
        const hospitalOption = hospitalTemplate.content.cloneNode(true);

        const label = hospitalOption.querySelector(".hospital-option");
        const graphic = hospitalOption.querySelector(".hospital-option-graphic")
        const input = hospitalOption.querySelector("input");
        label.tabIndex = 0;
        label.htmlFor = id + "-hospital-" + i;
        input.id = id + "-hospital-" + i;
        input.name = category +"hospital";
        graphic.querySelector("h6").textContent = hospital;

        const price = getPrice(hospital, med.brand);
        if (price>0) {
            graphic.querySelector("p").textContent = "$" + price.toFixed(2)
            hospitalOptions.appendChild(hospitalOption);
            input.addEventListener("click", (e) => {
                console.log(med.brand, hospital.properName, price);
                chosenMeds[parseInt(id.charAt(5))-1] = {
                    "brand": med.brand,
                    "dose": dosage.value,
                    "interval":interval.value,
                    "type": med.type,
                    "price" :price,
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
    if(step % 1 == 0) return value + " " + unitName;
    let i = 1;
    do {
        if(step * (10 ** i) % 1 == 0) return parseFloat(value).toFixed(i)  + " " + unitName;
        i++;
    }
    while (step * i % 1 != 0 && i < 5)
    return value + unitName;
}

function populateMedicineCategory(container, meds, id, category, hormoneType) {
    let i = 1;
    for(const med of meds) {
        // console.log(med);
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
        if(med.type == "injection") {
            dosage.min = med.dose.min * med.unitSize;
            dosage.max = med.dose.max * med.unitSize;
            dosage.step = med.dose.step * med.unitSize;
            dosage.value = med.dose.default * med.unitSize;
        } else {
            dosage.min = med.dose.min;
            dosage.max = med.dose.max;
            dosage.step = med.dose.step;
            dosage.value = med.dose.default;
        }

        const unitName = med.type == "injection" ? medTypeData.unitSizeName : medTypeData.itemNamePlural
        dosageOutput.textContent = updateValue(dosage.value, dosage.step, unitName);
        dosage.addEventListener("input", (e) => {
            dosageOutput.textContent = updateValue(e.target.value, e.target.step, unitName);
            if(chosenMeds[parseInt(id.charAt(5))-1]!=null && chosenMeds[parseInt(id.charAt(5))-1].brand == med.brand) {
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
            if(chosenMeds[parseInt(id.charAt(5))-1]!=null && chosenMeds[parseInt(id.charAt(5))-1].brand == med.brand) {
                chosenMeds[parseInt(id.charAt(5))-1].interval = e.target.value;
            }
        })

        const hospitalOptions = medicineOption.querySelector(".hospital-options-container")
        populatePrices(hospitalOptions, med,  input.id, category, dosage, interval, hormoneType);
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
    chosenMeds[0] = null;
    chosenMeds[1] = null;
    document.styleSheets[4].deleteRule(8)
    document.styleSheets[4].insertRule(checkedStyle.replace("--blue", "--pink"), 8)
});

eBased.addEventListener("click", (e) => {
    document.querySelector("#medicine-select-page").classList.add("pink");
    document.querySelector("#medicine-select-page").classList.remove("blue");
    chosenMeds[0] = null;
    chosenMeds[1] = null;
    document.styleSheets[4].deleteRule(8)
    document.styleSheets[4].insertRule(checkedStyle, 8)
});

//  var btn = document.createElement("button");
//  document.body.appendChild(btn);
eBased.addEventListener("click", populateGallery);
tBased.addEventListener("click", populateGallery);