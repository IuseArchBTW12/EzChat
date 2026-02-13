# EzChat - Video Chatroom Platform

A video chatroom platform where usernames are chatrooms. Built with Next.js 14, Convex, Clerk, and WebRTC.

## 🌟 Features

### Core Functionality
- **Username = Chatroom**: Each user's username becomes their own chatroom (e.g., `ezchat.cam/JOHN`)
- **Username Rules**: ALL CAPS letters only (A-Z), no numbers or special characters
- **Video Chat**: WebRTC-powered video with auto-sized grid layout
- **Text Chat**: Real-time messaging with role-based permissions
- **Role-Based System**: Four distinct roles with specific capabilities

### Roles & Permissions

#### Room Owner
- Can kick, close, and ban anyone
- Assign moderators by adding users to moderator list
- Assign regular status to users
- Full control over their chatroom

#### Moderator
- Can kick and ban regulars and guests
- Assign regular status to users
- Cannot affect other moderators or the owner

#### Regular
- Can send messages in text chat
- Can use camera and watch streams
- Basic participation rights

#### Guest
- Can only watch and use camera
- **Cannot send messages** in main text chat
- Limited interaction

#### Site Admin (Special)
- Visible in userlist but no role symbol
- Immune to all room owner/moderator actions
- Can issue site-wide bans with memo field
- Administrative oversight capabilities

#### Superuser (Hidden)
- Completely invisible in chatroom userlist
- Full administrative access
- Four accounts: AI Assistant, Site Owner, Future Bot, Future COO

### Video Features
- Maximum resolution: **360p** (capped for performance)
- **Free Tier**: 4×3 cam grid (12 cameras max)
- **Paid Tiers** (Pro/Extreme/Gold): 5×4 cam grid (20 cameras max)
- **No microphone** - camera only (forced camera selection)
- Auto-sized cams based on participant count
- Discord-like layout: userlist (left), cams (center), chat (right)

### User Tags
- Owner/Moderators: `m` tag
- Regulars: `r` tag
- Guests: No tag
- Site Admins: No tag (stealth)

### Userlist Ordering
1. Upgraded paid accounts (Gold/Extreme/Pro)
2. Room owners and moderators
3. Regulars
4. Guests and site admins

### Direct Messages
- Coded but **disabled** for free tier
- Premium feature for Pro/Extreme/Gold subscribers
- Within-chatroom messaging system

### Moderation Tools
- Manual ban list management (add/remove)
- Kick users from chatroom
- Permanent bans with optional reason
- Site-wide bans (admins only)

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Authentication**: Clerk
- **Backend/Database**: Convex
- **UI Components**: ShadCN UI
- **Styling**: TailwindCSS
- **Animations**: GSAP
- **Video**: WebRTC (simple-peer)
- **Billing**: polar.sh (integration ready)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Clerk account (for authentication)
- Convex account (for backend)

### Setup Steps

1. **Clone the repository**
   ```bash
   cd EzChat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Clerk**
   - Go to [clerk.com](https://clerk.com) and create a new application
   - Copy your API keys
   - Enable username-based authentication

4. **Set up Convex**
   ```bash
   npx convex dev
   ```
   - Follow the prompts to create/link your Convex project
   - This will generate your `CONVEX_DEPLOYMENT` values

5. **Configure environment variables**
   
   Create `.env.local` file:
   ```env
   CONVEX_DEPLOYMENT=dev:xxxxx
   NEXT_PUBLIC_CONVEX_URL=https://xxxxx.convex.cloud
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   CLERK_SECRET_KEY=sk_test_xxxxx
   ```

6. **Set up Clerk webhook for Convex sync**
   - In Clerk Dashboard, go to Webhooks
   - Add endpoint: `https://xxxxx.convex.site/clerk`
   - Subscribe to: `user.created`, `user.updated`, `user.deleted`

7. **Run development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   Navigate to `http://localhost:3000`

## 🚀 Development

### Run Convex and Next.js together
```bash
# Terminal 1
npm run convex:dev

# Terminal 2
npm run dev
```

### Build for production
```bash
npm run build
npm start
```

## 📁 Project Structure

```
EzChat/
├── app/
│   ├── [roomname]/         # Dynamic chatroom routes
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Homepage (directory)
│   └── globals.css         # Global styles
├── components/
│   ├── features/
│   │   ├── chatroom.tsx           # Main chatroom component
│   │   ├── chatroom-directory.tsx # Homepage directory
│   │   ├── user-list.tsx          # Participant list
│   │   ├── video-grid.tsx         # WebRTC video grid
│   │   └── chat-panel.tsx         # Text chat
│   └── ui/                 # ShadCN components
├── convex/
│   ├── schema.ts           # Database schema
│   ├── users.ts            # User functions
│   ├── chatrooms.ts        # Chatroom functions
│   ├── messages.ts         # Messaging functions
│   ├── moderation.ts       # Moderation functions
│   └── webrtc.ts           # WebRTC signaling
├── lib/
│   └── utils.ts            # Helper functions
└── providers/
    └── convex-client-provider.tsx
```

## 🔐 Database Schema

### Users
- `clerkId`: Unique Clerk identifier
- `username`: ALL CAPS chatroom name
- `tier`: free | pro | extreme | gold
- `role`: user | siteadmin | superuser
- `isSuperuser`: Hidden from userlist

### Chatrooms
- `name`: Username (chatroom identifier)
- `ownerId`: Reference to user
- `isActive`: Boolean status

### Room Participants
- `roomId`: Chatroom reference
- `userId`: User reference
- `role`: owner | moderator | regular | guest
- `isOnline`: Current status

### Bans
- `roomId`: Chatroom reference
- `userId`: Banned user
- `bannedById`: Admin who banned
- `isSitewideBan`: Global vs room-specific
- `reason`: Optional memo

## 🎨 Usage Guide

### For Users
1. **Sign in** with Clerk authentication
2. **Claim username** (ALL CAPS, letters only)
3. **Your chatroom is created** at `ezchat.cam/YOURNAME`
4. **Share your link** for others to join
5. **Grant camera access** to participate

### For Room Owners
- Assign moderators from userlist
- Promote guests to regulars (enables chat)
- Kick/ban disruptive users
- Manage ban list manually

### For Moderators
- Promote guests to regulars
- Kick regulars and guests
- Ban regulars and guests
- Cannot affect owner or other mods

## 🔮 Future Enhancements

- [ ] Integration with polar.sh for billing
- [ ] Direct messaging for paid tiers
- [ ] Additional GSAP animations
- [ ] Screen sharing capabilities
- [ ] Recording functionality
- [ ] Custom room themes
- [ ] Mobile app (React Native)

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL | Yes |
| `CONVEX_DEPLOYMENT` | Convex deployment ID | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |

## 🐛 Troubleshooting

### Camera not working
- Ensure HTTPS or localhost
- Check browser permissions
- Verify no other app is using camera

### Users not syncing
- Verify Clerk webhook is configured
- Check Convex logs for errors
- Ensure users have claimed usernames

### Messages not sending
- Verify user has regular+ role
- Check Convex function logs
- Ensure user is online in room

## 📄 License

MIT License - feel free to use for your own projects!

## 🤝 Contributing

Contributions welcome! Please follow these guidelines:
1. Fork the repository
2. Create feature branch
3. Follow existing code style
4. Test thoroughly
5. Submit pull request

## 💡 Credits

Built with ❤️ using modern web technologies:
- Next.js by Vercel
- Convex for backend
- Clerk for auth
- ShadCN UI for components
- simple-peer for WebRTC

---

**Note**: This is version 1.0. Future versions will include polar.sh billing integration and additional features.
