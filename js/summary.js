"use strict";

export { generateTable };

const summary = document.getElementById("summary-table-content");
const itemRow = document.getElementById("item-row");
const groupHeader = document.querySelector("#group-group-header");
const itemGroupHeader = document.querySelector("#item-group-header");
const totalData = document.getElementById("summary-total");

/**
 *
 * @param {Array} rows the table rows
 * @param {Object} medicine The user set medicine dosage
 * @param {Array} total The total row
 * @param {Number} age Age of the user
 * @param {Boolean} limit Whether the hide lifetime cost no longer exists
 */
function populateTablePrices(rows, medicine, total, age, limit=0) {
    const times = [1, 30, 365.2425, (100 - age) * 365.2425];

    let dailyPrice = (medicine.price * parseFloat(medicine.dose))
                   / parseFloat(medicine.interval);

    if (medicine.type == "injection") dailyPrice /= medicine.unitSize;

    for (let i = 0; i < times.length-limit; i++) {
        rows[i + 1].textContent = (dailyPrice * times[i]).toFixed(2);
        total[i + 2].textContent = (
            dailyPrice * times[i] + parseFloat(total[i + 2].textContent)
        ).toFixed(2);
    }
}

/**
 * Removes the lifetime column if lifeTimeCheckbox is checked
 * @param {Boolean} lifeTimeCheckbox Lifetime column toggle
 */
function setColumns(lifeTimeCheckbox) {
    const headData = document.querySelector("#summary-table-head");
    if (lifeTimeCheckbox) {
        if (headData.querySelectorAll("td").length > 5)
            headData.removeChild(headData.lastElementChild);
        if (totalData.querySelectorAll("td").length > 5)
            totalData.removeChild(totalData.lastElementChild);
    } else {
        if (headData.querySelectorAll("td").length < 6) {
            const lifeTimeHeader = document.createElement("td");
            lifeTimeHeader.className = "align-right";
            lifeTimeHeader.textContent = "Lifetime Cost";
            headData.appendChild(lifeTimeHeader);
        }

        if (totalData.querySelectorAll("td").length < 6) {
            const lifeTimeTotal = document.createElement("td");
            lifeTimeTotal.className = "align-right";
            totalData.appendChild(lifeTimeTotal);
        }
    }
}

/**
 *
 * @param {Event} e
 * @param {Object} chosenMeds The user chosen medicine's dosage and info
 * @param {Boolean} lifeTimeCheckbox Lifetime column toggle
 * @param {Number} age Age of the user
 */
function generateTable(e, chosenMeds, lifeTimeCheckbox, age) {
    while (summary.lastElementChild) {
        summary.removeChild(summary.lastElementChild);
    }
    for (let i = 0; i < 4 - lifeTimeCheckbox; i++) {
        totalData.querySelectorAll("td")[i + 2].textContent = 0;
    }

    setColumns(lifeTimeCheckbox);

    const headerRow = groupHeader.content.cloneNode(true);
    const header = headerRow.querySelector("th");
    let currentRow = headerRow.querySelector("tr");
    for (const medicine of chosenMeds) {
        if (medicine != null) {
            const head = itemGroupHeader.content.cloneNode(true);
            const row = itemRow.content.cloneNode(true).querySelector("tr");
            if (lifeTimeCheckbox) {
                head.colspan = 4;
                row.removeChild(row.lastElementChild)
            }
            const rowData = row.querySelectorAll("td");

            if (currentRow == null) currentRow = document.createElement("tr");
            else header.rowSpan += 2;

            head.querySelector("th").textContent = medicine.hormone;
            currentRow.appendChild(head);
            rowData[0].textContent = medicine.brand;
            populateTablePrices(rowData, medicine,
                    totalData.querySelectorAll("td"), age, lifeTimeCheckbox);
            summary.appendChild(currentRow);
            currentRow = null;
            summary.appendChild(row);
        }
    }
}