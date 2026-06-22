const API_WALLET_URL = "http://localhost:5000/api/wallet";
const API_TRANSACTION_URL = "http://localhost:5000/api/transactions";
const API_AUTH_URL = "http://localhost:5000/api/auth";
const API_USER_URL = "http://localhost:5000/api/users";
const API_SERVER_URL = "http://localhost:5000";
const API_ADMIN_URL = "http://localhost:5000/api/admin";


const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  alert("Bạn chưa đăng nhập!");
  window.location.href = "index.html";
}
let systemNotifications = [];
let transactions = [];
let overviewChart = null;
let currentReceiptImageBase64 = "";

const walletBalance = document.getElementById("walletBalance");
const walletMiniBalance = document.getElementById("walletMiniBalance");
const walletPageBalance = document.getElementById("walletPageBalance");
const totalExpense = document.getElementById("totalExpense");
const totalIncome = document.getElementById("totalIncome");
const transactionList = document.getElementById("transactionList");
const topSpendingList = document.getElementById("topSpendingList");
const accountEmail = document.getElementById("accountEmail");
const accountName = document.getElementById("accountName");

const avatarPreview = document.getElementById("avatarPreview");
const defaultAvatar = document.getElementById("defaultAvatar");

const toggleAvatarFormBtn = document.getElementById("toggleAvatarFormBtn");
const togglePasswordFormBtn = document.getElementById("togglePasswordFormBtn");

const avatarFormBox = document.getElementById("avatarFormBox");
const passwordFormBox = document.getElementById("passwordFormBox");

const avatarInput = document.getElementById("avatarInput");
const uploadAvatarBtn = document.getElementById("uploadAvatarBtn");

const changePasswordBtn = document.getElementById("changePasswordBtn");

const startQrBtn = document.getElementById("startQrBtn");
const stopQrBtn = document.getElementById("stopQrBtn");
const qrReader = document.getElementById("qrReader");

const receiptImage = document.getElementById("receiptImage");
const scanOcrBtn = document.getElementById("scanOcrBtn");
const receiptPreview = document.getElementById("receiptPreview");
const scanStatus = document.getElementById("scanStatus");
const ocrResultText = document.getElementById("ocrResultText");

const openSearchBtn = document.getElementById("openSearchBtn");
const closeSearchBtn = document.getElementById("closeSearchBtn");
const searchModal = document.getElementById("searchModal");
const searchInput = document.getElementById("searchInput");
const searchSuggestions = document.getElementById("searchSuggestions");

const openNotificationBtn = document.getElementById("openNotificationBtn");
const closeNotificationBtn = document.getElementById("closeNotificationBtn");
const notificationModal = document.getElementById("notificationModal");
const notificationList = document.getElementById("notificationList");
const notificationDot = document.getElementById("notificationDot");

const viewWalletHistoryBtn = document.getElementById("viewWalletHistoryBtn");
const viewReportBtn = document.getElementById("viewReportBtn");
const topSpendingDetailBtn = document.getElementById("topSpendingDetailBtn");

const reportModal = document.getElementById("reportModal");
const closeReportBtn = document.getElementById("closeReportBtn");


const expenseBar = document.getElementById("expenseBar");
const incomeBar = document.getElementById("incomeBar");

const prevPeriodBtn = document.getElementById("prevPeriodBtn");
const nextPeriodBtn = document.getElementById("nextPeriodBtn");
const currentPeriodText = document.getElementById("currentPeriodText");

const quickActionsGrid = document.getElementById("quickActionsGrid");
const serviceTypeSelect = document.getElementById("serviceType");




let detailReportChart = null;

let html5QrCode = null;

let reportMode = "month";
let selectedDate = new Date();
let currentPeriodTransactions = [];

if (accountName) {
  accountName.textContent = user.name || "Người dùng";
}

if (accountEmail) {
  accountEmail.textContent = user.email;
}

if (user.avatar && avatarPreview && defaultAvatar) {
  avatarPreview.src = `${API_SERVER_URL}${user.avatar}`;
  avatarPreview.classList.remove("hidden");
  defaultAvatar.classList.add("hidden");
}

function formatMoney(amount) {
  return Number(amount).toLocaleString("vi-VN") + " đ";
}

// Điều hướng footer
document.querySelectorAll("[data-page]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const pageId = btn.dataset.page;
    showPage(pageId);

    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
    });

    if (btn.classList.contains("nav-item")) {
      btn.classList.add("active");
    }
  });
});

function showPage(pageId) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active-page");
  });

  document.getElementById(pageId).classList.add("active-page");
}

// Lấy ví
async function loadWallet() {
  const res = await fetch(`${API_WALLET_URL}/${user.id}`);
  const wallet = await res.json();

  walletBalance.textContent = formatMoney(wallet.balance);
  walletMiniBalance.textContent = formatMoney(wallet.balance);
  walletPageBalance.textContent = formatMoney(wallet.balance);
}

// Lấy giao dịch
async function loadTransactions() {
  const res = await fetch(`${API_TRANSACTION_URL}/${user.id}`);
  transactions = await res.json();

  renderTransactions(transactions);
  renderOverview(transactions);
}

// Render lịch sử giao dịch
function renderTransactions(list) {
  transactionList.innerHTML = "";

  if (!list.length) {
    transactionList.innerHTML = `<p class="empty-text">Chưa có giao dịch nào</p>`;
    return;
  }

  list.forEach((tx) => {
    const isIncome = tx.type === "topup";

    const item = document.createElement("div");
    item.className = "transaction-item";

    item.innerHTML = `
  <div class="transaction-icon">${isIncome ? "💰" : "🧾"}</div>

  <div class="transaction-info">
    <h3>${isIncome ? "Nạp tiền vào ví" : tx.serviceType}</h3>
    <p>${new Date(tx.createdAt).toLocaleDateString("vi-VN")}</p>
    ${
      tx.receiptImage
        ? `<button class="view-receipt-btn" onclick="viewReceipt('${tx.receiptImage}')">Xem hóa đơn</button>`
        : ""
    }
  </div>

  <div class="transaction-amount ${isIncome ? "income" : "expense"}">
    ${isIncome ? "+" : "-"}${formatMoney(tx.amount)}
  </div>
`;

    transactionList.appendChild(item);
  });
}

// Render tổng quan

function getFilteredTransactionsByPeriod(list) {
  return list.filter((tx) => {
    const txDate = new Date(tx.createdAt);

    if (reportMode === "day") {
      return (
        txDate.getDate() === selectedDate.getDate() &&
        txDate.getMonth() === selectedDate.getMonth() &&
        txDate.getFullYear() === selectedDate.getFullYear()
      );
    }

    if (reportMode === "month") {
      return (
        txDate.getMonth() === selectedDate.getMonth() &&
        txDate.getFullYear() === selectedDate.getFullYear()
      );
    }

    if (reportMode === "year") {
      return txDate.getFullYear() === selectedDate.getFullYear();
    }
  });
}


function renderOverview(list) {
  const filteredTx = getFilteredTransactionsByPeriod(list);
  currentPeriodTransactions = filteredTx;

  const income = filteredTx
    .filter((tx) => tx.type === "topup")
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const expense = filteredTx
    .filter((tx) => tx.type === "payment")
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  totalIncome.textContent = formatMoney(income);
  totalExpense.textContent = formatMoney(expense);

  renderIncomeExpenseBars(income, expense);
  renderTopSpending(filteredTx, expense);
  updateCurrentPeriodText();
  updateNotificationDot();
}



function updateCurrentPeriodText() {
  const now = new Date();

  const isToday =
    selectedDate.toDateString() === now.toDateString();

  const isCurrentMonth =
    selectedDate.getMonth() === now.getMonth() &&
    selectedDate.getFullYear() === now.getFullYear();

  const isCurrentYear =
    selectedDate.getFullYear() === now.getFullYear();

  if (reportMode === "day") {
    currentPeriodText.textContent = isToday
      ? "Hôm nay"
      : selectedDate.toLocaleDateString("vi-VN");
  }

  if (reportMode === "month") {
    currentPeriodText.textContent = isCurrentMonth
      ? "Tháng này"
      : `Tháng ${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`;
  }

  if (reportMode === "year") {
    currentPeriodText.textContent = isCurrentYear
      ? "Năm nay"
      : `Năm ${selectedDate.getFullYear()}`;
  }
}

prevPeriodBtn.addEventListener("click", () => {
  if (reportMode === "day") {
    selectedDate.setDate(selectedDate.getDate() - 1);
  } else if (reportMode === "month") {
    selectedDate.setMonth(selectedDate.getMonth() - 1);
  } else if (reportMode === "year") {
    selectedDate.setFullYear(selectedDate.getFullYear() - 1);
  }

  renderOverview(transactions);
});

nextPeriodBtn.addEventListener("click", () => {
  if (reportMode === "day") {
    selectedDate.setDate(selectedDate.getDate() + 1);
  } else if (reportMode === "month") {
    selectedDate.setMonth(selectedDate.getMonth() + 1);
  } else if (reportMode === "year") {
    selectedDate.setFullYear(selectedDate.getFullYear() + 1);
  }

  renderOverview(transactions);
});

document.querySelectorAll(".report-mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".report-mode-btn").forEach((item) => {
      item.classList.remove("active");
    });

    btn.classList.add("active");
    reportMode = btn.dataset.mode;
    selectedDate = new Date();

    renderOverview(transactions);
  });
});





function renderIncomeExpenseBars(income, expense) {
  const max = Math.max(income, expense, 1);

  const incomeHeight = Math.max((income / max) * 100, 5);
  const expenseHeight = Math.max((expense / max) * 100, 5);

  incomeBar.style.height = `${incomeHeight}%`;
  expenseBar.style.height = `${expenseHeight}%`;
}

// Biểu đồ
function renderChart(list) {
  const payments = list.filter((tx) => tx.type === "payment");

  const categoryTotals = {};

  payments.forEach((tx) => {
    categoryTotals[tx.serviceType] = (categoryTotals[tx.serviceType] || 0) + Number(tx.amount);
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  const ctx = document.getElementById("overviewChart");

  if (overviewChart) {
    overviewChart.destroy();
  }

  if (!labels.length) {
    return;
  }

  overviewChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: ["#22c55e", "#ef4444", "#0ea5e9", "#f59e0b", "#8b5cf6", "#14b8a6"]
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

// Chi tiêu nhiều nhất
function renderTopSpending(list, total) {
  const payments = list.filter((tx) => tx.type === "payment");

  const categoryTotals = {};

  payments.forEach((tx) => {
    categoryTotals[tx.serviceType] = (categoryTotals[tx.serviceType] || 0) + Number(tx.amount);
  });

  const sorted = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  topSpendingList.innerHTML = "";

  if (!sorted.length) {
    topSpendingList.innerHTML = `<p class="empty-text">Chưa có dữ liệu chi tiêu</p>`;
    return;
  }

  sorted.forEach(([name, amount]) => {
    const percent = total > 0 ? Math.round((amount / total) * 100) : 0;

    const item = document.createElement("div");
    item.className = "top-spending-item";

    item.innerHTML = `
      <div class="top-spending-icon">${getServiceIcon(name)}</div>
      <div class="top-spending-name">${name}</div>
      <div class="top-spending-percent">${percent}%</div>
    `;

    topSpendingList.appendChild(item);
  });
}

function getServiceIcon(type) {
  const icons = {
    "Tiền điện": "⚡",
    "Tiền nước": "💧",
    "Internet": "🌐",
    "Học phí": "🎓",
    "Khoản vay": "💳",
    "Vé máy bay": "✈️",
    "Vé tàu": "🚆",
    "Ăn uống": "🍽️",
    "Mua sắm": "🛒",
    "Khác": "🧾"
  };

  return icons[type] || "🧾";
}

// Nạp tiền
function setTopupAmount(amount) {
  document.getElementById("topupAmount").value = amount;
}

const topupForm = document.getElementById("topupForm");
const topupSuccessModal = document.getElementById("topupSuccessModal");
const topupSuccessText = document.getElementById("topupSuccessText");
const closeTopupModal = document.getElementById("closeTopupModal");

topupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const amount = Number(document.getElementById("topupAmount").value);
  const method = document.getElementById("topupMethod").value;

  if (!amount || amount <= 0) {
    alert("Vui lòng nhập số tiền nạp hợp lệ.");
    return;
  }

  if (!method) {
    alert("Vui lòng chọn nguồn nạp tiền demo.");
    return;
  }

  const confirmTopup = confirm(
    `Xác nhận nạp ${formatMoney(amount)} vào ví bằng ${method}?`
  );

  if (!confirmTopup) return;

  try {
    const res = await fetch(`${API_WALLET_URL}/topup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: user.id,
        amount
      })
    });

    const data = await res.json();

    if (res.ok) {
      topupSuccessText.textContent = `Bạn đã nạp ${formatMoney(amount)} vào ví bằng ${method}.`;
      topupSuccessModal.classList.remove("hidden");

      topupForm.reset();
      await refreshAll();
    } else {
      alert(data.message || "Nạp tiền thất bại.");
    }
  } catch (error) {
    alert("Không thể kết nối tới server.");
  }
});

closeTopupModal.addEventListener("click", () => {
  topupSuccessModal.classList.add("hidden");
});

// Thanh toán
document.getElementById("payForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const serviceType = document.getElementById("serviceType").value;
  const amount = document.getElementById("payAmount").value;
  const note = document.getElementById("payNote").value;

  if (!serviceType || !amount || Number(amount) <= 0) {
    alert("Vui lòng chọn dịch vụ và nhập số tiền hợp lệ");
    return;
  }

  const res = await fetch(`${API_WALLET_URL}/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId: user.id,
      serviceType,
      amount,
      note,
      receiptImage: currentReceiptImageBase64
    })
  });

  const data = await res.json();

  if (res.ok) {
    alert(data.message);

    e.target.reset();

    currentReceiptImageBase64 = "";

    if (receiptImage) {
      receiptImage.value = "";
    }

    if (receiptPreview) {
      receiptPreview.src = "";
      receiptPreview.classList.add("hidden");
    }

    if (ocrResultText) {
      ocrResultText.value = "";
      ocrResultText.classList.add("hidden");
    }

    if (scanStatus) {
      scanStatus.textContent = "";
    }

    await refreshAll();
    showPage("overviewPage");
  } else {
    alert(data.message);
  }
});

// Mở form thanh toán nhanh
function openPayForm(type) {
  document.getElementById("serviceType").value = type;
  document.getElementById("payFormTitle").textContent = `Thanh toán ${type}`;
}





// Lọc giao dịch


document.querySelectorAll(".quick-filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".quick-filter-btn").forEach((item) => {
      item.classList.remove("active");
    });

    btn.classList.add("active");

    const type = btn.dataset.filter;
    const today = new Date();

    let from = new Date();
    let to = new Date();

    if (type === "today") {
      from = new Date(today);
      to = new Date(today);
    }

    if (type === "week") {
      const day = today.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;

      from = new Date(today);
      from.setDate(today.getDate() + diffToMonday);

      to = new Date(from);
      to.setDate(from.getDate() + 6);
    }

    if (type === "month") {
      from = new Date(today.getFullYear(), today.getMonth(), 1);
      to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    document.getElementById("fromDate").value = formatDateInput(from);
    document.getElementById("toDate").value = formatDateInput(to);

    filterTransactionsByHistoryDate();
  });
});

function formatDateInput(date) {
  return date.toISOString().split("T")[0];
}


document.getElementById("filterBtn").addEventListener("click", () => {
  filterTransactionsByHistoryDate();
});

function filterTransactionsByHistoryDate() {
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;

  let filtered = transactions;

  if (fromDate) {
    filtered = filtered.filter((tx) => {
      return new Date(tx.createdAt) >= new Date(fromDate);
    });
  }

  if (toDate) {
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);

    filtered = filtered.filter((tx) => {
      return new Date(tx.createdAt) <= end;
    });
  }

  renderTransactions(filtered);
}



document.getElementById("clearFilterBtn").addEventListener("click", () => {
  document.getElementById("fromDate").value = "";
  document.getElementById("toDate").value = "";

  document.querySelectorAll(".quick-filter-btn").forEach((item) => {
    item.classList.remove("active");
  });

  renderTransactions(transactions);
});

// Đăng xuất
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "index.html";
});

async function refreshAll() {
  await loadWallet();
  await loadTransactions();
  await loadCategoriesForUser();
  await loadSystemNotificationsForUser();
}

openSearchBtn.addEventListener("click", () => {
  searchModal.classList.remove("hidden");
  searchInput.value = "";
  renderSearchSuggestions("");
  searchInput.focus();
});

closeSearchBtn.addEventListener("click", () => {
  searchModal.classList.add("hidden");
});

searchInput.addEventListener("input", () => {
  renderSearchSuggestions(searchInput.value.trim().toLowerCase());
});

function renderSearchSuggestions(keyword) {
  searchSuggestions.innerHTML = "";

  let results = transactions;

  if (keyword) {
    results = transactions.filter((tx) => {
      const text = `
        ${tx.serviceType || ""}
        ${tx.billCode || ""}
        ${tx.note || ""}
        ${tx.type || ""}
        ${tx.amount || ""}
      `.toLowerCase();

      return text.includes(keyword);
    });
  }

  results = results.slice(0, 8);

  if (!results.length) {
    searchSuggestions.innerHTML = `<p class="empty-text">Không tìm thấy giao dịch phù hợp</p>`;
    return;
  }

  results.forEach((tx) => {
    const item = document.createElement("div");
    item.className = "search-item";

    item.innerHTML = `
      <h3>${tx.type === "topup" ? "Nạp tiền vào ví" : tx.serviceType}</h3>
      <p>${tx.billCode || "Không có mã"} • ${formatMoney(tx.amount)}</p>
    `;

    item.addEventListener("click", () => {
      searchModal.classList.add("hidden");
      showPage("historyPage");
      renderTransactions([tx]);

      document.querySelectorAll(".nav-item").forEach((item) => {
        item.classList.remove("active");
      });

      document.querySelector('[data-page="historyPage"]').classList.add("active");
    });

    searchSuggestions.appendChild(item);
  });
}

function getLastCheckedNotificationTime() {
  return localStorage.getItem(`lastCheckedNotification_${user.id}`) || "0";
}

function updateNotificationDot() {
  const lastChecked = new Date(getLastCheckedNotificationTime());

  const hasNewTransaction = transactions.some((tx) => {
    return new Date(tx.createdAt) > lastChecked;
  });

  const hasNewSystemNotification = systemNotifications.some((noti) => {
    return new Date(noti.createdAt) > lastChecked;
  });

  if (hasNewTransaction || hasNewSystemNotification) {
    notificationDot.classList.remove("hidden");
  } else {
    notificationDot.classList.add("hidden");
  }
}

openNotificationBtn.addEventListener("click", () => {
  notificationModal.classList.remove("hidden");
  renderNotifications();

  localStorage.setItem(`lastCheckedNotification_${user.id}`, new Date().toISOString());
  notificationDot.classList.add("hidden");
});

closeNotificationBtn.addEventListener("click", () => {
  notificationModal.classList.add("hidden");
});

function renderNotifications() {
  notificationList.innerHTML = "";

  const transactionNotifications = transactions.slice(0, 8).map((tx) => {
    return {
      title: tx.type === "topup" ? "Nạp tiền thành công" : "Thanh toán thành công",
      message: `${tx.type === "topup" ? "+" : "-"}${formatMoney(tx.amount)} ${tx.serviceType ? "• " + tx.serviceType : ""}`,
      createdAt: tx.createdAt,
      type: "transaction"
    };
  });

  const systemNotis = systemNotifications.map((noti) => {
    return {
      title: noti.title,
      message: noti.message,
      createdAt: noti.createdAt,
      type: "system"
    };
  });

  const allNotifications = [...systemNotis, ...transactionNotifications].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (!allNotifications.length) {
    notificationList.innerHTML = `<p class="empty-text">Chưa có thông báo nào</p>`;
    return;
  }

  allNotifications.slice(0, 12).forEach((noti) => {
    const item = document.createElement("div");
    item.className = "notification-item";

    item.innerHTML = `
      <h3>${noti.type === "system" ? "📢 " : ""}${noti.title}</h3>
      <p>${noti.message}</p>
      <p>${new Date(noti.createdAt).toLocaleString("vi-VN")}</p>
    `;

    notificationList.appendChild(item);
  });
}

viewWalletHistoryBtn.addEventListener("click", () => {
  showPage("historyPage");
  renderTransactions(transactions);

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
  });

  document.querySelector('[data-page="historyPage"]').classList.add("active");
});

viewReportBtn.addEventListener("click", () => {
  reportModal.classList.remove("hidden");
  renderDetailReport(currentPeriodTransactions);
});

closeReportBtn.addEventListener("click", () => {
  reportModal.classList.add("hidden");
});







function renderDetailReport(list) {
  const income = list
    .filter((tx) => tx.type === "topup")
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const expense = list
    .filter((tx) => tx.type === "payment")
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const diff = income - expense;

  document.getElementById("reportIncome").textContent = formatMoney(income);
  document.getElementById("reportExpense").textContent = formatMoney(expense);
  document.getElementById("reportDiff").textContent = formatMoney(diff);

  const categoryTotals = {};

  list
    .filter((tx) => tx.type === "payment")
    .forEach((tx) => {
      categoryTotals[tx.serviceType] =
        (categoryTotals[tx.serviceType] || 0) + Number(tx.amount);
    });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  const ctx = document.getElementById("detailReportChart");

  if (detailReportChart) {
    detailReportChart.destroy();
  }

  detailReportChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels.length ? labels : ["Chưa có chi tiêu"],
      datasets: [
        {
          data: data.length ? data : [1],
          backgroundColor: [
            "#22c55e",
            "#ef4444",
            "#0ea5e9",
            "#f59e0b",
            "#8b5cf6",
            "#14b8a6"
          ]
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}



function handleQrData(qrText) {
  try {
    const data = JSON.parse(qrText);

    if (data.serviceType) {
      document.getElementById("serviceType").value = data.serviceType;
      document.getElementById("payFormTitle").textContent = `Thanh toán ${data.serviceType}`;
    }

    

    if (data.amount) {
      document.getElementById("payAmount").value = data.amount;
    }

    if (data.note) {
      document.getElementById("payNote").value = data.note;
    }

    alert("Quét QR thành công!");
  } catch (error) {
    document.getElementById("billCode").value = qrText;
    alert("QR không phải JSON. Đã điền nội dung QR vào mã hóa đơn.");
  }
}


startQrBtn.addEventListener("click", async () => {
  try {
    qrReader.classList.remove("hidden");

    if (!html5QrCode) {
      html5QrCode = new Html5Qrcode("qrReader");
    }

    await html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250
        }
      },
      async (decodedText) => {
        handleQrData(decodedText);

        await html5QrCode.stop();
        qrReader.classList.add("hidden");
      }
    );
  } catch (error) {
    console.error(error);
    alert("Không thể mở camera để quét QR. Hãy kiểm tra quyền camera hoặc dùng Live Server.");
  }
});

stopQrBtn.addEventListener("click", async () => {
  try {
    if (html5QrCode) {
      await html5QrCode.stop();
    }

    qrReader.classList.add("hidden");
  } catch (error) {
    qrReader.classList.add("hidden");
  }
});

receiptImage.addEventListener("change", () => {
  const file = receiptImage.files[0];

  if (!file) {
    receiptPreview.classList.add("hidden");
    receiptPreview.src = "";
    currentReceiptImageBase64 = "";
    return;
  }

  receiptPreview.src = URL.createObjectURL(file);
  receiptPreview.classList.remove("hidden");

  const reader = new FileReader();

  reader.onload = () => {
    currentReceiptImageBase64 = reader.result;
  };

  reader.readAsDataURL(file);
});

function extractAmountFromText(text) {
  if (!text) return null;

  const lowerText = text.toLowerCase();

  const keywords = [
    "total",
    "tổng",
    "tong",
    "thành tiền",
    "thanh tien",
    "tổng cộng",
    "tong cong",
    "phải trả",
    "phai tra",
    "amount"
  ];

  const lines = lowerText.split("\n");

  for (let line of lines) {
    for (let keyword of keywords) {
      if (line.includes(keyword)) {
        const numbers = line.match(/[\d.,]+/g);

        if (numbers && numbers.length > 0) {
          const lastNumber = numbers[numbers.length - 1]
            .replace(/\./g, "")
            .replace(/,/g, "");

          if (!isNaN(lastNumber) && Number(lastNumber) > 0) {
            return Number(lastNumber);
          }
        }
      }
    }
  }

  const allNumbers = lowerText.match(/[\d.,]+/g);

  if (!allNumbers) return null;

  let maxNumber = 0;

  allNumbers.forEach((num) => {
    const cleanNum = num.replace(/\./g, "").replace(/,/g, "");
    const value = Number(cleanNum);

    if (!isNaN(value) && value > maxNumber) {
      maxNumber = value;
    }
  });

  return maxNumber > 0 ? maxNumber : null;
}


function extractBillCodeFromText(text) {
  if (!text) return "";

  const lines = text.split("\n");

  for (let line of lines) {
    const lowerLine = line.toLowerCase();

    if (
      lowerLine.includes("số hđ") ||
      lowerLine.includes("so hd") ||
      lowerLine.includes("mã hđ") ||
      lowerLine.includes("ma hd") ||
      lowerLine.includes("invoice")
    ) {
      const parts = line.split(":");

      if (parts.length > 1) {
        return parts[1].trim();
      }

      return line.trim();
    }
  }

  return "";
}

scanOcrBtn.addEventListener("click", async () => {
  const file = receiptImage.files[0];

  if (!file) {
    alert("Vui lòng chọn ảnh hóa đơn trước.");
    return;
  }

  try {
    scanStatus.textContent = "Đang quét hóa đơn...";
    ocrResultText.classList.remove("hidden");
    ocrResultText.value = "";

    const result = await Tesseract.recognize(file, "eng+vie", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          scanStatus.textContent = `Đang nhận diện: ${Math.round(m.progress * 100)}%`;
        }
      }
    });

    const text = result.data.text;
    ocrResultText.value = text;

    const amount = extractAmountFromText(text);

    if (amount) {
  document.getElementById("payAmount").value = amount;

  const serviceSelect = document.getElementById("serviceType");
  
  const noteInput = document.getElementById("payNote");

  // Tự chọn dịch vụ nếu có danh mục Ăn uống / Cafe / Khác
  const options = Array.from(serviceSelect.options).map((opt) => opt.value);

  if (options.includes("Ăn uống")) {
    serviceSelect.value = "Ăn uống";
    document.getElementById("payFormTitle").textContent = "Thanh toán Ăn uống";
  } else if (options.includes("Cafe")) {
    serviceSelect.value = "Cafe";
    document.getElementById("payFormTitle").textContent = "Thanh toán Cafe";
  } else if (options.includes("Khác")) {
    serviceSelect.value = "Khác";
    document.getElementById("payFormTitle").textContent = "Thanh toán Khác";
  }

  

  // Tự điền ghi chú
  noteInput.value = "Thanh toán hóa đơn từ OCR";

  scanStatus.textContent = `OCR thành công. Đã tự điền số tiền: ${formatMoney(amount)}`;
} else {
  scanStatus.textContent = "OCR xong nhưng chưa tìm thấy số tiền phù hợp.";
}
  } catch (error) {
    console.error(error);
    scanStatus.textContent = "Có lỗi khi quét OCR.";
  }
});

function setTopupAmount(amount) {
  document.getElementById("topupAmount").value = amount;
}
window.setTopupAmount = setTopupAmount;

function openPayForm(type) {
  document.getElementById("serviceType").value = type;
  document.getElementById("payFormTitle").textContent = `Thanh toán ${type}`;
}
window.openPayForm = openPayForm;

// ===============================
// TÀI KHOẢN: MỞ / ĐÓNG FORM
// ===============================

toggleAvatarFormBtn.addEventListener("click", () => {
  avatarFormBox.classList.toggle("hidden");
  passwordFormBox.classList.add("hidden");
});

togglePasswordFormBtn.addEventListener("click", () => {
  passwordFormBox.classList.toggle("hidden");
  avatarFormBox.classList.add("hidden");
});

// ===============================
// ĐỔI MẬT KHẨU TRONG TÀI KHOẢN
// ===============================

changePasswordBtn.addEventListener("click", async () => {
  const oldPassword = document.getElementById("oldPassword").value.trim();
  const newPasswordAccount = document.getElementById("newPasswordAccount").value.trim();

  if (!oldPassword || !newPasswordAccount) {
    alert("Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới");
    return;
  }

  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  if (!strongPasswordRegex.test(newPasswordAccount)) {
    alert("Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số");
    return;
  }

  try {
    changePasswordBtn.textContent = "Đang đổi...";
    changePasswordBtn.disabled = true;

    const response = await fetch(`${API_AUTH_URL}/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: user.id,
        oldPassword,
        newPassword: newPasswordAccount
      })
    });

    const data = await response.json();

    alert(data.message);

    if (response.ok) {
      document.getElementById("oldPassword").value = "";
      document.getElementById("newPasswordAccount").value = "";
      passwordFormBox.classList.add("hidden");
    }
  } catch (error) {
    alert("Không thể kết nối tới server");
  } finally {
    changePasswordBtn.textContent = "Đổi mật khẩu";
    changePasswordBtn.disabled = false;
  }
});

// ===============================
// UPLOAD AVATAR NGƯỜI DÙNG
// ===============================

avatarInput.addEventListener("change", () => {
  const file = avatarInput.files[0];

  if (!file) return;

  avatarPreview.src = URL.createObjectURL(file);
  avatarPreview.classList.remove("hidden");
  defaultAvatar.classList.add("hidden");
});

uploadAvatarBtn.addEventListener("click", async () => {
  const file = avatarInput.files[0];

  if (!file) {
    alert("Vui lòng chọn ảnh trước");
    return;
  }

  const formData = new FormData();
  formData.append("avatar", file);

  try {
    uploadAvatarBtn.textContent = "Đang tải...";
    uploadAvatarBtn.disabled = true;

    const response = await fetch(`${API_USER_URL}/upload-avatar/${user.id}`, {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message);

      const updatedUser = {
        ...user,
        name: data.user.name || user.name,
        email: data.user.email || user.email,
        avatar: data.user.avatar
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      avatarPreview.src = `${API_SERVER_URL}${data.user.avatar}`;
      avatarPreview.classList.remove("hidden");
      defaultAvatar.classList.add("hidden");

      avatarFormBox.classList.add("hidden");
    } else {
      alert(data.message || "Upload avatar thất bại");
    }
  } catch (error) {
    alert("Không thể kết nối tới server");
  } finally {
    uploadAvatarBtn.textContent = "Cập nhật avatar";
    uploadAvatarBtn.disabled = false;
  }
});


async function loadCategoriesForUser() {
  try {
    const res = await fetch(`${API_ADMIN_URL}/categories`);
    const categories = await res.json();

    quickActionsGrid.innerHTML = "";
    serviceTypeSelect.innerHTML = `<option value="">-- Chọn dịch vụ --</option>`;

    if (!categories.length) {
      quickActionsGrid.innerHTML = `<p class="empty-text">Chưa có danh mục nào</p>`;
      return;
    }

    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.name;
      option.textContent = `${cat.icon || "🧾"} ${cat.name}`;
      serviceTypeSelect.appendChild(option);

      const button = document.createElement("button");
      button.className = "quick-action";
      button.type = "button";

      button.innerHTML = `
        ${cat.icon || "🧾"}
        <span>${cat.name}</span>
      `;

      button.addEventListener("click", () => {
        openPayForm(cat.name);
      });

      quickActionsGrid.appendChild(button);
    });
  } catch (error) {
    quickActionsGrid.innerHTML = `<p class="empty-text">Không thể tải danh mục</p>`;
  }
}


async function loadSystemNotificationsForUser() {
  try {
    const res = await fetch(`${API_ADMIN_URL}/notifications`);
    const notifications = await res.json();

    systemNotifications = notifications.filter((noti) => {
      return noti.target === "all" || noti.target === "users";
    });

    updateNotificationDot();
  } catch (error) {
    systemNotifications = [];
  }
}


function viewReceipt(imageSrc) {
  const receiptWindow = window.open("", "_blank");

  receiptWindow.document.write(`
    <html>
      <head>
        <title>Hóa đơn đã lưu</title>
        <style>
          body {
            margin: 0;
            background: #f3f4f6;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-family: Arial, sans-serif;
            position: relative;
          }

          .close-btn {
            position: fixed;
            top: 18px;
            right: 18px;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            border: none;
            background: #ef4444;
            color: white;
            font-size: 24px;
            font-weight: bold;
            cursor: pointer;
            z-index: 10;
          }

          img {
            max-width: 95%;
            max-height: 95vh;
            border-radius: 16px;
            box-shadow: 0 8px 28px rgba(0,0,0,0.18);
            background: white;
          }
        </style>
      </head>

      <body>
        <button class="close-btn" onclick="window.close()">×</button>
        <img src="${imageSrc}" />
      </body>
    </html>
  `);

  receiptWindow.document.close();
}


window.viewReceipt = viewReceipt;

refreshAll();