async function fetchStats() {
  const username = document.getElementById("username").value;
  const results = document.getElementById("results");
  const loading = document.getElementById("loading");

  if (!username) return;

  loading.classList.remove("hidden");
  loading.textContent = "Loading...";
  results.classList.add("hidden");

  try {
    const response = await fetch(`/api/user/${username}`);
    const data = await response.json();

    if (!response.ok) {
      loading.textContent = `
Status: ${response.status}
Error: ${data.error}
Message: ${data.message || ""}
      `;
      return;
    }

    // Mostrar JSON completo bonito
    const formatted = JSON.stringify(data, null, 2);

    document.getElementById("jsonOutput").textContent = formatted;

    loading.classList.add("hidden");
    results.classList.remove("hidden");

  } catch (error) {
    loading.textContent = `Network error: ${error.message}`;
  }
}