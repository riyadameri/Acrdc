document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const currentBalanceEl = document.getElementById('currentBalance');
    const recentTransactionsEl = document.getElementById('recentTransactions');
    
    // Modal elements
    const addIncomeModal = document.getElementById('addIncomeModal');
    
    // Buttons
    const addIncomeBtn = document.getElementById('addIncomeBtn');
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const paySalaryBtn = document.getElementById('paySalaryBtn');
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    
    // Initialize the app
    initApp();
    
    function initApp() {
        loadBalance();
        loadRecentTransactions();
        
        // Event listeners
        addIncomeBtn.addEventListener('click', showAddIncomeModal);
    }
    
    // Load current balance
    async function loadBalance() {
        try {
            const response = await fetch('/api/transactions/balance');
            const data = await response.json();
            currentBalanceEl.textContent = `$${data.balance.toFixed(2)}`;
        } catch (error) {
            console.error('Error loading balance:', error);
        }
    }
    
    // Load recent transactions
    async function loadRecentTransactions() {
        try {
            const response = await fetch('/api/transactions?limit=5');
            const transactions = await response.json();
            
            recentTransactionsEl.innerHTML = '';
            
            if (transactions.length === 0) {
                recentTransactionsEl.innerHTML = '<p>No transactions found</p>';
                return;
            }
            
            transactions.forEach(transaction => {
                const transactionEl = document.createElement('div');
                transactionEl.className = `transaction-item transaction-${transaction.type}`;
                
                const transactionDate = new Date(transaction.date).toLocaleDateString();
                
                transactionEl.innerHTML = `
                    <div class="transaction-details">
                        <h4>${transaction.description}</h4>
                        <p>${transaction.category} • ${transactionDate}</p>
                    </div>
                    <div class="transaction-amount">
                        ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                    </div>
                `;
                
                recentTransactionsEl.appendChild(transactionEl);
            });
        } catch (error) {
            console.error('Error loading transactions:', error);
        }
    }
    
    // Show add income modal
    function showAddIncomeModal() {
        const modalContent = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add Income</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <form id="incomeForm">
                    <div class="form-group">
                        <label for="incomeAmount">Amount</label>
                        <input type="number" id="incomeAmount" class="form-control" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label for="incomeDescription">Description</label>
                        <input type="text" id="incomeDescription" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="incomeCategory">Category</label>
                        <select id="incomeCategory" class="form-control" required>
                            <option value="project">Project Income</option>
                            <option value="other">Other Income</option>
                        </select>
                    </div>
                    <div class="form-group" id="projectField">
                        <label for="incomeProject">Project</label>
                        <select id="incomeProject" class="form-control">
                            <!-- Projects will be loaded here -->
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">Add Income</button>
                </form>
            </div>
        `;
        
        addIncomeModal.innerHTML = modalContent;
        addIncomeModal.style.display = 'flex';
        
        // Load projects for dropdown
        loadProjects();
        
        // Close modal when clicking X
        document.querySelector('.close-btn').addEventListener('click', () => {
            addIncomeModal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        addIncomeModal.addEventListener('click', (e) => {
            if (e.target === addIncomeModal) {
                addIncomeModal.style.display = 'none';
            }
        });
        
        // Handle form submission
        document.getElementById('incomeForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const amount = parseFloat(document.getElementById('incomeAmount').value);
            const description = document.getElementById('incomeDescription').value;
            const category = document.getElementById('incomeCategory').value;
            const project = document.getElementById('incomeProject').value || null;
            
            try {
                const response = await fetch('/api/transactions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type: 'income',
                        amount,
                        description,
                        category,
                        project
                    })
                });
                
                if (response.ok) {
                    // Refresh data
                    loadBalance();
                    loadRecentTransactions();
                    
                    // Close modal
                    addIncomeModal.style.display = 'none';
                } else {
                    throw new Error('Failed to add transaction');
                }
            } catch (error) {
                console.error('Error adding income:', error);
                alert('Failed to add income. Please try again.');
            }
        });
        
        // Show/hide project field based on category
        document.getElementById('incomeCategory').addEventListener('change', function() {
            const projectField = document.getElementById('projectField');
            projectField.style.display = this.value === 'project' ? 'block' : 'none';
        });
    }
    
    // Load projects for dropdown
    async function loadProjects() {
        try {
            const response = await fetch('/api/projects');
            const projects = await response.json();
            
            const projectSelect = document.getElementById('incomeProject');
            projectSelect.innerHTML = '<option value="">Select Project</option>';
            
            projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project._id;
                option.textContent = project.name;
                projectSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }
});