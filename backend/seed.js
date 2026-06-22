require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Income = require('./models/Income');
const Expense = require('./models/Expense');
const Budget = require('./models/Budget');
const Notification = require('./models/Notification');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    const demoEmail = 'demo@example.com';
    
    // Clear existing demo user data
    const existingUser = await User.findOne({ email: demoEmail });
    if (existingUser) {
      console.log('Cleaning up existing demo user...');
      await Income.deleteMany({ userId: existingUser._id });
      await Expense.deleteMany({ userId: existingUser._id });
      await Budget.deleteMany({ userId: existingUser._id });
      await Notification.deleteMany({ userId: existingUser._id });
      await User.deleteOne({ _id: existingUser._id });
    }

    // Create demo user
    console.log('Creating demo user...');
    const user = await User.create({
      name: 'Abhishek Venkat',
      email: demoEmail,
      password: 'Password123', // Will be hashed by userSchema pre-save
      profileImage: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Abhishek',
      currency: 'INR',
      theme: 'light',
    });

    console.log(`Demo User created: ${user.name} (${user.email})`);

    const now = new Date();
    
    // Seed budgets for past 6 months + current month
    console.log('Seeding budgets...');
    const categories = ['Total', 'Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Education', 'Healthcare', 'Other'];
    const categoryLimits = {
      Total: 45000,
      Food: 12000,
      Travel: 5000,
      Shopping: 10000,
      Bills: 15000,
      Entertainment: 5000,
      Education: 3000,
      Healthcare: 4000,
      Other: 5000
    };

    const budgetPromises = [];
    for (let i = 0; i < 7; i++) {
      const budgetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${budgetDate.getFullYear()}-${String(budgetDate.getMonth() + 1).padStart(2, '0')}`;
      
      categories.forEach(category => {
        budgetPromises.push(Budget.create({
          userId: user._id,
          category,
          limit: categoryLimits[category],
          month: monthStr
        }));
      });
    }
    await Promise.all(budgetPromises);

    // Seed incomes for past 6 months
    console.log('Seeding incomes...');
    const incomePromises = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      
      // Salary (fixed)
      incomePromises.push(Income.create({
        userId: user._id,
        amount: 65000,
        category: 'Salary',
        date: new Date(date.getFullYear(), date.getMonth(), 2),
        description: 'Monthly Salary Credit'
      }));

      // Freelancing (variable)
      if (i % 2 === 0) {
        incomePromises.push(Income.create({
          userId: user._id,
          amount: 18000 + (i * 2000),
          category: 'Freelancing',
          date: new Date(date.getFullYear(), date.getMonth(), 15),
          description: 'Web development freelance contract'
        }));
      }

      // Investments
      if (i % 3 === 0) {
        incomePromises.push(Income.create({
          userId: user._id,
          amount: 4500,
          category: 'Investments',
          date: new Date(date.getFullYear(), date.getMonth(), 25),
          description: 'Stock dividends'
        }));
      }
    }
    await Promise.all(incomePromises);

    // Seed expenses for past 6 months
    console.log('Seeding expenses...');
    const expensePromises = [];
    
    // Discretionary and fixed list per month
    for (let i = 0; i < 6; i++) {
      const year = now.getFullYear();
      const month = now.getMonth() - i;

      // Fixed: Rent & Electricity (Bills)
      expensePromises.push(Expense.create({
        userId: user._id,
        amount: 12000,
        category: 'Bills',
        date: new Date(year, month, 5),
        paymentMethod: 'Net Banking',
        notes: 'Monthly Flat Rent'
      }));
      expensePromises.push(Expense.create({
        userId: user._id,
        amount: 1800,
        category: 'Bills',
        date: new Date(year, month, 8),
        paymentMethod: 'UPI',
        notes: 'Electricity bill payment'
      }));
      expensePromises.push(Expense.create({
        userId: user._id,
        amount: 699,
        category: 'Bills',
        date: new Date(year, month, 10),
        paymentMethod: 'UPI',
        notes: 'WiFi Broadband'
      }));

      // Food expenses (multiple times)
      expensePromises.push(Expense.create({
        userId: user._id,
        amount: 1200 + (i * 100),
        category: 'Food',
        date: new Date(year, month, 4),
        paymentMethod: 'UPI',
        notes: 'Grocery shopping at DMart'
      }));
      expensePromises.push(Expense.create({
        userId: user._id,
        amount: 850 + (i * 50),
        category: 'Food',
        date: new Date(year, month, 12),
        paymentMethod: 'Cash',
        notes: 'Dinner with friends'
      }));
      expensePromises.push(Expense.create({
        userId: user._id,
        amount: 1500,
        category: 'Food',
        date: new Date(year, month, 22),
        paymentMethod: 'UPI',
        notes: 'Monthly pantry restocking'
      }));
      expensePromises.push(Expense.create({
        userId: user._id,
        amount: 450,
        category: 'Food',
        date: new Date(year, month, 28),
        paymentMethod: 'Card',
        notes: 'Starbucks Coffee & Snacks'
      }));

      // Travel
      expensePromises.push(Expense.create({
        userId: user._id,
        amount: 1500 + (i * 200),
        category: 'Travel',
        date: new Date(year, month, 6),
        paymentMethod: 'Card',
        notes: 'Monthly Metro pass'
      }));
      if (i % 2 === 0) {
        expensePromises.push(Expense.create({
          userId: user._id,
          amount: 1800,
          category: 'Travel',
          date: new Date(year, month, 18),
          paymentMethod: 'UPI',
          notes: 'Uber Outstation cab'
        }));
      }

      // Shopping (high in month 1, normal in others)
      expensePromises.push(Expense.create({
        userId: user._id,
        amount: i === 1 ? 14000 : 3500 + (i * 300), // shopping spike 1 month ago
        category: 'Shopping',
        date: new Date(year, month, 14),
        paymentMethod: 'Card',
        notes: i === 1 ? 'Bought OnePlus Nord Smartphone' : 'New clothing apparel'
      }));

      // Entertainment
      expensePromises.push(Expense.create({
        userId: user._id,
        amount: 1999,
        category: 'Entertainment',
        date: new Date(year, month, 15),
        paymentMethod: 'Card',
        notes: 'Netflix & Spotify subscriptions'
      }));
      if (i % 3 === 0) {
        expensePromises.push(Expense.create({
          userId: user._id,
          amount: 2500,
          category: 'Entertainment',
          date: new Date(year, month, 20),
          paymentMethod: 'UPI',
          notes: 'Concert show ticket'
        }));
      }

      // Education
      expensePromises.push(Expense.create({
        userId: user._id,
        amount: 1200,
        category: 'Education',
        date: new Date(year, month, 3),
        paymentMethod: 'UPI',
        notes: 'Udemy courses'
      }));

      // Healthcare
      expensePromises.push(Expense.create({
        userId: user._id,
        amount: 650,
        category: 'Healthcare',
        date: new Date(year, month, 16),
        paymentMethod: 'Cash',
        notes: 'Regular health multivitamin supplements'
      }));

      // Other
      expensePromises.push(Expense.create({
        userId: user._id,
        amount: 1100,
        category: 'Other',
        date: new Date(year, month, 25),
        paymentMethod: 'Cash',
        notes: 'Laundry & laundry detergent'
      }));
    }
    await Promise.all(expensePromises);

    // Seed notifications
    console.log('Seeding notifications...');
    const pastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const pastMonthStr = `${pastMonthDate.getFullYear()}-${String(pastMonthDate.getMonth() + 1).padStart(2, '0')}`;
    const curMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    await Notification.create([
      {
        userId: user._id,
        type: 'danger',
        message: `Budget Exceeded! You have spent 14,000 out of your 10,000 limit for Shopping in ${pastMonthStr}.`,
        read: true,
        createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 15)
      },
      {
        userId: user._id,
        type: 'warning',
        message: `Budget Alert! You have utilized 85% of your Food budget for ${curMonthStr}. Spent: 10,200/12,000.`,
        read: false,
        createdAt: new Date(now.getFullYear(), now.getMonth(), 28)
      },
      {
        userId: user._id,
        type: 'warning',
        message: `Unusual Spending Detected! You logged an expense of 14,000 in Shopping, which is significantly higher than your average spend of 3,800 in this category.`,
        read: true,
        createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 14)
      }
    ]);

    console.log('Database seeded successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
