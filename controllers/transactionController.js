const Transaction = require("../models/transaction");

const addTransaction = async (req, res) => {
  try {
    const { schoolId, amount, description, type } = req.body;
    if (!schoolId || !amount || !type || !["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction data" });
    }

    const transaction = new Transaction({
      school: schoolId,
      amount,
      description,
      type,
    });

    await transaction.save();

    res.status(201).json({ message: "Transaction added successfully", transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTransactionsBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const transactions = await Transaction.find({ school: schoolId });

    res.status(200).json({ transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getIncomeOrExpense = async (req, res) => {
  try {
    const { schoolId,type } = req.params;

    const transactions = await Transaction.find({ school: schoolId ,type: type });

    res.status(200).json({ transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTransactionsBySchoolAndDate = async (req, res) => {
  try {
    const { schoolId, date } = req.params;

    if (!schoolId || !date) {
      return res.status(400).json({ message: "Missing required path parameters" });
    }

    // const startDate = new Date(date);
    // const endDate = new Date(date);
    // endDate.setDate(endDate.getDate() + 1);

    const transactions = await Transaction.find({
      school: mongoose.Types.ObjectId(schoolId),
      date: new Date(date)
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
      } else {
        totalExpense += transaction.amount;
      }
    });

    res.status(200).json({ transactions, totalIncome, totalExpense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addTransaction,
  getTransactionsBySchool,
  getIncomeOrExpense,
  getTransactionsBySchoolAndDate,
};