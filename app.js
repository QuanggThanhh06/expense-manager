const API_BASE_URL = "https://expense-manager-api-2ol5.onrender.com";

// ===============================
// DOM ELEMENTS
// ===============================
const introSection = document.getElementById("introSection");
const registerSection = document.getElementById("registerSection");
const loginSection = document.getElementById("loginSection");

const openRegisterBtn = document.getElementById("openRegisterBtn");
const openLoginBtn = document.getElementById("openLoginBtn");
const switchToLogin = document.getElementById("switchToLogin");
const switchToRegister = document.getElementById("switchToRegister");

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");

const registerName = document.getElementById("registerName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const messageBox = document.getElementById("messageBox");
const languageToggle = document.getElementById("languageToggle");

const forgotModal = document.getElementById("forgotModal");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const closeForgotModal = document.getElementById("closeForgotModal");
const forgotEmail = document.getElementById("forgotEmail");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const otpInput = document.getElementById("otpInput");
const newPassword = document.getElementById("newPassword");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");

const slideContent = document.getElementById("slideContent");
const visualTop = document.getElementById("visualTop");
const visualMiddle = document.getElementById("visualMiddle");
const visualBottom = document.getElementById("visualBottom");

const serviceIcon1 = document.getElementById("serviceIcon1");
const serviceIcon2 = document.getElementById("serviceIcon2");
const serviceIcon3 = document.getElementById("serviceIcon3");

const dots = document.querySelectorAll(".dot");

// ===============================
// STATE
// ===============================
let currentLanguage = "vi";
let currentSlide = 0;
let slideInterval = null;

let startX = 0;
let endX = 0;
let isDragging = false;

// ===============================
// DATA
// ===============================
const slideData = {
  vi: [
    {
      visualTop: "💸",
      visualMiddle: "Expense Manager",
      visualBottom: "Quản lý chi tiêu thông minh mỗi ngày",
      service1: "Giảm các khoản chi không cần thiết",
      service2: "Tiết kiệm đều đặn hằng tháng",
      service3: "Quản lý tài chính tất cả ở một nơi",
      serviceIcon1: "💸",
      serviceIcon2: "🐷",
      serviceIcon3: "📊",
      heroTitle: "Quản lý tài chính hiệu quả với Expense Manager"
    },
    {
      visualTop: "📉",
      visualMiddle: "Cắt giảm chi tiêu",
      visualBottom: "Theo dõi các khoản phát sinh và kiểm soát ngân sách",
      service1: "Phân tích các khoản chi theo ngày",
      service2: "Xem tổng tiền theo tháng",
      service3: "Giúp bạn chi tiêu hợp lý hơn",
      serviceIcon1: "📅",
      serviceIcon2: "💰",
      serviceIcon3: "✅",
      heroTitle: "Cắt giảm những chi phí không cần thiết"
    },
    {
      visualTop: "🏦",
      visualMiddle: "Tiết kiệm thông minh",
      visualBottom: "Xây dựng thói quen tích lũy đều đặn",
      service1: "Lưu lại các khoản chi tiêu nhanh chóng",
      service2: "Theo dõi số tiền đã tiết kiệm",
      service3: "Hỗ trợ lập mục tiêu tài chính",
      serviceIcon1: "📝",
      serviceIcon2: "🏆",
      serviceIcon3: "🎯",
      heroTitle: "Gia tăng tiết kiệm đều đặn hằng tháng"
    },
    {
      visualTop: "🧾",
      visualMiddle: "OCR hóa đơn",
      visualBottom: "Quét hóa đơn và tự động gợi ý số tiền",
      service1: "Đọc chữ trên ảnh hóa đơn",
      service2: "Trích xuất số tiền cần thanh toán",
      service3: "Tiết kiệm thời gian nhập liệu",
      serviceIcon1: "📷",
      serviceIcon2: "🔍",
      serviceIcon3: "⚡",
      heroTitle: "Quét hóa đơn nhanh chóng bằng OCR"
    },
    {
      visualTop: "🔒",
      visualMiddle: "Dữ liệu an toàn",
      visualBottom: "Thông tin của bạn luôn được quản lý cẩn thận",
      service1: "Đăng nhập cá nhân bảo mật",
      service2: "Lưu dữ liệu theo tài khoản riêng",
      service3: "Theo dõi tài chính an tâm hơn",
      serviceIcon1: "🔐",
      serviceIcon2: "👤",
      serviceIcon3: "🛡️",
      heroTitle: "Đảm bảo thông tin của bạn luôn được bảo mật"
    }
  ],

  en: [
    {
      visualTop: "💸",
      visualMiddle: "Expense Manager",
      visualBottom: "Manage your daily spending smartly",
      service1: "Reduce unnecessary expenses",
      service2: "Save consistently every month",
      service3: "Manage all your finances in one place",
      serviceIcon1: "💸",
      serviceIcon2: "🐷",
      serviceIcon3: "📊",
      heroTitle: "Manage your finances effectively with Expense Manager"
    },
    {
      visualTop: "📉",
      visualMiddle: "Cut Expenses",
      visualBottom: "Track spending and control your budget better",
      service1: "Analyze daily expenses",
      service2: "See your monthly total",
      service3: "Spend more wisely",
      serviceIcon1: "📅",
      serviceIcon2: "💰",
      serviceIcon3: "✅",
      heroTitle: "Reduce unnecessary spending"
    },
    {
      visualTop: "🏦",
      visualMiddle: "Smart Savings",
      visualBottom: "Build a better saving habit every month",
      service1: "Record expenses quickly",
      service2: "Track money saved",
      service3: "Support financial goals",
      serviceIcon1: "📝",
      serviceIcon2: "🏆",
      serviceIcon3: "🎯",
      heroTitle: "Increase your monthly savings"
    },
    {
      visualTop: "🧾",
      visualMiddle: "Receipt OCR",
      visualBottom: "Scan receipts and auto-detect amounts",
      service1: "Read text from receipt images",
      service2: "Extract total payment amount",
      service3: "Save data entry time",
      serviceIcon1: "📷",
      serviceIcon2: "🔍",
      serviceIcon3: "⚡",
      heroTitle: "Scan receipts quickly with OCR"
    },
    {
      visualTop: "🔒",
      visualMiddle: "Secure Data",
      visualBottom: "Your financial information is handled safely",
      service1: "Secure personal login",
      service2: "Private account-based data",
      service3: "Track finances with confidence",
      serviceIcon1: "🔐",
      serviceIcon2: "👤",
      serviceIcon3: "🛡️",
      heroTitle: "Keep your information safe and secure"
    }
  ]
};

const translations = {
  vi: {
    languageButton: "Tiếng Việt",
    openRegisterBtn: "Đăng ký miễn phí",
    openLoginBtn: "Đăng nhập",
    registerTitle: "Tạo tài khoản",
    registerDesc: "Đăng ký để bắt đầu quản lý chi tiêu của bạn",
    loginTitle: "Đăng nhập",
    loginDesc: "Chào mừng bạn quay trở lại",
    haveAccountText: "Đã có tài khoản?",
    noAccountText: "Chưa có tài khoản?",
    switchToLogin: "Đăng nhập",
    switchToRegister: "Đăng ký",
    required: "Vui lòng nhập đầy đủ thông tin",
    serverError: "Không thể kết nối tới server"
  },

  en: {
    languageButton: "English",
    openRegisterBtn: "Sign up for free",
    openLoginBtn: "Log in",
    registerTitle: "Create account",
    registerDesc: "Sign up to start managing your expenses",
    loginTitle: "Log in",
    loginDesc: "Welcome back",
    haveAccountText: "Already have an account?",
    noAccountText: "Don't have an account?",
    switchToLogin: "Log in",
    switchToRegister: "Sign up",
    required: "Please fill in all required fields",
    serverError: "Cannot connect to server"
  }
};

// ===============================
// COMMON FUNCTIONS
// ===============================
function showMessage(message, type) {
  messageBox.textContent = message;
  messageBox.className = `message-box ${type}`;
}

function hideMessage() {
  messageBox.textContent = "";
  messageBox.className = "message-box";
}

function isStrongPassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}

// ===============================
// SHOW / HIDE SECTION
// ===============================
function showIntro() {
  introSection.classList.remove("hidden");
  registerSection.classList.add("hidden");
  loginSection.classList.add("hidden");
  hideMessage();
  startAutoSlide();
}

function showRegister() {
  introSection.classList.add("hidden");
  registerSection.classList.remove("hidden");
  loginSection.classList.add("hidden");
  hideMessage();
  stopAutoSlide();
}

function showLogin() {
  introSection.classList.add("hidden");
  registerSection.classList.add("hidden");
  loginSection.classList.remove("hidden");
  hideMessage();
  stopAutoSlide();
}

window.showIntro = showIntro;

openRegisterBtn.addEventListener("click", showRegister);
openLoginBtn.addEventListener("click", showLogin);
switchToLogin.addEventListener("click", showLogin);
switchToRegister.addEventListener("click", showRegister);

// ===============================
// LANGUAGE
// ===============================
function applyLanguage(lang) {
  currentLanguage = lang;
  const t = translations[lang];

  languageToggle.textContent = t.languageButton;
  openRegisterBtn.textContent = t.openRegisterBtn;
  openLoginBtn.textContent = t.openLoginBtn;

  document.getElementById("registerTitle").textContent = t.registerTitle;
  document.getElementById("registerDesc").textContent = t.registerDesc;
  document.getElementById("loginTitle").textContent = t.loginTitle;
  document.getElementById("loginDesc").textContent = t.loginDesc;
  document.getElementById("haveAccountText").textContent = t.haveAccountText;
  document.getElementById("noAccountText").textContent = t.noAccountText;

  switchToLogin.textContent = t.switchToLogin;
  switchToRegister.textContent = t.switchToRegister;

  renderSlide(currentSlide, false);
}

languageToggle.addEventListener("click", () => {
  applyLanguage(currentLanguage === "vi" ? "en" : "vi");
});

// ===============================
// SLIDES
// ===============================
function renderSlide(index, animate = true) {
  const slides = slideData[currentLanguage];
  const slide = slides[index];

  if (animate) {
    slideContent.classList.remove("fade-in");
    slideContent.classList.add("fade-out");

    setTimeout(() => {
      updateSlideContent(slide, index);
      slideContent.classList.remove("fade-out");
      slideContent.classList.add("fade-in");
    }, 250);
  } else {
    updateSlideContent(slide, index);
  }
}

function updateSlideContent(slide, index) {
  visualTop.textContent = slide.visualTop;
  visualMiddle.textContent = slide.visualMiddle;
  visualBottom.textContent = slide.visualBottom;

  serviceIcon1.textContent = slide.serviceIcon1;
  serviceIcon2.textContent = slide.serviceIcon2;
  serviceIcon3.textContent = slide.serviceIcon3;

  document.getElementById("service1").textContent = slide.service1;
  document.getElementById("service2").textContent = slide.service2;
  document.getElementById("service3").textContent = slide.service3;
  document.getElementById("heroTitle").textContent = slide.heroTitle;

  dots.forEach((dot) => dot.classList.remove("active"));

  if (dots[index]) {
    dots[index].classList.add("active");
  }
}

function nextSlide() {
  const slides = slideData[currentLanguage];
  currentSlide = (currentSlide + 1) % slides.length;
  renderSlide(currentSlide, true);
}

function prevSlide() {
  const slides = slideData[currentLanguage];
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  renderSlide(currentSlide, true);
}

function startAutoSlide() {
  stopAutoSlide();
  slideInterval = setInterval(nextSlide, 3500);
}

function stopAutoSlide() {
  if (slideInterval) {
    clearInterval(slideInterval);
    slideInterval = null;
  }
}

dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    currentSlide = Number(dot.dataset.index);
    renderSlide(currentSlide, true);
    startAutoSlide();
  });
});

// ===============================
// REGISTER
// ===============================
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = registerName.value.trim();
  const email = registerEmail.value.trim();
  const password = registerPassword.value.trim();
  const t = translations[currentLanguage];

  if (!name || !email || !password) {
    showMessage("Vui lòng nhập đầy đủ tên, email và mật khẩu", "error");
    return;
  }

  if (!isStrongPassword(password)) {
    showMessage(
      "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số",
      "error"
    );
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      showMessage(data.message || "Đăng ký thành công", "success");
      registerForm.reset();

      setTimeout(() => {
        showLogin();
      }, 800);
    } else {
      showMessage(data.message || "Đăng ký thất bại", "error");
    }
  } catch (error) {
    showMessage(t.serverError, "error");
  }
});

// ===============================
// LOGIN
// ===============================
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();
  const t = translations[currentLanguage];

  if (!email || !password) {
    showMessage(t.required, "error");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      showMessage(data.message, "success");
      localStorage.setItem("user", JSON.stringify(data.user));

      setTimeout(() => {
        if (data.user.role === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "dashboard.html";
        }
      }, 800);
    } else {
      showMessage(data.message || "Đăng nhập thất bại", "error");
    }
  } catch (error) {
    showMessage(t.serverError, "error");
  }
});

// ===============================
// FORGOT PASSWORD
// ===============================
forgotPasswordBtn.addEventListener("click", () => {
  forgotModal.classList.remove("hidden");
});

closeForgotModal.addEventListener("click", () => {
  forgotModal.classList.add("hidden");
});

sendOtpBtn.addEventListener("click", async () => {
  const email = forgotEmail.value.trim();

  if (!email) {
    alert("Vui lòng nhập email");
    return;
  }

  try {
    sendOtpBtn.textContent = "Đang gửi...";
    sendOtpBtn.disabled = true;

    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    alert(data.message);
  } catch (error) {
    alert("Không thể kết nối tới server");
  } finally {
    sendOtpBtn.textContent = "Gửi mã OTP";
    sendOtpBtn.disabled = false;
  }
});

resetPasswordBtn.addEventListener("click", async () => {
  const email = forgotEmail.value.trim();
  const otp = otpInput.value.trim();
  const password = newPassword.value.trim();

  if (!email || !otp || !password) {
    alert("Vui lòng nhập đầy đủ email, OTP và mật khẩu mới");
    return;
  }

  if (!isStrongPassword(password)) {
    alert("Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số");
    return;
  }

  try {
    resetPasswordBtn.textContent = "Đang xử lý...";
    resetPasswordBtn.disabled = true;

    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        otp,
        newPassword: password
      })
    });

    const data = await response.json();

    alert(data.message);

    if (response.ok) {
      forgotModal.classList.add("hidden");

      forgotEmail.value = "";
      otpInput.value = "";
      newPassword.value = "";

      showLogin();
    }
  } catch (error) {
    alert("Không thể kết nối tới server");
  } finally {
    resetPasswordBtn.textContent = "Đặt lại mật khẩu";
    resetPasswordBtn.disabled = false;
  }
});

// ===============================
// SWIPE SLIDES
// ===============================
slideContent.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
  isDragging = true;
});

slideContent.addEventListener("touchmove", (e) => {
  if (!isDragging) return;
  endX = e.touches[0].clientX;
});

slideContent.addEventListener("touchend", () => {
  if (!isDragging) return;

  const diffX = startX - endX;

  if (Math.abs(diffX) > 50) {
    diffX > 0 ? nextSlide() : prevSlide();
    startAutoSlide();
  }

  startX = 0;
  endX = 0;
  isDragging = false;
});

slideContent.addEventListener("mousedown", (e) => {
  startX = e.clientX;
  isDragging = true;
});

slideContent.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  endX = e.clientX;
});

slideContent.addEventListener("mouseup", () => {
  if (!isDragging) return;

  const diffX = startX - endX;

  if (Math.abs(diffX) > 50) {
    diffX > 0 ? nextSlide() : prevSlide();
    startAutoSlide();
  }

  startX = 0;
  endX = 0;
  isDragging = false;
});

slideContent.addEventListener("mouseleave", () => {
  isDragging = false;
});

// ===============================
// INIT
// ===============================
applyLanguage("vi");
renderSlide(0, false);
showIntro();