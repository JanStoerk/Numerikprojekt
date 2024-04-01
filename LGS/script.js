document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('Gleichungssystem');
    const saveButton = document.getElementById('saveButton');
    const clearButton = document.getElementById('clearButton');
    const addButton = document.getElementById('addButton');
    const removeButton = document.getElementById('removeButton');

    function createInputFields() {
        const row = table.insertRow();
        for (let i = 0; i < 5; i++) {
            const cell = row.insertCell();
            const input = document.createElement('input');
            input.type = 'text';
            cell.appendChild(input);
            if (i < 3) {
                const plusSign = document.createTextNode('+');
                cell.appendChild(plusSign);
            }
            else if (i != 4) {
                const timesSign = document.createTextNode('=');
                cell.appendChild(timesSign);
            }
        }
    }

    for (let i = 0; i < 4; i++) {
        createInputFields();
    }

    saveButton.addEventListener('click', function () {
        const inputs = document.querySelectorAll('#Gleichungssystem input');
        const values = [];

        inputs.forEach(function (input) {
            if (input.value.trim() === '') {
                values.push(0);
            } else {
                values.push(parseFloat(input.value));
            }
        });
        var rows = table.rows.length;
        console.log('Anzahl Zeilen: '+ rows + ' - Eingegebene Werte: ', values);
    });


    removeButton.addEventListener('click', function () {
        const rows = table.rows.length;
        const cells = table.rows[0].cells.length - 1;
        console.log(cells)
        if (rows > 1) {
            table.deleteRow(rows - 1);
        }
    });

    addButton.addEventListener('click', function () {
        const rows = table.rows.length;
        const cells = table.rows[0].cells.length;
        if (rows < 10) {
            var row = table.insertRow();
            for (let i = 0; i < cells; i++) {
                const cell = row.insertCell();
                const input = document.createElement('input');
                input.type = 'text';
                cell.appendChild(input);
                if (i < 3) {
                    const plusSign = document.createTextNode('+');
                    cell.appendChild(plusSign);
                }
                else if (i != 4) {
                    const timesSign = document.createTextNode('=');
                    cell.appendChild(timesSign);
                }
            }
        }
    });

    clearButton.addEventListener('click', function () {
        for (var i = table.rows.length - 1; i >= 0; i--) {
            table.deleteRow(i);
        }
        for (let i = 0; i < 4; i++) {
            createInputFields();
        }
    });

});