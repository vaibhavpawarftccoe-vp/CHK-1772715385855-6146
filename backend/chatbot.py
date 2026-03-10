"""
EduBot - Education Chatbot Response System
Comprehensive responses for educational institution queries
"""

import random

# Response database for education-related queries
RESPONSES = {
    "greetings": [
        "Hello! Welcome to our FREE education platform! ALL courses are 100% FREE. How can I help you today?",
        "Hi there! I'm EduBot. Great news - ALL our programs are completely FREE! What would you like to know?",
        "Welcome! We offer FREE education for everyone! No tuition fees at all. What can I do for you?",
        "Greetings! Explore our FREE educational opportunities - UG, PG, all courses at zero cost!"
    ],
    
    "admissions": {
        "general": [
            "Great news! All our courses are completely FREE! No tuition fees at all. Admissions for 2026-27 are now open!",
            "Welcome to our FREE education platform! All programs - UG, PG, and Diploma - are offered at zero cost.",
            "Admissions are open and 100% FREE! No hidden charges, no tuition fees. Quality education for everyone!"
        ],
        "process": [
            "Here's our simple FREE admission process:\n1. Fill online application form\n2. Upload required documents\n3. Attend counseling session\n4. Confirm your seat\n\nNo application fees!",
            "Apply for FREE:\n• Visit our admissions portal\n• Create an account\n• Complete the application\n• Submit before deadline\n• Zero fees guaranteed!"
        ],
        "eligibility": [
            "UG Programs: 10+2 with minimum 60% aggregate\nPG Programs: Bachelor's degree with 55% or above\nPhD: Master's degree in relevant field",
            "Eligibility varies by program:\n• Engineering: PCM in 12th (60%+)\n• Management: Any stream (55%+)\n• Arts/Science: Relevant subject background"
        ],
        "documents": [
            "Required documents:\n• 10th & 12th mark sheets\n• Graduation certificate (for PG)\n• ID proof (Aadhar/Passport)\n• Passport photos\n• Category certificate (if applicable)",
            "Please keep these ready:\n- Academic transcripts\n- Identity proof\n- Address proof\n- Recent photographs\n- Entrance exam scorecard"
        ],
        "deadline": [
            "Important dates:\n• Application opens: January 15, 2026\n• Early admission deadline: March 31, 2026\n• Regular deadline: June 30, 2026\n• Classes begin: August 1, 2026",
            "Don't miss these deadlines!\n- Last date to apply: June 30, 2026\n- Entrance exam: July 15, 2026\n- Results: July 25, 2026\n- Counseling: August 1-5, 2026"
        ]
    },
    
    "courses": {
        "general": [
            "We offer a wide range of programs:\n\nUG Programs:\n• B.Tech (CS, AI, DS, ECE, Mechanical)\n• BBA & B.Com\n• BA & B.Sc programs\n\nPG Programs:\n• M.Tech, MBA, M.Com\n• MA & M.Sc programs\n\nDoctoral Programs:\n• PhD in various disciplines",
            "Our popular courses include:\n- Computer Science & Engineering\n- Artificial Intelligence & ML\n- Data Science\n- Business Administration\n- Commerce & Economics"
        ],
        "engineering": [
            "Engineering Programs (4 years):\n• Computer Science & Engineering\n• AI & Machine Learning\n• Data Science\n• Electronics & Communication\n• Mechanical Engineering\n• Civil Engineering\n• Electrical Engineering",
            "B.Tech Specializations:\n- CSE with AI/ML\n- CSE with Data Science\n- CSE with Cyber Security\n- Electronics & VLSI\n- Robotics & Automation"
        ],
        "management": [
            "Management Programs:\n• BBA (3 years) - Marketing, Finance, HR\n• MBA (2 years) - Dual specialization\n• B.Com (Hons) - Accounting, Finance\n• M.Com - Advanced accounting",
            "Business & Management:\n- BBA with Digital Marketing\n- MBA in Business Analytics\n- Executive MBA for working professionals\n- International Business programs"
        ],
        "arts_science": [
            "Arts & Science Programs:\n• BA - Economics, Psychology, Sociology\n• B.Sc - Physics, Chemistry, Mathematics\n• B.Sc - Biotechnology, Microbiology\n• MA & M.Sc in various subjects",
            "Humanities & Sciences:\n- BA in English Literature\n- BA in Political Science\n- B.Sc in Environmental Science\n- Integrated M.Sc programs"
        ],
        "duration": [
            "Program durations:\n• UG Programs: 3-4 years\n• PG Programs: 2 years\n• Diploma: 1-2 years\n• Certificate courses: 6 months - 1 year",
            "Course durations vary:\n- B.Tech: 4 years\n- BBA/BCA/B.Com: 3 years\n- MBA/MCA/M.Tech: 2 years\n- PhD: 3-5 years"
        ]
    },
    
    "placements": {
        "general": [
            "Our placement record is excellent!\n• Highest package: ₹45 LPA\n• Average package: ₹8.5 LPA\n• 95% placement rate\n• 200+ recruiting companies",
            "Placement Highlights:\n- 500+ students placed last year\n- Top recruiters: Google, Microsoft, Amazon\n- Average CTC: ₹8.5 LPA\n- Internship opportunities with stipends"
        ],
        "companies": [
            "Our top recruiters include:\n• Tech: Google, Microsoft, Amazon, TCS, Infosys, Wipro\n• Consulting: Deloitte, KPMG, EY, PwC\n• Core: L&T, Tata Motors, Reliance\n• Startups: Flipkart, Swiggy, Zomato",
            "Companies that visit our campus:\n- Fortune 500 companies\n- Leading MNCs\n- Unicorn startups\n- Government PSUs\n- International firms"
        ],
        "support": [
            "Placement support we provide:\n• Resume building workshops\n• Mock interviews\n• Aptitude training\n• Technical skill development\n• Soft skills training\n• Industry connect programs",
            "We help you get job-ready:\n- Pre-placement training\n- GD & PI preparation\n- Industry certifications\n- Internship assistance\n- Career counseling"
        ],
        "internships": [
            "Internship opportunities:\n• Summer internships (2-3 months)\n• Winter internships (1 month)\n• Full-semester internships\n• Research internships\n• International internships",
            "Gain real-world experience:\n- Paid internships with stipends\n- Industry projects\n- Research opportunities\n- Startup internships\n- Global exchange programs"
        ]
    },
    
    "fees": {
        "general": [
            "ALL COURSES ARE 100% FREE!\n\n• B.Tech: FREE (₹0)\n• BBA/BCA: FREE (₹0)\n• MBA: FREE (₹0)\n• M.Tech: FREE (₹0)\n• All UG/PG programs: FREE\n\nNo tuition fees, no hidden charges!",
            "Education is completely FREE here!\n\n- Engineering: ₹0\n- Management: ₹0\n- Arts/Science: ₹0\n- Hostel: FREE for eligible students\n\nQuality education accessible to all!"
        ],
        "scholarships": [
            "Since education is already FREE, we provide additional support:\n• Free study materials & books\n• Free laptop for all students\n• Free hostel for merit students\n• Monthly stipend for research scholars\n• Free transportation",
            "Additional benefits with FREE education:\n- Free digital devices\n- Free internet access\n- Free meals in campus\n- Free career counseling\n- Free certification courses"
        ],
        "payment": [
            "No payment required! Everything is FREE:\n• Zero tuition fees\n• Zero admission fees\n• Zero examination fees\n• Zero laboratory fees\n\nEducation is a right, not a privilege!",
            "Payment? What's that? 😊\n\n- No fees to pay\n- No installments needed\n- No loans required\n- 100% FREE education\n- Apply now and start learning!"
        ]
    },
    
    "facilities": {
        "general": [
            "FREE Campus facilities include:\n• Modern AC classrooms\n• High-tech labs & workshops\n• Digital library (50,000+ books)\n• FREE Wi-Fi enabled campus\n• Sports complex\n• FREE Medical center",
            "World-class infrastructure - All FREE:\n- Smart classrooms with projectors\n- Computer labs with latest software\n- Research laboratories\n- Auditorium & seminar halls\n- FREE Cafeteria & food court"
        ],
        "hostel": [
            "FREE Hostel facilities:\n• Separate hostels for boys & girls\n• AC & non-AC rooms (FREE for eligible students)\n• FREE Wi-Fi connectivity\n• 24/7 security\n• FREE Mess with nutritious food\n• Gym & recreation room",
            "FREE Residential facilities:\n- Single/double/triple sharing\n- Attached bathrooms\n- FREE Laundry service\n- Common room with TV\n- Indoor games\n- Study rooms\n\nHostel is FREE for merit students!"
        ],
        "sports": [
            "Sports facilities:\n• Cricket & football ground\n• Basketball & tennis courts\n• Swimming pool\n• Indoor badminton\n• Gymnasium\n• Yoga center",
            "Stay fit with our sports amenities:\n- Professional coaches\n- Inter-college tournaments\n- Sports scholarships\n- Fitness center\n- Athletics track"
        ],
        "library": [
            "Library resources:\n• 50,000+ physical books\n• E-books & e-journals\n• Online databases (IEEE, Springer)\n• Digital reading room\n• Research support\n• Book bank facility",
            "Knowledge hub features:\n- 24/7 digital library access\n- Research assistance\n- Inter-library loan\n- Reading halls\n- Discussion rooms\n- Computer terminals"
        ]
    },
    
    "contact": {
        "general": [
            "Contact us:\n📞 Phone: 1234567890\n📧 Email: info@edubot.edu\n🌐 Website: www.edubot.edu\n📍 Address: Pandharpur Smart City",
            "Get in touch:\n- Phone: 1234567890\n- WhatsApp: +91-1234567890\n- Email: info@edubot.edu\n- Visit us: Mon-Sat, 9 AM - 5 PM\n- Location: Pandharpur Smart City"
        ],
        "location": [
            "Campus location:\nPandharpur Smart City\nMaharashtra, India\n\nLandmarks:\n• Near Vitthal Temple\n• Close to Chandrabhaga River\n• Well connected by road & rail",
            "How to reach us:\n- Nearest bus stop: Pandharpur Bus Stand\n- Railway: Pandharpur Railway Station\n- Road: Well connected to Solapur, Pune\n- Parking available on campus"
        ],
        "social": [
            "Follow us on social media:\n• Facebook: https://www.facebook.com/share/1XA9D2gf2u/\n• Instagram: https://www.instagram.com/prathmesh_ingale_5555\n• Twitter: www.twitter.com\n• LinkedIn: https://www.linkedin.com/in/shubham-howal-1192723a1",
            "Stay connected with EduBot:\n- Facebook: https://www.facebook.com/share/1XA9D2gf2u/\n- Instagram: @prathmesh_ingale_5555\n- Twitter: www.twitter.com\n- LinkedIn: Shubham Howal"
        ]
    },
    
    "faculty": [
        "Our distinguished faculty:\n• 200+ qualified professors\n• PhD holders from top universities\n• Industry experience\n• Research publications\n• International collaborations",
        "Learn from the best:\n- Experienced professors\n- Guest lecturers from industry\n- Research mentors\n- International faculty exchange\n- Visiting professors from IITs/IIMs"
    ],
    
    "research": [
        "Research opportunities:\n• Funded research projects\n• Industry collaborations\n• International partnerships\n• Innovation labs\n• Startup incubation center",
        "Innovation & Research:\n- Research centers of excellence\n- Patent filing support\n- Research scholarships\n- Conference travel grants\n- Publication incentives"
    ],
    
    "events": [
        "Campus events & activities:\n• Annual technical fest\n• Cultural festivals\n• Sports tournaments\n• Industry conclaves\n• Alumni meets\n• Workshops & seminars",
        "Student life:\n- 50+ student clubs\n- Annual cultural fest\n- Technical competitions\n- Entrepreneurship events\n- Community service programs"
    ],
    
    "transport": [
        "Transportation facilities:\n• College buses from major areas\n• City bus connectivity\n• Shuttle service from metro\n• Parking for two/four wheelers\n• Carpool assistance",
        "Commute options:\n- Bus routes covering city\n- Metro feeder service\n- Bicycle sharing\n- EV charging stations\n- Safe drop for girls"
    ],
    
    "default": [
        "I'm not sure I understood that correctly. Remember - ALL our courses are 100% FREE! You can ask me about:\n• FREE Admissions & eligibility\n• FREE Courses & programs\n• Placements & internships\n• FREE Facilities & hostel\n• Contact information",
        "I can help you with information about our FREE education:\n- FREE Admission process\n- FREE Courses (UG & PG)\n- Placement records\n- FREE Hostel & facilities\nTry asking about any of these!",
        "Sorry, I didn't catch that. Just remember - Education here is completely FREE! No fees at all. Ask me about admissions, courses, or facilities. How can I assist you?"
    ]
}


def get_response(message):  # sourcery skip: low-code-quality
    """
    This Python function takes a message as input and does not return any output.
    
    :param message: A message that is passed as an argument to the function
    """
    """
    Generate appropriate response based on user message
    """
    message = message.lower().strip()
    
    # Greetings
    if any(word in message for word in ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening']):
        return random.choice(RESPONSES["greetings"])
    
    # Admissions
    if any(word in message for word in ['admission', 'admissions', 'apply', 'application', 'enroll', 'enrollment']):
        if any(word in message for word in ['process', 'how', 'procedure', 'steps']):
            return random.choice(RESPONSES["admissions"]["process"])
        elif any(word in message for word in ['eligible', 'eligibility', 'requirement', 'criteria', 'qualification']):
            return random.choice(RESPONSES["admissions"]["eligibility"])
        elif any(word in message for word in ['document', 'documents', 'paper', 'papers', 'certificate']):
            return random.choice(RESPONSES["admissions"]["documents"])
        elif any(word in message for word in ['deadline', 'last date', 'date', 'when', 'schedule', 'timeline']):
            return random.choice(RESPONSES["admissions"]["deadline"])
        else:
            return random.choice(RESPONSES["admissions"]["general"])
    
    # Courses
    if any(word in message for word in ['course', 'courses', 'program', 'programs', 'degree', 'degrees', 'branch', 'branches', 'specialization']):
        if any(word in message for word in ['engineering', 'b.tech', 'm.tech', 'cse', 'cs', 'computer', 'mechanical', 'civil', 'electrical', 'ece']):
            return random.choice(RESPONSES["courses"]["engineering"])
        elif any(word in message for word in ['management', 'mba', 'bba', 'business', 'commerce', 'b.com', 'm.com']):
            return random.choice(RESPONSES["courses"]["management"])
        elif any(word in message for word in ['arts', 'science', 'ba', 'b.sc', 'ma', 'm.sc', 'humanities']):
            return random.choice(RESPONSES["courses"]["arts_science"])
        elif any(word in message for word in ['duration', 'year', 'years', 'semester', 'long']):
            return random.choice(RESPONSES["courses"]["duration"])
        else:
            return random.choice(RESPONSES["courses"]["general"])
    
    # Placements
    if any(word in message for word in ['placement', 'placements', 'job', 'jobs', 'career', 'recruit', 'recruitment', 'package', 'salary', 'ctc']):
        if any(word in message for word in ['company', 'companies', 'recruiter', 'mnc', 'firm', 'organization']):
            return random.choice(RESPONSES["placements"]["companies"])
        elif any(word in message for word in ['support', 'training', 'help', 'prepare', 'assistance']):
            return random.choice(RESPONSES["placements"]["support"])
        elif any(word in message for word in ['internship', 'internships', 'training', 'experience']):
            return random.choice(RESPONSES["placements"]["internships"])
        else:
            return random.choice(RESPONSES["placements"]["general"])
    
    # Fees
    if any(word in message for word in ['fee', 'fees', 'cost', 'price', 'tuition', 'payment', 'pay', 'expensive', 'affordable']):
        if any(word in message for word in ['scholarship', 'scholarships', 'financial aid', 'discount', 'waiver', 'concession', 'free', 'merit']):
            return random.choice(RESPONSES["fees"]["scholarships"])
        elif any(word in message for word in ['payment', 'pay', 'installment', 'mode', 'online', 'bank']):
            return random.choice(RESPONSES["fees"]["payment"])
        else:
            return random.choice(RESPONSES["fees"]["general"])
    
    # Facilities
    if any(word in message for word in ['facility', 'facilities', 'infrastructure', 'campus', 'amenities', 'accommodation']):
        if any(word in message for word in ['hostel', 'hostels', 'room', 'rooms', 'stay', 'accommodation', 'residential', 'dormitory']):
            return random.choice(RESPONSES["facilities"]["hostel"])
        elif any(word in message for word in ['sport', 'sports', 'game', 'games', 'gym', 'fitness', 'playground', 'ground']):
            return random.choice(RESPONSES["facilities"]["sports"])
        elif any(word in message for word in ['library', 'book', 'books', 'reading', 'study material']):
            return random.choice(RESPONSES["facilities"]["library"])
        else:
            return random.choice(RESPONSES["facilities"]["general"])
    
    # Contact
    if any(word in message for word in ['contact', 'phone', 'email', 'call', 'reach', 'address', 'location', 'where', 'visit']):
        if any(word in message for word in ['address', 'location', 'where', 'place', 'reach', 'direction']):
            return random.choice(RESPONSES["contact"]["location"])
        elif any(word in message for word in ['social', 'facebook', 'instagram', 'twitter', 'linkedin', 'follow']):
            return random.choice(RESPONSES["contact"]["social"])
        else:
            return random.choice(RESPONSES["contact"]["general"])
    
    # Faculty
    if any(word in message for word in ['faculty', 'professor', 'teacher', 'staff', 'lecturer', 'mentor']):
        return random.choice(RESPONSES["faculty"])
    
    # Research
    if any(word in message for word in ['research', 'phd', 'doctorate', 'innovation', 'project', 'publication', 'paper']):
        return random.choice(RESPONSES["research"])
    
    # Events
    if any(word in message for word in ['event', 'events', 'fest', 'festival', 'activity', 'club', 'extracurricular', 'cultural', 'sports']):
        return random.choice(RESPONSES["events"])
    
    # Transport
    if any(word in message for word in ['transport', 'bus', 'travel', 'commute', 'transportation', 'shuttle', 'metro']):
        return random.choice(RESPONSES["transport"])
    
    # Thank you / Goodbye
    if any(word in message for word in ['thank', 'thanks', 'bye', 'goodbye', 'see you', 'ok', 'okay', 'great']):
        return "You're welcome! Feel free to ask if you have more questions. Have a great day!"
    
    # Default response
    return random.choice(RESPONSES["default"])
