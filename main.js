import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const userLoginSection = document.getElementById("user-login");
const adminLoginSection = document.getElementById("admin-login");
const dashboardSection = document.getElementById("dashboard");
const adminPanelSection = document.getElementById("admin-panel");

const ADMIN_CREDENTIALS = {
  email: "admin@example.com",
  password: "AdminPass123"
};

// محاكاة قاعدة بيانات مستخدمين (في مشروع حقيقي تستخدم Firebase Auth)
const fakeUsersDB = {
  "user1@example.com": { password: "userpass", uid: "user1uid", balance: 1000, referralCode: "ABC123" },
  "user2@example.com": { password: "user2pass", uid: "user2uid", balance: 500, referralCode: "XYZ789" }
};

let currentUser = null;
let currentAdmin = false;

// --- تسجيل دخول المستخدم ---
document.getElementById("user-login-btn").onclick = () => {
  const email = document.getElementById("user-email").value.trim();
  const pass = document.getElementById("user-password").value.trim();

  if (fakeUsersDB[email] && fakeUsersDB[email].password === pass) {
    currentUser = { email, ...fakeUsersDB[email] };
    currentAdmin = false;
    showUserDashboard();
  } else {
    alert("خطأ في البريد أو كلمة المرور للمستخدم");
  }
};

// --- تسجيل دخول لوحة التحكم ---
document.getElementById("admin-login-btn").onclick = () => {
  const email = document.getElementById("admin-email").value.trim();
  const pass = document.getElementById("admin-password").value.trim();
  const msg = document.getElementById("admin-login-msg");

  if (email === ADMIN_CREDENTIALS.email && pass === ADMIN_CREDENTIALS.password) {
    currentAdmin = true;
    currentUser = null;
    showAdminPanel();
    msg.textContent = "";
  } else {
    msg.style.color = "red";
    msg.textContent = "بيانات الدخول غير صحيحة";
  }
};

// --- عرض لوحة المستخدم ---
function showUserDashboard() {
  userLoginSection.style.display = "none";
  adminLoginSection.style.display = "none";
  dashboardSection.style.display = "block";
  adminPanelSection.style.display = "none";

  document.getElementById("user-balance").textContent = currentUser.balance;
  document.getElementById("ref-link").value = `${location.origin}?ref=${currentUser.referralCode}`;
}

// --- عرض لوحة تحكم المطور ---
function showAdminPanel() {
  userLoginSection.style.display = "none";
  adminLoginSection.style.display = "none";
  dashboardSection.style.display = "none";
  adminPanelSection.style.display = "block";

  loadWithdrawRequests();
  loadProfitPercent();
}

// --- نسخ رابط الإحالة ---
document.getElementById("copy-ref").onclick = () => {
  const refInput = document.getElementById("ref-link");
  refInput.select();
  navigator.clipboard.writeText(refInput.value).then(() => {
    alert("تم نسخ رابط الإحالة!");
  });
};

// --- إيداع عبر Payeer ---
document.getElementById("deposit-btn").onclick = () => {
  const amount = parseFloat(document.getElementById("deposit-amount").value);
  if (isNaN(amount) || amount < 1) return alert("أدخل مبلغ صالح للإيداع (≥1 ₽)");

  const PAYEER_ACCOUNT = "P12345678"; // عدله حسب حسابك
  const desc = encodeURIComponent(`إيداع روبل لحساب UID: ${currentUser.uid}`);

  const url = `https://payeer.com/merchant/?m_shop=${PAYEER_ACCOUNT}&m_amount=${amount}&m_curr=RUB&m_desc=${desc}`;
  window.open(url, "_blank");
};

// --- طلب سحب ---
document.getElementById("withdraw-btn").onclick = async () => {
  if (!currentUser) return;

  try {
    await setDoc(doc(db, "withdraw_requests", currentUser.uid), {
      uid: currentUser.uid,
      email: currentUser.email,
      requestedAt: serverTimestamp()
    });
    document.getElementById("dash-message").style.color = "green";
    document.getElementById("dash-message").textContent = "تم إرسال طلب السحب. انتظر الموافقة.";
  } catch (e) {
    document.getElementById("dash-message").style.color = "red";
    document.getElementById("dash-message").textContent = "خطأ أثناء طلب السحب.";
  }
};

// --- تسجيل خروج المستخدم ---
document.getElementById("logout-user").onclick = () => {
  currentUser = null;
  dashboardSection.style.display = "none";
  userLoginSection.style.display = "block";
  document.getElementById("dash-message").textContent = "";
};

// --- تسجيل خروج الادمن ---
document.getElementById("logout-admin").onclick = () => {
  currentAdmin = false;
  adminPanelSection.style.display = "none";
  adminLoginSection.style.display = "block";
  document.getElementById("admin-login-msg").textContent = "";
};

// --- تحميل طلبات السحب ---
async function loadWithdrawRequests() {
  const container = document.getElementById("withdraw-requests");
  container.innerHTML = "جاري التحميل...";

  const q = query(collection(db, "withdraw_requests"), orderBy("requestedAt", "desc"));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    container.textContent = "لا توجد طلبات حالياً.";
    return;
  }

  container.innerHTML = "";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const div = document.createElement("div");
    div.innerHTML = `
      <p><strong>المستخدم:</strong> ${data.email || "مجهول"}</p>
      <button data-uid="${data.uid}" class="approve-btn">الموافقة</button>
      <button data-uid="${data.uid}" class="reject-btn">رفض</button>
    `;
    container.appendChild(div);
  });

  // ربط الأزرار
  document.querySelectorAll(".approve-btn").forEach(btn => {
    btn.onclick = () => approveWithdraw(btn.dataset.uid);
  });
  document.querySelectorAll(".reject-btn").forEach(btn => {
    btn.onclick = () => rejectWithdraw(btn.dataset.uid);
  });
}

// --- الموافقة على طلب السحب ---
async function approveWithdraw(uid) {
  // حذف طلب السحب
  await deleteDoc(doc(db, "withdraw_requests", uid));
  // تحديث رصيد المستخدم (خصم الرصيد كله هنا كمثال)
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { balance: 0 });
  alert("تمت الموافقة على السحب.");
  loadWithdrawRequests();
}

// --- رفض طلب السحب ---
async function rejectWithdraw(uid) {
  await deleteDoc(doc(db, "withdraw_requests", uid));
  alert("تم رفض طلب السحب.");
  loadWithdrawRequests();
}

// --- جلب وحفظ نسبة الربح ---
async function loadProfitPercent() {
  const profitRef = doc(db, "settings", "profit");
  const docSnap = await getDoc(profitRef);

  const input = document.getElementById("profit-percent");
  const msg = document.getElementById("profit-msg");

  if (docSnap.exists()) {
    input.value = docSnap.data().value;
  } else {
    input.value = 10; // القيمة الافتراضية
  }

  document.getElementById("save-profit").onclick = async () => {
    const val = parseInt(input.value);
    if (isNaN(val) || val < 0 || val > 100) {
      msg.style.color = "red";
      msg.textContent = "يجب أن تكون القيمة بين 0 و 100";
      return;
    }
    await setDoc(profitRef, { value: val });
    msg.style.color = "green";
    msg.textContent = "تم حفظ نسبة الربح";
  };
}
