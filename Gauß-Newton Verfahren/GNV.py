'''
initial_guesses
wert bei x=0 nehmen und die half life ablesen (ln(2)/Half life) = K (guter guess für k) um gutes globales minimum und nicht lokales minimum zu finden

sse = (beobachteter wert - errechneter/gefitteter wert)^2     oder  sse/k =   2(beobachteter wert - errechneter/gefitteter wert) * t*errechneter/gefitteter wert
    = sse^2/k^2 = -2*beobachteter wert*t*t*errechneter/gefitteter wert -((2*errechneter/gefitteter wert)*(-t*t*errechneter/gefitteter wert)+ (-2*t*errechneter/gefitteter wert)*(t*errechneter/gefitteter wert))

es ist ebenfalls möglich die ableitungen numerisch zu bestimmen (f'/f'')

k in jeder iteration optimieren um das (globale) minimum zu finden mit Knew= kold - f'(kold)/f''(kold)

jacobi-Matrix mit jeweils übereinstimmden zeilen (bei normaler Tabelle x/y wert)
bei jacobi Matrix 1. zeile = t*errechneter/gefitteter wert , 2 Zeile. = -e^-k*t
damit die jacobi Matrix mithilfe der Initial guesses berechnen 

sobald wir die jacobi matrix haben, können wie diese Transponieren, und auch noch die inverse 

den vektor am ende berechnet man indem man die current guesses und die beobachteten werte in Ri einstetzt 
daraus ergibt sich ein vektor im beispiel mit 8 einträgen

vektor * transponierte jacobi matrix = daraus ergibt sich ein spaltenvektor

transponierte jacobi matrix * inverse Jacobi Matrix * Spaltenvektor = jacobi abschnitt

knew   kold                                             kold
---- = ----   -    jacobi Abschnitt                     ----   =  current guessen of k and the checked value
y0new  y0old                                            y0old



'''

#initiall guess
import math
import numpy as np
import matplotlib.pyplot as plt
import sympy as sp

'''
# Array mit 5 x-Werten
x_values = np.array([1, 2, 3, 4, 5])

# Array mit 5 y-Werten
y_values = np.array([2, 4, 6, 9, 12])

k = 0,3 #math.log(2) / (150 / 2)
t = y_values[0]
y0 = x_values[0]
e = math.e

print(k)

def funktionen(x, variablenwerte):
    """
    Modellfunktion f(x, params) = y für das nichtlineare Ausgleichsproblem.
    Hier ein Beispiel einer quadratischen Funktion: y = a * x^2 + b * x + c.
    """
    a, b, c = variablenwerte
    return a * x**2 + b * x + c

# Definition der Geradengleichung: y = mx + c
m = 2  # Steigung
c = 1  # y-Achsenabschnitt

# Definiere den Bereich von x-Werten
x_area = np.linspace(0, 10, 100)  # Von 0 bis 10 mit 100 Werten

# Berechne die y-Werte entsprechend der Geradengleichung
y_values = m * x_area + c

# Plot der Gerade
plt.plot(x_values, y_values, label='Gerade: y = {}x + {}'.format(m, c))
plt.xlabel('x')
plt.ylabel('y')
plt.title('Beispiel für eine Gerade')
plt.grid(True)
plt.legend()
plt.show()

fitted_value = y0 * e ** (-k * t)
observed_value = y0
'''


# Annahme: Array der gemessenen x-Werte
x_values = np.array([1, 2, 3, 4, 5])
observed_y_values = np.array([2, 4, 6, 9, 12])

# Annahme: Aktuelle Schätzungen für die Parameter a, b und c
params = np.array([1, 1, 1], dtype=float)  # Annahme von a=1, b=1, c=1

# Berechnung der vorhergesagten y-Werte für die gemessenen x-Werte
#calculated_y_values = params[0] * x_values**2 + params[1] * x_values + params[2]

# Nichtlineare Modellfunktion
def nonlinear_model_function(x, a, b, c):
    
    return a * np.sin(b * x) + c
    

# Berechnung der vorhergesagten y-Werte für die gemessenen x-Werte
calculated_y_values = nonlinear_model_function(x_values, *params)
print("Gemessene x-Werte:", x_values)
print("beobachtete y-Werte:", observed_y_values)
print("Vorhergesagte y-Werte:", calculated_y_values)

residuals = observed_y_values - calculated_y_values
print("Residuen:", residuals)

squared_residuals = residuals ** 2
print("Residuen im Quadrat:", squared_residuals)

sum_of_squared_residuals = np.sum(squared_residuals)
print("Summe der Residuen:", sum_of_squared_residuals)

x, a, b, c = sp.symbols('x a b c')
nonlinear_model_function = a * sp.sin(b * x) + c

#Berechnung der partiellen Ableitungen der Residuumsfunktion nach jedem Parameter
partial_derivative_1 = sp.diff(nonlinear_model_function, a)
print("Partielle Ableitung: ", partial_derivative_1)
partial_derivative_2 = sp.diff(nonlinear_model_function, b)
print("Partielle Ableitung: ", partial_derivative_2)
partial_derivative_3 = sp.diff(nonlinear_model_function, c)
print("Partielle Ableitung: ", partial_derivative_3)

# Berechne die Jacobi-Matrix der Residuen
J = np.zeros((len(x_values), len(params)))
for i, x_val in enumerate(x_values):
    J[i, 0] = partial_derivative_1.evalf(subs={x: x_val, a: params[0], b: params[1], c: params[2]})
    J[i, 1] = partial_derivative_2.evalf(subs={x: x_val, a: params[0], b: params[1], c: params[2]})
    J[i, 2] = partial_derivative_3.evalf(subs={x: x_val, a: params[0], b: params[1], c: params[2]})

print("Jacobi-Matrix der Residuen:")
print(J)
transposed_matrix = np.transpose(J)
print("\nTransponierte Matrix:")
print(transposed_matrix)

new_guess = params - (transposed_matrix @ J)**-1 @ transposed_matrix @ residuals 
print("new guess:",new_guess)
