/* =========================================
   DeenTrack - Study Timer
   Timestamp-based timer
   ========================================= */

const STORAGE_KEY = "deenTrackState";
const DAILY_GOAL = 120 * 60; // 120 minutes

let state = loadState();

let timerInterval = null;
let accumulatedSeconds = 0;
let startedAt = null;
let isRunning = false;
let currentSubject = "البرمجة";

/* =========================================
   Helpers
   ========================================= */

function getLocalDate() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatTime(totalSeconds) {
    totalSeconds = Math.max(0, Math.floor(totalSeconds));

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0")
    };
}

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return {
                points: 0,
                studySeconds: 0,
                timerRunning: false,
                timerStartedAt: null,

                study: {
                    today: 0,
                    total: 0,
                    bestDay: 0,
                    sessionsToday: 0,
                    date: getLocalDate(),
                    history: {},
                    sessions: []
                }
            };
        }

        const parsed = JSON.parse(saved);

        if (!parsed.study) {
            parsed.study = {};
        }

        parsed.study.today ??= 0;
        parsed.study.total ??= 0;
        parsed.study.bestDay ??= 0;
        parsed.study.sessionsToday ??= 0;
        parsed.study.date ??= getLocalDate();
        parsed.study.history ??= {};
        parsed.study.sessions ??= [];

        parsed.points ??= 0;
        parsed.studySeconds ??= 0;
        parsed.timerRunning ??= false;
        parsed.timerStartedAt ??= null;

        return parsed;

    } catch (error) {
        console.error("Failed to load DeenTrack state:", error);

        return {
            points: 0,
            studySeconds: 0,
            timerRunning: false,
            timerStartedAt: null,

            study: {
                today: 0,
                total: 0,
                bestDay: 0,
                sessionsToday: 0,
                date: getLocalDate(),
                history: {},
                sessions: []
            }
        };
    }
}

function saveState() {
    state.studySeconds = getCurrentElapsedSeconds();

    state.timerRunning = isRunning;
    state.timerStartedAt = startedAt;

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
    );
}

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toast._timer);

    toast._timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

/* =========================================
   Day Management
   ========================================= */

function checkNewDay() {
    const today = getLocalDate();

    if (state.study.date === today) {
        return;
    }

    const previousDay = state.study.today || 0;

    if (previousDay > state.study.bestDay) {
        state.study.bestDay = previousDay;
    }

    state.study.today = 0;
    state.study.sessionsToday = 0;
    state.study.date = today;

    state.study.history[today] ??= 0;

    saveState();
}

/* =========================================
   Timer Calculation
   ========================================= */

function getCurrentElapsedSeconds() {
    if (!isRunning || !startedAt) {
        return Math.floor(accumulatedSeconds);
    }

    const now = Date.now();

    const extraSeconds = Math.floor(
        (now - startedAt) / 1000
    );

    return Math.floor(
        accumulatedSeconds + extraSeconds
    );
}

/* =========================================
   UI Elements
   ========================================= */

const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");

const timerCircle = document.getElementById("timerCircle");

const startButton = document.getElementById("startStudy");
const pauseButton = document.getElementById("pauseStudy");
const resetButton = document.getElementById("resetStudy");

const subjectInput = document.getElementById("studySubject");

const todayStudyElement = document.getElementById("todayStudy");
const bestDayElement = document.getElementById("bestDay");
const sessionsTodayElement = document.getElementById("sessionsToday");

const goalProgress = document.getElementById("goalProgress");
const goalText = document.getElementById("goalText");

const timerStatus = document.getElementById("timerStatus");

const sessionsList = document.getElementById("sessionsList");

const clearHistoryButton =
    document.getElementById("clearHistory");

/* =========================================
   Subject
   ========================================= */

function updateSubject() {
    if (!subjectInput) return;

    const value = subjectInput.value.trim();

    if (value.length > 0) {
        currentSubject = value;
    }
}

/* =========================================
   Timer UI
   ========================================= */

function updateTimerUI() {
    const totalSeconds = getCurrentElapsedSeconds();

    const time = formatTime(totalSeconds);

    if (hoursElement) {
        hoursElement.textContent = time.hours;
    }

    if (minutesElement) {
        minutesElement.textContent = time.minutes;
    }

    if (secondsElement) {
        secondsElement.textContent = time.seconds;
    }

    if (timerStatus) {
        if (isRunning) {
            timerStatus.textContent = "جاري المذاكرة الآن";
            timerStatus.classList.add("active");
        } else if (totalSeconds > 0) {
            timerStatus.textContent = "متوقف مؤقتًا";
            timerStatus.classList.remove("active");
        } else {
            timerStatus.textContent = "جاهز للبدء";
            timerStatus.classList.remove("active");
        }
    }

    if (startButton) {
        startButton.disabled = isRunning;
    }

    if (pauseButton) {
        pauseButton.disabled = !isRunning;
    }

    /* Circle progress */
    if (timerCircle) {
        const percentage =
            Math.min(
                (totalSeconds / DAILY_GOAL) * 100,
                100
            );

        timerCircle.style.setProperty(
            "--progress",
            `${percentage}%`
        );
    }
}

/* =========================================
   Study Statistics
   ========================================= */

function updateStats() {
    const today = state.study.today || 0;

    const todayMinutes =
        Math.floor(today / 60);

    const bestMinutes =
        Math.floor((state.study.bestDay || 0) / 60);

    if (todayStudyElement) {
        todayStudyElement.textContent =
            `${todayMinutes} دقيقة`;
    }

    if (bestDayElement) {
        bestDayElement.textContent =
            `${bestMinutes} دقيقة`;
    }

    if (sessionsTodayElement) {
        sessionsTodayElement.textContent =
            state.study.sessionsToday || 0;
    }

    const percentage =
        Math.min(
            (today / DAILY_GOAL) * 100,
            100
        );

    if (goalProgress) {
        goalProgress.style.width =
            `${percentage}%`;
    }

    if (goalText) {
        goalText.textContent =
            `${todayMinutes} / 120 دقيقة`;
    }
}

/* =========================================
   Sessions History
   ========================================= */

function renderSessions() {
    if (!sessionsList) return;

    const sessions =
        state.study.sessions || [];

    if (sessions.length === 0) {
        sessionsList.innerHTML = `
            <div class="empty-sessions">
                <span>📚</span>
                <p>لسه مفيش جلسات مذاكرة</p>
                <small>ابدأ أول جلسة وخلي تقدمك يظهر هنا</small>
            </div>
        `;

        return;
    }

    const recentSessions =
        sessions.slice(-10).reverse();

    sessionsList.innerHTML =
        recentSessions.map(session => {

            const time =
                formatTime(session.seconds);

            const date =
                new Date(session.date);

            const dateText =
                date.toLocaleDateString("ar-EG", {
                    day: "numeric",
                    month: "short"
                });

            const duration =
                time.hours !== "00"
                    ? `${time.hours}:${time.minutes}:${time.seconds}`
                    : `${time.minutes}:${time.seconds}`;

            return `
                <div class="study-session">
                    <div class="session-icon">
                        📚
                    </div>

                    <div class="session-info">
                        <strong>
                            ${escapeHTML(session.subject)}
                        </strong>

                        <span>
                            ${dateText}
                        </span>
                    </div>

                    <div class="session-duration">
                        ${duration}
                    </div>
                </div>
            `;

        }).join("");
}

function escapeHTML(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================================
   Start Timer
   ========================================= */

function startStudy() {
    checkNewDay();

    if (isRunning) return;

    updateSubject();

    if (!currentSubject) {
        currentSubject = "مذاكرة عامة";
    }

    /*
       IMPORTANT:
       We store Date.now() instead of relying
       on setInterval.

       So if the user closes the website,
       the elapsed time can be calculated
       when they open it again.
    */

    startedAt = Date.now();
    isRunning = true;

    state.timerRunning = true;
    state.timerStartedAt = startedAt;

    saveState();

    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        updateTimerUI();
    }, 500);

    updateTimerUI();

    showToast("🚀 بدأت جلسة المذاكرة");
}

/* =========================================
   Pause Timer
   ========================================= */

function pauseStudy() {
    if (!isRunning) return;

    const currentElapsed =
        getCurrentElapsedSeconds();

    accumulatedSeconds =
        currentElapsed;

    isRunning = false;
    startedAt = null;

    state.timerRunning = false;
    state.timerStartedAt = null;

    saveState();

    clearInterval(timerInterval);
    timerInterval = null;

    updateTimerUI();

    showToast("⏸️ تم إيقاف المذاكرة مؤقتًا");
}

/* =========================================
   Finish Current Session
   ========================================= */

function finishSession() {
    const elapsed =
        getCurrentElapsedSeconds();

    if (elapsed < 60) {
        showToast("⏱️ ذاكر دقيقة على الأقل عشان تتسجل الجلسة");
        return false;
    }

    checkNewDay();

    const today = getLocalDate();

    const subject =
        currentSubject ||
        subjectInput?.value.trim() ||
        "مذاكرة عامة";

    /* Update daily statistics */
    state.study.today += elapsed;

    state.study.total += elapsed;

    state.study.history[today] =
        (state.study.history[today] || 0) +
        elapsed;

    state.study.sessionsToday += 1;

    if (
        state.study.today >
        state.study.bestDay
    ) {
        state.study.bestDay =
            state.study.today;
    }

    /* Gamification */
    const earnedPoints =
        Math.max(
            1,
            Math.floor(elapsed / 600)
        );

    state.points += earnedPoints;

    /* Save session */
    state.study.sessions.push({
        id: Date.now(),
        subject: subject,
        seconds: elapsed,
        date: new Date().toISOString()
    });

    /* Keep history small */
    if (state.study.sessions.length > 100) {
        state.study.sessions =
            state.study.sessions.slice(-100);
    }

    saveState();

    return earnedPoints;
}

/* =========================================
   Reset Timer
   ========================================= */

function resetStudy() {
    const elapsed =
        getCurrentElapsedSeconds();

    if (elapsed >= 60) {
        const earned =
            finishSession();

        if (earned !== false) {
            showToast(
                `✅ اتسجلت الجلسة +${earned} نقطة`
            );
        }
    }

    isRunning = false;
    startedAt = null;
    accumulatedSeconds = 0;

    state.timerRunning = false;
    state.timerStartedAt = null;
    state.studySeconds = 0;

    saveState();

    clearInterval(timerInterval);
    timerInterval = null;

    updateTimerUI();
    updateStats();
    renderSessions();
}

/* =========================================
   Restore Timer After Closing Website
   ========================================= */

function restoreTimer() {
    checkNewDay();

    /*
       Restore values from previous page load.
    */

    isRunning =
        Boolean(state.timerRunning);

    startedAt =
        state.timerStartedAt || null;

    /*
       state.studySeconds contains the
       accumulated time before the last save.
    */

    accumulatedSeconds =
        Number(state.studySeconds || 0);

    /*
       If timer was running before the page
       was closed, we DON'T add anything here.

       getCurrentElapsedSeconds() calculates:

       accumulated +
       (Date.now() - startedAt)

       This is what makes the timer continue
       even when the website was closed.
    */

    if (
        isRunning &&
        startedAt
    ) {
        clearInterval(timerInterval);

        timerInterval = setInterval(() => {
            updateTimerUI();
        }, 500);

        showToast(
            "🔄 رجعنا جلسة المذاكرة اللي كانت شغالة"
        );
    }

    updateTimerUI();
}

/* =========================================
   Clear History
   ========================================= */

function clearHistory() {
    const sessions =
        state.study.sessions || [];

    if (sessions.length === 0) {
        showToast("مفيش سجل تمسحه");
        return;
    }

    const confirmed =
        confirm(
            "هل أنت متأكد إنك عايز تمسح سجل جلسات المذاكرة؟"
        );

    if (!confirmed) return;

    state.study.sessions = [];

    saveState();

    renderSessions();

    showToast("🗑️ تم مسح سجل الجلسات");
}

/* =========================================
   Quick Subjects
   ========================================= */

function setupSubjects() {
    const subjectCards =
        document.querySelectorAll(
            "[data-subject]"
        );

    subjectCards.forEach(card => {

        card.addEventListener("click", () => {

            const subject =
                card.dataset.subject;

            if (!subject) return;

            currentSubject = subject;

            if (subjectInput) {
                subjectInput.value =
                    subject;
            }

            document
                .querySelectorAll(
                    "[data-subject]"
                )
                .forEach(item => {
                    item.classList.remove(
                        "selected"
                    );
                });

            card.classList.add("selected");

            showToast(
                `📚 المادة: ${subject}`
            );
        });

    });
}

/* =========================================
   Button Events
   ========================================= */

if (startButton) {
    startButton.addEventListener(
        "click",
        startStudy
    );
}

if (pauseButton) {
    pauseButton.addEventListener(
        "click",
        pauseStudy
    );
}

if (resetButton) {
    resetButton.addEventListener(
        "click",
        resetStudy
    );
}

if (subjectInput) {
    subjectInput.addEventListener(
        "input",
        updateSubject
    );

    subjectInput.addEventListener(
        "change",
        updateSubject
    );
}

if (clearHistoryButton) {
    clearHistoryButton.addEventListener(
        "click",
        clearHistory
    );
}

/* =========================================
   Page Visibility
   ========================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (document.visibilityState === "visible") {

            checkNewDay();

            /*
               Recalculate immediately because
               time may have passed while the tab
               was hidden.
            */

            updateTimerUI();
            updateStats();
        }

    }
);

/* =========================================
   Before Leaving
   ========================================= */

window.addEventListener(
    "beforeunload",
    () => {

        /*
           Do NOT stop the timer.

           Just save the timestamp so that when
           the user opens the website again,
           the elapsed time can be calculated.
        */

        saveState();
    }
);

/* =========================================
   Initialize
   ========================================= */

function initStudy() {
    checkNewDay();

    restoreTimer();

    updateStats();

    renderSessions();

    setupSubjects();

    if (subjectInput) {
        subjectInput.value =
            currentSubject;
    }
}

initStudy();