class ReportManager {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('products')) || [];
        this.invoices = JSON.parse(localStorage.getItem('invoices')) || [];
        this.reports = JSON.parse(localStorage.getItem('reports')) || [];
        this.setupEventListeners();
        this.displayReports();
        this.updateDashboard();
    }

    setupEventListeners() {
        document.getElementById('generate-report-btn')?.addEventListener('click', (e) => this.handleGenerateReport(e));
        document.getElementById('download-report-btn')?.addEventListener('click', () => this.downloadReport());
        document.getElementById('export-csv-btn')?.addEventListener('click', () => this.exportToCSV());
        document.getElementById('print-report-btn')?.addEventListener('click', () => this.printReport());
        document.getElementById('btn-cargar-mas')?.addEventListener('click', () => this.loadMoreReports());

        // Modal close button
        document.querySelector('.modal-close')?.addEventListener('click', () => this.closeModal());

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
    }

    updateDashboard() {
        document.getElementById('total-informes').textContent = this.reports.length;
        if (this.reports.length > 0) {
            const lastReport = this.reports[this.reports.length - 1];
            document.getElementById('ultimo-informe').textContent = new Date(lastReport.date).toLocaleDateString();
            
            const reportTypes = this.reports.map(report => report.type);
            const mostCommonType = this.getMostFrequent(reportTypes);
            document.getElementById('tipo-comun').textContent = mostCommonType || 'N/A';
        }
    }

    getMostFrequent(arr) {
        return arr.sort((a,b) =>
            arr.filter(v => v === a).length - arr.filter(v => v === b).length
        ).pop();
    }

    displayReports() {
        const tableBody = document.getElementById('tabla-informes');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        this.reports.slice(0, 10).forEach(report => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${report.id}</td>
                <td>${report.type}</td>
                <td>${new Date(report.date).toLocaleDateString()}</td>
                <td>
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2 view-btn" data-id="${report.id}">Ver</button>
                    <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded download-btn" data-id="${report.id}">Descargar</button>
                </td>
            `;
        });

        // Add event listeners to the new buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.viewReport(e.target.dataset.id));
        });
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.downloadSpecificReport(e.target.dataset.id));
        });
    }

    handleGenerateReport(e) {
        e.preventDefault();
        const type = document.getElementById('tipo-informe').value;
        const startDate = document.getElementById('fecha-inicio').value;
        const endDate = document.getElementById('fecha-fin').value;
        const format = document.getElementById('formato-informe').value;

        if (!type || !startDate || !endDate || !format) {
            alert('Por favor, complete todos los campos.');
            return;
        }

        const report = this.generateReport(type, startDate, endDate);
        this.displayReportContent(report);
        this.saveReport(report);
        this.updateDashboard();
        this.displayReports();
    }

    generateReport(type, startDate, endDate) {
        // Filtrar las facturas por fecha
        const filteredInvoices = this.invoices.filter(invoice => {
            const invoiceDate = new Date(invoice.date);
            return invoiceDate >= new Date(startDate) && invoiceDate <= new Date(endDate);
        });

        let reportContent = '';
        switch (type) {
            case 'ventas':
                reportContent = this.generateSalesReport(filteredInvoices);
                break;
            case 'inventario':
                reportContent = this.generateInventoryReport();
                break;
            case 'ingresos':
                reportContent = this.generateIncomeReport(filteredInvoices);
                break;
            case 'ganancias':
                reportContent = this.generateProfitReport(filteredInvoices);
                break;
            case 'productos':
                reportContent = this.generatePopularProductsReport(filteredInvoices);
                break;
            default:
                reportContent = 'Tipo de informe no válido';
        }

        return {
            id: Date.now(),
            type: type,
            date: new Date().toISOString(),
            content: reportContent,
            startDate: startDate,
            endDate: endDate
        };
    }

    generateSalesReport(invoices) {
        let totalSales = 0;
        const salesByProduct = {};

        invoices.forEach(invoice => {
            totalSales += invoice.totalPrice;
            salesByProduct[invoice.productName] = (salesByProduct[invoice.productName] || 0) + invoice.quantity;
        });

        return `
            <h2 class="text-2xl font-bold mb-4">Informe de Ventas</h2>
            <p><strong>Total de Ventas:</strong> $${totalSales.toFixed(2)}</p>
            <h3 class="text-xl font-semibold mt-4 mb-2">Ventas por Producto:</h3>
            <ul>
                ${Object.entries(salesByProduct).map(([product, quantity]) => 
                    `<li>${product}: ${quantity} unidades</li>`).join('')}
            </ul>
        `;
    }

    generateInventoryReport() {
        let totalValue = 0;
        let lowStockItems = 0;

        this.products.forEach(product => {
            totalValue += product.price * product.quantity;
            if (product.quantity < 10) lowStockItems++;
        });

        return `
            <h2 class="text-2xl font-bold mb-4">Informe de Inventario</h2>
            <p><strong>Total de Productos:</strong> ${this.products.length}</p>
            <p><strong>Valor Total del Inventario:</strong> $${totalValue.toFixed(2)}</p>
            <p><strong>Productos con Stock Bajo:</strong> ${lowStockItems}</p>
            <h3 class="text-xl font-semibold mt-4 mb-2">Detalle de Productos:</h3>
            <ul>
                ${this.products.map(product => 
                    `<li>${product.name}: ${product.quantity} unidades ($${product.price.toFixed(2)} c/u)</li>`).join('')}
            </ul>
        `;
    }

    generateIncomeReport(invoices) {
        const incomeByDate = {};
        let totalIncome = 0;

        invoices.forEach(invoice => {
            const date = new Date(invoice.date).toLocaleDateString();
            incomeByDate[date] = (incomeByDate[date] || 0) + invoice.totalPrice;
            totalIncome += invoice.totalPrice;
        });

        return `
            <h2 class="text-2xl font-bold mb-4">Informe de Ingresos</h2>
            <p><strong>Ingreso Total:</strong> $${totalIncome.toFixed(2)}</p>
            <h3 class="text-xl font-semibold mt-4 mb-2">Ingresos por Fecha:</h3>
            <ul>
                ${Object.entries(incomeByDate).map(([date, income]) => 
                    `<li>${date}: $${income.toFixed(2)}</li>`).join('')}
            </ul>
        `;
    }

    generateProfitReport(invoices) {
        let totalRevenue = 0;
        let totalCost = 0;

        invoices.forEach(invoice => {
            totalRevenue += invoice.totalPrice;
            const product = this.products.find(p => p.id === invoice.productId);
            if (product) {
                totalCost += product.price * invoice.quantity;
            }
        });

        const profit = totalRevenue - totalCost;

        return `
            <h2 class="text-2xl font-bold mb-4">Informe de Ganancias</h2>
            <p><strong>Ingresos Totales:</strong> $${totalRevenue.toFixed(2)}</p>
            <p><strong>Costos Totales:</strong> $${totalCost.toFixed(2)}</p>
            <p><strong>Ganancia:</strong> $${profit.toFixed(2)}</p>
            <p><strong>Margen de Ganancia:</strong> ${((profit / totalRevenue) * 100).toFixed(2)}%</p>
        `;
    }

    generatePopularProductsReport(invoices) {
        const productSales = {};
        invoices.forEach(invoice => {
            productSales[invoice.productName] = (productSales[invoice.productName] || 0) + invoice.quantity;
        });

        const sortedProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]);

        return `
            <h2 class="text-2xl font-bold mb-4">Informe de Productos Populares</h2>
            <ol>
                ${sortedProducts.map(([product, quantity], index) => 
                    `<li>${index + 1}. ${product}: ${quantity} unidades vendidas</li>`).join('')}
            </ol>
        `;
    }

    displayReportContent(report) {
        const reportContent = document.getElementById('report-content');
        if (reportContent) {
            reportContent.innerHTML = report.content;
        }
    }

    saveReport(report) {
        this.reports.push(report);
        localStorage.setItem('reports', JSON.stringify(this.reports));
    }

    downloadReport() {
        const reportContent = document.getElementById('report-content').innerText;
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'report.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    exportToCSV() {
        const reportContent = document.getElementById('report-content').innerText;
        const csv = this.convertToCSV(reportContent);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'report.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    convertToCSV(reportContent) {
        // This is a simple conversion. You might need to adjust this based on your report structure
        return reportContent.split('\n').map(line => line.replace(/:/g, ',').trim()).join('\n');
    }

    printReport() {
        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Reporte</title>');
        printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">');
        printWindow.document.write('</head><body>');
        printWindow.document.write(document.getElementById('report-content').innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }

    viewReport(id) {
        const report = this.reports.find(r => r.id === parseInt(id));
        if (report) {
            document.getElementById('modal-informe-titulo').textContent = `Informe de ${report.type}`;
            document.getElementById('modal-informe-contenido').innerHTML = report.content;
            this.openModal();
        }
    }

    downloadSpecificReport(id) {
        const report = this.reports.find(r => r.id === parseInt(id));
        if (report) {
            const blob = new Blob([report.content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report_${report.type}_${report.id}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    loadMoreReports() {
        // Implement pagination or load more functionality here
        console.log('Load more reports');
    }

    openModal() {
        document.getElementById('modal-informe').style.display = 'block';
    }

    closeModal() {
        document.getElementById('modal-informe').style.display = 'none';
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    new ReportManager();
});