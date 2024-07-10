// Implementierung der Simpson's Regel in JavaScript
function simpsonsRule(f, a, b, n) {
    if (n % 2 !== 0) {
        throw new Error("Die Anzahl der Unterintervalle (n) muss gerade sein.");
    }

    const h = (b - a) / n;
    let summe = f(a) + f(b);

    for (let i = 1; i < n; i++) {
        const x = a + i * h;
        if (i % 2 === 0) {
            summe += 2 * f(x);
        } else {
            summe += 4 * f(x);
        }
    }

    return (h / 3) * summe;
}

// Beispielhafte Verwendung
const f = x => x * x; // Funktion, die integriert werden soll
const a = 0; // Untere Grenze
const b = 2; // Obere Grenze
const n = 4; // Anzahl der Unterintervalle (muss gerade sein)

const ergebnis = simpsonsRule(f, a, b, n);
console.log("Ungefähres Integral:", ergebnis);
