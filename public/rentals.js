const rentalContainer = document.getElementById('rentalProperties');
const BACKEND_URL = "https://petit-ghazal-production-e0f6.up.railway.app/";

// Fetch and render rental properties
async function renderRentalProperties() {
  rentalContainer.innerHTML = "";

  try {
    const res = await fetch(`${BACKEND_URL}/properties?type=rental`);
    const rentalProperties = await res.json();

    if (rentalProperties.length === 0) {
      rentalContainer.innerHTML = '<p style="text-align:center;">No rentals match your search.</p>';
      return;
    }

    rentalProperties.forEach(property => {
      rentalContainer.innerHTML += `
        <div class="property-card" onclick='openModal(${JSON.stringify(property)})'>
          <img src="${BACKEND_URL}${property.image}" alt="Property image" />
          <h3>${property.title}</h3>
          <p><strong>Price:</strong> ${property.price} TND</p>
          <p>${property.description}</p>
        </div>
      `;
    });
  } catch (error) {
    console.error("❌ Error loading rentals:", error);
    rentalContainer.innerHTML = "<p>Error loading properties.</p>";
  }
}

function filterProperties() {
  const titleQuery = document.getElementById('searchTitle').value.toLowerCase();
  const min = parseFloat(document.getElementById('minPrice').value) || 0;
  const max = parseFloat(document.getElementById('maxPrice').value) || Infinity;

  // Filter current rendered properties (optional improvement: filter backend-side)
  const cards = document.querySelectorAll('.property-card');
  cards.forEach(card => {
    const title = card.querySelector('h3').innerText.toLowerCase();
    const priceText = card.querySelector('p strong')?.nextSibling?.textContent || '';
    const price = parseFloat(priceText) || 0;

    const matchesTitle = title.includes(titleQuery);
    const matchesPrice = price >= min && price <= max;

    card.style.display = (matchesTitle && matchesPrice) ? 'block' : 'none';
  });
}

function resetFilters() {
  document.getElementById('searchTitle').value = '';
  document.getElementById('minPrice').value = '';
  document.getElementById('maxPrice').value = '';
  renderRentalProperties();
}

function openModal(property) {
  document.getElementById('modalImage').src = BACKEND_URL + property.image;
  document.getElementById('modalTitle').innerText = property.title;
  document.getElementById('modalPrice').innerText = property.price;
  document.getElementById('modalDescription').innerText = property.description;
  document.getElementById('propertyModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('propertyModal').style.display = 'none';
}

// Attach event listeners
document.getElementById('searchTitle').addEventListener('input', filterProperties);
document.getElementById('minPrice').addEventListener('input', filterProperties);
document.getElementById('maxPrice').addEventListener('input', filterProperties);

// Initial load
renderRentalProperties();