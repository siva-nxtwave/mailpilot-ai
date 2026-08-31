# Complete Specification

## 1. Project Overview & Tech Stack

### Project Overview

Build a full-stack AI-powered email management application called **Intelligent Email Assistant (MailPilot_AI)** that connects to Gmail using secure OAuth. The platform must let users view, search, organize, and manage emails from a modern inbox dashboard while using AI to summarize emails, explain important content, extract action items, and generate context-aware replies.

The core workflow is:

**User → Connect Gmail → Google OAuth Consent → OAuth Tokens → Gmail API → Email Dashboard → Open Thread → AI Summary → Generate Reply → Review/Edit → Send**

The application must never request or store a user's Gmail password. Gmail access must use OAuth 2.0 and Gmail API permissions.

### Tech Stack

- **Frontend:** Next.js (Pages Router), React 19, Tailwind CSS, Zustand, Axios, lucide-react
- **Backend:** Node.js, Express, MongoDB, Mongoose, JSON Web Tokens, helmet, morgan, compression, express-validator, bcryptjs
- **AI Integration:** OpenRouter API as primary provider, Google Generative AI SDK/Gemini as fallback
- **Email Integration:** Gmail API with Google OAuth 2.0
- **Optional Background Jobs:** BullMQ on Redis via ioredis, with an in-memory fallback when Redis is unavailable
- **Real-Time:** Socket.IO
- **Security:** OAuth tokens encrypted at rest using an application-level encryption key

---

## 2. Authentication, OAuth & Security

### Application Authentication

The authentication system must support:

- User registration
- User login
- JWT-based session handling
- Protected API routes
- `GET /api/auth/me`
- Password hashing with bcrypt at cost factor 12
- Persistent client authentication state using Zustand
- Logout
- Authentication error handling
- Role separation between `admin` and `user`

### Gmail OAuth Flow

The Gmail connection must follow this flow:

**Connect Gmail → Google Login → Google Consent Screen → OAuth Authorization Code → Backend Callback → Exchange Code for Tokens → Encrypt Tokens → Store Tokens → Gmail API**

Required OAuth endpoints:

- `GET /api/integrations/gmail/oauth/start`
- `GET /api/integrations/gmail/oauth/callback`
- `POST /api/integrations/gmail/disconnect`
- `GET /api/integrations/gmail/status`

The backend must:

1. Generate the Google OAuth authorization URL.
2. Redirect the user to Google.
3. Receive the authorization code.
4. Exchange the code for access and refresh tokens.
5. Encrypt tokens before persistence.
6. Store token metadata and expiration time.
7. Use refresh tokens to obtain new access tokens when required.
8. Never expose access or refresh tokens to the frontend.
9. Never log decrypted tokens.
10. Surface `INTEGRATION_NOT_CONNECTED` or `AUTH_EXPIRED` instead of silently failing.

### Required Gmail OAuth Scopes

Use the minimum practical scopes required for the implemented features. The application must clearly communicate why Gmail permissions are required.

At minimum, the implementation must support the permissions required for:

- Reading mail
- Sending mail
- Modifying mail state such as read/unread, star, archive, and trash

The OAuth configuration must be kept in environment variables.

---

## 3. Gmail Integration

Create a dedicated Gmail integration behind a common integration interface.

### Gmail Capabilities

The integration must support:

- Fetch inbox messages
- Fetch individual messages
- Fetch complete threads
- Search emails
- Mark as read
- Mark as unread
- Star
- Unstar
- Archive
- Move to trash
- Send email
- Reply to an email
- Fetch labels
- Apply/remove labels
- Refresh expired OAuth credentials

### Integration Interface

The Gmail integration should expose methods conceptually equivalent to:

- `getAuthorizationUrl()`
- `handleOAuthCallback(code)`
- `getConnectionStatus()`
- `getMessages(options)`
- `getMessage(messageId)`
- `getThread(threadId)`
- `searchMessages(query, options)`
- `modifyMessage(messageId, changes)`
- `modifyThread(threadId, changes)`
- `sendMessage(message)`
- `replyToMessage(messageId, body)`
- `disconnect()`

All Gmail API communication must happen through the integration/service layer rather than directly from controllers or UI components.

---

## 4. Email Dashboard

The main dashboard must provide a modern email-client experience.

### Inbox Features

Users must be able to:

- View inbox messages
- See sender name/email
- See subject
- See preview/snippet
- See received date/time
- See unread state
- See starred state
- See attachments indicator
- Select multiple emails
- Perform bulk actions
- Refresh inbox
- Navigate between pages
- Search mail

### Dashboard Layout

Recommended layout:

**AppShell**

- Left sidebar
- Top navigation/search
- Main email list
- Right-side optional AI/context panel

Sidebar should include:

- Inbox
- Starred
- Sent
- Drafts
- Archive
- Trash
- Important
- Labels
- Gmail connection status
- Settings

---

## 5. Email Threads

Email conversations must be displayed as threads rather than unrelated individual messages whenever Gmail provides thread information.

### Thread View

Opening a thread must show:

- Subject
- Participants
- Message count
- Individual messages
- Sender
- Recipient
- Timestamp
- Message body
- Attachments
- Expanded/collapsed message state
- Reply action
- Reply-all action
- Forward action
- AI actions

The latest message should be easy to identify.

---

## 6. Email Search

The application must support Gmail-compatible search.

Users should be able to search using queries such as:

- `from:example@gmail.com`
- `to:example@gmail.com`
- `subject:invoice`
- `is:unread`
- `is:starred`
- `has:attachment`
- `after:2026/01/01`
- `before:2026/12/31`

The backend must pass validated search queries to Gmail rather than attempting to download the entire mailbox.

The UI should provide:

- Search input
- Search suggestions/help
- Search result count where available
- Search filters
- Clear search action

---

## 7. Basic Email Management

Users must be able to:

- Mark read
- Mark unread
- Star
- Unstar
- Archive
- Delete/trash
- Restore from trash where supported
- Apply labels
- Remove labels

### Bulk Operations

Users should be able to select multiple emails and:

- Mark all selected as read
- Mark all selected as unread
- Star selected
- Archive selected
- Delete selected
- Apply labels

Actions must provide loading states and clear success/error feedback.

---

## 8. AI Email Summarization

The application must provide an **AI Summarize** action when viewing an email or thread.

### Summarization Workflow

**Open Email → Extract Relevant Content → AI Provider → Structured Summary → Display Summary**

The AI service should generate:

- Short summary
- Key points
- Important decisions
- Requests/questions
- Important dates
- Action items

The summary should be concise and optimized for quick reading.

### AI Provider Priority

1. OpenRouter when `OPENROUTER_API_KEY` is configured
2. Gemini when `GEMINI_API_KEY` is configured
3. Deterministic fallback summary when neither provider is available

The deterministic fallback must still provide a useful basic summary based on available email text.

AI failures must never prevent users from reading or sending email.

---

## 9. AI-Generated Replies

The application must provide an **Generate Reply** feature.

### Workflow

**Open Email → Generate Reply → AI analyzes thread → Draft Reply → User Reviews → User Edits → Send**

The generated reply must consider:

- Previous messages in the thread
- Sender's latest request
- Conversation context
- Subject/context
- Desired tone

### Tone Options

Support:

- Professional
- Friendly
- Formal
- Concise

The generated response must always be editable before sending.

The application must clearly label AI-generated content as a draft/suggestion.

---

## 10. Email Composer

Users must be able to compose and send emails.

### Composer Fields

- To
- Cc
- Bcc
- Subject
- Body
- Reply context when replying
- Attachment UI where implemented
- Send
- Save draft
- Discard

### Sending Flow

**Compose → Validate → Backend → Gmail API → Send → Update Activity → Show Success**

The frontend must never directly call Gmail with private credentials.

---

## 11. AI Email Assistant Features

The AI panel should support:

### Explain This Email

Explain an email in simple language, including:

- What the sender wants
- Why it matters
- Required response
- Important details

### Extract Action Items

Extract structured tasks:

- Task
- Owner/person
- Due date
- Priority

### Extract Dates

Identify:

- Meetings
- Deadlines
- Appointments
- Payment dates
- Other important dates

### Rewrite Email

Allow users to rewrite selected draft text using:

- More professional
- Friendlier
- Shorter
- More formal
- Clearer

### Subject Generation

Generate concise subject-line suggestions from the email content.

---

## 12. Email History & Activity

The application must maintain an application-level activity history.

Track actions such as:

- Gmail connected
- Gmail disconnected
- Email viewed
- Email summarized
- Reply generated
- Reply edited
- Email sent
- Email archived
- Email deleted
- Email marked read/unread
- Email starred/unstarred
- AI operation completed/failed

Sensitive email contents and OAuth tokens must not be unnecessarily stored in activity logs.

---

## 13. Notifications

The platform must provide an in-app notification drawer.

Notification types include:

- Gmail connected
- Gmail connection expired
- Email sent successfully
- AI generation completed
- AI generation failed
- Gmail API failure
- Authentication expired

Notifications should include:

- Title
- Message
- Timestamp
- Read/unread state
- Related email/thread where applicable

---

## 14. Backend Architecture

### Architecture Rules

**Routes → Controllers → Services → Integrations / AI**

Controllers must remain thin.

Controllers must:

- Parse requests
- Validate input
- Call services
- Shape responses

Controllers must never:

- Directly access MongoDB
- Directly call Gmail API
- Directly call AI providers
- Perform token encryption logic

### Services

Services own:

- Authentication
- Gmail connection lifecycle
- Email fetching
- Search
- Email mutation
- Sending
- AI summarization
- Reply generation
- Activity history
- Notifications
- Token encryption/decryption
- OAuth refresh logic

### AI Layer

AI providers must be abstracted so the application can switch between:

- OpenRouter
- Gemini
- Deterministic fallback

---

## 15. Database Collections

### Users

Fields:

- `name`
- `email`
- `password` with `select: false`
- `role: admin | user`
- `lastLogin`
- timestamps

### GmailConnections

Fields:

- `owner`
- `provider: gmail`
- `googleAccountEmail`
- `isConnected`
- `scopes`
- `encryptedAccessToken`
- `encryptedRefreshToken`
- `expiresAt`
- `connectedAt`
- timestamps

### EmailActivities

Fields:

- `owner`
- `action`
- `messageId`
- `threadId`
- `metadata`
- `success`
- `error`
- timestamps

### Notifications

Fields:

- `owner`
- `type`
- `title`
- `message`
- `isRead`
- `messageId`
- `threadId`
- timestamps

### AIRequests

Fields:

- `owner`
- `type`
- `messageId`
- `threadId`
- `provider`
- `model`
- `inputMetadata`
- `success`
- `duration`
- `error`
- timestamps

Do not persist full private email bodies in AI request logs unless explicitly required.

---

## 16. API Endpoints

### Health

- `GET /api/health`

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Gmail Integration

- `GET /api/integrations/gmail/status`
- `GET /api/integrations/gmail/oauth/start`
- `GET /api/integrations/gmail/oauth/callback`
- `POST /api/integrations/gmail/disconnect`

### Emails

- `GET /api/emails`
- `GET /api/emails/:id`
- `GET /api/emails/:id/thread`
- `GET /api/emails/search`
- `POST /api/emails/:id/read`
- `POST /api/emails/:id/unread`
- `POST /api/emails/:id/star`
- `POST /api/emails/:id/unstar`
- `POST /api/emails/:id/archive`
- `POST /api/emails/:id/trash`
- `POST /api/emails/:id/labels`

### Bulk Email Operations

- `POST /api/emails/bulk/read`
- `POST /api/emails/bulk/unread`
- `POST /api/emails/bulk/star`
- `POST /api/emails/bulk/archive`
- `POST /api/emails/bulk/trash`

### Sending

- `POST /api/emails/send`
- `POST /api/emails/:id/reply`

### AI

- `POST /api/ai/summarize`
- `POST /api/ai/generate-reply`
- `POST /api/ai/explain`
- `POST /api/ai/action-items`
- `POST /api/ai/extract-dates`
- `POST /api/ai/rewrite`
- `POST /api/ai/generate-subject`

### Activity

- `GET /api/activity`
- `GET /api/activity/:id`

### Notifications

- `GET /api/notifications`
- `POST /api/notifications/:id/read`

---

## 17. Frontend Pages

The application uses the Next.js Pages Router.

### `/`

Landing page containing:

- Product introduction
- AI assistant showcase
- Gmail OAuth CTA
- Feature highlights
- Security messaging
- Responsive layout
- Dark theme support

### `/login`

Email/password login with:

- Validation
- Loading state
- Error handling
- JWT session persistence

### `/register`

Registration with:

- Name
- Email
- Password
- Confirm password
- Validation
- Error handling

### `/dashboard`

Main email dashboard containing:

- Inbox
- Search
- Email list
- Filters
- Bulk actions
- Gmail connection status
- Notifications
- AI assistant entry points

### `/emails/[id]`

Email/thread detail page containing:

- Thread messages
- AI summary
- AI actions
- Reply composer
- Email actions
- Metadata

### `/compose`

Email composition interface.

### `/search`

Dedicated search results interface.

### `/activity`

Email and AI activity history.

### `/integrations`

Gmail connection page containing:

- Connection status
- Google account
- Connect Gmail
- Reconnect
- Disconnect
- OAuth error states
- Permission information

### `/settings`

Settings page containing:

- Profile
- Account
- Security
- Gmail connection
- AI provider health
- Theme
- Logout

---

## 18. Frontend Components

Recommended structure:

- `AppShell`
- `Sidebar`
- `TopBar`
- `SearchBar`
- `InboxList`
- `EmailRow`
- `EmailToolbar`
- `BulkActionToolbar`
- `ThreadView`
- `MessageCard`
- `EmailComposer`
- `ReplyComposer`
- `AISummaryPanel`
- `AIActionMenu`
- `ToneSelector`
- `NotificationDrawer`
- `ConnectionStatus`
- `ProtectedRoute`
- `LoadingSkeleton`
- `EmptyState`
- `ErrorState`

---

## 19. Frontend State

Use Zustand for:

### Auth Store

- Current user
- Authentication state
- Login
- Logout
- Session restoration

### Email Store

- Current folder
- Emails
- Selected emails
- Search query
- Pagination
- Loading states
- Current thread

### AI Store

- Current AI operation
- Summary
- Generated reply
- Tone
- Action items
- Extracted dates
- AI errors

---

## 20. Folder Structure

### Frontend

```text
client/
└── src/
    ├── components/
    │   ├── AppShell/
    │   ├── Sidebar/
    │   ├── TopBar/
    │   ├── SearchBar/
    │   ├── InboxList/
    │   ├── EmailRow/
    │   ├── EmailToolbar/
    │   ├── BulkActionToolbar/
    │   ├── ThreadView/
    │   ├── MessageCard/
    │   ├── EmailComposer/
    │   ├── ReplyComposer/
    │   ├── AISummaryPanel/
    │   ├── AIActionMenu/
    │   ├── NotificationDrawer/
    │   ├── ConnectionStatus/
    │   └── ProtectedRoute/
    ├── pages/
    │   ├── _app.js
    │   ├── index.js
    │   ├── login.js
    │   ├── register.js
    │   ├── dashboard.js
    │   ├── compose.js
    │   ├── search.js
    │   ├── activity.js
    │   ├── integrations.js
    │   ├── settings.js
    │   └── emails/
    │       └── [id].js
    ├── store/
    │   ├── authStore.js
    │   ├── emailStore.js
    │   └── aiStore.js
    └── services/
        ├── api.js
        └── socket.js
```

### Backend

```text
server/
└── src/
    ├── config/
    │   ├── env.js
    │   ├── db.js
    │   └── socket.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── emailRoutes.js
    │   ├── aiRoutes.js
    │   ├── integrationRoutes.js
    │   ├── activityRoutes.js
    │   └── notificationRoutes.js
    ├── controllers/
    │   ├── authController.js
    │   ├── emailController.js
    │   ├── aiController.js
    │   └── integrationController.js
    ├── services/
    │   ├── authService.js
    │   ├── emailService.js
    │   ├── aiService.js
    │   ├── gmailService.js
    │   ├── tokenService.js
    │   ├── activityService.js
    │   └── notificationService.js
    ├── integrations/
    │   ├── baseIntegration.js
    │   └── gmailIntegration.js
    ├── ai/
    │   ├── openrouterProvider.js
    │   ├── geminiProvider.js
    │   └── fallbackProvider.js
    ├── models/
    │   ├── User.js
    │   ├── GmailConnection.js
    │   ├── EmailActivity.js
    │   ├── Notification.js
    │   └── AIRequest.js
    ├── middleware/
    │   ├── auth.js
    │   ├── validation.js
    │   └── errorHandler.js
    └── queues/
        └── aiQueue.js
```

---

## 21. Environment Variables

All secrets must be provided through environment variables.

Example:

```text
PORT=
CLIENT_URL=
MONGODB_URI=
JWT_SECRET=
CREDENTIAL_ENCRYPTION_KEY=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

OPENROUTER_API_KEY=
OPENROUTER_MODEL=

GEMINI_API_KEY=
GEMINI_MODEL=

REDIS_URL=
```

Never commit `.env` files or credentials to source control.

Provide `.env.example` containing variable names only.

---

## 22. Development Phases

### Phase 1: Project Setup

Build:

- Next.js frontend
- Express backend
- MongoDB connection
- In-memory development fallback
- JWT authentication
- Zustand auth store
- AppShell
- Protected routes
- Security middleware

### Phase 2: Gmail OAuth

Build:

- Google Cloud OAuth configuration
- Gmail OAuth start/callback
- Token encryption
- Gmail connection persistence
- Connection status
- Disconnect/reconnect
- Credential refresh

### Phase 3: Email Inbox

Build:

- Inbox retrieval
- Email list
- Thread view
- Pagination
- Search
- Read/unread
- Star
- Archive
- Trash
- Labels

### Phase 4: Compose & Send

Build:

- Compose UI
- Reply
- Reply-all
- Forward
- Validation
- Gmail sending
- Activity logging

### Phase 5: AI Assistant

Build:

- AI abstraction
- OpenRouter provider
- Gemini provider
- Deterministic fallback
- Email summarization
- Reply generation
- Tone selection
- Explain email
- Action item extraction
- Date extraction
- Rewrite
- Subject generation

### Phase 6: Activity & Notifications

Build:

- Activity history
- Notification drawer
- AI activity tracking
- Gmail connection notifications
- Error notifications

### Phase 7: Real-Time & Background Processing

Build:

- Socket.IO
- AI execution events
- Optional BullMQ/Redis
- Retry/backoff
- Background AI jobs

### Phase 8: Security, Testing & Deployment

Verify:

- OAuth security
- Token encryption
- JWT security
- Request validation
- Rate limiting
- CORS
- Helmet
- Error handling
- Responsive UI
- Production environment variables
- Deployment
- End-to-end Gmail workflow

---

## 23. UI & UX Requirements

The UI must feel like a modern combination of:

**Gmail + Linear + AI Copilot**

Requirements:

- Clean operator/productivity interface
- Responsive desktop/tablet/mobile layouts
- Light and dark themes
- Keyboard-friendly interactions
- Loading skeletons
- Optimistic UI where safe
- Toast notifications
- Empty states
- Error states
- Clear OAuth connection status
- Unread visual hierarchy
- Fast email navigation

The AI interface should feel integrated into the email workflow rather than appearing as a separate chatbot.

For example:

**Email → Summary → "What do I need to do?" → Action Items → "Draft Reply" → Edit → Send**

---

## 24. Security Requirements

The application must:

- Never request Gmail passwords
- Use OAuth 2.0 exclusively for Gmail
- Hash passwords with bcrypt cost 12
- Sign/verify JWTs with `JWT_SECRET`
- Encrypt Gmail access/refresh tokens at rest using `CREDENTIAL_ENCRYPTION_KEY`
- Never expose Gmail tokens to frontend code
- Never log decrypted tokens
- Use Helmet
- Restrict CORS to `CLIENT_URL`
- Rate-limit authentication endpoints
- Validate request bodies using express-validator
- Sanitize user-controlled input where appropriate
- Prevent unauthorized access to another user's email data
- Verify ownership of every email-related operation
- Keep secrets exclusively in environment variables
- Add `.env` to `.gitignore`
- Provide `.env.example`
- Return safe errors without leaking credentials or internal secrets

---

## 25. Error Handling

Use structured error codes.

Examples:

```text
AUTH_INVALID
AUTH_REQUIRED
GMAIL_NOT_CONNECTED
INTEGRATION_NOT_CONNECTED
AUTH_EXPIRED
GMAIL_API_ERROR
GMAIL_RATE_LIMIT
EMAIL_NOT_FOUND
INVALID_EMAIL
AI_PROVIDER_ERROR
AI_GENERATION_FAILED
VALIDATION_ERROR
INTERNAL_ERROR
```

The frontend must translate technical errors into useful user-facing messages.

Example:

```text
AUTH_EXPIRED
→ "Your Gmail connection has expired. Reconnect Gmail to continue."
```

The system must distinguish authentication failures, Gmail API failures, rate limits, validation failures, and AI failures.

---

## 26. Bonus Features

After all core features are stable, the following may be implemented:

- AI email classification
- Automatic priority detection
- Spam/phishing detection
- Important email detection
- Smart inbox prioritization
- AI subject generation
- Advanced tone selection
- Grammar correction
- Email rewriting
- Explain This Email
- Action-item extraction
- Deadline extraction
- Google Calendar integration
- AI semantic email search
- AI categorization
- Bulk email management
- Email templates
- Multiple Gmail accounts
- Outlook integration
- Voice-to-email
- Email analytics
- Daily AI inbox summary
- AI-powered "What needs my attention?" dashboard

---

## 27. Final Expected Outcome

The completed application must allow a user to:

1. Create an application account.
2. Securely connect Gmail through Google OAuth.
3. View their Gmail inbox.
4. Search and filter emails.
5. Open complete email threads.
6. Mark emails read/unread.
7. Star, archive, label, and delete emails.
8. Compose and send emails.
9. Reply to conversations.
10. Ask AI to summarize an email.
11. Ask AI what action is required.
12. Generate a context-aware reply.
13. Select a reply tone.
14. Edit the AI-generated reply.
15. Send the final reply through Gmail.
16. Review application activity.
17. Receive useful notifications.
18. Reconnect Gmail when credentials expire.

The final product should feel like an **AI-native email client**, not simply Gmail with a chatbot attached.

The key product differentiator is:

> **Don't make users read every email. Make the inbox explain itself and help users act.**

---

## 28. Codex & AI Agent Implementation Instructions

The AI coding agent must:

- Build the application phase by phase.
- Follow the folder structure strictly.
- Keep controllers thin.
- Keep business logic in services.
- Never call MongoDB directly from controllers.
- Never call Gmail directly from controllers.
- Never call Gmail directly from React components.
- Wrap Gmail behind `baseIntegration.js`.
- Keep OAuth credentials and secrets in `process.env`.
- Encrypt OAuth tokens before database persistence.
- Never expose access/refresh tokens to the frontend.
- Never log decrypted credentials.
- Verify user ownership on every email operation.
- Use the AI provider abstraction for all AI functionality.
- Prefer OpenRouter when configured.
- Fall back to Gemini when configured.
- Fall back to deterministic logic when neither is available.
- Ensure AI failure never prevents basic email functionality.
- Use the in-memory fallback when MongoDB is unavailable during local development.
- Use the in-memory queue fallback when Redis is unavailable.
- Validate every request.
- Apply authentication middleware to protected endpoints.
- Apply rate limiting to authentication and sensitive endpoints.
- Emit Socket.IO events for long-running AI/background operations.
- Persist meaningful activity events.
- Provide clear structured error codes.
- Never hard-code secrets.
- Create `.env.example`.
- Keep production configuration separate from development configuration.
- Test the complete OAuth → Gmail API → AI → Reply → Send workflow.
- At the end of every development phase, report:
  - Files created
  - Files modified
  - Features completed
  - Tests performed
  - Remaining issues

The coding agent must prioritize a **working end-to-end product over premature bonus features**.

The final application must be deployable and demonstrate a complete working journey:

**Register → Login → Connect Gmail → Inbox → Open Thread → Summarize → Generate Reply → Edit → Send → Activity/Notification**
