"use strict";

/* =========================================================
   املاک هوشمند
   app.js
   نسخه 4.0
========================================================= */

const APP_CONFIG = {
    appName: "املاک هوشمند",
    version: "4.0.0",
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
        console.error("Load error:", error);
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
        console.error("Save error:", error);

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

    const element =
        document.getElementById(id);

    return element
        ? element.value.trim()
        : "";
}


function setValue(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.value =
            value === null ||
            value === undefined
                ? ""
                : value;
    }
}


function getChecked(id) {

    const element =
        document.getElementById(id);

    return element
        ? element.checked
        : false;
}


function setChecked(id, value) {

    const element =
        document.getElementById(id);

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
            "لطفاً قوانین و شرایط استفاده را بپذیرید."
        );

        return;
    }


    const oldUser = getUser();


    if (
        oldUser &&
        normalizePhone(oldUser.phone) === phone
    ) {

        alert(
            "این شماره قبلاً ثبت‌نام کرده است."
        );

        showLogin();

        setValue(
            "loginPhone",
            phone
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


    const saved =
        saveUser(user);


    if (!saved) {
        return;
    }


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


    const user =
        getUser();


    if (!user) {

        alert(
            "حسابی پیدا نشد. ابتدا ثبت‌نام کنید."
        );

        showRegister();

        setValue(
            "registerPhone",
            phone
        );

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

    const user =
        getUser();


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


    const saved =
        saveUser(user);


    if (!saved) {
        return;
    }


    alert(
        "اشتراک یک‌ساله با موفقیت فعال شد."
    );


    openApplication();
}


function pay() {

    const user =
        getUser();


    if (!user) {

        alert(
            "ابتدا ثبت‌نام کنید."
        );

        showRegister();

        return;
    }


    /*
       فعلاً پرداخت آزمایشی است.
       درگاه بانکی بعداً اضافه می‌شود.
    */

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

            return property.status === "موجود";

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
        properties
            .map(propertyCardHTML)
            .join("");
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


    const title =
        document.getElementById(
            "propertyModalTitle"
        );


    if (title) {
        title.textContent =
            "ثبت فایل جدید";
    }


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


    const area =
        getValue("propertyArea");


    const size =
        normalizeNumber(
            getValue("propertySize")
        );


    const price =
        normalizeNumber(
            getValue("propertyPrice")
        );


    if (!area) {

        alert(
            "لطفاً منطقه یا محله ملک را وارد کنید."
        );

        return;
    }


    if (!size || size <= 0) {

        alert(
            "لطفاً متراژ ملک را وارد کنید."
        );

        return;
    }


    if (!price || price <= 0) {

        alert(
            "لطفاً قیمت ملک را وارد کنید."
        );

        return;
    }


    const properties =
        getProperties();


    const existing =
        properties.find(function(property) {

            return property.id === editingId;

        });


    const property = {

        id:
            editingId ||
            generateId(),

        type:
            getValue("propertyType") ||
            "آپارتمان",

        area:
            area,

        size:
            size,

        price:
            price,

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
            existing
                ? existing.createdAt
                : Date.now(),

        updatedAt:
            Date.now()
    };


    let updatedProperties;


    if (editingId) {

        updatedProperties =
            properties.map(function(item) {

                return item.id === editingId
                    ? property
                    : item;

            });

    } else {

        updatedProperties =
            [
                property,
                ...properties
            ];
    }


    if (
        saveProperties(
            updatedProperties
        )
    ) {

        alert(
            editingId
                ? "فایل با موفقیت ویرایش شد."
                : "فایل با موفقیت ثبت شد."
        );


        closePropertyForm();

        renderProperties();

        updateDashboard();
    }
}


/* =========================================================
   کارت ملک
========================================================= */

function propertyCardHTML(property) {

    const features = [];


    if (property.parking) {
        features.push("🚗 پارکینگ");
    }


    if (property.elevator) {
        features.push("🛗 آسانسور");
    }


    if (property.storage) {
        features.push("📦 انباری");
    }


    return `
        <div class="property-card">

            <div class="property-card-header">

                <div>

                    <h3>
                        ${escapeHTML(
                            property.type || "ملک"
                        )}
                    </h3>

                    <span>
                        ${escapeHTML(
                            property.area || "-"
                        )}
                    </span>

                </div>

                ${
                    property.special
                        ? "<span>⭐ ویژه</span>"
                        : ""
                }

            </div>


            <div class="property-info">

                <div>
                    📐
                    ${toPersianNumber(
                        property.size || 0
                    )}
                    متر
                </div>

                <div>
                    💰
                    ${formatPrice(
                        property.price
                    )}
                    تومان
                </div>

                <div>
                    🛏️
                    ${toPersianNumber(
                        property.rooms || 0
                    )}
                    خواب
                </div>

                <div>
                    🏢 طبقه
                    ${escapeHTML(
                        property.floor || "-"
                    )}
                </div>

            </div>


            ${
                features.length
                    ? `
                    <div class="property-features">
                        ${features.join(" · ")}
                    </div>
                    `
                    : ""
            }


            ${
                property.description
                    ? `
                    <p class="property-description">
                        ${escapeHTML(
                            property.description
                        )}
                    </p>
                    `
                    : ""
            }


            <div class="property-status">
                وضعیت:
                <strong>
                    ${escapeHTML(
                        property.status || "موجود"
                    )}
                </strong>
            </div>


            <div class="card-actions">

                <button
                    class="secondary-button"
                    onclick="editProperty('${property.id}')"
                >
                    ✏️ ویرایش
                </button>

                <button
                    class="danger-button"
                    onclick="deleteProperty('${property.id}')"
                >
                    🗑️ حذف
                </button>

            </div>

        </div>
    `;
}


/* =========================================================
   نمایش و جستجوی ملک‌ها
========================================================= */

function renderProperties() {

    const container =
        document.getElementById(
            "propertyList"
        );


    if (!container) {
        return;
    }


    let properties =
        getProperties();


    const search =
        getValue("propertySearch")
            .toLowerCase();


    const type =
        getValue("filterType");


    const area =
        getValue("filterArea")
            .toLowerCase();


    const minSize =
        normalizeNumber(
            getValue("filterMinSize")
        );


    const maxSize =
        normalizeNumber(
            getValue("filterMaxSize")
        );


    const minPrice =
        normalizeNumber(
            getValue("filterMinPrice")
        );


    const maxPrice =
        normalizeNumber(
            getValue("filterMaxPrice")
        );


    const status =
        getValue("filterStatus");


    const special =
        getValue("filterSpecial");


    properties =
        properties.filter(function(property) {

            const text = (
                (property.type || "") +
                " " +
                (property.area || "") +
                " " +
                (property.description || "")
            ).toLowerCase();


            if (
                search &&
                !text.includes(search)
            ) {
                return false;
            }


            if (
                type &&
                property.type !== type
            ) {
                return false;
            }


            if (
                area &&
                !(property.area || "")
                    .toLowerCase()
                    .includes(area)
            ) {
                return false;
            }


            if (
                minSize &&
                Number(property.size || 0) < minSize
            ) {
                return false;
            }


            if (
                maxSize &&
                Number(property.size || 0) > maxSize
            ) {
                return false;
            }


            if (
                minPrice &&
                Number(property.price || 0) < minPrice
            ) {
                return false;
            }


            if (
                maxPrice &&
                Number(property.price || 0) > maxPrice
            ) {
                return false;
            }


            if (
                status &&
                property.status !== status
            ) {
                return false;
            }


            if (
                special &&
                String(property.special) !== special
            ) {
                return false;
            }


            return true;

        });


    const sort =
        getValue("propertySort") ||
        "newest";


    properties.sort(function(a, b) {

        switch (sort) {

            case "oldest":

                return (
                    Number(a.createdAt || 0) -
                    Number(b.createdAt || 0)
                );


            case "priceLow":

                return (
                    Number(a.price || 0) -
                    Number(b.price || 0)
                );


            case "priceHigh":

                return (
                    Number(b.price || 0) -
                    Number(a.price || 0)
                );


            case "sizeLow":

                return (
                    Number(a.size || 0) -
                    Number(b.size || 0)
                );


            case "sizeHigh":

                return (
                    Number(b.size || 0) -
                    Number(a.size || 0)
                );


            case "newest":

            default:

                return (
                    Number(b.createdAt || 0) -
                    Number(a.createdAt || 0)
                );
        }

    });


    const resultCount =
        document.getElementById(
            "propertyResultCount"
        );


    if (resultCount) {

        resultCount.textContent =
            toPersianNumber(
                properties.length
            ) +
            " فایل";
    }


    if (properties.length === 0) {

        container.innerHTML =
            "<p>فایلی با این مشخصات پیدا نشد.</p>";

        return;
    }


    container.innerHTML =
        properties
            .map(propertyCardHTML)
            .join("");
}


/* =========================================================
   ویرایش ملک
========================================================= */

function editProperty(id) {

    const property =
        getProperties().find(
            function(item) {
                return item.id === id;
            }
        );


    if (!property) {
        return;
    }


    setValue(
        "propertyId",
        property.id
    );

    setValue(
        "propertyType",
        property.type
    );

    setValue(
        "propertyArea",
        property.area
    );

    setValue(
        "propertySize",
        property.size
    );

    setValue(
        "propertyPrice",
        property.price
    );

    setValue(
        "propertyRooms",
        property.rooms
    );

    setValue(
        "propertyFloor",
        property.floor
    );

    setValue(
        "propertyAge",
        property.age
    );

    setChecked(
        "propertyParking",
        property.parking
    );

    setChecked(
        "propertyElevator",
        property.elevator
    );

    setChecked(
        "propertyStorage",
        property.storage
    );

    setChecked(
        "propertySpecial",
        property.special
    );

    setValue(
        "propertyStatus",
        property.status
    );

    setValue(
        "propertyDescription",
        property.description
    );


    const modal =
        document.getElementById(
            "propertyModal"
        );


    const title =
        document.getElementById(
            "propertyModalTitle"
        );


    if (title) {
        title.textContent =
            "ویرایش فایل";
    }


    if (modal) {

        modal.dataset.editingId =
            property.id;

        modal.style.display =
            "flex";
    }
}


/* =========================================================
   حذف ملک
========================================================= */

function deleteProperty(id) {

    const confirmed =
        confirm(
            "آیا از حذف این فایل مطمئن هستید؟"
        );


    if (!confirmed) {
        return;
    }


    const properties =
        getProperties()
            .filter(function(property) {

                return property.id !== id;

            });


    saveProperties(properties);

    renderProperties();

    updateDashboard();
}


/* =========================================================
   پاک کردن فیلترها
========================================================= */

function resetFilters() {

    setValue("propertySearch", "");

    setValue("filterType", "");

    setValue("filterArea", "");

    setValue("filterMinSize", "");

    setValue("filterMaxSize", "");

    setValue("filterMinPrice", "");

    setValue("filterMaxPrice", "");

    setValue("filterStatus", "");

    setValue("filterSpecial", "");

    setValue("propertySort", "newest");


    renderProperties();
}


/* =========================================================
   فرم مشتری
========================================================= */

function openCustomerForm() {

    clearCustomerForm();


    const modal =
        document.getElementById(
            "customerModal"
        );


    const title =
        document.getElementById(
            "customerModalTitle"
        );


    if (title) {
        title.textContent =
            "ثبت مشتری جدید";
    }


    if (modal) {

        modal.style.display =
            "flex";

        modal.dataset.editingId =
            "";
    }
}


function clearCustomerForm() {

    setValue("customerId", "");

    setValue("customerName", "");

    setValue("customerPhone", "");

    setValue("customerArea", "");

    setValue("customerMinSize", "");

    setValue("customerMaxSize", "");

    setValue("customerMinPrice", "");

    setValue("customerMaxPrice", "");

    setValue("customerRooms", "");

    setValue("customerAge", "");

    setValue("customerDescription", "");


    setValue(
        "customerType",
        "خرید"
    );


    setChecked(
        "customerParking",
        false
    );

    setChecked(
        "customerElevator",
        false
    );

    setChecked(
        "customerStorage",
        false
    );
}


function closeCustomerForm() {

    const modal =
        document.getElementById(
            "customerModal"
        );


    if (modal) {

        modal.style.display =
            "none";

        modal.dataset.editingId =
            "";
    }
}


/* =========================================================
   ذخیره مشتری
========================================================= */

function saveCustomer() {

    const name =
        getValue("customerName");


    const phone =
        normalizePhone(
            getValue("customerPhone")
        );


    if (name.length < 2) {

        alert(
            "لطفاً نام مشتری را وارد کنید."
        );

        return;
    }


    if (
        phone &&
        !isValidPhone(phone)
    ) {

        alert(
            "شماره موبایل مشتری صحیح نیست."
        );

        return;
    }


    const modal =
        document.getElementById(
            "customerModal"
        );


    const editingId =
        modal
            ? modal.dataset.editingId
            : "";


    const customers =
        getCustomers();


    const existing =
        customers.find(function(customer) {

            return customer.id === editingId;

        });


    const customer = {

        id:
            editingId ||
            generateId(),

        name:
            name,

        phone:
            phone,

        type:
            getValue("customerType") ||
            "خرید",

        area:
            getValue("customerArea"),

        minSize:
            normalizeNumber(
                getValue("customerMinSize")
            ),

        maxSize:
            normalizeNumber(
                getValue("customerMaxSize")
            ),

        minPrice:
            normalizeNumber(
                getValue("customerMinPrice")
            ),

        maxPrice:
            normalizeNumber(
                getValue("customerMaxPrice")
            ),

        rooms:
            normalizeNumber(
                getValue("customerRooms")
            ),

        age:
            normalizeNumber(
                getValue("customerAge")
            ),

        parking:
            getChecked("customerParking"),

        elevator:
            getChecked("customerElevator"),

        storage:
            getChecked("customerStorage"),

        description:
            getValue("customerDescription"),

        createdAt:
            existing
                ? existing.createdAt
                : Date.now(),

        updatedAt:
            Date.now()
    };


    let updatedCustomers;


    if (editingId) {

        updatedCustomers =
            customers.map(function(item) {

                return item.id === editingId
                    ? customer
                    : item;

            });

    } else {

        updatedCustomers =
            [
                customer,
                ...customers
            ];
    }


    if (
        saveCustomers(
            updatedCustomers
        )
    ) {

        alert(
            editingId
                ? "مشتری با موفقیت ویرایش شد."
                : "مشتری با موفقیت ثبت شد."
        );


        closeCustomerForm();

        renderCustomers();

        updateDashboard();
    }
}


/* =========================================================
   کارت مشتری
========================================================= */

function customerCardHTML(customer) {

    const needs = [];


    if (customer.area) {

        needs.push(
            "📍 " +
            escapeHTML(customer.area)
        );
    }


    if (
        customer.minSize ||
        customer.maxSize
    ) {

        needs.push(
            "📐 " +
            toPersianNumber(
                customer.minSize || 0
            ) +
            " تا " +
            toPersianNumber(
                customer.maxSize || 0
            ) +
            " متر"
        );
    }


    if (
        customer.minPrice ||
        customer.maxPrice
    ) {

        needs.push(
            "💰 بودجه " +
            formatPrice(
                customer.minPrice
            ) +
            " تا " +
            formatPrice(
                customer.maxPrice
            )
        );
    }


    return `
        <div class="customer-card">

            <div class="customer-card-header">

                <div>

                    <h3>
                        ${escapeHTML(
                            customer.name
                        )}
                    </h3>

                    <span>
                        ${escapeHTML(
                            customer.type || "خرید"
                        )}
                    </span>

                </div>

            </div>


            ${
                customer.phone
                    ? `
                    <p>
                        📱
                        ${escapeHTML(
                            customer.phone
                        )}
                    </p>
                    `
                    : ""
            }


            <div class="customer-needs">

                ${
                    needs.length
                        ? needs.join("<br>")
                        : "نیاز خاصی ثبت نشده است."
                }

            </div>


            <div class="customer-features">

                ${
                    customer.parking
                        ? "🚗 پارکینگ "
                        : ""
                }

                ${
                    customer.elevator
                        ? "🛗 آسانسور "
                        : ""
                }

                ${
                    customer.storage
                        ? "📦 انباری "
                        : ""
                }

            </div>


            ${
                customer.description
                    ? `
                    <p>
                        ${escapeHTML(
                            customer.description
                        )}
                    </p>
                    `
                    : ""
            }


            <div class="card-actions">

                <button
                    class="secondary-button"
                    onclick="editCustomer('${customer.id}')"
                >
                    ✏️ ویرایش
                </button>

                <button
                    class="danger-button"
                    onclick="deleteCustomer('${customer.id}')"
                >
                    🗑️ حذف
                </button>

            </div>

        </div>
    `;
}


/* =========================================================
   نمایش مشتری‌ها
========================================================= */

function renderCustomers() {

    const container =
        document.getElementById(
            "customerList"
        );


    if (!container) {
        return;
    }


    const search =
        getValue("customerSearch")
            .toLowerCase();


    let customers =
        getCustomers();


    if (search) {

        customers =
            customers.filter(
                function(customer) {

                    const text =
                        (
                            (customer.name || "") +
                            " " +
                            (customer.phone || "") +
                            " " +
                            (customer.area || "") +
                            " " +
                            (customer.description || "")
                        )
                        .toLowerCase();


                    return text.includes(search);
                }
            );
    }


    customers.sort(function(a, b) {

        return (
            Number(b.createdAt || 0) -
            Number(a.createdAt || 0)
        );

    });


    if (customers.length === 0) {

        container.innerHTML =
            "<p>هنوز مشتری‌ای ثبت نشده است.</p>";

        return;
    }


    container.innerHTML =
        customers
            .map(customerCardHTML)
            .join("");
}


/* =========================================================
   ویرایش مشتری
========================================================= */

function editCustomer(id) {

    const customer =
        getCustomers().find(
            function(item) {

                return item.id === id;

            }
        );


    if (!customer) {
        return;
    }


    setValue(
        "customerId",
        customer.id
    );

    setValue(
        "customerName",
        customer.name
    );

    setValue(
        "customerPhone",
        customer.phone
    );

    setValue(
        "customerType",
        customer.type
    );

    setValue(
        "customerArea",
        customer.area
    );

    setValue(
        "customerMinSize",
        customer.minSize
    );

    setValue(
        "customerMaxSize",
        customer.maxSize
    );

    setValue(
        "customerMinPrice",
        customer.minPrice
    );

    setValue(
        "customerMaxPrice",
        customer.maxPrice
    );

    setValue(
        "customerRooms",
        customer.rooms
    );

    setValue(
        "customerAge",
        customer.age
    );

    setChecked(
        "customerParking",
        customer.parking
    );

    setChecked(
        "customerElevator",
        customer.elevator
    );

    setChecked(
        "customerStorage",
        customer.storage
    );

    setValue(
        "customerDescription",
        customer.description
    );


    const modal =
        document.getElementById(
            "customerModal"
        );


    const title =
        document.getElementById(
            "customerModalTitle"
        );


    if (title) {

        title.textContent =
            "ویرایش مشتری";
    }


    if (modal) {

        modal.dataset.editingId =
            customer.id;

        modal.style.display =
            "flex";
    }
}


/* =========================================================
   حذف مشتری
========================================================= */

function deleteCustomer(id) {

    const confirmed =
        confirm(
            "آیا از حذف این مشتری مطمئن هستید؟"
        );


    if (!confirmed) {
        return;
    }


    const customers =
        getCustomers()
            .filter(function(customer) {

                return customer.id !== id;

            });


    saveCustomers(customers);

    renderCustomers();

    updateDashboard();
}


/* =========================================================
   تنظیمات
========================================================= */

function updateSettings() {

    const user =
        getUser();


    const accountPhone =
        document.getElementById(
            "accountPhone"
        );


    const subscriptionStatus =
        document.getElementById(
            "subscriptionStatus"
        );


    const subscriptionDate =
        document.getElementById(
            "subscriptionDate"
        );


    if (!user) {

        if (accountPhone) {
            accountPhone.textContent = "-";
        }

        if (subscriptionStatus) {
            subscriptionStatus.textContent = "-";
        }

        if (subscriptionDate) {
            subscriptionDate.textContent = "-";
        }

        return;
    }


    if (accountPhone) {

        accountPhone.textContent =
            user.phone || "-";
    }


    const valid =
        isSubscriptionValid(user);


    if (subscriptionStatus) {

        subscriptionStatus.textContent =
            valid
                ? "فعال ✅"
                : "منقضی شده ❌";
    }


    if (subscriptionDate) {

        if (user.subscriptionUntil) {

            const date =
                new Date(
                    user.subscriptionUntil
                );


            subscriptionDate.textContent =
                date.toLocaleDateString(
                    "fa-IR"
                );

        } else {

            subscriptionDate.textContent =
                "-";
        }
    }
}


/* =========================================================
   پشتیبان‌گیری
========================================================= */

function backupData() {

    const data = {

        appName:
            APP_CONFIG.appName,

        version:
            APP_CONFIG.version,

        exportedAt:
            new Date().toISOString(),

        user:
            getUser(),

        properties:
            getProperties(),

        customers:
            getCustomers()
    };


    const json =
        JSON.stringify(
            data,
            null,
            2
        );


    const blob =
        new Blob(
            [json],
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
        "amlak-smart-backup.json";


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    URL.revokeObjectURL(url);


    alert(
        "نسخه پشتیبان آماده شد."
    );
}


/* =========================================================
   بازیابی اطلاعات
========================================================= */

function restoreData(event) {

    const file =
        event.target.files &&
        event.target.files[0];


    if (!file) {
        return;
    }


    const reader =
        new FileReader();


    reader.onload =
        function(e) {

            try {

                const data =
                    JSON.parse(
                        e.target.result
                    );


                if (
                    !data ||
                    typeof data !== "object"
                ) {

                    throw new Error(
                        "Invalid backup"
                    );
                }


                if (
                    Array.isArray(
                        data.properties
                    )
                ) {

                    saveProperties(
                        data.properties
                    );
                }


                if (
                    Array.isArray(
                        data.customers
                    )
                ) {

                    saveCustomers(
                        data.customers
                    );
                }


                if (data.user) {

                    saveUser(
                        data.user
                    );
                }


                alert(
                    "اطلاعات با موفقیت بازیابی شد."
                );


                updateDashboard();

                renderProperties();

                renderCustomers();

                updateSettings();


            } catch (error) {

                console.error(error);

                alert(
                    "فایل پشتیبان معتبر نیست."
                );
            }
        };


    reader.readAsText(file);


    event.target.value = "";
}


/* =========================================================
   رویدادها
========================================================= */

function setupEvents() {

    const propertySearch =
        document.getElementById(
            "propertySearch"
        );


    if (propertySearch) {

        propertySearch.addEventListener(
            "input",
            renderProperties
        );
    }


    const filterIds = [

        "filterType",

        "filterArea",

        "filterMinSize",

        "filterMaxSize",

        "filterMinPrice",

        "filterMaxPrice",

        "filterStatus",

        "filterSpecial",

        "propertySort"

    ];


    filterIds.forEach(function(id) {

        const element =
            document.getElementById(id);


        if (element) {

            element.addEventListener(
                "input",
                renderProperties
            );


            element.addEventListener(
                "change",
                renderProperties
            );
        }

    });


    const customerSearch =
        document.getElementById(
            "customerSearch"
        );


    if (customerSearch) {

        customerSearch.addEventListener(
            "input",
            renderCustomers
        );
    }


    window.addEventListener(
        "click",
        function(event) {

            const propertyModal =
                document.getElementById(
                    "propertyModal"
                );


            const customerModal =
                document.getElementById(
                    "customerModal"
                );


            if (
                event.target ===
                propertyModal
            ) {

                closePropertyForm();
            }


            if (
                event.target ===
                customerModal
            ) {

                closeCustomerForm();
            }

        }
    );
}


/* =========================================================
   شروع برنامه
========================================================= */

function initApp() {

    setupEvents();


    const user =
        getUser();


    if (
        user &&
        isSubscriptionValid(user)
    ) {

        /*
           اگر کاربر قبلاً اشتراک فعال داشته باشد،
           برنامه مستقیماً باز می‌شود.
        */

        openApplication();

    } else {

        const app =
            document.getElementById(
                "appScreen"
            );


        const auth =
            document.getElementById(
                "authScreen"
            );


        if (app) {
            app.style.display = "none";
        }


        if (auth) {
            auth.style.display = "block";
        }


        showLogin();
    }
}


/* =========================================================
   اجرای اولیه
========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initApp
    );

} else {

    initApp();
}


/* =========================================================
   توابع عمومی برای HTML
========================================================= */

window.register =
    register;

window.login =
    login;

window.pay =
    pay;

window.renewSubscription =
    renewSubscription;

window.logout =
    logout;

window.showLogin =
    showLogin;

window.showRegister =
    showRegister;

window.showPayment =
    showPayment;

window.toggleMenu =
    toggleMenu;

window.showSection =
    showSection;

window.openPropertyForm =
    openPropertyForm;

window.closePropertyForm =
    closePropertyForm;

window.saveProperty =
    saveProperty;

window.editProperty =
    editProperty;

window.deleteProperty =
    deleteProperty;

window.resetFilters =
    resetFilters;

window.openCustomerForm =
    openCustomerForm;

window.closeCustomerForm =
    closeCustomerForm;

window.saveCustomer =
    saveCustomer;

window.editCustomer =
    editCustomer;

window.deleteCustomer =
    deleteCustomer;

window.backupData =
    backupData;

window.restoreData =
    restoreData;
