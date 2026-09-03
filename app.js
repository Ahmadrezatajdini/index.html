// ===============================
// املاک هوشمند - نسخه 1.2
// هماهنگ با index.html
// ===============================

const APP_CONFIG = {
    appName: "املاک هوشمند",
    version: "1.2.0",
    subscriptionPrice: 99000,
    subscriptionDays: 365
};

const STORAGE_KEYS = {
    user: "realEstate_user",
    properties: "realEstate_properties",
    customers: "realEstate_customers"
};

let currentUser = loadJSON(STORAGE_KEYS.user, null);
let properties = loadJSON(STORAGE_KEYS.properties, []);
let customers = loadJSON(STORAGE_KEYS.customers, []);

// ===============================
// ابزارهای عمومی
// ===============================

function loadJSON(key, fallback) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch (e) {
        return fallback;
    }
}

function saveUser() {
    localStorage.setItem(
        STORAGE_KEYS.user,
        JSON.stringify(currentUser)
    );
}

function saveProperties() {
    localStorage.setItem(
        STORAGE_KEYS.properties,
        JSON.stringify(properties)
    );
}

function saveCustomers() {
    localStorage.setItem(
        STORAGE_KEYS.customers,
        JSON.stringify(customers)
    );
}

function generateId() {
    return Date.now().toString(36) +
        Math.random().toString(36).substring(2, 8);
}

function normalizeNumber(value) {
    if (value === null || value === undefined) return 0;

    const persian = "۰۱۲۳۴۵۶۷۸۹";
    const arabic = "٠١٢٣٤٥٦٧٨٩";

    let str = String(value);

    str = str.replace(/[۰-۹]/g, d => persian.indexOf(d));
    str = str.replace(/[٠-٩]/g, d => arabic.indexOf(d));
    str = str.replace(/,/g, "");
    str = str.replace(/٬/g, "");
    str = str.replace(/[^\d.-]/g, "");

    return Number(str) || 0;
}

function formatPrice(price) {
    const number = normalizeNumber(price);

    if (!number) return "توافقی";

    return new Intl.NumberFormat("fa-IR").format(number) +
        " تومان";
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function toPersianNumber(value) {
    return String(value ?? "")
        .replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
}

function normalizePhone(phone) {
    let value = String(phone || "");

    const persian = "۰۱۲۳۴۵۶۷۸۹";
    const arabic = "٠١٢٣٤٥٦٧٨٩";

    value = value.replace(/[۰-۹]/g, d => persian.indexOf(d));
    value = value.replace(/[٠-٩]/g, d => arabic.indexOf(d));

    value = value.replace(/[^\d]/g, "");

    if (value.startsWith("98")) {
        value = "0" + value.substring(2);
    }

    return value;
}

function isValidPhone(phone) {
    return /^09\d{9}$/.test(normalizePhone(phone));
}

// ===============================
// نمایش صفحات ورود / ثبت‌نام
// ===============================

function hideAuthPages() {

    const pages = [
        "loginPage",
        "registerPage",
        "paymentPage"
    ];

    pages.forEach(id => {
        const el = document.getElementById(id);

        if (el) {
            el.style.display = "none";
            el.classList.add("hidden");
        }
    });
}

function showLogin() {

    hideAuthPages();

    const page = document.getElementById("loginPage");

    if (page) {
        page.style.display = "block";
        page.classList.remove("hidden");
    }
}

function showRegister() {

    hideAuthPages();

    const page = document.getElementById("registerPage");

    if (page) {
        page.style.display = "block";
        page.classList.remove("hidden");
    }
}

function showPayment() {

    hideAuthPages();

    const page = document.getElementById("paymentPage");

    if (page) {
        page.style.display = "block";
        page.classList.remove("hidden");
    }
}

// ===============================
// ثبت نام
// ===============================

function register() {

    const name =
        document.getElementById("registerName")?.value.trim();

    const phone =
        normalizePhone(
            document.getElementById("registerPhone")?.value
        );

    const terms =
        document.getElementById("terms")?.checked;

    if (!name) {
        alert("لطفاً نام و نام خانوادگی را وارد کنید.");
        return;
    }

    if (!isValidPhone(phone)) {
        alert("شماره موبایل معتبر وارد کنید.\nمثال: 09123456789");
        return;
    }

    if (!terms) {
        alert("لطفاً قوانین و شرایط استفاده را بپذیرید.");
        return;
    }

    currentUser = {
        id: generateId(),
        name: name,
        phone: phone,
        subscriptionUntil: null,
        createdAt: new Date().toISOString()
    };

    saveUser();

    alert(
        "اطلاعات شما با موفقیت ثبت شد.\n" +
        "اکنون می‌توانید اشتراک آزمایشی را فعال کنید."
    );

    showPayment();
}

// ===============================
// ورود
// ===============================

function login() {

    const phone =
        normalizePhone(
            document.getElementById("loginPhone")?.value
        );

    if (!isValidPhone(phone)) {
        alert("لطفاً شماره موبایل معتبر وارد کنید.");
        return;
    }

    if (!currentUser) {

        alert(
            "حسابی با این دستگاه پیدا نشد.\n" +
            "ابتدا ثبت‌نام کنید."
        );

        showRegister();
        return;
    }

    if (
        normalizePhone(currentUser.phone) !== phone
    ) {
        alert("این شماره موبایل با حساب ثبت‌شده مطابقت ندارد.");
        return;
    }

    if (!isSubscriptionValid()) {
        showPayment();
        return;
    }

    openApplication();
}

// ===============================
// اشتراک
// ===============================

function isSubscriptionValid() {

    if (!currentUser?.subscriptionUntil) {
        return false;
    }

    return (
        new Date(currentUser.subscriptionUntil).getTime()
        > Date.now()
    );
}

function activateSubscription() {

    if (!currentUser) return;

    const date = new Date();

    date.setDate(
        date.getDate() + APP_CONFIG.subscriptionDays
    );

    currentUser.subscriptionUntil =
        date.toISOString();

    saveUser();
}

function pay() {

    if (!currentUser) {
        alert("ابتدا ثبت‌نام کنید.");
        showRegister();
        return;
    }

    activateSubscription();

    alert(
        "پرداخت آزمایشی با موفقیت انجام شد.\n" +
        "اشتراک یک‌ساله شما فعال شد."
    );

    openApplication();
}

function renewSubscription() {

    if (!currentUser) {
        showLogin();
        return;
    }

    activateSubscription();

    alert("اشتراک شما برای یک سال تمدید شد.");

    updateAccountInfo();
}

// ===============================
// ورود به برنامه
// ===============================

function openApplication() {

    const auth =
        document.getElementById("authScreen");

    const app =
        document.getElementById("appScreen");

    if (auth) {
        auth.style.display = "none";
        auth.classList.add("hidden");
    }

    if (app) {
        app.style.display = "block";
        app.classList.remove("hidden");
    }

    updateDashboard();
    renderProperties();
    renderCustomers();
    updateAccountInfo();
}

function logout() {

    const app =
        document.getElementById("appScreen");

    const auth =
        document.getElementById("authScreen");

    if (app) {
        app.style.display = "none";
        app.classList.add("hidden");
    }

    if (auth) {
        auth.style.display = "block";
        auth.classList.remove("hidden");
    }

    showLogin();
}

// ===============================
// منو
// ===============================

function toggleMenu() {

    const menu =
        document.getElementById("mainMenu");

    menu?.classList.toggle("open");
}

function showSection(section) {

    document
        .querySelectorAll(".section")
        .forEach(el => {
            el.style.display = "none";
            el.classList.remove("active");
        });

    const target =
        document.getElementById(section);

    if (target) {
        target.style.display = "block";
        target.classList.add("active");
    }

    if (section === "dashboard") {
        updateDashboard();
    }

    if (section === "properties") {
        renderProperties();
    }

    if (section === "customers") {
        renderCustomers();
    }

    document
        .getElementById("mainMenu")
        ?.classList.remove("open");
}

// ===============================
// داشبورد
// ===============================

function updateDashboard() {

    const propertyCount =
        document.getElementById("propertyCount");

    const customerCount =
        document.getElementById("customerCount");

    const availableCount =
        document.getElementById("availableCount");

    const specialCount =
        document.getElementById("specialCount");

    if (propertyCount)
        propertyCount.textContent =
            toPersianNumber(properties.length);

    if (customerCount)
        customerCount.textContent =
            toPersianNumber(customers.length);

    if (availableCount)
        availableCount.textContent =
            toPersianNumber(
                properties.filter(
                    p =>
                        p.status === "موجود" ||
                        p.status === "available"
                ).length
            );

    if (specialCount)
        specialCount.textContent =
            toPersianNumber(
                properties.filter(
                    p => p.special
                ).length
            );

    renderLatestProperties();
}

// ===============================
// املاک
// ===============================

function openPropertyForm(id = null) {

    clearPropertyForm();

    if (id) {

        const property =
            properties.find(p => p.id === id);

        if (!property) return;

        document.getElementById("propertyId").value =
            property.id;

        document.getElementById("propertyType").value =
            property.type || "آپارتمان";

        document.getElementById("propertyArea").value =
            property.area || "";

        document.getElementById("propertySize").value =
            property.size || "";

        document.getElementById("propertyPrice").value =
            property.price || "";

        document.getElementById("propertyRooms").value =
            property.rooms || "";

        document.getElementById("propertyFloor").value =
            property.floor || "";

        document.getElementById("propertyAge").value =
            property.age || "";

        document.getElementById("propertyParking").checked =
            !!property.parking;

        document.getElementById("propertyElevator").checked =
            !!property.elevator;

        document.getElementById("propertyStorage").checked =
            !!property.storage;

        document.getElementById("propertySpecial").checked =
            !!property.special;

        document.getElementById("propertyStatus").value =
            property.status || "موجود";

        document.getElementById("propertyDescription").value =
            property.description || "";
    }

    const modal =
        document.getElementById("propertyModal");

    if (modal) {
        modal.style.display = "flex";
        modal.classList.remove("hidden");
    }
}

function clearPropertyForm() {

    [
        "propertyId",
        "propertyArea",
        "propertySize",
        "propertyPrice",
        "propertyRooms",
        "propertyFloor",
        "propertyAge",
        "propertyDescription"
    ].forEach(id => {

        const el =
            document.getElementById(id);

        if (el) el.value = "";
    });

    const type =
        document.getElementById("propertyType");

    if (type) type.value = "آپارتمان";

    const status =
        document.getElementById("propertyStatus");

    if (status) status.value = "موجود";

    [
        "propertyParking",
        "propertyElevator",
        "propertyStorage",
        "propertySpecial"
    ].forEach(id => {

        const el =
            document.getElementById(id);

        if (el) el.checked = false;
    });
}

function saveProperty() {

    const id =
        document.getElementById("propertyId").value ||
        generateId();

    const property = {

        id,

        type:
            document.getElementById("propertyType").value,

        area:
            document.getElementById("propertyArea").value.trim(),

        size:
            normalizeNumber(
                document.getElementById("propertySize").value
            ),

        price:
            normalizeNumber(
                document.getElementById("propertyPrice").value
            ),

        rooms:
            normalizeNumber(
                document.getElementById("propertyRooms").value
            ),

        floor:
            normalizeNumber(
                document.getElementById("propertyFloor").value
            ),

        age:
            normalizeNumber(
                document.getElementById("propertyAge").value
            ),

        parking:
            document.getElementById("propertyParking").checked,

        elevator:
            document.getElementById("propertyElevator").checked,

        storage:
            document.getElementById("propertyStorage").checked,

        special:
            document.getElementById("propertySpecial").checked,

        status:
            document.getElementById("propertyStatus").value,

        description:
            document.getElementById("propertyDescription").value.trim(),

        updatedAt:
            new Date().toISOString()
    };

    const index =
        properties.findIndex(p => p.id === id);

    if (index >= 0) {
        properties[index] = property;
    } else {
        properties.unshift(property);
    }

    saveProperties();

    closePropertyModal();
    renderProperties();
    updateDashboard();

    alert("ملک با موفقیت ذخیره شد.");
}

function closePropertyModal() {

    const modal =
        document.getElementById("propertyModal");

    if (modal) {
        modal.style.display = "none";
        modal.classList.add("hidden");
    }
}

function deleteProperty(id) {

    if (!confirm("آیا از حذف این ملک مطمئن هستید؟")) {
        return;
    }

    properties =
        properties.filter(p => p.id !== id);

    saveProperties();

    renderProperties();
    updateDashboard();
}

function propertyCardHTML(property) {

    return `
        <div class="property-card">

            <div class="card-header">

                <strong>
                    ${escapeHTML(property.type || "ملک")}
                </strong>

                ${
                    property.special
                        ? `<span class="special-badge">⭐ ویژه</span>`
                        : ""
                }

            </div>

            <div class="card-body">

                <p>
                    📍 ${escapeHTML(property.area || "نامشخص")}
                </p>

                <p>
                    📐 ${toPersianNumber(property.size || 0)} متر
                </p>

                <p>
                    💰 ${formatPrice(property.price)}
                </p>

                <p>
                    🛏️ ${toPersianNumber(property.rooms || 0)} خواب
                </p>

                <div class="features">
                    ${property.parking ? "🚗 پارکینگ " : ""}
                    ${property.elevator ? "🛗 آسانسور " : ""}
                    ${property.storage ? "📦 انباری" : ""}
                </div>

            </div>

            <div class="card-actions">

                <button
                    onclick="openPropertyForm('${property.id}')">
                    ✏️ ویرایش
                </button>

                <button
                    onclick="deleteProperty('${property.id}')">
                    🗑️ حذف
                </button>

            </div>

        </div>
    `;
}

function renderProperties() {

    const list =
        document.getElementById("propertyList");

    if (!list) return;

    let result = [...properties];

    const search =
        document.getElementById("propertySearch")
            ?.value.trim().toLowerCase();

    if (search) {

        result = result.filter(p =>
            `${p.area || ""} ${p.type || ""} ${p.description || ""}`
                .toLowerCase()
                .includes(search)
        );
    }

    const type =
        document.getElementById("filterType")?.value;

    if (type) {
        result =
            result.filter(p => p.type === type);
    }

    const area =
        document.getElementById("filterArea")
            ?.value.trim().toLowerCase();

    if (area) {

        result =
            result.filter(p =>
                String(p.area || "")
                    .toLowerCase()
                    .includes(area)
            );
    }

    const minSize =
        normalizeNumber(
            document.getElementById("filterMinSize")?.value
        );

    const maxSize =
        normalizeNumber(
            document.getElementById("filterMaxSize")?.value
        );

    if (minSize) {
        result =
            result.filter(
                p => normalizeNumber(p.size) >= minSize
            );
    }

    if (maxSize) {
        result =
            result.filter(
                p => normalizeNumber(p.size) <= maxSize
            );
    }

    const minPrice =
        normalizeNumber(
            document.getElementById("filterMinPrice")?.value
        );

    const maxPrice =
        normalizeNumber(
            document.getElementById("filterMaxPrice")?.value
        );

    if (minPrice) {
        result =
            result.filter(
                p => normalizeNumber(p.price) >= minPrice
            );
    }

    if (maxPrice) {
        result =
            result.filter(
                p => normalizeNumber(p.price) <= maxPrice
            );
    }

    const status =
        document.getElementById("filterStatus")?.value;

    if (status) {

        result =
            result.filter(
                p => p.status === status
            );
    }

    const special =
        document.getElementById("filterSpecial")?.value;

    if (special === "true") {
        result =
            result.filter(p => p.special);
    }

    const sort =
        document.getElementById("propertySort")?.value;

    if (sort === "priceLow") {

        result.sort(
            (a, b) =>
                normalizeNumber(a.price) -
                normalizeNumber(b.price)
        );
    }

    if (sort === "priceHigh") {

        result.sort(
            (a, b) =>
                normalizeNumber(b.price) -
                normalizeNumber(a.price)
        );
    }

    if (sort === "sizeLow") {

        result.sort(
            (a, b) =>
                normalizeNumber(a.size) -
                normalizeNumber(b.size)
        );
    }

    if (sort === "sizeHigh") {

        result.sort(
            (a, b) =>
                normalizeNumber(b.size) -
                normalizeNumber(a.size)
        );
    }

    list.innerHTML =
        result.length
            ? result.map(propertyCardHTML).join("")
            : `<div class="empty-state">ملکی پیدا نشد.</div>`;

    const count =
        document.getElementById("propertyResultCount");

    if (count) {

        count.textContent =
            `${toPersianNumber(result.length)} فایل`;
    }
}

function renderLatestProperties() {

    const list =
        document.getElementById("latestProperties");

    if (!list) return;

    const latest =
        properties.slice(0, 5);

    list.innerHTML =
        latest.length
            ? latest.map(propertyCardHTML).join("")
            : `<div class="empty-state">هنوز فایلی ثبت نشده است.</div>`;
}

function resetFilters() {

    [
        "propertySearch",
        "filterArea",
        "filterMinSize",
        "filterMaxSize",
        "filterMinPrice",
        "filterMaxPrice"
    ].forEach(id => {

        const el =
            document.getElementById(id);

        if (el) el.value = "";
    });

    [
        "filterType",
        "filterStatus",
        "filterSpecial"
    ].forEach(id => {

        const el =
            document.getElementById(id);

        if (el) el.value = "";
    });

    const sort =
        document.getElementById("propertySort");

    if (sort) sort.value = "newest";

    renderProperties();
}

// ===============================
// مشتریان
// ===============================

function openCustomerForm(id = null) {

    clearCustomerForm();

    if (id) {

        const customer =
            customers.find(c => c.id === id);

        if (!customer) return;

        document.getElementById("customerId").value =
            customer.id;

        document.getElementById("customerName").value =
            customer.name || "";

        document.getElementById("customerPhone").value =
            customer.phone || "";

        document.getElementById("customerType").value =
            customer.type || "خرید";

        document.getElementById("customerArea").value =
            customer.area || "";

        document.getElementById("customerMinSize").value =
            customer.minSize || "";

        document.getElementById("customerMaxSize").value =
            customer.maxSize || "";

        document.getElementById("customerMinPrice").value =
            customer.minPrice || "";

        document.getElementById("customerMaxPrice").value =
            customer.maxPrice || "";

        document.getElementById("customerRooms").value =
            customer.rooms || "";

        document.getElementById("customerAge").value =
            customer.age || "";

        document.getElementById("customerParking").checked =
            !!customer.parking;

        document.getElementById("customerElevator").checked =
            !!customer.elevator;

        document.getElementById("customerStorage").checked =
            !!customer.storage;

        document.getElementById("customerDescription").value =
            customer.description || "";
    }

    const modal =
        document.getElementById("customerModal");

    if (modal) {
        modal.style.display = "flex";
        modal.classList.remove("hidden");
    }
}

function clearCustomerForm() {

    [
        "customerId",
        "customerName",
        "customerPhone",
        "customerArea",
        "customerMinSize",
        "customerMaxSize",
        "customerMinPrice",
        "customerMaxPrice",
        "customerRooms",
        "customerAge",
        "customerDescription"
    ].forEach(id => {

        const el =
            document.getElementById(id);

        if (el) el.value = "";
    });

    const type =
        document.getElementById("customerType");

    if (type) type.value = "خرید";

    [
        "customerParking",
        "customerElevator",
        "customerStorage"
    ].forEach(id => {

        const el =
            document.getElementById(id);

        if (el) el.checked = false;
    });
}

function saveCustomer() {

    const id =
        document.getElementById("customerId").value ||
        generateId();

    const name =
        document.getElementById("customerName").value.trim();

    const phone =
        normalizePhone(
            document.getElementById("customerPhone").value
        );

    if (!name) {
        alert("نام مشتری را وارد کنید.");
        return;
    }

    if (!isValidPhone(phone)) {
        alert("شماره موبایل مشتری معتبر نیست.");
        return;
    }

    const customer = {

        id,
        name,
        phone,

        type:
            document.getElementById("customerType").value,

        area:
            document.getElementById("customerArea").value.trim(),

        minSize:
            normalizeNumber(
                document.getElementById("customerMinSize").value
            ),

        maxSize:
            normalizeNumber(
                document.getElementById("customerMaxSize").value
            ),

        minPrice:
            normalizeNumber(
                document.getElementById("customerMinPrice").value
            ),

        maxPrice:
            normalizeNumber(
                document.getElementById("customerMaxPrice").value
            ),

        rooms:
            normalizeNumber(
                document.getElementById("customerRooms").value
            ),

        age:
            normalizeNumber(
                document.getElementById("customerAge").value
            ),

        parking:
            document.getElementById("customerParking").checked,

        elevator:
            document.getElementById("customerElevator").checked,

        storage:
            document.getElementById("customerStorage").checked,

        description:
            document.getElementById("customerDescription").value.trim(),

        updatedAt:
            new Date().toISOString()
    };

    const index =
        customers.findIndex(c => c.id === id);

    if (index >= 0) {
        customers[index] = customer;
    } else {
        customers.unshift(customer);
    }

    saveCustomers();

    closeCustomerModal();
    renderCustomers();
    updateDashboard();

    alert("مشتری با موفقیت ذخیره شد.");
}

function closeCustomerModal() {

    const modal =
        document.getElementById("customerModal");

    if (modal) {
        modal.style.display = "none";
        modal.classList.add("hidden");
    }
}

function deleteCustomer(id) {

    if (!confirm("آیا از حذف این مشتری مطمئن هستید؟")) {
        return;
    }

    customers =
        customers.filter(c => c.id !== id);

    saveCustomers();

    renderCustomers();
    updateDashboard();
}

// ===============================
// تطبیق هوشمند
// ===============================

function calculateMatch(customer, property) {

    let score = 0;
    let total = 0;

    if (customer.minSize || customer.maxSize) {

        total += 25;

        const size =
            normalizeNumber(property.size);

        const min =
            normalizeNumber(customer.minSize);

        const max =
            normalizeNumber(customer.maxSize);

        if (
            (!min || size >= min) &&
            (!max || size <= max)
        ) {
            score += 25;
        } else if (
            min &&
            size >= min * 0.9 &&
            (!max || size <= max * 1.1)
        ) {
            score += 15;
        }
    }

    if (customer.minPrice || customer.maxPrice) {

        total += 30;

        const price =
            normalizeNumber(property.price);

        const min =
            normalizeNumber(customer.minPrice);

        const max =
            normalizeNumber(customer.maxPrice);

        if (
            (!min || price >= min) &&
            (!max || price <= max)
        ) {
            score += 30;
        } else if (
            max &&
            price <= max * 1.1
        ) {
            score += 15;
        }
    }

    if (customer.area) {

        total += 15;

        const wanted =
            customer.area.toLowerCase().trim();

        const actual =
            String(property.area || "")
                .toLowerCase()
                .trim();

        if (
            actual.includes(wanted) ||
            wanted.includes(actual)
        ) {
            score += 15;
        }
    }

    if (customer.rooms) {

        total += 10;

        if (
            normalizeNumber(customer.rooms) ===
            normalizeNumber(property.rooms)
        ) {
            score += 10;
        }
    }

    if (customer.parking) {

        total += 5;

        if (property.parking) {
            score += 5;
        }
    }

    if (customer.elevator) {

        total += 5;

        if (property.elevator) {
            score += 5;
        }
    }

    if (customer.storage) {

        total += 5;

        if (property.storage) {
            score += 5;
        }
    }

    if (total === 0) return 0;

    return Math.round(
        (score / total) * 100
    );
}

function getMatchingProperties(customer) {

    return properties
        .map(property => ({
            property,
            score:
                calculateMatch(
                    customer,
                    property
                )
        }))
        .filter(item => item.score >= 40)
        .sort(
            (a, b) =>
                b.score - a.score
        );
}

function showCustomerMatches(id) {

    const customer =
        customers.find(c => c.id === id);

    if (!customer) return;

    const matches =
        getMatchingProperties(customer);

    alert(
        matches.length
            ? `برای ${customer.name || "مشتری"} تعداد ${matches.length} فایل مناسب پیدا شد.`
            : "فعلاً فایل مناسبی برای این مشتری پیدا نشد."
    );
}

function customerCardHTML(customer) {

    return `
        <div class="customer-card">

            <div class="card-header">

                <strong>
                    ${escapeHTML(customer.name || "بدون نام")}
                </strong>

            </div>

            <div class="card-body">

                <p>
                    📞 ${escapeHTML(customer.phone || "بدون شماره")}
                </p>

                <p>
                    📍 ${escapeHTML(customer.area || "همه مناطق")}
                </p>

                ${
                    customer.minSize || customer.maxSize
                        ? `
                            <p>
                                📐
                                ${toPersianNumber(customer.minSize || 0)}
                                تا
                                ${toPersianNumber(customer.maxSize || 0)}
                                متر
                            </p>
                        `
                        : ""
                }

                ${
                    customer.maxPrice
                        ? `
                            <p>
                                💰 بودجه:
                                ${formatPrice(customer.maxPrice)}
                            </p>
                        `
                        : ""
                }

                ${
                    customer.rooms
                        ? `
                            <p>
                                🛏️
                                ${toPersianNumber(customer.rooms)}
                                خواب
                            </p>
                        `
                        : ""
                }

            </div>

            <div class="card-actions">

                <button
                    onclick="showCustomerMatches('${customer.id}')">
                    🔎 فایل‌های مناسب
                </button>

                <button
                    onclick="openCustomerForm('${customer.id}')">
                    ✏️ ویرایش
                </button>

                <button
                    onclick="deleteCustomer('${customer.id}')">
                    🗑️ حذف
                </button>

            </div>

        </div>
    `;
}

function renderCustomers() {

    const list =
        document.getElementById("customerList");

    if (!list) return;

    let result =
        [...customers];

    const search =
        document.getElementById("customerSearch")
            ?.value.trim().toLowerCase();

    if (search) {

        result =
            result.filter(c =>
                `${c.name || ""} ${c.phone || ""} ${c.area || ""}`
                    .toLowerCase()
                    .includes(search)
            );
    }

    list.innerHTML =
        result.length
            ? result.map(customerCardHTML).join("")
            : `<div class="empty-state">هنوز مشتری ثبت نشده است.</div>`;
}

// ===============================
// تنظیمات
// ===============================

function updateAccountInfo() {

    if (!currentUser) return;

    const phone =
        document.getElementById("accountPhone");

    const status =
        document.getElementById("subscriptionStatus");

    const date =
        document.getElementById("subscriptionDate");

    if (phone) {
        phone.textContent =
            currentUser.phone || "-";
    }

    if (status) {

        status.textContent =
            isSubscriptionValid()
                ? "فعال"
                : "منقضی";
    }

    if (date) {

        date.textContent =
            currentUser.subscriptionUntil
                ? new Date(
                    currentUser.subscriptionUntil
                ).toLocaleDateString("fa-IR")
                : "-";
    }
}

// ===============================
// پشتیبان‌گیری
// ===============================

function backupData() {

    const data = {

        version:
            APP_CONFIG.version,

        exportedAt:
            new Date().toISOString(),

        properties,
        customers,
        user: currentUser
    };

    const blob =
        new Blob(
            [JSON.stringify(data, null, 2)],
            {
                type: "application/json"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download =
        "amlak-smart-backup.json";

    document.body.appendChild(a);

    a.click();

    a.remove();

    URL.revokeObjectURL(url);
}

function restoreData(event) {

    const file =
        event?.target?.files?.[0];

    if (!file) return;

    const reader =
        new FileReader();

    reader.onload = function () {

        try {

            const data =
                JSON.parse(reader.result);

            if (Array.isArray(data.properties)) {

                properties =
                    data.properties;

                saveProperties();
            }

            if (Array.isArray(data.customers)) {

                customers =
                    data.customers;

                saveCustomers();
            }

            if (data.user) {

                currentUser =
                    data.user;

                saveUser();
            }

            alert(
                "اطلاعات با موفقیت بازیابی شد."
            );

            updateDashboard();
            renderProperties();
            renderCustomers();
            updateAccountInfo();

        } catch (error) {

            alert(
                "فایل پشتیبان معتبر نیست."
            );
        }
    };

    reader.readAsText(file);
}

// ===============================
// شروع برنامه
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const events = [

            "propertySearch",
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

        events.forEach(id => {

            const el =
                document.getElementById(id);

            if (!el) return;

            el.addEventListener(
                "input",
                renderProperties
            );

            el.addEventListener(
                "change",
                renderProperties
            );
        });

        const customerSearch =
            document.getElementById("customerSearch");

        customerSearch?.addEventListener(
            "input",
            renderCustomers
        );

        updateDashboard();
        renderProperties();
        renderCustomers();
        updateAccountInfo();

        const auth =
            document.getElementById("authScreen");

        const app =
            document.getElementById("appScreen");

        if (currentUser && isSubscriptionValid()) {

            if (auth) {
                auth.style.display = "none";
            }

            if (app) {
                app.style.display = "block";
            }

            openApplication();

        } else {

            if (app) {
                app.style.display = "none";
            }

            if (auth) {
                auth.style.display = "block";
            }

            showLogin();
        }

        // بستن مودال‌ها با کلیک بیرون
        document.addEventListener(
            "click",
            function (event) {

                if (
                    event.target.id ===
                    "propertyModal"
                ) {
                    closePropertyModal();
                }

                if (
                    event.target.id ===
                    "customerModal"
                ) {
                    closeCustomerModal();
                }
            }
        );
    }
);
