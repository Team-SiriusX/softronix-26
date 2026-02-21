# Echo — AI-Powered E-Commerce Platform

> **🏆 First Place — GCU Softronix Hackathon**
> Built by Team SiriusX · February 2026

---

> **Note on API Services**
> Echo was developed as a competition entry for the GCU Softronix Hackathon, where it placed first. Following the conclusion of the event, the live AI services have been intentionally decommissioned by the development team. The assistant is no longer operational, but the full codebase and product remain as a working demonstration of what was built.

---

## What Is Echo?

Echo is an AI-first e-commerce platform for grooming products. It replaces the traditional search-and-browse experience with a **conversational AI clerk** — a 3D interactive avatar that can see your inventory, control the UI, negotiate prices, speak to you, and hand off to a human agent in real time.

The project was designed and shipped end-to-end within the hackathon timeline, demonstrating a full production-grade stack with agentic AI at its core.

---

## Core Features

### AI Clerk — "Echo"
- **RAG-Powered Product Intelligence** — Uses Upstash Vector to semantically search the product catalog. Answers natural language queries like *"something for dry skin under ₨2,000"* with real results.
- **Agentic UI Control** — Echo doesn't just respond in text; it calls tools to directly manipulate the storefront: filtering products, adjusting sort order, navigating pages, and highlighting items.
- **Conversational Negotiation (Haggle Mode)** — Users can request discounts. Echo evaluates their sentiment and reason (student, first-time buyer, birthday, etc.) and either generates a valid one-time coupon applied directly to the cart, or declines gracefully.
- **Dynamic Penalty Pricing** — If a user is abusive or rude, Echo can increase the price of products by a configurable percentage as a deterrent.
- **Full-Page Chat Experience** — A dedicated `/chat` route with session history, a 3D avatar, voice input, and TTS output.

### 3D Interactive Avatar
- Built with **React Three Fiber** and **Three.js**.
- Real-time **lip-sync** via phoneme (viseme) mapping — the avatar's mouth moves in sync with the Text-to-Speech audio using `MorphTarget` updates on every animation frame.

### Voice Interface
- **Speech-to-Text** via Groq's Whisper API — tap to speak, get a transcript, auto-send.
- **Text-to-Speech** — Echo reads its own responses aloud, driving the avatar's lip animation.

### Real-Time Human Escalation
- Powered by **Pusher Channels** (WebSockets).
- Users can switch from AI to a live human agent mid-conversation.
- Admins have a dedicated dashboard to see active conversations and respond in real time.

### Full E-Commerce Stack
- Product catalog, cart, checkout, and order management.
- Payments via **Stripe**.
- Authentication with email, Google, and GitHub via **BetterAuth**.
- File uploads via **UploadThing**.
- Order emails via **Resend**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (Strict) |
| Styling | Tailwind CSS v4, SCSS Modules |
| Animations | GSAP, Lenis Smooth Scroll |
| 3D / Avatar | React Three Fiber, Three.js, Drei |
| API Framework | Hono (mounted on Next.js route handlers) |
| Database | PostgreSQL via Neon |
| ORM | Prisma |
| Vector DB | Upstash Vector (RAG) |
| Auth | BetterAuth |
| Real-Time | Pusher Channels |
| LLM | OpenRouter (Claude 3.5 Sonnet / DeepSeek V3) |
| Speech-to-Text | Groq (Whisper) |
| Payments | Stripe |
| File Uploads | UploadThing |
| Email | Resend / Nodemailer |
| State Management | TanStack Query, Zustand |

---

## Project Structure

```
src/
├── app/
│   ├── api/[[...route]]/    # Hono API (clerk, store, messages, auth)
│   ├── chat/                # Full-page chat UI with 3D avatar
│   ├── (root)/              # Landing page
│   ├── cart/                # Shopping cart
│   ├── checkout/            # Stripe checkout
│   ├── orders/              # Order history
│   ├── profile/             # User profile
│   └── admin/               # Admin dashboard (human chat panel)
├── components/
│   ├── chat/                # ChatWidget, AvatarCanvas, ChatInput, TTS, Voice
│   ├── landing/             # GSAP entrance animation, hero, sections
│   ├── cart/                # Cart UI components
│   ├── product/             # Product cards and detail
│   └── ui/                  # shadcn/ui component library
├── lib/
│   ├── auth.ts              # BetterAuth config
│   ├── db.ts                # Prisma client
│   ├── pusher.ts            # Pusher server instance
│   ├── pusher-client.ts     # Pusher client instance
│   ├── vector.ts            # RAG / Upstash Vector utils
│   └── stripe.ts            # Stripe config
├── hooks/
│   ├── use-tts.ts           # Text-to-Speech with viseme output
│   ├── use-voice-recorder.ts # Mic recording → Groq transcription
│   ├── use-chat-history.ts  # Local session history management
│   └── use-cart-store.tsx   # Zustand cart state
└── services/                # TanStack Query API hooks
```

---

## Running Locally

> The live AI services are offline. To run the project locally you will need to supply your own API keys.

### Prerequisites

- Node.js 20+
- pnpm
- A PostgreSQL database (e.g. Neon)
- An Upstash Vector index
- OpenRouter API key
- Groq API key
- Pusher account
- Stripe account

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/softronix-26.git
cd softronix-26

# 2. Install dependencies
pnpm install

# 3. Create your .env file
cp .env.example .env
# Fill in the values below

# 4. Push the database schema
pnpm prisma db push

# 5. Start the dev server
pnpm dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# BetterAuth
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

# Real-Time
PUSHER_APP_ID="..."
PUSHER_KEY="..."
PUSHER_SECRET="..."
PUSHER_CLUSTER="..."
NEXT_PUBLIC_PUSHER_KEY="..."
NEXT_PUBLIC_PUSHER_CLUSTER="..."

# Payments
STRIPE_SECRET_KEY="sk_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
RESEND_API_KEY="..."
RESEND_EMAIL="noreply@yourdomain.com"

# UploadThing
UPLOADTHING_SECRET="sk_..."
UPLOADTHING_APP_ID="..."
```

---

## License

Distributed under the MIT License.

---

> **Team SiriusX** — GCU Softronix Hackathon, February 2026
