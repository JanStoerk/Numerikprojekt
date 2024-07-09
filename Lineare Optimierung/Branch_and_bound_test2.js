class BranchAndBound {
    constructor() {
        this.bestSolution = null;
        this.bestObjectiveValue = -Infinity;
        this.branches = []; // Hier werden die Zweige gespeichert
    }

    // Objective function
    objectiveFunction(x1, x2) {
        return 3 * x1 + x2;
    }

    // Constraints
    constraints(x1, x2) {
        return (4 * x1 + 3 * x2 <= 12) && (2 * x1 + 5 * x2 <= 10);
    }

    // Branch and Bound method
    solve(x1Bounds, x2Bounds) {
        // Initialzustand in den Branch hinzufügen
        this.branches.push({ x1Bounds, x2Bounds });
        console.log('Branches:', this.branches);
        // Solange noch Zweige vorhanden sind
        while (this.branches.length > 0) {
            console.log('Branches:', this.branches);
            // LIFO-Prinzip: Nehme den letzten Branch
            const currentBranch = this.branches.pop();
            const { x1Bounds, x2Bounds } = currentBranch;

            // If bounds are invalid, skip this branch
            if (x1Bounds[0] > x1Bounds[1] || x2Bounds[0] > x2Bounds[1]) continue;

            // Check the midpoint of the current bounds
            const midX1 = Math.floor((x1Bounds[0] + x1Bounds[1]) / 2);
            const midX2 = Math.floor((x2Bounds[0] + x2Bounds[1]) / 2);

            // Explore branches around the midpoint
            this.explore(midX1, midX2);

            // Branch further if solution is not yet optimal
            if (this.bestSolution === null || this.objectiveFunction(midX1, midX2) < this.bestObjectiveValue) {
                // Branch on x1
                this.branches.push({ x1Bounds: [x1Bounds[0], midX1 - 1], x2Bounds }); // x1 <= midX1 - 1
                this.branches.push({ x1Bounds: [midX1 + 1, x1Bounds[1]], x2Bounds }); // x1 >= midX1 + 1

                // Branch on x2
                this.branches.push({ x1Bounds, x2Bounds: [x2Bounds[0], midX2 - 1] }); // x2 <= midX2 - 1
                this.branches.push({ x1Bounds, x2Bounds: [midX2 + 1, x2Bounds[1]] }); // x2 >= midX2 + 1
            }
        }

        // Output the best solution found
        console.log('Best Solution:', this.bestSolution);
        console.log('Best Objective Value:', this.bestObjectiveValue);
    }

    // Function to explore the current point
    explore(x1, x2) {
        if (this.constraints(x1, x2)) {
            const objectiveValue = this.objectiveFunction(x1, x2);
            if (objectiveValue > this.bestObjectiveValue) {
                this.bestObjectiveValue = objectiveValue;
                this.bestSolution = { x1, x2 };
            }
        }
    }
}

// Define initial bounds for x1 and x2
const initialX1Bounds = [0, Math.floor(12 / 4)]; // From constraints 4x1 + 3x2 <= 12
const initialX2Bounds = [0, Math.floor(10 / 5)]; // From constraints 2x1 + 5x2 <= 10
console.log('Bound X1:', this.initialX1Bounds);
console.log('Bound X2:', this.initialX2Bounds);

// Create Branch and Bound solver instance
const bbSolver = new BranchAndBound();

// Solve the problem within the bounds
bbSolver.solve(initialX1Bounds, initialX2Bounds);
