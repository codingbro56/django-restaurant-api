function loadReport() {
    const status = document.getElementById("statusFilter").value;
    const start = document.getElementById("startDate").value;
    const end = document.getElementById("endDate").value;

    let url = API_BASE_URL + "/api/admin/reports/orders/?";

    if (status) url += "status=" + status + "&";
    if (start) url += "start=" + start + "&";
    if (end) url += "end=" + end;

    fetch(url, {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("admin_token")
        }
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("totalOrders").innerText = data.total_orders;
        document.getElementById("totalAmount").innerText = data.total_amount;

        const box = document.getElementById("reportList");
        box.innerHTML = "";

        data.orders.forEach(o => {
            box.innerHTML += `
                <div>
                    Order #${o.id} — ${o.user} — ₹${o.total}
                    (${o.status}) — ${o.date}
                </div>
            `;
        });

        // 🔹 CHART CALL
        drawChart(data.orders);
    });
}


function exportCSV() {
    const status = document.getElementById("statusFilter").value;
    const start = document.getElementById("startDate").value;
    const end = document.getElementById("endDate").value;

    let url = API_BASE_URL + "/api/admin/reports/orders/csv/?";
    if (status) url += "status=" + status + "&";
    if (start) url += "start=" + start + "&";
    if (end) url += "end=" + end;

    fetch(url, {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("admin_token")
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Export failed");
        return res.blob();
    })
    .then(blob => {
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = "order_report.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    })
    .catch(() => {
        alert("CSV export failed");
    });
}

let chartInstance = null;

function drawChart(orders) {
    const counts = {};

    orders.forEach(o => {
        counts[o.status] = (counts[o.status] || 0) + 1;
    });

    const ctx = document.getElementById("orderChart").getContext("2d");

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: Object.keys(counts),
            datasets: [{
                label: "Orders by Status",
                data: Object.values(counts),
                backgroundColor: [
                    "#4caf50",
                    "#f44336",
                    "#ff9800"
                ]
            }]
        }
    });
}


function loadUserReport() {
  const month = document.getElementById("userReportMonth").value;

  if (!month) {
    alert("Please select a month");
    return;
  }

  fetch(API_BASE_URL + "/api/admin/reports/users/?month=" + month, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("admin_token")
    }
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("usersTotal").innerText = data.total;
    document.getElementById("usersActive").innerText = data.active;
    document.getElementById("usersDisabled").innerText = data.disabled;
    document.getElementById("usersAdmins").innerText = data.admins;

    renderUserChart(data.active, data.disabled);
  });
}

function loadTopItems() {
  fetch(API_BASE_URL + "/api/orders/reports/top-items/", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("admin_token")
    }
  })
  .then(res => res.json())
  .then(items => {
    const box = document.getElementById("topItemsList");
    box.innerHTML = "";

    if (!items.length) {
      box.innerText = "No data available";
      return;
    }

    items.forEach((item, index) => {
      box.innerHTML += `
        <div class="report-row">
          <strong>${index + 1}. ${item.menu_item__name}</strong>
          <span>Sold: ${item.total_sold}</span>
        </div>
      `;
    });
    renderTopItemsChart(items);
  });
}

let topItemsChart = null;

function renderTopItemsChart(items) {
  const labels = items.map(i => i.menu_item__name);
  const data = items.map(i => i.total_sold);

  const ctx = document.getElementById("topItemsChart").getContext("2d");

  if (topItemsChart) {
    topItemsChart.destroy();
  }

  topItemsChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Items Sold",
        data: data,
        backgroundColor: "#6366f1"
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

let userStatusChart = null;

function renderUserChart(active, disabled) {
  const ctx = document.getElementById("userStatusChart").getContext("2d");

  if (userStatusChart) {
    userStatusChart.destroy();
  }

  userStatusChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Active Users", "Disabled Users"],
      datasets: [{
        data: [active, disabled],
        backgroundColor: ["#22c55e", "#ef4444"]
      }]
    },
    options: {
      responsive: true
    }
  });
}
