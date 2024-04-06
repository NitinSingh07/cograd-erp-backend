const Expense = require("../models/schoolExpense");

const addExpense = async (req, res) => {
  try {
    const { schoolId, amount, description } = req.body;
    if (!schoolId || !amount) {
        return res.status(400).json({ message: "School ID and amount are required fields" });
    }
    
    const expense = new Expense({
      school: schoolId,
      amount,
      description,
     
    });

    await expense.save();

    res.status(201).json({ message: "Expense added successfully", expense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getExpensesBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const expenses = await Expense.find({ school: schoolId });

    res.status(200).json({ expenses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getExpensesBySchoolperDay = async (req, res) => {
    try {
        const { schoolId, date } = req.params;
        
        // Assuming date is in the format YYYY-MM-DD
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1); // Increment the date by 1 to get the next day
        
        const expenses = await Expense.find({
            school: schoolId,
            date: {
                $gte: startDate,
                $lt: endDate
            }
        });

        // Calculate total amount spent
        let totalAmount = 0;
        expenses.forEach(expense => {
            totalAmount += expense.amount;
        });

        res.status(200).json({ expenses, totalAmount, date });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

  

module.exports = {
  addExpense,
  getExpensesBySchool,
  getExpensesBySchoolperDay
};
