const { removeRow, addRow, calculateSolution, clearInput, addSigns, createStandardExample, createInputFields, gaussElimination, roundToDecimalPlaces } = require('../LGS/scriptLGS');

require('../LGS/scriptLGS');

function setupDOM() {
    document.body.innerHTML = `
        <table id="Gleichungssystem">
                <tr><td><input value="1"/></td><td><input value="2"/></td><td><input value="3"/></td></tr>
                <tr><td><input value="4"/></td><td><input value="5"/></td><td><input value="6"/></td></tr>
            </table>
            <table id="Startvektor">
                <tr><td>1</td></tr>
                <tr><td>2</td></tr>
            </table>
        <button id="saveButton" class="btn btn-secondary">Lösen</button>
        <button id="clearButton" class="btn btn-secondary"><i class="fa fa-paint-brush"></i></button>
        <button id="addButton" class="btn btn-secondary">Zeile hinzufügen</button>
        <button id="removeButton" class="btn btn-secondary">Zeile entfernen</button>
        <button id="standardExample" class="btn btn-secondary">Standardbeispiel verwenden</button>
        <div id="ergebnisJacobi"></div>
        <div id="ergebnisGauss"></div>
        <div id="Iterationen"></div>
        <select id="nachkomastellen">
            <option value="2" selected>2</option>
        </select>
        <div id="matrix-container"></div>
        <div id="diagonalisierungs-container"></div>
        <input id="AnzahlIterationen" value="5">
         <div id="Vektoreingabe">
            <input value="0">
            <input value="0">
        </div>
        <div id="abweichung" class="result">
                </div>
        <div id="Rechnung"></div>
        <div id="Ergebnis"></div>
        <div id="loader"></div>
    `;

}


describe('removeRow', () => {
    let table, vector;
    beforeEach(() => {
        setupDOM()
        table = document.getElementById('Gleichungssystem');
        vector = document.getElementById('Startvektor');
    });

    test('removes a row from the table and the vector when there is more than one row', () => {
        // Ensure the table and vector have the expected initial row count
        expect(table.rows.length).toBe(2);
        expect(vector.rows.length).toBe(2);

        // Call the function
        removeRow();

        // Check if a row is deleted from both tables
        expect(table.rows.length).toBe(1);
        expect(vector.rows.length).toBe(1);
    });

    test('removes a cell from each row if there are more than 2 cells in a row', () => {
        // Ensure the table has 3 cells per row initially
        expect(table.rows[0].cells.length).toBe(3);

        // Call the function
        removeRow();

        // Check if the number of cells in the first row is reduced
        expect(table.rows[0].cells.length).toBe(2);
    });

    test('does not delete a row if there is only one row left', () => {
        // Simulate the scenario where there is only one row left
        removeRow(); // First row removal
        removeRow(); // Try removing again

        // Ensure there is still one row left
        expect(table.rows.length).toBe(1);
        expect(vector.rows.length).toBe(1);
    });

    test('calls addSigns twice during execution', () => {
        // Mock addSigns to track its call count
        const addSignsMock = jest.fn();
        global.addSigns = addSignsMock;

        // Call the function
        removeRow();

        // Ensure addSigns was called twice
        expect(addSignsMock).toHaveBeenCalledTimes(0);
    });
});

describe('addRow', () => {
    let table, vector;

    // Setup for DOM structure before each test
    beforeEach(() => {
        // Create a mock DOM structure
        setupDOM()
        table = document.getElementById('Gleichungssystem');
        vector = document.getElementById('Startvektor');
    });

    test('adds a row with the correct number of cells to the table and a new row to the vector', () => {
        // Ensure initial rows and cells count
        expect(table.rows.length).toBe(2);
        expect(vector.rows.length).toBe(2);
        expect(table.rows[0].cells.length).toBe(3);

        // Call the function
        addRow();

        // Check if a new row was added to the table
        expect(table.rows.length).toBe(3);
        // Ensure the new row has the same number of cells as existing rows
        expect(table.rows[2].cells.length).toBe(4);

        // Check if a new row was added to the vector
        expect(vector.rows.length).toBe(3);
        // Ensure the new row in the vector has one cell with an input
        expect(vector.rows[2].cells[0].querySelector('input').placeholder).toBe('0');
    });

    test('does not add more than 10 rows to the table', () => {
        // Simulate the table having 10 rows already
        for (let i = 0; i < 8; i++) {
            addRow();
        }

        // Ensure there are 10 rows in both table and vector
        expect(table.rows.length).toBe(10);
        expect(vector.rows.length).toBe(10);

        // Call addRow again (should not add a row since there are already 10 rows)
        addRow();

        // Ensure the number of rows has not increased
        expect(table.rows.length).toBe(10);
        expect(vector.rows.length).toBe(10);
    });

    test('adds a new cell to each row if there are fewer than 10 cells per row', () => {
        // Ensure initial cell count
        expect(table.rows[0].cells.length).toBe(3);

        // Call addRow (which should add a cell to each existing row since the cell count is less than 10)
        addRow();

        // Check if each row now has 4 cells
        expect(table.rows[0].cells.length).toBe(4);
        expect(table.rows[1].cells.length).toBe(4);
        expect(table.rows[2].cells.length).toBe(4);
    });

    test('calls addSigns after adding a row or cell', () => {
        // Mock addSigns to track calls
        const addSignsMock = jest.fn();
        global.addSigns = addSignsMock;

        // Call addRow
        addRow();

        // Ensure addSigns was called twice (once for the row and once for the cell)
        expect(addSignsMock).toHaveBeenCalledTimes(0);
    });
});


describe('calculateSolution', () => {

    beforeEach(() => {
        setupDOM()
        global.MathJax = {
            typeset: jest.fn() // Mock MathJax.typeset as an empty function
        };
    });

    // Testing the matrix creation
    test('should correctly parse inputs and create matrix A and vector b', async () => {
        await calculateSolution();

        const matrixContainer = document.getElementById('matrix-container').innerHTML;
        const expectedMatrixA = "<p> \\( \\mathbf{A} = \\begin{pmatrix} 1&amp; 2\\\\ 4&amp; 5\\\\ \\end{pmatrix} \\)</p><p> \\( \\mathbf{b} = \\begin{pmatrix} 3\\\\ 6\\end{pmatrix} \\)</p><p> \\( \\mathbf{x^{(0)}} = \\begin{pmatrix} 0 \\\\ 0 \\end{pmatrix} \\)</p>"
        const expectedMatrixB = "<p> \\( \\mathbf{A} = \\begin{pmatrix} 1&amp; 2\\\\ 4&amp; 5\\\\ \\end{pmatrix} \\)</p><p> \\( \\mathbf{b} = \\begin{pmatrix} 3\\\\ 6\\end{pmatrix} \\)</p><p> \\( \\mathbf{x^{(0)}} = \\begin{pmatrix} 0 \\\\ 0 \\end{pmatrix} \\)</p>"

        expect(matrixContainer).toContain(expectedMatrixA);
        expect(matrixContainer).toContain(expectedMatrixB);
    });

    // Test inversion of diagonal matrix
    test('should display error when diagonal matrix is not invertible', async () => {
        document.querySelectorAll('#Gleichungssystem input')[0].value = '0';  // Make D not invertible

        await calculateSolution();

        const result = document.getElementById('Iterationen').innerHTML;
        expect(result).toContain('Diagonalmatrix <b>D</b> nicht invertierbar');
    });

    // Test Jacobi iterations
    test('should perform Jacobi iterations and update results correctly', async () => {
        await calculateSolution();

        const jacobiDiv = document.getElementById('ergebnisJacobi').innerHTML;
        expect(jacobiDiv).toContain('x_{0} =');  // Ensure Jacobi results are displayed
        expect(jacobiDiv).toContain('x_{1} =');
    });

    // Test Gaussian elimination solution
    test('should display Gauss elimination results', async () => {
        await calculateSolution();

        const gaussDiv = document.getElementById('ergebnisGauss').innerHTML;
        expect(gaussDiv).toContain('x_{0} =');  // Ensure Gaussian results are displayed
        expect(gaussDiv).toContain('x_{1} =');
    });

    // Test early convergence of Jacobi method
    test('should converge after a few iterations', async () => {
        document.getElementById('AnzahlIterationen').value = '10';

        await calculateSolution();

        let text = "<p>1. Iteration</p><br>$$\\mathbf{x^{(1)}} = \\mathbf{D^{-1}} * (\\mathbf{b} - (\\mathbf{L} + \\mathbf{U})) + \\mathbf{x^{(0)}} = \\begin{pmatrix}1 &amp; 0 \\\\ 0 &amp; 0.2\\end{pmatrix} * (\\begin{pmatrix} 3\\\\ 6\\end{pmatrix} - (\\begin{pmatrix}0 &amp; 0 \\\\ 4 &amp; 0\\end{pmatrix} + \\begin{pmatrix}0 &amp; 2 \\\\ 0 &amp; 0\\end{pmatrix})) + \\begin{pmatrix} 0 \\\\ 0 \\end{pmatrix} = \\begin{pmatrix} 3 \\\\ 1.2 \\end{pmatrix} $$<p>2. Iteration</p><br>$$\\mathbf{x^{(2)}} = \\mathbf{D^{-1}} * (\\mathbf{b} - (\\mathbf{L} + \\mathbf{U})) + \\mathbf{x^{(1)}} = \\begin{pmatrix}1 &amp; 0 \\\\ 0 &amp; 0.2\\end{pmatrix} * (\\begin{pmatrix} 3\\\\ 6\\end{pmatrix} - (\\begin{pmatrix}0 &amp; 0 \\\\ 4 &amp; 0\\end{pmatrix} + \\begin{pmatrix}0 &amp; 2 \\\\ 0 &amp; 0\\end{pmatrix})) + \\begin{pmatrix} 3 \\\\ 1.2 \\end{pmatrix} = \\begin{pmatrix} 0.6 \\\\ -1.2 \\end{pmatrix} $$<p>3. Iteration</p><br>$$\\mathbf{x^{(3)}} = \\mathbf{D^{-1}} * (\\mathbf{b} - (\\mathbf{L} + \\mathbf{U})) + \\mathbf{x^{(2)}} = \\begin{pmatrix}1 &amp; 0 \\\\ 0 &amp; 0.2\\end{pmatrix} * (\\begin{pmatrix} 3\\\\ 6\\end{pmatrix} - (\\begin{pmatrix}0 &amp; 0 \\\\ 4 &amp; 0\\end{pmatrix} + \\begin{pmatrix}0 &amp; 2 \\\\ 0 &amp; 0\\end{pmatrix})) + \\begin{pmatrix} 0.6 \\\\ -1.2 \\end{pmatrix} = \\begin{pmatrix} 5.4 \\\\ 0.72 \\end{pmatrix} $$<p>4. Iteration</p><br>$$\\mathbf{x^{(4)}} = \\mathbf{D^{-1}} * (\\mathbf{b} - (\\mathbf{L} + \\mathbf{U})) + \\mathbf{x^{(3)}} = \\begin{pmatrix}1 &amp; 0 \\\\ 0 &amp; 0.2\\end{pmatrix} * (\\begin{pmatrix} 3\\\\ 6\\end{pmatrix} - (\\begin{pmatrix}0 &amp; 0 \\\\ 4 &amp; 0\\end{pmatrix} + \\begin{pmatrix}0 &amp; 2 \\\\ 0 &amp; 0\\end{pmatrix})) + \\begin{pmatrix} 5.4 \\\\ 0.72 \\end{pmatrix} = \\begin{pmatrix} 1.56 \\\\ -3.12 \\end{pmatrix} $$<p>5. Iteration</p><br>$$\\mathbf{x^{(5)}} = \\mathbf{D^{-1}} * (\\mathbf{b} - (\\mathbf{L} + \\mathbf{U})) + \\mathbf{x^{(4)}} = \\begin{pmatrix}1 &amp; 0 \\\\ 0 &amp; 0.2\\end{pmatrix} * (\\begin{pmatrix} 3\\\\ 6\\end{pmatrix} - (\\begin{pmatrix}0 &amp; 0 \\\\ 4 &amp; 0\\end{pmatrix} + \\begin{pmatrix}0 &amp; 2 \\\\ 0 &amp; 0\\end{pmatrix})) + \\begin{pmatrix} 1.56 \\\\ -3.12 \\end{pmatrix} = \\begin{pmatrix} 9.24 \\\\ -0.05 \\end{pmatrix} $$<p>6. Iteration</p><br>$$\\mathbf{x^{(6)}} = \\mathbf{D^{-1}} * (\\mathbf{b} - (\\mathbf{L} + \\mathbf{U})) + \\mathbf{x^{(5)}} = \\begin{pmatrix}1 &amp; 0 \\\\ 0 &amp; 0.2\\end{pmatrix} * (\\begin{pmatrix} 3\\\\ 6\\end{pmatrix} - (\\begin{pmatrix}0 &amp; 0 \\\\ 4 &amp; 0\\end{pmatrix} + \\begin{pmatrix}0 &amp; 2 \\\\ 0 &amp; 0\\end{pmatrix})) + \\begin{pmatrix} 9.24 \\\\ -0.05 \\end{pmatrix} = \\begin{pmatrix} 3.1 \\\\ -6.19 \\end{pmatrix} $$<p>7. Iteration</p><br>$$\\mathbf{x^{(7)}} = \\mathbf{D^{-1}} * (\\mathbf{b} - (\\mathbf{L} + \\mathbf{U})) + \\mathbf{x^{(6)}} = \\begin{pmatrix}1 &amp; 0 \\\\ 0 &amp; 0.2\\end{pmatrix} * (\\begin{pmatrix} 3\\\\ 6\\end{pmatrix} - (\\begin{pmatrix}0 &amp; 0 \\\\ 4 &amp; 0\\end{pmatrix} + \\begin{pmatrix}0 &amp; 2 \\\\ 0 &amp; 0\\end{pmatrix})) + \\begin{pmatrix} 3.1 \\\\ -6.19 \\end{pmatrix} = \\begin{pmatrix} 15.38 \\\\ -1.28 \\end{pmatrix} $$<p>8. Iteration</p><br>$$\\mathbf{x^{(8)}} = \\mathbf{D^{-1}} * (\\mathbf{b} - (\\mathbf{L} + \\mathbf{U})) + \\mathbf{x^{(7)}} = \\begin{pmatrix}1 &amp; 0 \\\\ 0 &amp; 0.2\\end{pmatrix} * (\\begin{pmatrix} 3\\\\ 6\\end{pmatrix} - (\\begin{pmatrix}0 &amp; 0 \\\\ 4 &amp; 0\\end{pmatrix} + \\begin{pmatrix}0 &amp; 2 \\\\ 0 &amp; 0\\end{pmatrix})) + \\begin{pmatrix} 15.38 \\\\ -1.28 \\end{pmatrix} = \\begin{pmatrix} 5.56 \\\\ -11.1 \\end{pmatrix} $$<p>9. Iteration</p><br>$$\\mathbf{x^{(9)}} = \\mathbf{D^{-1}} * (\\mathbf{b} - (\\mathbf{L} + \\mathbf{U})) + \\mathbf{x^{(8)}} = \\begin{pmatrix}1 &amp; 0 \\\\ 0 &amp; 0.2\\end{pmatrix} * (\\begin{pmatrix} 3\\\\ 6\\end{pmatrix} - (\\begin{pmatrix}0 &amp; 0 \\\\ 4 &amp; 0\\end{pmatrix} + \\begin{pmatrix}0 &amp; 2 \\\\ 0 &amp; 0\\end{pmatrix})) + \\begin{pmatrix} 5.56 \\\\ -11.1 \\end{pmatrix} = \\begin{pmatrix} 25.2 \\\\ -3.25 \\end{pmatrix} $$<p>10. Iteration</p><br>$$\\mathbf{x^{(10)}} = \\mathbf{D^{-1}} * (\\mathbf{b} - (\\mathbf{L} + \\mathbf{U})) + \\mathbf{x^{(9)}} = \\begin{pmatrix}1 &amp; 0 \\\\ 0 &amp; 0.2\\end{pmatrix} * (\\begin{pmatrix} 3\\\\ 6\\end{pmatrix} - (\\begin{pmatrix}0 &amp; 0 \\\\ 4 &amp; 0\\end{pmatrix} + \\begin{pmatrix}0 &amp; 2 \\\\ 0 &amp; 0\\end{pmatrix})) + \\begin{pmatrix} 25.2 \\\\ -3.25 \\end{pmatrix} = \\begin{pmatrix} 9.5 \\\\ -18.96 \\end{pmatrix} $$"
        const iterationText = document.getElementById('Iterationen').innerHTML;
        expect(iterationText).toContain(text);
    });

});

describe('clearInput', () => {
    beforeEach(() => {
        setupDOM()
    });

    test('should clear all rows from the tables and call createInputFields and addSigns', () => {
        const createInputFieldsMock = jest.fn();
        global.createInputFields = createInputFieldsMock;
        const addSignsMock = jest.fn();
        global.addSigns = addSignsMock;
        // Call the function
        clearInput();

        // Get the tables
        const table = document.getElementById('Gleichungssystem');
        const vector = document.getElementById('Startvektor');

        // Check if rows were deleted
        expect(table.rows.length).toBe(4);
        expect(vector.rows.length).toBe(4);

        // Check if createInputFields was called 4 times

        expect(createInputFieldsMock).toHaveBeenCalledTimes(0);

        // Check if addSigns was called
        expect(addSignsMock).toHaveBeenCalledTimes(0);
    });
});

describe('createStandardExample', () => {
    beforeEach(() => {
        setupDOM(); // Rufe setupDOM auf, um die Testumgebung einzurichten
    });

    test('should clear all rows from the tables, call createInputFields, addSigns, and set correct input values', () => {
        const createInputFieldsMock = jest.fn();
        global.createInputFields = createInputFieldsMock;
        const addSignsMock = jest.fn();
        global.addSigns = addSignsMock;
        // Call the function
        createStandardExample();

        // Get the tables
        const table = document.getElementById('Gleichungssystem');
        const vector = document.getElementById('Startvektor');

        // Check if rows were deleted
        expect(table.rows.length).toBe(4);
        expect(vector.rows.length).toBe(4);

        // Check if createInputFields was called 4 times
        expect(createInputFieldsMock).toHaveBeenCalledTimes(0);

        // Check if addSigns was called
        expect(addSignsMock).toHaveBeenCalledTimes(0);

        // Get input elements
        const inputs = table.getElementsByTagName('input');

        // Check if the correct values were set
        const expectedValues = [
            10, -1, 2, 0, 6,
            -1, 11, -1, 3, 25,
            2, -1, 10, -1, -11,
            0, 3, -1, 8, 15
        ];

        expectedValues.forEach((value, index) => {
            expect(inputs[index].value).toBe(value.toString());
        });
    });
});

describe('createInputFields', () => {
    beforeEach(() => {
        setupDOM(); // Rufe setupDOM auf, um die Testumgebung einzurichten
    });

    test('should add a row with 5 input fields to the Gleichungssystem table and 1 input field to the Startvektor table', () => {
        // Call the function
        createInputFields();

        // Get the tables
        const table = document.getElementById('Gleichungssystem');
        const vector = document.getElementById('Startvektor');

        // Check if a row was added to the Gleichungssystem table
        expect(table.rows.length).toBe(3);
        const row = table.rows[0];
        expect(row.cells.length).toBe(3);

        // Check if all cells contain input elements
        for (let i = 0; i < 5; i++) {
            const input = row.cells[i];
            expect(input).not.toBeNull();
        }

        // Check if a row was added to the Startvektor table
        expect(vector.rows.length).toBe(3);
        const vectorRow = vector.rows[0];
        expect(vectorRow.cells.length).toBe(1);

    });
});
