# Givyansh CRM (Recruitment Management System)

A state-of-the-art multi-tenant SaaS CRM built for high-performance recruitment teams.

## 🚀 Getting Started

### 1. Project Setup
- Open this directory in your terminal.
- Run `npm install` (already performed by the agent).

### 2. Database Configuration
- Ensure you have **MongoDB** running locally on its default port (`27017`).
- Connection string is preset to: `mongodb://localhost:27017/fast_rms`.
- Alternatively, you can add `MONGODB_URI` to a `.env.local` file.

### 3. Seed Initial Data
- Start the development server (Step 4).
- Open your browser and navigate to: `http://localhost:3000/api/seed`.
- This will initialize:
    - **Super Admin:** `girish@givyanshcrm.com` / `admin123`
    - **Democompany Admin (Boss):** `hr@google.com` / `google123`
    - **Demo Recruiter:** `ashish@google.com` / `google123`

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the result.

---

## 🏗️ Architecture & Features

### 🏢 Multi-Tenant SaaS
- Single-database tenant isolation.
- Company-specific dashboard permissions.
- Plan-based scaling.

### 🔐 Auth & RBAC
- Secure login using JSON Web Tokens (JWT) stored in HttpOnly cookies.
- Role-based access control middleware.

### 👑 Role-Based Dashboards
- **Super Admin:** Manage companies, tenants, and global stats.
- **Boss Portal:** Full company oversight, conversion metrics, and financial summaries.
- **Manager Portal:** Strategy management for Team Leaders.
- **Team Leader Portal:** Direct monitoring of recruiter activity and lead assignment.
- **Recruiter Portal:** High-velocity calling pipeline with one-click status logging.

### 🎨 Premium UI/UX
- **Glassmorphism:** Modern see-through surfaces with backdrop blurring.
- **Animations:** Smooth transitions using `framer-motion`.
- **Responsive:** Fully optimized for Mobile and Desktop.

---
Built with Next.js 15, React 19, MongoDB/Mongoose, and Vanilla CSS.
Developed by Girish Goswami.
