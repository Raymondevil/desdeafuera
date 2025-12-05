// Productos de la caja
const productoscaja = {
	hamburguesas: [
		{codigo: "H. Asadera", nombre: "H. Asadera", precio: 67},
		{codigo: "H. Especial", nombre: "H. Especial", precio: 67},
		{codigo: "H. Doble", nombre: "H. Doble", precio: 64},
		{codigo: "H. Champiqueso", nombre: "H. Champiqueso", precio: 82},
		{codigo: "H. Petra", nombre: "H. Petra", precio: 84},
		{codigo: "H. Campechana", nombre: "H. Campechana", precio: 79},
		{codigo: "H. Ejecutiva", nombre: "H. Ejecutiva", precio: 101},
		{codigo: "H. Española", nombre: "H. Española", precio: 101},
		{codigo: "H. Embajadora", nombre: "H. Embajadora", precio: 116},
		{codigo: "H. Americana", nombre: "H. Americana", precio: 112},
		{codigo: "H. Choriqueso", nombre: "H. Choriqueso", precio: 52},
		{codigo: "H. Ranchera", nombre: "H. Ranchera", precio: 82},
		{codigo: "H. Hawaiana", nombre: "H. Hawaiana", precio: 82},
		{codigo: "H. Hawaiana Especial", nombre: "H. Hawaiana Especial", precio: 97},
		{codigo: "H. Especial Asadera", nombre: "H. Especial Asadera", precio: 82},
		{codigo: "H. Ahumada", nombre: "H. Ahumada", precio: 52},
		{codigo: "H. Ahumada Especial", nombre: "H. Ahumada Especial", precio: 67},
		{codigo: "H. Mexicana", nombre: "H. Mexicana", precio: 88},
		{codigo: "H. Norteña", nombre: "H. Norteña", precio: 103},
		{codigo: "H. Italiana", nombre: "H. Italiana", precio: 67},
		{codigo: "H. Extravagante", nombre: "H. Extravagante", precio: 118},
		{codigo: "H. Descarnada", nombre: "H. Descarnada", precio: 52},
		{codigo: "H. Descarnada Asadero", nombre: "H. Descarnada Asadero", precio: 65},
		{codigo: "H. Sencilla", nombre: "H. Sencilla", precio: 52},
		{codigo: "H. Big Sencilla", nombre: "H. Big Sencilla", precio: 88},
		{codigo: "H. Costeña", nombre: "H. Costeña", precio: 102},
		{codigo: "H. Super Costeña", nombre: "H. Super Costeña", precio: 138},
		{codigo: "H. La Popotiña", nombre: "H. La Popotiña", precio: 88},
		{codigo: "H. Grosera", nombre: "H. Grosera", precio: 62},
		{codigo: "H. Super Grosera", nombre: "H. Super Grosera", precio: 98}
	],
	dogos: [
		{codigo: "D. Dogo de Pavo", nombre: "D. Dogo de Pavo", precio: 52},
		{codigo: "D. Grosero", nombre: "D. Grosero", precio: 62},
		{codigo: "D. Asadero", nombre: "D. Asadero", precio: 67},
		{codigo: "D. Big Grosero", nombre: "D. Big Grosero", precio: 82},
		{codigo: "D. Choriqueso", nombre: "D. Choriqueso", precio: 82},
		{codigo: "D. Champiqueso", nombre: "D. Champiqueso", precio: 82},
		{codigo: "D. Campechano", nombre: "D. Campechano", precio: 79},
		{codigo: "D. Especial", nombre: "D. Especial", precio: 67},
		{codigo: "D. Hawaiano", nombre: "D. Hawaiano", precio: 82},
		{codigo: "D. Hawaiano Especial", nombre: "D. Hawaiano Especial", precio: 97},
		{codigo: "D. Doble", nombre: "D. Doble", precio: 64},
		{codigo: "D. Descarnado", nombre: "D. Descarnado", precio: 50},
		{codigo: "D. de Pierna", nombre: "D. de Pierna", precio: 50}
	],
	sincronizadas: [
		{codigo: "S. Sencilla", nombre: "S. Sencilla", precio: 53},
		{codigo: "S. Especial", nombre: "S. Especial", precio: 85},
		{codigo: "S. Super", nombre: "S. Super", precio: 68},
		{codigo: "S. Matona", nombre: "S. Matona", precio: 131},
		{codigo: "S. Costeña", nombre: "S. Costeña", precio: 131}
	],
	tortas: [
		{codigo: "T. Sencilla", nombre: "T. Sencilla", precio: 52},
		{codigo: "T. Especial", nombre: "T. Especial", precio: 67},
		{codigo: "T. Asadera", nombre: "T. Asadera", precio: 67},
		{codigo: "T. Cubana", nombre: "T. Cubana", precio: 109}
	],
	burros: [
		{codigo: "B. Sencillo", nombre: "B. Sencillo", precio: 52},
		{codigo: "B. Asadero", nombre: "B. Asadero", precio: 67},
		{codigo: "B. Especial", nombre: "B. Especial", precio: 67},
		{codigo: "B. Costeño", nombre: "B. Costeño", precio: 112}
	],
	extras: [
		{codigo: "Carne", nombre: "Carne", precio: 34},
		{codigo: "Carnes Frías", nombre: "Carnes Frías", precio: 13},
		{codigo: "Q. Asadero", nombre: "Q. Asadero", precio: 13},
		{codigo: "Salchicha para Asar", nombre: "Salchicha para Asar", precio: 44},
		{codigo: "Piña", nombre: "Piña", precio: 13},
		{codigo: "Champiñón", nombre: "Champiñón", precio: 13},
		{codigo: "Salchicha de Pavo", nombre: "Salchicha de Pavo", precio: 34},
		{codigo: "Chuleta", nombre: "Chuleta", precio: 34},
		{codigo: "Camarón", nombre: "Camarón", precio: 46},
		{codigo: "Tocino", nombre: "Tocino", precio: 15},
		{codigo: "Carne de Pierna", nombre: "Carne de Pierna", precio: 34},
		{codigo: "Chorizo", nombre: "Chorizo", precio: 13},
		{codigo: "Q. Amarillo", nombre: "Q. Amarillo", precio: 10}
	],
	bebidas: [
		{codigo: "Bebida", nombre: "Bebida", precio: 30}
	],
	papas: [
		{codigo: "Papas Chica", nombre: "Papas Chica", precio: 45},
		{codigo: "Papas Grande", nombre: "Papas Grande", precio: 50}
	]
};

// Estado de la caja
let ticket = [];
let currentProductForExtras = null;
let allProducts = [];

// Inicializar al cargar
window.addEventListener('DOMContentLoaded', () => {
	// Combinar todos los productos en un array
	allProducts = [
		...productoscaja.hamburguesas,
		...productoscaja.dogos,
		...productoscaja.sincronizadas,
		...productoscaja.tortas,
		...productoscaja.burros,
		...productoscaja.bebidas,
		...productoscaja.papas
	];

	renderAllProducts();
});

// Renderizar todos los productos
function renderAllProducts() {
	const grid = document.getElementById('productGrid');
	grid.innerHTML = '';

	allProducts.forEach(product => {
		const btn = createProductButton(product);
		grid.appendChild(btn);
	});
}

// Crear botón de producto
function createProductButton(product) {
	const btn = document.createElement('button');
	btn.className = 'bg-white p-3 rounded-lg font-bold transition hover:scale-105 border-2';
	btn.style.borderColor = '#FF0000';
	btn.style.color = '#000';

	btn.innerHTML = `
        <div class="text-xs mb-1">${product.codigo}</div>
        <div class="text-lg font-black" style="color: #FF0000;">$${product.precio}</div>
    `;

	btn.onclick = () => openExtraModal(product);

	return btn;
}

// Abrir modal de extras
function openExtraModal(product) {
	currentProductForExtras = {...product, extras: []};

	document.getElementById('extraModalTitle').textContent = product.nombre;

	// Solo mostrar modal de extras para hamburguesas, dogos, sincronizadas, tortas y burros
	const needsExtras = product.codigo.startsWith('H.') ||
		product.codigo.startsWith('D.') ||
		product.codigo.startsWith('S.') ||
		product.codigo.startsWith('T.') ||
		product.codigo.startsWith('B.');

	if (needsExtras) {
		const extrasList = document.getElementById('extraIngredientsList');
		extrasList.innerHTML = '';

		productoscaja.extras.forEach(extra => {
			const div = document.createElement('div');
			div.className = 'flex items-center mb-2 bg-white p-2 rounded';
			div.innerHTML = `
                <input type="checkbox" id="extra_${extra.codigo}" class="mr-2" value="${extra.precio}">
                <label for="extra_${extra.codigo}" class="flex-1 font-bold text-black">${extra.nombre}</label>
                <span class="font-bold" style="color: #FF0000;">+$${extra.precio}</span>
            `;
			extrasList.appendChild(div);
		});

		document.getElementById('extraModal').classList.remove('hidden');
	} else {
		// Para bebidas y papas, agregar directo
		addToTicket(currentProductForExtras);
	}
}

// Cerrar modal de extras
function closeExtraModal(addExtras) {
	if (addExtras) {
		// Recopilar extras seleccionados
		const checkboxes = document.querySelectorAll('#extraIngredientsList input[type="checkbox"]:checked');
		let extrasPrice = 0;
		let extrasNames = [];

		checkboxes.forEach(cb => {
			extrasPrice += parseInt(cb.value);
			const label = document.querySelector(`label[for="${cb.id}"]`);
			extrasNames.push(label.textContent);
		});

		if (extrasNames.length > 0) {
			currentProductForExtras.extras = extrasNames;
			currentProductForExtras.precioOriginal = currentProductForExtras.precio;
			currentProductForExtras.precio += extrasPrice;
		}
	}

	addToTicket(currentProductForExtras);
	document.getElementById('extraModal').classList.add('hidden');

	// Limpiar checkboxes
	document.querySelectorAll('#extraIngredientsList input[type="checkbox"]').forEach(cb => {
		cb.checked = false;
	});
}

// Agregar al ticket
function addToTicket(product) {
	ticket.push({...product, id: Date.now()});
	renderTicket();
}

// Renderizar ticket
function renderTicket() {
	const ticketItems = document.getElementById('ticketItems');

	if (ticket.length === 0) {
		ticketItems.innerHTML = '<p class="text-center text-#efefef font-bold">No hay productos</p>';
		document.getElementById('totalCaja').textContent = '$0';
		return;
	}

	ticketItems.innerHTML = '';
	let total = 0;

	ticket.forEach((item, index) => {
		total += item.precio;

		const itemDiv = document.createElement('div');
		itemDiv.className = 'bg-white p-3 rounded-lg mb-2';

		let extrasHtml = '';
		if (item.extras && item.extras.length > 0) {
			extrasHtml = `<div class="text-xs text-#efefef mt-1">+ ${item.extras.join(', ')}</div>`;
		}

		itemDiv.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="font-bold text-black">${item.nombre}</div>
                    ${extrasHtml}
                </div>
                <div class="flex items-center gap-2">
                    <span class="font-black" style="color: #FF0000;">$${item.precio}</span>
                    <button onclick="removeFromTicket(${index})" class="text-red-600 hover:text-red-800">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;

		ticketItems.appendChild(itemDiv);
	});

	document.getElementById('totalCaja').textContent = `$${total}`;
}

// Remover del ticket
function removeFromTicket(index) {
	ticket.splice(index, 1);
	renderTicket();
}

// Buscar en caja
function searchInCaja() {
	const searchTerm = document.getElementById('searchCaja').value.toLowerCase();
	const grid = document.getElementById('productGrid');

	if (searchTerm === '') {
		renderAllProducts();
		return;
	}

	const filtered = allProducts.filter(p =>
		p.nombre.toLowerCase().includes(searchTerm) ||
		p.codigo.toLowerCase().includes(searchTerm)
	);

	grid.innerHTML = '';
	filtered.forEach(product => {
		const btn = createProductButton(product);
		grid.appendChild(btn);
	});
}

// Finalizar venta
function finalizarVenta() {
	if (ticket.length === 0) {
		alert('No hay productos en el ticket');
		return;
	}

	const total = ticket.reduce((sum, item) => sum + item.precio, 0);

	if (confirm(`¿Cobrar $${total}?`)) {
		alert(`¡Venta realizada! Total: $${total}`);
		limpiarTicket();
	}
}

// Limpiar ticket
function limpiarTicket() {
	if (ticket.length > 0 && !confirm('¿Limpiar el ticket?')) {
		return;
	}
	ticket = [];
	renderTicket();
}
