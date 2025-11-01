let products = [];
let editIndex = -1;

const productForm = document.getElementById("productForm");
const inventoryTable = document.getElementById("inventoryTable").getElementsByTagName("tbody")[0];
const exportBtn = document.getElementById("exportBtn");
const searchInput = document.getElementById("searchInput");
const cardsContainer = document.getElementById("cardsContainer");

// Tab switching
function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(tb => tb.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if (tabId === 'viewTab') document.querySelector('.tab-btn[onclick*="viewTab"]').classList.add('active');
    else if (tabId === 'addTab') document.querySelector('.tab-btn[onclick*="addTab"]').classList.add('active');
    else document.querySelector('.tab-btn[onclick*="aboutTab"]').classList.add('active');
}

// Validation helpers
function isLetters(str) { return /^[A-Za-z\s]+$/.test(str); }
function isPositiveNumber(str) { return /^[0-9]+(\.[0-9]+)?$/.test(str); }

// Add/Edit Product
productForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("productName").value.trim();
    const qty = document.getElementById("productQty").value.trim();
    const price = document.getElementById("productPrice").value.trim();
    const category = document.getElementById("productCategory").value;

    // Validation
    if (!isLetters(name)) { alert("Product Name must contain letters only!"); return; }
    if (!isPositiveNumber(qty) || parseFloat(qty) < 0) { alert("Quantity must be a positive number!"); return; }
    if (!isPositiveNumber(price) || parseFloat(price) < 0) { alert("Price must be a positive number!"); return; }
    if (category === "") { alert("Please select a category!"); return; }

    if (editIndex >= 0) {
        products[editIndex] = { name, qty: parseFloat(qty), price: parseFloat(price), category };
        editIndex = -1;
    } else {
        products.push({ name, qty: parseFloat(qty), price: parseFloat(price), category });
    }

    productForm.reset();
    renderTable();
    renderCards();
});

// Render Table
function renderTable(filter = "") {
    inventoryTable.innerHTML = "";
    products.forEach((product, index) => {
        if (product.name.toLowerCase().includes(filter) || product.category.toLowerCase().includes(filter)) {
            const row = inventoryTable.insertRow();
            row.innerHTML = `<td>${product.name}</td><td>${product.category}</td>
        <td class="${product.qty < 5 ? 'low-stock' : ''}">${product.qty}</td>
        <td>$${product.price.toFixed(2)}</td>
        <td>
          <button class="btn btn-edit" onclick="editProduct(${index})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-delete" onclick="deleteProduct(${index})"><i class="fas fa-trash-alt"></i></button>
        </td>`;
        }
        // Show "No products found" if table is empty
        if (inventoryTable.rows.length === 0) {
            const row = inventoryTable.insertRow();
            row.innerHTML = `<td colspan="5" style="text-align:center; color:#ff4d4d;">No products found.</td>`;
        }

    });
}

// Render Cards
function renderCards(filter = "") {
    cardsContainer.innerHTML = "";
    products.forEach((product, index) => {
        if (product.name.toLowerCase().includes(filter) || product.category.toLowerCase().includes(filter)) {
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
        }
        // Show "No products found" if no cards
        if (cardsContainer.children.length === 0) {
            const msg = document.createElement("div");
            msg.style.textAlign = "center";
            msg.style.color = "#ff4d4d";
            msg.style.fontWeight = "bold";
            msg.style.marginTop = "20px";
            msg.textContent = "No products found.";
            cardsContainer.appendChild(msg);
        }

    });
}

// Edit/Delete
function editProduct(index) {
    const product = products[index];
    document.getElementById("productName").value = product.name;
    document.getElementById("productQty").value = product.qty;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productCategory").value = product.category;
    openTab('addTab');
    editIndex = index;
}

function deleteProduct(index) {
    if (confirm("Are you sure you want to delete this product?")) {
        products.splice(index, 1);
        renderTable();
        renderCards();
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
});

// Search/filter
searchInput.addEventListener("input", function () {
    const filter = searchInput.value.trim().toLowerCase();
    renderTable(filter);
    renderCards(filter);
});

// Initial render
renderTable();
renderCards();
