class InvoiceManager {
    constructor() {
        this.invoices = JSON.parse(localStorage.getItem('invoices')) || [];
        this.displayInvoices();
        this.setupEventListeners();
    }

    displayInvoices() {
        const tableBody = document.getElementById('tabla-facturas');
        tableBody.innerHTML = '';
        this.invoices.forEach(invoice => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${invoice.id}</td>
                <td>${invoice.productName}</td>
                <td>${invoice.quantity}</td>
                <td>$${invoice.totalPrice.toFixed(2)}</td>
                <td>${new Date(invoice.date).toLocaleString()}</td>
                <td>
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2 view-btn" data-id="${invoice.id}">Ver</button>
                    <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded download-btn" data-id="${invoice.id}">Descargar</button>
                </td>
            `;
        });
        this.attachEventListeners();
    }

    setupEventListeners() {
        document.getElementById('search-invoice').addEventListener('input', (e) => this.searchInvoices(e.target.value));
        document.getElementById('filter-date').addEventListener('change', (e) => this.filterInvoicesByDate(e.target.value));
    }

    attachEventListeners() {
        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', (e) => this.viewInvoice(e.target.dataset.id));
        });
        document.querySelectorAll('.download-btn').forEach(button => {
            button.addEventListener('click', (e) => this.downloadInvoice(e.target.dataset.id));
        });
    }

    viewInvoice(id) {
        const invoice = this.invoices.find(inv => inv.id === parseInt(id));
        if (invoice) {
            const modalContent = document.getElementById('modal-factura-contenido');
            modalContent.innerHTML = `
                <h2 class="text-2xl font-bold mb-4">Factura #${invoice.id}</h2>
                <p><strong>Producto:</strong> ${invoice.productName}</p>
                <p><strong>Cantidad:</strong> ${invoice.quantity}</p>
                <p><strong>Precio Total:</strong> $${invoice.totalPrice.toFixed(2)}</p>
                <p><strong>Fecha:</strong> ${new Date(invoice.date).toLocaleString()}</p>
            `;
            document.getElementById('modal-factura').classList.remove('hidden');
        }
    }

    downloadInvoice(id) {
        const invoice = this.invoices.find(inv => inv.id === parseInt(id));
        if (invoice) {
            const invoiceText = `
Factura #${invoice.id}
Producto: ${invoice.productName}
Cantidad: ${invoice.quantity}
Precio Total: $${invoice.totalPrice.toFixed(2)}
Fecha: ${new Date(invoice.date).toLocaleString()}
            `;

            const blob = new Blob([invoiceText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `factura-${invoice.id}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    searchInvoices(searchTerm) {
        const filteredInvoices = this.invoices.filter(invoice => 
            invoice.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.id.toString().includes(searchTerm)
        );
        this.displayFilteredInvoices(filteredInvoices);
    }

    filterInvoicesByDate(date) {
        const filteredInvoices = this.invoices.filter(invoice => 
            new Date(invoice.date).toDateString() === new Date(date).toDateString()
        );
        this.displayFilteredInvoices(filteredInvoices);
    }

    displayFilteredInvoices(filteredInvoices) {
        const tableBody = document.getElementById('tabla-facturas');
        tableBody.innerHTML = '';
        filteredInvoices.forEach(invoice => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${invoice.id}</td>
                <td>${invoice.productName}</td>
                <td>${invoice.quantity}</td>
                <td>$${invoice.totalPrice.toFixed(2)}</td>
                <td>${new Date(invoice.date).toLocaleString()}</td>
                <td>
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2 view-btn" data-id="${invoice.id}">Ver</button>
                    <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded download-btn" data-id="${invoice.id}">Descargar</button>
                </td>
            `;
        });
        this.attachEventListeners();
    }

    getTotalSales() {
        return this.invoices.reduce((total, invoice) => total + invoice.totalPrice, 0);
    }

    getMostSoldProduct() {
        const productSales = {};
        this.invoices.forEach(invoice => {
            if (productSales[invoice.productName]) {
                productSales[invoice.productName] += invoice.quantity;
            } else {
                productSales[invoice.productName] = invoice.quantity;
            }
        });
        return Object.entries(productSales).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }

    updateDashboard() {
        document.getElementById('total-ventas').textContent = `$${this.getTotalSales().toFixed(2)}`;
        document.getElementById('producto-mas-vendido').textContent = this.getMostSoldProduct();
        document.getElementById('total-facturas').textContent = this.invoices.length;
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    const invoiceManager = new InvoiceManager();
    invoiceManager.updateDashboard();

    // Event listener para cerrar el modal de factura
    document.getElementById('cerrar-modal-factura').addEventListener('click', () => {
        document.getElementById('modal-factura').classList.add('hidden');
    });

    // Event listener para exportar todas las facturas
    document.getElementById('exportar-facturas').addEventListener('click', () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "ID,Producto,Cantidad,Precio Total,Fecha\n"
            + invoiceManager.invoices.map(invoice => 
                `${invoice.id},${invoice.productName},${invoice.quantity},${invoice.totalPrice},${invoice.date}`
            ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "facturas.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});