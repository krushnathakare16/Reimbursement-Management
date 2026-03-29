# Reimbursement Management System 🚀

> **Odoo Hackathon Project Submission** <br>
> A hyper-efficient, highly-automated system for managing company hierarchies, multi-level/conditional approval workflows, and AI-powered expense abstraction.

## 🛠️ The Tech Stack
* **Framework:** Next.js 15 (App Router) + React 19
* **Database:** SQLite (for zero-configuration judge environments) + Prisma ORM (v5 Stable)
* **Auth:** NextAuth (Role-based: ADMIN, MANAGER, EMPLOYEE)
* **Aesthetics:** Tailwind CSS + Lucide Icons (Glassmorphic dark design)
* **AI Core:** Tesseract.js (WebAssembly Client-Side OCR)

---

## ⚡ Core Features Built
1. **Instant Company Registration:** On signup, the system dynamically fetches global currencies from external APIs and isolates your new company ledger. 
2. **AI Receipt Scanning:** Employees can simply drag an image of their dinner/flight receipt. Our **Client-Side Tesseract OCR Engine** instantly scans the pixels, extracts the total amount, and categorizes it with zero human typing required.
3. **Multi-Level Approval Matrix:** Admins have a dedicated visual dashboard to configure sequence rules (e.g. `Step 1: HR` -> `Step 2: Finance`) or override rules (e.g., `If 60% of Assigneés approve --> Bypass Sequence`).

---

## 👨‍⚖️ Instructions for Judges (1-Minute Setup)

We designed this repository so you don't have to fiddle with Docker or Cloud Databases to grade us! 

**1. Install Dependencies**
```bash
npm install
```

**2. Synchronize the Local Database**
*(This generates the local .db file and syncs our schema automatically)*
```bash
npx prisma db push --accept-data-loss
```

**3. Run the App**
```bash
npm run dev
```
Navigate to `http://localhost:3000`. You can test our dynamic API by registering a **"New Company"**. You will automatically be granted the **ADMIN** permission to configure workflows and test the Application!

---
*Developed with focus, speed, and clean code for the Odoo Hackathon!*
