document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok) {
      localStorage.setItem('token', result.token); // ✅ Store the token
      showLoginMessage("✅ Login successful! Redirecting...", "green");

      setTimeout(() => {
        window.location.href = 'selectAction.html'; // ✅ Redirect to listing form
      }, 1000);
    } else {
      showLoginMessage(result.message || "Login failed.", "red");
    }
  } catch {
    showLoginMessage("Server error. Try again later.", "red");
  }
});

function showLoginMessage(msg, color) {
  const message = document.getElementById('loginMessage');
  message.textContent = msg;
  message.style.color = color;
}
