var cuentas = {
  a: 100,
  b: 0,
  c: 20
};

function obtenerCuenta() {
  let nombreCuenta = prompt("Ingrese el nombre de la cuenta");
  if (!cuentas.hasOwnProperty(nombreCuenta)) {
    throw new Error(`La cuenta "${nombreCuenta}" no existe`);
  }
  return nombreCuenta;
}

function transferir(desde, cantidad) {
  if (cuentas[desde] < cantidad) return;
  cuentas[desde] -= cantidad;
  cuentas[obtenerCuenta()] += cantidad;
}

function transferir(desde, cantidad) {
  if (cuentas[desde] < cantidad) return;
  let progreso = 0;
  try {
    cuentas[desde] -= cantidad;
    progreso = 1;
    cuentas[obtenerCuenta()] += cantidad;
    progreso = 2;
  } finally {
    if (progreso == 1) {
      cuentas[desde] += cantidad;
    }
  }
}

var ErrorDeEntrada = class ErrorDeEntrada extends Error {}

function pedirDireccion(pregunta) {
  let resultado = prompt(pregunta);
  if (resultado.toLowerCase() == "izquierda") return "I";
  if (resultado.toLowerCase() == "derecha") return "D";
  throw new ErrorDeEntrada("Direccion invalida: " + resultado);
}
