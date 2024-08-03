class InventoryManager {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('products')) || [];
        this.displayProducts();
    }

    addProduct(product) {
        product.id = Date.now(); // Usar timestamp como ID único
        this.products.push(product);
        this.saveToLocalStorage();
        this.displayProducts();
    }

    updateProduct(id, updatedProduct) {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...updatedProduct };
            this.saveToLocalStorage();
            this.displayProducts();
        }
    }

    deleteProduct(id) {
        this.products = this.products.filter(p => p.id !== id);
        this.saveToLocalStorage();
        this.displayProducts();
    }

    makeSale(productId, quantity) {
        const product = this.products.find(p => p.id === productId);
        if (product && product.quantity >= quantity) {
            product.quantity -= quantity;
            this.saveToLocalStorage();
            this.displayProducts();
            this.createInvoice(product, quantity);
            return true;
        }
        return false;
    }

    createInvoice(product, quantity) {
        const invoice = {
            id: Date.now(),
            productId: product.id,
            productName: product.name,
            quantity: quantity,
            totalPrice: product.price * quantity,
            date: new Date().toISOString()
        };
        let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
        invoices.push(invoice);
        localStorage.setItem('invoices', JSON.stringify(invoices));
    }

    saveToLocalStorage() {
        localStorage.setItem('products', JSON.stringify(this.products));
    }

    displayProducts() {
        const tableBody = document.getElementById('tabla-inventario');
        tableBody.innerHTML = '';
        this.products.forEach(product => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${product.quantity}</td>
                <td>$${(product.price * product.quantity).toFixed(2)}</td>
                <td>
                    <button class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2 edit-btn" data-id="${product.id}">Editar</button>
                    <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded delete-btn" data-id="${product.id}">Eliminar</button>
                    <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded ml-2 sale-btn" data-id="${product.id}">Vender</button>
                </td>
            `;
        });
        this.attachEventListeners();
    }

    attachEventListeners() {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => this.showEditModal(e.target.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => this.deleteProduct(parseInt(e.target.dataset.id)));
        });
        document.querySelectorAll('.sale-btn').forEach(button => {
            button.addEventListener('click', (e) => this.showSaleModal(e.target.dataset.id));
        });
    }

    showEditModal(id) {
        const product = this.products.find(p => p.id === parseInt(id));
        if (product) {
            document.getElementById('producto-id').value = product.id;
            document.getElementById('producto-nombre').value = product.name;
            document.getElementById('producto-categoria').value = product.category;
            document.getElementById('producto-precio').value = product.price;
            document.getElementById('producto-cantidad').value = product.quantity;
            document.getElementById('modal-producto').classList.remove('hidden');
        }
    }

    showSaleModal(id) {
        const product = this.products.find(p => p.id === parseInt(id));
        if (product) {
            document.getElementById('venta-producto-id').value = product.id;
            document.getElementById('venta-producto-nombre').textContent = product.name;
            document.getElementById('venta-cantidad').max = product.quantity;
            document.getElementById('modal-venta').classList.remove('hidden');
        }
    }
}

// Inicialización y manejo de eventos
const inventoryManager = new InventoryManager();

document.getElementById('btn-agregar').addEventListener('click', () => {
    document.getElementById('modal-producto').classList.remove('hidden');
});

document.getElementById('form-producto').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('producto-id').value;
    const product = {
        name: document.getElementById('producto-nombre').value,
        category: document.getElementById('producto-categoria').value,
        price: parseFloat(document.getElementById('producto-precio').value),
        quantity: parseInt(document.getElementById('producto-cantidad').value)
    };
    if (id) {
        inventoryManager.updateProduct(parseInt(id), product);
    } else {
        inventoryManager.addProduct(product);
    }
    document.getElementById('modal-producto').classList.add('hidden');
    document.getElementById('form-producto').reset();
});

document.getElementById('form-venta').addEventListener('submit', (e) => {
    e.preventDefault();
    const productId = parseInt(document.getElementById('venta-producto-id').value);
    const quantity = parseInt(document.getElementById('venta-cantidad').value);
    if (inventoryManager.makeSale(productId, quantity)) {
        alert('Venta realizada con éxito');
    } else {
        alert('No se pudo realizar la venta. Verifique la cantidad disponible.');
    }
    document.getElementById('modal-venta').classList.add('hidden');
    document.getElementById('form-venta').reset();
});

document.querySelectorAll('.modal').forEach(modal => {
    modal.querySelector('.close').addEventListener('click', () => {
        modal.classList.add('hidden');
    });
});