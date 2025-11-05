// Estado de la aplicación
let cart = [];
let orderType = '';
let currentProduct = null;
let menuData = {};
let deliveryCost = 0;

// Cargar datos del menú al iniciar
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/menu');
        menuData = await response.json();
        showCategory('hamburguesas');
    } catch (error) {
        console.error('Error loading menu:', error);
    }
});

// Establecer tipo de pedido
function setOrderType(type) {
    orderType = type;
    
    // Actualizar botones
    document.querySelectorAll('.order-type-btn').forEach(btn => {
        btn.classList.remove('bg-red-600');
        btn.classList.add('bg-#efefef');
    });
    
    if (type === 'domicilio') {
        document.getElementById('btnDomicilio').classList.remove('bg-#efefef');
        document.getElementById('btnDomicilio').classList.add('bg-red-600');
        document.getElementById('deliveryForm').classList.remove('hidden');
        document.getElementById('pickupForm').classList.add('hidden');
    } else {
        document.getElementById('btnRecoger').classList.remove('bg-#efefef');
        document.getElementById('btnRecoger').classList.add('bg-red-600');
        document.getElementById('deliveryForm').classList.add('hidden');
        document.getElementById('pickupForm').classList.remove('hidden');
        deliveryCost = 0;
        updateCart();
    }
}

// Actualizar costo de envío
function updateDeliveryCost() {
    const zonaSelect = document.getElementById('zonaEntrega');
    deliveryCost = parseInt(zonaSelect.value) || 0;
    updateCart();
}

// Mostrar categoría
function showCategory(category) {
    // Actualizar tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('bg-red-600');
        tab.classList.add('bg-#efefef');
    });
    event.target.classList.remove('bg-#efefef');
    event.target.classList.add('bg-red-600');

    // Mostrar productos
    const menuContent = document.getElementById('menuContent');
    menuContent.innerHTML = '';

    const items = menuData[category] || [];
    
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-#efefef rounded-lg p-4 hover:bg-#efefef transition cursor-pointer';
        card.onclick = () => openProductModal(item, category);
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-yellow-400">${item.nombre}</h3>
                <span class="text-xl font-bold text-#0033FF">$${item.precio}</span>
            </div>
            <p class="text-sm text-#efefef">${item.ingredientes || ''}</p>
            <button class="mt-3 w-full bg-red-600 text-white py-2 rounded hover:bg-red-500 transition">
                <i class="fas fa-plus-circle mr-2"></i>Agregar
            </button>
        `;
        
        menuContent.appendChild(card);
    });
}

// Abrir modal de producto
function openProductModal(product, category) {
    currentProduct = { ...product, category };
    
    document.getElementById('productModalTitle').textContent = product.nombre;
    document.getElementById('productModalIngredients').textContent = product.ingredientes || '';
    document.getElementById('quantity').value = 1;
    
    // Cargar ingredientes extra (no para bebidas ni papas)
    const extraIngredientsDiv = document.getElementById('extraIngredients');
    if (category !== 'bebidas' && category !== 'papas') {
        extraIngredientsDiv.innerHTML = '';
        menuData.ingredientesExtra.forEach(extra => {
            const div = document.createElement('div');
            div.className = 'flex items-center mb-2';
            div.innerHTML = `
                <input type="checkbox" id="extra_${extra.nombre}" value="${extra.precio}" 
                       onchange="updateProductPrice()" class="mr-2">
                <label for="extra_${extra.nombre}" class="flex-1">${extra.nombre}</label>
                <span class="text-#0033FF">+$${extra.precio}</span>
            `;
            extraIngredientsDiv.appendChild(div);
        });
        extraIngredientsDiv.parentElement.classList.remove('hidden');
    } else {
        extraIngredientsDiv.parentElement.classList.add('hidden');
    }
    
    // Cargar verduras (no para bebidas ni papas)
    const vegetablesDiv = document.getElementById('vegetables');
    if (category !== 'bebidas' && category !== 'papas') {
        vegetablesDiv.innerHTML = '';
        menuData.verduras.forEach(verdura => {
            const label = document.createElement('label');
            label.className = 'flex items-center bg-#efefef px-3 py-1 rounded cursor-pointer hover:bg-#efefef';
            label.innerHTML = `
                <input type="checkbox" value="${verdura}" class="mr-2">
                <span>${verdura}</span>
            `;
            vegetablesDiv.appendChild(label);
        });
        vegetablesDiv.parentElement.classList.remove('hidden');
    } else {
        vegetablesDiv.parentElement.classList.add('hidden');
    }
    
    // Cargar aderezos (no para bebidas ni papas)
    const dressingsDiv = document.getElementById('dressings');
    if (category !== 'bebidas' && category !== 'papas') {
        dressingsDiv.innerHTML = '';
        menuData.aderezos.forEach(aderezo => {
            const label = document.createElement('label');
            label.className = 'flex items-center bg-#efefef px-3 py-1 rounded cursor-pointer hover:bg-#efefef';
            label.innerHTML = `
                <input type="checkbox" value="${aderezo}" class="mr-2">
                <span>${aderezo}</span>
            `;
            dressingsDiv.appendChild(label);
        });
        dressingsDiv.parentElement.classList.remove('hidden');
    } else {
        dressingsDiv.parentElement.classList.add('hidden');
    }
    
    updateProductPrice();
    document.getElementById('productModal').classList.remove('hidden');
}

// Cerrar modal de producto
function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
    currentProduct = null;
}

// Cambiar cantidad
function changeQuantity(delta) {
    const quantityInput = document.getElementById('quantity');
    const newValue = Math.max(1, parseInt(quantityInput.value) + delta);
    quantityInput.value = newValue;
    updateProductPrice();
}

// Actualizar precio del producto
function updateProductPrice() {
    if (!currentProduct) return;
    
    let price = currentProduct.precio;
    
    // Sumar ingredientes extra
    document.querySelectorAll('#extraIngredients input[type="checkbox"]:checked').forEach(checkbox => {
        price += parseInt(checkbox.value);
    });
    
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    const totalPrice = price * quantity;
    
    document.getElementById('productModalPrice').textContent = `$${totalPrice}`;
}

// Agregar al carrito
function addToCart() {
    if (!currentProduct) return;
    
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    
    // Obtener extras seleccionados
    const selectedExtras = [];
    let extrasPrice = 0;
    document.querySelectorAll('#extraIngredients input[type="checkbox"]:checked').forEach(checkbox => {
        const extraName = checkbox.id.replace('extra_', '');
        selectedExtras.push(extraName);
        extrasPrice += parseInt(checkbox.value);
    });
    
    // Obtener verduras seleccionadas
    const selectedVegetables = [];
    document.querySelectorAll('#vegetables input[type="checkbox"]:checked').forEach(checkbox => {
        selectedVegetables.push(checkbox.value);
    });
    
    // Obtener aderezos seleccionados
    const selectedDressings = [];
    document.querySelectorAll('#dressings input[type="checkbox"]:checked').forEach(checkbox => {
        selectedDressings.push(checkbox.value);
    });
    
    const cartItem = {
        nombre: currentProduct.nombre,
        category: currentProduct.category,
        precio: currentProduct.precio + extrasPrice,
        cantidad: quantity,
        extras: selectedExtras,
        verduras: selectedVegetables,
        aderezos: selectedDressings,
        subtotal: (currentProduct.precio + extrasPrice) * quantity
    };
    
    cart.push(cartItem);
    updateCart();
    closeProductModal();
    
    // Mostrar notificación
    showNotification('Producto agregado al carrito');
}

// Actualizar carrito
function updateCart() {
    document.getElementById('cartCount').textContent = cart.reduce((sum, item) => sum + item.cantidad, 0);
    
    const cartItemsDiv = document.getElementById('cartItems');
    cartItemsDiv.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="text-#efefef">Tu carrito está vacío</p>';
    } else {
        cart.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'bg-#efefef rounded-lg p-4 mb-4';
            
            let details = '';
            if (item.extras.length > 0) {
                details += `<p class="text-sm text-#efefef">Extras: ${item.extras.join(', ')}</p>`;
            }
            if (item.verduras.length > 0) {
                details += `<p class="text-sm text-#efefef">Verduras: ${item.verduras.join(', ')}</p>`;
            }
            if (item.aderezos.length > 0) {
                details += `<p class="text-sm text-#efefef">Aderezos: ${item.aderezos.join(', ')}</p>`;
            }
            
            itemDiv.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h4 class="font-bold text-yellow-400">${item.nombre}</h4>
                        ${details}
                        <p class="text-sm">Cantidad: ${item.cantidad} | Precio unitario: $${item.precio}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-lg font-bold text-#0033FF">$${item.subtotal}</p>
                        <button onclick="removeFromCart(${index})" class="text-red-400 hover:text-red-300 mt-2">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            cartItemsDiv.appendChild(itemDiv);
        });
    }
    
    // Actualizar totales
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    document.getElementById('subtotal').textContent = `$${subtotal}`;
    
    if (orderType === 'domicilio' && deliveryCost > 0) {
        document.getElementById('deliveryCostDisplay').classList.remove('hidden');
        document.getElementById('deliveryCostAmount').textContent = `$${deliveryCost}`;
    } else {
        document.getElementById('deliveryCostDisplay').classList.add('hidden');
    }
    
    const total = subtotal + deliveryCost;
    document.getElementById('total').textContent = `$${total}`;
}

// Remover del carrito
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Abrir carrito
document.getElementById('cartBtn').addEventListener('click', () => {
    document.getElementById('cartModal').classList.remove('hidden');
    updateCart();
});

// Cerrar carrito
function closeCart() {
    document.getElementById('cartModal').classList.add('hidden');
}

// Enviar por WhatsApp
function sendWhatsApp() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    if (!orderType) {
        alert('Por favor selecciona si es para recoger o a domicilio');
        return;
    }
    
    // Validar datos según tipo de pedido
    if (orderType === 'domicilio') {
        const nombre = document.getElementById('nombre').value;
        const domicilio = document.getElementById('domicilio').value;
        const entreCalles = document.getElementById('entreCalles').value;
        const colonia = document.getElementById('colonia').value;
        const zona = document.getElementById('zonaEntrega').value;
        
        if (!nombre || !domicilio || !entreCalles || !colonia || zona === '0') {
            alert('Por favor completa todos los datos de entrega');
            return;
        }
    } else if (orderType === 'recoger') {
        const nombreRecoger = document.getElementById('nombreRecoger').value;
        if (!nombreRecoger) {
            alert('Por favor ingresa tu nombre para el pedido');
            return;
        }
    }
    
    // Construir mensaje
    let message = '🍔 *NUEVO PEDIDO - GEORGE BURGER* 🍔\n\n';
    
    // Tipo de pedido
    message += `📦 *Tipo:* ${orderType === 'domicilio' ? 'A Domicilio' : 'Pasar a Recoger'}\n\n`;
    
    // Datos según tipo de pedido
    if (orderType === 'domicilio') {
        const nombre = document.getElementById('nombre').value;
        const domicilio = document.getElementById('domicilio').value;
        const entreCalles = document.getElementById('entreCalles').value;
        const colonia = document.getElementById('colonia').value;
        
        message += '🏠 *DATOS DE ENTREGA:*\n';
        message += `• Nombre: ${nombre}\n`;
        message += `• Domicilio: ${domicilio}\n`;
        message += `• Entre calles: ${entreCalles}\n`;
        message += `• Colonia: ${colonia}\n\n`;
    } else if (orderType === 'recoger') {
        const nombreRecoger = document.getElementById('nombreRecoger').value;
        message += '🏪 *DATOS PARA RECOGER:*\n';
        message += `• Nombre: ${nombreRecoger}\n\n`;
    }
    
    // Detalles del pedido
    message += '🍽️ *PEDIDO:*\n';
    message += '------------------------\n';
    
    cart.forEach((item, index) => {
        message += `\n${index + 1}. *${item.nombre}* (x${item.cantidad})\n`;
        if (item.extras.length > 0) {
            message += `   • Extras: ${item.extras.join(', ')}\n`;
        }
        if (item.verduras.length > 0) {
            message += `   • Verduras: ${item.verduras.join(', ')}\n`;
        }
        if (item.aderezos.length > 0) {
            message += `   • Aderezos: ${item.aderezos.join(', ')}\n`;
        }
        message += `   💰 Subtotal: $${item.subtotal}\n`;
    });
    
    // Totales
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    message += '\n------------------------\n';
    message += `📊 *RESUMEN:*\n`;
    message += `• Subtotal: $${subtotal}\n`;
    if (orderType === 'domicilio' && deliveryCost > 0) {
        message += `• Envío: $${deliveryCost}\n`;
    }
    const total = subtotal + deliveryCost;
    message += `• *TOTAL: $${total}*\n`;
    
    message += '\n¡Gracias por su preferencia! 🙏';
    
    // Enviar por WhatsApp
    const phoneNumber = '523111235595';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Limpiar carrito después de enviar
    cart = [];
    updateCart();
    closeCart();
}

// Mostrar notificación
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-#0033FF text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}