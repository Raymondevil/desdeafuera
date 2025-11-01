# George Burger - Menú Digital

## Resumen del Proyecto
- **Nombre**: George Burger
- **Objetivo**: Sistema de menú digital interactivo con pedidos por WhatsApp
- **Características**: Menú completo, carrito de compras, pedidos a domicilio/recoger, integración WhatsApp

## URLs de Acceso
- **Local**: http://localhost:3000
- **Producción**: https://georgetepic.com
- **Cloudflare Pages**: https://george-burger-menu.pages.dev
- **GitHub**: https://github.com/Raymondevil/desdeafuera

## Características Completadas ✅
- ✅ **Menú completo** con 7 categorías (Hamburguesas, Hot Dogs, Sincronizadas, Tortas, Burros, Papas, Bebidas)
- ✅ **Diseño con colores originales** del menú físico (amarillo #FFCC00 y rojo #FF0000)
- ✅ **Búsqueda rápida** de productos por nombre en tiempo real
- ✅ **Sistema de caja (POS)** con búsqueda y gestión de ticket
- ✅ **Sistema de inventario diario** con:
  - Base de datos D1 (SQLite en Cloudflare)
  - 18 productos predefinidos con cantidades iniciales
  - Cálculo automático de diferencias y ventas
  - Historial de ventas de los últimos 30 días
  - Selector de fecha para consultar cualquier día
- ✅ **Modal de ingredientes extra** en la caja para hamburguesas, dogos, sincronizadas, tortas y burros
- ✅ Sistema de carrito de compras con cantidades
- ✅ Selección de tipo de pedido (Domicilio/Recoger)
- ✅ **Nombre obligatorio** para pedidos de recoger
- ✅ Formulario de datos de entrega para domicilio
- ✅ Cálculo automático de costos de envío por zona ($40 cercana, $80 alejada)
- ✅ Personalización de productos con ingredientes extra, verduras y aderezos
- ✅ Integración con WhatsApp (+52 311 123 5595) para envío de pedidos
- ✅ Diseño responsive y atractivo con TailwindCSS
- ✅ **Dominio personalizado**: georgetepic.com
- ✅ **Optimización de velocidad**: Carga rápida con lazy loading
- ✅ **Manejo de errores**: Gestión de errores de red y base de datos

## Rutas y Funcionalidades

### Frontend
- `/` - Página principal con el menú interactivo
- `/caja` - **Sistema de caja (POS)** con búsqueda de productos y gestión de ticket
- `/inventario` - **Sistema de inventario diario** con cálculo automático de ventas
- Modal de producto - Permite personalizar cada producto con extras
- Modal de ingredientes extra (caja) - Pregunta por ingredientes adicionales al agregar productos
- Carrito de compras - Visualización y gestión de pedidos
- Formulario de entrega - Captura datos para domicilio

### API
- `GET /api/menu` - Obtiene todos los datos del menú
- `GET /api/inventario/productos` - Lista de productos del inventario
- `GET /api/inventario/dia/:fecha` - Inventario de un día específico
- `POST /api/inventario/guardar` - Guarda el inventario del día
- `GET /api/inventario/historial` - Historial de ventas de los últimos 30 días

### API
- `GET /api/menu` - Obtiene todos los datos del menú

## Estructura de Datos
- **Categorías**: Hamburguesas, Hot Dogs, Sincronizadas, Tortas/Burros, Bebidas
- **Productos**: Nombre, ingredientes, precio base
- **Extras**: Ingredientes adicionales con precio
- **Personalización**: Verduras y aderezos sin costo adicional
- **Zonas de envío**: Cercana ($40) y Alejada ($80)

## Guía de Usuario

1. **Seleccionar tipo de pedido**: Elegir entre "Pasar a Recoger" o "A Domicilio"
2. **Si es a domicilio**: Completar datos de entrega y seleccionar zona
3. **Explorar menú**: Navegar por las diferentes categorías
4. **Agregar productos**: 
   - Click en cualquier producto
   - Personalizar con extras, verduras y aderezos
   - Seleccionar cantidad
   - Agregar al carrito
5. **Revisar pedido**: Click en el ícono del carrito
6. **Enviar pedido**: Click en "Enviar Pedido por WhatsApp"

## Características Pendientes
- [ ] Despliegue a Cloudflare Pages
- [ ] Base de datos para historial de pedidos
- [ ] Sistema de usuarios/clientes frecuentes
- [ ] Seguimiento de pedidos en tiempo real
- [ ] Panel de administración para actualizar menú y precios
- [ ] Integración con métodos de pago en línea

## Próximos Pasos Recomendados
1. Probar el sistema localmente
2. Configurar y desplegar en Cloudflare Pages
3. Implementar base de datos D1 para almacenar pedidos
4. Crear panel de administración
5. Agregar notificaciones por email/SMS
6. Implementar sistema de cupones y descuentos

## Stack Tecnológico
- **Backend**: Hono Framework con Cloudflare Workers
- **Frontend**: HTML5, JavaScript Vanilla, TailwindCSS
- **Integración**: WhatsApp Web API
- **Despliegue**: Cloudflare Pages (pendiente)

## Instalación y Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run build
pm2 start ecosystem.config.cjs

# Ver logs
pm2 logs george-burger --nostream

# Detener servidor
pm2 stop george-burger

# Desplegar a producción (requiere configuración Cloudflare)
npm run deploy
```

## Datos de Contacto WhatsApp
- **Número configurado**: +52 311 123 5595
- **Formato de mensaje**: Estructurado con emojis y formato Markdown

## Última Actualización
- **Fecha**: 2025-01-08
- **Estado**: ✅ DESPLEGADO EN PRODUCCIÓN CON BASE DE DATOS
- **Nuevas funciones**: 
  - **Sistema de inventario diario** con base de datos D1
  - Cálculo automático de ventas por día
  - Historial de ventas de 30 días
  - 18 productos de inventario predefinidos
  - Sistema de caja (POS) completo con búsqueda y modal de ingredientes extra
  - Diseño con colores amarillo y rojo del menú original
  - Búsqueda rápida en menú y caja
  - Separación de categorías Burros y Papas
- **URLs en vivo**: 
  - https://georgetepic.com (Menú principal)
  - https://georgetepic.com/caja (Sistema de caja)
  - https://georgetepic.com/inventario (Inventario diario)