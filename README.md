# 🏟️ Sports Facility Booking App

A full-stack web application for managing sports groups, memberships, and future booking of sports facilities.

⚠️ **Note:** This project is currently under active development. Core group and user management features are implemented, while key functionalities such as facility (arena) management, time slot booking, and payments are still in progress.

---

## 🚀 Technologies

### Backend
- ASP.NET Core (.NET 8)
- Entity Framework Core
- SQL Server
- REST API

### Frontend
- Angular
- TypeScript
- Bootstrap
- SCSS

---

## ✨ Current Features

### 🔐 Authentication & Security
- JWT-based authentication
- User registration & login
- Protected API endpoints

### 👥 Group Management
- Create and edit groups
- Add group photo, description, city, and sport category
- View group details
- View group members

### 📩 Invitations & Join Requests
- Admin can invite users to groups
- Users can:
  - Accept or decline invitations
- Users can request to join groups
- Admin can:
  - Accept join requests
  - Reject join requests

### 🔔 Notifications System
- Bell icon in the top-right navbar
- Notifications for:
  - received invitations
  - accepted invitations
  - join requests
- Persistent notifications (stored in database)
- Mark notifications as read

### 👤 User Profiles
- View user profiles
- Navigate to profile pages
- UI prepared for future messaging feature

### 📊 Group Members
- Popup displaying group members
- Admin highlighted
- Actions:
  - "View Profile"
  - "Message" (UI placeholder)
- Admin can remove members

### 🚪 Membership Management
- Leave group functionality
- Confirmation dialogs for actions

### 📱 Navigation
- Top navbar (notifications, profile)
- Bottom navbar:
  - displays user’s groups
  - horizontal scroll (no visible scrollbar)
  - fixed to bottom
  - smooth animation on load

---

## 🚧 Work in Progress (Upcoming Features)

The following features are planned and currently under development:

### 🏟️ Facility (Arena) Management
- Create and manage sports facilities
- Define available arenas/fields

### ⏱️ Time Slots & Availability
- Define available time slots
- Display free and occupied slots

### 📅 Booking System
- Reserve sports terms
- Manage bookings per group/user

### 💳 Payment System
- Payment for reservations
- Integration with payment providers (planned)

### 💬 Messaging System
- Direct messaging between users
- Group communication

---

## 🏗️ Project Structure

```text
RezervacijaSportskihTermina/
│
├── frontend/              # Angular application
│   ├── src/app/
│   ├── services/
│   ├── components/
│
├── SportskiTerminiAPI/    # ASP.NET Core backend
│   ├── Controllers/
│   ├── Models/
│   ├── DTOs/
│   ├── Repositories/
│   ├── Migrations/
│
├── SportskiTerminiAPI.sln
└── .gitignore
```

## ⚙️ Getting Started

### 🔧 Backend

```bash
cd SportskiTerminiAPI
dotnet restore
dotnet ef database update
dotnet run
```

### 🎨 Frontend

```bash
cd frontend
npm install
npm start
```

### 🗄️ Database

```bash
dotnet ef database update
```

### 📄 License
This project is developed for educational and portfolio purposes.