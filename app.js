/* =========================================================
   املاک هوشمند
   app.js - نسخه 2.0
   هماهنگ با index.html
========================================================= */

"use strict";

/* =========================
   تنظیمات برنامه
========================= */

const APP_CONFIG = {
    appName: "املاک هوشمند",
    version: "2.0.0",
    subscriptionPrice: 99000,
    subscriptionDays: 365
};

const STORAGE_KEYS = {
    user: "realEstate_user",
    properties: "realEstate_properties",
    customers: "realEstate_customers"
};


/* =========================
   ابزارهای عمومی
========================= */

function loadJSON(key, defaultValue) {
    try {
        const data = localStorage.getItem(key);

        if (!data) {
            return defaultValue;
        }

        return JSON.parse(data);
    } catch (error) {
        console.error("خطا در خواندن اطلاعات:", error);
        return defaultValue;
    }
}

function saveJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error("خطا در ذخیره اطلاعات:", error);
        alert("ذخیره اطلاعات انجام نشد.");
        return false;
    }
}

function generateId() {
    return Date.now().toString() + Math.random().toString(36).substring(2, 8);
}

function normalizeNumber(value) {
    if (value === null || value === undefined) {
        return 0;
    }

    let text = String(value);

    const persianNumbers = "۰۱۲۳۴۵۶۷۸۹";
    const arabicNumbers = "٠١٢٣٤٥٦٧٨٩";

    text = text.replace(/[۰-۹]/g, function (char) {
        return persianNumbers.indexOf(char);
    });

    text = text.replace(/[٠-٩]/g, function (char) {
        return arabicNumbers.indexOf(char);
    });

    text = text.replace(/,/g, "");
    text = text.replace(/٬/g, "");
    text = text.replace(/٫/g, ".");

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
    return String(value)
        .replace(/\d/g, function (digit) {
            return "۰۱۲۳۴۵۶۷۸۹"[digit];
        });
}

function normalizePhone(phone) {
    let value = String(phone || "").trim();

    value = value.replace(/[۰-۹]/g, function (char) {
        return "۰۱۲۳۴۵۶۷۸۹".indexOf(char);
    });

    value = value.replace(/[٠-٩]/g, function (char) {
        return "٠١٢٣٤٥٦٧٨٩".indexOf(char);
    });

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
    const value = normalizePhone(phone);

    return /^09\d{9}$/.test(value);
}

function escapeHTML(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   اطلاعات ذخیره شده
========================= */

function getUser() {
    return loadJSON(STORAGE_KEYS.user, null);
}

function getProperties() {
    return loadJSON(STORAGE_KEYS.properties, []);
}

function getCustomers() {
    return loadJSON(STORAGE_KEYS.customers, []);
}

function saveUser(user) {
    return saveJSON(STORAGE_KEYS.user, user);
}

function saveProperties(properties) {
    return saveJSON(STORAGE_KEYS.properties, properties);
}

function saveCustomers(customers) {
    return saveJSON(STORAGE_KEYS.customers, customers);
}


/* =========================
   صفحات ورود / ثبت نام
========================= */

function hideAuthPages() {
    const loginPage = document.getElementById("loginPage");
    const registerPage = document.getElementById("registerPage");
    const paymentPage = document.getElementById("paymentPage");

    if (loginPage) {
        loginPage.style.display = "none";
    }

    if (registerPage) {
        registerPage.style.display = "none";
    }

    if (paymentPage) {
        paymentPage.style.display = "none";
    }
}

function showLogin() {
    hideAuthPages();

    const loginPage = document.getElementById("loginPage");

    if (loginPage) {
        loginPage.style.display = "block";
    }
}

function showRegister() {
    hideAuthPages();

    const registerPage = document.getElementById("registerPage");

    if (registerPage) {
        registerPage.style.display = "block";
    }
}

function showPayment() {
    hideAuthPages();

    const paymentPage = document.getElementById("paymentPage");

    if (paymentPage) {
        paymentPage.style.display = "block";
    }
}


/* =========================
   ثبت نام
========================= */

function register() {
    const nameInput = document.getElementById("registerName");
    const phoneInput = document.getElementById("registerPhone");
    const termsInput = document.getElementById("terms");

    if (!nameInput || !phoneInput) {
        alert("فرم ثبت‌نام پیدا نشد.");
        return;
    }

    const name = nameInput.value.trim();
    const phone = normalizePhone(phoneInput.value);

    if (name.length < 2) {
        alert("لطفاً نام خود را وارد کنید.");
        nameInput.focus();
        return;
    }

    if (!isValidPhone(phone)) {
        alert("شماره موبایل صحیح نیست.\nمثال: 09123456789");
        phoneInput.focus();
        return;
    }

    if (termsInput && !termsInput.checked) {
        alert("لطفاً قوانین و شرایط را تأیید کنید.");
        return;
    }

    const user = {
        id: generateId(),
        name: name,
        phone: phone,
        subscriptionUntil: null,
        createdAt: new Date().toISOString()
    };

    if (!saveUser(user)) {
        return;
    }

    alert("ثبت‌نام با موفقیت انجام شد.");

    showPayment();
}


/* =========================
   ورود
========================= */

function login() {
    const phoneInput = document.getElementById("loginPhone");

    if (!phoneInput) {
        alert("فرم ورود پیدا نشد.");
        return;
    }

    const phone = normalizePhone(phoneInput.value);

    if (!isValidPhone(phone)) {
        alert("شماره موبایل صحیح نیست.\nمثال: 09123456789");
        phoneInput.focus();
        return;
    }

    const user = getUser();

    if (!user) {
        alert("حسابی برای این شماره وجود ندارد. ابتدا ثبت‌نام کنید.");
        showRegister();
        return;
    }

    if (normalizePhone(user.phone) !== phone) {
        alert("این شماره با حساب ثبت‌شده مطابقت ندارد.");
        return;
    }

    if (!isSubscriptionValid(user)) {
        showPayment();
        return;
    }

    openApplication();
}


/* =========================
   اشتراک
========================= */

function isSubscriptionValid(user) {
    if (!user || !user.subscriptionUntil) {
        return false;
    }

    const expiry = new Date(user.subscriptionUntil).getTime();

    return expiry > Date.now();
}

function activateSubscription() {
    const user = getUser();

    if (!user) {
        showRegister();
        return;
    }

    const expiry = new Date();

    expiry.setDate(
        expiry.getDate() + APP_CONFIG.subscriptionDays
    );

    user.subscriptionUntil = expiry.toISOString();

    saveUser(user);

    alert("اشتراک شما با موفقیت فعال شد.");

    openApplication();
}

function pay() {
    /*
       فعلاً پرداخت آزمایشی است.
       بعداً می‌توان درگاه واقعی را به این قسمت وصل کرد.
    */

    const user = getUser();

    if (!user) {
        alert("ابتدا ثبت‌نام کنید.");
        showRegister();
        return;
    }

    activateSubscription();
}

function renewSubscription() {
    activateSubscription();
}


/* =========================
   باز کردن برنامه
========================= */

function openApplication() {
    const authScreen = document.getElementById("authScreen");
    const appScreen = document.getElementById("appScreen");

    if (authScreen) {
        authScreen.style.display = "none";
    }

    if (appScreen) {
        appScreen.style.display = "block";
    }

    updateAll();
}

function logout() {
    const appScreen = document.getElementById("appScreen");
    const authScreen = document.getElementById("authScreen");

    if (appScreen) {
        appScreen.style.display = "none";
    }

    if (authScreen) {
        authScreen.style.display = "block";
    }

    showLogin();
}


/* =========================
   منوی اصلی
========================= */

function toggleMenu() {
    const menu = document.getElementById("mainMenu");

    if (!menu) {
        return;
    }

    if (menu.style.display === "none" || menu.style.display === "") {
        menu.style.display = "block";
    } else {
        menu.style.display = "none";
    }
}

function closeMenu() {
    const menu = document.getElementById("mainMenu");

    if (menu) {
        menu.style.display = "none";
    }
}


/* =========================
   بخش‌های برنامه
========================= */

function showSection(sectionName) {
    const sections = document.querySelectorAll(".section");

    sections.forEach(function (section) {
        section.style.display = "none";
    });

    const target = document.getElementById(sectionName);

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


/* =========================
   داشبورد
========================= */

function updateDashboard() {
    const properties = getProperties();
    const customers = getCustomers();

    const propertyCount = document.getElementById("propertyCount");
    const customerCount = document.getElementById("customerCount");
    const availableCount = document.getElementById("availableCount");
    const specialCount = document.getElementById("specialCount");
    const latestProperties = document.getElementById("latestProperties");

    if (propertyCount) {
        propertyCount.textContent = toPersianNumber(properties.length);
    }

    if (customerCount) {
        customerCount.textContent = toPersianNumber(customers.length);
    }

    const available = properties.filter(function (item) {
        return item.status === "موجود" ||
               item.status === "available" ||
               item.status === "فروش";
    });

    if (availableCount) {
        availableCount.textContent = toPersianNumber(available.length);
    }

    const special = properties.filter(function (item) {
        return item.special && String(item.special).trim() !== "";
    });

    if (specialCount) {
        specialCount.textContent = toPersianNumber(special.length);
    }

    if (latestProperties) {
        const latest = properties
            .slice()
            .sort(function (a, b) {
                return Number(b.createdAt || 0) -
                       Number(a.createdAt || 0);
            })
            .slice(0, 5);

        if (latest.length === 0) {
            latestProperties.innerHTML =
                "<p>هنوز فایلی ثبت نشده است.</p>";
            return;
        }

        latestProperties.innerHTML = latest.map(function (item) {
            return propertyCardHTML(item);
        }).join("");
    }
}


/* =========================
   فایل‌های ملک
========================= */

function propertyCardHTML(property) {
    const title =
        property.type ||
        "ملک";

    const size =
        property.size ?
        toPersianNumber(property.size) + " متر" :
        "متراژ نامشخص";

    const price =
        property.totalPrice ?
        formatPrice(property.totalPrice) + " تومان" :
        "قیمت ثبت نشده";

    const rooms =
        property.rooms ?
        toPersianNumber(property.rooms) + " خواب" :
        "";

    const status =
        property.status || "موجود";

    return `
        <div class="property-card" data-id="${escapeHTML(property.id)}">
            <div class="property-card-content">
                <h3>${escapeHTML(title)}</h3>

                <p>
                    <strong>متراژ:</strong>
                    ${escapeHTML(size)}
                </p>

                <p>
                    <strong>قیمت:</strong>
                    ${escapeHTML(price)}
                </p>

                <p>
                    <strong>خواب:</strong>
                    ${escapeHTML(rooms)}
                </p>

                <p>
                    <strong>وضعیت:</strong>
                    ${escapeHTML(status)}
                </p>

                ${
                    property.description
                    ? `<p>${escapeHTML(property.description)}</p>`
                    : ""
                }

                <div class="property-actions">
                    <button type="button"
                        onclick="editProperty('${property.id}')">
                        ویرایش
                    </button>

                    <button type="button"
                        onclick="deleteProperty('${property.id}')">
                        حذف
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderProperties() {
    const container =
        document.getElementById("propertiesList") ||
        document.getElementById("propertyList") ||
        document.getElementById("propertiesContainer");

    if (!container) {
        return;
    }

    let properties = getProperties();

    const searchInput =
        document.getElementById("propertySearch");

    const typeFilter =
        document.getElementById("propertyTypeFilter");

    const statusFilter =
        document.getElementById("propertyStatusFilter");

    const sortSelect =
        document.getElementById("propertySort");

    const search =
        searchInput ?
        searchInput.value.trim().toLowerCase() :
        "";

    if (search) {
        properties = properties.filter(function (item) {
            const text = JSON.stringify(item).toLowerCase();
            return text.includes(search);
        });
    }

    if (typeFilter && typeFilter.value) {
        properties = properties.filter(function (item) {
            return item.type === typeFilter.value;
        });
    }

    if (statusFilter && statusFilter.value) {
        properties = properties.filter(function (item) {
            return item.status === statusFilter.value;
        });
    }

    if (sortSelect) {
        const sort = sortSelect.value;

        if (sort === "newest") {
            properties.sort(function (a, b) {
                return Number(b.createdAt || 0) -
                       Number(a.createdAt || 0);
            });
        }

        if (sort === "oldest") {
            properties.sort(function (a, b) {
                return Number(a.createdAt || 0) -
                       Number(b.createdAt || 0);
            });
        }

        if (sort === "priceLow") {
            properties.sort(function (a, b) {
                return normalizeNumber(a.totalPrice) -
                       normalizeNumber(b.totalPrice);
            });
        }

        if (sort === "priceHigh") {
            properties.sort(function (a, b) {
                return normalizeNumber(b.totalPrice) -
                       normalizeNumber(a.totalPrice);
            });
        }

        if (sort === "sizeLow") {
            properties.sort(function (a, b) {
                return normalizeNumber(a.size) -
                       normalizeNumber(b.size);
            });
        }

        if (sort === "sizeHigh") {
            properties.sort(function (a, b) {
                return normalizeNumber(b.size) -
                       normalizeNumber(a.size);
            });
        }
    }

    if (properties.length === 0) {
        container.innerHTML =
            "<p>فایلی پیدا نشد.</p>";
        return;
    }

    container.innerHTML = properties
        .map(function (property) {
            return propertyCardHTML(property);
        })
        .join("");
}


/* =========================
   افزودن ملک
========================= */

function getInputValue(id) {
    const element = document.getElementById(id);

    if (!element) {
        return "";
    }

    return element.value.trim();
}

function getChecked(id) {
    const element = document.getElementById(id);

    return element ? element.checked : false;
}

function addProperty() {
    const type = getInputValue("propertyType");
    const area = getInputValue("propertyArea");
    const size = getInputValue("propertySize");
    const totalPrice = getInputValue("propertyPrice");
    const rooms = getInputValue("propertyRooms");
    const floor = getInputValue("propertyFloor");
    const buildYear = getInputValue("propertyBuildYear");

    const parking = getChecked("propertyParking");
    const elevator = getChecked("propertyElevator");
    const storage = getChecked("propertyStorage");

    const special = getInputValue("propertySpecial");
    const status = getInputValue("propertyStatus");
    const description = getInputValue("propertyDescription");

    if (!type) {
        alert("نوع ملک را انتخاب کنید.");
        return;
    }

    if (!size) {
        alert("متراژ ملک را وارد کنید.");
        return;
    }

    const properties = getProperties();

    const property = {
        id: generateId(),
        type: type,
        area: area,
        size: normalizeNumber(size),
        totalPrice: normalizeNumber(totalPrice),
        rooms: normalizeNumber(rooms),
        floor: floor,
        buildYear: buildYear,
        parking: parking,
        elevator: elevator,
        storage: storage,
        special: special,
        status: status || "موجود",
        description: description,
        createdAt: Date.now()
    };

    properties.push(property);

    saveProperties(properties);

    alert("فایل ملک با موفقیت ثبت شد.");

    closePropertyModal();

    clearPropertyForm();

    renderProperties();

    updateDashboard();
}


/* =========================
   ویرایش ملک
========================= */

function editProperty(id) {
    const properties = getProperties();

    const property = properties.find(function (item) {
        return String(item.id) === String(id);
    });

    if (!property) {
        alert("فایل ملک پیدا نشد.");
        return;
    }

    setInputValue("propertyType", property.type);
    setInputValue("propertyArea", property.area);
    setInputValue("propertySize", property.size);
    setInputValue("propertyPrice", property.totalPrice);
    setInputValue("propertyRooms", property.rooms);
    setInputValue("propertyFloor", property.floor);
    setInputValue("propertyBuildYear", property.buildYear);
    setInputValue("propertySpecial", property.special);
    setInputValue("propertyStatus", property.status);
    setInputValue("propertyDescription", property.description);

    setChecked("propertyParking", property.parking);
    setChecked("propertyElevator", property.elevator);
    setChecked("propertyStorage", property.storage);

    const modal = document.getElementById("propertyModal");

    if (modal) {
        modal.dataset.editingId = property.id;
        modal.style.display = "flex";
    }
}

function updateProperty() {
    const modal = document.getElementById("propertyModal");

    if (!modal || !modal.dataset.editingId) {
        addProperty();
        return;
    }

    const id = modal.dataset.editingId;

    let properties = getProperties();

    const index = properties.findIndex(function (item) {
        return String(item.id) === String(id);
    });

    if (index === -1) {
        alert("ملک پیدا نشد.");
        return;
    }

    properties[index] = {
        ...properties[index],

        type: getInputValue("propertyType"),
        area: getInputValue("propertyArea"),
        size: normalizeNumber(getInputValue("propertySize")),
        totalPrice: normalizeNumber(getInputValue("propertyPrice")),
        rooms: normalizeNumber(getInputValue("propertyRooms")),
        floor: getInputValue("propertyFloor"),
        buildYear: getInputValue("propertyBuildYear"),

        parking: getChecked("propertyParking"),
        elevator: getChecked("propertyElevator"),
        storage: getChecked("propertyStorage"),

        special: getInputValue("propertySpecial"),
        status: getInputValue("propertyStatus") || "موجود",
        description: getInputValue("propertyDescription")
    };

    saveProperties(properties);

    alert("اطلاعات ملک ویرایش شد.");

    delete modal.dataset.editingId;

    closePropertyModal();

    clearPropertyForm();

    renderProperties();

    updateDashboard();
}


/* =========================
   حذف ملک
========================= */

function deleteProperty(id) {
    const properties = getProperties();

    const confirmed =
        confirm("آیا از حذف این فایل اطمینان دارید؟");

    if (!confirmed) {
        return;
    }

    const newProperties = properties.filter(function (item) {
        return String(item.id) !== String(id);
    });

    saveProperties(newProperties);

    renderProperties();

    updateDashboard();
}


/* =========================
   فرم ملک
========================= */

function clearPropertyForm() {
    const ids = [
        "propertyType",
        "propertyArea",
        "propertySize",
        "propertyPrice",
        "propertyRooms",
        "propertyFloor",
        "propertyBuildYear",
        "propertySpecial",
        "propertyStatus",
        "propertyDescription"
    ];

    ids.forEach(function (id) {
        setInputValue(id, "");
    });

    setChecked("propertyParking", false);
    setChecked("propertyElevator", false);
    setChecked("propertyStorage", false);

    const modal = document.getElementById("propertyModal");

    if (modal) {
        delete modal.dataset.editingId;
    }
}

function setInputValue(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.value =
            value === null ||
            value === undefined
                ? ""
                : value;
    }
}

function setChecked(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.checked = Boolean(value);
    }
}

function openPropertyModal() {
    clearPropertyForm();

    const modal = document.getElementById("propertyModal");

    if (modal) {
        modal.style.display = "flex";
    }
}

function closePropertyModal() {
    const modal = document.getElementById("propertyModal");

    if (modal) {
        modal.style.display = "none";
        delete modal.dataset.editingId;
    }
}


/* =========================
   مشتریان
========================= */

function customerCardHTML(customer) {
    return `
        <div class="customer-card" data-id="${escapeHTML(customer.id)}">

            <h3>
                ${escapeHTML(customer.name || "بدون نام")}
            </h3>

            <p>
                <strong>موبایل:</strong>
                ${escapeHTML(customer.phone || "-")}
            </p>

            <p>
                <strong>درخواست:</strong>
                ${escapeHTML(customer.requestType || "-")}
            </p>

            <p>
                <strong>متراژ:</strong>
                ${customer.minSize || customer.maxSize
                    ? `${escapeHTML(customer.minSize || "-")} تا ${escapeHTML(customer.maxSize || "-")} متر`
                    : "-"
                }
            </p>

            <p>
                <strong>بودجه:</strong>
                ${customer.minBudget || customer.maxBudget
                    ? `${formatPrice(customer.minBudget || 0)} تا ${formatPrice(customer.maxBudget || 0)} تومان`
                    : "-"
                }
            </p>

            ${
                customer.description
                ? `<p>${escapeHTML(customer.description)}</p>`
                : ""
            }

            <div class="customer-actions">

                <button type="button"
                    onclick="editCustomer('${customer.id}')">
                    ویرایش
                </button>

                <button type="button"
                    onclick="deleteCustomer('${customer.id}')">
                    حذف
                </button>

                <button type="button"
                    onclick="showCustomerMatches('${customer.id}')">
                    فایل‌های مناسب
                </button>

            </div>

        </div>
    `;
}

function renderCustomers() {
    const container =
        document.getElementById("customersList") ||
        document.getElementById("customerList") ||
        document.getElementById("customersContainer");

    if (!container) {
        return;
    }

    const customers = getCustomers();

    if (customers.length === 0) {
        container.innerHTML =
            "<p>هنوز مشتری ثبت نشده است.</p>";
        return;
    }

    container.innerHTML = customers
        .slice()
        .reverse()
        .map(function (customer) {
            return customerCardHTML(customer);
        })
        .join("");
}


/* =========================
   افزودن مشتری
========================= */

function addCustomer() {
    const name = getInputValue("customerName");
    const phone = normalizePhone(
        getInputValue("customerPhone")
    );

    const requestType =
        getInputValue("customerRequestType");

    const desiredArea =
        getInputValue("customerArea");

    const minSize =
        getInputValue("customerMinSize");

    const maxSize =
        getInputValue("customerMaxSize");

    const minBudget =
        getInputValue("customerMinBudget");

    const maxBudget =
        getInputValue("customerMaxBudget");

    const rooms =
        getInputValue("customerRooms");

    const maxBuildYear =
        getInputValue("customerMaxBuildYear");

    const parking =
        getChecked("customerParking");

    const elevator =
        getChecked("customerElevator");

    const storage =
        getChecked("customerStorage");

    const description =
        getInputValue("customerDescription");

    if (!name) {
        alert("نام مشتری را وارد کنید.");
        return;
    }

    if (phone && !isValidPhone(phone)) {
        alert("شماره موبایل مشتری صحیح نیست.");
        return;
    }

    const customers = getCustomers();

    const customer = {
        id: generateId(),

        name: name,
        phone: phone,

        requestType: requestType,
        desiredArea: desiredArea,

        minSize: normalizeNumber(minSize),
        maxSize: normalizeNumber(maxSize),

        minBudget: normalizeNumber(minBudget),
        maxBudget: normalizeNumber(maxBudget),

        rooms: normalizeNumber(rooms),

        maxBuildYear: maxBuildYear,

        parking: parking,
        elevator: elevator,
        storage: storage,

        description: description,

        createdAt: Date.now()
    };

    customers.push(customer);

    saveCustomers(customers);

    alert("مشتری با موفقیت ثبت شد.");

    closeCustomerModal();

    clearCustomerForm();

    renderCustomers();

    updateDashboard();
}


/* =========================
   ویرایش مشتری
========================= */

function editCustomer(id) {
    const customers = getCustomers();

    const customer = customers.find(function (item) {
        return String(item.id) === String(id);
    });

    if (!customer) {
        alert("مشتری پیدا نشد.");
        return;
    }

    setInputValue("customerName", customer.name);
    setInputValue("customerPhone", customer.phone);
    setInputValue("customerRequestType", customer.requestType);
    setInputValue("customerArea", customer.desiredArea);
    setInputValue("customerMinSize", customer.minSize);
    setInputValue("customerMaxSize", customer.maxSize);
    setInputValue("customerMinBudget", customer.minBudget);
    setInputValue("customerMaxBudget", customer.maxBudget);
    setInputValue("customerRooms", customer.rooms);
    setInputValue("customerMaxBuildYear", customer.maxBuildYear);
    setInputValue("customerDescription", customer.description);

    setChecked("customerParking", customer.parking);
    setChecked("customerElevator", customer.elevator);
    setChecked("customerStorage", customer.storage);

    const modal = document.getElementById("customerModal");

    if (modal) {
        modal.dataset.editingId = customer.id;
        modal.style.display = "flex";
    }
}

function updateCustomer() {
    const modal = document.getElementById("customerModal");

    if (!modal || !modal.dataset.editingId) {
        addCustomer();
        return;
    }

    const id = modal.dataset.editingId;

    let customers = getCustomers();

    const index = customers.findIndex(function (item) {
        return String(item.id) === String(id);
    });

    if (index === -1) {
        alert("مشتری پیدا نشد.");
        return;
    }

    const phone =
        normalizePhone(getInputValue("customerPhone"));

    if (phone && !isValidPhone(phone)) {
        alert("شماره موبایل مشتری صحیح نیست.");
        return;
    }

    customers[index] = {
        ...customers[index],

        name: getInputValue("customerName"),
        phone: phone,

        requestType:
            getInputValue("customerRequestType"),

        desiredArea:
            getInputValue("customerArea"),

        minSize:
            normalizeNumber(
                getInputValue("customerMinSize")
            ),

        maxSize:
            normalizeNumber(
                getInputValue("customerMaxSize")
            ),

        minBudget:
            normalizeNumber(
                getInputValue("customerMinBudget")
            ),

        maxBudget:
            normalizeNumber(
                getInputValue("customerMaxBudget")
            ),

        rooms:
            normalizeNumber(
                getInputValue("customerRooms")
            ),

        maxBuildYear:
            getInputValue("customerMaxBuildYear"),

        parking:
            getChecked("customerParking"),

        elevator:
            getChecked("customerElevator"),

        storage:
            getChecked("customerStorage"),

        description:
            getInputValue("customerDescription")
    };

    saveCustomers(customers);

    alert("اطلاعات مشتری ویرایش شد.");

    closeCustomerModal();

    clearCustomerForm();

    renderCustomers();

    updateDashboard();
}


/* =========================
   حذف مشتری
========================= */

function deleteCustomer(id) {
    const confirmed =
        confirm("آیا از حذف این مشتری اطمینان دارید؟");

    if (!confirmed) {
        return;
    }

    const customers = getCustomers();

    const newCustomers = customers.filter(function (item) {
        return String(item.id) !== String(id);
    });

    saveCustomers(newCustomers);

    renderCustomers();

    updateDashboard();
}


/* =========================
   فرم مشتری
========================= */

function clearCustomerForm() {
    const ids = [
        "customerName",
        "customerPhone",
        "customerRequestType",
        "customerArea",
        "customerMinSize",
        "customerMaxSize",
        "customerMinBudget",
        "customerMaxBudget",
        "customerRooms",
        "customerMaxBuildYear",
        "customerDescription"
    ];

    ids.forEach(function (id) {
        setInputValue(id, "");
    });

    setChecked("customerParking", false);
    setChecked("customerElevator", false);
    setChecked("customerStorage", false);

    const modal = document.getElementById("customerModal");

    if (modal) {
        delete modal.dataset.editingId;
    }
}

function openCustomerModal() {
    clearCustomerForm();

    const modal =
        document.getElementById("customerModal");

    if (modal) {
        modal.style.display = "flex";
    }
}

function closeCustomerModal() {
    const modal =
        document.getElementById("customerModal");

    if (modal) {
        modal.style.display = "none";
        delete modal.dataset.editingId;
    }
}


/* =========================
   تطبیق مشتری با فایل‌های ملک
========================= */

function matchPropertyToCustomer(property, customer) {

    const propertySize =
        normalizeNumber(property.size);

    const propertyPrice =
        normalizeNumber(property.totalPrice);

    const propertyRooms =
        normalizeNumber(property.rooms);

    const propertyBuildYear =
        normalizeNumber(property.buildYear);

    if (customer.minSize &&
        propertySize < customer.minSize) {
        return false;
    }

    if (customer.maxSize &&
        propertySize > customer.maxSize) {
        return false;
    }

    if (customer.minBudget &&
        propertyPrice < customer.minBudget) {
        return false;
    }

    if (customer.maxBudget &&
        propertyPrice > customer.maxBudget) {
        return false;
    }

    if (customer.rooms &&
        propertyRooms !== customer.rooms) {
        return false;
    }

    if (customer.maxBuildYear &&
        propertyBuildYear &&
        propertyBuildYear > customer.maxBuildYear) {
        return false;
    }

    if (customer.parking &&
        !property.parking) {
        return false;
    }

    if (customer.elevator &&
        !property.elevator) {
        return false;
    }

    if (customer.storage &&
        !property.storage) {
        return false;
    }

    return true;
}

function showCustomerMatches(id) {
    const customers = getCustomers();
    const properties = getProperties();

    const customer = customers.find(function (item) {
        return String(item.id) === String(id);
    });

    if (!customer) {
        alert("مشتری پیدا نشد.");
        return;
    }

    const matches = properties.filter(function (property) {
        return matchPropertyToCustomer(property, customer);
    });

    if (matches.length === 0) {
        alert(
            "برای این مشتری در حال حاضر فایل مناسبی پیدا نشد."
        );
        return;
    }

    const text = matches
        .slice(0, 10)
        .map(function (property, index) {

            return (
                (index + 1) +
                ". " +
                (property.type || "ملک") +
                " - " +
                (property.size || "-") +
                " متر - " +
                formatPrice(property.totalPrice) +
                " تومان"
            );

        })
        .join("\n");

    alert(
        "فایل‌های مناسب برای " +
        customer.name +
        ":\n\n" +
        text
    );
}


/* =========================
   تنظیمات
========================= */

function updateSettings() {
    const user = getUser();

    if (!user) {
        return;
    }

    const accountPhone =
        document.getElementById("accountPhone");

    const subscriptionStatus =
        document.getElementById("subscriptionStatus");

    const subscriptionDate =
        document.getElementById("subscriptionDate");

    if (accountPhone) {
        accountPhone.textContent =
            user.phone || "-";
    }

    if (subscriptionStatus) {
        subscriptionStatus.textContent =
            isSubscriptionValid(user)
                ? "فعال"
                : "منقضی شده";
    }

    if (subscriptionDate) {

        if (user.subscriptionUntil) {

            const date =
                new Date(user.subscriptionUntil);

            subscriptionDate.textContent =
                date.toLocaleDateString("fa-IR");

        } else {

            subscriptionDate.textContent =
                "فعال نشده";

        }
    }
}


/* =========================
   پشتیبان‌گیری
========================= */

function backupData() {
    const data = {
        version: APP_CONFIG.version,
        user: getUser(),
        properties: getProperties(),
        customers: getCustomers(),
        backupDate: new Date().toISOString()
    };

    const json =
        JSON.stringify(data, null, 2);

    const blob =
        new Blob(
            [json],
            { type: "application/json" }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "amlak-hooshmand-backup.json";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}


/* =========================
   بازیابی اطلاعات
========================= */

function restoreData(event) {

    const file =
        event.target.files[0];

    if (!file) {
        return;
    }

    const reader =
        new FileReader();

    reader.onload = function (e) {

        try {

            const data =
                JSON.parse(e.target.result);

            if (!data) {
                throw new Error("فایل نامعتبر است");
            }

            if (data.user) {
                saveUser(data.user);
            }

            if (Array.isArray(data.properties)) {
                saveProperties(data.properties);
            }

            if (Array.isArray(data.customers)) {
                saveCustomers(data.customers);
            }

            alert(
                "اطلاعات با موفقیت بازیابی شد."
            );

            updateAll();

        } catch (error) {

            console.error(error);

            alert(
                "فایل پشتیبان معتبر نیست."
            );
        }
    };

    reader.readAsText(file);
}


/* =========================
   بروزرسانی کلی
========================= */

function updateAll() {
    updateDashboard();
    renderProperties();
    renderCustomers();
    updateSettings();
}


/* =========================
   رویدادهای صفحه
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "املاک هوشمند - app.js نسخه " +
            APP_CONFIG.version +
            " اجرا شد."
        );

        const user = getUser();

        const authScreen =
            document.getElementById("authScreen");

        const appScreen =
            document.getElementById("appScreen");

        if (user && isSubscriptionValid(user)) {

            if (authScreen) {
                authScreen.style.display = "none";
            }

            if (appScreen) {
                appScreen.style.display = "block";
            }

            updateAll();

        } else {

            if (authScreen) {
                authScreen.style.display = "block";
            }

            if (appScreen) {
                appScreen.style.display = "none";
            }

            showLogin();
        }


        /* جستجوی فایل‌ها */

        const propertySearch =
            document.getElementById("propertySearch");

        if (propertySearch) {
            propertySearch.addEventListener(
                "input",
                renderProperties
            );
        }


        /* فیلتر فایل‌ها */

        const propertyTypeFilter =
            document.getElementById(
                "propertyTypeFilter"
            );

        if (propertyTypeFilter) {
            propertyTypeFilter.addEventListener(
                "change",
                renderProperties
            );
        }


        const propertyStatusFilter =
            document.getElementById(
                "propertyStatusFilter"
            );

        if (propertyStatusFilter) {
            propertyStatusFilter.addEventListener(
                "change",
                renderProperties
            );
        }


        const propertySort =
            document.getElementById(
                "propertySort"
            );

        if (propertySort) {
            propertySort.addEventListener(
                "change",
                renderProperties
            );
        }


        /* کلیک بیرون از مودال */

        document.addEventListener(
            "click",
            function (event) {

                const propertyModal =
                    document.getElementById(
                        "propertyModal"
                    );

                const customerModal =
                    document.getElementById(
                        "customerModal"
                    );

                if (
                    propertyModal &&
                    event.target === propertyModal
                ) {
                    closePropertyModal();
                }

                if (
                    customerModal &&
                    event.target === customerModal
                ) {
                    closeCustomerModal();
                }
            }
        );
    }
);


/* =========================
   سازگاری با نام‌های احتمالی
========================= */

window.showLogin = showLogin;
window.showRegister = showRegister;
window.showPayment = showPayment;

window.register = register;
window.login = login;
window.pay = pay;
window.renewSubscription = renewSubscription;

window.openApplication = openApplication;
window.logout = logout;

window.toggleMenu = toggleMenu;
window.showSection = showSection;

window.addProperty = addProperty;
window.updateProperty = updateProperty;
window.editProperty = editProperty;
window.deleteProperty = deleteProperty;

window.openPropertyModal = openPropertyModal;
window.closePropertyModal = closePropertyModal;

window.addCustomer = addCustomer;
window.updateCustomer = updateCustomer;
window.editCustomer = editCustomer;
window.deleteCustomer = deleteCustomer;

window.openCustomerModal = openCustomerModal;
window.closeCustomerModal = closeCustomerModal;

window.showCustomerMatches = showCustomerMatches;

window.backupData = backupData;
window.restoreData = restoreData;

console.log(
    "املاک هوشمند آماده است."
);
