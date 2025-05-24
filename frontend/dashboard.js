document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) return window.location.href = 'login.html';

  loadRecent();

  document.getElementById('searchBar').addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    if (query.length === 0) return loadRecent();

    const res = await fetch(`https://dummy-2lfk.onrender.com/api/listings/search?q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const results = await res.json();
    if (res.ok) renderListings(results);
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  });
});

function filterByCategory(category) {
  const token = localStorage.getItem('token');
  fetch(`https://dummy-2lfk.onrender.com/api/listings/category/${category}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(renderListings)
    .catch(() => alert("Failed to fetch filtered listings"));
}

async function loadRecent() {
  const token = localStorage.getItem('token');
  const res = await fetch('https://dummy-2lfk.onrender.com/api/listings/recent', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (res.ok) renderListings(data);
}

function renderListings(listings) {
  const container = document.getElementById('listingContainer');
  container.innerHTML = "";

  listings.forEach(listing => {
    const card = document.createElement('div');
    card.className = 'listing-card';
    card.innerHTML = `
      <h3>${listing.title}</h3>
      <p>${listing.category} • ${listing.priceType}: ${listing.price}</p>
      <p>${listing.university}</p>
      <button onclick="viewListing('${listing._id}')">Chat</button>
    `;
    container.appendChild(card);
  });
}

function viewListing(id) {
  window.location.href = `chat.html?id=${id}`;
}
document.getElementById("logoutBtn").addEventListener("click", function (e) {
  e.preventDefault();

  // Clear local and session storage
  localStorage.clear();
  sessionStorage.clear();

  // Clear cookie (if used)
  //document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  // Redirect to login or landing page
  window.location.href = "index.html";
});
async function filterByPrice() {
  const token = localStorage.getItem('token');
  const min = document.getElementById('minPrice').value;
  const max = document.getElementById('maxPrice').value;

  if (!min || !max || isNaN(min) || isNaN(max)) {
    return alert("Please enter valid minimum and maximum prices.");
  }

  try {
    const res = await fetch(`https://dummy-2lfk.onrender.com/api/listings/price?min=${min}&max=${max}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (res.ok) {
      renderListings(data);
    } else {
      alert("Failed to fetch price-filtered listings");
    }
  } catch (error) {
    alert("Something went wrong");
  }
}
