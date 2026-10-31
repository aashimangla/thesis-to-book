
const API_BASE_URL = 'https://thesis-to-book.onrender.com/api';

const token = sessionStorage.getItem('adminToken');
const adminUser = JSON.parse(
  sessionStorage.getItem('adminUser') || 'null'
);

const message = document.getElementById('dashboardMessage');

// Protect the dashboard page in the browser.
if (!token || !adminUser || adminUser.role !== 'admin') {
  window.location.href = 'login.html';
} else {
  initializeDashboard();
}

// Safely escape values before inserting them into HTML.
function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    return entities[character];
  });
}

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function displayStatus(status) {
  return escapeHTML(status || 'unknown')
    .replaceAll('-', ' ');
}

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value ?? 0;
  }
}

function initializeDashboard() {
  const name = adminUser.name || 'Administrator';

  setText('adminName', name);
  setText('adminEmail', adminUser.email);
  setText('welcomeName', name);
  setText('adminAvatar', name.charAt(0).toUpperCase());

  document
    .getElementById('logoutButton')
    .addEventListener('click', logout);

  loadDashboard();
}

async function loadDashboard() {
  try {
    message.textContent = 'Loading dashboard data...';
    message.className = 'dashboard-message';

    const response = await fetch(
      `${API_BASE_URL}/admin/dashboard`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (response.status === 401 || response.status === 403) {
      logout();
      return;
    }

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Unable to load dashboard.');
    }

    renderStatistics(data);
    renderEnquiries(data.recentActivity.enquiries);
    renderConsultations(data.recentActivity.consultations);
    renderPayments(data.recentActivity.payments);

    message.textContent = 'Dashboard data updated successfully.';
  } catch (error) {
    console.error('Dashboard error:', error);

    message.textContent =
      error.message || 'Could not connect to the server.';

    message.className = 'dashboard-message error';
  }
}

// Render summary cards and status counts.
function renderStatistics(data) {
  setText('totalUsers', data.users.total);
  setText('totalCustomers', data.users.customers);

  setText('totalEnquiries', data.enquiries.total);
  setText('newEnquiries', data.enquiries.new);

  setText('totalConsultations', data.consultations.total);
  setText('pendingConsultations', data.consultations.pending);

  setText('paidPayments', data.payments.paid);

  setText('statusNew', data.enquiries.new);
  setText('statusAssessed', data.enquiries.assessed);
  setText('statusQuoted', data.enquiries.quoted);
  setText('statusInProgress', data.enquiries.inProgress);
  setText('statusDelivered', data.enquiries.delivered);
  setText('statusClosed', data.enquiries.closed);

  setText('consultPending', data.consultations.pending);
  setText('consultConfirmed', data.consultations.confirmed);
  setText('consultCompleted', data.consultations.completed);
  setText('consultCancelled', data.consultations.cancelled);
}

// Render recent enquiries.
function renderEnquiries(enquiries) {
  const table = document.getElementById('enquiriesTable');

  if (!enquiries || enquiries.length === 0) {
    table.innerHTML = `
      <tr><td colspan="6">No enquiries found.</td></tr>
    `;
    return;
  }

  table.innerHTML = enquiries.map((item) => `
    <tr>
      <td>${escapeHTML(item.fullName)}</td>
      <td>${escapeHTML(item.email)}</td>
      <td>${escapeHTML(item.documentType)}</td>
      <td>${escapeHTML(item.subject)}</td>
      <td>${displayStatus(item.status)}</td>
      <td>${formatDate(item.createdAt)}</td>
    </tr>
  `).join('');
}

// Render recent consultations.
function renderConsultations(consultations) {
  const table = document.getElementById('consultationsTable');

  if (!consultations || consultations.length === 0) {
    table.innerHTML = `
      <tr><td colspan="5">No consultations found.</td></tr>
    `;
    return;
  }

  table.innerHTML = consultations.map((item) => `
    <tr>
      <td>${escapeHTML(item.name)}</td>
      <td>${escapeHTML(item.email)}</td>
      <td>${escapeHTML(item.topic || '—')}</td>
      <td>${formatDate(item.preferredDate)}</td>
      <td>${displayStatus(item.status)}</td>
    </tr>
  `).join('');
}

// Render recent payments.
function renderPayments(payments) {
  const table = document.getElementById('paymentsTable');

  if (!payments || payments.length === 0) {
    table.innerHTML = `
      <tr><td colspan="5">No payments found.</td></tr>
    `;
    return;
  }

  table.innerHTML = payments.map((item) => {
    const itemName =
      item.package ||
      item.bookTitle ||
      '—';

    return `
      <tr>
        <td>${escapeHTML(item.purpose)}</td>
        <td>${escapeHTML(itemName)}</td>
        <td>${escapeHTML(item.currency)} ${escapeHTML(item.amount)}</td>
        <td>${displayStatus(item.status)}</td>
        <td>${formatDate(item.createdAt)}</td>
      </tr>
    `;
  }).join('');
}

// Log out the admin.
function logout() {
  sessionStorage.removeItem('adminToken');
  sessionStorage.removeItem('adminUser');

  window.location.href = 'login.html';
}
