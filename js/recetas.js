// =============================================================
// Configuración del IPV (Inventario Para Venta)
// Mapea los IDs de los productos a los insumos que descuentan.
// =============================================================

const NOMBRES_IPV = {
  pan: 'Pan (unidades)',
  tacos: 'Masas de taco (unidades)',
  masa_pizza: 'Masas de pizza (unidades)',
  croquetas: 'Paquetes de croquetas',
  huevo: 'Huevos (unidades)',
  atun: 'Atún (latas/sobres)',
  hamburguesa: 'Carne de hamburguesa (unidades)'
};

const RECETAS_IPV = {
  // --- Snacks ---
  'p001': { atun: 1 },           // Tostones rellenos de atún
  'p003': { croquetas: 1 },      // Croquetas de la casa (1 paquete)
  'p004': { tacos: 4 },          // Nachos
  'p005': { tacos: 4 },          // Nachos con Carne
  'p006': { atun: 1 },           // Cóctel de atún
  'p007': { croquetas: 0.5 },    // Tabla Friends (medio paquete)

  // --- Tacos ---
  'p010': { tacos: 3 },          // Tacos de Cerdo
  'p011': { tacos: 3 },          // Tacos de Pollo
  'p012': { tacos: 3 },          // Tacos de Res
  'p013': { tacos: 3 },          // Tacos de Cerdo asado

  // --- Pizza ---
  'p020': { masa_pizza: 1 },     // Pizza de queso

  // --- Sandwich ---
  'p030': { pan: 1 },            // Pan con cerdo asado
  'p031': { pan: 1 },            // Sandwich de queso
  'p032': { pan: 1 },            // Sandwich de queso gouda
  'p033': { pan: 1 },            // Sandwich de jamón
  'p034': { pan: 1, huevo: 1 },  // Pan con tortilla
  'p035': { pan: 1, hamburguesa: 1 }, // Hamburguesa
  'p036': { pan: 1 },            // Pan con bistec de Cerdo
  'p037': { pan: 1 },            // Pan con bistec de Pollo
  'p038': { pan: 1 },            // Pan con bistec de Res

  // --- Agregos ---
  'p050': { pan: 1 },            // Pan (entero o tostadas)
  'p051': { atun: 1 },           // Atún
  'p056': { huevo: 1 }           // Huevo
};
