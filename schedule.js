/* =====================================================
   DEENTRACK — SCHEDULE
   ===================================================== */

const STORAGE_KEY = "deenTrackSchedule";

let lessons = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

let selectedDate = getToday();
let currentWeekStart = getWeekStart(new Date());

/* =========================
   ELEMENTS
========================= */

const scheduleModal = document.getElementById("scheduleModal");
const modalOverlay = document.getElementById("modalOverlay");

const openScheduleModal = document.getElementById("openScheduleModal");
const emptyAddLesson = document.getElementById("emptyAddLesson");

const closeScheduleModal = document.getElementById("closeScheduleModal");
const cancelSchedule = document.getElementById("cancelSchedule");

const scheduleForm = document.getElementById("scheduleForm");

const previousWeek = document.getElementById("previousWeek");
const nextWeek = document.getElementById("nextWeek");
const todayButton = document.getElementById("todayButton");

const weekTitle = document.getElementById("weekTitle");
const daysGrid = document.getElementById("daysGrid");

const selectedDateElement = document.getElementById("selectedDate");
const lessonsList = document.getElementById("lessonsList");

const weekOverviewGrid =
    document.getElementById("weekOverviewGrid");

const toastContainer =
    document.getElementById("toastContainer");


/* =========================
   DATE HELPERS
========================= */

function getToday() {
    const now = new Date();

    return now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0") + "-" +
        String(now.getDate()).padStart(2, "0");
}


function getWeekStart(date) {

    const d = new Date(date);

    /*
       الأسبوع يبدأ السبت
       JavaScript:
       الأحد = 0
       السبت = 6
    */

    const day = d.getDay();

    const difference = day === 6 ? 0 : day + 1;

    d.setDate(d.getDate() - difference);

    d.setHours(0, 0, 0, 0);

    return d;
}


function formatDate(date) {

    return date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(date.getDate()).padStart(2, "0");
}


function formatArabicDate(date) {

    return date.toLocaleDateString("ar-EG", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });
}


function escapeHTML(text) {

    if (text === undefined || text === null) {
        return "";
    }

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   SAVE
========================= */

function saveLessons() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(lessons)
    );
}


/* =========================
   MODAL
========================= */

function openModal() {

    if (!scheduleModal) return;

    scheduleModal.classList.add("active");

    const dateInput =
        document.getElementById("lessonDate");

    if (dateInput && !dateInput.value) {
        dateInput.value = selectedDate;
    }
}


function closeModal() {

    if (!scheduleModal) return;

    scheduleModal.classList.remove("active");
}


if (openScheduleModal) {
    openScheduleModal.addEventListener(
        "click",
        openModal
    );
}


if (emptyAddLesson) {
    emptyAddLesson.addEventListener(
        "click",
        openModal
    );
}


if (closeScheduleModal) {
    closeScheduleModal.addEventListener(
        "click",
        closeModal
    );
}


if (cancelSchedule) {
    cancelSchedule.addEventListener(
        "click",
        closeModal
    );
}


if (modalOverlay) {
    modalOverlay.addEventListener(
        "click",
        closeModal
    );
}


/* =========================
   ADD LESSON
========================= */

if (scheduleForm) {

    scheduleForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const name =
                document.getElementById("lessonName").value.trim();

            const subject =
                document.getElementById("lessonSubject").value.trim();

            const date =
                document.getElementById("lessonDate").value;

            const start =
                document.getElementById("lessonStart").value;

            const end =
                document.getElementById("lessonEnd").value;

            const teacher =
                document.getElementById("teacherName").value.trim();

            const location =
                document.getElementById("lessonLocation").value.trim();

            const homework =
                document.getElementById("lessonHomework").value.trim();

            const reminder =
                document.getElementById("lessonReminder").checked;


            if (!name || !subject || !date || !start || !end) {

                showToast("من فضلك كمل بيانات الدرس");

                return;
            }


            if (end <= start) {

                showToast("وقت النهاية لازم يكون بعد وقت البداية");

                return;
            }


            const newLesson = {

                id: Date.now(),

                name: name,

                subject: subject,

                date: date,

                start: start,

                end: end,

                teacher: teacher,

                location: location,

                homework: homework,

                reminder: reminder,

                completed: false
            };


            lessons.push(newLesson);

            saveLessons();

            selectedDate = date;

            currentWeekStart =
                getWeekStart(new Date(date));


            scheduleForm.reset();

            closeModal();

            renderAll();

            showToast("✅ تم إضافة الدرس بنجاح");
        }
    );
}


/* =========================
   RENDER ALL
========================= */

function renderAll() {

    renderWeek();

    renderLessons();

    renderSummary();

    renderOverview();
}


/* =========================
   WEEK
========================= */

function renderWeek() {

    if (!daysGrid) return;

    daysGrid.innerHTML = "";

    const days = [
        "السبت",
        "الأحد",
        "الإثنين",
        "الثلاثاء",
        "الأربعاء",
        "الخميس",
        "الجمعة"
    ];


    for (let i = 0; i < 7; i++) {

        const date = new Date(currentWeekStart);

        date.setDate(
            currentWeekStart.getDate() + i
        );

        const dateString = formatDate(date);

        const dayLessons =
            lessons.filter(
                lesson => lesson.date === dateString
            );


        const card =
            document.createElement("div");

        card.className = "day-card";


        if (dateString === getToday()) {
            card.classList.add("today");
        }


        if (dateString === selectedDate) {
            card.classList.add("selected");
        }


        let miniLessons = "";


        if (dayLessons.length > 0) {

            miniLessons = dayLessons
                .slice(0, 3)
                .map(lesson => `
                    <div class="mini-lesson">
                        ${escapeHTML(lesson.start)}
                        —
                        ${escapeHTML(lesson.name)}
                    </div>
                `)
                .join("");

        } else {

            miniLessons = `
                <div class="empty-day">
                    مفيش دروس
                </div>
            `;
        }


        card.innerHTML = `

            <div class="day-name">
                ${days[i]}
            </div>

            <div class="day-date">
                ${date.getDate()}
            </div>

            <div class="day-lessons">
                ${miniLessons}
            </div>

        `;


        card.addEventListener(
            "click",
            function () {

                selectedDate = dateString;

                renderAll();
            }
        );


        daysGrid.appendChild(card);
    }


    const startText =
        currentWeekStart.toLocaleDateString(
            "ar-EG",
            {
                day: "numeric",
                month: "long"
            }
        );


    const endDate =
        new Date(currentWeekStart);

    endDate.setDate(
        currentWeekStart.getDate() + 6
    );


    const endText =
        endDate.toLocaleDateString(
            "ar-EG",
            {
                day: "numeric",
                month: "long"
            }
        );


    if (weekTitle) {

        weekTitle.textContent =
            `${startText} — ${endText}`;
    }
}


/* =========================
   LESSONS
========================= */

function renderLessons() {

    if (!lessonsList) return;

    const selectedLessons =
        lessons
            .filter(
                lesson => lesson.date === selectedDate
            )
            .sort(
                (a, b) =>
                    a.start.localeCompare(b.start)
            );


    if (selectedDateElement) {

        const date =
            new Date(selectedDate + "T00:00:00");

        selectedDateElement.textContent =
            formatArabicDate(date);
    }


    if (selectedLessons.length === 0) {

        lessonsList.innerHTML = `

            <div class="empty-lessons">

                <span>📚</span>

                <strong>
                    مفيش دروس النهارده
                </strong>

                <p>
                    أضف أول درس للجدول.
                </p>

                <button
                    type="button"
                    id="emptyAddLesson">
                    ＋ إضافة درس
                </button>

            </div>
        `;


        const button =
            document.getElementById("emptyAddLesson");

        if (button) {
            button.addEventListener(
                "click",
                openModal
            );
        }

        return;
    }


    lessonsList.innerHTML =
        selectedLessons
            .map(lesson => {

                return `

                <div
                    class="lesson-card ${lesson.completed ? "completed" : ""}"
                    data-id="${lesson.id}">

                    <div class="lesson-info">

                        <h3>
                            ${escapeHTML(lesson.name)}
                        </h3>

                        <p>
                            📚 ${escapeHTML(lesson.subject)}
                            ${lesson.teacher
                                ? ` · 👨‍🏫 ${escapeHTML(lesson.teacher)}`
                                : ""}
                        </p>

                        ${lesson.location
                            ? `
                            <p>
                                📍 ${escapeHTML(lesson.location)}
                            </p>
                            `
                            : ""}

                        ${lesson.homework
                            ? `
                            <p>
                                📝 ${escapeHTML(lesson.homework)}
                            </p>
                            `
                            : ""}

                    </div>


                    <div class="lesson-time">

                        ${escapeHTML(lesson.start)}
                        —
                        ${escapeHTML(lesson.end)}

                    </div>


                    <div class="lesson-actions">

                        <button
                            type="button"
                            data-action="complete"
                            title="مكتمل">
                            ${lesson.completed ? "↩" : "✓"}
                        </button>

                        <button
                            type="button"
                            data-action="delete"
                            title="حذف">
                            🗑
                        </button>

                    </div>

                </div>
                `;
            })
            .join("");


    lessonsList
        .querySelectorAll(".lesson-card")
        .forEach(card => {

            const id =
                Number(card.dataset.id);


            const completeButton =
                card.querySelector(
                    '[data-action="complete"]'
                );


            const deleteButton =
                card.querySelector(
                    '[data-action="delete"]'
                );


            if (completeButton) {

                completeButton.addEventListener(
                    "click",
                    function () {

                        toggleComplete(id);
                    }
                );
            }


            if (deleteButton) {

                deleteButton.addEventListener(
                    "click",
                    function () {

                        deleteLesson(id);
                    }
                );
            }

        });
}


/* =========================
   COMPLETE
========================= */

function toggleComplete(id) {

    const lesson =
        lessons.find(
            item => item.id === id
        );

    if (!lesson) return;

    lesson.completed =
        !lesson.completed;

    saveLessons();

    renderAll();

    showToast(
        lesson.completed
            ? "✅ تم تحديد الدرس كمكتمل"
            : "↩ تم إلغاء اكتمال الدرس"
    );
}


/* =========================
   DELETE
========================= */

function deleteLesson(id) {

    const lesson =
        lessons.find(
            item => item.id === id
        );

    if (!lesson) return;


    const confirmed =
        confirm("متأكد إنك عايز تحذف الدرس؟");


    if (!confirmed) return;


    lessons =
        lessons.filter(
            item => item.id !== id
        );


    saveLessons();

    renderAll();

    showToast("🗑 تم حذف الدرس");
}


/* =========================
   SUMMARY
========================= */

function renderSummary() {

    const today = getToday();

    const todayLessons =
        lessons.filter(
            lesson => lesson.date === today
        );


    let totalMinutes = 0;

    todayLessons.forEach(lesson => {

        const start =
            timeToMinutes(lesson.start);

        const end =
            timeToMinutes(lesson.end);

        totalMinutes +=
            Math.max(0, end - start);
    });


    const completed =
        todayLessons.filter(
            lesson => lesson.completed
        ).length;


    const homework =
        todayLessons.filter(
            lesson =>
                lesson.homework &&
                lesson.homework.trim() !== ""
        ).length;


    if (document.getElementById("todayLessons")) {

        document.getElementById("todayLessons")
            .textContent =
            todayLessons.length;
    }


    if (document.getElementById("todayHours")) {

        document.getElementById("todayHours")
            .textContent =
            formatHours(totalMinutes);
    }


    if (document.getElementById("completedLessons")) {

        document.getElementById("completedLessons")
            .textContent =
            completed;
    }


    if (document.getElementById("homeworkCount")) {

        document.getElementById("homeworkCount")
            .textContent =
            homework;
    }
}


function timeToMinutes(time) {

    const parts =
        time.split(":").map(Number);

    return parts[0] * 60 + parts[1];
}


function formatHours(minutes) {

    if (minutes === 0) {
        return "0 ساعة";
    }

    const hours =
        Math.floor(minutes / 60);

    const mins =
        minutes % 60;


    if (hours === 0) {
        return `${mins} دقيقة`;
    }

    if (mins === 0) {
        return `${hours} ساعة`;
    }

    return `${hours} س ${mins} د`;
}


/* =========================
   WEEK OVERVIEW
========================= */

function renderOverview() {

    if (!weekOverviewGrid) return;

    weekOverviewGrid.innerHTML = "";

    const days = [
        "السبت",
        "الأحد",
        "الإثنين",
        "الثلاثاء",
        "الأربعاء",
        "الخميس",
        "الجمعة"
    ];


    const counts = [];


    for (let i = 0; i < 7; i++) {

        const date =
            new Date(currentWeekStart);

        date.setDate(
            currentWeekStart.getDate() + i
        );

        const dateString =
            formatDate(date);


        const count =
            lessons.filter(
                lesson =>
                    lesson.date === dateString
            ).length;


        counts.push(count);
    }


    const max =
        Math.max(...counts, 1);


    for (let i = 0; i < 7; i++) {

        const height =
            counts[i] === 0
                ? 5
                : Math.max(
                    10,
                    (counts[i] / max) * 100
                );


        const item =
            document.createElement("div");

        item.className =
            "overview-day";


        item.innerHTML = `

            <strong>
                ${days[i]}
            </strong>

            <div class="overview-bar-container">

                <div
                    class="overview-bar"
                    style="height:${height}%">
                </div>

            </div>

            <span>
                ${counts[i]} درس
            </span>

        `;


        weekOverviewGrid.appendChild(item);
    }
}


/* =========================
   WEEK BUTTONS
========================= */

if (previousWeek) {

    previousWeek.addEventListener(
        "click",
        function () {

            currentWeekStart.setDate(
                currentWeekStart.getDate() - 7
            );

            renderAll();
        }
    );
}


if (nextWeek) {

    nextWeek.addEventListener(
        "click",
        function () {

            currentWeekStart.setDate(
                currentWeekStart.getDate() + 7
            );

            renderAll();
        }
    );
}


if (todayButton) {

    todayButton.addEventListener(
        "click",
        function () {

            selectedDate = getToday();

            currentWeekStart =
                getWeekStart(new Date());

            renderAll();
        }
    );
}


/* =========================
   TOAST
========================= */

function showToast(message) {

    if (!toastContainer) return;

    const toast =
        document.createElement("div");

    toast.className =
        "schedule-toast";

    toast.textContent =
        message;

    toastContainer.appendChild(toast);


    setTimeout(
        function () {

            toast.remove();

        },
        3000
    );
}


/* =========================
   START
========================= */

renderAll();