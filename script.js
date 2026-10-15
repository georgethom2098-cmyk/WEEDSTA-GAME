const startButton = document.getElementById("startButton");

const pageName = window.location.pathname.split("/").pop();
const hasStarted = localStorage.getItem("weedstaStarted") === "true";

if (pageName === "game.html" && !hasStarted) {
    window.location.replace("index.html");
}

if (startButton) {
    startButton.addEventListener("click", () => {
        localStorage.setItem("weedstaStarted", "true");
        startButton.style.transform = "scale(0.92)";

        setTimeout(() => {
            startButton.style.transform = "";
            window.location.href = "game.html";
        }, 150);
    });
}