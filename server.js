const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/chat",(req,res)=>{

let msg = req.body.message.toLowerCase();

let reply="Sorry I don't understand.";

if(msg.includes("admission"))
reply="Admissions open in July.";

if(msg.includes("course"))
reply="We offer Engineering, Pharmacy and BCA courses.";

if(msg.includes("hello"))
reply="Hello! How can I help you today?";

res.json({reply});

});

app.listen(3000,()=>{
console.log("Server running on port 3000");
});