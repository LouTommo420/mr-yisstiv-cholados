//============================================
// SISTEMA DE ADMINISTRACIÓN
//============================================
const ADMIN_CONFIG = {
  passwordKey: 'mryisstiv_admin_password',
  usuariosKey: 'mryisstiv_usuarios',
  contenidoKey: 'mryisstiv_contenido',
  defaultPassword: 'admin123'
};

let modoEdicionActivo = false;
let usuarioActual = null;

// Inicializar sistema de admin
function inicializarAdmin() {
  // Crear password por defecto si no existe
  if (!localStorage.getItem(ADMIN_CONFIG.passwordKey)) {
    localStorage.setItem(ADMIN_CONFIG.passwordKey, ADMIN_CONFIG.defaultPassword);
  }
  
  // Crear admin por defecto si no existe
  if (!localStorage.getItem(ADMIN_CONFIG.usuariosKey)) {
    const usuariosDefault = [
      { nombre: 'Admin', password: ADMIN_CONFIG.defaultPassword, rol: 'admin' }
    ];
    localStorage.setItem(ADMIN_CONFIG.usuariosKey, JSON.stringify(usuariosDefault));
  }

  // Cargar contenido editado
  cargarContenidoEditado();

  // Event listener del botón admin
  document.getElementById('btn-admin').addEventListener('click', () => {
    if (usuarioActual) {
      abrirModal('modal-admin');
    } else {
      abrirModal('modal-login');
    }
  });
}

function abrirModal(id) {
  document.getElementById(id).classList.add('activo');
  if (id === 'modal-login') {
    document.getElementById('input-password').focus();
  }
  if (id === 'modal-usuario') {
    mostrarListaUsuarios();
  }
}

function cerrarModal(id) {
  document.getElementById(id).classList.remove('activo');
}

function verificarPassword() {
  const input = document.getElementById('input-password').value;
  const passwordGuardada = localStorage.getItem(ADMIN_CONFIG.passwordKey);
  const usuarios = JSON.parse(localStorage.getItem(ADMIN_CONFIG.usuariosKey));
  
  const usuario = usuarios.find(u => u.password === input);
  
  if (usuario || input === passwordGuardada) {
    usuarioActual = usuario || { nombre: 'Admin', rol: 'admin' };
    cerrarModal('modal-login');
    abrirModal('modal-admin');
    document.getElementById('input-password').value = '';
    document.getElementById('error-password').textContent = '';
    mostrarNotificacion(`Bienvenido ${usuarioActual.nombre}`, 'exito');
  } else {
    document.getElementById('error-password').textContent = '❌ Contraseña incorrecta';
  }
}

function activarModoEdicion() {
  modoEdicionActivo = true;
  document.body.classList.add('modo-edicion');
  document.getElementById('modo-edicion-indicador').style.display = 'block';
  
  // Hacer editables todos los elementos con clase 'editable'
  document.querySelectorAll('.editable').forEach(el => {
    el.contentEditable = true;
  });
  
  cerrarModal('modal-admin');
  mostrarNotificacion('✏️ Modo edición activado. Haz clic en cualquier texto para editarlo', 'exito');
}

function desactivarModoEdicion() {
  modoEdicionActivo = false;
  document.body.classList.remove('modo-edicion');
  document.getElementById('modo-edicion-indicador').style.display = 'none';
  
  // Guardar contenido editado
  guardarContenidoEditado();
  
  // Desactivar edición
  document.querySelectorAll('.editable').forEach(el => {
    el.contentEditable = false;
  });
  
  mostrarNotificacion('💾 Cambios guardados correctamente', 'exito');
}

function guardarContenidoEditado() {
  const contenido = {};
  document.querySelectorAll('.editable').forEach(el => {
    const campo = el.getAttribute('data-campo');
    if (campo) {
      contenido[campo] = el.innerHTML;
    }
  });
  localStorage.setItem(ADMIN_CONFIG.contenidoKey, JSON.stringify(contenido));
}

function cargarContenidoEditado() {
  const contenidoGuardado = localStorage.getItem(ADMIN_CONFIG.contenidoKey);
  if (contenidoGuardado) {
    const contenido = JSON.parse(contenidoGuardado);
    Object.keys(contenido).forEach(campo => {
      const el = document.querySelector(`[data-campo="${campo}"]`);
      if (el) {
        el.innerHTML = contenido[campo];
      }
    });
  }
}

function cambiarPassword() {
  abrirModal('modal-password');
}

function guardarNuevaPassword() {
  const nueva = document.getElementById('nueva-password').value;
  const confirmar = document.getElementById('confirmar-password').value;
  
  if (nueva.length < 6) {
    document.getElementById('msg-password').textContent = '❌ La contraseña debe tener al menos 6 caracteres';
    return;
  }
  
  if (nueva !== confirmar) {
    document.getElementById('msg-password').textContent = '❌ Las contraseñas no coinciden';
    return;
  }
  
  localStorage.setItem(ADMIN_CONFIG.passwordKey, nueva);
  
  // Actualizar admin en la lista
  const usuarios = JSON.parse(localStorage.getItem(ADMIN_CONFIG.usuariosKey));
  const admin = usuarios.find(u => u.rol === 'admin');
  if (admin) {
    admin.password = nueva;
    localStorage.setItem(ADMIN_CONFIG.usuariosKey, JSON.stringify(usuarios));
  }
  
  document.getElementById('msg-password').textContent = '✅ Contraseña actualizada';
  setTimeout(() => {
    cerrarModal('modal-password');
    document.getElementById('nueva-password').value = '';
    document.getElementById('confirmar-password').value = '';
    document.getElementById('msg-password').textContent = '';
  }, 1500);
}

function agregarUsuario() {
  abrirModal('modal-usuario');
}

function guardarUsuario() {
  const nombre = document.getElementById('nombre-usuario').value;
  const password = document.getElementById('password-usuario').value;
  const rol = document.getElementById('rol-usuario').value;
  
  if (!nombre || !password) {
    alert('Por favor completa todos los campos');
    return;
  }
  
  const usuarios = JSON.parse(localStorage.getItem(ADMIN_CONFIG.usuariosKey));
  usuarios.push({ nombre, password, rol });
  localStorage.setItem(ADMIN_CONFIG.usuariosKey, JSON.stringify(usuarios));
  
  document.getElementById('nombre-usuario').value = '';
  document.getElementById('password-usuario').value = '';
  
  mostrarListaUsuarios();
  mostrarNotificacion(`✅ Usuario ${nombre} agregado`, 'exito');
}

function mostrarListaUsuarios() {
  const usuarios = JSON.parse(localStorage.getItem(ADMIN_CONFIG.usuariosKey));
  const contenedor = document.getElementById('lista-usuarios');
  
  contenedor.innerHTML = '<h4 style="margin-top:1rem;color:var(--morado-principal);">Usuarios registrados:</h4>';
  
  usuarios.forEach((u, index) => {
    const div = document.createElement('div');
    div.className = 'usuario-item';
    div.innerHTML = `
      <span><strong>${u.nombre}</strong> (${u.rol})</span>
      ${u.rol !== 'admin' ? `<button onclick="eliminarUsuario(${index})">Eliminar</button>` : ''}
    `;
    contenedor.appendChild(div);
  });
}

function eliminarUsuario(index) {
  const usuarios = JSON.parse(localStorage.getItem(ADMIN_CONFIG.usuariosKey));
  usuarios.splice(index, 1);
  localStorage.setItem(ADMIN_CONFIG.usuariosKey, JSON.stringify(usuarios));
  mostrarListaUsuarios();
  mostrarNotificacion('Usuario eliminado', 'error');
}

function exportarDatos() {
  const datos = {
    contenido: JSON.parse(localStorage.getItem(ADMIN_CONFIG.contenidoKey) || '{}'),
    usuarios: JSON.parse(localStorage.getItem(ADMIN_CONFIG.usuariosKey) || '[]'),
    fecha: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mryisstiv-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  mostrarNotificacion('📤 Datos exportados', 'exito');
}

function importarDatos(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const datos = JSON.parse(e.target.result);
      if (datos.contenido) {
        localStorage.setItem(ADMIN_CONFIG.contenidoKey, JSON.stringify(datos.contenido));
      }
      if (datos.usuarios) {
        localStorage.setItem(ADMIN_CONFIG.usuariosKey, JSON.stringify(datos.usuarios));
      }
      cargarContenidoEditado();
      mostrarNotificacion('📥 Datos importados correctamente', 'exito');
      setTimeout(() => location.reload(), 1000);
    } catch (error) {
      mostrarNotificacion(' Error al importar', 'error');
    }
  };
  reader.readAsText(file);
}

// Enter key en login
document.addEventListener('DOMContentLoaded', () => {
  const inputPassword = document.getElementById('input-password');
  if (inputPassword) {
    inputPassword.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') verificarPassword();
    });
  }
});

//============================================
// PATRÓN STRATEGY - Métodos de Pago
//============================================
class PagoEstrategia {
  procesar(monto) {
    throw new Error('Método procesar debe ser implementado');
  }
}

class PagoEfectivo extends PagoEstrategia {
  procesar(monto) {
    return {
      exito: true,
      mensaje: `Pago en efectivo de $${monto.toLocaleString()} procesado correctamente`,
      metodo: 'Efectivo'
    };
  }
}

class PagoTarjeta extends PagoEstrategia {
  procesar(monto) {
    return {
      exito: true,
      mensaje: `Pago con tarjeta de $${monto.toLocaleString()} procesado correctamente`,
      metodo: 'Tarjeta'
    };
  }
}

class PagoNequi extends PagoEstrategia {
  procesar(monto) {
    return {
      exito: true,
      mensaje: `Pago con Nequi de $${monto.toLocaleString()} procesado correctamente`,
      metodo: 'Nequi'
    };
  }
}

class PagoDaviplata extends PagoEstrategia {
  procesar(monto) {
    return {
      exito: true,
      mensaje: `Pago con Daviplata de $${monto.toLocaleString()} procesado correctamente`,
      metodo: 'Daviplata'
    };
  }
}

class ContextoPago {
  constructor(estrategia) {
    this.estrategia = estrategia;
  }
  setEstrategia(estrategia) {
    this.estrategia = estrategia;
  }
  ejecutarPago(monto) {
    return this.estrategia.procesar(monto);
  }
}

//============================================
// REPOSITORY/DAO - Gestión de Datos
//============================================
class ProductoDAO {
  constructor() {
    this.productos = this.cargarProductos();
  }

  cargarProductos() {
    return [
      { id: 1, nombre: 'Yisstiv Cholao', precio: 10000, categoria: 'cholados' },
      { id: 2, nombre: 'Maracuyazo', precio: 10000, categoria: 'cholados' },
      { id: 3, nombre: 'Guanabanazo', precio: 10000, categoria: 'cholados' },
      { id: 4, nombre: 'Lulada', precio: 10000, categoria: 'cholados' },
      { id: 5, nombre: 'Salpiqueso', precio: 10000, categoria: 'cholados' },
      { id: 6, nombre: 'Maracumango', precio: 10000, categoria: 'cholados' },
      { id: 7, nombre: 'Mangazo', precio: 10000, categoria: 'cholados' },
      { id: 8, nombre: 'Malteada', precio: 13000, categoria: 'cholados' },
      { id: 9, nombre: 'Banana Split', precio: 13000, categoria: 'cholados' },
      { id: 10, nombre: 'Cono Volteado', precio: 10000, categoria: 'conos' },
      { id: 11, nombre: 'Cono Doble', precio: 6000, categoria: 'conos' },
      { id: 12, nombre: 'Cono Sencillo', precio: 4000, categoria: 'conos' },
      { id: 13, nombre: 'Limonada Brasileña', precio: 6000, categoria: 'limonadas' },
      { id: 14, nombre: 'Limonada Mango Biche', precio: 6000, categoria: 'limonadas' },
      { id: 15, nombre: 'Cerezada', precio: 7000, categoria: 'limonadas' },
      { id: 16, nombre: 'Ensalada Yisstiv', precio: 10000, categoria: 'postres' },
      { id: 17, nombre: 'Brownie con Helado', precio: 10000, categoria: 'postres' },
      { id: 18, nombre: 'Raspados', precio: 6000, categoria: 'raspados' },
      { id: 19, nombre: 'Fresas con Crema', precio: 15000, categoria: 'postres' },
      { id: 20, nombre: 'Tentación de Queso', precio: 13000, categoria: 'postres' },
      { id: 21, nombre: 'Yisstiv Ice Kiss', precio: 12000, categoria: 'raspados' },
      { id: 22, nombre: 'Oblea Sencilla Arequipe', precio: 3000, categoria: 'obleas' },
      { id: 23, nombre: 'Oblea Doble', precio: 5000, categoria: 'obleas' },
      { id: 24, nombre: 'Yisstiv Sandwich', precio: 12000, categoria: 'comidas' },
      { id: 25, nombre: 'Queso Asado', precio: 9000, categoria: 'comidas' },
      { id: 26, nombre: 'Migao', precio: 15000, categoria: 'bebidas' },
      { id: 27, nombre: 'Jugo Natural', precio: 9000, categoria: 'bebidas' },
      { id: 28, nombre: 'Aguapanela', precio: 9000, categoria: 'bebidas' },
      { id: 29, nombre: 'Botella de Agua', precio: 3000, categoria: 'bebidas' }
    ];
  }

  obtenerPorId(id) {
    return this.productos.find(p => p.id === id);
  }

  obtenerPorCategoria(categoria) {
    if (categoria === 'todos') return this.productos;
    return this.productos.filter(p => p.categoria === categoria);
  }
}

class ReservaDAO {
  constructor() {
    this.reservas = JSON.parse(localStorage.getItem('reservas') || '[]');
  }

  guardar(reserva) {
    this.reservas.push(reserva);
    localStorage.setItem('reservas', JSON.stringify(this.reservas));
  }

  obtenerTodas() {
    return this.reservas;
  }
}

class ClienteDAO {
  constructor() {
    this.clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
  }

  guardar(cliente) {
    const index = this.clientes.findIndex(c => c.documento === cliente.documento);
    if (index >= 0) {
      this.clientes[index] = cliente;
    } else {
      this.clientes.push(cliente);
    }
    localStorage.setItem('clientes', JSON.stringify(this.clientes));
  }

  obtenerPorDocumento(documento) {
    return this.clientes.find(c => c.documento === documento);
  }
}

//============================================
// CARRITO DE COMPRAS (DOMICILIOS)
//============================================
class Carrito {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('carrito') || '[]');
    this.actualizarContador();
  }

  agregar(productoId, nombre, precio) {
    const itemExistente = this.items.find(item => item.id === productoId);
    if (itemExistente) {
      itemExistente.cantidad++;
    } else {
      this.items.push({
        id: productoId,
        nombre: nombre,
        precio: precio,
        cantidad: 1
      });
    }
    this.guardar();
    this.actualizarVista();
    this.actualizarContador();
    this.mostrarNotificacion(`${nombre} agregado al domicilio`, 'exito');
  }

  eliminar(productoId) {
    this.items = this.items.filter(item => item.id !== productoId);
    this.guardar();
    this.actualizarVista();
    this.actualizarContador();
    this.mostrarNotificacion('Producto eliminado del pedido', 'error');
  }

  cambiarCantidad(productoId, cambio) {
    const item = this.items.find(item => item.id === productoId);
    if (item) {
      item.cantidad += cambio;
      if (item.cantidad <= 0) {
        this.eliminar(productoId);
      } else {
        this.guardar();
        this.actualizarVista();
        this.actualizarContador();
      }
    }
  }

  obtenerTotal() {
    return this.items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

  guardar() {
    localStorage.setItem('carrito', JSON.stringify(this.items));
  }

  actualizarContador() {
    const contador = document.getElementById('contador-carrito');
    if (contador) {
      const totalItems = this.items.reduce((sum, item) => sum + item.cantidad, 0);
      contador.textContent = totalItems;
    }
  }

  actualizarVista() {
    const contenedorCarrito = document.getElementById('items-carrito');
    const totalValor = document.getElementById('total-valor');
    
    if (this.items.length === 0) {
      contenedorCarrito.innerHTML = '<p class="carrito-vacio">Tu pedido está vacío. ¡Agrega productos deliciosos del menú!</p>';
      totalValor.textContent = '0';
      return;
    }
    
    contenedorCarrito.innerHTML = this.items.map(item => `
      <div class="item-carrito">
        <div class="item-info">
          <div class="item-nombre">${item.nombre}</div>
          <div class="item-precio">$${(item.precio * item.cantidad).toLocaleString()}</div>
        </div>
        <div class="item-controles">
          <button class="btn-cantidad" onclick="carrito.cambiarCantidad(${item.id}, -1)">-</button>
          <span>${item.cantidad}</span>
          <button class="btn-cantidad" onclick="carrito.cambiarCantidad(${item.id}, 1)">+</button>
          <button class="btn-eliminar" onclick="carrito.eliminar(${item.id})">Eliminar</button>
        </div>
      </div>
    `).join('');
    
    totalValor.textContent = this.obtenerTotal().toLocaleString();
  }

  mostrarNotificacion(mensaje, tipo = '') {
    const notificacion = document.getElementById('notificacion');
    notificacion.textContent = mensaje;
    notificacion.className = `notificacion mostrar ${tipo}`;
    setTimeout(() => {
      notificacion.classList.remove('mostrar');
    }, 3000);
  }

  vaciar() {
    this.items = [];
    this.guardar();
    this.actualizarVista();
    this.actualizarContador();
  }
}

//============================================
// FUNCIONES GLOBALES
//============================================
let carrito;
let productoDAO;
let reservaDAO;
let clienteDAO;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  carrito = new Carrito();
  productoDAO = new ProductoDAO();
  reservaDAO = new ReservaDAO();
  clienteDAO = new ClienteDAO();
  
  inicializarAdmin();
  inicializarFiltros();
  inicializarFormularioReserva();
  inicializarFormularioDomicilio();
  establecerFechaMinima();
});

// Filtros de categorías
function inicializarFiltros() {
  const botonesCategoria = document.querySelectorAll('.btn-categoria');
  const tarjetas = document.querySelectorAll('.tarjeta-flip');
  
  botonesCategoria.forEach(boton => {
    boton.addEventListener('click', () => {
      botonesCategoria.forEach(btn => btn.classList.remove('activa'));
      boton.classList.add('activa');
      
      const categoria = boton.dataset.categoria;
      
      tarjetas.forEach(tarjeta => {
        if (categoria === 'todos' || tarjeta.dataset.categoria === categoria) {
          tarjeta.style.display = 'block';
          setTimeout(() => {
            tarjeta.style.opacity = '1';
            tarjeta.style.transform = 'scale(1)';
          }, 10);
        } else {
          tarjeta.style.opacity = '0';
          tarjeta.style.transform = 'scale(0.8)';
          setTimeout(() => {
            tarjeta.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

// Agregar al carrito
function agregarAlCarrito(id, nombre, precio) {
  carrito.agregar(id, nombre, precio);
}

// Formulario de Reservas
function inicializarFormularioReserva() {
  const formulario = document.getElementById('form-reserva');
  if (!formulario) return;
  
  formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('telefono').value;
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const personas = document.getElementById('personas').value;
    const tipoReserva = document.getElementById('tipo-reserva').value;
    
    if (!nombre || !telefono || !fecha || !hora) {
      mostrarResultadoReserva('Por favor completa todos los campos', 'error');
      return;
    }
    
    const reserva = {
      id: Date.now(),
      nombre,
      telefono,
      fecha,
      hora,
      personas,
      tipoReserva,
      fechaCreacion: new Date().toISOString()
    };
    
    reservaDAO.guardar(reserva);
    
    mostrarResultadoReserva(
      `¡Reserva confirmada!\n\nNombre: ${nombre}\nFecha: ${fecha}\nHora: ${hora}\nPersonas: ${personas}\nTipo: ${tipoReserva}\n\nTe esperamos en MR YISSTIV cholados.`,
      'exito'
    );
    
    formulario.reset();
  });
}

function mostrarResultadoReserva(mensaje, tipo) {
  const resultado = document.getElementById('resultado-reserva');
  if (!resultado) return;
  
  resultado.textContent = mensaje;
  resultado.className = `resultado-reserva ${tipo}`;
  
  setTimeout(() => {
    resultado.className = 'resultado-reserva';
  }, 5000);
}

// Formulario de Domicilios
function inicializarFormularioDomicilio() {
  const formulario = document.getElementById('form-domicilio');
  if (!formulario) return;
  
  formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (carrito.items.length === 0) {
      carrito.mostrarNotificacion('Agrega productos antes de confirmar el domicilio', 'error');
      return;
    }
    
    const nombre = document.getElementById('nombre-entrega').value;
    const telefono = document.getElementById('telefono-entrega').value;
    const direccion = document.getElementById('direccion-entrega').value;
    const barrio = document.getElementById('barrio-entrega').value;
    const notas = document.getElementById('notas-entrega').value;
    const metodoPago = document.getElementById('estrategia-pago').value;
    const total = carrito.obtenerTotal();
    
    if (!nombre || !telefono || !direccion || !barrio) {
      carrito.mostrarNotificacion('Completa todos los datos de entrega', 'error');
      return;
    }
    
    // Crear estrategia de pago
    let estrategia;
    switch (metodoPago) {
      case 'PagoEfectivo':
        estrategia = new PagoEfectivo();
        break;
      case 'PagoTarjeta':
        estrategia = new PagoTarjeta();
        break;
      case 'PagoNequi':
        estrategia = new PagoNequi();
        break;
      case 'PagoDaviplata':
        estrategia = new PagoDaviplata();
        break;
      default:
        estrategia = new PagoEfectivo();
    }
    
    const contextoPago = new ContextoPago(estrategia);
    const resultadoPago = contextoPago.ejecutarPago(total);
    
    // Guardar pedido
    const pedido = {
      id: Date.now(),
      cliente: { nombre, telefono, direccion, barrio, notas },
      items: [...carrito.items],
      total: total,
      metodoPago: resultadoPago.metodo,
      estado: 'Confirmado',
      fecha: new Date().toISOString()
    };
    
    const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
    pedidos.push(pedido);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    
    carrito.mostrarNotificacion('¡Domicilio confirmado! Te contactaremos pronto.', 'exito');
    carrito.vaciar();
    formulario.reset();
    
    setTimeout(() => {
      alert(`¡Domicilio Confirmado!\n\nCliente: ${nombre}\nDirección: ${direccion}, ${barrio}\nTeléfono: ${telefono}\n\nTotal: $${total.toLocaleString()}\nMétodo de pago: ${resultadoPago.metodo}\n\nRecibirás una confirmación por WhatsApp/SMS.`);
    }, 500);
  });
}

function establecerFechaMinima() {
  const inputFecha = document.getElementById('fecha');
  if (inputFecha) {
    const hoy = new Date().toISOString().split('T')[0];
    inputFecha.min = hoy;
  }
}

// Club de Puntos (Fidelización)
function consultarFidelidad() {
  const documento = document.getElementById('documento-cliente').value;
  const resultado = document.getElementById('resultado-fidelizacion');
  
  if (!documento) {
    resultado.innerHTML = '<p style="color:#ff4757;">Por favor ingresa tu documento</p>';
    return;
  }
  
  let cliente = clienteDAO.obtenerPorDocumento(documento);
  
  if (!cliente) {
    cliente = {
      documento,
      nombre: 'Cliente Nuevo',
      puntos: 100,
      nivel: 'Bronce',
      fechaRegistro: new Date().toISOString()
    };
    clienteDAO.guardar(cliente);
  }
  
  let nivel = 'Bronce';
  let icono = '🥉';
  
  if (cliente.puntos >= 1000) {
    nivel = 'Oro';
    icono = '';
  } else if (cliente.puntos >= 500) {
    nivel = 'Plata';
    icono = '🥈';
  }
  
  const descuento = cliente.puntos >= 1000 ? '20%' : cliente.puntos >= 500 ? '10%' : '0%';
  
  let mensajeProgreso = '';
  if (cliente.puntos < 500) {
    mensajeProgreso = `Te faltan ${500 - cliente.puntos} puntos para alcanzar el nivel Plata `;
  } else if (cliente.puntos < 1000) {
    mensajeProgreso = `Te faltan ${1000 - cliente.puntos} puntos para alcanzar el nivel Oro `;
  } else {
    mensajeProgreso = '¡Felicidades! Has alcanzado el nivel máximo';
  }
  
  resultado.innerHTML = `
    <h3>¡Bienvenido ${cliente.nombre}! ${icono}</h3>
    <div class="puntos-display">${cliente.puntos} puntos</div>
    <p><strong>Nivel actual:</strong> ${nivel}</p>
    <p><strong>Descuento disponible:</strong> ${descuento}</p>
    <p style="margin-top: 1rem; color:#666; font-style: italic;">${mensajeProgreso}</p>
    <p style="margin-top: 1rem; color: var(--morado-principal); font-weight: 600;">
      Tip: Cada compra suma puntos. ¡Sigue acumulando!
    </p>
  `;
}

// Smooth scroll para navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Menú móvil
const btnMenuMovil = document.getElementById('btn-menu-movil');
if (btnMenuMovil) {
  btnMenuMovil.addEventListener('click', () => {
    const navegacion = document.querySelector('.navegacion');
    navegacion.style.display = navegacion.style.display === 'flex' ? 'none' : 'flex';
  });
}

// Mostrar notificación global
function mostrarNotificacion(mensaje, tipo = '') {
  const notificacion = document.getElementById('notificacion');
  notificacion.textContent = mensaje;
  notificacion.className = `notificacion mostrar ${tipo}`;
  setTimeout(() => {
    notificacion.classList.remove('mostrar');
  }, 3000);
}
