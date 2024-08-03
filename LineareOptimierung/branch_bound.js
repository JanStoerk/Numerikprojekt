// branch_bound.js

class Node {
    constructor(level, value, bounds, decision) {
        this.level = level;
        this.value = value;
        this.bounds = bounds;
        this.children = [];
        this.chosen = null; // null = not evaluated, true = chosen, false = discarded
        this.decision = decision; // "left" or "right"
    }
}

class BranchAndBound {
    constructor(objective, constraints) {
        this.objective = this.parseObjective(objective);
        this.constraints = this.parseConstraints(constraints);
        this.bestSolution = null;
        this.bestValue = -Infinity;
        this.root = new Node(0, 0, this.initialBounds(), null);
        this.currentNode = this.root;
        this.nodes = [this.root];
    }

    initialBounds() {
        return { x: [0, 1], y: [0, 1] }; // Binary bounds
    }

    parseObjective(objective) {
        // Parsing objective function, e.g., "3x + 4y" to { x: 3, y: 4 }
        const obj = {};
        objective.split('+').forEach(term => {
            const [coeff, variable] = term.trim().split(/(\d+)([a-z])/).filter(Boolean);
            obj[variable] = parseInt(coeff);
        });
        return obj;
    }

    parseConstraints(constraints) {
        // Parsing constraints, e.g., "2x + y <= 20, x + 2y <= 30"
        return constraints.map(constraint => {
            const [lhs, rhs] = constraint.split('<=').map(s => s.trim());
            const terms = lhs.split('+').map(term => {
                const [coeff, variable] = term.trim().split(/(\d+)([a-z])/).filter(Boolean);
                return { coeff: parseInt(coeff), variable };
            });
            return { terms, rhs: parseInt(rhs) };
        });
    }

    branch(node) {
        if (node.level >= 2) return;

        const leftBounds = this.updateBounds(node.bounds, 'left');
        const rightBounds = this.updateBounds(node.bounds, 'right');

        const leftNode = new Node(node.level + 1, this.evaluateObjective(leftBounds), leftBounds, 'left');
        const rightNode = new Node(node.level + 1, this.evaluateObjective(rightBounds), rightBounds, 'right');

        node.children.push(leftNode, rightNode);
        this.nodes.push(leftNode, rightNode);
    }

    updateBounds(bounds, direction) {
        let newBounds = { ...bounds };
        if (direction === 'left') {
            newBounds.x = [0, 0];
        } else {
            newBounds.x = [1, 1];
        }
        return newBounds;
    }

    evaluateObjective(bounds) {
        return this.objective.x * bounds.x[0] + this.objective.y * bounds.y[0];
    }

    start() {
        this.branch(this.root);
    }

    getTree() {
        return this.root;
    }

    nextStep() {
        if (this.nodes.length === 0) return;

        const node = this.nodes.shift();
        this.branch(node);

        if (node.value > this.bestValue) {
            this.bestValue = node.value;
            this.bestSolution = node.bounds;
        }

        // Mark the chosen path and discarded path
        node.chosen = true;
        if (node.children.length > 0) {
            node.children[0].chosen = true;
            node.children[1].chosen = false;
        }

        return node;
    }
}

let bnb;

function initializeBranchAndBound() {
    const objective = document.getElementById("objective").value;
    const constraints = document.getElementById("constraints").value.split(',');

    bnb = new BranchAndBound(objective, constraints);
    bnb.start();

    visualizeTree(bnb.getTree());
    updateCurrentResult();
}

function nextStep() {
    const node = bnb.nextStep();
    if (node) {
        visualizeTree(bnb.getTree());
        updateCurrentResult();
    }
}

function updateCurrentResult() {
    const resultDiv = document.getElementById("currentResult");
    resultDiv.innerHTML = `Bestes Ergebnis: ${bnb.bestValue}`;
}

function visualizeTree(root) {
    const width = 800;
    const height = 600;
    const treeData = d3.hierarchy(root);

    const treeLayout = d3.tree().size([width, height * 2]);
    treeLayout(treeData);

    d3.select("#tree").html("");

    const svg = d3.select("#tree").append("svg")
        .attr("width", width)
        .attr("height", height * 2)
        .append("g")
        .attr("transform", "translate(40,0)");

    const link = svg.selectAll(".link")
        .data(treeData.links())
        .enter().append("path")
        .attr("class", d => d.target.data.chosen === false ? "link discarded" : "link")
        .attr("d", d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y));

    const node = svg.selectAll(".node")
        .data(treeData.descendants())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x},${d.y})`);

    node.append("circle")
        .attr("r", 20)
        .attr("class", d => d.data.chosen === true ? "chosen" : "");

    node.append("text")
        .attr("dy", ".35em")
        .attr("x", d => d.children ? -25 : 25)
        .style("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data.value.toFixed(2));
}
