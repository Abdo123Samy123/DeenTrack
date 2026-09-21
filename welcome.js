/* =========================================================
   DEENTRACK WELCOME
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const usernameInput = document.getElementById("username");
    const enterButton = document.getElementById("enterButton");
    const inputArea = document.querySelector(".input-area");
    const inputMessage = document.getElementById("inputMessage");

    if (!usernameInput || !enterButton) return;


    /* =====================================================
       CHECK EXISTING USER
    ===================================================== */

    const savedUsername = localStorage.getItem("deenTrackUsername");

    if (savedUsername && savedUsername.trim()) {
        window.location.replace("index.html");
        return;
    }


    /* =====================================================
       ENTER FUNCTION
    ===================================================== */

    function enterDeenTrack() {

        const username = usernameInput.value.trim();

        if (username.length < 2) {

            inputArea.classList.add("input-error");

            inputMessage.textContent =
                "اكتب اسم المستخدم بشكل صحيح";

            usernameInput.focus();

            return;
        }


        if (username.length > 20) {

            inputArea.classList.add("input-error");

            inputMessage.textContent =
                "اسم المستخدم طويل جدًا";

            usernameInput.focus();

            return;
        }


        /* Remove error */

        inputArea.classList.remove("input-error");

        inputMessage.textContent =
            "تم حفظ اسم المستخدم ✓";

        inputMessage.style.color = "#a78bfa";


        /* Save username */

        localStorage.setItem(
            "deenTrackUsername",
            username
        );


        /* Save basic profile data if not already existing */

        const existingProfile =
            localStorage.getItem("deenTrackProfile");

        if (!existingProfile) {

            const profile = {
                username: username,
                createdAt: Date.now()
            };

            localStorage.setItem(
                "deenTrackProfile",
                JSON.stringify(profile)
            );
        }


        /* Button loading */

        enterButton.disabled = true;

        const buttonText =
            enterButton.querySelector(".button-text");

        if (buttonText) {
            buttonText.textContent =
                "جاري الدخول...";
        }


        /* Exit animation */

        setTimeout(() => {

            document.body.classList.add("page-exit");

        }, 150);


        /* Go dashboard */

        setTimeout(() => {

            window.location.replace("index.html");

        }, 700);
    }


    /* =====================================================
       BUTTON
    ===================================================== */

    enterButton.addEventListener(
        "click",
        enterDeenTrack
    );


    /* =====================================================
       ENTER KEY
    ===================================================== */

    usernameInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                event.preventDefault();
                enterDeenTrack();
            }

        }
    );


    /* =====================================================
       INPUT RESET ERROR
    ===================================================== */

    usernameInput.addEventListener(
        "input",
        () => {

            inputArea.classList.remove(
                "input-error"
            );

            inputMessage.textContent =
                "الاسم من 2 إلى 20 حرف";

            inputMessage.style.color = "";

        }
    );

});