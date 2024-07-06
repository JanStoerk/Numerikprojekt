import numpy as np

def trapezoidal_rule(f, a, b, n):
    """
    Berechnet den Flächeninhalt unter der Funktion f im Intervall [a, b]
    mit n Teilintervallen mithilfe der Trapezregel.
    
    Args:
    f: Die zu integrierende Funktion
    a: Untere Grenze des Integrationsintervalls
    b: Obere Grenze des Integrationsintervalls
    n: Anzahl der Teilintervalle
    
    Returns:
    Der approximierte Flächeninhalt unter der Kurve
    """
    # Schrittweite
    h = (b - a) / n
    
    # Berechnung der x-Werte
    x = np.linspace(a, b, n+1)
    
    # Berechnung der y-Werte
    y = f(x)
    
    # Trapezregel anwenden
    T = h * (0.5 * y[0] + np.sum(y[1:-1]) + 0.5 * y[-1])
    
    return T

# Beispielhafte Funktion f(x) = x^2 + 3
def example_function(x):
    return x**2 + 3

# Intervallgrenzen und Anzahl der Teilintervalle
a = -2
b = 3
n = 6

# Berechnung des Flächeninhalts
area = trapezoidal_rule(example_function, a, b, n)
print(f"Der approximierte Flächeninhalt unter der Kurve ist: {area:.4f} FE")
