# 🏟️ Sports Facility Booking App

A full-stack web application for managing sports groups, memberships, real-time communication, and future booking of sports facilities.

⚠️ **Note:** This project is currently under active development. Core authentication, group management, facility (arena) management, membership, messaging, notifications, and online/offline activity features are implemented, while time slot booking, and payments are still in progress.

---

## 🌐 Live Demo

- **Frontend:** https://sport-booking-app.netlify.app/
- **Backend API / Swagger:** https://rezervacija-sportskih-termina-production.up.railway.app/swagger

### Demo Access

You can explore the application by registering a new account or by using the existing demo account:

```text
Username: Tarik
Password: z@Rekreaciju07
```

---

## 🚀 Technologies

### Backend
- ASP.NET Core (.NET 8)
- Entity Framework Core
- PostgreSQL
- REST API
- SignalR
- Railway

### Frontend
- Angular
- TypeScript
- Bootstrap
- SCSS
- Netlify

---

## ✨ Current Features

### 🔐 Authentication & Security
- JWT-based authentication
- User registration and login
- Protected API endpoints
- Authorization for secured application features

### 👥 Group Management
- Create, edit, and delete groups
- Add group photo, description, city, and sport category
- View group details
- View group members
- Admin can remove members from a group

### 📩 Invitations & Join Requests
- Admin can invite users to groups
- Users can accept or decline invitations
- Users can request to join groups
- Admin can accept or reject join requests

### 💬 Messaging System
- Private chat between users
- Group chat between group members
- Real-time messaging using SignalR
- Live typing indicator for private and group chat
- Delivered and seen message status tracking
- Message notifications without page refresh
- Separate chat inbox notifications for group and private messages

### 🔔 Notifications System
- Bell icon in the top-right navbar
- Persistent notifications stored in the database
- Mark notifications as read
- Live system notifications using SignalR
- Notifications for:
  - received group invitations
  - accepted invitations
  - join requests
  - accepted join requests
  - chat/message activity

### 🟢 User & Group Activity Status
- Real-time online/offline user activity status
- Group activity status based on member presence
- Live presence updates without page refresh

### 👤 User Profiles
- View user profiles
- Navigate to profile pages
- Display user information and profile photo
- Access messaging options from user-related views

### 📊 Group Members
- Popup displaying group members
- Admin highlighted
- Actions:
  - View profile
  - Send message
- Admin can remove members

### 🚪 Membership Management
- Leave group functionality
- Confirmation dialogs for important actions

### 🏟️ Sports Arenas
- Browse available sports arenas
- Arena details page
- Arena filtering by city and sport
- Arena image gallery
- Responsive arena details view

### 📱 Navigation
- Top navbar with notifications and profile access
- Bottom navbar displaying the user’s groups
- Horizontally scrollable group navigation
- Fixed bottom navigation with smooth loading animation

---

## 🚧 Work in Progress (Upcoming Features)

The following features are planned and currently under development:

### 📅 Booking System
- Reserve sports terms
- Manage bookings per group/user

### 💳 Payment System
- Payment for reservations
- Integration with payment providers

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

---

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

---

## 📄 License

This project is developed for educational and portfolio purposes.
