"""
EduBot - Advanced AI Education Assistant
Professional problem solver with comprehensive knowledge base
"""

import random
import re
from datetime import datetime

# Comprehensive Knowledge Base
KNOWLEDGE_BASE = {
    # Educational Concepts
    "programming": {
        "python": """Python is a versatile, high-level programming language known for its simplicity and readability.

Key Features:
• Easy syntax - reads like English
• Huge library ecosystem (NumPy, Pandas, Django)
• Used in AI/ML, web development, data science
• Cross-platform compatibility

Best for: Beginners, AI/ML, automation, web development

Example:
```python
print("Hello, World!")
# Simple, clean code
```""",
        
        "javascript": """JavaScript is the language of the web, enabling interactive and dynamic websites.

Key Features:
• Runs in every browser
• Event-driven programming
• Huge ecosystem (React, Vue, Node.js)
• Full-stack capability

Best for: Web development, mobile apps, server-side programming

Example:
```javascript
console.log("Hello, World!");
// Modern, flexible syntax
```""",
        
        "java": """Java is a robust, object-oriented language used in enterprise applications.

Key Features:
• "Write once, run anywhere"
• Strong type safety
• Excellent for large applications
• Massive enterprise adoption

Best for: Android apps, enterprise software, banking systems

Example:
```java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```""",
        
        "cpp": """C++ is a powerful language for system programming and performance-critical applications.

Key Features:
• High performance
• Memory management control
• Object-oriented + procedural
• Used in game engines, OS

Best for: Game development, system software, embedded systems

Example:
```cpp
#include <iostream>
int main() {
    std::cout << "Hello, World!";
    return 0;
}
```"""
    },
    
    "data_structures": {
        "arrays": """Arrays are fundamental data structures storing elements in contiguous memory.

Operations:
• Access: O(1) - Direct index access
• Search: O(n) - Linear search
• Insert/Delete: O(n) - Shifting required

Use when: Fixed size, frequent access by index

Example Applications:
- Storing student marks
- Image pixel data
- Simple lists""",
        
        "linked_list": """Linked Lists are dynamic data structures with nodes connected by pointers.

Types:
• Singly Linked List - One direction
• Doubly Linked List - Both directions
• Circular Linked List - Last connects to first

Operations:
• Insert/Delete: O(1) - At head
• Search: O(n) - Must traverse
• No random access

Use when: Frequent insertions/deletions, unknown size

Real-world: Browser history, music playlists""",
        
        "trees": """Trees are hierarchical data structures with a root and child nodes.

Types:
• Binary Tree - Max 2 children
• BST - Left < Root < Right
• AVL/Red-Black - Self-balancing
• Heap - Priority queue
• Trie - String storage

Operations (balanced):
• Search: O(log n)
• Insert: O(log n)
• Delete: O(log n)

Use when: Hierarchical data, fast search needed

Real-world: File systems, DOM, databases""",
        
        "graphs": """Graphs represent relationships between objects using nodes and edges.

Types:
• Directed/Undirected
• Weighted/Unweighted
• Cyclic/Acyclic

Algorithms:
• BFS - Level by level exploration
• DFS - Deep exploration
• Dijkstra - Shortest path
• Kruskal/Prim - Minimum spanning tree

Use when: Networks, maps, social connections

Real-world: GPS navigation, social networks, circuit design"""
    },
    
    "algorithms": {
        "sorting": """Sorting algorithms arrange data in a specific order.

Common Algorithms:

1. Quick Sort
   • Time: O(n log n) average
   • Space: O(log n)
   • Divide and conquer

2. Merge Sort
   • Time: O(n log n) guaranteed
   • Space: O(n)
   • Stable sort

3. Heap Sort
   • Time: O(n log n)
   • Space: O(1)
   • In-place sorting

4. Bubble Sort
   • Time: O(n²)
   • Simple but inefficient
   • Good for small datasets

Choose based on: Data size, memory constraints, stability needs""",
        
        "searching": """Searching algorithms find elements in data structures.

Types:

1. Linear Search
   • Time: O(n)
   • Works on any list
   • Simple implementation

2. Binary Search
   • Time: O(log n)
   • Requires sorted data
   • Very efficient

3. Hash-based Search
   • Time: O(1) average
   • Uses hash tables
   • Fastest for exact matches

Best practices:
- Small/unsorted data: Linear
- Large sorted data: Binary
- Frequent lookups: Hash table""",
        
        "dynamic_programming": """Dynamic Programming solves complex problems by breaking them into subproblems.

Key Concepts:
• Optimal substructure
• Overlapping subproblems
• Memoization (top-down)
• Tabulation (bottom-up)

Classic Problems:
• Fibonacci sequence
• Knapsack problem
• Longest Common Subsequence
• Matrix Chain Multiplication
• Coin Change

Approach:
1. Define subproblems
2. Find recurrence relation
3. Solve base cases
4. Build solution iteratively"""
    },
    
    "databases": {
        "sql": """SQL (Structured Query Language) manages relational databases.

Core Commands:

DDL (Data Definition):
• CREATE - Create tables/database
• ALTER - Modify structure
• DROP - Delete tables
• TRUNCATE - Remove all data

DML (Data Manipulation):
• SELECT - Query data
• INSERT - Add records
• UPDATE - Modify records
• DELETE - Remove records

Advanced:
• JOINs - Combine tables
• INDEX - Speed up queries
• TRANSACTION - ACID operations
• VIEWS - Virtual tables

Best Practices:
- Normalize data
- Use indexes wisely
- Optimize queries
- Regular backups""",
        
        "nosql": """NoSQL databases handle unstructured/big data with flexible schemas.

Types:

1. Document (MongoDB)
   • JSON-like documents
   • Flexible schema
   • Great for content management

2. Key-Value (Redis)
   • Simple key-value pairs
   • Extremely fast
   • Perfect for caching

3. Column (Cassandra)
   • Column-family storage
   • Massive scalability
   • Good for time-series data

4. Graph (Neo4j)
   • Node-relationship model
   • Complex connections
   • Social networks, recommendations

When to use:
- Big data
- Rapid prototyping
- Horizontal scaling
- Unstructured data"""
    },
    
    "web_development": {
        "frontend": """Frontend Development creates user interfaces and experiences.

Core Technologies:

1. HTML5
   • Page structure
   • Semantic elements
   • Accessibility

2. CSS3
   • Styling and layout
   • Flexbox & Grid
   • Animations
   • Responsive design

3. JavaScript
   • Interactivity
   • DOM manipulation
   • Async programming

Modern Frameworks:
• React - Component-based
• Vue - Progressive framework
• Angular - Full-featured MVC

Best Practices:
- Mobile-first design
- Performance optimization
- Cross-browser compatibility
- SEO considerations""",
        
        "backend": """Backend Development handles server-side logic and data.

Key Components:

1. Server
   • Node.js, Python, Java, Go
   • Handle HTTP requests
   • Business logic

2. Database
   • Store/retrieve data
   • SQL or NoSQL
   • Connection pooling

3. APIs
   • REST - Resource-based
   • GraphQL - Flexible queries
   • WebSocket - Real-time

Architecture Patterns:
• MVC - Model View Controller
• Microservices - Independent services
• Serverless - Cloud functions
• Monolithic - Single application

Security:
- Authentication/Authorization
- Input validation
- HTTPS/TLS
- Rate limiting"""
    },
    
    "ai_ml": {
        "machine_learning": """Machine Learning enables computers to learn from data.

Types:

1. Supervised Learning
   • Labeled training data
   • Classification & Regression
   • Algorithms: Linear Regression, SVM, Random Forest

2. Unsupervised Learning
   • No labels
   • Clustering & Dimensionality reduction
   • Algorithms: K-Means, PCA

3. Reinforcement Learning
   • Learning through rewards
   • Game playing, robotics
   • Q-Learning, Deep Q-Networks

Deep Learning:
• Neural Networks
• CNN - Computer vision
• RNN/LSTM - Sequential data
• Transformers - NLP

Tools: Python, TensorFlow, PyTorch, Scikit-learn""",
        
        "data_science": """Data Science extracts insights from structured and unstructured data.

Process:

1. Data Collection
   • APIs, databases, web scraping
   • Surveys, sensors

2. Data Cleaning
   • Handle missing values
   • Remove duplicates
   • Fix inconsistencies

3. Exploratory Data Analysis
   • Statistical analysis
   • Visualization
   • Pattern identification

4. Modeling
   • Feature engineering
   • Algorithm selection
   • Training & validation

5. Deployment
   • Productionize models
   • Monitoring
   • Retraining

Tools: Python, R, SQL, Tableau, Jupyter"""
    },
    
    "operating_systems": {
        "processes": """Processes are executing instances of programs.

Process States:
• New - Being created
• Ready - Waiting for CPU
• Running - Executing
• Waiting - For I/O
• Terminated - Finished

Process Control Block (PCB):
• Process ID
• Program counter
• CPU registers
• Memory info
• I/O status

Scheduling Algorithms:
• FCFS - First Come First Served
• SJF - Shortest Job First
• Round Robin - Time quantum
• Priority - Based on importance

Inter-process Communication:
• Shared memory
• Message passing
• Pipes
• Sockets""",
        
        "memory_management": """Memory Management allocates and tracks system memory.

Techniques:

1. Paging
   • Fixed-size blocks (pages)
   • Eliminates external fragmentation
   • Page table for mapping

2. Segmentation
   • Variable-size segments
   • Logical division (code, data, stack)
   • Segment table

3. Virtual Memory
   • Extends RAM using disk
   • Page fault handling
   • Demand paging

Allocation Strategies:
• First Fit
• Best Fit
• Worst Fit

Thrashing:
• Excessive page faults
• System spends more time paging than executing"""
    },
    
    "computer_networks": {
        "osi_model": """OSI Model standardizes network communication in 7 layers.

Layers:

7. Application Layer
   • HTTP, FTP, SMTP
   • User interface

6. Presentation Layer
   • Data translation
   • Encryption/Compression

5. Session Layer
   • Session management
   • Dialog control

4. Transport Layer
   • TCP, UDP
   • End-to-end delivery

3. Network Layer
   • IP, Routing
   • Logical addressing

2. Data Link Layer
   • MAC addressing
   • Frame delivery

1. Physical Layer
   • Cables, signals
   • Bit transmission""",
        
        "tcp_ip": """TCP/IP is the fundamental protocol suite of the Internet.

Layers:

1. Application Layer
   • HTTP, HTTPS, FTP, SMTP, DNS
   • Direct user interaction

2. Transport Layer
   • TCP - Reliable, connection-oriented
   • UDP - Fast, connectionless
   • Port numbers

3. Internet Layer
   • IP - Addressing and routing
   • ICMP - Error messages
   • ARP - Address resolution

4. Network Access Layer
   • Ethernet, Wi-Fi
   • Physical transmission

Key Concepts:
• IP Addresses (IPv4/IPv6)
• Subnetting
• Routing protocols
• NAT - Network Address Translation"""
    },
    
    # College Information
    "college_info": {
        "about": """EduBot Institute of Technology is a premier educational institution dedicated to excellence in education and research.

Established: 2010
Location: Pandharpur Smart City, Maharashtra
Type: Private Autonomous Institute
Approval: AICTE, UGC
Accreditation: NAAC 'A' Grade

Campus:
• 50-acre lush green campus
• State-of-the-art infrastructure
• Digital classrooms
• Modern laboratories
• Sports complex
• Hostel facilities

Vision: To be a globally recognized institution producing technically competent professionals

Mission: Provide quality education, foster innovation, and develop ethical leaders""",
        
        "ranking": """EduBot Institute Rankings & Recognition:

National Rankings (NIRF 2025):
• Engineering: Rank 25
• Management: Rank 32
• Overall: Rank 40

International Recognition:
• QS World Rankings: 801-1000
• Times Higher Education: 601-800

Accreditations:
• NAAC: 'A' Grade (CGPA 3.52)
• NBA: Tier-I Accreditation
• ISO 9001:2015 Certified

Awards:
• Best Emerging Institute 2024
• Excellence in Placements 2023
• Innovation in Education Award
• Green Campus Award"""
    }
}

# Pattern-based response templates
RESPONSE_PATTERNS = {
    "greeting": [
        "Hello! I'm EduBot, your AI learning assistant. I can help you with programming, data structures, algorithms, and any academic questions. What would you like to learn today?",
        "Hi there! Welcome to EduBot. I'm here to help you understand complex concepts, solve problems, and guide your learning journey. What can I assist you with?",
        "Hey! Ready to learn? I'm EduBot, powered by AI to provide detailed explanations on computer science, programming, and academic topics. What's on your mind?",
        "Greetings! I'm your personal AI tutor. Whether it's coding doubts, algorithm concepts, or career guidance - I'm here to help. What do you want to explore?"
    ],
    
    "farewell": [
        "You're welcome! Keep learning and growing. Feel free to return anytime you have questions. Happy coding! 🚀",
        "Glad I could help! Remember, consistent practice is key to mastery. Come back anytime! 👋",
        "It was great assisting you! Keep exploring, keep building. See you soon! 💡",
        "Anytime! Learning is a journey, not a destination. Reach out whenever you need help! 🌟"
    ],
    
    "gratitude": [
        "You're very welcome! I'm here 24/7 to help you learn. What else would you like to explore?",
        "Happy to help! That's what I'm here for. Any other topics you'd like to dive into?",
        "My pleasure! Learning together is what makes education great. What's next on your learning list?",
        "No problem at all! I'm always excited to help curious minds. What else can I clarify for you?"
    ],
    
    "confused": [
        "I'm here to help with your learning! Could you tell me more specifically what you'd like to know? For example, are you asking about a programming concept, a computer science topic, or something else?",
        "I'd love to assist you! To give you the best answer, could you provide a bit more detail about your question? What subject area are we discussing?",
        "Great question! To help you effectively, could you clarify what specific topic you're interested in? I can help with programming, data structures, algorithms, and more!",
        "I'm ready to help you learn! Could you expand on your question a bit? The more details you provide, the better I can assist you."
    ],
    
    "encouragement": [
        "Great question! Understanding this concept will really strengthen your fundamentals. Let me explain...",
        "Excellent topic to explore! This is fundamental to becoming a great developer. Here's what you need to know...",
        "Smart question! This concept is crucial in real-world applications. Let me break it down for you...",
        "Love the curiosity! This is exactly the kind of thinking that makes great engineers. Here's the answer..."
    ]
}

# Question type detection patterns
QUESTION_TYPES = {
    "what": ["what", "what's", "define", "explain", "describe", "tell me about"],
    "how": ["how", "how to", "how do", "how does", "how can", "how should"],
    "why": ["why", "why is", "why does", "why do", "reason"],
    "when": ["when", "when to", "when should", "time", "timing"],
    "where": ["where", "where to", "location", "place"],
    "which": ["which", "which one", "which is", "choose", "select"],
    "compare": ["compare", "difference", "versus", "vs", "better", "best"],
    "example": ["example", "sample", "show me", "demo", "code"],
    "error": ["error", "bug", "issue", "problem", "not working", "fix"],
    "advice": ["should i", "advice", "suggest", "recommend", "tip"]
}


class EduBotAI:
    """
    Advanced AI Chatbot with intelligent response generation
    """
    
    def __init__(self):
        self.conversation_history = []
        self.context = {}
    
    def detect_question_type(self, message):
        """Detect the type of question being asked"""
        message_lower = message.lower()
        for qtype, patterns in QUESTION_TYPES.items():
            if any(pattern in message_lower for pattern in patterns):
                return qtype
        return "general"
    
    def extract_topic(self, message):
        """Extract the main topic from the message"""
        message_lower = message.lower()
        
        # Programming languages
        if any(word in message_lower for word in ['python', 'py']):
            return ('programming', 'python')
        elif any(word in message_lower for word in ['javascript', 'js', 'node']):
            return ('programming', 'javascript')
        elif any(word in message_lower for word in ['java', 'jvm']):
            return ('programming', 'java')
        elif any(word in message_lower for word in ['c++', 'cpp', 'cplusplus']):
            return ('programming', 'cpp')
        
        # Data Structures
        elif any(word in message_lower for word in ['array', 'arrays']):
            return ('data_structures', 'arrays')
        elif any(word in message_lower for word in ['linked list', 'linkedlist', 'linked lists']):
            return ('data_structures', 'linked_list')
        elif any(word in message_lower for word in ['tree', 'trees', 'binary tree', 'bst']):
            return ('data_structures', 'trees')
        elif any(word in message_lower for word in ['graph', 'graphs', 'bfs', 'dfs', 'dijkstra']):
            return ('data_structures', 'graphs')
        
        # Algorithms
        elif any(word in message_lower for word in ['sort', 'sorting', 'quick sort', 'merge sort']):
            return ('algorithms', 'sorting')
        elif any(word in message_lower for word in ['search', 'searching', 'binary search', 'linear search']):
            return ('algorithms', 'searching')
        elif any(word in message_lower for word in ['dynamic programming', 'dp', 'memoization']):
            return ('algorithms', 'dynamic_programming')
        
        # Databases
        elif any(word in message_lower for word in ['sql', 'database', 'mysql', 'postgresql']):
            return ('databases', 'sql')
        elif any(word in message_lower for word in ['nosql', 'mongodb', 'redis', 'cassandra']):
            return ('databases', 'nosql')
        
        # Web Development
        elif any(word in message_lower for word in ['frontend', 'html', 'css', 'react', 'vue', 'angular']):
            return ('web_development', 'frontend')
        elif any(word in message_lower for word in ['backend', 'server', 'api', 'rest', 'nodejs']):
            return ('web_development', 'backend')
        
        # AI/ML
        elif any(word in message_lower for word in ['machine learning', 'ml', 'ai', 'neural network']):
            return ('ai_ml', 'machine_learning')
        elif any(word in message_lower for word in ['data science', 'data scientist', 'analytics']):
            return ('ai_ml', 'data_science')
        
        # Operating Systems
        elif any(word in message_lower for word in ['process', 'processes', 'scheduling', 'pcb']):
            return ('operating_systems', 'processes')
        elif any(word in message_lower for word in ['memory', 'paging', 'segmentation', 'virtual memory']):
            return ('operating_systems', 'memory_management')
        
        # Computer Networks
        elif any(word in message_lower for word in ['osi', 'osi model', 'network layers']):
            return ('computer_networks', 'osi_model')
        elif any(word in message_lower for word in ['tcp', 'ip', 'tcp/ip', 'udp', 'protocol']):
            return ('computer_networks', 'tcp_ip')
        
        # College Info
        elif any(word in message_lower for word in ['college', 'institute', 'university', 'about college']):
            return ('college_info', 'about')
        elif any(word in message_lower for word in ['ranking', 'rank', 'accreditation', 'naac']):
            return ('college_info', 'ranking')
        
        return None
    
    def is_code_request(self, message):
        """Check if user is asking for code example"""
        code_keywords = ['code', 'example', 'program', 'write', 'show me', 'syntax', 'implementation']
        return any(keyword in message.lower() for keyword in code_keywords)
    
    def is_error_help(self, message):
        """Check if user needs help with an error"""
        error_keywords = ['error', 'bug', 'issue', 'problem', 'not working', 'fix', 'debug', 'exception']
        return any(keyword in message.lower() for keyword in error_keywords)
    
    def generate_code_example(self, topic):
        """Generate code examples based on topic"""
        examples = {
            'python': '''```python
# Python Example: Simple Calculator

def calculator():
    print("Simple Calculator")
    num1 = float(input("Enter first number: "))
    operator = input("Enter operator (+, -, *, /): ")
    num2 = float(input("Enter second number: "))
    
    if operator == '+':
        result = num1 + num2
    elif operator == '-':
        result = num1 - num2
    elif operator == '*':
        result = num1 * num2
    elif operator == '/':
        result = num1 / num2 if num2 != 0 else "Error: Division by zero"
    else:
        result = "Invalid operator"
    
    print(f"Result: {result}")

calculator()
```''',
            
            'arrays': '''```python
# Array Operations Example

# 1. Basic Array Operations
arr = [64, 34, 25, 12, 22, 11, 90]

# Access - O(1)
print(f"First element: {arr[0]}")

# Search - O(n)
def linear_search(arr, target):
    for i, val in enumerate(arr):
        if val == target:
            return i
    return -1

# Insert at end - O(1)
arr.append(100)

# Delete - O(n)
arr.remove(25)  # Removes first occurrence

print(f"Array after operations: {arr}")
```''',
            
            'sorting': '''```python
# Quick Sort Implementation

def quick_sort(arr):
    """Efficient sorting algorithm with O(n log n) average time"""
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quick_sort(left) + middle + quick_sort(right)

# Example usage
numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = quick_sort(numbers)
print(f"Sorted: {sorted_numbers}")
```'''
        }
        return examples.get(topic, "I can provide code examples for this topic. Would you like a specific implementation?")
    
    def generate_error_help(self, message):
        """Provide help for common programming errors"""
        message_lower = message.lower()
        
        if 'indexerror' in message_lower or 'list index out of range' in message_lower:
            return """**IndexError Solution:**

This error occurs when you try to access an index that doesn't exist.

Common causes:
• Accessing index beyond list length
• Empty list operations
• Off-by-one errors

**Fix:**
```python
# Check bounds before accessing
my_list = [1, 2, 3]
index = 5

if index < len(my_list):
    print(my_list[index])
else:
    print(f"Index {index} is out of range")

# Or use try-except
try:
    value = my_list[index]
except IndexError:
    print("Index out of range")
```"""
        
        elif 'keyerror' in message_lower or 'key error' in message_lower:
            return """**KeyError Solution:**

This error occurs when accessing a dictionary key that doesn't exist.

**Fix:**
```python
my_dict = {'a': 1, 'b': 2}

# Method 1: Use get() with default
value = my_dict.get('c', 'Key not found')

# Method 2: Check if key exists
if 'c' in my_dict:
    value = my_dict['c']
else:
    value = 'Default value'

# Method 3: Use try-except
try:
    value = my_dict['c']
except KeyError:
    value = 'Default value'
```"""
        
        elif 'syntaxerror' in message_lower or 'invalid syntax' in message_lower:
            return """**SyntaxError Solution:**

Common causes:
• Missing colons (:)
• Mismatched parentheses/brackets
• Incorrect indentation
• Invalid characters

**Checklist:**
```python
# ✓ Correct
if x > 5:  # Don't forget the colon!
    print("x is greater")

# ✓ Correct
def my_function():  # Colon after function definition
    return 42

# ✓ Correct
my_list = [1, 2, 3]  # Matching brackets
```

**Tip:** The error message usually points to the line where Python got confused, which might be before the actual error!"""
        
        elif 'typeerror' in message_lower:
            return """**TypeError Solution:**

This error occurs when an operation is applied to an inappropriate type.

Common scenarios:

**1. Concatenating different types:**
```python
# ✗ Wrong
result = "Age: " + 25  # Can't concat str + int

# ✓ Correct
result = "Age: " + str(25)
# or
result = f"Age: {25}"
```

**2. Calling non-callable objects:**
```python
x = 5
# ✗ Wrong: x() - integers aren't callable

# ✓ Correct
if callable(x):
    x()
```

**3. Wrong number of arguments:**
```python
def greet(name):
    return f"Hello, {name}!"

# ✗ Wrong: greet() - missing argument
# ✓ Correct: greet("Alice")
```"""
        
        else:
            return """**Debugging Tips:**

1. **Read the error message carefully**
   - Error type tells you what went wrong
   - Line number shows where it happened
   - Traceback shows the call stack

2. **Use print statements**
   ```python
   print(f"Value of x: {x}")
   print(f"Type of x: {type(x)}")
   ```

3. **Use a debugger**
   ```python
   import pdb; pdb.set_trace()  # Python debugger
   ```

4. **Check for common issues:**
   - Variable names (typos?)
   - Data types
   - Loop bounds
   - Function arguments

5. **Search the error message**
   - Stack Overflow likely has solutions
   - Check official documentation

Can you share the specific error message you're getting?"""
    
    def generate_learning_path(self, topic):
        """Generate a learning path for a topic"""
        paths = {
            'python': """**Python Learning Path:**

🟢 **Beginner (Weeks 1-2)**
• Variables, data types, operators
• Conditional statements (if/else)
• Loops (for, while)
• Functions and scope
• Basic I/O operations

🟡 **Intermediate (Weeks 3-4)**
• Lists, dictionaries, tuples, sets
• File handling
• Exception handling
• Modules and packages
• Object-Oriented Programming

🟠 **Advanced (Weeks 5-6)**
• Decorators and generators
• Context managers
• Regular expressions
• Working with APIs
• Database connectivity

🔴 **Expert (Weeks 7-8)**
• Web frameworks (Flask/Django)
• Data analysis (Pandas, NumPy)
• Testing and debugging
• Performance optimization
• Design patterns

**Practice Projects:**
1. Calculator → To-Do App → Weather App
2. File organizer → Web scraper → REST API
3. Data analyzer → ML predictor → Full web app""",
            
            'data_structures': """**Data Structures Learning Path:**

🟢 **Foundations (Week 1)**
• Arrays and Strings
• Time & Space Complexity (Big O)
• Basic operations (CRUD)

🟡 **Linear Structures (Week 2)**
• Linked Lists (Singly, Doubly)
• Stacks (LIFO)
• Queues (FIFO, Priority, Circular)

🟠 **Hierarchical Structures (Week 3)**
• Binary Trees
• Binary Search Trees
• Heaps (Min/Max)
• Tries

🔴 **Graphs & Advanced (Week 4)**
• Graph representations
• BFS and DFS
• Shortest path algorithms
• Minimum Spanning Tree

⚫ **Advanced Topics**
• Hash Tables
• Segment Trees
• AVL/Red-Black Trees
• Disjoint Set Union

**Practice Strategy:**
- Solve 5 problems per topic
- Implement from scratch
- Analyze time/space complexity
- Compare different approaches"""
        }
        return paths.get(topic, f"I can create a personalized learning path for {topic}. What is your current skill level?")
    
    def get_response(self, message):
        """
        Main response generation method
        """
        message_lower = message.lower().strip()
        
        # Store in conversation history
        self.conversation_history.append({"user": message, "timestamp": datetime.now()})
        
        # Greetings
        if any(word in message_lower for word in ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'namaste', 'hola']):
            return random.choice(RESPONSE_PATTERNS["greeting"])
        
        # Farewell
        if any(word in message_lower for word in ['bye', 'goodbye', 'see you', 'take care', 'cya']):
            return random.choice(RESPONSE_PATTERNS["farewell"])
        
        # Gratitude
        if any(word in message_lower for word in ['thank', 'thanks', 'thankyou', 'ty', 'appreciate']):
            return random.choice(RESPONSE_PATTERNS["gratitude"])
        
        # Help/About the bot
        if any(word in message_lower for word in ['who are you', 'what can you do', 'help', 'capabilities', 'features']):
            return """I'm **EduBot**, your AI-powered learning assistant! 🤖

**I can help you with:**

📚 **Programming Languages**
• Python, JavaScript, Java, C/C++
• Code examples and best practices
• Debugging and error solutions

🧠 **Computer Science Concepts**
• Data Structures (Arrays, Trees, Graphs)
• Algorithms (Sorting, Searching, DP)
• Operating Systems, Networks, Databases

🌐 **Web Development**
• Frontend (HTML, CSS, React, Vue)
• Backend (Node.js, APIs, Databases)
• Full-stack architecture

🤖 **AI & Data Science**
• Machine Learning concepts
• Data analysis techniques
• Python libraries (Pandas, NumPy, TensorFlow)

🎓 **Academic Support**
• Learning paths and roadmaps
• Interview preparation
• Project guidance
• College information

**How to ask me:**
• "Explain binary search with code"
• "What's the difference between SQL and NoSQL?"
• "Help me fix this Python error"
• "Create a learning path for web development"

What would you like to learn today?"""
        
        # Check for error help requests
        if self.is_error_help(message):
            return self.generate_error_help(message)
        
        # Extract topic
        topic = self.extract_topic(message)
        
        if topic:
            category, subcategory = topic
            
            # Check if asking for code example
            if self.is_code_request(message):
                knowledge = KNOWLEDGE_BASE.get(category, {}).get(subcategory, "")
                code_example = self.generate_code_example(subcategory)
                return f"{random.choice(RESPONSE_PATTERNS['encouragement'])}\n\n{knowledge}\n\n**Here's a practical example:**\n\n{code_example}\n\nWould you like me to explain any specific part or provide more examples?"
            
            # Check if asking for learning path
            if any(word in message_lower for word in ['learning path', 'roadmap', 'how to learn', 'where to start', 'course']):
                return self.generate_learning_path(subcategory)
            
            # Return knowledge with encouragement
            knowledge = KNOWLEDGE_BASE.get(category, {}).get(subcategory, "")
            if knowledge:
                return f"{random.choice(RESPONSE_PATTERNS['encouragement'])}\n\n{knowledge}\n\nWould you like me to:\n• Show a code example?\n• Explain a specific part in detail?\n• Suggest related topics to learn next?"
        
        # Compare questions
        if any(word in message_lower for word in ['difference', 'compare', 'versus', 'vs', 'better']):
            if 'sql' in message_lower and 'nosql' in message_lower:
                return """**SQL vs NoSQL - Key Differences:**

| Feature | SQL | NoSQL |
|---------|-----|-------|
| **Structure** | Fixed schema | Flexible schema |
| **Scaling** | Vertical | Horizontal |
| **Data** | Structured tables | Documents, key-value, graphs |
| **Joins** | Efficient | Limited/Not supported |
| **ACID** | Full support | Varies by type |
| **Best for** | Complex queries, transactions | Big data, rapid development |

**When to use SQL:**
• Banking, financial systems
• Complex relationships
• Strict data integrity
• Standard reporting

**When to use NoSQL:**
• Real-time analytics
• Rapid prototyping
• Massive scale
• Unstructured data

**Popular Options:**
• SQL: PostgreSQL, MySQL, Oracle
• NoSQL: MongoDB, Redis, Cassandra

Both can coexist in modern architectures!"""
            
            elif 'array' in message_lower and 'linked list' in message_lower:
                return """**Array vs Linked List:**

| Operation | Array | Linked List |
|-----------|-------|-------------|
| **Access** | O(1) - Random | O(n) - Sequential |
| **Insert (beginning)** | O(n) | O(1) |
| **Insert (end)** | O(1)* | O(n) or O(1)** |
| **Delete** | O(n) | O(1) with pointer |
| **Memory** | Contiguous | Scattered |
| **Cache** | Friendly | Not friendly |

*Amortized for dynamic arrays
**With tail pointer

**Use Array when:**
• Frequent access by index
• Fixed size known in advance
• Memory locality matters

**Use Linked List when:**
• Frequent insertions/deletions
• Unknown size
• Need efficient reordering

**Real-world examples:**
• Array: Image pixels, matrix operations
• Linked List: Browser history, music playlist"""
            
            elif 'bfs' in message_lower and 'dfs' in message_lower:
                return """**BFS vs DFS - Graph Traversal:**

**BFS (Breadth-First Search)**
• Explores level by level
• Uses Queue (FIFO)
• Good for: Shortest path, level-order traversal
• Space: O(w) where w = max width

```python
from collections import deque
def bfs(graph, start):
    visited = set([start])
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
```

**DFS (Depth-First Search)**
• Explores as deep as possible
• Uses Stack (LIFO) or Recursion
• Good for: Path finding, topological sort, cycles
• Space: O(h) where h = max depth

```python
def dfs(graph, node, visited=None):
    if visited is None:
        visited = set()
    visited.add(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)
```

**When to use:**
• BFS: Shortest path in unweighted graphs
• DFS: Maze solving, detecting cycles"""
        
        # Interview preparation
        if any(word in message_lower for word in ['interview', 'prepare', 'preparation', 'coding interview', 'technical interview']):
            return """**Technical Interview Preparation Guide:**

📋 **Before the Interview:**
• Research the company thoroughly
• Review the job description
• Prepare your projects explanation (STAR method)
• Practice coding on whiteboard/without IDE

💻 **Coding Rounds:**
1. **Understand** - Clarify requirements, ask questions
2. **Approach** - Discuss multiple solutions
3. **Optimize** - Time/space complexity analysis
4. **Code** - Clean, readable code
5. **Test** - Walk through with examples

🎯 **Key Topics to Master:**
• Arrays & Strings (most common)
• Trees & Graphs (FAANG favorites)
• Dynamic Programming (hard problems)
• System Design (for senior roles)

📚 **Resources:**
• LeetCode (Easy → Medium → Hard)
• Cracking the Coding Interview
• System Design Primer (GitHub)
• Company-specific questions on Glassdoor

**Practice Schedule:**
• Week 1-2: Arrays, Strings, Hashing
• Week 3-4: Linked Lists, Stacks, Queues
• Week 5-6: Trees, Graphs
• Week 7-8: DP, Greedy, Backtracking

Would you like specific practice problems for any topic?"""
        
        # Career advice
        if any(word in message_lower for word in ['career', 'job', 'placement', 'package', 'salary', 'scope', 'future']):
            return """**Career Guidance in Tech:**

🚀 **High-Demand Career Paths:**

1. **Software Development**
   • Full-Stack Developer (₹6-25 LPA)
   • Backend Engineer (₹8-30 LPA)
   • Mobile App Developer (₹5-20 LPA)

2. **Data & AI**
   • Data Scientist (₹8-35 LPA)
   • ML Engineer (₹10-40 LPA)
   • AI Researcher (₹15-50+ LPA)

3. **Cloud & DevOps**
   • Cloud Architect (₹15-45 LPA)
   • DevOps Engineer (₹8-30 LPA)
   • Site Reliability Engineer (₹12-35 LPA)

4. **Cybersecurity**
   • Security Engineer (₹8-35 LPA)
   • Ethical Hacker (₹6-25 LPA)

📈 **Skills in Demand (2025):**
• Python, JavaScript, Go
• AWS/Azure/GCP
• Kubernetes, Docker
• React, Node.js
• Machine Learning
• Data Engineering

💡 **Tips for Success:**
1. Build a strong GitHub portfolio
2. Contribute to open source
3. Write technical blogs
4. Network on LinkedIn
5. Get certifications (AWS, Google, etc.)

Our college provides excellent placement support with 95% placement rate and average package of ₹8.5 LPA!

What career path interests you most?"""
        
        # Project ideas
        if any(word in message_lower for word in ['project', 'projects', 'idea', 'build', 'create', 'make']):
            return """**Project Ideas by Skill Level:**

🟢 **Beginner Projects:**
• Calculator with GUI
• To-Do List App
• Weather App (API)
• Personal Portfolio Website
• File Organizer Script
• Quiz Application

🟡 **Intermediate Projects:**
• Blog Platform (CRUD)
• E-commerce Website
• Chat Application (Socket.io)
• URL Shortener
• Expense Tracker
• Movie Recommendation System

🟠 **Advanced Projects:**
• Social Media Platform
• Real-time Collaboration Tool
• AI Chatbot
• Stock Price Predictor
• Face Recognition System
• Distributed Task Queue

🔴 **Expert/Portfolio Projects:**
• Full SaaS Application
• Blockchain-based System
• Scalable Microservices
• Computer Vision App
• NLP-based Content Generator
• IoT Dashboard

**Project Selection Tips:**
1. Solve a real problem you face
2. Use technologies you want to learn
3. Deploy it live (Heroku, AWS, Vercel)
4. Write documentation
5. Share on GitHub with README

**Current Trending Projects:**
• AI-powered apps (ChatGPT API)
• Web3/Blockchain apps
• Real-time collaboration tools
• Health & fitness trackers

What type of project are you interested in building?"""
        
        # Topic: Quantum Computing
        if any(word in message_lower for word in ['quantum', 'quantum computing', 'qubit', 'superposition', 'entanglement']):
            return """**Quantum Computing - The Future of Computation**

Quantum computing is a revolutionary computing paradigm that uses quantum mechanical phenomena to perform calculations.

**Key Concepts:**

🔬 **Qubits (Quantum Bits)**
• Unlike classical bits (0 or 1), qubits can be 0, 1, or both simultaneously
• This property is called **superposition**
• Enables parallel processing of vast amounts of data

🌀 **Superposition**
• Qubits exist in multiple states at once
• Allows quantum computers to explore many solutions simultaneously
• Think of it like spinning a coin - it's both heads AND tails while spinning

🔗 **Entanglement**
• Two qubits can be linked in such a way that measuring one instantly affects the other
• Even if they're light-years apart!
• Einstein called it "spooky action at a distance"

⚡ **Quantum Speedup**
• Problems that would take classical computers millions of years
• Quantum computers can solve in minutes
• Especially powerful for: cryptography, drug discovery, optimization

**Real-World Applications:**
• 🔐 Breaking modern encryption (RSA, ECC)
• 💊 Drug discovery and molecular simulation
• 🚗 Traffic flow optimization
• 🌤️ Weather prediction
• 🤖 AI and machine learning acceleration

**Companies Leading the Race:**
• IBM (IBM Quantum)
• Google (Quantum AI)
• Microsoft (Azure Quantum)
• Amazon (AWS Braket)
• Rigetti, IonQ, D-Wave

**Learning Path:**
1. Linear Algebra basics
2. Quantum mechanics fundamentals
3. Qiskit (IBM) or Cirq (Google)
4. Quantum algorithms (Shor's, Grover's)

Want to learn about quantum algorithms or how to program a quantum computer?"""

        # Topic: Control Room / Computing Room
        if any(word in message_lower for word in ['control room', 'computing room', 'server room', 'data center', 'control computing']):
            return """**Control Computing Room / Data Center**

A control computing room (also called server room or data center) is a specialized facility housing computer systems and associated components.

**Key Components:**

🖥️ **Server Infrastructure**
• Rack-mounted servers
• Blade servers
• Storage systems (SAN, NAS)
• Network equipment (switches, routers, firewalls)

🌡️ **Environmental Control**
• **Precision cooling** (CRAC/CRAH units)
• Temperature: 18-27°C (64-80°F)
• Humidity: 40-60% RH
• Hot aisle/cold aisle configuration

⚡ **Power Systems**
• UPS (Uninterruptible Power Supply)
• Backup generators
• PDU (Power Distribution Units)
• Redundant power feeds

🔒 **Security Measures**
• Biometric access control
• 24/7 surveillance cameras
• Fire suppression systems (FM-200, Novec)
• Environmental monitoring sensors

**Types of Control Rooms:**

1. **Enterprise Data Center**
   • Company's own IT infrastructure
   • Private cloud hosting

2. **Colocation Facility**
   • Rent space for your servers
   • Shared infrastructure

3. **Hyperscale Data Center**
   • Google, Amazon, Microsoft scale
   • 100,000+ servers

4. **Edge Data Center**
   • Smaller, distributed locations
   • Low latency for local users

**Industry Standards:**
• **Tier I-IV** classification (Uptime Institute)
• **ISO 27001** security standards
• **TIA-942** telecommunications standards

**Career Opportunities:**
• Data Center Technician
• Network Engineer
• Cloud Architect
• DevOps Engineer
• Site Reliability Engineer (SRE)

Would you like to know about data center certifications or how to design a server room?"""

        # Topic: General Computing/Programming Questions
        if any(word in message_lower for word in ['computing', 'compute', 'calculation', 'processing']):
            return """**Computing Fundamentals**

Computing refers to the use of computers to process, store, and manage information.

**Types of Computing:**

💻 **Sequential Computing**
• One instruction at a time
• Traditional programming model
• Limited by single processor speed

⚡ **Parallel Computing**
• Multiple processors work simultaneously
• Divides tasks into smaller subtasks
• Used in: GPUs, supercomputers, modern CPUs

☁️ **Cloud Computing**
• On-demand computing resources
• Pay-as-you-go model
• Types: IaaS, PaaS, SaaS
• Providers: AWS, Azure, GCP

🌐 **Distributed Computing**
• Multiple computers work together
• Appears as single system to users
• Examples: Hadoop, Spark, blockchain

🧠 **Edge Computing**
• Processing near data source
• Reduces latency
• IoT devices, autonomous vehicles

**Computing Paradigms:**

| Paradigm | Description | Example |
|----------|-------------|---------|
| **Batch** | Process data in groups | Payroll systems |
| **Real-time** | Immediate processing | Stock trading |
| **Interactive** | User-driven | Web applications |
| **Embedded** | Dedicated systems | Smart thermostats |

**Performance Metrics:**
• **FLOPS** - Floating point operations per second
• **Throughput** - Tasks completed per unit time
• **Latency** - Time to complete one task
• **Efficiency** - Performance per watt

Would you like to dive deeper into any specific type of computing?"""

        # Try to provide a helpful general response instead of confusion
        return f"""I'd be happy to help you with "{message}"!

As your AI learning assistant, I can help you with:

📚 **Academic Topics**
• Programming (Python, Java, C++, JavaScript)
• Data Structures & Algorithms
• Computer Science concepts
• Mathematics & Statistics

🎓 **Education Support**
• Course recommendations
• Study strategies
• Project guidance
• Interview preparation

💻 **Technical Skills**
• Web development
• Machine Learning & AI
• Database systems
• Cloud computing

Could you please provide more details about what you'd like to learn? For example:
• "Explain {message} in simple terms"
• "How does {message} work?"
• "Give me examples of {message}"
• "Compare {message} with alternatives"

I'm here to make your learning journey easier! 🚀"""


# Global bot instance
_bot_instance = None

def get_bot_instance():
    """Get or create the global bot instance"""
    global _bot_instance
    if _bot_instance is None:
        _bot_instance = EduBotAI()
    return _bot_instance


def get_response(message):
    """
    Main entry point for getting chatbot responses
    Compatible with existing API
    """
    bot = get_bot_instance()
    return bot.get_response(message)
