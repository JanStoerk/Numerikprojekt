import numpy as np

#Verzweigung nach LiFo Regel?
#Bedingungen sind ganzzahlig und größer Null

def solve_linear_system(coeff_matrix, const_vector):
    """
    Löst ein System linearer Gleichungen.
    """
    try:
        solution = np.linalg.solve(coeff_matrix, const_vector)
        return solution
    except np.linalg.LinAlgError:
        return None

def objective_function(opt_solution):
    """
    Wert der Zielfunktion 
    """
    x1, x2 = opt_solution
    return 3 * x1 + x2

def calculate_total_nodes(levels):
    # Gesamtanzahl der Knoten in einem binären Baum mit einer gegebenen Anzahl von Ebenen
    total_nodes = 0
    for level in range(levels + 1):
        total_nodes += 2 ** level
    return total_nodes

def ceil_and_floor_value(element):
    ceil_value = np.ceil(element)
    floor_value = np.floor(element)

    return ceil_value, floor_value

def find_biggest_margin(opt_solution):
    # Subtrahiere die Werte innerhalb der Lösung jeweils von der nächstgrößeren ganzen Zahl
    adjusted_solution = np.ceil(opt_solution) - opt_solution
    print("Angepasste Lösung (subtrahiert von der nächstgrößeren ganzen Zahl):", adjusted_solution)

    # Finden des Index des größten Elements in adjusted_solution (mit dem max_element wird nun weiter gerechnet)
    max_index = np.argmax(adjusted_solution)
    max_element = opt_solution[max_index]

    # Berechnen der nächstgrößeren und der nächstkleineren ganzzahligen Zahl
    ceil_value, floor_value = ceil_and_floor_value(max_element)

    print(f"Größtes Element in der Lösung: {max_element}")
    print(f"Nächstgrößere ganzzahlige Zahl: {ceil_value}")
    print(f"Nächstkleinere ganzzahlige Zahl: {floor_value}")

    return ceil_value, floor_value

def check_if_int(element):
    # Überprüfe, ob alle Werte ganzzahlig sind
    return np.all(np.equal(element, element.astype(int)))


def calculate_intersections(const_vector, coeff_matrix, new_solution):
    
    x_intersection_1 = (const_vector[0] - coeff_matrix[0, 1] * new_solution[0]) / coeff_matrix[1, 1]
    x_intersection_2 = (const_vector[1] - coeff_matrix[1, 1] * new_solution[0]) / coeff_matrix[1, 0]
    
    return x_intersection_1, x_intersection_2

# Anzahl der Variablen
num_vars = 2

lower_bound = 0
upper_bound = 0

# Erstellen der Koeffizientenmatrix und des Konstantenvektors 
coeff_matrix = np.array([[4, 3], [2, 5]])
# Konstantenvektor der Nebenbedingungen
const_vector = np.array([12, 10])

print("Koeffizientenmatrix:")
print(coeff_matrix)
print("\nKonstantenvektor:")
print(const_vector)

opt_solution = solve_linear_system(coeff_matrix, const_vector)


rows, cols = coeff_matrix.shape
print(cols)
total_nodes = calculate_total_nodes(cols)
print(total_nodes)

if opt_solution is not None and not check_if_int(opt_solution):
    print("\nLösung:", opt_solution)

    upper_bound = objective_function(opt_solution)

    print("Obere Grenze (Wert der Zielfunktion):", upper_bound)
    for x in range(total_nodes):
        
        
        ceil_value, floor_value = find_biggest_margin(opt_solution)

        # Setze den floor_value als neuen ersten Wert in der Lösung
        new_solution = np.copy(opt_solution)
        new_solution[0] = floor_value
        print(new_solution[0])


        # Berechnung des Schnittpunkts zwischen den Nebenbedingungen und new_solution[0]
        intersections = calculate_intersections(const_vector, coeff_matrix, new_solution)

        new_solution[1] = intersections[0]
        print("Schnittpunkt 1 (Gleichung 1):", intersections[0])

        #Berechnung 
        new_target_function_value = objective_function(new_solution)
        print(new_target_function_value)

        if check_if_int(new_solution) and new_target_function_value < upper_bound and new_target_function_value > lower_bound:

            lower_bound = new_target_function_value
            print(lower_bound)

        else:
            # Berechnen der nächstgrößeren und der nächstkleineren ganzzahligen Zahl (Bracnhing)
            ceil_value2, floor_value2 = ceil_and_floor_value(new_solution[1])

            new_solution[1] = floor_value2
            new_target_function_value_floor = objective_function(new_solution)

            if check_if_int(new_solution):
                if new_target_function_value_floor > upper_bound or new_target_function_value_floor < lower_bound:
                    print("Untere schranke größer obere schranke oder bisherige Untere Schranke bereits genauer")
                else:    
                    lower_bound = new_target_function_value_floor
                    print("untere Schranke", lower_bound)
            
            else:
                print("Branch ist fertig")
        
            new_solution[1] = ceil_value2
            new_target_function_value_ceil = objective_function(new_solution)

            if check_if_int(new_solution):
                if new_target_function_value_ceil > upper_bound or new_target_function_value_ceil < lower_bound:
                    print("Untere schranke größer obere schranke oder bisherige Untere Schranke bereits genauer")
                else:    
                    lower_bound = new_target_function_value_ceil
                    print("untere Schranke",lower_bound)
            
            else:
                print("Branch ist fertig")

        
        #2 weg vom obersten Branching
        new_solution[0] = ceil_value

        intersections = calculate_intersections(const_vector, coeff_matrix, new_solution)
        new_solution[1] = intersections[1]
        print("Schnittpunkt 2 (Gleichung 2):", intersections[1])

        #Berechnung 
        new_target_function_value = objective_function(new_solution)
        print("New Target func Value: ",new_target_function_value)

        if check_if_int(new_solution) and new_target_function_value < upper_bound and new_target_function_value > lower_bound:
            lower_bound = new_target_function_value
            print(lower_bound)
        
        else:
            print("Keine Verbesserung erreicht")

print("\n obere Grenze:", upper_bound)
print("\n untere Grenze:",lower_bound)