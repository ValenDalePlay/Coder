// Clase Producto
class Product {
    constructor(id, name, category, price, quantity, description = '') {
        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
        this.quantity = quantity;
        this.description = description;
    }

    totalValue() {
        return this.price * this.quantity;
    }
}

class InventoryManager {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('products')) || [];
        this.products = this.products.map(p => new Product(p.id, p.name, p.category, p.price, p.quantity, p.description));
        this.invoices = JSON.parse(localStorage.getItem('invoices')) || [];
        this.categories = ['Electrónica', 'Hogar', 'Moda', 'Deportes', 'Libros'];
        this.setupEventListeners();
        this.setupCategories();
        this.displayProducts();
        this.updateDashboard();
        this.updateIndexPage();
    }

    setupCategories() {
        const categoryDropdowns = document.querySelectorAll('#producto-categoria, #filtrar-categoria');
        categoryDropdowns.forEach(dropdown => {
            if (dropdown) {
                dropdown.innerHTML = '<option value="">Todas las categorías</option>';
                this.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.toLowerCase();
                    option.textContent = category;
                    dropdown.appendChild(option);
                });
            }
        });
    }

    setupEventListeners() {
        document.getElementById('btn-agregar')?.addEventListener('click', () => this.showAddProductModal());
        document.getElementById('form-producto')?.addEventListener('submit', (e) => this.handleProductSubmit(e));
        document.getElementById('form-venta')?.addEventListener('submit', (e) => this.handleSaleSubmit(e));
        document.querySelectorAll('.modal-close').forEach(button => {
            button.addEventListener('click', () => this.closeModal(button.closest('.modal')));
        });
        document.getElementById('buscar-producto')?.addEventListener('input', () => this.filterProducts());
        document.getElementById('filtrar-categoria')?.addEventListener('change', () => this.filterProducts());
        document.getElementById('btn-exportar')?.addEventListener('click', () => this.exportToCSV());
        document.getElementById('btn-importar')?.addEventListener('click', () => this.showImportModal());
        document.getElementById('btn-inventario')?.addEventListener('click', () => this.updateIndexPage());

        document.getElementById('tabla-inventario')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                this.showEditModal(e.target.dataset.id);
            } else if (e.target.classList.contains('delete-btn')) {
                this.confirmDelete(e.target.dataset.id);
            } else if (e.target.classList.contains('sale-btn')) {
                this.showSaleModal(e.target.dataset.id);
            }
        });
    }

    updateDashboard() {
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        };

        const totalProducts = this.products.length;
        const totalValue = this.products.reduce((sum, product) => sum + product.totalValue(), 0);
        const lowStockProducts = this.products.filter(product => product.quantity < 10).length;
        const totalCategories = new Set(this.products.map(product => product.category)).size;

        updateElement('total-productos', totalProducts);
        updateElement('valor-inventario', `$${totalValue.toFixed(2)}`);
        updateElement('productos-bajos', lowStockProducts);
        updateElement('total-categorias', totalCategories);
    }

    updateIndexPage() {
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        };

        updateElement('total-productos', this.products.length);

        const totalValue = this.products.reduce((sum, product) => sum + product.totalValue(), 0);
        updateElement('valor-inventario', `$${totalValue.toFixed(2)}`);

        const today = new Date().toDateString();
        const ventasHoy = this.invoices
            .filter(invoice => new Date(invoice.date).toDateString() === today)
            .reduce((sum, invoice) => sum + invoice.totalPrice, 0);
        updateElement('ventas-dia', `$${ventasHoy.toFixed(2)}`);
    }

    addProduct(product) {
        const newProduct = new Product(
            Date.now(),
            product.name,
            product.category,
            product.price,
            product.quantity,
            product.description
        );
        this.products.push(newProduct);
        this.updateIndexPageOnProductChange();
        this.displayProducts();
        this.updateDashboard();
    }

    updateProduct(id, updatedProduct) {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.products[index] = new Product(
                id,
                updatedProduct.name,
                updatedProduct.category,
                updatedProduct.price,
                updatedProduct.quantity,
                updatedProduct.description
            );
            this.updateIndexPageOnProductChange();
            this.displayProducts();
            this.updateDashboard();
        }
    }

    deleteProduct(id) {
        this.products = this.products.filter(p => p.id !== id);
        this.saveToLocalStorage();
        this.displayProducts();
        this.updateDashboard();
    }

    makeSale(productId, quantity) {
        const product = this.products.find(p => p.id === productId);
        if (product && product.quantity >= quantity) {
            product.quantity -= quantity;
            this.updateIndexPageOnSale();
            this.displayProducts();
            this.createInvoice(product, quantity);
            this.updateDashboard();
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
        this.invoices.push(invoice);
        this.saveToLocalStorage();
    }

    saveToLocalStorage() {
        localStorage.setItem('products', JSON.stringify(this.products));
        localStorage.setItem('invoices', JSON.stringify(this.invoices));
    }

    displayProducts() {
        const tableBody = document.getElementById('tabla-inventario');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        this.products.forEach(product => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${product.quantity}</td>
                <td>$${product.totalValue().toFixed(2)}</td>
                <td>
                    <button class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2 edit-btn" data-id="${product.id}">Editar</button>
                    <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded delete-btn" data-id="${product.id}">Eliminar</button>
                    <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded ml-2 sale-btn" data-id="${product.id}">Vender</button>
                </td>
            `;
        });
    }
    attachProductEventListeners() {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => this.showEditModal(e.target.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => this.confirmDelete(e.target.dataset.id));
        });
        document.querySelectorAll('.sale-btn').forEach(button => {
            button.addEventListener('click', (e) => this.showSaleModal(e.target.dataset.id));
        });
    }

    showAddProductModal() {
        document.getElementById('form-producto').reset();
        document.getElementById('producto-id').value = '';
        document.getElementById('modal-producto').classList.remove('hidden');
    }

    showEditModal(id) {
        const product = this.products.find(p => p.id === parseInt(id));
        if (product) {
            document.getElementById('producto-id').value = product.id;
            document.getElementById('producto-nombre').value = product.name;
            document.getElementById('producto-categoria').value = product.category;
            document.getElementById('producto-precio').value = product.price;
            document.getElementById('producto-cantidad').value = product.quantity;
            document.getElementById('producto-descripcion').value = product.description;
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

    confirmDelete(id) {
        const product = this.products.find(p => p.id === parseInt(id));
        if (product && confirm(`¿Estás seguro de que quieres eliminar ${product.name}?`)) {
            this.deleteProduct(parseInt(id));
        }
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    updateIndexPageOnProductChange() {
        this.updateIndexPage();
        this.saveToLocalStorage();
    }

    updateIndexPageOnSale() {
        this.updateIndexPage();
        this.saveToLocalStorage();
    }

    updateDashboard() {
        const totalProducts = this.products.length;
        const totalValue = this.products.reduce((sum, product) => sum + product.totalValue(), 0);
        const lowStockProducts = this.products.filter(product => product.quantity < 10).length;
        const totalCategories = new Set(this.products.map(product => product.category)).size;
    
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        };

        updateElement('total-productos', totalProducts);
        updateElement('valor-inventario', `$${totalValue.toFixed(2)}`);
        updateElement('productos-bajos', lowStockProducts);
        updateElement('total-categorias', totalCategories);
    }
    filterProducts() {
        const searchTerm = document.getElementById('buscar-producto').value.toLowerCase();
        const category = document.getElementById('filtrar-categoria').value;
        const filteredProducts = this.products.filter(product => {
            const matchSearch = product.name.toLowerCase().includes(searchTerm);
            const matchCategory = category === '' || product.category === category;
            return matchSearch && matchCategory;
        });
        this.displayProducts(filteredProducts);
    }

    exportToCSV() {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "ID,Nombre,Categoría,Precio,Cantidad,Valor Total\n"
            + this.products.map(p => `${p.id},${p.name},${p.category},${p.price},${p.quantity},${p.totalValue()}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "inventario.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    showImportModal() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.csv';
        fileInput.onchange = e => this.importFromCSV(e.target.files[0]);
        fileInput.click();
    }

    importFromCSV(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const lines = content.split('\n');
            lines.shift(); // Remove header
            lines.forEach(line => {
                const [id, name, category, price, quantity] = line.split(',');
                if (name && category && price && quantity) {
                    this.addProduct({
                        name, 
                        category, 
                        price: parseFloat(price), 
                        quantity: parseInt(quantity)
                    });
                }
            });
            this.displayProducts();
            this.updateDashboard();
        };
        reader.readAsText(file);
    }

    handleProductSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('producto-id').value;
        const product = {
            name: document.getElementById('producto-nombre').value,
            category: document.getElementById('producto-categoria').value,
            price: parseFloat(document.getElementById('producto-precio').value),
            quantity: parseInt(document.getElementById('producto-cantidad').value),
            description: document.getElementById('producto-descripcion').value
        };
        if (id) {
            this.updateProduct(parseInt(id), product);
        } else {
            this.addProduct(product);
        }
        this.closeModals();
    }

    handleSaleSubmit(e) {
        e.preventDefault();
        const productId = parseInt(document.getElementById('venta-producto-id').value);
        const quantity = parseInt(document.getElementById('venta-cantidad').value);
        if (this.makeSale(productId, quantity)) {
            alert('Venta realizada con éxito');
        } else {
            alert('No se pudo realizar la venta. Verifique la cantidad disponible.');
        }
        this.closeModals();
    }
}


// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    new InventoryManager();
});