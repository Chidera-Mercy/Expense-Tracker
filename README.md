# Personal Finance Tracker

A comprehensive expense tracking application to help users manage their finances, track spending, set budgets, and work toward financial goals.

## 📊 Overview

Personal Finance Tracker is a full-featured application designed to give you complete control over your financial life. Track expenses and income, create budgets, set financial goals, and gain insights through detailed analytics—all in one secure platform.

## ✨ Features

### User Management
- Secure registration and authentication
- Personalized user profiles
- Data privacy with row-level security

### Expense Tracking
- Record and categorize expenses
- Add receipts to expense entries
- Search and filter transactions
- Manage recurring expenses
- Track merchants and spending patterns

### Income Management
- Record various income sources
- Categorize income types
- Track recurring income
- Monitor income trends

### Budgeting
- Set category-specific budgets
- Define custom budget periods
- Receive budget alerts
- Track spending against budgets
- Optional budget rollover

### Financial Goals
- Create savings targets with deadlines
- Categorize goals (vacation, education, etc.)
- Set priority levels
- Track progress toward goals
- Add notes for motivation

### Categories
- Default and custom categories for expenses
- Separate categories for income
- Custom colors and icons
- Easy organization of transactions

### Analytics & Reporting
- Visualize spending patterns
- Compare expenses across periods
- Track budget performance
- Monitor financial goal progress

## 🛠️ Technical Architecture

### Database Structure
The application uses a relational database with the following key tables:
- `profiles`: User profile information
- `categories`: Expense categories
- `income_categories`: Income source categories
- `expenses`: Expense transactions
- `income`: Income transactions
- `budgets`: Budget definitions
- `financial_goals`: Savings and financial targets

### Security Features
- Authentication via Supabase Auth
- Row-level security policies
- Secure password handling
- Protected API endpoints

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database
- Supabase account (for authentication)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/personal-finance-tracker.git
   cd personal-finance-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file with the following variables:
   ```
   DATABASE_URL=your_database_connection_string
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   ```

4. Run database migrations:
   ```bash
   npm run migrate
   # or
   yarn migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

### Database Setup

The database schema can be set up using the provided SQL scripts. You can run them directly or use a migration tool:

```bash
psql -U your_username -d your_database -f schema.sql
```

## 📱 Usage

### Adding Expenses
1. Navigate to the Expenses tab
2. Click "Add Expense"
3. Enter amount, date, merchant, and category
4. Add optional description and receipt image
5. Save the expense

### Setting Budgets
1. Go to the Budget section
2. Click "Create Budget"
3. Select category, amount, and time period
4. Enable alerts if desired
5. Save your budget

### Creating Financial Goals
1. Access the Goals section
2. Click "New Goal"
3. Enter goal details including target amount and deadline
4. Track your progress over time

## 🧪 Project Structure

```
personal-finance-tracker/
├── public/             # Static assets
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Application pages
│   ├── services/       # API and data services
│   ├── styles/         # CSS/SCSS files
│   ├── utils/          # Utility functions
│   └── App.js          # Main application component
├── database/
│   └── schema.sql      # Database schema
├── .env                # Environment variables
└── README.md           # Documentation
```

## 📈 Future Enhancements

- Multi-currency support
- Bill payment reminders
- Investment tracking
- Financial reports export
- Mobile applications
- Machine learning for spending predictions

## 🔒 Privacy & Security

Personal Finance Tracker is designed with security as a priority:
- All data is stored securely in your database
- Authentication is handled by Supabase
- Row-level security ensures users can only access their own data
- Passwords are hashed, never stored in plaintext
- All API requests are authenticated

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

If you have any questions or suggestions, please open an issue or contact the project maintainers.

---

**Personal Finance Tracker** - Take control of your financial future.
