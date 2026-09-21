"use strict";

/* =========================================================
   DEENTRACK — CHALLENGES SYSTEM
========================================================= */

const CHALLENGES_KEY = "deenTrackChallenges";
const STATE_KEY = "deenTrackState";
const PROFILE_KEY = "deenTrackProfile";
const FRIENDS_KEY = "deenTrackFriends";
const USERS_KEY = "deenTrackUsers";
const TASKS_KEY = "deenTrackTasks";
const CHALLENGE_POINTS_KEY = "deenTrackChallengePoints";

let challenges = [];
let currentFilter = "all";

/* =========================================================
   HELPERS
========================================================= */

function getJSON(key, fallback) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch (error) {
        console.error(`Error loading ${key}:`, error);
        return fallback;
    }
}

function saveJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving ${key}:`, error);
    }
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getState() {
    const state = getJSON(STATE_KEY, {});

    if (!state.prayers) {
        state.prayers = {
            fajr: false,
            dhuhr: false,
            asr: false,
            maghrib: false,
            isha: false
        };
    }

    if (!state.dhikr || typeof state.dhikr !== "object") {
        state.dhikr = {
            count: 0,
            total: 0,
            points: 0
        };
    }

    if (typeof state.studySeconds !== "number") {
        state.studySeconds = 0;
    }

    if (typeof state.points !== "number") {
        state.points = 0;
    }

    return state;
}

function getProfile() {
    return getJSON(PROFILE_KEY, {
        name: "abdo",
        username: "abdo",
        points: 0,
        streak: 0
    });
}

function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");

    if (!container) {
        alert(message);
        return;
    }

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-15px)";

        setTimeout(() => {
            toast.remove();
        }, 250);
    }, 2800);
}

/* =========================================================
   DEMO CHALLENGES
========================================================= */

function createDefaultChallenges() {
    const now = Date.now();

    return [
        {
            id: `challenge_${now}_1`,
            name: "تحدي الصلوات",
            type: "daily",
            category: "prayer",
            goal: 5,
            reward: 50,
            description: "حافظ على الصلوات الخمس اليوم.",
            createdAt: now,
            rewardClaimed: false
        },

        {
            id: `challenge_${now}_2`,
            name: "تحدي الاستغفار",
            type: "daily",
            category: "dhikr",
            goal: 100,
            reward: 30,
            description: "وصل إلى 100 استغفار اليوم.",
            createdAt: now,
            rewardClaimed: false
        },

        {
            id: `challenge_${now}_3`,
            name: "ساعتين مذاكرة",
            type: "daily",
            category: "study",
            goal: 120,
            reward: 60,
            description: "ذاكر لمدة ساعتين اليوم.",
            createdAt: now,
            rewardClaimed: false
        },

        {
            id: `challenge_${now}_4`,
            name: "أسبوع المهام",
            type: "weekly",
            category: "tasks",
            goal: 7,
            reward: 100,
            description: "أنجز 7 مهام خلال الأسبوع.",
            createdAt: now,
            rewardClaimed: false
        }
    ];
}

function loadChallenges() {
    const saved = getJSON(CHALLENGES_KEY, null);

    if (Array.isArray(saved) && saved.length > 0) {
        challenges = saved;
    } else {
        challenges = createDefaultChallenges();
        saveJSON(CHALLENGES_KEY, challenges);
    }
}

/* =========================================================
   CALCULATE PROGRESS
========================================================= */

function getPrayerProgress() {
    const state = getState();

    return Object.values(state.prayers)
        .filter(Boolean)
        .length;
}

function getDhikrProgress() {
    const state = getState();

    return Number(state.dhikr.count) || 0;
}

function getStudyProgress() {
    const state = getState();

    return Math.floor(
        (Number(state.studySeconds) || 0) / 60
    );
}

function getTasksProgress() {
    const tasks = getJSON(TASKS_KEY, []);

    if (!Array.isArray(tasks)) {
        return 0;
    }

    return tasks.filter(task => {
        return (
            task.completed === true ||
            task.done === true ||
            task.status === "completed"
        );
    }).length;
}

function getChallengeProgress(challenge) {
    switch (challenge.category) {

        case "prayer":
            return getPrayerProgress();

        case "dhikr":
            return getDhikrProgress();

        case "study":
            return getStudyProgress();

        case "tasks":
            return getTasksProgress();

        default:
            return Number(challenge.progress) || 0;
    }
}

/* =========================================================
   CATEGORY INFO
========================================================= */

function getCategoryInfo(category) {

    const categories = {
        prayer: {
            icon: "🕌",
            name: "الصلاة",
            unit: "صلاة"
        },

        dhikr: {
            icon: "📿",
            name: "الاستغفار",
            unit: "استغفار"
        },

        study: {
            icon: "📚",
            name: "المذاكرة",
            unit: "دقيقة"
        },

        tasks: {
            icon: "✅",
            name: "المهام",
            unit: "مهمة"
        }
    };

    return categories[category] || {
        icon: "🎯",
        name: "عام",
        unit: "نقطة"
    };
}

/* =========================================================
   REWARD SYSTEM
========================================================= */

function updateChallengeRewards() {

    let challengePoints = Number(
        localStorage.getItem(CHALLENGE_POINTS_KEY)
    ) || 0;

    const state = getState();

    let stateChanged = false;

    challenges.forEach(challenge => {

        const progress = getChallengeProgress(challenge);

        if (
            progress >= challenge.goal &&
            !challenge.rewardClaimed
        ) {

            challenge.rewardClaimed = true;

            challengePoints += Number(challenge.reward) || 0;

            state.points =
                (Number(state.points) || 0) +
                (Number(challenge.reward) || 0);

            stateChanged = true;

            showToast(
                `🎉 أحسنت! كسبت ${challenge.reward} نقطة من تحدي "${challenge.name}"`,
                "success"
            );
        }
    });

    if (stateChanged) {
        saveJSON(STATE_KEY, state);
        localStorage.setItem(
            CHALLENGE_POINTS_KEY,
            String(challengePoints)
        );

        saveJSON(CHALLENGES_KEY, challenges);
    }
}

/* =========================================================
   RENDER CHALLENGE CARD
========================================================= */

function renderChallengeCard(challenge) {

    const info = getCategoryInfo(challenge.category);

    const progress = getChallengeProgress(challenge);

    const safeGoal = Math.max(Number(challenge.goal) || 1, 1);

    const percentage = Math.min(
        Math.round((progress / safeGoal) * 100),
        100
    );

    const completed = percentage >= 100;

    const typeName =
        challenge.type === "weekly"
            ? "أسبوعي"
            : "يومي";

    const progressText =
        `${Math.min(progress, safeGoal)} / ${safeGoal}`;

    return `
        <article class="challenge-card ${completed ? "completed" : ""}">

            <div class="challenge-card-top">

                <div class="challenge-card-icon">
                    ${info.icon}
                </div>

                <div class="challenge-card-badges">

                    <span class="challenge-badge">
                        ${typeName}
                    </span>

                    <span class="challenge-badge">
                        ${escapeHTML(info.name)}
                    </span>

                </div>

            </div>

            <h3>
                ${escapeHTML(challenge.name)}
            </h3>

            <p class="challenge-card-description">
                ${escapeHTML(
                    challenge.description ||
                    "تحدي جديد لتطوير يومك خطوة بخطوة."
                )}
            </p>

            <div class="challenge-progress-header">

                <span>
                    التقدم
                </span>

                <strong>
                    ${progressText}
                </strong>

            </div>

            <div class="challenge-progress-bar">

                <div
                    class="challenge-progress-fill"
                    style="width:${percentage}%"
                ></div>

            </div>

            <div class="challenge-card-footer">

                <div class="challenge-reward">
                    🏆
                    <span>
                        +${Number(challenge.reward) || 0}
                    </span>
                    نقطة
                </div>

                <button
                    class="challenge-card-action"
                    data-refresh-challenge="${escapeHTML(challenge.id)}"
                    ${completed ? "disabled" : ""}
                >
                    ${
                        completed
                            ? "✓ مكتمل"
                            : "↻ تحديث"
                    }
                </button>

            </div>

        </article>
    `;
}

/* =========================================================
   FILTER
========================================================= */

function getFilteredChallenges() {

    if (currentFilter === "all") {
        return challenges;
    }

    return challenges.filter(challenge => {

        const progress = getChallengeProgress(challenge);

        const completed =
            progress >= Number(challenge.goal);

        if (currentFilter === "completed") {
            return completed;
        }

        if (currentFilter === "active") {
            return !completed;
        }

        if (
            currentFilter === "daily" ||
            currentFilter === "weekly"
        ) {
            return challenge.type === currentFilter;
        }

        return true;
    });
}

/* =========================================================
   RENDER CHALLENGES
========================================================= */

function renderChallenges() {

    const grid = document.getElementById("challengesGrid");

    if (!grid) {
        return;
    }

    const filtered = getFilteredChallenges();

    if (filtered.length === 0) {

        grid.innerHTML = `
            <div class="challenge-empty">

                <div class="challenge-empty-icon">
                    🎯
                </div>

                <h3>
                    مفيش تحديات هنا
                </h3>

                <p>
                    جرّب فلتر تاني أو أنشئ تحدي جديد.
                </p>

            </div>
        `;

        return;
    }

    grid.innerHTML = filtered
        .map(renderChallengeCard)
        .join("");

    document
        .querySelectorAll("[data-refresh-challenge]")
        .forEach(button => {

            button.addEventListener("click", () => {

                renderAll();

                showToast(
                    "تم تحديث تقدم التحديات ✓",
                    "success"
                );
            });

        });
}

/* =========================================================
   STATS
========================================================= */

function updateStats() {

    const total = challenges.length;

    const completed = challenges.filter(challenge => {

        return (
            getChallengeProgress(challenge) >=
            Number(challenge.goal)
        );

    }).length;

    const active = total - completed;

    const challengePoints =
        Number(
            localStorage.getItem(CHALLENGE_POINTS_KEY)
        ) || 0;

    const totalElement =
        document.getElementById("totalChallenges");

    const activeElement =
        document.getElementById("activeChallenges");

    const completedElement =
        document.getElementById("completedChallenges");

    const pointsElement =
        document.getElementById("challengePoints");

    if (totalElement) {
        totalElement.textContent = total;
    }

    if (activeElement) {
        activeElement.textContent = active;
    }

    if (completedElement) {
        completedElement.textContent = completed;
    }

    if (pointsElement) {
        pointsElement.textContent = challengePoints;
    }

    updatePerformance();
}

/* =========================================================
   PERFORMANCE
========================================================= */

function updatePerformance() {

    const total = challenges.length;

    const completed = challenges.filter(challenge => {

        return (
            getChallengeProgress(challenge) >=
            Number(challenge.goal)
        );

    }).length;

    const percentage =
        total === 0
            ? 0
            : Math.round((completed / total) * 100);

    const percentElement =
        document.getElementById("performancePercent");

    const progressElement =
        document.getElementById("performanceProgress");

    const messageElement =
        document.getElementById("performanceMessage");

    if (percentElement) {
        percentElement.textContent = `${percentage}%`;
    }

    if (progressElement) {
        progressElement.style.width = `${percentage}%`;
    }

    if (messageElement) {

        if (percentage === 100) {
            messageElement.textContent =
                "🔥 ممتاز! خلصت كل التحديات الحالية.";
        } else if (percentage >= 75) {
            messageElement.textContent =
                "🚀 أداء قوي جدًا! كمل بنفس المستوى.";
        } else if (percentage >= 40) {
            messageElement.textContent =
                "💪 مستواك كويس، قربت تحقق أهدافك.";
        } else {
            messageElement.textContent =
                "🌱 ابدأ بخطوة صغيرة النهارده.";
        }
    }
}

/* =========================================================
   FILTER BUTTONS
========================================================= */

function setupFilters() {

    const buttons =
        document.querySelectorAll(".challenge-filter");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            buttons.forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            currentFilter =
                button.dataset.filter || "all";

            renderChallenges();
        });

    });
}

/* =========================================================
   CREATE CHALLENGE MODAL
========================================================= */

function openChallengeModal() {

    const modal =
        document.getElementById("challengeModal");

    if (!modal) {
        return;
    }

    modal.classList.add("active");

    document.body.style.overflow = "hidden";

    const nameInput =
        document.getElementById("challengeName");

    if (nameInput) {
        setTimeout(() => {
            nameInput.focus();
        }, 100);
    }
}

function closeChallengeModal() {

    const modal =
        document.getElementById("challengeModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("active");

    document.body.style.overflow = "";
}

function setupModal() {

    const openButton =
        document.getElementById("openChallengeBtn");

    const cancelButton =
        document.getElementById("cancelChallenge");

    const closeButton =
        document.getElementById("closeChallengeModal");

    const overlay =
        document.querySelector(".challenge-modal-overlay");

    if (openButton) {
        openButton.addEventListener(
            "click",
            openChallengeModal
        );
    }

    if (cancelButton) {
        cancelButton.addEventListener(
            "click",
            closeChallengeModal
        );
    }

    if (closeButton) {
        closeButton.addEventListener(
            "click",
            closeChallengeModal
        );
    }

    if (overlay) {
        overlay.addEventListener(
            "click",
            closeChallengeModal
        );
    }

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeChallengeModal();
        }

    });
}










/* =========================================================
   CREATE CHALLENGE MODAL
========================================================= */

function openChallengeModal() {

    const modal = document.getElementById("challengeModal");

    if (!modal) {
        return;
    }

    modal.classList.add("active");

    document.body.style.overflow = "hidden";

    const nameInput = document.getElementById("challengeName");

    if (nameInput) {
        setTimeout(() => {
            nameInput.focus();
        }, 100);
    }
}


function closeChallengeModal() {

    const modal = document.getElementById("challengeModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("active");

    document.body.style.overflow = "";
}


/* =========================================================
   MODAL EVENTS
========================================================= */

function setupModal() {

    const openButton =
        document.getElementById("openChallengeBtn");

    const cancelButton =
        document.getElementById("cancelChallenge");

    const closeButton =
        document.getElementById("closeChallengeModal");

    const overlay =
        document.querySelector(".challenge-modal-overlay");


    if (openButton) {
        openButton.addEventListener(
            "click",
            openChallengeModal
        );
    }


    if (cancelButton) {
        cancelButton.addEventListener(
            "click",
            closeChallengeModal
        );
    }


    if (closeButton) {
        closeButton.addEventListener(
            "click",
            closeChallengeModal
        );
    }


    if (overlay) {
        overlay.addEventListener(
            "click",
            closeChallengeModal
        );
    }


    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeChallengeModal();
        }

    });
}


/* =========================================================
   CREATE CHALLENGE
========================================================= */

function setupChallengeForm() {

    const form =
        document.getElementById("challengeForm");


    if (!form) {
        return;
    }


    form.addEventListener("submit", event => {

        event.preventDefault();


        const name =
            document
                .getElementById("challengeName")
                ?.value
                .trim();


        const type =
            document
                .getElementById("challengeType")
                ?.value || "daily";


        const category =
            document
                .getElementById("challengeCategory")
                ?.value || "prayer";


        const goal =
            Number(
                document
                    .getElementById("challengeGoal")
                    ?.value
            );


        const reward =
            Number(
                document
                    .getElementById("challengeReward")
                    ?.value
            );


        const description =
            document
                .getElementById("challengeDescription")
                ?.value
                .trim() || "";


        /* =========================
           VALIDATION
        ========================= */

        if (!name) {

            showToast(
                "اكتب اسم التحدي الأول.",
                "error"
            );

            return;
        }


        if (!Number.isFinite(goal) || goal < 1) {

            showToast(
                "الهدف لازم يكون أكبر من صفر.",
                "error"
            );

            return;
        }


        if (!Number.isFinite(reward) || reward < 1) {

            showToast(
                "المكافأة لازم تكون أكبر من صفر.",
                "error"
            );

            return;
        }


        /* =========================
           NEW CHALLENGE
        ========================= */

        const challenge = {

            id:
                `challenge_${Date.now()}_${Math.random()
                    .toString(36)
                    .slice(2, 8)}`,

            name: name,

            type: type,

            category: category,

            goal: goal,

            reward: reward,

            description: description,

            createdAt: Date.now(),

            rewardClaimed: false

        };


        challenges.unshift(challenge);


        saveJSON(
            CHALLENGES_KEY,
            challenges
        );


        /* =========================
           RESET FORM
        ========================= */

        form.reset();


        const goalInput =
            document.getElementById("challengeGoal");


        const rewardInput =
            document.getElementById("challengeReward");


        if (goalInput) {
            goalInput.value = 100;
        }


        if (rewardInput) {
            rewardInput.value = 50;
        }


        /* =========================
           CLOSE + UPDATE
        ========================= */

        closeChallengeModal();


        renderAll();


        showToast(
            "🎯 تم إنشاء التحدي بنجاح!",
            "success"
        );

    });
}


/* =========================================================
   STORAGE SYNC
========================================================= */

window.addEventListener("storage", event => {

    if (
        event.key === STATE_KEY ||
        event.key === TASKS_KEY ||
        event.key === PROFILE_KEY ||
        event.key === FRIENDS_KEY ||
        event.key === USERS_KEY ||
        event.key === CHALLENGES_KEY
    ) {

        loadChallenges();

        renderAll();

    }

});


/* =========================================================
   PAGE VISIBILITY
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (!document.hidden) {

            loadChallenges();

            renderAll();

        }

    }
);


/* =========================================================
   PAGE SHOW
========================================================= */

window.addEventListener(
    "pageshow",
    () => {

        loadChallenges();

        renderAll();

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadChallenges();

        setupFilters();

        setupModal();

        setupChallengeForm();

        renderAll();

    }
);