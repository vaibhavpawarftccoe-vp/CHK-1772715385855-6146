import { motion } from "framer-motion";

export default function Hero(){

return(

<section className="text-center py-28 bg-gradient-to-r from-blue-500 to-purple-600 text-white">

<motion.h1
initial={{opacity:0,y:50}}
animate={{opacity:1,y:0}}
className="text-5xl font-bold mb-6"
>

AI Chatbot for Education

</motion.h1>

<p className="text-lg mb-8">
Automate student support and admissions with AI
</p>

<button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold">
Start Free Trial
</button>

</section>

)
}