class BranchAndBound {
    constructor(objectiveCoefficients, constraintsCoefficients, constraintsBounds, fx) {
        this.bestSolution = null;
        this.bestObjectiveValue = -Infinity;
        this.objectiveCoefficients = objectiveCoefficients;
        this.constraintsCoefficients = constraintsCoefficients;
        this.constraintsBounds = constraintsBounds;
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
        this.maxIterations = 100;
        this.createTree();
        this.network;
        this.bestNodeId = 0;
        this.history=[];
    }

    computeInitialBounds() {
        let bounds = Array(this.numVariables).fill(null).map(() => [0, Infinity]);
        this.constraintsCoefficients.forEach((constraint, constraintIndex) => {
            constraint.forEach((coeff, varIndex) => {
                if (coeff > 0 && varIndex < this.numVariables) {
                    const maxVal = Math.floor(this.constraintsBounds[constraintIndex] / coeff);
                    bounds[varIndex][1] = Math.min(bounds[varIndex][1], maxVal);
                }
            });
        });
        return bounds.map(bound => [bound[0], isFinite(bound[1]) ? bound[1] : Math.floor(10 * this.objectiveCoefficients[bounds.length - 1])]);
    }

    evaluateObjective(solution) {
        return this.objectiveCoefficients.reduce((sum, coeff, index) => sum + coeff * solution[index], 0);
    }


    calculateUpperBound(bounds) {
        const upperBound = bounds.reduce((sum, [low, high], index) => sum + high * this.objectiveCoefficients[index], 0);
        return upperBound;
    }


    solve(maxIterations) {
        while (this.stack.length > 0 && this.iterations < this.maxIterations) {
            this.iterate();
        }
    }

    satisfiesConstraints(solution) {
        console.log(solution)
        const allSatisfied = this.constraintsCoefficients.every((coeffs, index) => {

            const lhs = coeffs.reduce((sum, coeff, varIndex) =>
                sum + coeff * solution[varIndex], 0);
            const satisfied = lhs <= this.constraintsBounds[index];
            console.log(`Constraint ${index}: ${lhs} <= ${this.constraintsBounds[index]} -> ${satisfied}`);
            return satisfied;
        });
        console.log("AllSatisfied: " + allSatisfied)
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
            return true;
        }

        const node = this.stack.pop();
        const bounds = node.bounds;

        const currentNode = this.nodes.get(node.parentId);
        console.log("Parent: " + node.parentId)
        if (currentNode && currentNode.color && currentNode.color.background === '#4d4848') {
            console.log(`Abbrechen: Parent Node ${node.parentId} ist schwarz.`);
            return "pruned"; // Funktion beenden, wenn die Parent-Node schwarz ist
        }
        this.history.push({
            stack: [...this.stack], 
            node: node,
        });

        const midpoint = bounds.map(([low, high]) => Math.floor((low + high) / 2));
        const nodeId = this.nodeIdCounter++;
        const label = midpoint.map((value, index) => `x${index + 1} = ${value}`).join(', ');
        const keyValuePairs = midpoint.map((value) => [value]);
        this.nodes.add({ id: nodeId, label: label, title: label });
        let edgeOptions = { from: node.parentId, to: nodeId };

        var upperBound = this.calculateUpperBound(bounds);
        if (this.explore(midpoint)) {
            /*edgeOptions.color = { color: '#948715' };
            edgeOptions.color.highlight = '#948715';
            edgeOptions.color.hover = '#948715';
            this.nodes.update({
                id: nodeId,
                color: {
                    background: '#c9bd4b',
                    border: '#948715',
                    highlight: {
                        background: '#c9bd4b',
                        border: '#948715'
                    },
                    hover: {
                        background: '#c9bd4b',
                        border: '#948715'
                    }
                }
            });*/
            console.log(`Iteration ${this.iterations + 1}: Current best solution: ${JSON.stringify(this.bestSolution)}, Objective: ${this.bestObjectiveValue}`);
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

        this.network.focus(nodeId, {
            scale: 1.5,
            animation: {
                duration: 1000,
                easingFunction: "easeInOutQuad"
            }
        });

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

var allVariables = ['x', 'y'];

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


function parseConstraint(input) {

    input = input.replace(/\s+/g, '');

    const [lhs, rhs] = input.split('<=');
    const { coefficients, variables } = parseObjectiveFunction(lhs);

    const filledCoefficients = new Array(allVariables.length).fill(0);

    variables.forEach((variable, index) => {
        const varIndex = allVariables.indexOf(variable);
        if (varIndex !== -1) {
            filledCoefficients[varIndex] = coefficients[index];
        }
    });

    const bound = parseFloat(rhs);
    return { coefficients: filledCoefficients, variables: allVariables, bound };
}

document.addEventListener('DOMContentLoaded', function () {
    const btnStart = document.getElementById('branchButton');
    const skipForwardButton = document.getElementById('skip-forward');
    const playButton = document.getElementById('btnStart');
    const skipBackwardButton = document.getElementById('skip-back');
    const addConditionBtn = document.getElementById('addConditionBtn');
    let conditionCount = 3;
    let bbSolver = null;
    var nebenbedingungen = [];
    var constraintsCoefficients = [];
    var constraintsBounds = [];
    var coefficients = []
    var funktion = "";
    let stopFunction = false;

    function getInputs() {
        funktion = document.getElementById('funktion').value.trim().replace(/\s+/g, '');
        funktion = funktion.replace(',', '.');
        var parsedFunction = parseObjectiveFunction(funktion);
        coefficients = parsedFunction.coefficients;
        allVariables = parsedFunction.variables;
        console.log("Alle Variablen in der Funktion: " + allVariables)
        for (let i = 1; i <= conditionCount; i++) {
            const input = document.getElementById('nebenbedingung' + i);
            if (input && input.value) {
                nebenbedingungen.push(input.value);
                constraintsCoefficients.push(parseConstraint(input.value).coefficients)
                constraintsBounds.push(parseConstraint(input.value).bound)
            }
        }
    }

    btnStart.addEventListener('click', function () {

        getInputs()

        const maxIterations = 100;

        bbSolver = new BranchAndBound(coefficients, constraintsCoefficients, constraintsBounds, funktion);
        bbSolver.solve(maxIterations);

        updateResults(bbSolver);
    });

    skipForwardButton.addEventListener('click', function () {
        if (bbSolver) {
            bbSolver.iterate();
            updateResults(bbSolver);
        } else {
            getInputs()
            erstelleAbweichungsdiagramm()
            bbSolver = new BranchAndBound(coefficients, constraintsCoefficients, constraintsBounds, funktion);
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
            bbSolver = new BranchAndBound(coefficients, constraintsCoefficients, constraintsBounds, funktion);
        }
        var i = 0;
        while (i < 100) {
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
        console.log(bbSolver.stack)
        var historyStack = bbSolver.history.pop();
        bbSolver.stack = historyStack.stack;
        console.log(bbSolver.stack)
        bbSolver.stack.push(historyStack.node)
        console.log(bbSolver.stack)

        bbSolver.network.focus(lastNodeId-1, {
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

    function erstelleAbweichungsdiagramm(){
        if(document.getElementById('diagramm').style.display == "inline"){
            return;
        }
        var currentSolutions = [];
        tempSolver = new BranchAndBound(coefficients, constraintsCoefficients, constraintsBounds, funktion);
        for(var i=1; i<=100;i++){
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
        for(var i=1;i<=numberOfIterations;i++){
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