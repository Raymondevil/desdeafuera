// Estado del inventario
let productos = [];
let inventarioActual = {};
let fechaSeleccionada = new Date().toISOString().split('T')[0];

// Inicializar
window.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('fechaInventario').value = fechaSeleccionada;
    document.getElementById('fechaInventario').addEventListener('change', (e) => {
        fechaSeleccionada = e.target.value;
        cargarInventarioDia();
    });
    
    await cargarProductos();
    await cargarInventarioDia();
});

// Mostrar/ocultar loading
function showLoading(show = true) {
    document.getElementById('loadingOverlay').classList.toggle('hidden', !show);
}

// Cargar productos
async function cargarProductos() {
    try {
        showLoading();
        const response = await fetch('/api/inventario/productos');
        if (!response.ok) throw new Error('Error al cargar productos');
        
        productos = await response.json();
        renderizarTabla();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los productos. Por favor recarga la página.');
    } finally {
        showLoading(false);
    }
}

// Cargar inventario del día
async function cargarInventarioDia() {
    try {
        showLoading();
        const response = await fetch(`/api/inventario/dia/${fechaSeleccionada}`);
        
        if (response.ok) {
            const data = await response.json();
            inventarioActual = {};
            data.forEach(item => {
                inventarioActual[item.producto_id] = {
                    inicial: item.cantidad_inicial,
                    final: item.cantidad_final
                };
            });
        } else {
            inventarioActual = {};
        }
        
        renderizarTabla();
        calcularTotal();
    } catch (error) {
        console.error('Error:', error);
    } finally {
        showLoading(false);
    }
}

// Renderizar tabla
function renderizarTabla() {
    const tbody = document.getElementById('tablaInventario');
    tbody.innerHTML = '';
    
    productos.forEach(producto => {
        const inv = inventarioActual[producto.id] || { inicial: producto.cantidad_inicial, final: producto.cantidad_inicial };
        const diferencia = inv.inicial - inv.final;
        const venta = diferencia * producto.precio_unitario;
        
        const tr = document.createElement('tr');
        tr.className = 'border-b hover:bg-gray-50';
        tr.innerHTML = `
            <td class="p-3 font-bold text-black">${producto.nombre}</td>
            <td class="p-3 text-center text-gray-700">${producto.unidad}</td>
            <td class="p-3 text-center font-bold" style="color: #FF0000;">$${producto.precio_unitario}</td>
            <td class="p-3 text-center">
                <input 
                    type="number" 
                    value="${inv.inicial}" 
                    min="0"
                    class="w-20 p-1 text-center border-2 rounded font-bold" 
                    style="border-color: #FF0000;"
                    onchange="actualizarCantidad(${producto.id}, 'inicial', this.value)"
                >
            </td>
            <td class="p-3 text-center">
                <input 
                    type="number" 
                    value="${inv.final}" 
                    min="0"
                    class="w-20 p-1 text-center border-2 rounded font-bold" 
                    style="border-color: #FF0000;"
                    onchange="actualizarCantidad(${producto.id}, 'final', this.value)"
                >
            </td>
            <td class="p-3 text-center font-bold ${diferencia > 0 ? 'text-green-600' : 'text-gray-500'}">${diferencia}</td>
            <td class="p-3 text-center font-black" style="color: #FF0000;">$${venta.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Actualizar cantidad
function actualizarCantidad(productoId, tipo, valor) {
    if (!inventarioActual[productoId]) {
        const producto = productos.find(p => p.id === productoId);
        inventarioActual[productoId] = {
            inicial: producto.cantidad_inicial,
            final: producto.cantidad_inicial
        };
    }
    
    inventarioActual[productoId][tipo] = parseInt(valor) || 0;
    renderizarTabla();
    calcularTotal();
}

// Calcular total
function calcularTotal() {
    let total = 0;
    
    productos.forEach(producto => {
        const inv = inventarioActual[producto.id];
        if (inv) {
            const diferencia = inv.inicial - inv.final;
            total += diferencia * producto.precio_unitario;
        }
    });
    
    document.getElementById('ventaTotalDia').textContent = `$${total.toFixed(2)}`;
}

// Guardar inventario
async function guardarInventario() {
    if (!confirm(`¿Guardar inventario del día ${fechaSeleccionada}?`)) return;
    
    try {
        showLoading();
        
        const inventario = Object.entries(inventarioActual).map(([productoId, cantidades]) => ({
            producto_id: parseInt(productoId),
            fecha: fechaSeleccionada,
            cantidad_inicial: cantidades.inicial,
            cantidad_final: cantidades.final,
            precio_unitario: productos.find(p => p.id === parseInt(productoId)).precio_unitario
        }));
        
        const response = await fetch('/api/inventario/guardar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inventario })
        });
        
        if (!response.ok) throw new Error('Error al guardar');
        
        alert('Inventario guardado correctamente');
        await cargarHistorial();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar el inventario');
    } finally {
        showLoading(false);
    }
}

// Resetear día
function resetearDia() {
    if (!confirm('¿Resetear todos los valores del día actual?')) return;
    
    inventarioActual = {};
    productos.forEach(producto => {
        inventarioActual[producto.id] = {
            inicial: producto.cantidad_inicial,
            final: producto.cantidad_inicial
        };
    });
    
    renderizarTabla();
    calcularTotal();
}

// Cargar historial
async function cargarHistorial() {
    try {
        const response = await fetch('/api/inventario/historial');
        if (!response.ok) return;
        
        const historial = await response.json();
        const historialDiv = document.getElementById('historialVentas');
        historialDiv.innerHTML = '';
        
        historial.forEach(dia => {
            const card = document.createElement('div');
            card.className = 'bg-white p-4 rounded-lg border-2';
            card.style.borderColor = '#FF0000';
            
            card.innerHTML = `
                <div class="font-bold text-black mb-2">${new Date(dia.fecha).toLocaleDateString('es-MX')}</div>
                <div class="text-2xl font-black" style="color: #FF0000;">$${dia.total.toFixed(2)}</div>
            `;
            
            historialDiv.appendChild(card);
        });
    } catch (error) {
        console.error('Error al cargar historial:', error);
    }
}

// Cargar historial al iniciar
cargarHistorial();
