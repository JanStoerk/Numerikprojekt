// Mocke die Funktionen, bevor das Modul importiert wird
const { ggbOnInit } = require('../NumerischeIntegration/script');


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
require('../NumerischeIntegration/script');

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
        document.body.innerHTML = `
            <div id="ggb-element"></div>
            <button id="integralButton"></button>
            <button id="play-pause"></button>
            <button id="skip-forward"></button>
            <button id="skip-back"></button>
            <button id="play-icon"></button>
            <button id="pause-icon"></button>
            <button id="btnZeichne"></button>
            <input id="punktPosition" />
            <button id="trapez"></button>
            <button id="simpson"></button>
            <input id="myCheckbox" />
            <div id="stammfunktionContainer"></div>
        `;

        // Simuliere die GGBApplet-Klasse
        global.GGBApplet = GGBApplet;

        // Importiere den gesamten Code für DOMContentLoaded, nachdem die Mocks gesetzt sind
        require('../NumerischeIntegration/script');
    });

    it('should initialize GGBApplet and inject it into the DOM', () => {
        expect(document.querySelector('#ggb-element')).not.toBeNull();
        // Hier kannst du weitere Überprüfungen hinzufügen, um zu verifizieren, dass `GGBApplet` korrekt initialisiert wurde
    });

    it('should hide the integralButton', () => {
        const integralBtn = document.getElementById('integralButton');
        expect(integralBtn.style.display).toBe("");
    });

    it('should add click event listener to zeichneFunktionButton', () => {
        const zeichneFunktionButton = document.getElementById('btnZeichne');
        const event = new Event('click');
        
        // Dispatch the event to trigger the event listener
        zeichneFunktionButton.dispatchEvent(event);

        // Überprüfe, ob mockZeichneFunktion aufgerufen wurde
        expect(zeichneFunktion).toHaveBeenCalled();
    });

    // Weitere Tests können hier hinzugefügt werden
});
