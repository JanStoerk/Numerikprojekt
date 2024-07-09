import numpy as np
from scipy.linalg import lstsq

# Definiere das Modell
def f(x, t):
    return x[0] * np.exp(x[1] * t)

# Definiere die Jacobian-Matrix
def J(x, t):
    return np.array([np.exp(x[1] * t), x[0] * t * np.exp(x[1] * t)]).T

# Gauß-Newton-Verfahren
def gauss_newton(f, J, x0, y, t, tol=1e-6, max_iter=100):
    x = x0
    for i in range(max_iter):
        r = y - f(x, t)
        Jx = J(x, t)
        delta, _, _, _ = lstsq(Jx, r)
        x = x + delta
        if np.linalg.norm(delta) < tol:
            break
    return x

# Gegebene Datenpunkte
t = np.array([0, 1, 2, 3, 4, 5])
y = np.array([2.0, 2.7, 3.8, 5.1, 7.3, 10.2])

# Anfangsschätzung der Parameter
x0 = np.array([1, 0.5])

# Anwendung des Gauß-Newton-Verfahrens
x_opt = gauss_newton(f, J, x0, y, t)

# Ausgabe der angepassten Parameter
print(f"Angepasste Parameter: a = {x_opt[0]}, b = {x_opt[1]}")
