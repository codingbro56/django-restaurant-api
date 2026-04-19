/* ==========================================
   BHARATBITES ANALYTICS CONTROLLER
========================================== */

const ENDPOINTS = {
  summary: "/api/orders/admin/analytics/summary/",
  revenue: "/api/orders/admin/analytics/revenue/",
  status: "/api/orders/admin/analytics/status/",
  categories: "/api/orders/admin/analytics/categories/",
  topItems: "/api/orders/admin/analytics/top-items/",
  special: "/api/orders/admin/analytics/special/",
  weekly: "/api/orders/admin/analytics/weekly/"
};

let charts = {
  revenue: null,
  category: null,
  status: null,
  weekly: null
};

let currentRange = "monthly";
let startDate = null;
let endDate = null;


/* ==========================================
   INITIALIZE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

  setupRangeSelector();
  setupCustomFilter();
  setupExportButtons();

  loadDashboard();

});


/* ==========================================
   API HELPER
========================================== */

async function fetchAPI(endpoint) {

  let url = API_BASE_URL + endpoint;

  if (startDate && endDate) {
    url += `?start_date=${startDate}&end_date=${endDate}`;
  } else {
    url += `?range=${currentRange}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("admin_token")
    }
  });

  if (!response.ok) {
    throw new Error("API error");
  }

  return response.json();
}


/* ==========================================
   LOAD DASHBOARD
========================================== */

async function loadDashboard() {

  try {

    await Promise.all([
      loadSummary(),
      loadRevenueChart(),
      loadWeeklyChart(),
      loadStatusChart(),
      loadCategoryChart(),
      loadTopItems(),
      loadSpecialRevenue()
    ]);

  } catch (error) {

    console.error("Analytics load failed:", error);

  }

}


/* ==========================================
   KPI CARDS
========================================== */

async function loadSummary() {

  const data = await fetchAPI(ENDPOINTS.summary);

  setText("totalRevenue", formatCurrency(data.total_revenue));
  setText("totalOrders", data.total_orders);
  setText("avgOrderValue", formatCurrency(data.avg_order_value));
  setText("repeatPercent", data.repeat_customer_percent);
  setText("paymentSuccessRate", data.payment_success_rate);

}


async function loadSpecialRevenue() {

  const data = await fetchAPI(ENDPOINTS.special);

  setText("specialDishRevenue", formatCurrency(data.special_revenue));

}


/* ==========================================
   REVENUE LINE CHART
========================================== */

async function loadRevenueChart() {

  const data = await fetchAPI(ENDPOINTS.revenue);

  if (!data || data.length === 0) {
    console.warn("Revenue API returned no data");
    return;
  }

  const labels = data.map(i => i.date);
  const values = data.map(i => i.revenue);

  const ctx = document.getElementById("revenueChart").getContext("2d");

  if (charts.revenue) charts.revenue.destroy();

  charts.revenue = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Revenue",
        data: values,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.15)",
        fill: true,
        tension: 0.3
      }]
    },
    options: baseChartOptions()
  });
}


async function loadWeeklyChart() {

  const data = await fetchAPI(ENDPOINTS.weekly);

  const labels = data.map(i => i.date);
  const values = data.map(i => i.orders);

  const ctx = document.getElementById("weeklyChart").getContext("2d");

  if (charts.weekly) charts.weekly.destroy();

  charts.weekly = new Chart(ctx, {

    type: "line",

    data: {
      labels: labels,
      datasets: [{
        label: "Orders",
        data: values,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.2)",
        fill: true,
        tension: 0.3
      }]
    },

    options: baseChartOptions()

  });

}


/* ==========================================
   CATEGORY BAR CHART
========================================== */

async function loadCategoryChart() {

  const data = await fetchAPI(ENDPOINTS.categories);

  const labels = data.map(i => i.category);
  const values = data.map(i => i.revenue);

  const ctx = document.getElementById("categoryChart").getContext("2d");

  if (charts.category) charts.category.destroy();

  charts.category = new Chart(ctx, {

    type: "bar",

    data: {
      labels: labels,
      datasets: [{
        label: "Revenue",
        data: values,
        backgroundColor: "#3b82f6"
      }]
    },

    options: baseChartOptions()

  });

}


/* ==========================================
   STATUS PIE CHART
========================================== */

async function loadStatusChart() {

  const data = await fetchAPI(ENDPOINTS.status);

  const labels = data.map(i => i.status);
  const values = data.map(i => i.count);

  const ctx = document.getElementById("statusChart").getContext("2d");

  if (charts.status) charts.status.destroy();

  charts.status = new Chart(ctx, {

    type: "doughnut",

    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: [
          "#22c55e",
          "#facc15",
          "#ef4444"
        ]
      }]
    },

    options: baseChartOptions()

  });

}


/* ==========================================
   TOP ITEMS TABLE
========================================== */

async function loadTopItems() {

  const data = await fetchAPI(ENDPOINTS.topItems);

  const table = document.getElementById("topItemsTable");

  table.innerHTML = "";

  data.forEach(item => {

    table.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>${item.category}</td>
        <td>${item.units}</td>
        <td>₹${formatCurrency(item.revenue)}</td>
      </tr>
    `;

  });

}


/* ==========================================
   RANGE SELECTOR
========================================== */

function setupRangeSelector() {

  const buttons = document.querySelectorAll(".range-selector button");

  buttons.forEach(btn => {

    btn.addEventListener("click", () => {

      buttons.forEach(b => b.classList.remove("active"));

      btn.classList.add("active");

      currentRange = btn.dataset.range;

      startDate = null;
      endDate = null;

      loadDashboard();

    });

  });

}


/* ==========================================
   CUSTOM DATE FILTER
========================================== */

function setupCustomFilter() {

  const applyBtn = document.getElementById("applyFilterBtn");

  applyBtn.addEventListener("click", () => {

    startDate = document.getElementById("startDate").value;
    endDate = document.getElementById("endDate").value;

    if (!startDate || !endDate) {
      alert("Please select both dates");
      return;
    }

    loadDashboard();

  });

}


/* ==========================================
   EXPORT BUTTONS
========================================== */

function setupExportButtons() {

  document.getElementById("exportCsvBtn")
    .addEventListener("click", exportCSV);

  document.getElementById("exportPdfBtn")
    .addEventListener("click", exportPDF);

}


/* ==========================================
   EXPORT CSV
========================================== */

async function exportCSV() {

  const data = await fetchAPI(ENDPOINTS.topItems);

  let csv = "Item,Category,Units Sold,Revenue\n";

  data.forEach(i => {

    csv += `${i.name},${i.category},${i.units},${i.revenue}\n`;

  });

  const blob = new Blob([csv], { type: "text/csv" });

  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);

  link.download = "bharatbites_report.csv";

  link.click();

}


/* ==========================================
   EXPORT PDF
========================================== */
async function exportPDF() {

  const element = document.querySelector(".admin-content");

  if (!element) {
    console.error("PDF export failed: target element not found");
    return;
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true
  });

  const imgData = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF("p", "mm", "a4");

  const imgWidth = 210;
  const pageHeight = 295;

  const imgHeight = canvas.height * imgWidth / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

  heightLeft -= pageHeight;

  while (heightLeft > 0) {

    position = heightLeft - imgHeight;

    pdf.addPage();

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

    heightLeft -= pageHeight;

  }

  pdf.save("bharatbites_analytics_report.pdf");

}

/* ==========================================
   UTILITIES
========================================== */

function setText(id, value) {

  const el = document.getElementById(id);

  if (el) el.innerText = value;

}


function formatCurrency(value) {

  return Number(value || 0).toLocaleString("en-IN");

}


function baseChartOptions() {

  return {

    responsive: true,

    plugins: {
      legend: {
        labels: {
          color: "#cbd5e1"
        }
      }
    },

    scales: {
      x: {
        ticks: { color: "#cbd5e1" },
        grid: { color: "rgba(255,255,255,0.05)" }
      },
      y: {
        ticks: { color: "#cbd5e1" },
        grid: { color: "rgba(255,255,255,0.05)" }
      }
    }

  };

}