"use strict";

/* =========================================
   DEENTRACK — PROFILE SYSTEM
========================================= */

const PROFILE_STORAGE_KEY = "deenTrackProfile";
const MAIN_STORAGE_KEY = "deenTrackState";
const TASKS_STORAGE_KEY = "deenTrackTasks";

const defaultProfile = {
    name: "abdo",
    username: "",
    joinDate: "سبتمبر 2026"
};

let profile = loadProfile();


/* =========================================
   HELPERS
========================================= */

function $(id) {
    return document.getElementById(id);
}

function toNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}


/* =========================================
   PROFILE STORAGE
========================================= */

function loadProfile() {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);

    if (!saved) {
        return { ...defaultProfile };
    }

    try {
        const data = JSON.parse(saved);

        return {
            ...defaultProfile,
            ...data
        };

    } catch (error) {
        console.error("Profile loading error:", error);
        return { ...defaultProfile };
    }
}

function saveProfile() {
    localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(profile)
    );
}


/* =========================================
   MAIN DEENTRACK DATA
========================================= */

function loadMainState() {

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
        completedTasks: 0,
        totalTasks: 0
    };

    const saved = localStorage.getItem(MAIN_STORAGE_KEY);

    if (!saved) {
        return defaultState;
    }

    try {

        const data = JSON.parse(saved);

        return {
            ...defaultState,
            ...data
        };

    } catch (error) {

        console.error("Main state error:", error);

        return defaultState;
    }
}


/* =========================================
   TASK DATA
========================================= */

function loadTasks() {

    const saved = localStorage.getItem(TASKS_STORAGE_KEY);

    if (!saved) {
        return [];
    }

    try {

        const tasks = JSON.parse(saved);

        return Array.isArray(tasks) ? tasks : [];

    } catch (error) {

        console.error("Tasks loading error:", error);

        return [];
    }
}


/* =========================================
   DHIKR COUNT
========================================= */

function getDhikrCount(state) {

    if (typeof state.dhikr === "number") {
        return Math.max(0, toNumber(state.dhikr));
    }

    if (
        state.dhikr &&
        typeof state.dhikr === "object"
    ) {
        return Math.max(
            0,
            toNumber(state.dhikr.count)
        );
    }

    return 0;
}


/* =========================================
   UPDATE PROFILE TEXT
========================================= */

function updateProfileIdentity() {

    const name = profile.name || "abdo";
    const username = profile.username || "abdo";

    const elements = [
        $("profileName"),
        $("aboutName"),
        $("sidebarUserName")
    ];

    elements.forEach(element => {

        if (element) {
            element.textContent = name;
        }

    });


    const usernameElement = $("profileUsername");

    if (usernameElement) {
        usernameElement.textContent =
            "@" + username.replace(/^@/, "");
    }


    const avatar = $("profileAvatar");

    if (avatar) {

        avatar.textContent =
            name.trim().charAt(0) || "ع";
    }


    const joinDate = $("joinDate");

    if (joinDate) {
        joinDate.textContent =
            profile.joinDate || "سبتمبر 2026";
    }
}


/* =========================================
   CALCULATE DATA
========================================= */

function calculateProfileData() {

    const state = loadMainState();
    const tasks = loadTasks();

    const prayers = state.prayers || {};

    const prayerCount =
        Object.values(prayers).filter(Boolean).length;

    const dhikrCount =
        getDhikrCount(state);

    const studySeconds =
        Math.max(
            0,
            toNumber(state.studySeconds)
        );

    const studyHours =
        studySeconds / 3600;


    const taskTotal = tasks.length;

    const taskCompleted =
        tasks.filter(task => task.completed).length;


    const completedTasks =
        taskTotal > 0
            ? taskCompleted
            : Math.max(
                0,
                toNumber(state.completedTasks)
            );


    const totalTasks =
        taskTotal > 0
            ? taskTotal
            : Math.max(
                0,
                toNumber(state.totalTasks)
            );


    const points =
        Math.max(
            0,
            toNumber(state.points)
        );


    const streak =
        Math.max(
            0,
            toNumber(state.streak)
        );


    return {
        prayerCount,
        dhikrCount,
        studySeconds,
        studyHours,
        completedTasks,
        totalTasks,
        points,
        streak
    };
}


/* =========================================
   RANK SYSTEM
========================================= */

function getRankData(points) {

    if (points >= 1000) {

        return {
            rank: "Legend",
            previous: 1000,
            next: 2000,
            level: 10
        };

    }

    if (points >= 500) {

        return {
            rank: "متميز",
            previous: 500,
            next: 1000,
            level: 9
        };

    }

    if (points >= 250) {

        return {
            rank: "ملتزم",
            previous: 250,
            next: 500,
            level: 8
        };

    }

    if (points >= 100) {

        return {
            rank: "مجتهد",
            previous: 100,
            next: 250,
            level: 7
        };

    }

    return {
        rank: "مبتدئ",
        previous: 0,
        next: 100,
        level: 1
    };
}


/* =========================================
   UPDATE BASIC STATS
========================================= */

function updateBasicStats(data) {

    if ($("profileStreak")) {
        $("profileStreak").textContent =
            data.streak;
    }


    if ($("profilePoints")) {
        $("profilePoints").textContent =
            data.points;
    }


    if ($("profileStudyHours")) {
        $("profileStudyHours").textContent =
            data.studyHours.toFixed(1);
    }


    if ($("profilePrayers")) {
        $("profilePrayers").textContent =
            data.prayerCount;
    }


    if ($("sidebarStreak")) {
        $("sidebarStreak").textContent =
            data.streak;
    }


    if ($("dailyPrayerCount")) {
        $("dailyPrayerCount").textContent =
            data.prayerCount;
    }


    if ($("dailyDhikrCount")) {
        $("dailyDhikrCount").textContent =
            data.dhikrCount;
    }


    if ($("dailyTaskCount")) {
        $("dailyTaskCount").textContent =
            data.completedTasks;
    }


    const prayerPercent =
        Math.round((data.prayerCount / 5) * 100);


    const dhikrPercent =
        Math.min(
            100,
            Math.round((data.dhikrCount / 100) * 100)
        );


    const taskPercent =
        data.totalTasks > 0
            ? Math.round(
                (data.completedTasks /
                data.totalTasks) * 100
            )
            : 0;


    const studyPercent =
        Math.min(
            100,
            Math.round(
                (data.studySeconds /
                (2 * 60 * 60)) * 100
            )
        );


    updatePercent(
        "dailyPrayerPercent",
        prayerPercent
    );

    updatePercent(
        "dailyDhikrPercent",
        dhikrPercent
    );

    updatePercent(
        "dailyTaskPercent",
        taskPercent
    );


    updatePercent(
        "prayerActivityPercent",
        prayerPercent
    );

    updatePercent(
        "dhikrActivityPercent",
        dhikrPercent
    );

    updatePercent(
        "studyActivityPercent",
        studyPercent
    );

    updatePercent(
        "taskActivityPercent",
        taskPercent
    );


    updateBar(
        "prayerActivityBar",
        prayerPercent
    );

    updateBar(
        "dhikrActivityBar",
        dhikrPercent
    );

    updateBar(
        "studyActivityBar",
        studyPercent
    );

    updateBar(
        "taskActivityBar",
        taskPercent
    );
}


/* =========================================
   SMALL UI HELPERS
========================================= */

function updatePercent(id, value) {

    const element = $(id);

    if (!element) return;

    element.textContent = value;
}


function updateBar(id, value) {

    const element = $(id);

    if (!element) return;

    element.style.width =
        Math.max(0, Math.min(100, value)) + "%";
}


/* =========================================
   UPDATE LEVEL
========================================= */

function updateLevel(data) {

    const rankData =
        getRankData(data.points);


    const progress =
        rankData.next > rankData.previous
            ? (
                (data.points - rankData.previous) /
                (rankData.next - rankData.previous)
            ) * 100
            : 100;


    const safeProgress =
        Math.max(
            0,
            Math.min(100, progress)
        );


    if ($("profileLevel")) {
        $("profileLevel").textContent =
            rankData.level;
    }


    if ($("bigLevel")) {
        $("bigLevel").textContent =
            rankData.level;
    }


    if ($("profileRank")) {
        $("profileRank").textContent =
            rankData.rank;
    }


    if ($("aboutRank")) {
        $("aboutRank").textContent =
            rankData.rank;
    }


    if ($("sideRank")) {
        $("sideRank").textContent =
            rankData.rank;
    }


    if ($("nextRank")) {

        let nextRank = "متميز";

        if (rankData.rank === "مبتدئ") {
            nextRank = "مجتهد";
        }

        else if (rankData.rank === "مجتهد") {
            nextRank = "ملتزم";
        }

        else if (rankData.rank === "ملتزم") {
            nextRank = "متميز";
        }

        else if (rankData.rank === "متميز") {
            nextRank = "Legend";
        }

        else {
            nextRank = "MAX";
        }

        $("nextRank").textContent =
            nextRank;
    }


    if ($("profileXP")) {
        $("profileXP").textContent =
            data.points;
    }


    if ($("profileNextXP")) {
        $("profileNextXP").textContent =
            rankData.next;
    }


    if ($("profileXPFill")) {
        $("profileXPFill").style.width =
            safeProgress + "%";
    }


    if ($("sideRankPercent")) {
        $("sideRankPercent").textContent =
            Math.round(safeProgress) + "%";
    }


    if ($("sideRankBar")) {
        $("sideRankBar").style.width =
            safeProgress + "%";
    }
}


/* =========================================
   DAILY DATE
========================================= */

function updateJoinDate() {

    const element = $("joinDate");

    if (!element) return;

    element.textContent =
        profile.joinDate || "سبتمبر 2026";
}


/* =========================================
   EDIT PROFILE
========================================= */

function openProfileModal() {

    const modal = $("profileModal");

    if (!modal) return;

    const nameInput =
        $("profileNameInput");

    const usernameInput =
        $("profileUsernameInput");


    if (nameInput) {
        nameInput.value =
            profile.name || "";
    }


    if (usernameInput) {
        usernameInput.value =
            profile.username || "";
    }


    modal.classList.add("active");

    document.body.style.overflow = "hidden";
}


function closeProfileModal() {

    const modal = $("profileModal");

    if (!modal) return;

    modal.classList.remove("active");

    document.body.style.overflow = "";
}


/* =========================================
   SAVE PROFILE FORM
========================================= */

function setupProfileForm() {

    const form = $("profileForm");

    if (!form) return;


    form.addEventListener("submit", function(event) {

        event.preventDefault();


        const nameInput =
            $("profileNameInput");

        const usernameInput =
            $("profileUsernameInput");


        const name =
            nameInput
                ? nameInput.value.trim()
                : "";


        const username =
            usernameInput
                ? usernameInput.value.trim()
                : "";


        if (!name) {

            showToast(
                "اكتب اسمك الأول",
                "warning"
            );

            return;
        }


        if (!username) {

            showToast(
                "اكتب اسم المستخدم",
                "warning"
            );

            return;
        }


        profile.name = name;

        profile.username =
            username
                .replace(/^@/, "")
                .replace(/\s+/g, "_");


        saveProfile();

        updateProfileIdentity();

        closeProfileModal();


        showToast(
            "تم تحديث الملف الشخصي ✓"
        );
    });
}


/* =========================================
   MODAL CONTROLS
========================================= */

function setupModal() {

    const editButton =
        $("editProfileBtn");

    const closeButton =
        $("closeProfileModal");

    const cancelButton =
        $("cancelProfileEdit");

    const overlay =
        $("profileModalOverlay");


    if (editButton) {
        editButton.addEventListener(
            "click",
            openProfileModal
        );
    }


    if (closeButton) {
        closeButton.addEventListener(
            "click",
            closeProfileModal
        );
    }


    if (cancelButton) {
        cancelButton.addEventListener(
            "click",
            closeProfileModal
        );
    }


    if (overlay) {
        overlay.addEventListener(
            "click",
            closeProfileModal
        );
    }


    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Escape"
            ) {
                closeProfileModal();
            }

        }
    );
}


/* =========================================
   TOAST
========================================= */

function showToast(
    message,
    type = "success"
) {

    const container =
        $("toastContainer");

    if (!container) return;


    const toast =
        document.createElement("div");


    toast.className =
        "toast " + type;


    toast.textContent =
        message;


    container.appendChild(toast);


    setTimeout(() => {

        toast.style.opacity = "0";

        toast.style.transform =
            "translateY(10px)";

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 2400);
}


/* =========================================
   REFRESH PROFILE
========================================= */

function refreshProfile() {

    profile = loadProfile();

    const data =
        calculateProfileData();


    updateProfileIdentity();

    updateBasicStats(data);

    updateLevel(data);

    updateJoinDate();
}


/* =========================================
   START
========================================= */

function initializeProfile() {

    refreshProfile();

    setupModal();

    setupProfileForm();
}


document.addEventListener(
    "DOMContentLoaded",
    initializeProfile
);