function trapezRegel(f, a, b, n) {
    // Schrittweite
    const h = (b - a) / n;
    
    // Berechnung der x-Werte
    const x = [];
    for (let i = 0; i <= n; i++) {
        x.push(a + i * h);
    }
    
    // Berechnung der y-Werte
    const y = x.map(f);
    
    // Trapezregel anwenden
    let T = 0.5 * y[0] + 0.5 * y[n];
    for (let i = 1; i < n; i++) {
        T += y[i];
    }
    T *= h;
    
    return T;
}

// Beispielhafte Funktion f(x) = x^2 + 3
function beispielFunction(x) {
    return x * x + 3;
}

// Intervallgrenzen und Anzahl der Teilintervalle
const a = -2;
const b = 3;
const n = 6;

// Berechnung des Flächeninhalts
const area = trapezRegel(beispielFunction, a, b, n);
console.log(`Der approximierte Flächeninhalt unter der Kurve ist: ${area.toFixed(4)} FE`);
