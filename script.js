
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var trapezoidDrawn =0;

var scaleX = canvas.width / 10;
var scaleY = canvas.height / 10; 
document.addEventListener("DOMContentLoaded", function () {

    drawGrid(); 
    drawAxes(); 
    drawFunction();

});

function drawAxes() {
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.strokeStyle = '#000';
    ctx.stroke();

    for (var i = 0; i <= 10; i++) {
        ctx.fillText(i.toString(), canvas.width / 2 + i * scaleX, canvas.height / 2 + 10);
    }
}


function drawGrid() {
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 0.5;


    for (var i = -10; i <= 10; i++) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 + i * scaleX, 0);
        ctx.lineTo(canvas.width / 2 + i * scaleX, canvas.height);
        ctx.stroke();
    }


    for (var i = 0; i <= 10; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * scaleY);
        ctx.lineTo(canvas.width, i * scaleY);
        ctx.stroke();
    }
}

function drawFunction() {
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    for (var x = -10; x <= 10; x += 0.1) { 
        var y = -Math.pow(x, 2) + 4 * x; 
        ctx.lineTo(canvas.width / 2 + x * scaleX, canvas.height / 2 - y * scaleY);
    }
    ctx.stroke();
}

function drawTrapezoids() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(); 
    drawAxes(); 
    drawFunction();
    var n = document.getElementById("trapezoidWidthInput").value;
    if(n==''){
        return;
    }
    var startX = parseInt(document.getElementById("left").value);
    var endX = parseInt(document.getElementById("right").value);
    var dx = (endX - startX) / n;
    console.log(startX+' - '+endX+' - '+n)
    ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'; 
    var i =0; //i stellt sicher dass bei Rundungsungenauigkeiten nicht zuviele Trapeze erzeugt werden
    for (var x = startX; x < endX && i<n; x += dx) {
        console.log(x)
        var y1 = -Math.pow(x, 2) + 4 * x; 
        var y2 = 0; 
        var y3 = -Math.pow(x + dx, 2) + 4 * (x + dx); 
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 + x * scaleX, canvas.height / 2 - y1 * scaleY);
        ctx.lineTo(canvas.width / 2 + (x + dx) * scaleX, canvas.height / 2 - y3 * scaleY);
        ctx.lineTo(canvas.width / 2 + (x + dx) * scaleX, canvas.height / 2); 
        ctx.lineTo(canvas.width / 2 + x * scaleX, canvas.height / 2); 
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'black';
        ctx.stroke();
        trapezoidDrawn = n;
        i++;
    }
    calculate();
}

function calculate(){
    var n = document.getElementById("trapezoidWidthInput").value;
    if(n==''){
        return;
    }
    var startX = parseInt(document.getElementById("left").value);
    var endX = parseInt(document.getElementById("right").value);
    var dx = (endX - startX) / n;

    var x=startX;
        var aG =0;
        for(var i=0;i<n;i++){
            var A = dx*((value(x)+value(x+dx))/2);
            x=x+dx;
            aG+=A;
        }
        var result = document.getElementById("result");
        result.innerHTML = 'Flaecheninhalt: '+aG+' FE'
        function value(x){
            var A = -Math.pow(x, 2) + 4 * x;
            return A;
        }
}

const gearIcon = document.getElementById("gear-icon");

gearIcon.addEventListener("mouseover", () => {
  gearIcon.style.animationPlayState = "running";
});
