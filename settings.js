"use strict";

/* =========================================================
   DEENTRACK SETTINGS
========================================================= */

const SETTINGS_KEY = "deenTrackSettings";
const PROFILE_KEY = "deenTrackProfile";

const DEFAULT_SETTINGS = {
    theme: "dark",
    animations: true,
    effects: true,
    prayerNotifications: true,
    studyNotifications: true,
    taskNotifications: true,
    dhikrNotifications: true,
    profileVisibility: true,
    statsVisibility: true,
    onlineVisibility: true
};

const DEFAULT_PROFILE = {
    name: "abdo",
    username: "abdo",
    bio: "طالب يسعى للتطور كل يوم"
};


/* =========================================================
   STORAGE
========================================================= */

function getSettings() {
    try {
        const saved = localStorage.getItem(SETTINGS_KEY);

        if (!saved) {
            return { ...DEFAULT_SETTINGS };
        }

        return {
            ...DEFAULT_SETTINGS,
            ...JSON.parse(saved)
        };

    } catch (error) {
        console.error(error);
        return { ...DEFAULT_SETTINGS };
    }
}


function saveSettings(settings) {
    localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
    );
}


function getProfile() {
    try {
        const saved = localStorage.getItem(PROFILE_KEY);

        if (!saved) {
            return { ...DEFAULT_PROFILE };
        }

        return {
            ...DEFAULT_PROFILE,
            ...JSON.parse(saved)
        };

    } catch (error) {
        console.error(error);
        return { ...DEFAULT_PROFILE };
    }
}


function saveProfile(profile) {
    localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(profile)
    );
}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;

function showToast(message) {

    const toast =
        document.getElementById("settingsToast");

    if (!toast) {
        console.log(message);
        return;
    }

    toast.textContent = message;

    toast.classList.add("active");
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        toast.classList.remove("active");
        toast.classList.remove("show");

    }, 2500);
}


/* =========================================================
   SETTINGS MENU
========================================================= */

function initSettingsMenu() {

    const menuItems =
        document.querySelectorAll(
            ".settings-menu-item"
        );

    const sections =
        document.querySelectorAll(
            ".settings-section"
        );

    console.log(
        "Settings menu:",
        menuItems.length
    );

    console.log(
        "Settings sections:",
        sections.length
    );


    if (!menuItems.length) {
        console.warn(
            "لم يتم العثور على settings-menu-item"
        );
        return;
    }


    menuItems.forEach(item => {

        item.addEventListener("click", event => {

            event.preventDefault();

            /*
             * ندعم أكتر من اسم للـ attribute
             */

            const target =
                item.dataset.settingsTarget ||
                item.dataset.target ||
                item.dataset.section;


            if (!target) {

                console.warn(
                    "زر الإعدادات ليس لديه target:",
                    item
                );

                return;
            }


            console.log(
                "فتح قسم:",
                target
            );


            sections.forEach(section => {

                const sectionName =
                    section.dataset.settingsSection ||
                    section.dataset.section ||
                    section.id;


                section.classList.toggle(
                    "active",
                    sectionName === target
                );

            });


            menuItems.forEach(menuItem => {

                const menuTarget =
                    menuItem.dataset.settingsTarget ||
                    menuItem.dataset.target ||
                    menuItem.dataset.section;

                menuItem.classList.toggle(
                    "active",
                    menuTarget === target
                );

            });

        });

    });
}


/* =========================================================
   PROFILE
========================================================= */

function loadProfile() {

    const profile = getProfile();


    const nameInput =
        document.getElementById(
            "settingsName"
        );

    const usernameInput =
        document.getElementById(
            "settingsUsername"
        );

    const bioInput =
        document.getElementById(
            "settingsBio"
        );


    if (nameInput) {
        nameInput.value =
            profile.name || "";
    }


    if (usernameInput) {
        usernameInput.value =
            profile.username || "";
    }


    if (bioInput) {

        bioInput.value =
            profile.bio || "";

        updateBioCounter();

    }


    updateProfilePreview(profile);
}


/* =========================================================
   PROFILE PREVIEW
========================================================= */

function updateProfilePreview(profile) {

    const profileName =
        document.querySelector(
            ".settings-profile-info strong"
        );

    const profileUsername =
        document.querySelector(
            ".settings-profile-info .settings-username"
        );


    if (profileName) {

        profileName.textContent =
            profile.name || "abdo";

    }


    if (profileUsername) {

        profileUsername.textContent =
            "@" +
            (profile.username || "abdo");

    }


    /*
     * تحديث اسم المستخدم في الـ Sidebar
     */

    const sidebarName =
        document.querySelector(
            ".sidebar-user-name"
        );

    if (sidebarName) {

        sidebarName.textContent =
            profile.name || "abdo";

    }
}


/* =========================================================
   BIO COUNTER
========================================================= */

function updateBioCounter() {

    const bio =
        document.getElementById(
            "settingsBio"
        );

    const counter =
        document.getElementById(
            "bioCounter"
        );


    if (!bio || !counter) return;


    counter.textContent =
        `${bio.value.length}/160`;
}


/* =========================================================
   ACCOUNT FORM
========================================================= */

function initAccountForm() {

    const form =
        document.getElementById(
            "accountSettingsForm"
        );


    if (!form) {

        console.warn(
            "accountSettingsForm غير موجود"
        );

        return;
    }


    const bio =
        document.getElementById(
            "settingsBio"
        );


    if (bio) {

        bio.addEventListener(
            "input",
            updateBioCounter
        );

    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const name =
                document
                    .getElementById("settingsName")
                    ?.value
                    .trim();


            const username =
                document
                    .getElementById("settingsUsername")
                    ?.value
                    .trim()
                    .replace(/^@/, "");


            const bioText =
                document
                    .getElementById("settingsBio")
                    ?.value
                    .trim();


            if (!name) {

                showToast(
                    "اكتب اسمك الأول"
                );

                return;
            }


            if (!username) {

                showToast(
                    "اكتب اسم المستخدم"
                );

                return;
            }


            const profile = {
                name: name,
                username: username,
                bio: bioText || ""
            };


            saveProfile(profile);

            updateProfilePreview(profile);

            showToast(
                "تم حفظ بيانات الحساب بنجاح ✓"
            );

        }
    );
}


/* =========================================================
   EDIT PROFILE BUTTON
========================================================= */

function initEditProfileButton() {

    const buttons =
        document.querySelectorAll(
            ".settings-secondary-btn"
        );


    buttons.forEach(button => {

        const text =
            button.textContent.trim();


        if (
            text.includes("تعديل الملف الشخصي") ||
            text.includes("تعديل الملف")
        ) {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    /*
                     * لو فيه صفحة profile.html
                     * نروح لها
                     */

                    window.location.href =
                        "profile.html";

                }
            );

        }

    });
}


/* =========================================================
   THEME
========================================================= */

function applyTheme(theme) {

    document.documentElement.dataset.theme =
        theme;


    document.documentElement.classList.toggle(
        "light-theme",
        theme === "light"
    );


    document
        .querySelectorAll(".theme-option")
        .forEach(option => {

            option.classList.toggle(
                "active",
                option.dataset.theme === theme
            );

        });
}


function initTheme() {

    const settings =
        getSettings();


    applyTheme(
        settings.theme
    );


    document
        .querySelectorAll(".theme-option")
        .forEach(option => {

            option.addEventListener(
                "click",
                () => {

                    const theme =
                        option.dataset.theme;


                    if (!theme) return;


                    const newSettings = {
                        ...getSettings(),
                        theme: theme
                    };


                    saveSettings(
                        newSettings
                    );


                    applyTheme(theme);


                    showToast(
                        theme === "dark"
                            ? "تم تفعيل الوضع الداكن"
                            : "تم تفعيل الوضع الفاتح"
                    );

                }
            );

        });
}


/* =========================================================
   SWITCHES
========================================================= */

const SWITCHES = {
    animationsToggle: "animations",
    effectsToggle: "effects",

    prayerNotifications:
        "prayerNotifications",

    studyNotifications:
        "studyNotifications",

    taskNotifications:
        "taskNotifications",

    dhikrNotifications:
        "dhikrNotifications",

    profileVisibility:
        "profileVisibility",

    statsVisibility:
        "statsVisibility",

    onlineVisibility:
        "onlineVisibility"
};


function initSwitches() {

    const settings =
        getSettings();


    Object.entries(SWITCHES)
        .forEach(
            ([id, key]) => {

                const input =
                    document.getElementById(id);


                if (!input) return;


                input.checked =
                    settings[key] !== false;


                input.addEventListener(
                    "change",
                    () => {

                        const newSettings = {
                            ...getSettings(),
                            [key]: input.checked
                        };


                        saveSettings(
                            newSettings
                        );


                        applyFeatureSettings(
                            newSettings
                        );


                        showToast(
                            input.checked
                                ? "تم تفعيل الإعداد ✓"
                                : "تم إيقاف الإعداد"
                        );

                    }
                );

            }
        );


    applyFeatureSettings(settings);
}


/* =========================================================
   FEATURES
========================================================= */

function applyFeatureSettings(settings) {

    document.documentElement.classList.toggle(
        "no-animations",
        settings.animations === false
    );


    document.documentElement.classList.toggle(
        "no-effects",
        settings.effects === false
    );
}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function initMobileMenu() {

    const button =
        document.querySelector(
            ".mobile-menu-btn"
        );

    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    if (!button || !sidebar) return;


    button.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            sidebar.classList.toggle(
                "open"
            );

        }
    );


    document.addEventListener(
        "click",
        event => {

            if (window.innerWidth > 850) {
                return;
            }


            if (
                !sidebar.contains(event.target) &&
                !button.contains(event.target)
            ) {

                sidebar.classList.remove(
                    "open"
                );

            }

        }
    );
}


/* =========================================================
   EXPORT DATA
========================================================= */

function initExport() {

    const button =
        document.getElementById(
            "exportDataBtn"
        );


    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            const data = {};


            for (
                let i = 0;
                i < localStorage.length;
                i++
            ) {

                const key =
                    localStorage.key(i);


                if (
                    key &&
                    key.startsWith(
                        "deenTrack"
                    )
                ) {

                    const value =
                        localStorage.getItem(key);


                    try {

                        data[key] =
                            JSON.parse(value);

                    } catch {

                        data[key] =
                            value;

                    }

                }

            }


            const backup = {
                app: "DeenTrack",
                version: "1.0",
                date: new Date().toISOString(),
                data: data
            };


            const blob =
                new Blob(
                    [
                        JSON.stringify(
                            backup,
                            null,
                            2
                        )
                    ],
                    {
                        type:
                            "application/json"
                    }
                );


            const url =
                URL.createObjectURL(blob);


            const link =
                document.createElement("a");


            link.href = url;

            link.download =
                "DeenTrack-Backup.json";


            document.body.appendChild(link);

            link.click();

            link.remove();

            URL.revokeObjectURL(url);


            showToast(
                "تم تصدير بياناتك بنجاح ✓"
            );

        }
    );
}


/* =========================================================
   IMPORT DATA
========================================================= */

function initImport() {

    const button =
        document.getElementById(
            "importDataBtn"
        );

    const input =
        document.getElementById(
            "importFileInput"
        );


    if (!button || !input) return;


    button.addEventListener(
        "click",
        () => {

            input.click();

        }
    );


    input.addEventListener(
        "change",
        event => {

            const file =
                event.target.files?.[0];


            if (!file) return;


            const reader =
                new FileReader();


            reader.onload =
                function () {

                    try {

                        const backup =
                            JSON.parse(
                                reader.result
                            );


                        if (
                            !backup.data ||
                            typeof backup.data !==
                            "object"
                        ) {

                            throw new Error(
                                "Invalid backup"
                            );

                        }


                        Object.entries(
                            backup.data
                        ).forEach(
                            ([key, value]) => {

                                if (
                                    !key.startsWith(
                                        "deenTrack"
                                    )
                                ) {
                                    return;
                                }


                                localStorage.setItem(
                                    key,
                                    typeof value ===
                                    "string"
                                        ? value
                                        : JSON.stringify(value)
                                );

                            }
                        );


                        showToast(
                            "تم استيراد البيانات ✓"
                        );


                        setTimeout(
                            () => {
                                location.reload();
                            },
                            800
                        );


                    } catch (error) {

                        console.error(error);

                        showToast(
                            "ملف النسخة الاحتياطية غير صالح"
                        );

                    }

                };


            reader.readAsText(file);

        }
    );
}

/* =========================================================
   RESET
========================================================= */

function initReset() {

    const button =
        document.getElementById(
            "resetDataBtn"
        );


    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            const confirmOne =
                confirm(
                    "هل أنت متأكد من حذف بيانات DeenTrack؟"
                );


            if (!confirmOne) return;


            const confirmTwo =
                confirm(
                    "سيتم حذف البيانات المحلية بالكامل. هل تريد المتابعة؟"
                );


            if (!confirmTwo) return;


            const keys = [];


            for (
                let i = 0;
                i < localStorage.length;
                i++
            ) {

                const key =
                    localStorage.key(i);


                if (
                    key &&
                    key.startsWith(
                        "deenTrack"
                    )
                ) {

                    keys.push(key);

                }

            }


            keys.forEach(
                key => {
                    localStorage.removeItem(key);
                }
            );


            showToast(
                "تم حذف البيانات بنجاح"
            );


            setTimeout(
                () => {
                    location.reload();
                },
                800
            );

        }
    );
}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "DeenTrack Settings JS يعمل ✓"
        );


        loadProfile();

        initSettingsMenu();

        initAccountForm();

        initEditProfileButton();

        initTheme();

        initSwitches();

        initMobileMenu();

        initExport();

        initImport();

        initReset();

    }
);