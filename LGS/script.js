document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('Gleichungssystem');
    const vector = document.getElementById('Startvektor');
    const saveButton = document.getElementById('saveButton');
    const clearButton = document.getElementById('clearButton');
    const addButton = document.getElementById('addButton');
    const removeButton = document.getElementById('removeButton');
    const example = document.getElementById('standardExample');

    example.addEventListener('click', function () {
        for (var i = table.rows.length - 1; i >= 0; i--) {
            table.deleteRow(i);
            vector.deleteRow(i);
        }
        for (let i = 0; i < 4; i++) {
            createInputFields();
        }
        addSigns();
        const values = [
            10, -1, 2, 0, 6,
            -1, 11, -1, 3, 25,
            2, -1, 10, -1, -11,
            0, 3, -1, 8, 15
        ];

        const inputs = table.getElementsByTagName('input');

        for (let i = 0; i < values.length; i++) {
            inputs[i].value = values[i];
        }

    });

    function createInputFields() {
        const row = table.insertRow();
        for (let i = 0; i < 5; i++) {
            const cell = row.insertCell();
            const input = document.createElement('input');
            input.type = 'number';
            cell.appendChild(input);
        }
        const vectorRow = vector.insertRow();
        const vectorCell = vectorRow.insertCell(0);
        const vectorInput = document.createElement('input');
        vectorInput.type = 'number';
        vectorInput.placeholder = '0';
        vectorCell.appendChild(vectorInput);
    }

    for (let i = 0; i < 4; i++) {
        createInputFields();
    }
    addSigns();

    saveButton.addEventListener('click', async function () {
        const inputs = document.querySelectorAll('#Gleichungssystem input');
        const vectorInputs = document.querySelectorAll('#Vektoreingabe input');
        const values = []; const vectorValues = [];
        let iterationen = 3;
        if (document.getElementById("AnzahlIterationen").value) {
            iterationen = document.getElementById("AnzahlIterationen").value;
        }

        let calculation = document.getElementById('Iterationen');
        let jacobiDiv = document.getElementById('ergebnisJacobi');
        let gaussDiv = document.getElementById('ergebnisGauss');
        jacobiDiv.innerHTML = '<h6>Ergebnis mit Jacobi Verfahren:</h6>'
        gaussDiv.innerHTML = ' <h6>Ergebnis mit Gaußschem Eliminationsverfahren:</h6>'
        calculation.innerHTML = ''

        var selectElement = document.getElementById('nachkomastellen');

        var selectedOption = selectElement.options[selectElement.selectedIndex];
        var decimalPlaces = parseInt(selectedOption.value);

        inputs.forEach(function (input) {
            if (input.value.trim() === '') {
                values.push(0);
            } else {
                values.push(parseFloat(input.value));
            }
        });

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

        // Erstelle ein 2D-Array (eine Matrix)
        let A = [];
        let b = [];
        for (let i = 0; i < rows; i++) {
            let row = [];
            for (let j = 0; j < cols; j++) {
                let index = i * cols + j;
                if (j < cols - 1) {
                    row.push(values[index]);
                } else {
                    b.push(values[index]); // Füge den Wert zur letzten Spalte hinzu
                }
            }
            A.push(row);
        }

        //Erstelle Matrix A
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
                if (i == 50) {
                    calculation.innerHTML += `<b>Konvergenz wurde nach ${i} Iterationen noch nicht erreicht</b>`
                    break;
                }
            }
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
            function norm(vector) {
                return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
            }

            function vectorDifference(vec1, vec2) {
                return vec1.map((val, index) => val - vec2[index]);
            }

            function percentageDifference(vec1, vec2) {
                const diff = vectorDifference(vec1, vec2);
                const normDiff = norm(diff);
                const normRef = norm(vec2);
                const percentageDiff = (normDiff / normRef) * 100;
                return percentageDiff.toFixed(decimalPlaces);
            }

            const result = percentageDifference(startVector, gaussSolution);
            document.getElementById('abweichung').innerHTML = "<h4>" + result + "% <br>Abweichung</h4>"
        }

        MathJax.typeset();
        document.getElementById('Rechnung').style.display = 'block';
        document.getElementById('Ergebnis').style.display = 'block';
    });


    removeButton.addEventListener('click', function () {
        const rows = table.rows.length;
        const cells = table.rows[0].cells.length - 1;
        console.log(cells)
        if (rows > 1) {
            table.deleteRow(rows - 1);
            vector.deleteRow(rows - 1);
            addSigns();
        }
        if (table.rows[0].cells.length > 2) {
            for (var i = 0; i < table.rows.length; i++) {
                cellNumber = table.rows[i].cells.length;
                table.rows[i].deleteCell(cellNumber - 1);
            }
        }
        addSigns();
    });

    addButton.addEventListener('click', function () {
        const rows = table.rows.length;
        const cells = table.rows[0].cells.length;
        if (rows < 10) {
            var row = table.insertRow();
            for (let i = 0; i < cells; i++) {
                const cell = row.insertCell();
                const input = document.createElement('input');
                input.type = 'number';
                cell.appendChild(input);
            }
            const vectorRow = vector.insertRow()
            const vectorCell = vectorRow.insertCell(0);
            const vectorInput = document.createElement('input');
            vectorInput.type = 'number';
            vectorInput.placeholder = '0';
            vectorCell.appendChild(vectorInput);
            addSigns();
        }
        if (table.rows[0].cells.length < 10) {
            for (var i = 0; i < table.rows.length; i++) {
                const cell = table.rows[i].insertCell();
                const input = document.createElement('input');
                input.type = 'number';
                cell.appendChild(input);
            }
            addSigns();
        }
    });

    clearButton.addEventListener('click', function () {
        for (var i = table.rows.length - 1; i >= 0; i--) {
            table.deleteRow(i);
            vector.deleteRow(i);
        }
        for (let i = 0; i < 4; i++) {
            createInputFields();
        }
        addSigns();
    });


    function addSigns() {
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
});


function gaussElimination(variable1, variable2, decimalPlaces) {
    let n = variable1.length;

    // Augmented matrix [variable1|variable2]
    for (let i = 0; i < n; i++) {
        variable1[i].push(variable2[i]);
    }

    // Helper function to round numbers to the specified decimal places
    function roundToDecimalPlaces(value, places) {
        return parseFloat(value.toFixed(places));
    }

    // Forward elimination
    for (let i = 0; i < n; i++) {
        // Pivoting
        let maxEl = Math.abs(variable1[i][i]);
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(variable1[k][i]) > maxEl) {
                maxEl = Math.abs(variable1[k][i]);
                maxRow = k;
            }
        }

        // Swap maximum row with current row
        for (let k = i; k < n + 1; k++) {
            let tmp = variable1[maxRow][k];
            variable1[maxRow][k] = variable1[i][k];
            variable1[i][k] = tmp;
        }

        // Make all rows below this one 0 in current column
        for (let k = i + 1; k < n; k++) {
            let c = -variable1[k][i] / variable1[i][i];
            c = roundToDecimalPlaces(c, decimalPlaces);
            for (let j = i; j < n + 1; j++) {
                if (i == j) {
                    variable1[k][j] = 0;
                } else {
                    variable1[k][j] += c * variable1[i][j];
                    variable1[k][j] = roundToDecimalPlaces(variable1[k][j], decimalPlaces);
                }
            }
        }
    }

    // Check for inconsistency
    for (let i = 0; i < n; i++) {
        if (variable1[i][i] == 0 && variable1[i][n] != 0) {
            return null;
        }
    }

    // Back substitution
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