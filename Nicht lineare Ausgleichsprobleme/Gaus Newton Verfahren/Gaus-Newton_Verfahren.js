const math = require('mathjs');
const numeric = require('numeric');


// Annahme: Array der gemessenen x-Werte
let xValues = [1, 2, 3, 4, 5];
let observedYValues = [2, 4, 6, 9, 12];

// Annahme: Aktuelle Schätzungen für die Parameter a, b und c
let params = [1, 1, 1];  // Annahme von a=1, b=1, c=1

// Nichtlineare Modellfunktion
function nonlinearModelFunction(x, a, b, c) {
    return a * Math.sin(b * x) + c;
}

// Berechnung der vorhergesagten y-Werte für die gemessenen x-Werte
let calculatedYValues = xValues.map(x => nonlinearModelFunction(x, ...params));
console.log("Gemessene x-Werte:", xValues);
console.log("Beobachtete y-Werte:", observedYValues);
console.log("Vorhergesagte y-Werte:", calculatedYValues);

let residuals = observedYValues.map((y, i) => y - calculatedYValues[i]);
console.log("Residuen:", residuals);

let squaredResiduals = residuals.map(r => r ** 2);
console.log("Residuen im Quadrat:", squaredResiduals);

let sumOfSquaredResiduals = squaredResiduals.reduce((acc, curr) => acc + curr, 0);
console.log("Summe der Residuen:", sumOfSquaredResiduals);

// Berechnung der partiellen Ableitungen der Residuumsfunktion nach jedem Parameter
let a, b, c, x;
let nonlinearModelFunctionExpr = `a * sin(b * x) + c`;

// Berechne die Jacobi-Matrix der Residuen
let J = xValues.map(x => {
    let da = math.derivative(nonlinearModelFunctionExpr, 'a').evaluate({a: params[0], b: params[1], c: params[2], x: x});
    let db = math.derivative(nonlinearModelFunctionExpr, 'b').evaluate({a: params[0], b: params[1], c: params[2], x: x});
    let dc = math.derivative(nonlinearModelFunctionExpr, 'c').evaluate({a: params[0], b: params[1], c: params[2], x: x});
    return [da, db, dc];
});

console.log("Jacobi-Matrix der Residuen:");
console.log(J);

let JT = numeric.transpose(J);
console.log("\nTransponierte Matrix:");
console.log(JT);

let JTJ = numeric.dot(JT, J);
let JTJInv = numeric.inv(JTJ);
let JTResiduals = numeric.dot(JT, residuals);

let newGuess = numeric.sub(params, numeric.dot(JTJInv, JTResiduals));
console.log("New guess:", newGuess);
