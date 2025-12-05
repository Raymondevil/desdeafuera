# George Burger - Sistema de Menú Digital

## URLs
- **Desarrollo Local**: http://localhost:3000
- **Sandbox**: https://3000-igufwh2hgqohuqfzb1uaq-2e1b9533.sandbox.novita.ai
- **Producción**: https://georgetepic.com
- **GitHub**: https://github.com/Raymondevil/desdeafuera

## 🎉 Nuevas Funcionalidades (2025-11-18)

### ✅ Carousel Bootstrap con Imágenes
- **Carousel principal** al inicio del menú mostrando productos destacados
- **5 slides** con imágenes reales de productos:
  - Hamburguesa Petra ($78)
  - Hamburguesa Especial ($63)
  - Hot Dog Grosero ($60)
  - Hamburguesa Costeña ($96)
  - Sincronizada Especial ($81)
- **Selección de tipo de pedido** integrada en el carousel con overlay
- **Responsive design** adaptado a móviles y tablets
- **Imágenes locales** en `/public/static/images/` para carga rápida
- **Fallback a SVG** si las imágenes no cargan

### ✅ Carpeta de Imágenes Organizada
Todas las imágenes del menú ahora están en:
```
public/static/images/
├── burro_costeno.jpg (69KB)
├── costena.jpg (55KB)
├── especial.jpg (54KB)
├── hamburguesa_hawaiana_especial.jpg (77KB)
├── hotdog_grosero.jpg (47KB)
├── hotdog_hawaiano.jpg (79KB)
├── papas.jpg (153KB)
├── petra.jpg (63KB)
└── sincronizada.jpg (46KB)
```

Total: 9 imágenes, 660KB

## Funcionalidades Completadas

### ✅ Menú Digital
- Sistema de categorías con navegación en 2 filas:
  - Fila 1: Favoritos, Hamburguesas, Hot Dogs, Sincronizadas, Burros
  - Fila 2: Tortas, Papas, Bebidas
- Tarjetas de productos con imágenes reales para productos principales
- Búsqueda en tiempo real de productos
- Visualización de ratings y reseñas
- **30 hamburguesas**, **13 hot dogs**, **5 sincronizadas**, **4 tortas**, **4 burros**, **2 papas**, **6 bebidas**

### ✅ Sistema de Pedidos
- **Carousel con selección de tipo de pedido** superpuesto
- Selección de tipo de pedido:
  - **Pasar a Recoger**: Sin costo de envío (requiere nombre)
  - **A Domicilio**: Con zonas de entrega ($40 cercana / $80 alejada)
- Formularios específicos para cada tipo de pedido
- Integración con WhatsApp (+523111235595)

### ✅ Carrito de Compras
- Carrito flotante en esquina superior izquierda
- Contador de items y total visible
- Modal completo del carrito con detalles
- Personalización de productos:
  - **Ingredientes extra** (13 opciones con precios)
  - **Verduras** (Jitomate, Cebolla, Chile)
  - **Aderezos** (Crema, Mayonesa, Catsup, Mostaza)
  - Control de cantidad

### ✅ Sistema de Favoritos
- Botón de favoritos en cada producto
- Contador de favoritos en header
- Categoría especial "Favoritos"
- Persistencia con localStorage
- Ícono de corazón animado

### ✅ Sistema de Ratings
- Ratings con estrellas (1-5)
- Comentarios de clientes
- Estadísticas agregadas
- Vista de reseñas por producto
- Almacenamiento en D1 Database
- Nombre de cliente opcional (default: "Anónimo")

### ✅ Panel de Caja (Admin)
- URL: `/cobro?token=george2024admin`
- Autenticación con token
- Cookies de sesión (24h)
- Búsqueda de productos
- Modal de ingredientes extra
- Calculadora de cambio

### ✅ Panel de Inventario (Admin)
- URL: `/inventario?token=george2024admin`
- Gestión de 18 productos
- Control de stock diario
- Registro de precios unitarios
- Historial de ventas (30 días)
- Cálculo automático de diferencias

## Arquitectura de Datos

### Base de Datos D1 (george-burger-db)

**Tabla: productos_inventario**
```sql
CREATE TABLE productos_inventario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  unidad_medida TEXT NOT NULL CHECK(unidad_medida IN ('kg', 'litros', 'piezas'))
);
```
18 productos predefinidos: Carne de res, Carnes frías, Queso asadero, etc.

**Tabla: inventario_diario**
```sql
CREATE TABLE inventario_diario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_id INTEGER NOT NULL,
  fecha DATE NOT NULL,
  cantidad_inicial REAL NOT NULL,
  cantidad_final REAL NOT NULL,
  precio_unitario REAL NOT NULL,
  FOREIGN KEY (producto_id) REFERENCES productos_inventario(id),
  UNIQUE(producto_id, fecha)
);
```

**Tabla: producto_ratings**
```sql
CREATE TABLE producto_ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comentario TEXT,
  nombre_cliente TEXT,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Vista: producto_stats**
```sql
CREATE VIEW producto_stats AS
SELECT 
  producto_nombre,
  categoria,
  COUNT(*) as total_ratings,
  AVG(rating) as rating_promedio
FROM producto_ratings
GROUP BY producto_nombre, categoria;
```

### localStorage
- **georgeburger_favorites**: Array de productos favoritos
- **georgeburger_orderType**: Tipo de pedido seleccionado

## Stack Tecnológico
- **Backend**: Hono Framework (TypeScript/TSX)
- **Frontend**: HTML/CSS/JavaScript Vanilla
- **Database**: Cloudflare D1 (SQLite distribuido)
- **Estilos**: TailwindCSS + Bootstrap 5 (CDN)
- **Iconos**: Font Awesome 6.4.0
- **Deployment**: Cloudflare Pages
- **Dev Server**: PM2 + Wrangler
- **Build**: Vite 6.3.6

## Estructura del Proyecto
```
webapp/
├── src/
│   ├── index.tsx           # Backend principal con carousel Bootstrap
│   ├── caja.html.tsx       # Panel de caja (POS)
│   └── inventario.html.tsx # Panel de inventario
├── public/static/
│   ├── app.js              # Frontend JavaScript
│   └── images/             # 🆕 Imágenes del menú
│       ├── burro_costeno.jpg
│       ├── costena.jpg
│       ├── especial.jpg
│       ├── hamburguesa_hawaiana_especial.jpg
│       ├── hotdog_grosero.jpg
│       ├── hotdog_hawaiano.jpg
│       ├── papas.jpg
│       ├── petra.jpg
│       └── sincronizada.jpg
├── migrations/
│   ├── 0001_inventario.sql # Schema de inventario (18 productos)
│   └── 0002_ratings.sql    # Schema de ratings y vista
├── dist/                   # Build output (Vite)
│   ├── _worker.js
│   └── _routes.json
├── .wrangler/              # Local development (D1 local SQLite)
│   └── state/v3/d1/
├── ecosystem.config.cjs    # PM2 configuration
├── wrangler.jsonc          # Cloudflare config (D1 binding)
├── vite.config.ts          # Vite build config
├── tsconfig.json           # TypeScript config
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## Próximos Pasos Sugeridos

### Mejoras Pendientes
1. **Deploy a Cloudflare Pages**
   - Configurar producción en georgetepic.com
   - Migrar base de datos a producción
   - Configurar dominios personalizados
   
2. **Más Imágenes**
   - Agregar imágenes para todos los 64 productos
   - Optimizar tamaño de imágenes (WebP)
   - Implementar lazy loading
   - CDN para imágenes

3. **Panel de Administración Mejorado**
   - Dashboard con estadísticas en tiempo real
   - Reportes de ventas (diario/semanal/mensual)
   - Gestión de productos del menú (CRUD)
   - Edición de precios e ingredientes

4. **Notificaciones**
   - Confirmación de pedidos por SMS
   - Alertas de stock bajo
   - Notificaciones push (PWA)
   - Email notifications

5. **Optimizaciones**
   - Service Worker (PWA)
   - Cache estratégico
   - Compresión Brotli
   - Code splitting

6. **Nuevas Funcionalidades**
   - Sistema de cupones y descuentos
   - Programa de lealtad
   - Historial de pedidos por cliente
   - Tracking de pedidos en tiempo real

## Comandos Útiles

```bash
# Desarrollo
npm run dev              # Vite dev server (local machine)
npm run dev:sandbox      # Wrangler dev server (sandbox)
npm run dev:d1           # Wrangler dev con D1 local

# Build
npm run build            # Compilar proyecto con Vite

# Database
npm run db:migrate:local  # Migrar DB local (--local)
npm run db:migrate:prod   # Migrar DB producción
npm run db:seed           # Insertar datos de prueba
npm run db:reset          # Limpiar y resetear DB local
npm run db:console:local  # Ejecutar SQL en DB local
npm run db:console:prod   # Ejecutar SQL en DB producción

# PM2
pm2 start ecosystem.config.cjs  # Iniciar servicio
pm2 list                         # Listar servicios
pm2 logs --nostream              # Ver logs (no blocking)
pm2 logs george-burger --lines 50 # Ver últimas 50 líneas
pm2 restart george-burger        # Reiniciar
pm2 stop george-burger           # Detener
pm2 delete all                   # Eliminar todos

# Port Management
npm run clean-port       # Limpiar puerto 3000
npm run test             # Probar servicio local (curl)

# Git
npm run git:init         # Inicializar git
npm run git:commit "msg" # Commit rápido
npm run git:status       # Ver estado
npm run git:log          # Ver historial

# Deploy
npm run deploy           # Build + deploy a Cloudflare
npm run deploy:prod      # Deploy a producción con --project-name
```

## Autenticación Admin
- **Token**: `george2024admin`
- **Duración**: 24 horas (cookie HttpOnly)
- **Rutas protegidas**: 
  - `/cobro?token=george2024admin`
  - `/inventario?token=george2024admin`
- **Redirect**: `/caja` → `/cobro`

## Contacto
- **WhatsApp**: +52 311 123 5595
- **Formato**: Pedido estructurado con emojis

---

## Historial de Cambios

### 2025-11-18
- ✅ Agregado carousel Bootstrap con 5 productos
- ✅ Integración de selección de tipo de pedido en carousel
- ✅ Carpeta de imágenes organizada (`/public/static/images/`)
- ✅ 9 imágenes descargadas desde AI Drive
- ✅ Actualizado menuData con rutas locales
- ✅ Responsive design para carousel
- ✅ Fallback SVG para imágenes no disponibles

### 2025-11-16
- Sistema de ratings y reseñas
- Panel de inventario diario
- 18 productos predefinidos
- Historial de ventas 30 días

### 2025-11-08
- Deploy a producción (georgetepic.com)
- Base de datos D1 configurada
- Sistema de caja (POS)
- Autenticación con tokens

### Inicial
- Menú digital completo
- Carrito de compras
- Sistema de favoritos
- Integración WhatsApp

---

**Estado**: ✅ En Desarrollo Activo  
**Última actualización**: 2025-11-18  
**Versión**: 2.1.0
