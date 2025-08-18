const salesContainer = document.getElementById('salesProperties');
const BACKEND_URL = "https://petit-ghazal-production-e0f6.up.railway.app"; // ✅ no trailing slash

// Fetch and render sales properties
async function renderSalesProperties() {
  salesContainer.innerHTML = "";

  try {
    const res = await fetch(`${BACKEND_URL}/properties?type=sale`);
    const salesProperties = await res.json();

    if (!Array.isArray(salesProperties) || salesProperties.length === 0) {
      salesContainer.innerHTML = '<p style="text-align:center;">No sales match your search.</p>';
      return;
    }

    salesProperties.forEach(property => {
      salesContainer.innerHTML += `
        <div class="property-card" onclick='openSalesModal(${JSON.stringify(property)})'>
          <img src="${BACKEND_URL}${property.image}" alt="Property image" />
          <h3>${property.title}</h3>
          <p><strong>Price:</strong> ${property.price} TND</p>
          <p>${property.description}</p>
        </div>
      `;
    });
  } catch (error) {
    console.error("❌ Error loading sales:", error);
    salesContainer.innerHTML = "<p>Error loading properties.</p>";
  }
}

// Filter properties by title & price (client-side)
function filterProperties() {
  const titleQuery = document.getElementById('searchTitle').value.toLowerCase();
  const min = parseFloat(document.getElementById('minPrice').value) || 0;
  const max = parseFloat(document.getElementById('maxPrice').value) || Infinity;

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
  renderSalesProperties();
}

// Modal functions
function openSalesModal(property) {
  document.getElementById('salesModalImage').src = BACKEND_URL + property.image;
  document.getElementById('salesModalTitle').innerText = property.title;
  document.getElementById('salesModalPrice').innerText = property.price;
  document.getElementById('salesModalDescription').innerText = property.description;
  document.getElementById('salesModal').style.display = 'flex';
}

function closeSalesModal() {
  document.getElementById('salesModal').style.display = 'none';
}

// Attach event listeners
document.getElementById('searchTitle').addEventListener('input', filterProperties);
document.getElementById('minPrice').addEventListener('input', filterProperties);
document.getElementById('maxPrice').addEventListener('input', filterProperties);

// Initial load
renderSalesProperties();
