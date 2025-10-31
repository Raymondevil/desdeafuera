export const cajaHtmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Caja - George Burger</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-black text-gray-900 min-h-screen">
    <!-- Header -->
    <header class="shadow-lg sticky top-0 z-50" style="background-color: #FF0000;">
        <div class="container mx-auto px-4 py-6">
            <div class="flex justify-between items-center">
                <div class="flex items-center">
                    <i class="fas fa-cash-register text-3xl mr-3" style="color: #FFCC00;"></i>
                    <div>
                        <h1 class="text-3xl font-black text-white">Caja - George Burger</h1>
                        <p class="text-white text-sm font-semibold">Sistema de Cobro</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <a href="/" class="px-4 py-2 rounded-lg font-bold transition" style="background-color: #FFCC00; color: #FF0000;">
                        <i class="fas fa-home mr-2"></i>
                        Menú
                    </a>
                </div>
            </div>
        </div>
    </header>

    <div class="container mx-auto px-4 py-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Columna Izquierda: Búsqueda y Productos -->
            <div class="lg:col-span-2">
                <!-- Búsqueda de productos -->
                <div class="rounded-lg p-6 mb-6" style="background-color: #FFCC00;">
                    <h2 class="text-2xl font-black mb-4" style="color: #FF0000;">Buscar Productos</h2>
                    <div class="relative">
                        <i class="fas fa-search absolute left-3 top-3" style="color: #FF0000;"></i>
                        <input 
                            type="text" 
                            id="searchCaja" 
                            placeholder="Buscar producto..." 
                            class="w-full pl-10 pr-4 py-3 bg-white text-black font-bold rounded-lg border-2 focus:outline-none focus:ring-2" 
                            style="border-color: #FF0000;"
                            onkeyup="searchInCaja()"
                        >
                    </div>
                </div>

                <!-- Grid de productos -->
                <div id="productGrid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <!-- Los productos se cargarán dinámicamente -->
                </div>
            </div>

            <!-- Columna Derecha: Ticket -->
            <div class="lg:col-span-1">
                <div class="rounded-lg p-6 sticky top-24" style="background-color: #FFCC00;">
                    <h2 class="text-2xl font-black mb-4 text-center" style="color: #FF0000;">Ticket</h2>
                    
                    <div id="ticketItems" class="mb-4 max-h-96 overflow-y-auto">
                        <p class="text-center text-gray-600 font-bold">No hay productos</p>
                    </div>

                    <div class="border-t-2 pt-4" style="border-color: #FF0000;">
                        <div class="flex justify-between mb-2 font-bold text-lg">
                            <span class="text-black">TOTAL:</span>
                            <span style="color: #FF0000;" id="totalCaja">$0</span>
                        </div>
                        <button onclick="finalizarVenta()" class="w-full py-3 rounded-lg font-black text-white transition hover:opacity-90 text-lg" style="background-color: #FF0000;">
                            <i class="fas fa-check-circle mr-2"></i>COBRAR
                        </button>
                        <button onclick="limpiarTicket()" class="w-full mt-2 py-2 rounded-lg font-bold bg-white transition hover:opacity-90" style="color: #FF0000;">
                            <i class="fas fa-trash mr-2"></i>Limpiar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal de Ingredientes Extra -->
    <div id="extraModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="rounded-lg max-w-md w-full p-6" style="background-color: #FFCC00;">
            <h3 class="text-xl font-black mb-4" style="color: #FF0000;" id="extraModalTitle"></h3>
            <p class="mb-4 font-bold text-black">¿Se agregó algún ingrediente extra?</p>
            
            <div id="extraIngredientsList" class="mb-4 max-h-60 overflow-y-auto">
                <!-- Se llenará dinámicamente -->
            </div>

            <div class="flex gap-4">
                <button onclick="closeExtraModal(false)" class="flex-1 bg-white py-2 rounded-lg font-bold transition hover:opacity-90" style="color: #FF0000;">
                    No, sin extras
                </button>
                <button onclick="closeExtraModal(true)" class="flex-1 py-2 rounded-lg font-bold text-white transition hover:opacity-90" style="background-color: #FF0000;">
                    Agregar
                </button>
            </div>
        </div>
    </div>

    <script src="/static/caja.js"></script>
</body>
</html>
`
