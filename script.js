async function sendMessage(){

let input = document.getElementById("input");
let message = input.value;

let messages = document.getElementById("messages");

messages.innerHTML += "<p><b>You:</b> "+message+"</p>";

let response = await fetch("http://localhost:3000/chat",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({message})
});

let data = await response.json();

messages.innerHTML += "<p><b>Bot:</b> "+data.reply+"</p>";

input.value="";
}