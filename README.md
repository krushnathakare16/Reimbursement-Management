# 🏢 Enterprise Reimbursement Management System

A production-ready Reimbursement Management application built for modern corporate hierarchies. This platform replaces error-prone manual spreadsheets with an intelligent, dynamic State Machine workflow that structurally routes expenses from Employee to Manager, Finance, and the CFO.

Developed specifically for the **Odoo Hackathon**.

## 🚀 Key Features

* **Dynamic Upward Lineage (State Machine):** An interactive matrix that allows Admins to dynamically link employees to specific managers, and managers to Finance. The system algorithmically inherits this structure, passing tickets sequentially UP the chain.
* **AI Browser-Side OCR:** Automatically scans uploaded merchant receipts and uses heuristic extraction to pre-fill the Amount, Category, Date, and Merchant Name natively in the browser.
* **Live Global Currency Conversion:** Built with `exchangerate-api.com`. Employees can submit an expense in Japanese Yen or British Pounds, and the Admin portal automatically converts and logs it in the Company's base currency in real-time.
* **Granular Identity Routing:** A universal `/login` portal powered by `NextAuth.js`. Users are automatically evaluated and routed to custom Employee, Manager, or Admin Dashboards based on their SQLite database roles.
* **Interactive Approvals Dashboard:** Managers mathematically evaluate requests. Admin users can establish globally configured "Percent threshold limits" to dynamically alter what constitutes an Approval.

---

## 🛠️ Tech Stack

* **Framework:** [Next.js 14+ (App Router)](https://nextjs.org/)
* **Database / ORM:** SQLite via [Prisma ORM](https://www.prisma.io/)
* **Authentication:** NextAuth.js
* **Styling:** Tailwind CSS (Enterprise-grade Roboto/Open Sans typography)
* **API Providers:** RestCountries (Currency List), ExchangeRate-API (Live Conversion), Tesseract.js (Optical Character Recognition)

---

## ⚙️ Quick Start Guide (Local Development)

Follow these steps to seamlessly spin up the project on your local machine.

### 1. Clone the Repository
```bash
git clone https://github.com/krushnathakare16/Reimbursement-Management.git
cd Reimbursement-Management
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a new file named `.env` in the root directory and add the following keys:
```env
# SQLite Database Path
DATABASE_URL="file:./dev.db"

# NextAuth Secret (Generate any random string for local testing)
NEXTAUTH_SECRET="odoo-hackathon-super-secret"
```

### 4. Initialize the Database
Generate the strict TypeScript definitions and push your SQLite relational schema constraints:
```bash
npx prisma generate
npx prisma db push
```

### 5. Launch the Application
```bash
npm run dev
```
Navigate to `http://localhost:3000`. You will be automatically redirected to the `/login` portal.

---

## 🧪 Testing the Application (User Guide)
To test the full lifecycle of the sequential algorithm:

1. **Register as Admin:** Sign up via the standard `Sign Up` page. Under the hood, the system sets the very first user as an `ADMIN` and creates your virtual Company.
2. **Build the Organization:** Go to the Admin Dashboard. Click "Invite Associate" to generate three specific accounts:
   - A `MANAGER`
   - A `FINANCE` officer
   - An `EMPLOYEE`
3. **Map the Lineage:** Inside the Admin "Organization Users" table, use the interactive dropdowns in the `Reports To (Manager)` column to manually assign the Employee to the Manager, and the Manager to the Finance officer.
4. **Submit & Watch it Sequence:** Log in as the Employee and submit an expense. Switch accounts mathematically up the chain, and watch the ticket structurally pass from Employee -> Manager -> Finance in real-time!

## 📜 License
This project is open-source and created for hackathon demonstration purposes.
