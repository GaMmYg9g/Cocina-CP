// =============================================================
// Central Perk · Control de Ventas
// Lógica principal de la aplicación
// =============================================================

const CURRENCY = 'CUP$';

const KEYS = {
  productos:            'cp_productos',
  tickets:              'cp_tickets',
  currentTicket:        'cp_current_ticket',
  porcentajes:          'cp_porcentajes',
  lastDate:             'cp_last_date',
  trabajadoresActivos:  'cp_trabajadores_activos'
};

const State = {
  productos: [],
  tickets: [],
  currentTicket: [],
  porcentajes: {},
  trabajadoresActivos: [],
  searchQuery: '',
  productSearchQuery: '',
  editingProductId: null
};

// =============================================================
// Utilidades
// =============================================================

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatMoney(n) {
  const num = Number(n) || 0;
  return CURRENCY + num.toLocaleString('es-DO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatDateLong(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${dias[date.getDay()]}, ${d} de ${meses[date.getMonth()]}`;
}

function uid(prefix) {
  return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function normalize(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// =============================================================
// Carga / guardado
// =============================================================

function loadState() {
  const hoy = todayISO();
  const lastDate = Storage.get(KEYS.lastDate, null);
  if (lastDate !== hoy) {
    Storage.set(KEYS.lastDate, hoy);
    Storage.set(KEYS.tickets, []);
    Storage.set(KEYS.currentTicket, []);
    // El turno se reinicia cada día → vuelve al default (los 2 primeros)
    Storage.remove(KEYS.trabajadoresActivos);
  }

  // Productos
  let productos = Storage.get(KEYS.productos, null);
  if (!Array.isArray(productos) || productos.length === 0) {
    productos = PRODUCTOS_DEFAULT.map(p => ({ ...p }));
    Storage.set(KEYS.productos, productos);
  }
  State.productos = productos;

  // Tickets
  State.tickets = Storage.get(KEYS.tickets, []);
  if (!Array.isArray(State.tickets)) State.tickets = [];

  // Ticket actual
  State.currentTicket = Storage.get(KEYS.currentTicket, []);
  if (!Array.isArray(State.currentTicket)) State.currentTicket = [];

  // Porcentajes personalizados
  State.porcentajes = Storage.get(KEYS.porcentajes, {});
  if (typeof State.porcentajes !== 'object' || State.porcentajes === null) {
    State.porcentajes = {};
  }

  // Trabajadores activos (turno del día)
  const activosGuardados = Storage.get(KEYS.trabajadoresActivos, null);
  if (Array.isArray(activosGuardados)) {
    // Filtrar ids que ya no existen en el catálogo
    const idsValidos = new Set(TRABAJADORES_DEFAULT.map(t => t.id));
    State.trabajadoresActivos = activosGuardados.filter(id => idsValidos.has(id));
  } else {
    // Default: primeros 2 trabajadores del archivo trabajadores.js
    State.trabajadoresActivos = TRABAJADORES_DEFAULT.slice(0, 2).map(t => t.id);
    Storage.set(KEYS.trabajadoresActivos, State.trabajadoresActivos);
  }
}

function saveProductos()         { Storage.set(KEYS.productos, State.productos); }
function saveTickets()           { Storage.set(KEYS.tickets, State.tickets); }
function saveCurrentTicket()     { Storage.set(KEYS.currentTicket, State.currentTicket); }
function savePorcentajes()       { Storage.set(KEYS.porcentajes, State.porcentajes); }
function saveTrabajadoresActivos(){ Storage.set(KEYS.trabajadoresActivos, State.trabajadoresActivos); }

// =============================================================
// Trabajadores
// =============================================================

function getAllTrabajadores() {
  return TRABAJADORES_DEFAULT.map(t => ({
    ...t,
    porcentaje: (State.porcentajes[t.id] !== undefined)
      ? State.porcentajes[t.id]
      : t.porcentajeDefault
  }));
}

function getTrabajadoresEnTurno() {
  return getAllTrabajadores().filter(t => State.trabajadoresActivos.includes(t.id));
}

function isTrabajadorActivo(id) {
  return State.trabajadoresActivos.includes(id);
}

function toggleTrabajadorActivo(id) {
  const idx = State.trabajadoresActivos.indexOf(id);
  if (idx >= 0) {
    State.trabajadoresActivos.splice(idx, 1);
  } else {
    State.trabajadoresActivos.push(id);
  }
  saveTrabajadoresActivos();
  renderResumen();
}

function setPorcentaje(id, pct) {
  const num = Math.max(0, Number(pct) || 0);
  State.porcentajes[id] = num;
  savePorcentajes();
  renderResumen();
}

// =============================================================
// Búsqueda de productos
// =============================================================

function buscarProductos(query) {
  const q = normalize(query.trim());
  if (!q) return [];
  return State.productos
    .filter(p =>
      normalize(p.nombre).includes(q) ||
      normalize(p.categoria).includes(q)
    )
    .slice(0, 20);
}

function getProductoById(id) {
  return State.productos.find(p => p.id === id) || null;
}

// =============================================================
// Ticket actual
// =============================================================

function addToCurrentTicket(productoId) {
  const prod = getProductoById(productoId);
  if (!prod) return;

  const existing = State.currentTicket.find(i => i.productoId === productoId);
  if (existing) {
    existing.cantidad += 1;
  } else {
    State.currentTicket.push({
      productoId: prod.id,
      nombre: prod.nombre,
      precio: prod.precio,
      cantidad: 1
    });
  }
  saveCurrentTicket();
  renderCurrentTicket();
}

function changeQty(index, delta) {
  const item = State.currentTicket[index];
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) State.currentTicket.splice(index, 1);
  saveCurrentTicket();
  renderCurrentTicket();
}

function removeCurrentItem(index) {
  State.currentTicket.splice(index, 1);
  saveCurrentTicket();
  renderCurrentTicket();
}

function clearCurrentTicket() {
  if (State.currentTicket.length === 0) return;
  if (!confirm('¿Vaciar el pedido actual?')) return;
  State.currentTicket = [];
  saveCurrentTicket();
  renderCurrentTicket();
}

function currentTicketTotal() {
  return State.currentTicket.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
}

function finalizeTicket() {
  if (State.currentTicket.length === 0) {
    alert('El pedido está vacío.');
    return;
  }
  const total = currentTicketTotal();
  const ticket = {
    id: uid('t'),
    fecha: todayISO(),
    timestamp: Date.now(),
    items: State.currentTicket.map(i => ({ ...i })),
    total
  };
  State.tickets.push(ticket);
  State.currentTicket = [];
  saveTickets();
  saveCurrentTicket();
  renderCurrentTicket();
  renderTodayTickets();
  renderResumen();
}

function deleteTicket(id) {
  if (!confirm('¿Eliminar este pedido del día?')) return;
  State.tickets = State.tickets.filter(t => t.id !== id);
  saveTickets();
  renderTodayTickets();
  renderResumen();
}

// =============================================================
// Productos (CRUD)
// =============================================================

function openProductModal(productoId) {
  State.editingProductId = productoId || null;
  const modal = document.getElementById('productModal');
  const title = document.getElementById('modalTitle');
  const form = document.getElementById('productForm');

  const categorias = [...new Set(State.productos.map(p => p.categoria))].sort();
  document.getElementById('categoriasList').innerHTML =
    categorias.map(c => `<option value="${escapeHtml(c)}"></option>`).join('');

  form.reset();

  if (productoId) {
    const p = getProductoById(productoId);
    if (!p) return;
    title.textContent = 'Editar producto';
    document.getElementById('pNombre').value = p.nombre;
    document.getElementById('pCategoria').value = p.categoria;
    document.getElementById('pPrecio').value = p.precio;
    document.getElementById('pDescripcion').value = p.descripcion || '';
  } else {
    title.textContent = 'Agregar producto';
  }

  modal.classList.remove('hidden');
  setTimeout(() => document.getElementById('pNombre').focus(), 50);
}

function closeProductModal() {
  document.getElementById('productModal').classList.add('hidden');
  State.editingProductId = null;
}

function submitProductForm(e) {
  e.preventDefault();
  const nombre = document.getElementById('pNombre').value.trim();
  const categoria = document.getElementById('pCategoria').value.trim();
  const precio = Number(document.getElementById('pPrecio').value);
  const descripcion = document.getElementById('pDescripcion').value.trim();

  if (!nombre || !categoria || !(precio >= 0)) return;

  if (State.editingProductId) {
    const p = getProductoById(State.editingProductId);
    if (p) {
      p.nombre = nombre;
      p.categoria = categoria;
      p.precio = precio;
      p.descripcion = descripcion;
    }
  } else {
    State.productos.push({ id: uid('p'), nombre, categoria, precio, descripcion });
  }

  saveProductos();
  closeProductModal();
  renderProductos();
  renderSearchResults();
  renderCurrentTicket();
}

function deleteProduct(productoId) {
  const p = getProductoById(productoId);
  if (!p) return;
  if (!confirm(`¿Eliminar "${p.nombre}" del catálogo?`)) return;
  State.productos = State.productos.filter(x => x.id !== productoId);
  saveProductos();
  renderProductos();
  renderSearchResults();
}

// =============================================================
// Cerrar día
// =============================================================

function cerrarDia() {
  if (!confirm('¿Cerrar el día? Se eliminarán todos los pedidos de hoy.')) return;
  State.tickets = [];
  State.currentTicket = [];
  saveTickets();
  saveCurrentTicket();
  renderCurrentTicket();
  renderTodayTickets();
  renderResumen();
  switchView('venta');
}

// =============================================================
// Render: búsqueda
// =============================================================

function renderSearchResults() {
  const q = State.searchQuery.trim();
  const cont = document.getElementById('searchResults');
  const clearBtn = document.getElementById('searchClear');

  if (!q) {
    cont.classList.add('hidden');
    cont.innerHTML = '';
    clearBtn.classList.add('hidden');
    return;
  }

  clearBtn.classList.remove('hidden');
  const results = buscarProductos(q);

  if (results.length === 0) {
    cont.innerHTML = `<div class="search-empty">Sin resultados para "${escapeHtml(q)}"</div>`;
  } else {
    cont.innerHTML = results.map(p => `
      <button type="button" class="search-item" data-id="${p.id}">
        <div class="search-item-main">
          <span class="search-item-name">${escapeHtml(p.nombre)}</span>
          <span class="search-item-cat">${escapeHtml(p.categoria)}</span>
        </div>
        <span class="search-item-price">${formatMoney(p.precio)}</span>
      </button>
    `).join('');
  }
  cont.classList.remove('hidden');

  cont.querySelectorAll('.search-item').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCurrentTicket(btn.dataset.id);
      const input = document.getElementById('searchInput');
      input.value = '';
      State.searchQuery = '';
      renderSearchResults();
      input.focus();
    });
  });
}

// =============================================================
// Render: ticket actual
// =============================================================

function renderCurrentTicket() {
  const cont = document.getElementById('currentTicketItems');
  const totalEl = document.getElementById('currentTicketTotal');

  if (State.currentTicket.length === 0) {
    cont.innerHTML = `<div class="empty">Aún no hay productos en este pedido.</div>`;
  } else {
    cont.innerHTML = State.currentTicket.map((i, idx) => `
      <div class="ticket-item">
        <div class="ticket-item-info">
          <span class="ticket-item-name">${escapeHtml(i.nombre)}</span>
          <span class="ticket-item-price">${formatMoney(i.precio)} c/u</span>
        </div>
        <div class="ticket-item-controls">
          <button type="button" class="qty-btn" data-action="minus" data-idx="${idx}" aria-label="Restar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <span class="qty-value">${i.cantidad}</span>
          <button type="button" class="qty-btn" data-action="plus" data-idx="${idx}" aria-label="Sumar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button type="button" class="qty-btn qty-remove" data-action="remove" data-idx="${idx}" aria-label="Quitar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  totalEl.textContent = formatMoney(currentTicketTotal());

  cont.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.idx);
      const action = btn.dataset.action;
      if (action === 'plus') changeQty(idx, 1);
      else if (action === 'minus') changeQty(idx, -1);
      else if (action === 'remove') removeCurrentItem(idx);
    });
  });
}

// =============================================================
// Render: pedidos del día
// =============================================================

function renderTodayTickets() {
  const cont = document.getElementById('todayTickets');
  const countEl = document.getElementById('ticketCount');
  countEl.textContent = State.tickets.length;

  if (State.tickets.length === 0) {
    cont.innerHTML = `<div class="empty">No hay pedidos registrados hoy.</div>`;
    return;
  }

  const tickets = [...State.tickets].reverse();

  cont.innerHTML = tickets.map((t, idx) => {
    const numero = State.tickets.length - idx;
    const hora = new Date(t.timestamp).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });
    const itemsHtml = t.items.map(i => `
      <div class="ticket-row">
        <span class="ticket-row-qty">${i.cantidad}×</span>
        <span class="ticket-row-name">${escapeHtml(i.nombre)}</span>
        <span class="ticket-row-price">${formatMoney(i.precio * i.cantidad)}</span>
      </div>
    `).join('');

    return `
      <details class="ticket-card">
        <summary>
          <div class="ticket-summary-left">
            <span class="ticket-number">#${numero}</span>
            <span class="ticket-time">${hora}</span>
          </div>
          <div class="ticket-summary-right">
            <span class="ticket-total">${formatMoney(t.total)}</span>
            <button type="button" class="btn-icon-danger" data-delete="${t.id}" aria-label="Eliminar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </summary>
        <div class="ticket-body">${itemsHtml}</div>
      </details>
    `;
  }).join('');

  cont.querySelectorAll('button[data-delete]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      deleteTicket(btn.dataset.delete);
    });
  });
}

// =============================================================
// Render: productos (vista de gestión)
// =============================================================

function renderProductos() {
  const cont = document.getElementById('productosList');
  const q = normalize(State.productSearchQuery.trim());
  let lista = State.productos;
  if (q) {
    lista = lista.filter(p =>
      normalize(p.nombre).includes(q) || normalize(p.categoria).includes(q)
    );
  }

  if (lista.length === 0) {
    cont.innerHTML = `<div class="empty">No hay productos que coincidan.</div>`;
    return;
  }

  const grupos = {};
  lista.forEach(p => {
    if (!grupos[p.categoria]) grupos[p.categoria] = [];
    grupos[p.categoria].push(p);
  });

  const categoriasOrdenadas = Object.keys(grupos).sort();

  cont.innerHTML = categoriasOrdenadas.map(cat => `
    <div class="category-group">
      <h3 class="category-title">${escapeHtml(cat)}</h3>
      <div class="category-items">
        ${grupos[cat].map(p => `
          <div class="product-row">
            <div class="product-info">
              <span class="product-name">${escapeHtml(p.nombre)}</span>
              ${p.descripcion ? `<span class="product-desc">${escapeHtml(p.descripcion)}</span>` : ''}
            </div>
            <div class="product-actions">
              <span class="product-price">${formatMoney(p.precio)}</span>
              <button type="button" class="btn-icon" data-edit="${p.id}" aria-label="Editar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                </svg>
              </button>
              <button type="button" class="btn-icon btn-icon-danger" data-remove="${p.id}" aria-label="Eliminar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  cont.querySelectorAll('button[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openProductModal(btn.dataset.edit));
  });
  cont.querySelectorAll('button[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => deleteProduct(btn.dataset.remove));
  });
}

// =============================================================
// Render: resumen (con selector de turno)
// =============================================================

function computeSummary() {
  const totalVendido = State.tickets.reduce((s, t) => s + t.total, 0);
  const totalPedidos = State.tickets.length;

  const vendidos = {};
  State.tickets.forEach(t => {
    t.items.forEach(i => {
      if (!vendidos[i.productoId]) {
        vendidos[i.productoId] = { nombre: i.nombre, cantidad: 0, total: 0 };
      }
      vendidos[i.productoId].cantidad += i.cantidad;
      vendidos[i.productoId].total += i.precio * i.cantidad;
    });
  });

  // Solo los trabajadores EN TURNO entran en el cálculo
  const trabajadores = getTrabajadoresEnTurno().map(t => ({
    ...t,
    comision: totalVendido * (Number(t.porcentaje) || 0) / 100
  }));

  const totalComisiones = trabajadores.reduce((s, t) => s + t.comision, 0);
  const division = trabajadores.length > 0 ? totalComisiones / trabajadores.length : 0;

  return { totalVendido, totalPedidos, vendidos, trabajadores, totalComisiones, division };
}

function renderResumen() {
  const s = computeSummary();

  document.getElementById('totalVendido').textContent = formatMoney(s.totalVendido);
  document.getElementById('totalPedidos').textContent = s.totalPedidos;

  // ---- Selector de trabajadores en turno ----
  const selectorCont = document.getElementById('workerSelector');
  const activeCountEl = document.getElementById('activeWorkersCount');
  const todos = getAllTrabajadores();

  activeCountEl.textContent = State.trabajadoresActivos.length;

  if (todos.length === 0) {
    selectorCont.innerHTML = `<div class="worker-selector-empty">No hay trabajadores en el archivo trabajadores.js</div>`;
  } else {
    selectorCont.innerHTML = todos.map(t => `
      <button type="button" class="worker-chip ${isTrabajadorActivo(t.id) ? 'active' : ''}"
              data-toggle-worker="${t.id}">
        <span class="chip-dot"></span>
        <span>${escapeHtml(t.nombre)}</span>
        <span class="chip-role">${escapeHtml(t.rol)}</span>
      </button>
    `).join('');

    selectorCont.querySelectorAll('button[data-toggle-worker]').forEach(btn => {
      btn.addEventListener('click', () => toggleTrabajadorActivo(btn.dataset.toggleWorker));
    });
  }

  // ---- Productos vendidos ----
  const contVend = document.getElementById('productosVendidos');
  const entries = Object.values(s.vendidos).sort((a, b) => b.cantidad - a.cantidad);
  if (entries.length === 0) {
    contVend.innerHTML = `<div class="empty">Sin ventas registradas.</div>`;
  } else {
    contVend.innerHTML = entries.map(v => `
      <div class="sold-row">
        <span class="sold-qty">${v.cantidad}×</span>
        <span class="sold-name">${escapeHtml(v.nombre)}</span>
        <span class="sold-total">${formatMoney(v.total)}</span>
      </div>
    `).join('');
  }

  // ---- Comisiones del turno ----
  const contTra = document.getElementById('trabajadoresList');

  if (s.trabajadores.length === 0) {
    contTra.innerHTML = `<div class="empty">Marca al menos un trabajador en turno para ver comisiones.</div>`;
  } else {
    contTra.innerHTML = s.trabajadores.map(t => `
      <div class="worker-card" data-worker="${t.id}">
        <div class="worker-head">
          <div class="worker-info">
            <span class="worker-name">${escapeHtml(t.nombre)}</span>
            <span class="worker-role">${escapeHtml(t.rol)}</span>
          </div>
          <div class="worker-commission">
            <span class="worker-commission-label">Comisión</span>
            <span class="worker-commission-value">${formatMoney(t.comision)}</span>
          </div>
        </div>
        <div class="worker-percent">
          <span class="worker-percent-label">Porcentaje</span>
          <div class="worker-percent-buttons">
            <button type="button" class="pct-btn ${t.porcentaje == 1.5 ? 'active' : ''}" data-pct="1.5" data-worker="${t.id}">1.5%</button>
            <button type="button" class="pct-btn ${t.porcentaje == 3 ? 'active' : ''}" data-pct="3" data-worker="${t.id}">3%</button>
            <div class="pct-manual">
              <input type="number" step="0.1" min="0" class="pct-input" data-worker="${t.id}"
                     value="${t.porcentaje}" aria-label="Porcentaje manual">
              <span class="pct-symbol">%</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    contTra.querySelectorAll('.pct-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setPorcentaje(btn.dataset.worker, Number(btn.dataset.pct));
      });
    });
    contTra.querySelectorAll('.pct-input').forEach(inp => {
      const handler = () => {
        const v = parseFloat(inp.value);
        if (!isNaN(v) && v >= 0) setPorcentaje(inp.dataset.worker, v);
      };
      inp.addEventListener('change', handler);
      inp.addEventListener('blur', handler);
    });
  }

  document.getElementById('totalComisiones').textContent = formatMoney(s.totalComisiones);
  document.getElementById('divisionMitad').textContent = formatMoney(s.division);
}

// =============================================================
// Navegación entre vistas
// =============================================================

function switchView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const view = document.getElementById('view-' + name);
  const btn = document.querySelector(`.nav-btn[data-view="${name}"]`);
  if (view) view.classList.add('active');
  if (btn) btn.classList.add('active');

  if (name === 'resumen') renderResumen();
  if (name === 'productos') renderProductos();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================================
// Init
// =============================================================

function init() {
  loadState();

  document.getElementById('headerDate').textContent = formatDateLong(todayISO());

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    State.searchQuery = e.target.value;
    renderSearchResults();
  });
  searchInput.addEventListener('focus', () => {
    if (State.searchQuery.trim()) renderSearchResults();
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) {
      document.getElementById('searchResults').classList.add('hidden');
    }
  });
  document.getElementById('searchClear').addEventListener('click', () => {
    searchInput.value = '';
    State.searchQuery = '';
    renderSearchResults();
    searchInput.focus();
  });

  document.getElementById('clearTicket').addEventListener('click', clearCurrentTicket);
  document.getElementById('addTicket').addEventListener('click', finalizeTicket);

  document.getElementById('addProductBtn').addEventListener('click', () => openProductModal(null));
  document.getElementById('productSearch').addEventListener('input', (e) => {
    State.productSearchQuery = e.target.value;
    renderProductos();
  });

  document.getElementById('productForm').addEventListener('submit', submitProductForm);
  document.querySelectorAll('#productModal [data-close]').forEach(el => {
    el.addEventListener('click', closeProductModal);
  });

  document.getElementById('cerrarDia').addEventListener('click', cerrarDia);

  renderCurrentTicket();
  renderTodayTickets();
  renderProductos();
  renderResumen();
}

document.addEventListener('DOMContentLoaded', init);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.warn('SW registration failed:', err);
    });
  });
}