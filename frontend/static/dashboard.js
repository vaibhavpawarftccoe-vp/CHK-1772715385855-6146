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
                
                // Start live dashboard updates
                startLiveDashboard();
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
// Live Dashboard Functions
// ============================================
let liveUpdateInterval = null;
let isLiveDashboardActive = false;

function startLiveDashboard() {
    if (isLiveDashboardActive) return;
    
    isLiveDashboardActive = true;
    console.log('Starting live dashboard...');
    
    // Initial load
    fetchLiveMetrics();
    fetchLiveActivity();
    fetchLiveNotifications();
    
    // Set up polling every 10 seconds for live updates
    liveUpdateInterval = setInterval(() => {
        fetchLiveMetrics();
        fetchLiveActivity();
        fetchLiveNotifications();
    }, 10000); // 10 seconds
}

function stopLiveDashboard() {
    isLiveDashboardActive = false;
    if (liveUpdateInterval) {
        clearInterval(liveUpdateInterval);
        liveUpdateInterval = null;
    }
}

function fetchLiveMetrics() {
    fetch('/api/dashboard/live-metrics')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateLiveMetrics(data.metrics);
            }
        })
        .catch(error => console.error('Error fetching live metrics:', error));
}

function updateLiveMetrics(metrics) {
    // Update Active Courses
    const courseStat = document.getElementById('statCourses');
    if (courseStat && metrics.activeCourses) {
        const currentValue = parseInt(courseStat.textContent) || 0;
        const newValue = metrics.activeCourses.value;
        if (currentValue !== newValue) {
            animateNumber(courseStat, currentValue, newValue);
            showLiveUpdatePulse(courseStat.closest('.stat-card'));
        }
    }
    
    // Update Completed Tasks
    const completedStat = document.getElementById('statCompleted');
    if (completedStat && metrics.completedTasks) {
        const currentValue = parseInt(completedStat.textContent) || 0;
        const newValue = metrics.completedTasks.value;
        if (currentValue !== newValue) {
            animateNumber(completedStat, currentValue, newValue);
            showLiveUpdatePulse(completedStat.closest('.stat-card'));
        }
    }
    
    // Update Pending Tasks
    const pendingStat = document.getElementById('statPending');
    if (pendingStat && metrics.pendingTasks) {
        const currentValue = parseInt(pendingStat.textContent) || 0;
        const newValue = metrics.pendingTasks.value;
        if (currentValue !== newValue) {
            animateNumber(pendingStat, currentValue, newValue);
            showLiveUpdatePulse(pendingStat.closest('.stat-card'));
        }
    }
    
    // Update Performance Score
    const scoreStat = document.getElementById('statScore');
    if (scoreStat && metrics.performanceScore) {
        const currentValue = parseInt(scoreStat.textContent) || 0;
        const newValue = metrics.performanceScore.value;
        if (currentValue !== newValue) {
            animateNumber(scoreStat, currentValue, newValue, '%');
            showLiveUpdatePulse(scoreStat.closest('.stat-card'));
        }
    }
    
    // Update last updated timestamp
    updateLastUpdatedTime();
}

function showLiveUpdatePulse(cardElement) {
    if (!cardElement) return;
    
    cardElement.classList.add('live-update-pulse');
    setTimeout(() => {
        cardElement.classList.remove('live-update-pulse');
    }, 1000);
}

function updateLastUpdatedTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    
    // You can add a timestamp element to show last update time
    console.log(`Dashboard updated at ${timeString}`);
}

function fetchLiveActivity() {
    fetch('/api/dashboard/live-activity')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateLiveActivityFeed(data.activities);
            }
        })
        .catch(error => console.error('Error fetching live activity:', error));
}

function updateLiveActivityFeed(activities) {
    const activityList = document.querySelector('.activity-list');
    if (!activityList || !activities) return;
    
    // Get last 3 activities
    const recentActivities = activities.slice(0, 3);
    
    const activityIcons = {
        'Account Created': 'fa-user-plus',
        'Course Enrolled': 'fa-book',
        'Assignment Submitted': 'fa-check-circle',
        'Grade Added': 'fa-star',
        'Profile Updated': 'fa-user-edit',
        'Book Issued': 'fa-book-reader',
        'Achievement Added': 'fa-trophy',
        'Assignment Due Soon': 'fa-clock',
        'Study Streak': 'fa-fire',
        'Trial Expiring': 'fa-exclamation-circle'
    };
    
    activityList.innerHTML = recentActivities.map(activity => {
        const { action, timestamp, details } = activity;
        const icon = activityIcons[action] || 'fa-circle';
        const timeAgo = getTimeAgo(timestamp);
        
        return `
            <div class="activity-item live-activity">
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

function fetchLiveNotifications() {
    fetch('/api/dashboard/live-notifications')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateLiveNotifications(data.notifications, data.unreadCount);
            }
        })
        .catch(error => console.error('Error fetching live notifications:', error));
}

function updateLiveNotifications(notifications, unreadCount) {
    // Update notification badge
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
    
    // Update notification list if dropdown is open
    const notificationList = document.getElementById('notificationList');
    if (notificationList && notifications.length > 0) {
        notificationList.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
                <div class="notification-icon ${notification.type}">
                    <i class="fas ${getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <h5>${notification.title}</h5>
                    <p>${notification.message}</p>
                    <span>${getTimeAgo(notification.timestamp)}</span>
                </div>
            </div>
        `).join('');
    }
}

function getNotificationIcon(type) {
    const icons = {
        'urgent': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'success': 'fa-check-circle',
        'info': 'fa-info-circle',
        'alert': 'fa-bell'
    };
    return icons[type] || 'fa-bell';
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

    // Calculate real-time metrics from student data
    const metrics = calculateLiveMetrics();
    
    // Update Active Courses
    const courseCount = metrics.activeCourses;
    const courseStat = document.getElementById('statCourses');
    if (courseStat) {
        animateNumber(courseStat, parseInt(courseStat.textContent) || 0, courseCount);
    }
    
    // Update Completed Tasks
    const completedStat = document.getElementById('statCompleted');
    if (completedStat) {
        animateNumber(completedStat, parseInt(completedStat.textContent) || 0, metrics.completedTasks);
    }
    
    // Update Pending Tasks
    const pendingStat = document.getElementById('statPending');
    if (pendingStat) {
        animateNumber(pendingStat, parseInt(pendingStat.textContent) || 0, metrics.pendingTasks);
    }
    
    // Update Performance Score
    const scoreStat = document.getElementById('statScore');
    if (scoreStat) {
        const currentScore = parseInt(scoreStat.textContent) || 0;
        animateNumber(scoreStat, currentScore, metrics.performanceScore, '%');
    }
    
    // Update stat details data with real calculations
    updateStatDetailsData(metrics);
}

// ============================================
// Calculate Live Performance Metrics
// ============================================
function calculateLiveMetrics() {
    if (!studentData) return getDefaultMetrics();
    
    const { courses, assignments, grades, activityLog } = studentData;
    
    // Active Courses - count current semester courses
    const activeCourses = (courses?.current?.length || 0) + (courses?.enrolled?.length || 0);
    
    // Completed Tasks - graded assignments + completed activities
    const gradedAssignments = assignments?.graded?.length || 0;
    const completedActivities = activityLog?.filter(a => 
        a.action.includes('Completed') || a.action.includes('Submitted')
    ).length || 0;
    const completedTasks = Math.max(gradedAssignments, completedActivities);
    
    // Pending Tasks - pending assignments + upcoming deadlines
    const pendingAssignments = assignments?.pending?.length || 0;
    const pendingTasks = pendingAssignments;
    
    // Performance Score - calculate from grades
    let performanceScore = 85; // default
    if (grades?.semesterGrades && grades.semesterGrades.length > 0) {
        const totalScore = grades.semesterGrades.reduce((sum, g) => sum + (g.sgpa * 10), 0);
        performanceScore = Math.round(totalScore / grades.semesterGrades.length);
    } else if (grades?.cgpa) {
        performanceScore = Math.round(grades.cgpa * 10);
    }
    
    // Calculate trend (improving/declining)
    const trend = calculatePerformanceTrend(grades?.semesterGrades);
    
    return {
        activeCourses: activeCourses || 6,
        completedTasks: completedTasks || 24,
        pendingTasks: pendingTasks || 8,
        performanceScore: performanceScore || 85,
        trend: trend,
        lastUpdated: new Date().toLocaleTimeString()
    };
}

// ============================================
// Calculate Performance Trend
// ============================================
function calculatePerformanceTrend(semesterGrades) {
    if (!semesterGrades || semesterGrades.length < 2) return 'stable';
    
    const recent = semesterGrades[semesterGrades.length - 1].sgpa;
    const previous = semesterGrades[semesterGrades.length - 2].sgpa;
    
    if (recent > previous) return 'improving';
    if (recent < previous) return 'declining';
    return 'stable';
}

// ============================================
// Get Default Metrics
// ============================================
function getDefaultMetrics() {
    return {
        activeCourses: 6,
        completedTasks: 24,
        pendingTasks: 8,
        performanceScore: 85,
        trend: 'stable',
        lastUpdated: new Date().toLocaleTimeString()
    };
}

// ============================================
// Animate Number Counter
// ============================================
function animateNumber(element, start, end, suffix = '') {
    const duration = 1000;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.round(start + (end - start) * easeOutQuart);
        
        element.textContent = current + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// ============================================
// Update Stat Details Data with Real Data
// ============================================
function updateStatDetailsData(metrics) {
    if (!studentData) return;
    
    const { courses, assignments, grades, activityLog } = studentData;
    
    // Update Courses Data
    if (courses?.current) {
        statDetailsData.courses.items = courses.current.map((course, index) => ({
            name: course.name || `Course ${index + 1}`,
            code: course.code || `CS${200 + index}`,
            progress: course.progress || Math.floor(Math.random() * 40) + 40,
            status: course.status || 'In Progress'
        }));
        statDetailsData.courses.stats[0].value = (courses.current.length * 4).toString();
    }
    
    // Update Completed Tasks Data
    if (assignments?.graded) {
        statDetailsData.completed.items = assignments.graded.slice(0, 6).map((item, index) => ({
            name: item.title || `Assignment ${index + 1}`,
            type: item.type || 'Assignment',
            date: item.submittedDate || new Date(Date.now() - index * 86400000).toISOString().split('T')[0],
            score: item.score ? `${item.score}%` : `${85 + Math.floor(Math.random() * 15)}%`
        }));
    }
    
    // Update Pending Tasks Data
    if (assignments?.pending) {
        statDetailsData.pending.items = assignments.pending.slice(0, 6).map((item, index) => {
            const dueDate = new Date(item.dueDate || Date.now() + (index + 3) * 86400000);
            const daysLeft = Math.ceil((dueDate - Date.now()) / 86400000);
            return {
                name: item.title || `Task ${index + 1}`,
                type: item.type || 'Assignment',
                deadline: dueDate.toISOString().split('T')[0],
                daysLeft: Math.max(1, daysLeft)
            };
        });
    }
    
    // Update Score Data
    if (grades?.semesterGrades) {
        statDetailsData.score.items = grades.semesterGrades.map((grade, index) => ({
            name: grade.courseName || `Subject ${index + 1}`,
            score: Math.round(grade.sgpa * 10),
            grade: getGradeFromSGPA(grade.sgpa),
            maxScore: 100
        }));
        statDetailsData.score.stats[0].value = grades.cgpa?.toFixed(1) || '8.5';
    }
}

// ============================================
// Get Grade from SGPA
// ============================================
function getGradeFromSGPA(sgpa) {
    if (sgpa >= 9) return 'A+';
    if (sgpa >= 8) return 'A';
    if (sgpa >= 7) return 'B+';
    if (sgpa >= 6) return 'B';
    if (sgpa >= 5) return 'C';
    return 'F';
}

// ============================================
// Live Update - Refresh stats every 30 seconds
// ============================================
function startLiveUpdates() {
    // Update immediately
    updateStats();
    
    // Then update every 30 seconds
    setInterval(() => {
        console.log('Refreshing live metrics...');
        updateStats();
    }, 30000);
}

// Call this when dashboard loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait for student data to load, then start live updates
    setTimeout(startLiveUpdates, 2000);
});

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
    
    // Initialize voice assistant
    initVoiceAssistant();
}

// ============================================
// Voice Assistant Functions
// ============================================
let recognition = null;
let isListening = false;
let speechSynthesis = window.speechSynthesis;
let isSpeechEnabled = false;
let isVoiceModeEnabled = false;
let selectedVoiceGender = localStorage.getItem('edubotVoiceGender') || 'female';
let availableVoices = [];
let currentVoice = null;

function initVoiceAssistant() {
    // Initialize voice gender UI
    initVoiceGenderUI();
    
    // Check if browser supports Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onstart = function() {
            isListening = true;
            updateVoiceUI();
        };
        
        recognition.onend = function() {
            isListening = false;
            updateVoiceUI();
        };
        
        recognition.onresult = function(event) {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            const userInput = document.getElementById('userInput');
            if (finalTranscript) {
                userInput.value = finalTranscript;
                // Auto-send after voice input
                setTimeout(() => {
                    sendDashboardMessage();
                }, 500);
            } else if (interimTranscript) {
                userInput.value = interimTranscript;
            }
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            isListening = false;
            updateVoiceUI();
            
            let errorMessage = 'Voice recognition error. Please try again.';
            if (event.error === 'no-speech') {
                errorMessage = 'No speech detected. Please try speaking again.';
            } else if (event.error === 'audio-capture') {
                errorMessage = 'No microphone found. Please check your microphone.';
            } else if (event.error === 'not-allowed') {
                errorMessage = 'Microphone access denied. Please allow microphone access.';
            }
            
            showToast(errorMessage, 'error');
        };
    } else {
        // Browser doesn't support speech recognition
        const micButton = document.getElementById('micButton');
        if (micButton) {
            micButton.style.display = 'none';
        }
        console.log('Web Speech API not supported in this browser');
    }
}

function toggleVoiceInput() {
    if (!recognition) {
        showToast('Voice recognition is not supported in your browser', 'error');
        return;
    }
    
    if (isListening) {
        recognition.stop();
    } else {
        // Request microphone permission
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => {
                recognition.start();
                showToast('Listening... Speak now', 'info');
            })
            .catch(err => {
                showToast('Microphone access denied. Please allow microphone access.', 'error');
                console.error('Microphone error:', err);
            });
    }
}

function toggleVoiceMode() {
    isVoiceModeEnabled = !isVoiceModeEnabled;
    const voiceToggle = document.getElementById('voiceToggle');
    
    if (voiceToggle) {
        if (isVoiceModeEnabled) {
            voiceToggle.classList.add('active');
            voiceToggle.innerHTML = '<i class="fas fa-microphone"></i>';
            showToast('Voice mode enabled. Click the mic button to speak.', 'success');
        } else {
            voiceToggle.classList.remove('active');
            voiceToggle.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            showToast('Voice mode disabled', 'info');
        }
    }
}

function toggleSpeechOutput() {
    isSpeechEnabled = !isSpeechEnabled;
    const speakToggle = document.getElementById('speakToggle');
    
    if (speakToggle) {
        if (isSpeechEnabled) {
            speakToggle.classList.add('active');
            speakToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
            showToast('Speech output enabled. Bot responses will be spoken.', 'success');
            
            // Test speech
            speakText('Voice assistant is now active. How can I help you?');
        } else {
            speakToggle.classList.remove('active');
            speakToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
            showToast('Speech output disabled', 'info');
            
            // Stop any ongoing speech
            if (speechSynthesis) {
                speechSynthesis.cancel();
            }
        }
    }
}

function updateVoiceUI() {
    const micButton = document.getElementById('micButton');
    const voiceStatus = document.getElementById('voiceStatus');
    
    if (micButton) {
        if (isListening) {
            micButton.classList.add('listening');
        } else {
            micButton.classList.remove('listening');
        }
    }
    
    if (voiceStatus) {
        if (isListening) {
            voiceStatus.classList.add('active');
        } else {
            voiceStatus.classList.remove('active');
        }
    }
}

function speakText(text) {
    if (!isSpeechEnabled || !speechSynthesis) return;
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = 'en-US';
    
    // Use the selected voice based on gender preference
    if (currentVoice) {
        utterance.voice = currentVoice;
    } else {
        // Fallback: try to find a good voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => {
            if (selectedVoiceGender === 'female') {
                return voice.name.includes('Google') || 
                       voice.name.includes('Samantha') || 
                       voice.name.includes('Microsoft Zira') ||
                       voice.name.includes('Victoria');
            } else {
                return voice.name.includes('Google UK English Male') || 
                       voice.name.includes('Microsoft David') ||
                       voice.name.includes('Daniel');
            }
        });
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
    }
    
    utterance.onstart = function() {
        const speakToggle = document.getElementById('speakToggle');
        if (speakToggle) {
            speakToggle.classList.add('speaking');
        }
    };
    
    utterance.onend = function() {
        const speakToggle = document.getElementById('speakToggle');
        if (speakToggle) {
            speakToggle.classList.remove('speaking');
        }
    };
    
    speechSynthesis.speak(utterance);
}

// Load voices when available
if (speechSynthesis) {
    speechSynthesis.onvoiceschanged = function() {
        availableVoices = speechSynthesis.getVoices();
        updateCurrentVoice();
    };
    // Try to load voices immediately
    availableVoices = speechSynthesis.getVoices();
    if (availableVoices.length > 0) {
        updateCurrentVoice();
    }
}

// ============================================
// Voice Gender Selection Functions
// ============================================
function updateCurrentVoice() {
    if (availableVoices.length === 0) return;
    
    // Filter voices by gender preference
    let preferredVoices = [];
    
    if (selectedVoiceGender === 'female') {
        // Look for female voices
        preferredVoices = availableVoices.filter(voice => 
            voice.name.toLowerCase().includes('female') ||
            voice.name.includes('Samantha') ||
            voice.name.includes('Victoria') ||
            voice.name.includes('Karen') ||
            voice.name.includes('Google US English') ||
            voice.name.includes('Microsoft Zira') ||
            voice.name.includes('Microsoft Anna') ||
            voice.name.includes('Google UK English Female')
        );
    } else {
        // Look for male voices
        preferredVoices = availableVoices.filter(voice => 
            voice.name.toLowerCase().includes('male') ||
            voice.name.includes('Daniel') ||
            voice.name.includes('Fred') ||
            voice.name.includes('Google UK English Male') ||
            voice.name.includes('Microsoft David') ||
            voice.name.includes('Microsoft Mark') ||
            voice.name.includes('Alex')
        );
    }
    
    // If no gender-specific voice found, try to find any good voice
    if (preferredVoices.length === 0) {
        preferredVoices = availableVoices.filter(voice =>
            voice.name.includes('Google') ||
            voice.name.includes('Microsoft') ||
            voice.name.includes('Apple')
        );
    }
    
    // Default to first available if still no match
    currentVoice = preferredVoices.length > 0 ? preferredVoices[0] : availableVoices[0];
    
    console.log(`Voice set to: ${currentVoice?.name || 'Default'} (${selectedVoiceGender})`);
}

function toggleVoiceGender() {
    const dropdown = document.getElementById('genderDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

function selectVoiceGender(gender) {
    selectedVoiceGender = gender;
    localStorage.setItem('edubotVoiceGender', gender);
    
    // Update UI
    const genderLabel = document.getElementById('genderLabel');
    const genderToggle = document.getElementById('genderToggle');
    const dropdown = document.getElementById('genderDropdown');
    
    if (genderLabel) {
        genderLabel.textContent = gender === 'female' ? 'Female' : 'Male';
    }
    
    if (genderToggle) {
        genderToggle.innerHTML = gender === 'female' 
            ? '<i class="fas fa-venus"></i><span class="gender-label">Female</span>'
            : '<i class="fas fa-mars"></i><span class="gender-label">Male</span>';
    }
    
    // Update dropdown options
    const options = document.querySelectorAll('.gender-option');
    options.forEach(option => {
        option.classList.remove('active');
        if (option.textContent.toLowerCase().includes(gender)) {
            option.classList.add('active');
        }
    });
    
    // Hide dropdown
    if (dropdown) {
        dropdown.classList.remove('show');
    }
    
    // Update voice
    updateCurrentVoice();
    
    // Test the new voice
    if (isSpeechEnabled && currentVoice) {
        const testMessage = gender === 'female' 
            ? "Hello! I'm your female voice assistant. How can I help you today?"
            : "Hello! I'm your male voice assistant. How can I help you today?";
        speakText(testMessage);
    }
    
    showToast(`Voice changed to ${gender === 'female' ? 'Female' : 'Male'}`, 'success');
}

// Close gender dropdown when clicking outside
document.addEventListener('click', function(event) {
    const genderSelector = document.querySelector('.voice-gender-selector');
    const dropdown = document.getElementById('genderDropdown');
    
    if (genderSelector && dropdown && !genderSelector.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Initialize Voice Gender UI
function initVoiceGenderUI() {
    const genderToggle = document.getElementById('genderToggle');
    const genderLabel = document.getElementById('genderLabel');
    
    if (genderToggle) {
        genderToggle.innerHTML = selectedVoiceGender === 'female' 
            ? '<i class="fas fa-venus"></i><span class="gender-label">Female</span>'
            : '<i class="fas fa-mars"></i><span class="gender-label">Male</span>';
    }
    
    // Update dropdown active state
    const options = document.querySelectorAll('.gender-option');
    options.forEach(option => {
        option.classList.remove('active');
        if (option.textContent.toLowerCase().includes(selectedVoiceGender)) {
            option.classList.add('active');
        }
    });
}

// ============================================
// Voice Assistant Modal Functions
// ============================================
let vaRecognition = null;
let vaIsListening = false;
let vaIsSpeechEnabled = false;

function openVoiceAssistant() {
    const modal = document.getElementById('voiceAssistantModal');
    if (modal) {
        modal.style.display = 'flex';
        initVoiceAssistantModal();
    }
}

function closeVoiceAssistant() {
    const modal = document.getElementById('voiceAssistantModal');
    if (modal) {
        modal.style.display = 'none';
        // Stop any ongoing speech
        if (speechSynthesis) {
            speechSynthesis.cancel();
        }
        // Stop listening if active
        if (vaRecognition && vaIsListening) {
            vaRecognition.stop();
        }
    }
}

function initVoiceAssistantModal() {
    // Initialize voice recognition for modal
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        vaRecognition = new SpeechRecognition();
        vaRecognition.continuous = false;
        vaRecognition.interimResults = true;
        vaRecognition.lang = 'en-US';
        
        vaRecognition.onstart = function() {
            vaIsListening = true;
            updateVAUI();
        };
        
        vaRecognition.onend = function() {
            vaIsListening = false;
            updateVAUI();
        };
        
        vaRecognition.onresult = function(event) {
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            
            if (finalTranscript) {
                processVoiceCommand(finalTranscript);
            }
        };
        
        vaRecognition.onerror = function(event) {
            console.error('VA Speech error:', event.error);
            vaIsListening = false;
            updateVAUI();
            
            let errorMsg = 'Voice error. Please try again.';
            if (event.error === 'no-speech') errorMsg = 'No speech detected.';
            if (event.error === 'audio-capture') errorMsg = 'No microphone found.';
            if (event.error === 'not-allowed') errorMsg = 'Microphone access denied.';
            
            document.getElementById('voiceStatusText').textContent = errorMsg;
        };
    }
    
    // Set initial gender button state
    updateVAGenderButtons();
}

function toggleVoiceAssistantInput() {
    if (!vaRecognition) {
        showToast('Voice recognition not supported in your browser', 'error');
        return;
    }
    
    if (vaIsListening) {
        vaRecognition.stop();
    } else {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => {
                vaRecognition.start();
                document.getElementById('voiceStatusText').textContent = 'Listening... Speak now';
            })
            .catch(err => {
                showToast('Microphone access denied', 'error');
            });
    }
}

function updateVAUI() {
    const micBtn = document.getElementById('voiceMicBtn');
    const voiceOrb = document.getElementById('voiceOrb');
    const voiceWaves = document.querySelector('.voice-waves');
    const statusText = document.getElementById('voiceStatusText');
    
    if (vaIsListening) {
        micBtn.classList.add('listening');
        voiceOrb.classList.add('listening');
        voiceWaves.classList.add('active');
        micBtn.innerHTML = '<i class="fas fa-stop"></i>';
    } else {
        micBtn.classList.remove('listening');
        voiceOrb.classList.remove('listening');
        voiceWaves.classList.remove('active');
        micBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        if (statusText.textContent === 'Listening... Speak now') {
            statusText.textContent = 'Tap the microphone to start speaking';
        }
    }
}

function processVoiceCommand(command) {
    // Show user command
    const voiceResponse = document.getElementById('voiceResponse');
    const userCommand = document.getElementById('userCommand');
    const botResponse = document.getElementById('botResponse');
    const statusText = document.getElementById('voiceStatusText');
    const voiceOrb = document.getElementById('voiceOrb');
    
    voiceResponse.style.display = 'block';
    userCommand.textContent = command;
    botResponse.textContent = 'Thinking...';
    statusText.textContent = 'Processing...';
    
    // Send to chatbot API
    fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: command })
    })
    .then(response => response.json())
    .then(data => {
        botResponse.textContent = data.reply;
        statusText.textContent = 'Response ready';
        
        // Speak response if enabled
        if (vaIsSpeechEnabled) {
            voiceOrb.classList.add('speaking');
            speakVAResponse(data.reply);
        }
    })
    .catch(error => {
        botResponse.textContent = 'Sorry, I encountered an error.';
        statusText.textContent = 'Error occurred';
    });
}

function speakVAResponse(text) {
    if (!speechSynthesis) return;
    
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = 'en-US';
    
    // Use selected voice
    if (currentVoice) {
        utterance.voice = currentVoice;
    }
    
    utterance.onend = function() {
        document.getElementById('voiceOrb').classList.remove('speaking');
    };
    
    speechSynthesis.speak(utterance);
}

function toggleVoiceAssistantOutput() {
    vaIsSpeechEnabled = document.getElementById('voiceOutputToggle').checked;
    showToast(vaIsSpeechEnabled ? 'Speech output enabled' : 'Speech output disabled', 'info');
}

function setVoiceAssistantGender(gender) {
    selectedVoiceGender = gender;
    localStorage.setItem('edubotVoiceGender', gender);
    updateVAGenderButtons();
    updateCurrentVoice();
    
    // Test voice
    if (vaIsSpeechEnabled) {
        const testMsg = gender === 'female' 
            ? "Voice changed to female"
            : "Voice changed to male";
        speakVAResponse(testMsg);
    }
    
    showToast(`Voice set to ${gender === 'female' ? 'Female' : 'Male'}`, 'success');
}

function updateVAGenderButtons() {
    const femaleBtn = document.getElementById('vaGenderFemale');
    const maleBtn = document.getElementById('vaGenderMale');
    
    if (femaleBtn && maleBtn) {
        femaleBtn.classList.toggle('active', selectedVoiceGender === 'female');
        maleBtn.classList.toggle('active', selectedVoiceGender === 'male');
    }
}

function speakCommand(text) {
    document.getElementById('userCommand').textContent = text;
    processVoiceCommand(text);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const vaModal = document.getElementById('voiceAssistantModal');
    const statModal = document.getElementById('statDetailsModal');
    if (event.target === vaModal) {
        closeVoiceAssistant();
    }
    if (event.target === statModal) {
        closeStatDetails();
    }
};

// ============================================
// Stat Details Modal Functions
// ============================================
const statDetailsData = {
    courses: {
        title: 'Active Courses',
        icon: 'fa-book-open',
        color: 'blue',
        description: 'Currently enrolled courses this semester',
        items: [
            { name: 'Data Structures & Algorithms', code: 'CS201', progress: 75, status: 'In Progress' },
            { name: 'Web Development', code: 'CS301', progress: 60, status: 'In Progress' },
            { name: 'Database Management', code: 'CS205', progress: 90, status: 'Nearly Complete' },
            { name: 'Machine Learning', code: 'CS401', progress: 45, status: 'In Progress' },
            { name: 'Computer Networks', code: 'CS302', progress: 30, status: 'Just Started' },
            { name: 'Operating Systems', code: 'CS303', progress: 55, status: 'In Progress' }
        ],
        stats: [
            { label: 'Total Credits', value: '24' },
            { label: 'Completed', value: '2' },
            { label: 'In Progress', value: '4' }
        ]
    },
    completed: {
        title: 'Completed Tasks',
        icon: 'fa-check-circle',
        color: 'green',
        description: 'Assignments, quizzes, and projects completed',
        items: [
            { name: 'Data Structures Assignment 1', type: 'Assignment', date: '2026-03-05', score: '95%' },
            { name: 'Web Development Quiz', type: 'Quiz', date: '2026-03-03', score: '88%' },
            { name: 'Database Project Phase 1', type: 'Project', date: '2026-02-28', score: '92%' },
            { name: 'ML Lab Exercise 3', type: 'Lab', date: '2026-02-25', score: '100%' },
            { name: 'Network Protocols Quiz', type: 'Quiz', date: '2026-02-22', score: '85%' },
            { name: 'OS Assignment 2', type: 'Assignment', date: '2026-02-20', score: '90%' }
        ],
        stats: [
            { label: 'Total Tasks', value: '24' },
            { label: 'Avg Score', value: '91%' },
            { label: 'Streak', value: '7 days' }
        ]
    },
    pending: {
        title: 'Pending Tasks',
        icon: 'fa-clock',
        color: 'orange',
        description: 'Upcoming deadlines and pending submissions',
        items: [
            { name: 'ML Project Report', type: 'Project', deadline: '2026-03-15', daysLeft: 5 },
            { name: 'Web Dev Assignment 3', type: 'Assignment', deadline: '2026-03-18', daysLeft: 8 },
            { name: 'Database Quiz 2', type: 'Quiz', deadline: '2026-03-20', daysLeft: 10 },
            { name: 'DSA Lab Exercise 5', type: 'Lab', deadline: '2026-03-22', daysLeft: 12 },
            { name: 'Network Config Project', type: 'Project', deadline: '2026-03-25', daysLeft: 15 },
            { name: 'OS Mid-term Prep', type: 'Study', deadline: '2026-03-28', daysLeft: 18 }
        ],
        stats: [
            { label: 'Total Pending', value: '8' },
            { label: 'This Week', value: '3' },
            { label: 'Urgent', value: '1' }
        ]
    },
    score: {
        title: 'Performance Score',
        icon: 'fa-trophy',
        color: 'purple',
        description: 'Overall academic performance metrics',
        items: [
            { name: 'Data Structures', score: 92, grade: 'A', maxScore: 100 },
            { name: 'Web Development', score: 88, grade: 'A-', maxScore: 100 },
            { name: 'Database Systems', score: 95, grade: 'A', maxScore: 100 },
            { name: 'Machine Learning', score: 78, grade: 'B+', maxScore: 100 },
            { name: 'Computer Networks', score: 85, grade: 'B+', maxScore: 100 },
            { name: 'Operating Systems', score: 82, grade: 'B', maxScore: 100 }
        ],
        stats: [
            { label: 'CGPA', value: '8.5' },
            { label: 'Rank', value: '12th' },
            { label: 'Credits', value: '96' }
        ]
    }
};

function showStatDetails(type) {
    const modal = document.getElementById('statDetailsModal');
    const titleEl = document.getElementById('statModalTitle');
    const contentEl = document.getElementById('statModalContent');
    
    const data = statDetailsData[type];
    if (!data) return;
    
    // Set title
    titleEl.innerHTML = `<i class="fas ${data.icon}"></i> ${data.title}`;
    
    // Build content
    let contentHtml = `
        <div class="stat-detail-header">
            <div class="stat-detail-icon ${data.color}">
                <i class="fas ${data.icon}"></i>
            </div>
            <div class="stat-detail-title">
                <h2>${data.title}</h2>
                <p>${data.description}</p>
            </div>
        </div>
        <div class="stat-detail-list">
    `;
    
    // Add items based on type
    if (type === 'courses') {
        data.items.forEach(item => {
            contentHtml += `
                <div class="stat-detail-item">
                    <div class="stat-detail-item-left">
                        <i class="fas fa-book"></i>
                        <div class="stat-detail-item-info">
                            <h4>${item.name}</h4>
                            <p>${item.code} • ${item.status}</p>
                        </div>
                    </div>
                    <div class="stat-detail-item-right">
                        <div class="value">${item.progress}%</div>
                        <div class="label">Complete</div>
                    </div>
                </div>
            `;
        });
    } else if (type === 'completed') {
        data.items.forEach(item => {
            contentHtml += `
                <div class="stat-detail-item">
                    <div class="stat-detail-item-left">
                        <i class="fas fa-check"></i>
                        <div class="stat-detail-item-info">
                            <h4>${item.name}</h4>
                            <p>${item.type} • ${item.date}</p>
                        </div>
                    </div>
                    <div class="stat-detail-item-right">
                        <div class="value" style="color: #10b981;">${item.score}</div>
                        <div class="label">Score</div>
                    </div>
                </div>
            `;
        });
    } else if (type === 'pending') {
        data.items.forEach(item => {
            const urgencyColor = item.daysLeft <= 5 ? '#ef4444' : (item.daysLeft <= 10 ? '#f97316' : '#64748b');
            contentHtml += `
                <div class="stat-detail-item">
                    <div class="stat-detail-item-left">
                        <i class="fas fa-clock"></i>
                        <div class="stat-detail-item-info">
                            <h4>${item.name}</h4>
                            <p>${item.type} • Due: ${item.deadline}</p>
                        </div>
                    </div>
                    <div class="stat-detail-item-right">
                        <div class="value" style="color: ${urgencyColor};">${item.daysLeft}</div>
                        <div class="label">Days Left</div>
                    </div>
                </div>
            `;
        });
    } else if (type === 'score') {
        data.items.forEach(item => {
            contentHtml += `
                <div class="stat-detail-item">
                    <div class="stat-detail-item-left">
                        <i class="fas fa-star"></i>
                        <div class="stat-detail-item-info">
                            <h4>${item.name}</h4>
                            <p>Grade: ${item.grade}</p>
                        </div>
                    </div>
                    <div class="stat-detail-item-right">
                        <div class="value">${item.score}%</div>
                        <div class="label">Score</div>
                    </div>
                </div>
            `;
        });
    }
    
    contentHtml += '</div>';
    
    // Add stats summary
    contentHtml += '<div class="stat-detail-stats">';
    data.stats.forEach(stat => {
        contentHtml += `
            <div class="stat-detail-stat">
                <h5>${stat.value}</h5>
                <p>${stat.label}</p>
            </div>
        `;
    });
    contentHtml += '</div>';
    
    contentEl.innerHTML = contentHtml;
    modal.style.display = 'flex';
}

function closeStatDetails() {
    const modal = document.getElementById('statDetailsModal');
    if (modal) {
        modal.style.display = 'none';
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
    
    // Use voice-optimized endpoint if voice mode is enabled
    const endpoint = isVoiceModeEnabled ? '/api/voice/chat' : '/chat';
    
    // Send to server
    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            message: message,
            context: { voiceMode: isVoiceModeEnabled }
        })
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
    messageDiv.className = `message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'bot-avatar';
    avatar.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    content.appendChild(paragraph);
    
    // Add speak button for bot messages
    if (sender === 'bot' && isSpeechEnabled) {
        const speakBtn = document.createElement('button');
        speakBtn.className = 'speak-message-btn';
        speakBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        speakBtn.onclick = () => speakText(text);
        speakBtn.style.cssText = 'background: none; border: none; color: #6366f1; cursor: pointer; margin-top: 0.5rem; font-size: 0.9rem;';
        content.appendChild(speakBtn);
        
        // Auto-speak bot responses if speech is enabled
        speakText(text);
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
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

// ============================================
// Subscription Management
// ============================================
let currentSubscription = null;

function updateSubscriptionUI(student) {
    const subscription = student.subscription;
    const availablePlans = student.availablePlans;
    currentSubscription = subscription;
    
    // Update sidebar badge
    const subBadge = document.getElementById('subBadge');
    if (subBadge) {
        if (subscription.status === 'active') {
            subBadge.textContent = 'PRO';
            subBadge.classList.add('pro');
        } else if (subscription.status === 'trial') {
            subBadge.textContent = 'FREE';
        } else {
            subBadge.textContent = 'EXPIRED';
            subBadge.style.background = '#ef4444';
        }
    }
    
    // Update subscription status card
    const statusBadge = document.getElementById('subscriptionStatus');
    const daysLeft = document.getElementById('daysLeft');
    const trialProgress = document.getElementById('trialProgress');
    const message = document.getElementById('subscriptionMessage');
    
    if (statusBadge) {
        statusBadge.className = 'status-badge ' + subscription.status;
        statusBadge.textContent = subscription.status === 'trial' ? 'FREE TRIAL' : 
                                   subscription.status === 'active' ? 'ACTIVE' : 'EXPIRED';
    }
    
    if (daysLeft) {
        daysLeft.textContent = subscription.daysLeft;
    }
    
    if (trialProgress) {
        const totalDays = subscription.status === 'trial' ? 30 : 
                         subscription.plan === 'monthly' ? 30 :
                         subscription.plan === 'quarterly' ? 90 : 365;
        const percentage = (subscription.daysLeft / totalDays) * 100;
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (percentage / 100) * circumference;
        trialProgress.style.strokeDashoffset = offset;
    }
    
    if (message) {
        if (subscription.status === 'trial') {
            message.innerHTML = `<p><i class="fas fa-info-circle"></i> You're on a 30-day free trial. ${subscription.daysLeft} days left. Upgrade to continue accessing all features after trial ends.</p>`;
        } else if (subscription.status === 'active') {
            const planName = availablePlans[subscription.plan]?.name || subscription.plan;
            message.innerHTML = `<p><i class="fas fa-check-circle" style="color: #10b981;"></i> You're subscribed to ${planName}. ${subscription.daysLeft} days remaining.</p>`;
        } else {
            message.innerHTML = `<p><i class="fas fa-exclamation-circle" style="color: #ef4444;"></i> Your subscription has expired. Upgrade now to regain access to all features.</p>`;
        }
    }
    
    // Update payment history
    updatePaymentHistory(subscription.paymentHistory);
}

function updatePaymentHistory(payments) {
    const container = document.getElementById('paymentHistory');
    if (!container) return;
    
    if (!payments || payments.length === 0) {
        container.innerHTML = '<p class="empty-state">No payments yet. Start your free trial today!</p>';
        return;
    }
    
    container.innerHTML = payments.map(payment => `
        <div class="payment-item">
            <div class="payment-info">
                <h4>${payment.plan.toUpperCase()} Plan</h4>
                <p>${new Date(payment.date).toLocaleDateString()} • Transaction ID: ${payment.transactionId}</p>
            </div>
            <div class="payment-amount">
                <div class="amount">₹${payment.amount}</div>
                <span class="status ${payment.status}">${payment.status}</span>
            </div>
        </div>
    `).join('');
}

function showUpgradeModal() {
    const modal = document.getElementById('upgradeModal');
    if (modal) {
        modal.classList.add('show');
    }
}

function closeUpgradeModal() {
    const modal = document.getElementById('upgradeModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function selectPlan(plan) {
    document.querySelectorAll('input[name="plan"]').forEach(input => {
        input.checked = input.value === plan;
    });
}

async function subscribe(plan) {
    selectPlan(plan);
    showUpgradeModal();
}

async function processPayment() {
    const selectedPlan = document.querySelector('input[name="plan"]:checked');
    if (!selectedPlan) {
        showToast('Please select a plan', 'error');
        return;
    }
    
    const plan = selectedPlan.value;
    
    try {
        showToast('Processing payment...', 'info');
        
        const response = await fetch('/api/student/subscription/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ plan: plan })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            closeUpgradeModal();
            
            // Refresh student data
            const studentResponse = await fetch('/api/student/info');
            const studentData = await studentResponse.json();
            if (studentData.success) {
                studentDataGlobal = studentData.student;
                updateDashboardUI(studentData.student);
                updateSubscriptionUI(studentData.student);
            }
        } else {
            showToast(data.message || 'Payment failed', 'error');
        }
    } catch (error) {
        showToast('Payment error. Please try again.', 'error');
        console.error('Payment error:', error);
    }
}

function viewPaymentHistory() {
    showSection('subscription');
    document.getElementById('paymentHistory').scrollIntoView({ behavior: 'smooth' });
}

// Check subscription before accessing premium features
function checkSubscriptionAccess() {
    if (!currentSubscription) return true;
    
    if (currentSubscription.status === 'expired') {
        showToast('Your subscription has expired. Please upgrade to access this feature.', 'error');
        showSection('subscription');
        return false;
    }
    
    return true;
}

// ============================================
// Notification System
// ============================================
let notifications = [];
let unreadCount = 0;

// Load notifications
async function loadNotifications() {
    try {
        const response = await fetch('/api/student/notifications');
        const data = await response.json();
        
        if (data.success) {
            notifications = data.notifications;
            unreadCount = data.unreadCount;
            updateNotificationUI();
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

// Update notification UI
function updateNotificationUI() {
    const badge = document.getElementById('notificationBadge');
    const list = document.getElementById('notificationList');
    
    // Update badge
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
    
    // Update list
    if (list) {
        if (notifications.length === 0) {
            list.innerHTML = `
                <div class="notification-empty">
                    <i class="fas fa-bell-slash"></i>
                    <p>No notifications yet</p>
                </div>
            `;
        } else {
            list.innerHTML = notifications.map(notif => `
                <div class="notification-item ${notif.read ? '' : 'unread'}" data-id="${notif.id}">
                    <div class="notification-icon ${notif.type}">
                        <i class="fas ${getNotificationIcon(notif.type)}"></i>
                    </div>
                    <div class="notification-content">
                        <h5>
                            ${notif.read ? '' : '<span class="unread-dot"></span>'}
                            ${notif.title}
                        </h5>
                        <p>${notif.message}</p>
                        <span class="notification-time">${formatNotificationTime(notif.timestamp)}</span>
                    </div>
                    <button class="notification-delete" onclick="deleteNotification('${notif.id}', event)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
            
            // Add click handlers
            document.querySelectorAll('.notification-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    if (!e.target.closest('.notification-delete')) {
                        markNotificationRead(item.dataset.id);
                    }
                });
            });
        }
    }
}

// Get icon for notification type
function getNotificationIcon(type) {
    const icons = {
        'info': 'fa-info-circle',
        'success': 'fa-check-circle',
        'warning': 'fa-exclamation-triangle',
        'reminder': 'fa-clock',
        'quiz': 'fa-question-circle',
        'assignment': 'fa-file-alt',
        'message': 'fa-envelope'
    };
    return icons[type] || 'fa-bell';
}

// Format notification time
function formatNotificationTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = (now - date) / 1000; // seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    
    return date.toLocaleDateString();
}

// Toggle notification dropdown
function toggleNotifications() {
    const dropdown = document.getElementById('notificationDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
        
        // Load notifications if opening
        if (dropdown.classList.contains('show')) {
            loadNotifications();
        }
    }
}

// Mark single notification as read
async function markNotificationRead(notificationId) {
    try {
        const response = await fetch(`/api/student/notifications/${notificationId}/read`, {
            method: 'PUT'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update local state
            const notif = notifications.find(n => n.id === notificationId);
            if (notif && !notif.read) {
                notif.read = true;
                unreadCount = Math.max(0, unreadCount - 1);
                updateNotificationUI();
            }
        }
    } catch (error) {
        console.error('Error marking notification read:', error);
    }
}

// Mark all notifications as read
async function markAllNotificationsRead() {
    try {
        const response = await fetch('/api/student/notifications/read-all', {
            method: 'PUT'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update local state
            notifications.forEach(n => n.read = true);
            unreadCount = 0;
            updateNotificationUI();
            showToast('All notifications marked as read', 'success');
        }
    } catch (error) {
        console.error('Error marking all notifications read:', error);
    }
}

// Delete notification
async function deleteNotification(notificationId, event) {
    event.stopPropagation();
    
    try {
        const response = await fetch(`/api/student/notifications/${notificationId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update local state
            const notif = notifications.find(n => n.id === notificationId);
            if (notif && !notif.read) {
                unreadCount = Math.max(0, unreadCount - 1);
            }
            notifications = notifications.filter(n => n.id !== notificationId);
            updateNotificationUI();
        }
    } catch (error) {
        console.error('Error deleting notification:', error);
    }
}

// Close notification dropdown when clicking outside
document.addEventListener('click', (e) => {
    const container = document.querySelector('.notification-container');
    const dropdown = document.getElementById('notificationDropdown');
    
    if (container && dropdown && !container.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

// Load notifications on page load
document.addEventListener('DOMContentLoaded', () => {
    loadNotifications();
    
    // Refresh notifications every 30 seconds
    setInterval(loadNotifications, 30000);
});

// ============================================
// Edit Profile Modal Functions
// ============================================

function openEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    if (modal) {
        // Load current student data
        fetch('/api/student/profile')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const student = data.student;
                    document.getElementById('editFirstName').value = student.firstName || '';
                    document.getElementById('editLastName').value = student.lastName || '';
                    document.getElementById('editEmail').value = student.email || '';
                    document.getElementById('editPhone').value = student.phone || '';
                    
                    // Update photo preview if exists
                    const photoDisplay = document.getElementById('currentPhotoDisplay');
                    if (student.profilePhoto) {
                        photoDisplay.innerHTML = `<img src="${student.profilePhoto}" alt="Profile">`;
                    } else {
                        photoDisplay.innerHTML = '<i class="fas fa-user"></i>';
                    }
                }
            })
            .catch(error => console.error('Error loading profile:', error));
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        // Reset form
        document.getElementById('editProfileForm').reset();
    }
}

function previewProfilePhoto(event) {
    const file = event.target.files[0];
    if (file) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('File size too large. Max 5MB allowed.', 'error');
            return;
        }
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            showToast('Invalid file type. Use JPG, PNG, or GIF.', 'error');
            return;
        }
        
        // Preview the image
        const reader = new FileReader();
        reader.onload = function(e) {
            const photoDisplay = document.getElementById('currentPhotoDisplay');
            photoDisplay.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

function saveProfileChanges(event) {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('firstName', document.getElementById('editFirstName').value);
    formData.append('lastName', document.getElementById('editLastName').value);
    formData.append('phone', document.getElementById('editPhone').value);
    
    const photoInput = document.getElementById('profilePhotoInput');
    if (photoInput.files[0]) {
        formData.append('profilePhoto', photoInput.files[0]);
    }
    
    fetch('/api/student/update-profile', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Profile updated successfully!', 'success');
            closeEditProfileModal();
            // Refresh student info on dashboard
            loadStudentInfo();
        } else {
            showToast(data.message || 'Failed to update profile', 'error');
        }
    })
    .catch(error => {
        console.error('Error updating profile:', error);
        showToast('An error occurred. Please try again.', 'error');
    });
}

// Close modal on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeEditProfileModal();
    }
});

// ============================================
// Resources Section Functions
// ============================================

// Online Books Data
const onlineBooks = {
    python: {
        title: "Python Programming",
        author: "Dr. John Smith",
        pages: 450,
        description: "Complete guide covering Python basics to advanced topics including OOP, file handling, and web development.",
        chapters: ["Introduction to Python", "Variables & Data Types", "Control Flow", "Functions", "OOP", "File Handling", "Web Development"]
    },
    javascript: {
        title: "JavaScript Mastery",
        author: "Sarah Johnson",
        pages: 380,
        description: "From ES6 fundamentals to modern frameworks. Learn DOM manipulation, async programming, and more.",
        chapters: ["JS Basics", "ES6+ Features", "DOM Manipulation", "Async Programming", "React Basics", "Node.js"]
    },
    algorithms: {
        title: "Data Structures & Algorithms",
        author: "Prof. Michael Chen",
        pages: 520,
        description: "Master algorithms with visual explanations. Covers sorting, searching, graphs, and dynamic programming.",
        chapters: ["Arrays & Strings", "Linked Lists", "Stacks & Queues", "Trees", "Graphs", "Sorting", "Dynamic Programming"]
    },
    'machine-learning': {
        title: "Machine Learning Fundamentals",
        author: "Dr. Emily Davis",
        pages: 410,
        description: "Introduction to ML, neural networks, deep learning with Python and TensorFlow examples.",
        chapters: ["ML Basics", "Supervised Learning", "Unsupervised Learning", "Neural Networks", "Deep Learning", "TensorFlow"]
    }
};

// Study Notes Data
const studyNotes = {
    'html-basics': {
        title: "HTML & CSS Basics",
        category: "beginner",
        pages: 24,
        description: "Complete beginner's guide to web development"
    },
    'math-fundamentals': {
        title: "Mathematics Fundamentals",
        category: "beginner",
        pages: 32,
        description: "Algebra, Geometry & Calculus basics"
    },
    'data-structures': {
        title: "Data Structures Guide",
        category: "intermediate",
        pages: 45,
        description: "Arrays, Linked Lists, Trees & Graphs"
    },
    'database-systems': {
        title: "Database Systems",
        category: "intermediate",
        pages: 38,
        description: "SQL, NoSQL & Database Design"
    },
    'ml-algorithms': {
        title: "Machine Learning Algorithms",
        category: "advanced",
        pages: 52,
        description: "Deep Learning & Neural Networks"
    },
    'cybersecurity': {
        title: "Cybersecurity Advanced",
        category: "advanced",
        pages: 48,
        description: "Ethical Hacking & Security Protocols"
    }
};

// Open E-Books Modal
function openEbooksModal() {
    showToast('E-Books Library - Loading 50,000+ digital books...', 'info');
    // In a real app, this would open a modal with the full library
    setTimeout(() => {
        showToast('E-Books library loaded successfully!', 'success');
    }, 1500);
}

// Open Video Lectures Modal
function openVideoLecturesModal() {
    showToast('Video Lectures - Loading recorded classes...', 'info');
    setTimeout(() => {
        showToast('Video lectures loaded!', 'success');
    }, 1000);
}

// Open Study Notes Modal
function openStudyNotesModal() {
    showToast('Study Notes - Organized by student level', 'info');
}

// Open Practice Tests Modal
function openPracticeTestsModal() {
    showToast('Practice Tests - Mock exams & quizzes', 'info');
}

// Open Book Reader
function openBook(bookId) {
    const book = onlineBooks[bookId];
    if (!book) {
        showToast('Book not found', 'error');
        return;
    }
    
    // Create and show book modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3><i class="fas fa-book-open"></i> ${book.title}</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p style="color: #64748b; margin-bottom: 1rem;">${book.description}</p>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="text-align: center; padding: 1rem; background: #f8fafc; border-radius: 8px;">
                        <i class="fas fa-user" style="color: #667eea; margin-bottom: 0.5rem;"></i>
                        <div style="font-size: 0.75rem; color: #64748b;">Author</div>
                        <div style="font-weight: 600;">${book.author}</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: #f8fafc; border-radius: 8px;">
                        <i class="fas fa-file-alt" style="color: #667eea; margin-bottom: 0.5rem;"></i>
                        <div style="font-size: 0.75rem; color: #64748b;">Pages</div>
                        <div style="font-weight: 600;">${book.pages}</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: #f8fafc; border-radius: 8px;">
                        <i class="fas fa-list" style="color: #667eea; margin-bottom: 0.5rem;"></i>
                        <div style="font-size: 0.75rem; color: #64748b;">Chapters</div>
                        <div style="font-weight: 600;">${book.chapters.length}</div>
                    </div>
                </div>
                <h4 style="margin-bottom: 0.75rem;">Chapters</h4>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${book.chapters.map((chapter, i) => `
                        <div style="padding: 0.75rem; background: #f8fafc; border-radius: 8px; display: flex; align-items: center; gap: 0.75rem; cursor: pointer;" 
                             onmouseover="this.style.background='#e0e7ff'" onmouseout="this.style.background='#f8fafc'">
                            <span style="width: 28px; height: 28px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">${i + 1}</span>
                            <span>${chapter}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                <button class="btn-primary" onclick="showToast('Starting book reader...', 'success')">
                    <i class="fas fa-book-reader"></i> Start Reading
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Filter Study Notes
function filterNotes(category) {
    // Update active tab
    document.querySelectorAll('.category-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === category || (category === 'all' && btn.textContent === 'All')) {
            btn.classList.add('active');
        }
    });
    
    // Filter notes
    const notes = document.querySelectorAll('.note-card');
    notes.forEach(note => {
        if (category === 'all' || note.dataset.category === category) {
            note.style.display = 'flex';
            note.style.animation = 'fadeIn 0.3s ease';
        } else {
            note.style.display = 'none';
        }
    });
}

// Download Note
function downloadNote(noteId) {
    const note = studyNotes[noteId];
    if (!note) {
        showToast('Note not found', 'error');
        return;
    }
    
    showToast(`Downloading "${note.title}"...`, 'info');
    
    // Simulate download
    setTimeout(() => {
        showToast(`"${note.title}" downloaded successfully!`, 'success');
    }, 1500);
}

// Add CSS animation
const resourcesStyle = document.createElement('style');
resourcesStyle.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(resourcesStyle);

// ============================================
// AI Video Lectures Functions
// ============================================

const videoLectures = {
    'python-basics': {
        title: 'Python Programming Basics',
        instructor: 'AI Tutor - EduBot',
        duration: '45:30',
        description: 'Learn Python programming from scratch with interactive AI tutoring.',
        chapters: [
            { time: '00:00', title: 'Introduction to Python' },
            { time: '05:30', title: 'Variables and Data Types' },
            { time: '15:00', title: 'Control Flow Statements' },
            { time: '25:00', title: 'Functions and Modules' },
            { time: '35:00', title: 'Object-Oriented Programming' }
        ]
    },
    'web-dev-intro': {
        title: 'Web Development Introduction',
        instructor: 'AI Tutor - EduBot',
        duration: '38:15',
        description: 'Complete guide to HTML, CSS, and JavaScript fundamentals.',
        chapters: [
            { time: '00:00', title: 'HTML5 Basics' },
            { time: '12:00', title: 'CSS3 Styling' },
            { time: '25:00', title: 'JavaScript Fundamentals' }
        ]
    },
    'react-course': {
        title: 'React.js Complete Course',
        instructor: 'AI Tutor - EduBot',
        duration: '1:15:00',
        description: 'Build modern web applications with React.js framework.',
        chapters: [
            { time: '00:00', title: 'React Introduction' },
            { time: '15:00', title: 'Components & Props' },
            { time: '35:00', title: 'State Management' },
            { time: '55:00', title: 'Hooks & Effects' }
        ]
    },
    'database-design': {
        title: 'Database Design & SQL',
        instructor: 'AI Tutor - EduBot',
        duration: '52:45',
        description: 'Master database concepts, SQL queries, and optimization.',
        chapters: [
            { time: '00:00', title: 'Database Fundamentals' },
            { time: '15:00', title: 'SQL Basics' },
            { time: '30:00', title: 'Advanced Queries' },
            { time: '42:00', title: 'Database Optimization' }
        ]
    },
    'ai-ml-course': {
        title: 'AI & Machine Learning',
        instructor: 'AI Tutor - EduBot',
        duration: '2:30:00',
        description: 'Deep dive into AI, machine learning, and neural networks.',
        chapters: [
            { time: '00:00', title: 'ML Introduction' },
            { time: '30:00', title: 'Supervised Learning' },
            { time: '1:00:00', title: 'Neural Networks' },
            { time: '1:45:00', title: 'Deep Learning' }
        ]
    },
    'cloud-architecture': {
        title: 'Cloud Architecture (AWS)',
        instructor: 'AI Tutor - EduBot',
        duration: '1:45:30',
        description: 'Design and deploy scalable cloud solutions on AWS.',
        chapters: [
            { time: '00:00', title: 'Cloud Computing Basics' },
            { time: '25:00', title: 'AWS Core Services' },
            { time: '55:00', title: 'Architecture Patterns' },
            { time: '1:25:00', title: 'Deployment Strategies' }
        ]
    }
};

// Filter Videos
function filterVideos(category) {
    // Update active tab
    document.querySelectorAll('.category-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === category || (category === 'all' && btn.textContent === 'All')) {
            btn.classList.add('active');
        }
    });
    
    // Filter videos
    const videos = document.querySelectorAll('.video-card');
    videos.forEach(video => {
        if (category === 'all' || video.dataset.category === category) {
            video.style.display = 'block';
            video.style.animation = 'fadeIn 0.3s ease';
        } else {
            video.style.display = 'none';
        }
    });
}

// Play Video
function playVideo(videoId) {
    const video = videoLectures[videoId];
    if (!video) {
        showToast('Video not found', 'error');
        return;
    }
    
    // Create video player modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="modal-content video-player-modal">
            <div class="modal-header">
                <h3><i class="fas fa-robot" style="color: #8b5cf6;"></i> ${video.title}</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="video-player-container">
                    <div class="video-player-placeholder">
                        <i class="fas fa-play-circle"></i>
                        <h4>AI Video Lecture</h4>
                        <p>Instructor: ${video.instructor}</p>
                        <p style="font-size: 0.9rem; opacity: 0.8; margin-top: 0.5rem;">${video.description}</p>
                        <button class="btn-primary" style="margin-top: 1.5rem;" onclick="showToast('Starting AI lecture playback...', 'success')">
                            <i class="fas fa-play"></i> Start Lecture
                        </button>
                    </div>
                </div>
                <div class="video-controls">
                    <button class="btn-icon" style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer;">
                        <i class="fas fa-play"></i>
                    </button>
                    <div class="video-progress">
                        <div class="video-progress-bar"></div>
                    </div>
                    <span style="color: white; font-size: 0.875rem;">00:00 / ${video.duration}</span>
                </div>
                <div style="margin-top: 1.5rem;">
                    <h4 style="margin-bottom: 1rem;">Chapters</h4>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        ${video.chapters.map((chapter, i) => `
                            <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: #f8fafc; border-radius: 8px; cursor: pointer;" 
                                 onmouseover="this.style.background='#e0e7ff'" onmouseout="this.style.background='#f8fafc'">
                                <span style="color: #667eea; font-weight: 600; font-family: monospace;">${chapter.time}</span>
                                <span style="flex: 1;">${chapter.title}</span>
                                <i class="fas fa-play-circle" style="color: #667eea;"></i>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    showToast('Loading AI video lecture...', 'info');
}

// ============================================
// Mock Tests Functions
// ============================================

const mockTests = {
    'python-basics': {
        title: 'Python Basics Quiz',
        questions: 20,
        duration: 30,
        questionsList: [
            { q: 'What is the output of print(2 + 3)?', options: ['5', '23', 'Error', 'None'], correct: 0 },
            { q: 'Which function is used to get the length of a list?', options: ['size()', 'length()', 'len()', 'count()'], correct: 2 },
            { q: 'What is the correct file extension for Python files?', options: ['.py', '.python', '.pt', '.p'], correct: 0 },
            { q: 'Which keyword is used to define a function in Python?', options: ['func', 'def', 'function', 'define'], correct: 1 }
        ]
    },
    'javascript-fundamentals': {
        title: 'JavaScript Fundamentals',
        questions: 25,
        duration: 35,
        questionsList: [
            { q: 'What is the correct way to declare a variable in JavaScript?', options: ['var name;', 'variable name;', 'v name;', 'declare name;'], correct: 0 },
            { q: 'Which symbol is used for single-line comments in JavaScript?', options: ['//', '/*', '#', '--'], correct: 0 }
        ]
    },
    'data-structures': {
        title: 'Data Structures',
        questions: 30,
        duration: 45,
        questionsList: [
            { q: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correct: 1 },
            { q: 'Which data structure follows LIFO?', options: ['Queue', 'Stack', 'Array', 'Linked List'], correct: 1 }
        ]
    },
    'aptitude-test': {
        title: 'Aptitude & Reasoning',
        questions: 40,
        duration: 60,
        questionsList: [
            { q: 'If 2 + 3 = 10, 7 + 2 = 63, 6 + 5 = 66, then 8 + 4 = ?', options: ['96', '48', '32', '24'], correct: 0 },
            { q: 'What comes next in the series: 2, 6, 12, 20, 30, ?', options: ['40', '42', '44', '46'], correct: 1 }
        ]
    }
};

let currentTest = null;
let currentQuestionIndex = 0;
let testAnswers = [];
let testTimer = null;
let timeRemaining = 0;

// View All Tests
function viewAllTests() {
    showToast('Loading all available tests...', 'info');
}

// Start Test
function startTest(testId) {
    const test = mockTests[testId];
    if (!test) {
        showToast('Test not found', 'error');
        return;
    }
    
    currentTest = test;
    currentQuestionIndex = 0;
    testAnswers = new Array(test.questionsList.length).fill(null);
    timeRemaining = test.duration * 60; // Convert to seconds
    
    // Create test interface modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'testModal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content test-interface">
            <div class="modal-header">
                <h3><i class="fas fa-clipboard-check" style="color: #f59e0b;"></i> ${test.title}</h3>
                <div class="test-timer">
                    <i class="fas fa-clock"></i>
                    <span id="testTimer">${formatTime(timeRemaining)}</span>
                </div>
            </div>
            <div class="modal-body" id="testBody">
                ${renderQuestion()}
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="prevBtn" onclick="previousQuestion()" disabled>
                    <i class="fas fa-arrow-left"></i> Previous
                </button>
                <span id="questionCounter" style="color: #64748b;">Question 1 of ${test.questionsList.length}</span>
                <button class="btn-primary" id="nextBtn" onclick="nextQuestion()">
                    Next <i class="fas fa-arrow-right"></i>
                </button>
                <button class="btn-success" id="submitBtn" onclick="submitTest()" style="display: none;">
                    <i class="fas fa-check"></i> Submit Test
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Start timer
    startTestTimer();
    showToast('Test started! Good luck!', 'success');
}

// Render Question
function renderQuestion() {
    const question = currentTest.questionsList[currentQuestionIndex];
    return `
        <div class="question-container">
            <div class="question-number">Question ${currentQuestionIndex + 1} of ${currentTest.questionsList.length}</div>
            <div class="question-text">${question.q}</div>
            <div class="options-list">
                ${question.options.map((option, i) => `
                    <div class="option-item ${testAnswers[currentQuestionIndex] === i ? 'selected' : ''}" onclick="selectOption(${i})">
                        <div class="option-letter">${String.fromCharCode(65 + i)}</div>
                        <span>${option}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Select Option
function selectOption(optionIndex) {
    testAnswers[currentQuestionIndex] = optionIndex;
    updateQuestionDisplay();
}

// Update Question Display
function updateQuestionDisplay() {
    document.getElementById('testBody').innerHTML = renderQuestion();
    document.getElementById('questionCounter').textContent = `Question ${currentQuestionIndex + 1} of ${currentTest.questionsList.length}`;
    
    // Update button states
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    
    if (currentQuestionIndex === currentTest.questionsList.length - 1) {
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('submitBtn').style.display = 'inline-flex';
    } else {
        document.getElementById('nextBtn').style.display = 'inline-flex';
        document.getElementById('submitBtn').style.display = 'none';
    }
}

// Next Question
function nextQuestion() {
    if (currentQuestionIndex < currentTest.questionsList.length - 1) {
        currentQuestionIndex++;
        updateQuestionDisplay();
    }
}

// Previous Question
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        updateQuestionDisplay();
    }
}

// Start Test Timer
function startTestTimer() {
    testTimer = setInterval(() => {
        timeRemaining--;
        document.getElementById('testTimer').textContent = formatTime(timeRemaining);
        
        if (timeRemaining <= 0) {
            clearInterval(testTimer);
            submitTest();
        }
    }, 1000);
}

// Format Time
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Submit Test
function submitTest() {
    clearInterval(testTimer);
    
    // Calculate score
    let correct = 0;
    testAnswers.forEach((answer, i) => {
        if (answer === currentTest.questionsList[i].correct) {
            correct++;
        }
    });
    
    const score = Math.round((correct / currentTest.questionsList.length) * 100);
    
    // Show results
    const modal = document.getElementById('testModal');
    modal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="modal-content" style="max-width: 500px; text-align: center;">
            <div class="modal-body" style="padding: 2rem;">
                <div style="width: 120px; height: 120px; background: ${score >= 70 ? '#dcfce7' : score >= 40 ? '#fef3c7' : '#fee2e2'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                    <i class="fas ${score >= 70 ? 'fa-trophy' : score >= 40 ? 'fa-check' : 'fa-times'}" style="font-size: 3rem; color: ${score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'};"></i>
                </div>
                <h2 style="margin-bottom: 0.5rem;">Test Completed!</h2>
                <p style="color: #64748b; margin-bottom: 1.5rem;">${currentTest.title}</p>
                <div style="font-size: 3rem; font-weight: 700; color: ${score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'}; margin-bottom: 0.5rem;">${score}%</div>
                <p style="color: #64748b; margin-bottom: 1.5rem;">You got ${correct} out of ${currentTest.questionsList.length} questions correct</p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button class="btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                    <button class="btn-primary" onclick="location.reload()">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            </div>
        </div>
    `;
    
    showToast(`Test completed! Your score: ${score}%`, score >= 70 ? 'success' : 'info');
}
