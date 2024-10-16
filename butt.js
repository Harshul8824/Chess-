let butt=document.querySelector(".checkBox");
let stopWatchBox=document.querySelector(".setTime");    
let buttCounter=0;
butt.addEventListener("click",()=>{
    buttCounter=buttCounter==0? 1:0;
    if(buttCounter==1){
        stopWatchBox.classList.add('dispNone');
    }
    else{
        stopWatchBox.classList.remove('dispNone');
    }
    console.log("whatup");
});