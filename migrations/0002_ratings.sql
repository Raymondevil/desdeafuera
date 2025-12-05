-- Tabla de ratings y reviews de productos
CREATE TABLE IF NOT EXISTS producto_ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comentario TEXT,
  nombre_cliente TEXT,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(producto_nombre, categoria, nombre_cliente)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_ratings_producto ON producto_ratings(producto_nombre, categoria);
CREATE INDEX IF NOT EXISTS idx_ratings_fecha ON producto_ratings(fecha DESC);

-- Vista para estadísticas de productos
CREATE VIEW IF NOT EXISTS producto_stats AS
SELECT 
  producto_nombre,
  categoria,
  COUNT(*) as total_ratings,
  AVG(rating) as rating_promedio,
  COUNT(CASE WHEN rating = 5 THEN 1 END) as ratings_5_estrellas,
  COUNT(CASE WHEN rating = 4 THEN 1 END) as ratings_4_estrellas,
  COUNT(CASE WHEN rating = 3 THEN 1 END) as ratings_3_estrellas,
  COUNT(CASE WHEN rating = 2 THEN 1 END) as ratings_2_estrellas,
  COUNT(CASE WHEN rating = 1 THEN 1 END) as ratings_1_estrella
FROM producto_ratings
GROUP BY producto_nombre, categoria;
