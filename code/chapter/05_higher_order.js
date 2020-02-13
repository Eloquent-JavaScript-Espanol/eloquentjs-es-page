function repetir(n, accion) {
  for (let i = 0; i < n; i++) {
    accion(i);
  }
}

function codigoCaracter(codigo_caracter) {
  for (let codigo of SCRIPTS) {
    if (codigo.ranges.some(([desde, hasta]) => {
      return codigo_caracter >= desde && codigo_caracter < hasta;
    })) {
      return codigo;
    }
  }
  return null;
}

function contarPor(elementos, nombreGrupo) {
  let cuentas = [];
  for (let elemento of elementos) {
    let nombre = nombreGrupo(elemento);
    let conocido = cuentas.findIndex(c => c.nombre == nombre);
    if (conocido == -1) {
      cuentas.push({nombre, cuenta: 1});
    } else {
      cuentas[conocido].cuenta++;
    }
  }
  return cuentas;
}

function codigosTexto(texto) {
  let codigos = contarPor(texto, caracter => {
    let codigo = codigoCaracter(caracter.codePointAt(0));
    return codigo ? codigo.name : "ninguno";
  }).filter(({name}) => name != "ninguno");

  let total = codigos.reduce((n, {count}) => n + count, 0);
  if (total == 0) return "No se encontraron codigos";

  return codigos.map(({name, count}) => {
    return `${Math.round(count * 100 / total)}% ${name}`;
  }).join(", ");
}
