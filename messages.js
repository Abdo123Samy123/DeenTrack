"use strict";

/* =========================================
   DEENTRACK — MESSAGES SYSTEM
   PART 1
   LocalStorage Chat
========================================= */


/* =========================================
   STORAGE KEYS
========================================= */

const MESSAGES_STORAGE_KEY =
    "deenTrackMessages";

const CHAT_STORAGE_KEY =
    "deenTrackChats";

const FRIENDS_STORAGE_KEY =
    "deenTrackFriends";

const PROFILE_STORAGE_KEY =
    "deenTrackProfile";


/* =========================================
   HELPERS
========================================= */

function $(id) {
    return document.getElementById(id);
}


/* =========================================
   LOAD JSON
========================================= */

function loadJSON(key, fallback) {

    const saved =
        localStorage.getItem(key);

    if (!saved) {
        return fallback;
    }

    try {

        return JSON.parse(saved);

    } catch (error) {

        console.error(
            "Error loading:",
            key,
            error
        );

        return fallback;
    }
}


/* =========================================
   SAVE JSON
========================================= */

function saveJSON(key, value) {

    localStorage.setItem(
        key,
        JSON.stringify(value)
    );

}


/* =========================================
   CURRENT PROFILE
========================================= */

function getCurrentProfile() {

    const profile =
        loadJSON(
            PROFILE_STORAGE_KEY,
            {
                name: "abdo",
                username: "abdo"
            }
        );

    return {

        name:
            profile.name ||
            "abdo",

        username:
            String(
                profile.username ||
                "abdo"
            )
            .replace(/^@/, "")
            .toLowerCase()

    };

}


/* =========================================
   FRIENDS
========================================= */

let messageFriends =
    loadJSON(
        FRIENDS_STORAGE_KEY,
        []
    );


/* =========================================
   CHATS
========================================= */

let chats =
    loadJSON(
        CHAT_STORAGE_KEY,
        []
    );


/* =========================================
   MESSAGES
========================================= */

let messages =
    loadJSON(
        MESSAGES_STORAGE_KEY,
        {}
    );


/* =========================================
   ACTIVE CHAT
========================================= */

let activeChatId = null;


/* =========================================
   CURRENT FILTER
========================================= */

let currentChatFilter = "all";


/* =========================================
   NORMALIZE FRIEND
========================================= */

function normalizeFriend(friend) {

    return {

        id:
            String(
                friend.id || ""
            ),

        name:
            friend.name ||
            "مستخدم",

        username:
            friend.username ||
            "user",

        points:
            Number(
                friend.points
            ) || 0,

        streak:
            Number(
                friend.streak
            ) || 0,

        online:
            Boolean(
                friend.online
            )

    };

}


/* =========================================
   LOAD FRIENDS
========================================= */

function loadFriends() {

    const saved =
        loadJSON(
            FRIENDS_STORAGE_KEY,
            []
        );

    if (!Array.isArray(saved)) {

        messageFriends = [];

        return;
    }

    messageFriends =
        saved.map(
            normalizeFriend
        );

}


/* =========================================
   CHAT ID
========================================= */

function createChatId(userId) {

    const profile =
        getCurrentProfile();

    const currentUsername =
        profile.username;

    const first =
        currentUsername <
        String(userId)
            ? currentUsername
            : String(userId);

    const second =
        currentUsername <
        String(userId)
            ? String(userId)
            : currentUsername;

    return (
        "chat_" +
        first +
        "_" +
        second
    );

}


/* =========================================
   GET FRIEND
========================================= */

function getFriendById(userId) {

    return messageFriends.find(
        friend =>
            String(friend.id) ===
            String(userId)
    );

}


/* =========================================
   GET CHAT
========================================= */

function getChatById(chatId) {

    return chats.find(
        chat =>
            chat.id === chatId
    );

}


/* =========================================
   CREATE CHAT
========================================= */

function createChat(friend) {

    if (!friend) {
        return null;
    }

    const chatId =
        createChatId(
            friend.id
        );

    let chat =
        getChatById(chatId);

    if (chat) {
        return chat;
    }

    chat = {

        id: chatId,

        userId:
            String(friend.id),

        name:
            friend.name,

        username:
            friend.username,

        avatar:
            friend.name
                .trim()
                .charAt(0) || "؟",

        online:
            Boolean(friend.online),

        unread: 0,

        lastMessage: "",

        lastMessageTime: 0,

        createdAt:
            Date.now()

    };

    chats.push(chat);

    saveJSON(
        CHAT_STORAGE_KEY,
        chats
    );

    return chat;

}


/* =========================================
   GET OR CREATE CHAT
========================================= */

function getOrCreateChat(friendId) {

    const friend =
        getFriendById(
            friendId
        );

    if (!friend) {
        return null;
    }

    return createChat(
        friend
    );

}


/* =========================================
   GET CHAT MESSAGES
========================================= */

function getChatMessages(chatId) {

    if (
        !messages ||
        typeof messages !== "object"
    ) {

        messages = {};

    }

    if (
        !Array.isArray(
            messages[chatId]
        )
    ) {

        messages[chatId] = [];

    }

    return messages[chatId];

}


/* =========================================
   SAVE MESSAGES
========================================= */

function saveMessages() {

    saveJSON(
        MESSAGES_STORAGE_KEY,
        messages
    );

}


/* =========================================
   SAVE CHATS
========================================= */

function saveChats() {

    saveJSON(
        CHAT_STORAGE_KEY,
        chats
    );

}


/* =========================================
   FORMAT TIME
========================================= */

function formatMessageTime(timestamp) {

    const date =
        new Date(
            timestamp
        );

    return date.toLocaleTimeString(
        "ar-EG",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================
   FORMAT DATE
========================================= */

function formatMessageDate(timestamp) {

    const date =
        new Date(
            timestamp
        );

    return date.toLocaleDateString(
        "ar-EG",
        {
            day: "numeric",
            month: "long"
        }
    );

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================
   UPDATE CONVERSATION COUNT
========================================= */

function updateConversationCount() {

    const element =
        $("conversationCount");

    if (!element) {
        return;
    }

    const count =
        chats.length;

    element.textContent =
        `${count} محادثة`;

}


/* =========================================
   GET LAST MESSAGE
========================================= */

function getLastMessage(chatId) {

    const chatMessages =
        getChatMessages(
            chatId
        );

    if (
        chatMessages.length === 0
    ) {

        return "";

    }

    const last =
        chatMessages[
            chatMessages.length - 1
        ];

    return last.text || "";

}


/* =========================================
   UPDATE CHAT LAST MESSAGE
========================================= */

function updateChatLastMessage(
    chatId,
    text,
    timestamp
) {

    const chat =
        getChatById(
            chatId
        );

    if (!chat) {
        return;
    }

    chat.lastMessage =
        text || "";

    chat.lastMessageTime =
        timestamp || Date.now();

    saveChats();

}


/* =========================================
   SORT CHATS
========================================= */

function sortChats() {

    chats.sort(
        (a, b) => {

            return (
                Number(
                    b.lastMessageTime
                ) || 0
            ) -
            (
                Number(
                    a.lastMessageTime
                ) || 0
            );

        }
    );

}


/* =========================================
   CREATE MESSAGE
========================================= */

function createMessage(
    chatId,
    text,
    sender
) {

    return {

        id:
            "msg_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .slice(2, 8),

        chatId:
            chatId,

        text:
            text,

        sender:
            sender,

        createdAt:
            Date.now(),

        read:
            sender === "me"

    };

}


/* =========================================
   SEND MESSAGE
========================================= */

function sendMessage(text) {

    if (!activeChatId) {

        showMessageToast(
            "اختار محادثة الأول",
            "warning"
        );

        return;

    }

    const cleanText =
        String(text || "")
            .trim();

    if (!cleanText) {
        return;
    }

    const chatMessages =
        getChatMessages(
            activeChatId
        );

    const message =
        createMessage(
            activeChatId,
            cleanText,
            "me"
        );

    chatMessages.push(
        message
    );

    updateChatLastMessage(
        activeChatId,
        cleanText,
        message.createdAt
    );

    saveMessages();

    sortChats();

    renderConversations();

    renderActiveChat();

}


/* =========================================
   SHOW TOAST
========================================= */

function showMessageToast(
    message,
    type = "success"
) {

    const toast =
        $("chatToast");

    if (!toast) {
        return;
    }

    toast.textContent =
        message;

    toast.className =
        `chat-toast show ${type}`;

    clearTimeout(
        showMessageToast.timer
    );

    showMessageToast.timer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );

}


/* =========================================
   OPEN CHAT
========================================= */

function openChat(friendId) {

    const chat =
        getOrCreateChat(
            friendId
        );

    if (!chat) {

        showMessageToast(
            "الصديق مش موجود",
            "warning"
        );

        return;

    }

    activeChatId =
        chat.id;

    chat.unread = 0;

    saveChats();

    renderConversations();

    renderActiveChat();

}


/* =========================================
   CLOSE ACTIVE CHAT
========================================= */

function closeActiveChat() {

    activeChatId = null;

    const activeChat =
        $("activeChat");

    const welcome =
        $("chatWelcome");

    if (activeChat) {
        activeChat.hidden = true;
    }

    if (welcome) {
        welcome.hidden = false;
    }

}


/* =========================================
   INITIAL LOAD
========================================= */

function initializeMessages() {

    loadFriends();

    sortChats();

    updateConversationCount();

    renderConversations();

    setupMessageEvents();
    setupNewChatEvents();

}


/* =========================================
   START
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeMessages
);
/* =========================================
   RENDER CONVERSATIONS
========================================= */

function renderConversations() {

    const container =
        $("conversationList");

    const empty =
        $("conversationEmpty");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    let filteredChats =
        [...chats];


    /* =========================
       SEARCH
    ========================= */

    const searchInput =
        $("conversationSearch");

    const searchValue =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    if (searchValue) {

        filteredChats =
            filteredChats.filter(
                chat => {

                    const name =
                        String(
                            chat.name || ""
                        ).toLowerCase();

                    const username =
                        String(
                            chat.username || ""
                        ).toLowerCase();

                    return (
                        name.includes(
                            searchValue
                        ) ||
                        username.includes(
                            searchValue
                        )
                    );

                }
            );

    }


    /* =========================
       FILTER
    ========================= */

    if (
        currentChatFilter ===
        "unread"
    ) {

        filteredChats =
            filteredChats.filter(
                chat =>
                    Number(
                        chat.unread
                    ) > 0
            );

    }


    if (
        currentChatFilter ===
        "online"
    ) {

        filteredChats =
            filteredChats.filter(
                chat =>
                    chat.online === true
            );

    }


    /* =========================
       EMPTY
    ========================= */

    if (
        filteredChats.length === 0
    ) {

        if (empty) {

            empty.style.display =
                "flex";

        }

        return;

    }


    if (empty) {

        empty.style.display =
            "none";

    }


    /* =========================
       CREATE CARDS
    ========================= */

    filteredChats.forEach(
        chat => {

            const card =
                createConversationCard(
                    chat
                );

            container.appendChild(
                card
            );

        }
    );


    updateConversationCount();

}


/* =========================================
   CONVERSATION CARD
========================================= */

function createConversationCard(
    chat
) {

    const card =
        document.createElement(
            "button"
        );

    card.type =
        "button";

    card.className =
        "conversation-item";


    if (
        chat.id ===
        activeChatId
    ) {

        card.classList.add(
            "active"
        );

    }


    const lastMessage =
        chat.lastMessage ||
        "ابدأ المحادثة...";


    const unread =
        Number(
            chat.unread
        ) || 0;


    card.innerHTML = `

        <div class="conversation-avatar">

            ${escapeHTML(
                chat.avatar || "؟"
            )}

            <span
                class="
                    conversation-online
                    ${chat.online
                        ? "online"
                        : ""}
                "
            ></span>

        </div>


        <div class="conversation-info">

            <div
                class="conversation-name-row"
            >

                <strong>
                    ${escapeHTML(
                        chat.name
                    )}
                </strong>

                <small>
                    ${
                        chat.lastMessageTime
                        ? formatMessageTime(
                            chat.lastMessageTime
                        )
                        : ""
                    }
                </small>

            </div>


            <div
                class="conversation-message-row"
            >

                <span>
                    ${escapeHTML(
                        lastMessage
                    )}
                </span>


                ${
                    unread > 0
                    ? `
                        <b class="unread-count">
                            ${unread}
                        </b>
                    `
                    : ""
                }

            </div>

        </div>

    `;


    card.addEventListener(
        "click",
        () => {

            openChat(
                chat.userId
            );

        }
    );


    return card;

}


/* =========================================
   RENDER ACTIVE CHAT
========================================= */
function renderActiveChat() {

    const welcome =
        $("chatWelcome");

    const activeChat =
        $("activeChat");


    if (!activeChat) {
        return;
    }


    /* =========================
       NO CHAT
    ========================= */

    if (!activeChatId) {

        activeChat.hidden =
            true;

        if (welcome) {

            welcome.hidden =
                false;

        }

        return;

    }


    const chat =
        getChatById(
            activeChatId
        );


    if (!chat) {

        activeChat.hidden =
            true;

        if (welcome) {

            welcome.hidden =
                false;

        }

        return;

    }


    /* =========================
       SHOW CHAT
    ========================= */

    activeChat.hidden =
        false;

    if (welcome) {

        welcome.hidden =
            true;

    }


    /* =========================
       HEADER
    ========================= */

    const avatar =
        $("chatAvatar");

    const name =
        $("chatPersonName");

    const status =
        $("chatPersonStatus");


    if (avatar) {

        avatar.textContent =
            chat.avatar || "؟";

    }


    if (name) {

        name.textContent =
            chat.name;

    }


    if (status) {

        status.textContent =
            chat.online
            ? "متصل الآن"
            : "غير متصل";

        status.className =
            chat.online
            ? "online-status"
            : "offline-status";

    }


    renderMessages();

}

/* =========================================
   RENDER MESSAGES
========================================= */

function renderMessages() {

    const container =
        $("messagesContainer");

    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!activeChatId) {
        return;
    }


    const chatMessages =
        getChatMessages(
            activeChatId
        );


    /* =========================
       EMPTY CHAT
    ========================= */

    if (
        chatMessages.length === 0
    ) {

        container.innerHTML = `

            <div
                class="messages-empty"
            >

                <div>
                    💬
                </div>

                <strong>
                    ابدأ الكلام 👋
                </strong>

                <p>
                    ابعت أول رسالة لصديقك.
                </p>

            </div>

        `;

        return;

    }


    /* =========================
       DATE TRACKING
    ========================= */

    let lastDate = "";


    chatMessages.forEach(
        message => {


            const messageDate =
                formatMessageDate(
                    message.createdAt
                );


            if (
                messageDate !==
                lastDate
            ) {

                const dateDivider =
                    document.createElement(
                        "div"
                    );

                dateDivider.className =
                    "message-date-divider";

                dateDivider.innerHTML = `
                    <span>
                        ${escapeHTML(
                            messageDate
                        )}
                    </span>
                `;

                container.appendChild(
                    dateDivider
                );


                lastDate =
                    messageDate;

            }


            const messageElement =
                createMessageElement(
                    message
                );


            container.appendChild(
                messageElement
            );

        }
    );


    /* =========================
       SCROLL
    ========================= */

    setTimeout(
        () => {

            container.scrollTop =
                container.scrollHeight;

        },
        0
    );

}


/* =========================================
   CREATE MESSAGE ELEMENT
========================================= */

function createMessageElement(
    message
) {

    const wrapper =
        document.createElement(
            "div"
        );


    const isMine =
        message.sender ===
        "me";


    wrapper.className =
        isMine
        ? "message-row mine"
        : "message-row other";


    wrapper.innerHTML = `

        <div class="message-bubble">

            <div class="message-text">
                ${escapeHTML(
                    message.text
                )}
            </div>


            <div class="message-meta">

                <span>
                    ${formatMessageTime(
                        message.createdAt
                    )}
                </span>

                ${
                    isMine
                    ? `
                        <span
                            class="
                                message-read
                                ${
                                    message.read
                                    ? "read"
                                    : ""
                                }
                            "
                        >
                            ✓✓
                        </span>
                    `
                    : ""
                }

            </div>

        </div>

    `;


    return wrapper;

}


/* =========================================
   SEND FORM
========================================= */

function setupMessageForm() {

    const form =
        $("messageForm");

    const input =
        $("messageInput");


    if (!form || !input) {
        return;
    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const text =
                input.value.trim();


            if (!text) {
                return;
            }


            sendMessage(
                text
            );


            input.value = "";

            input.focus();

        }
    );

}


/* =========================================
   ENTER TO SEND
========================================= */

function setupInputEvents() {

    const input =
        $("messageInput");

    if (!input) {
        return;
    }


    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                const form =
                    $("messageForm");

                if (form) {

                    form.requestSubmit();

                }

            }

        }
    );

}


/* =========================================
   CONVERSATION SEARCH
========================================= */

function setupConversationSearch() {

    const input =
        $("conversationSearch");

    if (!input) {
        return;
    }


    input.addEventListener(
        "input",
        () => {

            renderConversations();

        }
    );

}


/* =========================================
   CHAT FILTERS
========================================= */

function setupChatFilters() {

    const buttons =
        document.querySelectorAll(
            ".conversation-filter"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    buttons.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    currentChatFilter =
                        button.dataset.filter ||
                        "all";


                    renderConversations();

                }
            );

        }
    );

}


/* =========================================
   CLOSE CHAT BUTTON
========================================= */

function setupCloseChat() {

    const button =
        $("closeChatBtn");

    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            closeActiveChat();

            renderConversations();

        }
    );

}


/* =========================================
   MESSAGE EVENTS
========================================= */

function setupMessageEvents() {

    setupMessageForm();

    setupInputEvents();

    setupConversationSearch();

    setupChatFilters();

    setupCloseChat();

}
/* =========================================
   NEW CHAT MODAL
========================================= */

function openNewChatModal() {

    const modal =
        $("newChatModal");

    if (!modal) {
        return;
    }

    modal.hidden = false;

    document.body.style.overflow =
        "hidden";

    renderModalFriends();

}


/* =========================================
   CLOSE NEW CHAT MODAL
========================================= */

function closeNewChatModal() {

    const modal =
        $("newChatModal");

    if (!modal) {
        return;
    }

    modal.hidden = true;

    document.body.style.overflow =
        "";

}


/* =========================================
   RENDER MODAL FRIENDS
========================================= */

function renderModalFriends() {

    const container =
        $("modalFriendsList");

    if (!container) {
        return;
    }

    container.innerHTML = "";


    if (
        messageFriends.length === 0
    ) {

        container.innerHTML = `

            <div class="friends-empty">

                <div class="empty-icon">
                    👥
                </div>

                <strong>
                    مفيش أصدقاء
                </strong>

                <p>
                    لازم تضيف أصدقاء الأول
                    عشان تبدأ محادثة.
                </p>

            </div>

        `;

        return;

    }


    messageFriends.forEach(
        friend => {

            const item =
                document.createElement(
                    "button"
                );

            item.type =
                "button";

            item.className =
                "modal-friend-item";


            const firstLetter =
                friend.name
                    .trim()
                    .charAt(0) || "؟";


            item.innerHTML = `

                <div class="modal-friend-avatar">

                    ${escapeHTML(
                        firstLetter
                    )}

                    <span
                        class="
                            modal-online-dot
                            ${
                                friend.online
                                ? "online"
                                : ""
                            }
                        "
                    ></span>

                </div>


                <div class="modal-friend-info">

                    <strong>
                        ${escapeHTML(
                            friend.name
                        )}
                    </strong>

                    <span>
                        @${escapeHTML(
                            friend.username
                        )}
                    </span>

                </div>


                <span class="modal-friend-arrow">
                    ←
                </span>

            `;


            item.addEventListener(
                "click",
                () => {

                    const chat =
                        getOrCreateChat(
                            friend.id
                        );


                    if (!chat) {
                        return;
                    }


                    closeNewChatModal();


                    openChat(
                        friend.id
                    );

                }
            );


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================
   FRIEND SEARCH INSIDE MODAL
========================================= */

function setupFriendModalSearch() {

    const input =
        $("friendSearchInput");

    if (!input) {
        return;
    }


    input.addEventListener(
        "input",
        () => {

            const query =
                input.value
                    .trim()
                    .toLowerCase();


            const container =
                $("modalFriendsList");


            if (!container) {
                return;
            }


            const filtered =
                messageFriends.filter(
                    friend => {

                        const name =
                            String(
                                friend.name ||
                                ""
                            ).toLowerCase();


                        const username =
                            String(
                                friend.username ||
                                ""
                            ).toLowerCase();


                        return (
                            name.includes(
                                query
                            ) ||
                            username.includes(
                                query
                            )
                        );

                    }
                );


            container.innerHTML = "";


            if (
                filtered.length === 0
            ) {

                container.innerHTML = `

                    <div class="friends-empty">

                        <div class="empty-icon">
                            🔎
                        </div>

                        <strong>
                            مفيش نتائج
                        </strong>

                        <p>
                            جرب اسم صديق تاني.
                        </p>

                    </div>

                `;

                return;

            }


            filtered.forEach(
                friend => {

                    const item =
                        createModalFriendItem(
                            friend
                        );

                    container.appendChild(
                        item
                    );

                }
            );

        }
    );

}


/* =========================================
   CREATE MODAL FRIEND ITEM
========================================= */

function createModalFriendItem(
    friend
) {

    const item =
        document.createElement(
            "button"
        );

    item.type =
        "button";

    item.className =
        "modal-friend-item";


    const firstLetter =
        friend.name
            .trim()
            .charAt(0) || "؟";


    item.innerHTML = `

        <div class="modal-friend-avatar">

            ${escapeHTML(
                firstLetter
            )}

            <span
                class="
                    modal-online-dot
                    ${
                        friend.online
                        ? "online"
                        : ""
                    }
                "
            ></span>

        </div>


        <div class="modal-friend-info">

            <strong>
                ${escapeHTML(
                    friend.name
                )}
            </strong>

            <span>
                @${escapeHTML(
                    friend.username
                )}
            </span>

        </div>


        <span class="modal-friend-arrow">
            ←
        </span>

    `;


    item.addEventListener(
        "click",
        () => {

            closeNewChatModal();

            openChat(
                friend.id
            );

        }
    );


    return item;

}


/* =========================================
   NEW CHAT EVENTS
========================================= */

function setupNewChatEvents() {

    const newChatButton =
        $("newChatBtn");

    const welcomeButton =
        $("welcomeNewChatBtn");

    const closeButton =
        $("closeNewChat");

    const cancelButton =
        $("cancelNewChat");


    if (newChatButton) {

        newChatButton.addEventListener(
            "click",
            openNewChatModal
        );

    }


    if (welcomeButton) {

        welcomeButton.addEventListener(
            "click",
            openNewChatModal
        );

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeNewChatModal
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeNewChatModal
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeNewChatModal();

            }

        }
    );


    setupFriendModalSearch();

}


/* =========================================
   EMOJI SYSTEM
========================================= */

function setupEmojiSystem() {

    const emojiButton =
        $("emojiBtn");

    const emojiPanel =
        $("emojiPanel");

    const input =
        $("messageInput");


    if (
        !emojiButton ||
        !emojiPanel ||
        !input
    ) {

        return;

    }


    emojiButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            emojiPanel.hidden =
                !emojiPanel.hidden;

        }
    );


    const emojiButtons =
        emojiPanel.querySelectorAll(
            "button"
        );


    emojiButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const emoji =
                        button.textContent;

                    const start =
                        input.selectionStart;

                    const end =
                        input.selectionEnd;


                    const value =
                        input.value;


                    input.value =
                        value.slice(
                            0,
                            start
                        ) +
                        emoji +
                        value.slice(
                            end
                        );


                    input.focus();


                    const cursor =
                        start +
                        emoji.length;


                    input.setSelectionRange(
                        cursor,
                        cursor
                    );


                    emojiPanel.hidden =
                        true;

                }
            );

        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                !emojiPanel.contains(
                    event.target
                ) &&
                event.target !==
                    emojiButton
            ) {

                emojiPanel.hidden =
                    true;

            }

        }
    );

}


/* =========================================
   CHAT MENU
========================================= */

function setupChatMenu() {

    const menuButton =
        $("chatMenuBtn");

    const menu =
        $("chatMenu");


    if (
        !menuButton ||
        !menu
    ) {

        return;

    }


    menuButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            menu.hidden =
                !menu.hidden;

        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                !menu.contains(
                    event.target
                ) &&
                event.target !==
                    menuButton
            ) {

                menu.hidden =
                    true;

            }

        }
    );

}


/* =========================================
   SEARCH INSIDE CHAT
========================================= */

function setupChatSearch() {

    const button =
        $("chatSearchBtn");

    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            if (!activeChatId) {

                showMessageToast(
                    "مفيش محادثة مفتوحة",
                    "warning"
                );

                return;

            }


            const query =
                window.prompt(
                    "اكتب كلمة للبحث داخل المحادثة:"
                );


            if (!query) {
                return;
            }


            const cleanQuery =
                query
                    .trim()
                    .toLowerCase();


            const chatMessages =
                getChatMessages(
                    activeChatId
                );


            const found =
                chatMessages.filter(
                    message =>
                        message.text
                            .toLowerCase()
                            .includes(
                                cleanQuery
                            )
                );


            if (
                found.length === 0
            ) {

                showMessageToast(
                    "مش لاقي الرسالة",
                    "warning"
                );

                return;

            }


            showMessageToast(
                `لقيت ${found.length} رسالة`
            );

        }
    );

}


/* =========================================
   CLEAR CHAT
========================================= */

function clearActiveChat() {

    if (!activeChatId) {

        showMessageToast(
            "اختار محادثة الأول",
            "warning"
        );

        return;

    }


    const confirmed =
        window.confirm(
            "هل أنت متأكد إنك عايز تمسح المحادثة؟"
        );


    if (!confirmed) {
        return;
    }


    messages[activeChatId] =
        [];


    const chat =
        getChatById(
            activeChatId
        );


    if (chat) {

        chat.lastMessage =
            "";

        chat.lastMessageTime =
            0;

        chat.unread =
            0;

    }


    saveMessages();

    saveChats();

    renderMessages();

    renderConversations();


    showMessageToast(
        "تم مسح المحادثة ✓"
    );

}


/* =========================================
   CLEAR CHAT EVENT
========================================= */

function setupClearChat() {

    const button =
        $("clearChatBtn");

    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            clearActiveChat();

            const menu =
                $("chatMenu");

            if (menu) {
                menu.hidden =
                    true;
            }

        }
    );

}


/* =========================================
   CLOSE ACTIVE CHAT
========================================= */



/* =========================================
   CLOSE CHAT EVENT
========================================= */

function setupCloseChat() {

    const button =
        $("closeChatBtn");

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        () => {

            closeActiveChat();

            showMessageToast(
                "تم إغلاق المحادثة"
            );

        }
    );

}


/* =========================================
   MOBILE CHAT BACK
========================================= */

function setupMobileChatBack() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".mobile-chat-back"
                );

            if (!button) {
                return;
            }

            closeActiveChat();

        }
    );

}


/* =========================================
   MESSAGE INPUT
========================================= */

function setupMessageInput() {

    const form =
        $("messageForm");

    const input =
        $("messageInput");

    if (!form || !input) {
        return;
    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            if (!activeChatId) {

                showMessageToast(
                    "اختار محادثة الأول",
                    "warning"
                );

                return;
            }


            const text =
                input.value.trim();


            if (!text) {
                return;
            }


            sendMessage(
                activeChatId,
                text
            );


            input.value = "";

            input.focus();

        }
    );


    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                form.requestSubmit();

            }

        }
    );

}