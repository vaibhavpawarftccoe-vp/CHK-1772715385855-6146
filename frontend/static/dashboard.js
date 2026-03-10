/**
 * EduBot Dashboard JavaScript
 * Handles dashboard functionality and section navigation
 */

// Global student data
let studentData = null;

// ============================================
// Initialize Dashboard
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    loadStudentData();
    initChat();
});

// ============================================
// Load Complete Student Data
// ============================================
function loadStudentData() {
    // Fetch complete student data from server
    fetch('/api/student/info')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                studentData = data.student;
                // Store studentId in localStorage if not already there
                if (studentData.studentId) {
                    localStorage.setItem('studentId', studentData.studentId);
                }
                updateDashboardUI();
            } else {
                // Not logged in, redirect to login
                window.location.href = '/login';
            }
        })
        .catch(error => {
            console.error('Error loading student data:', error);
            showToast('Error loading data', 'error');
        });
}

// ============================================
// Update Dashboard UI with Student Data
// ============================================
function updateDashboardUI() {
    if (!studentData) return;
    
    console.log('Updating dashboard with data:', studentData);
    
    const { firstName, lastName, studentId } = studentData;
    
    // Update sidebar profile
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : 'Unknown Student';
    const studentIdValue = studentId || 'N/A';
    
    const studentNameEl = document.getElementById('studentName');
    const studentIdEl = document.getElementById('studentId');
    
    if (studentNameEl) {
        studentNameEl.textContent = fullName;
    }
    if (studentIdEl) {
        studentIdEl.textContent = studentIdValue;
    }
    
    // Update ID display in overview
    const displayId = document.getElementById('displayStudentId');
    if (displayId) {
        displayId.textContent = studentIdValue;
    }
    
    // Update stats
    updateStats();
    
    // Update activity log
    updateActivityLog();
    
    // Update deadlines
    updateDeadlines();
}

// ============================================
// Update Statistics
// ============================================
function updateStats() {
    if (!studentData) return;

    const { courses: { current, enrolled }, assignments: { graded, pending }, grades: { cgpa } } = studentData;

    // Update course count
    const courseCount = current.length + enrolled.length;
    const courseStat = document.querySelector('.stat-card:nth-child(1) h3');
    if (courseStat) courseStat.textContent = courseCount || 6;

    // Update completed assignments
    const completedCount = graded.length;
    const completedStat = document.querySelector('.stat-card:nth-child(2) h3');
    if (completedStat) completedStat.textContent = completedCount || 24;

    // Update pending assignments
    const pendingCount = pending.length;
    const pendingStat = document.querySelector('.stat-card:nth-child(3) h3');
    if (pendingStat) pendingStat.textContent = pendingCount || 8;

    // Update CGPA
    const cgpaFormatted = cgpa.toFixed(2);
    const cgpaStat = document.querySelector('.stat-card:nth-child(4) h3');
    if (cgpaStat) cgpaStat.textContent = cgpaFormatted > 0 ? cgpaFormatted + '%' : '85%';
}

// ============================================
// Update Activity Log
// ============================================
function updateActivityLog() {
    if (!studentData || !studentData.activityLog) return;
    
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;
    
    // Get last 3 activities
    const recentActivities = studentData.activityLog.slice(-3).reverse();
    
    const activityIcons = {
        'Account Created': 'fa-user-plus',
        'Course Enrolled': 'fa-book',
        'Assignment Submitted': 'fa-check-circle',
        'Grade Added': 'fa-star',
        'Profile Updated': 'fa-user-edit',
        'Book Issued': 'fa-book-reader',
        'Achievement Added': 'fa-trophy'
    };
    
    activityList.innerHTML = recentActivities.map(activity => {
        const { action, timestamp, details } = activity;
        const icon = activityIcons[action] || 'fa-circle';
        const timeAgo = getTimeAgo(timestamp);
        
        return `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="activity-info">
                    <p>${action}: ${details}</p>
                    <span>${timeAgo}</span>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// Update Deadlines
// ============================================
function updateDeadlines() {
    if (!studentData || !studentData.assignments.pending) return;
    
    const deadlineList = document.querySelector('.deadline-list');
    if (!deadlineList) return;
    
    // Get pending assignments with due dates
    const pendingAssignments = studentData.assignments.pending
        .filter(a => a.dueDate)
        .slice(0, 3);
    
    if (pendingAssignments.length === 0) {
        deadlineList.innerHTML = '<p style="text-align: center; color: #64748b;">No pending deadlines</p>';
        return;
    }
    
    deadlineList.innerHTML = pendingAssignments.map(({ dueDate: dueDateStr, title, course }) => {
        const dueDate = new Date(dueDateStr);
        const day = dueDate.getDate();
        const month = dueDate.toLocaleString('default', { month: 'short' }).toUpperCase();
        
        return `
            <div class="deadline-item">
                <div class="deadline-date">
                    <span class="day">${day}</span>
                    <span class="month">${month}</span>
                </div>
                <div class="deadline-info">
                    <p>${title}</p>
                    <span>${course}</span>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// Helper: Get Time Ago
// ============================================
function getTimeAgo(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
}

// ============================================
// Load Courses Section
// ============================================
function loadCoursesSection() {
    if (!studentData) return;
    
    // Update course count
    const allCourses = [...studentData.courses.current, ...studentData.courses.enrolled];
    document.getElementById('courseCount').textContent = `${allCourses.length} Courses`;
    
    // Populate courses list
    const coursesList = document.getElementById('coursesList');
    if (allCourses.length === 0) {
        coursesList.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">No courses enrolled yet</p>';
    } else {
        coursesList.innerHTML = allCourses.map(course => {
            const { courseName, courseCode, credits } = course;
            return `
                <div class="course-item">
                    <div class="course-icon">
                        <i class="fas fa-book"></i>
                    </div>
                    <div class="course-details">
                        <h4>${courseName || course}</h4>
                        <p>${courseCode || 'N/A'} • ${credits || 3} Credits</p>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Update academic info
    const { academic } = studentData;
    if (academic) {
        const { department, program, currentSemester, rollNumber, batch } = academic;
        document.getElementById('deptName').textContent = department || '-';
        document.getElementById('programName').textContent = program || '-';
        document.getElementById('currentSemester').textContent = `Semester ${currentSemester || 1}`;
        document.getElementById('rollNumber').textContent = rollNumber || '-';
        document.getElementById('batchYear').textContent = batch || '-';
    }
}

// ============================================
// Load Assignments Section
// ============================================
function loadAssignmentsSection() {
    if (!studentData) return;
    
    // Update counts
    const pending = studentData.assignments.pending || [];
    const submitted = studentData.assignments.submitted || [];
    
    document.getElementById('pendingCount').textContent = pending.length;
    document.getElementById('submittedCount').textContent = submitted.length;
    
    // Pending assignments
    const pendingList = document.getElementById('pendingAssignments');
    if (pending.length === 0) {
        pendingList.innerHTML = '<p style="text-align: center; color: #64748b; padding: 1rem;">No pending assignments</p>';
    } else {
        pendingList.innerHTML = pending.map(assignment => {
            const { title, course, dueDate } = assignment;
            return `
                <div class="assignment-item">
                    <div class="assignment-status pending">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="assignment-details">
                        <h4>${title}</h4>
                        <p>${course}</p>
                    </div>
                    <span class="assignment-due">Due: ${new Date(dueDate).toLocaleDateString()}</span>
                </div>
            `;
        }).join('');
    }
    
    // Submitted assignments
    const submittedList = document.getElementById('submittedAssignments');
    if (submitted.length === 0) {
        submittedList.innerHTML = '<p style="text-align: center; color: #64748b; padding: 1rem;">No submitted assignments</p>';
    } else {
        submittedList.innerHTML = submitted.map(assignment => {
            const { title, course } = assignment;
            return `
                <div class="assignment-item">
                    <div class="assignment-status submitted">
                        <i class="fas fa-check"></i>
                    </div>
                    <div class="assignment-details">
                        <h4>${title}</h4>
                        <p>${course}</p>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// ============================================
// Load Grades Section
// ============================================
function loadGradesSection() {
    if (!studentData) return;
    
    const { grades: { cgpa, totalCredits, earnedCredits, semesterWise, sgpa, creditPoints, totalCreditPoints }, level, certifications } = studentData;
    
    // Update Level Display
    const levelBadge = document.getElementById('levelBadge');
    const levelTitle = document.getElementById('levelTitle');
    const levelProgress = document.getElementById('levelProgress');
    const totalCreditPointsEl = document.getElementById('totalCreditPoints');
    const pointsToNextEl = document.getElementById('pointsToNext');
    
    if (levelBadge) levelBadge.textContent = `Level ${level?.current || 1}`;
    if (levelTitle) levelTitle.textContent = level?.title || 'Freshman';
    if (levelProgress) levelProgress.style.width = `${level?.progress || 0}%`;
    if (totalCreditPointsEl) totalCreditPointsEl.textContent = totalCreditPoints || 0;
    if (pointsToNextEl) pointsToNextEl.textContent = level?.pointsToNext || 100;
    
    // Update Level Icon based on level
    const levelIcon = document.getElementById('levelIcon');
    if (levelIcon) {
        const levelIcons = {
            1: 'fa-user-graduate',
            2: 'fa-book-reader',
            3: 'fa-star',
            4: 'fa-award',
            5: 'fa-medal',
            6: 'fa-trophy',
            7: 'fa-crown',
            8: 'fa-gem',
            9: 'fa-sun',
            10: 'fa-infinity'
        };
        levelIcon.className = `fas ${levelIcons[level?.current || 1]}`;
    }
    
    // Update summary
    document.getElementById('cgpaValue').textContent = cgpa ? cgpa.toFixed(2) : '0.00';
    document.getElementById('totalCredits').textContent = totalCredits || 0;
    document.getElementById('earnedCredits').textContent = earnedCredits || 0;
    document.getElementById('overallPercent').textContent = cgpa ? ((cgpa / 10) * 100).toFixed(0) + '%' : '0%';
    
    // Update semester grades
    const semesterContainer = document.getElementById('semesterGrades');
    
    if (Object.keys(semesterWise).length === 0) {
        semesterContainer.innerHTML = '<p style="text-align: center; color: #64748b; padding: 1rem;">No grades recorded yet</p>';
    } else {
        semesterContainer.innerHTML = Object.entries(semesterWise).map(([semester, gradesList]) => {
            const semesterPoints = creditPoints?.[semester] || 0;
            return `
            <div class="semester-block">
                <div class="semester-header">
                    <h4>
                        Semester ${semester}
                        <span class="semester-credit-points">
                            <i class="fas fa-coins"></i> ${semesterPoints} CP
                        </span>
                    </h4>
                    <span class="semester-sgpa">SGPA: ${sgpa[semester]?.toFixed(2) || '0.00'}</span>
                </div>
                ${gradesList.map(grade => {
                    const { courseName, grade: gradeValue, marks, maxMarks } = grade;
                    return `
                        <div class="grade-row">
                            <span>${courseName}</span>
                            <strong>${gradeValue} (${marks}/${maxMarks})</strong>
                        </div>
                    `;
                }).join('')}
            </div>
        `}).join('');
    }
    
    // Update Certificates
    const certCount = document.getElementById('certCount');
    const certificatesList = document.getElementById('certificatesList');
    
    if (certCount) certCount.textContent = certifications?.length || 0;
    
    if (certificatesList) {
        if (!certifications || certifications.length === 0) {
            certificatesList.innerHTML = '<p style="text-align: center; color: #64748b; padding: 1rem;">Complete semesters to unlock certificates!</p>';
        } else {
            certificatesList.innerHTML = certifications.map(cert => `
                <div class="certificate-item ${cert.color}">
                    <div class="certificate-icon">
                        <i class="fas ${cert.icon}"></i>
                    </div>
                    <h4>${cert.name}</h4>
                    <p>${cert.description}</p>
                    <span class="certificate-date">${new Date(cert.unlockedAt).toLocaleDateString()}</span>
                </div>
            `).join('');
        }
    }
}

// ============================================
// Load Resources Section
// ============================================
function loadResourcesSection() {
    if (!studentData) return;
    
    // Update library status
    const library = studentData.library || {};
    document.getElementById('booksIssued').textContent = library.booksIssued?.length || 0;
    document.getElementById('booksReturned').textContent = library.booksReturned?.length || 0;
    document.getElementById('libraryFines').textContent = `₹${library.fines || 0}`;
}

// ============================================
// Load Quiz Section
// ============================================
function loadQuizSection() {
    if (!studentData) return;
    
    // Update today's date
    const todayDate = document.getElementById('todayDate');
    if (todayDate) {
        todayDate.textContent = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    
    // Load quiz history
    const quizHistory = document.getElementById('quizHistory');
    const quizzes = studentData.quizzes || [];
    
    if (quizCount) quizCount.textContent = quizzes.length;
    
    if (quizzes.length === 0) {
        if (quizHistory) quizHistory.innerHTML = '<p style="text-align: center; color: #64748b; padding: 1rem;">No quizzes attempted yet</p>';
    } else {
        if (quizHistory) {
            quizHistory.innerHTML = quizzes.slice(-5).reverse().map(quiz => `
                <div class="history-item">
                    <div class="history-info">
                        <h4>${quiz.subject}</h4>
                        <span>${new Date(quiz.date).toLocaleDateString()}</span>
                    </div>
                    <span class="history-score">${quiz.score}/${quiz.total}</span>
                </div>
            `).join('');
        }
    }
}

// ============================================
// Quiz Functions
// ============================================
let currentQuiz = null;
let quizTimer = null;

function startWeeklyQuiz() {
    const quizContent = document.getElementById('quizContent');
    const quizQuestions = document.getElementById('quizQuestions');
    
    if (quizContent) quizContent.style.display = 'none';
    if (quizQuestions) {
        quizQuestions.style.display = 'block';
        quizQuestions.innerHTML = generateQuizQuestions();
    }
    
    // Start timer
    let timeLeft = 45 * 60; // 45 minutes
    quizTimer = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const timerEl = document.getElementById('quizTimer');
        if (timerEl) timerEl.textContent = `Time Left: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(quizTimer);
            submitQuiz();
        }
    }, 1000);
}

function generateQuizQuestions() {
    const questions = [
        {
            question: "What is the time complexity of binary search?",
            options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
            correct: 1
        },
        {
            question: "Which data structure uses LIFO?",
            options: ["Queue", "Stack", "Array", "Linked List"],
            correct: 1
        },
        {
            question: "What is the primary key in a database?",
            options: ["A foreign key", "A unique identifier", "An index", "A constraint"],
            correct: 1
        },
        {
            question: "Which sorting algorithm has the best average case?",
            options: ["Bubble Sort", "Quick Sort", "Merge Sort", "Insertion Sort"],
            correct: 2
        },
        {
            question: "What does SQL stand for?",
            options: ["Simple Query Language", "Structured Query Language", "Standard Query Language", "System Query Language"],
            correct: 1
        }
    ];
    
    currentQuiz = { questions, answers: [] };
    
    return questions.map((q, idx) => `
        <div class="question-item">
            <h4>Question ${idx + 1}: ${q.question}</h4>
            <div class="question-options">
                ${q.options.map((opt, optIdx) => `
                    <label class="option-label">
                        <input type="radio" name="q${idx}" value="${optIdx}" onchange="selectAnswer(${idx}, ${optIdx})">
                        <span>${opt}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('') + `
        <button class="btn-quiz-start" onclick="submitQuiz()" style="margin-top: 1rem;">
            <i class="fas fa-check"></i> Submit Quiz
        </button>
    `;
}

function selectAnswer(questionIdx, answerIdx) {
    if (currentQuiz) {
        currentQuiz.answers[questionIdx] = answerIdx;
    }
}

function submitQuiz() {
    clearInterval(quizTimer);
    
    if (!currentQuiz) return;
    
    let score = 0;
    currentQuiz.questions.forEach((q, idx) => {
        if (currentQuiz.answers[idx] === q.correct) score++;
    });
    
    const percentage = (score / currentQuiz.questions.length) * 100;
    
    // Show results
    const quizQuestions = document.getElementById('quizQuestions');
    const quizResults = document.getElementById('quizResults');
    
    if (quizQuestions) quizQuestions.style.display = 'none';
    if (quizResults) {
        quizResults.style.display = 'block';
        quizResults.innerHTML = `
            <div class="result-score">${score}/${currentQuiz.questions.length}</div>
            <div class="result-message">${percentage >= 80 ? 'Excellent! 🎉' : percentage >= 60 ? 'Good Job! 👍' : 'Keep Practicing! 💪'}</div>
            <p>You scored ${percentage.toFixed(0)}%</p>
            <button class="btn-quiz-start" onclick="resetQuiz()" style="margin-top: 1rem;">
                <i class="fas fa-redo"></i> Try Again
            </button>
        `;
    }
    
    // Save quiz result
    saveQuizResult(score, currentQuiz.questions.length);
}

function resetQuiz() {
    const quizContent = document.getElementById('quizContent');
    const quizResults = document.getElementById('quizResults');
    
    if (quizContent) quizContent.style.display = 'block';
    if (quizResults) quizResults.style.display = 'none';
    
    const timerEl = document.getElementById('quizTimer');
    if (timerEl) timerEl.textContent = 'Time Left: 45:00';
    
    currentQuiz = null;
}

function saveQuizResult(score, total) {
    fetch('/api/student/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            subject: 'Weekly Quiz',
            score: score,
            total: total,
            date: new Date().toISOString()
        })
    }).catch(error => console.error('Error saving quiz:', error));
}

// ============================================
// Load Attendance Section
// ============================================
function loadAttendanceSection() {
    if (!studentData) return;
    
    // Set today's date
    const todayDate = document.getElementById('todayDate');
    if (todayDate) {
        todayDate.textContent = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    
    // Generate today's lectures
    const todayLectures = document.getElementById('todayLectures');
    const lectures = [
        { time: '09:00 AM', subject: 'Data Structures', teacher: 'Prof. Sharma' },
        { time: '10:30 AM', subject: 'Algorithms', teacher: 'Prof. Patel' },
        { time: '01:00 PM', subject: 'Database Systems', teacher: 'Prof. Kumar' },
        { time: '02:30 PM', subject: 'Web Development', teacher: 'Prof. Singh' }
    ];
    
    if (todayLectures) {
        todayLectures.innerHTML = lectures.map((lec, idx) => `
            <div class="lecture-item">
                <span class="lecture-time">${lec.time}</span>
                <div class="lecture-info">
                    <h4>${lec.subject}</h4>
                    <span>${lec.teacher}</span>
                </div>
                <div class="lecture-status">
                    <button class="status-btn present ${studentData.todayAttendance?.[idx] === 'present' ? 'active' : ''}" onclick="markAttendance(${idx}, 'present')">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="status-btn absent ${studentData.todayAttendance?.[idx] === 'absent' ? 'active' : ''}" onclick="markAttendance(${idx}, 'absent')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Update attendance stats
    updateAttendanceStats();
    
    // Update weekly attendance bars
    updateWeeklyAttendance();
    
    // Update overall attendance circle
    updateOverallAttendance();
}

function markAttendance(lectureIdx, status) {
    if (!studentData.todayAttendance) studentData.todayAttendance = {};
    studentData.todayAttendance[lectureIdx] = status;
    
    // Update UI
    loadAttendanceSection();
    
    // Save to server
    fetch('/api/student/attendance/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            lectureIdx: lectureIdx,
            status: status,
            date: new Date().toISOString().split('T')[0]
        })
    }).catch(error => console.error('Error saving attendance:', error));
}

function updateAttendanceStats() {
    const todayAttendance = studentData.todayAttendance || {};
    const present = Object.values(todayAttendance).filter(s => s === 'present').length;
    const absent = Object.values(todayAttendance).filter(s => s === 'absent').length;
    const total = 4; // Total lectures per day
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    const presentCount = document.getElementById('presentCount');
    const absentCount = document.getElementById('absentCount');
    const todayPercentage = document.getElementById('todayPercentage');
    
    if (presentCount) presentCount.textContent = present;
    if (absentCount) absentCount.textContent = absent;
    if (todayPercentage) todayPercentage.textContent = percentage + '%';
}

function updateWeeklyAttendance() {
    const weeklyData = studentData.weeklyAttendance || {
        mon: 85, tue: 90, wed: 75, thu: 100, fri: 80, sat: 95
    };
    
    Object.entries(weeklyData).forEach(([day, percent]) => {
        const bar = document.getElementById(day + 'Bar');
        const percentEl = document.getElementById(day + 'Percent');
        if (bar) bar.style.height = percent + '%';
        if (percentEl) percentEl.textContent = percent + '%';
    });
}

function updateOverallAttendance() {
    const attendance = studentData.attendance || { overall: 85, present: 68, absent: 10, leave: 2 };
    
    const overallText = document.getElementById('overallAttendanceText');
    const overallBadge = document.getElementById('overallAttendanceBadge');
    const circle = document.getElementById('attendanceCircle');
    const totalPresent = document.getElementById('totalPresent');
    const totalAbsent = document.getElementById('totalAbsent');
    const totalLeave = document.getElementById('totalLeave');
    
    if (overallText) overallText.textContent = attendance.overall + '%';
    if (overallBadge) overallBadge.textContent = attendance.overall + '%';
    if (totalPresent) totalPresent.textContent = attendance.present || 0;
    if (totalAbsent) totalAbsent.textContent = attendance.absent || 0;
    if (totalLeave) totalLeave.textContent = attendance.leave || 0;
    
    // Update circle progress
    if (circle) {
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (attendance.overall / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }
}

// ============================================
// Academic Calendar Functions
// ============================================
let currentCalendarMonth = new Date();
let calendarEvents = [];

function loadCalendarSection() {
    if (!studentData) return;
    
    // Load events
    calendarEvents = studentData.academicEvents || getDefaultEvents();
    
    // Render calendar
    renderCalendar();
    
    // Update upcoming events
    updateUpcomingEvents();
    
    // Update category counts
    updateEventCategories();
}

function getDefaultEvents() {
    const year = new Date().getFullYear();
    return [
        { date: `${year}-03-15`, title: 'Mid-term Exam', type: 'exam' },
        { date: `${year}-03-20`, title: 'Technical Fest', type: 'event' },
        { date: `${year}-03-25`, title: 'Project Deadline', type: 'deadline' },
        { date: `${year}-03-30`, title: 'Holi Holiday', type: 'holiday' },
        { date: `${year}-04-05`, title: 'Assignment Due', type: 'deadline' },
        { date: `${year}-04-10`, title: 'Quiz Competition', type: 'event' }
    ];
}

function renderCalendar() {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();
    
    // Update month display
    const monthEl = document.getElementById('currentMonth');
    if (monthEl) {
        monthEl.textContent = currentCalendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    
    // Get first day and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;
    
    let html = '';
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        html += `<div class="calendar-day other-month"><span class="calendar-day-number">${daysInPrevMonth - i}</span></div>`;
    }
    
    // Current month days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
        const dayEvents = calendarEvents.filter(e => e.date === dateStr);
        const eventClass = dayEvents.length > 0 ? 'has-event ' + dayEvents[0].type : '';
        
        html += `<div class="calendar-day ${isToday ? 'today' : ''} ${eventClass}" onclick="showDayEvents('${dateStr}')">
            <span class="calendar-day-number">${day}</span>
        </div>`;
    }
    
    // Next month days
    const remainingCells = 42 - (firstDay + daysInMonth);
    for (let day = 1; day <= remainingCells; day++) {
        html += `<div class="calendar-day other-month"><span class="calendar-day-number">${day}</span></div>`;
    }
    
    grid.innerHTML = html;
}

function changeMonth(delta) {
    currentCalendarMonth.setMonth(currentCalendarMonth.getMonth() + delta);
    renderCalendar();
}

function updateUpcomingEvents() {
    const today = new Date().toISOString().split('T')[0];
    const upcoming = calendarEvents.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
    
    const eventsList = document.getElementById('upcomingEvents');
    const eventsCount = document.getElementById('eventsCount');
    
    if (eventsCount) eventsCount.textContent = upcoming.length;
    
    if (upcoming.length === 0) {
        if (eventsList) eventsList.innerHTML = '<p style="text-align: center; color: #64748b; padding: 1rem;">No upcoming events</p>';
    } else {
        if (eventsList) {
            eventsList.innerHTML = upcoming.slice(0, 5).map(event => {
                const date = new Date(event.date);
                return `
                    <div class="event-item ${event.type}">
                        <div class="event-date">
                            <span class="day">${date.getDate()}</span>
                            <span class="month">${date.toLocaleDateString('en-US', { month: 'short' })}</span>
                        </div>
                        <div class="event-info">
                            <h4>${event.title}</h4>
                            <p>${event.type.charAt(0).toUpperCase() + event.type.slice(1)}</p>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

function updateEventCategories() {
    const counts = {
        all: calendarEvents.length,
        exam: calendarEvents.filter(e => e.type === 'exam').length,
        event: calendarEvents.filter(e => e.type === 'event').length,
        holiday: calendarEvents.filter(e => e.type === 'holiday').length,
        deadline: calendarEvents.filter(e => e.type === 'deadline').length
    };
    
    Object.entries(counts).forEach(([type, count]) => {
        const el = document.getElementById(type + 'Count');
        if (el) el.textContent = count;
    });
}

function filterEvents(type) {
    const today = new Date().toISOString().split('T')[0];
    let filtered = calendarEvents.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
    
    if (type !== 'all') {
        filtered = filtered.filter(e => e.type === type);
    }
    
    const eventsList = document.getElementById('upcomingEvents');
    if (eventsList) {
        if (filtered.length === 0) {
            eventsList.innerHTML = '<p style="text-align: center; color: #64748b; padding: 1rem;">No events found</p>';
        } else {
            eventsList.innerHTML = filtered.map(event => {
                const date = new Date(event.date);
                return `
                    <div class="event-item ${event.type}">
                        <div class="event-date">
                            <span class="day">${date.getDate()}</span>
                            <span class="month">${date.toLocaleDateString('en-US', { month: 'short' })}</span>
                        </div>
                        <div class="event-info">
                            <h4>${event.title}</h4>
                            <p>${event.type.charAt(0).toUpperCase() + event.type.slice(1)}</p>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

function showDayEvents(dateStr) {
    const dayEvents = calendarEvents.filter(e => e.date === dateStr);
    if (dayEvents.length > 0) {
        const eventNames = dayEvents.map(e => e.title).join(', ');
        showToast(`Events on ${dateStr}: ${eventNames}`, 'info');
    }
}

// ============================================
// Override Show Section to Load Data
// ============================================
const originalShowSection = showSection;
showSection = function(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update page title
    const titles = {
        'overview': 'Dashboard Overview',
        'courses': 'My Courses',
        'assignments': 'Assignments',
        'grades': 'Grades',
        'schedule': 'Class Schedule',
        'quiz': 'Weekly Quiz',
        'attendance': 'Daily Attendance',
        'calendar': 'Academic Calendar',
        'resources': 'Study Resources',
        'chat': 'Chat with EduBot',
        'settings': 'Account Settings'
    };
    document.getElementById('pageTitle').textContent = titles[sectionId] || 'Dashboard';
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.nav-item').classList.add('active');
    
    // Load section-specific data
    if (sectionId === 'courses') loadCoursesSection();
    if (sectionId === 'assignments') loadAssignmentsSection();
    if (sectionId === 'grades') loadGradesSection();
    if (sectionId === 'quiz') loadQuizSection();
    if (sectionId === 'attendance') loadAttendanceSection();
    if (sectionId === 'calendar') loadCalendarSection();
    if (sectionId === 'projects') loadProjectsSection();
    if (sectionId === 'resources') loadResourcesSection();
};

// ============================================
// Projects & File Upload Functions
// ============================================
let selectedFiles = [];
const MAX_STORAGE_MB = 50;

function loadProjectsSection() {
    if (!studentData) return;
    
    // Load projects
    const projects = studentData.projects || [];
    displayProjects(projects);
    
    // Update storage stats
    updateStorageStats();
    
    // Update recent uploads
    updateRecentUploads(projects);
}

// Drag and Drop Handlers
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    addFiles(files);
}

function addFiles(files) {
    const allowedTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip', 'rar', '7z', 'py', 'java', 'cpp', 'c', 'html', 'css', 'js', 'txt', 'jpg', 'jpeg', 'png', 'gif'];
    
    files.forEach(file => {
        const extension = file.name.split('.').pop().toLowerCase();
        if (allowedTypes.includes(extension)) {
            if (!selectedFiles.find(f => f.name === file.name)) {
                selectedFiles.push(file);
            }
        } else {
            showToast(`File type .${extension} not allowed`, 'error');
        }
    });
    
    if (selectedFiles.length > 0) {
        document.getElementById('uploadDetails').style.display = 'block';
        displaySelectedFiles();
    }
}

function displaySelectedFiles() {
    const container = document.getElementById('selectedFiles');
    container.innerHTML = selectedFiles.map((file, index) => `
        <div class="file-item">
            <i class="fas ${getFileIcon(file.name)}"></i>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
            <button class="file-remove" onclick="removeFile(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    if (selectedFiles.length === 0) {
        document.getElementById('uploadDetails').style.display = 'none';
    } else {
        displaySelectedFiles();
    }
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        pdf: 'fa-file-pdf',
        doc: 'fa-file-word', docx: 'fa-file-word',
        ppt: 'fa-file-powerpoint', pptx: 'fa-file-powerpoint',
        zip: 'fa-file-archive', rar: 'fa-file-archive', '7z': 'fa-file-archive',
        py: 'fa-file-code', java: 'fa-file-code', cpp: 'fa-file-code', c: 'fa-file-code',
        html: 'fa-file-code', css: 'fa-file-code', js: 'fa-file-code',
        txt: 'fa-file-alt',
        jpg: 'fa-file-image', jpeg: 'fa-file-image', png: 'fa-file-image', gif: 'fa-file-image'
    };
    return icons[ext] || 'fa-file';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function cancelUpload() {
    selectedFiles = [];
    document.getElementById('uploadDetails').style.display = 'none';
    document.getElementById('projectTitle').value = '';
    document.getElementById('projectDescription').value = '';
    document.getElementById('projectSubject').value = '';
    document.getElementById('projectType').value = 'assignment';
}

async function uploadFiles() {
    const title = document.getElementById('projectTitle').value.trim();
    const subject = document.getElementById('projectSubject').value;
    
    if (!title) {
        showToast('Please enter a project title', 'error');
        return;
    }
    if (!subject) {
        showToast('Please select a subject', 'error');
        return;
    }
    if (selectedFiles.length === 0) {
        showToast('Please select files to upload', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', document.getElementById('projectDescription').value);
    formData.append('subject', subject);
    formData.append('type', document.getElementById('projectType').value);
    
    selectedFiles.forEach(file => {
        formData.append('files', file);
    });
    
    // Show progress
    document.getElementById('uploadProgress').style.display = 'block';
    
    try {
        const response = await fetch('/api/student/projects/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Files uploaded successfully!', 'success');
            cancelUpload();
            // Reload projects
            await loadStudentData();
            loadProjectsSection();
        } else {
            showToast(result.message || 'Upload failed', 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showToast('Upload failed', 'error');
    } finally {
        document.getElementById('uploadProgress').style.display = 'none';
        document.getElementById('progressBarFill').style.width = '0%';
        document.getElementById('progressText').textContent = '0%';
    }
}

function displayProjects(projects) {
    const container = document.getElementById('projectsList');
    const countEl = document.getElementById('projectsCount');
    
    if (countEl) countEl.textContent = projects.length;
    
    if (projects.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">No projects uploaded yet</p>';
        return;
    }
    
    container.innerHTML = projects.slice().reverse().map(project => `
        <div class="project-item" data-type="${project.type}">
            <div class="project-icon">
                <i class="fas ${project.files && project.files[0] ? getFileIcon(project.files[0].filename) : 'fa-folder'}"></i>
            </div>
            <div class="project-info">
                <h4>${project.title}</h4>
                <p>${project.subject} • ${project.files ? project.files.length : 0} file(s)</p>
            </div>
            <div class="project-meta">
                <span class="project-type">${project.type}</span>
                <span class="project-date">${new Date(project.uploadDate).toLocaleDateString()}</span>
            </div>
            <div class="project-actions">
                ${project.files ? project.files.map((file, idx) => `
                    <button class="btn-download" onclick="downloadFile('${project.id}', ${idx})" title="Download ${file.filename}">
                        <i class="fas fa-download"></i>
                    </button>
                `).join('') : ''}
                <button class="btn-delete" onclick="deleteProject('${project.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function filterProjects(type) {
    // Update active button
    document.querySelectorAll('.projects-filter .filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter projects
    const projects = studentData.projects || [];
    const filtered = type === 'all' ? projects : projects.filter(p => p.type === type);
    displayProjects(filtered);
}

function updateStorageStats() {
    const projects = studentData.projects || [];
    let totalSize = 0;
    const typeSizes = {};
    
    projects.forEach(project => {
        if (project.files) {
            project.files.forEach(file => {
                totalSize += file.size || 0;
                const ext = file.filename.split('.').pop().toLowerCase();
                const category = getFileCategory(ext);
                typeSizes[category] = (typeSizes[category] || 0) + (file.size || 0);
            });
        }
    });
    
    const totalMB = totalSize / (1024 * 1024);
    const percent = Math.min(100, (totalMB / MAX_STORAGE_MB) * 100);
    const freeMB = Math.max(0, MAX_STORAGE_MB - totalMB);
    
    // Update circle
    const circle = document.getElementById('storageCircle');
    if (circle) {
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }
    
    // Update text
    const percentEl = document.getElementById('storagePercent');
    const usedEl = document.getElementById('storageUsed');
    const freeEl = document.getElementById('storageFree');
    
    if (percentEl) percentEl.textContent = Math.round(percent) + '%';
    if (usedEl) usedEl.textContent = totalMB.toFixed(1) + ' MB';
    if (freeEl) freeEl.textContent = freeMB.toFixed(1) + ' MB';
    
    // Update type bars
    const typeContainer = document.getElementById('storageByType');
    if (typeContainer && Object.keys(typeSizes).length > 0) {
        const colors = { documents: '#6366f1', images: '#10b981', archives: '#f59e0b', code: '#8b5cf6', other: '#94a3b8' };
        typeContainer.innerHTML = Object.entries(typeSizes).map(([type, size]) => {
            const typePercent = totalSize > 0 ? (size / totalSize) * 100 : 0;
            return `
                <div class="type-bar-item">
                    <span class="type-bar-label">${type}</span>
                    <div class="type-bar-track">
                        <div class="type-bar-fill" style="width: ${typePercent}%; background: ${colors[type] || colors.other}"></div>
                    </div>
                    <span class="type-bar-value">${formatFileSize(size)}</span>
                </div>
            `;
        }).join('');
    }
}

function getFileCategory(ext) {
    const categories = {
        documents: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'],
        images: ['jpg', 'jpeg', 'png', 'gif'],
        archives: ['zip', 'rar', '7z'],
        code: ['py', 'java', 'cpp', 'c', 'html', 'css', 'js']
    };
    
    for (const [cat, exts] of Object.entries(categories)) {
        if (exts.includes(ext)) return cat;
    }
    return 'other';
}

function updateRecentUploads(projects) {
    const container = document.getElementById('recentUploads');
    
    if (projects.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 1rem;">No recent uploads</p>';
        return;
    }
    
    const recent = projects.slice().reverse().slice(0, 5);
    container.innerHTML = recent.map(project => `
        <div class="recent-upload-item">
            <i class="fas ${project.files && project.files[0] ? getFileIcon(project.files[0].filename) : 'fa-folder'}"></i>
            <div class="recent-upload-info">
                <h5>${project.title}</h5>
                <span>${new Date(project.uploadDate).toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');
}

async function downloadFile(projectId, fileIndex) {
    try {
        const response = await fetch(`/api/student/projects/download/${projectId}/${fileIndex}`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = '';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            showToast('Download failed', 'error');
        }
    } catch (error) {
        console.error('Download error:', error);
        showToast('Download failed', 'error');
    }
}

async function deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
        const response = await fetch(`/api/student/projects/delete/${projectId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Project deleted successfully', 'success');
            await loadStudentData();
            loadProjectsSection();
        } else {
            showToast(result.message || 'Delete failed', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Delete failed', 'error');
    }
}

// ============================================
// Lecture Store Functions
// ============================================
let currentLecture = null;
let lecturesData = [];
const MAX_LECTURE_STORAGE_MB = 500;

// Sample lectures data - in production, this would come from the server
const sampleLectures = [
    {
        id: 'lec_001',
        title: 'Introduction to Data Structures',
        subject: 'Data Structures',
        duration: '45:30',
        size: 125 * 1024 * 1024,
        videoUrl: '/static/lectures/ds_intro.mp4',
        thumbnail: '/static/images/lecture1.jpg',
        description: 'Overview of data structures and their importance in programming'
    },
    {
        id: 'lec_002',
        title: 'Arrays and Linked Lists',
        subject: 'Data Structures',
        duration: '52:15',
        size: 148 * 1024 * 1024,
        videoUrl: '/static/lectures/ds_arrays.mp4',
        thumbnail: '/static/images/lecture2.jpg',
        description: 'Deep dive into arrays and linked lists implementation'
    },
    {
        id: 'lec_003',
        title: 'Sorting Algorithms',
        subject: 'Algorithms',
        duration: '48:45',
        size: 132 * 1024 * 1024,
        videoUrl: '/static/lectures/algo_sorting.mp4',
        thumbnail: '/static/images/lecture3.jpg',
        description: 'Bubble sort, quick sort, merge sort and their complexities'
    },
    {
        id: 'lec_004',
        title: 'SQL Basics',
        subject: 'Database',
        duration: '38:20',
        size: 98 * 1024 * 1024,
        videoUrl: '/static/lectures/db_sql.mp4',
        thumbnail: '/static/images/lecture4.jpg',
        description: 'Introduction to SQL queries and database operations'
    },
    {
        id: 'lec_005',
        title: 'HTML & CSS Fundamentals',
        subject: 'Web Development',
        duration: '55:00',
        size: 165 * 1024 * 1024,
        videoUrl: '/static/lectures/web_html_css.mp4',
        thumbnail: '/static/images/lecture5.jpg',
        description: 'Building responsive web pages with HTML5 and CSS3'
    },
    {
        id: 'lec_006',
        title: 'Introduction to Machine Learning',
        subject: 'Machine Learning',
        duration: '42:30',
        size: 118 * 1024 * 1024,
        videoUrl: '/static/lectures/ml_intro.mp4',
        thumbnail: '/static/images/lecture6.jpg',
        description: 'Overview of ML concepts and applications'
    }
];

function loadLecturesSection() {
    if (!studentData) return;
    
    lecturesData = studentData.lectures || sampleLectures;
    displayLectures(lecturesData);
    updateDownloadedList();
    updateWatchHistory();
    updateLectureStorageInfo();
    setupVideoPlayer();
    updateOnlineStatus();
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
}

function displayLectures(lectures) {
    const container = document.getElementById('lecturesList');
    const downloadedLectures = studentData.downloadedLectures || [];
    const completedLectures = studentData.completedLectures || [];
    const lectureProgress = studentData.lectureProgress || {};
    
    if (lectures.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">No lectures available</p>';
        return;
    }
    
    container.innerHTML = lectures.map(lecture => {
        const isDownloaded = downloadedLectures.includes(lecture.id);
        const isCompleted = completedLectures.includes(lecture.id);
        const progress = lectureProgress[lecture.id] || 0;
        
        let statusClass = '';
        let statusIcon = 'fa-circle';
        if (isCompleted) {
            statusClass = 'completed';
            statusIcon = 'fa-check-circle';
        } else if (isDownloaded) {
            statusClass = 'downloaded';
            statusIcon = 'fa-download';
        }
        
        return `
            <div class="lecture-item ${statusClass}" onclick="selectLectureById('${lecture.id}')" data-subject="${lecture.subject}">
                <div class="lecture-thumbnail">
                    <i class="fas fa-play-circle"></i>
                    <span class="duration">${lecture.duration}</span>
                </div>
                <div class="lecture-details">
                    <h4>${lecture.title}</h4>
                    <p>${lecture.subject} • ${formatFileSize(lecture.size)}</p>
                </div>
                <div class="lecture-meta">
                    <div class="lecture-status-icon ${isDownloaded ? 'downloaded' : isCompleted ? 'completed' : 'pending'}">
                        <i class="fas ${statusIcon}"></i>
                    </div>
                    ${progress > 0 ? `<span class="lecture-size">${Math.round(progress)}%</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function selectLectureById(lectureId) {
    const lecture = lecturesData.find(l => l.id === lectureId);
    if (!lecture) return;
    
    currentLecture = lecture;
    
    document.querySelectorAll('.lecture-item').forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    const videoInfo = document.getElementById('videoInfo');
    if (videoInfo) {
        videoInfo.innerHTML = `
            <h4>${lecture.title}</h4>
            <p>${lecture.description}</p>
        `;
    }
    
    document.getElementById('downloadBtn').disabled = false;
    document.getElementById('markCompleteBtn').disabled = false;
    
    loadVideo(lecture);
}

function loadVideo(lecture) {
    const video = document.getElementById('lectureVideo');
    const downloadedLectures = studentData.downloadedLectures || [];
    const isDownloaded = downloadedLectures.includes(lecture.id);
    
    if (!navigator.onLine && !isDownloaded) {
        showToast('This lecture is not available offline. Please download it first.', 'error');
        return;
    }
    
    video.src = lecture.videoUrl;
    showOfflineOverlay(isDownloaded && !navigator.onLine);
    
    const progress = studentData.lectureProgress?.[lecture.id] || 0;
    if (video.duration) {
        video.currentTime = (progress / 100) * video.duration;
    }
    updateVideoProgress(progress);
    
    video.play().catch(() => {});
}

function showOfflineOverlay(show) {
    const overlay = document.getElementById('videoOverlay');
    if (overlay) overlay.style.display = show ? 'flex' : 'none';
}

function setupVideoPlayer() {
    const video = document.getElementById('lectureVideo');
    if (!video) return;
    
    video.addEventListener('timeupdate', () => {
        if (!currentLecture || !video.duration) return;
        const progress = (video.currentTime / video.duration) * 100;
        updateVideoProgress(progress);
        if (Math.floor(video.currentTime) % 5 === 0) {
            saveLectureProgress(currentLecture.id, progress);
        }
    });
    
    video.addEventListener('ended', () => {
        if (currentLecture) {
            saveLectureProgress(currentLecture.id, 100);
            updateVideoProgress(100);
        }
    });
}

function updateVideoProgress(percent) {
    const fill = document.getElementById('videoProgressFill');
    const text = document.getElementById('progressPercent');
    if (fill) fill.style.width = percent + '%';
    if (text) text.textContent = Math.round(percent) + '%';
}

function saveLectureProgress(lectureId, progress) {
    if (!studentData.lectureProgress) studentData.lectureProgress = {};
    studentData.lectureProgress[lectureId] = progress;
    fetch('/api/student/lectures/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lectureId, progress })
    }).catch(() => {});
}

async function downloadCurrentLecture() {
    if (!currentLecture) return;
    const btn = document.getElementById('downloadBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
    
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (!studentData.downloadedLectures) studentData.downloadedLectures = [];
        if (!studentData.downloadedLectures.includes(currentLecture.id)) {
            studentData.downloadedLectures.push(currentLecture.id);
        }
        await fetch('/api/student/lectures/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lectureId: currentLecture.id })
        });
        showToast('Lecture downloaded for offline viewing!', 'success');
        updateDownloadedList();
        updateLectureStorageInfo();
        displayLectures(lecturesData);
    } catch (error) {
        showToast('Download failed. Please try again.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-download"></i> Download for Offline';
    }
}

async function markLectureComplete() {
    if (!currentLecture) return;
    if (!studentData.completedLectures) studentData.completedLectures = [];
    if (!studentData.completedLectures.includes(currentLecture.id)) {
        studentData.completedLectures.push(currentLecture.id);
        await fetch('/api/student/lectures/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lectureId: currentLecture.id })
        });
        showToast('Lecture marked as complete!', 'success');
        displayLectures(lecturesData);
        updateWatchHistory();
    }
}

function updateDownloadedList() {
    const container = document.getElementById('downloadedList');
    const countEl = document.getElementById('downloadedCount');
    const downloadedIds = studentData.downloadedLectures || [];
    const downloaded = lecturesData.filter(l => downloadedIds.includes(l.id));
    
    if (countEl) countEl.textContent = downloaded.length;
    if (downloaded.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 1rem;">No lectures downloaded yet</p>';
        return;
    }
    
    container.innerHTML = downloaded.map(lecture => `
        <div class="downloaded-item">
            <i class="fas fa-video"></i>
            <div class="downloaded-info">
                <h5>${lecture.title}</h5>
                <span>${formatFileSize(lecture.size)}</span>
            </div>
            <div class="downloaded-actions">
                <button onclick="playDownloadedLecture('${lecture.id}')" title="Play"><i class="fas fa-play"></i></button>
                <button class="btn-delete" onclick="removeDownloadedLecture('${lecture.id}')" title="Remove"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function playDownloadedLecture(lectureId) {
    const lecture = lecturesData.find(l => l.id === lectureId);
    if (lecture) {
        currentLecture = lecture;
        loadVideo(lecture);
    }
}

async function removeDownloadedLecture(lectureId) {
    if (!confirm('Remove this lecture from offline storage?')) return;
    studentData.downloadedLectures = (studentData.downloadedLectures || []).filter(id => id !== lectureId);
    await fetch(`/api/student/lectures/download/${lectureId}`, { method: 'DELETE' });
    showToast('Lecture removed from downloads', 'success');
    updateDownloadedList();
    updateLectureStorageInfo();
    displayLectures(lecturesData);
}

function updateWatchHistory() {
    const container = document.getElementById('watchHistory');
    const progress = studentData.lectureProgress || {};
    const watched = Object.entries(progress).filter(([_, p]) => p > 0).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    if (watched.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 1rem;">No lectures watched yet</p>';
        return;
    }
    
    container.innerHTML = watched.map(([lectureId, prog]) => {
        const lecture = lecturesData.find(l => l.id === lectureId);
        if (!lecture) return '';
        return `
            <div class="history-item">
                <i class="fas fa-history"></i>
                <div class="history-info">
                    <h5>${lecture.title}</h5>
                    <span>${lecture.subject}</span>
                </div>
                <span class="history-progress">${Math.round(prog)}%</span>
            </div>
        `;
    }).join('');
}

function updateLectureStorageInfo() {
    const downloadedIds = studentData.downloadedLectures || [];
    const downloaded = lecturesData.filter(l => downloadedIds.includes(l.id));
    const usedBytes = downloaded.reduce((sum, l) => sum + (l.size || 0), 0);
    const usedMB = usedBytes / (1024 * 1024);
    const percent = Math.min(100, (usedMB / MAX_LECTURE_STORAGE_MB) * 100);
    
    const fill = document.getElementById('lectureStorageFill');
    const text = document.getElementById('lectureStorageText');
    if (fill) fill.style.width = percent + '%';
    if (text) text.textContent = `${usedMB.toFixed(1)} MB / ${MAX_LECTURE_STORAGE_MB} MB used`;
}

function filterLectures() {
    const subjectFilter = document.getElementById('subjectFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const downloadedIds = studentData.downloadedLectures || [];
    const completedIds = studentData.completedLectures || [];
    
    let filtered = lecturesData;
    if (subjectFilter) filtered = filtered.filter(l => l.subject === subjectFilter);
    if (statusFilter) {
        filtered = filtered.filter(l => {
            if (statusFilter === 'downloaded') return downloadedIds.includes(l.id);
            if (statusFilter === 'completed') return completedIds.includes(l.id);
            if (statusFilter === 'pending') return !downloadedIds.includes(l.id) && !completedIds.includes(l.id);
            return true;
        });
    }
    displayLectures(filtered);
}

function updateOnlineStatus() {
    const isOnline = navigator.onLine;
    const statusBadge = document.getElementById('watchStatus');
    if (statusBadge) {
        statusBadge.textContent = isOnline ? 'Online' : 'Offline Mode';
        statusBadge.className = isOnline ? 'badge' : 'badge badge-warning';
    }
}

// ============================================
// Show Section
// ============================================
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update page title
    const titles = {
        'overview': 'Dashboard Overview',
        'courses': 'My Courses',
        'assignments': 'Assignments',
        'grades': 'Grades',
        'schedule': 'Class Schedule',
        'quiz': 'Weekly Quiz',
        'attendance': 'Daily Attendance',
        'calendar': 'Academic Calendar',
        'projects': 'Projects & Uploads',
        'resources': 'Study Resources',
        'chat': 'Chat with EduBot',
        'settings': 'Account Settings'
    };
    document.getElementById('pageTitle').textContent = titles[sectionId] || 'Dashboard';
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.nav-item').classList.add('active');
}

// ============================================
// Copy Student ID
// ============================================
function copyStudentId() {
    const studentId = document.getElementById('displayStudentId').textContent;
    
    navigator.clipboard.writeText(studentId).then(() => {
        showToast('Student ID copied to clipboard!', 'success');
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = studentId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Student ID copied to clipboard!', 'success');
    });
}

// ============================================
// Initialize Chat in Dashboard
// ============================================
function initChat() {
    const userInput = document.getElementById('userInput');
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendDashboardMessage();
            }
        });
    }
}

// ============================================
// Send Message from Dashboard
// ============================================
function sendDashboardMessage() {
    const userInput = document.getElementById('userInput');
    const chatbox = document.getElementById('chatbox');
    const message = userInput.value.trim();
    
    if (message === '') return;
    
    // Add user message
    addDashboardMessage(message, 'user');
    userInput.value = '';
    
    // Show typing indicator
    showDashboardTyping();
    
    // Send to server
    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message })
    })
    .then(response => response.json())
    .then(data => {
        removeDashboardTyping();
        setTimeout(() => {
            addDashboardMessage(data.reply, 'bot');
        }, 300);
    })
    .catch(error => {
        removeDashboardTyping();
        addDashboardMessage('Sorry, I encountered an error. Please try again.', 'bot');
    });
}

// ============================================
// Add Message to Dashboard Chat
// ============================================
function addDashboardMessage(text, sender) {
    const chatbox = document.getElementById('chatbox');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    
    chatbox.appendChild(messageDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
}

// ============================================
// Show/Hide Typing Indicator
// ============================================
function showDashboardTyping() {
    const chatbox = document.getElementById('chatbox');
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot typing';
    typingDiv.id = 'dashboard-typing';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '<i class="fas fa-robot"></i>';
    
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(indicator);
    
    chatbox.appendChild(typingDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function removeDashboardTyping() {
    const typing = document.getElementById('dashboard-typing');
    if (typing) {
        typing.remove();
    }
}

// ============================================
// Toast Notification
// ============================================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    
    const icon = toast.querySelector('i');
    icon.className = 'fas';
    if (type === 'success') {
        icon.classList.add('fa-check-circle');
        icon.style.color = '#10b981';
    } else if (type === 'error') {
        icon.classList.add('fa-exclamation-circle');
        icon.style.color = '#ef4444';
    } else {
        icon.classList.add('fa-info-circle');
        icon.style.color = '#6366f1';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
