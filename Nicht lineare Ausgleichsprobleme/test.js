const numeric = require('numeric');

// Define the nonlinear model function
function nonlinearModelFunction(x, a, b) {
    return a * x + b;
}

// Calculate residuals
function calculateResiduals(xValues, observedYValues, params) {
    const [a, b] = params;
    const residuals = xValues.map((x, i) => observedYValues[i] - nonlinearModelFunction(x, a, b));
    return residuals;
}

// Calculate the Jacobian matrix
function calculateJacobian(xValues, params) {
    const J = xValues.map(x => [x, 1]);
    return J;
}

// Gauss-Newton-Schritte
function gaussNewton(xValues, observedYValues, params, maxIterations = 10, tolerance = 1e-6) {
    for (let iteration = 0; iteration < maxIterations; iteration++) {
        const residuals = calculateResiduals(xValues, observedYValues, params);
        const J = calculateJacobian(xValues, params);
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

// Example data
let xValues = [1, 2, 3, 4, 5];
let observedYValues = [2.1, 4.1, 6.2, 8.1, 10.3];
let initialParams = [1, 1];  // Initial guesses for the model parameters

let optimizedParams = gaussNewton(xValues, observedYValues, initialParams);
console.log("Optimized Parameters:", optimizedParams);

// Berechnung der vorhergesagten y-Werte für die gemessenen x-Werte mit den angepassten Parametern
const fittedValues = xValues.map(x => nonlinearModelFunction(x, ...resultParams));
console.log("Vorhergesagte y-Werte:", fittedValues);
