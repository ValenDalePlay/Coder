// Clase Producto
class Producto {
    constructor(id, nombre, precio, cantidad) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.cantidad = cantidad;
    }

    valorTotal() {
        return this.precio * this.cantidad;
    }
}

// Clase Inventario
class Inventario {
    constructor() {
        this.productos = [];
        this.nextId = 1;
    }

    agregarProducto(nombre, precio, cantidad) {
        const producto = new Producto(this.nextId++, nombre, precio, cantidad);
        this.productos.push(producto);
        return producto;
    }

    obtenerProducto(id) {
        return this.productos.find(p => p.id === id);
    }

    actualizarProducto(id, nombre, precio, cantidad) {
        const producto = this.obtenerProducto(id);
        if (producto) {
            producto.nombre = nombre;
            producto.precio = precio;
            producto.cantidad = cantidad;
            return true;
        }
        return false;
    }

    eliminarProducto(id) {
        const index = this.productos.findIndex(p => p.id === id);
        if (index !== -1) {
            this.productos.splice(index, 1);
            return true;
        }
        return false;
    }

    realizarVenta(id, cantidad) {
        const producto = this.obtenerProducto(id);
        if (producto && producto.cantidad >= cantidad) {
            producto.cantidad -= cantidad;
            return producto.precio * cantidad;
        }
        return 0;
    }

    valorTotalInventario() {
        return this.productos.reduce((total, producto) => total + producto.valorTotal(), 0);
    }

    cantidadTotalProductos() {
        return this.productos.length;
    }
}

// Clase UI para manejar la interfaz de usuario
class UI {
    constructor(inventario) {
        this.inventario = inventario;
        this.ventasDelDia = 0;

        // Elementos del DOM
        this.totalProductos = document.getElementById('total-productos');
        this.valorInventario = document.getElementById('valor-inventario');
        this.ventasDia = document.getElementById('ventas-dia');
        this.tablaInventario = document.getElementById('tabla-inventario');
        this.btnAgregar = document.getElementById('btn-agregar');
        this.btnVender = document.getElementById('btn-vender');
        this.btnInforme = document.getElementById('btn-informe');
        this.modalProducto = document.getElementById('modal-producto');
        this.modalVenta = document.getElementById('modal-venta');
        this.modalInforme = document.getElementById('modal-informe');
        this.formProducto = document.getElementById('form-producto');
        this.formVenta = document.getElementById('form-venta');
        this.informeContenido = document.getElementById('informe-contenido');

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.btnAgregar.addEventListener('click', () => this.mostrarModalProducto());
        this.btnVender.addEventListener('click', () => this.mostrarModalVenta());
        this.btnInforme.addEventListener('click', () => this.generarInforme());
        this.formProducto.addEventListener('submit', (e) => this.manejarSubmitProducto(e));
        this.formVenta.addEventListener('submit', (e) => this.manejarSubmitVenta(e));
        document.getElementById('cerrar-modal-producto').addEventListener('click', () => this.cerrarModalProducto());
        document.getElementById('cerrar-modal-venta').addEventListener('click', () => this.cerrarModalVenta());
        document.getElementById('cerrar-modal-informe').addEventListener('click', () => this.cerrarModalInforme());
    }

    actualizarUI() {
        this.totalProductos.textContent = this.inventario.cantidadTotalProductos();
        this.valorInventario.textContent = `$${this.inventario.valorTotalInventario().toFixed(2)}`;
        this.ventasDia.textContent = `$${this.ventasDelDia.toFixed(2)}`;
        this.actualizarTablaInventario();
        console.log('UI actualizada');
    }

    actualizarTablaInventario() {
        this.tablaInventario.innerHTML = '';
        this.inventario.productos.forEach(producto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${producto.id}</td>
                <td>${producto.nombre}</td>
                <td>$${producto.precio.toFixed(2)}</td>
                <td>${producto.cantidad}</td>
                <td>$${producto.valorTotal().toFixed(2)}</td>
                <td>
                    <button class="editar-producto" data-id="${producto.id}">Editar</button>
                    <button class="eliminar-producto" data-id="${producto.id}">Eliminar</button>
                </td>
            `;
            this.tablaInventario.appendChild(row);
        });

        // Agregar event listeners para editar y eliminar
        document.querySelectorAll('.editar-producto').forEach(btn => {
            btn.addEventListener('click', (e) => this.editarProducto(parseInt(e.target.dataset.id)));
        });
        document.querySelectorAll('.eliminar-producto').forEach(btn => {
            btn.addEventListener('click', (e) => this.eliminarProducto(parseInt(e.target.dataset.id)));
        });
        console.log('Tabla de inventario actualizada');
    }

    mostrarModalProducto(producto = null) {
        const modalTitulo = document.getElementById('modal-titulo');
        const productoId = document.getElementById('producto-id');
        const productoNombre = document.getElementById('producto-nombre');
        const productoPrecio = document.getElementById('producto-precio');
        const productoCantidad = document.getElementById('producto-cantidad');

        if (producto) {
            modalTitulo.textContent = 'Editar Producto';
            productoId.value = producto.id;
            productoNombre.value = producto.nombre;
            productoPrecio.value = producto.precio;
            productoCantidad.value = producto.cantidad;
            console.log(`Mostrando modal para editar producto: ${producto.nombre}`);
        } else {
            modalTitulo.textContent = 'Agregar Producto';
            this.formProducto.reset();
            productoId.value = '';
            console.log('Mostrando modal para agregar nuevo producto');
        }

        this.modalProducto.style.display = 'block';
    }

    cerrarModalProducto() {
        this.modalProducto.style.display = 'none';
        console.log('Modal de producto cerrado');
    }

    mostrarModalVenta() {
        const selectProducto = document.getElementById('venta-producto');
        selectProducto.innerHTML = '';
        this.inventario.productos.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.id;
            option.textContent = `${producto.nombre} - $${producto.precio.toFixed(2)} (${producto.cantidad} disponibles)`;
            selectProducto.appendChild(option);
        });

        this.modalVenta.style.display = 'block';
        console.log('Modal de venta abierto');
    }

    cerrarModalVenta() {
        this.modalVenta.style.display = 'none';
        console.log('Modal de venta cerrado');
    }

    manejarSubmitProducto(e) {
        e.preventDefault();
        const id = document.getElementById('producto-id').value;
        const nombre = document.getElementById('producto-nombre').value;
        const precio = parseFloat(document.getElementById('producto-precio').value);
        const cantidad = parseInt(document.getElementById('producto-cantidad').value);

        if (id) {
            this.inventario.actualizarProducto(parseInt(id), nombre, precio, cantidad);
            console.log(`Producto actualizado - ID: ${id}, Nombre: ${nombre}, Precio: $${precio}, Cantidad: ${cantidad}`);
        } else {
            const nuevoProducto = this.inventario.agregarProducto(nombre, precio, cantidad);
            console.log(`Nuevo producto agregado - ID: ${nuevoProducto.id}, Nombre: ${nombre}, Precio: $${precio}, Cantidad: ${cantidad}`);
        }

        this.actualizarUI();
        this.cerrarModalProducto();
    }

    manejarSubmitVenta(e) {
        e.preventDefault();
        const productoId = parseInt(document.getElementById('venta-producto').value);
        const cantidad = parseInt(document.getElementById('venta-cantidad').value);

        const ventaTotal = this.inventario.realizarVenta(productoId, cantidad);
        if (ventaTotal > 0) {
            this.ventasDelDia += ventaTotal;
            this.actualizarUI();
            const mensaje = `Venta realizada por $${ventaTotal.toFixed(2)}`;
            alert(mensaje);
            console.log(mensaje);
        } else {
            const mensaje = 'No se pudo realizar la venta. Verifique la cantidad disponible.';
            alert(mensaje);
            console.error(mensaje);
        }

        this.cerrarModalVenta();
    }

    editarProducto(id) {
        const producto = this.inventario.obtenerProducto(id);
        if (producto) {
            this.mostrarModalProducto(producto);
        }
    }

    eliminarProducto(id) {
        const producto = this.inventario.obtenerProducto(id);
        if (producto) {
            const confirmacion = confirm(`¿Está seguro de que desea eliminar el producto "${producto.nombre}"?`);
            if (confirmacion) {
                if (this.inventario.eliminarProducto(id)) {
                    this.actualizarUI();
                    const mensaje = `Producto "${producto.nombre}" eliminado con éxito.`;
                    alert(mensaje);
                    console.log(mensaje);
                } else {
                    const mensaje = 'No se pudo eliminar el producto.';
                    alert(mensaje);
                    console.error(mensaje);
                }
            } else {
                console.log(`Eliminación del producto "${producto.nombre}" cancelada por el usuario.`);
            }
        }
    }

    generarInforme() {
        const informe = `
            <h3>Resumen</h3>
            <p>Total de productos: ${this.inventario.cantidadTotalProductos()}</p>
            <p>Valor total del inventario: $${this.inventario.valorTotalInventario().toFixed(2)}</p>
            <p>Ventas del día: $${this.ventasDelDia.toFixed(2)}</p>

            <h3>Detalles del inventario:</h3>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                        <th>Valor total</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.inventario.productos.map(p => `
                        <tr>
                            <td>${p.id}</td>
                            <td>${p.nombre}</td>
                            <td>$${p.precio.toFixed(2)}</td>
                            <td>${p.cantidad}</td>
                            <td>$${p.valorTotal().toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        // Mostrar en la interfaz
        this.informeContenido.innerHTML = informe;
        this.modalInforme.style.display = 'block';

        // Mostrar en la consola
        console.log('--- Informe de Inventario ---');
        console.log(`Total de productos: ${this.inventario.cantidadTotalProductos()}`);
        console.log(`Valor total del inventario: $${this.inventario.valorTotalInventario().toFixed(2)}`);
        console.log(`Ventas del día: $${this.ventasDelDia.toFixed(2)}`);
        console.log('Detalles del inventario:');
        this.inventario.productos.forEach(p => {
            console.log(`ID: ${p.id}, Nombre: ${p.nombre}, Precio: $${p.precio.toFixed(2)}, Cantidad: ${p.cantidad}, Valor total: $${p.valorTotal().toFixed(2)}`);
        });
    }

    cerrarModalInforme() {
        this.modalInforme.style.display = 'none';
        console.log('Modal de informe cerrado');
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    const inventario = new Inventario();
    const ui = new UI(inventario);

    // Función para verificar la edad
    function verificarEdad() {
        const edad = prompt("Por favor, ingresa tu edad:");
        if (edad === null || edad === "") {
            alert("Debes ingresar tu edad para continuar.");
            verificarEdad();
        } else if (isNaN(edad) || parseInt(edad) < 18) {
            alert("Debes ser mayor de 18 años para acceder a este sistema.");
            window.location.href = "https://www.google.com";
        } else {
            console.log("Verificación de edad exitosa. Bienvenido al sistema de gestión de inventario.");
        }
    }

    // Función para solicitar consentimiento de cookies
    function solicitarConsentimientoCookies() {
        const consentimiento = confirm("Este sitio utiliza cookies para mejorar tu experiencia. ¿Aceptas el uso de cookies?");
        if (consentimiento) {
            console.log("Consentimiento de cookies aceptado.");
            alert("Gracias por aceptar las cookies. Tu experiencia en el sitio será óptima.");
        } else {
            console.log("Consentimiento de cookies rechazado. Algunas funciones pueden estar limitadas.");
            alert("Has rechazado el uso de cookies. Algunas funciones del sitio pueden estar limitadas.");
        }
    }

    // Ejecutar verificaciones
    verificarEdad();
    solicitarConsentimientoCookies();

    // Actualizar la UI inicial
    ui.actualizarUI();
});