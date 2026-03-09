export default function Features(){

const features=[
{
title:"24/7 Student Support",
desc:"Instant answers to student questions"
},
{
title:"Admissions Automation",
desc:"Guide students through admission process"
},
{
title:"Course Recommendations",
desc:"Suggest best courses automatically"
}
]

return(

<section className="py-20 bg-gray-100">

<h2 className="text-3xl font-bold text-center mb-12">
Powerful Features
</h2>

<div className="grid md:grid-cols-3 gap-8 px-10">

{features.map((f,i)=>(
<div key={i} className="bg-white p-8 rounded-xl shadow">

<h3 className="text-xl font-bold mb-3">
{f.title}
</h3>

<p className="text-gray-600">
{f.desc}
</p>

</div>
))}

</div>

</section>

)

}