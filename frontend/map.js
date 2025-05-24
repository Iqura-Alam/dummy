let map = L.map('map').setView([23.8103, 90.4125], 7);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let marker = null;

async function fetchPlaces(lat, lng) {
  // Foursquare category ID for tourist attractions: 16000 (Tourist Attraction)
  // Docs: https://developer.foursquare.com/docs/categories/
  const url = new URL('https://api.foursquare.com/v3/places/search');
  url.searchParams.append('ll', `${lat},${lng}`);
  url.searchParams.append('radius', 5000); // 5km radius, adjust if needed
  url.searchParams.append('categories', '16000'); // tourist attractions
  url.searchParams.append('sort', 'rating'); // sort by rating
  url.searchParams.append('limit', '5'); // top 5

  const res = await fetch(`https://api.foursquare.com/v3/places/search?ll=${lat},${lng}&radius=2000&limit=5&fields=fsq_id,name,location,rating`, {
  headers: {
    Authorization: 'fsq3eOQdeMeH36LTEJQ91R25f5RzfAP0qrrWBUKLA13/gOg='
  }
});

  const data = await res.json();
  return data.results || [];
}


function displayPlaces(places) {
  const container = document.getElementById('placesContainer');
  container.innerHTML = '';
  places.forEach(place => {
    const rating = place.rating !== undefined ? `⭐ ${place.rating.toFixed(1)}` : 'No rating';
    const card = document.createElement('div');
    card.className = 'place-card';
    card.innerHTML = `
      <h3>${place.name} <small style="font-weight: normal; color: #666;">${rating}</small></h3>
      <p>${place.location?.formatted_address || 'No address available'}</p>
    `;
    container.appendChild(card);
  });
}


document.getElementById('locationInput').addEventListener('input', async (e) => {
  const query = e.target.value.trim();
  const suggestionsDiv = document.getElementById('suggestions');
  suggestionsDiv.innerHTML = '';
  if (!query) return;

  try {
    const res = await fetch(`http://localhost:3000/api/institutes?q=${encodeURIComponent(query)}`);
    const institutes = await res.json();

    institutes.forEach(inst => {
      const div = document.createElement('div');
      div.textContent = inst.name;
      div.onclick = async () => {
        document.getElementById('locationInput').value = inst.name;
        suggestionsDiv.innerHTML = '';

        const lat = parseFloat(inst.latitude);
        const lng = parseFloat(inst.longitude);
        map.setView([lat, lng], 16);

        if (marker) map.removeLayer(marker);
        marker = L.marker([lat, lng], { draggable: true }).addTo(map).bindPopup(inst.name).openPopup();

        const nearby = await fetchPlaces(lat, lng);
        displayPlaces(nearby);
      };
      suggestionsDiv.appendChild(div);
    });
  } catch (err) {
    console.error(err);
  }
});

document.getElementById('goBtn').addEventListener('click', async () => {
  const name = document.getElementById('locationInput').value.trim();
  if (!name) return alert('Enter an institution name');

  const res = await fetch(`http://localhost:3000/api/institutes?q=${encodeURIComponent(name)}`);
  const results = await res.json();
  if (results.length === 0) return alert('Institution not found');

  const inst = results[0];
  const lat = parseFloat(inst.latitude);
  const lng = parseFloat(inst.longitude);

  map.setView([lat, lng], 16);
  if (marker) map.removeLayer(marker);
  marker = L.marker([lat, lng], { draggable: true }).addTo(map).bindPopup(inst.name).openPopup();

  const nearby = await fetchPlaces(lat, lng);
  displayPlaces(nearby);
});

map.on('click', function (e) {
  if (marker) map.removeLayer(marker);
  marker = L.marker(e.latlng).addTo(map).bindPopup('Manual Marker').openPopup();
});
