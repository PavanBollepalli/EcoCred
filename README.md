
<div align="center">

# 🌱 EcoCred Web

### *Gamified Environmental Education Platform*

*Turning climate education into climate action, one student at a time* 🌍✨

[![Next.js](https://img.shields.io/badge/Next.js-14.2.16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.9-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker)](https://docker.com/)



</div>

---


## 🎯 Overview

EcoCred Web is a **comprehensive gamified environmental education platform** that transforms sustainability learning into an engaging, measurable, and community-driven experience. Through interactive lessons, real-world eco tasks, and AI-powered assistance, students earn points, badges, and ranks while teachers track engagement and environmental impact.

### 🌟 Key Features

<table>

<tr>
<td width="50%">

**🎮 Gamified Learning**  
Points, badges, leaderboards, and progress tracking.

**📚 Interactive Lessons**  
Engaging environmental education content.

**🌍 Real-World Tasks**  
Verified eco-actions with impact measurement.

**🤖 AI Chat Assistant**  
24/7 environmental guidance and support.

</td>
<td width="50%">

**👥 Multi-Role System**  
Students, teachers, and admin interfaces

**📊 Analytics Dashboard**  
Comprehensive progress and impact tracking

**🏫 School Management**  
Multi-school support with individual dashboards

**📱 Responsive Design**  
Works seamlessly across all devices

</td>
</tr>
</table>

---

## 🚀 Quick Start

### 📋 Prerequisites.

> **Required:** Node.js 18+ | **Recommended:** Docker | **Optional:** MongoDB (local)

### 🐳 Docker Setup *(Recommended)*

```bash
# 1. Clone the repository
git clone https://github.com/your-org/eco-cred.git
cd eco-cred

# 2. Build and run with Docker
docker build -t eco-cred .
docker run -p 3000:3000 eco-cred

# 3. Access the application
# 🌐 http://localhost:3000
```

### 💻 Local Development    

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# 3. Start MongoDB (if not using Docker)
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# 4. Run the development server
npm run dev

# 5. Initialize demo data
curl -X POST http://localhost:3000/api/init
```

---

## 🏗️ Tech Stack

<table>
<tr>
<td width="33%">

### 🎨 **Frontend**
- **Next.js 14** - React framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible components
- **Lucide React** - Beautiful icons

</td>
<td width="33%">

### ⚙️ **Backend**
- **Next.js API Routes** - Serverless endpoints
- **MongoDB** - NoSQL database
- **Mongoose** - Object modeling
- **MinIO** - Object storage
- **OpenRouter API** - AI chat

</td>
<td width="33%">

### 🚀 **DevOps**
- **Docker** - Containerization
- **Coolify** - Self-hosted platform
- **Vercel Analytics** - Monitoring

</td>
</tr>
</table>


---

## 🎮 User Roles & Features

<table>
<tr>
<td width="33%">

### 👨‍🎓 **Students**
- Complete interactive lessons
- Submit eco-action tasks
- Track progress & achievements
- Compete on leaderboards
- Chat with AI assistant

</td>
<td width="33%">

### 👩‍🏫 **Teachers**
- Create & manage eco-tasks
- Monitor student progress
- Access analytics & reports
- Manage classroom activities
- Verify submissions

</td>
<td width="33%">

### 👨‍💼 **Administrators**
- School management
- Global statistics
- System configuration
- Data export tools

</td>
</tr>
</table>

## 👥 Team

<div align="center">

**EcoCred** was made possible by our dedicated team:

**Sudheer Bhuvana** • **Praveen Kanaparthy** • **Nischal Singana** • **Kushaal Nayak** • **Sindhuja** • **Sai Nandhan**

</div>

<div align="center">

### 🌍 **Making Environmental Education Engaging, Measurable, and Impactful**

[![Live Demo](https://img.shields.io/badge/🌐https://ecocred.sudheerbhuvana.in/-00B15D?style=for-the-badge)](https://ecocred.sudheerbhuvana.in/)

---

**Made with ❤️ by the EcoCred Team**

</div>
