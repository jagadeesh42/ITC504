const API_BASE = "http://localhost:5000/products";

let products = [];
let editIndex = -1;
let editId = null;

const productForm = document.getElementById("productForm");
const inventoryTable = document.getElementById("inventoryTable").getElementsByTagName("tbody")[0];
const exportBtn = document.getElementById("exportBtn");
const searchInput = document.getElementById("searchInput");
const cardsContainer = document.getElementById("cardsContainer");

// modal elements
const modalOverlay = document.getElementById("modalOverlay");
const modalMessage = document.getElementById("modalMessage");
const modalOk = document.getElementById("modalOk");
const modalIcon = document.getElementById("modalIcon");

modalOk.addEventListener("click", () => {
    closeModal();
});

// open/close modal helpers
function showModal(message, type = "info") {
    modalMessage.textContent = message;
    modalOverlay.classList.remove("hidden");
    modalOverlay.style.display = "flex";
    // simple icon style: success / error / info
    modalIcon.innerHTML = type === "success" ? '<i class="fas fa-check-circle" style="color:#38d39f;font-size:28px"></i>' :
        type === "error" ? '<i class="fas fa-times-circle" style="color:#ff6b6b;font-size:28px"></i>' :
            '<i class="fas fa-info-circle" style="color:#67a0ff;font-size:28px"></i>';
}

function closeModal() {
    modalOverlay.classList.add("hidden");
    modalOverlay.style.display = "none";
}

// Tab switching
function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(tb => tb.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if (tabId === 'viewTab') document.querySelector('.tab-btn[onclick*="viewTab"]').classList.add('active');
    else if (tabId === 'addTab') document.querySelector('.tab-btn[onclick*="addTab"]').classList.add('active');
    else document.querySelector('.tab-btn[onclick*="aboutTab"]').classList.add('active');

    // If switching to view, refresh data
    if (tabId === 'viewTab') {
        loadProducts().catch(err => showModal("Failed to load products", "error"));
    }
}

// Validation helpers
function isLetters(str) { return /^[A-Za-z\s]+$/.test(str); }
function isPositiveNumber(str) { return /^[0-9]+(\.[0-9]+)?$/.test(str); }

// Load products from backend
async function loadProducts() {
    try {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error("Network response not ok");
        products = await res.json();
        renderTable();
        renderCards();
    } catch (err) {
        console.error(err);
        showModal("Unable to fetch products from backend.", "error");
    }
}

// initial load (attempt)
loadProducts();

// Add/Edit Product
productForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("productName").value.trim();
    const qty = document.getElementById("productQty").value.trim();
    const price = document.getElementById("productPrice").value.trim();
    const category = document.getElementById("productCategory").value;

    // Validation
    if (!isLetters(name)) { showModal("Product Name must contain letters only!", "error"); return; }
    if (!isPositiveNumber(qty) || parseFloat(qty) < 0) { showModal("Quantity must be a positive number!", "error"); return; }
    if (!isPositiveNumber(price) || parseFloat(price) < 0) { showModal("Price must be a positive number!", "error"); return; }
    if (category === "") { showModal("Please select a category!", "error"); return; }

    const payload = { name, qty: parseFloat(qty), price: parseFloat(price), category };

    try {
        if (editId) {
            // update
            const res = await fetch(`${API_BASE}/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Update failed");
            showModal("Product updated successfully!", "success");
            editId = null;
            editIndex = -1;
        } else {
            // create
            const res = await fetch(API_BASE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Create failed");
            showModal("Product added successfully!", "success");
        }

        productForm.reset();
        await loadProducts();
        openTab('viewTab');
    } catch (err) {
        console.error(err);
        showModal("Operation failed — check backend console.", "error");
    }
});

// Render Table
function renderTable(filter = "") {
    inventoryTable.innerHTML = "";

    const matches = [];
    products.forEach((product, index) => {
        if (product.name.toLowerCase().includes(filter) || product.category.toLowerCase().includes(filter)) {
            matches.push({ product, index });
        }
    });

    if (matches.length === 0) {
        if (filter.length > 0) {
            const row = inventoryTable.insertRow();
            row.innerHTML = `<td colspan="5" style="text-align:center; color:#ff4d4d; font-weight:bold;">No products found.</td>`;
        }
        return;
    }

    matches.forEach(({ product, index }) => {
        const row = inventoryTable.insertRow();
        row.innerHTML = `<td>${product.name}</td><td>${product.category}</td>
        <td class="${product.qty < 5 ? 'low-stock' : ''}">${product.qty}</td>
        <td>$${product.price.toFixed(2)}</td>
        <td>
          <button class="btn btn-edit" onclick="editProduct(${index})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-delete" onclick="deleteProduct(${index})"><i class="fas fa-trash-alt"></i></button>
        </td>`;
    });
}

// Render Cards
function renderCards(filter = "") {
    cardsContainer.innerHTML = "";

    const matches = [];
    products.forEach((product, index) => {
        if (product.name.toLowerCase().includes(filter) || product.category.toLowerCase().includes(filter)) {
            matches.push({ product, index });
        }
    });

    if (matches.length === 0) {
        if (filter.length > 0) {
            const msg = document.createElement("div");
            msg.style.textAlign = "center";
            msg.style.color = "#ff4d4d";
            msg.style.fontWeight = "bold";
            msg.style.marginTop = "20px";
            msg.textContent = "No products found.";
            cardsContainer.appendChild(msg);
        }
        return;
    }

    matches.forEach(({ product, index }) => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `<h3>${product.name}</h3>
        <p><strong>Category:</strong> ${product.category}</p>
        <p><strong>Quantity:</strong> <span class="${product.qty < 5 ? 'low-stock' : ''}">${product.qty}</span></p>
        <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
        <div class="card-actions">
          <button class="btn btn-edit" onclick="editProduct(${index})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-delete" onclick="deleteProduct(${index})"><i class="fas fa-trash-alt"></i></button>
        </div>`;
        cardsContainer.appendChild(card);
    });
}

// Edit/Delete
function editProduct(index) {
    const product = products[index];
    document.getElementById("productName").value = product.name;
    document.getElementById("productQty").value = product.qty;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productCategory").value = product.category;
    editId = product._id || product.id || null; // support both _id and id
    editIndex = index;
    openTab('addTab');
    showModal("Editing product. Make changes and click Save.", "info");
}

async function deleteProduct(index) {
    const ok = confirm("Are you sure you want to delete this product?");
    if (!ok) return;

    try {
        const id = products[index]._id || products[index].id;
        const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete failed");
        showModal("Product deleted successfully!", "success");
        await loadProducts();
    } catch (err) {
        console.error(err);
        showModal("Delete failed — check backend.", "error");
    }
}

// Export CSV
exportBtn.addEventListener("click", function () {
    let csvContent = "data:text/csv;charset=utf-8,Product,Category,Quantity,Price\n";
    products.forEach(p => csvContent += `${p.name},${p.category},${p.qty},${p.price}\n`);
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "inventory.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showModal("CSV exported (download should start).", "success");
});

// Search/filter
searchInput.addEventListener("input", function () {
    const filter = searchInput.value.trim().toLowerCase();
    renderTable(filter);
    renderCards(filter);
});
