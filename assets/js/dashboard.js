// dashboard.js - SIMPLE LIVE UPDATES (No SSE/WebSocket)
const API_BASE = 'https://personal-finance-tracker-seven-gilt.vercel.app/api/v1';
const userData = localStorage.getItem('user');
const user = JSON.parse(userData);
let currentUserId = user.id || 1;
console.log(currentUserId)
let expenseChart, monthlyChart;
const REFRESH_INTERVAL = 60000; // 5 seconds

// Initialize Charts
function initCharts() {
  const ctx1 = document.getElementById('expensePieChart').getContext('2d');
  expenseChart = new Chart(ctx1, {
    type: 'doughnut',
    data: { labels: [], datasets: [{ data: [], backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40'] }] },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } }, animation: false }
  });

  const ctx2 = document.getElementById('monthlyGraph').getContext('2d');
  monthlyChart = new Chart(ctx2, {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Expenses', data: [], borderColor: '#dc3545', fill: true }] },
    options: { responsive: true, animation: false }
  });
}

// LIVE Refresh Function
async function refreshDashboard() {
  try {

    const response = await fetch(`${API_BASE}/dashboard?user_id=${currentUserId}`);
    const result = await response.json();

    if (result.success) {
      updateDashboard(result.data);
    }
  } catch (error) {
    console.error('❌ Refresh failed:', error);
  }
}

// Update ALL dashboard elements
function updateDashboard(data) {
  // Summary Cards
  document.getElementById('total-income').textContent = 
    `₹${parseFloat(data.summary?.total_income || 0).toLocaleString('en-IN')}`;
  document.getElementById('total-expense').textContent = 
    `₹${parseFloat(data.summary?.total_expense || 0).toLocaleString('en-IN')}`;
  
  const balance = parseFloat(data.summary?.balance || 0);
  const balanceEl = document.getElementById('balance');
  balanceEl.textContent = `₹${Math.abs(balance).toLocaleString('en-IN')}`;
  balanceEl.style.color = balance >= 0 ? '#28a745' : '#dc3545';

  // Budget Alerts
  const alertsEl = document.getElementById('budget-alerts');
  if (!data.alerts?.length) {
    alertsEl.innerHTML = '<li style="background:#28a745;color:white;padding:12px 20px;border-radius:25px;font-weight:600;list-style:none;">🎉 All budgets on track!</li>';
  } else {
    alertsEl.innerHTML = data.alerts.map(a => 
      `<li style="background:#ff4757;color:white;padding:12px 20px;border-radius:25px;font-weight:600;list-style:none;">
        ⚠️ ${a.category}: Over budget!
      </li>`
    ).join('');
  }

  // Pie Chart
  const categories = data.categories || [];
  expenseChart.data.labels = categories.map(c => c.category);
  expenseChart.data.datasets[0].data = categories.map(c => parseFloat(c.amount));
  expenseChart.update('none');
}

// Auto-refresh every 5 seconds
let refreshTimer;
function startLiveUpdates() {
  refreshDashboard(); // Initial load
  refreshTimer = setInterval(refreshDashboard, REFRESH_INTERVAL);
}

// Cleanup
function stopLiveUpdates() {
  if (refreshTimer) clearInterval(refreshTimer);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initCharts();
  startLiveUpdates();
  
  // Stop on page unload
  window.addEventListener('beforeunload', stopLiveUpdates);
});
