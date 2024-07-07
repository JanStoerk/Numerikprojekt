const math = require('mathjs');

function solveLinearSystem(coeffMatrix, constVector) {
    try {
        const solution = math.lusolve(coeffMatrix, constVector);
        return solution.map(row => row[0]);
    } catch (e) {
        return null;
    }
}

function objectiveFunction(optSolution) {
    const [x1, x2] = optSolution;
    return 3 * x1 + x2;
}

function calculateTotalNodes(levels) {
    let totalNodes = 0;
    for (let level = 0; level <= levels; level++) {
        totalNodes += Math.pow(2, level);
    }
    return totalNodes;
}

function ceilAndFloorValue(element) {
    const ceilValue = Math.ceil(element);
    const floorValue = Math.floor(element);
    return [ceilValue, floorValue];
}

function findBiggestMargin(optSolution) {
    const adjustedSolution = optSolution.map(element => Math.ceil(element) - element);
    console.log("Angepasste Lösung (subtrahiert von der nächstgrößeren ganzen Zahl):", adjustedSolution);
    
    const maxIndex = adjustedSolution.indexOf(Math.max(...adjustedSolution));
    const maxElement = optSolution[maxIndex];
    
    const [ceilValue, floorValue] = ceilAndFloorValue(maxElement);
    
    console.log(`Größtes Element in der Lösung: ${maxElement}`);
    console.log(`Nächstgrößere ganzzahlige Zahl: ${ceilValue}`);
    console.log(`Nächstkleinere ganzzahlige Zahl: ${floorValue}`);
    
    return [ceilValue, floorValue];
}

function checkIfInt(element) {
    return element.every(value => Number.isInteger(value));
}

function calculateIntersections(constVector, coeffMatrix, newSolution) {
    const xIntersection1 = (constVector[0] - coeffMatrix[0][1] * newSolution[0]) / coeffMatrix[1][1];
    const xIntersection2 = (constVector[1] - coeffMatrix[1][1] * newSolution[0]) / coeffMatrix[1][0];
    
    return [xIntersection1, xIntersection2];
}

// Anzahl der Variablen
const numVars = 2;

let lowerBound = 0;
let upperBound = 0;

// Erstellen der Koeffizientenmatrix und des Konstantenvektors 
const coeffMatrix = [
    [4, 3],
    [2, 5]
];
// Konstantenvektor der Nebenbedingungen
const constVector = [12, 10];

console.log("Koeffizientenmatrix:");
console.log(coeffMatrix);
console.log("\nKonstantenvektor:");
console.log(constVector);

let optSolution = solveLinearSystem(coeffMatrix, constVector);

const rows = coeffMatrix.length;
const cols = coeffMatrix[0].length;
console.log(cols);
const totalNodes = calculateTotalNodes(cols);
console.log(totalNodes);

if (optSolution !== null && !checkIfInt(optSolution)) {
    console.log("\nLösung:", optSolution);

    upperBound = objectiveFunction(optSolution);

    console.log("Obere Grenze (Wert der Zielfunktion):", upperBound);
    for (let x = 0; x < totalNodes; x++) {
        const [ceilValue, floorValue] = findBiggestMargin(optSolution);

        let newSolution = [...optSolution];
        newSolution[0] = floorValue;
        console.log(newSolution[0]);

        const intersections = calculateIntersections(constVector, coeffMatrix, newSolution);

        newSolution[1] = intersections[0];
        console.log("Schnittpunkt 1 (Gleichung 1):", intersections[0]);

        const newTargetFunctionValue = objectiveFunction(newSolution);
        console.log(newTargetFunctionValue);

        if (checkIfInt(newSolution) && newTargetFunctionValue < upperBound && newTargetFunctionValue > lowerBound) {
            lowerBound = newTargetFunctionValue;
            console.log(lowerBound);
        } else {
            const [ceilValue2, floorValue2] = ceilAndFloorValue(newSolution[1]);

            newSolution[1] = floorValue2;
            const newTargetFunctionValueFloor = objectiveFunction(newSolution);

            if (checkIfInt(newSolution)) {
                if (newTargetFunctionValueFloor > upperBound || newTargetFunctionValueFloor < lowerBound) {
                    console.log("Untere schranke größer obere schranke oder bisherige Untere Schranke bereits genauer");
                } else {
                    lowerBound = newTargetFunctionValueFloor;
                    console.log("untere Schranke", lowerBound);
                }
            } else {
                console.log("Branch ist fertig");
            }

            newSolution[1] = ceilValue2;
            const newTargetFunctionValueCeil = objectiveFunction(newSolution);

            if (checkIfInt(newSolution)) {
                if (newTargetFunctionValueCeil > upperBound || newTargetFunctionValueCeil < lowerBound) {
                    console.log("Untere schranke größer obere schranke oder bisherige Untere Schranke bereits genauer");
                } else {
                    lowerBound = newTargetFunctionValueCeil;
                    console.log("untere Schranke", lowerBound);
                }
            } else {
                console.log("Branch ist fertig");
            }
        }

        newSolution[0] = ceilValue;
        const intersections2 = calculateIntersections(constVector, coeffMatrix, newSolution);
        newSolution[1] = intersections2[1];
        console.log("Schnittpunkt 2 (Gleichung 2):", intersections2[1]);

        const newTargetFunctionValue2 = objectiveFunction(newSolution);
        console.log("New Target func Value: ", newTargetFunctionValue2);

        if (checkIfInt(newSolution) && newTargetFunctionValue2 < upperBound && newTargetFunctionValue2 > lowerBound) {
            lowerBound = newTargetFunctionValue2;
            console.log(lowerBound);
        } else {
            console.log("Keine Verbesserung erreicht");
        }
    }
}

console.log("\n obere Grenze:", upperBound);
console.log("\n untere Grenze:", lowerBound);
