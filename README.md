# ANONYMOUSSITE — Anonymous Confession Social Network

ANONYMOUSSITE is a full-stack anonymous confession social web application built with **React**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **Firebase (Firestore & Authentication)**.

Designed with an **Apple-inspired Liquid Glass** aesthetic, it provides a safe, serene sanctuary where people anonymously share secrets, personal regrets, deep thoughts, work confessions, and wholesome moments.

---

## Key Features

### 1. Zero-Leak Anonymous Identity Architecture
- **Automatic Pseudonyms**: Users are automatically assigned unique, poetic anonymous personas (e.g., `Veiled Nomad #429`, `Silent Echo #812`, `Obsidian Voyager #273`) with custom generative gradient avatar badges.
- **Strict Privacy**: Real emails and Google account identities are **never** displayed publicly or associated with public confession documents.
- **Author Sovereignty**: Users retain private cryptographic ownership over their authored confessions, allowing them to edit or permanently delete their own posts while remaining completely pseudonymous to peers.

### 2. Multi-Mode Authentication
- **Google Sign-In Popup**: One-click authentication with Firebase Auth.
- **Email & Password**: Registration, login, and secure password reset workflows.
- **Guest Access**: Immediate browsing and controlled participation without entering credentials.
- **Persistent Sessions**: Seamless re-authentication and state hydration.

### 3. Apple-Inspired Liquid Glass UI
- Translucent frosted glass surfaces with subtle multi-layer backdrop blur (`backdrop-blur-md/lg`).
- Delicate borders (`border-white/10` to `border-white/30`) and soft ambient violet/ice-blue glows.
- Micro-interactions, animated confetti upon liking, and responsive layouts across desktop, tablet, and mobile.
- Desktop sticky sidebar with category shortcuts and mobile floating bottom navigation bar.
- Full Light, Dark, and System preference theme toggle.

### 4. Rich Social Interactions
- **Feeds**: Filter by Trending (engagement formula), Latest Whispers, Most Discussed, and Deep Secrets.
- **Categories**: 9 curated atmospheres (*Deep Secret, Love & Heartbreak, Late Night Thoughts, Unspoken Regrets, Work Life, Wild & Unbelievable, Seeking Guidance, Confession of Guilt, Wholesome*).
- **Threaded Nested Comments**: Multi-level replies with OP (Original Poster) badges and reply tags.
- **Bookmarks Vault**: Private bookmarking system for saving meaningful confessions.
- **My Confessions & Vault**: Private activity dashboard showing all authored confessions, aggregate community reactions, and saved drafts.
- **Drafts System**: Save work-in-progress confessions to a private drafts vault.
- **Share Studio**: Visual glass card preview generator, link copying, and system Web Share integration.
- **Real-Time Notifications**: Instant notification dropdown for likes, comments, and replies with 1-click read tracking.

### 5. Community Safety & Moderation
- **Sensitive Content Shield**: Automatic blur and warning reveal for confessions flagged with content warnings.
- **One-Click Blocking**: Instantly hide posts and comments from specific anonymous authors.
- **Structured Abuse Reporting**: Append-only reporting workflow for harassment, doxxing, spam, or violence.
- **Mental Health & Crisis Helplines**: Dedicated crisis resources for 988 Lifeline, Crisis Text Line, and international support.

---

## Data Schema & Collections

| Collection | Path | Description | Access Rules |
|------------|------|-------------|--------------|
| **Users** | `/users/{userId}` | Private profile & settings | Owner only (`auth.uid == userId`) |
| **Confessions** | `/confessions/{confessionId}` | Public confessions feed | Public read, author edit/delete, rate-limited |
| **Comments** | `/comments/{commentId}` | Threaded comments & replies | Public read, author edit/delete |
| **Post Likes** | `/post_likes/{confessionId_userId}` | Confession like records | Public read, owner create/delete |
| **Comment Likes** | `/comment_likes/{commentId_userId}` | Comment like records | Public read, owner create/delete |
| **Bookmarks** | `/bookmarks/{userId_confessionId}` | Saved confessions | Owner read & write only |
| **Notifications** | `/notifications/{notificationId}` | User activity alerts | Recipient read & update only |
| **Reports** | `/reports/{reportId}` | Safety violation reports | Append-only create by auth users, no public read |
| **Drafts** | `/drafts/{draftId}` | User private drafts | Owner read, create, update, delete |

---

## Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run TypeScript lint check
npm run lint

# Build production bundle
npm run build
```
