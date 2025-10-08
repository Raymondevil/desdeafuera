import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// API route to get menu data
app.get('/api/menu', (c) => {
  return c.json(menuData)
})

// Main route
app.get('/', (c) => {
  return c.html(htmlContent)
})

// Menu data
const menuData = {
  hamburguesas: [
    { nombre: "Asadera", ingredientes: "Carne+Q.Asadero", precio: 63 },
    { nombre: "Especial", ingredientes: "Carne+Carnes Frías", precio: 63 },
    { nombre: "Doble", ingredientes: "Carne+Jamón+Q.Amarillo", precio: 60 },
    { nombre: "Champiqueso", ingredientes: "Carne+Champiñón+Q.Asadero", precio: 76 },
    { nombre: "Petra", ingredientes: "Carne+Q.Asadero+Tocino", precio: 78 },
    { nombre: "Campechana", ingredientes: "Asadera+Jamón+Q.Amarillo", precio: 73 },
    { nombre: "Ejecutiva", ingredientes: "Carne+Carnes Frías+Salchicha", precio: 95 },
    { nombre: "Española", ingredientes: "Carne+Q.Asadero+Salchicha", precio: 95 },
    { nombre: "Embajadora", ingredientes: "Carne+Carnes Frías+Q.Asadero+Salchicha", precio: 108 },
    { nombre: "Americana", ingredientes: "Doble Carne+Doble Q.Amarillo", precio: 100 },
    { nombre: "Choriqueso", ingredientes: "Chorizo+Q.Asadero", precio: 45 },
    { nombre: "Ranchera", ingredientes: "Carne+Chorizo+Q.Asadero", precio: 76 },
    { nombre: "Hawaiana", ingredientes: "Carne+Piña+Q.Asadero", precio: 76 },
    { nombre: "Hawaiana Especial", ingredientes: "Carne+Piña+Q.Asadero+Carnes Frías", precio: 89 },
    { nombre: "Especial Asadera", ingredientes: "Carne+Q.Asadero+Carnes Frías", precio: 76 },
    { nombre: "Ahumada", ingredientes: "Chuleta", precio: 50 },
    { nombre: "Ahumada Especial", ingredientes: "Chuleta+Carnes Frías", precio: 63 },
    { nombre: "Mexicana", ingredientes: "Chuleta+Carne", precio: 84 },
    { nombre: "Norteña", ingredientes: "Carne+Chuleta+Q.Asadero", precio: 97 },
    { nombre: "Italiana", ingredientes: "Chuleta+Q.Asadero", precio: 63 },
    { nombre: "Extravagante", ingredientes: "Carne+Chuleta+Q.Asadero+Carnes Frías", precio: 110 },
    { nombre: "Descarnada", ingredientes: "Carnes Frías+Q.Amarillo", precio: 48 },
    { nombre: "Descarnada Asadero", ingredientes: "Carnes Frías+Q.Amarillo+Q.Asadero", precio: 61 },
    { nombre: "Sencilla", ingredientes: "Carne de Res", precio: 50 },
    { nombre: "Big Sencilla", ingredientes: "2 Carnes de Res", precio: 84 },
    { nombre: "Costeña", ingredientes: "Camarón+Q.Asadero+Tocino+Ch.Morrón+Sal.Inglesa", precio: 96 },
    { nombre: "Super Costeña", ingredientes: "Camarón+Q.Asadero+Carne de Res+Tocino+Ch.Morrón", precio: 130 },
    { nombre: "La Popotiña", ingredientes: "Carne de Pierna+Tocino+Chile Morrón+Q.Asadero", precio: 82 },
    { nombre: "Grosera", ingredientes: "Salchicha para Asar+Q.Asadero+Tocino", precio: 60 },
    { nombre: "Super Grosera", ingredientes: "Salchicha para Asar+Q.Asadero+Tocino+Carne de Res", precio: 94 }
  ],
  hotdogs: [
    { nombre: "Dogo de Pavo", ingredientes: "Salchicha de Pavo", precio: 50 },
    { nombre: "Grosero", ingredientes: "Salchicha para Asar+Q.Asadero+Tocino Rebanado", precio: 60 },
    { nombre: "Asadero", ingredientes: "Salchicha+Q.Asadero", precio: 73 },
    { nombre: "Big Grosero", ingredientes: "Grosero+Carnes Frías", precio: 76 },
    { nombre: "Choriqueso", ingredientes: "Salchicha+Chorizo+Q.Asadero", precio: 76 },
    { nombre: "Champiqueso", ingredientes: "Salchicha+Champiñones+Q.Asadero", precio: 63 },
    { nombre: "Campechano", ingredientes: "Asadero+Jamón+Q.Amarillo", precio: 73 },
    { nombre: "Especial", ingredientes: "Salchicha+C.Frías", precio: 63 },
    { nombre: "Hawaiano", ingredientes: "Salchicha+Q.Asadero+Piña", precio: 76 },
    { nombre: "Hawaiano Especial", ingredientes: "Salchicha+Q.Asadero+Piña+C.Frías", precio: 89 },
    { nombre: "Doble", ingredientes: "Salchicha+Jamón+Q.Amarillo", precio: 60 },
    { nombre: "Descarnado", ingredientes: "Jamón+Pastel+Q.de Puerco+Mortadela+Salami", precio: 48 },
    { nombre: "de Pierna", ingredientes: "Salchicha de Pierna", precio: 48 }
  ],
  sincronizadas: [
    { nombre: "Sincronizada Sencilla", ingredientes: "T.Harina+Jamón+Q.Asadero+Q.Amarillo", precio: 51 },
    { nombre: "Sincronizada Especial", ingredientes: "T.Harina+Jamón+Q.Asadero+Q.Amarillo+Pierna", precio: 81 },
    { nombre: "Sincronizada Super", ingredientes: "T.Harina+Jamón+Q.Asadero+Q.Amarillo+Champiñones", precio: 64 },
    { nombre: "Sincronizada Matona", ingredientes: "T.Harina+Jamón+Q.Asadero+Q.Amarillo+Pierna+Salchicha Grosera", precio: 125 },
    { nombre: "Sincronizada Costeña", ingredientes: "T.Harina+Jamón+Q.Asadero+Q.Amarillo+Camarón+Pierna", precio: 125 }
  ],
  tortas: [
    { nombre: "Torta Sencilla", ingredientes: "Telera+Pierna", precio: 50 },
    { nombre: "Torta Especial", ingredientes: "Carnes Frías+Pierna", precio: 63 },
    { nombre: "Torta Asadera", ingredientes: "Pierna+Q.Asadero", precio: 63 },
    { nombre: "Torta Cubana", ingredientes: "Jamón+Q.Asadero+Salchicha+Pierna", precio: 101 },
    { nombre: "Burro Sencillo", ingredientes: "Carne de Pierna", precio: 50 },
    { nombre: "Burro Asadero", ingredientes: "Carne de Pierna+Q.Asadero", precio: 63 },
    { nombre: "Burro Especial", ingredientes: "Carne de Pierna+Carnes Frías", precio: 63 },
    { nombre: "Burro Costeño", ingredientes: "Carne de Pierna+Camarón+Q.Asadero", precio: 106 }
  ],
  bebidas: [
    { nombre: "Coca-Cola", precio: 30 },
    { nombre: "Sprite", precio: 30 },
    { nombre: "Fanta", precio: 30 },
    { nombre: "Fresca", precio: 30 },
    { nombre: "Agua de Jamaica", precio: 30 },
    { nombre: "Agua de Horchata", precio: 30 }
  ],
  ingredientesExtra: [
    { nombre: "Carne", precio: 34 },
    { nombre: "Carnes Frías", precio: 13 },
    { nombre: "Q. Asadero", precio: 13 },
    { nombre: "Salchicha para Asar", precio: 44 },
    { nombre: "Piña", precio: 13 },
    { nombre: "Champiñón", precio: 13 },
    { nombre: "Salchicha de Pavo", precio: 34 },
    { nombre: "Chuleta", precio: 34 },
    { nombre: "Camarón", precio: 46 },
    { nombre: "Tocino", precio: 15 },
    { nombre: "Carne de Pierna", precio: 34 },
    { nombre: "Chorizo", precio: 13 },
    { nombre: "Q. Amarillo", precio: 8 }
  ],
  verduras: ["Jitomate", "Cebolla", "Chile"],
  aderezos: ["Crema", "Mayonesa", "Catsup", "Mostaza"]
}

const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>George Burger - Menú Digital</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-900 text-white min-h-screen">
    <!-- Header -->
    <header class="bg-red-700 shadow-lg sticky top-0 z-50">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <div class="flex items-center">
                    <i class="fas fa-hamburger text-3xl text-yellow-400 mr-3"></i>
                    <h1 class="text-2xl font-bold text-yellow-400">George Burger</h1>
                </div>
                <div class="flex items-center">
                    <button id="cartBtn" class="relative bg-yellow-400 text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-yellow-300 transition">
                        <i class="fas fa-shopping-cart mr-2"></i>
                        <span id="cartCount">0</span>
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Tipo de Pedido -->
    <div class="container mx-auto px-4 py-6">
        <div class="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 class="text-xl font-bold mb-4 text-yellow-400">Tipo de Pedido</h2>
            <div class="grid grid-cols-2 gap-4">
                <button onclick="setOrderType('recoger')" id="btnRecoger" class="order-type-btn bg-gray-700 hover:bg-red-600 p-4 rounded-lg transition">
                    <i class="fas fa-store text-2xl mb-2"></i>
                    <p>Pasar a Recoger</p>
                </button>
                <button onclick="setOrderType('domicilio')" id="btnDomicilio" class="order-type-btn bg-gray-700 hover:bg-red-600 p-4 rounded-lg transition">
                    <i class="fas fa-motorcycle text-2xl mb-2"></i>
                    <p>A Domicilio</p>
                </button>
            </div>
        </div>

        <!-- Formulario de Domicilio -->
        <div id="deliveryForm" class="hidden bg-gray-800 rounded-lg p-6 mb-6">
            <h3 class="text-xl font-bold mb-4 text-yellow-400">Datos de Entrega</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block mb-2">Nombre:</label>
                    <input type="text" id="nombre" class="w-full p-2 rounded bg-gray-700 text-white">
                </div>
                <div>
                    <label class="block mb-2">Domicilio:</label>
                    <input type="text" id="domicilio" class="w-full p-2 rounded bg-gray-700 text-white">
                </div>
                <div>
                    <label class="block mb-2">Entre Calles:</label>
                    <input type="text" id="entreCalles" class="w-full p-2 rounded bg-gray-700 text-white">
                </div>
                <div>
                    <label class="block mb-2">Colonia:</label>
                    <input type="text" id="colonia" class="w-full p-2 rounded bg-gray-700 text-white">
                </div>
                <div>
                    <label class="block mb-2">Zona de Entrega:</label>
                    <select id="zonaEntrega" class="w-full p-2 rounded bg-gray-700 text-white" onchange="updateDeliveryCost()">
                        <option value="0">Seleccionar zona...</option>
                        <option value="40">Zona Cercana (+$40)</option>
                        <option value="80">Zona Alejada (+$80)</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Categorías del Menú -->
        <div class="bg-gray-800 rounded-lg p-6">
            <h2 class="text-2xl font-bold mb-6 text-yellow-400 text-center">Nuestro Menú</h2>
            
            <!-- Tabs de Categorías -->
            <div class="flex flex-wrap justify-center gap-2 mb-6">
                <button onclick="showCategory('hamburguesas')" class="category-tab bg-red-600 px-4 py-2 rounded-lg hover:bg-red-500 transition">
                    <i class="fas fa-hamburger mr-2"></i>Hamburguesas
                </button>
                <button onclick="showCategory('hotdogs')" class="category-tab bg-gray-700 px-4 py-2 rounded-lg hover:bg-red-600 transition">
                    <i class="fas fa-hotdog mr-2"></i>Hot Dogs
                </button>
                <button onclick="showCategory('sincronizadas')" class="category-tab bg-gray-700 px-4 py-2 rounded-lg hover:bg-red-600 transition">
                    <i class="fas fa-cheese mr-2"></i>Sincronizadas
                </button>
                <button onclick="showCategory('tortas')" class="category-tab bg-gray-700 px-4 py-2 rounded-lg hover:bg-red-600 transition">
                    <i class="fas fa-bread-slice mr-2"></i>Tortas y Burros
                </button>
                <button onclick="showCategory('bebidas')" class="category-tab bg-gray-700 px-4 py-2 rounded-lg hover:bg-red-600 transition">
                    <i class="fas fa-glass-water mr-2"></i>Bebidas
                </button>
            </div>

            <!-- Contenido del Menú -->
            <div id="menuContent" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- El contenido se cargará dinámicamente -->
            </div>
        </div>
    </div>

    <!-- Modal del Carrito -->
    <div id="cartModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-gray-800 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto p-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-yellow-400">Tu Pedido</h2>
                <button onclick="closeCart()" class="text-gray-400 hover:text-white">
                    <i class="fas fa-times text-2xl"></i>
                </button>
            </div>
            <div id="cartItems" class="mb-4">
                <!-- Items del carrito -->
            </div>
            <div class="border-t border-gray-700 pt-4">
                <div class="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span id="subtotal">$0</span>
                </div>
                <div id="deliveryCostDisplay" class="flex justify-between mb-2 hidden">
                    <span>Envío:</span>
                    <span id="deliveryCostAmount">$0</span>
                </div>
                <div class="flex justify-between text-xl font-bold text-yellow-400">
                    <span>Total:</span>
                    <span id="total">$0</span>
                </div>
                <button onclick="sendWhatsApp()" class="w-full bg-green-600 text-white py-3 rounded-lg font-bold mt-4 hover:bg-green-700 transition">
                    <i class="fab fa-whatsapp mr-2"></i>Enviar Pedido por WhatsApp
                </button>
            </div>
        </div>
    </div>

    <!-- Modal para agregar producto -->
    <div id="productModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 class="text-xl font-bold text-yellow-400 mb-4" id="productModalTitle"></h3>
            <p class="text-gray-300 mb-4" id="productModalIngredients"></p>
            
            <!-- Ingredientes Extra -->
            <div class="mb-4">
                <h4 class="font-bold mb-2">Ingredientes Extra (opcional):</h4>
                <div class="max-h-40 overflow-y-auto" id="extraIngredients">
                    <!-- Se llenará dinámicamente -->
                </div>
            </div>

            <!-- Verduras -->
            <div class="mb-4">
                <h4 class="font-bold mb-2">Verduras:</h4>
                <div class="flex flex-wrap gap-2" id="vegetables">
                    <!-- Se llenará dinámicamente -->
                </div>
            </div>

            <!-- Aderezos -->
            <div class="mb-4">
                <h4 class="font-bold mb-2">Aderezos:</h4>
                <div class="flex flex-wrap gap-2" id="dressings">
                    <!-- Se llenará dinámicamente -->
                </div>
            </div>

            <!-- Cantidad -->
            <div class="mb-4">
                <label class="block mb-2">Cantidad:</label>
                <div class="flex items-center gap-4">
                    <button onclick="changeQuantity(-1)" class="bg-red-600 text-white w-10 h-10 rounded-lg hover:bg-red-500">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" id="quantity" value="1" min="1" class="w-16 text-center bg-gray-700 text-white rounded p-2">
                    <button onclick="changeQuantity(1)" class="bg-green-600 text-white w-10 h-10 rounded-lg hover:bg-green-500">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>

            <div class="flex justify-between items-center mb-4">
                <span class="text-lg">Precio Total:</span>
                <span class="text-2xl font-bold text-yellow-400" id="productModalPrice"></span>
            </div>

            <div class="flex gap-4">
                <button onclick="closeProductModal()" class="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600">
                    Cancelar
                </button>
                <button onclick="addToCart()" class="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-500">
                    Agregar al Carrito
                </button>
            </div>
        </div>
    </div>

    <script src="/static/app.js"></script>
</body>
</html>
`

export default app