/* =========================================
   DeenTrack
   Main Application
========================================= */

"use strict";


/* =========================================
   DEFAULT STATE
========================================= */

const state = {

    prayers: {
        fajr: false,
        dhuhr: false,
        asr: false,
        maghrib: false,
        isha: false
    },

    dhikr: {
        count: 0,
        goal: 100,
        total: 0,
        points: 0
    },

    points: 0,

    streak: 7,

    studySeconds: 0,

    timerRunning: false,

    timerStartedAt: null,

    completedTasks: 1,

    totalTasks: 3

};


/* =========================================
   DOM HELPERS
========================================= */

function $(selector) {
    return document.querySelector(selector);
}


function $$(selector) {
    return document.querySelectorAll(selector);
}


/* =========================================
   SAFE NUMBER
========================================= */

function toNumber(value, fallback = 0) {

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;

}


/* =========================================
   DHIKR COUNT
========================================= */

function getDhikrCount() {

    /*
       لو البيانات القديمة كانت رقم
    */

    if (typeof state.dhikr === "number") {

        return Math.max(
            0,
            toNumber(state.dhikr)
        );

    }


    /*
       لو البيانات الجديدة Object
    */

    if (
        state.dhikr &&
        typeof state.dhikr === "object"
    ) {

        return Math.max(
            0,
            toNumber(
                state.dhikr.count,
                0
            )
        );

    }


    return 0;
}


/* =========================================
   SET DHIKR COUNT
========================================= */

function setDhikrCount(value) {

    const count =
        Math.max(
            0,
            toNumber(value)
        );


    /*
       نحافظ على Object بتاع نظام الذكر
    */

    if (
        state.dhikr &&
        typeof state.dhikr === "object"
    ) {

        state.dhikr.count = count;

    } else {

        state.dhikr = {
            count: count,
            goal: 100,
            total: count,
            points: Math.floor(count / 10)
        };

    }

}


/* =========================================
   LOCAL STORAGE
========================================= */

function saveState() {

    localStorage.setItem(
        "deenTrackState",
        JSON.stringify(state)
    );

}


function loadState() {

    const savedState =
        localStorage.getItem(
            "deenTrackState"
        );


    if (!savedState) {
        return;
    }


    try {

        const parsedState =
            JSON.parse(savedState);


        /*
           Merge الصلاة
        */

        if (
            parsedState.prayers &&
            typeof parsedState.prayers === "object"
        ) {

            state.prayers = {
                ...state.prayers,
                ...parsedState.prayers
            };

        }


        /*
           Dhikr
        */

        if (
            parsedState.dhikr !== undefined
        ) {

            if (
                typeof parsedState.dhikr === "object" &&
                parsedState.dhikr !== null
            ) {

                state.dhikr = {
                    ...state.dhikr,
                    ...parsedState.dhikr
                };

            } else {

                state.dhikr = {
                    ...state.dhikr,
                    count: toNumber(
                        parsedState.dhikr
                    )
                };

            }

        }


        /*
           باقي البيانات
        */

        state.points =
            toNumber(
                parsedState.points,
                0
            );

        state.streak =
            toNumber(
                parsedState.streak,
                0
            );

        state.studySeconds =
            toNumber(
                parsedState.studySeconds,
                0
            );

        state.completedTasks =
            toNumber(
                parsedState.completedTasks,
                0
            );

        state.totalTasks =
            toNumber(
                parsedState.totalTasks,
                0
            );

        state.timerRunning =
            Boolean(
                parsedState.timerRunning
            );

        state.timerStartedAt =
            parsedState.timerStartedAt || null;


        /*
           لو نظام الصلاة الجديد
           عنده prayerPoints
        */

        if (
            typeof parsedState.prayerPoints === "number"
        ) {

            state.points =
                Math.max(
                    state.points,
                    parsedState.prayerPoints
                );

        }

    } catch (error) {

        console.error(
            "Failed to load saved data:",
            error
        );

    }

}


/* =========================================
   DATE
========================================= */

function updateDate() {

    const dateElement =
        $("#currentDate");


    if (!dateElement) {
        return;
    }


    const now =
        new Date();


    const formattedDate =
        new Intl.DateTimeFormat(
            "ar-EG",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        ).format(now);


    dateElement.textContent =
        formattedDate;

}


/* =========================================
   TOAST
========================================= */

function showToast(
    message,
    type = "success"
) {

    const container =
        $("#toastContainer");


    if (!container) {
        return;
    }


    const toast =
        document.createElement("div");


    toast.className =
        `toast ${type}`;


    toast.textContent =
        message;


    container.appendChild(
        toast
    );


    setTimeout(() => {

        toast.style.opacity =
            "0";

        toast.style.transform =
            "translateY(10px)";


        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 2800);

}


/* =========================================
   PRAYER SYSTEM
========================================= */

function setupPrayers() {

    const prayerItems =
        $$(".prayer-item");


    prayerItems.forEach(item => {

        const button =
            item.querySelector(
                ".check-button"
            );


        const prayerName =
            item.dataset.prayer;


        if (!button) {
            return;
        }


        if (
            state.prayers[prayerName]
        ) {

            item.classList.add(
                "completed"
            );

        }


        button.addEventListener(
            "click",
            () => {

                state.prayers[prayerName] =
                    !state.prayers[prayerName];


                item.classList.toggle(
                    "completed",
                    state.prayers[prayerName]
                );


                if (
                    state.prayers[prayerName]
                ) {

                    state.points += 10;

                    showToast(
                        "ممتاز! تم تسجيل الصلاة 🕌 +10 نقاط"
                    );

                } else {

                    state.points =
                        Math.max(
                            0,
                            state.points - 10
                        );

                }


                updatePrayerStats();

                updatePoints();

                saveState();

            }
        );

    });

}


/* =========================================
   PRAYER STATS
========================================= */

function updatePrayerStats() {

    const values =
        Object.values(
            state.prayers
        );


    const count =
        values.filter(Boolean).length;


    const percentage =
        (count / 5) * 100;


    const countElement =
        $("#prayerCount");


    const progress =
        $("#prayerProgress");


    if (countElement) {

        countElement.textContent =
            count;

    }


    if (progress) {

        progress.style.width =
            `${percentage}%`;

    }


    updateDailyProgress();

}


/* =========================================
   DAILY PROGRESS
========================================= */

function updateDailyProgress() {

    const prayerCount =
        Object.values(
            state.prayers
        ).filter(Boolean).length;


    const prayerScore =
        (
            prayerCount / 5
        ) * 40;


    const dhikrCount =
        getDhikrCount();


    const dhikrScore =
        Math.min(
            dhikrCount / 100,
            1
        ) * 20;


    const studySeconds =
        Math.max(
            0,
            toNumber(
                state.studySeconds
            )
        );


    const studyScore =
        Math.min(
            studySeconds /
            (2 * 60 * 60),
            1
        ) * 20;


    const completedTasks =
        Math.max(
            0,
            toNumber(
                state.completedTasks
            )
        );


    const totalTasks =
        Math.max(
            0,
            toNumber(
                state.totalTasks
            )
        );


    const taskScore =
        totalTasks > 0
            ? (
                completedTasks /
                totalTasks
            ) * 20
            : 0;


    const total =
        Math.round(
            prayerScore +
            dhikrScore +
            studyScore +
            taskScore
        );


    const progress =
        Math.max(
            0,
            Math.min(
                total,
                100
            )
        );


    const progressText =
        $("#dailyProgress");


    const progressCircle =
        $("#dailyProgressCircle");


    if (progressText) {

        progressText.textContent =
            `${progress}%`;

    }


    if (progressCircle) {

        const circumference =
            314;


        const offset =
            circumference -
            (
                progress / 100
            ) *
            circumference;


        progressCircle.style.strokeDashoffset =
            offset;

    }

}


/* =========================================
   POINTS
========================================= */

function updatePoints() {

    const pointsElement =
        $("#pointsCount");


    const rankElement =
        $("#userRank");


    const remainingElement =
        $("#pointsRemaining");


    const progressElement =
        $("#rankProgress");


    const points =
        Math.max(
            0,
            toNumber(
                state.points
            )
        );


    state.points =
        points;


    if (pointsElement) {

        pointsElement.textContent =
            points;

    }


    let rank = "مبتدئ";
    let next = 100;
    let previous = 0;


    if (points >= 100) {

        rank = "مجتهد";
        next = 250;
        previous = 100;

    }


    if (points >= 250) {

        rank = "ملتزم";
        next = 500;
        previous = 250;

    }


    if (points >= 500) {

        rank = "متميز";
        next = 1000;
        previous = 500;

    }


    if (points >= 1000) {

        rank = "Legend";
        next = 2000;
        previous = 1000;

    }


    const percentage =
        Math.min(
            (
                (points - previous) /
                (next - previous)
            ) * 100,
            100
        );


    if (rankElement) {

        rankElement.textContent =
            rank;

    }


    if (remainingElement) {

        remainingElement.textContent =
            Math.max(
                0,
                next - points
            );

    }


    if (progressElement) {

        progressElement.style.width =
            `${Math.max(
                0,
                percentage
            )}%`;

    }


    /*
       Dhikr Points
    */

    const dhikrPoints =
        Math.floor(
            getDhikrCount() / 10
        );


    const dhikrPointsElement =
        $("#dhikrPoints");


    if (dhikrPointsElement) {

        dhikrPointsElement.textContent =
            dhikrPoints;

    }

}


/* =========================================
   STUDY TIMER
========================================= */

let timerInterval = null;


function updateTimerDisplay() {

    const totalSeconds =
        Math.max(
            0,
            toNumber(
                state.studySeconds
            )
        );


    const hours =
        Math.floor(
            totalSeconds / 3600
        );


    const minutes =
        Math.floor(
            (
                totalSeconds % 3600
            ) / 60
        );


    const seconds =
        totalSeconds % 60;


    const h =
        $("#timerHours");


    const m =
        $("#timerMinutes");


    const s =
        $("#timerSeconds");


    if (h) {

        h.textContent =
            String(hours)
                .padStart(2, "0");

    }


    if (m) {

        m.textContent =
            String(minutes)
                .padStart(2, "0");

    }


    if (s) {

        s.textContent =
            String(seconds)
                .padStart(2, "0");

    }


    const studyHours =
        $("#studyHours");


    if (studyHours) {

        studyHours.textContent =
            (
                totalSeconds / 3600
            ).toFixed(1);

    }


    updateDailyProgress();

}


/* =========================================
   START TIMER
========================================= */

function startTimer() {

    if (state.timerRunning) {
        return;
    }


    state.timerRunning =
        true;


    state.timerStartedAt =
        Date.now();


    timerInterval =
        setInterval(() => {

            state.studySeconds =
                Math.max(
                    0,
                    toNumber(
                        state.studySeconds
                    )
                ) + 1;


            updateTimerDisplay();

            saveState();

        }, 1000);


    const button =
        $("#timerButton");


    if (button) {

        button.textContent =
            "Ⅱ";

    }


    showToast(
        "بدأت جلسة المذاكرة 📚"
    );

}


/* =========================================
   STOP TIMER
========================================= */

function stopTimer() {

    if (!state.timerRunning) {
        return;
    }


    state.timerRunning =
        false;


    clearInterval(
        timerInterval
    );


    timerInterval =
        null;


    const button =
        $("#timerButton");


    if (button) {

        button.textContent =
            "▶";

    }


    saveState();


    showToast(
        "تم إيقاف جلسة المذاكرة ⏸️"
    );

}


/* =========================================
   RESET TIMER
========================================= */

function resetTimer() {

    stopTimer();


    state.studySeconds =
        0;


    state.timerStartedAt =
        null;


    updateTimerDisplay();

    saveState();


    showToast(
        "تم تصفير المؤقت"
    );

}


/* =========================================
   TIMER SETUP
========================================= */

function setupTimer() {

    const timerButton =
        $("#timerButton");


    const resetButton =
        $("#resetTimerBtn");


    if (timerButton) {

        timerButton.addEventListener(
            "click",
            () => {

                if (
                    state.timerRunning
                ) {

                    stopTimer();

                } else {

                    startTimer();

                }

            }
        );

    }


    if (resetButton) {

        resetButton.addEventListener(
            "click",
            resetTimer
        );

    }


    updateTimerDisplay();

}


/* =========================================
   TASKS
========================================= */

function setupTasks() {

    const taskButtons =
        $$(".task-check");


    taskButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const task =
                    button.closest(
                        ".task-item"
                    );


                if (!task) {
                    return;
                }


                const wasCompleted =
                    task.classList.contains(
                        "completed"
                    );


                task.classList.toggle(
                    "completed"
                );


                if (!wasCompleted) {

                    state.completedTasks =
                        Math.max(
                            0,
                            toNumber(
                                state.completedTasks
                            )
                        ) + 1;


                    state.points += 5;


                    showToast(
                        "مهمة مكتملة! ✓ +5 نقاط"
                    );

                } else {

                    state.completedTasks =
                        Math.max(
                            0,
                            toNumber(
                                state.completedTasks
                            ) - 1
                        );


                    state.points =
                        Math.max(
                            0,
                            state.points - 5
                        );

                }


                updateTaskProgress();

                updatePoints();

                saveState();

            }
        );

    });

}


/* =========================================
   TASK PROGRESS
========================================= */

function updateTaskProgress() {

    const completed =
        $("#completedTasks");


    const total =
        $("#totalTasks");


    const progress =
        $("#taskProgress");


    const completedValue =
        Math.max(
            0,
            toNumber(
                state.completedTasks
            )
        );


    const totalValue =
        Math.max(
            0,
            toNumber(
                state.totalTasks
            )
        );


    if (completed) {

        completed.textContent =
            completedValue;

    }


    if (total) {

        total.textContent =
            totalValue;

    }


    if (progress) {

        const percentage =
            totalValue > 0
                ? (
                    completedValue /
                    totalValue
                ) * 100
                : 0;


        progress.style.width =
            `${Math.min(
                100,
                Math.max(
                    0,
                    percentage
                )
            )}%`;

    }


    updateDailyProgress();

}


/* =========================================
   MOBILE SIDEBAR
========================================= */

function setupMobileMenu() {

    const button =
        $("#mobileMenuBtn");


    const sidebar =
        $("#sidebar");


    if (!button || !sidebar) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );

        }
    );

}

/* =========================================
   NAVIGATION
========================================= */

function setupNavigation() {

    const navigationButtons =
        $$(".nav-item");

    navigationButtons.forEach(function(button) {

        button.addEventListener("click", function() {

            navigationButtons.forEach(function(item) {

                item.classList.remove("active");

            });

            button.classList.add("active");

            const page =
                button.getAttribute("data-page");

            if (!page) {
                return;
            }

            /*
             * لو الزرار عبارة عن لينك لصفحة
             */
            const href =
                button.getAttribute("href");

            if (
                button.tagName === "A" &&
                href &&
                href !== "#"
            ) {
                return;
            }

            /*
             * لو فيه عنصر داخل الصفحة
             * بنفس ID بتاع data-page
             */
            const target =
                document.getElementById(page);

            if (target) {

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });

}


/* =========================================
   REFRESH UI
========================================= */

function refreshUI() {

    updateDate();

    updatePrayerStats();

    updatePoints();

    updateTaskProgress();

    updateTimerDisplay();

}


/* =========================================
   APP INITIALIZATION
========================================= */

function initApp() {

    loadState();

    setupPrayers();

    setupTimer();

    setupTasks();

    setupMobileMenu();

    setupNavigation();

    refreshUI();

}


/* =========================================
   START APP
========================================= */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initApp
    );

} else {

    initApp();

}