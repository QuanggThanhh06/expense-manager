const API_ADMIN_URL = "http://localhost:5000/api/admin";

const adminUser = JSON.parse(localStorage.getItem("user"));

if (!adminUser || adminUser.role !== "admin") {
  alert("Bạn không có quyền truy cập trang Admin");
  window.location.href = "index.html";
}

const usersList = document.getElementById("usersList");
const categoriesList = document.getElementById("categoriesList");
const notificationsList = document.getElementById("notificationsList");
const safeTransactionsList = document.getElementById("safeTransactionsList");

const categoryForm = document.getElementById("categoryForm");
const categoryId = document.getElementById("categoryId");
const categoryName = document.getElementById("categoryName");
const categoryType = document.getElementById("categoryType");
const categoryIcon = document.getElementById("categoryIcon");

const saveCategoryBtn = document.getElementById("saveCategoryBtn");
const cancelCategoryEditBtn = document.getElementById("cancelCategoryEditBtn");

const notificationForm = document.getElementById("notificationForm");
const notificationTitle = document.getElementById("notificationTitle");
const notificationMessage = document.getElementById("notificationMessage");
const notificationTarget = document.getElementById("notificationTarget");

function formatDate(date) {
  return new Date(date).toLocaleString("vi-VN");
}

function showPage(pageId) {
  document.querySelectorAll(".admin-page").forEach((page) => {
    page.classList.remove("active-page");
  });

  document.getElementById(pageId).classList.add("active-page");
}

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((item) => {
      item.classList.remove("active");
    });

    btn.classList.add("active");
    showPage(btn.dataset.page);
  });
});

document.getElementById("adminLogoutBtn").addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "index.html";
});

// ============================
// USERS
// ============================

async function loadUsers() {
  try {
    const res = await fetch(`${API_ADMIN_URL}/users`);
    const users = await res.json();

    usersList.innerHTML = "";

    if (!users.length) {
      usersList.innerHTML = `<p class="empty-text">Chưa có người dùng nào</p>`;
      return;
    }

    users.forEach((user) => {
      const card = document.createElement("div");
      card.className = "item-card";

      const isAdmin = user.role === "admin";
      const isLocked = user.status === "locked";

      card.innerHTML = `
        <div class="item-top">
          <div>
            <div class="item-title">${user.name || "Người dùng"}</div>
            <div class="item-desc">${user.email}</div>
            <div class="item-desc">Ngày đăng ký: ${formatDate(user.createdAt)}</div>
          </div>

          <div>
            <span class="badge ${user.role}">${user.role}</span>
            <span class="badge ${user.status}">${user.status}</span>
          </div>
        </div>

        <div class="item-actions">
          <button 
            class="${isLocked ? "" : "warning-btn"}" 
            onclick="toggleUserStatus('${user._id}')"
            ${isAdmin ? "disabled" : ""}
          >
            ${isLocked ? "Mở khóa" : "Khóa tài khoản"}
          </button>
        </div>
      `;

      usersList.appendChild(card);
    });
  } catch (error) {
    usersList.innerHTML = `<p class="empty-text">Lỗi khi tải danh sách người dùng</p>`;
  }
}

async function toggleUserStatus(userId) {
  try {
    const res = await fetch(`${API_ADMIN_URL}/users/${userId}/toggle-status`, {
      method: "PATCH"
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      loadUsers();
    }
  } catch (error) {
    alert("Không thể kết nối server");
  }
}

window.toggleUserStatus = toggleUserStatus;

// ============================
// CATEGORIES
// ============================

async function loadCategories() {
  try {
    const res = await fetch(`${API_ADMIN_URL}/categories`);
    const categories = await res.json();

    categoriesList.innerHTML = "";

    if (!categories.length) {
      categoriesList.innerHTML = `<p class="empty-text">Chưa có danh mục nào</p>`;
      return;
    }

    categories.forEach((cat) => {
      const card = document.createElement("div");
      card.className = "item-card";

      card.innerHTML = `
        <div class="item-top">
          <div style="display:flex; gap:12px; align-items:center;">
            <div class="category-icon" style="background:${cat.color || "#22c55e"}">
              ${cat.icon || "🧾"}
            </div>
            <div>
              <div class="item-title">${cat.name}</div>
              <div class="item-desc">Loại: ${cat.type === "income" ? "Thu nhập" : "Chi tiêu"}</div>
            </div>
          </div>
        </div>

        <div class="item-actions">
          <button onclick="editCategory('${cat._id}', '${cat.name}', '${cat.type}', '${cat.icon}')">
  Sửa
</button>
          <button class="danger-btn" onclick="deleteCategory('${cat._id}')">
            Xóa
          </button>
        </div>
      `;

      categoriesList.appendChild(card);
    });
  } catch (error) {
    categoriesList.innerHTML = `<p class="empty-text">Lỗi khi tải danh mục</p>`;
  }
}

categoryForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
  name: categoryName.value.trim(),
  type: categoryType.value,
  icon: categoryIcon.value.trim() || "🧾",
  color: "#22c55e"
};

  if (!data.name) {
    alert("Vui lòng nhập tên danh mục");
    return;
  }

  try {
    let res;

    if (categoryId.value) {
      res = await fetch(`${API_ADMIN_URL}/categories/${categoryId.value}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
    } else {
      res = await fetch(`${API_ADMIN_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
    }

    const result = await res.json();
    alert(result.message);

    if (res.ok) {
      resetCategoryForm();
      loadCategories();
    }
  } catch (error) {
    alert("Không thể kết nối server");
  }
});

function editCategory(id, name, type, icon) {
  categoryId.value = id;
  categoryName.value = name;
  categoryType.value = type;
  categoryIcon.value = icon;

  saveCategoryBtn.textContent = "Cập nhật danh mục";
  cancelCategoryEditBtn.classList.remove("hidden");
}

function resetCategoryForm() {
  categoryForm.reset();
  categoryId.value = "";
  saveCategoryBtn.textContent = "Thêm danh mục";
  cancelCategoryEditBtn.classList.add("hidden");
}

cancelCategoryEditBtn.addEventListener("click", resetCategoryForm);

async function deleteCategory(id) {
  const ok = confirm("Bạn có chắc muốn xóa danh mục này không?");
  if (!ok) return;

  try {
    const res = await fetch(`${API_ADMIN_URL}/categories/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      loadCategories();
    }
  } catch (error) {
    alert("Không thể kết nối server");
  }
}

window.editCategory = editCategory;
window.deleteCategory = deleteCategory;

// ============================
// NOTIFICATIONS
// ============================

notificationForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    title: notificationTitle.value.trim(),
    message: notificationMessage.value.trim(),
    target: notificationTarget.value
  };

  if (!data.title || !data.message) {
    alert("Vui lòng nhập tiêu đề và nội dung");
    return;
  }

  try {
    const res = await fetch(`${API_ADMIN_URL}/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    alert(result.message);

    if (res.ok) {
      notificationForm.reset();
      loadNotifications();
    }
  } catch (error) {
    alert("Không thể kết nối server");
  }
});

async function loadNotifications() {
  try {
    const res = await fetch(`${API_ADMIN_URL}/notifications`);
    const notifications = await res.json();

    notificationsList.innerHTML = "";

    if (!notifications.length) {
      notificationsList.innerHTML = `<p class="empty-text">Chưa có thông báo nào</p>`;
      return;
    }

    notifications.forEach((noti) => {
      const card = document.createElement("div");
      card.className = "item-card";

      card.innerHTML = `
        <div class="item-title">${noti.title}</div>
        <div class="item-desc">${noti.message}</div>
        <div class="item-desc">Đối tượng: ${noti.target}</div>
        <div class="item-desc">Thời gian: ${formatDate(noti.createdAt)}</div>
      `;

      notificationsList.appendChild(card);
    });
  } catch (error) {
    notificationsList.innerHTML = `<p class="empty-text">Lỗi khi tải thông báo</p>`;
  }
}

// ============================
// SAFE TRANSACTIONS
// ============================

async function loadSafeTransactions() {
  try {
    const res = await fetch(`${API_ADMIN_URL}/transactions/safe`);
    const transactions = await res.json();

    safeTransactionsList.innerHTML = "";

    if (!transactions.length) {
      safeTransactionsList.innerHTML = `<p class="empty-text">Chưa có giao dịch nào</p>`;
      return;
    }

    transactions.forEach((tx) => {
      const card = document.createElement("div");
      card.className = "item-card";

      card.innerHTML = `
        <div class="item-top">
          <div>
            <div class="item-title">${tx.userId?.name || "Người dùng"}</div>
            <div class="item-desc">${tx.userId?.email || "Không có email"}</div>
            <div class="item-desc">Loại: ${tx.type}</div>
            <div class="item-desc">Dịch vụ: ${tx.serviceType || "Không có"}</div>
            <div class="item-desc">Mã hóa đơn: ${tx.billCode || "Không có"}</div>
            <div class="item-desc">Thời gian: ${formatDate(tx.createdAt)}</div>
          </div>

          <span class="badge active">${tx.status || "success"}</span>
        </div>
      `;

      safeTransactionsList.appendChild(card);
    });
  } catch (error) {
    safeTransactionsList.innerHTML = `<p class="empty-text">Lỗi khi tải giao dịch</p>`;
  }
}

// ============================
// INIT
// ============================

async function initAdmin() {
  await loadUsers();
  await loadCategories();
  await loadNotifications();
  await loadSafeTransactions();
}

initAdmin();