-- Tabla de productos del inventario
CREATE TABLE IF NOT EXISTS productos_inventario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT UNIQUE NOT NULL,
  unidad TEXT NOT NULL,
  precio_unitario REAL NOT NULL,
  cantidad_inicial INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de inventario diario
CREATE TABLE IF NOT EXISTS inventario_diario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_id INTEGER NOT NULL,
  fecha DATE NOT NULL,
  cantidad_inicial INTEGER NOT NULL,
  cantidad_final INTEGER NOT NULL,
  precio_unitario REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos_inventario(id),
  UNIQUE(producto_id, fecha)
);

-- Vista para cálculos automáticos
CREATE VIEW IF NOT EXISTS vista_inventario_diario AS
SELECT 
  id.id,
  id.producto_id,
  pi.nombre as producto_nombre,
  pi.unidad,
  id.fecha,
  id.cantidad_inicial,
  id.cantidad_final,
  (id.cantidad_inicial - id.cantidad_final) as diferencia,
  id.precio_unitario,
  (id.cantidad_inicial - id.cantidad_final) * id.precio_unitario as venta_total,
  id.created_at
FROM inventario_diario id
JOIN productos_inventario pi ON id.producto_id = pi.id;

-- Insertar productos predefinidos
INSERT OR IGNORE INTO productos_inventario (nombre, unidad, precio_unitario, cantidad_inicial) VALUES
('Teleras', 'piezas', 16, 200),
('Carnes', 'piezas', 34, 150),
('Carne de Pierna', 'piezas', 34, 50),
('Salchicha Pavo', 'piezas', 34, 100),
('Salchicha Pierna', 'piezas', 32, 20),
('Champiñones', 'piezas', 14, 30),
('Piña', 'piezas', 14, 30),
('Tocino', 'piezas', 17, 40),
('Carnes Frías', 'piezas', 14, 60),
('Chorizo', 'piezas', 17, 10),
('Queso Asadero', 'piezas', 13, 120),
('Queso Amarillo', 'piezas', 10, 30),
('Aguas', 'botellas', 30, 40),
('Refrescos', 'piezas', 30, 50),
('Salchicha Grosera', 'piezas', 44, 24),
('Bimbos', 'piezas', 16, 100),
('Tortillas', 'piezas', 16, 50),
('Camarón', 'piezas', 54, 12);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_inventario_fecha ON inventario_diario(fecha);
CREATE INDEX IF NOT EXISTS idx_inventario_producto ON inventario_diario(producto_id);
