import {Hono} from 'hono'
import {cors} from 'hono/cors'
import {serveStatic} from 'hono/cloudflare-workers'
import {cajaHtmlContent} from './caja.html.tsx'
import {inventarioHtmlContent} from './inventario.html.tsx'

type Bindings = {
	DB: D1Database;
}

const app = new Hono<{Bindings: Bindings}>()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({root: './public'}))

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

// Cobro route (protegida)
app.get('/cobro', checkAuth, (c) => {
	return c.html(cajaHtmlContent)
})

// Redirect /caja to /cobro for backwards compatibility
app.get('/caja', (c) => {
	const token = c.req.query('token');
	return c.redirect(token ? `/cobro?token=${token}` : '/cobro');
})

// Inventario route (protegida)
app.get('/inventario', checkAuth, (c) => {
	return c.html(inventarioHtmlContent)
})

// API Inventario - Obtener productos
app.get('/api/inventario/productos', async (c) => {
	try {
		const {results} = await c.env.DB.prepare(
			'SELECT * FROM productos_inventario ORDER BY nombre'
		).all();
		return c.json(results);
	} catch (error) {
		return c.json({error: 'Error al obtener productos'}, 500);
	}
})

// API Inventario - Obtener inventario del día
app.get('/api/inventario/dia/:fecha', async (c) => {
	try {
		const fecha = c.req.param('fecha');
		const {results} = await c.env.DB.prepare(
			'SELECT * FROM inventario_diario WHERE fecha = ?'
		).bind(fecha).all();
		return c.json(results);
	} catch (error) {
		return c.json({error: 'Error al obtener inventario'}, 500);
	}
})

// API Inventario - Guardar inventario
app.post('/api/inventario/guardar', async (c) => {
	try {
		const {inventario} = await c.req.json();

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

		return c.json({success: true});
	} catch (error) {
		console.error('Error al guardar inventario:', error);
		return c.json({error: 'Error al guardar inventario'}, 500);
	}
})

// API Inventario - Obtener historial
app.get('/api/inventario/historial', async (c) => {
	try {
		const {results} = await c.env.DB.prepare(`
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
		return c.json({error: 'Error al obtener historial'}, 500);
	}
})

// API Ratings - Obtener estadísticas de un producto
app.get('/api/ratings/:categoria/:producto', async (c) => {
	try {
		const categoria = c.req.param('categoria');
		const producto = c.req.param('producto');
		const {results} = await c.env.DB.prepare(`
      SELECT * FROM producto_stats 
      WHERE producto_nombre = ? AND categoria = ?
    `).bind(producto, categoria).all();
		return c.json(results[0] || {total_ratings: 0, rating_promedio: 0});
	} catch (error) {
		return c.json({error: 'Error al obtener ratings'}, 500);
	}
})

// API Ratings - Obtener todos los ratings
app.get('/api/ratings/all', async (c) => {
	try {
		const {results} = await c.env.DB.prepare(`
      SELECT * FROM producto_stats 
      ORDER BY rating_promedio DESC, total_ratings DESC
    `).all();
		return c.json(results);
	} catch (error) {
		return c.json({error: 'Error al obtener ratings'}, 500);
	}
})

// API Ratings - Agregar rating
app.post('/api/ratings', async (c) => {
	try {
		const {producto_nombre, categoria, rating, comentario, nombre_cliente} = await c.req.json();

		await c.env.DB.prepare(`
      INSERT OR REPLACE INTO producto_ratings 
      (producto_nombre, categoria, rating, comentario, nombre_cliente)
      VALUES (?, ?, ?, ?, ?)
    `).bind(producto_nombre, categoria, rating, comentario || null, nombre_cliente || 'Anónimo').run();

		return c.json({success: true});
	} catch (error) {
		console.error('Error al guardar rating:', error);
		return c.json({error: 'Error al guardar rating'}, 500);
	}
})

// API Ratings - Obtener reviews de un producto
app.get('/api/reviews/:categoria/:producto', async (c) => {
	try {
		const categoria = c.req.param('categoria');
		const producto = c.req.param('producto');
		const {results} = await c.env.DB.prepare(`
      SELECT rating, comentario, nombre_cliente, fecha
      FROM producto_ratings 
      WHERE producto_nombre = ? AND categoria = ?
      ORDER BY fecha DESC
      LIMIT 50
    `).bind(producto, categoria).all();
		return c.json(results);
	} catch (error) {
		return c.json({error: 'Error al obtener reviews'}, 500);
	}
})

// Menu data
const menuData = {
	hamburguesas: [
		{nombre: "Asadera", ingredientes: "Carne+Q.Asadero", precio: 67},
		{nombre: "Especial", ingredientes: "Carne+Carnes Frías", precio: 67},
		{nombre: "Doble", ingredientes: "Carne+Jamón+Q.Amarillo", precio: 64},
		{nombre: "Champiqueso", ingredientes: "Carne+Champiñón+Q.Asadero", precio: 82},
		{nombre: "Petra", ingredientes: "Carne+Q.Asadero+Tocino", precio: 84},
		{nombre: "Campechana", ingredientes: "Asadera+Jamón+Q.Amarillo", precio: 79},
		{nombre: "Ejecutiva", ingredientes: "Carne+Carnes Frías+Salchicha", precio: 101},
		{nombre: "Española", ingredientes: "Carne+Q.Asadero+Salchicha", precio: 101},
		{nombre: "Embajadora", ingredientes: "Carne+Carnes Frías+Q.Asadero+Salchicha", precio: 116},
		{nombre: "Americana", ingredientes: "Doble Carne+Doble Q.Amarillo", precio: 112},
		{nombre: "Choriqueso", ingredientes: "Chorizo+Q.Asadero", precio: 52},
		{nombre: "Ranchera", ingredientes: "Carne+Chorizo+Q.Asadero", precio: 82},
		{nombre: "Hawaiana", ingredientes: "Carne+Piña+Q.Asadero", precio: 82},
		{nombre: "Hawaiana Especial", ingredientes: "Carne+Piña+Q.Asadero+Carnes Frías", precio: 97},
		{nombre: "Especial Asadera", ingredientes: "Carne+Q.Asadero+Carnes Frías", precio: 82},
		{nombre: "Ahumada", ingredientes: "Chuleta", precio: 52},
		{nombre: "Ahumada Especial", ingredientes: "Chuleta+Carnes Frías", precio: 67},
		{nombre: "Mexicana", ingredientes: "Chuleta+Carne", precio: 88},
		{nombre: "Norteña", ingredientes: "Carne+Chuleta+Q.Asadero", precio: 103},
		{nombre: "Italiana", ingredientes: "Chuleta+Q.Asadero", precio: 67},
		{nombre: "Extravagante", ingredientes: "Carne+Chuleta+Q.Asadero+Carnes Frías", precio: 118},
		{nombre: "Descarnada", ingredientes: "Carnes Frías+Q.Amarillo", precio: 52},
		{nombre: "Descarnada Asadero", ingredientes: "Carnes Frías+Q.Amarillo+Q.Asadero", precio: 65},
		{nombre: "Sencilla", ingredientes: "Carne de Res", precio: 52},
		{nombre: "Big Sencilla", ingredientes: "2 Carnes de Res", precio: 88},
		{nombre: "Costeña", ingredientes: "Camarón+Q.Asadero+Tocino+Ch.Morrón+Sal.Inglesa", precio: 102},
		{nombre: "Super Costeña", ingredientes: "Camarón+Q.Asadero+Carne de Res+Tocino+Ch.Morrón", precio: 138},
		{nombre: "La Popotiña", ingredientes: "Carne de Pierna+Tocino+Chile Morrón+Q.Asadero", precio: 88},
		{nombre: "Grosera", ingredientes: "Salchicha para Asar+Q.Asadero+Tocino", precio: 62},
		{nombre: "Super Grosera", ingredientes: "Salchicha para Asar+Q.Asadero+Tocino+Carne de Res", precio: 98}
	],
	hotdogs: [
		{nombre: "Dogo de Pavo", ingredientes: "Salchicha de Pavo", precio: 52},
		{nombre: "Grosero", ingredientes: "Salchicha para Asar+Q.Asadero+Tocino Rebanado", precio: 62},
		{nombre: "Asadero", ingredientes: "Salchicha+Q.Asadero", precio: 67},
		{nombre: "Big Grosero", ingredientes: "Grosero+Carnes Frías", precio: 82},
		{nombre: "Choriqueso", ingredientes: "Salchicha+Chorizo+Q.Asadero", precio: 82},
		{nombre: "Champiqueso", ingredientes: "Salchicha+Champiñones+Q.Asadero", precio: 82},
		{nombre: "Campechano", ingredientes: "Asadero+Jamón+Q.Amarillo", precio: 79},
		{nombre: "Especial", ingredientes: "Salchicha+C.Frías", precio: 67},
		{nombre: "Hawaiano", ingredientes: "Salchicha+Q.Asadero+Piña", precio: 82},
		{nombre: "Hawaiano Especial", ingredientes: "Salchicha+Q.Asadero+Piña+C.Frías", precio: 97},
		{nombre: "Doble", ingredientes: "Salchicha+Jamón+Q.Amarillo", precio: 64},
		{nombre: "Descarnado", ingredientes: "Jamón+Pastel+Q.de Puerco+Mortadela+Salami", precio: 50},
		{nombre: "de Pierna", ingredientes: "Salchicha de Pierna", precio: 50}
	],
	sincronizadas: [
		{nombre: "Sincronizada Sencilla", ingredientes: "T.Harina+Jamón+Q.Asadero+Q.Amarillo", precio: 53},
		{nombre: "Sincronizada Especial", ingredientes: "T.Harina+Jamón+Q.Asadero+Q.Amarillo+Pierna", precio: 85},
		{nombre: "Sincronizada Super", ingredientes: "T.Harina+Jamón+Q.Asadero+Q.Amarillo+Champiñones", precio: 68},
		{nombre: "Sincronizada Matona", ingredientes: "T.Harina+Jamón+Q.Asadero+Q.Amarillo+Pierna+Salchicha Grosera", precio: 131},
		{nombre: "Sincronizada Costeña", ingredientes: "T.Harina+Jamón+Q.Asadero+Q.Amarillo+Camarón+Pierna", precio: 131}
	],
	tortas: [
		{nombre: "Torta Sencilla", ingredientes: "Telera+Pierna", precio: 52},
		{nombre: "Torta Especial", ingredientes: "Carnes Frías+Pierna", precio: 67},
		{nombre: "Torta Asadera", ingredientes: "Pierna+Q.Asadero", precio: 67},
		{nombre: "Torta Cubana", ingredientes: "Jamón+Q.Asadero+Salchicha+Pierna", precio: 109}
	],
	burros: [
		{nombre: "Burro Sencillo", ingredientes: "Carne de Pierna", precio: 52},
		{nombre: "Burro Asadero", ingredientes: "Carne de Pierna+Q.Asadero", precio: 67},
		{nombre: "Burro Especial", ingredientes: "Carne de Pierna+Carnes Frías", precio: 67},
		{nombre: "Burro Costeño", ingredientes: "Carne de Pierna+Camarón+Q.Asadero", precio: 112}
	],
	papas: [
		{nombre: "Papas a la Francesa Chicas", ingredientes: "Papas fritas doradas", precio: 45},
		{nombre: "Papas a la Francesa Grandes", ingredientes: "Papas fritas doradas", precio: 50}
	],
	bebidas: [
		{nombre: "Coca-Cola", precio: 30}
    {nombre: "Sprite", precio: 30}
    {nombre: "Fanta", precio: 30}
    {nombre: "Fresca", precio: 30}
    {nombre: "Agua de Jamaica", precio: 30}
    {nombre: "Agua de Horchata", precio: 30}
	],
	ingredientesExtra: [
		{nombre: "Carne", precio: 34}
    {nombre: "Carnes Frías", precio: 13}
    {nombre: "Q. Asadero", precio: 13}
    {nombre: "Salchicha para Asar", precio: 44}
    {nombre: "Piña", precio: 13}
    {nombre: "Champiñón", precio: 13}
    {nombre: "Salchicha de Pavo", precio: 34}
    {nombre: "Chuleta", precio: 34}
    {nombre: "Camarón", precio: 46}
    {nombre: "Tocino", precio: 15}
    {nombre: "Carne de Pierna", precio: 34}
    {nombre: "Chorizo", precio: 13}
    {nombre: "Q. Amarillo", precio: 8}
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
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background: #efefef;
            font-family: system-ui, -apple-system, sans-serif;
        }
        
        .product-card {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            cursor: pointer;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        
        .product-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }
        
        .product-image {
            width: 100%;
            height: 200px;
            background: linear-gradient(135deg, #FF0000 0%, #FFCC00 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 64px;
            color: white;
        }
        
        .product-body {
            padding: 20px;
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .product-name {
            font-size: 20px;
            font-weight: 800;
            color: #000;
            margin-bottom: 8px;
        }
        
        .product-ingredients {
            font-size: 13px;
            color: #666;
            line-height: 1.4;
            margin-bottom: 16px;
            flex: 1;
        }
        
        .product-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 12px;
            border-top: 2px solid #efefef;
        }
        
        .product-price {
            font-size: 24px;
            font-weight: 900;
            color: #FF0000;
        }
        
        .add-button {
            background: #FF0000;
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: 700;
            font-size: 14px;
            transition: all 0.3s;
            border: none;
            cursor: pointer;
        }
        
        .add-button:hover {
            background: #cc0000;
            transform: scale(1.05);
        }
        
        .category-nav {
            display: flex;
            gap: 8px;
            overflow-x: auto;
            padding: 20px 0;
            scrollbar-width: none;
        }
        
        .category-nav::-webkit-scrollbar {
            display: none;
        }
        
        .category-button {
            flex-shrink: 0;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: 700;
            font-size: 15px;
            transition: all 0.3s;
            border: 3px solid transparent;
            background: white;
            color: #000;
            white-space: nowrap;
        }
        
        .category-button:hover {
            border-color: #FF0000;
        }
        
        .category-button.active {
            background: #FF0000;
            color: white;
            border-color: #FF0000;
        }
        
        .search-bar {
            background: white;
            border-radius: 30px;
            padding: 16px 24px;
            display: flex;
            align-items: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            margin-bottom: 20px;
        }
        
        .search-bar input {
            flex: 1;
            border: none;
            outline: none;
            font-size: 16px;
            margin-left: 12px;
        }
        
        .cart-badge {
            position: absolute;
            top: -8px;
            right: -8px;
            background: #FF0000;
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
        }
        
        .favorite-btn {
            position: absolute;
            top: 12px;
            right: 12px;
            background: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            cursor: pointer;
            transition: all 0.3s;
            z-index: 10;
        }
        
        .favorite-btn:hover {
            transform: scale(1.1);
        }
        
        .favorite-btn.active {
            background: #FF0000;
            color: white;
        }
        
        .rating-stars {
            display: flex;
            gap: 4px;
            align-items: center;
        }
        
        .star {
            color: #ddd;
            font-size: 16px;
            transition: all 0.2s;
        }
        
        .star.filled {
            color: #FFCC00;
        }
        
        .star.clickable {
            cursor: pointer;
        }
        
        .star.clickable:hover {
            transform: scale(1.2);
        }
        
        .product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .product-badge {
            position: absolute;
            top: 12px;
            left: 12px;
            background: #FFCC00;
            color: #FF0000;
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: 800;
            font-size: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        .floating-cart {
            position: fixed;
            top: 80px;
            left: 20px;
            background: #FF0000;
            color: white;
            padding: 16px 24px;
            border-radius: 50px;
            box-shadow: 0 8px 24px rgba(255, 0, 0, 0.4);
            cursor: pointer;
            z-index: 999;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 800;
        }
        
        .floating-cart:hover {
            transform: scale(1.05);
            box-shadow: 0 12px 32px rgba(255, 0, 0, 0.5);
        }
        
        .floating-cart.hidden {
            opacity: 0;
            pointer-events: none;
            transform: translateX(-200px);
        }
        
        .floating-cart-count {
            background: #FFCC00;
            color: #FF0000;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 900;
        }
        
        /* Estilos del Carousel */
        .carousel-item {
            height: 500px;
        }
        
        .carousel-item img {
            height: 100%;
            width: 100%;
            object-fit: cover;
            filter: brightness(0.7);
        }
        
        .carousel-caption {
            bottom: 40px;
        }
        
        .carousel-caption h2 {
            font-size: 3.5rem;
            font-weight: 900;
            text-shadow: 3px 3px 6px rgba(0,0,0,0.8);
            color: #FFCC00;
        }
        
        .carousel-caption p {
            font-size: 1.5rem;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }
        
        .order-type-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10;
            background: rgba(0, 0, 0, 0.75);
            padding: 30px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        
        .order-type-overlay button {
            margin: 10px;
            padding: 20px 40px;
            font-size: 1.2rem;
            font-weight: 800;
            border: 3px solid #FFCC00;
            background: #FF0000;
            color: white;
            border-radius: 50px;
            transition: all 0.3s ease;
        }
        
        .order-type-overlay button:hover {
            background: #FFCC00;
            color: #FF0000;
            transform: scale(1.05);
        }
        
        @media (max-width: 768px) {
            .carousel-item {
                height: 400px;
            }
            
            .carousel-caption h2 {
                font-size: 2rem;
            }
            
            .carousel-caption p {
                font-size: 1rem;
            }
            
            .order-type-overlay {
                padding: 20px;
            }
            
            .order-type-overlay button {
                padding: 15px 30px;
                font-size: 1rem;
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="sticky top-0 z-50 shadow-lg" style="background-color: #FF0000;">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <i class="fas fa-hamburger text-4xl" style="color: #FFCC00;"></i>
                    <div>
                        <h1 class="text-2xl md:text-3xl font-black text-white">George Burger</h1>
                        <p class="text-white text-xs md:text-sm font-semibold hidden md:block">Hamburguesas · Hot Dogs · Sincronizadas · Tortas · Burros</p>
                    </div>
                </div>
                <div class="flex gap-2 items-center">
                    <button id="favoritesBtn" class="relative px-4 py-3 rounded-full font-bold transition hover:opacity-90 hidden md:block" style="background-color: #FFCC00; color: #FF0000;">
                        <i class="fas fa-heart text-xl"></i>
                        <span id="favoritesCount" class="cart-badge">0</span>
                    </button>
                    <button id="cartBtn" class="relative px-4 md:px-6 py-3 rounded-full font-bold transition hover:opacity-90" style="background-color: #FFCC00; color: #FF0000;">
                        <i class="fas fa-shopping-cart text-xl"></i>
                        <span id="cartCount" class="cart-badge">0</span>
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Carousel de Productos -->
    <div id="productCarousel" class="carousel slide" data-bs-ride="carousel">
        <!-- Botones de selección de tipo de pedido superpuestos -->
        <div class="order-type-overlay">
            <h3 class="text-center mb-4" style="color: #FFCC00; font-size: 2rem; font-weight: 900; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">¿Cómo deseas tu pedido?</h3>
            <div class="d-flex flex-column flex-md-row gap-3">
                <button onclick="setOrderType('recoger')" id="btnRecogerCarousel" class="order-type-btn-carousel">
                    <i class="fas fa-store me-2"></i>Pasar a Recoger
                </button>
                <button onclick="setOrderType('domicilio')" id="btnDomicilioCarousel" class="order-type-btn-carousel">
                    <i class="fas fa-motorcycle me-2"></i>A Domicilio
                </button>
            </div>
        </div>

        <div class="carousel-inner">
            <!-- Slide 1: Hamburguesa Petra -->
            <div class="carousel-item active">
                <img src="/static/images/petra.jpg" class="d-block w-100" alt="Hamburguesa Petra" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27800%27 height=%27500%27%3E%3Crect fill=%27%23FF0000%27 width=%27800%27 height=%27500%27/%3E%3Ctext fill=%27%23FFCC00%27 font-size=%2760%27 font-weight=%27bold%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27%3E🍔 Petra%3C/text%3E%3C/svg%3E'">
                <div class="carousel-caption">
                    <h2>Hamburguesa Petra</h2>
                    <p>Carne + Queso Asadero + Tocino - $78</p>
                </div>
            </div>
            
            <!-- Slide 2: Hamburguesa Especial -->
            <div class="carousel-item">
                <img src="/static/images/especial.jpg" class="d-block w-100" alt="Hamburguesa Especial" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27800%27 height=%27500%27%3E%3Crect fill=%27%23FF0000%27 width=%27800%27 height=%27500%27/%3E%3Ctext fill=%27%23FFCC00%27 font-size=%2760%27 font-weight=%27bold%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27%3E🍔 Especial%3C/text%3E%3C/svg%3E'">
                <div class="carousel-caption">
                    <h2>Hamburguesa Especial</h2>
                    <p>Carne + Carnes Frías - $63</p>
                </div>
            </div>
            
            <!-- Slide 3: Hot Dog Grosero -->
            <div class="carousel-item">
                <img src="/static/images/hotdog_grosero.jpg" class="d-block w-100" alt="Hot Dog Grosero" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27800%27 height=%27500%27%3E%3Crect fill=%27%23FF0000%27 width=%27800%27 height=%27500%27/%3E%3Ctext fill=%27%23FFCC00%27 font-size=%2760%27 font-weight=%27bold%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27%3E🌭 Grosero%3C/text%3E%3C/svg%3E'">
                <div class="carousel-caption">
                    <h2>Hot Dog Grosero</h2>
                    <p>Salchicha para Asar + Q.Asadero + Tocino - $60</p>
                </div>
            </div>
            
            <!-- Slide 4: Hamburguesa Costeña -->
            <div class="carousel-item">
                <img src="/static/images/costena.jpg" class="d-block w-100" alt="Hamburguesa Costeña" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27800%27 height=%27500%27%3E%3Crect fill=%27%23FF0000%27 width=%27800%27 height=%27500%27/%3E%3Ctext fill=%27%23FFCC00%27 font-size=%2760%27 font-weight=%27bold%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27%3E🍔 Costeña%3C/text%3E%3C/svg%3E'">
                <div class="carousel-caption">
                    <h2>Hamburguesa Costeña</h2>
                    <p>Camarón + Q.Asadero + Tocino + Ch.Morrón - $96</p>
                </div>
            </div>
            
            <!-- Slide 5: Sincronizada -->
            <div class="carousel-item">
                <img src="/static/images/sincronizada.jpg" class="d-block w-100" alt="Sincronizada" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27800%27 height=%27500%27%3E%3Crect fill=%27%23FF0000%27 width=%27800%27 height=%27500%27/%3E%3Ctext fill=%27%23FFCC00%27 font-size=%2760%27 font-weight=%27bold%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27%3E🧀 Sincronizada%3C/text%3E%3C/svg%3E'">
                <div class="carousel-caption">
                    <h2>Sincronizada Especial</h2>
                    <p>Jamón + Quesos + Pierna - $81</p>
                </div>
            </div>
        </div>
        
        <!-- Controles del carousel -->
        <button class="carousel-control-prev" type="button" data-bs-target="#productCarousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Anterior</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#productCarousel" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Siguiente</span>
        </button>
    </div>

    <!-- Contenedor principal del menú -->
    <div class="container mx-auto px-4 py-8">

        <!-- Modal para seleccionar tipo de pedido (si no seleccionó en carousel) -->
        <div id="orderTypeModal" class="hidden fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl">
                <div class="p-6 border-b-4" style="border-color: #FFCC00;">
                    <h2 class="text-2xl font-black text-center" style="color: #FF0000;">
                        <i class="fas fa-exclamation-circle mr-2"></i>¡Espera!
                    </h2>
                    <p class="text-center text-gray-600 mt-2 font-semibold">Primero selecciona cómo deseas tu pedido</p>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 gap-4">
                        <button onclick="selectOrderTypeFromModal('recoger')" class="bg-white p-6 rounded-2xl transition border-4 border-gray-200 hover:border-red-600 hover:shadow-xl">
                            <i class="fas fa-store text-5xl mb-3" style="color: #FF0000;"></i>
                            <p class="font-black text-lg text-black">Pasar a Recoger</p>
                            <p class="text-sm text-gray-500 mt-1">Sin costo de envío</p>
                        </button>
                        <button onclick="selectOrderTypeFromModal('domicilio')" class="bg-white p-6 rounded-2xl transition border-4 border-gray-200 hover:border-red-600 hover:shadow-xl">
                            <i class="fas fa-motorcycle text-5xl mb-3" style="color: #FF0000;"></i>
                            <p class="font-black text-lg text-black">A Domicilio</p>
                            <p class="text-sm text-gray-500 mt-1">Entrega rápida</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Formulario para Recoger (aparece en modal cuando sea necesario) -->
        <div id="pickupFormModal" class="hidden fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl">
                <div class="p-6 border-b-4" style="border-color: #FFCC00;">
                    <h3 class="text-2xl font-black" style="color: #FF0000;">Datos para Recoger</h3>
                    <p class="text-gray-600 mt-2">Necesitamos tu nombre para el pedido</p>
                </div>
                <div class="p-6">
                    <label class="block mb-2 font-bold text-black">Nombre completo <span style="color: #FF0000;">*</span></label>
                    <input type="text" id="nombreRecoger" class="w-full p-4 rounded-xl bg-gray-100 text-black border-2 border-transparent focus:border-red-600 focus:outline-none mb-6" placeholder="¿A nombre de quién?" required>
                    <div class="flex gap-4">
                        <button onclick="closePickupForm()" class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-full font-bold transition hover:bg-gray-300">
                            Cancelar
                        </button>
                        <button onclick="confirmPickupForm()" class="flex-1 text-white py-3 rounded-full font-bold transition hover:opacity-90" style="background-color: #FF0000;">
                            Continuar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Formulario de Domicilio (aparece en modal cuando sea necesario) -->
        <div id="deliveryFormModal" class="hidden fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div class="p-6 border-b-4" style="border-color: #FFCC00;">
                    <h3 class="text-2xl font-black" style="color: #FF0000;">Datos de Entrega</h3>
                    <p class="text-gray-600 mt-2">Completa tus datos para la entrega a domicilio</p>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block mb-2 font-bold text-black">Nombre completo <span style="color: #FF0000;">*</span></label>
                            <input type="text" id="nombre" class="w-full p-4 rounded-xl bg-gray-100 text-black border-2 border-transparent focus:border-red-600 focus:outline-none" placeholder="Tu nombre">
                        </div>
                        <div>
                            <label class="block mb-2 font-bold text-black">Domicilio <span style="color: #FF0000;">*</span></label>
                            <input type="text" id="domicilio" class="w-full p-4 rounded-xl bg-gray-100 text-black border-2 border-transparent focus:border-red-600 focus:outline-none" placeholder="Calle y número">
                        </div>
                        <div>
                            <label class="block mb-2 font-bold text-black">Entre qué calles</label>
                            <input type="text" id="entreCalles" class="w-full p-4 rounded-xl bg-gray-100 text-black border-2 border-transparent focus:border-red-600 focus:outline-none" placeholder="Referencias">
                        </div>
                        <div>
                            <label class="block mb-2 font-bold text-black">Colonia <span style="color: #FF0000;">*</span></label>
                            <input type="text" id="colonia" class="w-full p-4 rounded-xl bg-gray-100 text-black border-2 border-transparent focus:border-red-600 focus:outline-none" placeholder="Tu colonia">
                        </div>
                        <div class="md:col-span-2">
                            <label class="block mb-2 font-bold text-black">Zona de Entrega <span style="color: #FF0000;">*</span></label>
                            <select id="zonaEntrega" class="w-full p-4 rounded-xl bg-gray-100 text-black border-2 border-transparent focus:border-red-600 focus:outline-none" onchange="updateDeliveryCost()">
                                <option value="0">Seleccionar zona...</option>
                                <option value="40">Zona Cercana - $40 de envío</option>
                                <option value="80">Zona Alejada - $80 de envío</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex gap-4 mt-6">
                        <button onclick="closeDeliveryForm()" class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-full font-bold transition hover:bg-gray-300">
                            Cancelar
                        </button>
                        <button onclick="confirmDeliveryForm()" class="flex-1 text-white py-3 rounded-full font-bold transition hover:opacity-90" style="background-color: #FF0000;">
                            Continuar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Menú -->
        <div class="mb-8">
            <h2 class="text-4xl font-black mb-8 text-center" style="color: #FF0000;">Nuestro Menú</h2>
            
            <!-- Barra de búsqueda -->
            <div class="mb-8 max-w-3xl mx-auto">
                <div class="search-bar">
                    <i class="fas fa-search text-xl" style="color: #FF0000;"></i>
                    <input 
                        type="text" 
                        id="searchInput" 
                        placeholder="Buscar hamburguesas, hot dogs, bebidas..." 
                        class="search-input"
                        onkeyup="searchProducts()"
                    >
                    <button 
                        id="clearSearchBtn" 
                        onclick="clearSearch()" 
                        class="hidden hover:opacity-75"
                        style="color: #FF0000;"
                    >
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div id="searchResults" class="mt-3 text-sm font-bold text-gray-600 text-center"></div>
            </div>
            
            <!-- Navegación de Categorías (2 filas) -->
            <div class="mb-8">
                <!-- Primera fila - Favoritos + Categorías principales -->
                <div class="flex flex-wrap justify-center gap-3 mb-3">
                    <button onclick="showFavorites()" class="category-button" data-category="favoritos">
                        <i class="fas fa-heart mr-2"></i>Favoritos
                    </button>
                    <button onclick="showCategory('hamburguesas')" class="category-button active" data-category="hamburguesas">
                        <i class="fas fa-hamburger mr-2"></i>Hamburguesas
                    </button>
                    <button onclick="showCategory('hotdogs')" class="category-button" data-category="hotdogs">
                        <i class="fas fa-hotdog mr-2"></i>Hot Dogs
                    </button>
                    <button onclick="showCategory('sincronizadas')" class="category-button" data-category="sincronizadas">
                        <i class="fas fa-cheese mr-2"></i>Sincronizadas
                    </button>
                    <button onclick="showCategory('burros')" class="category-button" data-category="burros">
                        <i class="fas fa-burrito mr-2"></i>Burros
                    </button>
                </div>
                <!-- Segunda fila - Complementos -->
                <div class="flex flex-wrap justify-center gap-3" id="categoryTabs">
                    <button onclick="showCategory('tortas')" class="category-button" data-category="tortas">
                        <i class="fas fa-bread-slice mr-2"></i>Tortas
                    </button>
                    <button onclick="showCategory('papas')" class="category-button" data-category="papas">
                        <i class="fas fa-french-fries mr-2"></i>Papas
                    </button>
                    <button onclick="showCategory('bebidas')" class="category-button" data-category="bebidas">
                        <i class="fas fa-glass-water mr-2"></i>Bebidas
                    </button>
                </div>
            </div>

            <!-- Grid de Productos -->
            <div id="menuContent" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <!-- El contenido se cargará dinámicamente -->
            </div>
        </div>
    </div>

    <!-- Modal del Carrito -->
    <div id="cartModal" class="hidden fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div class="flex justify-between items-center p-6 border-b-4" style="border-color: #FFCC00;">
                <h2 class="text-3xl font-black" style="color: #FF0000;">
                    <i class="fas fa-shopping-bag mr-2"></i>Tu Pedido
                </h2>
                <button onclick="closeCart()" class="text-gray-500 hover:text-red-600 transition">
                    <i class="fas fa-times text-3xl"></i>
                </button>
            </div>
            <div id="cartItems" class="flex-1 overflow-y-auto p-6">
                <!-- Items del carrito -->
            </div>
            <div class="p-6 border-t-4" style="border-color: #FFCC00; background-color: #efefef;">
                <div class="flex justify-between mb-3 text-lg">
                    <span class="font-bold text-gray-700">Subtotal:</span>
                    <span class="font-bold text-black" id="subtotal">$0</span>
                </div>
                <div id="deliveryCostDisplay" class="flex justify-between mb-3 text-lg hidden">
                    <span class="font-bold text-gray-700">Envío:</span>
                    <span class="font-bold text-black" id="deliveryCostAmount">$0</span>
                </div>
                <div class="flex justify-between text-2xl font-black mb-6" style="color: #FF0000;">
                    <span>Total:</span>
                    <span id="total">$0</span>
                </div>
                <button onclick="sendWhatsApp()" class="w-full text-white py-4 rounded-full font-black text-lg transition hover:opacity-90 shadow-lg" style="background-color: #0033FF;">
                    <i class="fab fa-whatsapp mr-2 text-xl"></i>Enviar Pedido por WhatsApp
                </button>
            </div>
        </div>
    </div>

    <!-- Modal para agregar producto -->
    <div id="productModal" class="hidden fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div class="p-6 border-b-4" style="border-color: #FFCC00;">
                <h3 class="text-2xl font-black" style="color: #FF0000;" id="productModalTitle"></h3>
                <p class="text-gray-600 font-medium mt-2" id="productModalIngredients"></p>
            </div>
            
            <div class="p-6">
                <!-- Ingredientes Extra -->
                <div class="mb-6">
                    <h4 class="font-black mb-3 text-lg text-black">
                        <i class="fas fa-plus-circle mr-2" style="color: #FF0000;"></i>Ingredientes Extra
                    </h4>
                    <div class="max-h-48 overflow-y-auto space-y-2" id="extraIngredients">
                        <!-- Se llenará dinámicamente -->
                    </div>
                </div>

                <!-- Verduras -->
                <div class="mb-6">
                    <h4 class="font-black mb-3 text-lg text-black">
                        <i class="fas fa-leaf mr-2" style="color: #FF0000;"></i>Verduras
                    </h4>
                    <div class="flex flex-wrap gap-2" id="vegetables">
                        <!-- Se llenará dinámicamente -->
                    </div>
                </div>

                <!-- Aderezos -->
                <div class="mb-6">
                    <h4 class="font-black mb-3 text-lg text-black">
                        <i class="fas fa-droplet mr-2" style="color: #FF0000;"></i>Aderezos
                    </h4>
                    <div class="flex flex-wrap gap-2" id="dressings">
                        <!-- Se llenará dinámicamente -->
                    </div>
                </div>

                <!-- Cantidad -->
                <div class="mb-6">
                    <label class="block mb-3 font-black text-lg text-black">
                        <i class="fas fa-hashtag mr-2" style="color: #FF0000;"></i>Cantidad
                    </label>
                    <div class="flex items-center justify-center gap-6">
                        <button onclick="changeQuantity(-1)" class="text-white w-12 h-12 rounded-full font-bold transition hover:opacity-90 shadow-md" style="background-color: #FF0000;">
                            <i class="fas fa-minus text-lg"></i>
                        </button>
                        <input type="number" id="quantity" value="1" min="1" class="w-20 text-center bg-#efefef text-black font-black text-2xl rounded-xl p-3 border-2" style="border-color: #FF0000;">
                        <button onclick="changeQuantity(1)" class="text-white w-12 h-12 rounded-full font-bold transition hover:opacity-90 shadow-md" style="background-color: #FF0000;">
                            <i class="fas fa-plus text-lg"></i>
                        </button>
                    </div>
                </div>

                <div class="flex justify-between items-center mb-6 p-4 rounded-xl" style="background-color: #FFCC00;">
                    <span class="text-xl font-black text-black">Precio Total:</span>
                    <span class="text-3xl font-black" style="color: #FF0000;" id="productModalPrice"></span>
                </div>

                <div class="flex gap-4">
                    <button onclick="closeProductModal()" class="flex-1 bg-gray-200 text-gray-700 py-4 rounded-full font-bold transition hover:bg-gray-300">
                        Cancelar
                    </button>
                    <button onclick="addToCart()" class="flex-1 text-white py-4 rounded-full font-bold transition hover:opacity-90 shadow-md" style="background-color: #FF0000;">
                        <i class="fas fa-cart-plus mr-2"></i>Agregar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Carrito Flotante -->
    <div id="floatingCart" class="floating-cart hidden" onclick="document.getElementById('cartBtn').click()">
        <i class="fas fa-shopping-cart text-2xl"></i>
        <div>
            <div class="floating-cart-count" id="floatingCartCount">0</div>
            <div style="font-size: 12px; margin-top: 2px;">items</div>
        </div>
        <div style="border-left: 2px solid rgba(255,255,255,0.3); padding-left: 12px; margin-left: 4px;">
            <div style="font-size: 18px; font-weight: 900;" id="floatingCartTotal">$0</div>
            <div style="font-size: 10px; opacity: 0.9;">Total</div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="/static/app.js"></script>
</body>
</html>
`

export default app
