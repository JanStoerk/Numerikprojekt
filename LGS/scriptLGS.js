// Wartet darauf, dass der gesamte Inhalt der Seite geladen ist
document.addEventListener('DOMContentLoaded', function () {
    const saveButton = document.getElementById('saveButton');
    const clearButton = document.getElementById('clearButton');
    const addButton = document.getElementById('addButton');
    const removeButton = document.getElementById('removeButton');
    const example = document.getElementById('standardExample');
    example.addEventListener('click', createStandardExample);
    clearButton.addEventListener('click', clearInput);
    saveButton.addEventListener('click', calculateSolution)
    removeButton.addEventListener('click', removeRow)
    addButton.addEventListener('click', addRow)
    //Erstellt vier Eingabefelder beim Laden der Seite
    for (let i = 0; i < 4; i++) {
        createInputFields();
    }
    //Fügt relevante mathematische Zeichen hinzu
    addSigns();
});

// Funktion zum Entfernen einer Zeile aus der Tabelle
function removeRow() {
    // Holt die Tabelle und den Startvektor, in der das Gleichungssystem dargestellt wird
    const table = document.getElementById('Gleichungssystem');
    const vector = document.getElementById('Startvektor');
    const rows = table.rows.length; // Bestimmt die Anzahl der Zeilen in der Tabelle
    const cells = table.rows[0].cells.length - 1;  // Bestimmt die Anzahl der Zellen in der ersten Zeile minus eins
    console.log(cells)
    if (rows > 1) {  // Entfernt die letzte Zeile, wenn es mehr als eine Zeile gibt
        table.deleteRow(rows - 1);
        vector.deleteRow(rows - 1);
        addSigns(); // Aktualisiert die Zeichen
    }
    if (table.rows[0].cells.length > 2) {
        for (var i = 0; i < table.rows.length; i++) {
            cellNumber = table.rows[i].cells.length;
            table.rows[i].deleteCell(cellNumber - 1);
        }
    }
    addSigns();
}

// Funktion zum Hinzufügen einer neuen Zeile zur Tabelle
function addRow() {
    const table = document.getElementById('Gleichungssystem');
    const vector = document.getElementById('Startvektor');
    const rows = table.rows.length;
    const cells = table.rows[0].cells.length;
    if (rows < 10) { // Füge nur dann eine Zeile hinzu, wenn es weniger als 10 Zeilen gibt
        var row = table.insertRow();
        for (let i = 0; i < cells; i++) { // Füge Eingabefelder in die neue Zeile ein
            const cell = row.insertCell();
            const input = document.createElement('input');
            input.type = 'number';
            cell.appendChild(input);
        }
        // Füge auch ein Eingabefeld für den Vektor hinzu
        const vectorRow = vector.insertRow()
        const vectorCell = vectorRow.insertCell(0);
        const vectorInput = document.createElement('input');
        vectorInput.type = 'number';
        vectorInput.placeholder = '0';
        vectorCell.appendChild(vectorInput);
        addSigns();
    }
    // Füge zusätzliche Zellen hinzu, wenn weniger als 10 Spalten vorhanden sind
    if (table.rows[0].cells.length < 10) {
        for (var i = 0; i < table.rows.length; i++) {
            const cell = table.rows[i].insertCell();
            const input = document.createElement('input');
            input.type = 'number';
            cell.appendChild(input);
        }
        addSigns();
    }
};

// Funktion zur Berechnung der Lösung
async function calculateSolution() {
    const table = document.getElementById('Gleichungssystem');
    const inputs = document.querySelectorAll('#Gleichungssystem input');
    const vectorInputs = document.querySelectorAll('#Vektoreingabe input');
    const values = []; const vectorValues = [];
    let iterationen = 3;
    // Bestimme die Anzahl der Iterationen
    if (document.getElementById("AnzahlIterationen").value) {
        iterationen = document.getElementById("AnzahlIterationen").value;
    }

    // Hol die Ausgabebereiche für die Ergebnisse
    let calculation = document.getElementById('Iterationen');
    let jacobiDiv = document.getElementById('ergebnisJacobi');
    let gaussDiv = document.getElementById('ergebnisGauss');
    // Bereite die Ergebnis-Div-Elemente vor
    jacobiDiv.innerHTML = '<h6>Ergebnis mit Jacobi Verfahren:</h6>'
    gaussDiv.innerHTML = ' <h6>Ergebnis mit Gaußschem Eliminationsverfahren:</h6>'
    calculation.innerHTML = ''

    // Bestimme die Anzahl der Nachkommastellen
    var selectElement = document.getElementById('nachkomastellen');
    var selectedOption = selectElement.options[selectElement.selectedIndex];
    var decimalPlaces = parseInt(selectedOption.value);

    // Sammle die Werte der Eingabefelder in ein Array
    inputs.forEach(function (input) {
        if (input.value.trim() === '') {
            values.push(0);
        } else {
            values.push(parseFloat(input.value));
        }
    });

    // Sammle die Werte des Startvektors in ein Array
    vectorInputs.forEach(function (vectorInput) {
        if (vectorInput.value.trim() === '') {
            vectorValues.push(0);
        } else {
            vectorValues.push(parseFloat(vectorInput.value));
        }
    });
    var rows = table.rows.length;
    var array = values;

    let cols = values.length / rows; // Anzahl der Spalten

    // Erstelle die Matrix A und den Vektor b
    let A = [];
    let b = [];
    for (let i = 0; i < rows; i++) {
        let row = [];
        for (let j = 0; j < cols; j++) {
            let index = i * cols + j;
            if (j < cols - 1) {
                row.push(values[index]);
            } else {
                b.push(values[index]); // Letzte Spalte gehört zum Vektor b
            }
        }
        A.push(row);
    }

    // Mathematische Darstellung der Matrizen in LaTeX
    let matrixA = "\\begin{pmatrix} ";
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < array.length / rows - 1; j++) {
            let index = i * (array.length / rows) + j;
            matrixA += array[index];
            if (j < array.length / rows - 2) {
                matrixA += "& ";
            } else {
                matrixA += "\\\\ ";
            }
        }
    }
    matrixA += "\\end{pmatrix}";

    // Erstelle Matrix b
    let matrixB = "\\begin{pmatrix} ";
    for (let i = 0; i < rows; i++) {
        let index = (i + 1) * (array.length / rows) - 1;
        matrixB += array[index];
        if (i < rows - 1) {
            matrixB += "\\\\ ";
        }
    }
    matrixB += "\\end{pmatrix}";

    //Erstelle Matrix x0
    let matrixX = "\\begin{pmatrix} ";
    for (let i = 0; i < vectorValues.length; i++) {
        matrixX += vectorValues[i];
        if (i < vectorValues.length - 1) {
            matrixX += " \\\\ ";
        }
    }
    matrixX += " \\end{pmatrix}";

    // Dimension der Matrix A (hier 4x4)
    let n = A.length;

    // Initialisiere die Matrizen D, L und U
    let D = [];
    let L = [];
    let U = [];

    // Iteriere über die Elemente des Matrix-Arrays, um D, L und U zu erstellen
    for (let i = 0; i < n; i++) {
        D.push([]);
        L.push([]);
        U.push([]);
        for (let j = 0; j < n; j++) {
            if (i === j) {
                D[i][j] = A[i][j];  // Diagonalelemente für D
                L[i][j] = 0;  // Nullen für L (unterhalb der Diagonale)
                U[i][j] = 0;  // Nullen für U (oberhalb der Diagonale)
            } else if (i > j) {
                L[i][j] = A[i][j];  // Elemente unterhalb der Diagonale für L
                D[i][j] = 0;
                U[i][j] = 0;
            } else {
                U[i][j] = A[i][j];  // Elemente oberhalb der Diagonale für U
                D[i][j] = 0;
                L[i][j] = 0;
            }
        }
    }
    function invertDiagonalMatrix(D) {
        let n = D.length;
        let D_inv = [];

        for (let i = 0; i < n; i++) {
            D_inv.push([]);
            for (let j = 0; j < n; j++) {
                if (i === j) {
                    if (D[i][j] !== 0) {
                        // Inverse berechnen und auf zwei Nachkommastellen runden
                        D_inv[i][j] = parseFloat((1 / D[i][j]).toFixed(decimalPlaces));
                    } else {
                        // Nachricht anzeigen und null zurückgeben
                        calculation.innerHTML = "<p>Das Gleichungssystem kann nicht mithilfe des Jacobi Verfahrens gelöst werden, da die Diagonalmatrix <b>D</b> nicht invertierbar ist, weil mindestens ein Diagonalelement 0 ist.</p>";
                        return null;
                    }
                } else {
                    D_inv[i][j] = 0;
                }
            }
        }

        return D_inv;
    }

    let D_inv = invertDiagonalMatrix(D);

    // Erstelle LaTeX-Matrizen für D, L und U
    function createLatexMatrix(matrix) {
        let latex = "\\begin{pmatrix}";
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                latex += matrix[i][j];
                if (j < matrix[i].length - 1) {
                    latex += " & ";
                }
            }
            if (i < matrix.length - 1) {
                latex += " \\\\ ";
            }
        }
        latex += "\\end{pmatrix}";
        return latex;
    }

    let matrixD = createLatexMatrix(D);
    let matrixL = createLatexMatrix(L);
    let matrixU = createLatexMatrix(U);

    let container = document.getElementById('matrix-container');
    let container2 = document.getElementById('diagonalisierungs-container');
    container.innerHTML = "<p> \\( \\mathbf{A} = " + matrixA + " \\)</p><p> \\( \\mathbf{b} = " + matrixB + " \\)</p><p> \\( \\mathbf{x^{(0)}} = " + matrixX + " \\)</p>";
    container2.innerHTML = "<p> \\( \\mathbf{D} = " + matrixD + " \\)</p><p> \\( \\mathbf{L} = " + matrixL + " \\)</p><p> \\( \\mathbf{U} = " + matrixU + " \\)</p>";

    var gaussSolution = gaussElimination(A, b, decimalPlaces);
    if (gaussSolution == null) {
        calculation.innerHTML = "<p>Das Gleichungssystem kann nicht mithilfe des Jacobi Verfahrens gelöst werden, da das Gleichungssystem unlösbar ist.</p>";
    }

    if (D_inv != null && gaussSolution != null) {
        // Erstelle LaTeX-Matrix für inverse D
        let matrixDInv = createLatexMatrix(D_inv);

        // Hilfsfunktion zur Matrix-Vektor-Multiplikation
        function matVecMul(matrix, vector) {
            const result = new Array(vector.length).fill(0);
            for (let i = 0; i < matrix.length; i++) {
                for (let j = 0; j < vector.length; j++) {
                    result[i] += matrix[i][j] * vector[j];
                }
                result[i] = parseFloat(result[i].toFixed(decimalPlaces));
            }
            return result;
        }

        // Hilfsfunktion zur Vektor-Subtraktion
        function vecSub(vec1, vec2) {
            return vec1.map((val, idx) => parseFloat((val - vec2[idx]).toFixed(decimalPlaces)));
        }

        // Hilfsfunktion zur Matrix-Vektor-Multiplikation mit Inverse (Diagonalmatrix)
        function matDiagVecMul(matrix, vector) {
            return matrix.map((row, idx) => parseFloat((row[idx] * vector[idx]).toFixed(decimalPlaces)));
        }

        let startVector = vectorValues;
        for (let i = 1; i <= iterationen; i++) {
            let matrixStart = "\\begin{pmatrix} ";
            for (let i = 0; i < startVector.length; i++) {
                matrixStart += startVector[i];
                if (i < startVector.length - 1) {
                    matrixStart += " \\\\ ";
                }
            }
            matrixStart += " \\end{pmatrix}";
            // Schritt 1: Berechne L + U
            const L_plus_U = L.map((row, i) => row.map((val, j) => val + U[i][j]));

            // Schritt 2: Multipliziere (L + U) mit x0
            const LUx0 = matVecMul(L_plus_U, startVector);

            // Schritt 3: Subtrahiere LUx0 von b
            const b_minus_LUx0 = vecSub(b, LUx0);

            // Schritt 4: Multipliziere das Ergebnis mit D_inv
            const x1 = matDiagVecMul(D_inv, b_minus_LUx0);
            let matrixResult = "\\begin{pmatrix} ";
            for (let i = 0; i < x1.length; i++) {
                matrixResult += x1[i];
                if (i < x1.length - 1) {
                    matrixResult += " \\\\ ";
                }
            }
            matrixResult += " \\end{pmatrix}";
            let formula = `$$\\mathbf{x^{(${i})}} = \\mathbf{D^{-1}} * (\\mathbf{b} - (\\mathbf{L} + \\mathbf{U})) + \\mathbf{x^{(${i - 1})}} = ` + matrixDInv + ' * (' + matrixB + ' - (' + matrixL + ' + ' + matrixU + ')) + ' + matrixStart + " = " + matrixResult + " $$";
            calculation.innerHTML += "<p>" + i + ". Iteration</p><br>" + formula;
            if (startVector.every((value, index) => value === x1[index])) {
                calculation.innerHTML += `<b>Konvergenz wurde nach ${i} Iterationen erreicht</b>`
                break
            }
            startVector = x1;
            if (i == 100) {
                calculation.innerHTML += `<b>Konvergenz wurde nach ${i} Iterationen noch nicht erreicht</b>`
                break;
            }
        }

        // Erstellt einen LaTeX-String zur Darstellung eines Vektors
        function createLatexString(vector) {
            let latexString = '';
            for (let i = 0; i < vector.length; i++) {
                latexString += `x_{${i}} = ${vector[i]} \\\\ `;
            }
            return latexString;
        }

        let ergebnisJacobi = createLatexString(startVector);
        let ergebnisGauss = createLatexString(gaussSolution);
        jacobiDiv.innerHTML += `\\[ \\begin{array}{l} ${ergebnisJacobi} \\end{array} \\]`;
        gaussDiv.innerHTML += `\\[ \\begin{array}{l} ${ergebnisGauss} \\end{array} \\]`;

        // Berechnet die Euklidische Norm des Vektors
        function norm(vector) {
            return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        }

        // Berechnet die Differenz zwischen zwei Vektoren
        function vectorDifference(vec1, vec2) {
            return vec1.map((val, index) => val - vec2[index]);
        }

        // Berechnet den prozentualen Unterschied zwischen zwei Vektoren
        function percentageDifference(vec1, vec2) {
            const diff = vectorDifference(vec1, vec2);
            const normDiff = norm(diff);
            const normRef = norm(vec2);
            const percentageDiff = (normDiff / normRef) * 100;
            return percentageDiff.toFixed(decimalPlaces);
        }

        // Ergebnis der prozentualen Abweichung anzeigen
        const result = percentageDifference(startVector, gaussSolution);
        document.getElementById('abweichung').innerHTML = "<h4>" + result + "% <br>Abweichung</h4>"
    }

    // Neudarstellung der MathJax-Elemente
    MathJax.typeset();
    document.getElementById('Rechnung').style.display = 'block';
    document.getElementById('Ergebnis').style.display = 'block';
};

// Funktion, um die Eingabefelder für das Gleichungssystem und den Startvektor zu leeren
function clearInput() {
    const table = document.getElementById('Gleichungssystem');
    const vector = document.getElementById('Startvektor');
    for (var i = table.rows.length - 1; i >= 0; i--) {
        table.deleteRow(i);
        vector.deleteRow(i);
    }
    // Erstellt 4 neue Eingabefelder für das Gleichungssystem
    for (let i = 0; i < 4; i++) {
        createInputFields();
    }
    // Fügt Rechenzeichen (+, -, =) hinzu
    addSigns();
};

// Funktion, die Rechenzeichen (+, -, =) in die Tabelle für das Gleichungssystem einfügt
function addSigns() {
    const table = document.getElementById('Gleichungssystem');
    for (var i = 0; i < table.rows.length; i++) {
        var columnLength = table.rows[i].cells.length;
        for (var j = 0; j < columnLength; j++) {
            var cell = table.rows[i].cells[j];
            if (cell.childNodes.length > 1) {
                cell.removeChild(cell.childNodes[1]);
            }
            if (j + 2 == columnLength) {
                const equalsSign = document.createTextNode('=');
                cell.appendChild(equalsSign);
            } else if (j + 1 != columnLength) {
                const plusSign = document.createTextNode('+');
                cell.appendChild(plusSign);
            }

        }

    }
}

// Funktion, die ein Standardbeispiel für das Gleichungssystem erstellt
function createStandardExample() {
    const table = document.getElementById('Gleichungssystem');
    const vector = document.getElementById('Startvektor');
    for (var i = table.rows.length - 1; i >= 0; i--) {
        table.deleteRow(i);
        vector.deleteRow(i);
    }
    for (let i = 0; i < 4; i++) {
        createInputFields();
    }
    addSigns();

    // Definiert die Werte für das Standardbeispiel
    const values = [
        10, -1, 2, 0, 6,
        -1, 11, -1, 3, 25,
        2, -1, 10, -1, -11,
        0, 3, -1, 8, 15
    ];

    // Füllt die Eingabefelder mit den Standardwerten
    const inputs = table.getElementsByTagName('input');

    for (let i = 0; i < values.length; i++) {
        inputs[i].value = values[i];
    }

}

// Funktion, die Eingabefelder für eine Zeile des Gleichungssystems erstellt
function createInputFields() {
    const table = document.getElementById('Gleichungssystem');
    const vector = document.getElementById('Startvektor');
    // Fügt eine neue Zeile zur Tabelle des Gleichungssystems hinzu  
    const row = table.insertRow();
    for (let i = 0; i < 5; i++) {
        const cell = row.insertCell();
        const input = document.createElement('input');
        input.type = 'number'; // Definiert das Eingabefeld als Zahleneingabe
        cell.appendChild(input); // Fügt das Eingabefeld in die Zelle ein
    }

    // Fügt eine neue Zeile für den Startvektor hinzu
    const vectorRow = vector.insertRow();
    const vectorCell = vectorRow.insertCell(0);
    const vectorInput = document.createElement('input');
    vectorInput.type = 'number';
    vectorInput.placeholder = '0'; // Standard-Platzhalterwert
    vectorCell.appendChild(vectorInput);
}


function gaussElimination(variable1, variable2, decimalPlaces) {

    let n = variable1.length;

    // Erstellen der erweiterten Matrix [variable1|variable2]
    for (let i = 0; i < n; i++) {
        variable1[i].push(variable2[i]);
    }

    // Vorwärtssubstitution
    for (let i = 0; i < n; i++) {
        // Pivotierung: Finden der Zeile mit dem größten Element in der aktuellen Spalte
        let maxEl = Math.abs(variable1[i][i]);
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(variable1[k][i]) > maxEl) {
                maxEl = Math.abs(variable1[k][i]);
                maxRow = k;
            }
        }

        // Vertauschen der Zeile mit dem maximalen Element mit der aktuellen Zeile
        for (let k = i; k < n + 1; k++) {
            let tmp = variable1[maxRow][k];
            variable1[maxRow][k] = variable1[i][k];
            variable1[i][k] = tmp;
        }

        // Alle Zeilen unterhalb der aktuellen Zeile in der aktuellen Spalte auf 0 setzen
        for (let k = i + 1; k < n; k++) {
            let c = -variable1[k][i] / variable1[i][i];
            c = roundToDecimalPlaces(c, decimalPlaces); // Runden der Koeffizienten
            for (let j = i; j < n + 1; j++) {
                if (i == j) {
                    variable1[k][j] = 0; // Diagonale Elemente auf 0 setzen
                } else {
                    variable1[k][j] += c * variable1[i][j];
                    variable1[k][j] = roundToDecimalPlaces(variable1[k][j], decimalPlaces); // Runden der Ergebnisse
                }
            }
        }
    }

    // Überprüfung auf Inkonsistenzen
    for (let i = 0; i < n; i++) {
        if (variable1[i][i] == 0 && variable1[i][n] != 0) {
            return null;
        }
    }

    // Rückwärtssubstitution zur Bestimmung der Lösung
    let x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        x[i] = variable1[i][n] / variable1[i][i];
        x[i] = roundToDecimalPlaces(x[i], decimalPlaces);
        for (let k = i - 1; k >= 0; k--) {
            variable1[k][n] -= variable1[k][i] * x[i];
            variable1[k][n] = roundToDecimalPlaces(variable1[k][n], decimalPlaces);
        }
    }

    return x;
}

// Hilfsfunktion zum Runden von Zahlen auf die angegebene Anzahl von Dezimalstellen
function roundToDecimalPlaces(value, places) {
    return parseFloat(value.toFixed(places));
}

// Export der Funktionen (für Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        removeRow,
        addRow,
        calculateSolution,
        clearInput,
        addSigns,
        createStandardExample,
        createInputFields,
        gaussElimination,
        roundToDecimalPlaces
    }
}