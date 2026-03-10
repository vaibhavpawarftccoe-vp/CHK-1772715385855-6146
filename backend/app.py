
from flask import Flask, render_template, request, jsonify, session, send_file
from chatbot import get_response
import json
import os
from datetime import datetime
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

# Initialize students database
def init_students_db():
    if not os.path.exists(STUDENTS_FILE):
        with open(STUDENTS_FILE, "w") as f:
            json.dump({}, f)

# Load students data
def load_students():
    init_students_db()
    with open(STUDENTS_FILE, "r") as f:
        return json.load(f)

# Save students data
def save_students(students):
    with open(STUDENTS_FILE, "w") as f:
        json.dump(students, f, indent=2)

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

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json["message"]
    reply = get_response(user_message)
    return jsonify({"reply": reply})

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
        
        # Fees & Financial (all FREE)
        "fees": {
            "totalFees": 0,
            "paid": 0,
            "scholarships": [],
            "status": "FREE - No fees applicable"
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
        "lectureProgress": {}
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

# API: Get Student Info
@app.route("/api/student/info", methods=["GET"])
def get_student_info():
    if "student_id" not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    students = load_students()
    student_id = session["student_id"]
    
    if student_id in students:
        student = students[student_id]
        # Return full student data including academic info
        return jsonify({
            "success": True,
            "student": student
        })
    
    return jsonify({"success": False, "message": "Student not found"})


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


if __name__ == "__main__":
    app.run(debug=True)
