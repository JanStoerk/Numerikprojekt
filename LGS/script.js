document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('Gleichungssystem');
    const saveButton = document.getElementById('saveButton');
    const clearButton = document.getElementById('clearButton');
    const addButton = document.getElementById('addButton');
    const removeButton = document.getElementById('removeButton');
    const addButtonColumn = document.getElementById('addButtonColumn');
    const removeButtonColumn = document.getElementById('removeButtonColumn');

    function createInputFields() {
        const row = table.insertRow();
        for (let i = 0; i < 5; i++) {
            const cell = row.insertCell();
            const input = document.createElement('input');
            input.type = 'text';
            cell.appendChild(input);
            /*if (i < 3) {
                const plusSign = document.createTextNode('+');
                cell.appendChild(plusSign);
            }
            else if (i != 4) {
                const timesSign = document.createTextNode('=');
                cell.appendChild(timesSign);
            }*/
        }
    }

    for (let i = 0; i < 4; i++) {
        createInputFields();
    }
    addSigns();

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
            addSigns();
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
            }
            addSigns();
        }
    });

    clearButton.addEventListener('click', function () {
        for (var i = table.rows.length - 1; i >= 0; i--) {
            table.deleteRow(i);
        }
        for (let i = 0; i < 4; i++) {
            createInputFields();
        }
        addSigns();
    });

    removeButtonColumn.addEventListener('click', function () {
        if(table.rows[0].cells.length > 2){
            for (var i = 0; i < table.rows.length; i++) {
                cellNumber = table.rows[i].cells.length;
                table.rows[i].deleteCell(cellNumber - 1);
            }
        }
        addSigns();
    });

    addButtonColumn.addEventListener('click', function () {
        if(table.rows[0].cells.length < 10){
            for (var i = 0; i < table.rows.length; i++) {
                const cell = table.rows[i].insertCell();
                const input = document.createElement('input');
                input.type = 'text';
                cell.appendChild(input);
            }
            addSigns();
        }
    });

    function addSigns(){
        for (var i = 0; i < table.rows.length; i++) {
            var columnLength = table.rows[i].cells.length;
            for(var j =0;j<columnLength;j++){
                var cell = table.rows[i].cells[j];
                if (cell.childNodes.length > 1) {
                    cell.removeChild(cell.childNodes[1]);
                }
                if(j+2 == columnLength){
                    const equalsSign = document.createTextNode('=');
                    cell.appendChild(equalsSign);
                }else if(j+1 !=columnLength){
                    const plusSign = document.createTextNode('+');
                    cell.appendChild(plusSign); 
                }

            }

        }
    }

});