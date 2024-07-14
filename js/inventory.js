// Asumimos que las clases Producto e Inventario están definidas en app.js
// y están disponibles globalmente

class InventoryUI {
    constructor() {
        this.inventario = new Inventario();
        this.setupEventListeners();
        this.cargarInventario();
    }

    setupEventListeners() {
        document.getElementById('btn-add-product').addEventListener('click', () => this.mostrarModalProducto());
        document.getElementById('search-product').addEventListener('input', () => this.buscarProductos());
        document.getElementById('filter-category').addEventListener('change', () => this.filtrarProductos());
        document.getElementById('form-product').addEventListener('submit', (e) => this.manejarSubmitProducto(e));
        document.getElementById('close-modal-product').addEventListener('click', () => this.cerrarModalProducto());
    }

    cargarInventario() {
        // Aquí normalmente cargarías los datos del servidor
        // Por ahora, añadiremos algunos productos de ejemplo
        this.inventario.agregarProducto('Laptop', 999.99, 10);
        this.inventario.agregarProducto('Smartphone', 499.99, 20);
        this.inventario.agregarProducto('Tablet', 299.99, 15);
        this.actualizarTablaInventario();
    }

    actualizarTablaInventario() {
        const tabla = document.getElementById('inventory-list').getElementsByTagName('tbody')[0];
        tabla.innerHTML = '';
        this.inventario.productos.forEach(producto => {
            const row = tabla.insertRow();
            row.innerHTML = `
                <td>${producto.id}</td>
                <td>${producto.nombre}</td>
                <td>Electrónicos</td>
                <td>$${producto.precio.toFixed(2)}</td>
                <td>${producto.cantidad}</td>
                <td>$${producto.valorTotal().toFixed(2)}</td>
                <td>
                    <button class="btn btn-primary btn-sm editar-producto" data-id="${producto.id}">Editar</button>
                    <button class="btn btn-danger btn-sm eliminar-producto" data-id="${producto.id}">Eliminar</button>
                </td>
            `;
        });

        // Agregar event listeners para editar y eliminar
        document.querySelectorAll('.editar-producto').forEach(btn => {
            btn.addEventListener('click', (e) => this.editarProducto(parseInt(e.target.dataset.id)));
        });
        document.querySelectorAll('.eliminar-producto').forEach(btn => {
            btn.addEventListener('click', (e) => this.eliminarProducto(parseInt(e.target.dataset.id)));
        });
    }

    mostrarModalProducto(producto = null) {
        const modalTitle = document.getElementById('modal-title');
        const productId = document.getElementById('product-id');
        const productName = document.getElementById('product-name');
        const productPrice = document.getElementById('product-price');
        const productQuantity = document.getElementById('product-quantity');

        if (producto) {
            modalTitle.textContent = 'Editar Producto';
            productId.value = producto.id;
            productName.value = producto.nombre;
            productPrice.value = producto.precio;
            productQuantity.value = producto.cantidad;
        } else {
            modalTitle.textContent = 'Agregar Producto';
            document.getElementById('form-product').reset();
            productId.value = '';
        }

        document.getElementById('modal-product').classList.remove('hidden');
    }

    cerrarModalProducto() {
        document.getElementById('modal-product').classList.add('hidden');
    }

    manejarSubmitProducto(e) {
        e.preventDefault();
        const id = document.getElementById('product-id').value;
        const nombre = document.getElementById('product-name').value;
        const precio = parseFloat(document.getElementById('product-price').value);
        const cantidad = parseInt(document.getElementById('product-quantity').value);

        if (id) {
            this.inventario.actualizarProducto(parseInt(id), nombre, precio, cantidad);
        } else {
            this.inventario.agregarProducto(nombre, precio, cantidad);
        }

        this.actualizarTablaInventario();
        this.cerrarModalProducto();
    }

    editarProducto(id) {
        const producto = this.inventario.obtenerProducto(id);
        if (producto) {
            this.mostrarModalProducto(producto);
        }
    }

    eliminarProducto(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            if (this.inventario.eliminarProducto(id)) {
                this.actualizarTablaInventario();
            } else {
                alert('No se pudo eliminar el producto');
            }
        }
    }

    buscarProductos() {
        const searchTerm = document.getElementById('search-product').value.toLowerCase();
        const filteredProducts = this.inventario.productos.filter(producto =>
            producto.nombre.toLowerCase().includes(searchTerm)
        );
        this.mostrarProductosFiltrados(filteredProducts);
    }

    filtrarProductos() {
        const category = document.getElementById('filter-category').value;
        // Por ahora, como no tenemos categorías implementadas, esto no hará nada
        // En una implementación real, filtrarías los productos por categoría aquí
        this.actualizarTablaInventario();
    }

    mostrarProductosFiltrados(productos) {
        const tabla = document.getElementById('inventory-list').getElementsByTagName('tbody')[0];
        tabla.innerHTML = '';
        productos.forEach(producto => {
            const row = tabla.insertRow();
            row.innerHTML = `
                <td>${producto.id}</td>
                <td>${producto.nombre}</td>
                <td>Electrónicos</td>
                <td>$${producto.precio.toFixed(2)}</td>
                <td>${producto.cantidad}</td>
                <td>$${producto.valorTotal().toFixed(2)}</td>
                <td>
                    <button class="btn btn-primary btn-sm editar-producto" data-id="${producto.id}">Editar</button>
                    <button class="btn btn-danger btn-sm eliminar-producto" data-id="${producto.id}">Eliminar</button>
                </td>
            `;
        });
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    new InventoryUI();
});