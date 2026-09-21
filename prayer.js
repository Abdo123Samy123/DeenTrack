/* =========================================
   DEENTRACK - PRAYER SYSTEM
========================================= */

const PRAYER_STORAGE_KEY = "deenTrackState";


/* =========================================
   DEFAULT DATA
========================================= */

const defaultPrayerState = {
    prayers: {
        fajr: false,
        dhuhr: false,
        asr: false,
        maghrib: false,
        isha: false
    },

    prayerPoints: 0
};


/* =========================================
   LOAD DATA
========================================= */

function loadPrayerState() {

    const saved = localStorage.getItem(PRAYER_STORAGE_KEY);

    if (!saved) {
        return defaultPrayerState;
    }

    try {

        const data = JSON.parse(saved);

        if (!data.prayers) {
            data.prayers = defaultPrayerState.prayers;
        }

        if (typeof data.prayerPoints !== "number") {
            data.prayerPoints = 0;
        }

        return data;

    } catch (error) {

        console.error(
            "Error loading prayer state:",
            error
        );

        return defaultPrayerState;
    }
}


/* =========================================
   SAVE DATA
========================================= */

function savePrayerState(state) {

    localStorage.setItem(
        PRAYER_STORAGE_KEY,
        JSON.stringify(state)
    );
}


/* =========================================
   STATE
========================================= */

let state = loadPrayerState();


/* =========================================
   PRAYER ELEMENTS
========================================= */

const prayerCards =
    document.querySelectorAll(".prayer-card");

const progressText =
    document.getElementById("prayerProgressText");

const progressBar =
    document.getElementById("prayerProgressBar");

const progressMessage =
    document.getElementById("prayerProgressMessage");

const completedPrayers =
    document.getElementById("completedPrayers");

const remainingPrayers =
    document.getElementById("remainingPrayers");

const prayerPoints =
    document.getElementById("prayerPoints");


/* =========================================
   UPDATE UI
========================================= */

function updatePrayerUI() {

    const prayers =
        state.prayers;

    const total =
        Object.keys(prayers).length;

    const completed =
        Object.values(prayers)
            .filter(Boolean)
            .length;

    const remaining =
        total - completed;

    const percentage =
        (completed / total) * 100;


    /* Progress */

    progressText.textContent =
        `${completed} / ${total}`;

    progressBar.style.width =
        `${percentage}%`;


    /* Stats */

    completedPrayers.textContent =
        completed;

    remainingPrayers.textContent =
        remaining;

    prayerPoints.textContent =
        state.prayerPoints;


    /* Message */

    if (completed === 0) {

        progressMessage.textContent =
            "لسه اليوم في أوله، ابدأ بأول صلاة ❤️";

    } else if (completed < 3) {

        progressMessage.textContent =
            "بداية كويسة جدًا، كمل يومك بنفس الحماس 💪";

    } else if (completed < 5) {

        progressMessage.textContent =
            "ممتاز! فاضلك شوية وتكمل يومك كامل 🔥";

    } else {

        progressMessage.textContent =
            "ما شاء الله! كملت الخمس صلوات اليوم 🌙✨";
    }


    /* Cards */

    prayerCards.forEach(card => {

        const prayer =
            card.dataset.prayer;

        const button =
            card.querySelector(".prayer-check");

        if (prayers[prayer]) {

            card.classList.add("completed");

            button.setAttribute(
                "aria-label",
                "تم تسجيل الصلاة"
            );

        } else {

            card.classList.remove("completed");

            button.setAttribute(
                "aria-label",
                "تسجيل الصلاة"
            );
        }

    });
}


/* =========================================
   TOAST
========================================= */

function showToast(message) {

    const container =
        document.getElementById(
            "toastContainer"
        );

    if (!container) return;

    const toast =
        document.createElement("div");

    toast.className = "toast";

    toast.textContent = message;

    container.appendChild(toast);


    setTimeout(() => {

        toast.classList.add("hide");

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, 2200);
}


/* =========================================
   TOGGLE PRAYER
========================================= */

function togglePrayer(prayer) {

    if (!state.prayers.hasOwnProperty(prayer)) {
        return;
    }


    const wasCompleted =
        state.prayers[prayer];


    state.prayers[prayer] =
        !wasCompleted;


    /*
       كل صلاة مكتملة = +10 نقاط
       إلغاء الصلاة = -10 نقاط
    */

    if (!wasCompleted) {

        state.prayerPoints += 10;

        showToast(
            "تم تسجيل الصلاة +10 نقاط 🌙"
        );

    } else {

        state.prayerPoints =
            Math.max(
                0,
                state.prayerPoints - 10
            );

        showToast(
            "تم إلغاء تسجيل الصلاة"
        );
    }


    savePrayerState(state);

    updatePrayerUI();
}


/* =========================================
   CLICK EVENTS
========================================= */

prayerCards.forEach(card => {

    const button =
        card.querySelector(".prayer-check");

    button.addEventListener(
        "click",
        () => {

            const prayer =
                card.dataset.prayer;

            togglePrayer(prayer);
        }
    );

});


/* =========================================
   RESET EACH DAY
========================================= */

function checkNewDay() {

    const today =
        new Date().toISOString().split("T")[0];

    const savedDate =
        localStorage.getItem(
            "deenTrackPrayerDate"
        );


    if (!savedDate) {

        localStorage.setItem(
            "deenTrackPrayerDate",
            today
        );

        return;
    }


    if (savedDate !== today) {

        state.prayers = {
            fajr: false,
            dhuhr: false,
            asr: false,
            maghrib: false,
            isha: false
        };

        state.prayerPoints = 0;


        localStorage.setItem(
            "deenTrackPrayerDate",
            today
        );


        savePrayerState(state);
    }
}


/* =========================================
   START
========================================= */

checkNewDay();

updatePrayerUI();