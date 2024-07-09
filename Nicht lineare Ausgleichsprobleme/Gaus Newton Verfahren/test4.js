const numeric = require('numeric');

// Beispielhafte Daten
const xValues = [1, 2, 3, 4, 5];
const observedYValues = [2, 4, 6, 9, 12];

// Beispielhafte Anfangsschätzungen für die Parameter a, b und c
let params = [1, 1, 1];  // Annahme von a=1, b=1, c=1

// Nichtlineare Modellfunktion
function nonlinearModelFunction(x, ...params) {
    const [a, b, c] = params;
    return a * Math.sin(b * x) + c;
}

// Berechne Residuen
function calculateResiduals(xValues, observedYValues, params) {
    return xValues.map((x, i) => observedYValues[i] - nonlinearModelFunction(x, ...params));
}

// Numerische Differentiation zur Berechnung der partiellen Ableitungen
function partialDerivative(f, params, idx, delta = 1e-5) {
    const params1 = params.slice();
    const params2 = params.slice();
    params1[idx] += delta;
    params2[idx] -= delta;
    return (f(params1) - f(params2)) / (2 * delta);
}

// Berechne Jacobi-Matrix für allgemeine Funktion und Parameter
function calculateJacobian(xValues, params, modelFunction) {
    const numParams = params.length;
    return xValues.map(x => {
        return params.map((_, idx) => {
            const f = (p) => modelFunction(x, ...p);
            return partialDerivative(f, params, idx);
        });
    });
}

// Gauß-Newton-Schritte
function gaussNewton(xValues, observedYValues, params, maxIterations = 10, tolerance = 1e-6) {
    for (let iteration = 0; iteration < maxIterations; iteration++) {
        const residuals = calculateResiduals(xValues, observedYValues, params);
        const J = calculateJacobian(xValues, params, nonlinearModelFunction);
        const JT = numeric.transpose(J);
        const JTJ = numeric.dot(JT, J);
        const JTr = numeric.dot(JT, residuals);
        const deltaParams = numeric.solve(JTJ, JTr);

        // Aktualisiere Parameter
        params = numeric.add(params, deltaParams);

        // Überprüfe Konvergenz
        if (numeric.norm2(deltaParams) < tolerance) {
            break;
        }
    }
    return params;
}

// Anwendung der Gauß-Newton-Methode
const resultParams = gaussNewton(xValues, observedYValues, params);
console.log("Angepasste Parameter:", resultParams);

// Berechnung der vorhergesagten y-Werte für die gemessenen x-Werte mit den angepassten Parametern
const fittedValues = xValues.map(x => nonlinearModelFunction(x, ...resultParams));
console.log("Vorhergesagte y-Werte:", fittedValues);
