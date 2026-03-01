let currentPage = 0;
let currentUsername = "";
let currentPageSize = 20;

async function loadUser(username, page = 0) {
  const res = await fetch(
    `/api/user/${username}?page=${page}&pageSize=${currentPageSize}`
  );

  const data = await res.json();

  currentPage = data.page;

  renderTable(data.submissions);
  renderMetrics(data.metrics);
  renderPagination(data.hasMore, data.page);
  renderJSON(data);
}

function renderTable(submissions) {
  const table = document.getElementById("submissions");
  table.innerHTML = "";

  submissions.forEach(sub => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${sub.oj}</td>
      <td>${sub.problem}</td>
      <td>${sub.problemId}</td>
      <td>${sub.contestName ?? "-"}</td>
      <td>${sub.contestNum ?? "-"}</td>
      <td>${sub.status}</td>
      <td>${sub.difficulty}</td>
    `;

    table.appendChild(row);
  });
}

function renderMetrics(metrics) {
  const box = document.getElementById("metrics");

  box.innerHTML = `
    <h3>Metrics (Last ${metrics.totalSubmissions} Submissions)</h3>
    <p>Total submissions: ${metrics.totalSubmissions}</p>
    <p>Accepted: ${metrics.accepted}</p>
    <p>Unique solved: ${metrics.uniqueSolved}</p>
    <p>Acceptance rate: ${metrics.acceptanceRate}%</p>
  `;
}

function renderPagination(hasMore, page) {
  const container = document.getElementById("pagination");

  container.innerHTML = `
    <button ${page === 0 ? "disabled" : ""} id="prev">Prev</button>
    <span> Page ${page + 1} </span>
    <button ${!hasMore ? "disabled" : ""} id="next">Next</button>
  `;

  document.getElementById("prev")?.addEventListener("click", () => {
    loadUser(currentUsername, currentPage - 1);
  });

  document.getElementById("next")?.addEventListener("click", () => {
    loadUser(currentUsername, currentPage + 1);
  });
}

function renderJSON(data) {
  const pre = document.getElementById("jsonView");
  pre.textContent = JSON.stringify(data, null, 2);
}

document.getElementById("applyPageSizeBtn").addEventListener("click", () => {
  const value = parseInt(document.getElementById("pageSizeInput").value);

  if (!value || value <= 0) {
    alert("Please enter a valid number.");
    return;
  }

  currentPageSize = value;

  if (currentUsername) {
    loadUser(currentUsername, 0);
  }
});

document.getElementById("tableViewBtn").addEventListener("click", () => {
  document.querySelector("table").style.display = "table";
  document.getElementById("jsonView").style.display = "none";
});

document.getElementById("jsonViewBtn").addEventListener("click", () => {
  document.querySelector("table").style.display = "none";
  document.getElementById("jsonView").style.display = "block";
});

document
  .getElementById("searchForm")
  .addEventListener("submit", e => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    currentUsername = username;
    loadUser(username, 0);
  });