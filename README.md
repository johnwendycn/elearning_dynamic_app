# JONIKWIRIA Limited — Enterprise E-Learning & Digital Solutions Platform

A full-stack, enterprise-grade E-Learning Management System (LMS) and Dynamic Content Management System (CMS) with an AdminLTE management portal, student learning environment, certificate generation/verification, and automated newsletter broadcast system.

---

## 🚀 Key Features

### 1. Public Portal & Dynamic CMS
- **Responsive Modern UI**: Built with React, Tailwind/CSS variables, dark/light theme support, and mobile viewport optimizations (80% scaling for compact device ergonomics).
- **Dynamic Content Management**: Header navigation, multi-column footer builder (with mobile accordions), hero carousels, dynamic pages (`/p/:slug`), news articles, and events.
- **Multilingual Support**: Interactive language switcher modal with multiple language options.
- **Interactive Channels**: Floating movable WhatsApp contact launcher, contact inquiries desk, and live event registrations.

### 2. Student Learning Portal (LMS)
- **Course Catalog & Detail**: Interactive course listings by faculty/department with rich curriculum roadmaps.
- **Interactive Course Player**: Module and unit progression tracker with video streaming, downloadable attachments, and auto-marking.
- **Certified Credentials**: Automatic issuance of verifiable Certificates of Completion featuring cryptographic verification URLs and QR codes (`/verify/:credentialId`).

### 3. Newsletter & Subscriber Broadcast System
- **Public Subscription**: Instant signup via homepage digest and footer strips with automated welcome kit emails.
- **1-Click Unsubscribe**: Compliant public unsubscribe interface (`/unsubscribe?email=...`) with instant database status toggling.
- **Admin Broadcast Push**: Dispatch rich announcements, upcoming event notices, and course releases to all or selected subscribers.

### 4. AdminLTE Administrative Portal
- **Role-Based Access Control (RBAC)**: Fine-grained permission matrices (Roles, Modules, and User Privilege Overrides).
- **Enterprise Audit Trails & Activity Logging**: Complete telemetry tracking for user signins, profile updates, and entity mutations.
- **Content & Operations Management**:
  - Departments & Courses Management
  - News & Event Management
  - Carousel & Media Manager
  - Header, Menu, and Footer Layout Builders
  - Contact Inquiries & Subscriber Management

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Lucide Icons, Axios.
- **Backend**: Node.js, Express.js, Sequelize ORM, MySQL.
- **Authentication**: JWT (JSON Web Tokens), bcryptjs password hashing.
- **Email Delivery**: Nodemailer with TLS/SSL SMTP transport.

---

## 📁 Repository Structure

```
jonikwiria/
├── backend/                  # Express.js REST API & Sequelize Models
│   ├── src/
│   │   ├── config/           # Database & environment configurations
│   │   ├── controllers/      # API Controllers
│   │   ├── middlewares/      # Auth, RBAC, Audit, and Upload middlewares
│   │   ├── models/           # Sequelize ORM schema definitions
│   │   ├── routes/           # REST endpoints
│   │   ├── services/         # Business logic services
│   │   └── utils/            # Mailer, QR generator, Audit logger
│   └── server.js             # Express application entrypoint
│
├── frontend/                 # React + Vite Single Page Application
│   ├── src/
│   │   ├── components/       # Layout, AdminLTE, and common UI components
│   │   ├── context/          # Auth, Theme, OrgSettings, and Alert Contexts
│   │   ├── pages/            # Public, Student, and Admin page views
│   │   └── services/         # Axios API client
│   └── index.html
│
└── .gitignore                # Root git ignore specification
```

---

## ⚙️ Quick Start

### 1. Prerequisites
- Node.js (v18+ recommended)
- MySQL Database Server (e.g., MySQL 8.0 or MariaDB via XAMPP/cPanel)

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MySQL credentials and SMTP settings
node src/server.js
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📄 License
Proprietary — &copy; JONIKWIRIA Technology Limited. All rights reserved.
