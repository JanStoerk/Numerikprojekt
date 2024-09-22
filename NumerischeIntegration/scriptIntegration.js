
function ggbOnInit() {
    var ggbApplet = document.ggbApplet;
    if (ggbApplet) {
        try {
            ggbApplet.setPerspective('G') // Setzt die Perspektive auf "Grafik"
        } catch (e) {
            console.error("Error executing command: ", e); // Fehlerbehandlung bei Problemen mit GeoGebra-Befehlen
        }
    } else {
        console.error("ggbApplet is not defined");  // Fehlerausgabe, falls das Applet nicht definiert ist
    }
}

// Wird aufgerufen, wenn das DOM vollständig geladen ist
document.addEventListener('DOMContentLoaded', function () {
    var params = {
        "appName": "classic", // Name der GeoGebra App
        "width": 600,        // Breite des Applets
        "height": 600,       // Höhe des Applets
        "enableRightClick": false,  // Deaktiviert Rechtsklick
        "showZoomButtons": true,    // Zeigt Zoom-Buttons an
        "showToolbar": false,       // Toolbar wird nicht angezeigt
        "showMenuBar": false,       // Menüleiste wird nicht angezeigt
        "showAlgebraInput": false,  // Algebra-Eingabe wird nicht angezeigt
        "useBrowserForJS": true,    // Browser wird für JavaScript verwendet
        "algebraView": false        // Algebra-Ansicht deaktiviert
    }
    var applet = new GGBApplet(params, true); // Erstellen des GeoGebra Applets
    applet.inject('ggb-element'); // Applet in das Element mit der ID 'ggb-element' einfügen
    let integralBtn = document.getElementById('integralButton');
    integralBtn.style.display = "none" // Versteckt den Button für das Integral


    let playPauseButton = document.getElementById('play-pause'); // Play/Pause-Button
    let stammfunktion = document.getElementById('myCheckbox');   // Checkbox für die Stammfunktion
    document.getElementById('funktion').addEventListener('input', checkInputs); // Input-Event für die Funktion
    document.getElementById('untereGrenze').addEventListener('input', checkInputs); // Input-Event für die untere Grenze
    document.getElementById('obereGrenze').addEventListener('input', checkInputs); // Input-Event für die obere Grenze
    playPauseButton.addEventListener('click', playPauseHandler); // Event-Listener für den Play/Pause-Button
    stammfunktion.addEventListener('change', stammfunktionChangeHandler); // Event-Listener für die Stammfunktion-Checkbox
});

let stopLoop = true; // Kontrollvariable für die Schleife

// Funktion zur Handhabung des Play/Pause-Buttons
function playPauseHandler() {
    let playIcon = document.getElementById('play-icon');
    let pauseIcon = document.getElementById('pause-icon');
    stopLoop = !stopLoop; // Umschalten der Schleifensteuerung
    const isPlaying = playIcon.style.display === 'none';
    if (isPlaying) {
        playIcon.style.display = 'block'; // Zeigt das Play-Icon an
        pauseIcon.style.display = 'none'; // Versteckt das Pause-Icon
    } else {
        playIcon.style.display = 'none'; // Versteckt das Play-Icon
        pauseIcon.style.display = 'block'; // Zeigt das Pause-Icon an
        var slider = document.getElementById('punktPosition'); // Zugriff auf den Slider
        var value = Number(slider.value); // Aktuellen Wert des Sliders abrufen

        (async function () {
            while (value < 100) {
                if (stopLoop) {
                    break;
                }
                value += 1;
                slider.value = value;
                var regel;
                if (document.getElementById("trapez").checked == true) {
                    regel = "Trapeze" // Regel: Trapeze
                } else {
                    regel = "Parabeln" // Regel: Parabeln
                }
                document.getElementById('sliderValue').innerText = "Anzahl " + regel + ": " + slider.value;
                zeichneFunktion(); // Zeichnet die Funktion neu
                if (diagramm.data) {
                    const punktX = [parseInt(slider.value)]; // X-Wert für den Punkt
                    const punktY = [fehlerWerte[punktX - 1]]; // Y-Wert aus den Fehlerwerten

                    Plotly.restyle(diagramm, { x: [punktX], y: [punktY] }, 1); // Aktualisiert das Diagramm
                }
                await new Promise(resolve => setTimeout(resolve, 1000)); // Pause von 1 Sekunde zwischen den Schritten
            }
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        })();
    }
}

// Funktion zur Handhabung der Stammfunktion-Checkbox
function stammfunktionChangeHandler() {
    let stammfunktion = document.getElementById('myCheckbox');
    let stammFunktionInput = document.getElementById('stammfunktionContainer'); // Zugriff auf das Stammfunktion-Eingabefeld
    let integralBtn = document.getElementById('integralButton');
    $('#stammfunktion').popover({ // Initialisiert ein Popover für die Checkbox
        trigger: 'manual', container: 'body'
    });
    if (stammfunktion.checked) {
        integralBtn.disabled = true; // Deaktiviert den Integral-Button
        stammFunktionInput.style.display = "inline";
        $('#stammfunktion').popover('show');
        $('#stammfunktion, #funktion').on('input', validateInputs); // Fügt Event-Listener zum Validieren der Eingaben hinzu
    } else {
        stammFunktionInput.style.display = "none"; // Versteckt das Stammfunktion-Eingabefeld
        $('#stammfunktion').popover('hide');
        integralBtn.disabled = false;
        document.getElementById('stammfunktion').value = null;  // Setzt den Wert der Stammfunktion-Checkbox zurück
    }
}

// Funktion zur Validierung der Benutzereingaben
function validateInputs() {
    let integralBtn = document.getElementById('integralButton');
    var stammfunktionStr = $('#stammfunktion').val().replace(',', '.');
    var funktion = $('#funktion').val().trim().replace(/\s+/g, '').replace(',', '.');

    const ableitung = math.derivative(stammfunktionStr, 'x').toString().replace(/\s+/g, '');
    // Prüft, ob die abgeleitete Stammfunktion der eingegebenen Funktion entspricht
    if (areFunctionsEquivalent(funktion, ableitung)) {
        $('#stammfunktion').popover('hide');
        integralBtn.disabled = false;
    } else {
        $('#stammfunktion').popover('show');
        integralBtn.disabled = true;
    }
}

// Verändert den Sliderwert schrittweise und aktualisiert die Darstellung
function stepwiseChange(step) {
    stopLoop = true;
    var slider = document.getElementById('punktPosition');
    var value = Number(slider.value) + step;
    slider.value = value;
    var regel;
    if (document.getElementById("trapez").checked == true) {
        regel = "Trapeze"
    } else {
        regel = "Parabeln"
    }
    document.getElementById('sliderValue').innerText = "Anzahl " + regel + ": " + slider.value;
    zeichneFunktion();

    // Aktualisiert den Fehlerwert im Diagramm
    if (diagramm.data) {
        const punktX = [parseInt(slider.value)];
        const punktY = [fehlerWerte[punktX - 1]];
        Plotly.restyle(diagramm, { x: [punktX], y: [punktY] }, 1);
    }
}

// Berechnet das Integral mit der Trapezregel
function trapezRegel(fStr, a, b, n) {
    f = math.parse(fStr);
    const h = (b - a) / n;
    const x = [];
    for (let i = 0; i <= n; i++) {
        x.push(a + i * h);
    }
    const y = x.map(xVal => f.evaluate({ x: xVal }));
    let T = 0.5 * y[0] + 0.5 * y[n];
    for (let i = 1; i < n; i++) {
        T += y[i];
    }
    T *= h;
    return T;
}

// Berechnet das Integral mit der Simpson-Regel
function simpsonRegel(fStr, a, b, n) {
    let f = math.compile(fStr);
    let h = (b - a) / n;
    let S = 0;

    // Berechnet Simpson-Formel für jedes Intervall
    for (let i = 0; i < n; i++) {
        let x0 = a + i * h;
        let x1 = x0 + h;
        let xm = (x0 + x1) / 2;
        let f0 = f.evaluate({ x: x0 });
        let f1 = f.evaluate({ x: x1 });
        let fm = f.evaluate({ x: xm });

        S += (h / 6) * (f0 + 4 * fm + f1);
    }

    return S;
}

// Berechnet das Integral und stellt die Ergebnisse dar
function berechneIntegral() {
    if (window.myChart) {
        window.myChart.destroy(); // Zerstört das vorherige Diagramm
    }
    // Holt und formatiert die Benutzereingaben
    var stammfunktionStr = document.getElementById('stammfunktion').value;
    stammfunktionStr = stammfunktionStr.replace(',', '.');
    const untereGrenze = parseFloat(document.getElementById('untereGrenze').value);
    const obereGrenze = parseFloat(document.getElementById('obereGrenze').value);
    const stammfunktion = math.parse(stammfunktionStr);
    var funktion = document.getElementById('funktion').value.trim().replace(/\s+/g, '');
    funktion = funktion.replace(',', '.')
    var anzahlTrapeze = document.getElementById('punktPosition').value;
    var integral = null;
    var selectElement = document.getElementById('nachkomastellen');

    var selectedOption = selectElement.options[selectElement.selectedIndex];
    var decimalPlaces = parseInt(selectedOption.value);

    // Überprüft, ob die abgeleitete Stammfunktion korrekt ist
    const ableitung = math.derivative(stammfunktion, 'x').toString().replace(/\s+/g, '');
    if (!areFunctionsEquivalent(funktion, ableitung)) {
        console.error("Die Ableitung stimmt nicht mit der Stammfunktion überein")
    }
    else {
        // Berechnet das Integral mit der Stammfunktion
        const F_a = stammfunktion.evaluate({ x: untereGrenze });
        const F_b = stammfunktion.evaluate({ x: obereGrenze });
        integral = F_b - F_a; // Berechnet das Integral
        integral.toFixed(decimalPlaces) // Rundet das Ergebnis auf die festgelegten Dezimalstellen

    }
    // Wählt zwischen Trapez- oder Simpsonregel
    var regel = "Trapezregel" // Standardmäßig aber Trapezregel verwenden
    // Stellt das Ergebnis und die Abweichung dar
    const resultContainer = document.getElementById('resultContainer');
    if (document.getElementById("trapez").checked == true) {
        // Berechnet das Ergebnis mit der Trapezregel
        var result = trapezRegel(funktion, untereGrenze, obereGrenze, anzahlTrapeze)
        regel = "Trapezregel"
    } else {
        // Berechnet das Ergebnis mit der Simpsonregel
        var result = simpsonRegel(funktion, untereGrenze, obereGrenze, anzahlTrapeze)
        regel = "Simpsonregel"
    }

    // Zeigt das Ergebnis oder die Abweichung an
    if (integral == null) {
        resultContainer.innerHTML = `<br>
                    <table class="table table-hover" style="width: 100%; text-align: center;">
  <tr>
    <td>Ergebnis mit ${regel}</td>
    <td><span style="color: green;">${result.toFixed(decimalPlaces)} FE</span></td>
  </tr>
</table>`
        // Berechnet die Abweichung zwischen numerischer Methode und Stammfunktion
    } else {
        const abweichung = Math.abs(integral - result);
        resultContainer.innerHTML = `<br>
                    <table class="table table-hover" style="width: 100%; text-align: center;">
  <tr>
    <td>Ergebnis (mit Stammfunktion)</td>
    <td><span style="color: green;">${integral.toFixed(decimalPlaces)} FE</span></td>
  </tr>
  <tr>
    <td>Ergebnis mit ${regel}</td>
    <td><span style="color: green;">${result.toFixed(decimalPlaces)} FE</span></td>
  </tr>
  <tr>
    <td>Abweichung</td>
    <td><span style="color: red;">${abweichung.toFixed(decimalPlaces)} FE</span></td>
  </tr>
</table>
`
        // Berechnet Abweichungen für das Diagramm
        var abweichungen = berechneAbweichungen(funktion, stammfunktion, untereGrenze, obereGrenze, anzahlTrapeze);

        // Erstellt ein Histogramm basierend auf den Abweichungen
        erstelleHistogramm(abweichungen);

        // Berechnet die Fehlerwerte für die Trapezregel
        fehlerWerte = berechneFehlerFürTrapeze(funktion, stammfunktionStr, untereGrenze, obereGrenze, 100);
        var regel = "";
        if (document.getElementById("trapez").checked == true) {
            regel = "Trapeze"
        } else {
            regel = "Parabeln"
        }
        // Erstellt die Datenreihe für das Fehlerdiagramm
        const trace = {
            x: Array.from({ length: 100 }, (_, i) => i + 1),
            y: fehlerWerte,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Fehler'
        };

        // Layout des Diagramms
        const layout = {
            title: "Abweichungsdiagramm",
            xaxis: {
                title: 'Anzahl ' + regel
            },
            yaxis: {
                title: 'Fehler in Flächeneinheiten'
            },
            dragmode: 'pan'
        };

        // Markiert den aktuellen Fehlerwert im Diagramm
        const punktTrace = {
            x: [anzahlTrapeze],
            y: [fehlerWerte[anzahlTrapeze - 1]],
            mode: 'markers',
            marker: { color: 'green', size: 10 },
            name: 'Aktueller Fehler'
        };

        // Konfiguration der Diagramm-Toolbar
        const config = {
            displaylogo: false,
            modeBarButtonsToRemove: [
                'zoom2d',
                'pan2d',
                'select2d',
                'lasso2d',
                'zoomIn2d',
                'zoomOut2d',
                'autoScale2d',
                'hoverClosestCartesian',
                'hoverCompareCartesian',
                'toggleSpikelines',
                'resetScale2d',
                'toImage'
            ],
            modeBarButtonsToAdd: [{
                name: 'Bild als PNG herunterladen',
                icon: Plotly.Icons.camera,
                click: downloadImageHandler
            },
            {
                name: 'Achsen zurücksetzen',
                icon: Plotly.Icons.home,
                click: resetAxesHandler
            }]
        };

        // Konfiguration der Diagramm-Toolbar
        Plotly.newPlot('diagramm', [trace, punktTrace], layout, config);

        // Zeigt das Diagramm an
        document.getElementById('diagramm').style.display = "inline";
    }
}

// Funktion zum Herunterladen des Diagramms als PNG
function downloadImageHandler(gd) {
    Plotly.downloadImage(gd, {
        format: 'png',
        filename: 'Numerische Integration Abweichungsdiagramm',
        height: 600,
        width: 1200,
        scale: 1
    });
}

// Funktion zum Zurücksetzen der Achsen
function resetAxesHandler(gd) {
    Plotly.relayout(gd, {
        'xaxis.autorange': true,
        'yaxis.autorange': true
    });
}


function areFunctionsEquivalent(func1, func2) {
    console.log(func1)
    console.log(func2)
    try { // Parsen und Vereinfachen der beiden Funktionen
        const parsedFunc1 = math.parse(func1);
        const parsedFunc2 = math.parse(func2);

        //Sicherstellen dass 3*x und 3x identisch sind
        parsedFunc1.implicit = false;
        parsedFunc2.implicit = false;

        // Vereinfachte Funktionen in Strings umwandeln
        var simplifiedFunc1 = parsedFunc1.toString();
        var simplifiedFunc2 = parsedFunc2.toString();

        // Rückgabe, ob die Funktionen äquivalent sind
        return simplifiedFunc1 === simplifiedFunc2;
    } catch (e) {
        console.error('Fehler beim Vereinfachen oder Vergleichen der Funktionen:', e);
        return false;
    }
}


function erstelleHistogramm(abweichungen) { //Beispiel: e^x von 0 bis 4 und 5 Trapeze aufwärts
    // Erstellt Labels basierend auf der gewählten Regel (Trapez oder Parabel)
    var labels = [];
    if (document.getElementById("trapez").checked == true) {
        labels = abweichungen.map((_, index) => `Trapez ${index + 1}`);
    } else {
        labels = abweichungen.map((_, index) => `Parabel ${index + 1}`);
    }

    // Bereitet die Daten für das Histogramm vor
    const data = abweichungen.map(abw => Math.abs(abw));

    // Erstellt das Histogramm mit Chart.js
    const ctx = document.getElementById('abweichungsHistogramm').getContext('2d');
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Abweichung`,
                data: data,
                backgroundColor: 'rgba(0,117,255,255)',
                borderColor: 'rgba(0,117,255,255)',
                borderWidth: 1
            }]
        }
    });
}

function berechneAbweichungen(fStr, stammfunktion, a, b, n) {
    const naeherungsWerte = [];
    const abweichungen = [];

    // Schleife zur Berechnung der Abweichungen für n Intervalle
    for (let i = 0; i < n; i++) {
        const x0 = a + i * (b - a) / n;
        const x1 = a + (i + 1) * (b - a) / n;

        // Berechnung der exakten Fläche
        const F0 = stammfunktion.evaluate({ x: x0 });
        const F1 = stammfunktion.evaluate({ x: x1 });
        const exaktTeil = F1 - F0;

        // Berechnung der Näherung mittels Trapez- oder Simpsonregel
        var naeherung = 0;
        if (document.getElementById("trapez").checked == true) {
            naeherung = trapezRegel(fStr, x0, x1, 1);
        } else {
            naeherung = simpsonRegel(fStr, x0, x1, 1);
        }

        // Speichern der Näherung und der Abweichung
        naeherungsWerte.push(naeherung);
        abweichungen.push(Math.abs(exaktTeil - naeherung));
    }
    return abweichungen;
}


function checkInputs() {
    // Holt die Eingabewerte aus dem Formular
    const funktion = document.getElementById('funktion').value;
    const untereGrenze = document.getElementById('untereGrenze').value;
    const obereGrenze = document.getElementById('obereGrenze').value;
    const forward = document.getElementById('skip-forward');
    const backward = document.getElementById('skip-back');
    const play = document.getElementById('play-pause');
    const zeichneFunktionButton = document.getElementById('btnZeichne');

    // Überprüft, ob alle erforderlichen Eingaben vorhanden und korrekt sind
    if (funktion && untereGrenze && obereGrenze && untereGrenze < obereGrenze) {
        zeichneFunktionButton.disabled = false;
        play.disabled = false;
        forward.disabled = false;
        backward.disabled = false;
        return true;
    } else {
        zeichneFunktionButton.disabled = true;
        play.disabled = true;
        forward.disabled = true;
        backward.disabled = true;
        return false;
    }
}

function berechneFehlerFürTrapeze(fStr, stammfunktionStr, a, b, maxTrapeze) {
    const stammfunktion = math.parse(stammfunktionStr);
    const fehlerArray = [];

    // Schleife zur Berechnung des Fehlers für eine wachsende Anzahl von Trapezen
    for (let n = 1; n <= maxTrapeze; n++) {
        var näherungFläche = 0;
        if (document.getElementById("trapez").checked == true) {
            näherungFläche = trapezRegel(fStr, a, b, n);
        } else {
            näherungFläche = simpsonRegel(fStr, a, b, n);
        }

        // Berechnung der exakten Fläche und des Fehlers
        const exakteFläche = stammfunktion.evaluate({ x: b }) - stammfunktion.evaluate({ x: a });
        const fehler = Math.abs(exakteFläche - näherungFläche);
        fehlerArray.push(fehler);
    }

    return fehlerArray;
}

// Bewegt den Punkt im Diagramm und aktualisiert die Anzeige entsprechend der Anzahl der Trapeze oder Parabeln
function bewegePunkt(value) {
    stopLoop = true;

    // Aktualisiert die Anzeige des Schiebereglers basierend auf der ausgewählten Methode
    if (document.getElementById("trapez").checked == true) {
        document.getElementById('sliderValue').innerText = `Anzahl Trapeze: ${value}`;

    } else {
        document.getElementById('sliderValue').innerText = `Anzahl Parabeln: ${value}`;
    }

    // Aktualisiert die Position des Punktes im Diagramm
    const diagramm = document.getElementById('diagramm');
    if (diagramm.data) {
        const punktX = [parseInt(value)];
        const punktY = [fehlerWerte[punktX - 1]];

        Plotly.restyle(diagramm, { x: [punktX], y: [punktY] }, 1);
    } else {
        return;
    }
}

// Aktualisiert den Header und die Sichtbarkeit der UI-Elemente basierend auf der Auswahl der Integrationsmethode
function updateHeader(radio) {
    if (window.myChart) {
        window.myChart.destroy();
    }
    document.getElementById('diagramm').innerHTML = "";
    if (radio.checked) {
        document.getElementById('integration-method').innerHTML = `<b>Numerische Integration: ${radio.value}</b>`;
        ggbApplet.reset()
        if (checkInputs()) {
            zeichneFunktion()
        } else {
            var integralBtn = document.getElementById('integralButton');
            integralBtn.style.display = "none"
            document.getElementById('nachkomastellenContainer').style.display = "none";
            document.getElementById('btnZeichne').disabled = true;
            var checkbox = document.getElementById('myCheckbox')
            checkbox.checked = false;
            checkbox.style.display = "none"
            document.getElementById('checkboxLabel').style.display = "none"
            document.getElementById('stammfunktionContainer').style.display = "none";
        }
        document.getElementById('resultContainer').innerHTML = "";
        document.getElementById('abweichungsHistogramm').innerHTML = "";
        if (radio.value == "Simpsonregel") {
            document.getElementById('sliderValue').innerText = "Anzahl Parabeln: " + document.getElementById('punktPosition').value;
            document.getElementById('exampleModalLabel').innerHTML = "Numerische Integration: Simpsonregel";
            document.getElementById('TrapezDoku').style.display = "none";
            document.getElementById('SimpsonDoku').style.display = "block";
            document.getElementById('inhaltsverzeichnisTrapez').style.display = "none";
            document.getElementById('inhaltsverzeichnisSimpson').style.display = "block";

        } else {
            document.getElementById('sliderValue').innerText = "Anzahl Trapeze: " + document.getElementById('punktPosition').value;
            document.getElementById('exampleModalLabel').innerHTML = "Numerische Integration: Trapezregel";
            document.getElementById('TrapezDoku').style.display = "block";
            document.getElementById('SimpsonDoku').style.display = "none";
            document.getElementById('inhaltsverzeichnisTrapez').style.display = "block";
            document.getElementById('inhaltsverzeichnisSimpson').style.display = "none";
        }

    }
}

// Zeichnet die Funktion basierend auf der gewählten Integrationsmethode (Trapezregel oder Simpsonregel)
function zeichneFunktion() {
    // Lade-Animation einblenden (siehe Performance Testergebnisse)
    document.getElementById('loader').style.display = 'block'; // Loader anzeigen

    // Asynchrone Berechnungen ausführen, um den UI-Thread nicht zu blockieren
    setTimeout(() => {
        if (trapez.checked) {
            zeichneFunktionTrapez();
        } else {
            zeichneFunktionSimpson();
        }
        document.getElementById('loader').style.display = 'none';
    }, 50); // setTimeout, um sicherzustellen, dass der Loader angezeigt wird, bevor die Berechnungen starten
}
function zeichneFunktionTrapez() {
    ggbApplet.reset()

    // Holt die Eingabewerte für die Funktion und die Grenzen
    var funktion = document.getElementById('funktion').value.trim();
    var untereGrenze = document.getElementById('untereGrenze').value.trim();
    untereGrenze = Number(untereGrenze);
    var obereGrenze = document.getElementById('obereGrenze').value.trim();
    obereGrenze = Number(obereGrenze);
    var anzahlTrapeze = document.getElementById('punktPosition').value;
    try {
        // Zeichnet die Funktion in GeoGebra
        var fxLabel = ggbApplet.evalCommandGetLabels('f(x)=' + funktion);
        if (fxLabel == null) {
            document.getElementById('myCheckbox').style.display = "none"
            document.getElementById('checkboxLabel').style.display = "none"
            return;
        }
        // Setzt die Farben und zeichnet die Linien für die Trapeze
        ggbApplet.setColor(fxLabel, 62, 137, 62)
        var functionLabel = ggbApplet.evalCommandGetLabels('g(x) = 0');
        ggbApplet.setVisible(functionLabel, false);
        breite = (obereGrenze - untereGrenze) / anzahlTrapeze;
        for (var i = 0; i < anzahlTrapeze; i++) {
            var a = untereGrenze + (i * breite);

            var b = untereGrenze + (i + 1) * breite;

            var fa = ggbApplet.getValue("f(" + a + ")");
            var fb = ggbApplet.getValue("f(" + b + ")");

            //var polygonLabel = ggbApplet.evalCommandGetLabels('Polygon((' + x1 + ',g(' + x1 + ')), (' + x2 + ', g(' + x2 + ')), (' + x2 + ',f(' + x2 + ')), (' + x1 + ', f(' + x1 + ')))');

            // Zeichnet die Linien für jedes Trapez
            line1 = ggbApplet.evalCommandGetLabels(`Segment((${a}, ${fa}), (${a}, 0))`);
            line2 = ggbApplet.evalCommandGetLabels(`Segment((${b}, ${fb}), (${b}, 0))`);
            line3 = ggbApplet.evalCommandGetLabels(`Segment((${a}, 0),(${b}, 0))`);
            line4 = ggbApplet.evalCommandGetLabels(`Segment((${a}, ${fa}),(${b}, ${fb}))`);

            ggbApplet.setColor(line1, 167, 93, 56)
            ggbApplet.setColor(line2, 167, 93, 56)
            ggbApplet.setColor(line3, 167, 93, 56)
            ggbApplet.setColor(line4, 167, 93, 56)
            ggbApplet.setFixed(line1, true, true);
            ggbApplet.setFixed(line2, true, true);
            ggbApplet.setFixed(line3, true, true);
            ggbApplet.setFixed(line4, true, true);
            //ggbApplet.setFixed(polygonLabel, true, false);
        }
    } catch (error) {
        console.error('Fehler beim Auswerten der Funktion:', error);
    }

    // Zeigt zusätzliche UI-Elemente an
    document.getElementById('myCheckbox').style.display = "inline"
    document.getElementById('checkboxLabel').style.display = "inline"
    var integralBtn = document.getElementById('integralButton');
    integralBtn.style.display = "inline"
    document.getElementById('nachkomastellenContainer').style.display = "inline";
}

// Zeichnet die Funktion und die Parabeln für die Simpsonregel in Geogebra
function zeichneFunktionSimpson() {
    ggbApplet.reset()
    // Werte aus den Eingabefeldern holen
    var funktion = document.getElementById('funktion').value.trim();
    var untereGrenze = document.getElementById('untereGrenze').value.trim();
    untereGrenze = Number(untereGrenze);
    var obereGrenze = document.getElementById('obereGrenze').value.trim();
    obereGrenze = Number(obereGrenze);
    var anzahlTrapeze = document.getElementById('punktPosition').value;

    try {
        // Funktion in Geogebra erstellen
        var fxLabel = ggbApplet.evalCommandGetLabels('f(x)=' + funktion);
        if (fxLabel == null) {
            // Falls die Funktion nicht gültig ist, UI-Elemente ausblenden
            document.getElementById('myCheckbox').style.display = "none"
            document.getElementById('checkboxLabel').style.display = "none"
            return;
        }
        ggbApplet.setColor(fxLabel, 62, 137, 62)
        var functionLabel = ggbApplet.evalCommandGetLabels('g(x) = 0');
        ggbApplet.setVisible(functionLabel, false);

        // Berechne die Breite der Intervalle für die Simpsonregel
        breite = (obereGrenze - untereGrenze) / anzahlTrapeze;
        for (var i = 0; i < anzahlTrapeze; i++) {
            var a = untereGrenze + (i * breite);

            var b = untereGrenze + (i + 1) * breite;
            var m = (a + b) / 2;

            // Berechne die Funktionswerte an den Intervallgrenzen und der Mitte
            var fa = ggbApplet.getValue("f(" + a + ")")
            var fm = ggbApplet.getValue("f(" + m + ")")
            var fb = ggbApplet.getValue("f(" + b + ")")



            // Berechne die Koeffizienten A, B, C der Parabel y = Ax^2 + Bx + C
            var Matrix = [
                [a * a, a, 1],
                [m * m, m, 1],
                [b * b, b, 1]
            ];

            var Vector = [fa, fm, fb];

            // Lösung des linearen Gleichungssystems
            var invMatrix = math.inv(Matrix);
            var result = math.multiply(invMatrix, Vector);
            var A = result[0];
            var B = result[1];
            var C = result[2];
            
            //Stellt sicher dass A, B Und C bei zu kleinen Werten auf 0 gesetzt werden, da sie vernachlässigbar werden und die Berechnung der Simpsonregel beeinträchtigen
            if (Math.abs(A) <= 1e-9) {
                A = 0;
            }

            if (Math.abs(B) <= 1e-9) {
                B = 0;
            }

            if (Math.abs(C) <= 1e-9) {
                C = 0;
            }

            // Definiere die Parabel und erstelle die Kurve
            const curveCommand = `Curve(t, ${A} * t^2 + ${B} * t + ${C}, t, ${a}, ${b})`;
            const parabel = ggbApplet.evalCommandGetLabels(curveCommand);

            // Zeichne die Intervalle und setze die Farben
            line1 = ggbApplet.evalCommandGetLabels(`Segment((${a}, ${fa}), (${a}, 0))`);
            line2 = ggbApplet.evalCommandGetLabels(`Segment((${b}, ${fb}), (${b}, 0))`);
            line3 = ggbApplet.evalCommandGetLabels(`Segment((${a}, 0),(${b}, 0))`);

            ggbApplet.setColor(parabel, 167, 93, 56)
            ggbApplet.setColor(line1, 167, 93, 56)
            ggbApplet.setColor(line2, 167, 93, 56)
            ggbApplet.setColor(line3, 167, 93, 56)
            ggbApplet.setFixed(parabel, true, true);
            ggbApplet.setFixed(line1, true, true);
            ggbApplet.setFixed(line2, true, true);
            ggbApplet.setFixed(line3, true, true);
            //ggbApplet.evalCommandGetLabels('Polygon((' + a + ',g(' + a + ')), (' + a + ', f(' + a + ')), (' + b + ', f(' + b + ')), (' + b + ',g(' + b + ')))');

            //var polygonLabel = ggbApplet.evalCommandGetLabels('Polygon((' + x1 + ',g(' + x1 + ')), (' + x2 + ', g(' + x2 + ')), (' + x2 + ',f(' + x2 + ')), (' + m + ',f(' + m + ')), (' + x1 + ', f(' + x1 + ')))');
            //ggbApplet.setFixed(polygonLabel, true, false);
        }
    } catch (error) {
        console.error('Fehler beim Auswerten der Funktion:', error);
    }
    // Blende UI-Elemente nach erfolgreichem Zeichnen wieder ein
    document.getElementById('myCheckbox').style.display = "inline"
    document.getElementById('checkboxLabel').style.display = "inline"
    var integralBtn = document.getElementById('integralButton');
    integralBtn.style.display = "inline"
}

// Exportiere Funktionen für Unit-Tests oder andere Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ggbOnInit,
        zeichneFunktion,
        zeichneFunktionTrapez,
        zeichneFunktionSimpson,
        updateHeader,
        bewegePunkt,
        checkInputs,
        berechneFehlerFürTrapeze,
        erstelleHistogramm,
        berechneAbweichungen,
        berechneIntegral,
        areFunctionsEquivalent,
        trapezRegel,
        simpsonRegel,
        stepwiseChange,
        playPauseHandler,
        stammfunktionChangeHandler,
        validateInputs,
        downloadImageHandler,
        resetAxesHandler
    }
}