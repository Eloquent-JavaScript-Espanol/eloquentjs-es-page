function analizarExpresion(programa) {
  programa = saltarEspacio(programa);
  let emparejamiento, expresion;
  if (emparejamiento = /^"([^"]*)"/.exec(programa)) {
    expresion = {tipo: "valor", valor: emparejamiento[1]};
  } else if (emparejamiento = /^\d+\b/.exec(programa)) {
    expresion = {tipo: "valor", valor: Number(emparejamiento[0])};
  } else if (emparejamiento = /^[^\s(),"]+/.exec(programa)) {
    expresion = {tipo: "palabra", nombre: emparejamiento[0]};
  } else {
    throw new SyntaxError("Sintaxis inesperada: " + programa);
  }

  return aplicarAnalisis(expresion, programa.slice(emparejamiento[0].length));
}

function saltarEspacio(string) {
  let primero = string.search(/\S/);
  if (primero == -1) return "";
  return string.slice(primero);
}

function aplicarAnalisis(expresion, programa) {
  programa = saltarEspacio(programa);
  if (programa[0] != "(") {
    return {expresion: expresion, resto: programa};
  }

  programa = saltarEspacio(programa.slice(1));
  expresion = {tipo: "aplicar", operador: expresion, argumentos: []};
  while (programa[0] != ")") {
    let argumento = analizarExpresion(programa);
    expresion.argumentos.push(argumento.expresion);
    programa = saltarEspacio(argumento.resto);
    if (programa[0] == ",") {
      programa = saltarEspacio(programa.slice(1));
    } else if (programa[0] != ")") {
      throw new SyntaxError("Experaba ',' o ')'");
    }
  }
  return aplicarAnalisis(expresion, programa.slice(1));
}

function analizar(programa) {
  let {expresion, resto} = analizarExpresion(programa);
  if (saltarEspacio(resto).length > 0) {
    throw new SyntaxError("Texto inesperado despues de programa");
  }
  return expresion;
}
//    operador: {tipo: "palabra", nombre: "+"},
//    argumentos: [{tipo: "palabra", nombre: "a"},
//           {tipo: "valor", valor: 10}]}

var specialForms = Object.create(null);

function evaluate(expresion, scope) {
  if (expresion.type == "value") {
    return expresion.value;
  } else if (expresion.type == "word") {
    if (expresion.name in scope) {
      return scope[expresion.name];
    } else {
      throw new ReferenceError(
        `Undefined binding: ${expresion.name}`);
    }
  } else if (expresion.type == "apply") {
    let {operator, args} = expresion;
    if (operator.type == "word" &&
        operator.name in specialForms) {
      return specialForms[operator.name](expresion.args, scope);
    } else {
      let op = evaluate(operator, scope);
      if (typeof op == "function") {
        return op(...args.map(arg => evaluate(arg, scope)));
      } else {
        throw new TypeError("Applying a non-function.");
      }
    }
  }
}

specialForms.si = (args, scope) => {
  if (args.length != 3) {
    throw new SyntaxError("Wrong number of args to si");
  } else if (evaluate(args[0], scope) !== false) {
    return evaluate(args[1], scope);
  } else {
    return evaluate(args[2], scope);
  }
};

specialForms.while = (args, scope) => {
  if (args.length != 2) {
    throw new SyntaxError("Wrong number of args to while");
  }
  while (evaluate(args[0], scope) !== false) {
    evaluate(args[1], scope);
  }

  // Since undefined does not exist in Egg, we return false,
  // for lack of a meaningful result.
  return false;
};

specialForms.hacer = (args, scope) => {
  let value = false;
  for (let arg of args) {
    value = evaluate(arg, scope);
  }
  return value;
};

specialForms.definir = (args, scope) => {
  if (args.length != 2 || args[0].type != "word") {
    throw new SyntaxError("Incorrect use of definir");
  }
  let value = evaluate(args[1], scope);
  scope[args[0].name] = value;
  return value;
};

var topScope = Object.create(null);

topScope.true = true;
topScope.false = false;

for (let op of ["+", "-", "*", "/", "==", "<", ">"]) {
  topScope[op] = Function("a, b", `return a ${op} b;`);
}

topScope.imprimir = value => {
  console.log(value);
  return value;
};

function run(programa) {
  return evaluate(parse(programa), Object.create(topScope));
}

specialForms.fun = (args, scope) => {
  if (!args.length) {
    throw new SyntaxError("Functions need a body");
  }
  let body = args[args.length - 1];
  let params = args.slice(0, args.length - 1).map(expr => {
    if (expr.type != "word") {
      throw new SyntaxError("Parameter names must be words");
    }
    return expr.name;
  });

  return function() {
    if (arguments.length != params.length) {
      throw new TypeError("Wrong number of arguments");
    }
    let localScope = Object.create(scope);
    for (let i = 0; i < arguments.length; i++) {
      localScope[params[i]] = arguments[i];
    }
    return evaluate(body, localScope);
  };
};
