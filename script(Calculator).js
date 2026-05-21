let one = document.getElementById("1");
let two = document.getElementById("2");
let three = document.getElementById("3");
let four = document.getElementById("4");
let five = document.getElementById("5");

let six = document.getElementById("6");
let seven = document.getElementById("7");
let eight = document.getElementById("8");
let nine = document.getElementById("9");
let zero = document.getElementById("0");
let decimal = document.getElementById("decimal");

let inputRow = document.getElementById("inputRow");
let clear = document.getElementById("C");
let root = document.getElementById("root");
let plus = document.getElementById("plus");
let minus = document.getElementById("minus");
let multiplication = document.getElementById("multiplication");
let division = document.getElementById('division');
let negative = document.getElementById('negative');
let percent = document.getElementById('percent');
let equals = document.getElementById("equals");

let operations = [];

clear.addEventListener('click', function(){
    inputRow.textContent = '';
});

one.addEventListener('click', function(){
    inputRow.textContent += '1';
});

two.addEventListener('click', function(){
    inputRow.textContent += '2';
});

three.addEventListener('click', function(){
    inputRow.textContent += '3';
});

four.addEventListener('click', function(){
    inputRow.textContent += '4';
});

five.addEventListener('click', function(){
    inputRow.textContent += '5';
});

six.addEventListener('click', function(){
    inputRow.textContent += '6';
});

seven.addEventListener('click', function(){
    inputRow.textContent += '7';
});

eight.addEventListener('click', function(){
    inputRow.textContent += '8';
});

nine.addEventListener('click', function(){
    inputRow.textContent += '9';
});

zero.addEventListener('click', function(){
    inputRow.textContent += '0';
});

decimal.addEventListener('click', function(){
    inputRow.textContent += '.';
});

plus.addEventListener('click', function(){
    operations[0] = inputRow.textContent;
    operations[1] = '+';
    clear.click();
});

minus.addEventListener('click', function(){
    operations[0] = inputRow.textContent;
    operations[1] = '-';
    clear.click();
});

multiplication.addEventListener('click', function(){
    operations[0] = inputRow.textContent;
    operations[1] = '×';
    clear.click();
});

division.addEventListener('click', function(){
    operations[0] = inputRow.textContent;
    operations[1] = '÷';
    clear.click();
});

negative.addEventListener('click', function(){
    let number = inputRow.textContent;
    number = parseFloat(number) * -1;
    number = number.toString();
    inputRow.textContent = number;
});

root.addEventListener('click', function(){
    let number = inputRow.textContent;
    inputRow.textContent = Math.sqrt(number);
});

percent.addEventListener('click', function(){
    let number = inputRow.textContent;
    inputRow.textContent = number/100;
});

equals.addEventListener('click', function(){
    operations[2] = inputRow.textContent;
    let result = 0;
    switch(operations[1]){
        case '+':
            result = parseFloat(operations[0]) + parseFloat(operations[2]);
            break;
        case '-':
            result = parseFloat(operations[0]) - parseFloat(operations[2]);
            break;
        case '×':
            result = parseFloat(operations[0]) * parseFloat(operations[2]);
            break;
        case '÷':
            result = parseFloat(operations[0]) / parseFloat(operations[2]);
            break;
    }
    
    clear.click();
    inputRow.textContent += result.toString();
    operations.length = 0;
});

document.getElementById('back-b').addEventListener('click', function(){
    window.location.href = 'index.html';
});