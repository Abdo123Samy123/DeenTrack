"use strict";

/* =========================================
   DEENTRACK - DHIKR SYSTEM
========================================= */

const STORAGE_KEY = "deenTrackState";

const DAILY_GOAL = 100;

let state = loadState();


/* =========================================
   LOAD STATE
========================================= */

function loadState() {

    try {

        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return createDefaultState();
        }

        const parsed = JSON.parse(saved);

        return {
            ...createDefaultState(),
            ...parsed,
            dhikr: {
                ...createDefaultState().dhikr,
                ...(parsed.dhikr || {})
            }
        };

    } catch (error) {

        console.error("DeenTrack state error:", error);

        return createDefaultState();
    }
}


/* =========================================
   DEFAULT STATE
========================================= */

function createDefaultState() {

    return {

        prayers: {},

        prayerPoints: 0,

        dhikr: {
            today: 0,
            total: 0,
            points: 0,
            bestDay: 0,
            date: getLocalDate()
        },

        points: 0,

        streak: 0,

        studySeconds: 0,

        timerRunning: false,

        timerStartedAt: null,

        completedTasks: 0,

        totalTasks: 0
    };
}


/* =========================================
   SAVE
========================================= */

function saveState() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
    );
}


/* =========================================
   LOCAL DATE
========================================= */

function getLocalDate() {

    const now = new Date();

    const year = now.getFullYear();

    const month = String(
        now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/* =========================================
   DAILY RESET
========================================= */

function checkNewDay() {

    const today = getLocalDate();

    if (!state.dhikr.date) {

        state.dhikr.date = today;

        saveState();

        return;
    }

    if (state.dhikr.date !== today) {

        state.dhikr.bestDay = Math.max(
            Number(state.dhikr.bestDay) || 0,
            Number(state.dhikr.today) || 0
        );

        state.dhikr.today = 0;

        state.dhikr.date = today;

        saveState();
    }
}


/* =========================================
   DOM
========================================= */

const countElement =
    document.getElementById("dhikrCount");

const percentElement =
    document.getElementById("progressPercent");

const progressFill =
    document.getElementById("progressFill");

const todayElement =
    document.getElementById("todayCount");

const totalElement =
    document.getElementById("totalCount");

const pointsElement =
    document.getElementById("dhikrPoints");

const bestDayElement =
    document.getElementById("bestDay");

const goalCurrent =
    document.getElementById("goalCurrent");

const goalStatus =
    document.getElementById("goalStatus");

const motivationTitle =
    document.getElementById("motivationTitle");

const motivationText =
    document.getElementById("motivationText");

const dhikrButton =
    document.getElementById("dhikrButton");

const undoButton =
    document.getElementById("undoButton");

const counterRing =
    document.querySelector(".counter-ring");


/* =========================================
   TOAST
========================================= */

function showToast(message) {

    const container =
        document.getElementById("toastContainer");

    if (!container) return;

    const toast =
        document.createElement("div");

    toast.className = "toast";

    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {

        toast.style.opacity = "0";

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, 1800);
}


/* =========================================
   UPDATE UI
========================================= */

function updateUI() {

    const count =
        Number(state.dhikr.today) || 0;

    const total =
        Number(state.dhikr.total) || 0;

    const points =
        Number(state.dhikr.points) || 0;

    const best =
        Number(state.dhikr.bestDay) || 0;


    const percentage =
        Math.min(
            Math.round(
                (count / DAILY_GOAL) * 100
            ),
            100
        );


    countElement.textContent = count;

    percentElement.textContent =
        `${percentage}%`;

    todayElement.textContent =
        count;

    totalElement.textContent =
        total;

    pointsElement.textContent =
        points;

    bestDayElement.textContent =
        best;


    goalCurrent.textContent =
        `${count} / ${DAILY_GOAL}`;


    progressFill.style.width =
        `${percentage}%`;


    if (counterRing) {

        counterRing.style.background =
            `conic-gradient(
                var(--accent) ${percentage * 3.6}deg,
                rgba(255,255,255,0.07) ${percentage * 3.6}deg
            )`;
    }


    updateStatus(count, percentage);

    updateMotivation(count, percentage);
}


/* =========================================
   STATUS
========================================= */

function updateStatus(count, percentage) {

    if (count === 0) {

        goalStatus.textContent =
            "ابدأ الآن 💚";

        return;
    }


    if (percentage < 25) {

        goalStatus.textContent =
            "بداية جميلة 🌱";

    } else if (percentage < 50) {

        goalStatus.textContent =
            "كمّل، أنت ماشي صح 💪";

    } else if (percentage < 75) {

        goalStatus.textContent =
            "نص الطريق تقريبًا 🔥";

    } else if (percentage < 100) {

        goalStatus.textContent =
            "قربت جدًا من هدفك 🚀";

    } else {

        goalStatus.textContent =
            "حققت هدف اليوم 🏆";
    }
}


/* =========================================
   MOTIVATION
========================================= */

function updateMotivation(count, percentage) {

    if (count === 0) {

        motivationTitle.textContent =
            "لسه البداية!";

        motivationText.textContent =
            "ابدأ بأول استغفار، وخلي يومك أحسن من امبارح.";

        return;
    }


    if (percentage < 50) {

        motivationTitle.textContent =
            "ممتاز! استمر 🔥";

        motivationText.textContent =
            "كل استغفار بتضيفه بيقربك من هدفك.";

        return;
    }


    if (percentage < 100) {

        motivationTitle.textContent =
            "أنت قربت جدًا! 🚀";

        motivationText.textContent =
            "متوقفش دلوقتي، كمّل لحد ما تحقق هدفك.";

        return;
    }


    motivationTitle.textContent =
        "هدف اليوم اكتمل 🏆";

    motivationText.textContent =
        "برافو عليك! تقدر تكمل أكتر لو حابب.";
}


/* =========================================
   ADD DHIKR
========================================= */

function addDhikr() {

    state.dhikr.today += 1;

    state.dhikr.total += 1;

    state.dhikr.points += 1;

    state.points += 1;


    if (
        state.dhikr.today >
        state.dhikr.bestDay
    ) {

        state.dhikr.bestDay =
            state.dhikr.today;
    }


    saveState();

    updateUI();

    animateCounter();

    showToast("+1 استغفار • +1 نقطة 📿");
}


/* =========================================
   UNDO
========================================= */

function undoDhikr() {

    if (state.dhikr.today <= 0) {

        showToast("مفيش استغفار للتراجع عنه");

        return;
    }


    state.dhikr.today -= 1;

    state.dhikr.total =
        Math.max(
            0,
            state.dhikr.total - 1
        );

    state.dhikr.points =
        Math.max(
            0,
            state.dhikr.points - 1
        );

    state.points =
        Math.max(
            0,
            state.points - 1
        );


    saveState();

    updateUI();

    showToast("تم التراجع ↩");
}


/* =========================================
   ANIMATION
========================================= */

function animateCounter() {

    if (!countElement) return;

    countElement.animate(
        [
            {
                transform: "scale(1)"
            },
            {
                transform: "scale(1.15)"
            },
            {
                transform: "scale(1)"
            }
        ],
        {
            duration: 250,
            easing: "ease-out"
        }
    );
}


/* =========================================
   BUTTON EVENTS
========================================= */

if (dhikrButton) {

    dhikrButton.addEventListener(
        "click",
        addDhikr
    );
}


if (undoButton) {

    undoButton.addEventListener(
        "click",
        undoDhikr
    );
}


/* =========================================
   KEYBOARD SUPPORT
========================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (event.code === "Space") {

            const active =
                document.activeElement;

            if (
                active &&
                (
                    active.tagName === "INPUT" ||
                    active.tagName === "TEXTAREA"
                )
            ) {
                return;
            }

            event.preventDefault();

            addDhikr();
        }

    }
);


/* =========================================
   START
========================================= */

checkNewDay();

updateUI();