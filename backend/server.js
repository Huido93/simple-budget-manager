// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Initialize the app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Define the Budget schema
const BudgetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  totalAmount: { type: Number, required: true },
  categories: [
    {
      name: { type: String, required: true },
      amount: { type: Number, required: true },
    },
  ],
  expenditures: [
    {
      budgetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Budget' },
      date: { type: Date, required: true },
      amount: { type: Number, required: true },
      category: { type: String, required: true },
      description: { type: String, required: false },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Budget = mongoose.model('Budget', BudgetSchema);

// API route to fetch all budgets
app.get('/api/budgets', async (req, res) => {
  try {
    const budgets = await Budget.find(); // Fetch all budgets from the database
    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API route to save budget
app.post('/api/budgets', async (req, res) => {
  try {
    const newBudget = new Budget(req.body);
    const savedBudget = await newBudget.save();
    res.status(201).json(savedBudget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API route to fetch a single budget by ID
app.get('/api/budgets/:id', async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add an expenditure to a budget
app.post('/api/budgets/:id/expenditures', async (req, res) => {
  try {
    const { date, amount, category, description } = req.body;
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    budget.expenditures.push({ date, amount, category, description });
    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an existing budget by ID
app.put('/api/budgets/:id', async (req, res) => {
  try {
    const { name, totalAmount, description, categories } = req.body;

    const updatedBudget = await Budget.findByIdAndUpdate(
      req.params.id,
      {
        name,
        totalAmount,
        description,
        categories,
      },
      { new: true } // Return the updated budget
    );

    if (!updatedBudget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.status(200).json(updatedBudget);
  } catch (error) {
    res.status(500).json({ message: 'Error updating budget', error: error.message });
  }
});


// Delete an expenditure
app.delete('/api/budgets/:id/expenditures/:expenditureId', async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    budget.expenditures = budget.expenditures.filter(
      (exp) => exp._id.toString() !== req.params.expenditureId
    );
    await budget.save();
    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/budgets/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Ensure ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid budget ID' });
    }

    // ✅ Find the budget before deleting
    const existingBudget = await Budget.findById(id);
    if (!existingBudget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // ✅ Delete the budget (which also removes embedded expenditures)
    await Budget.findByIdAndDelete(id);

    return res.json({ message: 'Budget and all related expenditures deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting budget:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

