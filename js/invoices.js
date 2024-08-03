class InvoiceManager {
    constructor() {
        this.invoices = JSON.parse(localStorage.getItem('invoices')) || [];
        this.displayInvoices();
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
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    new InvoiceManager();
});