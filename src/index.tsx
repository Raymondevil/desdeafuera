import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { cajaHtmlContent } from './caja.html.tsx'
import { inventarioHtmlContent } from './inventario.html.tsx'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

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

// Middleware de autenticación simple
const AUTH_TOKEN = 'george2024admin';

const checkAuth = async (c: any, next: any) => {
  const token = c.req.query('token');
  if (token === AUTH_TOKEN) {
    // Guardar en cookie por 24 horas
    c.header('Set-Cookie', `auth_token=${AUTH_TOKEN}; Path=/; Max-Age=86400; HttpOnly; SameSite=Strict`);
    await next();
  } else {
    // Verificar cookie
    const cookies = c.req.header('Cookie') || '';
    if (cookies.includes(`auth_token=${AUTH_TOKEN}`)) {
      await next();
    } else {
      return c.html(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Acceso Restringido - George Burger</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-black min-h-screen flex items-center justify-center p-4">
            <div class="rounded-lg p-8 max-w-md w-full text-center" style="background-color: #FFCC00;">
                <i class="fas fa-lock text-6xl mb-4" style="color: #FF0000;"></i>
                <h1 class="text-2xl font-black mb-4" style="color: #FF0000;">Acceso Restringido</h1>
                <p class="font-bold text-black mb-6">Esta página requiere autenticación.</p>
                <a href="/" class="inline-block px-6 py-3 rounded-lg font-bold text-white transition hover:opacity-90" style="background-color: #FF0000;">
                    <i class="fas fa-home mr-2"></i>Volver al Menú
                </a>
            </div>
            <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        </body>
        </html>
      `);
    }
  }
};

// Caja route (protegida)
app.get('/caja', checkAuth, (c) => {
  return c.html(cajaHtmlContent)
})

// Inventario route (protegida)
app.get('/inventario', checkAuth, (c) => {
  return c.html(inventarioHtmlContent)
})

// API Inventario - Obtener productos
app.get('/api/inventario/productos', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM productos_inventario ORDER BY nombre'
    ).all();
    return c.json(results);
  } catch (error) {
    return c.json({ error: 'Error al obtener productos' }, 500);
  }
})

// API Inventario - Obtener inventario del día
app.get('/api/inventario/dia/:fecha', async (c) => {
  try {
    const fecha = c.req.param('fecha');
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM inventario_diario WHERE fecha = ?'
    ).bind(fecha).all();
    return c.json(results);
  } catch (error) {
    return c.json({ error: 'Error al obtener inventario' }, 500);
  }
})

// API Inventario - Guardar inventario
app.post('/api/inventario/guardar', async (c) => {
  try {
    const { inventario } = await c.req.json();
    
    // Preparar statements
    const stmt = c.env.DB.prepare(`
      INSERT OR REPLACE INTO inventario_diario 
      (producto_id, fecha, cantidad_inicial, cantidad_final, precio_unitario)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    // Ejecutar en batch
    const batch = inventario.map((item: any) => 
      stmt.bind(item.producto_id, item.fecha, item.cantidad_inicial, item.cantidad_final, item.precio_unitario)
    );
    
    await c.env.DB.batch(batch);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error al guardar inventario:', error);
    return c.json({ error: 'Error al guardar inventario' }, 500);
  }
})

// API Inventario - Obtener historial
app.get('/api/inventario/historial', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT 
        fecha,
        SUM((cantidad_inicial - cantidad_final) * precio_unitario) as total
      FROM inventario_diario
      GROUP BY fecha
      ORDER BY fecha DESC
      LIMIT 30
    `).all();
    return c.json(results);
  } catch (error) {
    return c.json({ error: 'Error al obtener historial' }, 500);
  }
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
    { nombre: "Asadero", ingredientes: "Salchicha+Q.Asadero", precio: 63 },
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
    { nombre: "Torta Cubana", ingredientes: "Jamón+Q.Asadero+Salchicha+Pierna", precio: 101 }
  ],
  burros: [
    { nombre: "Burro Sencillo", ingredientes: "Carne de Pierna", precio: 50 },
    { nombre: "Burro Asadero", ingredientes: "Carne de Pierna+Q.Asadero", precio: 63 },
    { nombre: "Burro Especial", ingredientes: "Carne de Pierna+Carnes Frías", precio: 63 },
    { nombre: "Burro Costeño", ingredientes: "Carne de Pierna+Camarón+Q.Asadero", precio: 106 }
  ],
  papas: [
    { nombre: "Papas a la Francesa Chicas", ingredientes: "Papas fritas doradas", precio: 45 },
    { nombre: "Papas a la Francesa Grandes", ingredientes: "Papas fritas doradas", precio: 50 }
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
<body class="bg-black text-gray-900 min-h-screen">
    <!-- Header -->
    <header class="shadow-lg sticky top-0 z-50" style="background-color: #FF0000;">
        <div class="container mx-auto px-4 py-6">
            <div class="flex justify-between items-center">
                <div class="flex items-center">
                    <i class="fas fa-hamburger text-3xl mr-3" style="color: #FFCC00;"></i>
                    <div>
                        <h1 class="text-3xl font-black text-white">Hamburguesas y Dogos "George"</h1>
                        <p class="text-white text-sm font-semibold">Sincronizadas - Burritos - Dogos - Hamburguesas - Tortas</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button id="cartBtn" class="relative px-4 py-2 rounded-lg font-bold transition" style="background-color: #FFCC00; color: #FF0000;">
                        <i class="fas fa-shopping-cart mr-2"></i>
                        <span id="cartCount">0</span>
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Tipo de Pedido -->
    <div class="container mx-auto px-4 py-6">
        <div class="rounded-lg p-6 mb-6" style="background-color: #FFCC00;">
            <h2 class="text-xl font-bold mb-4" style="color: #FF0000;">Tipo de Pedido</h2>
            <div class="grid grid-cols-2 gap-4">
                <button onclick="setOrderType('recoger')" id="btnRecoger" class="order-type-btn bg-white p-4 rounded-lg transition border-4 border-transparent hover:border-red-600">
                    <i class="fas fa-store text-2xl mb-2" style="color: #FF0000;"></i>
                    <p class="font-bold text-black">Pasar a Recoger</p>
                </button>
                <button onclick="setOrderType('domicilio')" id="btnDomicilio" class="order-type-btn bg-white p-4 rounded-lg transition border-4 border-transparent hover:border-red-600">
                    <i class="fas fa-motorcycle text-2xl mb-2" style="color: #FF0000;"></i>
                    <p class="font-bold text-black">A Domicilio</p>
                </button>
            </div>
        </div>

        <!-- Formulario para Recoger -->
        <div id="pickupForm" class="hidden rounded-lg p-6 mb-6" style="background-color: #FFCC00;">
            <h3 class="text-xl font-bold mb-4" style="color: #FF0000;">Datos para Recoger</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block mb-2 font-bold text-black">Nombre: <span style="color: #FF0000;">*</span></label>
                    <input type="text" id="nombreRecoger" class="w-full p-2 rounded bg-white text-black border-2 border-gray-300" required>
                </div>
            </div>
        </div>

        <!-- Formulario de Domicilio -->
        <div id="deliveryForm" class="hidden rounded-lg p-6 mb-6" style="background-color: #FFCC00;">
            <h3 class="text-xl font-bold mb-4" style="color: #FF0000;">Datos de Entrega</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block mb-2 font-bold text-black">Nombre:</label>
                    <input type="text" id="nombre" class="w-full p-2 rounded bg-white text-black border-2 border-gray-300">
                </div>
                <div>
                    <label class="block mb-2 font-bold text-black">Domicilio:</label>
                    <input type="text" id="domicilio" class="w-full p-2 rounded bg-white text-black border-2 border-gray-300">
                </div>
                <div>
                    <label class="block mb-2 font-bold text-black">Entre Calles:</label>
                    <input type="text" id="entreCalles" class="w-full p-2 rounded bg-white text-black border-2 border-gray-300">
                </div>
                <div>
                    <label class="block mb-2 font-bold text-black">Colonia:</label>
                    <input type="text" id="colonia" class="w-full p-2 rounded bg-white text-black border-2 border-gray-300">
                </div>
                <div>
                    <label class="block mb-2 font-bold text-black">Zona de Entrega:</label>
                    <select id="zonaEntrega" class="w-full p-2 rounded bg-white text-black border-2 border-gray-300" onchange="updateDeliveryCost()">
                        <option value="0">Seleccionar zona...</option>
                        <option value="40">Zona Cercana (+$40)</option>
                        <option value="80">Zona Alejada (+$80)</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Categorías del Menú -->
        <div class="rounded-lg p-6" style="background-color: #FFCC00;">
            <h2 class="text-3xl font-black mb-6 text-center" style="color: #FF0000;">Nuestro Menú</h2>
            
            <!-- Barra de búsqueda -->
            <div class="mb-6 max-w-2xl mx-auto">
                <div class="relative">
                    <i class="fas fa-search absolute left-3 top-3" style="color: #FF0000;"></i>
                    <input 
                        type="text" 
                        id="searchInput" 
                        placeholder="Buscar por nombre de producto..." 
                        class="w-full pl-10 pr-4 py-3 bg-white text-black rounded-lg border-2 focus:outline-none focus:ring-2" 
                        style="border-color: #FF0000;"
                        onkeyup="searchProducts()"
                    >
                    <button 
                        id="clearSearchBtn" 
                        onclick="clearSearch()" 
                        class="hidden absolute right-3 top-3 hover:opacity-75"
                        style="color: #FF0000;"
                    >
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div id="searchResults" class="mt-2 text-sm font-bold text-black"></div>
            </div>
            
            <!-- Tabs de Categorías -->
            <div id="categoryTabs" class="flex flex-wrap justify-center gap-2 mb-6">
                <button onclick="showCategory('hamburguesas')" class="category-tab bg-white px-4 py-2 rounded-lg font-bold transition border-4" style="color: #FF0000; border-color: #FF0000;">
                    <i class="fas fa-hamburger mr-2"></i>Hamburguesas
                </button>
                <button onclick="showCategory('hotdogs')" class="category-tab bg-white px-4 py-2 rounded-lg font-bold transition border-4 border-transparent hover:border-red-600" style="color: #000;">
                    <i class="fas fa-hotdog mr-2"></i>Hot Dogs
                </button>
                <button onclick="showCategory('sincronizadas')" class="category-tab bg-white px-4 py-2 rounded-lg font-bold transition border-4 border-transparent hover:border-red-600" style="color: #000;">
                    <i class="fas fa-cheese mr-2"></i>Sincronizadas
                </button>
                <button onclick="showCategory('tortas')" class="category-tab bg-white px-4 py-2 rounded-lg font-bold transition border-4 border-transparent hover:border-red-600" style="color: #000;">
                    <i class="fas fa-bread-slice mr-2"></i>Tortas
                </button>
                <button onclick="showCategory('burros')" class="category-tab bg-white px-4 py-2 rounded-lg font-bold transition border-4 border-transparent hover:border-red-600" style="color: #000;">
                    <i class="fas fa-wrap mr-2"></i>Burros
                </button>
                <button onclick="showCategory('papas')" class="category-tab bg-white px-4 py-2 rounded-lg font-bold transition border-4 border-transparent hover:border-red-600" style="color: #000;">
                    <i class="fas fa-french-fries mr-2"></i>Papas
                </button>
                <button onclick="showCategory('bebidas')" class="category-tab bg-white px-4 py-2 rounded-lg font-bold transition border-4 border-transparent hover:border-red-600" style="color: #000;">
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
        <div class="rounded-lg max-w-md w-full p-6" style="background-color: #FFCC00;">
            <h3 class="text-xl font-black mb-4" style="color: #FF0000;" id="productModalTitle"></h3>
            <p class="text-black font-bold mb-4" id="productModalIngredients"></p>
            
            <!-- Ingredientes Extra -->
            <div class="mb-4">
                <h4 class="font-bold mb-2 text-black">Ingredientes Extra (opcional):</h4>
                <div class="max-h-40 overflow-y-auto" id="extraIngredients">
                    <!-- Se llenará dinámicamente -->
                </div>
            </div>

            <!-- Verduras -->
            <div class="mb-4">
                <h4 class="font-bold mb-2 text-black">Verduras:</h4>
                <div class="flex flex-wrap gap-2" id="vegetables">
                    <!-- Se llenará dinámicamente -->
                </div>
            </div>

            <!-- Aderezos -->
            <div class="mb-4">
                <h4 class="font-bold mb-2 text-black">Aderezos:</h4>
                <div class="flex flex-wrap gap-2" id="dressings">
                    <!-- Se llenará dinámicamente -->
                </div>
            </div>

            <!-- Cantidad -->
            <div class="mb-4">
                <label class="block mb-2 font-bold text-black">Cantidad:</label>
                <div class="flex items-center gap-4">
                    <button onclick="changeQuantity(-1)" class="text-white w-10 h-10 rounded-lg font-bold transition hover:opacity-90" style="background-color: #FF0000;">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" id="quantity" value="1" min="1" class="w-16 text-center bg-white text-black font-bold rounded p-2 border-2" style="border-color: #FF0000;">
                    <button onclick="changeQuantity(1)" class="text-white w-10 h-10 rounded-lg font-bold transition hover:opacity-90" style="background-color: #FF0000;">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>

            <div class="flex justify-between items-center mb-4">
                <span class="text-lg font-bold text-black">Precio Total:</span>
                <span class="text-2xl font-black" style="color: #FF0000;" id="productModalPrice"></span>
            </div>

            <div class="flex gap-4">
                <button onclick="closeProductModal()" class="flex-1 bg-white py-2 rounded-lg font-bold transition hover:opacity-90" style="color: #FF0000;">
                    Cancelar
                </button>
                <button onclick="addToCart()" class="flex-1 text-white py-2 rounded-lg font-bold transition hover:opacity-90" style="background-color: #FF0000;">
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