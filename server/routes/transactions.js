const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Add new transaction
router.post('/', async (req, res) => {
    try {
        const newTransaction = new Transaction(req.body);
        const savedTransaction = await newTransaction.save();
        res.status(201).json(savedTransaction);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all transactions
router.get('/', async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('project')
            .populate('employee');
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get current balance
router.get('/balance', async (req, res) => {
    try {
        const transactions = await Transaction.find();
        const balance = transactions.reduce((acc, transaction) => {
            return transaction.type === 'income' 
                ? acc + transaction.amount 
                : acc - transaction.amount;
        }, 0);
        res.json({ balance });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;