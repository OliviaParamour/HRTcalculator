"use strict";

export {changeMedicineStyles};

const styleSheet = document.styleSheets[5];
const selectors = [
    ".hospital-option-graphic",
    ".hospital-option-graphic:hover",
    "input:checked + .hospital-option-graphic",
    ".medicine-choice:has(input:checked)",
]

const styles = [];
for(let i=0; i<styleSheet.cssRules.length; i++) {
    for(const selector of selectors)
        if (styleSheet.cssRules[i].selectorText == selector) {
            styles.push({
                "id": i,
                "pink": styleSheet.cssRules[i].cssText,
                "blue": styleSheet.cssRules[i].cssText.replace("pink", "blue")
            });
        }
}

document.querySelector("#medicine-select-page").classList.add("pink");
let previousKey = "pink";
function changeMedicineStyles(e) {
    let key = e.currentTarget.id == "choice-testosterone"? "blue" : "pink";
    if(previousKey != key) {
        for(let i = styles.length-1; i>=0; i--)
            styleSheet.deleteRule(styles[i].id);

        document.querySelector("#medicine-select-page").classList.replace(
                previousKey, key);
        for(const style of styles) styleSheet.insertRule(style[key], style.id);
        previousKey = key;
    }
}