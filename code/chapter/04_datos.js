var diario = [];

function añadirEntrada(eventos, ardilla) {
  diario.push({eventos, ardilla});
}

function phi(tabla) {
  return (tabla[3] * tabla[0] - tabla[2] * tabla[1]) /
    Math.sqrt((tabla[2] + tabla[3]) *
              (tabla[0] + tabla[1]) *
              (tabla[1] + tabla[3]) *
              (tabla[0] + tabla[2]));
}

function tablaPara(evento, diario) {
  let tabla = [0, 0, 0, 0];
  for (let i = 0; i < diario.length; i++) {
    let entrada = diario[i], index = 0;
    if (entrada.eventos.includes(evento)) index += 1;
    if (entrada.ardilla) index += 2;
    tabla[index] += 1;
  }
  return tabla;
}

function eventosDiario(diario) {
  let eventos = [];
  for (let entrada of diario) {
    for (let evento of entrada.eventos) {
      if (!eventos.includes(evento)) {
        eventos.push(evento);
      }
    }
  }
  return eventos;
}

for (let entrada of DIARIO) {
  if (entrada.eventos.includes("nueces") &&
     !entrada.eventos.includes("me cepille los dientes")) {
    entrada.eventos.push("dientes con nueces");
  }
}

var lista = {
  valor: 1,
  resto: {
    valor: 2,
    resto: {
      valor: 3,
      resto: null
    }
  }
};
