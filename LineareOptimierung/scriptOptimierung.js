class BranchAndBound {
    // Konstruktor zur Initialisierung der Parameter und des Lösers
    constructor(variables, objectiveCoefficients, constraintsCoefficients, constraintsBounds, constraintTypes, fx) {
        this.bestSolution = null; // Beste gefundene Lösung
        this.variables = variables; // Variablen der Zielfunktion
        this.bestObjectiveValue = -Infinity; // Beste Zielfunktion, bisher gefundener Wert
        this.objectiveCoefficients = objectiveCoefficients; // Koeffizienten der Zielfunktion
        this.constraintsCoefficients = constraintsCoefficients; // Koeffizienten der Nebenbedingungen
        this.constraintsBounds = constraintsBounds; // Grenzen (rechte Seite) der Nebenbedingungen
        this.constraintTypes = constraintTypes; // Typ der Nebenbedingungen (<=, >=, =)
        this.numVariables = objectiveCoefficients.length; // Anzahl der Variablen
        this.initialBounds = this.computeInitialBounds(); // Anfangsgrenzen berechnen
        this.nodes = new vis.DataSet([{ id: 1, label: `Max ` + fx, title: 'Startpunkt' }]); // Setze die Visualisierungs-Knoten
        this.edges = new vis.DataSet([]); // Setze die Visualisierungs-Kanten
        this.nodeIdCounter = 2; // Zähler für Knoten-ID
        this.lowerBound = Infinity; // Anfangsgrenze für die untere Schranke
        this.possibleSolutions = 0; // Anzahl der möglichen Lösungen
        this.globalUpperBound = Infinity; // Anfangsgrenze für die obere Schranke
        this.prunedTreeCount = 0; // Anzahl der beschnittenen Bäume
        this.stack = [{ bounds: this.initialBounds, path: 'start', parentId: 1 }]; // Stack für die Iteration im Baum
        this.iterations = 0; // Anzahl der Iterationen
        this.maxIterations = 300; // Maximale Anzahl der Iterationen
        this.createTree(); // Baum für die Visualisierung erstellen
        this.network; // Netzwerk für die Visualisierung
        this.bestNodeId = null; // Beste Knoten-ID
        this.history = []; // Historie zur Rückverfolgung
        this.skipAnimation; // Flag, um Animationen zu überspringen
    }

    // Methode zum Zurücksetzen des Baums (z.B. bei Neustart)
    resetTree() {
        this.network.setData({ nodes: [], edges: [] });
    }

    // Methode zur Berechnung der anfänglichen Schranken für jede Variable
    computeInitialBounds() {
        let bounds = Array(this.numVariables).fill(null).map(() => [0, Infinity]);

        this.constraintsCoefficients.forEach((constraint, constraintIndex) => {
            const rhs = this.constraintsBounds[constraintIndex]; // Rechte Seite der Nebenbedingung
            const constraintType = this.constraintTypes[constraintIndex]; // Typ der Nebenbedingung (<, <=, >, >=, =)

            // Für jede Variable und jede Nebenbedingung die Schranken anpassen
            constraint.forEach((coeff, varIndex) => {
                if (coeff !== 0 && varIndex < this.numVariables) {
                    const boundValue = Math.floor(rhs / coeff); // Berechnung der Schranke durch Division

                    // Anhand des Nebenbedingungstyps die Schranke der Variablen anpassen
                    switch (constraintType) {
                        case '<':
                        case '<=':
                            if (coeff > 0) {
                                bounds[varIndex][1] = Math.min(bounds[varIndex][1], boundValue);
                            } else {
                                bounds[varIndex][0] = Math.max(bounds[varIndex][0], boundValue);
                            }
                            break;
                        case '>':
                        case '>=':
                            if (coeff > 0) {
                                bounds[varIndex][0] = Math.max(bounds[varIndex][0], boundValue);
                            } else {
                                bounds[varIndex][1] = Math.min(bounds[varIndex][1], boundValue);
                            }
                            break;
                        case '=':
                            const exactValue = Math.floor(rhs / coeff);
                            bounds[varIndex][0] = bounds[varIndex][1] = exactValue;
                            break;
                    }
                }
            });
        });

        // Setze die obere Schranke auf 0, wenn sie negativ ist
        bounds = bounds.map(bound => [
            bound[0],  // untere Schranke bleibt unverändert
            Math.max(bound[1], 0) // obere Schranke wird auf 0 gesetzt, wenn sie negativ ist
        ]);

        return bounds;
    }


    // Berechnung des Werts der Zielfunktion für eine gegebene Lösung
    evaluateObjective(solution) {
        return this.objectiveCoefficients.reduce((sum, coeff, index) => sum + coeff * solution[index], 0);
    }


    // Berechnung der oberen Schranke für die aktuelle Lösung
    calculateUpperBound(bounds) {
        const upperBound = bounds.reduce((sum, [low, high], index) => sum + high * this.objectiveCoefficients[index], 0);
        return upperBound;
    }


    // Hauptfunktion zur Lösung des Problems (mit oder ohne Animation)
    solve() {
        this.skipAnimation = true; // Animation überspringen
        var currentSolutions = []; // Liste der Lösungen für jede Iteration
        while (this.stack.length > 0 && this.iterations < this.maxIterations) {
            this.iterate(); // Nächsten Knoten verarbeiten
            currentSolutions.push(this.bestObjectiveValue) // Aktuelle beste Lösung speichern
        }
        var bestSolution = this.bestObjectiveValue; // Beste gefundene Lösung
        var numberOfIterations = currentSolutions.length; // Anzahl der Iterationen
        var fehlerWerte = []; // Fehlerwerte für das Diagramm
        var iterations = []; // Liste der Iterationen
        for (var i = 0; i <= numberOfIterations; i++) {
            fehlerWerte.push(Math.abs(bestSolution - currentSolutions[i])) // Fehler berechnen
            iterations.push(i); // Iteration speichern
        }

        // Diagramm zur Darstellung des Fehlerverlaufs
        const trace = {
            x: iterations,
            y: fehlerWerte,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Fehler'
        };

        const layout = {
            title: "Abweichungsdiagramm",
            xaxis: {
                title: 'Iteration'
            },
            yaxis: {
                title: 'Absoluter Fehler'
            },
            dragmode: 'pan'
        };

        const config = {
            displaylogo: false,
            modeBarButtonsToRemove: [
                'zoom2d',
                'pan2d',
                'select2d',
                'lasso2d',
                'zoomIn2d',
                'zoomOut2d',
                'autoScale2d',
                'hoverClosestCartesian',
                'hoverCompareCartesian',
                'toggleSpikelines',
                'resetScale2d',
                'toImage'
            ],
            modeBarButtonsToAdd: [{
                name: 'Bild als PNG herunterladen',
                icon: Plotly.Icons.camera,
                click: function (gd) {
                    Plotly.downloadImage(gd, {
                        format: 'png',
                        filename: 'Numerische Integration Abweichungsdiagramm',
                        height: 600,
                        width: 1200,
                        scale: 1
                    });
                }
            },
            {
                name: 'Achsen zurücksetzen',
                icon: Plotly.Icons.home,
                click: function (gd) {
                    Plotly.relayout(gd, {
                        'xaxis.autorange': true,
                        'yaxis.autorange': true
                    });
                }
            }]
        };

        Plotly.newPlot('diagramm', [trace], layout, config); // Das Diagramm erstellen

        document.getElementById('diagramm').style.display = "inline"; // Diagramm anzeigen
        this.skipAnimation = false; // Animation aktivieren
    }

    // Überprüfung, ob eine Lösung alle Nebenbedingungen erfüllt
    satisfiesConstraints(solution) {
        const allSatisfied = this.constraintsCoefficients.every((coeffs, index) => {
            // Berechne den linken Wert der Ungleichung (lhs)
            const lhs = coeffs.reduce((sum, coeff, varIndex) =>
                sum + coeff * solution[varIndex], 0);

            // Hole den rechten Wert (constraint bound) und den Typ der Ungleichung
            const rhs = this.constraintsBounds[index];
            const constraintType = this.constraintTypes[index];

            // Überprüfe basierend auf dem constraintType
            let satisfied;
            switch (constraintType) {
                case '<':
                    satisfied = lhs < rhs;
                    break;
                case '<=':
                    satisfied = lhs <= rhs;
                    break;
                case '>':
                    satisfied = lhs > rhs;
                    break;
                case '>=':
                    satisfied = lhs >= rhs;
                    break;
                case '=':
                    satisfied = lhs === rhs;
                    break;
                default:
                    console.error(`Unbekannter Constraint-Typ: ${constraintType}`);
                    satisfied = false;
            }

            return satisfied;
        });

        return allSatisfied; // Gibt true zurück, wenn alle Bedingungen erfüllt sind
    }


    // Nächster Iterationsschritt im Branch-and-Bound-Verfahren
    iterate() {

        // Bedingungen, um den Baum zu stoppen
        if (this.stack.length === 0 || this.iterations >= this.maxIterations) {
            this.network.fit({
                animation: {
                    duration: 1000,
                    easingFunction: "easeInOutQuad"
                }
            });
            // Bestmarkierung der besten Lösung im Baum
            this.nodes.update({
                id: this.bestNodeId,
                color: {
                    background: '#c5e4d1',
                    border: '#198754',
                    highlight: {
                        background: '#c5e4d1',
                        border: '#198754'
                    },
                    hover: {
                        background: '#c5e4d1',
                        border: '#198754'
                    }
                }
            });
            this.possibleSolutions = this.stack.length;
            return true;
        }

        const node = this.stack.pop(); // Nächster Knoten aus dem Stack
        const bounds = node.bounds; // Schranken des aktuellen Knotens

        const currentNode = this.nodes.get(node.parentId);
        if (currentNode && currentNode.color && currentNode.color.background === '#4d4848') {

            this.iterate() // Funktion beenden, wenn die Parent-Node schwarz ist
            return;
        }
        // Historie speichern
        this.history.push({
            stack: [...this.stack],
            node: node,
            bestObjectiveValue: this.bestObjectiveValue,
            bestSolution: this.bestSolution,
            bestNodeId: this.bestNodeId,
            lowerBound: this.lowerBound,
            globalUpperBound: this.globalUpperBound,
            possibleSolutions: this.possibleSolutions,
            prunedTreeCount: this.prunedTreeCount

        });

        // Berechne den Mittelpunkt der Schranken
        const midpoint = bounds.map(([low, high]) => Math.floor((low + high) / 2));
        const nodeId = this.nodeIdCounter++; // Neue Knoten-ID
        const label = midpoint.map((value, index) => `${this.variables[index]} = ${value}`).join(', ');
        const keyValuePairs = midpoint.map((value) => [value]); // Schlüssel-Werte-Paare für die Variablen
        this.nodes.add({ id: nodeId, label: label, title: label }); // Neuen Knoten zur Visualisierung hinzufügen
        let edgeOptions = { from: node.parentId, to: nodeId }; // Kantenoptionen setzen

        var upperBound = this.calculateUpperBound(bounds); // Obere Schranke berechnen
        // Wenn die Lösung gültig ist, als beste Lösung setzen
        if (this.explore(midpoint)) {
            // Wenn es eine vorherige beste Node gibt, färbe sie blau
            if (this.bestNodeId !== null && this.bestNodeId !== nodeId) {
                this.nodes.update({
                    id: this.bestNodeId,
                    color: {
                        background: '#97c2fc',
                        border: '#2b7ce9',
                        highlight: {
                            background: '#97c2fc',
                            border: '#2b7ce9'
                        },
                        hover: {
                            background: '#97c2fc',
                            border: '#2b7ce9'
                        }
                    }
                });
            }

            // Aktuelle beste Node grün färben
            this.nodes.update({
                id: nodeId,
                color: {
                    background: '#c5e4d1',
                    border: '#198754',
                    highlight: {
                        background: '#c5e4d1',
                        border: '#198754'
                    },
                    hover: {
                        background: '#c5e4d1',
                        border: '#198754'
                    }
                }
            });
            this.bestNodeId = nodeId; // Setze den neuen besten Knoten
        } else if (upperBound <= this.bestObjectiveValue) {
            // Schwarze Knoten, wenn der Knoten beschnitten wurde
            edgeOptions.color = { color: 'black' };
            edgeOptions.dashes = true;
            edgeOptions.color.highlight = 'black';
            edgeOptions.color.hover = 'black';
            this.nodes.update({
                id: nodeId,
                color: {
                    background: '#4d4848',
                    border: '#000000',
                    highlight: {
                        background: '#4d4848',
                        border: '#000000'
                    },
                    hover: {
                        background: '#4d4848',
                        border: '#000000'
                    }
                }
            });
            this.prunedTreeCount++; // Anzahl der beschnittenen Bäume erhöhen
        }
        else if (!this.satisfiesConstraints(keyValuePairs)) {
            // Wenn die Lösung die Bedingungen nicht erfüllt, rot färben
            edgeOptions.color = { color: 'red' };
            edgeOptions.color.highlight = 'red';
            edgeOptions.color.hover = 'red';
            this.nodes.update({
                id: nodeId,
                color: {
                    background: '#ffcccc',
                    border: '#ff0000',
                    highlight: {
                        background: '#ffcccc',
                        border: '#ff0000'
                    },
                    hover: {
                        background: '#ffcccc',
                        border: '#ff0000'
                    }
                }
            });
        } else {
            // Blaue Kanten, wenn der Knoten weiter untersucht wird
            edgeOptions.color = { color: 'blue' };
            edgeOptions.color.highlight = 'blue';
            edgeOptions.color.hover = 'blue';
        }

        this.edges.add(edgeOptions); // Kante zur Visualisierung hinzufügen
        // Falls keine Animation aktiviert ist, fokussiere auf den Knoten
        if (!this.skipAnimation) {
            this.network.focus(nodeId, {
                scale: 1.5,
                animation: {
                    duration: 1000,
                    easingFunction: "easeInOutQuad"
                }
            });
        }
        // Weitere Iteration durch Aufteilen der Schranken
        bounds.forEach((bound, index) => {
            const [low, high] = bound;
            const mid = midpoint[index];

            // Linke Schranke aktualisieren
            if (low <= mid - 1) {
                const newBounds = bounds.map((b, i) => i === index ? [low, mid - 1] : b);
                this.stack.push({ bounds: newBounds, path: `${node.path} -> x${index + 1} <= ${mid - 1}`, parentId: nodeId });
            }

            // Rechte Schranke aktualisieren
            if (mid + 1 <= high) {
                const newBounds = bounds.map((b, i) => i === index ? [mid + 1, high] : b);
                this.stack.push({ bounds: newBounds, path: `${node.path} -> x${index + 1} >= ${mid + 1}`, parentId: nodeId });
            }
        });

        this.iterations++; // Iterationszähler erhöhen
        this.lowerBound = Math.min(this.lowerBound, this.evaluateObjective(midpoint)); // Untere Schranke aktualisieren
        this.possibleSolutions = this.stack.length; // Anzahl der möglichen Lösungen
        this.globalUpperBound = Math.max(this.globalUpperBound, upperBound); // Obere Schranke aktualisieren
    }

    // Methode zur Exploration einer Lösung (prüft, ob sie besser als die aktuelle ist)
    explore(solution) {
        if (this.satisfiesConstraints(solution)) {
            const objectiveValue = this.evaluateObjective(solution);
            if (objectiveValue > this.bestObjectiveValue) {
                this.bestObjectiveValue = objectiveValue;
                this.bestSolution = [...solution];
                return true;
            }
        }
        return false;
    }

    // Baum für die Visualisierung erstellen
    createTree() {
        const container = document.getElementById('ggb-element');
        const data = { nodes: this.nodes, edges: this.edges };

        const options = {
            layout: {
                hierarchical: {
                    direction: "UD",
                    sortMethod: "directed"
                }
            },
            physics: {
                enabled: true,
                hierarchicalRepulsion: {
                    nodeDistance: 100
                },
                stabilization: {
                    iterations: 1000,
                    updateInterval: 25
                },
                minVelocity: 0.1,
                solver: 'barnesHut',
                barnesHut: {
                    springLength: 200,
                    avoidOverlap: 1
                },
                timestep: 0.5
            },
            interaction: {
                dragView: true,
                zoomView: true,
                dragNodes: false
            },
            nodes: {
                shape: 'circle',
                size: 30,
                font: {
                    size: 14,
                    color: '#ffffff',
                },
                borderWidth: 2,
            },
            edges: {
                arrows: { to: { enabled: true } }
            },
            manipulation: {
                enabled: false
            }
        };

        this.network = new vis.Network(container, data, options); // Netzwerk für die Visualisierung erstellen
    }

}

// Funktion zur Extraktion von Variablen und Koeffizienten aus der Zielfunktion und den Nebenbedingungen
function extractVariablesAndCoefficients(objectiveFunction, constraints) {

    // Hilfsfunktion zur Verarbeitung von Koeffizienten
    function parseCoefficient(coefficientStr) {
        // Erkenne und verarbeite Brüche wie '4/5'
        if (coefficientStr.includes('/')) {
            const [numerator, denominator] = coefficientStr.split('/').map(Number);
            return numerator / denominator; // Bruchwert berechnen
        }
        // Falls der Koeffizient leer ist, dann ist der Wert 1 (für z.B. 'x' ohne Koeffizient)
        if (coefficientStr === '' || coefficientStr === '+') return 1;
        if (coefficientStr === '-') return -1;
        return parseFloat(coefficientStr) || 0; // Bei leeren Werten oder anderen Zeichen wird 0 zurückgegeben
    }

    // Hilfsfunktion zur Extraktion der Variablen und Koeffizienten aus einem algebraischen Ausdruck
    function extractFromExpression(expression) {
        const regex = /([+-]?\d*\.?\d+\/\d+|[+-]?\d*\.?\d+|[+-])?\*?([a-zA-Z]+)/g;
        let match;
        const variableMap = new Map();

        // Durchlaufen des Ausdrucks, um alle Variablen und deren Koeffizienten zu finden
        while ((match = regex.exec(expression)) !== null) {
            const coefficientStr = match[1] ? match[1].replace(/\s+/g, '') : ''; // Entferne Leerzeichen aus dem Koeffizienten
            const coefficient = parseCoefficient(coefficientStr);
            const variable = match[2]; // Variable extrahieren
            variableMap.set(variable, coefficient); // Variable und Koeffizient in die Map speichern
        }
        return variableMap;
    }


    // Sammle alle Variablennamen
    const allKeys = new Set();

    // Extrahiere Variablen und Koeffizienten aus der Zielfunktion
    const objectiveFunctionMap = extractFromExpression(objectiveFunction);
    objectiveFunctionMap.forEach((_, key) => allKeys.add(key));  // Alle Variablen aus der Zielfunktion sammeln

    // Arrays für Zielfunktion (Variablen und Koeffizienten)
    const sortedKeys = Array.from(allKeys).sort();
    const objectiveValues = sortedKeys.map(key => objectiveFunctionMap.get(key) || 0);  // Fehlende Werte = 0

    // Arrays für Constraints
    const constraintTypes = [];
    const constraintCoefficients = [];
    const constraintBounds = [];

    // Jede Nebenbedingung parsen
    constraints.forEach((constraint, index) => {
        // Extrahiere die Art der Ungleichung und den rechten Wert
        const match = constraint.match(/^(.*?)(<=|>=|=|<|>)(.*)$/);
        if (match) {
            const [_, lhs, inequality, rhs] = match;
            const constraintMap = extractFromExpression(lhs.trim());

            // Füge die Variablen aus dem Constraint hinzu
            constraintMap.forEach((_, key) => allKeys.add(key));

            // Speichere die Ungleichungsart und den Grenzwert
            constraintTypes.push(inequality);
            constraintBounds.push(parseFloat(rhs.trim()));

            // Berechne die Koeffizienten für jede Variable in sortedKeys
            const coeffArray = sortedKeys.map(key => constraintMap.get(key) || 0);
            constraintCoefficients.push(coeffArray);
        } else {
            console.error(`Constraint ${index + 1} could not be parsed: ${constraint}`);
        }
    });

    // Rückgabe der Arrays
    return {
        variables: sortedKeys,
        objectiveCoefficients: objectiveValues,
        constraintTypes: constraintTypes,
        constraintCoefficients: constraintCoefficients,
        constraintBounds: constraintBounds
    };
}


// Eventlistener für DOM-Inhalte - Setup der Schaltflächen und Eingabefelder nach dem Laden des Dokuments
document.addEventListener('DOMContentLoaded', function () {
    const btnStart = document.getElementById('branchButton'); // Startbutton für Branch-and-Bound
    const skipForwardButton = document.getElementById('skip-forward'); // Button, um zum nächsten Schritt zu springen
    const playButton = document.getElementById('btnStart'); // Play/Pause Button für die Ausführung
    const skipBackwardButton = document.getElementById('skip-back'); // Button, um zum vorherigen Schritt zu springen
    const btnZeichne = document.getElementById('btnZeichne'); // Button zum Zeichnen des Baums
    const resetTree = document.getElementById('resetTree'); // Button, um den Baum zurückzusetzen
    const playIcon = document.getElementById('play-icon'); // Play-Icon zur Visualisierung des aktuellen Status
    const pauseIcon = document.getElementById('pause-icon'); // Pause-Icon zur Visualisierung des aktuellen Status
    btnZeichne.addEventListener('click', addConstraint); // Listener zum Hinzufügen einer neuen Nebenbedingung
    resetTree.addEventListener('click', reset); // Listener zum Zurücksetzen des Baums
    document.getElementById('funktion').addEventListener('input', checkInputs); // Listener zur Überprüfung der Eingaben
    playButton.addEventListener('click', playBranchAndBound); // Listener zur Ausführung des Branch-and-Bound-Algorithmus
    skipBackwardButton.addEventListener('click', skipBackward); // Listener, um einen Schritt zurückzugehen
    btnStart.addEventListener('click', createDiagram); // Listener zum Starten der Baum-Visualisierung
    skipForwardButton.addEventListener('click', skipForward); // Listener, um einen Schritt nach vorne zu gehen

    // Eventlistener für das Verlassen des Tabs/Fensters, um die Berechnung zu stoppen
    window.addEventListener('blur', () => {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        stopFunction = true;

    });
});

// Variablen für die maximale Anzahl von Nebenbedingungen, den Solver und die Nebenbedingungen
const maxNebenbedingungen = 9;
let nebenbedingungCount = 2;
let bbSolver = null;
var nebenbedingungen = [];
var funktion = "";
let stopFunction = false;

// Funktion zum Hinzufügen einer neuen Nebenbedingung
function addConstraint() {
    const nebenbedingungenTable = document.getElementById('nebenbedingungen'); // Tabelle für die Nebenbedingungen
    if (nebenbedingungCount < maxNebenbedingungen) {
        nebenbedingungCount++; // Zähler der Nebenbedingungen erhöhen
        const neueZeile = document.createElement('tr'); // Neue Tabellenzeile für die Eingabe
        neueZeile.innerHTML = `
            <td><label for="nebenbedingung${nebenbedingungCount}">Nebenbedingung ${nebenbedingungCount}</label></td>
            <td><input type="text" id="nebenbedingung${nebenbedingungCount}"></td>
        `;
        nebenbedingungenTable.querySelector('tbody').appendChild(neueZeile);
    } else if (nebenbedingungCount === maxNebenbedingungen) {
        nebenbedingungCount++;
        const neueZeile = document.createElement('tr');
        neueZeile.innerHTML = `
            <td><label for="nebenbedingung${nebenbedingungCount}">Nebenbedingung ${nebenbedingungCount}</label></td>
            <td><input type="text" id="nebenbedingung${nebenbedingungCount}"></td>
        `;
        nebenbedingungenTable.querySelector('tbody').appendChild(neueZeile);
        btnZeichne.disabled = true; // Deaktiviere den Button zum Hinzufügen weiterer Bedingungen
    }
}

// Funktion zum Zurücksetzen des Baumes und der Eingabefelder
function reset() {

    const btnZeichne = document.getElementById('btnZeichne'); // Button zum Zeichnen
    const resetTree = document.getElementById('resetTree'); // Button zum Zurücksetzen


    if (bbSolver != null) {
        bbSolver.resetTree(); // Baum des Solvers zurücksetzen
        setBBSolver(null) // Solver auf null setzen
    }
    // Alle Eingabefelder aktivieren
    for (let i = 1; i <= nebenbedingungCount; i++) {
        const input = document.getElementById('nebenbedingung' + i);
        if (input != null) input.disabled = false;
    }
    document.getElementById('funktion').disabled = false; // Zielfunktionseingabe aktivieren
    btnZeichne.disabled = false; // Zeichnen-Button aktivieren
    resetTree.disabled = true; // Zurücksetzen-Button deaktivieren
    document.getElementById('diagramm').style.display = "none"; // Diagramm ausblenden
    document.getElementById('obereSchranke').innerHTML = ""; // Obere Schranke leeren
    document.getElementById('untereSchranke').innerHTML = "" // Untere Schranke leeren
    document.getElementById('momentanesErgebnis').innerHTML = "" // Aktuelles Ergebnis leeren
    document.getElementById('optimalesErgebnis').innerHTML = "" // Optimales Ergebnis leeren
    document.getElementById('anzahlLoesungen').innerHTML = "" // Anzahl der Lösungen leeren
    document.getElementById('prunedTrees').innerHTML = "" // Anzahl der beschnittenen Bäume leeren
}

// Funktion zur Überprüfung der Eingaben
function checkInputs() {
    $('#funktion').popover('dispose');
    const btnStart = document.getElementById('branchButton');
    const skipForwardButton = document.getElementById('skip-forward');
    const playButton = document.getElementById('btnStart');
    const skipBackwardButton = document.getElementById('skip-back');
    const funk = document.getElementById('funktion').value.trim().replace(/\s+/g, '');
    if(isLinear(funk)){
        if (funk) {
            btnStart.disabled = false; // Aktivieren, wenn eine Zielfunktion eingegeben wurde
            skipForwardButton.disabled = false;
            playButton.disabled = false;
            skipBackwardButton.disabled = false;
        return true;
        } else {
            btnStart.disabled = true; // Deaktivieren, wenn keine Zielfunktion vorhanden ist
            skipForwardButton.disabled = true;
            playButton.disabled = true;
            skipBackwardButton.disabled = true;
        }
        return false;
    }else{
         // Popover über dem Element mit der ID inputElementId anzeigen
         $('#funktion').popover({
            title: 'Ungültige Zielfunktion',
            content: 'Die Zielfunktion entspricht nicht der allgemeinen linearen Form',
            placement: 'top',
            trigger: 'focus',
            html: true
        }).popover('show');
        return false;
        
    }
}

function isLinear(expression) {
    try {
        const node = math.parse(expression);
        
        // Funktion, um zu prüfen, ob ein Knoten linear ist
        function checkNode(node) {
            if (node.isOperatorNode) {
                if (node.op === '+' || node.op === '-') {
                    return node.args.every(checkNode); // Überprüfe beide Operanden
                }
                if (node.op === '*') {
                    const [left, right] = node.args;
                    // Ein Term ist linear, wenn ein Teil konstant und der andere eine Variable ist
                    return (left.isConstantNode && right.isSymbolNode) ||
                           (right.isConstantNode && left.isSymbolNode);
                }
                return false;
            }
            // Erlaubte Typen sind Konstanten und Variablen
            return node.isConstantNode || node.isSymbolNode;
        }
        
        return checkNode(node);
    } catch (error) {
        return false;
    }
}

// Funktion, um die Benutzer-Eingaben zu sammeln
function getInputs() {
    const btnZeichne = document.getElementById('btnZeichne'); // Button zum Zeichnen
    const resetTree = document.getElementById('resetTree'); // Button zum Zurücksetzen
    nebenbedingungen = []; // Liste der Nebenbedingungen zurücksetzen
    $('#funktion').popover('dispose'); // Popover für unbeschränkte Variablen deaktivieren
    const funktionInput = document.getElementById('funktion'); // Eingabefeld für die Zielfunktion
    funktion = funktionInput.value.trim().replace(/\s+/g, ''); // Bereinigen der Eingabe
    funktion = funktion.replace(',', '.'); // Komma durch Punkt ersetzen
    var parsedFunction = Algebrite.run(`simplify(${funktion})`); // Vereinfachte Zielfunktion

    // Alle Nebenbedingungen aus den Eingabefeldern sammeln und deaktivieren
    for (let i = 1; i <= nebenbedingungCount; i++) {
        const input = document.getElementById('nebenbedingung' + i);
        if (input != null) input.disabled = true;
        if (input && input.value) {
            nebenbedingungen.push(input.value); // Bedingung zur Liste hinzufügen
        }
    }
    funktionInput.disabled = true; // Zielfunktionseingabe deaktivieren
    btnZeichne.disabled = true; // Button zum Zeichnen deaktivieren
    resetTree.disabled = false; // Button zum Zurücksetzen aktivieren
    return extractVariablesAndCoefficients(parsedFunction, nebenbedingungen); // Extraktion der Variablen und Koeffizienten
}

// Funktion zum Erstellen des Baums und der Diagramme
function createDiagram() {
    // Lade-Animation einblenden (siehe Performance Testergebnisse)
    document.getElementById('loader').style.display = 'block';

    // Asynchrone Berechnungen ausführen, um den UI-Thread nicht zu blockieren
    setTimeout(() => {
        var extractedInputs = getInputs(); // Eingaben holen
        if (!checkForUnboundedSolution(extractedInputs.variables, extractedInputs.constraintCoefficients, extractedInputs.constraintBounds, extractedInputs.constraintTypes)) {
            bbSolver = new BranchAndBound(extractedInputs.variables, extractedInputs.objectiveCoefficients, extractedInputs.constraintCoefficients, extractedInputs.constraintBounds, extractedInputs.constraintTypes, funktion);
            setBBSolver(bbSolver); // Solver speichern
            bbSolver.solve(); // Solver ausführen
            updateResults(bbSolver); // Ergebnisse aktualisieren
        } else {
            reset(); // Zurücksetzen, falls unbeschränkte Lösung
        }

        // Lade-Animation ausblenden, nachdem die Berechnungen abgeschlossen sind
        document.getElementById('loader').style.display = 'none';
    }, 50); // setTimeout, um sicherzustellen, dass der Loader angezeigt wird, bevor die Berechnungen starten
}

// Funktion zum Vorwärts-Springen zur nächsten Iteration
function skipForward() {
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    if (bbSolver) {
        bbSolver.iterate(); // Nächste Iteration des Solvers
        updateResults(bbSolver); // Ergebnisse aktualisieren
        stopFunction = true; // Ausführung stoppen
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    } else {
        var extractedInputs = getInputs();
        if (!checkForUnboundedSolution(extractedInputs.variables, extractedInputs.constraintCoefficients, extractedInputs.constraintBounds, extractedInputs.constraintTypes)) {

            bbSolver = new BranchAndBound(extractedInputs.variables, extractedInputs.objectiveCoefficients, extractedInputs.constraintCoefficients, extractedInputs.constraintBounds, extractedInputs.constraintTypes, funktion)
            setBBSolver(bbSolver);
            bbSolver.iterate();
            updateResults(bbSolver);
        } else {
            reset(); // Zurücksetzen, falls unbeschränkte Lösung
        }
    }
}

// Funktion zum automatischen Abspielen des Branch-and-Bound-Algorithmus
async function playBranchAndBound() {

    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const isPlaying = playIcon.style.display === 'none';
    if (isPlaying) {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        stopFunction = true;
    } else {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        stopFunction = false;
    }
    if (!bbSolver) {
        var extractedInputs = getInputs()
        if (!checkForUnboundedSolution(extractedInputs.variables, extractedInputs.constraintCoefficients, extractedInputs.constraintBounds, extractedInputs.constraintTypes)) {
            bbSolver = new BranchAndBound(extractedInputs.variables, extractedInputs.objectiveCoefficients, extractedInputs.constraintCoefficients, extractedInputs.constraintBounds, extractedInputs.constraintTypes, funktion)
            setBBSolver(bbSolver);
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            stopFunction = true;
            reset();
            return;
        }
    }

    while (bbSolver.iterations < bbSolver.maxIterations) {
        if (stopFunction) {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            break;
        }
        var end = bbSolver.iterate(); // Nächste Iteration
        updateResults(bbSolver); // Ergebnisse aktualisieren
        if (end == true) {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            break;
        }
        if (end != "pruned") await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Funktion zum Rückwärts-Springen zur vorherigen Iteration
function skipBackward() {

    let allNodes = bbSolver.nodes.get(); // Alle Knoten des Baums erhalten
    // Letzte Node und Edge erhalten
    let lastNode = allNodes[allNodes.length - 1];
    let lastNodeId = lastNode.id;
    if (lastNodeId == 1) {
        return; // Abbrechen, wenn kein Rücksprung möglich
    }

    let allEdges = bbSolver.edges.getIds();
    let lastEdgeId = allEdges[allEdges.length - 1];

    // Letzte Node und Edge entfernen
    bbSolver.network.body.data.nodes.remove(lastNodeId);
    bbSolver.network.body.data.edges.remove(lastEdgeId);

    // Node und Stack zurücksetzen
    bbSolver.iterations--;
    bbSolver.nodeIdCounter--;
    bbSolver.nodes.remove(lastNodeId);
    bbSolver.edges.remove(lastEdgeId);
    var historyStack = bbSolver.history.pop();
    bbSolver.stack = historyStack.stack;
    bbSolver.stack.push(historyStack.node)

    bbSolver.bestNodeId = historyStack.bestNodeId;
    bbSolver.bestSolution = historyStack.bestSolution;
    bbSolver.bestObjectiveValue = historyStack.bestObjectiveValue;
    bbSolver.lowerBound = historyStack.lowerBound;
    bbSolver.globalUpperBound = historyStack.globalUpperBound;
    bbSolver.possibleSolutions = historyStack.possibleSolutions;
    bbSolver.prunedTreeCount = historyStack.prunedTreeCount;

    // Beste Node aktualisieren
    if (bbSolver.bestNodeId) {
        bbSolver.nodes.update({
            id: bbSolver.bestNodeId,
            color: {
                background: '#c5e4d1',
                border: '#198754',
                highlight: {
                    background: '#c5e4d1',
                    border: '#198754'
                },
                hover: {
                    background: '#c5e4d1',
                    border: '#198754'
                }
            }
        });
    }

    // Baum fokussieren
    bbSolver.network.focus(lastNodeId - 1, {
        scale: 1.5,
        animation: {
            duration: 1000,
            easingFunction: "easeInOutQuad"
        }
    });

    updateResults(bbSolver); // Ergebnisse aktualisieren
}

// Funktion zur Überprüfung, ob eine Lösung unbeschränkt ist
function checkForUnboundedSolution(variables, constraintCoefficients, constraintBounds, constraintTypes) {

    const variableCount = variables.length;
    const constraintCount = constraintCoefficients.length;

    // Array, um zu speichern, ob eine Variable durch eine Bedingung eingeschränkt ist
    let boundedVariables = new Array(variableCount).fill(false);

    // Schleife über alle Constraints
    for (let i = 0; i < constraintCount; i++) {
        const coeffs = constraintCoefficients[i];
        const constraintType = constraintTypes[i];

        // Wenn es eine <= oder = Bedingung ist, könnte es eine obere Schranke geben
        if (constraintType === "<=" || constraintType === "=") {
            for (let j = 0; j < coeffs.length; j++) {
                const coeff = coeffs[j];

                // Wenn der Koeffizient positiv ist, schränkt es die entsprechende Variable nach oben ein
                if (coeff > 0) {
                    boundedVariables[j] = true;
                }
            }
        }
    }

    // Sammle alle unbeschränkten Variablen
    let unboundedVariables = [];
    for (let i = 0; i < variableCount; i++) {
        if (!boundedVariables[i]) {
            unboundedVariables.push(variables[i]);
        }
    }

    // Wenn es unbeschränkte Variablen gibt, zeige das Popover an
    if (unboundedVariables.length > 0) {
        const unboundedVarNames = unboundedVariables.join(', '); // Unbeschränkte Variablen in eine Liste umwandeln
        //Prüfen ob die Eingaben überhaupt zulässig sind
        if(checkInputs()){
        // Popover über dem Element mit der ID inputElementId anzeigen
        $('#funktion').popover({
            title: 'Unbeschränkte Lösung',
            content: 'Die folgenden Variablen sind unbeschränkt: ' + unboundedVarNames,
            placement: 'top',
            trigger: 'focus'
        }).popover('show');
    }
        return true;
    }

    return false;
}

// Funktion zum Aktualisieren der Ergebnisse auf der Benutzeroberfläche
function updateResults(bbSolver) {
    const obereSchrankeInput = document.getElementById('obereSchranke');
    const untereSchrankeInput = document.getElementById('untereSchranke');
    const momentanesErgebnisLabel = document.getElementById('momentanesErgebnis');
    const optimalesErgebnisLabel = document.getElementById('optimalesErgebnis');
    const anzahlLoesungenLabel = document.getElementById('anzahlLoesungen');
    const prunedTrees = document.getElementById('prunedTrees');

    obereSchrankeInput.innerHTML = bbSolver.bestObjectiveValue; // Obere Schranke setzen
    untereSchrankeInput.innerHTML = bbSolver.lowerBound; // Untere Schranke setzen
    if (bbSolver.bestSolution != null) {
        momentanesErgebnisLabel.innerHTML = JSON.stringify(bbSolver.bestSolution); // Aktuelle beste Lösung anzeigen
    } else {
        momentanesErgebnisLabel.innerHTML = "Kein Ergebnis gefunden";
    }
    optimalesErgebnisLabel.innerHTML = bbSolver.bestObjectiveValue; // Optimales Ergebnis setzen
    anzahlLoesungenLabel.innerHTML = bbSolver.possibleSolutions; // Anzahl der möglichen Lösungen setzen
    prunedTrees.innerHTML = bbSolver.prunedTreeCount; // Anzahl der beschnittenen Bäume setzen
}

// Funktion zur Speicherung des Solvers
function setBBSolver(solver) {
    bbSolver = solver;
}
// Export der Funktionen für die Verwendung in den Unit Tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BranchAndBound,
        extractVariablesAndCoefficients,
        addConstraint,
        reset,
        checkInputs,
        getInputs,
        createDiagram,
        skipForward,
        playBranchAndBound,
        skipBackward,
        checkForUnboundedSolution,
        updateResults,
        setBBSolver
    }
}
