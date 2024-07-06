import numpy as np

def model_function(x, params):
    """
    Modellfunktion f(x, params) = y für das nichtlineare Ausgleichsproblem.
    Hier ein Beispiel einer quadratischen Funktion: y = a * x^2 + b * x + c.
    """
    a, b, c = params
    return a * x**2 + b * x + c

def gauss_newton(x_data, y_data, initial_params, max_iter=100, tol=1e-6):
    """
    Gauss-Newton-Verfahren zur Lösung eines nichtlinearen Ausgleichsproblems.

    Args:
        x_data (numpy.ndarray): Array der unabhängigen Variablen.
        y_data (numpy.ndarray): Array der gemessenen Werte.
        initial_params (numpy.ndarray): Array der Startwerte für die Parameter.
        max_iter (int): Maximale Anzahl von Iterationen.
        tol (float): Toleranz für die Konvergenz.

    Returns:
        numpy.ndarray: Geschätzte Parameter.
    """
    params = initial_params.copy().astype(float)

    for _ in range(max_iter):
        # Berechnung der Residuen
        residuals = y_data - model_function(x_data, params)

        # Berechnung der Jacobi-Matrix
        J = np.zeros((len(x_data), len(params)), dtype=float)
        for i, x in enumerate(x_data):
            J[i] = [
                -x**2,
                -x,
                -1
            ]

        # Berechnung des Inkrements für die Parameter
        delta_params = np.linalg.lstsq(J, residuals, rcond=None)[0]

        # Aktualisierung der Parameter
        params += delta_params

        # Überprüfung der Konvergenz
        if np.linalg.norm(delta_params) < tol:
            print(f"Konvergenz erreicht nach {_ + 1} Iterationen.")
            return params

    print("Maximale Anzahl von Iterationen erreicht.")
    return params

# Beispiel-Daten
x_data = np.array([1, 2, 3, 4, 5])
y_data = np.array([2.1, 3.9, 6.2, 8.8, 11.9])

# Startwerte für die Parameter
initial_params = np.array([1, 1, 1], dtype=float)

# Anwendung des Gauss-Newton-Verfahrens
estimated_params = gauss_newton(x_data, y_data, initial_params)
print("Geschätzte Parameter:", estimated_params)
