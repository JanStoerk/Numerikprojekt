class BranchAndBound {
    constructor(variables, objectiveCoefficients, constraintsCoefficients, constraintsBounds, constraintTypes, fx) {
        this.bestSolution = null;
        this.variables = variables;
        this.bestObjectiveValue = -Infinity;
        this.objectiveCoefficients = objectiveCoefficients;
        this.constraintsCoefficients = constraintsCoefficients;
        this.constraintsBounds = constraintsBounds;
        this.constraintTypes = constraintTypes;
        this.numVariables = objectiveCoefficients.length;
        this.initialBounds = this.computeInitialBounds();
        this.nodes = new vis.DataSet([{ id: 1, label: `Max ` + fx, title: 'Startpunkt' }]);
        this.edges = new vis.DataSet([]);
        this.nodeIdCounter = 2;
        this.lowerBound = Infinity;
        this.possibleSolutions = 0;
        this.globalUpperBound = Infinity;
        this.prunedTreeCount = 0;
        this.stack = [{ bounds: this.initialBounds, path: 'start', parentId: 1 }];
        this.iterations = 0;
        this.maxIterations = 200;
        this.createTree();
        this.network;
        this.bestNodeId = null;
        this.history = [];
        this.skipAnimation;
    }

    resetTree() {
        this.network.setData({ nodes: [], edges: [] });
    }

    computeInitialBounds() {
        let bounds = Array(this.numVariables).fill(null).map(() => [0, Infinity]);

        this.constraintsCoefficients.forEach((constraint, constraintIndex) => {
            const rhs = this.constraintsBounds[constraintIndex];
            const constraintType = this.constraintTypes[constraintIndex];

            constraint.forEach((coeff, varIndex) => {
                if (coeff !== 0 && varIndex < this.numVariables) {
                    const boundValue = Math.floor(rhs / coeff);

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

        return bounds.map(bound => [
            isFinite(bound[0]) ? bound[0] : Math.floor(-10 * this.objectiveCoefficients[bounds.length - 1]),
            isFinite(bound[1]) ? bound[1] : Math.floor(10 * this.objectiveCoefficients[bounds.length - 1])
        ]);
    }


    evaluateObjective(solution) {
        return this.objectiveCoefficients.reduce((sum, coeff, index) => sum + coeff * solution[index], 0);
    }


    calculateUpperBound(bounds) {
        const upperBound = bounds.reduce((sum, [low, high], index) => sum + high * this.objectiveCoefficients[index], 0);
        return upperBound;
    }


    solve() {
        this.skipAnimation = true;
        var currentSolutions = [];
        while (this.stack.length > 0 && this.iterations < this.maxIterations) {
            this.iterate();
            currentSolutions.push(this.bestObjectiveValue)
        }
        var bestSolution = this.bestObjectiveValue;
        var numberOfIterations = currentSolutions.length;
        var fehlerWerte = [];
        var iterations = [];
        for (var i = 0; i <= numberOfIterations; i++) {
            fehlerWerte.push(Math.abs(bestSolution - currentSolutions[i]))
            iterations.push(i);
        }
        console.log(fehlerWerte)

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

        Plotly.newPlot('diagramm', [trace], layout, config);

        document.getElementById('diagramm').style.display = "inline";
        this.skipAnimation = false;
    }

    satisfiesConstraints(solution) {
        console.log(solution);
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

            console.log(`Constraint ${index}: ${lhs} ${constraintType} ${rhs} -> ${satisfied}`);
            return satisfied;
        });

        console.log("AllSatisfied: " + allSatisfied);
        return allSatisfied;
    }


    iterate() {

        if (this.stack.length === 0 || this.iterations >= this.maxIterations) {
            this.network.fit({
                animation: {
                    duration: 1000,
                    easingFunction: "easeInOutQuad"
                }
            });
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
            return true;
        }

        const node = this.stack.pop();
        const bounds = node.bounds;

        const currentNode = this.nodes.get(node.parentId);
        console.log("Parent: " + node.parentId)
        if (currentNode && currentNode.color && currentNode.color.background === '#4d4848') {
            console.log(`Abbrechen: Parent Node ${node.parentId} ist schwarz.`);

            this.iterate() // Funktion beenden, wenn die Parent-Node schwarz ist
            return;
        }
        this.history.push({
            stack: [...this.stack],
            node: node,
            bestObjectiveValue: this.bestObjectiveValue,
            bestSolution: this.bestSolution,
            bestNodeId: this.bestNodeId,
            lowerBound: this.lowerBound,
            globalUpperBound: this.globalUpperBound

        });

        const midpoint = bounds.map(([low, high]) => Math.floor((low + high) / 2));
        const nodeId = this.nodeIdCounter++;
        const label = midpoint.map((value, index) => `${this.variables[index]} = ${value}`).join(', ');
        const keyValuePairs = midpoint.map((value) => [value]);
        this.nodes.add({ id: nodeId, label: label, title: label });
        let edgeOptions = { from: node.parentId, to: nodeId };

        var upperBound = this.calculateUpperBound(bounds);
        if (this.explore(midpoint)) {
            console.log(`Iteration ${this.iterations + 1}: Current best solution: ${JSON.stringify(this.bestSolution)}, Objective: ${this.bestObjectiveValue}`);
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
            this.bestNodeId = nodeId;
        } else if (upperBound <= this.bestObjectiveValue) {
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
            this.prunedTreeCount++;
        }
        else if (!this.satisfiesConstraints(keyValuePairs)) {
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
            edgeOptions.color = { color: 'blue' };
            edgeOptions.color.highlight = 'blue';
            edgeOptions.color.hover = 'blue';
        }

        this.edges.add(edgeOptions);
        if (!this.skipAnimation) {
            this.network.focus(nodeId, {
                scale: 1.5,
                animation: {
                    duration: 1000,
                    easingFunction: "easeInOutQuad"
                }
            });
        }
        bounds.forEach((bound, index) => {
            const [low, high] = bound;
            const mid = midpoint[index];

            if (low <= mid - 1) {
                const newBounds = bounds.map((b, i) => i === index ? [low, mid - 1] : b);
                this.stack.push({ bounds: newBounds, path: `${node.path} -> x${index + 1} <= ${mid - 1}`, parentId: nodeId });
            }

            if (mid + 1 <= high) {
                const newBounds = bounds.map((b, i) => i === index ? [mid + 1, high] : b);
                this.stack.push({ bounds: newBounds, path: `${node.path} -> x${index + 1} >= ${mid + 1}`, parentId: nodeId });
            }
        });

        this.iterations++;
        this.lowerBound = Math.min(this.lowerBound, this.evaluateObjective(midpoint));
        this.possibleSolutions = this.stack.length;

        this.globalUpperBound = Math.max(this.globalUpperBound, upperBound);
    }

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
                    avoidOverlap: 1,
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
                bounce: 0.1,
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

        this.network = new vis.Network(container, data, options);
    }

}
function extractVariablesAndCoefficients(objectiveFunction, constraints) {
    console.log(constraints);

    function parseCoefficient(coefficientStr) {
        // Erkenne und verarbeite Brüche wie '4/5'
        if (coefficientStr.includes('/')) {
            const [numerator, denominator] = coefficientStr.split('/').map(Number);
            return numerator / denominator;
        }
        // Falls der Koeffizient leer ist, dann ist der Wert 1 (für z.B. 'x' ohne Koeffizient)
        if (coefficientStr === '' || coefficientStr === '+') return 1;
        if (coefficientStr === '-') return -1;
        return parseFloat(coefficientStr) || 0;
    }

    function extractFromExpression(expression) {
        // Erweitere den regulären Ausdruck, um auch negative Koeffizienten und Leerzeichen zu berücksichtigen
        // Verarbeite sowohl positive als auch negative Koeffizienten
        const regex = /([+-]?\s*\d*\.?\d*\/?\d*\.?\d*)\s*([a-zA-Z]+)/g;
        let match;
        const variableMap = new Map();

        while ((match = regex.exec(expression)) !== null) {
            const coefficient = parseCoefficient(match[1].replace(/\s+/g, '')); // Entferne Leerzeichen aus dem Koeffizienten
            const variable = match[2];
            variableMap.set(variable, coefficient);
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
    console.log(objectiveValues);

    // Arrays für Constraints
    const constraintTypes = [];
    const constraintCoefficients = [];
    const constraintBounds = [];

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
    console.log(constraintCoefficients);

    // Rückgabe der Arrays
    return {
        variables: sortedKeys,
        objectiveCoefficients: objectiveValues,
        constraintTypes: constraintTypes,
        constraintCoefficients: constraintCoefficients,
        constraintBounds: constraintBounds
    };
}


document.addEventListener('DOMContentLoaded', function () {
    const btnStart = document.getElementById('branchButton');
    const skipForwardButton = document.getElementById('skip-forward');
    const playButton = document.getElementById('btnStart');
    const skipBackwardButton = document.getElementById('skip-back');
    const btnZeichne = document.getElementById('btnZeichne');
    const resetTree = document.getElementById('resetTree');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    btnZeichne.addEventListener('click', addConstraint);
    resetTree.addEventListener('click', reset);
    document.getElementById('funktion').addEventListener('input', checkInputs);
    playButton.addEventListener('click', playBranchAndBound);
    skipBackwardButton.addEventListener('click', skipBackward);
    btnStart.addEventListener('click', createDiagram);
    skipForwardButton.addEventListener('click', skipForward);

    window.addEventListener('blur', () => {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        stopFunction = true;

    });
});

const maxNebenbedingungen = 9;
let nebenbedingungCount = 2;
let bbSolver = null;
var nebenbedingungen = [];
var funktion = "";
let stopFunction = false;

function addConstraint() {
    const nebenbedingungenTable = document.getElementById('nebenbedingungen');
    if (nebenbedingungCount < maxNebenbedingungen) {
        nebenbedingungCount++;
        const neueZeile = document.createElement('tr');
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
        btnZeichne.disabled = true;
    }
}

function reset() {

    const btnZeichne = document.getElementById('btnZeichne');
    const resetTree = document.getElementById('resetTree');


    if (bbSolver != null) {
        bbSolver.resetTree();
        setBBSolver(null)
    }
    for (let i = 1; i <= nebenbedingungCount; i++) {
        const input = document.getElementById('nebenbedingung' + i);
        if (input != null) input.disabled = false;
    }
    document.getElementById('funktion').disabled = false;
    btnZeichne.disabled = false;
    resetTree.disabled = true;
    document.getElementById('diagramm').style.display = "none";
    document.getElementById('obereSchranke').innerHTML = "";
    document.getElementById('untereSchranke').innerHTML = ""
    document.getElementById('momentanesErgebnis').innerHTML = ""
    document.getElementById('optimalesErgebnis').innerHTML = ""
    document.getElementById('anzahlLoesungen').innerHTML = ""
    document.getElementById('prunedTrees').innerHTML = ""
}

function checkInputs() {
    const btnStart = document.getElementById('branchButton');
    if (document.getElementById('funktion').value.trim().replace(/\s+/g, '')) {
        btnStart.disabled = false;
    } else {
        btnStart.disabled = true;
    }
}


function getInputs() {
    const btnZeichne = document.getElementById('btnZeichne');
    const resetTree = document.getElementById('resetTree');
    nebenbedingungen = [];
    $('#funktion').popover('dispose');
    const funktionInput = document.getElementById('funktion');
    funktion = funktionInput.value.trim().replace(/\s+/g, '');
    funktion = funktion.replace(',', '.');
    var parsedFunction = Algebrite.run(`simplify(${funktion})`);

    for (let i = 1; i <= nebenbedingungCount; i++) {
        const input = document.getElementById('nebenbedingung' + i);
        if (input != null) input.disabled = true;
        if (input && input.value) {
            nebenbedingungen.push(input.value);
        }
    }
    funktionInput.disabled = true;
    btnZeichne.disabled = true;
    resetTree.disabled = false;
    return extractVariablesAndCoefficients(parsedFunction, nebenbedingungen);
}

function createDiagram() {

    var extractedInputs = getInputs()
    if (!checkForUnboundedSolution(extractedInputs.variables, extractedInputs.constraintCoefficients, extractedInputs.constraintBounds, extractedInputs.constraintTypes)) {
        bbSolver = new BranchAndBound(extractedInputs.variables, extractedInputs.objectiveCoefficients, extractedInputs.constraintCoefficients, extractedInputs.constraintBounds, extractedInputs.constraintTypes, funktion)
        setBBSolver(bbSolver);
        bbSolver.solve();
        updateResults(bbSolver);
    } else {
        reset();
    }
}

function skipForward() {
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    if (bbSolver) {
        bbSolver.iterate();
        updateResults(bbSolver);
        stopFunction = true;
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    } else {
        console.log(bbSolver)
        var extractedInputs = getInputs();
        if (!checkForUnboundedSolution(extractedInputs.variables, extractedInputs.constraintCoefficients, extractedInputs.constraintBounds, extractedInputs.constraintTypes)) {

            bbSolver = new BranchAndBound(extractedInputs.variables, extractedInputs.objectiveCoefficients, extractedInputs.constraintCoefficients, extractedInputs.constraintBounds, extractedInputs.constraintTypes, funktion)
            setBBSolver(bbSolver);
            bbSolver.iterate();
            updateResults(bbSolver);
        } else {
            reset();
        }
    }
}

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
        var end = bbSolver.iterate();
        updateResults(bbSolver);
        if (end == true) {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            break;
        }
        if (end != "pruned") await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

function skipBackward() {

    let allNodes = bbSolver.nodes.get();
    console.log(allNodes)
    // Letzte Node und Edge erhalten
    let lastNode = allNodes[allNodes.length - 1];
    let lastNodeId = lastNode.id;
    console.log(lastNodeId)
    if (lastNodeId == 1) {
        return;
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

    if (!bbSolver.bestNodeId == null) {
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

    bbSolver.network.focus(lastNodeId - 1, {
        scale: 1.5,
        animation: {
            duration: 1000,
            easingFunction: "easeInOutQuad"
        }
    });

    updateResults(bbSolver);
}

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

        // Popover über dem Element mit der ID inputElementId anzeigen
        $('#funktion').popover({
            title: 'Unbeschränkte Lösung',
            content: 'Die folgenden Variablen sind unbeschränkt: ' + unboundedVarNames,
            placement: 'top',
            trigger: 'focus'
        }).popover('show');

        return true;
    }

    return false;
}


function updateResults(bbSolver) {
    const obereSchrankeInput = document.getElementById('obereSchranke');
    const untereSchrankeInput = document.getElementById('untereSchranke');
    const momentanesErgebnisLabel = document.getElementById('momentanesErgebnis');
    const optimalesErgebnisLabel = document.getElementById('optimalesErgebnis');
    const anzahlLoesungenLabel = document.getElementById('anzahlLoesungen');
    const prunedTrees = document.getElementById('prunedTrees');

    obereSchrankeInput.innerHTML = bbSolver.bestObjectiveValue;
    untereSchrankeInput.innerHTML = bbSolver.lowerBound;
    if (bbSolver.bestSolution != null) {
        momentanesErgebnisLabel.innerHTML = JSON.stringify(bbSolver.bestSolution);
    } else {
        momentanesErgebnisLabel.innerHTML = "Kein Ergebnis gefunden";
    }
    optimalesErgebnisLabel.innerHTML = bbSolver.bestObjectiveValue;
    anzahlLoesungenLabel.innerHTML = bbSolver.possibleSolutions;
    prunedTrees.innerHTML = bbSolver.prunedTreeCount;
}

function setBBSolver(solver) {
    bbSolver = solver;
}
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