function hablar(linea) {
  console.log(`El conejo ${this.tipo} dice '${linea}'`);
}
var conejoBlanco = {tipo: "blanco", hablar};
var conejoHambriento = {tipo: "hambriento", hablar};


var Conejo = class Conejo {
  constructor(tipo) {
    this.tipo = tipo;
  }
  hablar(linea) {
    console.log(`El conejo ${this.tipo} dice '${linea}'`);
  }
}

var conejoAsesino = new Conejo("asesino");
var conejoNegro = new Conejo("negro");

Conejo.prototype.toString = function() {
  return `un conejo ${this.tipo}`;
};

var simboloToString = Symbol("toString");

var Matriz = class Matriz {
  constructor(ancho, altura, elemento = (x, y) => undefined) {
    this.ancho = ancho;
    this.altura = altura;
    this.contenido = [];

    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < ancho; x++) {
        this.contenido[y * ancho + x] = elemento(x, y);
      }
    }
  }

  obtener(x, y) {
    return this.contenido[y * this.ancho + x];
  }
  establecer(x, y, valor) {
    this.contenido[y * this.ancho + x] = valor;
  }
}

var IteradorMatriz = class IteradorMatriz {
  constructor(matriz) {
    this.x = 0;
    this.y = 0;
    this.matriz = matriz;
  }

  next() {
    if (this.y == this.matriz.altura) return {done: true};

    let value = {x: this.x,
                 y: this.y,
                 value: this.matriz.obtener(this.x, this.y)};
    this.x++;
    if (this.x == this.matriz.ancho) {
      this.x = 0;
      this.y++;
    }
    return {value, done: false};
  }
}

Matriz.prototype[Symbol.iterator] = function() {
  return new IteradorMatriz(this);
};

var MatrizSimetrica = class MatrizSimetrica extends Matriz {
  constructor(tamaño, elemento = (x, y) => undefined) {
    super(tamaño, tamaño, (x, y) => {
      if (x < y) return elemento(y, x);
      else return elemento(x, y);
    });
  }

  set(x, y, valor) {
    super.set(x, y, valor);
    if (x != y) {
      super.set(y, x, valor);
    }
  }
}

var matriz = new MatrizSimetrica(5, (x, y) => `${x},${y}`);
