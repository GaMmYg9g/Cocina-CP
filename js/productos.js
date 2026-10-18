// =============================================================
// Catálogo de productos por defecto (Central Perk)
// Edita aquí para cambiar el catálogo inicial.
// Una vez la app arranca, los cambios se guardan en localStorage.
// =============================================================

const PRODUCTOS_DEFAULT = [
  // ---------- SNACKS ----------
  { id: 'p001', nombre: 'Tostones rellenos de atún', categoria: 'Snacks', precio: 1300, descripcion: '8 unidades, 80g de atún, mayonesa, cebolla' },
  { id: 'p002', nombre: 'Tostones de jamón y queso', categoria: 'Snacks', precio: 1100, descripcion: '8 unidades, 50g queso, 50g jamón, mayonesa' },
  { id: 'p003', nombre: 'Croquetas de la casa', categoria: 'Snacks', precio: 850, descripcion: '20 unidades de 15g' },
  { id: 'p004', nombre: 'Nachos', categoria: 'Snacks', precio: 600, descripcion: '4 masas de tortillas de tacos fritas, cortadas en triángulos, salsa agridulce' },
  { id: 'p005', nombre: 'Nachos con Carne', categoria: 'Snacks', precio: 1250, descripcion: '3 masas de tortillas de tacos fritas, 115g fajitas de cerdo y queso rallado' },
  { id: 'p006', nombre: 'Cóctel de atún', categoria: 'Snacks', precio: 1500, descripcion: '98g atún, mayonesa, cebolla, maíz o piña según disponibilidad' },
  { id: 'p007', nombre: 'Tabla Friends', categoria: 'Snacks', precio: 2100, descripcion: '50g queso, 50g jamón, 10g croquetas, 2u salchichas, 100g chicharritas de malanga, 100g chicharritas de plátanos' },

  // ---------- TACOS ----------
  { id: 'p010', nombre: 'Tacos de Cerdo', categoria: 'Tacos', precio: 1500, descripcion: '3 masas de tacos, 150g de fajitas, salsa para acompañar' },
  { id: 'p011', nombre: 'Tacos de Pollo', categoria: 'Tacos', precio: 1200, descripcion: '3 masas de tacos, 150g de fajitas, salsa para acompañar' },
  { id: 'p012', nombre: 'Tacos de Res', categoria: 'Tacos', precio: 1300, descripcion: '3 masas de tacos, 150g de fajitas, salsa para acompañar' },
  { id: 'p013', nombre: 'Tacos de Cerdo asado', categoria: 'Tacos', precio: 1400, descripcion: '3 masas de tacos, 150g de fajitas, salsa para acompañar' },

  // ---------- PIZZA ----------
  { id: 'p020', nombre: 'Pizza de queso', categoria: 'Pizza', precio: 650, descripcion: 'Masa de pizza de 22cm, 70g de queso criollo' },

  // ---------- SANDWICH ----------
  { id: 'p030', nombre: 'Pan con cerdo asado', categoria: 'Sandwich', precio: 1150, descripcion: '100g carne de cerdo asada, ensalada y mojito criollo' },
  { id: 'p031', nombre: 'Sandwich de queso', categoria: 'Sandwich', precio: 300, descripcion: '50g de queso criollo' },
  { id: 'p032', nombre: 'Sandwich de queso gouda', categoria: 'Sandwich', precio: 600, descripcion: '50g queso gouda' },
  { id: 'p033', nombre: 'Sandwich de jamón', categoria: 'Sandwich', precio: 450, descripcion: '50g de jamón' },
  { id: 'p034', nombre: 'Pan con tortilla', categoria: 'Sandwich', precio: 500, descripcion: 'Con un huevo revuelto' },
  { id: 'p035', nombre: 'Hamburguesa', categoria: 'Sandwich', precio: 1100, descripcion: 'Hamburguesa 120g, 50g de queso criollo, ensalada, aderezos, 50g de chicharritas de malanga' },
  { id: 'p036', nombre: 'Pan con bistec de Cerdo', categoria: 'Sandwich', precio: 1100, descripcion: '115g de carne y ensalada' },
  { id: 'p037', nombre: 'Pan con bistec de Pollo', categoria: 'Sandwich', precio: 950, descripcion: '115g de carne y ensalada' },
  { id: 'p038', nombre: 'Pan con bistec de Res', categoria: 'Sandwich', precio: 1000, descripcion: '115g de carne y ensalada' },

  // ---------- ESPAGUETTIS ----------
  { id: 'p040', nombre: 'Spaguettis de queso', categoria: 'Espaguettis', precio: 650, descripcion: '200g Spaguettis, 70g de queso, salsa de tomate' },

  // ---------- AGREGOS ----------
  { id: 'p050', nombre: 'Pan (entero o tostadas)', categoria: 'Agregos', precio: 150, descripcion: '70g' },
  { id: 'p051', nombre: 'Atún', categoria: 'Agregos', precio: 750, descripcion: '98g' },
  { id: 'p052', nombre: 'Queso', categoria: 'Agregos', precio: 200, descripcion: '50g' },
  { id: 'p053', nombre: 'Jamón', categoria: 'Agregos', precio: 260, descripcion: '50g' },
  { id: 'p054', nombre: 'Queso gouda', categoria: 'Agregos', precio: 550, descripcion: '50g' },
  { id: 'p055', nombre: 'Jamón bravo', categoria: 'Agregos', precio: 600, descripcion: '50g' },
  { id: 'p056', nombre: 'Huevo', categoria: 'Agregos', precio: 250, descripcion: '1 unidad' },
  { id: 'p057', nombre: 'Salchicha', categoria: 'Agregos', precio: 200, descripcion: '1 unidad' },
  { id: 'p058', nombre: 'Pimiento', categoria: 'Agregos', precio: 200, descripcion: '50g' },
  { id: 'p059', nombre: 'Cebolla', categoria: 'Agregos', precio: 200, descripcion: '50g' },

  // ---------- COCINA DE MÓNICA ----------
  { id: 'p060', nombre: 'Bistec de res', categoria: 'Cocina de Mónica', precio: 1800, descripcion: '230g' },
  { id: 'p061', nombre: 'Bistec de cerdo', categoria: 'Cocina de Mónica', precio: 1850, descripcion: '230g' },
  { id: 'p062', nombre: 'Bistec de pollo', categoria: 'Cocina de Mónica', precio: 1500, descripcion: '230g' },
  { id: 'p063', nombre: 'Chuleta ahumada', categoria: 'Cocina de Mónica', precio: 2000, descripcion: '230g' },
  { id: 'p064', nombre: 'Fajita de cerdo salteada con vegetales', categoria: 'Cocina de Mónica', precio: 1950, descripcion: '230g' },
  { id: 'p065', nombre: 'Cerdo asado', categoria: 'Cocina de Mónica', precio: 2100, descripcion: '230g' },

  // ---------- GUARNICIONES ----------
  { id: 'p070', nombre: 'Arroz blanco', categoria: 'Guarniciones', precio: 400, descripcion: '200g' },
  { id: 'p071', nombre: 'Arroz moro', categoria: 'Guarniciones', precio: 550, descripcion: '200g' },
  { id: 'p072', nombre: 'Arroz pilaf', categoria: 'Guarniciones', precio: 600, descripcion: '200g' },
  { id: 'p073', nombre: 'Ensalada de estación', categoria: 'Guarniciones', precio: 450, descripcion: '200g' },
  { id: 'p074', nombre: 'Vianda frita', categoria: 'Guarniciones', precio: 550, descripcion: '250g' },

  // ---------- POSTRES ----------
  { id: 'p080', nombre: 'Postre del día', categoria: 'Postres', precio: 450, descripcion: '' },
  
  // ---------- Para Llevar ----------
  { id: 'p081', nombre: 'Embace', categoria: 'Embace', precio: 200, descripcion: '' }
];