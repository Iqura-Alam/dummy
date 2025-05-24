const form = document.getElementById('listingForm');
const message = document.getElementById('message');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('token');

  if (!token) {
    message.textContent = "You must be logged in to create a listing.";
    message.style.color = "red";
    return;
  }

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Ensure numeric type for price
  data.price = Number(data.price) || 0;

  try {
    const res = await fetch('http://localhost:3000/api/listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok) {
      message.textContent = "✅ Listing created successfully!";
      message.style.color = "green";
      form.reset();
    } else {
      message.textContent = result.error || "❌ Failed to create listing.";
      message.style.color = "red";
    }
  } catch (err) {
    message.textContent = "⚠️ Error: " + err.message;
    message.style.color = "red";
  }
});
