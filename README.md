# MailPilot_AI — Intelligent Email Assistant

> **Don't make users read every email. Make the inbox explain itself and help users act.**

MailPilot_AI is a full-stack, AI-native email client and executive assistant connected to Gmail using secure Google OAuth 2.0. Built with **Next.js (Pages Router)**, **Express**, **MongoDB** (with automatic zero-config in-memory fallback), and a **multi-tier AI provider pipeline** (OpenRouter → Google Gemini → Deterministic NLP Engine).

---

## 🌟 Key Features

- 🔐 **Secure Google OAuth 2.0 Integration**:
  - Connect Gmail accounts with minimal required scopes (`gmail.readonly`, `gmail.send`, `gmail.modify`).
  - **AES-256-GCM** encryption at rest for all stored OAuth access and refresh tokens.
  - Automatic token refresh lifecycle without exposing credentials to client code.
  - Built-in **Demo Sandbox Mode** for immediate offline evaluation even before linking Google OAuth.

- 🤖 **AI-Native Executive Intelligence**:
  - **Executive Summaries**: Instant short summaries, bulleted key highlights, and decisions.
  - **Action Items & Task Extraction**: Structured task checklists with assigned owners and priorities.
  - **Deadlines & Date Extraction**: Automated identification of meetings, payment dates, and due dates.
  - **"Explain This Email"**: Plain-language breakdown of sender intent, urgency, and required response.
  - **Tone-Adaptive Smart Replies**: Generate replies in **Professional**, **Friendly**, **Formal**, or **Concise** tones.
  - **AI Subject Line Generator**: Instant subject suggestions based on draft body content.
  - **Draft Rewriter**: One-click text enhancement (Make more professional, friendlier, or shorter).

- 📬 **Full-Featured Email Dashboard**:
  - Gmail-compatible search syntax (`is:unread`, `is:starred`, `from:`, `subject:`, `has:attachment`).
  - Complete multi-message thread viewing with collapsible message cards and attachment indicators.
  - Full email lifecycle mutations: Star/Unstar, Mark Read/Unread, Archive, Move to Trash.
  - Bulk actions toolbar for multi-email batch processing.
  - Full-featured email composer with CC/BCC, subject suggestions, and draft rewriting.

- ⚡ **Real-Time & Audit Trail**:
  - **Socket.IO** real-time event dispatching for background AI processing and notifications.
  - In-app notification drawer with unread tracking and instant updates.
  - Comprehensive **Activity Audit Log** tracking all email views, sends, AI actions, and OAuth events.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (Pages Router), React 18, Tailwind CSS, Zustand, Axios, Socket.IO Client, Lucide Icons |
| **Backend** | Node.js, Express, MongoDB / Mongoose, `mongodb-memory-server` (zero-config fallback), JWT, bcryptjs, Helmet, Morgan, Compression, Express-Validator, Express-Rate-Limit |
| **Email Integration** | Google APIs (`googleapis`), Google OAuth 2.0, RFC 2822 MIME parser |
| **AI Providers** | **OpenRouter API** (Primary) → **Google Gemini SDK** (Fallback) → **Deterministic NLP Engine** (100% Offline Safety Net) |
| **Security** | AES-256-GCM token encryption, JWT authorization, Helmet headers, CORS policy |

---

## 🚀 Quick Start (Run Locally in 2 Minutes)

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later

### 2. Clone & Install Dependencies
From the repository root directory:
```bash
# Install root, backend, and frontend dependencies in one command
npm install
```

### 3. Environment Setup

The backend comes pre-configured with local development defaults and automatically uses an embedded in-memory MongoDB instance (`mongodb-memory-server`) if no external database is specified.

Create or check your `server/.env` file:
```bash
cp server/.env.example server/.env
```

Create or check your `client/.env.local` file:
```bash
cp client/.env.example client/.env.local
```

### 4. Start the Application
Run both the Express backend and Next.js frontend concurrently with a single command:
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API Server**: [http://localhost:5001/api](http://localhost:5001/api)
- **Backend Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

## 🔑 Google Cloud Console OAuth 2.0 Setup (For Gmail Sync)

To connect real Gmail mailboxes, set up Google Cloud OAuth credentials:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `MailPilot-AI`).
3. Navigate to **APIs & Services** → **Library**, search for and enable:
   - **Gmail API**
   - **Google People API** / OAuth2 API
4. Navigate to **APIs & Services** → **OAuth consent screen**:
   - User Type: Select **External**.
   - App Name: `MailPilot AI`
   - User Support Email: Your email.
   - Developer Contact Email: Your email.
   - Click **Save and Continue**.
   - In **Scopes**, add:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.send`
     - `https://www.googleapis.com/auth/gmail.modify`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`
   - In **Test Users**, add your Gmail address (required while in testing mode).
5. Navigate to **APIs & Services** → **Credentials**:
   - Click **Create Credentials** → **OAuth client ID**.
   - Application Type: **Web application**.
   - Name: `MailPilot Web Client`.
   - **Authorized redirect URIs**:
     ```text
     http://localhost:5001/api/integrations/gmail/oauth/callback
     ```
   - Click **Create**.
6. Copy your **Client ID** and **Client Secret** into `server/.env`:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:5001/api/integrations/gmail/oauth/callback
   ```
7. Restart the backend server (`npm run dev`).

---

## 🧠 AI Provider Setup (Optional)

MailPilot features an automatic 3-tier cascade:
1. **OpenRouter**: Primary provider for Claude 3.5 Sonnet or GPT-4o.
2. **Google Gemini**: Secondary fallback using `@google/generative-ai`.
3. **Deterministic NLP Engine**: Runs automatically if no API keys are provided.

To enable OpenRouter or Gemini, add your keys to `server/.env`:

```env
# Option A: OpenRouter (e.g. Claude 3.5 Sonnet)
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet

# Option B: Google Gemini
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-1.5-flash
```

> [!NOTE]
> Even with no API keys configured, MailPilot will run smoothly using its built-in rule-based deterministic NLP engine!

---

## 🧪 Running Automated Tests & Verification

### Run Backend Unit & Integration Tests
```bash
npm run test:server
```
Validates:
- Database connectivity & in-memory fallback
- User registration, login, and JWT issuance
- AES-256-GCM token encryption and decryption
- AI provider fallback cascade (Summarize, Reply, Action items, Dates, Explain, Rewrite, Subject generator)
- Activity logging and notifications
- Gmail Sandbox and thread parsing

### Build Frontend for Production
```bash
npm run build
```

---

## 📁 Repository Structure

```text
GenAI Project/
├── client/                     # Next.js (Pages Router) Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIActionMenu/       # Quick AI action buttons
│   │   │   ├── AISummaryPanel/     # Summaries, action items, dates, and explanations
│   │   │   ├── AppShell/           # Layout shell with navigation
│   │   │   ├── BulkActionToolbar/  # Batch email mutation toolbar
│   │   │   ├── ConnectionStatus/   # Gmail connection pill & status
│   │   │   ├── EmailComposer/      # Full-page composer with AI enhancements
│   │   │   ├── EmailRow/           # Interactive email list item
│   │   │   ├── EmailToolbar/       # Inbox search, filter, and refresh controls
│   │   │   ├── EmptyState/         # Skeletons, empty states, and error cards
│   │   │   ├── InboxList/          # Main email list container
│   │   │   ├── MessageCard/        # Collapsible thread message card
│   │   │   ├── NotificationDrawer/ # Live slide-over notification center
│   │   │   ├── ProtectedRoute/     # Auth guard
│   │   │   ├── ReplyComposer/      # Contextual smart reply composer
│   │   │   ├── SearchBar/          # Gmail search syntax bar
│   │   │   ├── Sidebar/            # Mailbox navigation sidebar
│   │   │   ├── ToneSelector/       # Professional, Friendly, Formal, Concise selector
│   │   │   └── TopBar/             # Header with notifications and profile
│   │   ├── pages/
│   │   │   ├── _app.js             # Global providers & CSS
│   │   │   ├── _document.js        # HTML metadata & fonts
│   │   │   ├── index.js            # High-conversion Landing Page
│   │   │   ├── login.js            # Login page
│   │   │   ├── register.js         # Registration page
│   │   │   ├── dashboard.js        # Main inbox dashboard
│   │   │   ├── compose.js          # New message composer
│   │   │   ├── search.js           # Search results view
│   │   │   ├── activity.js         # Audit log & activity history
│   │   │   ├── integrations.js     # Gmail OAuth connection manager
│   │   │   ├── settings.js         # Account & AI diagnostics
│   │   │   └── emails/
│   │   │       └── [id].js         # Conversation thread view
│   │   ├── store/
│   │   │   ├── authStore.js        # Zustand auth state & JWT persistence
│   │   │   ├── emailStore.js       # Zustand email state & mutations
│   │   │   └── aiStore.js          # Zustand AI telemetry & suggestions
│   │   ├── services/
│   │   │   ├── api.js              # Axios instance with interceptors
│   │   │   └── socket.js           # Socket.IO client
│   │   └── styles/
│   │       └── globals.css         # Glassmorphism & custom styling
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.example
│
├── server/                     # Express & Node.js Backend
│   ├── src/
│   │   ├── ai/
│   │   │   ├── baseAIProvider.js   # Abstract AI interface
│   │   │   ├── openrouterProvider.js # OpenRouter API provider
│   │   │   ├── geminiProvider.js   # Google Generative AI SDK provider
│   │   │   └── fallbackProvider.js # Deterministic NLP fallback
│   │   ├── config/
│   │   │   ├── env.js              # Environment variables loader
│   │   │   ├── db.js               # Mongoose & MongoMemoryServer
│   │   │   └── socket.js           # Socket.IO room broadcaster
│   │   ├── controllers/
│   │   │   ├── activityController.js
│   │   │   ├── aiController.js
│   │   │   ├── authController.js
│   │   │   ├── emailController.js
│   │   │   ├── integrationController.js
│   │   │   └── notificationController.js
│   │   ├── integrations/
│   │   │   ├── baseIntegration.js
│   │   │   └── gmailIntegration.js # Google OAuth2 & Gmail API
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT verification & role authorization
│   │   │   ├── errorHandler.js     # Structured error handler
│   │   │   ├── rateLimiter.js      # Express rate limiters
│   │   │   └── validation.js       # Express-validator middleware
│   │   ├── models/
│   │   │   ├── AIRequest.js        # AI telemetry
│   │   │   ├── EmailActivity.js    # Activity audit trail
│   │   │   ├── GmailConnection.js  # Encrypted OAuth tokens
│   │   │   ├── Notification.js     # In-app notifications
│   │   │   └── User.js             # User accounts & bcrypt hashing
│   │   ├── queues/
│   │   │   └── aiQueue.js          # BullMQ / In-memory queue fallback
│   │   ├── routes/
│   │   │   ├── activityRoutes.js
│   │   │   ├── aiRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── emailRoutes.js
│   │   │   ├── integrationRoutes.js
│   │   │   └── notificationRoutes.js
│   │   ├── services/
│   │   │   ├── activityService.js
│   │   │   ├── aiService.js
│   │   │   ├── authService.js
│   │   │   ├── emailService.js
│   │   │   ├── gmailService.js
│   │   │   ├── notificationService.js
│   │   │   └── tokenService.js     # AES-256 encryption service
│   │   ├── tests/
│   │   │   └── runTests.js         # Automated backend test suite
│   │   └── index.js                # Server entry point
│   ├── package.json
│   └── .env.example
│
├── README.md                   # Complete local setup documentation
├── spec.md                     # Source of Truth specification
└── package.json                # Workspaces root package configuration
```

---

## 🎯 End-to-End User Journey

1. **Register / Login**: Open [http://localhost:3000](http://localhost:3000), register a new account or log in.
2. **Dashboard / Inbox**: View your inbox messages, star important emails, filter by `is:unread` or custom queries.
3. **Connect Gmail**: Navigate to `/integrations`, click **Connect Gmail**, complete Google's consent screen to link real mailboxes.
4. **Open Conversation Thread**: Click any email to view full conversation history and participants.
5. **AI Summarization**: Instantly review the executive summary, action items checklist, and important calendar dates.
6. **Smart Reply**: Choose your tone (**Professional**, **Friendly**, **Formal**, or **Concise**), click **AI Draft Reply**, review/edit, and click **Send Reply**.
7. **Compose New Email**: Click **New Message**, use **Suggest Subject** or rewrite tools, and send.
8. **Audit Trail & Notifications**: View real-time Socket.IO notifications in the top-right drawer and full audit history in `/activity`.

---

## 🛡️ Security Architecture

- **Zero Password Storage**: Gmail passwords are never requested or stored.
- **AES-256-GCM Encryption**: Stored Google OAuth tokens are encrypted at rest with an isolated server encryption key.
- **Data Minimization**: Private email contents are not logged in telemetry or AI request audit tables.
- **CORS & Rate Limiting**: Production-grade rate limiters on authentication and AI endpoints with strict CORS restrictions.
