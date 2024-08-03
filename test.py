
from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import random

app = Flask(__name__)
CORS(app)  # Aktiviere CORS für die gesamte Anwendung

@app.route('/api/LGS/solution', methods=['GET'])
def getSolution():
    werte = [
        [4, -1, 1,5],
        [-2, 5, 1,11],
        [1, -2, 5,12]
    ]

    rows = 3
    cols = 4
    matrix = []

    start_vektor = [0] * (cols - 1)
    result_vector = [0] * (cols - 1)


    for i in range(rows):
            row = []
            for j in range(cols):  
                value = werte[i][j]
                row.append(value)
            matrix.append(row)  

    

    def make_symmetric(matrix, rows, cols):
        # Hinzufügen von Null-Zeilen, falls die Anzahl der Zeilen kleiner als die Anzahl der Spalten ist
        if rows < cols:
            num_zeros = cols - rows
            zero_rows = np.zeros((num_zeros, cols))
            matrix = np.vstack([matrix, zero_rows])
        # Hinzufügen von Null-Spalten, falls die Anzahl der Spalten kleiner als die Anzahl der Zeilen ist
        elif cols < rows:
            num_zeros = rows - cols
            zero_cols = np.zeros((rows, num_zeros))
            matrix = np.hstack([matrix, zero_cols])
        return matrix



    for i in range(11):
        start_vektor = result_vector

        print("Der Startvektor lautet:", start_vektor)

        matrix = np.array(matrix)

        print("Die Matrix lautet:")
        for row in matrix:
            print(row)

        last_column_vector = matrix[:, -1]

        # Entfernen der letzten Spalte aus der Matrix
        symmetric_matrix_wlc = np.delete(matrix, -1, axis=1)

        # Anzahl der Zeilen und Spalten der Matrix
        rows, cols = symmetric_matrix_wlc.shape

        # Matrix symmetrisch machen
        symmetric_matrix = make_symmetric(symmetric_matrix_wlc, rows, cols)

        print("Die neue symmetrische Matrix:")
        print(symmetric_matrix)

        print("Die extrahierte letzte Spalte:")
        print(last_column_vector)
        print("Die aktualisierte Matrix ohne die letzte Spalte:")
        print(symmetric_matrix_wlc)


        # Diagonalmatrix erstellen
        diagonal_matrix = []
        for i in range(len(symmetric_matrix_wlc)):
            row = []
            for j in range(len(symmetric_matrix_wlc[0])):
                if i == j:  # Diagonalelement
                    row.append(symmetric_matrix_wlc[i][j])
                else:
                    row.append(0)  # Nicht-Diagonalelement
            diagonal_matrix.append(row)

        # Ausgabe der Diagonalmatrix
        print("Die Diagonalmatrix lautet:")
        for row in diagonal_matrix:
            print(row)

        # Strenge obere Dreiecksmatrix erstellen
        strict_upper_triangular_matrix = []
        for i in range(len(symmetric_matrix_wlc)):
            row = []
            for j in range(len(symmetric_matrix_wlc[0])):
                if j > i:  # Oberhalb der Hauptdiagonale
                    row.append(symmetric_matrix_wlc[i][j])
                else:
                    row.append(0)  # Unterhalb oder auf der Hauptdiagonale
            strict_upper_triangular_matrix.append(row)

        # Ausgabe der strengen oberen Dreiecksmatrix
        print("Die strenge obere Dreiecksmatrix lautet:")
        for row in strict_upper_triangular_matrix:
            print(row)

        # Strenge untere Dreiecksmatrix erstellen
        strict_lower_triangular_matrix = []
        for i in range(len(symmetric_matrix_wlc)):
            row = []
            for j in range(len(symmetric_matrix_wlc[0])):
                if j < i:  # Unterhalb der Hauptdiagonale
                    row.append(symmetric_matrix_wlc[i][j])
                else:
                    row.append(0)  # Oberhalb oder auf der Hauptdiagonale
            strict_lower_triangular_matrix.append(row)

        # Ausgabe der strengen unteren Dreiecksmatrix
        print("Die strenge untere Dreiecksmatrix lautet:")
        for row in strict_lower_triangular_matrix:
            print(row)

            # Überprüfen, ob die Matrix invertierbar ist
        def is_invertible(diagonal_matrix):
            return np.linalg.matrix_rank(matrix) == min(matrix.shape)


        # Inverse Matrix berechnen
        #inverse_matrix = np.linalg.inv(diagonal_matrix)

        # Ausgabe der inversen Matrix
        print("Die Inverse der Matrix lautet:")
        #print(inverse_matrix)

        # Berechnung der Pseudoinverse
        pseudo_inverse = np.linalg.pinv(diagonal_matrix)

        print("Die Pseudo-Inverse der Matrix lautet:")
        print(pseudo_inverse)



        np_matrix = np.array(matrix)
        np_symmatrix = np.array(symmetric_matrix_wlc)
        d_matrix = np.array(diagonal_matrix)
        #id_matrix = np.array(inverse_matrix)
        id_matrix = np.array(pseudo_inverse)

        lc_vector = np.array(last_column_vector)
        s_vector = np.array(start_vektor)

        slt_matrix = np.array(strict_lower_triangular_matrix)
        sut_matrix = np.array(strict_upper_triangular_matrix)


        #inverse_matrix * (last_column_vector -(strict_upper_triangular_matrix + ))

        # Schritt 1: Berechnung der Differenz
        #difference_vector = lc_vector - (sut_matrix + slt_matrix) @ s_vector

        # Schritt 2: Multiplikation mit der inversen Matrix
        #result_vector = id_matrix @ difference_vector

        difference_vector = lc_vector - (np_symmatrix - d_matrix) @ s_vector
        result_vector = id_matrix @ difference_vector
        print(jsonify(result_vector.tolist()))
        return jsonify(result_vector.tolist())

@app.route('/LGS/submit', methods=['POST'])
def submit():
    data = request.get_json()
    if 'data' in data:
        received_data = data['data']
        # Hier kannst du die empfangenen Daten verarbeiten
        print(f"Received data: {received_data}")
        return jsonify({'status': 'success', 'data': received_data})
    else:
        return jsonify({'status': 'error', 'message': 'No data received'}), 400




if __name__ == '__main__':
    app.run(debug=True)