export const inventarioHtmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inventario Diario - George Burger</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-black text-#efefef min-h-screen">
    <!-- Header -->
    <header class="shadow-lg sticky top-0 z-50" style="background-color: #FF0000;">
        <div class="container mx-auto px-4 py-6">
            <div class="flex justify-between items-center">
                <div class="flex items-center">
                    <i class="fas fa-clipboard-list text-3xl mr-3" style="color: #FFCC00;"></i>
                    <div>
                        <h1 class="text-3xl font-black text-white">Inventario Diario</h1>
                        <p class="text-white text-sm font-semibold">Control de Ventas del Día</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <a href="/" class="px-4 py-2 rounded-lg font-bold transition" style="background-color: #FFCC00; color: #FF0000;">
                        <i class="fas fa-home mr-2"></i>Menú
                    </a>
                    <a href="/cobro" class="px-4 py-2 rounded-lg font-bold transition" style="background-color: #FFCC00; color: #FF0000;">
                        <i class="fas fa-cash-register mr-2"></i>Cobro
                    </a>
                </div>
            </div>
        </div>
    </header>

    <div class="container mx-auto px-4 py-6">
        <!-- Selector de Fecha y Resumen -->
        <div class="rounded-lg p-6 mb-6" style="background-color: #FFCC00;">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                    <label class="block mb-2 font-bold text-black">Fecha:</label>
                    <input type="date" id="fechaInventario" class="w-full p-2 rounded bg-white text-black border-2 font-bold" style="border-color: #FF0000;">
                </div>
                <div class="text-center md:text-right">
                    <div class="text-sm font-bold text-black mb-1">VENTA TOTAL DEL DÍA:</div>
                    <div class="text-4xl font-black" style="color: #FF0000;" id="ventaTotalDia">$0</div>
                </div>
            </div>
        </div>

        <!-- Tabla de Inventario -->
        <div class="rounded-lg p-6" style="background-color: #FFCC00;">
            <h2 class="text-2xl font-black mb-4" style="color: #FF0000;">Registro de Productos</h2>
            
            <div class="overflow-x-auto">
                <table class="w-full bg-white rounded-lg overflow-hidden">
                    <thead style="background-color: #FF0000;">
                        <tr class="text-white font-bold">
                            <th class="p-3 text-left">Producto</th>
                            <th class="p-3 text-center">Unidad</th>
                            <th class="p-3 text-center">Precio</th>
                            <th class="p-3 text-center">Inicial</th>
                            <th class="p-3 text-center">Final</th>
                            <th class="p-3 text-center">Diferencia</th>
                            <th class="p-3 text-center">Venta</th>
                        </tr>
                    </thead>
                    <tbody id="tablaInventario">
                        <!-- Se llenará dinámicamente -->
                    </tbody>
                </table>
            </div>

            <div class="mt-6 flex gap-4">
                <button onclick="guardarInventario()" class="flex-1 py-3 rounded-lg font-black text-white transition hover:opacity-90" style="background-color: #FF0000;">
                    <i class="fas fa-save mr-2"></i>Guardar Inventario
                </button>
                <button onclick="resetearDia()" class="px-6 py-3 rounded-lg font-bold bg-white transition hover:opacity-90" style="color: #FF0000;">
                    <i class="fas fa-redo mr-2"></i>Resetear
                </button>
            </div>
        </div>

        <!-- Historial -->
        <div class="rounded-lg p-6 mt-6" style="background-color: #FFCC00;">
            <h2 class="text-2xl font-black mb-4" style="color: #FF0000;">Historial de Ventas</h2>
            <div id="historialVentas" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Se llenará dinámicamente -->
            </div>
        </div>
    </div>

    <!-- Loading Overlay -->
    <div id="loadingOverlay" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div class="rounded-lg p-8 text-center" style="background-color: #FFCC00;">
            <i class="fas fa-spinner fa-spin text-4xl mb-4" style="color: #FF0000;"></i>
            <p class="font-bold text-black">Cargando...</p>
        </div>
    </div>

    <script src="/static/inventario.js"></script>
</body>
</html>
`
