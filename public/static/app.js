// Estado de la aplicación
let cart = [];
let orderType = '';
let currentProduct = null;
let menuData = {};
let deliveryCost = 0;
let favorites = [];
let allRatings = {};
let orderTypeConfirmed = false; // Tracking si ya seleccionó tipo de pedido

// Cargar datos del menú al iniciar
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/menu');
        menuData = await response.json();
        
        // Cargar favoritos del localStorage
        loadFavorites();
        
        // Cargar ratings desde la API
        await loadAllRatings();
        
        showCategory('hamburguesas');
    } catch (error) {
        console.error('Error loading menu:', error);
    }
});

// ========== SISTEMA DE FAVORITOS ==========

// Cargar favoritos desde localStorage
function loadFavorites() {
    const stored = localStorage.getItem('georgeburger_favorites');
    if (stored) {
        favorites = JSON.parse(stored);
    }
    updateFavoritesCount();
}

// Guardar favoritos en localStorage
function saveFavorites() {
    localStorage.setItem('georgeburger_favorites', JSON.stringify(favorites));
    updateFavoritesCount();
}

// Actualizar contador de favoritos
function updateFavoritesCount() {
    const count = favorites.length;
    document.getElementById('favoritesCount').textContent = count;
}

// Verificar si un producto es favorito
function isFavorite(productName, category) {
    return favorites.some(fav => fav.nombre === productName && fav.category === category);
}

// Agregar/quitar favorito
function toggleFavorite(product, category, event) {
    if (event) {
        event.stopPropagation();
    }
    
    const productKey = { nombre: product.nombre, category };
    const index = favorites.findIndex(fav => fav.nombre === product.nombre && fav.category === category);
    
    if (index >= 0) {
        // Quitar de favoritos
        favorites.splice(index, 1);
        showNotification(`${product.nombre} eliminado de favoritos`);
    } else {
        // Agregar a favoritos
        favorites.push({ ...product, category });
        showNotification(`${product.nombre} agregado a favoritos ❤️`);
    }
    
    saveFavorites();
    
    // Recargar vista actual si estamos en favoritos
    const activeCategory = document.querySelector('.category-button.active')?.dataset.category;
    if (activeCategory === 'favoritos') {
        showFavorites();
    } else {
        showCategory(activeCategory);
    }
}

// Mostrar productos favoritos
function showFavorites() {
    // Actualizar tabs
    document.querySelectorAll('.category-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector('[data-category="favoritos"]');
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    const menuContent = document.getElementById('menuContent');
    menuContent.innerHTML = '';
    
    if (favorites.length === 0) {
        menuContent.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-heart text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500 text-xl font-bold">No tienes favoritos aún</p>
                <p class="text-gray-400 mt-2">Marca tus productos favoritos con el corazón ❤️</p>
            </div>
        `;
        return;
    }
    
    favorites.forEach(item => {
        createProductCard(item, item.category, menuContent);
    });
}

// Abrir modal de favoritos desde el header
document.addEventListener('DOMContentLoaded', () => {
    const favBtn = document.getElementById('favoritesBtn');
    if (favBtn) {
        favBtn.addEventListener('click', showFavorites);
    }
});

// ========== SISTEMA DE RATINGS ==========

// Cargar todos los ratings desde la API
async function loadAllRatings() {
    try {
        const response = await fetch('/api/ratings/all');
        const data = await response.json();
        allRatings = {};
        data.forEach(rating => {
            const key = `${rating.producto_nombre}_${rating.categoria}`;
            allRatings[key] = rating;
        });
    } catch (error) {
        console.error('Error loading ratings:', error);
    }
}

// Obtener rating de un producto
function getProductRating(productName, category) {
    const key = `${productName}_${category}`;
    return allRatings[key] || { total_ratings: 0, rating_promedio: 0 };
}

// Crear HTML de estrellas de rating
function createRatingStars(rating, interactive = false, productName = '', category = '') {
    let starsHTML = '<div class="rating-stars">';
    
    for (let i = 1; i <= 5; i++) {
        const filled = i <= Math.round(rating);
        const clickAction = interactive ? `onclick="rateProduct('${productName}', '${category}', ${i})"` : '';
        starsHTML += `<i class="star ${filled ? 'filled' : ''} ${interactive ? 'clickable' : ''} fas fa-star" ${clickAction}></i>`;
    }
    
    starsHTML += '</div>';
    return starsHTML;
}

// Calificar un producto
async function rateProduct(productName, category, rating) {
    const nombre = prompt('¿Cuál es tu nombre? (opcional)');
    const comentario = prompt('¿Quieres dejar un comentario? (opcional)');
    
    try {
        await fetch('/api/ratings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                producto_nombre: productName,
                categoria: category,
                rating: rating,
                comentario: comentario || null,
                nombre_cliente: nombre || 'Anónimo'
            })
        });
        
        showNotification(`¡Gracias por calificar ${productName}!`);
        await loadAllRatings();
        
        // Recargar vista actual
        const activeCategory = document.querySelector('.category-button.active')?.dataset.category;
        if (activeCategory === 'favoritos') {
            showFavorites();
        } else {
            showCategory(activeCategory);
        }
    } catch (error) {
        console.error('Error rating product:', error);
        showNotification('Error al enviar calificación');
    }
}

// Establecer tipo de pedido (desde el carousel)
function setOrderType(type) {
    orderType = type;
    orderTypeConfirmed = false; // Aún no ha llenado el formulario
    
    // Mostrar formulario correspondiente en modal
    if (type === 'domicilio') {
        document.getElementById('deliveryFormModal').classList.remove('hidden');
    } else {
        document.getElementById('pickupFormModal').classList.remove('hidden');
    }
}

// Actualizar costo de envío
function updateDeliveryCost() {
    const zonaSelect = document.getElementById('zonaEntrega');
    deliveryCost = parseInt(zonaSelect.value) || 0;
    updateCart();
}

// Iconos por categoría
const categoryIcons = {
    hamburguesas: '🍔',
    hotdogs: '🌭',
    sincronizadas: '🧀',
    tortas: '🥖',
    burros: '🌯',
    papas: '🍟',
    bebidas: '🥤'
};

// Crear tarjeta de producto
function createProductCard(item, category, container) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.position = 'relative';
    card.onclick = () => openProductModal(item, category);
    
    const icon = categoryIcons[category] || '🍴';
    const rating = getProductRating(item.nombre, category);
    const isFav = isFavorite(item.nombre, category);
    
    // Construir imagen o icono
    let imageHTML = '';
    if (item.imagen) {
        imageHTML = `<img src="${item.imagen}" alt="${item.nombre}" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
        imageHTML = `<div style="font-size: 64px; color: white;">${icon}</div>`;
    }
    
    // Badge de popularidad si tiene muchos ratings
    let badgeHTML = '';
    if (rating.total_ratings >= 5) {
        badgeHTML = '<div class="product-badge">⭐ Popular</div>';
    }
    
    card.innerHTML = `
        ${badgeHTML}
        <div class="favorite-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite({nombre: '${item.nombre.replace(/'/g, "\\'")}', ingredientes: '${(item.ingredientes || '').replace(/'/g, "\\'")}', precio: ${item.precio}, imagen: '${item.imagen || ''}'}, '${category}', event)">
            <i class="fas fa-heart text-lg"></i>
        </div>
        <div class="product-image" style="display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #FF0000 0%, #FFCC00 100%);">
            ${imageHTML}
        </div>
        <div class="product-body">
            <h3 class="product-name">${item.nombre}</h3>
            <p class="product-ingredients">${item.ingredientes || 'Deliciosa opción'}</p>
            <div style="margin: 8px 0;">
                ${createRatingStars(rating.rating_promedio, true, item.nombre, category)}
                <p style="font-size: 11px; color: #999; margin-top: 4px;">
                    ${rating.total_ratings > 0 ? `${rating.rating_promedio.toFixed(1)} ⭐ (${rating.total_ratings} ${rating.total_ratings === 1 ? 'voto' : 'votos'})` : 'Sin calificaciones aún'}
                </p>
            </div>
            <div class="product-footer">
                <span class="product-price">$${item.precio}</span>
                <button class="add-button" onclick="event.stopPropagation(); openProductModal({nombre: '${item.nombre.replace(/'/g, "\\'")}', ingredientes: '${(item.ingredientes || '').replace(/'/g, "\\'")}', precio: ${item.precio}, imagen: '${item.imagen || ''}'}, '${category}')">
                    Agregar
                </button>
            </div>
        </div>
    `;
    
    container.appendChild(card);
}

// Mostrar categoría
function showCategory(category) {
    // Actualizar tabs
    document.querySelectorAll('.category-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Buscar el botón correcto por data-category
    const activeBtn = document.querySelector(`[data-category="${category}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Mostrar productos
    const menuContent = document.getElementById('menuContent');
    menuContent.innerHTML = '';

    const items = menuData[category] || [];
    
    items.forEach(item => {
        createProductCard(item, category, menuContent);
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
            div.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition';
            div.innerHTML = `
                <label for="extra_${extra.nombre}" class="flex items-center flex-1 cursor-pointer">
                    <input type="checkbox" id="extra_${extra.nombre}" value="${extra.precio}" 
                           onchange="updateProductPrice()" class="mr-3 w-5 h-5 text-red-600">
                    <span class="font-medium text-black">${extra.nombre}</span>
                </label>
                <span class="font-bold" style="color: #FF0000;">+$${extra.precio}</span>
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
            label.className = 'flex items-center px-4 py-2 rounded-full cursor-pointer hover:opacity-90 transition';
            label.style.backgroundColor = '#efefef';
            label.innerHTML = `
                <input type="checkbox" value="${verdura}" class="mr-2 w-4 h-4">
                <span class="font-medium text-black">${verdura}</span>
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
            label.className = 'flex items-center px-4 py-2 rounded-full cursor-pointer hover:opacity-90 transition';
            label.style.backgroundColor = '#efefef';
            label.innerHTML = `
                <input type="checkbox" value="${aderezo}" class="mr-2 w-4 h-4">
                <span class="font-medium text-black">${aderezo}</span>
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
    
    // VALIDAR TIPO DE PEDIDO PRIMERO
    if (!orderType || !orderTypeConfirmed) {
        closeProductModal();
        document.getElementById('orderTypeModal').classList.remove('hidden');
        return;
    }
    
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
    
    // CALCULAR NOMBRE INTELIGENTE DEL PRODUCTO
    const smartName = calculateSmartProductName(currentProduct, selectedExtras, []);
    
    const cartItem = {
        nombre: smartName, // Usar el nombre inteligente
        nombreOriginal: currentProduct.nombre, // Guardar el nombre original
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
    
    // Mostrar notificación con el nombre inteligente
    if (smartName !== currentProduct.nombre) {
        showNotification(`"${smartName}" agregado al carrito 🎉`);
    } else {
        showNotification('Producto agregado al carrito');
    }
}

// Actualizar carrito
function updateCart() {
    const itemCount = cart.reduce((sum, item) => sum + item.cantidad, 0);
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const total = subtotal + deliveryCost;
    
    // Actualizar badge del header
    document.getElementById('cartCount').textContent = itemCount;
    
    // Actualizar carrito flotante
    const floatingCart = document.getElementById('floatingCart');
    const floatingCartCount = document.getElementById('floatingCartCount');
    const floatingCartTotal = document.getElementById('floatingCartTotal');
    
    if (itemCount > 0) {
        floatingCart.classList.remove('hidden');
        floatingCartCount.textContent = itemCount;
        floatingCartTotal.textContent = `$${total}`;
    } else {
        floatingCart.classList.add('hidden');
    }
    
    const cartItemsDiv = document.getElementById('cartItems');
    cartItemsDiv.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500 text-lg">Tu carrito está vacío</p>
                <p class="text-gray-400 text-sm mt-2">Agrega productos para comenzar tu pedido</p>
            </div>
        `;
    } else {
        cart.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'bg-white rounded-xl p-4 mb-3 shadow-sm border-2';
            itemDiv.style.borderColor = '#efefef';
            
            let details = '';
            if (item.extras.length > 0) {
                details += `<p class="text-xs text-gray-600 mt-1"><span class="font-semibold">Extras:</span> ${item.extras.join(', ')}</p>`;
            }
            if (item.verduras.length > 0) {
                details += `<p class="text-xs text-gray-600"><span class="font-semibold">Verduras:</span> ${item.verduras.join(', ')}</p>`;
            }
            if (item.aderezos.length > 0) {
                details += `<p class="text-xs text-gray-600"><span class="font-semibold">Aderezos:</span> ${item.aderezos.join(', ')}</p>`;
            }
            
            itemDiv.innerHTML = `
                <div class="flex justify-between items-start gap-3">
                    <div class="flex-1">
                        <h4 class="font-black text-black text-lg">${item.nombre}</h4>
                        ${details}
                        <p class="text-sm text-gray-600 mt-2">
                            <span class="font-semibold">Cantidad:</span> ${item.cantidad} × $${item.precio}
                        </p>
                    </div>
                    <div class="text-right flex flex-col items-end gap-2">
                        <p class="text-xl font-black" style="color: #FF0000;">$${item.subtotal}</p>
                        <button onclick="removeFromCart(${index})" class="text-gray-400 hover:text-red-600 transition">
                            <i class="fas fa-trash-alt text-lg"></i>
                        </button>
                    </div>
                </div>
            `;
            
            cartItemsDiv.appendChild(itemDiv);
        });
    }
    
    // Actualizar totales en modal del carrito
    document.getElementById('subtotal').textContent = `$${subtotal}`;
    
    if (orderType === 'domicilio' && deliveryCost > 0) {
        document.getElementById('deliveryCostDisplay').classList.remove('hidden');
        document.getElementById('deliveryCostAmount').textContent = `$${deliveryCost}`;
    } else {
        document.getElementById('deliveryCostDisplay').classList.add('hidden');
    }
    
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
    notification.className = 'fixed top-20 right-4 text-white px-6 py-4 rounded-full shadow-2xl z-50 font-bold';
    notification.style.backgroundColor = '#0033FF';
    notification.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Búsqueda de productos
function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();
    const clearBtn = document.getElementById('clearSearchBtn');
    const searchResults = document.getElementById('searchResults');
    const menuContent = document.getElementById('menuContent');
    
    if (searchTerm === '') {
        clearBtn.classList.add('hidden');
        searchResults.textContent = '';
        showCategory('hamburguesas');
        return;
    }
    
    clearBtn.classList.remove('hidden');
    
    // Buscar en todas las categorías
    let allResults = [];
    Object.keys(menuData).forEach(category => {
        if (category === 'ingredientesExtra' || category === 'verduras' || category === 'aderezos') return;
        
        const items = menuData[category] || [];
        const filtered = items.filter(item => 
            item.nombre.toLowerCase().includes(searchTerm) || 
            (item.ingredientes && item.ingredientes.toLowerCase().includes(searchTerm))
        );
        
        filtered.forEach(item => {
            allResults.push({ ...item, category });
        });
    });
    
    // Mostrar resultados
    searchResults.textContent = `Se encontraron ${allResults.length} producto${allResults.length !== 1 ? 's' : ''}`;
    
    menuContent.innerHTML = '';
    
    if (allResults.length === 0) {
        menuContent.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500 text-xl font-bold">No se encontraron productos</p>
                <p class="text-gray-400 mt-2">Intenta con otro término de búsqueda</p>
            </div>
        `;
        return;
    }
    
    allResults.forEach(item => {
        createProductCard(item, item.category, menuContent);
    });
}

// Limpiar búsqueda
function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('clearSearchBtn').classList.add('hidden');
    document.getElementById('searchResults').textContent = '';
    showCategory('hamburguesas');
}

// ========== SISTEMA DE VALIDACIÓN DE TIPO DE PEDIDO ==========

// Seleccionar tipo de pedido desde el carousel
function selectOrderTypeFromModal(type) {
    orderType = type;
    orderTypeConfirmed = false; // Aún no ha completado el formulario
    
    // Cerrar el modal de selección
    document.getElementById('orderTypeModal').classList.add('hidden');
    
    // Mostrar el formulario correspondiente
    if (type === 'domicilio') {
        document.getElementById('deliveryFormModal').classList.remove('hidden');
    } else {
        document.getElementById('pickupFormModal').classList.remove('hidden');
    }
}

// Confirmar formulario de recoger
function confirmPickupForm() {
    const nombreRecoger = document.getElementById('nombreRecoger').value.trim();
    
    if (!nombreRecoger) {
        alert('Por favor ingresa tu nombre');
        return;
    }
    
    orderTypeConfirmed = true;
    document.getElementById('pickupFormModal').classList.add('hidden');
    showNotification('¡Listo! Ahora puedes agregar productos a tu pedido 🍔');
}

// Cerrar formulario de recoger
function closePickupForm() {
    document.getElementById('pickupFormModal').classList.add('hidden');
    document.getElementById('nombreRecoger').value = '';
    orderType = '';
    orderTypeConfirmed = false;
}

// Confirmar formulario de domicilio
function confirmDeliveryForm() {
    const nombre = document.getElementById('nombre').value.trim();
    const domicilio = document.getElementById('domicilio').value.trim();
    const colonia = document.getElementById('colonia').value.trim();
    const zona = document.getElementById('zonaEntrega').value;
    
    if (!nombre || !domicilio || !colonia || zona === '0') {
        alert('Por favor completa todos los campos obligatorios (marcados con *)');
        return;
    }
    
    orderTypeConfirmed = true;
    deliveryCost = parseInt(zona);
    document.getElementById('deliveryFormModal').classList.add('hidden');
    showNotification('¡Listo! Ahora puedes agregar productos a tu pedido 🍔');
    updateCart();
}

// Cerrar formulario de domicilio
function closeDeliveryForm() {
    document.getElementById('deliveryFormModal').classList.add('hidden');
    // No limpiar los campos por si quiere volver a intentar
    orderType = '';
    orderTypeConfirmed = false;
    deliveryCost = 0;
    updateCart();
}

// ========== ALGORITMO INTELIGENTE DE NOMBRES DE PRODUCTOS ==========

// Diccionario de mapeo de ingredientes a productos
const productMappings = {
    hamburguesas: {
        // Productos base con sus ingredientes clave
        'Asadera': ['Carne', 'Q.Asadero'],
        'Especial': ['Carne', 'Carnes Frías'],
        'Doble': ['Carne', 'Jamón', 'Q.Amarillo'],
        'Champiqueso': ['Carne', 'Champiñón', 'Q.Asadero'],
        'Petra': ['Carne', 'Q.Asadero', 'Tocino'],
        'Campechana': ['Carne', 'Q.Asadero', 'Jamón', 'Q.Amarillo'],
        'Ejecutiva': ['Carne', 'Carnes Frías', 'Salchicha'],
        'Española': ['Carne', 'Q.Asadero', 'Salchicha'],
        'Embajadora': ['Carne', 'Carnes Frías', 'Q.Asadero', 'Salchicha'],
        'Americana': ['Carne', 'Carne', 'Q.Amarillo', 'Q.Amarillo'],
        'Choriqueso': ['Chorizo', 'Q.Asadero'],
        'Ranchera': ['Carne', 'Chorizo', 'Q.Asadero'],
        'Hawaiana': ['Carne', 'Piña', 'Q.Asadero'],
        'Hawaiana Especial': ['Carne', 'Piña', 'Q.Asadero', 'Carnes Frías'],
        'Especial Asadera': ['Carne', 'Q.Asadero', 'Carnes Frías'],
        'Ahumada': ['Chuleta'],
        'Ahumada Especial': ['Chuleta', 'Carnes Frías'],
        'Mexicana': ['Chuleta', 'Carne'],
        'Norteña': ['Carne', 'Chuleta', 'Q.Asadero'],
        'Italiana': ['Chuleta', 'Q.Asadero'],
        'Extravagante': ['Carne', 'Chuleta', 'Q.Asadero', 'Carnes Frías'],
        'Descarnada': ['Carnes Frías', 'Q.Amarillo'],
        'Descarnada Asadero': ['Carnes Frías', 'Q.Amarillo', 'Q.Asadero'],
        'Sencilla': ['Carne'],
        'Big Sencilla': ['Carne', 'Carne'],
        'Costeña': ['Camarón', 'Q.Asadero', 'Tocino'],
        'Super Costeña': ['Camarón', 'Q.Asadero', 'Carne', 'Tocino'],
        'La Popotiña': ['Carne de Pierna', 'Tocino', 'Q.Asadero'],
        'Grosera': ['Salchicha para Asar', 'Q.Asadero', 'Tocino'],
        'Super Grosera': ['Salchicha para Asar', 'Q.Asadero', 'Tocino', 'Carne']
    },
    hotdogs: {
        'Grosero': ['Salchicha para Asar', 'Q.Asadero', 'Tocino'],
        'Asadero': ['Salchicha', 'Q.Asadero'],
        'Big Grosero': ['Salchicha para Asar', 'Q.Asadero', 'Tocino', 'Carnes Frías'],
        'Choriqueso': ['Salchicha', 'Chorizo', 'Q.Asadero'],
        'Champiqueso': ['Salchicha', 'Champiñón', 'Q.Asadero'],
        'Campechano': ['Salchicha', 'Q.Asadero', 'Jamón', 'Q.Amarillo'],
        'Especial': ['Salchicha', 'Carnes Frías'],
        'Hawaiano': ['Salchicha', 'Q.Asadero', 'Piña'],
        'Hawaiano Especial': ['Salchicha', 'Q.Asadero', 'Piña', 'Carnes Frías'],
        'Doble': ['Salchicha', 'Jamón', 'Q.Amarillo'],
        'Descarnado': ['Carnes Frías']
    }
};

// Función para calcular el nombre inteligente del producto
function calculateSmartProductName(baseProduct, selectedExtras, removedIngredients) {
    const category = baseProduct.category;
    
    // Solo aplicar para hamburguesas y hotdogs
    if (category !== 'hamburguesas' && category !== 'hotdogs') {
        return baseProduct.nombre;
    }
    
    // Obtener ingredientes base del producto
    let currentIngredients = [];
    if (baseProduct.ingredientes) {
        currentIngredients = baseProduct.ingredientes.split('+').map(i => i.trim());
    }
    
    // Agregar ingredientes extra
    const allIngredients = [...currentIngredients, ...selectedExtras];
    
    // Remover ingredientes si se especificaron (futura función)
    // const finalIngredients = allIngredients.filter(ing => !removedIngredients.includes(ing));
    
    // Buscar coincidencia en el diccionario
    const categoryMappings = productMappings[category] || {};
    
    for (const [productName, requiredIngredients] of Object.entries(categoryMappings)) {
        // Verificar si todos los ingredientes requeridos están presentes
        const hasAllIngredients = requiredIngredients.every(req => 
            allIngredients.some(ing => 
                ing.toLowerCase().includes(req.toLowerCase()) || 
                req.toLowerCase().includes(ing.toLowerCase())
            )
        );
        
        if (hasAllIngredients && requiredIngredients.length === allIngredients.length) {
            return productName;
        }
    }
    
    // Si agregó extras pero no coincide con ningún producto conocido, agregar "con extras"
    if (selectedExtras.length > 0) {
        return `${baseProduct.nombre} + ${selectedExtras.join(' + ')}`;
    }
    
    return baseProduct.nombre;
}