let box = document.querySelectorAll(".cell");
let winner = document.querySelector(".winnerText");
let replacePawn = document.querySelectorAll(".replace");
let replacePawnBox = document.querySelector(".replacePawn")
let stopwatch = document.querySelector(".stopWatch");
const inputSlider=document.querySelector("[data-lengthSlider]");
const lengthDisplay=document.querySelector("[data-lengthNumber]");
let time=document.querySelector(".time");
let val = "";
let arr = [];
let p, q, a, b;
let x, y;
let count = 0;


piecesCss();
matrix();
function checkOurPieces(i, j) {
    let pieceType = box[arr[i][j]].innerHTML;
    if (pieceType != "♙" && pieceType != "♗" && pieceType != "♖" && pieceType != "♘" && pieceType != "♕" && pieceType != "♔" && box[arr[i][j]].innerHTML != "") {
        return false;
    }
    return true;
}
function checkOpponentPieces(i, j) {
    let pieceType = box[arr[i][j]].innerHTML;
    if (pieceType != "♟" && pieceType != "♝" && pieceType != "♜" && pieceType != "♞" && pieceType != "♛" && pieceType != "♚" && box[arr[i][j]].innerHTML != "") {
        return false;
    }
    return true;
}
function matrix() {
    for (let i = 0; i < 8; i++) {
        let row = [];
        for (let j = 0; j < 8; j++) {
            row.push(i * 8 + j);
        }
        arr.push(row);
    }

    console.log(arr);
}
function findidx(v) {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (arr[i][j] == v) {
                p = i;
                q = j;
                break;
            }
        }
    }
}
// document.querySelector(".sliderDiv").style.display="1";
function restart() {
    location.reload();
    stopwatch.style.pointerEvents = "auto";
    box.forEach(div => {
        div.style.pointerEvents = "auto";
    });

}
//taken v,vy for empassant property apply
let va=0,vb=0;
let vya,vyb;
let countera=0,counterb=0;
function movePieces() {
    let pieceType = box[arr[p][q]].innerHTML;
    if ((pieceType == "♙" || pieceType == "♗" || pieceType == "♖" || pieceType == "♘" || pieceType == "♕" || pieceType == "♔") && count == 0) {
        x = p, y = q;
    }
    if ((pieceType == "♟" || pieceType == "♝" || pieceType == "♜" || pieceType == "♞" || pieceType == "♛" || pieceType == "♚") && count == 1) {
        x = p, y = q;
    }
    let border = box[arr[p][q]];
    if (border.style.border == "2px solid red") {
        countera=0;
        counterb=0;
        //replacePawn condition for white
        if(box[arr[x][y]].innerHTML=="♙" && p==0) {
         replacePawnBox.classList.remove("dispNone");
        changePawn();
        }
         //replacePawn condition for black
         if(box[arr[x][y]].innerHTML=="♟" && p==7){
        replacePawnBox.classList.remove("dispNone");
           changePawn();
           }

        border.innerHTML = box[arr[x][y]].innerHTML;
        box[arr[x][y]].innerHTML = "";
        updatexy(p, q);
        count = count == 0 ? 1 : 0;
    }
    if (border.style.border == "2px solid black") {
        countera=0;
        counterb=0;
        //replacePawn condition for white
        if(box[arr[x][y]].innerHTML=="♙" && p==0) {
            replacePawnBox.classList.remove("dispNone");
           changePawn();
           }
        //replacePawn condition for white
        if(box[arr[x][y]].innerHTML=="♟" && p==7) {
            replacePawnBox.classList.remove("dispNone");
           changePawn();
           }

        border.innerHTML = box[arr[x][y]].innerHTML;
        box[arr[x][y]].innerHTML = "";
        updatexy(x, y);
        //check presense of king
        if (!checkKing("♚")) {
            // winner.style.display="block";
            winner.innerHTML = "Winner is White Pieces";
            stopwatch.style.pointerEvents = "none";
            box.forEach(div => {
                div.style.pointerEvents = "none";
            });
        }
        if (!checkKing("♔")) {
            // winner.style.display="block";
            winner.innerHTML = "Winner is Black Pieces";
            stopwatch.style.pointerEvents = "none";
            box.forEach(div => {
                div.style.pointerEvents = "none";
            });
        }

        count = count == 0 ? 1 : 0;
    }
    if(border.style.border=="4px solid orange"){
        countera=0;
        counterb=0;
        if(p==7 && q==2){
            border.innerHTML=box[arr[x][y]].innerHTML;
            box[59].innerHTML=box[56].innerHTML;
            box[56].innerHTML="";
            box[arr[x][y]].innerHTML="";
        }
        if(p==7 && q==6){
            border.innerHTML=box[arr[x][y]].innerHTML;
            box[61].innerHTML=box[63].innerHTML;
            box[63].innerHTML="";
            box[arr[x][y]].innerHTML="";
        }
        if(p==0 && q==2){
            border.innerHTML=box[arr[x][y]].innerHTML;
            box[3].innerHTML=box[0].innerHTML;
            box[0].innerHTML="";
            box[arr[x][y]].innerHTML="";
        }
        if(p==0 && q==6){
            border.innerHTML=box[arr[x][y]].innerHTML;
            box[5].innerHTML=box[7].innerHTML;
            box[7].innerHTML="";
            box[arr[x][y]].innerHTML="";
        }
        count = count == 0 ? 1 : 0;
    }
    if(border.style.border=="2px solid blue"){
        border.innerHTML = box[arr[x][y]].innerHTML;
        box[arr[x][y]].innerHTML = "";
        if(x==3){
            box[arr[p+1][q]].innerHTML = "";
        }
        if(x==4){
            box[arr[p-1][q]].innerHTML = "";
        }
        count = count == 0 ? 1 : 0;  
    }
    //logic for em passant property of pawn
    if(x==1 && border.innerHTML=="♟" && p==3){
          
        if(q-1>=0 && box[arr[p][q-1]].innerHTML=="♙"){
         va=1;
         countera=1;
        }
        if(q+1<=7 && box[arr[p][q+1]].innerHTML=="♙"){
            va=2;
         countera=1;
        }
        if(q-1>=0 && box[arr[p][q-1]].innerHTML=="♙" && q+1<=7 && box[arr[p][q+1]].innerHTML=="♙") {
            va=3;
            vya=q;
         countera=1;
        }
    }
    if(x==6 && border.innerHTML=="♙" && p==4){
          
        if(q-1>=0 && box[arr[p][q-1]].innerHTML=="♟"){
         vb=1;
         counterb=1;
        }
        if(q+1<=7 && box[arr[p][q+1]].innerHTML=="♟"){
            vb=2;
         counterb=1;
        }
        if(q-1>=0 && box[arr[p][q-1]].innerHTML=="♟" && q+1<=7 && box[arr[p][q+1]].innerHTML=="♟") {
            vb=3;
            vyb=q;
         counterb=1;
        }
    }
    if (box[arr[x][y]].innerHTML == "") removeBorder();
    //for rotate the pieces
    box.forEach(ele=>{
       count==0? ele.classList.remove("rotate"):ele.classList.add("rotate");
    });
}


box.forEach((value, index) => {
    value.addEventListener("click", () => {
        console.log(value.innerHTML)
        findidx(index);
        if (count == 0) {
            if (value.innerHTML == "♙") {
                removeBorder();
                whitePawn(p, q, index);
                console.log(value.innerHTML);
            }
            else if (value.innerHTML == "♗") {
                removeBorder();
                whiteBishop(p, q, index);
                console.log(value.innerHTML);
            }
            else if (value.innerHTML == "♖") {
                removeBorder();
                whiteRook(p, q, index);
                console.log(value.innerHTML);
            }
            else if (value.innerHTML == "♘") {
                removeBorder();
                whiteKnight(p, q, index);
                console.log(value.innerHTML);
            }
            else if (value.innerHTML == "♕") {
                removeBorder();
                whiteQueen(p, q, index);
                console.log(value.innerHTML);
            }
            else if (value.innerHTML == "♔") {
                removeBorder();
                whiteKing(p, q, index);
                console.log(value.innerHTML);
            }
        }
        else {
            if (value.innerHTML == "♟") {
                removeBorder();
                blackPawn(p, q, index);
                console.log(value.innerHTML);
            }
            else if (value.innerHTML == "♝") {
                removeBorder();
                blackBishop(p, q, index);
                console.log(value.innerHTML);
            }
            else if (value.innerHTML == "♜") {
                removeBorder();
                blackRook(p, q, index);
                console.log(value.innerHTML);
            }
            else if (value.innerHTML == "♞") {
                removeBorder();
                blackKnight(p, q, index);
                console.log(value.innerHTML);
            }
            else if (value.innerHTML == "♛") {
                removeBorder();
                blackQueen(p, q, index);
                console.log(value.innerHTML);
            }
            else if (value.innerHTML == "♚") {
                removeBorder();
                blackKing(p, q, index);
                console.log(value.innerHTML);
            }
        }


        //for movement of white pieces
        movePieces();
        piecesCss();
    })
});

function whitePawn(p, q, index) {
    let m = 0;
    for (let i = 48; i <= 55; i++) {
        if (i == index) m = 1;
    }
    if (m == 1) {
        for (let i = 5; i >= 4; i--) {
            if (box[arr[i][q]].innerHTML != "") break;
            box[arr[i][q]].style.border = "2px solid red";
        }
    }
    else {
        let x = p;
        x--;
        if (p != 0 && box[arr[x][q]].innerHTML == "") box[arr[x][q]].style.border = "2px solid red";
    }
    //killing case
    if (q > 0 && !checkOurPieces(p - 1, q - 1)) {
        box[arr[p - 1][q - 1]].style.border = "2px solid black";
    }
    if (q < 7 && !checkOurPieces(p - 1, q + 1)) {
        box[arr[p - 1][q + 1]].style.border = "2px solid black";
    }


    if(p==3 && countera==1){
        if(va==2 && box[arr[p-1][q-1]].innerHTML=="")  {
            box[arr[p - 1][q - 1]].style.border = "2px solid blue";
        }
        if(va==1 && box[arr[p-1][q+1]].innerHTML=="")  box[arr[p - 1][q + 1]].style.border = "2px solid blue";
        if(va==3 && q==(vya-1))  box[arr[p - 1][q + 1]].style.border = "2px solid blue";
        if(va==3 && q==(vya+1))   box[arr[p - 1][q - 1]].style.border = "2px solid blue";
    }

}


function whiteRook(p, q, index) {
    //for left iterate
    for (let j = q - 1; j >= 0; j--) {
        let itr = box[arr[p][j]];
        if (itr.innerHTML == "") itr.style.border = "2px solid red";
        else if (!checkOurPieces(p, j)) {
            itr.style.border = "2px solid black";
            break;
        }
        else break;
    }
    //for right iterate
    for (let j = q + 1; j < 8; j++) {
        let itr = box[arr[p][j]];
        if (itr.innerHTML == "") itr.style.border = "2px solid red";
        else if (!checkOurPieces(p, j)) {
            itr.style.border = "2px solid black";
            break;
        }
        else break;
    }
    //for top iterate
    for (let i = p - 1; i >= 0; i--) {
        let itr = box[arr[i][q]];
        if (itr.innerHTML == "") itr.style.border = "2px solid red";
        else if (!checkOurPieces(i, q)) {
            itr.style.border = "2px solid black";
            break;
        }
        else break;
    }
    //for bottom iterate
    for (let i = p + 1; i < 8; i++) {
        let itr = box[arr[i][q]];
        if (itr.innerHTML == "") itr.style.border = "2px solid red";
        else if (!checkOurPieces(i, q)) {
            itr.style.border = "2px solid black";
            break;
        }
        else break;
    }

}

function whiteBishop(p, q, index) {
    //for top left
    let i = p, j = q;
    i--; j--;
    while (i >= 0 && j >= 0) {
        let itr = box[arr[i][j]];
        if (itr.innerHTML == "") itr.style.border = "2px solid red";
        else if (!checkOurPieces(i, j)) {
            itr.style.border = "2px solid black";
            break;
        }
        else break;
        i--; j--;
    }
    //for bottom right
    let a = p, b = q;
    a++; b++;
    while (a < 8 && b < 8) {
        let itr = box[arr[a][b]];
        if (itr.innerHTML == "") itr.style.border = "2px solid red";
        else if (!checkOurPieces(a, b)) {
            itr.style.border = "2px solid black";
            break;
        }
        else break;
        a++; b++;
    }

    //for bottom left
    let c = p, d = q;
    c++; d--;
    while (c < 8 && d >= 0) {
        let itr = box[arr[c][d]];
        if (itr.innerHTML == "") itr.style.border = "2px solid red";
        else if (!checkOurPieces(c, d)) {
            itr.style.border = "2px solid black";
            break;
        }
        else break;
        c++; d--;
    }

    //for top right
    let e = p, f = q;
    e--; f++;
    while (e >= 0 && f < 8) {
        let itr = box[arr[e][f]];
        if (itr.innerHTML == "") itr.style.border = "2px solid red";
        else if (!checkOurPieces(e, f)) {
            itr.style.border = "2px solid black";
            break;
        }
        else break;
        e--; f++;
    }
}

function whiteKnight(p, q, index) {
    let n = p, m = q;
    let a1 = [n + 2, n + 2, n - 2, n - 2, n + 1, n - 1, n + 1, n - 1];
    let a2 = [m + 1, m - 1, m + 1, m - 1, m + 2, m + 2, m - 2, m - 2];
    let l = 0;
    while (l < a1.length) {
        if (a1[l] > 7 || a1[l] < 0 || a2[l] > 7 || a2[l] < 0) {
            l++;
            continue;
        }
        let itr = box[arr[a1[l]][a2[l]]];
        if (itr.innerHTML == "") itr.style.border = "2px solid red";
        else if (!checkOurPieces(a1[l], a2[l])) {
            itr.style.border = "2px solid black";
        }
        l++;
    }
    a1 = [];
    a2 = [];
}

function whiteQueen(p, q, index) {
    whiteBishop(p, q, index);
    whiteRook(p, q, index);
}

function whiteKing(p, q, index) {
    let a = p, b = q;
    let a1 = [a + 1, a - 1, a + 1, a - 1, a, a, a - 1, a + 1];
    let a2 = [b + 1, b - 1, b - 1, b + 1, b + 1, b - 1, b, b];
    let l = 0;
    while (l < a1.length) {
        if (a1[l] > 7 || a1[l] < 0 || a2[l] > 7 || a2[l] < 0) {
            l++;
            continue;
        }
        let itr = box[arr[a1[l]][a2[l]]];
        if (itr.innerHTML == "") itr.style.border = "2px solid red";
        else if (!checkOurPieces(a1[l], a2[l])) {
            itr.style.border = "2px solid black";
        }
        l++;
    }
  //castle case algo for white
  if(p==7 && q==4 && box[56].innerHTML=="♖" || box[63].innerHTML=="♖"){
  if(box[57].innerHTML=="" && box[58].innerHTML=="" && box[59].innerHTML==""){
    box[58].style.border="4px solid orange";
  }
  if(box[61].innerHTML=="" && box[62].innerHTML==""){
    box[62].style.border="4px solid orange";
  }
  }

    a1 = [];
    a2 = [];
    
}

function removeBorder() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let b = box[arr[i][j]].style.border;
            if (b == "2px solid red" || b == "2px solid black" || b=="4px solid orange" || b == "2px solid blue") {
                box[arr[i][j]].style.border = "none"
            }
        }
    }
}


function blackPawn(p, q, index) {
    let m = 0;
    for (let i = 8; i <= 15; i++) {
        if (i == index) m = 1;
    }
    if (m == 1) {
        for (let i = 2; i <= 3; i++) {
            if (box[arr[i][q]].innerHTML != "") break;
            box[arr[i][q]].style.border = "2px solid red";
        }
    }
    else {
        let x = p;
        x++;
        if (box[arr[x][q]].innerHTML == "" && p != 7) box[arr[x][q]].style.border = "2px solid red";
    }
    //killing case
    if (q > 0 && !checkOpponentPieces(p + 1, q - 1) && p != 7) {
        box[arr[p + 1][q - 1]].style.border = "2px solid black";
    }
    if (q < 7 && !checkOpponentPieces(p + 1, q + 1) && p != 7) {
        box[arr[p + 1][q + 1]].style.border = "2px solid black";
    }
    if (p == 7) {
        box[arr[p][q]].style.border = "2px solid purple";
        changePawn();
    }

    if(p==4 && counterb==1){
        if(vb==2 && box[arr[p+1][q-1]].innerHTML=="")  {
            box[arr[p + 1][q - 1]].style.border = "2px solid blue";
        }
        if(vb==1 && box[arr[p+1][q+1]].innerHTML=="")  box[arr[p + 1][q + 1]].style.border = "2px solid blue";
        if(vb==3 && q==(vyb-1))  box[arr[p + 1][q + 1]].style.border = "2px solid blue";
        if(vb==3 && q==(vyb+1))   box[arr[p + 1][q - 1]].style.border = "2px solid blue";
    }
}


function blackRook(p, q, index) {
    //for left iterate
    for (let j = q - 1; j >= 0; j--) {
        let itr = box[arr[p][j]];
        if (itr.innerHTML == "") itr.style.border = "2px solid red";
        else if (!checkOpponentPieces(p, j)) {
            itr.style.border = "2px solid black";
            break;
        }
        else break;
    }
    //for right iterate
    for (let j = q + 1; j < 8; j++) {
        let itr = box[arr[p][j]];
        if (itr.innerHTML == "") itr.style.border = "2px solid red";
        else if (!checkOpponentPieces(p, j)) {
            itr.style.border = "2px solid black";
            break;
        }
        else break;
    }
    //for bottom iterate
    for (let i = p - 1; i >= 0; i--) {
        let itr = box[arr[i][q]];
        if (itr.innerHTML == "") itr.style.border = "2px solid red";
        else if (!checkOpponentPieces(i, q)) {
            itr.style.border = "2px solid black";
            break;
        }
        else break;
    }
    //for top iterate
    for (let i = p + 1; i <= 7; i++) {
        let itr = box[arr[i][q]];
        if (itr.innerHTML == "") itr.style.border = "2px solid red";
        else if (!checkOpponentPieces(i, q)) {
            itr.style.border = "2px solid black";
            break;
        }
        else break;
    }

}

function blackBishop(p, q, index) {
    //for top left
    let i = p, j = q;
    i--; j--;
    while (i >= 0 && j >= 0) {
        let itr = box[arr[i][j]];
        if (itr.innerHTML == "") itr.style.border = "2px solid red";
        else if (!checkOpponentPieces(i, j)) {
            itr.style.border = "2px solid black";
            break;
        }
        else break;
        i--; j--;
    }
    //for bottom right
    let a = p, b = q;
    a++; b++;
    while (a < 8 && b < 8) {
        let itr = box[arr[a][b]];
        if (itr.innerHTML == "") itr.style.border = "2px solid red";
        else if (!checkOpponentPieces(a, b)) {
            itr.style.border = "2px solid black";
            break;
        }
        else break;
        a++; b++;
    }

    //for bottom left
    let c = p, d = q;
    c++; d--;
    while (c < 8 && d >= 0) {
        let itr = box[arr[c][d]];
        if (itr.innerHTML == "") itr.style.border = "2px solid red";
        else if (!checkOpponentPieces(c, d)) {
            itr.style.border = "2px solid black";
            break;
        }
        else break;
        c++; d--;
    }

    //for top right
    let e = p, f = q;
    e--; f++;
    while (e >= 0 && f < 8) {
        let itr = box[arr[e][f]];
        if (itr.innerHTML == "") itr.style.border = "2px solid red";
        else if (!checkOpponentPieces(e, f)) {
            itr.style.border = "2px solid black";
            break;
        }
        else break;
        e--; f++;
    }
}

function blackKnight(p, q, index) {
    let n = p, m = q;
    let a1 = [n + 2, n + 2, n - 2, n - 2, n + 1, n - 1, n + 1, n - 1];
    let a2 = [m + 1, m - 1, m + 1, m - 1, m + 2, m + 2, m - 2, m - 2];
    let l = 0;
    while (l < a1.length) {
        if (a1[l] > 7 || a1[l] < 0 || a2[l] > 7 || a2[l] < 0) {
            l++;
            continue;
        }
        let itr = box[arr[a1[l]][a2[l]]];
        if (itr.innerHTML == "") itr.style.border = "2px solid red";
        else if (!checkOpponentPieces(a1[l], a2[l])) {
            itr.style.border = "2px solid black";
        }
        l++;
    }
    a1 = [];
    a2 = [];
}

function blackQueen(p, q, index) {
    blackBishop(p, q, index);
    blackRook(p, q, index);
}

function blackKing(p, q, index) {
    let a = p, b = q;
    let a1 = [a + 1, a - 1, a + 1, a - 1, a, a, a - 1, a + 1];
    let a2 = [b + 1, b - 1, b - 1, b + 1, b + 1, b - 1, b, b];
    let l = 0;
    while (l < a1.length) {
        if (a1[l] > 7 || a1[l] < 0 || a2[l] > 7 || a2[l] < 0) {
            l++;
            continue;
        }
        let itr = box[arr[a1[l]][a2[l]]];
        if (itr.innerHTML == "") itr.style.border = "2px solid red";
        else if (!checkOpponentPieces(a1[l], a2[l])) {
            itr.style.border = "2px solid black";
        }
        l++;
    }

     //castle case algo
  if(p==0 && q==4 && box[0].innerHTML=="♜" || box[7].innerHTML=="♜"){
    if(box[1].innerHTML=="" && box[2].innerHTML=="" && box[3].innerHTML==""){
      box[2].style.border="4px solid orange";
    }
    if(box[5].innerHTML=="" && box[6].innerHTML==""){
      box[6].style.border="4px solid orange";
    }
    }
    a1 = [];
    a2 = [];
}

// function removeBorder(){
//   for(let i=0;i<8;i++){
//     for(let j=0;j<8;j++){
//       let b=box[arr[i][j]].style.border;
//       if(b=="2px solid red" || b=="2px solid black"){
//         box[arr[i][j]].style.border="none"
//       }
//     }
//   }
// }
function checkKing(a) {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (box[arr[i][j]].innerHTML == a) return true;
        }
    }
    return false;
}


//add css for chess pieces
function piecesCss() {
    for (let i = 0; i < box.length; i++) {
        let pieceType = box[i].innerHTML;
        if (pieceType == "♙" || pieceType == "♗" || pieceType == "♖" || pieceType == "♘" || pieceType == "♕" || pieceType == "♔") {
            box[i].style.color = "white";
        }
        if (pieceType == "♟" || pieceType == "♝" || pieceType == "♜" || pieceType == "♞" || pieceType == "♛" || pieceType == "♚") {
            box[i].style.color = "black";
        }
    }
}
// console.log(box[0].style.color="white")
changePawn();
function changePawn() {
    let a;
    if (p == 0) a = "♖♘♕♗";
    else a = "♜♞♛♝";
    for (let i = 0; i < 4; i++) {
        replacePawn[i].innerHTML = a[i];
    }
    replacePawn.forEach(element => {
        element.addEventListener("click", () => {
            console.log(element);
            box[arr[p][q]].innerHTML = element.innerHTML;
            replacePawnBox.classList.add("dispNone");
        })
    });
}

//add slider 
let  passwordLength=10;
handleSlider();
function handleSlider(){
    inputSlider.value=passwordLength;
    lengthDisplay.innerText=passwordLength;
    const min=inputSlider.min;
    const max=inputSlider.max;
    inputSlider.style.backgroundSize = ((passwordLength-min)*100/(max-min))+ "% 100%"
    return passwordLength;
}
inputSlider.addEventListener("input",(e)=>{
    passwordLength=e.target.value;
    handleSlider(); 
     document.querySelector(".time").textContent = `${passwordLength}:00:000`;
});

//add js for stopwatch
let m = 0, s = 0, ms = 0;
let timer;
let miliseconds = 0;
let seconds = 0;
let minutes = 0;
let isRunning = false;

function start() {
    reset();
    if (!isRunning) {
        isRunning = true;
        timer = setInterval(updateTime, 10);
    }
}

function stop() {
    isRunning = false;
    clearInterval(timer);
}

function reset() {
    stop();
    miliseconds = 1000;
    seconds = 0;
    minutes = 10;
    hours = 0;
    document.querySelector(".time").textContent = '00:00:000';
}
let c=0;
let w_min=9,w_sec=59,w_msec=1000;   
let  b_min=9,b_sec=59,b_msec=1000;
let mw=1,mb=1;
function updateTime() {
    if(c==0){
        miliseconds=b_msec;
        seconds=b_sec;
        minutes=handleSlider()-mw;
        if(minutes==0 && seconds==0 && miliseconds==10){
            winner.innerHTML = "Time Over! Winner is White Pieces";
            stopwatch.style.pointerEvents = "none";
            box.forEach(div => {
                div.style.pointerEvents = "none";
            });
            time.innerHTML="♔ Win";
            return 0;
        }
    }
  if(c==1){
    miliseconds=w_msec;
    seconds=w_sec;
    minutes=handleSlider()-mb;
    if(minutes==0 && seconds==0 && miliseconds==10){
        winner.innerHTML = "Time Over! Winner is Black Pieces"; 
        stopwatch.style.pointerEvents = "none";
        box.forEach(div => {
            div.style.pointerEvents = "none";
        });
        time.innerHTML="♚ Win";
        return 0;
    }
  }
    miliseconds -= 10;
    if (miliseconds == 0) {
        miliseconds = 1000;
        seconds--;
    }
    if (seconds < 0) {
        seconds = 59;
        if(c==0) mw++;
        if(c==1) mb++;
    }
 
     

    document.querySelector(".time").textContent = formatTime(minutes, seconds, miliseconds);

  if(c==0){
    b_min=minutes;
    b_sec=seconds;
    b_msec=miliseconds;
  }
  if(c==1){
    w_min=minutes;
    w_sec=seconds;
    w_msec=miliseconds;
  }
}

function formatTime(minutes, seconds, miliseconds) {
    return (
        (minutes < 10 ? '0' : '') + minutes + ':' +
        (seconds < 10 ? '0' : '') + seconds + ':' +
        (miliseconds < 10 ? '00' : '') + miliseconds
    );
}
document.querySelector(".wTurn").addEventListener("click", () => {
    document.querySelector(".sliderDiv").style.display='none';
    c=1;
    start();
    historyBox(handleSlider()-b_min-1, 60-b_sec, 1000-b_msec);
});
document.querySelector(".bTurn").addEventListener("click", () => {
    document.querySelector(".sliderDiv").style.display='none';
    c=0;
    start();
    historyBox(handleSlider()-w_min-1,60 - w_sec, 1000-w_msec);
});

let listContainer = document.querySelector(".listContainer");

function history() {
    let hist = document.querySelector(".history");
    hist.classList.toggle("disp");
}
function historyBox(min, sec, mili) {
    //print the value of calculation in rigth screen
    let li = document.createElement("li");
    updatexy(p, q);
    console.log(box[arr[p][q]].innerHTML);
    li.innerHTML = `${box[arr[p][q]].innerHTML} : ${min} : ${sec} : ${mili}`;
    listContainer.appendChild(li);
}
function clrHistory() {
    let ul = document.querySelector(".listContainer");
    ul.innerHTML = "";
}
// console.log(miliseconds);
function updatexy(p, q) {
    p = p;
    q = q;
}

document.addEventListener('dblclick', function(e) {
    e.preventDefault(); // Prevent default double-click behavior
}, false);


