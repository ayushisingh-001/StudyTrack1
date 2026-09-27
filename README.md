# StudyTrack – Student Task Management System
**A beginner-friendly, clean MERN Stack application with Clerk Authentication and Role-Based Access Control (RBAC).**

Designed specifically for **interviews, code walkthroughs, and portfolio presentations**. The codebase is intentionally clean, minimal, and thoroughly commented to make explaining architecture, data flow, and security straightforward.

---

## 🌟 Tech Stack & Key Choices

| Tier | Technology | Purpose & Why Chosen |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) | Fast developer experience, functional components, hooks (`useState`, `useEffect`, `useCallback`), no Redux overhead. |
| **Backend** | Node.js + Express | Lightweight REST API, organized with Express Router, straightforward async/await error handling. |
| **Database** | MongoDB + Mongoose | Document database with 2 schemas (`User`, `Task`) enforcing data integrity and role definitions. |
| **Authentication** | Clerk (React & Express SDKs) | Industry-standard secure auth (Sign Up, Sign In, session tokens, UserButton) without custom password hashing risks. |
| **Styling** | Modern Vanilla CSS | Responsive, zero-dependency, CSS custom variables, beautiful cards and badges without heavy Tailwind or Bootstrap bloat. |

---

## 📁 Project Structure

```text
StudyTrack/
├── package.json              # Root scripts (run client + server concurrently)
├── README.md                 # Complete setup guide & interview talking points
├── .gitignore
├── server/                   # Node.js + Express Backend
│   ├── .env                  # Backend environment secrets
│   ├── .env.example          # Sample environment variables
│   ├── package.json
│   ├── server.js             # Express app, MongoDB connection & Clerk middleware
│   ├── models/
│   │   ├── User.js           # Schema for user role & Clerk link
│   │   └── Task.js           # Schema for tasks (title, status, due date, assignee)
│   └── routes/
│       ├── taskRoutes.js     # CRUD endpoints with search, filter, and RBAC
│       └── userRoutes.js     # Sync Clerk users, list students, and role switcher
└── client/                   # React Frontend
    ├── .env                  # Client environment variables (Vite)
    ├── .env.example          # Sample client environment variables
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.js            # Compatibility export
        ├── App.jsx           # Main App, state management, and auth gating
        ├── main.jsx          # React DOM entry point & ClerkProvider
        ├── index.css         # Clean Vanilla CSS styling system
        ├── api.js            # Centralized API fetch helper with Clerk JWT token
        ├── components/
        │   ├── Navbar.jsx    # Branding, user email/name, role badge, demo switcher
        │   ├── ProgressBar.jsx # Progress bar (% and completed/total breakdown)
        │   ├── TaskForm.jsx  # Create/Edit modal with student assignment dropdown
        │   └── TaskList.jsx  # Task cards, status badges, and action buttons
        └── pages/
            ├── Dashboard.jsx # Student view (personal tasks & progress)
            ├── AdminPanel.jsx# Admin view (all students overview & full controls)
            └── Login.jsx     # Landing page with Clerk Sign In / Sign Up triggers
```

---

## 🔑 1. How to Set Up MongoDB Connection

You can connect to either a **Local MongoDB** instance or a free cloud **MongoDB Atlas** database.

### Option A: Local MongoDB
1. Ensure MongoDB Community Server is installed and running locally:
   ```bash
   mongod
   ```
2. Your connection string in `server/.env` is:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/studytrack
   ```

### Option B: Cloud MongoDB Atlas (Free Tier)
1. Sign in to [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a free cluster (e.g. `M0 Sandbox`).
3. Under **Database Access**, create a database user (e.g., `studytrack_user` with a secure password).
4. Under **Network Access**, add IP `0.0.0.0/0` (Allow access from anywhere).
5. Click **Connect** &rarr; **Drivers** (Node.js) &rarr; Copy the connection URI:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/studytrack?retryWrites=true&w=majority
   ```
6. Paste this URI into `server/.env`.

---

## 🔐 2. How to Set Up Clerk Authentication

Clerk provides modern, secure authentication. Setup takes under 2 minutes:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/) and create a free account.
2. Click **Create application**, enter name `StudyTrack`, and choose Email/Password or Google login.
3. In the left sidebar of your Clerk Dashboard, navigate to **API Keys**.
4. You will see two keys:
   - **Publishable Key**: starts with `pk_test_...`
   - **Secret Key**: starts with `sk_test_...`
5. Place them into their respective `.env` files:

### In `client/.env`:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
VITE_API_URL=http://localhost:5000/api
```

### In `server/.env`:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/studytrack
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
```

---

## ⚙️ 3. Sample `.env` File Structure

### Client: `client/.env`
```env
# Clerk Publishable Key (exposed to browser via Vite)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_replace_with_your_publishable_key

# Backend API Base URL
VITE_API_URL=http://localhost:5000/api
```

### Server: `server/.env`
```env
# Express Server Port
PORT=5000

# Client Application URL (for CORS allowance)
CLIENT_URL=http://localhost:5173

# MongoDB Connection
MONGODB_URI=mongodb://127.0.0.1:27017/studytrack

# Clerk Backend Secret Key (KEEP THIS PRIVATE)
CLERK_SECRET_KEY=sk_test_replace_with_your_clerk_secret_key

# Clerk Frontend Publishable Key
CLERK_PUBLISHABLE_KEY=pk_test_replace_with_your_clerk_publishable_key
```

---

## 🚀 4. How to Run Client and Server Together

### Step 1: Install All Dependencies
From the root `StudyTrack` folder, run:
```bash
npm run install:all
```
*(Or install in each folder individually: `npm install`, `cd server && npm install`, `cd ../client && npm install`)*

### Step 2: Run Both Simultaneously
Run the root start command:
```bash
npm run dev
```
This uses `concurrently` to start:
- Express backend at: `http://localhost:5000`
- React frontend (Vite) at: `http://localhost:5173`

*(Alternatively, you can open two separate terminals)*:
- **Terminal 1 (Backend)**: `cd server && npm run dev`
- **Terminal 2 (Frontend)**: `cd client && npm run dev`

---

## 🎯 Feature Walkthrough & Interview Talking Points

### 1. Clerk Authentication Flow
- **Interview Question:** *"How does authentication flow between your React frontend and Express backend?"*
- **Answer:**
  1. The user signs in via Clerk's modal on the React frontend.
  2. In React, we use Clerk's `useAuth()` hook to get the session JWT using `await getToken()`.
  3. Every API request attaches this token in the HTTP `Authorization` header as `Bearer <token>`.
  4. On the Express backend, `@clerk/express` middleware intercepts incoming requests and verifies the token against Clerk's keys.
  5. The verified user ID is extracted via `getAuth(req).userId`.

### 2. Role-Based Access Control (RBAC)
- **Interview Question:** *"How do you separate Admin and Student permissions?"*
- **Answer:**
  - In MongoDB, the `User` schema stores the application role (`'admin'` or `'user'`).
  - When a user signs in, `/api/users/sync` syncs their Clerk profile to MongoDB.
  - The very first user created in the database is automatically granted `'admin'` role for easy setup.
  - In `taskRoutes.js`:
    - **Admins** can retrieve all tasks, assign tasks to any student, edit any task field, and delete tasks.
    - **Students** can only query tasks where `assignedTo === req.auth.userId`, and can only modify the `status` (`Pending`, `In Progress`, `Completed`) of their own assignments.

### 3. Dynamic Progress Tracker
- The backend computes task metrics (`completed`, `inProgress`, `pending`, `total`, `completionRate = (completed/total) * 100`).
- The `ProgressBar.jsx` component displays a visual animated bar and stats cards.

### 4. Interactive Demo Mode
- In the navigation bar, there is a **"Switch to Admin / Student"** button.
- In interviews, this allows you to quickly demonstrate both the Student Dashboard and the Administrator Panel in real time with a single click.

---

## 🧪 API Endpoints Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users/sync` | Authenticated | Syncs Clerk user into MongoDB; assigns first user as admin |
| `GET` | `/api/users/me` | Authenticated | Gets current user's profile and role |
| `GET` | `/api/users` | Authenticated | Returns all registered students for assignment dropdown |
| `PATCH`| `/api/users/role` | Authenticated | Toggles user role (`admin` &harr; `user`) for live demo |
| `GET` | `/api/tasks` | Authenticated | Lists tasks with `?search=` and `?status=` filters (RBAC enforced) |
| `POST` | `/api/tasks` | Authenticated | Creates a new task (Admin can assign to any student; Student assigns to self) |
| `PUT` | `/api/tasks/:id` | Authenticated | Updates task (Admin has full edit; Student updates status only) |
| `DELETE`| `/api/tasks/:id` | Admin Only | Deletes a task |

---

## 🌐 Production Deployment Guide (100% Free)

Deploying StudyTrack involves 3 free services:
1. **Database:** [MongoDB Atlas](https://www.mongodb.com/atlas) (Free M0 cluster)
2. **Backend API:** [Render](https://render.com) (Free Node.js Web Service)
3. **Frontend React App:** [Vercel](https://vercel.com) (Free React Vite Hosting)

### Step 1: Push Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit - StudyTrack"
git branch -M main
git remote add origin https://github.com/your-username/StudyTrack.git
git push -u origin main
```

### Step 2: Deploy Backend on Render
1. Go to [dashboard.render.com](https://dashboard.render.com/) and click **New +** &rarr; **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add **Environment Variables** in Render:
   - `PORT` = `5000`
   - `MONGODB_URI` = `your_mongodb_atlas_connection_string`
   - `CLERK_SECRET_KEY` = `sk_test_...`
   - `CLERK_PUBLISHABLE_KEY` = `pk_test_...`
   - `CLIENT_URL` = `*` (or your Vercel frontend URL once deployed)
5. Click **Deploy Web Service**.
6. Copy your live backend URL (e.g. `https://studytrack-api.onrender.com`).

### Step 3: Deploy Frontend on Vercel
1. Go to [vercel.com](https://vercel.com/) and click **Add New...** &rarr; **Project**.
2. Import your GitHub repository.
3. In project settings:
   - **Root Directory:** click Edit and choose `client`.
   - **Framework Preset:** Vite.
4. Add **Environment Variables** in Vercel:
   - `VITE_CLERK_PUBLISHABLE_KEY` = `pk_test_...`
   - `VITE_API_URL` = `https://studytrack-api.onrender.com/api` *(Your Render backend URL + `/api`)*
5. Click **Deploy**.
6. Vercel will provide your live URL (e.g. `https://studytrack.vercel.app`).

### Step 4: Whitelist Frontend Domain in Clerk Dashboard
1. Go to [dashboard.clerk.com](https://dashboard.clerk.com/) &rarr; Your App.
2. Under **Configure** &rarr; **Domains / Paths**, make sure your Vercel URL is added or allow development testing on custom domains.

#   S t u d y T r a c k  
 