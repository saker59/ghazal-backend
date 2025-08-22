// admin.js
const form = document.getElementById('propertyForm');
const preview = document.getElementById('propertyPreview');
const BACKEND_URL = "https://petit-ghazal-production-e0f6.up.railway.app";
let editingId = null; // Track if we're editing

// ===== Submit form (Add / Edit) =====
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const confirmAdd = confirm(editingId ? "Are you sure you want to update this property?" : "Are you sure you want to add this property?");
  if (!confirmAdd) return;

  const formData = new FormData();
  formData.append('title', document.getElementById('title').value);
  formData.append('type', document.getElementById('type').value.toLowerCase());
  formData.append('price', document.getElementById('price').value);
  formData.append('description', document.getElementById('description').value);
  formData.append('status', document.getElementById('status').value);

  const imageInput = document.getElementById('image');
  if (imageInput.files.length > 0) {
    formData.append('image', imageInput.files[0]);
  }

  try {
    const endpoint = editingId
      ? `${BACKEND_URL}/properties/${editingId}`
      : `${BACKEND_URL}/properties`;

    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(endpoint, { method, body: formData });
    const result = await res.json();

    if (result.success) {
      showToast(editingId ? "✅ Property updated!" : "✅ Property added!", "success");
      form.reset();
      editingId = null;
      renderCards();
    } else {
      showToast("❌ Couldn't save property.", "error");
    }
  } catch (error) {
    console.error("❌ Error submitting form:", error);
    showToast("❌ Server error.", "error");
  }
});

// ===== Toast Notification =====
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.style.display = "block";

  setTimeout(() => { toast.style.display = "none"; }, 3000);
}

// ===== Render Properties =====
async function renderCards() {
  preview.innerHTML = "";

  try {
    const res = await fetch(`${BACKEND_URL}/properties`);
    const properties = await res.json();

    if (!properties || properties.length === 0) {
      preview.innerHTML = `<p>No properties yet.</p>`;
      return;
    }

    properties.forEach((property) => {
      const statusText = property.status?.toUpperCase() || "N/A";
      const statusClass = property.status || "unknown";
      const imgSrc = property.image ? `${BACKEND_URL}${property.image}` : "https://via.placeholder.com/300x200?text=No+Image";

      preview.innerHTML += `
        <div class="card">
          <img src="${imgSrc}" alt="Property image"
            onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=Image+Missing';" />
          <h3>${property.title}</h3>
          <p><strong>Type:</strong> ${property.type}</p>
          <p><strong>Price:</strong> ${property.price} TND</p>
          <p><strong>Status:</strong> ${statusText}</p>
          <div class="status-badge ${statusClass}">${statusText}</div>
          <p>${property.description}</p>
          <button onclick="deleteProperty('${property._id}')">🗑️ Delete</button>
          <button onclick="editProperty('${property._id}')">✏️ Edit</button>
        </div>
      `;
    });
  } catch (error) {
    console.error("❌ Failed to fetch properties:", error);
    preview.innerHTML = `<p>Error loading properties.</p>`;
  }
}

// ===== Delete Property =====
async function deleteProperty(id) {
  if (!confirm("Are you sure you want to delete this property?")) return;

  try {
    const res = await fetch(`${BACKEND_URL}/properties/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      showToast("✅ Property deleted!", "success");
      renderCards();
    } else {
      showToast("❌ Failed to delete.", "error");
    }
  } catch (err) {
    console.error(err);
    showToast("❌ Server error.", "error");
  }
}

// ===== Edit Property =====
async function editProperty(id) {
  try {
    const res = await fetch(`${BACKEND_URL}/properties`);
    const properties = await res.json();
    const property = properties.find(p => p._id === id);

    if (!property) return alert("❌ Property not found.");

    document.getElementById('title').value = property.title;
    document.getElementById('type').value = property.type;
    document.getElementById('price').value = property.price;
    document.getElementById('description').value = property.description;
    document.getElementById('status').value = property.status;

    editingId = id;
  } catch (err) {
    console.error("❌ Failed to load property:", err);
  }
}

// ===== Initial Load =====
renderCards();
