"use strict";

/* =========================================================
   املاک هوشمند
   app.js
   نسخه 3.0
   هماهنگ با index.html
========================================================= */

const APP_CONFIG = {
    appName: "املاک هوشمند",
    version: "3.0.0",
    subscriptionPrice: 99000,
    subscriptionDays: 365
};

const STORAGE_KEYS = {
    user: "realEstate_user",
    properties: "realEstate_properties",
    customers: "realEstate_customers"
};


/* =========================================================
   ابزارهای عمومی
========================================================= */

function loadJSON(key, defaultValue) {
    try {
        const value = localStorage.getItem(key);

        if (!value) {
            return defaultValue;
        }

        return JSON.parse(value);

    } catch (error) {
        console.error(error);
        return defaultValue;
    }
}


function saveJSON(key, value) {
    try {
        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;

    } catch (error) {
        console.error(error);

        alert("ذخیره اطلاعات انجام نشد.");

        return false;
    }
}


function generateId() {
    return Date.now().toString() +
        Math.random().toString(36).substring(2, 9);
}


function normalizeNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    let text = String(value);

    const persian = "۰۱۲۳۴۵۶۷۸۹";
    const arabic = "٠١٢٣٤٥٦٧٨٩";

    text = text.replace(/[۰-۹]/g, function(char) {
        return persian.indexOf(char);
    });

    text = text.replace(/[٠-٩]/g, function(char) {
        return arabic.indexOf(char);
    });

    text = text
        .replace(/,/g, "")
        .replace(/٬/g, "")
        .replace(/ تومان/g, "")
        .trim();

    const number = Number(text);

    return isNaN(number) ? 0 : number;
}


function formatPrice(value) {

    const number = normalizeNumber(value);

    if (!number) {
        return "۰";
    }

    return number.toLocaleString("fa-IR");
}


function toPersianNumber(value) {

    return String(value).replace(
        /\d/g,
        function(digit) {
            return "۰۱۲۳۴۵۶۷۸۹"[digit];
        }
    );
}


function normalizePhone(phone) {

    let value = String(phone || "");

    value = value.replace(
        /[۰-۹]/g,
        function(char) {
            return "۰۱۲۳۴۵۶۷۸۹".indexOf(char);
        }
    );

    value = value.replace(
        /[٠-٩]/g,
        function(char) {
            return "٠١٢٣٤٥٦٧٨٩".indexOf(char);
        }
    );

    value = value.replace(/\D/g, "");

    if (value.startsWith("0098")) {
        value = "0" + value.substring(4);
    }

    if (value.startsWith("98")) {
        value = "0" + value.substring(2);
    }

    return value;
}


function isValidPhone(phone) {

    return /^09\d{9}$/.test(
        normalizePhone(phone)
    );
}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function getValue(id) {

    const element = document.getElementById(id);

    return element
        ? element.value.trim()
        : "";
}


function setValue(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.value =
            value === null ||
            value === undefined
                ? ""
                : value;
    }
}


function getChecked(id) {

    const element = document.getElementById(id);

    return element
        ? element.checked
        : false;
}


function setChecked(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.checked = Boolean(value);
    }
}


/* =========================================================
   اطلاعات
========================================================= */

function getUser() {
    return loadJSON(
        STORAGE_KEYS.user,
        null
    );
}


function getProperties() {
    return loadJSON(
        STORAGE_KEYS.properties,
        []
    );
}


function getCustomers() {
    return loadJSON(
        STORAGE_KEYS.customers,
        []
    );
}


function saveUser(user) {
    return saveJSON(
        STORAGE_KEYS.user,
        user
    );
}


function saveProperties(properties) {
    return saveJSON(
        STORAGE_KEYS.properties,
        properties
    );
}


function saveCustomers(customers) {
    return saveJSON(
        STORAGE_KEYS.customers,
        customers
    );
}


/* =========================================================
   صفحات ورود
========================================================= */

function hideAuthPages() {

    const pages = [
        "loginPage",
        "registerPage",
        "paymentPage"
    ];

    pages.forEach(function(id) {

        const page =
            document.getElementById(id);

        if (page) {
            page.style.display = "none";
        }
    });
}


function showLogin() {

    hideAuthPages();

    const page =
        document.getElementById("loginPage");

    if (page) {
        page.style.display = "block";
    }
}


function showRegister() {

    hideAuthPages();

    const page =
        document.getElementById("registerPage");

    if (page) {
        page.style.display = "block";
    }
}


function showPayment() {

    hideAuthPages();

    const page =
        document.getElementById("paymentPage");

    if (page) {
        page.style.display = "block";
    }
}


/* =========================================================
   ثبت نام
========================================================= */

function register() {

    const name =
        getValue("registerName");

    const phone =
        normalizePhone(
            getValue("registerPhone")
        );

    const terms =
        getChecked("terms");

    if (name.length < 2) {

        alert(
            "لطفاً نام و نام خانوادگی را وارد کنید."
        );

        return;
    }


    if (!isValidPhone(phone)) {

        alert(
            "شماره موبایل صحیح نیست.\nمثال: 09123456789"
        );

        return;
    }


    if (!terms) {

        alert(
            "لطفاً قوانین و شرایط را بپذیرید."
        );

        return;
    }


    const user = {

        id: generateId(),

        name: name,

        phone: phone,

        subscriptionUntil: null,

        createdAt: Date.now()
    };


    saveUser(user);


    alert(
        "ثبت‌نام با موفقیت انجام شد."
    );


    showPayment();
}


/* =========================================================
   ورود
========================================================= */

function login() {

    const phone =
        normalizePhone(
            getValue("loginPhone")
        );


    if (!isValidPhone(phone)) {

        alert(
            "شماره موبایل صحیح نیست."
        );

        return;
    }


    const user = getUser();


    if (!user) {

        alert(
            "حسابی پیدا نشد. ابتدا ثبت‌نام کنید."
        );

        showRegister();

        return;
    }


    if (
        normalizePhone(user.phone) !== phone
    ) {

        alert(
            "شماره موبایل با حساب شما مطابقت ندارد."
        );

        return;
    }


    if (!isSubscriptionValid(user)) {

        showPayment();

        return;
    }


    openApplication();
}


/* =========================================================
   اشتراک
========================================================= */

function isSubscriptionValid(user) {

    if (
        !user ||
        !user.subscriptionUntil
    ) {
        return false;
    }

    return (
        new Date(
            user.subscriptionUntil
        ).getTime() > Date.now()
    );
}


function activateSubscription() {

    const user = getUser();


    if (!user) {

        showRegister();

        return;
    }


    const currentDate =
        new Date();


    currentDate.setDate(
        currentDate.getDate() +
        APP_CONFIG.subscriptionDays
    );


    user.subscriptionUntil =
        currentDate.toISOString();


    saveUser(user);


    alert(
        "اشتراک یک‌ساله با موفقیت فعال شد."
    );


    openApplication();
}


function pay() {

    const user = getUser();


    if (!user) {

        alert(
            "ابتدا ثبت‌نام کنید."
        );

        showRegister();

        return;
    }


    activateSubscription();
}


function renewSubscription() {

    activateSubscription();
}


/* =========================================================
   ورود به برنامه
========================================================= */

function openApplication() {

    const auth =
        document.getElementById("authScreen");

    const app =
        document.getElementById("appScreen");


    if (auth) {
        auth.style.display = "none";
    }


    if (app) {
        app.style.display = "block";
    }


    updateDashboard();

    renderProperties();

    renderCustomers();

    updateSettings();
}


/* =========================================================
   خروج
========================================================= */

function logout() {

    const app =
        document.getElementById("appScreen");

    const auth =
        document.getElementById("authScreen");


    if (app) {
        app.style.display = "none";
    }


    if (auth) {
        auth.style.display = "block";
    }


    showLogin();
}


/* =========================================================
   منو
========================================================= */

function toggleMenu() {

    const menu =
        document.getElementById("mainMenu");


    if (!menu) {
        return;
    }


    if (
        menu.style.display === "none" ||
        menu.style.display === ""
    ) {

        menu.style.display = "block";

    } else {

        menu.style.display = "none";
    }
}


function closeMenu() {

    const menu =
        document.getElementById("mainMenu");

    if (menu) {
        menu.style.display = "none";
    }
}


/* =========================================================
   بخش‌ها
========================================================= */

function showSection(sectionName) {

    const sections =
        document.querySelectorAll(".section");


    sections.forEach(function(section) {

        section.style.display = "none";

    });


    const target =
        document.getElementById(sectionName);


    if (target) {

        target.style.display = "block";
    }


    closeMenu();


    if (sectionName === "dashboard") {
        updateDashboard();
    }


    if (sectionName === "properties") {
        renderProperties();
    }


    if (sectionName === "customers") {
        renderCustomers();
    }


    if (sectionName === "settings") {
        updateSettings();
    }
}


/* =========================================================
   داشبورد
========================================================= */

function updateDashboard() {

    const properties =
        getProperties();

    const customers =
        getCustomers();


    const propertyCount =
        document.getElementById(
            "propertyCount"
        );


    const customerCount =
        document.getElementById(
            "customerCount"
        );


    const availableCount =
        document.getElementById(
            "availableCount"
        );


    const specialCount =
        document.getElementById(
            "specialCount"
        );


    if (propertyCount) {

        propertyCount.textContent =
            toPersianNumber(
                properties.length
            );
    }


    if (customerCount) {

        customerCount.textContent =
            toPersianNumber(
                customers.length
            );
    }


    const available =
        properties.filter(function(property) {

            return (
                property.status === "موجود"
            );

        });


    if (availableCount) {

        availableCount.textContent =
            toPersianNumber(
                available.length
            );
    }


    const special =
        properties.filter(function(property) {

            return property.special === true;

        });


    if (specialCount) {

        specialCount.textContent =
            toPersianNumber(
                special.length
            );
    }


    renderLatestProperties();
}


function renderLatestProperties() {

    const container =
        document.getElementById(
            "latestProperties"
        );


    if (!container) {
        return;
    }


    const properties =
        getProperties()
            .slice()
            .sort(function(a, b) {

                return (
                    Number(b.createdAt || 0) -
                    Number(a.createdAt || 0)
                );

            })
            .slice(0, 5);


    if (properties.length === 0) {

        container.innerHTML =
            "<p>هنوز فایلی ثبت نشده است.</p>";

        return;
    }


    container.innerHTML =
        properties.map(
            propertyCardHTML
        ).join("");
}


/* =========================================================
   فرم ملک
========================================================= */

function openPropertyForm() {

    clearPropertyForm();


    const modal =
        document.getElementById(
            "propertyModal"
        );


    if (modal) {

        modal.style.display = "flex";

        modal.dataset.editingId = "";
    }
}


function clearPropertyForm() {

    setValue("propertyId", "");

    setValue("propertyArea", "");

    setValue("propertySize", "");

    setValue("propertyPrice", "");

    setValue("propertyRooms", "");

    setValue("propertyFloor", "");

    setValue("propertyAge", "");

    setValue("propertyDescription", "");


    setChecked(
        "propertyParking",
        false
    );

    setChecked(
        "propertyElevator",
        false
    );

    setChecked(
        "propertyStorage",
        false
    );

    setChecked(
        "propertySpecial",
        false
    );


    setValue(
        "propertyStatus",
        "موجود"
    );


    setValue(
        "propertyType",
        "آپارتمان"
    );
}


function closePropertyForm() {

    const modal =
        document.getElementById(
            "propertyModal"
        );

    if (modal) {

        modal.style.display = "none";

        modal.dataset.editingId = "";
    }
}


/* =========================================================
   ذخیره ملک
========================================================= */

function saveProperty() {

    const modal =
        document.getElementById(
            "propertyModal"
        );


    const editingId =
        modal
            ? modal.dataset.editingId
            : "";


    const property = {

        id:
            editingId ||
            generateId(),

        type:
            getValue("propertyType"),

        area:
            getValue("propertyArea"),

        size:
            normalizeNumber(
                getValue("propertySize")
            ),

        price:
            normalizeNumber(
                getValue("propertyPrice")
            ),

        rooms:
            normalizeNumber(
                getValue("propertyRooms")
            ),

        floor:
            getValue("propertyFloor"),

        age:
            normalizeNumber(
                getValue("propertyAge")
            ),

        parking:
            getChecked("propertyParking"),

        elevator:
            getChecked("propertyElevator"),

        storage:
            getChecked("propertyStorage"),

        special:
            getChecked("propertySpecial"),

        status:
            getValue("propertyStatus") ||
            "موجود",

        description:
            getValue("propertyDescription"),

        createdAt:
           
