class BranchAndBound {
    constructor(coefficents, constraints, funktion) {
        this.coefficents = coefficents;
        this.constraints = constraints;
        this.numVariables = Object.keys(coefficents).length;

        this.bestSolution = null;
        this.bestObjectiveValue = -Infinity;
        this.initialBounds = this.computeInitialBounds();
        this.nodes = new vis.DataSet([{ id: 1, label: `Max ` + funktion, title: 'Startpunkt' }]);
        this.edges = new vis.DataSet([]);
        this.nodeIdCounter = 2;
        this.lowerBound = Infinity;
        this.possibleSolutions = 0;
        this.globalUpperBound = Infinity;
        this.prunedTreeCount = 0;
        this.stack = [{ bounds: this.initialBounds, path: 'start', parentId: 1 }];
        this.iterations = 0;
        this.maxIterations = 500;
        this.createTree();
        this.network;
        this.bestNodeId = 0;
        this.history = [];
    }

    computeInitialBounds() {
        // Bestimme die Namen der Variablen
        const variableNames = Array.from(new Set(
            this.constraints.flatMap(constraint => Object.keys(constraint).filter(key => key !== 'rhs' && key !== 'inequality'))
        ));
    
        // Berechne die Schranken basierend auf den Constraints
        const bounds = this.calculateBoundsFromConstraints(this.constraints, variableNames);
    
        // Stelle sicher, dass die Obergrenzen unendlich bleiben, falls nicht durch andere Bedingungen begrenzt
        return bounds.map(bound => [bound[0], isFinite(bound[1]) ? bound[1] : Infinity]);
    }
    

    evaluateObjective(keyValuePairs) {
        let objectiveValue = 0;
    
        // Debugging-Ausgabe für keyValuePairs
        console.log('Key Value Pairs:', keyValuePairs);
    
        for (const [variable, coeff] of Object.entries(this.coefficents)) {
            // Finde das passende Pair für die aktuelle Variable
            const pair = keyValuePairs.find(pair => pair.variable === variable);
    
            // Debugging-Ausgabe für das gefundene Pair
            console.log(`Variable: ${variable}, Coefficient: ${coeff}`);
            console.log('Found pair:', pair);
    
            // Setze den Wert auf 0, wenn kein passendes Paar gefunden wurde
            const value = pair ? pair.value : 0;
    
            // Debugging-Ausgabe für den Wert
            console.log(`Value for ${variable}: ${value}`);
    
            objectiveValue += coeff * value;
        }
    
        console.log(`Objective Value: ${objectiveValue}`);
        return objectiveValue;
    }
    
    
    


    calculateBoundsFromConstraints(constraints, variableNames) {
        // Initialisiere die Schranken für jede Variable
        let bounds = Array(variableNames.length).fill(null).map(() => [0, Infinity]);
    
        // Erstelle eine Zuordnung von Variablennamen zu Indexen
        const variableIndexMap = variableNames.reduce((map, name, index) => {
            map[name] = index;
            return map;
        }, {});
    
        // Verarbeite jede Constraint
        constraints.forEach(constraint => {
            const { rhs, inequality, ...coefficients } = constraint;
    
            // Verarbeite jede Variable in der aktuellen Constraint
            for (const [varName, coeff] of Object.entries(coefficients)) {
                const varIndex = variableIndexMap[varName];
    
                if (varIndex !== undefined) {
                    if (coeff > 0) {
                        // Berechne die maximale Grenze
                        const maxVal = Math.floor(rhs / coeff);
                        bounds[varIndex][1] = Math.min(bounds[varIndex][1], maxVal);
                    } else if (coeff < 0) {
                        // Berechne die minimale Grenze
                        const minVal = Math.ceil(rhs / coeff);
                        bounds[varIndex][0] = Math.max(bounds[varIndex][0], minVal);
                    }
                }
            }
    
            // Behandle die Ungleichungsart
            switch (inequality) {
                case '=':
                    variableNames.forEach((_, varIndex) => {
                        if (bounds[varIndex][0] < rhs) {
                            bounds[varIndex][1] = bounds[varIndex][0] = Math.min(bounds[varIndex][1], rhs);
                        }
                    });
                    break;
                case '>=':
                    variableNames.forEach((_, varIndex) => {
                        if (bounds[varIndex][0] < rhs) {
                            bounds[varIndex][0] = rhs;
                        }
                    });
                    break;
                case '<=':
                    // Bei <=-Ungleichungen haben wir bereits die Obergrenze verarbeitet
                    break;
                default:
                    throw new Error(`Unbekannter Ungleichungstyp: ${inequality}`);
            }
        });
    
        return bounds;
    }

    calculateUpperBound() {
        // Bestimme die Namen der Variablen
        const variableNames = Array.from(new Set(
            this.constraints.flatMap(constraint => Object.keys(constraint).filter(key => key !== 'rhs' && key !== 'inequality'))
        ));
    
        // Berechne die Schranken basierend auf den Constraints
        const bounds = this.calculateBoundsFromConstraints(this.constraints, variableNames);
    
        // Berechne die obere Schranke basierend auf den berechneten Grenzen und den Koeffizienten
        const upperBound = bounds.reduce((sum, [low, high], index) => {
            const varName = variableNames[index];
            const coefficient = this.coefficents[varName] || 0; // Koeffizienten aus this.coefficents abrufen
            return sum + high * coefficient;
        }, 0);
    
        return upperBound;
    }
    
    
    


    solve(maxIterations) {
        while (this.stack.length > 0 && this.iterations < this.maxIterations) {
            this.iterate();
        }
    }

    satisfiesConstraints(keyValuePairs) {
        console.log(keyValuePairs);
    
        // Konvertiere keyValuePairs in ein Map für schnellen Zugriff
        const valuesMap = new Map(keyValuePairs.map(pair => [pair.variable, pair.value]));
    
        for (let i = 0; i < this.constraints.length; i++) {
            const constraint = this.constraints[i];
            let lhs = 0;
    
            // Berechne den LHS der Bedingung
            for (const [variable, coeff] of Object.entries(constraint)) {
                if (variable !== 'rhs' && variable !== 'inequality') {
                    const value = valuesMap.get(variable) || 0; // Hole den Wert der Variablen aus der Map
                    lhs += coeff * value;
                }
            }
    
            // Hole den Typ der Bedingung und den Wert der rechten Seite (rhs)
            const constraintType = constraint.inequality;
            const bound = constraint.rhs;
            let satisfied;
    
            // Überprüfe, ob die Bedingung erfüllt ist
            switch (constraintType) {
                case '<=':
                    satisfied = lhs <= bound;
                    break;
                case '>=':
                    satisfied = lhs >= bound;
                    break;
                case '<':
                    satisfied = lhs < bound;
                    break;
                case '>':
                    satisfied = lhs > bound;
                    break;
                default:
                    throw new Error(`Unsupported constraint type: ${constraintType}`);
            }
    
            // Falls eine Bedingung nicht erfüllt ist, kann die Funktion direkt false zurückgeben
            if (!satisfied) {
                return false;
            }
        }
    
        // Alle Bedingungen sind erfüllt
        return true;
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
        if (currentNode && currentNode.color && currentNode.color.background === '#4d4848') {
            console.log(`Abbrechen: Parent Node ${node.parentId} ist schwarz.`);
            return "pruned"; // Funktion beenden, wenn die Parent-Node schwarz ist
        }
        this.history.push({
            stack: [...this.stack],
            node: node,
        });
    
        // Berechne den Mittelpunkt der Schranken
        const midpoint = bounds.map(([low, high]) => Math.floor((low + high) / 2));
        
        // Erstelle eine eindeutige ID für den neuen Knoten
        const nodeId = this.nodeIdCounter++;
        
        // Erstelle ein Label für den neuen Knoten
        const variableNames = Object.keys(this.coefficents);
        const label = midpoint.map((value, index) => `${variableNames[index]} = ${value}`).join(', ');
    
        // Erstelle keyValuePairs als Array von Objekten
        const keyValuePairs = midpoint.map((value, index) => ({
            variable: variableNames[index],
            value: value
        }));
        console.log('Key Value Pairs 1:', keyValuePairs);
    
        // Füge den neuen Knoten zum Graphen hinzu
        this.nodes.add({ id: nodeId, label: label, title: label });
        
        // Erstelle die Kantenoptionen
        let edgeOptions = { from: node.parentId, to: nodeId };
    
        // Berechne den oberen Grenzwert
        var upperBound = this.calculateUpperBound(bounds);
        if (this.explore(midpoint)) {
            console.log(`Iteration ${this.iterations + 1}: Current best solution: ${JSON.stringify(this.bestSolution)}, Objective: ${this.bestObjectiveValue}`);
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
        } else if (!this.satisfiesConstraints(keyValuePairs)) {
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
    
        this.network.focus(nodeId, {
            scale: 1.5,
            animation: {
                duration: 1000,
                easingFunction: "easeInOutQuad"
            }
        });
    
        // Teilen der Schranken für die nächste Iteration
        bounds.forEach((bound, index) => {
            const [low, high] = bound;
            const mid = midpoint[index];
    
            if (low <= mid - 1) {
                const newBounds = bounds.map((b, i) => i === index ? [low, mid - 1] : b);
                this.stack.push({ bounds: newBounds, path: `${node.path} -> ${variableNames[index]} <= ${mid - 1}`, parentId: nodeId });
            }
    
            if (mid + 1 <= high) {
                const newBounds = bounds.map((b, i) => i === index ? [mid + 1, high] : b);
                this.stack.push({ bounds: newBounds, path: `${node.path} -> ${variableNames[index]} >= ${mid + 1}`, parentId: nodeId });
            }
        });
    
        this.iterations++;
        this.lowerBound = Math.min(this.lowerBound, this.evaluateObjective(keyValuePairs));
        this.possibleSolutions = this.stack.length;
    
        this.globalUpperBound = Math.max(this.globalUpperBound, upperBound);
    }
    



    iterateWithoutTree() {


        const node = this.stack.pop();
        const bounds = node.bounds;

        const currentNode = this.nodes.get(node.parentId);
        if (currentNode && currentNode.color && currentNode.color.background === '#4d4848') {
            return "pruned";
        }

        const midpoint = bounds.map(([low, high]) => Math.floor((low + high) / 2));
        const nodeId = this.nodeIdCounter++;
        const label = midpoint.map((value, index) => `x${index + 1} = ${value}`).join(', ');
        this.nodes.add({ id: nodeId, label: label, title: label });

        var upperBound = this.calculateUpperBound(bounds);

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
        this.lowerBound = Math.min(this.lowerBound, this.evaluateObjective(keyValuePairs));
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

function parseObjectiveFunction(lhs) {
    const regex = /([+-]?\d*\.?\d*)([a-zA-Z]+)/g;
    let match;
    const coefficients = [];
    const variables = [];

    while ((match = regex.exec(lhs)) !== null) {
        const coefficient = parseFloat(match[1]) || (match[1] === '-' ? -1 : 1);
        const variable = match[2];
        coefficients.push(coefficient);
        variables.push(variable);
    }
    return { coefficients, variables };
}

function extractVariablesAndCoefficients(objectiveFunction, constraints) {
    function parseCoefficient(coefficientStr) {
        // Erkenne und verarbeite Brüche wie '4/5'
        if (coefficientStr.includes('/')) {
            const [numerator, denominator] = coefficientStr.split('/').map(Number);
            return numerator / denominator;
        }
        return parseFloat(coefficientStr) || (coefficientStr === '-' ? -1 : 1);
    }

    function extractFromExpression(expression) {
        // Erweitere den regulären Ausdruck, um auch '*' zu berücksichtigen
        const regex = /([+-]?\d*\.?\d*\/?\d*\.?\d*)\*?([a-zA-Z]+)/g;
        let match;
        const variableMap = new Map();

        while ((match = regex.exec(expression)) !== null) {
            const coefficient = parseCoefficient(match[1]);
            const variable = match[2];
            variableMap.set(variable, coefficient);
        }

        return variableMap;
    }

    // Extrahiere Variablen und Koeffizienten aus der Zielfunktion
    const objectiveFunctionMap = extractFromExpression(objectiveFunction);
    console.log("Objective Function Variables and Coefficients:");
    console.log(Object.fromEntries(objectiveFunctionMap));

    // Extrahiere Variablen, Koeffizienten und Ungleichungsart aus den Nebenbedingungen
    var allConstraints = [];
    constraints.forEach((constraint, index) => {
        // Extrahiere die Art der Ungleichung und den rechten Wert
        const match = constraint.match(/^(.*?)(<=|>=|=)(.*)$/);
        if (match) {
            const [_, lhs, inequality, rhs] = match;

            const constraintMap = extractFromExpression(lhs.trim());

            // Speichere den Grenzwert der Ungleichung in der Map
            constraintMap.set('rhs', parseFloat(rhs.trim()));

            // Füge die Ungleichungsart hinzu
            constraintMap.set('inequality', inequality);

            console.log(`Constraint ${index + 1} Variables, Coefficients, and Inequality Type:`);
            console.log(Object.fromEntries(constraintMap));
            allConstraints.push(Object.fromEntries(constraintMap))
        } else {
            console.error(`Constraint ${index + 1} could not be parsed: ${constraint}`);
        }
    });
    return [Object.fromEntries(objectiveFunctionMap), allConstraints];
}
document.addEventListener('DOMContentLoaded', function () {
    const btnStart = document.getElementById('branchButton');
    const skipForwardButton = document.getElementById('skip-forward');
    const playButton = document.getElementById('btnStart');
    const skipBackwardButton = document.getElementById('skip-back');
    const addConditionBtn = document.getElementById('addConditionBtn');
    let bbSolver = null;
    var nebenbedingungen = [];
    var funktion = "";
    let stopFunction = false;
    const maxNebenbedingungen = 9;
    const nebenbedingungenTable = document.getElementById('nebenbedingungen');
    const btnZeichne = document.getElementById('btnZeichne');
    let nebenbedingungCount = 2;

    function getInputs() {
        funktion = document.getElementById('funktion').value.trim().replace(/\s+/g, '');
        funktion = funktion.replace(',', '.');
        const parsedFunc = Algebrite.run(`simplify(${funktion})`);
        console.log(parsedFunc)
        for (let i = 1; i <= nebenbedingungCount; i++) {
            const input = document.getElementById('nebenbedingung' + i);
            if (input && input.value) {
                var parsedNebenbedingung =  simplifyInequality(input.value);
                console.log(parsedNebenbedingung)
                nebenbedingungen.push(parsedNebenbedingung);
            }
        }
        return extractVariablesAndCoefficients(parsedFunc, nebenbedingungen);
    }

    function simplifyInequality(ungleichung) {
        // Zerlegen der Ungleichung in linke und rechte Seite und das Ungleichheitszeichen
        let match = ungleichung.match(/(.*?)(<=|>=|<|>)(.*)/);
        if (!match) {
            throw new Error("Ungültige Ungleichung");
        }
    
        let leftSide = match[1].trim();
        let operator = match[2];
        let rightSide = match[3].trim();
    
        // Beide Seiten vereinfachen
        let simplifiedLeft = Algebrite.run(`simplify(${leftSide})`);
        let simplifiedRight = Algebrite.run(`simplify(${rightSide})`);
    
        // Zusammenfügen der vereinfachten Seiten
        let simplifiedInequality = `${simplifiedLeft} ${operator} ${simplifiedRight}`;
        
        return simplifiedInequality;
    }

    btnZeichne.addEventListener('click', function () {
        if (nebenbedingungCount < maxNebenbedingungen) {
            nebenbedingungCount++;
            const neueZeile = document.createElement('tr');
            neueZeile.innerHTML = `
                <td><label for="nebenbedingung${nebenbedingungCount}">Nebenbedingung ${nebenbedingungCount}</label></td>
                <td><input type="text" id="nebenbedingung${nebenbedingungCount}"></td>
            `;
            nebenbedingungenTable.querySelector('tbody').appendChild(neueZeile);
        } else if (nebenbedingungCount = maxNebenbedingungen) {
            nebenbedingungCount++;
            const neueZeile = document.createElement('tr');
            neueZeile.innerHTML = `
                <td><label for="nebenbedingung${nebenbedingungCount}">Nebenbedingung ${nebenbedingungCount}</label></td>
                <td><input type="text" id="nebenbedingung${nebenbedingungCount}"></td>
            `;
            nebenbedingungenTable.querySelector('tbody').appendChild(neueZeile);
            btnZeichne.disabled = true;
        }
    });

    btnStart.addEventListener('click', function () {

        getInputs()

        const maxIterations = 500;

        bbSolver = new BranchAndBound(coefficients, constraintsCoefficients, constraintsBounds, constraintTypes, funktion);
        bbSolver.solve(maxIterations);

        updateResults(bbSolver);
    });

    skipForwardButton.addEventListener('click', function () {
        if (bbSolver) {
            bbSolver.iterate();
            updateResults(bbSolver);
        } else {
            var input = getInputs()
            var coefficents = input[0]
            var constraints = input[1]
            console.log("Koeffizienten und Constraints vor der Baumerstellung: "+coefficents+ " : "+ constraints)
            bbSolver = new BranchAndBound(coefficents, constraints, funktion);
            bbSolver.iterate();
            updateResults(bbSolver);
        }
    });
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    playButton.addEventListener('click', async () => {
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
            getInputs()
            erstelleAbweichungsdiagramm()
            bbSolver = new BranchAndBound(coefficients, constraintsCoefficients, constraintsBounds, constraintTypes, funktion);
        }
        var i = 0;
        while (i < 500) {
            if (stopFunction) {
                break;
            }
            i++;
            var end = bbSolver.iterate();
            updateResults(bbSolver);
            if (end == true) {
                break;
            }
            if (end != "pruned") await new Promise(resolve => setTimeout(resolve, 1000));

        }
    });

    skipBackwardButton.addEventListener('click', function () {

        let allNodes = bbSolver.nodes.get();

        // Letzte Node und Edge erhalten
        let lastNode = allNodes[allNodes.length - 1];
        let lastNodeId = lastNode.id;
        if (lastNodeId <= 1) {
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

        bbSolver.network.focus(lastNodeId - 1, {
            scale: 1.5,
            animation: {
                duration: 1000,
                easingFunction: "easeInOutQuad"
            }
        });

        updateResults(bbSolver);
    });



    function updateResults(bbSolver) {
        const obereSchrankeInput = document.getElementById('obereSchranke');
        const untereSchrankeInput = document.getElementById('untereSchranke');
        const momentanesErgebnisLabel = document.getElementById('momentanesErgebnis');
        const optimalesErgebnisLabel = document.getElementById('optimalesErgebnis');
        const anzahlLoesungenLabel = document.getElementById('anzahlLoesungen');
        const prunedTrees = document.getElementById('prunedTrees');

        obereSchrankeInput.innerHTML = bbSolver.bestObjectiveValue;
        untereSchrankeInput.innerHTML = bbSolver.lowerBound;
        momentanesErgebnisLabel.innerHTML = JSON.stringify(bbSolver.bestSolution);
        optimalesErgebnisLabel.innerHTML = bbSolver.bestObjectiveValue;
        anzahlLoesungenLabel.innerHTML = bbSolver.possibleSolutions;
        prunedTrees.innerHTML = bbSolver.prunedTreeCount;
    }

    function erstelleAbweichungsdiagramm() {
        return;
        if (document.getElementById('diagramm').style.display == "inline") {
            return;
        }
        var currentSolutions = [];
        tempSolver = new BranchAndBound(coefficients, constraintsCoefficients, constraintsBounds, constraintTypes, funktion);
        for (var i = 1; i <= 100; i++) {
            var end = tempSolver.iterate()
            currentSolutions.push(tempSolver.bestObjectiveValue)
            if (end == true) {
                break;
            }
        }
        var bestSolution = tempSolver.bestObjectiveValue;
        var numberOfIterations = currentSolutions.length;
        var fehlerWerte = [];
        var iterations = [];
        for (var i = 1; i <= numberOfIterations; i++) {
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
    }

    window.addEventListener('blur', () => {
        stopFunction = true;
    });
});