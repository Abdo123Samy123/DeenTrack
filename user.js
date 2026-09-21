"use strict";

document.addEventListener("DOMContentLoaded", () => {

    // قراءة اسم المستخدم
    const username =
        localStorage.getItem("deenTrackUsername") ||
        localStorage.getItem("username") ||
        localStorage.getItem("deenTrackUsernameInput") ||
        "abdo";


    // كل العناصر اللي المفروض تعرض اسم المستخدم
    const nameElements =
        document.querySelectorAll(
            "#sidebarUserName, [data-username]"
        );


    nameElements.forEach(element => {
        element.textContent = username;
    });


    // الحرف داخل الصورة
    const avatar =
        document.getElementById("sidebarAvatar");

    if (avatar && username) {
        avatar.textContent =
            username.trim().charAt(0);
    }

});