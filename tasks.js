/* =========================================
   DEENTRACK
   TASKS SYSTEM
========================================= */

"use strict";


/* =========================================
   STORAGE
========================================= */

const TASK_STORAGE_KEY =
    "deenTrackTasks";


/* =========================================
   STATE
========================================= */

let tasks = loadTasks();

let currentFilter = "all";


/* =========================================
   HELPERS
========================================= */

function $(selector) {

    return document.querySelector(selector);

}


function todayKey() {

    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function formatDate(dateString) {

    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    return new Intl.DateTimeFormat(
        "ar-EG",
        {
            weekday: "long",
            day: "numeric",
            month: "long"
        }
    ).format(date);

}


/* =========================================
   LOAD
========================================= */

function loadTasks() {

    const saved =
        localStorage.getItem(
            TASK_STORAGE_KEY
        );


    if (!saved) {

        return [];

    }


    try {

        const data =
            JSON.parse(saved);


        return Array.isArray(data)
            ? data
            : [];

    } catch (error) {

        console.error(
            "Tasks loading error:",
            error
        );

        return [];

    }

}


/* =========================================
   SAVE
========================================= */

function saveTasks() {

    localStorage.setItem(
        TASK_STORAGE_KEY,
        JSON.stringify(tasks)
    );

}


/* =========================================
   TOAST
========================================= */

function showToast(message, type = "success") {

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

    }, 2400);

}


/* =========================================
   MODAL
========================================= */

function openTaskModal() {

    const modal =
        $("#taskModal");


    if (!modal) {
        return;
    }


    modal.classList.add(
        "active"
    );


    const dateInput =
        $("#taskDate");


    if (
        dateInput &&
        !dateInput.value
    ) {

        dateInput.value =
            todayKey();

    }


    setTimeout(() => {

        $("#taskTitle")?.focus();

    }, 100);

}


function closeTaskModal() {

    const modal =
        $("#taskModal");


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "active"
    );

}


function setupModal() {

    $("#addTaskBtn")
        ?.addEventListener(
            "click",
            openTaskModal
        );


    $("#emptyAddTask")
        ?.addEventListener(
            "click",
            openTaskModal
        );


    $("#closeTaskModal")
        ?.addEventListener(
            "click",
            closeTaskModal
        );


    $("#cancelTask")
        ?.addEventListener(
            "click",
            closeTaskModal
        );


    $("#taskModalOverlay")
        ?.addEventListener(
            "click",
            closeTaskModal
        );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeTaskModal();

            }

        }
    );

}


/* =========================================
   ADD TASK
========================================= */

function setupForm() {

    const form =
        $("#taskForm");


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const title =
                $("#taskTitle")
                    .value
                    .trim();


            const subject =
                $("#taskSubject")
                    .value
                    .trim();


            const date =
                $("#taskDate")
                    .value;


            const priority =
                $("#taskPriority")
                    .value;


            const description =
                $("#taskDescription")
                    .value
                    .trim();


            if (!title) {

                showToast(
                    "اكتب اسم المهمة الأول",
                    "warning"
                );

                return;

            }


            if (!date) {

                showToast(
                    "اختار تاريخ المهمة",
                    "warning"
                );

                return;

            }


            const task = {

                id:
                    Date.now().toString(),

                title,

                subject,

                date,

                priority,

                description,

                completed: false,

                createdAt:
                    Date.now()

            };


            tasks.push(
                task
            );


            saveTasks();


            form.reset();


            $("#taskDate").value =
                todayKey();


            closeTaskModal();


            render();


            showToast(
                "تمت إضافة المهمة بنجاح ✓"
            );

        }
    );

}


/* =========================================
   PRIORITY
========================================= */

function priorityText(priority) {

    if (
        priority === "urgent"
    ) {

        return "عاجلة 🔥";

    }


    if (
        priority === "high"
    ) {

        return "مهمة ⭐";

    }


    return "عادية";

}


function priorityClass(priority) {

    if (
        priority === "urgent"
    ) {

        return "priority-urgent";

    }


    if (
        priority === "high"
    ) {

        return "priority-high";

    }


    return "priority-normal";

}


/* =========================================
   FILTER
========================================= */

function setupFilters() {

    const buttons =
        document.querySelectorAll(
            ".filter-btn"
        );


    buttons.forEach(button => {

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


                currentFilter =
                    button.dataset.filter;


                render();

            }
        );

    });

}


/* =========================================
   FILTERED TASKS
========================================= */

function getFilteredTasks() {

    if (
        currentFilter === "pending"
    ) {

        return tasks.filter(
            task => !task.completed
        );

    }


    if (
        currentFilter === "completed"
    ) {

        return tasks.filter(
            task => task.completed
        );

    }


    return tasks;

}


/* =========================================
   RENDER TASKS
========================================= */

function renderTasks() {

    const list =
        $("#tasksList");


    const empty =
        $("#emptyTasks");


    if (!list || !empty) {
        return;
    }


    list.innerHTML = "";


    const filtered =
        getFilteredTasks();


    if (
        filtered.length === 0
    ) {

        empty.classList.add(
            "show"
        );

        return;

    }


    empty.classList.remove(
        "show"
    );


    filtered.sort(
        (a, b) => {

            if (
                a.completed !==
                b.completed
            ) {

                return a.completed
                    ? 1
                    : -1;

            }


            return (
                a.date.localeCompare(
                    b.date
                )
            );

        }
    );


    filtered.forEach(task => {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "task-card";


        if (task.completed) {

            card.classList.add(
                "completed"
            );

        }


        const subjectHTML =
            task.subject
                ? `
                    <span class="task-badge subject">
                        📚 ${escapeHTML(task.subject)}
                    </span>
                  `
                : "";


        const descriptionHTML =
            task.description
                ? `
                    <div class="task-description">
                        ${escapeHTML(task.description)}
                    </div>
                  `
                : "";


        card.innerHTML = `

            <button
                type="button"
                class="task-check"
                data-action="complete"
                data-id="${task.id}"
                aria-label="تغيير حالة المهمة">

                ${task.completed ? "✓" : ""}

            </button>


            <div class="task-info">

                <div class="task-title">
                    ${escapeHTML(task.title)}
                </div>

                ${descriptionHTML}

                <div class="task-meta">

                    ${subjectHTML}

                    <span class="task-badge">
                        📅 ${formatDate(task.date)}
                    </span>

                    <span
                        class="priority ${priorityClass(task.priority)}">

                        ${priorityText(task.priority)}

                    </span>

                </div>

            </div>


            <div class="task-actions">

                <button
                    type="button"
                    class="task-action delete"
                    data-action="delete"
                    data-id="${task.id}"
                    aria-label="حذف المهمة">

                    🗑️

                </button>

            </div>

        `;


        list.appendChild(
            card
        );

    });

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================
   COMPLETE / DELETE
========================================= */

function setupTaskActions() {

    const list =
        $("#tasksList");


    if (!list) {
        return;
    }


    list.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if (!button) {
                return;
            }


            const id =
                button.dataset.id;


            const action =
                button.dataset.action;


            const task =
                tasks.find(
                    item => item.id === id
                );


            if (!task) {
                return;
            }


            /* COMPLETE */

            if (
                action === "complete"
            ) {

                task.completed =
                    !task.completed;


                saveTasks();


                updateMainState(
                    task.completed
                );


                render();


                showToast(
                    task.completed
                        ? "عاش! المهمة خلصت ✓ +5 نقاط"
                        : "تم إلغاء إكمال المهمة"
                );

            }


            /* DELETE */

            if (
                action === "delete"
            ) {

                const confirmed =
                    confirm(
                        "متأكد إنك عايز تحذف المهمة دي؟"
                    );


                if (!confirmed) {
                    return;
                }


                const wasCompleted =
                    task.completed;


                tasks =
                    tasks.filter(
                        item =>
                            item.id !== id
                    );


                saveTasks();


                if (wasCompleted) {

                    updateMainState(
                        false
                    );

                }


                render();


                showToast(
                    "تم حذف المهمة 🗑️"
                );

            }

        }
    );

}


/* =========================================
   UPDATE MAIN APP STATE
========================================= */

function updateMainState(
    completed
) {

    const key =
        "deenTrackState";


    let mainState = {

        points: 0,

        completedTasks: 0,

        totalTasks: 0

    };


    try {

        const saved =
            localStorage.getItem(
                key
            );


        if (saved) {

            const parsed =
                JSON.parse(saved);


            if (
                parsed &&
                typeof parsed === "object"
            ) {

                mainState = {
                    ...mainState,
                    ...parsed
                };

            }

        }

    } catch (error) {

        console.error(
            "Main state error:",
            error
        );

    }


    mainState.points =
        Number(
            mainState.points
        ) || 0;


    mainState.completedTasks =
        Number(
            mainState.completedTasks
        ) || 0;


    /*
       عدد المهام الحقيقي
    */

    mainState.totalTasks =
        tasks.length;


    /*
       بنحسب المكتمل من المهام نفسها
    */

    mainState.completedTasks =
        tasks.filter(
            task => task.completed
        ).length;


    /*
       نقاط المهام
    */

    if (completed) {

        mainState.points += 5;

    } else {

        mainState.points =
            Math.max(
                0,
                mainState.points - 5
            );

    }


    localStorage.setItem(
        key,
        JSON.stringify(mainState)
    );

}


/* =========================================
   STATS
========================================= */

function updateStats() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    const pending =
        total - completed;


    const today =
        todayKey();


    const todayTasks =
        tasks.filter(
            task =>
                task.date === today
        );


    const todayCompleted =
        todayTasks.filter(
            task =>
                task.completed
        ).length;


    const totalElement =
        $("#totalTaskCount");


    const completedElement =
        $("#completedTaskCount");


    const pendingElement =
        $("#pendingTaskCount");


    const pointsElement =
        $("#taskPointsCount");


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (completedElement) {

        completedElement.textContent =
            completed;

    }


    if (pendingElement) {

        pendingElement.textContent =
            pending;

    }


    if (pointsElement) {

        pointsElement.textContent =
            todayCompleted * 5;

    }


    /*
       Progress
    */

    const percentage =
        total > 0
            ? Math.round(
                (
                    completed /
                    total
                ) * 100
            )
            : 0;


    const progressText =
        $("#taskProgressText");


    const progressFill =
        $("#taskProgressFill");


    if (progressText) {

        progressText.textContent =
            `${percentage}%`;

    }


    if (progressFill) {

        progressFill.style.width =
            `${percentage}%`;

    }


    const message =
        $("#taskProgressMessage");


    if (message) {

        if (total === 0) {

            message.textContent =
                "ابدأ بأول مهمة النهارده 🚀";

        } else if (
            percentage === 100
        ) {

            message.textContent =
                "ما شاء الله! خلصت كل مهامك 🔥";

        } else if (
            percentage >= 50
        ) {

            message.textContent =
                "ممتاز! أنت في النص وأكثر 💪";

        } else {

            message.textContent =
                "كمل واحدة واحدة وهتخلصهم كلهم 👊";

        }

    }

}


/* =========================================
   DATE
========================================= */

function updateTodayDate() {

    const element =
        $("#todayDate");


    if (!element) {
        return;
    }


    element.textContent =
        formatDate(
            todayKey()
        );

}


/* =========================================
   MOTIVATION
========================================= */

function updateMotivation() {

    const pending =
        tasks.filter(
            task => !task.completed
        ).length;


    const title =
        $("#motivationTitle");


    const text =
        $("#motivationText");


    if (!title || !text) {
        return;
    }


    if (pending === 0) {

        title.textContent =
            "يومك متظبط تمامًا 🔥";

        text.textContent =
            "أنت خلصت كل اللي عليك. استمتع بإحساس الإنجاز وكمل بنفس النظام.";

    } else if (
        pending <= 2
    ) {

        title.textContent =
            "فاضلك كام خطوة بس 💪";

        text.textContent =
            "ركز في المهمة اللي قدامك دلوقتي وسيب الباقي بعدين.";

    } else {

        title.textContent =
            "مهمة واحدة في كل مرة";

        text.textContent =
            "متبصش لكل اللي وراك مرة واحدة. خلّص خطوة، وبعدها اللي بعدها.";

    }

}


/* =========================================
   SIDEBAR STREAK
========================================= */

function updateStreak() {

    const element =
        $("#sidebarStreak");


    if (!element) {
        return;
    }


    try {

        const saved =
            localStorage.getItem(
                "deenTrackState"
            );


        if (!saved) {
            return;
        }


        const data =
            JSON.parse(saved);


        const streak =
            Number(
                data.streak
            );


        if (
            Number.isFinite(streak)
        ) {

            element.textContent =
                streak;

        }

    } catch (error) {

        console.error(
            error
        );

    }

}


/* =========================================
   RENDER
========================================= */

function render() {

    renderTasks();

    updateStats();

    updateTodayDate();

    updateMotivation();

    updateStreak();

}


/* =========================================
   INIT
======================================== */
function initializeTasks() {

    setupModal();

    setupForm();

    setupFilters();

    setupTaskActions();

    render();

}


document.addEventListener(
    "DOMContentLoaded",
    initializeTasks
);