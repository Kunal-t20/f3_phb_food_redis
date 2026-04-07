# Food Redistribution System

A web-based platform designed to reduce food waste by connecting **food donors** with **recipients in need**, while ensuring food safety through **inspection and administrative monitoring**.

The system manages the entire lifecycle of donated food from submission to delivery confirmation.

---

# Project Overview

Food waste is a major global issue while many communities still struggle with hunger.
This system allows organizations or individuals to donate surplus food and redistribute it safely.

The platform ensures:

* Food safety through **inspection**
* Transparent **claim and delivery tracking**
* Administrative **monitoring and control**

---
---

# Live Demo

Frontend (Vercel)
https://hungerreliefnetwoek.vercel.app

Backend API (Render)
https://f3-phb-food-redis.onrender.com


---

# System Roles

### Donor

* Register and login
* Donate food
* View their donations
* Mark food as **Delivered** after recipient claim

### Inspector

* Review donated food
* Approve or reject food items
* Maintain inspection history

### Recipient

* Browse approved food
* Claim available food
* View claim history

### Admin

* Manage users
* Monitor food records
* Monitor delivery status

---

# System Workflow

Food follows the lifecycle below:

```
Donor Donates Food
        ↓
Pending Inspection
        ↓
Inspector Approves / Rejects
        ↓
Approved Food Visible to Recipients
        ↓
Recipient Claims Food
        ↓
Food Status → Claimed
        ↓
Donor Confirms Delivery
        ↓
Food Status → Delivered
```

---

# Tech Stack

### Frontend

- React
- Vite
- Axios
- Tailwind CSS

### Backend

- FastAPI
- SQLAlchemy
- JWT Authentication

### Database

- PostgreSQL

### Deployment

- Frontend → Vercel
- Backend → Render
- Database → Render PostgreSQL
---

# Project Structure

```
 Project Structure

f3_phb_food_redis
│
├── backend
│   │
│   ├── main.py
│   ├── routers.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── auth.py
│   ├── utils.py
│   ├── create_admin.py
│   └── requirements.txt
│
├── frontend
│   │
│   ├── public
│   ├── src
│   │   ├── api
│   │   │   └── api.js
│   │   ├── components
│   │   ├── pages
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# Database Entities

Main tables used in the system:

* users
* food_items
* inspection_records
* deliveries
* warehouse

Relationships:

```
User → FoodItem (donor)
FoodItem → InspectionRecord
FoodItem → Delivery
Delivery → Recipient
```

---

# Installation & Setup

## 1 Clone Repository

```
git clone <>
```

---

## 2 Backend Setup

Create virtual environment

```
python -m venv venv
```

Activate environment

Windows:

```
venv\Scripts\activate
```

Install dependencies

```
pip install -r requirements.txt
```

---

## 3 Configure Environment

Create `.env`

```
DATABASE_URL=<"">
SECRET_KEY=your_secret_key
ADMIN_SECRET_CODE=admin_code
```

---

## 4 Run PostgreSQL with Docker

```
docker run --name food_distribution_postgres \
-e POSTGRES_USER=admin \
-e POSTGRES_PASSWORD=admin123 \
-e POSTGRES_DB=food_redis_db \
-p 5000:5432 \
-d postgres
```

---

## 5 Run Backend

```
uvicorn main:app --reload
```

API available at:

```
http://127.0.0.1:8000
```

Swagger documentation:

```
http://127.0.0.1:8000/docs
```

---

## 6 Frontend Setup

```
cd frontend
npm install
npm run dev
```

---

# API Features

### Authentication

* Register user
* Login user
* JWT token authorization

### Donor

* Donate food
* View donations
* Delete donation (before inspection)
* Mark delivery complete

### Inspector

* View pending food
* Approve / Reject donations
* View inspection history

### Recipient

* View approved food
* Claim food
* View claim history

### Admin

* View users
* Delete users
* Monitor deliveries
* Delete food records

---

# Security Features

* JWT authentication
* Role-based access control
* Secure password hashing
* Protected API routes

---

# Future Improvements

Possible enhancements:

* Real-time delivery tracking
* SMS or email notifications
* NGO integration
* AI-based food safety validation
* Automated logistics matching

---




