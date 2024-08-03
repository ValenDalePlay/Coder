// Clase Producto
class Producto {
    constructor(id, nombre, precio, cantidad, categoria) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.cantidad = cantidad;
        this.categoria = categoria;
    }

    valorTotal() {
        return this.precio * this.cantidad;
    }
}

// Clase Inventario
class Inventario {
    constructor() {
        this.productos = JSON.parse(localStorage.getItem('productos')) || [];
        this.nextId = this.calcularNextId();
    }

    calcularNextId() {
        return this.productos.length > 0 ? Math.max(...this.productos.map(p => p.id)) + 1 : 1;
    }

    agregarProducto(nombre, precio, cantidad, categoria) {
        const producto = new Producto(this.nextId++, nombre, precio, cantidad, categoria);
        this.productos.push(producto);
        this.guardarEnLocalStorage();
        return producto;
    }

    obtenerProducto(id) {
        return this.productos.find(p => p.id === id);
    }

    actualizarProducto(id, nombre, precio, cantidad, categoria) {
        const producto = this.obtenerProducto(id);
        if (producto) {
            producto.nombre = nombre;
            producto.precio = precio;
            producto.cantidad = cantidad;
            producto.categoria = categoria;
            this.guardarEnLocalStorage();
            return true;
        }
        return false;
    }

    eliminarProducto(id) {
        const index = this.productos.findIndex(p => p.id === id);
        if (index !== -1) {
            this.productos.splice(index, 1);
            this.guardarEnLocalStorage();
            return true;
        }
        return false;
    }

    realizarVenta(id, cantidad) {
        const producto = this.obtenerProducto(id);
        if (producto && producto.cantidad >= cantidad) {
            producto.cantidad -= cantidad;
            this.guardarEnLocalStorage();
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

    productosConBajoStock(umbral = 5) {
        return this.productos.filter(p => p.cantidad <= umbral).length;
    }

    categoriasUnicas() {
        return new Set(this.productos.map(p => p.categoria)).size;
    }

    guardarEnLocalStorage() {
        localStorage.setItem('productos', JSON.stringify(this.productos));
    }
}

// Clase UI para manejar la interfaz de usuario
class UI {
    constructor(inventario) {
        this.inventario = inventario;
        this.ventasDelDia = parseFloat(localStorage.getItem('ventasDelDia')) || 0;

        // Elementos del DOM
        this.totalProductos = document.getElementById('total-productos');
        this.valorInventario = document.getElementById('valor-inventario');
        this.ventasDia = document.getElementById('ventas-dia');
        this.productosBajos = document.getElementById('productos-bajos');
        this.totalCategorias = document.getElementById('total-categorias');
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
        this.buscarProducto = document.getElementById('buscar-producto');
        this.filtrarCategoria = document.getElementById('filtrar-categoria');

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
        this.buscarProducto.addEventListener('input', () => this.filtrarProductos());
        this.filtrarCategoria.addEventListener('change', () => this.filtrarProductos());
    }

    actualizarUI() {
        this.totalProductos.textContent = this.inventario.cantidadTotalProductos();
        this.valorInventario.textContent = `$${this.inventario.valorTotalInventario().toFixed(2)}`;
        this.ventasDia.textContent = `$${this.ventasDelDia.toFixed(2)}`;
        this.productosBajos.textContent = this.inventario.productosConBajoStock();
        this.totalCategorias.textContent = this.inventario.categoriasUnicas();
        this.actualizarTablaInventario();
        localStorage.setItem('ventasDelDia', this.ventasDelDia);
    }

    actualizarTablaInventario() {
        this.tablaInventario.innerHTML = '';
        this.inventario.productos.forEach(producto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="py-2 px-4 border-b">${producto.id}</td>
                <td class="py-2 px-4 border-b">${producto.nombre}</td>
                <td class="py-2 px-4 border-b">${producto.categoria}</td>
                <td class="py-2 px-4 border-b">$${producto.precio.toFixed(2)}</td>
                <td class="py-2 px-4 border-b">${producto.cantidad}</td>
                <td class="py-2 px-4 border-b">$${producto.valorTotal().toFixed(2)}</td>
                <td class="py-2 px-4 border-b">
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2 editar-producto" data-id="${producto.id}">Editar</button>
                    <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded eliminar-producto" data-id="${producto.id}">Eliminar</button>
                </td>
            `;
            this.tablaInventario.appendChild(row);
        });

        this.actualizarEventListenersTabla();
    }

    actualizarEventListenersTabla() {
        document.querySelectorAll('.editar-producto').forEach(btn => {
            btn.addEventListener('click', (e) => this.editarProducto(parseInt(e.target.dataset.id)));
        });
        document.querySelectorAll('.eliminar-producto').forEach(btn => {
            btn.addEventListener('click', (e) => this.eliminarProducto(parseInt(e.target.dataset.id)));
        });
    }

    mostrarModalProducto(producto = null) {
        const modalTitulo = document.getElementById('modal-titulo');
        const productoId = document.getElementById('producto-id');
        const productoNombre = document.getElementById('producto-nombre');
        const productoCategoria = document.getElementById('producto-categoria');
        const productoPrecio = document.getElementById('producto-precio');
        const productoCantidad = document.getElementById('producto-cantidad');

        if (producto) {
            modalTitulo.textContent = 'Editar Producto';
            productoId.value = producto.id;
            productoNombre.value = producto.nombre;
            productoCategoria.value = producto.categoria;
            productoPrecio.value = producto.precio;
            productoCantidad.value = producto.cantidad;
        } else {
            modalTitulo.textContent = 'Agregar Producto';
            this.formProducto.reset();
            productoId.value = '';
        }

        this.modalProducto.classList.remove('hidden');
        this.modalProducto.classList.add('flex');
    }

    cerrarModalProducto() {
        this.modalProducto.classList.remove('flex');
        this.modalProducto.classList.add('hidden');
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

        this.modalVenta.classList.remove('hidden');
        this.modalVenta.classList.add('flex');
    }

    cerrarModalVenta() {
        this.modalVenta.classList.remove('flex');
        this.modalVenta.classList.add('hidden');
    }

    manejarSubmitProducto(e) {
        e.preventDefault();
        const id = document.getElementById('producto-id').value;
        const nombre = document.getElementById('producto-nombre').value;
        const categoria = document.getElementById('producto-categoria').value;
        const precio = parseFloat(document.getElementById('producto-precio').value);
        const cantidad = parseInt(document.getElementById('producto-cantidad').value);

        if (id) {
            this.inventario.actualizarProducto(parseInt(id), nombre, precio, cantidad, categoria);
        } else {
            this.inventario.agregarProducto(nombre, precio, cantidad, categoria);
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
            alert(`Venta realizada por $${ventaTotal.toFixed(2)}`);
        } else {
            alert('No se pudo realizar la venta. Verifique la cantidad disponible.');
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
                    alert(`Producto "${producto.nombre}" eliminado con éxito.`);
                } else {
                    alert('No se pudo eliminar el producto.');
                }
            }
        }
    }

    generarInforme() {
        if (!this.informeContenido) {
            console.error('El elemento con ID "informe-contenido" no se encuentra en el DOM');
            return;
        }

        const informe = `
            <h3 class="text-xl font-semibold mb-2">Resumen</h3>
            <p>Total de productos: ${this.inventario.cantidadTotalProductos()}</p>
            <p>Valor total del inventario: $${this.inventario.valorTotalInventario().toFixed(2)}</p>
            <p>Ventas del día: $${this.ventasDelDia.toFixed(2)}</p>
            <p>Productos con bajo stock: ${this.inventario.productosConBajoStock()}</p>
            <p>Categorías únicas: ${this.inventario.categoriasUnicas()}</p>

            <h3 class="text-xl font-semibold mt-4 mb-2">Detalles del inventario:</h3>
            <table class="w-full border-collapse border border-gray-300">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="border border-gray-300 p-2">ID</th>
                        <th class="border border-gray-300 p-2">Nombre</th>
                        <th class="border border-gray-300 p-2">Categoría</th>
                        <th class="border border-gray-300 p-2">Precio</th>
                        <th class="border border-gray-300 p-2">Cantidad</th>
                        <th class="border border-gray-300 p-2">Valor total</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.inventario.productos.map(p => `
                        <tr>
                            <td class="border border-gray-300 p-2">${p.id}</td>
                            <td class="border border-gray-300 p-2">${p.nombre}</td>
                            <td class="border border-gray-300 p-2">${p.categoria}</td>
                            <td class="border border-gray-300 p-2">$${p.precio.toFixed(2)}</td>
                            <td class="border border-gray-300 p-2">${p.cantidad}</td>
                            <td class="border border-gray-300 p-2">$${p.valorTotal().toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        this.informeContenido.innerHTML = informe;
        this.modalInforme.classList.remove('hidden');
        this.modalInforme.classList.add('flex');
    }

    cerrarModalInforme() {
        this.modalInforme.classList.remove('flex');
        this.modalInforme.classList.add('hidden');
    }

    filtrarProductos() {
        const terminoBusqueda = this.buscarProducto.value.toLowerCase();
        const categoriaSeleccionada = this.filtrarCategoria.value;

        const productosFiltrados = this.inventario.productos.filter(producto => {
            const coincideNombre = producto.nombre.toLowerCase().includes(terminoBusqueda);
            const coincideCategoria = categoriaSeleccionada === '' || producto.categoria === categoriaSeleccionada;
            return coincideNombre && coincideCategoria;
        });

        this.mostrarProductosFiltrados(productosFiltrados);
    }

    mostrarProductosFiltrados(productos) {
        this.tablaInventario.innerHTML = '';
        productos.forEach(producto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="py-2 px-4 border-b">${producto.id}</td>
                <td class="py-2 px-4 border-b">${producto.nombre}</td>
                <td class="py-2 px-4 border-b">${producto.categoria}</td>
                <td class="py-2 px-4 border-b">$${producto.precio.toFixed(2)}</td>
                <td class="py-2 px-4 border-b">${producto.cantidad}</td>
                <td class="py-2 px-4 border-b">$${producto.valorTotal().toFixed(2)}</td>
                <td class="py-2 px-4 border-b">
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2 editar-producto" data-id="${producto.id}">Editar</button>
                    <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded eliminar-producto" data-id="${producto.id}">Eliminar</button>
                </td>
            `;
            this.tablaInventario.appendChild(row);
        });

        this.actualizarEventListenersTabla();
    }

    exportarInventario() {
        const datos = this.inventario.productos.map(p => ({
            ID: p.id,
            Nombre: p.nombre,
            Categoria: p.categoria,
            Precio: p.precio,
            Cantidad: p.cantidad,
            "Valor Total": p.valorTotal()
        }));

        const csvContent = "data:text/csv;charset=utf-8," 
            + Object.keys(datos[0]).join(",") + "\n"
            + datos.map(row => Object.values(row).join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "inventario.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    importarInventario(archivo) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const contenido = e.target.result;
            const lineas = contenido.split('\n');
            const encabezados = lineas[0].split(',');
            
            for (let i = 1; i < lineas.length; i++) {
                const valores = lineas[i].split(',');
                if (valores.length === encabezados.length) {
                    const producto = {
                        nombre: valores[1],
                        categoria: valores[2],
                        precio: parseFloat(valores[3]),
                        cantidad: parseInt(valores[4])
                    };
                    this.inventario.agregarProducto(producto.nombre, producto.precio, producto.cantidad, producto.categoria);
                }
            }
            this.actualizarUI();
            alert('Inventario importado con éxito');
        };
        reader.readAsText(archivo);
    }

    mostrarGraficos() {
        const categoriasData = this.obtenerDatosPorCategoria();
        this.crearGraficoBarras(categoriasData);
        this.crearGraficoPastel(categoriasData);
    }

    obtenerDatosPorCategoria() {
        const categorias = {};
        this.inventario.productos.forEach(producto => {
            if (categorias[producto.categoria]) {
                categorias[producto.categoria] += producto.valorTotal();
            } else {
                categorias[producto.categoria] = producto.valorTotal();
            }
        });
        return categorias;
    }

    crearGraficoBarras(datos) {
        const ctx = document.getElementById('graficoBarras').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(datos),
                datasets: [{
                    label: 'Valor por Categoría',
                    data: Object.values(datos),
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    crearGraficoPastel(datos) {
        const ctx = document.getElementById('graficoPastel').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(datos),
                datasets: [{
                    data: Object.values(datos),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)'
                    ]
                }]
            }
        });
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

    // Configurar eventos adicionales
    document.getElementById('btn-exportar').addEventListener('click', () => ui.exportarInventario());
    document.getElementById('btn-importar').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = e => ui.importarInventario(e.target.files[0]);
        input.click();
    });
    document.getElementById('btn-graficos').addEventListener('click', () => ui.mostrarGraficos());
});