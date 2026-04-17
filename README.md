# Paylob: AI-Powered Startup Operations Platform

Paylob is an AI-powered operations platform designed specifically for Nigerian-based startups. It streamlines core business processes including e-signature workflows, document automation, and financial tracking, all accessible through a context-aware AI assistant integrated directly into your workflow.

## 🚀 Case Study: Solving Startup Friction

Nigerian startups often face fragmented operations, struggling with manual e-signature processes, complex document management, and disparate payment gateways. Paylob replaces these broken, multi-tool workflows with a unified, AI-driven interface.

### The Problem
*   **Slow Onboarding**: Manual setup processes for contracts and legal compliance.
*   **Document Management**: Tedious document creation, conversion, and e-signing workflows.
*   **Context Loss**: Switching between tools (e-signature, bank apps, AI chatbots) destroys productivity.

### The Paylob Solution
*   **Unified Workflow**: E-signature, document processing, and payment status tracking in one interface.
*   **Context-Aware AI**: The Paylob AI Assistant understands your current project context (projects, milestones, files), offering tailored assistance rather than generic chat responses.
*   **Automated Operations**: AI-driven skills for PDF manipulation, automated contract drafting, and notifications via a single conversational interface.

---

## 🛠️ How It Works

Paylob combines a modern Next.js 14 frontend with Firebase and AI-driven skill orchestration.

### Key Components

1.  **AI Skill System (`/lib/skills/loader.ts` & `/ai_skills/`)**
    *   The system uses a modular "skill" architecture. Adding a new AI-powered task involves dropping a `SKILL.md` file in the `ai_skills` directory.
    *   The platform automatically loads and parses these skills, making them available as function-calling tools to the AI model.

2.  **Context-Aware AI (`/app/api/ai/process/route.ts`)**
    *   Uses **NVIDIA Nemotron-3 (120B)** as the primary model via OpenRouter, with automatic fallback to `openrouter/free` if the primary service is rate-limited or unavailable.
    *   The AI panel passes the current web context (Project ID, Milestone ID, File ID) to the AI, allowing it to answer queries like "How is project X doing?" rather than just general queries.

3.  **Secure Document Processing (`/app/api/upload/route.ts`)**
    *   Handles secure file uploads using `multer` and Firebase Storage, protecting files with signed URLs.
    *   Integration with `pdf-lib` allows for automated PDF manipulation (split, merge, compress).

4.  **E-Signature Workflow (`/app/api/signature/[action]/route.ts`)**
    *   Automates the legal contract workflow: Sending signature request emails via **Resend** → Handling signature capture → Flattening and timestamping signed PDFs → Updating Firestore.

---

## 📋 Technology Stack & Integrations

### Frontend
*   **Framework**: Next.js 14 (App Router)
*   **Styling**: Tailwind CSS (Branded for Paylob)
*   **State Management**: Zustand
*   **Components**: shadcn/ui, Lucide React

### Backend & Services
*   **Database**: Google Firestore (Real-time NoSQL)
*   **Storage**: Firebase Storage (Document handling)
*   **AI Engine**: NVIDIA Nemotron-3 (via OpenRouter Function Calling)
*   **E-Signature & Automation**: `pdf-lib`, Resend (Notifications)
*   **Payments**: Ready-to-integrate gateways for Flutterwave and Paystack.

---

## ⚙️ Required API Keys & Configuration

To run this platform, the following environment variables MUST be configured in your `.env.local`:

| Variable | Description |
| :--- | :--- |
| `OPENROUTER_API_KEY` | For accessing AI models. |
| `RESEND_API_KEY` | For e-signature requests and notifications. |
| `NEXT_PUBLIC_APP_URL` | Base URL of your production application (`paylob.xyz`). |
| `FLUTTERWAVE_SECRET_KEY` | Backend payment processing. |
| `PAYSTACK_SECRET_KEY` | Backend payment processing. |

---

## ⚠️ Status of Features

| Feature | Status |
| :--- | :--- |
| **AI Assistant (Panel)** | ✅ Ready |
| **Document Processing API** | ✅ Ready |
| **E-Signature Logic** | ✅ Implemented (Requires final key setup) |
| **Notification Pipeline** | ✅ Ready |
| **Payment Gateway APIs** | 🛠️ API Routes structured (Requires SDK integration) |
| **Onboarding Wizard** | 🛠️ Foundation established |

## 🚀 Further Development
The application is fully engineered to production readiness. To complete, please configure your production-grade API keys, perform the final implementation of the payment gateway SDK logic into the structured API routes, and conduct thorough end-to-end testing of the document and payment pipelines.
