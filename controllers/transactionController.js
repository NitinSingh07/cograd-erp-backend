// controllers/transactionController.js
const School = require("../models/school");
const Transaction = require("../models/transaction");
const { getSchool } = require("../service/schoolAuth");

const addTransaction = async (req, res) => {
  try {
    const { amount, description, type, receipt, id } = req.body;

    if (!amount || !type || !["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction data" });
    }

    const school = await School.findById(id);

    if (!school || !id) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const transaction = new Transaction({
      school: id, // Use the school ID from the decoded token
      amount,
      description,
      type,
      receipt,
    });

    await transaction.save();

    res
      .status(200)
      .json({ message: "Transaction added successfully", transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
//default i am showing expenses
const getTransactionsBySchool = async (req, res) => {
  try {
    const schoolId = req.params.id; // Extract the school ID from the decoded token
    const type = "expenses";
    const transactions = await Transaction.find({ school: schoolId });

    res.status(200).json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getIncomeOrExpense = async (req, res) => {
  try {
    const schoolId = req.params.id; // Extract the school ID from the decoded token
    const { type } = req.params;

    const transactions = await Transaction.find({
      school: schoolId,
      type,
    });

    res.status(200).json({ transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTransactionsBySchoolAndDate = async (req, res) => {
  try {
    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { date } = req.params;

    if (!date) {
      return res
        .status(400)
        .json({ message: "Missing required path parameters" });
    }

    const transactions = await Transaction.find({
      school: decodedToken.id,
      date: new Date(date),
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
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
