// dashboard.js

const API_URL = "http://localhost:8080/api/v1/dashboard";
const userData = localStorage.getItem('user');
const user = JSON.parse(userData);
const USER_ID = user.id || 1;

let expensePieChart;
let monthlyChart;

document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
});

async function loadDashboard() {
  try {
    const res = await fetch(`${API_URL}?user_id=${USER_ID}`);
    const data = await res.json();
    console.log(data);

    updateSummary(data.data.summary);
    updateAlerts(data.data);
    renderExpensePieChart(data.data.categoryWiseExpenses);
    renderMonthlyChart(data.data.monthlyExpenses);

  } catch (error) {
    console.error("Dashboard load error:", error);
  }
}

/* =======================
   SUMMARY CARDS
======================= */

function updateSummary(summary) {
  document.getElementById("total-income").innerText = `₹${summary.total_income || 0}`;
  document.getElementById("total-expense").innerText = `₹${summary.total_expense || 0}`;
  document.getElementById("balance").innerText = `₹${summary.balance || 0}`;
}

/* =======================
   BUDGET ALERTS
======================= */

function updateAlerts(data) {
  const alerts = data.alerts;
  const alertList = document.getElementById("budget-alerts");
  alertList.innerHTML = "";
  
  if (!data.alerts?.length) {
    alertList.innerHTML = '<li style="background:#28a745;color:white;padding:12px 20px;border-radius:25px;font-weight:600;list-style:none;">🎉 All budgets on track!</li>';
  } else {
    alertList.innerHTML = data.alerts.map(a => 
      `<li style="background:#ff4757;color:white;padding:12px 20px;border-radius:25px;font-weight:600;list-style:none;">
        ⚠️ ${a.category}: Over budget!
      </li>`
    ).join('');
  }
 if(data?.summary?.balance < 0)
  {
    alertList.innerHTML = '<li style="background:#28a745;color:white;padding:12px 20px;border-radius:25px;font-weight:600;list-style:none;">🎉 Expenses are more than Income</li>';
  }
  alerts.forEach(alert => {
    const li = document.createElement("li");
    li.innerText = `${alert.category}: ${alert.percent}% of budget used`;
    alertList.appendChild(li);
  });
}

/* =======================
   EXPENSE PIE CHART
======================= */

function renderExpensePieChart(categories = []) {
  const ctx = document.getElementById("expensePieChart");

  const labels = categories.map(c => c.category);
  const data = categories.map(c => Number(c.amount));

  if (expensePieChart) expensePieChart.destroy();

  expensePieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{
        data
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

/* =======================
   MONTHLY SPENDING CHART
======================= */

function renderMonthlyChart(monthlyExpenses = []) {
  const ctx = document.getElementById("monthlyGraph");

  const labels = monthlyExpenses.map(m => m.month);
  const data = monthlyExpenses.map(m => Number(m.amount));

  if (monthlyChart) monthlyChart.destroy();

  monthlyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Monthly Spending",
        data,
        fill: false,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
