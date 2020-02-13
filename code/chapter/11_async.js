var granRoble = require("./tecnologia-cuervo").granRoble;

var definirTipoSolicitud = require("./tecnologia-cuervo").definirTipoSolicitud;

definirTipoSolicitud("nota", (nido, contenido, fuente, listo) => {
  console.log(`${nido.nombre} recibio nota: ${contenido}`);
  listo();
});

function almacenamiento(nido, nombre) {
  return new Promise(resolve => {
    nido.leerAlmacenamiento(nombre, resultado => resolve(resultado));
  });
}

var TiempoDeEspera = class TiempoDeEspera extends Error {}

function request(nido, objetivo, tipo, contenido) {
  return new Promise((resolve, reject) => {
    let listo = false;
    function intentar(n) {
      nido.send(objetivo, tipo, contenido, (fallo, value) => {
        listo = true;
        if (fallo) reject(fallo);
        else resolve(value);
      });
      setTimeout(() => {
        if (listo) return;
        else if (n < 3) intentar(n + 1);
        else reject(new TiempoDeEspera("Tiempo de espera agotado"));
      }, 250);
    }
    intentar(1);
  });
}

function tipoSolicitud(nombre, manejador) {
  definirTipoSolicitud(nombre, (nido, contenido, fuente,
                           devolucionDeLlamada) => {
    try {
      Promise.resolve(manejador(nido, contenido, fuente))
        .then(response => devolucionDeLlamada(null, response),
              failure => devolucionDeLlamada(failure));
    } catch (exception) {
      devolucionDeLlamada(exception);
    }
  });
}

tipoSolicitud("ping", () => "pong");

function vecinosDisponibles(nido) {
  let solicitudes = nido.vecinos.map(vecino => {
    return request(nido, vecino, "ping")
      .then(() => true, () => false);
  });
  return Promise.all(solicitudes).then(resultado => {
    return nido.vecinos.filter((_, i) => resultado[i]);
  });
}

var todosLados = require("./tecnologia-cuervo").todosLados;

todosLados(nido => {
  nido.estado.chismorreo = [];
});

function enviarChismorreo(nido, mensaje, exceptoPor = null) {
  nido.estado.chismorreo.push(mensaje);
  for (let vecino of nido.vecinos) {
    if (vecino == exceptoPor) continue;
    request(nido, vecino, "chismorreo", mensaje);
  }
}

requestType("chismorreo", (nido, mensaje, fuente) => {
  if (nido.estado.chismorreo.includes(mensaje)) return;
  console.log(`${nido.nombre} recibio chismorreo '${
               mensaje}' de ${fuente}`);
  enviarChismorreo(nido, mensaje, fuente);
});

tipoSolicitud("conexiones", (nido, {nombre, vecinos},
                            fuente) => {
  let conexiones = nido.estado.conexiones;
  if (JSON.stringify(conexiones.get(nombre)) ==
      JSON.stringify(vecinos)) return;
  conexiones.set(nombre, vecinos);
  difundirConexiones(nido, nombre, fuente);
});

function difundirConexiones(nido, nombre, exceptoPor = null) {
  for (let vecino of nido.vecinos) {
    if (vecino == exceptoPor) continue;
    solicitud(nido, vecino, "conexiones", {
      nombre,
      vecinos: nido.estado.conexiones.get(nombre)
    });
  }
}

todosLados(nido => {
  nido.estado.conexiones = new Map;
  nido.estado.conexiones.set(nido.nombre, nido.vecinos);
  difundirConexiones(nido, nido.nombre);
});

function encontrarRuta(desde, hasta, conexiones) {
  let trabajo = [{donde: desde, via: null}];
  for (let i = 0; i < trabajo.length; i++) {
    let {donde, via} = trabajo[i];
    for (let siguiente of conexiones.get(donde) || []) {
      if (siguiente == hasta) return via;
      if (!trabajo.some(w => w.donde == siguiente)) {
        trabajo.push({donde: siguiente, via: via || siguiente});
      }
    }
  }
  return null;
}

function solicitudRuta(nido, objetivo, tipo, contenido) {
  if (nido.vecinos.includes(objetivo)) {
    return solicitud(nido, objetivo, tipo, contenido);
  } else {
    let via = encontrarRuta(nido.nombre, objetivo,
                        nido.estado.conexiones);
    if (!via) throw new Error(`No hay rutas disponibles hacia ${objetivo}`);
    return solicitud(nido, via, "ruta",
                   {objetivo, tipo, contenido});
  }
}

tipoSolicitud("ruta", (nido, {objetivo, tipo, contenido}) => {
  return solicitudRuta(nido, objetivo, tipo, contenido);
});

tipoSolicitud("almacenamiento", (nido, nombre) => almacenamiento(nido, nombre));

function encontrarEnAlmacenamiento(nido, nombre) {
  return almacenamiento(nido, nombre).then(encontrado => {
    if (encontrado != null) return encontrado;
    else return encontrarEnAlmacenamientoRemoto(nido, nombre);
  });
}

function red(nido) {
  return Array.from(nido.estado.conexiones.keys());
}

function encontrarEnAlmacenamientoRemoto(nido, nombre) {
  let fuentes = red(nido).filter(n => n != nido.nombre);
  function siguiente() {
    if (fuentes.length == 0) {
      return Promise.reject(new Error("No encontrado"));
    } else {
      let fuente = fuentes[Math.floor(Math.random() *
                                      fuentes.length)];
      fuentes = fuentes.filter(n => n != fuente);
      return solicitudRuta(nido, fuente, "almacenamiento", nombre)
        .then(valor => valor != null ? valor : siguiente(),
              siguiente);
    }
  }
  return siguiente();
}

var Conjunto = class Conjunto {
  constructor() { this.miembros = []; }
  añadir(m) { this.miembros.añadir(m); }
}

function cualquierAlmacenamiento(nido, fuente, nombre) {
  if (fuente == nido.nombre) return almacenamiento(nido, nombre);
  else return solicitudRuta(nido, fuente, "almacenamiento", nombre);
}

async function polluelos(nido, años) {
  let lista = "";
  await Promise.all(red(nido).map(async nombre => {
    lista += `${nombre}: ${
      await cualquierAlmacenamiento(nido, nombre, `polluelos en ${años}`)
    }\n`;
  }));
  return lista;
}
