# 💸 SpendWise – Expense Tracker Application

A full-featured Node.js + Express backend for tracking personal expenses with premium features such as leaderboard access, PDF reports, and online payments via Cashfree.

---

## 🚀 Features

- ✅ User Authentication (JWT-based)
- 🧾 Expense Management (CRUD with pagination)
- 📈 Leaderboard (Top spenders - premium only)
- 💳 Cashfree Integration for Premium Membership
- 📬 Password Reset via Email (Brevo/SIB)
- 📄 Generate and Download PDF Reports (AWS S3)
- 🔒 Secure: Transactions + Role-based access

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express
- **Database:** MySQL, Sequelize ORM
- **Auth:** JWT, Bcrypt
- **Payments:** Cashfree PG API (Sandbox/Live)
- **Email:** Brevo (SendInBlue)
- **Cloud Storage:** AWS S3
- **PDF:** jspdf + jspdf-autotable

---

## 📁 Project Structure
```
├── config/
│ └── dbConfig.js # Sequelize DB connection
├── model/
│ ├── userModel.js
│ ├── expenseModel.js
│ ├── orderModel.js
│ └── passwordResetModel.js
├── routes/
│ └── <your route files>.js
├── controller/
│ └── <your controller files>.js
├── utils/
│ └── convertToPdf.js
├── view
├── .env
└── server.js
```
## 🔐 Environment Variables (`.env`)
```
DB_NAME=expense
DB_USER=root
DB_PASSWORD=yourpassword
DB_HOST=localhost
JWT_SECRET=your_jwt_secret
SIB_API_KEY=your_brevo_api_key
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret
CASHFREE_ENV=sandbox
AWS_ACCESS_KEY=your_aws_key
AWS_SECRET_KEY=your_aws_secret
AWS_REGION=your_region
S3_BUCKET=your_bucket_name
```

## Install dependencies

```npm install```
## Run the project

```npm run dev```
