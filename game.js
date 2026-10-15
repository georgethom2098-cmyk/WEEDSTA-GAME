/* =========================
   GAME DATA
========================= */

const farms = {
    1: {
        name: "STARTER FARM",
        slots: 4,
        unlockCost: 0,
        reward: 50,
        image: "farm1.png"
    },

    2: {
        name: "FARM 2",
        slots: 6,
        unlockCost: 500,
        reward: 100,
        image: "farm2.png"
    },

    3: {
        name: "FARM 3",
        slots: 8,
        unlockCost: 1000,
        reward: 350,
        image: "farm3.png"
    },

    4: {
        name: "FARM 4",
        slots: 10,
        unlockCost: 2000,
        reward: 500,
        image: "farm4.png"
    },

    5: {
        name: "FARM 5",
        slots: 12,
        unlockCost: 5000,
        reward: 700,
        image: "farm5.png"
    }
};


/* =========================
   GAME STATE
========================= */

let gameState = {
    coins: 0,

    totalCoinsEarned: 0,

    selectedFarm: 1,

    unlockedFarms: [1],

    firstTime: true,

    tutorialComplete: false,

    tutorialStep: 0,

    grounds: [],

    seedSelectionMode: false,
    waterSelectionMode: false,

    playerName: ""
};


/* =========================
   LOAD SAVED GAME
========================= */

function loadGame() {

    const savedGame = localStorage.getItem("weedstaGame");

    if (savedGame) {

        try {

            const data = JSON.parse(savedGame);

            gameState = {
                ...gameState,
                ...data
            };

        } catch (error) {

            console.log("Could not load saved game.");

        }
    }

    gameState.totalCoinsEarned = Number(gameState.totalCoinsEarned || 0);
    gameState.playerName = localStorage.getItem("weedstaPlayerName") || gameState.playerName || "";
    gameState.seedSelectionMode = false;
    gameState.waterSelectionMode = false;

}


/* =========================
   SAVE GAME
========================= */

function saveGame() {

    gameState.playerName = localStorage.getItem("weedstaPlayerName") || gameState.playerName || "";

    localStorage.setItem(
        "weedstaGame",
        JSON.stringify(gameState)
    );

}

function getLeaderboardEntries() {
    try {
        const entries = JSON.parse(localStorage.getItem("weedstaLeaderboard") || "[]");
        return Array.isArray(entries) ? entries : [];
    } catch (error) {
        return [];
    }
}

function saveLeaderboardEntries(entries) {
    localStorage.setItem("weedstaLeaderboard", JSON.stringify(entries));
}

function syncLeaderboardEntry() {
    const playerName = (localStorage.getItem("weedstaPlayerName") || gameState.playerName || "").trim();

    if (!playerName) {
        return;
    }

    const entries = getLeaderboardEntries();
    const currentScore = Number(gameState.totalCoinsEarned || 0);
    const existingIndex = entries.findIndex(entry => entry.name.toLowerCase() === playerName.toLowerCase());

    if (existingIndex >= 0) {
        entries[existingIndex].totalCoinsEarned = currentScore;
    } else {
        entries.push({ name: playerName, totalCoinsEarned: currentScore });
    }

    saveLeaderboardEntries(entries);
    if (typeof renderLeaderboard === "function") {
        renderLeaderboard();
    }
}

function getPlayerName() {
    return (localStorage.getItem("weedstaPlayerName") || gameState.playerName || "").trim();
}

function showNotification(message) {

    let toast =
        document.getElementById(
            "weedstaToast"
        );

    if (!toast) {

        toast = document.createElement("div");
        toast.id = "weedstaToast";
        toast.className = "weedsta-toast";
        document.body.appendChild(toast);

    }

    toast.textContent = message;
    toast.classList.remove("show");

    void toast.offsetWidth;

    toast.classList.add("show");

    clearTimeout(toast.hideTimer);

    toast.hideTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2000);

}


/* =========================
   ELEMENTS
========================= */

const moneyDisplay =
    document.getElementById("money");

const farmImage =
    document.getElementById("farmImage");

const collectionButton =
    document.getElementById("collectionButton");

const collectionPanel =
    document.getElementById("collectionPanel");

const closeCollection =
    document.getElementById("closeCollection");

const farmsSection =
    document.getElementById("farmsSection");

const equipmentSection =
    document.getElementById("equipmentSection");

const groundLayer =
    document.getElementById("groundLayer");

const farmWrapper =
    document.getElementById("farmWrapper");

const seedSelectionBanner =
    document.getElementById("seedSelectionBanner");

const cancelSeedSelectionButton =
    document.getElementById("cancelSeedSelection");

const leaderboardButton =
    document.getElementById("leaderboardButton");

const leaderboardPanel =
    document.getElementById("leaderboardPanel");

const closeLeaderboard =
    document.getElementById("closeLeaderboard");

const leaderboardPrompt =
    document.getElementById("leaderboardPrompt");

const leaderboardContent =
    document.getElementById("leaderboardContent");

const leaderboardRows =
    document.getElementById("leaderboardRows");

const leaderboardMeta =
    document.getElementById("leaderboardMeta");

const leaderboardNameForm =
    document.getElementById("leaderboardNameForm");

const playerNameInput =
    document.getElementById("playerNameInput");


/* =========================
   UPDATE COINS
========================= */

function updateCoins() {

    moneyDisplay.textContent =
        gameState.coins.toLocaleString();

}

function renderLeaderboard() {
    if (!leaderboardPanel || !leaderboardRows || !leaderboardMeta || !leaderboardPrompt || !leaderboardContent) {
        return;
    }

    const playerName = getPlayerName();

    if (!playerName) {
        leaderboardPrompt.classList.remove("hidden");
        leaderboardContent.classList.add("hidden");
        return;
    }

    leaderboardPrompt.classList.add("hidden");
    leaderboardContent.classList.remove("hidden");

    const entries = getLeaderboardEntries()
        .map(entry => ({
            name: String(entry.name || "Unknown").trim(),
            totalCoinsEarned: Number(entry.totalCoinsEarned || 0)
        }))
        .filter(entry => entry.name)
        .sort((a, b) => b.totalCoinsEarned - a.totalCoinsEarned);

    const currentScore = Number(gameState.totalCoinsEarned || 0);
    const currentEntry = entries.find(entry => entry.name.toLowerCase() === playerName.toLowerCase());

    if (currentEntry) {
        currentEntry.totalCoinsEarned = Math.max(currentEntry.totalCoinsEarned, currentScore);
    } else {
        entries.push({ name: playerName, totalCoinsEarned: currentScore });
    }

    const sortedEntries = entries.sort((a, b) => b.totalCoinsEarned - a.totalCoinsEarned);
    const playerRank = sortedEntries.findIndex(entry => entry.name.toLowerCase() === playerName.toLowerCase()) + 1;
    const totalEarned = sortedEntries.find(entry => entry.name.toLowerCase() === playerName.toLowerCase())?.totalCoinsEarned || currentScore;

    saveLeaderboardEntries(sortedEntries);

    leaderboardMeta.innerHTML = `
        <span>YOU</span>
        <strong>${playerName}</strong>
        <span>RANK #${playerRank || "-"}</span>
        <span>${totalEarned.toLocaleString()} COINS</span>
    `;

    if (!sortedEntries.length || sortedEntries[0].totalCoinsEarned === 0) {
        leaderboardRows.innerHTML = `
            <div class="leaderboard-empty">
                <p>No leaderboard score yet.</p>
                <small>Complete a harvest to begin ranking.</small>
            </div>
        `;
        return;
    }

    leaderboardRows.innerHTML = sortedEntries
        .slice(0, 10)
        .map((entry, index) => {
            const isCurrent = entry.name.toLowerCase() === playerName.toLowerCase();
            return `
                <div class="leaderboard-row ${isCurrent ? "leaderboard-row-current" : ""}">
                    <span>#${index + 1}</span>
                    <span>${entry.name}</span>
                    <span>${entry.totalCoinsEarned.toLocaleString()} Coins</span>
                </div>
            `;
        })
        .join("");
}

function openLeaderboard() {
    if (!leaderboardPanel) {
        return;
    }

    leaderboardPanel.classList.remove("hidden");
    renderLeaderboard();
}

function closeLeaderboardPanel() {
    if (!leaderboardPanel) {
        return;
    }

    leaderboardPanel.classList.add("hidden");
}

if (leaderboardButton) {
    leaderboardButton.addEventListener("click", openLeaderboard);
}

if (closeLeaderboard) {
    closeLeaderboard.addEventListener("click", closeLeaderboardPanel);
}

if (leaderboardNameForm && playerNameInput) {
    leaderboardNameForm.addEventListener("submit", event => {
        event.preventDefault();

        const newName = playerNameInput.value.trim();
        const cleanName = newName.slice(0, 16);

        if (!cleanName) {
            showNotification("Name cannot be empty!");
            return;
        }

        const existingEntries = getLeaderboardEntries();
        const hasDuplicate = existingEntries.some(entry =>
            entry.name && entry.name.toLowerCase() === cleanName.toLowerCase() &&
            entry.name.toLowerCase() !== (getPlayerName() || "").toLowerCase()
        );

        if (hasDuplicate) {
            showNotification("That name is already in use.");
            return;
        }

        localStorage.setItem("weedstaPlayerName", cleanName);
        gameState.playerName = cleanName;
        saveGame();
        syncLeaderboardEntry();
        renderLeaderboard();
        playerNameInput.value = "";
        closeLeaderboardPanel();
        openLeaderboard();
    });
}


/* =========================
   UPDATE FARM IMAGE
========================= */

function updateFarmImage() {

    const farm =
        farms[gameState.selectedFarm];

    farmImage.src =
        farm.image;

}


/* =========================
   OPEN COLLECTION
========================= */

function openCollection() {

    collectionPanel.classList.remove("hidden");

    updateCollectionCards();

}


/* =========================
   CLOSE COLLECTION
========================= */

function closeCollectionPanel() {

    collectionPanel.classList.add("hidden");

}


/* =========================
   COLLECTION BUTTON
========================= */

collectionButton.addEventListener(
    "click",
    openCollection
);


/* =========================
   CLOSE BUTTON
========================= */

closeCollection.addEventListener(
    "click",
    closeCollectionPanel
);


/* =========================
   UPDATE FARM CARDS
========================= */

function updateCollectionCards() {

    const cards =
        document.querySelectorAll(
            ".collection-card"
        );

    cards.forEach(card => {

        const farmId =
            Number(card.dataset.farm);

        const farm =
            farms[farmId];

        const unlocked =
            gameState.unlockedFarms.includes(
                farmId
            );

        const button =
            card.querySelector(".farm-select");

        const image =
            card.querySelector(".farm-preview img");

        if (unlocked) {

            card.classList.remove("locked");

            card.classList.add("unlocked");

            image.style.filter = "";

            button.textContent =
                gameState.selectedFarm === farmId
                    ? "SELECTED"
                    : "SELECT";

        } else {

            card.classList.remove("unlocked");

            card.classList.add("locked");

            image.style.filter =
                "brightness(0.25) saturate(0.4)";

            button.textContent =
                `LOCKED • ${farm.unlockCost.toLocaleString()} COINS`;

        }

    });

}

function renderEquipmentItems() {

    equipmentSection.innerHTML = "";

    const equipmentGrid =
        document.createElement("div");

    equipmentGrid.className =
        "equipment-grid";

    const equipmentItems = [
        {
            id: "ground",
            name: "GROUND",
            icon: "ground.png",
            purpose: "Used to create a planting plot on the farm."
        },
        {
            id: "seed",
            name: "SEED",
            icon: "seed.png",
            purpose: "Used to plant a seed on an available ground."
        },
        {
            id: "water",
            name: "WATER",
            icon: "water",
            purpose: "Adds water so the planted seed can start germinating."
        }
    ];

    equipmentItems.forEach(item => {

        const card =
            document.createElement("div");

        card.className = "equipment-item";
        card.dataset.item = item.id;

        const preview =
            document.createElement("div");

        preview.className =
            "equipment-preview";

        const image = item.id === "water"
            ? document.createElement("div")
            : document.createElement("img");

        if (item.id === "water") {
            image.className = "equipment-water-icon";
            image.innerHTML = "<span class='water-drop-shape'></span>";
        } else {
            image.src = item.icon;
            image.alt = item.name;
            preview.appendChild(image);
        }

        if (item.id !== "water") {
            preview.appendChild(image);
        } else {
            preview.appendChild(image);
        }

        const title =
            document.createElement("h2");

        title.textContent = item.name;

        const description =
            document.createElement("p");

        description.textContent = item.purpose;

        const hint =
            document.createElement("span");

        hint.className = "equipment-hint";
        hint.textContent = item.id === "ground"
            ? "DRAG TO FARM"
            : item.id === "water"
                ? "CLICK TO WATER"
                : "CLICK TO CHOOSE GROUND";

        card.appendChild(preview);
        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(hint);

        if (item.id === "ground") {
            card.addEventListener(
                "pointerdown",
                event => {
                    startEquipmentDrag(event, item.id);
                }
            );
        } else {
            card.addEventListener(
                "click",
                event => {
                    event.preventDefault();

                    if (item.id === "water") {
                        if (gameState.waterSelectionMode) {
                            cancelWaterSelectionMode();
                            return;
                        }
                        startWaterSelectionMode();
                        return;
                    }

                    if (gameState.seedSelectionMode) {
                        cancelSeedSelectionMode();
                        return;
                    }

                    startSeedSelectionMode();
                }
            );
        }

        equipmentGrid.appendChild(card);

    });

    equipmentSection.appendChild(
        equipmentGrid
    );

}


/* =========================
   FARM CARD CLICKS
========================= */

document
    .querySelectorAll(".collection-card")
    .forEach(card => {

        card.addEventListener(
            "click",
            () => {

                const farmId =
                    Number(card.dataset.farm);

                selectFarm(farmId);

            }
        );

    });


/* =========================
   SELECT FARM
========================= */

function selectFarm(farmId) {

    const farm =
        farms[farmId];

    const unlocked =
        gameState.unlockedFarms.includes(
            farmId
        );


    /* LOCKED FARM */

    if (!unlocked) {

        if (
            gameState.coins >=
            farm.unlockCost
        ) {

            gameState.coins -=
                farm.unlockCost;

            gameState.unlockedFarms.push(
                farmId
            );

            saveGame();

            updateCoins();

            showNotification(
                `${farm.name} unlocked!`
            );

        } else {

            showNotification(
                "Need more coins!"
            );

            return;
        }

    }


    /* SELECT FARM */

    gameState.selectedFarm =
        farmId;

    saveGame();

    updateFarmImage();

    updateCollectionCards();

    closeCollectionPanel();

    if (
        gameState.firstTime &&
        !gameState.tutorialComplete
    ) {

        showNotification(
            "Drag GROUND from Equipment to your farm."
        );

    }

    console.log(
        `Selected ${farm.name}`
    );

}


/* =========================
   COLLECTION TABS
========================= */

document
    .querySelectorAll(".collection-tab")
    .forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                const section =
                    tab.dataset.section;


                document
                    .querySelectorAll(
                        ".collection-tab"
                    )
                    .forEach(button => {

                        button.classList.remove(
                            "active"
                        );

                    });


                tab.classList.add(
                    "active"
                );


                if (
                    section === "farms"
                ) {

                    farmsSection
                        .classList.remove(
                            "hidden"
                        );

                    equipmentSection
                        .classList.add(
                            "hidden"
                        );

                }


                if (
                    section === "equipment"
                ) {

                    farmsSection
                        .classList.add(
                            "hidden"
                        );

                    equipmentSection
                        .classList.remove(
                            "hidden"
                        );

                }

            }
        );

    });


/* =========================
   INITIALIZE GAME
========================= */

loadGame();

if (!getPlayerName()) {
    localStorage.setItem("weedstaPlayerName", "");
}

syncLeaderboardEntry();
updateCoins();

updateFarmImage();

updateCollectionCards();

renderEquipmentItems();

setTimeout(() => {

    openCollection();

    if (
        gameState.firstTime &&
        !gameState.tutorialComplete
    ) {

        showNotification(
            "Drag GROUND from Equipment to your farm."
        );

    }

}, 500);


/* =========================
   GROUND + SEED SYSTEM
========================= */

const groundImage = "ground.png";
const seedImage = "seed.png";
const plantStageDuration = 10000;

const farmPlantingZones = {

    1: [
        { x: 10, y: 12, width: 80, height: 76 }
    ],

    2: [
        { x: 8, y: 10, width: 84, height: 80 }
    ],

    3: [
        { x: 7, y: 9, width: 86, height: 82 }
    ],

    4: [
        { x: 6, y: 8, width: 88, height: 84 }
    ],

    5: [
        { x: 5, y: 7, width: 90, height: 86 }
    ]

};

const farmBlockedZones = {

    1: [
        { x: 8, y: 8, width: 16, height: 22 },
        { x: 30, y: 8, width: 40, height: 18 },
        { x: 76, y: 8, width: 16, height: 22 },
        { x: 10, y: 58, width: 18, height: 22 },
        { x: 72, y: 58, width: 18, height: 22 },
        { x: 18, y: 72, width: 22, height: 16 },
        { x: 60, y: 72, width: 22, height: 16 }
    ],

    2: [
        { x: 8, y: 8, width: 16, height: 22 },
        { x: 30, y: 8, width: 40, height: 18 },
        { x: 76, y: 8, width: 16, height: 22 },
        { x: 10, y: 58, width: 18, height: 22 },
        { x: 72, y: 58, width: 18, height: 22 },
        { x: 18, y: 72, width: 22, height: 16 },
        { x: 60, y: 72, width: 22, height: 16 }
    ],

    3: [
        { x: 8, y: 8, width: 16, height: 22 },
        { x: 30, y: 8, width: 40, height: 18 },
        { x: 76, y: 8, width: 16, height: 22 },
        { x: 10, y: 58, width: 18, height: 22 },
        { x: 72, y: 58, width: 18, height: 22 },
        { x: 18, y: 72, width: 22, height: 16 },
        { x: 60, y: 72, width: 22, height: 16 }
    ],

    4: [
        { x: 8, y: 8, width: 16, height: 22 },
        { x: 30, y: 8, width: 40, height: 18 },
        { x: 76, y: 8, width: 16, height: 22 },
        { x: 10, y: 58, width: 18, height: 22 },
        { x: 72, y: 58, width: 18, height: 22 },
        { x: 18, y: 72, width: 22, height: 16 },
        { x: 60, y: 72, width: 22, height: 16 }
    ],

    5: [
        { x: 8, y: 8, width: 16, height: 22 },
        { x: 30, y: 8, width: 40, height: 18 },
        { x: 76, y: 8, width: 16, height: 22 },
        { x: 10, y: 58, width: 18, height: 22 },
        { x: 72, y: 58, width: 18, height: 22 },
        { x: 18, y: 72, width: 22, height: 16 },
        { x: 60, y: 72, width: 22, height: 16 }
    ]

};

function getPointerPercent(event) {

    const rect =
        farmWrapper.getBoundingClientRect();

    const x =
        ((event.clientX - rect.left) / rect.width) * 100;

    const y =
        ((event.clientY - rect.top) / rect.height) * 100;

    return { x, y };

}

function isPlacementValid(xPercent, yPercent, skipId = null) {

    const zones =
        farmPlantingZones[gameState.selectedFarm] || [];

    const blocked =
        farmBlockedZones[gameState.selectedFarm] || [];

    const insideZone =
        zones.some(zone =>
            xPercent >= zone.x &&
            xPercent <= zone.x + zone.width &&
            yPercent >= zone.y &&
            yPercent <= zone.y + zone.height
        );

    if (!insideZone) {
        return false;
    }

    const insideBlocked =
        blocked.some(zone =>
            xPercent >= zone.x &&
            xPercent <= zone.x + zone.width &&
            yPercent >= zone.y &&
            yPercent <= zone.y + zone.height
        );

    if (insideBlocked) {
        return false;
    }

    for (const groundData of gameState.grounds) {

        if (
            !groundData ||
            groundData.id === skipId ||
            groundData.x === null ||
            groundData.y === null
        ) {
            continue;
        }

        if (
            Math.abs(groundData.x - xPercent) < 10 &&
            Math.abs(groundData.y - yPercent) < 10
        ) {
            return false;
        }

    }

    return true;

}

function createGroundObject(xPercent = 50, yPercent = 50) {

    const ground =
        document.createElement("div");

    ground.className = "ground-object";
    ground.draggable = false;

    const base =
        document.createElement("img");

    base.src = groundImage;
    base.alt = "Planting Ground";
    base.className = "ground-base";

    ground.appendChild(base);
    groundLayer.appendChild(ground);
    ground.style.left = `${xPercent}%`;
    ground.style.top = `${yPercent}%`;

    const groundData = {
        id: Date.now() + Math.random(),
        element: ground,
        x: xPercent,
        y: yPercent,
        hasSeed: false,
        watered: false,
        plantedAt: null,
        readyToHarvest: false,
        plantStage: 0,
        plantImage: null,
        growthTimer: null,
        isNew: true
    };

    attachGroundClickHandler(groundData);

    renderGroundState(groundData);

    return groundData;

}

function attachGroundClickHandler(groundData) {
    const ground = groundData.element;

    ground.addEventListener("click", () => {
        if (gameState.seedSelectionMode) {
            if (groundData.hasSeed) {
                showNotification("This ground is already occupied!");
                return;
            }

            ground.classList.add("seed-selected");
            setTimeout(() => ground.classList.remove("seed-selected"), 180);
            placeSeedOnGround(groundData);
            cancelSeedSelectionMode();
            return;
        }

        if (gameState.waterSelectionMode) {
            waterGround(groundData);
            return;
        }

        if (groundData.hasSeed && groundData.readyToHarvest) {
            harvestGround(groundData);
        }
    });
}

function waterGround(groundData) {
    if (!groundData || !groundData.hasSeed) {
        showNotification("Water only works on planted ground.");
        return;
    }

    if (groundData.watered) {
        showNotification("This ground already has water.");
        return;
    }

    gameState.seedSelectionMode = false;
    gameState.waterSelectionMode = false;
    groundData.watered = true;
    groundData.plantStage = 1;
    groundData.plantedAt = Date.now();
    renderGroundState(groundData);

    const ground = groundData.element;
    ground.classList.remove("watering-animation");
    void ground.offsetWidth;
    ground.classList.add("watering-animation");
    setTimeout(() => ground.classList.remove("watering-animation"), 1000);

    saveGame();
    scheduleNextPlantStage(groundData);
    updateSeedSelectionUI();
    showNotification("Water added! Germination started.");
}

function clearGroundGrowthTimer(groundData) {
    if (groundData && groundData.growthTimer) {
        clearTimeout(groundData.growthTimer);
        groundData.growthTimer = null;
    }
}

function getPlantStageFile(stage) {
    const safeStage = Math.max(1, Math.min(5, Number(stage) || 1));
    return `plant${safeStage}.png`;
}

function scheduleNextPlantStage(groundData) {
    if (!groundData || !groundData.hasSeed || !groundData.watered || groundData.readyToHarvest) {
        return;
    }

    clearGroundGrowthTimer(groundData);

    if (groundData.plantStage >= 5) {
        groundData.readyToHarvest = true;
        renderGroundState(groundData);
        saveGame();
        return;
    }

    const elapsed = groundData.plantedAt ? Date.now() - groundData.plantedAt : 0;
    const nextDelay = Math.max(1, plantStageDuration - (elapsed % plantStageDuration));

    groundData.growthTimer = setTimeout(() => {
        advancePlantStage(groundData);
    }, nextDelay);
}

function advancePlantStage(groundData) {
    if (!groundData || !groundData.hasSeed || !groundData.watered || groundData.readyToHarvest) {
        return;
    }

    clearGroundGrowthTimer(groundData);

    if (groundData.plantStage < 5) {
        groundData.plantStage += 1;
        renderGroundState(groundData);
        saveGame();
    }

    if (groundData.plantStage >= 5) {
        groundData.readyToHarvest = true;
        renderGroundState(groundData);
        saveGame();
        return;
    }

    scheduleNextPlantStage(groundData);
}

function renderGroundState(groundData) {

    if (!groundData.element) {
        return;
    }

    const ground = groundData.element;
    ground.innerHTML = "";

    const base =
        document.createElement("img");

    base.src = groundImage;
    base.alt = "Planting Ground";
    base.className = "ground-base";

    ground.appendChild(base);

    if (!groundData.hasSeed) {
        return;
    }

    const plantWrap =
        document.createElement("div");

    plantWrap.className = "plant-wrap";

    if (!groundData.watered) {
        const waterPrompt = document.createElement("button");
        waterPrompt.type = "button";
        waterPrompt.className = "plant-water-needed";
        waterPrompt.innerHTML = "<span class='water-drop-mini'></span><span>WATER PLANT</span>";
        waterPrompt.addEventListener("click", event => {
            event.stopPropagation();
            waterGround(groundData);
        });
        plantWrap.appendChild(waterPrompt);
        ground.appendChild(plantWrap);
        return;
    }

    const plantImg =
        document.createElement("img");

    plantImg.className = "plant-image";
    plantImg.src = getPlantStageFile(groundData.plantStage);
    plantWrap.appendChild(plantImg);

    if (groundData.readyToHarvest) {
        const harvestPopup =
            document.createElement("div");

        harvestPopup.className = "harvest-popup";
        harvestPopup.textContent = "TAP TO HARVEST";
        plantWrap.appendChild(harvestPopup);
    }

    ground.appendChild(plantWrap);

}

function placeSeedOnGround(groundData) {

    if (!groundData || groundData.hasSeed) {
        return;
    }

    clearGroundGrowthTimer(groundData);

    gameState.seedSelectionMode = false;
    updateSeedSelectionUI();

    groundData.hasSeed = true;
    groundData.watered = false;
    groundData.plantStage = 0;
    groundData.readyToHarvest = false;
    groundData.plantedAt = Date.now();

    renderGroundState(groundData);
    saveGame();

    if (
        gameState.firstTime &&
        !gameState.tutorialComplete
    ) {

        gameState.tutorialStep = 1;
        showNotification("Now choose a ground to plant your seed.");

    }

}

function harvestGround(groundData) {

    if (!groundData || !groundData.readyToHarvest || !groundData.hasSeed) {
        return;
    }

    const reward =
        farms[gameState.selectedFarm].reward;

    gameState.coins += reward;
    gameState.totalCoinsEarned = Number(gameState.totalCoinsEarned || 0) + reward;
    updateCoins();
    syncLeaderboardEntry();

    groundData.hasSeed = false;
    groundData.watered = false;
    groundData.plantStage = 0;
    groundData.plantedAt = null;
    groundData.readyToHarvest = false;
    clearGroundGrowthTimer(groundData);
    groundData.isNew = false;

    renderGroundState(groundData);
    saveGame();

    showNotification(`+${reward.toLocaleString()} COINS`);

    if (
        gameState.firstTime &&
        !gameState.tutorialComplete
    ) {

        gameState.firstTime = false;
        gameState.tutorialComplete = true;
        gameState.tutorialStep = 2;
        saveGame();
        showNotification("Tutorial complete!");

    }

}

function getEmptyGrounds() {
    return (gameState.grounds || []).filter(
        groundData => groundData && !groundData.hasSeed
    );
}

function updateSeedSelectionUI() {
    if (!seedSelectionBanner || !cancelSeedSelectionButton) {
        return;
    }

    const active = Boolean(gameState.seedSelectionMode || gameState.waterSelectionMode);
    seedSelectionBanner.classList.toggle("hidden", !active);
    cancelSeedSelectionButton.style.display = active ? "inline-flex" : "none";

    gameState.grounds.forEach(groundData => {
        if (!groundData || !groundData.element) {
            return;
        }

        const element = groundData.element;
        const seedModeActive = gameState.seedSelectionMode && !groundData.hasSeed;
        const waterModeActive = gameState.waterSelectionMode && groundData.hasSeed && !groundData.watered;

        element.classList.toggle("seed-available", seedModeActive || waterModeActive);
        element.classList.toggle("seed-occupied", !seedModeActive && !waterModeActive && groundData.hasSeed);
        element.classList.remove("seed-selected");
    });
}

function startSeedSelectionMode() {
    closeCollectionPanel();
    gameState.waterSelectionMode = false;

    const emptyGrounds = getEmptyGrounds();

    if (emptyGrounds.length === 0) {
        showNotification("No empty ground available!");
        return;
    }

    gameState.seedSelectionMode = true;
    updateSeedSelectionUI();
    showNotification("Choose a ground to plant your seed");
}

function cancelSeedSelectionMode() {
    gameState.seedSelectionMode = false;
    updateSeedSelectionUI();
}

function getWaterReadyGrounds() {
    return (gameState.grounds || []).filter(
        groundData => groundData && groundData.hasSeed && !groundData.watered
    );
}

function startWaterSelectionMode() {
    closeCollectionPanel();
    gameState.seedSelectionMode = false;

    const readyGrounds = getWaterReadyGrounds();

    if (readyGrounds.length === 0) {
        showNotification("No planted ground needs water.");
        return;
    }

    gameState.waterSelectionMode = true;
    updateSeedSelectionUI();
    showNotification("Choose a planted ground to add water");
}

function cancelWaterSelectionMode() {
    gameState.waterSelectionMode = false;
    updateSeedSelectionUI();
}

function updatePlantGrowth() {

    gameState.grounds.forEach(groundData => {

        if (!groundData) {
            return;
        }

        if (groundData.hasSeed && groundData.watered && !groundData.readyToHarvest && !groundData.growthTimer) {
            scheduleNextPlantStage(groundData);
        }

        if (groundData.hasSeed && !groundData.readyToHarvest) {
            renderGroundState(groundData);
        }

    });

}

function findGroundAtPoint(xPercent, yPercent) {

    for (const groundData of gameState.grounds) {

        if (
            groundData.x === null ||
            groundData.y === null
        ) {
            continue;
        }

        if (
            Math.abs(groundData.x - xPercent) < 12 &&
            Math.abs(groundData.y - yPercent) < 12
        ) {
            return groundData;
        }

    }

    return null;

}

function startEquipmentDrag(event, itemType) {

    if (event.button === 2) {
        return;
    }

    event.preventDefault();

    const ghost =
        document.createElement("div");

    ghost.className = "equipment-drag-ghost";

    const ghostImage =
        document.createElement("img");

    ghostImage.src =
        itemType === "ground"
            ? groundImage
            : seedImage;

    ghost.appendChild(ghostImage);
    document.body.appendChild(ghost);

    const move = dragEvent => {

        ghost.style.left = `${dragEvent.clientX + 18}px`;
        ghost.style.top = `${dragEvent.clientY + 18}px`;

    };

    const end = dragEndEvent => {

        const farmRect =
            farmWrapper.getBoundingClientRect();

        const insideFarm =
            dragEndEvent.clientX >= farmRect.left &&
            dragEndEvent.clientX <= farmRect.right &&
            dragEndEvent.clientY >= farmRect.top &&
            dragEndEvent.clientY <= farmRect.bottom;

        if (itemType === "ground") {

            if (
                gameState.grounds.length >=
                farms[gameState.selectedFarm].slots
            ) {
                showNotification("Ground limit reached!");
                cleanup();
                return;
            }

            if (!insideFarm) {
                showNotification("Can't place ground here!");
                cleanup();
                return;
            }

            const pointer = getPointerPercent(dragEndEvent);

            if (!isPlacementValid(pointer.x, pointer.y)) {
                showNotification("Can't place ground here!");
                cleanup();
                return;
            }

                    const groundData = createGroundObject(pointer.x, pointer.y);
            gameState.grounds.push(groundData);
            setupGroundDragging(groundData);
            saveGame();
            updateGroundCount();

            if (
                gameState.firstTime &&
                !gameState.tutorialComplete
            ) {
                gameState.tutorialStep = 1;
                showNotification("Now drag SEED onto your ground.");
            }

            cleanup();
            return;

        }

        if (!insideFarm) {
            showNotification("Place seed on an empty ground.");
            cleanup();
            return;
        }

        const pointer = getPointerPercent(dragEndEvent);
        const target = findGroundAtPoint(pointer.x, pointer.y);

        if (!target || target.hasSeed) {
            showNotification("Place seed on an empty ground.");
            cleanup();
            return;
        }

        placeSeedOnGround(target);
        cleanup();

    };

    const cleanup = () => {

        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", end);
        ghost.remove();

    };

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", end, { once: true });
    move(event);

}

function createGround() {

    const farm = farms[gameState.selectedFarm];

    if (gameState.grounds.length >= farm.slots) {
        showNotification("Ground limit reached!");
        return;
    }

    const groundData = createGroundObject(50, 50);
    gameState.grounds.push(groundData);
    setupGroundDragging(groundData);
    saveGame();

}

function setupGroundDragging(groundData) {

    const element = groundData.element;
    let dragging = false;
    const originalPosition = {
        x: groundData.x,
        y: groundData.y
    };

    element.addEventListener(
        "pointerdown",
        event => {

            if (groundData.hasSeed) {
                return;
            }

            if (gameState.seedSelectionMode) {
                return;
            }

            event.preventDefault();
            dragging = true;
            originalPosition.x = groundData.x ?? 50;
            originalPosition.y = groundData.y ?? 50;
            element.classList.add("dragging");
            element.setPointerCapture(event.pointerId);

        }
    );

    element.addEventListener(
        "pointermove",
        event => {

            if (!dragging) {
                return;
            }

            const pointer = getPointerPercent(event);
            const valid = isPlacementValid(pointer.x, pointer.y, groundData.id);

            element.style.left = `${pointer.x}%`;
            element.style.top = `${pointer.y}%`;
            element.classList.toggle("valid-placement", valid);
            element.classList.toggle("invalid-placement", !valid);

        }
    );

    element.addEventListener(
        "pointerup",
        event => {

            if (!dragging) {
                return;
            }

            dragging = false;
            element.classList.remove("dragging");
            element.classList.remove("valid-placement");
            element.classList.remove("invalid-placement");
            element.releasePointerCapture(event.pointerId);

            const pointer = getPointerPercent(event);
            const valid = isPlacementValid(pointer.x, pointer.y, groundData.id);

            if (!valid) {

                if (groundData.isNew) {
                    groundData.element.remove();
                    gameState.grounds = gameState.grounds.filter(item => item.id !== groundData.id);
                } else {
                    groundData.x = originalPosition.x;
                    groundData.y = originalPosition.y;
                    element.style.left = `${originalPosition.x}%`;
                    element.style.top = `${originalPosition.y}%`;
                }

                showNotification("Can't place ground here!");
                saveGame();
                return;
            }

            groundData.x = pointer.x;
            groundData.y = pointer.y;
            groundData.isNew = false;
            saveGame();

            if (
                gameState.firstTime &&
                !gameState.tutorialComplete
            ) {
                gameState.tutorialStep = 1;
                showNotification("Now drag SEED onto your ground.");
            }

        }
    );

}

function restoreGrounds() {

    if (!gameState.grounds || gameState.grounds.length === 0) {
        return;
    }

    gameState.grounds.forEach(savedGround => {

        const ground = document.createElement("div");
        ground.className = "ground-object";

        const base = document.createElement("img");
        base.src = groundImage;
        base.alt = "Planting Ground";
        base.className = "ground-base";

        ground.appendChild(base);
        groundLayer.appendChild(ground);

        if (savedGround.x !== null && savedGround.y !== null) {
            ground.style.left = `${savedGround.x}%`;
            ground.style.top = `${savedGround.y}%`;
        }

        savedGround.element = ground;
        savedGround.isNew = false;
        attachGroundClickHandler(savedGround);

        if (savedGround.hasSeed && !savedGround.watered) {
            savedGround.plantStage = 0;
            savedGround.readyToHarvest = false;
        }

        if (savedGround.hasSeed && savedGround.watered && !savedGround.readyToHarvest) {
            const elapsed = savedGround.plantedAt ? Date.now() - savedGround.plantedAt : 0;
            const stageFromTime = Math.min(5, Math.max(1, Math.floor(elapsed / plantStageDuration) + 1));
            savedGround.plantStage = stageFromTime;
            if (stageFromTime >= 5) {
                savedGround.readyToHarvest = true;
            } else {
                const remainingDelay = Math.max(1, plantStageDuration - (elapsed % plantStageDuration));
                savedGround.growthTimer = setTimeout(() => {
                    advancePlantStage(savedGround);
                }, remainingDelay);
            }
        }

        renderGroundState(savedGround);

        if (!savedGround.hasSeed) {
            setupGroundDragging(savedGround);
        }

    });

}

cancelSeedSelectionButton.addEventListener("click", () => {
    if (gameState.waterSelectionMode) {
        cancelWaterSelectionMode();
        return;
    }
    cancelSeedSelectionMode();
});

setInterval(updatePlantGrowth, 1000);
restoreGrounds();
updateSeedSelectionUI();
updateGroundCount();


/* =========================
   COLLECTION REMAINERS
========================= */

function updateGroundCount() {

    const count =
        document.getElementById("groundCount");

    if (!count) {
        return;
    }

    const farm =
        farms[gameState.selectedFarm];

    count.textContent =
        `${gameState.grounds.length} / ${farm.slots}`;

}

updateGroundCount();