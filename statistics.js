/* =========================================================
   DEEN TRACK - STATISTICS
   ========================================================= */

"use strict";

/* =========================================================
   STORAGE KEYS
   ========================================================= */

const STATE_KEY = "deenTrackState";
const PROFILE_KEY = "deenTrackProfile";
const FRIENDS_KEY = "deenTrackFriends";
const CHALLENGES_KEY = "deenTrackChallenges";
const CHALLENGE_POINTS_KEY = "deenTrackChallengePoints";
const TASKS_KEY = "deenTrackTasks";
const DAILY_STATS_KEY = "deenTrackDailyStats";


/* =========================================================
   DEFAULT STATE
   ========================================================= */

const defaultState = {
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
    streak: 0,

    studySeconds: 0,
    timerRunning: false,
    timerStartedAt: null,

    completedTasks: 0,
    totalTasks: 0
};


/* =========================================================
   HELPERS
   ========================================================= */

function getStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);

        if (!value) {
            return fallback;
        }

        return JSON.parse(value);

    } catch (error) {
        console.warn("Storage error:", key, error);
        return fallback;
    }
}


function saveStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn("Save error:", key, error);
    }
}


function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}


function formatNumber(number) {
    return Number(number || 0).toLocaleString("ar-EG");
}


function formatMinutes(minutes) {
    minutes = Math.max(0, Math.round(minutes || 0));

    if (minutes < 60) {
        return `${minutes} دقيقة`;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (mins === 0) {
        return `${hours} ساعة`;
    }

    return `${hours}س ${mins}د`;
}


function getTodayKey() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getDateLabel(date) {
    return date.toLocaleDateString("ar-EG", {
        weekday: "short"
    });
}


/* =========================================================
   LOAD DATA
   ========================================================= */

let state = getStorage(STATE_KEY, defaultState);

state = {
    ...defaultState,
    ...state,

    prayers: {
        ...defaultState.prayers,
        ...(state.prayers || {})
    },

    dhikr: {
        ...defaultState.dhikr,
        ...(state.dhikr || {})
    }
};


const profile = getStorage(PROFILE_KEY, {
    name: "abdo"
});


const friends = getStorage(FRIENDS_KEY, []);


const challenges = getStorage(CHALLENGES_KEY, []);


const tasksData = getStorage(TASKS_KEY, []);


const dailyStats = getStorage(DAILY_STATS_KEY, {});


/* =========================================================
   DATE
   ========================================================= */

function renderDate() {

    const dateElement = document.getElementById("currentDate");

    if (!dateElement) {
        return;
    }

    const now = new Date();

    dateElement.textContent = now.toLocaleDateString("ar-EG", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


/* =========================================================
   PRAYER STATISTICS
   ========================================================= */

function getPrayerStats() {

    const prayers = state.prayers || {};

    const prayerList = [
        prayers.fajr,
        prayers.dhuhr,
        prayers.asr,
        prayers.maghrib,
        prayers.isha
    ];

    const completed = prayerList.filter(Boolean).length;

    const percent = Math.round((completed / 5) * 100);

    return {
        completed,
        total: 5,
        percent
    };
}


/* =========================================================
   DHIKR STATISTICS
   ========================================================= */

function getDhikrStats() {

    const count = Number(state.dhikr?.count || 0);
    const goal = Number(state.dhikr?.goal || 100);

    const percent = goal > 0
        ? Math.round((count / goal) * 100)
        : 0;

    return {
        count,
        goal,
        percent: clamp(percent, 0, 100)
    };
}


/* =========================================================
   STUDY STATISTICS
   ========================================================= */

function getStudyStats() {

    let seconds = Number(state.studySeconds || 0);

    /*
       لو التايمر شغال، نحسب الوقت الحالي
       بدون ما نحتاج نخليه مفتوح طول الوقت.
    */

    if (state.timerRunning && state.timerStartedAt) {

        const started = Number(state.timerStartedAt);

        if (!Number.isNaN(started)) {

            const extraSeconds = Math.floor(
                (Date.now() - started) / 1000
            );

            seconds += Math.max(0, extraSeconds);
        }
    }

    const minutes = Math.floor(seconds / 60);

    /*
       الهدف اليومي للمذاكرة = ساعتين
    */

    const dailyGoal = 120;

    const percent = Math.round(
        (minutes / dailyGoal) * 100
    );

    return {
        seconds,
        minutes,
        dailyGoal,
        percent: clamp(percent, 0, 100)
    };
}


/* =========================================================
   TASK STATISTICS
   ========================================================= */

function getTaskStats() {

    let completed = Number(state.completedTasks || 0);
    let total = Number(state.totalTasks || 0);

    /*
       لو عندنا Array للمهام نحاول نقرأها منها
    */

    if (Array.isArray(tasksData) && tasksData.length > 0) {

        total = tasksData.length;

        completed = tasksData.filter(task => {

            return (
                task.completed === true ||
                task.done === true ||
                task.status === "completed"
            );

        }).length;
    }

    const percent = total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    return {
        completed,
        total,
        percent: clamp(percent, 0, 100)
    };
}


/* =========================================================
   UPDATE OVERVIEW CARDS
   ========================================================= */

function renderOverview() {

    const prayer = getPrayerStats();
    const dhikr = getDhikrStats();
    const study = getStudyStats();
    const tasks = getTaskStats();


    /* ---------- PRAYER ---------- */

    const prayerStat = document.getElementById("prayerStat");
    const prayerProgress = document.getElementById("prayerProgress");
    const prayerExtra = document.getElementById("prayerExtra");

    if (prayerStat) {
        prayerStat.textContent =
            `${prayer.completed}/${prayer.total}`;
    }

    if (prayerProgress) {
        prayerProgress.style.width =
            `${prayer.percent}%`;
    }

    if (prayerExtra) {
        prayerExtra.textContent =
            `${prayer.percent}% من صلوات اليوم`;
    }


    /* ---------- DHIKR ---------- */

    const dhikrStat = document.getElementById("dhikrStat");
    const dhikrProgress = document.getElementById("dhikrProgress");
    const dhikrExtra = document.getElementById("dhikrExtra");

    if (dhikrStat) {
        dhikrStat.textContent =
            formatNumber(dhikr.count);
    }

    if (dhikrProgress) {
        dhikrProgress.style.width =
            `${dhikr.percent}%`;
    }

    if (dhikrExtra) {
        dhikrExtra.textContent =
            `${dhikr.percent}% من هدف ${formatNumber(dhikr.goal)}`;
    }


    /* ---------- STUDY ---------- */

    const studyStat = document.getElementById("studyStat");
    const studyProgress = document.getElementById("studyProgress");
    const studyExtra = document.getElementById("studyExtra");

    if (studyStat) {
        studyStat.textContent =
            formatMinutes(study.minutes);
    }

    if (studyProgress) {
        studyProgress.style.width =
            `${study.percent}%`;
    }

    if (studyExtra) {
        studyExtra.textContent =
            `${study.percent}% من هدف المذاكرة`;
    }


    /* ---------- TASKS ---------- */

    const tasksStat = document.getElementById("tasksStat");
    const tasksProgress = document.getElementById("tasksProgress");
    const tasksExtra = document.getElementById("tasksExtra");

    if (tasksStat) {
        tasksStat.textContent =
            `${tasks.completed}/${tasks.total}`;
    }

    if (tasksProgress) {
        tasksProgress.style.width =
            `${tasks.percent}%`;
    }

    if (tasksExtra) {

        if (tasks.total === 0) {
            tasksExtra.textContent = "لا توجد مهام";
        } else {
            tasksExtra.textContent =
                `${tasks.percent}% من المهام`;
        }
    }
}


/* =========================================================
   POINTS
   ========================================================= */

function getChallengePoints() {

    let points = Number(
        localStorage.getItem(CHALLENGE_POINTS_KEY) || 0
    );

    if (Number.isNaN(points)) {
        points = 0;
    }

    return points;
}


function getPointsBreakdown() {

    const prayer = getPrayerStats();
    const dhikr = getDhikrStats();
    const study = getStudyStats();

    /*
       تقدير النقاط الأساسية من الأنشطة.
       لو الصفحات الأخرى خزنت نقاط منفصلة يتم استخدامها.
    */

    const prayerPoints =
        prayer.completed * 10;

    const dhikrPoints =
        Number(state.dhikr?.points || 0);

    const studyPoints =
        Math.floor(study.minutes / 10);

    const challengePoints =
        getChallengePoints();

    let totalPoints =
        Number(state.points || 0);

    /*
       لو state.points لسه صفر لكن عندنا نشاط،
       نحسب قيمة مبدئية.
    */

    if (totalPoints <= 0) {

        totalPoints =
            prayerPoints +
            dhikrPoints +
            studyPoints +
            challengePoints;
    }

    return {
        totalPoints,
        prayerPoints,
        dhikrPoints,
        studyPoints,
        challengePoints
    };
}


/* =========================================================
   RENDER SCORE
   ========================================================= */

function renderScore() {

    const points = getPointsBreakdown();

    const totalPoints =
        document.getElementById("totalPoints");

    const prayerPoints =
        document.getElementById("prayerPoints");

    const dhikrPoints =
        document.getElementById("dhikrPoints");

    const studyPoints =
        document.getElementById("studyPoints");

    const challengePoints =
        document.getElementById("challengePoints");


    if (totalPoints) {
        totalPoints.textContent =
            formatNumber(points.totalPoints);
    }

    if (prayerPoints) {
        prayerPoints.textContent =
            formatNumber(points.prayerPoints);
    }

    if (dhikrPoints) {
        dhikrPoints.textContent =
            formatNumber(points.dhikrPoints);
    }

    if (studyPoints) {
        studyPoints.textContent =
            formatNumber(points.studyPoints);
    }

    if (challengePoints) {
        challengePoints.textContent =
            formatNumber(points.challengePoints);
    }
}


/* =========================================================
   ACTIVITY HISTORY
   ========================================================= */

function getHistoryDays(days = 7) {

    const result = [];

    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {

        const date = new Date(today);

        date.setDate(
            today.getDate() - i
        );

        const year = date.getFullYear();
        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        const key =
            `${year}-${month}-${day}`;

        const saved =
            dailyStats[key] || {};

        result.push({
            key,
            label: getDateLabel(date),
            prayer: Number(saved.prayer || 0),
            dhikr: Number(saved.dhikr || 0),
            study: Number(saved.study || 0),
            tasks: Number(saved.tasks || 0)
        });
    }

    /*
       لو مفيش History محفوظة لليوم الحالي،
       نحط بيانات اليوم الحالية في آخر عمود.
    */

    const todayKey = getTodayKey();

    const todayIndex =
        result.findIndex(item =>
            item.key === todayKey
        );

    if (todayIndex !== -1) {

        const prayer = getPrayerStats();
        const dhikr = getDhikrStats();
        const study = getStudyStats();
        const tasks = getTaskStats();

        const hasTodayHistory =
            dailyStats[todayKey];

        if (!hasTodayHistory) {

            result[todayIndex] = {
                ...result[todayIndex],

                prayer: prayer.percent,

                dhikr: dhikr.percent,

                study: study.percent,

                tasks: tasks.percent
            };
        }
    }

    return result;
}


/* =========================================================
   SAVE TODAY STATISTICS
   ========================================================= */

function saveTodayStatistics() {

    const prayer = getPrayerStats();
    const dhikr = getDhikrStats();
    const study = getStudyStats();
    const tasks = getTaskStats();

    const key = getTodayKey();

    const updatedHistory = {
        ...dailyStats,

        [key]: {
            prayer: prayer.percent,
            dhikr: dhikr.percent,
            study: study.percent,
            tasks: tasks.percent
        }
    };

    saveStorage(
        DAILY_STATS_KEY,
        updatedHistory
    );
}


/* =========================================================
   ACTIVITY CHART
   ========================================================= */

function renderActivityChart(period = "week") {

    const chart =
        document.getElementById("activityChart");

    if (!chart) {
        return;
    }

    chart.innerHTML = "";

    let days = 7;

    if (period === "month") {
        days = 30;
    }

    if (period === "all") {
        days = 30;
    }

    const history =
        getHistoryDays(days);

    /*
       عشان الـ30 يوم ميعملوش زحمة على الموبايل
    */

    let visibleHistory = history;

    if (days === 30) {

        visibleHistory =
            history.filter((item, index) => {

                return (
                    index % 3 === 0 ||
                    index === history.length - 1
                );
            });
    }


    visibleHistory.forEach(item => {

        const values = [
            item.prayer,
            item.dhikr,
            item.study,
            item.tasks
        ];

        const average =
            values.reduce(
                (sum, value) =>
                    sum + value,
                0
            ) / values.length;

        const safeAverage =
            clamp(Math.round(average), 0, 100);


        const barWrapper =
            document.createElement("div");

        barWrapper.className =
            "activity-bar";


        const bar =
            document.createElement("div");

        bar.className =
            "activity-bar-fill";


        bar.style.height =
            `${Math.max(safeAverage, 4)}%`;


        bar.title =
            `${item.label}: ${safeAverage}%`;


        const label =
            document.createElement("span");

        label.className =
            "activity-bar-label";

        label.textContent =
            item.label;


        const value =
            document.createElement("strong");

        value.className =
            "activity-bar-value";

        value.textContent =
            `${safeAverage}%`;


        barWrapper.appendChild(value);

        barWrapper.appendChild(bar);

        barWrapper.appendChild(label);

        chart.appendChild(barWrapper);
    });


    renderActivityInfo(
        visibleHistory
    );
}


/* =========================================================
   ACTIVITY INFO
   ========================================================= */

function renderActivityInfo(history) {

    const badge =
        document.getElementById("activityBadge");

    const averageElement =
        document.getElementById("activityAverage");


    if (!history.length) {
        return;
    }


    let total = 0;
    let count = 0;


    history.forEach(item => {

        const values = [
            item.prayer,
            item.dhikr,
            item.study,
            item.tasks
        ];

        const average =
            values.reduce(
                (sum, value) =>
                    sum + value,
                0
            ) / values.length;

        total += average;
        count++;
    });


    const average =
        count > 0
            ? Math.round(total / count)
            : 0;


    if (averageElement) {

        averageElement.textContent =
            `${average}%`;
    }


    if (badge) {

        if (average >= 80) {
            badge.textContent =
                "ممتاز جدًا";
        } else if (average >= 60) {
            badge.textContent =
                "أداء جيد";
        } else if (average >= 40) {
            badge.textContent =
                "في تحسن";
        } else {
            badge.textContent =
                "ابدأ بقوة";
        }
    }
}


/* =========================================================
   HABITS
   ========================================================= */

function renderHabits() {

    const prayer =
        getPrayerStats();

    const dhikr =
        getDhikrStats();

    const study =
        getStudyStats();

    const tasks =
        getTaskStats();


    const habitStatus =
        document.getElementById("habitStatus");


    if (habitStatus) {

        const total =
            prayer.percent +
            dhikr.percent +
            study.percent +
            tasks.percent;

        const average =
            Math.round(total / 4);


        if (average >= 85) {

            habitStatus.textContent =
                "عاداتك اليوم ممتازة 🔥";

        } else if (average >= 65) {

            habitStatus.textContent =
                "أداءك اليوم كويس جدًا 👏";

        } else if (average >= 40) {

            habitStatus.textContent =
                "كمل ومتوقفش 💪";

        } else {

            habitStatus.textContent =
                "ابدأ خطوة بخطوة 🌱";
        }
    }


    setHabit(
        "habitPrayer",
        "habitPrayerProgress",
        prayer.percent
    );

    setHabit(
        "habitDhikr",
        "habitDhikrProgress",
        dhikr.percent
    );

    setHabit(
        "habitStudy",
        "habitStudyProgress",
        study.percent
    );

    setHabit(
        "habitTasks",
        "habitTasksProgress",
        tasks.percent
    );
}


function setHabit(
    textId,
    progressId,
    percent
) {

    const text =
        document.getElementById(textId);

    const progress =
        document.getElementById(progressId);


    percent =
        clamp(Math.round(percent), 0, 100);


    if (text) {
        text.textContent =
            `${percent}%`;
    }

    if (progress) {
        progress.style.width =
            `${percent}%`;
    }
}











/* =========================================================
   STREAK
   ========================================================= */

function renderStreak() {

    const streak =
        Number(state.streak || 0);


    const currentStreak =
        document.getElementById("currentStreak");

    const message =
        document.getElementById("streakMessage");


    if (currentStreak) {

        currentStreak.textContent =
            formatNumber(streak);
    }


    if (!message) {
        return;
    }


    if (streak >= 30) {

        message.textContent =
            "🔥 سلسلة قوية جدًا! كمل بنفس المستوى.";

    } else if (streak >= 14) {

        message.textContent =
            "🔥 أسبوعين وأكثر من الاستمرارية!";

    } else if (streak >= 7) {

        message.textContent =
            "👏 أسبوع كامل من الالتزام.";

    } else if (streak >= 3) {

        message.textContent =
            "💪 بداية ممتازة، حافظ على السلسلة.";

    } else if (streak > 0) {

        message.textContent =
            "🌱 كل يوم بتلتزم فيه بيقوي عادتك.";

    } else {

        message.textContent =
            "ابدأ النهارده وخليها أول يوم في السلسلة.";
    }
}


/* =========================================================
   BEST DAY
   ========================================================= */

function renderBestDay() {

    const history =
        getHistoryDays(30);


    let bestDay = null;
    let bestScore = -1;


    history.forEach(item => {

        const values = [
            item.prayer,
            item.dhikr,
            item.study,
            item.tasks
        ];


        const score =
            values.reduce(
                (sum, value) =>
                    sum + value,
                0
            ) / values.length;


        if (score > bestScore) {

            bestScore = score;
            bestDay = item;
        }
    });


    const bestDayElement =
        document.getElementById("bestDay");

    const bestDayMessage =
        document.getElementById("bestDayMessage");


    if (!bestDay) {

        if (bestDayElement) {
            bestDayElement.textContent =
                "--";
        }

        return;
    }


    if (bestDayElement) {

        bestDayElement.textContent =
            bestDay.label;
    }


    if (bestDayMessage) {

        bestDayMessage.textContent =
            `متوسط نشاطك في أفضل يوم كان ${Math.round(bestScore)}%`;
    }
}


/* =========================================================
   WEEKLY SUMMARY
   ========================================================= */

function renderSummary() {

    const prayer =
        getPrayerStats();

    const dhikr =
        getDhikrStats();

    const study =
        getStudyStats();


    const tasks =
        getTaskStats();


    const completionValues = [
        prayer.percent,
        dhikr.percent,
        study.percent,
        tasks.percent
    ];


    const completion =
        Math.round(
            completionValues.reduce(
                (sum, value) =>
                    sum + value,
                0
            ) / completionValues.length
        );


    const completionRate =
        document.getElementById(
            "completionRate"
        );


    const averageStudy =
        document.getElementById(
            "averageStudy"
        );


    const averageDhikr =
        document.getElementById(
            "averageDhikr"
        );


    const userRank =
        document.getElementById(
            "userRank"
        );


    if (completionRate) {

        completionRate.textContent =
            `${completion}%`;
    }


    if (averageStudy) {

        averageStudy.textContent =
            formatMinutes(study.minutes);
    }


    if (averageDhikr) {

        averageDhikr.textContent =
            formatNumber(dhikr.count);
    }


    if (userRank) {

        calculateUserRank(
            userRank
        );
    }
}


/* =========================================================
   USER RANK
   ========================================================= */

function calculateUserRank(element) {

    const myPoints =
        getPointsBreakdown().totalPoints;


    const users =
        getStorage(
            "deenTrackUsers",
            []
        );


    if (!Array.isArray(users) ||
        users.length === 0) {

        element.textContent =
            "—";

        return;
    }


    const currentName =
        profile.name || "abdo";


    const scores = users.map(user => {

        return {
            name:
                user.name || "",

            points:
                Number(
                    user.points || 0
                )
        };

    });


    scores.push({
        name: currentName,
        points: myPoints
    });


    scores.sort(
        (a, b) =>
            b.points - a.points
    );


    const rank =
        scores.findIndex(
            user =>
                user.name === currentName &&
                user.points === myPoints
        ) + 1;


    element.textContent =
        rank > 0
            ? `#${rank}`
            : "—";
}


/* =========================================================
   PERIOD FILTER
   ========================================================= */

function setupPeriodButtons() {

    const buttons =
        document.querySelectorAll(
            ".period-btn"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                buttons.forEach(btn =>
                    btn.classList.remove(
                        "active"
                    )
                );


                button.classList.add(
                    "active"
                );


                const period =
                    button.dataset.period ||
                    "week";


                renderActivityChart(
                    period
                );
            }
        );
    });
}


/* =========================================================
   LIVE REFRESH
   ========================================================= */

function refreshStatistics() {

    state =
        getStorage(
            STATE_KEY,
            defaultState
        );


    state = {
        ...defaultState,
        ...state,

        prayers: {
            ...defaultState.prayers,
            ...(state.prayers || {})
        },

        dhikr: {
            ...defaultState.dhikr,
            ...(state.dhikr || {})
        }
    };


    renderOverview();

    renderScore();

    renderHabits();

    renderStreak();

    renderBestDay();

    renderSummary();

    renderActivityChart(
        getActivePeriod()
    );
}


/* =========================================================
   ACTIVE PERIOD
   ========================================================= */

function getActivePeriod() {

    const active =
        document.querySelector(
            ".period-btn.active"
        );


    if (!active) {
        return "week";
    }


    return (
        active.dataset.period ||
        "week"
    );
}


/* =========================================================
   STORAGE EVENT
   ========================================================= */

window.addEventListener(
    "storage",
    event => {

        if (
            event.key === STATE_KEY ||
            event.key === DAILY_STATS_KEY ||
            event.key === CHALLENGE_POINTS_KEY ||
            event.key === TASKS_KEY ||
            event.key === PROFILE_KEY
        ) {

            refreshStatistics();
        }
    }
);


/* =========================================================
   TAB VISIBILITY
   ========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (!document.hidden) {

            saveTodayStatistics();

            refreshStatistics();
        }
    }
);


/* =========================================================
   AUTO REFRESH
   ========================================================= */

setInterval(() => {

    if (!document.hidden) {

        refreshStatistics();
    }

}, 5000);


/* =========================================================
   INITIALIZE
   ========================================================= */

function initStatistics() {

    renderDate();

    saveTodayStatistics();

    setupPeriodButtons();

    renderOverview();

    renderScore();

    renderHabits();

    renderStreak();

    renderBestDay();

    renderSummary();

    renderActivityChart("week");
}


/* =========================================================
   START
   ========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initStatistics
    );

} else {

    initStatistics();
}