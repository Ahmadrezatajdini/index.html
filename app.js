/* =====================================================
   املاک هوشمند
   نسخه 1.0.0
   سیستم مدیریت فایل، مشتری و اشتراک
   ===================================================== */


/* =====================================================
   تنظیمات
   ===================================================== */

const APP_CONFIG = {
  appName: "املاک هوشمند",
  version: "1.0.0",
  subscriptionPrice: 99000,
  subscriptionDays: 365
};


/* =====================================================
   کلیدهای ذخیره‌سازی
   ===================================================== */

const STORAGE = {
  user: "realEstate_user",
  properties: "realEstate_properties",
  customers: "realEstate_customers"
};


/* =====================================================
   دریافت اطلاعات ذخیره‌شده
   ===================================================== */

let currentUser = loadJSON(STORAGE.user, null);
let properties = loadJSON(STORAGE.properties, []);
let customers = loadJSON(STORAGE.customers, []);


/* =====================================================
   ابزار ذخیره و بازیابی
   ===================================================== */

function loadJSON(key, defaultValue) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error("خطا در خواندن اطلاعات:", error);
    return defaultValue;
  }
}


function saveProperties() {
  localStorage.setItem(
    STORAGE.properties,
    JSON.stringify(properties)
  );
}


function saveCustomers() {
  localStorage.setItem(
    STORAGE.customers,
    JSON.stringify(customers)
  );
}


function saveUser() {
  if (currentUser) {
    localStorage.setItem(
      STORAGE.user,
      JSON.stringify(currentUser)
    );
  } else {
    localStorage.removeItem(STORAGE.user);
  }
}


/* =====================================================
   ابزارهای عمومی
   ===================================================== */

function generateId(prefix = "ID") {
  return (
    prefix +
    "-" +
    Date.now() +
    "-" +
    Math.random()
      .toString(36)
      .substring(2, 8)
  );
}


function formatPrice(number) {
  if (
    number === null ||
    number === undefined ||
    number === "" ||
    Number(number) === 0
  ) {
    return "توافقی";
  }

  return Number(number).toLocaleString("fa-IR") + " تومان";
}


function normalizeNumber(value) {
  return String(value || "")
    .replace(/[۰-۹]/g, digit =>
      "۰۱۲۳۴۵۶۷۸۹".indexOf(digit)
    )
    .replace(/,/g, "")
    .replace(/٬/g, "")
    .replace(/\D/g, "");
}


function normalizePhone(phone) {
  return String(phone || "")
    .replace(/[۰-۹]/g, digit =>
      "۰۱۲۳۴۵۶۷۸۹".indexOf(digit)
    )
    .replace(/\D/g, "");
}


function isValidPhone(phone) {
  return /^09\d{9}$/.test(normalizePhone(phone));
}


function escapeHTML(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function toPersianNumber(value) {
  return String(value ?? "").replace(
    /\d/g,
    digit => "۰۱۲۳۴۵۶۷۸۹"[digit]
  );
}


/* =====================================================
   صفحه‌های ورود
   ===================================================== */

function showLogin() {
  document.getElementById("loginPage").style.display = "block";
  document.getElementById("registerPage").style.display = "none";
  document.getElementById("paymentPage").style.display = "none";
}


function showRegister() {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("registerPage").style.display = "block";
  document.getElementById("paymentPage").style.display = "none";
}


function showPayment() {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("registerPage").style.display = "none";
  document.getElementById("paymentPage").style.display = "block";
}


/* =====================================================
   ثبت نام
   ===================================================== */

function register() {

  const name = document
    .getElementById("registerName")
    .value
    .trim();

  const phone = normalizePhone(
    document.getElementById("registerPhone").value
  );

  const terms = document.getElementById("terms").checked;


  if (!name) {
    alert("لطفاً نام و نام خانوادگی را وارد کنید.");
    return;
  }


  if (!isValidPhone(phone)) {
    alert("شماره موبایل صحیح نیست.");
    return;
  }


  if (!terms) {
    alert("لطفاً قوانین استفاده را تأیید کنید.");
    return;
  }


  currentUser = {
    id: currentUser?.id || generateId("USER"),
    name,
    phone,
    subscriptionActive: false,
    subscriptionExpires: null,
    createdAt:
      currentUser?.createdAt ||
      new Date().toISOString()
  };


  saveUser();

  showPayment();
}


/* =====================================================
   ورود
   ===================================================== */

function login() {

  const phone = normalizePhone(
    document.getElementById("loginPhone").value
  );


  if (!isValidPhone(phone)) {
    alert("لطفاً یک شماره موبایل معتبر وارد کنید.");
    return;
  }


  if (
    currentUser &&
    currentUser.phone === phone
  ) {

    if (
      currentUser.subscriptionActive &&
      isSubscriptionValid()
    ) {
      openApplication();
      return;
    }

    showPayment();
    return;
  }


  alert(
    "این شماره هنوز ثبت‌نام نشده است. ابتدا ثبت‌نام کنید."
  );

  showRegister();

  document.getElementById("registerPhone").value = phone;
}


/* =====================================================
   اشتراک
   ===================================================== */

function isSubscriptionValid() {

  if (!currentUser) {
    return false;
  }


  if (!currentUser.subscriptionActive) {
    return false;
  }


  if (!currentUser.subscriptionExpires) {
    return false;
  }


  return (
    new Date(currentUser.subscriptionExpires).getTime() >
    Date.now()
  );
}


function activateSubscription() {

  if (!currentUser) {
    return;
  }


  const startDate = new Date();


  let expirationDate;


  if (
    currentUser.subscriptionExpires &&
    new Date(currentUser.subscriptionExpires) > startDate
  ) {

    expirationDate = new Date(
      currentUser.subscriptionExpires
    );

    expirationDate.setDate(
      expirationDate.getDate() +
      APP_CONFIG.subscriptionDays
    );

  } else {

    expirationDate = new Date(startDate);

    expirationDate.setDate(
      expirationDate.getDate() +
      APP_CONFIG.subscriptionDays
    );

  }


  currentUser.subscriptionActive = true;

  currentUser.subscriptionExpires =
    expirationDate.toISOString();


  saveUser();
}


/* =====================================================
   پرداخت آزمایشی
   ===================================================== */

function pay() {

  if (!currentUser) {
    alert("ابتدا ثبت‌نام کنید.");
    showRegister();
    return;
  }


  /*
   پرداخت آزمایشی

   در نسخه نهایی:
   این قسمت به درگاه بانکی متصل خواهد شد.
  */


  activateSubscription();

  alert(
    "اشتراک آزمایشی با موفقیت فعال شد."
  );

  openApplication();
}


function renewSubscription() {

  showPayment();
}


/* =====================================================
   ورود به برنامه
   ===================================================== */

function openApplication() {

  if (
    currentUser &&
    currentUser.subscriptionActive &&
    !isSubscriptionValid()
  ) {

    currentUser.subscriptionActive = false;
    saveUser();

    showPayment();

    alert("اشتراک شما به پایان رسیده است.");

    return;
  }


  document.getElementById("authScreen").style.display = "none";
  document.getElementById("appScreen").style.display = "block";


  updateAccountInfo();
  updateDashboard();
  renderProperties();
  renderCustomers();
  renderLatestProperties();


  showSection("dashboard");
}


/* =====================================================
   خروج
   ===================================================== */

function logout() {

  document.getElementById("appScreen").style.display = "none";
  document.getElementById("authScreen").style.display = "flex";

  showLogin();
}


/* =====================================================
   منوی اصلی
   ===================================================== */

function toggleMenu() {

  const menu = document.getElementById("mainMenu");

  if (!menu) return;

  menu.classList.toggle("show");
}


function showSection(sectionId) {

  document
    .querySelectorAll(".section")
    .forEach(section => {
      section.style.display = "none";
    });


  const target = document.getElementById(sectionId);

  if (target) {
    target.style.display = "block";
  }


  const menu = document.getElementById("mainMenu");

  if (menu) {
    menu.classList.remove("show");
  }


  if (sectionId === "dashboard") {
    updateDashboard();
    renderLatestProperties();
  }


  if (sectionId === "properties") {
    renderProperties();
  }


  if (sectionId === "customers") {
    renderCustomers();
  }


  if (sectionId === "settings") {
    updateAccountInfo();
  }
}


/* =====================================================
   داشبورد
   ===================================================== */

function updateDashboard() {

  const propertyCount =
    document.getElementById("propertyCount");

  const customerCount =
    document.getElementById("customerCount");

  const availableCount =
    document.getElementById("availableCount");

  const specialCount =
    document.getElementById("specialCount");


  if (propertyCount) {
    propertyCount.textContent =
      toPersianNumber(properties.length);
  }


  if (customerCount) {
    customerCount.textContent =
      toPersianNumber(customers.length);
  }


  if (availableCount) {
    availableCount.textContent =
      toPersianNumber(
        properties.filter(
          property => property.status === "موجود"
        ).length
      );
  }


  if (specialCount) {
    specialCount.textContent =
      toPersianNumber(
        properties.filter(
          property => property.special === true
        ).length
      );
  }
}


/* =====================================================
   فایل ملکی - فرم
   ===================================================== */

function openPropertyForm(propertyId = null) {

  const modal =
    document.getElementById("propertyModal");


  if (!modal) return;


  modal.style.display = "flex";


  document.getElementById("propertyId").value =
    propertyId || "";


  if (!propertyId) {

    document.getElementById("propertyModalTitle").textContent =
      "ثبت فایل جدید";


    clearPropertyForm();

    return;
  }


  const property =
    properties.find(
      item => item.id === propertyId
    );


  if (!property) return;


  document.getElementById("propertyModalTitle").textContent =
    "ویرایش فایل";


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


function clearPropertyForm() {

  document.getElementById("propertyId").value = "";

  document.getElementById("propertyType").value =
    "آپارتمان";

  document.getElementById("propertyArea").value = "";

  document.getElementById("propertySize").value = "";

  document.getElementById("propertyPrice").value = "";

  document.getElementById("propertyRooms").value = "";

  document.getElementById("propertyFloor").value = "";

  document.getElementById("propertyAge").value = "";

  document.getElementById("propertyParking").checked = false;

  document.getElementById("propertyElevator").checked = false;

  document.getElementById("propertyStorage").checked = false;

  document.getElementById("propertySpecial").checked = false;

  document.getElementById("propertyStatus").value =
    "موجود";

  document.getElementById("propertyDescription").value =
    "";
}


/* =====================================================
   ذخیره فایل
   ===================================================== */

function saveProperty() {

  const id =
    document.getElementById("propertyId").value;


  const type =
    document.getElementById("propertyType").value;


  const area =
    document.getElementById("propertyArea").value.trim();


  const size =
    Number(
      normalizeNumber(
        document.getElementById("propertySize").value
      )
    ) || 0;


  const price =
    Number(
      normalizeNumber(
        document.getElementById("propertyPrice").value
      )
    ) || 0;


  const rooms =
    Number(
      normalizeNumber(
        document.getElementById("propertyRooms").value
      )
    ) || 0;


  const floor =
    Number(
      normalizeNumber(
        document.getElementById("propertyFloor").value
      )
    ) || 0;


  const age =
    Number(
      normalizeNumber(
        document.getElementById("propertyAge").value
      )
    ) || 0;


  const parking =
    document.getElementById("propertyParking").checked;


  const elevator =
    document.getElementById("propertyElevator").checked;


  const storage =
    document.getElementById("propertyStorage").checked;


  const special =
    document.getElementById("propertySpecial").checked;


  const status =
    document.getElementById("propertyStatus").value;


  const description =
    document
      .getElementById("propertyDescription")
      .value
      .trim();


  if (!area) {
    alert("لطفاً منطقه یا محله را وارد کنید.");
    return;
  }


  if (!size) {
    alert("لطفاً متراژ ملک را وارد کنید.");
    return;
  }


  const now =
    new Date().toISOString();


  const propertyData = {

    id: id || generateId("PROPERTY"),

    type,

    area,

    size,

    price,

    rooms,

    floor,

    age,

    parking,

    elevator,

    storage,

    special,

    status,

    description,

    updatedAt: now

  };


  if (id) {

    const index =
      properties.findIndex(
        property => property.id === id
      );


    if (index !== -1) {

      propertyData.createdAt =
        properties[index].createdAt ||
        now;

      properties[index] =
        propertyData;

    }

  } else {

    propertyData.createdAt = now;

    properties.unshift(propertyData);
  }


  saveProperties();

  closePropertyModal();

  renderProperties();

  renderLatestProperties();

  updateDashboard();


  alert(
    id
      ? "فایل با موفقیت ویرایش شد."
      : "فایل با موفقیت ثبت شد."
  );
}


/* =====================================================
   بستن فرم فایل
   ===================================================== */

function closePropertyModal() {

  const modal =
    document.getElementById("propertyModal");

  if (modal) {
    modal.style.display = "none";
  }
}


/* =====================================================
   حذف فایل
   ===================================================== */

function deleteProperty(id) {

  const property =
    properties.find(
      item => item.id === id
    );


  if (!property) return;


  const confirmDelete =
    confirm(
      `آیا از حذف فایل «${property.area}» مطمئن هستید؟`
    );


  if (!confirmDelete) return;


  properties =
    properties.filter(
      item => item.id !== id
    );


  saveProperties();

  renderProperties();

  renderLatestProperties();

  updateDashboard();


  alert("فایل حذف شد.");
}


/* =====================================================
   نمایش فایل‌ها
   ===================================================== */

function renderProperties() {

  const container =
    document.getElementById("propertyList");


  if (!container) return;


  let list =
    [...properties];


  const search =
    (
      document.getElementById("propertySearch")
        ?.value || ""
    )
      .trim()
      .toLowerCase();


  const filterType =
    document.getElementById("filterType")
      ?.value || "";


  const filterArea =
    (
      document.getElementById("filterArea")
        ?.value || ""
    )
      .trim()
      .toLowerCase();


  const minSize =
    Number(
      normalizeNumber(
        document.getElementById("filterMinSize")
          ?.value
      )
    ) || 0;


  const maxSize =
    Number(
      normalizeNumber(
        document.getElementById("filterMaxSize")
          ?.value
      )
    ) || Infinity;


  const minPrice =
    Number(
      normalizeNumber(
        document.getElementById("filterMinPrice")
          ?.value
      )
    ) || 0;


  const maxPrice =
    Number(
      normalizeNumber(
        document.getElementById("filterMaxPrice")
          ?.value
      )
    ) || Infinity;


  const filterStatus =
    document.getElementById("filterStatus")
      ?.value || "";


  const filterSpecial =
    document.getElementById("filterSpecial")
      ?.value || "";


  const sort =
    document.getElementById("propertySort")
      ?.value || "newest";


  list =
    list.filter(property => {

      const searchableText = [
        property.type,
        property.area,
        property.description
      ]
        .join(" ")
        .toLowerCase();


      if (
        search &&
        !searchableText.includes(search)
      ) {
        return false;
      }


      if (
        filterType &&
        property.type !== filterType
      ) {
        return false;
      }


      if (
        filterArea &&
        !String(property.area)
          .toLowerCase()
          .includes(filterArea)
      ) {
        return false;
      }


      if (
        property.size < minSize ||
        property.size > maxSize
      ) {
        return false;
      }


      if (
        property.price < minPrice ||
        property.price > maxPrice
      ) {
        return false;
      }


      if (
        filterStatus &&
        property.status !== filterStatus
      ) {
        return false;
      }


      if (
        filterSpecial === "true" &&
        property.special !== true
      ) {
        return false;
      }


      if (
        filterSpecial === "false" &&
        property.special === true
      ) {
        return false;
      }


      return true;
    });


  list.sort((a, b) => {

    if (sort === "oldest") {
      return new Date(a.createdAt) -
             new Date(b.createdAt);
    }


    if (sort === "priceLow") {
      return Number(a.price) -
             Number(b.price);
    }


    if (sort === "priceHigh") {
      return Number(b.price) -
             Number(a.price);
    }


    if (sort === "sizeLow") {
      return Number(a.size) -
             Number(b.size);
    }


    if (sort === "sizeHigh") {
      return Number(b.size) -
             Number(a.size);
    }


    return (
      new Date(b.createdAt) -
      new Date(a.createdAt)
    );
  });


  const count =
    document.getElementById("propertyResultCount");


  if (count) {

    count.textContent =
      toPersianNumber(list.length) +
      " فایل";
  }


  if (!list.length) {

    container.innerHTML = `
      <div class="panel">
        <h3>📭 فایلی پیدا نشد</h3>
        <p>هنوز فایلی با این مشخصات ثبت نشده است.</p>
      </div>
    `;

    return;
  }


  container.innerHTML =
    list.map(
      property => propertyCardHTML(property)
    ).join("");
}


/* =====================================================
   کارت فایل
   ===================================================== */

function propertyCardHTML(property) {

  return `
    <div class="property-card">

      <div class="property-card-header">

        <div>
          <h3>
            ${escapeHTML(property.type)}
            ${property.special ? " ⭐" : ""}
          </h3>

          <span>
            📍 ${escapeHTML(property.area)}
          </span>
        </div>

        <strong>
          ${escapeHTML(property.status)}
        </strong>

      </div>


      <div class="property-info">

        <span>
          📐 ${toPersianNumber(property.size)} متر
        </span>

        <span>
          🛏️ ${toPersianNumber(property.rooms)} خواب
        </span>

        <span>
          🏢 طبقه ${toPersianNumber(property.floor)}
        </span>

        <span>
          🏗️ ساخت ${toPersianNumber(property.age)}
        </span>

      </div>


      <div class="property-features">

        ${property.parking ? "<span>🚗 پارکینگ</span>" : ""}

        ${property.elevator ? "<span>🛗 آسانسور</span>" : ""}

        ${property.storage ? "<span>📦 انباری</span>" : ""}

      </div>


      <div class="property-price">

        💰 ${formatPrice(property.price)}

      </div>


      ${
        property.description
          ? `
            <p class="property-description">
              ${escapeHTML(property.description)}
            </p>
          `
          : ""
      }


      <div class="card-actions">

        <button
          class="secondary-button"
          onclick="openPropertyForm('${property.id}')"
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


/* =====================================================
   فایل‌های آخرین
   ===================================================== */

function renderLatestProperties() {

  const container =
    document.getElementById("latestProperties");


  if (!container) return;


  const latest =
    properties.slice(0, 5);


  if (!latest.length) {

    container.innerHTML = `
      <div class="panel">
        <p>هنوز فایلی ثبت نشده است.</p>
      </div>
    `;

    return;
  }


  container.innerHTML =
    latest
      .map(
        property => `
          <div class="latest-property">

            <strong>
              ${escapeHTML(property.type)}
            </strong>

            <span>
              📍 ${escapeHTML(property.area)}
            </span>

            <span>
              ${toPersianNumber(property.size)} متر
            </span>

            <strong>
              ${formatPrice(property.price)}
            </strong>

          </div>
        `
      )
      .join("");
}


/* =====================================================
   فیلترها
   ===================================================== */

function resetFilters() {

  const ids = [
    "propertySearch",
    "filterArea",
    "filterMinSize",
    "filterMaxSize",
    "filterMinPrice",
    "filterMaxPrice"
  ];


  ids.forEach(id => {

    const element =
      document.getElementById(id);

    if (element) {
      element.value = "";
    }
  });


  document.getElementById("filterType").value = "";

  document.getElementById("filterStatus").value = "";

  document.getElementById("filterSpecial").value = "";

  document.getElementById("propertySort").value = "newest";


  renderProperties();
}


/* =====================================================
   مشتری - فرم
   ===================================================== */

function openCustomerForm(customerId = null) {

  const modal =
    document.getElementById("customerModal");


  if (!modal) return;


  modal.style.display = "flex";


  document.getElementById("customerId").value =
    customerId || "";


  if (!customerId) {

    document.getElementById("customerModalTitle").textContent =
      "ثبت مشتری جدید";

    clearCustomerForm();

    return;
  }


  const customer =
    customers.find(
      item => item.id === customerId
    );


  if (!customer) return;


  document.getElementById("customerModalTitle").textContent =
    "ویرایش مشتری";


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


function clearCustomerForm() {

  document.getElementById("customerId").value = "";

  document.getElementById("customerName").value = "";

  document.getElementById("customerPhone").value = "";

  document.getElementById("customerType").value = "خرید";

  document.getElementById("customerArea").value = "";

  document.getElementById("customerMinSize").value = "";

  document.getElementById("customerMaxSize").value = "";

  document.getElementById("customerMinPrice").value = "";

  document.getElementById("customerMaxPrice").value = "";

  document.getElementById("customerRooms").value = "";

  document.getElementById("customerAge").value = "";

  document.getElementById("customerParking").checked = false;

  document.getElementById("customerElevator").checked = false;

  document.getElementById("customerStorage").checked = false;

  document.getElementById("customerDescription").value = "";
}


/* =====================================================
   ذخیره مشتری
   ===================================================== */

function saveCustomer() {

  const id =
    document.getElementById("customerId").value;


  const name =
    document
      .getElementById("customerName")
      .value
      .trim();


  const phone =
    normalizePhone(
      document.getElementById("customerPhone").value
    );


  const type =
    document.getElementById("customerType").value;


  const area =
    document
      .getElementById("customerArea")
      .value
      .trim();


  const minSize =
    Number(
      normalizeNumber(
        document.getElementById("customerMinSize").value
      )
    ) || 0;


  const maxSize =
    Number(
      normalizeNumber(
        document.getElementById("customerMaxSize").value
      )
    ) || 0;


  const minPrice =
    Number(
      normalizeNumber(
        document.getElementById("customerMinPrice").value
      )
    ) || 0;


  const maxPrice =
    Number(
      normalizeNumber(
        document.getElementById("customerMaxPrice").value
      )
    ) || 0;


  const rooms =
    Number(
      normalizeNumber(
        document.getElementById("customerRooms").value
      )
    ) || 0;


  const age =
    Number(
      normalizeNumber(
        document.getElementById("customerAge").value
      )
    ) || 0;


  const parking =
    document.getElementById("customerParking").checked;


  const elevator =
    document.getElementById("customerElevator").checked;


  const storage =
    document.getElementById("customerStorage").checked;


  const description =
    document
      .getElementById("customerDescription")
      .value
      .trim();


  if (!name) {
    alert("لطفاً نام مشتری را وارد کنید.");
    return;
  }


  if (!isValidPhone(phone)) {
    alert("لطفاً شماره موبایل صحیح مشتری را وارد کنید.");
    return;
  }


  if (!area) {
    alert("لطفاً منطقه موردنظر مشتری را وارد کنید.");
    return;
  }


  const now =
    new Date().toISOString();


  const customerData = {

    id: id || generateId("CUSTOMER"),

    name,

    phone,

    type,

    area,

    minSize,

    maxSize,

    minPrice,

    maxPrice,

    rooms,

    age,

    parking,

    elevator,

    storage,

    description,

    updatedAt: now
  };


  if (id) {

    const index =
      customers.findIndex(
        customer => customer.id === id
      );


    if (index !== -1) {

      customerData.createdAt =
        customers[index].createdAt ||
        now;

      customers[index] =
        customerData;
    }

  } else {

    customerData.createdAt = now;

    customers.unshift(customerData);
  }


  saveCustomers();

  closeCustomerModal();

  renderCustomers();

  updateDashboard();


  alert(
    id
      ? "مشتری با موفقیت ویرایش شد."
      : "مشتری با موفقیت ثبت شد."
  );
}


/* =====================================================
   بستن فرم مشتری
   ===================================================== */

function closeCustomerModal() {

  const modal =
    document.getElementById("customerModal");

  if (modal) {
    modal.style.display = "none";
  }
}


/* =====================================================
   نمایش مشتری‌ها
   ===================================================== */

function renderCustomers() {

  const container =
    document.getElementById("customerList");


  if (!container) return;


  const search =
    (
      document.getElementById("customerSearch")
        ?.value || ""
    )
      .trim()
      .toLowerCase();


  let list =
    [...customers];


  if (search) {

    list =
      list.filter(customer => {

        return [
          customer.name,
          customer.phone,
          customer.area,
          customer.type,
          customer.description
        ]
          .join(" ")
          .toLowerCase()
          .includes(search);
      });
  }


  if (!list.length) {

    container.innerHTML = `
      <div class="panel">
        <h3>📭 مشتری‌ای پیدا نشد</h3>
        <p>هنوز مشتری‌ای با این مشخصات ثبت نشده است.</p>
      </div>
    `;

    return;
  }


  container.innerHTML =
    list
      .map(
        customer => customerCardHTML(customer)
      )
      .join("");
}


/* =====================================================
   کارت مشتری
   ===================================================== */

function customerCardHTML(customer) {

  return `
    <div class="customer-card">

      <div class="customer-card-header">

        <div>

          <h3>
            👤 ${escapeHTML(customer.name)}
          </h3>

          <span>
            📱 ${escapeHTML(customer.phone)}
          </span>

        </div>

        <strong>
          ${escapeHTML(customer.type)}
        </strong>

      </div>


      <div class="customer-info">

        <span>
          📍 ${escapeHTML(customer.area)}
        </span>

        ${
          customer.minSize || customer.maxSize
            ? `
              <span>
                📐
                ${customer.minSize
                  ? toPersianNumber(customer.minSize)
                  : "۰"}
                تا
                ${customer.maxSize
                  ? toPersianNumber(customer.maxSize)
                  : "∞"}
                متر
              </span>
            `
            : ""
        }


        ${
          customer.minPrice || customer.maxPrice
            ? `
              <span>
                💰 بودجه:
                ${customer.minPrice
                  ? formatPrice(customer.minPrice)
                  : "توافقی"}
                تا
                ${customer.maxPrice
                  ? formatPrice(customer.maxPrice)
                  : "توافقی"}
              </span>
            `
            : ""
        }


        ${
          customer.rooms
            ? `
              <span>
                🛏️ ${toPersianNumber(customer.rooms)}
                خواب
              </span>
            `
            : ""
        }

      </div>


      <div class="customer-features">

        ${customer.parking ? "<span>🚗 پارکینگ</span>" : ""}

        ${customer.elevator ? "<span>🛗 آسانسور</span>" : ""}

        ${customer.storage ? "<span>📦 انباری</span>" : ""}

      </div>


      ${
        customer.description
          ? `
            <p class="customer-description">
              ${escapeHTML(customer.description)}
            </p>
          `
          : ""
      }


      <div class="card-actions">

        <button
          class="secondary-button"
          onclick="openCustomerForm('${customer.id}')"
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


/* =====================================================
   حذف مشتری
   ===================================================== */

function deleteCustomer(id) {

  const customer =
    customers.find(
      item => item.id === id
    );


  if (!customer) return;


  if (
    !confirm(
      `آیا از حذف مشتری «${customer.name}» مطمئن هستید؟`
    )
  ) {
    return;
  }


  customers =
    customers.filter(
      item => item.id !== id
    );


  saveCustomers();

  renderCustomers();

  updateDashboard();


  alert("مشتری حذف شد.");
}


/* =====================================================
   اطلاعات حساب
   ===================================================== */

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
        ? "فعال ✅"
        : "منقضی ❌";
  }


  if (date) {

    if (currentUser.subscriptionExpires) {

      const expiration =
        new Date(
          currentUser.subscriptionExpires
        );


      date.textContent =
        expiration.toLocaleDateString(
          "fa-IR"
        );

    } else {

      date.textContent = "-";
    }
  }
}


/* =====================================================
   پشتیبان‌گیری
   ===================================================== */

function backupData() {

  const backup = {

    app: APP_CONFIG.appName,

    version: APP_CONFIG.version,

    exportedAt:
      new Date().toISOString(),

    user: currentUser,

    properties,

    customers

  };


  const json =
    JSON.stringify(
      backup,
      null,
      2
    );


  const blob =
    new Blob(
      [json],
      {
        type: "application/json"
      }
    );


  const url =
    URL.createObjectURL(blob);


  const link =
    document.createElement("a");


  link.href = url;

  link.download =
    "amlak-smart-backup-" +
    new Date()
      .toISOString()
      .slice(0, 10) +
    ".json";


  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);


  alert(
    "نسخه پشتیبان با موفقیت آماده شد."
  );
}


/* =====================================================
   بازیابی پشتیبان
   ===================================================== */

function restoreData(event) {

  const file =
    event.target.files?.[0];


  if (!file) return;


  const reader =
    new FileReader();


  reader.onload = function () {

    try {

      const backup =
        JSON.parse(reader.result);


      if (
        !backup ||
        !Array.isArray(backup.properties) ||
        !Array.isArray(backup.customers)
      ) {

        throw new Error(
          "فرمت فایل پشتیبان صحیح نیست."
        );
      }


      if (
        !confirm(
          "با بازیابی پشتیبان، اطلاعات فعلی جایگزین می‌شوند. ادامه می‌دهید؟"
        )
      ) {

        event.target.value = "";

        return;
      }


      properties =
        backup.properties;

      customers =
        backup.customers;


      if (backup.user) {
        currentUser = backup.user;
      }


      saveProperties();

      saveCustomers();

      saveUser();


      renderProperties();

      renderCustomers();

      renderLatestProperties();

      updateDashboard();

      updateAccountInfo();


      alert(
        "اطلاعات با موفقیت بازیابی شد."
      );

    } catch (error) {

      console.error(error);

      alert(
        "فایل پشتیبان معتبر نیست."
      );
    }


    event.target.value = "";
  };


  reader.readAsText(file);
}


/* =====================================================
   رویدادهای جستجو و فیلتر
   ===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const propertySearch =
      document.getElementById("propertySearch");


    if (propertySearch) {
      propertySearch.addEventListener(
        "input",
        renderProperties
      );
    }


    [
      "filterType",
      "filterArea",
      "filterMinSize",
      "filterMaxSize",
      "filterMinPrice",
      "filterMaxPrice",
      "filterStatus",
      "filterSpecial",
      "propertySort"
    ]
      .forEach(id => {

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
      document.getElementById("customerSearch");


    if (customerSearch) {

      customerSearch.addEventListener(
        "input",
        renderCustomers
      );
    }


    /*
     اگر کاربر قبلاً وارد شده باشد،
     برنامه را مستقیماً باز می‌کنیم.
    */

    if (
      currentUser &&
      currentUser.subscriptionActive &&
      isSubscriptionValid()
    ) {

      openApplication();

    } else {

      document.getElementById("authScreen").style.display =
        "flex";

      document.getElementById("appScreen").style.display =
        "none";

    }
  }
);


/* =====================================================
   کلیک بیرون از مودال
   ===================================================== */

window.addEventListener(
  "click",
  event => {

    const propertyModal =
      document.getElementById("propertyModal");


    const customerModal =
      document.getElementById("customerModal");


    if (
      event.target === propertyModal
    ) {
      closePropertyModal();
    }


    if (
      event.target === customerModal
    ) {
      closeCustomerModal();
    }
  }
);


/* =====================================================
   آماده‌سازی اولیه
   ===================================================== */

window.addEventListener(
  "load",
  () => {

    updateDashboard();

    renderProperties();

    renderCustomers();

    renderLatestProperties();

    updateAccountInfo();

  }
);
