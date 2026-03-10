
from flask import Flask, render_template, request, jsonify, session, send_file
from chatbot import get_response
import json
import os
import random
from datetime import datetime, timedelta
from contextlib import suppress
from werkzeug.utils import secure_filename

# Get the backend directory path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, 
            template_folder=os.path.join(BASE_DIR, '..', 'frontend', 'templates'),
            static_folder=os.path.join(BASE_DIR, '..', 'frontend', 'static'))
app.secret_key = "edubot_secret_key_2026"

# File upload configuration
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
ALLOWED_EXTENSIONS = {"pdf", "doc", "docx", "ppt", "pptx", "zip", "rar", "7z", "py", "java", "cpp", "c", "html", "css", "js", "txt", "jpg", "jpeg", "png", "gif"}
MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB max file size

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

# Create uploads directory if not exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Student database file
STUDENTS_FILE = os.path.join(BASE_DIR, "students.json")

# Parent database file
PARENTS_FILE = os.path.join(BASE_DIR, "parents.json")

# Initialize students database
def init_students_db():
    if not os.path.exists(STUDENTS_FILE):
        with open(STUDENTS_FILE, "w") as f:
            json.dump({}, f)

# Initialize parents database
def init_parents_db():
    if not os.path.exists(PARENTS_FILE):
        # Create default parent accounts
        default_parents = {
            "parent1@edubot.edu": {
                "name": "Mr. Rajesh Sharma",
                "email": "parent1@edubot.edu",
                "password": "parent123",
                "parent_id": "PRT20260001",
                "child_name": "Rahul Sharma",
                "child_id": "STU20260001",
                "phone": "+91 9876543210",
                "relationship": "Father"
            },
            "parent2@edubot.edu": {
                "name": "Mrs. Priya Patel",
                "email": "parent2@edubot.edu",
                "password": "parent123",
                "parent_id": "PRT20260002",
                "child_name": "Neha Patel",
                "child_id": "STU20260002",
                "phone": "+91 9876543211",
                "relationship": "Mother"
            },
            "parent3@edubot.edu": {
                "name": "Mr. Amit Kumar",
                "email": "parent3@edubot.edu",
                "password": "parent123",
                "parent_id": "PRT20260003",
                "child_name": "Vikram Kumar",
                "child_id": "STU20260003",
                "phone": "+91 9876543212",
                "relationship": "Father"
            }
        }
        with open(PARENTS_FILE, "w") as f:
            json.dump(default_parents, f, indent=2)

# Load students data
def load_students():
    init_students_db()
    with open(STUDENTS_FILE, "r") as f:
        return json.load(f)

# Save students data
def save_students(students):
    with open(STUDENTS_FILE, "w") as f:
        json.dump(students, f, indent=2)

# Load parents data
def load_parents():
    init_parents_db()
    with open(PARENTS_FILE, "r") as f:
        return json.load(f)

# Save parents data
def save_parents(parents):
    with open(PARENTS_FILE, "w") as f:
        json.dump(parents, f, indent=2)

# Load teachers data
def load_teachers():
    init_teachers_db()
    with open(TEACHERS_FILE, "r") as f:
        return json.load(f)

# Save teachers data
def save_teachers(teachers):
    with open(TEACHERS_FILE, "w") as f:
        json.dump(teachers, f, indent=2)

# Generate unique student ID
def generate_student_id():
    students = load_students()
    year = datetime.now().year

    # Find the highest existing ID number
    max_num = 0
    for student_id in students.keys():
        if student_id.startswith(f"EDU{year}"):
            with suppress(Exception):
                num = int(student_id[-6:])
                max_num = max(max_num, num)

    # Generate new ID
    new_num = max_num + 1
    return f"EDU{year}{new_num:06d}"


# Get department based on course
def get_department(course):
    departments = {
        "btech-cse": "Computer Science & Engineering",
        "btech-ai": "Computer Science & Engineering",
        "btech-ds": "Computer Science & Engineering",
        "bba": "Management Studies",
        "bca": "Computer Applications",
        "bcom": "Commerce",
        "mba": "Management Studies",
        "mtech": "Computer Science & Engineering",
        "ba": "Arts",
        "bsc": "Science"
    }
    return departments.get(course, "General")


# Get program name based on course
def get_program(course):
    programs = {
        "btech-cse": "Bachelor of Technology",
        "btech-ai": "Bachelor of Technology",
        "btech-ds": "Bachelor of Technology",
        "bba": "Bachelor of Business Administration",
        "bca": "Bachelor of Computer Applications",
        "bcom": "Bachelor of Commerce",
        "mba": "Master of Business Administration",
        "mtech": "Master of Technology",
        "ba": "Bachelor of Arts",
        "bsc": "Bachelor of Science"
    }
    return programs.get(course, "Undergraduate Program")


# Generate roll number
def generate_roll_number(student_id):
    year = datetime.now().year % 100
    # Extract last 4 digits from student ID
    unique_num = student_id[-4:]
    return f"{year}{unique_num}"

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/login")
def login_page():
    return render_template("login.html")

@app.route("/parent-login")
def parent_login_page():
    return render_template("parent_login.html")

@app.route("/parent-dashboard")
def parent_dashboard():
    return render_template("parent_dashboard.html")

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json["message"]
    reply = get_response(user_message)
    return jsonify({"reply": reply})


# API: Voice Assistant Chat - Enhanced Professional Responses
@app.route("/api/voice/chat", methods=["POST"])
def voice_chat():
    """
    Voice Assistant endpoint with enhanced professional responses.
    Provides structured, speech-optimized answers for voice interaction.
    """
    data = request.json
    user_message = data.get("message", "")
    voice_context = data.get("context", {})  # Optional conversation context
    
    # Get base response from chatbot
    base_response = get_response(user_message)
    
    # Enhance response for voice (make it more conversational)
    enhanced_response = enhance_voice_response(base_response, user_message)
    
    return jsonify({
        "reply": enhanced_response,
        "voice_optimized": True,
        "timestamp": datetime.now().isoformat()
    })


def enhance_voice_response(base_response, user_message):
    """
    Enhance chatbot response for voice output:
    - Add conversational openings/closings
    - Structure for better speech flow
    - Add voice-specific cues
    """
    import re
    
    # Remove markdown formatting that's hard to speak
    clean_response = base_response
    
    # Replace markdown headers with spoken equivalents
    clean_response = re.sub(r'\*\*(.+?)\*\*', r'\1', clean_response)  # Remove bold
    clean_response = re.sub(r'\*(.+?)\*', r'\1', clean_response)  # Remove italic
    clean_response = re.sub(r'`{3}[\w]*\n?', '', clean_response)  # Remove code block markers
    clean_response = re.sub(r'`(.+?)`', r'\1', clean_response)  # Remove inline code
    
    # Replace symbols with spoken words
    clean_response = clean_response.replace('•', 'First,').replace('→', 'leads to')
    clean_response = clean_response.replace('|', ',').replace('---', '')
    
    # Add conversational opening based on query type
    user_lower = user_message.lower()
    
    if any(word in user_lower for word in ['teach', 'learn', 'explain', 'what is']):
        opening = "I'd be happy to help you with that! "
    elif any(word in user_lower for word in ['how to', 'how do', 'steps']):
        opening = "Here's how you can do that: "
    elif any(word in user_lower for word in ['compare', 'difference', 'vs']):
        opening = "Let me explain the differences: "
    elif any(word in user_lower for word in ['error', 'bug', 'fix', 'problem']):
        opening = "I can help you solve this issue. "
    else:
        opening = "Great question! "
    
    # Add helpful closing
    closings = [
        " Does that help? Feel free to ask if you need more details!",
        " I hope that clarifies things for you!",
        " Let me know if you'd like me to explain any part in more detail!",
        " Would you like me to show you a code example or go deeper into any topic?"
    ]
    closing = random.choice(closings)
    
    # Combine with the base response
    enhanced = opening + clean_response + closing
    
    return enhanced

# API: Student Registration
@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    students = load_students()
    
    # Check if email already exists
    for student_id, student in students.items():
        if student.get("email") == data["email"]:
            return jsonify({
                "success": False,
                "message": "Email already registered. Please login."
            })
    
    # Generate unique student ID
    student_id = generate_student_id()
    
    # Create student record with academic data structure
    students[student_id] = {
        "studentId": student_id,
        "firstName": data["firstName"],
        "lastName": data["lastName"],
        "email": data["email"],
        "phone": data["phone"],
        "course": data["course"],
        "password": data["password"],  # In production, hash this!
        "createdAt": datetime.now().isoformat(),
        "status": "active",
        
        # Academic Information
        "academic": {
            "enrollmentYear": datetime.now().year,
            "currentSemester": 1,
            "department": get_department(data["course"]),
            "program": get_program(data["course"]),
            "rollNumber": generate_roll_number(student_id),
            "batch": f"{datetime.now().year}-{datetime.now().year + 4}"
        },
        
        # Courses Data
        "courses": {
            "enrolled": [],
            "completed": [],
            "current": []
        },
        
        # Grades & Performance
        "grades": {
            "semesterWise": {},
            "cgpa": 0.0,
            "sgpa": {},
            "totalCredits": 0,
            "earnedCredits": 0,
            "creditPoints": {},
            "totalCreditPoints": 0
        },
        
        # Student Level & Progress
        "level": {
            "current": 1,
            "title": "Freshman",
            "progress": 0,
            "pointsToNext": 100
        },
        
        # Assignments
        "assignments": {
            "pending": [],
            "submitted": [],
            "graded": []
        },
        
        # Attendance
        "attendance": {
            "overall": 0,
            "subjectWise": {},
            "monthly": {}
        },
        
        # Exams & Results
        "exams": {
            "internal": {},
            "external": {},
            "practical": {}
        },
        
        # Achievements & Certificates
        "achievements": [],
        "certifications": [],
        
        # Subscription & Billing
        "subscription": {
            "status": "trial",  # trial, active, expired, cancelled
            "plan": "free_trial",
            "trialStartDate": datetime.now().isoformat(),
            "trialEndDate": (datetime.now() + timedelta(days=30)).isoformat(),
            "subscriptionStartDate": None,
            "subscriptionEndDate": None,
            "daysLeft": 30,
            "autoRenew": False,
            "paymentHistory": []
        },
        
        # Subscription Plans Available
        "availablePlans": {
            "monthly": {
                "name": "Monthly Plan",
                "price": 299,
                "duration": "1 Month",
                "features": ["Full Access", "All Courses", "Download Lectures", "Quiz Access", "Certificate Unlock"]
            },
            "quarterly": {
                "name": "Quarterly Plan",
                "price": 799,
                "duration": "3 Months",
                "features": ["Full Access", "All Courses", "Download Lectures", "Quiz Access", "Certificate Unlock", "Priority Support"],
                "savings": "11%"
            },
            "yearly": {
                "name": "Yearly Plan",
                "price": 2499,
                "duration": "1 Year",
                "features": ["Full Access", "All Courses", "Download Lectures", "Quiz Access", "Certificate Unlock", "Priority Support", "Personal Mentor"],
                "savings": "30%"
            }
        },
        
        # Library Records
        "library": {
            "booksIssued": [],
            "booksReturned": [],
            "fines": 0
        },
        
        # Hostel Information
        "hostel": {
            "allotted": False,
            "roomNumber": None,
            "block": None,
            "mess": None
        },
        
        # Activity Log
        "activityLog": [
            {
                "action": "Account Created",
                "timestamp": datetime.now().isoformat(),
                "details": "Student registered successfully"
            }
        ],
        
        # Profile Settings
        "profile": {
            "avatar": None,
            "bio": "",
            "interests": [],
            "skills": [],
            "languages": ["English"],
            "socialLinks": {}
        },
        
        # Lecture Store Data
        "lectures": [],
        "downloadedLectures": [],
        "completedLectures": [],
        "lectureProgress": {},
        
        # Notifications
        "notifications": [
            {
                "id": "notif_001",
                "title": "Welcome to EduBot!",
                "message": "Your 30-day free trial has started. Explore all features!",
                "type": "info",
                "timestamp": datetime.now().isoformat(),
                "read": False
            },
            {
                "id": "notif_002",
                "title": "Complete Your Profile",
                "message": "Add your interests and skills to get personalized recommendations.",
                "type": "reminder",
                "timestamp": datetime.now().isoformat(),
                "read": False
            },
            {
                "id": "notif_003",
                "title": "New Quiz Available",
                "message": "Weekly quiz on Data Structures is now live. Test your knowledge!",
                "type": "quiz",
                "timestamp": datetime.now().isoformat(),
                "read": False
            }
        ]
    }
    
    save_students(students)
    
    return jsonify({
        "success": True,
        "studentId": student_id,
        "message": "Registration successful!"
    })

# API: Student Login
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    students = load_students()
    
    # Find student by email
    for student_id, student in students.items():
        if student.get("email") == data["email"]:
            if student.get("password") == data["password"]:
                # Store in session
                session["student_id"] = student_id
                session["student_email"] = student["email"]
                
                return jsonify({
                    "success": True,
                    "studentId": student_id,
                    "name": f"{student['firstName']} {student['lastName']}",
                    "email": student["email"],
                    "message": "Login successful!"
                })
            else:
                return jsonify({
                    "success": False,
                    "message": "Invalid password. Please try again."
                })
    
    return jsonify({
        "success": False,
        "message": "Email not found. Please register first."
    })

# API: Logout
@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True})

# API: Parent Registration
@app.route("/api/parent/register", methods=["POST"])
def parent_register():
    data = request.json
    parents = load_parents()
    students = load_students()
    
    # Check if email already exists
    if data["email"] in parents:
        return jsonify({
            "success": False,
            "message": "Email already registered. Please login instead."
        })
    
    # Check if student ID exists
    student_id = data["studentId"]
    if student_id not in students:
        return jsonify({
            "success": False,
            "message": "Student ID not found. Please check the ID with your child."
        })
    
    # Generate unique parent ID
    parent_count = len(parents)
    parent_id = f"PRT{20260000 + parent_count + 1}"
    
    # Get student info
    student = students[student_id]
    
    # Create new parent account
    new_parent = {
        "name": f"{data['firstName']} {data['lastName']}",
        "email": data["email"],
        "password": data["password"],
        "parent_id": parent_id,
        "child_name": student.get("name", "Unknown"),
        "child_id": student_id,
        "phone": data["phone"],
        "relationship": "Parent",
        "first_name": data["firstName"],
        "last_name": data["lastName"],
        "registered_at": datetime.now().isoformat()
    }
    
    # Save parent
    parents[data["email"]] = new_parent
    save_parents(parents)
    
    return jsonify({
        "success": True,
        "message": "Parent registration successful!",
        "parentId": parent_id,
        "childName": student.get("name", "Unknown")
    })

# API: Parent Login
@app.route("/api/parent/login", methods=["POST"])
def parent_login():
    data = request.json
    parents = load_parents()
    
    # Find parent by email
    if data["email"] in parents:
        parent = parents[data["email"]]
        if parent.get("password") == data["password"]:
            # Store in session
            session["parent_email"] = data["email"]
            session["user_type"] = "parent"
            
            return jsonify({
                "success": True,
                "parentId": parent["parent_id"],
                "name": parent["name"],
                "email": parent["email"],
                "childName": parent["child_name"],
                "childId": parent["child_id"],
                "message": "Login successful!"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Invalid password. Please try again."
            })
    
    return jsonify({
        "success": False,
        "message": "Email not found. Please contact admin."
    })

# API: Get Parent Info
@app.route("/api/parent/info", methods=["GET"])
def get_parent_info():
    if "parent_email" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    parents = load_parents()
    parent_email = session["parent_email"]
    
    if parent_email in parents:
        parent = parents[parent_email]
        # Return parent data without password
        parent_data = {k: v for k, v in parent.items() if k != "password"}
        return jsonify({
            "success": True,
            "parent": parent_data
        })
    
    return jsonify({"success": False, "message": "Parent not found"})

# API: Update Parent Profile
@app.route("/api/parent/update-profile", methods=["POST"])
def update_parent_profile():
    """Update parent profile information and photo"""
    if "parent_email" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    parents = load_parents()
    parent_email = session["parent_email"]
    
    if parent_email not in parents:
        return jsonify({"success": False, "message": "Parent not found"})
    
    parent = parents[parent_email]
    
    # Update text fields
    if "firstName" in request.form:
        parent["first_name"] = request.form["firstName"]
    if "lastName" in request.form:
        parent["last_name"] = request.form["lastName"]
    if "firstName" in request.form and "lastName" in request.form:
        parent["name"] = f"{request.form['firstName']} {request.form['lastName']}"
    if "phone" in request.form:
        parent["phone"] = request.form["phone"]
    
    # Handle profile photo upload
    if "profilePhoto" in request.files:
        photo = request.files["profilePhoto"]
        if photo.filename:
            # Validate file type
            allowed_extensions = {"jpg", "jpeg", "png", "gif"}
            file_ext = photo.filename.rsplit(".", 1)[1].lower() if "." in photo.filename else ""
            
            if file_ext not in allowed_extensions:
                return jsonify({"success": False, "message": "Invalid file type. Use JPG, PNG, or GIF."})
            
            # Create uploads directory for profile photos
            profile_uploads = os.path.join(UPLOAD_FOLDER, "profiles")
            os.makedirs(profile_uploads, exist_ok=True)
            
            # Save file with parent ID as filename
            parent_id = parent.get("parent_id", "parent").replace(" ", "_")
            filename = f"{parent_id}.{file_ext}"
            filepath = os.path.join(profile_uploads, filename)
            photo.save(filepath)
            
            # Store relative path in parent record
            parent["profilePhoto"] = f"/uploads/profiles/{filename}"
    
    # Save updated parent data
    save_parents(parents)
    
    return jsonify({
        "success": True,
        "message": "Profile updated successfully",
        "parent": {
            "name": parent.get("name", ""),
            "email": parent.get("email", ""),
            "phone": parent.get("phone", ""),
            "profilePhoto": parent.get("profilePhoto", None)
        }
    })

# API: Get Child's Live Progress (Parent only)
@app.route("/api/parent/child-progress", methods=["GET"])
def get_child_progress():
    """Get real-time progress of parent's child using student ID"""
    if "parent_email" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    parents = load_parents()
    parent_email = session["parent_email"]
    
    if parent_email not in parents:
        return jsonify({"success": False, "message": "Parent not found"})
    
    parent = parents[parent_email]
    child_id = parent.get("child_id")
    
    if not child_id:
        return jsonify({"success": False, "message": "No child linked to this account"})
    
    students = load_students()
    
    if child_id not in students:
        return jsonify({"success": False, "message": "Student not found"})
    
    student = students[child_id]
    
    # Calculate live metrics
    progress_data = {
        "success": True,
        "child": {
            "studentId": child_id,
            "name": f"{student.get('firstName', '')} {student.get('lastName', '')}",
            "email": student.get("email", ""),
            "course": student.get("course", "Computer Science"),
            "rollNumber": student.get("rollNumber", ""),
        },
        "liveMetrics": {
            "overallProgress": calculate_overall_progress(student),
            "activeCourses": len(student.get("enrolledCourses", [])),
            "pendingAssignments": count_pending_assignments(student),
            "currentRank": student.get("rank", "--"),
            "attendancePercentage": calculate_attendance_percentage(student),
            "lastActive": student.get("lastActive", "Just now"),
            "studyStreak": calculate_study_streak(student.get("activityLog", [])),
        },
        "recentActivity": generate_recent_activity(student),
        "grades": student.get("grades", {}),
        "attendance": student.get("attendance", {}),
        "timestamp": datetime.now().isoformat()
    }
    
    return jsonify(progress_data)


def calculate_overall_progress(student):
    """Calculate student's overall progress percentage"""
    # Get all enrolled courses progress
    courses = student.get("enrolledCourses", [])
    if not courses:
        return 0
    
    total_progress = sum(course.get("progress", 0) for course in courses)
    return round(total_progress / len(courses), 1)


def count_pending_assignments(student):
    """Count pending assignments"""
    assignments = student.get("assignments", [])
    return sum(1 for a in assignments if a.get("status") == "pending")


def calculate_attendance_percentage(student):
    """Calculate attendance percentage"""
    attendance = student.get("attendance", {})
    if not attendance:
        return 100
    
    total_days = len(attendance)
    present_days = sum(1 for a in attendance.values() if a.get("status") == "present")
    
    return round((present_days / total_days) * 100, 1) if total_days > 0 else 100


def generate_recent_activity(student):
    """Generate recent activity feed"""
    activities = []
    
    # Get from activity log
    activity_log = student.get("activityLog", [])
    
    for activity in activity_log[-5:]:  # Last 5 activities
        activities.append({
            "type": activity.get("type", "general"),
            "description": activity.get("description", ""),
            "timestamp": activity.get("timestamp", ""),
            "icon": get_activity_icon(activity.get("type", "general"))
        })
    
    return activities


def get_activity_icon(activity_type):
    """Get Font Awesome icon for activity type"""
    icons = {
        "lesson": "fa-play",
        "assignment": "fa-tasks",
        "quiz": "fa-question-circle",
        "login": "fa-sign-in-alt",
        "achievement": "fa-trophy",
        "general": "fa-circle"
    }
    return icons.get(activity_type, "fa-circle")


# API: Get All Students (for teacher attendance management)
@app.route("/api/teacher/students", methods=["GET"])
def get_all_students():
    if "teacher_email" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    students = load_students()
    # Return simplified student list
    student_list = []
    for student_id, student in students.items():
        student_list.append({
            "studentId": student_id,
            "name": f"{student.get('firstName', '')} {student.get('lastName', '')}",
            "email": student.get("email", ""),
            "course": student.get("course", ""),
            "rollNumber": student.get("rollNumber", ""),
            "attendance": student.get("attendance", {})
        })
    
    return jsonify({
        "success": True,
        "students": student_list
    })

# API: Update Student Attendance (Teacher only)
@app.route("/api/teacher/attendance/update", methods=["POST"])
def update_student_attendance():
    if "teacher_email" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    data = request.json
    student_id = data.get("studentId")
    date = data.get("date")
    status = data.get("status")  # "present" or "absent"
    subject = data.get("subject", "General")
    
    if not all([student_id, date, status]):
        return jsonify({"success": False, "message": "Missing required fields"})
    
    students = load_students()
    
    if student_id not in students:
        return jsonify({"success": False, "message": "Student not found"})
    
    # Initialize attendance if not exists
    if "attendance" not in students[student_id]:
        students[student_id]["attendance"] = {}
    
    # Update attendance for the date
    students[student_id]["attendance"][date] = {
        "status": status,
        "subject": subject,
        "marked_by": session["teacher_email"],
        "marked_at": datetime.now().isoformat()
    }
    
    # Update weekly stats
    update_attendance_stats(students[student_id])
    
    save_students(students)
    
    return jsonify({
        "success": True,
        "message": f"Attendance marked as {status} for {students[student_id]['firstName']}"
    })

# API: Bulk Update Attendance (Teacher only)
@app.route("/api/teacher/attendance/bulk-update", methods=["POST"])
def bulk_update_attendance():
    if "teacher_email" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    data = request.json
    date = data.get("date")
    subject = data.get("subject", "General")
    attendance_list = data.get("attendance", [])  # List of {studentId, status}
    
    if not date or not attendance_list:
        return jsonify({"success": False, "message": "Missing required fields"})
    
    students = load_students()
    updated_count = 0
    
    for record in attendance_list:
        student_id = record.get("studentId")
        status = record.get("status")
        
        if student_id in students:
            # Initialize attendance if not exists
            if "attendance" not in students[student_id]:
                students[student_id]["attendance"] = {}
            
            # Update attendance
            students[student_id]["attendance"][date] = {
                "status": status,
                "subject": subject,
                "marked_by": session["teacher_email"],
                "marked_at": datetime.now().isoformat()
            }
            
            # Update stats
            update_attendance_stats(students[student_id])
            updated_count += 1
    
    save_students(students)
    
    return jsonify({
        "success": True,
        "message": f"Attendance updated for {updated_count} students"
    })

def update_attendance_stats(student):
    """Update attendance statistics for a student"""
    attendance = student.get("attendance", {})
    
    if not attendance:
        student["attendanceStats"] = {
            "totalDays": 0,
            "presentDays": 0,
            "absentDays": 0,
            "percentage": 0
        }
        return
    
    total = len(attendance)
    present = sum(1 for record in attendance.values() if record.get("status") == "present")
    absent = total - present
    percentage = round((present / total) * 100, 2) if total > 0 else 0
    
    student["attendanceStats"] = {
        "totalDays": total,
        "presentDays": present,
        "absentDays": absent,
        "percentage": percentage
    }

# API: Get Attendance Report (Teacher only)
@app.route("/api/teacher/attendance/report", methods=["GET"])
def get_attendance_report():
    if "teacher_email" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    date = request.args.get("date")
    course = request.args.get("course")
    
    students = load_students()
    report = []
    
    for student_id, student in students.items():
        # Filter by course if specified
        if course and student.get("course") != course:
            continue
        
        attendance_record = None
        if date and "attendance" in student:
            attendance_record = student["attendance"].get(date)
        
        report.append({
            "studentId": student_id,
            "name": f"{student.get('firstName', '')} {student.get('lastName', '')}",
            "rollNumber": student.get("rollNumber", ""),
            "course": student.get("course", ""),
            "attendance": attendance_record,
            "overallStats": student.get("attendanceStats", {})
        })
    
    return jsonify({
        "success": True,
        "report": report,
        "date": date
    })

# API: Get Student Info
@app.route("/api/student/info", methods=["GET"])
def get_student_info():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        student = students[student_id]
        
        # Check and update subscription status
        update_subscription_status(student)
        save_students(students)
        
        # Return full student data including academic info
        return jsonify({
            "success": True,
            "student": student
        })
    
    return jsonify({"success": False, "message": "Student not found"})

def update_subscription_status(student):
    """Update subscription status based on trial/subscription end date"""
    subscription = student.get("subscription", {})
    
    if subscription.get("status") == "trial":
        trial_end = subscription.get("trialEndDate")
        if trial_end:
            end_date = datetime.fromisoformat(trial_end)
            days_left = (end_date - datetime.now()).days
            subscription["daysLeft"] = max(0, days_left)
            
            if days_left <= 0:
                subscription["status"] = "expired"
                subscription["daysLeft"] = 0
    
    elif subscription.get("status") == "active":
        sub_end = subscription.get("subscriptionEndDate")
        if sub_end:
            end_date = datetime.fromisoformat(sub_end)
            days_left = (end_date - datetime.now()).days
            subscription["daysLeft"] = max(0, days_left)
            
            if days_left <= 0:
                subscription["status"] = "expired"
                subscription["daysLeft"] = 0

# API: Check Subscription Status
@app.route("/api/student/subscription/status", methods=["GET"])
def check_subscription_status():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        student = students[student_id]
        update_subscription_status(student)
        save_students(students)
        
        subscription = student.get("subscription", {})
        return jsonify({
            "success": True,
            "subscription": {
                "status": subscription.get("status"),
                "plan": subscription.get("plan"),
                "daysLeft": subscription.get("daysLeft"),
                "trialEndDate": subscription.get("trialEndDate"),
                "subscriptionEndDate": subscription.get("subscriptionEndDate")
            }
        })
    
    return jsonify({"success": False, "message": "Student not found"})

# API: Process Payment and Subscribe
@app.route("/api/student/subscription/payment", methods=["POST"])
def process_subscription_payment():
    """Process payment with details and create subscription"""
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    data = request.json
    plan_type = data.get("plan")
    payment_method = "UPI" if data.get("upiId") else "Card"
    
    if plan_type not in ["monthly", "quarterly", "yearly"]:
        return jsonify({"success": False, "message": "Invalid plan type"})
    
    students = load_students()
    student_id = session["student_id"]
    
    if student_id not in students:
        return jsonify({"success": False, "message": "Student not found"})
    
    student = students[student_id]
    
    # Validate payment details (in real app, integrate with payment gateway)
    # For demo, we simulate successful payment
    
    # Calculate subscription dates
    now = datetime.now()
    if plan_type == "monthly":
        end_date = now + timedelta(days=30)
        plan_name = "Monthly"
        amount = "₹299"
    elif plan_type == "quarterly":
        end_date = now + timedelta(days=90)
        plan_name = "Quarterly"
        amount = "₹799"
    else:  # yearly
        end_date = now + timedelta(days=365)
        plan_name = "Yearly"
        amount = "₹2499"
    
    # Create payment record
    payment_record = {
        "date": now.isoformat(),
        "plan": plan_type,
        "planName": plan_name,
        "amount": amount,
        "paymentMethod": payment_method,
        "status": "success",
        "transactionId": f"TXN{now.strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}",
        "cardLastFour": data.get("cardNumber", "")[-4:] if data.get("cardNumber") else None,
        "upiId": data.get("upiId") if payment_method == "UPI" else None,
        "billingAddress": data.get("billingAddress", "")
    }
    
    # Update subscription
    if "subscription" not in student:
        student["subscription"] = {}
    
    student["subscription"]["status"] = "active"
    student["subscription"]["plan"] = plan_type
    student["subscription"]["subscriptionStartDate"] = now.isoformat()
    student["subscription"]["subscriptionEndDate"] = end_date.isoformat()
    student["subscription"]["daysLeft"] = (end_date - now).days
    
    # Add to payment history
    if "paymentHistory" not in student["subscription"]:
        student["subscription"]["paymentHistory"] = []
    
    student["subscription"]["paymentHistory"].append(payment_record)
    
    # Save payment details for future reference
    if "savedPaymentMethods" not in student:
        student["savedPaymentMethods"] = []
    
    # Only save last 4 digits of card, not full details
    if payment_method == "Card" and data.get("cardNumber"):
        student["savedPaymentMethods"].append({
            "type": "card",
            "lastFour": data.get("cardNumber", "")[-4:],
            "expiryDate": data.get("expiryDate", ""),
            "cardHolderName": data.get("cardHolderName", ""),
            "addedOn": now.isoformat()
        })
    elif payment_method == "UPI" and data.get("upiId"):
        student["savedPaymentMethods"].append({
            "type": "upi",
            "upiId": data.get("upiId", ""),
            "addedOn": now.isoformat()
        })
    
    # Keep only last 3 saved methods
    student["savedPaymentMethods"] = student["savedPaymentMethods"][-3:]
    
    save_students(students)
    
    return jsonify({
        "success": True,
        "message": f"Payment successful! Subscribed to {plan_name} plan.",
        "payment": payment_record,
        "subscription": student["subscription"]
    })


# API: Subscribe to Plan (Legacy - kept for compatibility)
@app.route("/api/student/subscription/subscribe", methods=["POST"])
def subscribe_to_plan():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    data = request.json
    plan_type = data.get("plan")  # monthly, quarterly, yearly
    
    if plan_type not in ["monthly", "quarterly", "yearly"]:
        return jsonify({"success": False, "message": "Invalid plan type"})
    
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        student = students[student_id]
        
        # Calculate subscription dates
        now = datetime.now()
        if plan_type == "monthly":
            end_date = now + timedelta(days=30)
        elif plan_type == "quarterly":
            end_date = now + timedelta(days=90)
        else:  # yearly
            end_date = now + timedelta(days=365)
        
        # Update subscription
        student["subscription"]["status"] = "active"
        student["subscription"]["plan"] = plan_type
        student["subscription"]["subscriptionStartDate"] = now.isoformat()
        student["subscription"]["subscriptionEndDate"] = end_date.isoformat()
        student["subscription"]["daysLeft"] = (end_date - now).days
        
        # Add to payment history
        plan_details = student["availablePlans"][plan_type]
        student["subscription"]["paymentHistory"].append({
            "date": now.isoformat(),
            "plan": plan_type,
            "amount": plan_details["price"],
            "status": "completed",
            "transactionId": f"TXN{now.strftime('%Y%m%d%H%M%S')}"
        })
        
        save_students(students)
        
        return jsonify({
            "success": True,
            "message": f"Successfully subscribed to {plan_details['name']}!",
            "subscription": student["subscription"]
        })
    
    return jsonify({"success": False, "message": "Student not found"})


# API: Get Student Notifications
@app.route("/api/student/notifications", methods=["GET"])
def get_notifications():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        notifications = students[student_id].get("notifications", [])
        unread_count = sum(1 for n in notifications if not n.get("read", False))
        
        return jsonify({
            "success": True,
            "notifications": notifications,
            "unreadCount": unread_count
        })
    
    return jsonify({"success": False, "message": "Student not found"})


# API: Mark Notification as Read
@app.route("/api/student/notifications/<notification_id>/read", methods=["PUT"])
def mark_notification_read(notification_id):
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        notifications = students[student_id].get("notifications", [])
        
        for notification in notifications:
            if notification.get("id") == notification_id:
                notification["read"] = True
                save_students(students)
                return jsonify({"success": True, "message": "Notification marked as read"})
        
        return jsonify({"success": False, "message": "Notification not found"})
    
    return jsonify({"success": False, "message": "Student not found"})


# API: Mark All Notifications as Read
@app.route("/api/student/notifications/read-all", methods=["PUT"])
def mark_all_notifications_read():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        notifications = students[student_id].get("notifications", [])
        
        for notification in notifications:
            notification["read"] = True
        
        save_students(students)
        
        return jsonify({"success": True, "message": "All notifications marked as read"})
    
    return jsonify({"success": False, "message": "Student not found"})


# API: Delete Notification
@app.route("/api/student/notifications/<notification_id>", methods=["DELETE"])
def delete_notification(notification_id):
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        notifications = students[student_id].get("notifications", [])
        students[student_id]["notifications"] = [n for n in notifications if n.get("id") != notification_id]
        
        save_students(students)
        
        return jsonify({"success": True, "message": "Notification deleted"})
    
    return jsonify({"success": False, "message": "Student not found"})


# API: Add Notification (for internal use)
def add_notification(student_id, title, message, notification_type="info"):
    """Add a notification to a student's account"""
    students = load_students()
    
    if student_id in students:
        notification = {
            "id": f"notif_{datetime.now().strftime('%Y%m%d%H%M%S')}_{len(students[student_id].get('notifications', []))}",
            "title": title,
            "message": message,
            "type": notification_type,
            "timestamp": datetime.now().isoformat(),
            "read": False
        }
        
        if "notifications" not in students[student_id]:
            students[student_id]["notifications"] = []
        
        students[student_id]["notifications"].insert(0, notification)  # Add to beginning
        
        # Keep only last 50 notifications
        if len(students[student_id]["notifications"]) > 50:
            students[student_id]["notifications"] = students[student_id]["notifications"][:50]
        
        save_students(students)
        return True
    
    return False


# API: Update Student Profile
@app.route("/api/student/profile", methods=["PUT"])
def update_profile():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    data = request.json
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        # Update profile fields
        allowed_fields = ["bio", "interests", "skills", "languages", "socialLinks", "avatar"]
        for field in allowed_fields:
            if field in data:
                students[student_id]["profile"][field] = data[field]
        
        # Log activity
        students[student_id]["activityLog"].append({
            "action": "Profile Updated",
            "timestamp": datetime.now().isoformat(),
            "details": "Student profile information updated"
        })
        
        save_students(students)
        return jsonify({"success": True, "message": "Profile updated successfully"})
    
    return jsonify({"success": False, "message": "Student not found"})


# API: Add Course
@app.route("/api/student/courses", methods=["POST"])
def add_course():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    data = request.json
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        course = {
            "courseId": data.get("courseId"),
            "courseName": data.get("courseName"),
            "courseCode": data.get("courseCode"),
            "credits": data.get("credits", 3),
            "semester": data.get("semester"),
            "instructor": data.get("instructor"),
            "enrolledDate": datetime.now().isoformat(),
            "status": "active"
        }
        
        students[student_id]["courses"]["enrolled"].append(course)
        students[student_id]["courses"]["current"].append(course)
        
        # Update total credits
        students[student_id]["grades"]["totalCredits"] += course["credits"]
        
        # Log activity
        students[student_id]["activityLog"].append({
            "action": "Course Enrolled",
            "timestamp": datetime.now().isoformat(),
            "details": f"Enrolled in {course['courseName']}"
        })
        
        save_students(students)
        return jsonify({"success": True, "message": "Course added successfully"})
    
    return jsonify({"success": False, "message": "Student not found"})


# API: Add Assignment
@app.route("/api/student/assignments", methods=["POST"])
def add_assignment():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    data = request.json
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        assignment = {
            "assignmentId": data.get("assignmentId"),
            "title": data.get("title"),
            "course": data.get("course"),
            "description": data.get("description"),
            "dueDate": data.get("dueDate"),
            "status": "pending",
            "submittedDate": None,
            "grade": None,
            "maxMarks": data.get("maxMarks", 100),
            "attachments": []
        }
        
        students[student_id]["assignments"]["pending"].append(assignment)
        
        # Log activity
        students[student_id]["activityLog"].append({
            "action": "Assignment Added",
            "timestamp": datetime.now().isoformat(),
            "details": f"New assignment: {assignment['title']}"
        })
        
        save_students(students)
        return jsonify({"success": True, "message": "Assignment added successfully"})
    
    return jsonify({"success": False, "message": "Student not found"})


# API: Submit Assignment
@app.route("/api/student/assignments/submit", methods=["POST"])
def submit_assignment():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    data = request.json
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        assignment_id = data.get("assignmentId")
        
        # Find and move from pending to submitted
        pending = students[student_id]["assignments"]["pending"]
        for i, assignment in enumerate(pending):
            if assignment["assignmentId"] == assignment_id:
                assignment["status"] = "submitted"
                assignment["submittedDate"] = datetime.now().isoformat()
                assignment["submissionUrl"] = data.get("submissionUrl")
                assignment["notes"] = data.get("notes")
                
                students[student_id]["assignments"]["submitted"].append(assignment)
                students[student_id]["assignments"]["pending"].pop(i)
                
                # Log activity
                students[student_id]["activityLog"].append({
                    "action": "Assignment Submitted",
                    "timestamp": datetime.now().isoformat(),
                    "details": f"Submitted: {assignment['title']}"
                })
                
                save_students(students)
                return jsonify({"success": True, "message": "Assignment submitted successfully"})
        
        return jsonify({"success": False, "message": "Assignment not found"})
    
    return jsonify({"success": False, "message": "Student not found"})


# API: Add Grade
@app.route("/api/student/grades", methods=["POST"])
def add_grade():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    data = request.json
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        grade = {
            "courseId": data.get("courseId"),
            "courseName": data.get("courseName"),
            "semester": data.get("semester"),
            "examType": data.get("examType"),  # internal, external, practical
            "marks": data.get("marks"),
            "maxMarks": data.get("maxMarks", 100),
            "percentage": (data.get("marks", 0) / data.get("maxMarks", 100)) * 100,
            "grade": data.get("grade"),
            "gradePoints": data.get("gradePoints"),
            "credits": data.get("credits"),
            "date": datetime.now().isoformat()
        }
        
        semester = str(data.get("semester", 1))
        if semester not in students[student_id]["grades"]["semesterWise"]:
            students[student_id]["grades"]["semesterWise"][semester] = []
        
        students[student_id]["grades"]["semesterWise"][semester].append(grade)
        
        # Update earned credits
        students[student_id]["grades"]["earnedCredits"] += data.get("credits", 0)
        
        # Recalculate CGPA
        calculate_cgpa(students[student_id])
        
        # Log activity
        students[student_id]["activityLog"].append({
            "action": "Grade Added",
            "timestamp": datetime.now().isoformat(),
            "details": f"Grade added for {grade['courseName']}"
        })
        
        save_students(students)
        return jsonify({"success": True, "message": "Grade added successfully"})
    
    return jsonify({"success": False, "message": "Student not found"})


# Calculate CGPA and Credit Points
def calculate_cgpa(student):
    total_points = 0
    total_credits = 0
    total_credit_points = 0
    
    for semester, grades in student["grades"]["semesterWise"].items():
        semester_points = 0
        semester_credits = 0
        
        for grade in grades:
            points = grade.get("gradePoints", 0) * grade.get("credits", 0)
            semester_points += points
            semester_credits += grade.get("credits", 0)
        
        if semester_credits > 0:
            sgpa = semester_points / semester_credits
            student["grades"]["sgpa"][semester] = sgpa
            
            # Calculate credit points for this semester based on SGPA
            # Base points: 10 per semester, multiplied by SGPA/10
            semester_credit_points = int(10 * (sgpa / 10) * semester_credits)
            student["grades"]["creditPoints"][semester] = semester_credit_points
            total_credit_points += semester_credit_points
            
            total_points += semester_points
            total_credits += semester_credits
    
    if total_credits > 0:
        student["grades"]["cgpa"] = total_points / total_credits
    
    # Update total credit points
    student["grades"]["totalCreditPoints"] = total_credit_points
    
    # Update student level based on total credit points
    update_student_level(student)


# Level titles based on credit points
LEVEL_TITLES = {
    1: "Freshman",
    2: "Sophomore", 
    3: "Junior",
    4: "Senior",
    5: "Scholar",
    6: "Expert",
    7: "Master",
    8: "Distinguished",
    9: "Elite",
    10: "Legend"
}


def update_student_level(student):
    """Update student level based on total credit points"""
    total_points = student["grades"]["totalCreditPoints"]
    
    # Calculate level: every 100 points = 1 level
    current_level = min(10, (total_points // 100) + 1)
    points_to_next = (current_level * 100) - total_points
    progress = (100 - points_to_next) if points_to_next < 100 else 0
    
    student["level"]["current"] = int(current_level)
    student["level"]["title"] = LEVEL_TITLES.get(int(current_level), "Legend")
    student["level"]["progress"] = int(progress)
    student["level"]["pointsToNext"] = int(points_to_next) if points_to_next > 0 else 0
    
    # Check and unlock certificates based on level
    unlock_certificates(student)


# Certificate definitions with unlock levels
CERTIFICATES = {
    "academic_excellence_1": {
        "name": "Academic Excellence I",
        "description": "Achieved Level 2 - Keep up the great work!",
        "icon": "fa-award",
        "unlockLevel": 2,
        "color": "bronze"
    },
    "academic_excellence_2": {
        "name": "Academic Excellence II", 
        "description": "Achieved Level 4 - Outstanding performance!",
        "icon": "fa-medal",
        "unlockLevel": 4,
        "color": "silver"
    },
    "academic_excellence_3": {
        "name": "Academic Excellence III",
        "description": "Achieved Level 6 - Exceptional scholar!",
        "icon": "fa-trophy",
        "unlockLevel": 6,
        "color": "gold"
    },
    "master_scholar": {
        "name": "Master Scholar",
        "description": "Achieved Level 8 - Distinguished academic achievement!",
        "icon": "fa-crown",
        "unlockLevel": 8,
        "color": "platinum"
    },
    "legend_status": {
        "name": "Legend Status",
        "description": "Achieved Level 10 - The pinnacle of academic excellence!",
        "icon": "fa-star",
        "unlockLevel": 10,
        "color": "diamond"
    },
    "semester_warrior": {
        "name": "Semester Warrior",
        "description": "Completed 4 semesters with excellence!",
        "icon": "fa-book-open",
        "unlockLevel": 3,
        "color": "bronze"
    },
    "credit_master": {
        "name": "Credit Master",
        "description": "Earned 500+ credit points!",
        "icon": "fa-coins",
        "unlockLevel": 5,
        "color": "silver"
    }
}


def unlock_certificates(student):
    """Unlock certificates based on student level"""
    current_level = student["level"]["current"]
    total_points = student["grades"]["totalCreditPoints"]
    
    # Get existing certificates
    existing_certs = {cert["id"] for cert in student.get("certifications", [])}
    
    for cert_id, cert_info in CERTIFICATES.items():
        # Check if already unlocked
        if cert_id in existing_certs:
            continue
            
        # Check level requirement
        should_unlock = False
        
        if cert_id == "credit_master" and total_points >= 500:
            should_unlock = True
        elif cert_id == "semester_warrior" and len(student["grades"]["semesterWise"]) >= 4:
            should_unlock = True
        elif cert_info["unlockLevel"] <= current_level:
            should_unlock = True
        
        if should_unlock:
            new_cert = {
                "id": cert_id,
                "name": cert_info["name"],
                "description": cert_info["description"],
                "icon": cert_info["icon"],
                "color": cert_info["color"],
                "unlockedAt": datetime.now().isoformat(),
                "level": current_level
            }
            student["certifications"].append(new_cert)
            
            # Log activity
            student["activityLog"].append({
                "action": "Certificate Unlocked",
                "timestamp": datetime.now().isoformat(),
                "details": f"Earned certificate: {cert_info['name']}"
            })


# API: Update Attendance
@app.route("/api/student/attendance", methods=["POST"])
def update_attendance():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    data = request.json
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        subject = data.get("subject")
        attended = data.get("attended", 0)
        total = data.get("total", 0)
        
        students[student_id]["attendance"]["subjectWise"][subject] = {
            "attended": attended,
            "total": total,
            "percentage": (attended / total * 100) if total > 0 else 0
        }
        
        # Calculate overall attendance
        total_attended = sum(s["attended"] for s in students[student_id]["attendance"]["subjectWise"].values())
        total_classes = sum(s["total"] for s in students[student_id]["attendance"]["subjectWise"].values())
        students[student_id]["attendance"]["overall"] = (total_attended / total_classes * 100) if total_classes > 0 else 0
        
        save_students(students)
        return jsonify({"success": True, "message": "Attendance updated successfully"})
    
    return jsonify({"success": False, "message": "Student not found"})


# API: Add Achievement
@app.route("/api/student/achievements", methods=["POST"])
def add_achievement():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    data = request.json
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        achievement = {
            "id": len(students[student_id]["achievements"]) + 1,
            "title": data.get("title"),
            "description": data.get("description"),
            "category": data.get("category"),  # academic, sports, cultural, etc.
            "date": data.get("date"),
            "certificate": data.get("certificate"),
            "addedOn": datetime.now().isoformat()
        }
        
        students[student_id]["achievements"].append(achievement)
        
        # Log activity
        students[student_id]["activityLog"].append({
            "action": "Achievement Added",
            "timestamp": datetime.now().isoformat(),
            "details": f"New achievement: {achievement['title']}"
        })
        
        save_students(students)
        return jsonify({"success": True, "message": "Achievement added successfully"})
    
    return jsonify({"success": False, "message": "Student not found"})


# API: Issue Library Book
@app.route("/api/student/library/issue", methods=["POST"])
def issue_book():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    data = request.json
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        book = {
            "bookId": data.get("bookId"),
            "title": data.get("title"),
            "author": data.get("author"),
            "issueDate": datetime.now().isoformat(),
            "dueDate": data.get("dueDate"),
            "returnDate": None,
            "status": "issued"
        }
        
        students[student_id]["library"]["booksIssued"].append(book)
        
        # Log activity
        students[student_id]["activityLog"].append({
            "action": "Book Issued",
            "timestamp": datetime.now().isoformat(),
            "details": f"Book issued: {book['title']}"
        })
        
        save_students(students)
        return jsonify({"success": True, "message": "Book issued successfully"})
    
    return jsonify({"success": False, "message": "Student not found"})


# API: Get Activity Log
@app.route("/api/student/activity", methods=["GET"])
def get_activity_log():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        activities = students[student_id]["activityLog"]
        # Return last 50 activities
        return jsonify({
            "success": True,
            "activities": activities[-50:][::-1]  # Reverse to show newest first
        })
    
    return jsonify({"success": False, "message": "Student not found"})


# API: Save Quiz Result
@app.route("/api/student/quiz", methods=["POST"])
def save_quiz_result():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    data = request.json
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        quiz_result = {
            "subject": data.get("subject"),
            "score": data.get("score"),
            "total": data.get("total"),
            "date": data.get("date"),
            "percentage": (data.get("score", 0) / data.get("total", 1)) * 100
        }
        
        if "quizzes" not in students[student_id]:
            students[student_id]["quizzes"] = []
        
        students[student_id]["quizzes"].append(quiz_result)
        
        # Log activity
        students[student_id]["activityLog"].append({
            "action": "Quiz Completed",
            "timestamp": datetime.now().isoformat(),
            "details": f"Scored {quiz_result['score']}/{quiz_result['total']} in {quiz_result['subject']}"
        })
        
        save_students(students)
        return jsonify({"success": True, "message": "Quiz result saved"})
    
    return jsonify({"success": False, "message": "Student not found"})


# API: Save Daily Attendance
@app.route("/api/student/attendance/daily", methods=["POST"])
def save_daily_attendance():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    data = request.json
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        date = data.get("date")
        lecture_idx = data.get("lectureIdx")
        status = data.get("status")
        
        if "dailyAttendance" not in students[student_id]:
            students[student_id]["dailyAttendance"] = {}
        
        if date not in students[student_id]["dailyAttendance"]:
            students[student_id]["dailyAttendance"][date] = {}
        
        students[student_id]["dailyAttendance"][date][str(lecture_idx)] = status
        
        # Update overall attendance stats
        update_attendance_stats(students[student_id])
        
        save_students(students)
        return jsonify({"success": True, "message": "Attendance saved"})
    
    return jsonify({"success": False, "message": "Student not found"})


def update_attendance_stats(student):
    """Update overall attendance statistics"""
    daily_attendance = student.get("dailyAttendance", {})
    
    total_present = 0
    total_absent = 0
    total_leave = 0
    
    for date, lectures in daily_attendance.items():
        for status in lectures.values():
            if status == "present":
                total_present += 1
            elif status == "absent":
                total_absent += 1
            elif status == "leave":
                total_leave += 1
    
    total = total_present + total_absent + total_leave
    overall = round((total_present / total) * 100) if total > 0 else 0
    
    student["attendance"] = {
        "overall": overall,
        "present": total_present,
        "absent": total_absent,
        "leave": total_leave
    }


# API: Get Academic Events
@app.route("/api/student/events", methods=["GET"])
def get_academic_events():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        # Return default events if none exist
        events = students[student_id].get("academicEvents", get_default_events())
        return jsonify({"success": True, "events": events})
    
    return jsonify({"success": False, "message": "Student not found"})


def get_default_events():
    """Get default academic events for the current year"""
    year = datetime.now().year
    return [
        {"date": f"{year}-03-15", "title": "Mid-term Exam", "type": "exam"},
        {"date": f"{year}-03-20", "title": "Technical Fest", "type": "event"},
        {"date": f"{year}-03-25", "title": "Project Deadline", "type": "deadline"},
        {"date": f"{year}-03-30", "title": "Holi Holiday", "type": "holiday"},
        {"date": f"{year}-04-05", "title": "Assignment Due", "type": "deadline"},
        {"date": f"{year}-04-10", "title": "Quiz Competition", "type": "event"},
        {"date": f"{year}-04-15", "title": "Sports Day", "type": "event"},
        {"date": f"{year}-04-20", "title": "End Semester Exam", "type": "exam"},
        {"date": f"{year}-05-01", "title": "Labor Day Holiday", "type": "holiday"},
        {"date": f"{year}-05-15", "title": "Summer Vacation Starts", "type": "holiday"}
    ]


# API: Add Academic Event
@app.route("/api/student/events", methods=["POST"])
def add_academic_event():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    data = request.json
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        event = {
            "date": data.get("date"),
            "title": data.get("title"),
            "type": data.get("type", "event"),
            "description": data.get("description", "")
        }
        
        if "academicEvents" not in students[student_id]:
            students[student_id]["academicEvents"] = get_default_events()
        
        students[student_id]["academicEvents"].append(event)
        
        # Log activity
        students[student_id]["activityLog"].append({
            "action": "Event Added",
            "timestamp": datetime.now().isoformat(),
            "details": f"Added event: {event['title']}"
        })
        
        save_students(students)
        return jsonify({"success": True, "message": "Event added successfully"})
    
    return jsonify({"success": False, "message": "Student not found"})


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# API: Upload Project Files
@app.route("/api/student/projects/upload", methods=["POST"])
def upload_project():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    students = load_students()
    student_id = session["student_id"]
    
    if student_id not in students:
        return jsonify({"success": False, "message": "Student not found"})
    
    # Check if files are present
    if "files" not in request.files:
        return jsonify({"success": False, "message": "No files provided"})
    
    files = request.files.getlist("files")
    
    if not files or files[0].filename == "":
        return jsonify({"success": False, "message": "No files selected"})
    
    # Create student upload directory
    student_upload_dir = os.path.join(app.config["UPLOAD_FOLDER"], student_id)
    os.makedirs(student_upload_dir, exist_ok=True)
    
    # Generate project ID
    project_id = f"proj_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    # Save files
    saved_files = []
    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Add timestamp to filename to avoid conflicts
            name, ext = os.path.splitext(filename)
            unique_filename = f"{name}_{datetime.now().strftime('%H%M%S')}{ext}"
            filepath = os.path.join(student_upload_dir, unique_filename)
            file.save(filepath)
            
            saved_files.append({
                "filename": filename,
                "stored_name": unique_filename,
                "size": os.path.getsize(filepath),
                "path": filepath
            })
    
    if not saved_files:
        return jsonify({"success": False, "message": "No valid files uploaded"})
    
    # Create project record
    project = {
        "id": project_id,
        "title": request.form.get("title"),
        "description": request.form.get("description", ""),
        "subject": request.form.get("subject"),
        "type": request.form.get("type", "assignment"),
        "files": saved_files,
        "uploadDate": datetime.now().isoformat(),
        "status": "submitted"
    }
    
    # Add to student's projects
    if "projects" not in students[student_id]:
        students[student_id]["projects"] = []
    
    students[student_id]["projects"].append(project)
    
    # Log activity
    students[student_id]["activityLog"].append({
        "action": "Project Uploaded",
        "timestamp": datetime.now().isoformat(),
        "details": f"Uploaded project: {project['title']} ({len(saved_files)} file(s))"
    })
    
    save_students(students)
    
    return jsonify({
        "success": True,
        "message": "Project uploaded successfully",
        "project": project
    })


# API: Get Student Projects
@app.route("/api/student/projects", methods=["GET"])
def get_projects():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        projects = students[student_id].get("projects", [])
        return jsonify({"success": True, "projects": projects})
    
    return jsonify({"success": False, "message": "Student not found"})


# API: Download Project File
@app.route("/api/student/projects/download/<project_id>/<int:file_index>")
def download_project_file(project_id, file_index):
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"}), 401
    
    students = load_students()
    student_id = session["student_id"]
    
    if student_id not in students:
        return jsonify({"success": False, "message": "Student not found"}), 404
    
    projects = students[student_id].get("projects", [])
    project = next((p for p in projects if p["id"] == project_id), None)
    
    if not project:
        return jsonify({"success": False, "message": "Project not found"}), 404
    
    if file_index >= len(project.get("files", [])):
        return jsonify({"success": False, "message": "File not found"}), 404
    
    file_info = project["files"][file_index]
    filepath = file_info.get("path")
    
    if not filepath or not os.path.exists(filepath):
        return jsonify({"success": False, "message": "File not found on server"}), 404
    
    return send_file(filepath, as_attachment=True, download_name=file_info["filename"])


# API: Delete Project
@app.route("/api/student/projects/delete/<project_id>", methods=["DELETE"])
def delete_project(project_id):
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    students = load_students()
    student_id = session["student_id"]
    
    if student_id not in students:
        return jsonify({"success": False, "message": "Student not found"})
    
    projects = students[student_id].get("projects", [])
    project = next((p for p in projects if p["id"] == project_id), None)
    
    if not project:
        return jsonify({"success": False, "message": "Project not found"})
    
    # Delete files from storage
    for file_info in project.get("files", []):
        filepath = file_info.get("path")
        if filepath and os.path.exists(filepath):
            try:
                os.remove(filepath)
            except OSError:
                pass
    
    # Remove project from list
    students[student_id]["projects"] = [p for p in projects if p["id"] != project_id]
    
    # Log activity
    students[student_id]["activityLog"].append({
        "action": "Project Deleted",
        "timestamp": datetime.now().isoformat(),
        "details": f"Deleted project: {project['title']}"
    })
    
    save_students(students)
    
    return jsonify({"success": True, "message": "Project deleted successfully"})


# API: Get Storage Stats
@app.route("/api/student/storage", methods=["GET"])
def get_storage_stats():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    students = load_students()
    student_id = session["student_id"]
    
    if student_id not in students:
        return jsonify({"success": False, "message": "Student not found"})
    
    projects = students[student_id].get("projects", [])
    total_size = 0
    file_count = 0
    
    for project in projects:
        for file_info in project.get("files", []):
            total_size += file_info.get("size", 0)
            file_count += 1
    
    max_size = 50 * 1024 * 1024  # 50MB
    
    return jsonify({
        "success": True,
        "storage": {
            "used": total_size,
            "max": max_size,
            "percentage": round((total_size / max_size) * 100, 2),
            "file_count": file_count
        }
    })


# API: Save Lecture Progress
@app.route("/api/student/lectures/progress", methods=["POST"])
def save_lecture_progress():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    data = request.json
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        if "lectureProgress" not in students[student_id]:
            students[student_id]["lectureProgress"] = {}
        
        students[student_id]["lectureProgress"][data["lectureId"]] = data["progress"]
        save_students(students)
        return jsonify({"success": True})
    
    return jsonify({"success": False, "message": "Student not found"})


# API: Mark Lecture Downloaded
@app.route("/api/student/lectures/download", methods=["POST"])
def download_lecture():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    data = request.json
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        if "downloadedLectures" not in students[student_id]:
            students[student_id]["downloadedLectures"] = []
        
        lecture_id = data["lectureId"]
        if lecture_id not in students[student_id]["downloadedLectures"]:
            students[student_id]["downloadedLectures"].append(lecture_id)
            
            # Log activity
            students[student_id]["activityLog"].append({
                "action": "Lecture Downloaded",
                "timestamp": datetime.now().isoformat(),
                "details": f"Downloaded lecture: {lecture_id}"
            })
        
        save_students(students)
        return jsonify({"success": True})
    
    return jsonify({"success": False, "message": "Student not found"})


# API: Remove Downloaded Lecture
@app.route("/api/student/lectures/download/<lecture_id>", methods=["DELETE"])
def remove_downloaded_lecture(lecture_id):
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        if "downloadedLectures" in students[student_id]:
            students[student_id]["downloadedLectures"] = [
                id for id in students[student_id]["downloadedLectures"] if id != lecture_id
            ]
            save_students(students)
        return jsonify({"success": True})
    
    return jsonify({"success": False, "message": "Student not found"})


# API: Mark Lecture Complete
@app.route("/api/student/lectures/complete", methods=["POST"])
def complete_lecture():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    data = request.json
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        if "completedLectures" not in students[student_id]:
            students[student_id]["completedLectures"] = []
        
        lecture_id = data["lectureId"]
        if lecture_id not in students[student_id]["completedLectures"]:
            students[student_id]["completedLectures"].append(lecture_id)
            
            # Log activity
            students[student_id]["activityLog"].append({
                "action": "Lecture Completed",
                "timestamp": datetime.now().isoformat(),
                "details": f"Completed lecture: {lecture_id}"
            })
        
        save_students(students)
        return jsonify({"success": True})
    
    return jsonify({"success": False, "message": "Student not found"})


# API: Get Available Lectures
@app.route("/api/student/lectures", methods=["GET"])
def get_lectures():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        # Return default lectures if none exist
        lectures = students[student_id].get("lectures", get_default_lectures())
        return jsonify({
            "success": True,
            "lectures": lectures,
            "downloaded": students[student_id].get("downloadedLectures", []),
            "completed": students[student_id].get("completedLectures", []),
            "progress": students[student_id].get("lectureProgress", {})
        })
    
    return jsonify({"success": False, "message": "Student not found"})


def get_default_lectures():
    """Get default lecture list"""
    return [
        {
            "id": "lec_001",
            "title": "Introduction to Data Structures",
            "subject": "Data Structures",
            "duration": "45:30",
            "size": 125 * 1024 * 1024,
            "videoUrl": "/static/lectures/ds_intro.mp4",
            "thumbnail": "/static/images/lecture1.jpg",
            "description": "Overview of data structures and their importance in programming"
        },
        {
            "id": "lec_002",
            "title": "Arrays and Linked Lists",
            "subject": "Data Structures",
            "duration": "52:15",
            "size": 148 * 1024 * 1024,
            "videoUrl": "/static/lectures/ds_arrays.mp4",
            "thumbnail": "/static/images/lecture2.jpg",
            "description": "Deep dive into arrays and linked lists implementation"
        },
        {
            "id": "lec_003",
            "title": "Sorting Algorithms",
            "subject": "Algorithms",
            "duration": "48:45",
            "size": 132 * 1024 * 1024,
            "videoUrl": "/static/lectures/algo_sorting.mp4",
            "thumbnail": "/static/images/lecture3.jpg",
            "description": "Bubble sort, quick sort, merge sort and their complexities"
        },
        {
            "id": "lec_004",
            "title": "SQL Basics",
            "subject": "Database",
            "duration": "38:20",
            "size": 98 * 1024 * 1024,
            "videoUrl": "/static/lectures/db_sql.mp4",
            "thumbnail": "/static/images/lecture4.jpg",
            "description": "Introduction to SQL queries and database operations"
        },
        {
            "id": "lec_005",
            "title": "HTML & CSS Fundamentals",
            "subject": "Web Development",
            "duration": "55:00",
            "size": 165 * 1024 * 1024,
            "videoUrl": "/static/lectures/web_html_css.mp4",
            "thumbnail": "/static/images/lecture5.jpg",
            "description": "Building responsive web pages with HTML5 and CSS3"
        },
        {
            "id": "lec_006",
            "title": "Introduction to Machine Learning",
            "subject": "Machine Learning",
            "duration": "42:30",
            "size": 118 * 1024 * 1024,
            "videoUrl": "/static/lectures/ml_intro.mp4",
            "thumbnail": "/static/images/lecture6.jpg",
            "description": "Overview of ML concepts and applications"
        }
    ]


# API: Get Live Dashboard Metrics
@app.route("/api/dashboard/live-metrics", methods=["GET"])
def get_live_dashboard_metrics():
    """Get real-time calculated dashboard metrics"""
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    students = load_students()
    student_id = session["student_id"]
    
    if student_id not in students:
        return jsonify({"success": False, "message": "Student not found"})
    
    student = students[student_id]
    
    # Calculate live metrics
    metrics = calculate_dashboard_metrics(student)
    
    return jsonify({
        "success": True,
        "metrics": metrics,
        "timestamp": datetime.now().isoformat()
    })

# API: Get Live Activity Feed
@app.route("/api/dashboard/live-activity", methods=["GET"])
def get_live_activity():
    """Get real-time activity feed"""
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    students = load_students()
    student_id = session["student_id"]
    
    if student_id not in students:
        return jsonify({"success": False, "message": "Student not found"})
    
    student = students[student_id]
    
    # Get recent activities
    activities = student.get("activityLog", [])
    
    # Add system-generated live activities
    live_activities = generate_live_activities(student)
    
    # Combine and sort by timestamp
    all_activities = activities + live_activities
    all_activities.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    
    return jsonify({
        "success": True,
        "activities": all_activities[:10],  # Return last 10 activities
        "timestamp": datetime.now().isoformat()
    })

# API: Get Live Notifications
@app.route("/api/dashboard/live-notifications", methods=["GET"])
def get_live_notifications():
    """Get real-time notifications"""
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    students = load_students()
    student_id = session["student_id"]
    
    if student_id not in students:
        return jsonify({"success": False, "message": "Student not found"})
    
    student = students[student_id]
    
    # Generate live notifications based on student data
    notifications = generate_live_notifications(student)
    
    return jsonify({
        "success": True,
        "notifications": notifications,
        "unreadCount": len([n for n in notifications if not n.get("read", False)]),
        "timestamp": datetime.now().isoformat()
    })

def calculate_dashboard_metrics(student):
    """Calculate real-time dashboard metrics from student data"""
    
    # Get student data components
    courses = student.get("courses", {})
    assignments = student.get("assignments", {})
    grades = student.get("grades", {})
    activity_log = student.get("activityLog", [])
    
    # Calculate Active Courses
    current_courses = courses.get("current", [])
    enrolled_courses = courses.get("enrolled", [])
    active_courses_count = len(current_courses) + len(enrolled_courses)
    
    # Calculate Completed Tasks
    graded_assignments = assignments.get("graded", [])
    completed_activities = [a for a in activity_log if 
        any(keyword in a.get("action", "").lower() for keyword in 
            ["completed", "submitted", "finished", "graded"])]
    completed_count = max(len(graded_assignments), len(completed_activities))
    
    # Calculate Pending Tasks
    pending_assignments = assignments.get("pending", [])
    pending_count = len(pending_assignments)
    
    # Calculate Performance Score
    cgpa = grades.get("cgpa", 0)
    semester_grades = grades.get("semesterGrades", [])
    
    if semester_grades:
        # Calculate from semester grades
        total_score = sum(g.get("sgpa", 0) * 10 for g in semester_grades)
        performance_score = round(total_score / len(semester_grades))
    elif cgpa > 0:
        # Calculate from CGPA
        performance_score = round(cgpa * 10)
    else:
        performance_score = 85  # Default
    
    # Calculate trend
    trend = "stable"
    if len(semester_grades) >= 2:
        recent = semester_grades[-1].get("sgpa", 0)
        previous = semester_grades[-2].get("sgpa", 0)
        if recent > previous:
            trend = "improving"
        elif recent < previous:
            trend = "declining"
    
    # Calculate weekly progress
    weekly_progress = calculate_weekly_progress(student)
    
    # Calculate study streak
    study_streak = calculate_study_streak(activity_log)
    
    return {
        "activeCourses": {
            "value": active_courses_count or 6,
            "trend": "up",
            "change": "+1 this week"
        },
        "completedTasks": {
            "value": completed_count or 24,
            "trend": "up",
            "change": "+3 today"
        },
        "pendingTasks": {
            "value": pending_count or 8,
            "trend": pending_count > 5 and "up" or "down",
            "change": f"{pending_count} due this week"
        },
        "performanceScore": {
            "value": performance_score,
            "trend": trend,
            "change": trend == "improving" and "+2%" or (trend == "declining" and "-1%" or "0%")
        },
        "weeklyProgress": weekly_progress,
        "studyStreak": study_streak,
        "lastUpdated": datetime.now().isoformat()
    }

def calculate_weekly_progress(student):
    """Calculate weekly study progress"""
    activity_log = student.get("activityLog", [])
    
    # Get activities from last 7 days
    week_ago = datetime.now() - timedelta(days=7)
    weekly_activities = [a for a in activity_log 
                        if datetime.fromisoformat(a.get("timestamp", "2000-01-01")) > week_ago]
    
    # Calculate completion rate
    assignments = student.get("assignments", {})
    pending = len(assignments.get("pending", []))
    graded = len(assignments.get("graded", []))
    total = pending + graded
    
    completion_rate = round((graded / total * 100)) if total > 0 else 0
    
    return {
        "completionRate": completion_rate,
        "activitiesCount": len(weekly_activities),
        "studyHours": round(len(weekly_activities) * 1.5, 1)  # Estimate
    }

def calculate_study_streak(activity_log):
    """Calculate consecutive days of study activity"""
    if not activity_log:
        return 0
    
    # Get unique dates with activity
    activity_dates = set()
    for activity in activity_log:
        try:
            date = datetime.fromisoformat(activity.get("timestamp", "")).date()
            activity_dates.add(date)
        except:
            continue
    
    # Calculate streak
    today = datetime.now().date()
    streak = 0
    
    for i in range(365):  # Check up to 1 year back
        check_date = today - timedelta(days=i)
        if check_date in activity_dates:
            streak += 1
        elif i == 0:  # No activity today yet, continue checking
            continue
        else:
            break
    
    return streak

def generate_live_activities(student):
    """Generate system activities based on current state"""
    activities = []
    now = datetime.now().isoformat()
    
    # Check for pending assignments
    pending = student.get("assignments", {}).get("pending", [])
    if pending:
        activities.append({
            "action": "Assignment Due Soon",
            "details": f"You have {len(pending)} pending assignments",
            "timestamp": now,
            "type": "reminder"
        })
    
    # Check study streak
    streak = calculate_study_streak(student.get("activityLog", []))
    if streak > 0:
        activities.append({
            "action": "Study Streak",
            "details": f"You're on a {streak}-day study streak! Keep it up!",
            "timestamp": now,
            "type": "achievement"
        })
    
    # Check subscription
    subscription = student.get("subscription", {})
    if subscription.get("status") == "trial":
        days_left = subscription.get("daysLeft", 0)
        if days_left <= 5:
            activities.append({
                "action": "Trial Expiring",
                "details": f"Your trial expires in {days_left} days. Upgrade now!",
                "timestamp": now,
                "type": "alert"
            })
    
    return activities

def generate_live_notifications(student):
    """Generate real-time notifications"""
    notifications = []
    now = datetime.now()
    
    # Get existing notifications
    existing = student.get("notifications", [])
    
    # Add deadline reminders
    pending = student.get("assignments", {}).get("pending", [])
    for assignment in pending:
        due_date = assignment.get("dueDate")
        if due_date:
            try:
                due = datetime.fromisoformat(due_date)
                days_until = (due - now).days
                
                if days_until == 0:
                    notifications.append({
                        "id": f"due_today_{assignment.get('id', '0')}",
                        "title": "Due Today!",
                        "message": f"'{assignment.get('title', 'Assignment')}' is due today",
                        "type": "urgent",
                        "timestamp": now.isoformat(),
                        "read": False
                    })
                elif days_until == 1:
                    notifications.append({
                        "id": f"due_tomorrow_{assignment.get('id', '0')}",
                        "title": "Due Tomorrow",
                        "message": f"'{assignment.get('title', 'Assignment')}' is due tomorrow",
                        "type": "warning",
                        "timestamp": now.isoformat(),
                        "read": False
                    })
            except:
                continue
    
    # Add performance notification
    grades = student.get("grades", {})
    cgpa = grades.get("cgpa", 0)
    if cgpa >= 9.0:
        notifications.append({
            "id": "high_performance",
            "title": "Outstanding Performance!",
            "message": f"Your CGPA of {cgpa} puts you in the top 10%",
            "type": "success",
            "timestamp": now.isoformat(),
            "read": False
        })
    
    # Combine with existing notifications
    all_notifications = notifications + existing
    
    # Sort by timestamp (newest first)
    all_notifications.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    
    return all_notifications[:20]  # Return last 20


# API: Get Student Profile
@app.route("/api/student/profile", methods=["GET"])
def get_student_profile():
    """Get current student's profile information"""
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    students = load_students()
    student_id = session["student_id"]
    
    if student_id not in students:
        return jsonify({"success": False, "message": "Student not found"})
    
    student = students[student_id]
    
    return jsonify({
        "success": True,
        "student": {
            "firstName": student.get("firstName", ""),
            "lastName": student.get("lastName", ""),
            "email": student.get("email", ""),
            "phone": student.get("phone", ""),
            "profilePhoto": student.get("profilePhoto", None)
        }
    })


# API: Update Student Profile
@app.route("/api/student/update-profile", methods=["POST"])
def update_student_profile():
    """Update student profile information and photo"""
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    students = load_students()
    student_id = session["student_id"]
    
    if student_id not in students:
        return jsonify({"success": False, "message": "Student not found"})
    
    student = students[student_id]
    
    # Update text fields
    if "firstName" in request.form:
        student["firstName"] = request.form["firstName"]
    if "lastName" in request.form:
        student["lastName"] = request.form["lastName"]
    if "phone" in request.form:
        student["phone"] = request.form["phone"]
    
    # Handle profile photo upload
    if "profilePhoto" in request.files:
        photo = request.files["profilePhoto"]
        if photo.filename:
            # Validate file type
            allowed_extensions = {"jpg", "jpeg", "png", "gif"}
            file_ext = photo.filename.rsplit(".", 1)[1].lower() if "." in photo.filename else ""
            
            if file_ext not in allowed_extensions:
                return jsonify({"success": False, "message": "Invalid file type. Use JPG, PNG, or GIF."})
            
            # Create uploads directory for profile photos
            profile_uploads = os.path.join(UPLOAD_FOLDER, "profiles")
            os.makedirs(profile_uploads, exist_ok=True)
            
            # Save file with student ID as filename
            filename = f"{student_id}.{file_ext}"
            filepath = os.path.join(profile_uploads, filename)
            photo.save(filepath)
            
            # Store relative path in student record
            student["profilePhoto"] = f"/uploads/profiles/{filename}"
    
    # Save updated student data
    save_students(students)
    
    return jsonify({
        "success": True,
        "message": "Profile updated successfully",
        "student": {
            "firstName": student.get("firstName", ""),
            "lastName": student.get("lastName", ""),
            "email": student.get("email", ""),
            "phone": student.get("phone", ""),
            "profilePhoto": student.get("profilePhoto", None)
        }
    })


if __name__ == "__main__":
    app.run(debug=True)
