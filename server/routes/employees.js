const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// Add new employee
router.post('/', async (req, res) => {
    try {
        const newEmployee = new Employee(req.body);
        const savedEmployee = await newEmployee.save();
        res.status(201).json(savedEmployee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all employees
router.get('/', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Pay salary to employee
router.post('/:id/pay', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        // Create a salary payment transaction
        const transaction = new Transaction({
            type: 'expense',
            amount: employee.salary,
            description: `Salary payment for ${employee.name}`,
            category: 'salary',
            employee: employee._id
        });

        await transaction.save();
        res.json({ message: 'Salary paid successfully', transaction });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;