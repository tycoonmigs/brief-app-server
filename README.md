<div align="center">

# Brief 🩲 — Server

### The engine behind private, temporary chat

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-Web_Framework-000000?logo=express&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?logo=socket.io&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?logo=render&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

**[Live Demo](#-live-deployment)** · **[Features](#-features)** · **[Tech Stack](#-tech-stack)** · **[Getting Started](#%EF%B8%8F-running-this-locally-for-development)** · **[Deployment](#-deploying-to-production-step-by-step)**

</div>

---

This is the **backend** for Brief — a two-person, ephemeral private chat app. This server handles everything the frontend can't do on its own: creating and validating chat rooms, real-time messaging via Socket.io, storing (and automatically deleting) messages, and enforcing all of the app's privacy and security rules.

> Looking for the part people actually see and click on? See the **brief-privatemessagingapp** repo — that's the frontend built with React + Vite.

---

## 🔗 Live Deployment

|                       |                                           |
| --------------------- | ----------------------------------------- |
| **Live backend URL**  | _https://brief-app-server.onrender.com/_  |
| **Frontend repo**     | _https://github.com/tycoonmigs/brief-app_ |
| **Frontend live URL** | _https://brief-app-two.vercel.app/_       |

> ⚠️ **Heads up:** this server runs on Render's free tier, which "falls asleep" after 15 minutes of no activity. The first request after a period of inactivity can take 30–50 seconds to respond while the server wakes back up. This is expected free-tier behavior, not a malfunction.

---

## ✨ Features

### Room Lifecycle

- Secure, cryptographically random room codes (not `Math.random()` — uses Node's `crypto` module)
- A private "creator token," returned only once at room creation, letting the creator (and only the creator) end the room early
- Rooms automatically self-destruct after 1 hour via MongoDB's **TTL (time-to-live) index** — no manual cleanup jobs, no cron scripts
- Rooms left empty (both people disconnected) are deleted early — within a ~30 second grace period — instead of lingering for the full hour
- Strict 2-person occupancy cap per room, tracked in memory and enforced on every join attempt

### Real-Time Messaging (Socket.io)

- Text, image, and file messages, all delivered live
- Typing indicators
- Online/offline presence signals
- Message reactions — any emoji, synced instantly to both people
- Read receipts ("seen" status) — handled entirely in memory, never written to the database, since it's inherently transient information
- Manual room termination, broadcast instantly to both connected clients

### Security & Abuse Prevention

- **Rate limiting** on room creation (5 per 5 minutes per IP) and messages (15 per 10 seconds per socket)
- **Input sanitization** on all message text and filenames — strips any HTML/script content before it ever reaches the database
- **File validation** — checks actual MIME type (not just file extension) and enforces a 2MB size cap, with separate allowlists for images vs. general files
- **CORS configuration** — only the configured frontend URL is allowed to communicate with this server
- No hardcoded secrets — all sensitive config lives in environment variables, never in the codebase

---

## 🧱 Tech Stack

| Layer                   | Technology                           | Why                                                                                                                                                 |
| ----------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime                 | **Node.js**                          | JavaScript on the server, same language as the frontend                                                                                             |
| Web Framework           | **Express**                          | Minimal, well-documented framework for the handful of REST endpoints this app needs                                                                 |
| Real-time Communication | **Socket.io**                        | Handles WebSocket connections (with automatic fallback), rooms, and broadcast events                                                                |
| Database                | **MongoDB Atlas** (via **Mongoose**) | Document structure fits chat data well; native **TTL indexes** provide automatic, zero-maintenance data expiry — a perfect fit for an ephemeral app |
| Rate Limiting           | **express-rate-limit**               | Battle-tested middleware for basic abuse prevention                                                                                                 |
| Sanitization            | **sanitize-html**                    | Strips potentially malicious HTML/script content from user text                                                                                     |
| Environment Config      | **dotenv**                           | Loads local environment variables from `.env` during development                                                                                    |
| Hosting                 | **Render**                           | Supports long-running Node processes (required for Socket.io — unlike serverless platforms), reasonable free tier                                   |

---

## 🗂️ Project Structure — What Each Part Does

This section explains **what each folder and file is for**, not what the code inside it does line-by-line (the code itself has comments explaining that). Think of this as a map of the building, not a tour of every room.

```
brief-server/
├── src/
│   ├── config/
│   │   ├── db.js                  → connects the server to the MongoDB database on startup
│   │   └── corsOptions.js         → controls which frontend web address is allowed to talk to this server
│   │
│   ├── models/                    → defines the "shape" of the data stored in the database
│   │   ├── Room.js                  a chat room: its code, private creator token, and expiry time
│   │   │                            (this is also where the TTL auto-delete rule is defined)
│   │   └── Message.js               a single message: its content, sender alias, type, reactions,
│   │                                 and its own matching expiry time
│   │
│   ├── routes/                    → the few plain web-request (REST) endpoints this app uses
│   │   └── roomRoutes.js            create a new room (POST) / check if a room code is valid (GET)
│   │
│   ├── sockets/                   → all the real-time (Socket.io) logic lives here
│   │   ├── index.js                 sets up the real-time server and connects all the handlers below
│   │   ├── roomOccupancy.js         tracks who's currently active in each room (in memory, not the
│   │   │                            database) — enforces the 2-person cap and auto-deletes empty rooms
│   │   └── handlers/                each file below handles ONE specific real-time event
│   │       ├── joinRoom.js            what happens when someone tries to join a room
│   │       ├── sendMessage.js         what happens when someone sends a message, image, or file
│   │       ├── typing.js              the "typing..." / "stopped typing" signals
│   │       ├── reactToMessage.js      adding/changing/removing an emoji reaction on a message
│   │       ├── markSeen.js            broadcasting "I've seen up to this message" (read receipts)
│   │       ├── terminateRoom.js       lets the room's creator end the chat immediately, for both people
│   │       └── disconnect.js          cleanup logic for when someone closes their tab/loses connection
│   │
│   ├── middleware/                → reusable checks/rules applied to incoming requests or messages
│   │   ├── rateLimiter.js           limits how often someone can create rooms or send messages
│   │   ├── sanitizeInput.js         strips out any potentially malicious code from text before saving it
│   │   └── fileValidation.js        checks that uploaded images/files are an allowed type and size
│   │
│   ├── utils/                     → small standalone helper functions
│   │   ├── generateRoomCode.js      generates secure random codes (used for both room codes AND
│   │   │                            the private creator token)
│   │   └── generateAlias.js         generates a random "AdjectiveNoun##" display name per user
│   │
│   └── app.js                     → sets up the Express web server itself (middleware, routes, CORS)
│
├── server.js                      → the actual entry point — starts the database connection, the
│                                     web server, and the real-time layer, all together
├── .env                           → local secret/config values (NEVER committed to GitHub — see below)
├── .gitignore                     → tells Git which files to never track (node_modules, .env, etc.)
└── package.json                   → lists the project's dependencies and scripts
```

---

## 🖥️ Running This Locally (For Development)

You don't need to be an experienced coder to follow these steps — just go one at a time.

### 1. Install the tools you need

- **Node.js** — download and install from [nodejs.org](https://nodejs.org) (choose the "LTS" version)
- A free **MongoDB Atlas** account (a cloud database) — see the setup steps below if you don't have one yet

### 2. Download this project

If you already have the folder, skip this. Otherwise:

```bash
git clone <your-repo-url>
cd brief-server
```

### 3. Install the project's dependencies

```bash
npm install
```

### 4. Set up a MongoDB Atlas database (if you don't have one)

1. Go to [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register) and create a free account
2. Click **Build a Database** → choose the **M0 Free** tier → pick any region close to you → Create
3. Under **Database Access**, add a new database user with a username and password (avoid special characters in the password to keep things simple)
4. Under **Network Access**, click **Add IP Address → Allow Access from Anywhere** (fine for a small personal project like this)
5. Go to **Database → Connect → Drivers**, choose Node.js, and copy the connection string it gives you — it'll look like:
   ```
   mongodb+srv://username:password@cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 5. Create your local `.env` file

In the project's root folder (same level as `package.json`), create a file named exactly `.env`:

```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/brief?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
```

- `PORT` — which port the server runs on locally
- `MONGO_URI` — your MongoDB Atlas connection string (with your real username/password filled in, and `/brief` added before the `?` to name the database)
- `CLIENT_URL` — the address of your frontend (assumes you're also running `brief-privatemessagingapp` locally — see that project's README)

### 6. Start the server

```bash
npm run dev
```

You should see something like:

```
MongoDB connected: ...
Server running on port 5000
```

---

## 🚀 Deploying to Production (Step by Step)

This backend is designed to be deployed on **Render**, since it needs to run continuously (Socket.io requires a persistent server, not the short-lived "serverless functions" some other platforms use).

### 1. Push this project to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/your-repo-name.git
git branch -M main
git push -u origin main
```

> Before running `git add .`, always run `git status` first and check that `.env` is **not** listed. If it is, stop — do not commit — and double check your `.gitignore` file includes a line that just says `.env`. Your database password lives in that file; if it's ever pushed to a public GitHub repo, treat that password as compromised and change it immediately in MongoDB Atlas.

### 2. Create a Render account & new Web Service

1. Go to [render.com](https://render.com) and sign up (GitHub sign-in is easiest)
2. Click **New + → Web Service**
3. Connect and select this repo

### 3. Configure the service

- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** Free

### 4. Add environment variables

In Render's Environment Variables section, add:

| Key          | Value                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| `PORT`       | `10000` (Render's convention — the app respects whatever Render actually assigns)                        |
| `MONGO_URI`  | your real MongoDB Atlas connection string                                                                |
| `CLIENT_URL` | your live frontend URL (e.g. `https://your-app.vercel.app`) — update this once your frontend is deployed |

### 5. Deploy

Click **Create Web Service**. Watch the logs for the same `MongoDB connected...` and `Server running on port...` messages you saw locally.

### 6. Connect it to your deployed frontend

Once your frontend is live (see `brief-privatemessagingapp`'s README), come back here and make sure `CLIENT_URL` exactly matches its real address — no trailing slash, correct `https://`. This step is what allows the two halves to actually communicate (a security feature called CORS) — mismatches here are the most common deployment issue.

---

## 🔐 Security Notes

- The `.env` file is git-ignored and should never be committed — see below. It contains your live database credentials.
- Room codes and creator tokens use `crypto.randomBytes` (cryptographically secure), never `Math.random()`
- The creator token is only ever included in the response to the room-creation request — it's deliberately excluded from the room-lookup (join) response, so someone joining via code can never see or steal it
- All file/image uploads are validated server-side against an actual MIME-type allowlist (from the base64 data itself, not a trusted file extension) plus a hard size cap
- Read receipts are intentionally never persisted to the database — they're broadcast-only, in-memory signals, consistent with the app's "nothing sticks around" design
- IP-based rate limiting is used for abuse prevention, **not** for identity/device detection — the app deliberately does not attempt device fingerprinting, as that would work against its own privacy goals and produce unreliable results (shared IPs, VPNs, mobile carrier NAT, etc.)

---

## ⚙️ Key Settings You Might Want to Change

| What                     | Where                                                      | Current Value              |
| ------------------------ | ---------------------------------------------------------- | -------------------------- |
| Room lifespan            | `src/routes/roomRoutes.js` → `ROOM_DURATION_MS`            | 1 hour                     |
| Max people per room      | `src/sockets/roomOccupancy.js` → `MAX_OCCUPANTS`           | 2                          |
| Empty-room cleanup delay | `src/sockets/roomOccupancy.js` → `EMPTY_ROOM_GRACE_MS`     | 30 seconds                 |
| Max file/image size      | `src/middleware/fileValidation.js` → `MAX_FILE_SIZE_BYTES` | 2MB                        |
| Message rate limit       | `src/middleware/rateLimiter.js` → `isMessageRateLimited`   | 15 messages / 10 seconds   |
| Room creation rate limit | `src/middleware/rateLimiter.js` → `createRoomLimiter`      | 5 rooms / 5 minutes per IP |

---

## 🗺️ Roadmap / Possible Future Additions

- [ ] Video upload support (likely via Cloudinary, given free-tier payload/bandwidth limits)
- [ ] Persisted creator-token recovery (currently lost on page refresh — see Known Limitations)
- [ ] End-to-end encryption
- [ ] Generic file type expansion beyond the current allowlist

---

## ⚠️ Known Limitations

- **Creator status doesn't survive a page refresh.** The creator token currently only lives in the frontend's in-memory state, not `sessionStorage` or similar — refreshing the page means losing the ability to terminate the room early (the room itself is unaffected and still expires normally via its TTL).
- **Free-tier cold starts.** As mentioned above, Render's free tier sleeps after inactivity, causing a delay on the first request.
- **Ungraceful disconnects have a short delay.** If a device loses power or network abruptly (rather than closing the tab normally), Socket.io can take up to a minute to detect the drop — during that window, a room might briefly appear "full" even though one person has effectively left.

---

## 🔐 A Note on the `.env` File

The `.env` file holds your actual database password and other sensitive configuration — it should **never** be uploaded to GitHub under any circumstances. This project's `.gitignore` file is already set up to block it automatically, but always double-check with `git status` before committing, just in case.

---

## 🙋 Frequently Asked (Non-Coder) Questions

**Q: The server won't connect to MongoDB.**
A: Double-check your `MONGO_URI` in `.env` — especially that your password doesn't contain special characters that need URL-encoding (Atlas will warn you about this when you create the password).

**Q: My frontend gets a "CORS" error.**
A: This means `CLIENT_URL` here doesn't exactly match your frontend's real address. Check for typos, a missing/extra trailing slash, or `http` vs `https`.

**Q: Can I let more than 2 people join a room?**
A: You can change `MAX_OCCUPANTS` in `src/sockets/roomOccupancy.js`, but note the whole app (UI, copy, "2-person room" messaging) is currently designed around exactly 2 people — increasing this would need frontend changes too.

**Q: Why doesn't "seen" status show up in the database?**
A: It's intentional — read receipts are broadcast directly between connected clients and never written to MongoDB, since that information is only meaningful while both people are actively connected.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Credits

Built by **tycoonmigs**

- Portfolio: [tycooncv.vercel.app](https://tycooncv.vercel.app/)
- GitHub: [github.com/tycoonmigs](https://github.com/tycoonmigs)

If you found this useful or fun to poke around, feel free to [buy me a coffee ☕](https://buymeacoffee.com/tycoonmigs).
