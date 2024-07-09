class BranchAndBound {
    constructor() {
        this.bestSolution = null;
        this.bestObjectiveValue = -Infinity;
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
        this.branch(x1Bounds, x2Bounds);
    }

    // Function to branch the problem
    branch(x1Bounds, x2Bounds) {
        // If bounds are invalid, return
        if (x1Bounds[0] > x1Bounds[1] || x2Bounds[0] > x2Bounds[1]) return;

        // Check the midpoint of the current bounds
        const midX1 = Math.floor((x1Bounds[0] + x1Bounds[1]) / 2);
        const midX2 = Math.floor((x2Bounds[0] + x2Bounds[1]) / 2);

        // Explore branches around the midpoint
        this.explore(midX1, midX2);

        // Branch further if solution is not yet optimal
        if (this.bestSolution === null || this.objectiveFunction(midX1, midX2) < this.bestObjectiveValue) {
            // Branch on x1
            this.branch([x1Bounds[0], midX1 - 1], x2Bounds); // x1 <= midX1 - 1
            this.branch([midX1 + 1, x1Bounds[1]], x2Bounds); // x1 >= midX1 + 1

            // Branch on x2
            this.branch(x1Bounds, [x2Bounds[0], midX2 - 1]); // x2 <= midX2 - 1
            this.branch(x1Bounds, [midX2 + 1, x2Bounds[1]]); // x2 >= midX2 + 1
        }
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
const initialX1Bounds = [0, Math.floor(12 / 4)]; // From constraints 4x1 + 3x2 <= 12 and 2x1 + 5x2 <= 10
const initialX2Bounds = [0, Math.floor(10 / 5)];

// Create Branch and Bound solver instance
const bbSolver = new BranchAndBound();

// Solve the problem within the bounds
bbSolver.solve(initialX1Bounds, initialX2Bounds);

// Output the best solution found
console.log('Best Solution:', bbSolver.bestSolution);
console.log('Best Objective Value:', bbSolver.bestObjectiveValue);
