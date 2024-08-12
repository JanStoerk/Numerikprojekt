// Parsing und mathematische Berechnung
function parseDataPoints(input) {
    return input.split(';').map(pair => {
        const [x, y] = pair.split(',').map(Number);
        return { x: x, y: y };
    });
}

function runGaussNewton() {
    // Daten von HTML-Elementen abrufen
    const functionInput = document.getElementById("functionInput").value;
    const dataPoints = parseDataPoints(document.getElementById("dataPoints").value);
    let params = document.getElementById("initialGuess").value.split(',').map(Number);

    // Gauß-Newton Implementierung
    let maxIterations = 100;
    let tolerance = 1e-6;
    for (let i = 0; i < maxIterations; i++) {
        // Residuen und Jacobian berechnen
        let residuals = [];
        let jacobian = [];
        
        dataPoints.forEach(point => {
            // y = f(x, params)
            let yPred = eval(functionInput.replace(/x/g, point.x).replace(/a/g, params[0]).replace(/b/g, params[1]).replace(/c/g, params[2]));
            let r = point.y - yPred;
            residuals.push(r);
            // Jacobian Matrix
            let J = [];
            params.forEach((param, index) => {
                let derivative = numeric.derivative(x => eval(functionInput.replace(/x/g, x).replace(/a/g, params[0]).replace(/b/g, params[1]).replace(/c/g, params[2])), param);
                J.push(derivative);
            });
            jacobian.push(J);
        });
        
        // Delta berechnen (pseudoinverse Jacobian * residuals)
        let JTJ = numeric.dot(numeric.transpose(jacobian), jacobian);
        let JTr = numeric.dot(numeric.transpose(jacobian), residuals);
        let delta = numeric.solve(JTJ, JTr);
        
        // Parameter aktualisieren
        params = numeric.add(params, delta);
        
        // Abbruchkriterium
        if (numeric.norm2(delta) < tolerance) break;
    }

    // Ergebnisse mit GeoGebra visualisieren
    visualizeResults(dataPoints, params);
}

function visualizeResults(dataPoints, params) {
    // GeoGebra Applet einrichten
    var ggbApp = new GGBApplet({ "appName": "graphing", "showToolbar": true, "height": 600 }, true);
    ggbApp.inject('ggbApplet');

    // Datenpunkte und angenäherte Kurve in GeoGebra zeichnen
    dataPoints.forEach((point, index) => {
        ggbApp.evalCommand(`A${index + 1} = (${point.x}, ${point.y})`);
    });

    let functionString = `f(x) = ${params[0]}*x^2 + ${params[1]}*x + ${params[2]}`;
    ggbApp.evalCommand(functionString);
}
