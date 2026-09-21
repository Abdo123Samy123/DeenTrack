"use strict";

/* =========================================
   DEENTRACK — FRIENDS SYSTEM
   LocalStorage Version
========================================= */

const FRIENDS_STORAGE_KEY = "deenTrackFriends";
const REQUESTS_STORAGE_KEY = "deenTrackFriendRequests";
const USERS_STORAGE_KEY = "deenTrackUsers";
const PROFILE_STORAGE_KEY = "deenTrackProfile";
const MAIN_STORAGE_KEY = "deenTrackState";


/* =========================================
   DEFAULT USERS
========================================= */

const defaultUsers = [
    {
        id: "user_1",
        name: "أحمد",
        username: "ahmed",
        points: 860,
        streak: 12,
        online: true
    },
    {
        id: "user_2",
        name: "محمد",
        username: "mohamed",
        points: 620,
        streak: 8,
        online: false
    },
    {
        id: "user_3",
        name: "يوسف",
        username: "youssef",
        points: 430,
        streak: 15,
        online: true
    },
    {
        id: "user_4",
        name: "عمر",
        username: "omar",
        points: 275,
        streak: 5,
        online: false
    }
];


/* =========================================
   HELPERS
========================================= */

function $(id) {
    return document.getElementById(id);
}

function loadJSON(key, fallback) {
    const saved = localStorage.getItem(key);

    if (!saved) {
        return fallback;
    }

    try {
        return JSON.parse(saved);
    } catch (error) {
        console.error(`Error loading ${key}:`, error);
        return fallback;
    }
}

function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}


/* =========================================
   PROFILE
========================================= */

function getCurrentProfile() {

    const profile = loadJSON(
        PROFILE_STORAGE_KEY,
        {
            name: "abdo",
            username: "abdo"
        }
    );

    return {
        name: profile.name || "abdo",
        username: String(
            profile.username || "abdo"
        ).replace(/^@/, "").toLowerCase()
    };
}


/* =========================================
   MAIN STATE
========================================= */

function getMainState() {

    return loadJSON(
        MAIN_STORAGE_KEY,
        {
            points: 0,
            streak: 0
        }
    );
}


/* =========================================
   FRIENDS
========================================= */

let friends = loadJSON(
    FRIENDS_STORAGE_KEY,
    []
);


/* =========================================
   REQUESTS
========================================= */

let friendRequests = loadJSON(
    REQUESTS_STORAGE_KEY,
    []
);


/* =========================================
   USERS
========================================= */

let users = loadJSON(
    USERS_STORAGE_KEY,
    defaultUsers
);


/* =========================================
   INITIALIZE DEMO USERS
========================================= */

function initializeUsers() {

    if (!Array.isArray(users) || users.length === 0) {
        users = [...defaultUsers];

        saveJSON(
            USERS_STORAGE_KEY,
            users
        );
    }

}


/* =========================================
   TOAST
========================================= */

function showToast(message, type = "success") {

    const container = $("toastContainer");

    if (!container) {
        return;
    }

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {

        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, 2400);
}


/* =========================================
   SAVE FRIEND DATA
========================================= */

function saveFriends() {

    saveJSON(
        FRIENDS_STORAGE_KEY,
        friends
    );

}

function saveRequests() {

    saveJSON(
        REQUESTS_STORAGE_KEY,
        friendRequests
    );

}


/* =========================================
   CHECK FRIEND
========================================= */

function isFriend(userId) {

    return friends.some(
        friend => friend.id === userId
    );

}


/* =========================================
   CHECK REQUEST
========================================= */

function requestExists(userId) {

    return friendRequests.some(
        request => request.id === userId
    );

}


/* =========================================
   SEARCH USERS
========================================= */

function searchUsers(query) {

    const currentUser =
        getCurrentProfile();

    const normalizedQuery =
        query
            .trim()
            .replace(/^@/, "")
            .toLowerCase();

    const resultsContainer =
        $("searchResults");

    if (!resultsContainer) {
        return;
    }

    resultsContainer.innerHTML = "";

    if (!normalizedQuery) {
        return;
    }

    const results = users.filter(user => {

        if (
            user.username === currentUser.username
        ) {
            return false;
        }

        return (
            user.username
                .toLowerCase()
                .includes(normalizedQuery)
            ||
            user.name
                .toLowerCase()
                .includes(normalizedQuery)
        );

    });

    if (results.length === 0) {

        resultsContainer.innerHTML = `
            <div class="friends-empty">
                <div class="empty-icon">🔎</div>

                <strong>
                    مش لاقيين المستخدم
                </strong>

                <p>
                    جرّب اسم مستخدم تاني.
                </p>
            </div>
        `;

        return;
    }

    results.forEach(user => {

        resultsContainer.appendChild(
            createSearchUserCard(user)
        );

    });

}


/* =========================================
   SEARCH USER CARD
========================================= */

function createSearchUserCard(user) {

    const card =
        document.createElement("div");

    card.className =
        "search-user-card";

    const firstLetter =
        user.name.trim().charAt(0) || "؟";

    let buttonText = "إضافة";

    let buttonDisabled = false;

    if (isFriend(user.id)) {
        buttonText = "أصدقاء ✓";
        buttonDisabled = true;
    }

    else if (requestExists(user.id)) {
        buttonText = "تم الإرسال";
        buttonDisabled = true;
    }

    card.innerHTML = `
        <div class="search-user-avatar">
            ${escapeHTML(firstLetter)}
        </div>

        <div class="search-user-info">
            <strong>
                ${escapeHTML(user.name)}
            </strong>

            <span>
                @${escapeHTML(user.username)}
            </span>
        </div>

        <button
            type="button"
            class="search-user-add"
            data-user-id="${escapeHTML(user.id)}"
            ${buttonDisabled ? "disabled" : ""}
        >
            ${buttonText}
        </button>
    `;

    const button =
        card.querySelector(
            ".search-user-add"
        );

    if (button && !buttonDisabled) {

        button.addEventListener(
            "click",
            () => sendFriendRequest(user.id)
        );

    }

    return card;
}


/* =========================================
   SEND FRIEND REQUEST
========================================= */

function sendFriendRequest(userId) {

    const user =
        users.find(
            item => item.id === userId
        );

    if (!user) {
        showToast(
            "المستخدم مش موجود",
            "warning"
        );
        return;
    }

    if (isFriend(userId)) {

        showToast(
            "المستخدم ده صديقك بالفعل",
            "warning"
        );

        return;
    }

    if (requestExists(userId)) {

        showToast(
            "طلب الصداقة اتبعت قبل كده",
            "warning"
        );

        return;
    }

    friendRequests.push({
        id: user.id,
        name: user.name,
        username: user.username,
        points: user.points,
        streak: user.streak,
        createdAt: Date.now()
    });

    saveRequests();

    updateAllUI();

    showToast(
        `تم إرسال طلب صداقة إلى ${user.name} ✓`
    );

}


/* =========================================
   RENDER REQUESTS
========================================= */

function renderRequests() {

    const container =
        $("friendRequestsList");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (friendRequests.length === 0) {

        container.innerHTML = `
            <div class="friends-empty">
                <div class="empty-icon">📨</div>

                <strong>
                    مفيش طلبات جديدة
                </strong>

                <p>
                    لما حد يبعتلك طلب صداقة هيظهر هنا.
                </p>
            </div>
        `;

        return;
    }

    friendRequests.forEach(request => {

        const card =
            document.createElement("div");

        card.className =
            "friend-request-card";

        const firstLetter =
            request.name
                .trim()
                .charAt(0) || "؟";

        card.innerHTML = `
            <div class="request-avatar">
                ${escapeHTML(firstLetter)}
            </div>

            <div class="request-info">
                <strong>
                    ${escapeHTML(request.name)}
                </strong>

                <span>
                    @${escapeHTML(request.username)}
                    • ${request.points} نقطة
                </span>
            </div>

            <div class="request-actions">

                <button
                    type="button"
                    class="accept-request"
                    data-request-id="${escapeHTML(request.id)}"
                >
                    قبول
                </button>

                <button
                    type="button"
                    class="reject-request"
                    data-request-id="${escapeHTML(request.id)}"
                >
                    رفض
                </button>

            </div>
        `;

        const acceptButton =
            card.querySelector(
                ".accept-request"
            );

        const rejectButton =
            card.querySelector(
                ".reject-request"
            );

        acceptButton.addEventListener(
            "click",
            () => acceptFriendRequest(request.id)
        );

        rejectButton.addEventListener(
            "click",
            () => rejectFriendRequest(request.id)
        );

        container.appendChild(card);

    });

}


/* =========================================
   ACCEPT REQUEST
========================================= */

function acceptFriendRequest(userId) {

    const request =
        friendRequests.find(
            item => item.id === userId
        );

    if (!request) {
        return;
    }

    if (!isFriend(userId)) {

        friends.push({
            id: request.id,
            name: request.name,
            username: request.username,
            points: request.points,
            streak: request.streak,
            online: false
        });

    }

    friendRequests =
        friendRequests.filter(
            item => item.id !== userId
        );

    saveFriends();
    saveRequests();

    updateAllUI();

    showToast(
        `بقيتوا أصحاب 🎉`
    );

}


/* =========================================
   REJECT REQUEST
========================================= */

function rejectFriendRequest(userId) {

    const request =
        friendRequests.find(
            item => item.id === userId
        );

    friendRequests =
        friendRequests.filter(
            item => item.id !== userId
        );

    saveRequests();

    updateAllUI();

    if (request) {

        showToast(
            `تم رفض طلب ${request.name}`,
            "warning"
        );

    }

}


/* =========================================
   RENDER FRIENDS
========================================= */

let currentFriendFilter = "all";

function renderFriends() {

    const container =
        $("friendsGrid");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    let filteredFriends =
        [...friends];

    if (currentFriendFilter === "online") {

        filteredFriends =
            filteredFriends.filter(
                friend => friend.online
            );

    }

    if (currentFriendFilter === "top") {

        filteredFriends.sort(
            (a, b) => b.points - a.points
        );

    }

    if (filteredFriends.length === 0) {

        let message =
            "لسه مفيش أصدقاء";

        let description =
            "أضف أول صديق ليك وابدأوا التحديات سوا.";

        if (currentFriendFilter === "online") {

            message =
                "مفيش أصدقاء متصلين";

            description =
                "لما حد من أصحابك يدخل هتلاقيه هنا.";

        }

        container.innerHTML = `
            <div class="friends-empty">

                <div class="empty-icon">
                    👥
                </div>

                <strong>
                    ${message}
                </strong>

                <p>
                    ${description}
                </p>

                <button
                    type="button"
                    id="emptyAddFriendDynamic"
                >
                    ＋ إضافة صديق
                </button>

            </div>
        `;

        const button =
            $("emptyAddFriendDynamic");

        if (button) {

            button.addEventListener(
                "click",
                openFriendModal
            );

        }

        return;
    }

    filteredFriends.forEach(friend => {

        container.appendChild(
            createFriendCard(friend)
        );

    });

}


/* =========================================
   FRIEND CARD
========================================= */

function createFriendCard(friend) {

    const card =
        document.createElement("div");

    card.className =
        "friend-card";

    const firstLetter =
        friend.name
            .trim()
            .charAt(0) || "؟";

    card.innerHTML = `
        <div class="friend-avatar">

            ${escapeHTML(firstLetter)}

            <span
                class="friend-online-dot ${
                    friend.online ? "online" : ""
                }"
            ></span>

        </div>

        <div class="friend-info">

            <strong>
                ${escapeHTML(friend.name)}
            </strong>

            <span class="friend-username">
                @${escapeHTML(friend.username)}
            </span>

            <div class="friend-meta">

                <span class="friend-points">
                    ⭐ ${friend.points} نقطة
                </span>

                <span>
                    🔥 ${friend.streak} يوم
                </span>

                <span>
                    ${
                        friend.online
                        ? "🟢 متصل"
                        : "⚫ غير متصل"
                    }
                </span>

            </div>

        </div>

        <div class="friend-actions">

            <button
                type="button"
                class="friend-action-btn primary"
                title="المحادثة"
                data-chat-id="${escapeHTML(friend.id)}"
            >
                💬
            </button>

            <button
                type="button"
                class="friend-action-btn"
                title="حذف الصديق"
                data-remove-id="${escapeHTML(friend.id)}"
            >
                🗑
            </button>

        </div>
    `;

    const chatButton =
        card.querySelector(
            "[data-chat-id]"
        );

    const removeButton =
        card.querySelector(
            "[data-remove-id]"
        );

    if (chatButton) {

        chatButton.addEventListener(
            "click",
            () => {

                showToast(
                    "نظام المحادثات هنربطه بعد ما نعمل Chat 👥💬"
                );

            }
        );

    }

    if (removeButton) {

        removeButton.addEventListener(
            "click",
            () => removeFriend(friend.id)
        );

    }

    return card;
}


/* =========================================
   REMOVE FRIEND
========================================= */

function removeFriend(userId) {

    const friend =
        friends.find(
            item => item.id === userId
        );

    if (!friend) {
        return;
    }

    const confirmed =
        window.confirm(
            `هل أنت متأكد إنك عايز تحذف ${friend.name} من الأصدقاء؟`
        );

    if (!confirmed) {
        return;
    }

    friends =
        friends.filter(
            item => item.id !== userId
        );

    saveFriends();

    updateAllUI();

    showToast(
        "تم حذف الصديق"
    );

}


/* =========================================
   MODAL
========================================= */

function openFriendModal() {

    const modal =
        $("friendModal");

    if (!modal) {
        return;
    }

    modal.classList.add("active");

    document.body.style.overflow =
        "hidden";

    const input =
        $("friendUsernameInput");

    if (input) {

        input.value = "";

        setTimeout(
            () => input.focus(),
            100
        );

    }

    const result =
        $("modalSearchResult");

    if (result) {
        result.innerHTML = "";
    }

}


/* =========================================
   CLOSE MODAL
========================================= */

function closeFriendModal() {

    const modal =
        $("friendModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("active");

    document.body.style.overflow =
        "";

}

/* =========================================
   MODAL SEARCH
========================================= */

function searchModalUser() {

    const input = $("friendUsernameInput");
    const result = $("modalSearchResult");

    if (!input || !result) {
        return;
    }

    const query = input.value
        .trim()
        .replace(/^@/, "")
        .toLowerCase();

    result.innerHTML = "";
    delete result.dataset.userId;

    if (!query) {
        return;
    }

    const currentUser = getCurrentProfile();

    const user = users.find(item => {

        return (
            item.username.toLowerCase() === query &&
            item.username !== currentUser.username
        );

    });

    if (!user) {

        result.innerHTML = `
            <div class="friends-empty">

                <div class="empty-icon">
                    🔎
                </div>

                <strong>
                    المستخدم مش موجود
                </strong>

                <p>
                    اتأكد من اسم المستخدم وجرب تاني.
                </p>

            </div>
        `;

        return;
    }

    const alreadyFriend = isFriend(user.id);
    const alreadyRequested = requestExists(user.id);

    let actionText = "إرسال الطلب";

    if (alreadyFriend) {
        actionText = "أصدقاء ✓";
    } else if (alreadyRequested) {
        actionText = "تم إرسال الطلب";
    }

    result.innerHTML = `
        <div class="modal-user-result">

            <div class="modal-user-avatar">
                ${escapeHTML(
                    user.name.trim().charAt(0) || "؟"
                )}
            </div>

            <div class="modal-user-info">

                <strong>
                    ${escapeHTML(user.name)}
                </strong>

                <span>
                    @${escapeHTML(user.username)}
                    • ⭐ ${Number(user.points) || 0}
                </span>

            </div>

            <span class="modal-user-status">
                ${actionText}
            </span>

        </div>
    `;

    result.dataset.userId = user.id;
}


/* =========================================
   SEND MODAL REQUEST
========================================= */

function sendModalFriendRequest() {

    const result = $("modalSearchResult");

    if (!result) {
        return;
    }

    const userId = result.dataset.userId;

    if (!userId) {

        showToast(
            "ابحث عن مستخدم الأول",
            "warning"
        );

        return;
    }

    const user = users.find(
        item => item.id === userId
    );

    if (!user) {
        showToast(
            "المستخدم مش موجود",
            "warning"
        );
        return;
    }

    if (isFriend(userId)) {

        showToast(
            "المستخدم ده صديقك بالفعل",
            "warning"
        );

        return;
    }

    if (requestExists(userId)) {

        showToast(
            "طلب الصداقة اتبعت قبل كده",
            "warning"
        );

        return;
    }

    friendRequests.push({

        id: user.id,
        name: user.name,
        username: user.username,
        points: Number(user.points) || 0,
        streak: Number(user.streak) || 0,
        createdAt: Date.now()

    });

    saveRequests();

    closeFriendModal();

    updateAllUI();

    showToast(
        `تم إرسال طلب الصداقة إلى ${user.name} ✓`
    );
}


/* =========================================
   FILTERS
========================================= */

let currentFriendFilter = "all";

function setupFilters() {

    const buttons = document.querySelectorAll(
        ".friend-filter"
    );

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                buttons.forEach(item => {
                    item.classList.remove("active");
                });

                button.classList.add("active");

                currentFriendFilter =
                    button.dataset.friendFilter || "all";

                renderFriends();

            }
        );

    });

}


/* =========================================
   SEARCH
========================================= */

function setupSearch() {

    const input = $("friendSearchInput");
    const clearButton = $("clearFriendSearch");

    if (input) {

        input.addEventListener(
            "input",
            () => {
                searchUsers(input.value);
            }
        );

    }

    if (clearButton) {

        clearButton.addEventListener(
            "click",
            () => {

                if (input) {

                    input.value = "";
                    input.focus();

                }

                const results =
                    $("searchResults");

                if (results) {
                    results.innerHTML = "";
                }

            }
        );

    }

}


/* =========================================
   MODAL EVENTS
========================================= */

function setupModal() {

    const openButton =
        $("openAddFriendBtn");

    const emptyButton =
        $("emptyAddFriend");

    const closeButton =
        $("closeFriendModal");

    const cancelButton =
        $("cancelFriendModal");

    const overlay =
        $("friendModalOverlay");

    const input =
        $("friendUsernameInput");

    const sendButton =
        $("sendFriendRequest");


    /* فتح المودال */

    if (openButton) {

        openButton.addEventListener(
            "click",
            openFriendModal
        );

    }


    if (emptyButton) {

        emptyButton.addEventListener(
            "click",
            openFriendModal
        );

    }


    /* إغلاق المودال */

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeFriendModal
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeFriendModal
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeFriendModal
        );

    }


    /* البحث */

    if (input) {

        input.addEventListener(
            "input",
            searchModalUser
        );


        input.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    sendModalFriendRequest();

                }

            }
        );

    }


    /* إرسال الطلب */

    if (sendButton) {

        sendButton.addEventListener(
            "click",
            sendModalFriendRequest
        );

    }


    /* زر ESC */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {
                closeFriendModal();
            }

        }
    );

}


/* =========================================
   UPDATE STATS
========================================= */

function updateStats() {

    const friendsCount =
        $("friendsCount");

    const requestsCount =
        $("requestsCount");

    const onlineCount =
        $("onlineCount");

    const topPoints =
        $("topPoints");


    if (friendsCount) {

        friendsCount.textContent =
            friends.length;

    }


    if (requestsCount) {

        requestsCount.textContent =
            friendRequests.length;

    }


    if (onlineCount) {

        onlineCount.textContent =
            friends.filter(
                friend => friend.online
            ).length;

    }


    if (topPoints) {

        const highest =
            friends.length > 0
                ? Math.max(
                    ...friends.map(
                        friend =>
                            Number(friend.points) || 0
                    )
                )
                : 0;

        topPoints.textContent =
            highest;

    }


    const badge =
        $("requestsBadge");

    if (badge) {

        badge.textContent =
            friendRequests.length;

    }

}


/* =========================================
   SIDEBAR PROFILE
========================================= */

function updateSidebar() {

    const profile =
        getCurrentProfile();

    const state =
        getMainState();


    const nameElement =
        $("sidebarUserName");

    const streakElement =
        $("sidebarStreak");


    if (nameElement) {

        nameElement.textContent =
            profile.name;

    }


    if (streakElement) {

        const streak =
            Number(state.streak) || 0;

        streakElement.textContent =
            streak;

    }

}


/* =========================================
   UPDATE EVERYTHING
========================================= */

function updateAllUI() {

    updateStats();

    renderRequests();

    renderFriends();

    updateSidebar();

    renderActivity();

}


/* =========================================
   ACTIVITY
========================================= */

function renderActivity() {

    const container =
        $("friendsActivity");

    if (!container) {
        return;
    }


    if (friends.length === 0) {

        container.innerHTML = `
            <div class="activity-empty">

                <span>⚡</span>

                <div>
                    <strong>
                        النشاط هيظهر هنا
                    </strong>

                    <p>
                        لما أصحابك يسجلوا نشاطات جديدة هتشوفها هنا.
                    </p>
                </div>

            </div>
        `;

        return;
    }


    const activityFriend =
        friends
            .slice()
            .sort(
                (a, b) =>
                    (Number(b.points) || 0) -
                    (Number(a.points) || 0)
            )[0];


    if (!activityFriend) {
        return;
    }


    const firstLetter =
        activityFriend.name
            .trim()
            .charAt(0) || "؟";


    container.innerHTML = `
        <div class="activity-item">

            <div class="activity-avatar">
                ${escapeHTML(firstLetter)}
            </div>

            <div class="activity-text">

                <strong>
                    ${escapeHTML(
                        activityFriend.name
                    )}
                </strong>

                <p>
                    عنده
                    ${Number(activityFriend.points) || 0}
                    نقطة و 🔥
                    ${Number(activityFriend.streak) || 0}
                    يوم متتالي
                </p>

            </div>

            <span class="activity-time">
                الآن
            </span>

        </div>
    `;

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================
   INITIALIZE
========================================= */

function initializeFriends() {

    initializeUsers();

    setupSearch();

    setupFilters();

    setupModal();

    updateAllUI();

}


/* =========================================
   START
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeFriends
);