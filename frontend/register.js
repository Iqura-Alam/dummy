const universitySelect = document.getElementById('university');
const domainSpan = document.getElementById('domain');
let currentDomain = '';

universitySelect?.addEventListener('change', () => {
  const selected = universitySelect.options[universitySelect.selectedIndex];
  currentDomain = selected.dataset.domain || '';
  domainSpan.textContent = '@' + currentDomain;
});

document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const emailLocal = document.getElementById('emailLocal').value.trim();
  if (!currentDomain) {
    return showSignupMessage("Select your university.", "red");
  }

  const fullEmail = `${emailLocal}@${currentDomain}`;
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  data.email = fullEmail;

  try {
    const res = await fetch('https://dummy-2lfk.onrender.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok) {
      showSignupMessage(`✅ Welcome ${data.name}! Check ${data.email} to verify.`, "green");
      form.reset();
      domainSpan.textContent = '@domain.edu';
    } else {
      showSignupMessage(result.message || 'Registration failed.', "red");
    }
  } catch {
    showSignupMessage("Server error. Try later.", "red");
  }
});

function showSignupMessage(msg, color) {
  const message = document.getElementById('signupMessage');
  message.textContent = msg;
  message.style.color = color;
}
