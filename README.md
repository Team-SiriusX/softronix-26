# Softronix 4.0 — Intelligent E-Commerce with AI Clerk "Echo"

![Softronix Banner](public/softronix-banner.png)

> **Winner of the Softronix 4.0 Hackathon (Target/Goal)**
> An AI-first e-commerce experience featuring a 3D interactive avatar, haggle-capable AI agent, and real-time human-in-the-loop messaging.

---

## Overview

**Softronix-26** is not just another e-commerce store. It redefines the shopping experience by integrating a **hyper-intelligent AI Clerk named "Echo"**.

Instead of boring search bars, users talk to **Echo** — a 3D avatar that can:
- **See** the inventory (via RAG vector search).
- **Control** the website (filter prices, sort products, highlight items).
- **Negotiate** prices (Haggle Mode with sentiment analysis).
- **Speak** to you (Text-to-Speech with lip-sync).
- **Connect** you to a human (Real-time WebSockets integration).

---

## Key Features

### AI Clerk "Echo"
- **RAG-Powered Intelligence**: Uses **Upstash Vector** to "read" your product catalog and answer semantic questions like *"Show me something for dry skin under $50"*.
- **Agentic UI Control**: The AI doesn't just chat; it calls **tools** to update the UI real-time (sorting, filtering, navigating).
- **Personality Engine**: Echo is warm, witty, and helpful (not a robotic support bot).

### Haggle Mode & Dynamic Pricing
- **Negotiation Logic**: Users can ask for discounts. Echo evaluates their **sentiment** and **reason** (student, birthday, first-time).
- **Coupon Generation**: If the deal is struck, the AI generates a valid, one-time-use coupon code in the database and applies it to the cart automatically.
- **Rude User Penalty**: If a user is abusive, Echo can *raise* the price by 5%.

### 3D Interactive Avatar
- **Three.js & R3F**: A fully rendered 3D avatar that floats in the interface.
- **Lip-Sync**: Real-time phoneme mapping synchronizes the avatar's lips with the TTS audio.

### Real-Time "Talk to Human"
- **Pusher Integration**: Seamlessly switch from AI to a human support agent.
- **Admin Dashboard**: A dedicated panel for admins to view active conversations and reply instantly.

### Modern E-Commerce Stack
- **Serverless Backend**: Powered by **Hono** running on Next.js API routes.
- **PostgreSQL**: Robust relational data on **Neon**.
- **Authentication**: **BetterAuth** for secure Google/GitHub/Email sign-ins.

---

## Tech Stack

### Frontend
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, SCSS
- **Animations**: GSAP, Locomotive Scroll
- **3D**: React Three Fiber, Drei

### Backend & API
- **API Framework**: [Hono](https://hono.dev/) (mounted on Next.js API routes)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma IO
- **Vector DB**: Upstash Vector (for RAG)
- **Real-Time**: Pusher Channels

### AI & Intelligence
- **LLM Orchestration**: OpenRouter (Claude 3.5 Sonnet / DeepSeek V3)
- **Speech-to-Text**: Groq (Whisper)
- **Tool Calling**: Custom agentic loop capable of multi-step execution

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm (recommended)
- PostgreSQL database
- Upstash Vector database
- OpenRouter API Key
- Pusher Account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/softronix-26.git
   cd softronix-26
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root:
   ```env
   # Database
   DATABASE_URL="postgresql://..."

   # Auth (Better Auth)
   BETTER_AUTH_SECRET="your_secret"
   BETTER_AUTH_URL="http://localhost:3000"
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   GITHUB_CLIENT_ID="..."
   GITHUB_CLIENT_SECRET="..."

   # AI Services
   OPENROUTER_API_KEY="sk-or-..."
   UPSTASH_VECTOR_REST_URL="..."
   UPSTASH_VECTOR_REST_TOKEN="..."
   GROQ_API_KEY="gsk_..."

   # Real-Time (Pusher)
   PUSHER_APP_ID="..."
   PUSHER_KEY="..."
   PUSHER_SECRET="..."
   PUSHER_CLUSTER="..."
   NEXT_PUBLIC_PUSHER_KEY="..."
   NEXT_PUBLIC_PUSHER_CLUSTER="..."

   # Email (Resend)
   RESEND_API_KEY="..."
   RESEND_EMAIL="noreply@yourdomain.com"
   ```

4. **Initialize Database**
   ```bash
   npx prisma db push
   ```

5. **Run Development Server**
   ```bash
   pnpm dev
   ```

---

## Project Structure

```
src/
├── app/
│   ├── api/routes/          # Hono API Routes
│   │   ├── (clerk)/         # AI Agent Logic
│   │   ├── (store)/         # E-commerce Logic (Cart, Orders)
│   │   └── (messages)/      # Real-time Chat Logic
│   ├── chat/                # Chat Interface Page
│   └── (store)/             # Storefront Pages
├── components/
│   ├── chat/                # Avatar, ChatWidget, Recommendations
│   └── landing/             # Hero, Features, GSAP Animations
├── lib/
│   ├── auth.ts              # Better Auth Config
│   ├── db.ts                # Prisma Client
│   └── pusher.ts            # WebSocket Utils
└── hooks/
    ├── use-cart-store.ts    # Zustand Cart State
    └── use-tts.ts           # Text-to-Speech Hook
```

---

## Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

> Built with love by **Team Softronix**
