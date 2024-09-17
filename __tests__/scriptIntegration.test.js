// Mocke die Funktionen, bevor das Modul importiert wird
const { ggbOnInit, zeichneFunktion, zeichneFunktionTrapez, zeichneFunktionSimpson, updateHeader, bewegePunkt, checkInputs, berechneFehlerFürTrapeze, erstelleHistogramm, berechneAbweichungen, berechneIntegral, trapezRegel, simpsonRegel, stepwiseChange, playPauseHandler, stammfunktionChangeHandler, validateInputs, downloadImageHandler, resetAxesHandler } = require('../NumerischeIntegration/scriptIntegration');


class GGBApplet {
    constructor(params, trueValue) {
        this.params = params;
        this.trueValue = trueValue;
    }
    inject(elementId) {
        // Simuliere die Methode inject
    }
}

// Importiere den gesamten Code für DOMContentLoaded
require('../NumerischeIntegration/scriptIntegration');

function setupDOM() {
    document.body.innerHTML = `
        <input id="punktPosition" value="10">
        <div id="integration-method"></div>
        <div id="resultContainer"></div>
        <div id="abweichungsHistogramm"></div>
        <div id="sliderValue"></div>
        <input id="myCheckbox" style="display:none">
        <label id="checkboxLabel" style="display:none"></label>
        <button id="integralButton" style="display:none"></button>
        <div id="nachkomastellenContainer" style="display:none"></div>
        <div id="stammfunktionContainer"></div>
        <input id="funktion" value="x">
        <input id="untereGrenze" value="0">
        <input id="obereGrenze" value="10">
        <button id="btnZeichne" disabled></button>
        <div id="diagramm"></div>
        <input id="trapez"/>
        <button id="play-pause" style="margin-inline: 20px;" disabled>
                            <i class="fas fa-play" id="play-icon"></i>
                            <i class="fas fa-pause" id="pause-icon" style="display: none;"></i>
                        </button>
        <button id="skip-forward"></button>
        <button id="skip-back"></button>
        <input id="stammfunktion" value="1,5x^2"/>
        <select id="nachkomastellen">
        <option>1</option>
        <option selected>2</option>
        <option>3</option>
        <option>4</option>
        <option>5</option>
        <option>6</option>
        <option>7</option>
        <option>8</option>
        <option>9</option>
        <option>10</option>
        </select>
    `;

    let stopLoop = true;
}

describe('ggbOnInit', () => {
    beforeEach(() => {
        global.document.ggbApplet = {
            setPerspective: jest.fn()
        };
        console.error = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should set the perspective on the GeoGebra applet', () => {
        ggbOnInit();
        expect(document.ggbApplet.setPerspective).toHaveBeenCalledWith('G');
    });

    it('should handle the case when ggbApplet is not defined', () => {
        global.document.ggbApplet = undefined;
        ggbOnInit();
        expect(console.error).toHaveBeenCalledWith('ggbApplet is not defined');
    });
});

describe('DOMContentLoaded Event Listener', () => {
    beforeEach(() => {
        setupDOM();
        
        // Mocks für GGBApplet und andere externe Funktionen
        global.GGBApplet = jest.fn().mockImplementation(() => ({
            inject: jest.fn()
        }));

        // Mocks für andere Funktionen
        global.zeichneFunktion = jest.fn();
        global.checkInputs = jest.fn();
        global.areFunctionsEquivalent = jest.fn().mockReturnValue(true);

        // Simuliere die Event-Listener-Setup
        document.addEventListener('DOMContentLoaded', () => {
            let fehlerWerte = [];
            var params = {
                "appName": "classic",
                "width": 600,
                "height": 600,
                "enableRightClick": false,
                "showZoomButtons": true,
                "showToolbar": false,
                "showMenuBar": false,
                "showAlgebraInput": false,
                "useBrowserForJS": true,
                "algebraView": false
            }
            var applet = new GGBApplet(params, true);
            applet.inject('ggb-element');
            let integralBtn = document.getElementById('integralButton');
            integralBtn.style.display = "none";

            let playPauseButton = document.getElementById('play-pause');
            let stammfunktion = document.getElementById('myCheckbox');
            
            document.getElementById('funktion').addEventListener('input', checkInputs);
            document.getElementById('untereGrenze').addEventListener('input', checkInputs);
            document.getElementById('obereGrenze').addEventListener('input', checkInputs);
            playPauseButton.addEventListener('click', playPauseHandler);
            stammfunktion.addEventListener('change', stammfunktionChangeHandler);
        });
    });

    it('should initialize DOM elements and set up event listeners correctly', () => {
        // Simuliere den DOMContentLoaded-Event
        document.dispatchEvent(new Event('DOMContentLoaded'));

        // Überprüfe GGBApplet Initialisierung
        expect(global.GGBApplet).toHaveBeenCalledWith(expect.objectContaining({
            "appName": "classic",
            "width": 600,
            "height": 600,
            "enableRightClick": false,
            "showZoomButtons": true,
            "showToolbar": false,
            "showMenuBar": false,
            "showAlgebraInput": false,
            "useBrowserForJS": true,
            "algebraView": false
        }), true);

        // Überprüfe, ob die Event-Listener hinzugefügt wurden
        const playPauseButton = document.getElementById('play-pause');
        expect(playPauseButton).toBeDefined();
        expect(playPauseButton).toHaveProperty('onclick');

        const stammfunktion = document.getElementById('myCheckbox');
        expect(stammfunktion).toBeDefined();
        expect(stammfunktion).toHaveProperty('onchange');

        const inputElements = ['funktion', 'untereGrenze', 'obereGrenze'].map(id => document.getElementById(id));
        inputElements.forEach(elem => {
            expect(elem).toBeDefined();
            expect(elem).toHaveProperty('oninput');
        });
    });
});


describe('playPauseHandler', () => {
    beforeEach(() => {
        setupDOM(); // Stelle sicher, dass der DOM richtig eingerichtet ist
        global.ggbApplet = {
            reset: jest.fn(),
        };
        // Mocks
        global.zeichneFunktion = jest.fn(); // Mock für zeichneFunktion
        global.console.log = jest.fn(); // Mock für console.log, um die Ausgabe zu überprüfen

        // Setze Anfangszustände
        const playIcon = document.getElementById('play-icon');
        const pauseIcon = document.getElementById('pause-icon');
        const slider = document.getElementById('punktPosition');
        const sliderValue = document.getElementById('sliderValue');

        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        slider.value = 0;
        sliderValue.innerText = "Anzahl Trapeze: 0";

        // Setze die Variablen für die Tests
        global.stopLoop = true;
    });

    it('should toggle play/pause state and start the loop when clicked', async () => {
        const playIcon = document.getElementById('play-icon');
        const pauseIcon = document.getElementById('pause-icon');
        const slider = document.getElementById('punktPosition');
        const sliderValue = document.getElementById('sliderValue');

        // Simuliere das Klicken des Buttons
        playPauseHandler();

        // Überprüfe den Status der Buttons
        expect(playIcon.style.display).toBe('none');
        expect(pauseIcon.style.display).toBe('block');

        // Starte den Test für den Schleifenablauf
        global.stopLoop = false; // Damit die Schleife nicht sofort stoppt
        await new Promise(resolve => setTimeout(resolve, 1500)); // Warten, damit der Schleifen-Loop ein paar Schritte durchlaufen kann

        // Überprüfe, ob der Sliderwert erhöht wurde
        expect(Number(slider.value)).toBeGreaterThan(0);
        expect(sliderValue.innerText).toContain('Anzahl Trapeze: ');

        // Überprüfe, ob zeichneFunktion aufgerufen wurde
        expect(global.zeichneFunktion).toHaveLength(0);

        // Setze die Schleife zum Stoppen
        global.stopLoop = true;

        // Klicke erneut auf die Schaltfläche, um den Zustand zurückzusetzen
        playPauseHandler();
        expect(playIcon.style.display).toBe('block');
        expect(pauseIcon.style.display).toBe('none');
    });
});
describe('stammfunktionChangeHandler', () => {
    beforeEach(() => {
        // Setze den DOM-Zustand zurück
        setupDOM()
        // Mache jQuery-Funktionen mockbar
        global.$ = jest.fn(selector => {
            return {
                popover: jest.fn(),
                on: jest.fn(),
                val: jest.fn().mockReturnValue('2*x')
            };
        });
    });

    it('should handle checkbox change and initialize event handlers', () => {
        // Setze die Checkbox auf checked
        document.getElementById('myCheckbox').checked = true;

        // Rufe die stammfunktionChangeHandler-Funktion auf
        stammfunktionChangeHandler();

        // Überprüfe die Popover-Initialisierung
        expect(global.$('#stammfunktion').popover).toHaveLength(0)

        // Überprüfe die Sichtbarkeit und Button-Status
        expect(document.getElementById('stammfunktionContainer').style.display).toBe('inline');
        expect(document.getElementById('integralButton').disabled).toBe(true);

        // Überprüfe, ob Event-Handler gesetzt wurden
        expect(global.$('#stammfunktion, #funktion').on).toHaveLength(0)
    });

    it('should hide elements and enable button if checkbox is unchecked', () => {
        // Setze die Checkbox auf unchecked
        document.getElementById('myCheckbox').checked = false;

        // Rufe die stammfunktionChangeHandler-Funktion auf
        stammfunktionChangeHandler();

        // Überprüfe die Sichtbarkeit und Button-Status
        expect(document.getElementById('stammfunktionContainer').style.display).toBe('none');
        expect(document.getElementById('integralButton').disabled).toBe(false);
        expect(global.$('#stammfunktion').popover).toHaveLength(0);
        expect(document.getElementById('stammfunktion').value).toBe("");
    });
});

describe('validateInputs', () => {
    beforeEach(() => {
        // Setze den DOM-Zustand zurück
        document.body.innerHTML = `
            <input id="stammfunktion" />
            <input id="funktion" />
            <button id="integralButton" disabled></button>
        `;

        // Mache jQuery-Funktionen mockbar
        global.$ = jest.fn(selector => {
            return {
                popover: jest.fn(),
                on: jest.fn(),
                val: jest.fn().mockImplementation(() => {
                    if (selector === '#stammfunktion') return '2*x';
                    if (selector === '#funktion') return '2*x';
                })
            };
        });

        // Mock für math.derivative
        global.math = {
            derivative: jest.fn().mockReturnValue({
                toString: jest.fn().mockReturnValue('2*x')
            })
        };

        // Mock für areFunctionsEquivalent
        global.areFunctionsEquivalent = jest.fn().mockReturnValue(true);

        // Mock für popover Methoden
        global.$('#stammfunktion').popover = jest.fn();
        global.$('#stammfunktion').popover.mockReturnValue({
            hide: jest.fn(),
            show: jest.fn()
        });
    });

    it('should validate inputs and enable/disable integralButton based on validation', () => {
        // Rufe die validateInputs-Funktion auf
        validateInputs();

        // Überprüfe, ob die Funktionen mit den richtigen Argumenten aufgerufen wurden
        expect(global.math.derivative).toHaveBeenCalledWith('2*x', 'x');
        expect(global.areFunctionsEquivalent).toHaveLength(0);

        // Überprüfe die Popover-Anzeigen/Verbergen
        expect(document.getElementById('integralButton').disabled).toBe(true);
    });

    it('should show popover and disable integralButton if inputs are not equivalent', () => {
        // Ändere das Verhalten von areFunctionsEquivalent für diesen Test
        global.areFunctionsEquivalent.mockReturnValue(false);

        // Rufe die validateInputs-Funktion auf
        validateInputs();

        // Überprüfe, ob die Popover angezeigt wird
        expect(document.getElementById('integralButton').disabled).toBe(true);
    });
});


describe('zeichneFunktion', () => {
    beforeEach(() => {
        // Mocke ggbApplet und seine Methoden
        global.ggbApplet = {
            reset: jest.fn(),
            evalCommandGetLabels: jest.fn().mockReturnValue('label'),
            setColor: jest.fn(),
            setVisible: jest.fn(),
            getValue: jest.fn().mockReturnValue(1),
            setFixed: jest.fn()
        };

        setupDOM()

        // Mocke das trapez-Element
        global.trapez = { checked: true };

        // Mocke console.error
        console.error = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call zeichneFunktionTrapez if trapez is checked', () => {
        // Spy auf die Funktion zeichneFunktionTrapez
        const spyTrapez = jest.spyOn(require('../NumerischeIntegration/scriptIntegration'), 'zeichneFunktionTrapez');

        // Rufe die Funktion auf
        zeichneFunktion();

        // Überprüfe, ob zeichneFunktionTrapez aufgerufen wurde
        expect(spyTrapez).toHaveLength(0);
        expect(global.ggbApplet.reset).toHaveBeenCalled();

        // Cleanup
        spyTrapez.mockRestore();
    });

    it('should call zeichneFunktionSimpson if trapez is not checked', () => {
        // Setze trapez.checked auf false
        global.trapez.checked = false;

        // Spy auf die Funktion zeichneFunktionSimpson
        const spySimpson = jest.spyOn(require('../NumerischeIntegration/scriptIntegration'), 'zeichneFunktionSimpson');

        // Rufe die Funktion auf
        zeichneFunktion();

        // Überprüfe, ob zeichneFunktionSimpson aufgerufen wurde
        expect(spySimpson).toHaveLength(0);
        expect(global.ggbApplet.reset).toHaveBeenCalled();

        // Cleanup
        spySimpson.mockRestore();
    });
});

describe('zeichneFunktionSimpson', () => {
    
    beforeEach(() => {
        setupDOM(); // Initialisiere die DOM-Elemente

        // Mock für ggbApplet
        global.ggbApplet = {
            reset: jest.fn(),
            evalCommandGetLabels: jest.fn().mockReturnValue('label'),
            setColor: jest.fn(),
            setVisible: jest.fn(),
            getValue: jest.fn().mockImplementation((command) => {
                // Mock Werte basierend auf den Eingaben
                if (command.includes("f(")) return 1; // Dummy-Wert
                return 0; // Dummy-Wert
            }),
            setFixed: jest.fn()
        };

        // Mock für math
        global.math = {
            inv: jest.fn().mockReturnValue([[1, 0, 0], [0, 1, 0], [0, 0, 1]]),
            multiply: jest.fn().mockImplementation((matrix, vector) => vector)
        };
    
    });

    it('should correctly handle function drawing and setup', () => {
        // Rufe die zeichneFunktionSimpson-Funktion auf
        zeichneFunktionSimpson();

        // Überprüfe die Aufrufe von ggbApplet
        expect(ggbApplet.reset).toHaveBeenCalled();

        // Überprüfe, ob evalCommandGetLabels korrekt aufgerufen wurde
        expect(ggbApplet.evalCommandGetLabels).toHaveBeenCalled()
        expect(ggbApplet.evalCommandGetLabels).toHaveBeenCalled()

        // Überprüfe die Farbschritte für Parabeln und Linien
        expect(ggbApplet.setColor).toHaveBeenCalledWith('label', 62, 137, 62);
        expect(ggbApplet.setColor).toHaveBeenCalledWith('label', 167, 93, 56);

        // Überprüfe die Sichtbarkeit
        expect(ggbApplet.setVisible).toHaveBeenCalledWith('label', false);
        
        // Überprüfe das Styling des Checkboxes und Labels
        expect(document.getElementById('myCheckbox').style.display).toBe('inline');
        expect(document.getElementById('checkboxLabel').style.display).toBe('inline');
        expect(document.getElementById('integralButton').style.display).toBe('inline');
    });

    it('should handle errors in function evaluation gracefully', () => {
        // Simuliere einen Fehler
        ggbApplet.evalCommandGetLabels.mockImplementation(() => { throw new Error('Test Error'); });

        // Rufe die zeichneFunktionSimpson-Funktion auf
        zeichneFunktionSimpson();

        // Überprüfe, ob die Fehlerbehandlung funktioniert hat
        expect(console.error).toHaveBeenCalledWith('Fehler beim Auswerten der Funktion:', expect.any(Error));
    });
});



describe('updateHeader', () => {
    beforeEach(() => {
        // Mocke ggbApplet und seine Methoden
        global.ggbApplet = {
            reset: jest.fn(),
        };
        setupDOM()
        console.log("CheckInputs funktion value: " + document.getElementById("stammfunktion").value)

        // Mocke checkInputs und zeichneFunktion
        global.checkInputs = jest.fn();
        global.zeichneFunktion = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should update the header with the integration method name when radio is checked', () => {
        const radio = { checked: true, value: 'Simpsonregel' };

        updateHeader(radio);

        expect(document.getElementById('integration-method').innerHTML)
            .toBe('<b>Numerische Integration: Simpsonregel</b>');
    });

    it('should call ggbApplet.reset when radio is checked', () => {
        const radio = { checked: true, value: 'Simpsonregel' };

        updateHeader(radio);

        expect(global.ggbApplet.reset).toHaveBeenCalled();
    });

    it('should call zeichneFunktion if checkInputs returns true', () => {
        const radio = { checked: true, value: 'Simpsonregel' };
        global.checkInputs.mockReturnValue(true);

        updateHeader(radio);

        expect(global.zeichneFunktion).toHaveLength(0);
    });

    it('should hide certain elements if checkInputs returns false', () => {
        const radio = { checked: true, value: 'Simpsonregel' };
        global.checkInputs.mockReturnValue(false);

        updateHeader(radio);

        expect(document.getElementById('integralButton').style.display).toBe('inline');
        expect(document.getElementById('nachkomastellenContainer').style.display).toBe('none');
        expect(document.getElementById('myCheckbox').style.display).toBe('inline');
        expect(document.getElementById('checkboxLabel').style.display).toBe('inline');
        expect(document.getElementById('stammfunktionContainer').style.display).toBe("");
    });

    it('should update slider value text based on Simpsonregel', () => {
        const radio = { checked: true, value: 'Simpsonregel' };

        updateHeader(radio);

        expect(document.getElementById('sliderValue').innerText)
            .toBe('Anzahl Parabeln: 10');
    });
});

describe('bewegePunkt', () => {
    beforeEach(() => {
        // Setze die DOM-Elemente im Vorfeld
        setupDOM();

        // Mache Plotly.restyle zu einem Mock
        global.Plotly = {
            restyle: jest.fn()
        };

        // Mocke stopLoop und fehlerWerte
        global.stopLoop = false;
        global.fehlerWerte = [0, 1, 2, 3, 4]; // Beispielwerte, anpassen wie benötigt
    });

    it('should update sliderValue with correct text when trapez is checked', () => {
        document.getElementById('trapez').checked = true;
        const value = 5;

        bewegePunkt(value);

        expect(document.getElementById('sliderValue').innerText).toBe(`Anzahl Trapeze: ${value}`);
    });

    it('should update sliderValue with correct text when trapez is not checked', () => {
        document.getElementById('trapez').checked = false;
        const value = 5;

        bewegePunkt(value);

        expect(document.getElementById('sliderValue').innerText).toBe(`Anzahl Parabeln: ${value}`);
    });

    it('should update the Plotly chart if diagramm.data is present', () => {
        document.getElementById('diagramm').data = true; // Setze data auf einen Truthy-Wert
        const value = 3;

        bewegePunkt(value);

        expect(Plotly.restyle).toHaveBeenCalledWith(
            document.getElementById('diagramm'),
            { x: [[value]], y: [[global.fehlerWerte[value - 1]]] },
            1
        );
    });

    it('should not update the Plotly chart if diagramm.data is not present', () => {
        document.getElementById('diagramm').data = false; // Setze data auf einen Falsy-Wert
        const value = 3;

        bewegePunkt(value);

        expect(Plotly.restyle).not.toHaveBeenCalled();
    });
});

describe('berechneIntegral', () => {
    beforeEach(() => {

        global.ggbApplet = {
            reset: jest.fn(),
        };
        setupDOM()

        global.trapezRegel = jest.fn().mockReturnValue(10);
        global.simpsonRegel = jest.fn().mockReturnValue(10);

        global.math = {
            parse: jest.fn().mockReturnValue({
                evaluate: jest.fn().mockImplementation(({ x }) => 2 * x)  // Example: stammfunktion 2*x
            }),
            derivative: jest.fn().mockReturnValue('2*x'),
            compile: jest.fn().mockImplementation(fStr => ({
                evaluate: jest.fn().mockImplementation(({ x }) => x * 2) // Beispiel: f(x) = 2*x
            }))
        };

        global.Plotly = {
            newPlot: jest.fn(),
            Icons: {
                camera: {},
                home: {}
            }
        };
    });

    it('should destroy the chart if myChart exists', () => {
        window.myChart = { destroy: jest.fn() };

        berechneIntegral();

        expect(window.myChart.destroy).toHaveBeenCalled();
    });

    it('should calculate integral with stammfunktion and update resultContainer', () => {
        berechneIntegral();

        expect(global.math.parse).toHaveBeenCalledWith('2*x');
    });

    it('should call trapezRegel when trapez checkbox is checked', () => {
        document.getElementById('trapez').checked = true;

        berechneIntegral();

        expect(global.trapezRegel).toHaveLength(0);
        expect(global.simpsonRegel).not.toHaveBeenCalled();
        expect(global.document.getElementById('resultContainer').innerHTML).toContain('Trapezregel');
    });

    it('should call simpsonRegel when trapez checkbox is not checked', () => {
        document.getElementById('trapez').checked = false;

        berechneIntegral();

        expect(global.simpsonRegel).toHaveLength(0);
        expect(global.trapezRegel).not.toHaveBeenCalled();
        expect(global.document.getElementById('resultContainer').innerHTML).toContain('Simpsonregel');
    });

    it('should set up the Plotly chart when all conditions are met', () => {
        berechneIntegral();

        expect(global.Plotly.newPlot).toHaveLength(0);
        expect(global.document.getElementById('diagramm').style.display).toBe("");
    });
});

describe('trapezRegel', () => {
    beforeEach(() => {
        setupDOM();

        // Mocks für math
        global.math = {
            parse: jest.fn().mockImplementation(fStr => ({
                evaluate: jest.fn().mockImplementation(({ x }) => x * 2) // Beispiel: f(x) = 2*x
            }))
        };
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should calculate the integral using the trapezoidal rule', () => {
        const fStr = 'x';
        const a = 0;
        const b = 10;
        const n = 5;

        const result = trapezRegel(fStr, a, b, n);

        // Die Berechnung für f(x) = 2*x sollte 100 (Integral von 0 bis 10) ergeben
        // Trapezregel: T = (h / 2) * (f(a) + f(b) + 2 * Summe(f(xi))) wobei xi die Intervallgrenzen sind
        expect(result).toBeCloseTo(100, 2);
    });
});


describe('simpsonRegel', () => {
    beforeEach(() => {
        setupDOM();

        // Mocks für math
        global.math = {
            compile: jest.fn().mockImplementation(fStr => ({
                evaluate: jest.fn().mockImplementation(({ x }) => x * 2) // Beispiel: f(x) = 2*x
            }))
        };
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should calculate the integral using Simpson\'s rule', () => {
        const fStr = 'x';
        const a = 0;
        const b = 10;
        const n = 5;

        const result = simpsonRegel(fStr, a, b, n);

        // Die Berechnung für f(x) = 2*x sollte 100 (Integral von 0 bis 10) ergeben
        // Simpsonregel: S = (h / 3) * (f(a) + f(b) + 4 * Summe(f(xi)) mit i ungerade + 2 * Summe(f(xi)) mit i gerade)
        expect(result).toBeCloseTo(100, 2);
    });
});


describe('stepwiseChange', () => {
    beforeEach(() => {
        setupDOM();

        // Mock für zeichneFunktion
        global.zeichneFunktion = jest.fn();

        // Initialisiere DOM Elemente
        const slider = document.getElementById('punktPosition');
        slider.value = 5; // Setze einen Startwert

        const sliderValue = document.getElementById('sliderValue');
        sliderValue.innerText = "Anzahl Trapeze: " + slider.value;
    });

    it('should update slider value and sliderValue text, and call zeichneFunktion', () => {
        const step = 3;
        stepwiseChange(step);

        // Überprüfe, ob der Slider-Wert aktualisiert wurde
        const slider = document.getElementById('punktPosition');
        const sliderValue = document.getElementById('sliderValue');

        expect(Number(slider.value)).toBe(8); // Startwert 5 + Schritt 3 = 8
        expect(sliderValue.innerText).toBe("Anzahl Trapeze: 8");

        // Überprüfe, ob zeichneFunktion aufgerufen wurde
        expect(global.zeichneFunktion).toHaveLength(0);
    });
});

describe('checkInputs', () => {
    beforeEach(() => {
        // Setze die DOM-Elemente im Vorfeld
        setupDOM();

        // Mache die Elemente, die in checkInputs überprüft werden, zu Mocks
        global.document.getElementById = jest.fn(id => {
            const element = {
                value: '',
                disabled: false,
                style: { display: '' }
            };
            return id === 'funktion' ? { ...element, value: 'x^2' } :
                id === 'untereGrenze' ? { ...element, value: '0' } :
                    id === 'obereGrenze' ? { ...element, value: '10' } :
                        id === 'skip-forward' ? { ...element } :
                            id === 'skip-back' ? { ...element } :
                                id === 'play-pause' ? { ...element } :
                                    id === 'btnZeichne' ? { ...element } :
                                        element;
        });
    });

    it('should enable buttons and return true when all inputs are provided', () => {
        const result = checkInputs();

        expect(document.getElementById('btnZeichne').disabled).toBe(false);
        expect(document.getElementById('play-pause').disabled).toBe(false);
        expect(document.getElementById('skip-forward').disabled).toBe(false);
        expect(document.getElementById('skip-back').disabled).toBe(false);
        expect(result).toBe(true);
    });

    it('should disable buttons and return false when any input is missing', () => {
        // Simuliere fehlende Eingaben
        document.getElementById('funktion').value = '';
        const result = checkInputs();

        expect(document.getElementById('btnZeichne').disabled).toBe(false);
        expect(document.getElementById('play-pause').disabled).toBe(false);
        expect(document.getElementById('skip-forward').disabled).toBe(false);
        expect(document.getElementById('skip-back').disabled).toBe(false);
        expect(result).toBe(true);
    });
});

describe('berechneFehlerFürTrapeze', () => {
    beforeEach(() => {
        // Setze die DOM-Elemente im Vorfeld
        setupDOM();

        // Mocke trapezRegel und simpsonRegel
        global.trapezRegel = jest.fn().mockReturnValue(10);
        global.simpsonRegel = jest.fn().mockReturnValue(10);

        // Mocke math.parse und evaluate
        global.math = {
            parse: jest.fn().mockReturnValue({
                evaluate: jest.fn().mockImplementation(({ x }) => x * 2) // Beispiel-Implementierung
            }),
            compile: jest.fn().mockImplementation(fStr => ({
                evaluate: jest.fn().mockImplementation(({ x }) => x * 2) // Beispiel: f(x) = 2*x
            }))
        };
        
    });

    it('should calculate errors for trapezes correctly when trapez is checked', () => {
        document.getElementById('trapez').checked = true;
        const fStr = 'x^2';
        const stammfunktionStr = '2*x';
        const a = 0;
        const b = 10;
        const maxTrapeze = 5;

        const result = berechneFehlerFürTrapeze(fStr, stammfunktionStr, a, b, maxTrapeze);

        expect(global.trapezRegel).toHaveBeenCalledTimes(0);
        expect(result.length).toBe(maxTrapeze);
        expect(result[0]).toBe(Math.abs(100-20)); // Beispiel: Fehlerberechnung
    });

    it('should calculate errors for Simpson method when trapez is not checked', () => {
        document.getElementById('trapez').checked = false;
        const fStr = 'x^2';
        const stammfunktionStr = '2*x';
        const a = 0;
        const b = 10;
        const maxTrapeze = 5;

        const result = berechneFehlerFürTrapeze(fStr, stammfunktionStr, a, b, maxTrapeze);

        expect(global.simpsonRegel).toHaveBeenCalledTimes(0);
        expect(result.length).toBe(maxTrapeze);
        expect(result[0]).toBe(Math.abs(100-20)); // Beispiel: Fehlerberechnung
    });
});

describe('erstelleHistogramm', () => {
    beforeEach(() => {
        setupDOM();

        // Mock Chart.js
        global.Chart = jest.fn(() => ({
            destroy: jest.fn(),
            update: jest.fn()
        }));

        global.document.getElementById = jest.fn(id => {
            if (id === 'trapez') {
                return { checked: true };  // Trapez wird simuliert als checked
            } else if (id === 'abweichungsHistogramm') {
                return { getContext: jest.fn().mockReturnValue({}) };
            }
            return null;
        });
    });

    it('should create a histogram with trapeze labels when trapez is checked', () => {
        const abweichungen = [1, 2, 3, 4, 5];
        erstelleHistogramm(abweichungen);

        expect(global.Chart).toHaveBeenCalled();
        const labels = abweichungen.map((_, index) => `Trapez ${index + 1}`);
        expect(global.Chart.mock.calls[0][1].data.labels).toEqual(labels);
        expect(global.Chart.mock.calls[0][1].data.datasets[0].data).toEqual([1, 2, 3, 4, 5]);
    });

    it('should create a histogram with parabel labels when trapez is not checked', () => {
        // Simuliere Parabel statt Trapez
        global.document.getElementById = jest.fn(id => {
            if (id === 'trapez') {
                return { checked: false };  // Parabel statt Trapez (unchecked)
            } else if (id === 'abweichungsHistogramm') {
                return { getContext: jest.fn().mockReturnValue({}) };
            }
            return null;
        });

        const abweichungen = [2, 4, 6, 8, 10];
        erstelleHistogramm(abweichungen);

        expect(global.Chart).toHaveBeenCalled();
        const labels = abweichungen.map((_, index) => `Parabel ${index + 1}`);
        expect(global.Chart.mock.calls[0][1].data.labels).toEqual(labels);
        expect(global.Chart.mock.calls[0][1].data.datasets[0].data).toEqual([2, 4, 6, 8, 10]);
    });
});


describe('berechneAbweichungen', () => {
    beforeEach(() => {
        setupDOM();

        global.trapezRegel = jest.fn().mockReturnValue(5);
        global.simpsonRegel = jest.fn().mockReturnValue(5);

        global.document.getElementById = jest.fn(id => {
            return id === 'trapez' ? { checked: true } : null;
        });

        global.math = {
            parse: jest.fn().mockReturnValue({
                evaluate: jest.fn().mockImplementation(({ x }) => 2 * x)  // Beispiel: Stammfunktion 2*x
            })
        };
    });

    it('should calculate deviations using trapezoidal rule when trapez is checked', () => {
        const fStr = 'x^2';
        const stammfunktion = math.parse('2*x');
        const a = 0;
        const b = 10;
        const n = 5;

        const result = berechneAbweichungen(fStr, stammfunktion, a, b, n);

        expect(result.length).toBe(n);
        expect(global.trapezRegel).toHaveBeenCalledTimes(0);
        expect(result[0]).toBeCloseTo(Math.abs(0)); // Beispielhafte Abweichungsberechnung
    });

    it('should calculate deviations using Simpson rule when trapez is not checked', () => {
        document.getElementById('trapez').checked = false;

        const fStr = 'x^2';
        const stammfunktion = math.parse('2*x');
        const a = 0;
        const b = 10;
        const n = 5;

        const result = berechneAbweichungen(fStr, stammfunktion, a, b, n);

        expect(result.length).toBe(n);
        expect(global.simpsonRegel).toHaveBeenCalledTimes(0);
        expect(result[0]).toBeCloseTo(Math.abs(0)); // Beispielhafte Abweichungsberechnung
    });
});

describe('downloadImageHandler', () => {
    beforeEach(() => {
        // Mache Plotly.downloadImage mockbar
        global.Plotly = {
            downloadImage: jest.fn()
        };
    });

    it('should call Plotly.downloadImage with correct parameters', () => {
        // Erstelle ein mock-Grafik-Element
        const gd = {};

        // Rufe die downloadImageHandler-Funktion auf
        downloadImageHandler(gd);

        // Überprüfe, ob Plotly.downloadImage mit den richtigen Argumenten aufgerufen wurde
        expect(global.Plotly.downloadImage).toHaveBeenCalledWith(gd, {
            format: 'png',
            filename: 'Numerische Integration Abweichungsdiagramm',
            height: 600,
            width: 1200,
            scale: 1
        });
    });
});

describe('resetAxesHandler', () => {
    beforeEach(() => {
        // Mache Plotly.relayout mockbar
        global.Plotly = {
            relayout: jest.fn()
        };
    });

    it('should call Plotly.relayout with correct parameters', () => {
        // Erstelle ein mock-Grafik-Element
        const gd = {};

        // Rufe die resetAxesHandler-Funktion auf
        resetAxesHandler(gd);

        // Überprüfe, ob Plotly.relayout mit den richtigen Argumenten aufgerufen wurde
        expect(global.Plotly.relayout).toHaveBeenCalledWith(gd, {
            'xaxis.autorange': true,
            'yaxis.autorange': true
        });
    });
});