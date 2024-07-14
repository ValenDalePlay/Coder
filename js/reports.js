class ReportsUI {
    constructor() {
        this.inventario = new Inventario();
        this.cargarDatosDePrueba();
        this.inicializarGraficos();
        this.actualizarEstadisticas();
    }

    cargarDatosDePrueba() {
        // Simulamos algunos productos y ventas
        this.inventario.agregarProducto('Laptop', 999.99, 10);
        this.inventario.agregarProducto('Smartphone', 499.99, 20);
        this.inventario.agregarProducto('Tablet', 299.99, 15);
        this.inventario.agregarProducto('Smartwatch', 199.99, 25);
        this.inventario.agregarProducto('Auriculares', 89.99, 30);

        // Simulamos ventas de los últimos 7 días
        this.ventasDiarias = [
            { fecha: '2024-07-08', total: 1299.97 },
            { fecha: '2024-07-09', total: 2199.95 },
            { fecha: '2024-07-10', total: 1599.96 },
            { fecha: '2024-07-11', total: 2799.94 },
            { fecha: '2024-07-12', total: 1899.96 },
            { fecha: '2024-07-13', total: 2399.95 },
            { fecha: '2024-07-14', total: 2999.93 },
        ];
    }

    inicializarGraficos() {
        this.crearGraficoVentasDiarias();
        this.crearGraficoProductosMasVendidos();
        this.crearGraficoDistribucionInventario();
        this.crearGraficoTendenciaVentas();
    }

    crearGraficoVentasDiarias() {
        const ctx = document.getElementById('dailySalesChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.ventasDiarias.map(venta => venta.fecha),
                datasets: [{
                    label: 'Ventas Diarias',
                    data: this.ventasDiarias.map(venta => venta.total),
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Ventas ($)'
                        }
                    }
                }
            }
        });
    }

    crearGraficoProductosMasVendidos() {
        // Simulamos datos de productos más vendidos
        const productosMasVendidos = [
            { nombre: 'Smartphone', cantidad: 50 },
            { nombre: 'Laptop', cantidad: 30 },
            { nombre: 'Tablet', cantidad: 25 },
            { nombre: 'Smartwatch', cantidad: 20 },
            { nombre: 'Auriculares', cantidad: 15 }
        ];

        const ctx = document.getElementById('topProductsChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: productosMasVendidos.map(p => p.nombre),
                datasets: [{
                    data: productosMasVendidos.map(p => p.cantidad),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Productos Más Vendidos'
                    }
                }
            }
        });
    }

    crearGraficoDistribucionInventario() {
        const ctx = document.getElementById('inventoryDistributionChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: this.inventario.productos.map(p => p.nombre),
                datasets: [{
                    data: this.inventario.productos.map(p => p.valorTotal()),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Distribución del Valor del Inventario'
                    }
                }
            }
        });
    }

    crearGraficoTendenciaVentas() {
        // Simulamos datos de tendencia de ventas para 30 días
        const fechas = Array.from({length: 30}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - 29 + i);
            return d.toISOString().split('T')[0];
        });
        const ventas = Array.from({length: 30}, () => Math.floor(Math.random() * 3000) + 1000);

        const ctx = document.getElementById('salesTrendChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: fechas,
                datasets: [{
                    label: 'Ventas',
                    data: ventas,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Ventas ($)'
                        }
                    }
                }
            }
        });
    }

    actualizarEstadisticas() {
        document.getElementById('totalMonthlySales').textContent = `$${this.calcularVentasMensuales().toFixed(2)}`;
        document.getElementById('totalProductsInStock').textContent = this.inventario.cantidadTotalProductos();
        document.getElementById('totalInventoryValue').textContent = `$${this.inventario.valorTotalInventario().toFixed(2)}`;
    }

    calcularVentasMensuales() {
        // Simulamos ventas mensuales sumando las ventas diarias
        return this.ventasDiarias.reduce((total, venta) => total + venta.total, 0);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    new ReportsUI();
});