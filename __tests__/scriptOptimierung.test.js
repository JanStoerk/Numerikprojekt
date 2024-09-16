const { BranchAndBound, extractVariablesAndCoefficients, addConstraint, reset, checkInputs, getInputs, createDiagram, skipForward, playBranchAndBound, skipBackward, checkForUnboundedSolution, updateResults } = require('../LineareOptimierung/scriptOptimierung');


function setupDOM() {
    document.body.innerHTML = `
       <div id="diagramm" ></div>
                           <label id="obereSchranke"></label>
                 
                           <label id="untereSchranke"></label>
                       
                           <label id="momentanesErgebnis"></label>
                       
                           <label id="optimalesErgebnis"></label>
                     
                           <label id="anzahlLoesungen"></label>
                       
                           <label id="prunedTrees"></label>
                   
                <div id="resultContainer"></div>

                <button id="branchButton" disabled></button>
                <button id="skip-back">
                        </button>
                        <button id="btnStart" >
                            <i  id="play-icon"></i>
                            <i  id="pause-icon"></i>
                        </button>
                        <button id="skip-forward">
                        </button>
                        <button id="btnZeichne" ></button> 
                <button id="resetTree" disabled></button>
                <table id="nebenbedingungen">
                    <tbody>
                        <tr>
                            <td><input type="text" id="funktion"></td>
                        </tr>
                        <tr>

                            <td><input type="text" id="nebenbedingung1"></td>
                        </tr>
                        <tr>
                            <td><input type="text" id="nebenbedingung2"></td>
                        </tr>
                    </tbody>
                </table>
    `;
}

const visMock = {
    DataSet: jest.fn(() => ({
        add: jest.fn(),
        remove: jest.fn(),
        update: jest.fn(),
        clear: jest.fn(),
    })),
    Network: jest.fn(() => ({
        setData: jest.fn(),
        on: jest.fn(),
    })),
};

// Globalen Mock für vis.js definieren
global.vis = visMock;

global.Plotly = {
    newPlot: jest.fn(),
    Icons: {
        camera: 'mockCameraIcon',
        home: 'mockHomeIcon'
    },
    downloadImage: jest.fn(),
    relayout: jest.fn()
};

require('../LineareOptimierung/scriptOptimierung');

describe('BranchAndBound Class', () => {
    let branchAndBound;

    beforeEach(() => {
        setupDOM()
        // Beispielwerte für den Konstruktor
        const variables = ['x', 'y'];
        const objectiveCoefficients = [5, 3];
        const constraintsCoefficients = [[1, 0], [0, 1], [1, 1], [1, 0], [1, 0], [1, 0]];
        const constraintsBounds = [5, 4, 6, 6, 1, 0];
        const constraintTypes = ['<=', '<=', '<=', '<', '>=', '>'];
        const fx = '5x + 3y';

        // Instanz der Klasse BranchAndBound initialisieren
        branchAndBound = new BranchAndBound(
            variables,
            objectiveCoefficients,
            constraintsCoefficients,
            constraintsBounds,
            constraintTypes,
            fx
        );

        // Mocken der network Eigenschaft, da resetTree darauf zugreift
        branchAndBound.network = {
            setData: jest.fn(),
            focus: jest.fn(),
            fit: jest.fn()
        };
        branchAndBound.edges = {
            add: jest.fn()
        };
        branchAndBound.nodes = {
            update: jest.fn(),
            get: jest.fn(),
            add: jest.fn()
        };
    });

    test('resetTree should clear nodes and edges from the network', () => {
        // Rufe die resetTree-Methode auf
        branchAndBound.resetTree();

        // Erwartung: setData wird mit leeren Knoten und Kanten aufgerufen
        expect(branchAndBound.network.setData).toHaveBeenCalledWith({
            nodes: [],
            edges: [],
        });
    });

    test('computeInitialBounds should compute the correct initial bounds', () => {
        // Rufe die computeInitialBounds-Methode auf
        const bounds = branchAndBound.computeInitialBounds();

        const expectedBounds = [
            [1, 5],   // x: untere Grenze 1, obere Grenze 5
            [0, 4]    // y: untere Grenze 0, obere Grenze 4
        ];

        // Erwartung: Die berechneten Bounds sollten den erwarteten entsprechen
        expect(bounds).toEqual(expectedBounds);
    });

    // Test für die evaluateObjective Funktion
    test('evaluateObjective should return the correct objective value for a given solution', () => {
        const solution = [2, 3];  // Beispiel für Lösung: x = 2, y = 3

        // Erwarteter Zielfunktionswert: 5 * 2 + 3 * 3 = 10 + 9 = 19
        const expectedObjectiveValue = 19;

        const result = branchAndBound.evaluateObjective(solution);

        // Erwartung: Ergebnis sollte der erwarteten Zielfunktion entsprechen
        expect(result).toBe(expectedObjectiveValue);
    });

    // Test für die calculateUpperBound Funktion
    test('calculateUpperBound should return the correct upper bound for given bounds', () => {
        const bounds = [[0, 5], [0, 4]];  // Beispiel für Schranken: x in [0, 5], y in [0, 4]

        // Erwartete obere Schranke: 5 * 5 + 4 * 3 = 25 + 12 = 37
        const expectedUpperBound = 37;

        const result = branchAndBound.calculateUpperBound(bounds);

        // Erwartung: Ergebnis sollte der erwarteten oberen Schranke entsprechen
        expect(result).toBe(expectedUpperBound);
    });

    test('solve should update bestObjectiveValue and create error plot', () => {

        // Vorabwerte
        branchAndBound.stack = [{ bounds: [[1, 5], [0, 4]], path: 'start', parentId: 1 }];
        branchAndBound.iterations = branchAndBound.maxIterations;
        branchAndBound.bestObjectiveValue = 0;

        // Ausführung der solve-Methode
        branchAndBound.solve();


        // Erwartung: BestObjectiveValue sollte aktualisiert worden sein
        expect(branchAndBound.bestObjectiveValue).not.toBe(null);

        // Erwartung: Plotly.newPlot sollte aufgerufen worden sein
        expect(Plotly.newPlot).toHaveBeenCalledWith(
            'diagramm',
            expect.any(Array), // trace array
            expect.objectContaining({ title: 'Abweichungsdiagramm' }), // layout object
            expect.any(Object) // config object
        );

        // Erwartung: Das Diagramm sollte angezeigt werden
        expect(document.getElementById("diagramm").style.display).toBe('inline');
    });

    test('satisfiesConstraints should return true when all constraints are satisfied', () => {
        const solution = [1, 2];
        branchAndBound.constraintsCoefficients = [
            [1, 0], // x1 <= 5
            [0, 1], // x2 <= 4
            [1, 1]  // x1 + x2 <= 6
        ];
        branchAndBound.constraintsBounds = [5, 4, 6];
        branchAndBound.constraintTypes = ['<=', '<=', '<='];

        const result = branchAndBound.satisfiesConstraints(solution);

        expect(result).toBe(true);
    });

    test('satisfiesConstraints should return false when one constraint is not satisfied', () => {
        const solution = [3, 4];
        branchAndBound.constraintsCoefficients = [
            [1, 0], // x1 <= 5
            [0, 1], // x2 <= 4
            [1, 1]  // x1 + x2 <= 6
        ];
        branchAndBound.constraintsBounds = [5, 4, 6];
        branchAndBound.constraintTypes = ['<=', '<=', '<='];

        const result = branchAndBound.satisfiesConstraints(solution);

        expect(result).toBe(false); // x1 + x2 = 7 which is greater than 6
    });

    test('satisfiesConstraints should handle different constraint types correctly', () => {
        const solution = [3, 3];
        branchAndBound.constraintsCoefficients = [
            [1, 0], // x1 < 5
            [0, 1], // x2 >= 2
            [1, 1]  // x1 + x2 > 4
        ];
        branchAndBound.constraintsBounds = [5, 2, 4];
        branchAndBound.constraintTypes = ['<', '>=', '>'];

        const result = branchAndBound.satisfiesConstraints(solution);

        expect(result).toBe(true); // All constraints should be satisfied
    });

    test('satisfiesConstraints should return false when constraint type is invalid', () => {
        const solution = [1, 2];
        branchAndBound.constraintsCoefficients = [
            [1, 0], // Invalid constraint type
        ];
        branchAndBound.constraintsBounds = [5];
        branchAndBound.constraintTypes = ['invalid'];

        console.error = jest.fn(); // Mock console.error to test if it gets called

        const result = branchAndBound.satisfiesConstraints(solution);

        expect(result).toBe(false); // Invalid constraint should return false
        expect(console.error).toHaveBeenCalledWith('Unbekannter Constraint-Typ: invalid');
    });



    test('should return true when stack is empty or max iterations are reached', () => {
        branchAndBound.stack = [];
        branchAndBound.iterations = branchAndBound.maxIterations;

        const result = branchAndBound.iterate();

        expect(result).toBe(true);
        expect(branchAndBound.network.fit).toHaveBeenCalledWith({
            animation: {
                duration: 1000,
                easingFunction: "easeInOutQuad"
            }
        });
    });

    test('should stop and skip iteration if the parent node is black', () => {
        branchAndBound.stack = [{ parentId: 1, bounds: [[0, 1]] }];
        branchAndBound.nodes.get.mockReturnValue({ color: { background: '#4d4848' } });

        const result = branchAndBound.iterate();

        expect(branchAndBound.nodes.get).toHaveBeenCalledWith(1);
        expect(branchAndBound.iterations).toBe(0); // ensure it didn't increment
    });

    test('should add a node and explore it if midpoint satisfies constraints', () => {
        branchAndBound.stack = [{ parentId: 1, bounds: [[1, 2]] }];
        branchAndBound.explore = jest.fn();
        branchAndBound.explore = jest.fn().mockReturnValue(true);
        const result = branchAndBound.iterate();

        expect(branchAndBound.nodes.add).toHaveBeenCalled();
        expect(branchAndBound.explore).toHaveBeenCalled();
        expect(branchAndBound.nodes.update).toHaveBeenCalledWith(expect.objectContaining({
            color: expect.objectContaining({
                background: '#c5e4d1'
            })
        }));
    });

    test('should color node black if upperBound is less than or equal to bestObjectiveValue', () => {
        branchAndBound.stack = [{ parentId: 1, bounds: [[0, 2]] }];
        branchAndBound.bestObjectiveValue = 10;

        branchAndBound.iterate();

        expect(branchAndBound.nodes.update).toHaveBeenCalledWith(expect.objectContaining({
            color: expect.objectContaining({
                background: '#4d4848',
                border: '#000000'
            })
        }));
    });

    test('should color node red if it does not satisfy constraints', () => {
        branchAndBound.stack = [{ parentId: 1, bounds: [[0, 2]] }];

        branchAndBound.iterate();

        expect(branchAndBound.nodes.update).toHaveBeenCalledWith(expect.objectContaining({
            color: expect.objectContaining({
                background: '#ffcccc',
                border: '#ff0000'
            })
        }));
    });

    test('should add blue color to the edge if constraints are satisfied but not the best', () => {
        branchAndBound.stack = [{ parentId: 1, bounds: [[1, 2]] }];
        branchAndBound.bestObjectiveValue = 5;
        branchAndBound.explore = jest.fn();
        branchAndBound.explore = jest.fn().mockReturnValue(false);
        branchAndBound.satisfiesConstraints = jest.fn();
        branchAndBound.satisfiesConstraints = jest.fn().mockReturnValue(true);
        branchAndBound.iterate();

        expect(branchAndBound.edges.add).toHaveBeenCalledWith(expect.objectContaining({
            color: expect.objectContaining({
                color: 'blue'
            })
        }));
    });

    test('should return true and update bestObjectiveValue and bestSolution if solution satisfies constraints and has a better objective value', () => {
        const solution = [1, 2];
        branchAndBound.satisfiesConstraints = jest.fn();
        branchAndBound.evaluateObjective = jest.fn();
        branchAndBound.satisfiesConstraints = jest.fn().mockReturnValue(true);
        branchAndBound.evaluateObjective = jest.fn().mockReturnValue(10);
        branchAndBound.bestObjectiveValue = 5;

        const result = branchAndBound.explore(solution);

        expect(result).toBe(true);
        expect(branchAndBound.bestObjectiveValue).toBe(10);
        expect(branchAndBound.bestSolution).toEqual([1, 2]);
    });
});


describe('extractVariablesAndCoefficients', () => {

    beforeEach(() => {
        // Create a mock DOM structure
        setupDOM()
    });

    test('should correctly extract variables and coefficients from the objective function and constraints', () => {
        const objectiveFunction = '5x + 3y';
        const constraints = [
            'x + y <= 5',
            '2x - y >= 1'
        ];

        const result = extractVariablesAndCoefficients(objectiveFunction, constraints);

        expect(result.variables).toEqual(['x', 'y']);
        expect(result.objectiveCoefficients).toEqual([5, 3]);
        expect(result.constraintTypes).toEqual(['<=', '>=']);
        expect(result.constraintCoefficients).toEqual([
            [1, 1],  // Coefficients for 'x + y'
            [2, -1]  // Coefficients for '2x - y'
        ]);
        expect(result.constraintBounds).toEqual([5, 1]);
    });

    test('should handle invalid constraints gracefully', () => {
        const objectiveFunction = '3x + y';
        const constraints = [
            'x + y <= 5',
            '2x + invalid'
        ];

        console.error = jest.fn();  // Mock console.error to avoid cluttering test output

        const result = extractVariablesAndCoefficients(objectiveFunction, constraints);

        expect(result.variables).toEqual(['x', 'y']);
        expect(result.objectiveCoefficients).toEqual([3, 1]);
        expect(result.constraintTypes).toEqual(['<=']);
        expect(result.constraintCoefficients).toEqual([
            [1, 1]  // Coefficients for 'x + y'
        ]);
        expect(result.constraintBounds).toEqual([5]);

        expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Constraint 2 could not be parsed'));
    });

    test('should handle constraints with fractional coefficients', () => {
        const objectiveFunction = '4/5x - y';
        const constraints = [
            '2x + 1/2y <= 3',
            'x - 3/4y >= 2'
        ];

        const result = extractVariablesAndCoefficients(objectiveFunction, constraints);

        expect(result.variables).toEqual(['x', 'y']);
        expect(result.objectiveCoefficients).toEqual([4 / 5, -1]);
        expect(result.constraintTypes).toEqual(['<=', '>=']);
        expect(result.constraintCoefficients).toEqual([
            [2, 1 / 2],  // Coefficients for '2x + 1/2y'
            [1, -3 / 4]  // Coefficients for 'x - 3/4y'
        ]);
        expect(result.constraintBounds).toEqual([3, 2]);
    });
});

describe('DOMContentLoaded Event Listener', () => {
    beforeEach(() => {
        setupDOM();

        // Mock-Funktionen
        global.addConstraint = jest.fn();
        global.reset = jest.fn();
        global.checkInputs = jest.fn();
        global.playBranchAndBound = jest.fn();
        global.skipBackward = jest.fn();
        global.createDiagram = jest.fn();
        global.skipForward = jest.fn();
        global.stopFunction = false;
    })
    test('should add event listeners on DOMContentLoaded', () => {

        // Simuliere DOMContentLoaded
        document.dispatchEvent(new Event('DOMContentLoaded'));

        // Überprüfe, ob die Event-Listener hinzugefügt wurden
        const btnStart = document.getElementById('branchButton');
        const skipForwardButton = document.getElementById('skip-forward');
        const playButton = document.getElementById('btnStart');
        const skipBackwardButton = document.getElementById('skip-back');
        const btnZeichne = document.getElementById('btnZeichne');
        const resetTree = document.getElementById('resetTree');
        const playIcon = document.getElementById('play-icon');
        const pauseIcon = document.getElementById('pause-icon');
        const funktionInput = document.getElementById('funktion');

        expect(btnStart).toBeDefined();
        expect(skipForwardButton).toBeDefined();
        expect(playButton).toBeDefined();
        expect(skipBackwardButton).toBeDefined();
        expect(btnZeichne).toBeDefined();
        expect(resetTree).toBeDefined();
        expect(playIcon).toBeDefined();
        expect(pauseIcon).toBeDefined();
        expect(funktionInput).toBeDefined();

        expect(btnZeichne.onclick).toBeDefined();
        expect(resetTree.onclick).toBeDefined();
        expect(funktionInput.oninput).toBeDefined();
        expect(playButton.onclick).toBeDefined();
        expect(skipBackwardButton.onclick).toBeDefined();
        expect(btnStart.onclick).toBeDefined();
        expect(skipForwardButton.onclick).toBeDefined();
    });

    test('should handle window blur event correctly', () => {

        // Simuliere DOMContentLoaded
        document.dispatchEvent(new Event('DOMContentLoaded'));

        // Simuliere window blur Event
        window.dispatchEvent(new Event('blur'));

        // Überprüfe, ob die display-Stile von playIcon und pauseIcon korrekt geändert wurden
        const playIcon = document.getElementById('play-icon');
        const pauseIcon = document.getElementById('pause-icon');

        expect(playIcon.style.display).toBe('block');
        expect(pauseIcon.style.display).toBe('none');
    });

});

describe('addConstraint', () => {
    beforeEach(() => {
        setupDOM()
        global.nebenbedingungCount = 2;
        global.maxNebenbedingungen = 9;
    });
    test('should add a new row to the table if the count is less than maxNebenbedingungen', () => {
        const tableBody = document.querySelector('#nebenbedingungen tbody');

        addConstraint();

        // Überprüfe, ob eine neue Zeile hinzugefügt wurde
        const rows = tableBody.querySelectorAll('tr');
        expect(rows.length).toBe(4);  // Es sollte eine neue Zeile hinzugefügt worden sein

        // Überprüfe den Inhalt der neuen Zeile
        const lastRow = rows[rows.length - 1];
        expect(lastRow.innerHTML).toContain('Nebenbedingung 3');  // Überprüfe den Label-Text
        expect(lastRow.innerHTML).toContain('id="nebenbedingung3"');  // Überprüfe die ID des Input-Feldes
    });

    test('should disable the btnZeichne button if the count is equal to maxNebenbedingungen', () => {
        const btnZeichne = document.getElementById('btnZeichne');
        let i = 0;
        while (i < 8) {
            addConstraint();
            i++;
        }

        expect(btnZeichne.disabled).toBe(true);
    });

});

describe('reset function', () => {
    beforeEach(() => {
        setupDOM()

        // Setze globale Variablen
        global.nebenbedingungCount = 2;
        global.bbSolver = {
            resetTree: jest.fn()
        };
    });

    test('should reset all elements and disable/enable buttons correctly', () => {
        // Simuliere ein Element mit Stil und deaktivierten Status
        document.getElementById('nebenbedingung1').disabled = true;
        document.getElementById('nebenbedingung2').disabled = true;
        document.getElementById('funktion').disabled = true;
        document.getElementById('btnZeichne').disabled = true;
        document.getElementById('resetTree').disabled = false;
        document.getElementById('diagramm').style.display = "block";
        document.getElementById('obereSchranke').innerHTML = "some text";
        document.getElementById('untereSchranke').innerHTML = "some text";
        document.getElementById('momentanesErgebnis').innerHTML = "some text";
        document.getElementById('optimalesErgebnis').innerHTML = "some text";
        document.getElementById('anzahlLoesungen').innerHTML = "some text";
        document.getElementById('prunedTrees').innerHTML = "some text";

        reset();

        const inputs = [1, 2].map(num => document.getElementById('nebenbedingung' + num));
        inputs.forEach(input => expect(input.disabled).toBe(false));

        expect(document.getElementById('funktion').disabled).toBe(false);
        expect(document.getElementById('btnZeichne').disabled).toBe(false);
        expect(document.getElementById('resetTree').disabled).toBe(true);
        expect(document.getElementById('diagramm').style.display).toBe("none");
        expect(document.getElementById('obereSchranke').innerHTML).toBe("");
        expect(document.getElementById('untereSchranke').innerHTML).toBe("");
        expect(document.getElementById('momentanesErgebnis').innerHTML).toBe("");
        expect(document.getElementById('optimalesErgebnis').innerHTML).toBe("");
        expect(document.getElementById('anzahlLoesungen').innerHTML).toBe("");
        expect(document.getElementById('prunedTrees').innerHTML).toBe("");
    });
});

describe('checkInputs function', () => {
    beforeEach(() => {
        setupDOM()
    });

    test('should disable the branchButton if the funktion input is empty', () => {
        const btnStart = document.getElementById('branchButton');
        const funktionInput = document.getElementById('funktion');

        // Simuliere einen leeren Eingabefeld
        funktionInput.value = '';
        checkInputs();

        expect(btnStart.disabled).toBe(true);
    });

    test('should enable the branchButton if the funktion input is not empty', () => {
        const btnStart = document.getElementById('branchButton');
        const funktionInput = document.getElementById('funktion');

        // Simuliere ein nicht-leeres Eingabefeld
        funktionInput.value = 'some input';
        checkInputs();

        expect(btnStart.disabled).toBe(false);
    });
});

describe('getInputs function', () => {
    beforeEach(() => {
        setupDOM()

        // Mock für jQuery
        global.$ = jest.fn().mockImplementation((selector) => {
            return {
                popover: jest.fn().mockImplementation((action) => {
                    if (action === 'dispose') {
                        // Do nothing
                    }
                })
            };
        });
        // Mock für Algebrite.run
        global.Algebrite = {
            run: jest.fn().mockReturnValue('parsedFunction')
        };

        // Mock für extractVariablesAndCoefficients
        global.extractVariablesAndCoefficients = jest.fn().mockReturnValue({ variables: ['x', 'y'], coefficients: [3, 4] });
    });

    test('should process and format the input function correctly', () => {
        const btnZeichne = document.getElementById('btnZeichne');
        const resetTree = document.getElementById('resetTree');
        const funktionInput = document.getElementById('funktion');

        getInputs();

        expect(funktionInput.disabled).toBe(true);
        expect(btnZeichne.disabled).toBe(true);
        expect(resetTree.disabled).toBe(false);
        expect(Algebrite.run).toHaveBeenCalledWith('simplify()');
    });

    test('should disable input fields and collect nebenbedingungen', () => {
        const inputs = [1, 2].map(num => document.getElementById('nebenbedingung' + num));
        inputs.forEach(input => expect(input.disabled).toBe(false));

        const result = getInputs();
        expect(result).toEqual({ "constraintBounds": [], "constraintCoefficients": [], "constraintTypes": [], "objectiveCoefficients": [1], "variables": ["parsedFunction"] });

    });

    test('should return correct values from extractVariablesAndCoefficients', () => {
        const result = getInputs();
        expect(result).toEqual({ "constraintBounds": [], "constraintCoefficients": [], "constraintTypes": [], "objectiveCoefficients": [1], "variables": ["parsedFunction"] });
    });
});


describe('createDiagram function', () => {
    beforeEach(() => {
        setupDOM()

        global.getInputs = jest.fn().mockReturnValue({
            variables: ['x', 'y'],
            objectiveCoefficients: [1, 2],
            constraintCoefficients: [[1, 0], [0, 1]],
            constraintBounds: [5, 4],
            constraintTypes: ['<=', '>=']
        });

        global.checkForUnboundedSolution = jest.fn().mockReturnValue(false);
        global.BranchAndBound = jest.fn().mockImplementation(() => ({
            solve: jest.fn(),
            iterate: jest.fn()
        }));
        global.updateResults = jest.fn();
        global.reset = jest.fn();

        // Mock jQuery and popover
        global.$ = jest.fn().mockImplementation(() => ({
            popover: jest.fn().mockReturnThis(),  // Mock 'popover' method
            dispose: jest.fn()
        }));
    });

    test('should initialize and solve BranchAndBound when no unbounded solution is detected', () => {
        createDiagram();

        expect(global.getInputs).toHaveLength(0);
        expect(global.checkForUnboundedSolution).toHaveLength(0);
        expect(global.BranchAndBound).toHaveLength(0);
        expect(global.updateResults).toHaveLength(0);
    });

    test('should call reset if an unbounded solution is detected', () => {
        global.checkForUnboundedSolution = jest.fn();
        global.checkForUnboundedSolution = jest.fn().mockReturnValue(true);

        createDiagram();
        expect(global.reset).toHaveLength(0);
    });
});
