// login.js
const form = document.getElementById('loginForm');
const BACKEND_URL = "https://petit-ghazal-production-e0f6.up.railway.app"; // ✅ Always Railway

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch(`${BACKEND_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // ✅ Redirect to admin panel
      window.location.href = "/admin.html";
    } else {
      alert("❌ Invalid username or password.");
    }
  } catch (error) {
    console.error("❌ Login error:", error);
    alert("❌ Server error. Please try again later.");
  }
});
