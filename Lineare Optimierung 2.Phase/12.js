class BranchAndBound {
    constructor(objectiveCoefficients, constraintsCoefficients, constraintsBounds) {
        this.bestSolution = null; // Speichert die derzeit beste Lösung
        this.bestObjectiveValue = -Infinity; // Initialwert für den höchsten Zielfunktionswert
        this.objectiveCoefficients = objectiveCoefficients; // Koeffizienten der Zielfunktion
        this.constraintsCoefficients = constraintsCoefficients; // Matrix der Koeffizienten für die Nebenbedingungen
        this.constraintsBounds = constraintsBounds; // Rechte Seite der Ungleichungen der Nebenbedingungen
        this.numVariables = objectiveCoefficients.length; // Anzahl der Variablen bestimmt durch die Länge der Zielfunktionskoeffizienten
        this.initialBounds = this.computeInitialBounds(); // Berechnung der initialen Grenzen für jede Variable
    }

    computeInitialBounds() {
        let bounds = Array(this.numVariables).fill(null).map(() => [0, Infinity]);
        this.constraintsCoefficients.forEach((constraint, constraintIndex) => {
            constraint.forEach((coeff, varIndex) => {
                if (coeff > 0 && varIndex < this.numVariables) {  // Ignoriert Variablen, die außerhalb der Zielfunktion sind
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

    satisfiesConstraints(solution) {
        return this.constraintsCoefficients.every((coeffs, index) => 
            coeffs.reduce((sum, coeff, varIndex) => 
                varIndex < solution.length ? sum + coeff * solution[varIndex] : sum, 0) <= this.constraintsBounds[index]
        );
    }

    solve(maxIterations) {
        let stack = [{bounds: this.initialBounds, path: 'start'}];
        let iterations = 0;

        while (stack.length > 0 && iterations < maxIterations) {
            const node = stack.pop();
            const bounds = node.bounds;
            const midpoint = bounds.map(([low, high]) => Math.floor((low + high) / 2));

            if (this.explore(midpoint)) {
                console.log(`Iteration ${iterations + 1}: Current best solution: ${JSON.stringify(this.bestSolution)}, Objective: ${this.bestObjectiveValue}`);
            }
            console.log(`Current bounds: ${JSON.stringify(bounds)}`);

            bounds.forEach((bound, index) => {
                const [low, high] = bound;
                const mid = midpoint[index];

                if (low <= mid - 1) {
                    const newBounds = bounds.map((b, i) => i === index ? [low, mid - 1] : b);
                    stack.push({bounds: newBounds, path: `${node.path} -> x${index + 1} <= ${mid - 1}`});
                }

                if (mid + 1 <= high) {
                    const newBounds = bounds.map((b, i) => i === index ? [mid + 1, high] : b);
                    stack.push({bounds: newBounds, path: `${node.path} -> x${index + 1} >= ${mid + 1}`});
                }
            });

            iterations++;
        }
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
}

const objectiveCoefficients = [7, 12, 7];
const constraintsCoefficients = [
    [4, 3, 5],
    [2, 5],
    [2, 1]
];
const constraintsBounds = [12, 10, 5];

const maxIterations = 70;

const bbSolver = new BranchAndBound(objectiveCoefficients, constraintsCoefficients, constraintsBounds);
bbSolver.solve(maxIterations);

console.log('Final Best Solution:', JSON.stringify(bbSolver.bestSolution));
console.log('Final Best Objective Value:', bbSolver.bestObjectiveValue);
