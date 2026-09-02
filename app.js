/* =====================================================
   املاک هوشمند
   نسخه 1.0.0
   سیستم مدیریت فایل، مشتری و اشتراک
   ===================================================== */


/* =====================================================
   تنظیمات برنامه
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
   دریافت اطلاعات
   ===================================================== */

let currentUser =
  JSON.parse(
    localStorage.getItem(STORAGE.user)
  ) || null;


let properties =
  JSON.parse(
    localStorage.getItem(STORAGE.properties)
  ) || [];


let customers =
  JSON.parse(
    localStorage.getItem(STORAGE.customers)
  ) || [];


/* =====================================================
   ذخیره اطلاعات
   ===================================================== */

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

  return Number(number)
    .toLocaleString("fa-IR");

}


function normalizePhone(phone) {

  return String(phone || "")
    .replace(/[۰-۹]/g, digit =>
      "۰۱۲۳۴۵۶۷۸۹".indexOf(digit)
    )
    .replace(/\D/g, "");

}


function isValidPhone(phone) {

  const value =
    normalizePhone(phone);

  return /^09\d{9}$/.test(value);

}


/* =====================================================
   صفحه‌های ورود
   ===================================================== */

function showLogin() {

  document.getElementById("loginPage").style.display =
    "block";

  document.getElementById("registerPage").style.display =
    "none";

  document.getElementById("paymentPage").style.display =
    "none";

}


function showRegister() {

  document.getElementById("loginPage").style.display =
    "none";

  document.getElementById("registerPage").style.display =
    "block";

  document.getElementById("paymentPage").style.display =
    "none";

}


function showPayment() {

  document.getElementById("loginPage").style.display =
    "none";

  document.getElementById("registerPage").style.display =
    "none";

  document.getElementById("paymentPage").style.display =
    "block";

}


/* =====================================================
   ثبت نام
   ===================================================== */

function register() {

  const name =
    document
      .getElementById("registerName")
      .value
      .trim();


  const phone =
    normalizePhone(
      document
        .getElementById("registerPhone")
        .value
    );


  const terms =
    document
      .getElementById("terms")
      .checked;


  if (!name) {

    alert(
      "لطفاً نام و نام خانوادگی را وارد کنید."
    );

    return;

  }


  if (!isValidPhone(phone)) {

    alert(
      "شماره موبایل صحیح نیست."
    );

    return;

  }


  if (!terms) {

    alert(
      "لطفاً قوانین استفاده را تأیید کنید."
    );

    return;

  }


  currentUser = {

    id:
      currentUser?.id ||
      generateId("USER"),

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

  const phone =
    normalizePhone(
      document
        .getElementById("loginPhone")
        .value
    );


  if (!isValidPhone(phone)) {

    alert(
      "لطفاً یک شماره موبایل معتبر وارد کنید."
    );

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


  /*
   در نسخه آزمایشی اگر کاربر قبلاً
   روی همین دستگاه ثبت نشده باشد،
   برای ایجاد حساب ابتدا ثبت‌نام می‌کند.
  */

  alert(
    "این شماره هنوز ثبت‌نام نشده است. ابتدا ثبت‌نام کنید."
  );

  showRegister();


  document
    .getElementById("registerPhone")
    .value = phone;

}


/* =====================================================
   پرداخت آزمایشی
   ===================================================== */

function pay() {

  /*
   توجه:
   این تابع فعلاً پرداخت واقعی انجام نمی‌دهد.

   در نسخه نهایی:
   1. درخواست به سرور ارسال می‌شود.
   2. کاربر وارد درگاه می‌شود.
   3. تراکنش در سرور بررسی می‌شود.
   4. پس از تأیید، اشتراک فعال می‌شود.
  */


  if (!currentUser) {

    alert(
      "ابتدا ثبت‌نام کنید."
    );

    showRegister();

    return;

 
