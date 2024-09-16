
//Gutes Beispiel: x^2 + log(x) + sin(x^4)
function ggbOnInit() {
    console.log("GeoGebra Applet initialized");
    var ggbApplet = document.ggbApplet;
    if (ggbApplet) {
        try {
            ggbApplet.setPerspective('G')
        } catch (e) {
            console.error("Error executing command: ", e);
        }
    } else {
        console.error("ggbApplet is not defined");
    }
}
document.addEventListener('DOMContentLoaded', function () {
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
    integralBtn.style.display = "none"

let playPauseButton = document.getElementById('play-pause');
let stammfunktion = document.getElementById('myCheckbox');
document.getElementById('funktion').addEventListener('input', checkInputs);
document.getElementById('untereGrenze').addEventListener('input', checkInputs);
document.getElementById('obereGrenze').addEventListener('input', checkInputs);
playPauseButton.addEventListener('click', playPauseHandler);
stammfunktion.addEventListener('change', stammfunktionChangeHandler);



});
let stopLoop = true;

function playPauseHandler() {
    let playIcon = document.getElementById('play-icon');
    let pauseIcon = document.getElementById('pause-icon');
    stopLoop = !stopLoop;
    const isPlaying = playIcon.style.display === 'none';
    if (isPlaying) {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    } else {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        var slider = document.getElementById('punktPosition');
        var value = Number(slider.value);

        (async function() {
            while (value < 50) {
                if (stopLoop) {
                    console.log('Schleife abgebrochen');
                    break;
                }
                value += 1;
                slider.value = value;
                document.getElementById('sliderValue').innerText = "Anzahl Trapeze: " + slider.value;
                zeichneFunktion();
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log(slider.value)
            }
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        })();
    }
}

 function stammfunktionChangeHandler() {
    let stammfunktion = document.getElementById('myCheckbox');
    let stammFunktionInput = document.getElementById('stammfunktionContainer'); 
    let integralBtn = document.getElementById('integralButton');
    $('#stammfunktion').popover({
        trigger: 'manual', container: 'body'
    });
    if (stammfunktion.checked) {
        integralBtn.disabled = true;
        stammFunktionInput.style.display = "inline";
        $('#stammfunktion').popover('show');        
        $('#stammfunktion, #funktion').on('input', validateInputs);
    } else {
        stammFunktionInput.style.display = "none";
        $('#stammfunktion').popover('hide');
        integralBtn.disabled = false;
        document.getElementById('stammfunktion').value = null;
    }
}

function validateInputs() {
    let integralBtn = document.getElementById('integralButton');
    var stammfunktionStr = $('#stammfunktion').val().replace(',', '.');
    var funktion = $('#funktion').val().trim().replace(/\s+/g, '').replace(',', '.');
    
    const ableitung = math.derivative(stammfunktionStr, 'x').toString().replace(/\s+/g, '');
    
    if (areFunctionsEquivalent(funktion, ableitung)) {
        $('#stammfunktion').popover('hide');
        integralBtn.disabled = false;
    } else {
        $('#stammfunktion').popover('show');
        integralBtn.disabled = true;
    }
}

function stepwiseChange(step) {
    stopLoop = true;
    var slider = document.getElementById('punktPosition');
    var value = Number(slider.value)+ step;
    slider.value = value;
    document.getElementById('sliderValue').innerText = "Anzahl Trapeze: " + slider.value;
    zeichneFunktion();
}

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

function simpsonRegel(fStr, a, b, n) {

    let f = math.compile(fStr);

    let h = (b - a) / n;

    let S = 0;

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


function berechneIntegral() {
    if (window.myChart) {
        window.myChart.destroy();
    }
    var stammfunktionStr = document.getElementById('stammfunktion').value;
    stammfunktionStr = stammfunktionStr.replace(',', '.');
    const untereGrenze = parseFloat(document.getElementById('untereGrenze').value);
    const obereGrenze = parseFloat(document.getElementById('obereGrenze').value);
    const stammfunktion = math.parse(stammfunktionStr);
    var funktion = document.getElementById('funktion').value.trim().replace(/\s+/g, '');
    funktion = funktion.replace(',','.')
    var anzahlTrapeze = document.getElementById('punktPosition').value;
    var integral = null;
    var selectElement = document.getElementById('nachkomastellen');

    var selectedOption = selectElement.options[selectElement.selectedIndex];
    var decimalPlaces = parseInt(selectedOption.value);

    const ableitung = math.derivative(stammfunktion, 'x').toString().replace(/\s+/g, '');
    if (!areFunctionsEquivalent(funktion, ableitung)) {
        console.error("Die Ableitung stimmt nicht mit der Stammfunktion überein")
    }
    else {
        const F_a = stammfunktion.evaluate({ x: untereGrenze });
        const F_b = stammfunktion.evaluate({ x: obereGrenze });
        integral = F_b - F_a;
        integral.toFixed(decimalPlaces)

    }
    var regel = "Trapezregel"
    const resultContainer = document.getElementById('resultContainer');
    if (document.getElementById("trapez").checked == true) {
        var result = trapezRegel(funktion, untereGrenze, obereGrenze, anzahlTrapeze)
        regel = "Trapezregel"
    } else {
        console.log("Anzahl: " + anzahlTrapeze)
        var result = simpsonRegel(funktion, untereGrenze, obereGrenze, anzahlTrapeze)
        regel = "Simpsonregel"
    }

    if (integral == null) {
        resultContainer.innerHTML = `<br>
                    <table class="table table-hover" style="width: 100%; text-align: center;">
  <tr>
    <td>Ergebnis mit ${regel}</td>
    <td><span style="color: green;">${result.toFixed(decimalPlaces)} FE</span></td>
  </tr>
</table>`
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

        var abweichungen = berechneAbweichungen(funktion, stammfunktion, untereGrenze, obereGrenze, anzahlTrapeze);

        erstelleHistogramm(abweichungen);
        fehlerWerte = berechneFehlerFürTrapeze(funktion, stammfunktionStr, untereGrenze, obereGrenze, 50);
        var regel = "";
        if (document.getElementById("trapez").checked == true) {
            regel = "Trapeze"
        } else {
            regel = "Parabeln"
        }
        const trace = {
            x: Array.from({ length: 50 }, (_, i) => i + 1),
            y: fehlerWerte,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Fehler'
        };

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

        const punktTrace = {
            x: [anzahlTrapeze],
            y: [fehlerWerte[anzahlTrapeze - 1]],
            mode: 'markers',
            marker: { color: 'green', size: 10 },
            name: 'Aktueller Fehler'
        };

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

        Plotly.newPlot('diagramm', [trace, punktTrace], layout, config);

        document.getElementById('diagramm').style.display = "inline";
    }

    
}
function downloadImageHandler(gd) {
    Plotly.downloadImage(gd, {
        format: 'png',
        filename: 'Numerische Integration Abweichungsdiagramm',
        height: 600,
        width: 1200,
        scale: 1
    });
}

function resetAxesHandler(gd) {
    Plotly.relayout(gd, {
        'xaxis.autorange': true,
        'yaxis.autorange': true
    });
}


function areFunctionsEquivalent(func1, func2) {
    try {
      const parsedFunc1 = math.parse(func1);
      const parsedFunc2 = math.parse(func2);
  
      const simplifiedFunc1 = math.simplify(parsedFunc1).toString();
      const simplifiedFunc2 = math.simplify(parsedFunc2).toString();
      console.log(simplifiedFunc1)
      console.log(simplifiedFunc2)
  
      return simplifiedFunc1 === simplifiedFunc2;
    } catch (e) {
      console.error('Fehler beim Vereinfachen oder Vergleichen der Funktionen:', e);
      return false;
    }
  }


function erstelleHistogramm(abweichungen) { //Beispiel: e^x von 0 bis 4 und 5 Trapeze aufwärts
    var labels = [];
    if (document.getElementById("trapez").checked == true) {
        labels = abweichungen.map((_, index) => `Trapez ${index + 1}`);
    } else {
        labels = abweichungen.map((_, index) => `Parabel ${index + 1}`);
    }

    const data = abweichungen.map(abw => Math.abs(abw));

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
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

function berechneAbweichungen(fStr, stammfunktion, a, b, n) {
    const naeherungsWerte = [];
    const abweichungen = [];

    for (let i = 0; i < n; i++) {
        const x0 = a + i * (b - a) / n;
        const x1 = a + (i + 1) * (b - a) / n;

        const F0 = stammfunktion.evaluate({ x: x0 });
        const F1 = stammfunktion.evaluate({ x: x1 });
        const exaktTeil = F1 - F0;
        console.log("Exakt: " + exaktTeil)
        var naeherung = 0;
        if (document.getElementById("trapez").checked == true) {
            naeherung = trapezRegel(fStr, x0, x1, 1);
        } else {
            naeherung = simpsonRegel(fStr, x0, x1, 1);
        }
        console.log("Näherung: " + naeherung)
        naeherungsWerte.push(naeherung);
        abweichungen.push(Math.abs(exaktTeil - naeherung));
    }
    console.log("Abweichungen: " + abweichungen)
    return abweichungen;
}


function checkInputs() {
    const funktion = document.getElementById('funktion').value;
    const untereGrenze = document.getElementById('untereGrenze').value;
    const obereGrenze = document.getElementById('obereGrenze').value;
    const forward = document.getElementById('skip-forward');
    const backward = document.getElementById('skip-back');
    const play = document.getElementById('play-pause');
    const zeichneFunktionButton = document.getElementById('btnZeichne');

    if (funktion && untereGrenze && obereGrenze) {
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

    for (let n = 1; n <= maxTrapeze; n++) {
        var näherungFläche = 0;
        if (document.getElementById("trapez").checked == true) {
            näherungFläche = trapezRegel(fStr, a, b, n);
        } else {
            näherungFläche = simpsonRegel(fStr, a, b, n);
        }
        const exakteFläche = stammfunktion.evaluate({ x: b }) - stammfunktion.evaluate({ x: a });
        const fehler = Math.abs(exakteFläche - näherungFläche);
        fehlerArray.push(fehler);
    }

    return fehlerArray;
}

function bewegePunkt(value) {
    stopLoop = true;
    if (document.getElementById("trapez").checked == true) {
        document.getElementById('sliderValue').innerText = `Anzahl Trapeze: ${value}`;

    } else {
        document.getElementById('sliderValue').innerText = `Anzahl Parabeln: ${value}`;
    }
    const diagramm = document.getElementById('diagramm');
    if (diagramm.data) {
        const punktX = [parseInt(value)];
        const punktY = [fehlerWerte[punktX - 1]];

        Plotly.restyle(diagramm, { x: [punktX], y: [punktY] }, 1);
    } else {
        return;
    }
}

function updateHeader(radio) {
    if (radio.checked) {
        document.getElementById('integration-method').innerHTML = `<b>Numerische Integration: ${radio.value}</b>`;
        ggbApplet.reset()
        if (checkInputs()) {
            zeichneFunktion()
        } else {
            var integralBtn = document.getElementById('integralButton');
            integralBtn.style.display = "none"
            const nachkommastellen = document.getElementById('nachkomastellenContainer').style.display = "none";
            document.getElementById('btnZeichne').disabled = true;
            var checkbox = document.getElementById('myCheckbox')
            checkbox.checked = false;
            checkbox.style.display = "none"
            document.getElementById('checkboxLabel').style.display = "none"
            document.getElementById('stammfunktionContainer').style.display = "none";
        }
        const resultContainer = document.getElementById('resultContainer').innerHTML = "";
        const histogramm = document.getElementById('abweichungsHistogramm').innerHTML = "";
        if (radio.value == "Simpsonregel") {
            document.getElementById('sliderValue').innerText = "Anzahl Parabeln: " + document.getElementById('punktPosition').value;

        } else {
            document.getElementById('sliderValue').innerText = "Anzahl Trapeze: " + document.getElementById('punktPosition').value;

        }

    }
}


function zeichneFunktion() {
    if (trapez.checked) {
        console.log("Trapez")
        zeichneFunktionTrapez();
    } else {
        console.log("Simpson")
        zeichneFunktionSimpson();
    }
}
function zeichneFunktionTrapez() {
    ggbApplet.reset()
    var funktion = document.getElementById('funktion').value.trim();
    var untereGrenze = document.getElementById('untereGrenze').value.trim();
    untereGrenze = Number(untereGrenze);
    var obereGrenze = document.getElementById('obereGrenze').value.trim();
    obereGrenze = Number(obereGrenze);
    var anzahlTrapeze = document.getElementById('punktPosition').value;
    try {
        var fxLabel = ggbApplet.evalCommandGetLabels('f(x)=' + funktion);
        if (fxLabel == null) {
            document.getElementById('myCheckbox').style.display = "none"
            document.getElementById('checkboxLabel').style.display = "none"
            return;
        }
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
    document.getElementById('myCheckbox').style.display = "inline"
    document.getElementById('checkboxLabel').style.display = "inline"
    var integralBtn = document.getElementById('integralButton');
    integralBtn.style.display = "inline"
    document.getElementById('nachkomastellenContainer').style.display = "inline";
}

function zeichneFunktionSimpson() {
    ggbApplet.reset()
    var funktion = document.getElementById('funktion').value.trim();
    var untereGrenze = document.getElementById('untereGrenze').value.trim();
    untereGrenze = Number(untereGrenze);
    var obereGrenze = document.getElementById('obereGrenze').value.trim();
    obereGrenze = Number(obereGrenze);
    var anzahlTrapeze = document.getElementById('punktPosition').value;
    try {
        var fxLabel = ggbApplet.evalCommandGetLabels('f(x)=' + funktion);
        if (fxLabel == null) {
            document.getElementById('myCheckbox').style.display = "none"
            document.getElementById('checkboxLabel').style.display = "none"
            return;
        }
        ggbApplet.setColor(fxLabel, 62, 137, 62)
        var functionLabel = ggbApplet.evalCommandGetLabels('g(x) = 0');
        ggbApplet.setVisible(functionLabel, false);
        breite = (obereGrenze - untereGrenze) / anzahlTrapeze;
        for (var i = 0; i < anzahlTrapeze; i++) {
            var a = untereGrenze + (i * breite);

            var b = untereGrenze + (i + 1) * breite;
            var m = (a + b) / 2;

            // Berechne die Funktionswerte
            var fa = ggbApplet.getValue("f(" + a + ")");
            var fm = ggbApplet.getValue("f(" + m + ")");
            var fb = ggbApplet.getValue("f(" + b + ")");

            // Berechnung der Koeffizienten A, B, C der Parabel y = Ax^2 + Bx + C
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


            // Definiere die Parabel und erstelle die Kurve
            const curveCommand = `Curve(t, ${A} * t^2 + ${B} * t + ${C}, t, ${a}, ${b})`;
            const parabel = ggbApplet.evalCommandGetLabels(curveCommand);

            console.log(a + " " + fa)
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
    document.getElementById('myCheckbox').style.display = "inline"
    document.getElementById('checkboxLabel').style.display = "inline"
    var integralBtn = document.getElementById('integralButton');
    integralBtn.style.display = "inline"
}
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
};