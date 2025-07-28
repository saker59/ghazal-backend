const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');
const BACKEND_URL = "http://localhost:5000"; // Change if deployed

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(`${BACKEND_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // Optionally: Save token if you're using JWT
      localStorage.setItem('ghazal_admin_logged_in', 'true');
      window.location.href = 'admin.html'; // redirect to admin dashboard
    } else {
      errorMsg.textContent = data.message || "Invalid credentials.";
    }
  } catch (err) {
    console.error(err);
    errorMsg.textContent = "❌ Server error. Try again.";
  }
});
