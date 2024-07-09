import sympy as sp

# Definiere Symbole für die Variablen und Parameter
x, a, b, c = sp.symbols('x a b c')

# Definiere die Funktion, von der du die Ableitung nehmen möchtest
f = a * x**2 + b * x + c

# Berechne die partielle Ableitung nach einem Parameter
partial_derivative_a = sp.diff(f, a)

# Berechne die partielle Ableitung nach mehreren Parametern
partial_derivative_b = sp.diff(f, b)
partial_derivative_c = sp.diff(f, c)

# Gib die partiellen Ableitungen aus
print("Partielle Ableitung nach a:", partial_derivative_a)
print("Partielle Ableitung nach b:", partial_derivative_b)
print("Partielle Ableitung nach c:", partial_derivative_c)
