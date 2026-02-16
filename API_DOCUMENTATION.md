# EcoCred API Reference

This document provides a simple overview of the key API endpoints, their expected inputs, and response objects.

## Base URLs
- **Backend**: `http://localhost:3000/api`
- **AI Service**: `http://localhost:8000/api`

---

## 1. User Authentication & Managment

### **Get User Profile**
- **Endpoint**: `GET /api/users/user?email={email}`
- **Output**: User Object
```json
{
  "id": "user_123",
  "name": "Jane Doe",
  "email": "jane@school.edu",
  "role": "student",
  "school": "Green Valley High",
  "ecoPoints": 120,
  "badges": ["First Step"]
}
```

### **Register User**
- **Endpoint**: `POST /api/users`
- **Input**: User Details
```json
{
  "id": "user_123",
  "email": "jane@school.edu",
  "name": "Jane Doe",
  "role": "student",
  "school": "Green Valley High",
  "password": "hashed_secret"
}
```
- **Output**: `200 OK`

---

## 2. Tasks & Submissions

### **List All Tasks**
- **Endpoint**: `GET /api/tasks`
- **Output**: Array of Tasks
```json
[
  {
    "id": "task_1",
    "title": "Plant a Tree",
    "category": "planting",
    "points": 50,
    "description": "Plant a native sapling and water it."
  }
]
```

### **Submit Task Evidence**
- **Endpoint**: `POST /api/submissions`
- **Input**: Submission Data
```json
{
  "id": "sub_001",
  "taskId": "task_1",
  "studentId": "user_123",
  "evidence": "https://storage.example.com/image.jpg",
  "location": "School Garden",
  "status": "pending"
}
```
- **Output**: `200 OK`

---

## 3. AI Analysis (Python Service)

### **Analyze Image**
- **Endpoint**: `POST /api/analyze`
- **Input**: Multipart Form Data
  - `file`: image_file.jpg
  - `category`: "planting"
- **Output**: Analysis Result
```json
{
  "success": true,
  "detectedObjects": [
    { "name": "plant", "confidence": 0.95 }
  ],
  "ecoCategory": "planting",
  "relevanceScore": 0.98,
  "reasoning": "High confidence detection of plant."
}
```

### **Classify Image**
- **Endpoint**: `POST /api/classify`
- **Input**: Multipart Form Data
  - `file`: image_file.jpg
- **Output**: Category Scores
```json
{
  "success": true,
  "primaryCategory": "waste",
  "categories": {
    "waste": 0.85,
    "planting": 0.10,
    "energy": 0.05
  }
}
```

---

## 4. Gamification

### **Get School Badges**
- **Endpoint**: `GET /api/badges?schoolId={id}`
- **Output**: List of Badges
```json
[
  {
    "id": "badge_1",
    "name": "Eco Warrior",
    "icon": "Trophy",
    "requirement": { "type": "points", "value": 100 }
  }
]
```

### **Get Global Stats**
- **Endpoint**: `GET /api/stats`
- **Output**: Global Impact Counters
```json
{
  "totalSaplings": 1500,
  "totalWasteSaved": 5000,
  "totalStudents": 400
}
```
