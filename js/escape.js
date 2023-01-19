window.addEventListener("keydown", checkKeyPressed, false);

let escapeTimerHandle = 0;
let escapeCount = 0;

function checkKeyPressed(evt) {
    if (evt.key === "Escape" || evt.key === "Esc") {
        clearTimeout(escapeTimerHandle);
        escapeCount++;
        if (escapeCount == 3) window.location.replace("https://google.com");
        else escapeTimerHandle = setTimeout(() => {escapeCount = 0;}, 1000);
    }
}