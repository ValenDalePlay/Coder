class ReportManager {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('products')) || [];
        this.invoices = JSON.parse(localStorage.getItem('invoices')) || [];
        this.displayReports();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('generate-report-btn').addEventListener('click', () => this.generateReport());
        document.getElementById('download-report-btn').addEventListener('click', () => this.downloadReport());
    }

    generateInventoryReport() {
        let totalValue = 0;
        let lowStockItems = 0;
        const categoryCounts = {};

        this.products.forEach(product => {
            totalValue += product.price * product.quantity;
            if (product.quantity < 10) lowStockItems++;
            categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
        });

        return {
            totalProducts: this.products.length,
            totalValue: totalValue.toFixed(2),
            lowStockItems,
            categoryCounts
        };
    }

    generateSalesReport() {
        let totalSales = 0;
        let totalItems = 0;
        const salesByProduct = {};
        const salesByDate = {};

        this.invoices.forEach(invoice => {
            totalSales += invoice.totalPrice;
            totalItems += invoice.quantity;
            salesByProduct[invoice.productName] = (salesByProduct[invoice.productName] || 0) + invoice.quantity;
            
            const date = new Date(invoice.date).toLocaleDateString();
            salesByDate[date] = (salesByDate[date] || 0) + invoice.totalPrice;
        });

        return {
            totalSales: totalSales.toFixed(2),
            totalItems,
            salesByProduct,
            salesByDate
        };
    }

    generateFinancialSummary() {
        const inventoryReport = this.generateInventoryReport();
        const salesReport = this.generateSalesReport();

        return {
            totalInventoryValue: inventoryReport.totalValue,
            totalSales: salesReport.totalSales,
            estimatedProfit: (salesReport.totalSales - inventoryReport.totalValue).toFixed(2)
        };
    }

    displayReports() {
        const inventoryReport = this.generateInventoryReport();
        const salesReport = this.generateSalesReport();
        const financialSummary = this.generateFinancialSummary();

        this.displayInventorySummary(inventoryReport);
        this.displaySalesSummary(salesReport);
        this.displayFinancialSummary(financialSummary);
        this.createCharts(inventoryReport, salesReport);
    }

    displayInventorySummary(report) {
        document.getElementById('inventory-summary').innerHTML = `
            <h3 class="text-xl font-semibold mb-2">Resumen de Inventario</h3>
            <p>Total de Productos: ${report.totalProducts}</p>
            <p>Valor Total del Inventario: $${report.totalValue}</p>
            <p>Productos con Stock Bajo: ${report.lowStockItems}</p>
            <h4 class="text-lg font-semibold mt-2 mb-1">Productos por Categoría:</h4>
            <ul>
                ${Object.entries(report.categoryCounts).map(([category, count]) => 
                    `<li>${category}: ${count}</li>`).join('')}
            </ul>
        `;
    }

    displaySalesSummary(report) {
        document.getElementById('sales-summary').innerHTML = `
            <h3 class="text-xl font-semibold mb-2">Resumen de Ventas</h3>
            <p>Total de Ventas: $${report.totalSales}</p>
            <p>Total de Artículos Vendidos: ${report.totalItems}</p>
            <h4 class="text-lg font-semibold mt-2 mb-1">Ventas por Producto:</h4>
            <ul>
                ${Object.entries(report.salesByProduct).map(([product, quantity]) => 
                    `<li>${product}: ${quantity}</li>`).join('')}
            </ul>
        `;
    }

    displayFinancialSummary(summary) {
        document.getElementById('financial-summary').innerHTML = `
            <h3 class="text-xl font-semibold mb-2">Resumen Financiero</h3>
            <p>Valor Total del Inventario: $${summary.totalInventoryValue}</p>
            <p>Total de Ventas: $${summary.totalSales}</p>
            <p>Beneficio Estimado: $${summary.estimatedProfit}</p>
        `;
    }

    createCharts(inventoryReport, salesReport) {
        this.createInventoryChart(inventoryReport);
        this.createSalesChart(salesReport);
    }

    createInventoryChart(report) {
        const ctx = document.getElementById('inventory-chart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(report.categoryCounts),
                datasets: [{
                    data: Object.values(report.categoryCounts),
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
                title: {
                    display: true,
                    text: 'Distribución de Productos por Categoría'
                }
            }
        });
    }

    createSalesChart(report) {
        const ctx = document.getElementById('sales-chart').getContext('2d');
        const dates = Object.keys(report.salesByDate).sort((a, b) => new Date(a) - new Date(b));
        const sales = dates.map(date => report.salesByDate[date]);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Ventas Diarias',
                    data: sales,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Ventas ($)'
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Tendencia de Ventas'
                }
            }
        });
    }

    generateReport() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const reportType = document.getElementById('report-type').value;

        // Filtrar datos basados en el rango de fechas
        const filteredInvoices = this.invoices.filter(invoice => {
            const invoiceDate = new Date(invoice.date);
            return invoiceDate >= new Date(startDate) && invoiceDate <= new Date(endDate);
        });

        // Generar reporte basado en el tipo seleccionado
        let reportContent = '';
        switch (reportType) {
            case 'sales':
                reportContent = this.generateDetailedSalesReport(filteredInvoices);
                break;
            case 'inventory':
                reportContent = this.generateDetailedInventoryReport();
                break;
            case 'financial':
                reportContent = this.generateDetailedFinancialReport(filteredInvoices);
                break;
        }

        document.getElementById('report-content').innerHTML = reportContent;
    }

    generateDetailedSalesReport(invoices) {
        let totalSales = 0;
        let salesByProduct = {};

        invoices.forEach(invoice => {
            totalSales += invoice.totalPrice;
            salesByProduct[invoice.productName] = (salesByProduct[invoice.productName] || 0) + invoice.quantity;
        });

        return `
            <h2 class="text-2xl font-bold mb-4">Reporte Detallado de Ventas</h2>
            <p><strong>Total de Ventas:</strong> $${totalSales.toFixed(2)}</p>
            <h3 class="text-xl font-semibold mt-4 mb-2">Ventas por Producto:</h3>
            <ul>
                ${Object.entries(salesByProduct).map(([product, quantity]) => 
                    `<li>${product}: ${quantity} unidades</li>`).join('')}
            </ul>
            <h3 class="text-xl font-semibold mt-4 mb-2">Detalle de Ventas:</h3>
            <table class="min-w-full bg-white">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="py-2 px-4 border-b">Fecha</th>
                        <th class="py-2 px-4 border-b">Producto</th>
                        <th class="py-2 px-4 border-b">Cantidad</th>
                        <th class="py-2 px-4 border-b">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoices.map(invoice => `
                        <tr>
                            <td class="py-2 px-4 border-b">${new Date(invoice.date).toLocaleDateString()}</td>
                            <td class="py-2 px-4 border-b">${invoice.productName}</td>
                            <td class="py-2 px-4 border-b">${invoice.quantity}</td>
                            <td class="py-2 px-4 border-b">$${invoice.totalPrice.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    generateDetailedInventoryReport() {
        return `
            <h2 class="text-2xl font-bold mb-4">Reporte Detallado de Inventario</h2>
            <p><strong>Total de Productos:</strong> ${this.products.length}</p>
            <table class="min-w-full bg-white">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="py-2 px-4 border-b">ID</th>
                        <th class="py-2 px-4 border-b">Nombre</th>
                        <th class="py-2 px-4 border-b">Categoría</th>
                        <th class="py-2 px-4 border-b">Precio</th>
                        <th class="py-2 px-4 border-b">Cantidad</th>
                        <th class="py-2 px-4 border-b">Valor Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.products.map(product => `
                        <tr>
                            <td class="py-2 px-4 border-b">${product.id}</td>
                            <td class="py-2 px-4 border-b">${product.name}</td>
                            <td class="py-2 px-4 border-b">${product.category}</td>
                            <td class="py-2 px-4 border-b">$${product.price.toFixed(2)}</td>
                            <td class="py-2 px-4 border-b">${product.quantity}</td>
                            <td class="py-2 px-4 border-b">$${(product.price * product.quantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    generateDetailedFinancialReport(invoices) {
        const totalSales = invoices.reduce((sum, invoice) => sum + invoice.totalPrice, 0);
        const totalInventoryValue = this.products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
        const estimatedProfit = totalSales - totalInventoryValue;

        return `
            <h2 class="text-2xl font-bold mb-4">Reporte Financiero Detallado</h2>
            <p><strong>Total de Ventas:</strong> $${totalSales.toFixed(2)}</p>
            <p><strong>Valor del Inventario:</strong> $${totalInventoryValue.toFixed(2)}</p>
            <p><strong>Beneficio Estimado:</strong> $${estimatedProfit.toFixed(2)}</p>
            <h3 class="text-xl font-semibold mt-4 mb-2">Desglose de Ventas:</h3>
            <table class="min-w-full bg-white">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="py-2 px-4 border-b">Fecha</th>
                        <th class="py-2 px-4 border-b">Producto</th>
                        <th class="py-2 px-4 border-b">Cantidad</th>
                        <th class="py-2 px-4 border-b">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoices.map(invoice => `
                        <tr>
                            <td class="py-2 px-4 border-b">${new Date(invoice.date).toLocaleDateString()}</td>
                            <td class="py-2 px-4 border-b">${invoice.productName}</td>
                            <td class="py-2 px-4 border-b">${invoice.quantity}</td>
                            <td class="py-2 px-4 border-b">$${invoice.totalPrice.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    downloadReport() {
        const reportContent = document.getElementById('report-content').innerText;
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    const reportManager = new ReportManager();
});