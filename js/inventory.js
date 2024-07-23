function initInventory() {
    console.log('Inicializando funcionalidades de inventario');
    loadInventoryItems();
    setupInventoryEventListeners();
}

function loadInventoryItems() {
    // Simulación de carga de items del inventario
    const inventoryList = document.getElementById('inventory-list');
    if (inventoryList) {
        inventoryList.innerHTML = `
            <tr>
                <td>1</td>
                <td>Producto Ejemplo</td>
                <td>Electrónica</td>
                <td>$99.99</td>
                <td>50</td>
                <td>$4999.50</td>
                <td>
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2">Editar</button>
                    <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">Eliminar</button>
                </td>
            </tr>
        `;
    }
}

function setupInventoryEventListeners() {
    const addProductBtn = document.getElementById('btn-add-product');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            console.log('Añadir producto clickeado');
            // Aquí iría la lógica para abrir un modal o formulario de añadir producto
        });
    }
}

window.initInventory = initInventory;