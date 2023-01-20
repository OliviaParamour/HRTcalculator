window.addEventListener("keydown", checkKeyPressed, false);

let escapeTimerHandle = 0;
let escapeCount = 0;

/**
 * Checks if the key escape key is pressed three times before redirecting the
 * page
 * @param {Event} evt
 */
function checkKeyPressed(evt) {
    if (evt.key === "Escape" || evt.key === "Esc") {
        clearTimeout(escapeTimerHandle);
        escapeCount++;
        if (escapeCount == 3) window.location.replace("https://google.com");
        else escapeTimerHandle = setTimeout(() => {escapeCount = 0;}, 1000);
    }
}