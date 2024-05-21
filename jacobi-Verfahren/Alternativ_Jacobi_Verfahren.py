import numpy as np

def jacobi(A, b, x0, tol=1e-6, max_iter=1000):
    """
    Jacobi-Verfahren zur Lösung eines linearen Gleichungssystems Ax = b.
    
    Args:
        A (numpy.ndarray): Die Koeffizientenmatrix des Gleichungssystems.
        b (numpy.ndarray): Der Vektor der Konstanten auf der rechten Seite.
        x0 (numpy.ndarray): Der Startwert für die Iteration.
        tol (float): Die Toleranz für die Konvergenz.
        max_iter (int): Die maximale Anzahl von Iterationen.
        
    Returns:
        numpy.ndarray: Die Näherungslösung des Gleichungssystems.
    """
    D = np.diag(np.diag(A))
    L_U = A - D
    x = x0
    for _ in range(max_iter):
        x_new = np.linalg.solve(D, b - np.dot(L_U, x))
        if np.linalg.norm(x_new - x) < tol:
            return x_new
        x = x_new
    raise ValueError("Jacobi-Verfahren hat keine Konvergenz erreicht.")

# Gleichungssystem definieren
A = np.array([[3, 2], [2, 4]])
b = np.array([7, 10])
x0 = np.array([0, 0])  # Startwerte für die Iteration

# Jacobi-Verfahren anwenden
solution = jacobi(A, b, x0)

print("Lösung des Gleichungssystems:")
print("x =", solution[0])
print("y =", solution[1])
