document.addEventListener('DOMContentLoaded', function() {
    // بيانات التطبيق
    let appData = {
        balance: 0,
        transactions: [],
        projects: [],
        employees: [],
        tasks: []
    };

    // تحميل البيانات المحفوظة
    function loadData() {
        const savedData = localStorage.getItem('startupAccountingData');
        if (savedData) {
            appData = JSON.parse(savedData);
            updateUI();
        }
    }

    // حفظ البيانات
    function saveData() {
        localStorage.setItem('startupAccountingData', JSON.stringify(appData));
        updateUI();
    }

    // تحديث واجهة المستخدم
    function updateUI() {
        // تحديث الرصيد
        document.getElementById('currentBalance').textContent = formatCurrency(appData.balance);

        // تحديث إحصائيات الشهر
        updateMonthlyStats();

        // تحديث قائمة المعاملات الحديثة
        updateRecentTransactions();

        // تحديث قائمة المشاريع
        updateProjectsList();

        // تحديث قائمة الموظفين
        updateEmployeesList();

        // تحديث قائمة المعاملات الكاملة
        updateTransactionsList();
    }

    // تنسيق العملة
    function formatCurrency(amount) {
        return amount.toFixed(2) + ' $';
    }

    // تحديث إحصائيات الشهر
    function updateMonthlyStats() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthIncome = appData.transactions
            .filter(t => t.type === 'income' && 
                  new Date(t.date).getMonth() === currentMonth && 
                  new Date(t.date).getFullYear() === currentYear)
            .reduce((sum, t) => sum + t.amount, 0);

        const monthExpenses = appData.transactions
            .filter(t => t.type === 'expense' && 
                  new Date(t.date).getMonth() === currentMonth && 
                  new Date(t.date).getFullYear() === currentYear)
            .reduce((sum, t) => sum + t.amount, 0);

        const activeProjects = appData.projects.filter(p => p.status === 'active').length;
        const totalEmployees = appData.employees.length;

        document.getElementById('monthIncome').textContent = formatCurrency(monthIncome);
        document.getElementById('monthExpenses').textContent = formatCurrency(monthExpenses);
        document.getElementById('activeProjects').textContent = activeProjects;
        document.getElementById('totalEmployees').textContent = totalEmployees;
    }

    // تحديث المعاملات الحديثة
    function updateRecentTransactions() {
        const container = document.getElementById('recentTransactions');
        container.innerHTML = '';

        const recent = [...appData.transactions]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        recent.forEach(transaction => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            
            const icon = document.createElement('i');
            icon.className = transaction.type === 'income' ? 
                'fas fa-arrow-up income' : 'fas fa-arrow-down expense';
            
            const text = document.createElement('span');
            text.textContent = `${transaction.description}: ${formatCurrency(transaction.amount)}`;
            
            const date = document.createElement('span');
            date.className = 'activity-date';
            date.textContent = formatDate(transaction.date);
            
            item.appendChild(icon);
            item.appendChild(text);
            item.appendChild(date);
            container.appendChild(item);
        });
    }

    // تحديث قائمة المعاملات الكاملة
    function updateTransactionsList(filterType = 'all', filterDate = '') {
        const container = document.getElementById('transactionsList');
        container.innerHTML = '';

        let transactions = [...appData.transactions]
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filterType !== 'all') {
            transactions = transactions.filter(t => t.type === filterType);
        }

        if (filterDate) {
            transactions = transactions.filter(t => t.date === filterDate);
        }

        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            
            const dateCell = document.createElement('td');
            dateCell.textContent = formatDate(transaction.date);
            
            const descCell = document.createElement('td');
            descCell.textContent = transaction.description;
            
            const categoryCell = document.createElement('td');
            categoryCell.textContent = transaction.category || '-';
            
            const amountCell = document.createElement('td');
            amountCell.textContent = formatCurrency(transaction.amount);
            amountCell.className = transaction.type === 'income' ? 'income' : 'expense';
            
            const typeCell = document.createElement('td');
            typeCell.textContent = transaction.type === 'income' ? 'إيراد' : 'مصروف';
            
            const actionsCell = document.createElement('td');
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.onclick = () => deleteTransaction(transaction.id);
            actionsCell.appendChild(deleteBtn);
            
            row.appendChild(dateCell);
            row.appendChild(descCell);
            row.appendChild(categoryCell);
            row.appendChild(amountCell);
            row.appendChild(typeCell);
            row.appendChild(actionsCell);
            
            container.appendChild(row);
        });
    }

    // حذف معاملة
    function deleteTransaction(id) {
        const transaction = appData.transactions.find(t => t.id === id);
        if (!transaction) return;

        if (confirm('هل أنت متأكد من حذف هذه المعاملة؟')) {
            // تعديل الرصيد
            if (transaction.type === 'income') {
                appData.balance -= transaction.amount;
            } else {
                appData.balance += transaction.amount;
            }

            // حذف المعاملة
            appData.transactions = appData.transactions.filter(t => t.id !== id);
            saveData();
        }
    }

    // تحديث قائمة المشاريع
    function updateProjectsList() {
        const container = document.getElementById('projectList');
        container.innerHTML = '';

        appData.projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            
            const header = document.createElement('div');
            header.className = 'project-header';
            
            const title = document.createElement('h3');
            title.textContent = project.name;
            
            const status = document.createElement('span');
            status.className = `status ${project.status}`;
            status.textContent = getStatusText(project.status);
            
            header.appendChild(title);
            header.appendChild(status);
            
            const client = document.createElement('p');
            client.innerHTML = `<strong>العميل:</strong> ${project.client || 'غير محدد'}`;
            
            const budget = document.createElement('p');
            budget.innerHTML = `<strong>الميزانية:</strong> ${formatCurrency(project.budget || 0)}`;
            
            const dates = document.createElement('p');
            dates.innerHTML = `<strong>الفترة:</strong> ${formatDate(project.startDate)} - ${formatDate(project.endDate)}`;
            
            const actions = document.createElement('div');
            actions.className = 'project-actions';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.innerHTML = '<i class="fas fa-edit"></i> تعديل';
            editBtn.onclick = () => openEditProjectModal(project.id);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> حذف';
            deleteBtn.onclick = () => deleteProject(project.id);
            
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            
            projectCard.appendChild(header);
            projectCard.appendChild(client);
            projectCard.appendChild(budget);
            projectCard.appendChild(dates);
            projectCard.appendChild(actions);
            
            container.appendChild(projectCard);
        });
    }

    // حذف مشروع
    function deleteProject(id) {
        if (confirm('هل أنت متأكد من حذف هذا المشروع؟ سيتم حذف جميع المهام والمدفوعات المرتبطة به.')) {
            appData.projects = appData.projects.filter(p => p.id !== id);
            appData.tasks = appData.tasks.filter(t => t.projectId !== id);
            saveData();
        }
    }

    // تحديث قائمة الموظفين
    function updateEmployeesList() {
        const container = document.getElementById('employeeList');
        container.innerHTML = '';

        appData.employees.forEach(employee => {
            const row = document.createElement('tr');
            
            const nameCell = document.createElement('td');
            nameCell.textContent = employee.name;
            
            const positionCell = document.createElement('td');
            positionCell.textContent = employee.position;
            
            const salaryCell = document.createElement('td');
            salaryCell.textContent = formatCurrency(employee.salary);
            
            const lastPaymentCell = document.createElement('td');
            lastPaymentCell.textContent = getLastPaymentDate(employee.id);
            
            const actionsCell = document.createElement('td');
            
            const payBtn = document.createElement('button');
            payBtn.className = 'pay-btn';
            payBtn.innerHTML = '<i class="fas fa-money-bill-wave"></i> دفع';
            payBtn.onclick = () => payEmployee(employee.id);
            
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.onclick = () => openEditEmployeeModal(employee.id);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.onclick = () => deleteEmployee(employee.id);
            
            actionsCell.appendChild(payBtn);
            actionsCell.appendChild(editBtn);
            actionsCell.appendChild(deleteBtn);
            
            row.appendChild(nameCell);
            row.appendChild(positionCell);
            row.appendChild(salaryCell);
            row.appendChild(lastPaymentCell);
            row.appendChild(actionsCell);
            
            container.appendChild(row);
        });
    }

    // دفع راتب الموظف
    function payEmployee(employeeId) {
        const employee = appData.employees.find(e => e.id === employeeId);
        if (!employee) return;

        if (appData.balance < employee.salary) {
            alert('الرصيد الحالي غير كافي لدفع الراتب!');
            return;
        }

        if (confirm(`هل تريد دفع راتب ${employee.name} بقيمة ${formatCurrency(employee.salary)}؟`)) {
            // خصم الراتب من الرصيد
            appData.balance -= employee.salary;

            // تسجيل المعاملة
            const newTransaction = {
                id: generateId(),
                type: 'expense',
                amount: employee.salary,
                description: `راتب ${employee.name}`,
                category: 'salary',
                date: new Date().toISOString().split('T')[0],
                employeeId: employee.id
            };

            appData.transactions.push(newTransaction);
            saveData();
        }
    }

    // حذف موظف
    function deleteEmployee(id) {
        if (confirm('هل أنت متأكد من حذف هذا الموظف؟ سيتم حذف جميع المهام والمدفوعات المرتبطة به.')) {
            appData.employees = appData.employees.filter(e => e.id !== id);
            appData.tasks = appData.tasks.filter(t => t.employeeId !== id);
            saveData();
        }
    }

    // توليد معرف فريد
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // تنسيق التاريخ
    function formatDate(dateString) {
        if (!dateString) return '-';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('ar-EG', options);
    }

    // الحصول على نص الحالة
    function getStatusText(status) {
        const statusMap = {
            'active': 'نشط',
            'completed': 'مكتمل',
            'on-hold': 'معلق'
        };
        return statusMap[status] || status;
    }

    // الحصول على تاريخ آخر دفعة للموظف
    function getLastPaymentDate(employeeId) {
        const payments = appData.transactions
            .filter(t => t.type === 'expense' && t.category === 'salary' && t.employeeId === employeeId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return payments.length > 0 ? formatDate(payments[0].date) : 'لم يتم الدفع بعد';
    }

    // فتح نافذة إضافة دخل
    document.getElementById('addIncomeBtn').addEventListener('click', function() {
        document.getElementById('incomeModal').style.display = 'block';
        populateProjectsDropdown('incomeProject');
    });

    // فتح نافذة إضافة مصروف
    document.getElementById('addExpenseBtn').addEventListener('click', function() {
        document.getElementById('expenseModal').style.display = 'block';
        populateProjectsDropdown('expenseProject');
        populateEmployeesDropdown('expenseEmployee');
    });

    // فتح نافذة إضافة مشروع
    document.getElementById('addProjectBtn').addEventListener('click', function() {
        document.getElementById('projectModalTitle').textContent = 'إضافة مشروع جديد';
        document.getElementById('projectId').value = '';
        document.getElementById('projectForm').reset();
        document.getElementById('projectModal').style.display = 'block';
    });

    // فتح نافذة إضافة موظف
    document.getElementById('addEmployeeBtn').addEventListener('click', function() {
        document.getElementById('employeeModalTitle').textContent = 'إضافة موظف جديد';
        document.getElementById('employeeId').value = '';
        document.getElementById('employeeForm').reset();
        document.getElementById('employeeModal').style.display = 'block';
    });

    // فتح نافذة إضافة مهمة
    document.getElementById('newTaskBtn').addEventListener('click', function() {
        document.getElementById('taskModalTitle').textContent = 'تعيين مهمة جديدة';
        document.getElementById('taskId').value = '';
        document.getElementById('taskForm').reset();
        populateEmployeesDropdown('taskEmployee');
        populateProjectsDropdown('taskProject');
        document.getElementById('taskModal').style.display = 'block';
    });

    // تعبئة قائمة المشاريع في القائمة المنسدلة
    function populateProjectsDropdown(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        dropdown.innerHTML = '<option value="">لا يوجد</option>';
        
        appData.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            dropdown.appendChild(option);
        });
    }

    // تعبئة قائمة الموظفين في القائمة المنسدلة
    function populateEmployeesDropdown(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        dropdown.innerHTML = '<option value="">لا يوجد</option>';
        
        appData.employees.forEach(employee => {
            const option = document.createElement('option');
            option.value = employee.id;
            option.textContent = employee.name;
            dropdown.appendChild(option);
        });
    }

    // إغلاق النوافذ المنبثقة
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // إغلاق النوافذ المنبثقة عند النقر خارجها
    window.addEventListener('click', function(event) {
        if (event.target.className === 'modal') {
            event.target.style.display = 'none';
        }
    });

    // إرسال نموذج الدخل
    document.getElementById('incomeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const amount = parseFloat(document.getElementById('incomeAmount').value);
        const source = document.getElementById('incomeSource').value;
        const projectId = document.getElementById('incomeProject').value;
        const date = document.getElementById('incomeDate').value;
        const notes = document.getElementById('incomeNotes').value;
        
        const newIncome = {
            id: generateId(),
            type: 'income',
            amount: amount,
            description: source,
            date: date,
            projectId: projectId || null,
            notes: notes
        };
        
        appData.transactions.push(newIncome);
        appData.balance += amount;
        
        saveData();
        document.getElementById('incomeModal').style.display = 'none';
        this.reset();
    });

    // إرسال نموذج المصروفات
    document.getElementById('expenseForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const category = document.getElementById('expenseCategory').value;
        const description = document.getElementById('expenseDescription').value;
        const projectId = document.getElementById('expenseProject').value;
        const date = document.getElementById('expenseDate').value;
        const employeeId = document.getElementById('expenseEmployee').value;
        
        if (category === 'salary' && !employeeId) {
            alert('يجب اختيار موظف عند تسجيل مصروف راتب');
            return;
        }
        
        const newExpense = {
            id: generateId(),
            type: 'expense',
            amount: amount,
            category: category,
            description: description,
            date: date,
            projectId: projectId || null,
            employeeId: category === 'salary' ? employeeId : null
        };
        
        appData.transactions.push(newExpense);
        appData.balance -= amount;
        
        saveData();
        document.getElementById('expenseModal').style.display = 'none';
        this.reset();
    });

    // إرسال نموذج المشروع
    document.getElementById('projectForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const projectId = document.getElementById('projectId').value;
        const name = document.getElementById('projectName').value;
        const client = document.getElementById('projectClient').value;
        const budget = parseFloat(document.getElementById('projectBudget').value) || 0;
        const startDate = document.getElementById('projectStartDate').value;
        const endDate = document.getElementById('projectEndDate').value;
        const status = document.getElementById('projectStatus').value;
        const notes = document.getElementById('projectNotes').value;
        
        const projectData = {
            id: projectId || generateId(),
            name: name,
            client: client,
            budget: budget,
            startDate: startDate,
            endDate: endDate,
            status: status,
            notes: notes
        };
        
        if (projectId) {
            // تحديث المشروع الموجود
            const index = appData.projects.findIndex(p => p.id === projectId);
            if (index !== -1) {
                appData.projects[index] = projectData;
            }
        } else {
            // إضافة مشروع جديد
            appData.projects.push(projectData);
        }
        
        saveData();
        document.getElementById('projectModal').style.display = 'none';
        this.reset();
    });

    // إرسال نموذج الموظف
    document.getElementById('employeeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const employeeId = document.getElementById('employeeId').value;
        const name = document.getElementById('employeeName').value;
        const position = document.getElementById('employeePosition').value;
        const salary = parseFloat(document.getElementById('employeeSalary').value);
        const email = document.getElementById('employeeEmail').value;
        const phone = document.getElementById('employeePhone').value;
        const hireDate = document.getElementById('employeeHireDate').value;
        const type = document.getElementById('employeeType').value;
        
        const employeeData = {
            id: employeeId || generateId(),
            name: name,
            position: position,
            salary: salary,
            email: email,
            phone: phone,
            hireDate: hireDate,
            type: type
        };
        
        if (employeeId) {
            // تحديث الموظف الموجود
            const index = appData.employees.findIndex(e => e.id === employeeId);
            if (index !== -1) {
                appData.employees[index] = employeeData;
            }
        } else {
            // إضافة موظف جديد
            appData.employees.push(employeeData);
        }
        
        saveData();
        document.getElementById('employeeModal').style.display = 'none';
        this.reset();
    });

    // إرسال نموذج المهمة
    document.getElementById('taskForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const taskId = document.getElementById('taskId').value;
        const employeeId = document.getElementById('taskEmployee').value;
        const projectId = document.getElementById('taskProject').value || null;
        const description = document.getElementById('taskDescription').value;
        const amount = parseFloat(document.getElementById('taskAmount').value);
        const dueDate = document.getElementById('taskDueDate').value;
        const status = document.getElementById('taskStatus').value;
        
        const taskData = {
            id: taskId || generateId(),
            employeeId: employeeId,
            projectId: projectId,
            description: description,
            amount: amount,
            dueDate: dueDate,
            status: status,
            assignedDate: new Date().toISOString().split('T')[0]
        };
        
        if (taskId) {
            // تحديث المهمة الموجودة
            const index = appData.tasks.findIndex(t => t.id === taskId);
            if (index !== -1) {
                appData.tasks[index] = taskData;
            }
        } else {
            // إضافة مهمة جديدة
            appData.tasks.push(taskData);
        }
        
        saveData();
        document.getElementById('taskModal').style.display = 'none';
        this.reset();
    });

    // فتح نافذة تعديل المشروع
    function openEditProjectModal(projectId) {
        const project = appData.projects.find(p => p.id === projectId);
        if (!project) return;
        
        document.getElementById('projectModalTitle').textContent = 'تعديل المشروع';
        document.getElementById('projectId').value = project.id;
        document.getElementById('projectName').value = project.name;
        document.getElementById('projectClient').value = project.client || '';
        document.getElementById('projectBudget').value = project.budget || '';
        document.getElementById('projectStartDate').value = project.startDate || '';
        document.getElementById('projectEndDate').value = project.endDate || '';
        document.getElementById('projectStatus').value = project.status;
        document.getElementById('projectNotes').value = project.notes || '';
        
        document.getElementById('projectModal').style.display = 'block';
    }

    // فتح نافذة تعديل الموظف
    function openEditEmployeeModal(employeeId) {
        const employee = appData.employees.find(e => e.id === employeeId);
        if (!employee) return;
        
        document.getElementById('employeeModalTitle').textContent = 'تعديل بيانات الموظف';
        document.getElementById('employeeId').value = employee.id;
        document.getElementById('employeeName').value = employee.name;
        document.getElementById('employeePosition').value = employee.position;
        document.getElementById('employeeSalary').value = employee.salary;
        document.getElementById('employeeEmail').value = employee.email || '';
        document.getElementById('employeePhone').value = employee.phone || '';
        document.getElementById('employeeHireDate').value = employee.hireDate || '';
        document.getElementById('employeeType').value = employee.type || 'permanent';
        
        document.getElementById('employeeModal').style.display = 'block';
    }

    // تطبيق الفلاتر على المعاملات
    document.getElementById('applyFiltersBtn').addEventListener('click', function() {
        const type = document.getElementById('transactionTypeFilter').value;
        const date = document.getElementById('transactionDateFilter').value;
        updateTransactionsList(type, date);
    });

    // إعادة تعيين الفلاتر
    document.getElementById('resetFiltersBtn').addEventListener('click', function() {
        document.getElementById('transactionTypeFilter').value = 'all';
        document.getElementById('transactionDateFilter').value = '';
        updateTransactionsList();
    });

    // تبديل بين التبويبات
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // إزالة التنشيط من جميع الأزرار
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            // إضافة التنشيط للزر الحالي
            this.classList.add('active');
            
            // إخفاء جميع محتويات التبويبات
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // إظهار محتوى التبويب المحدد
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // تحميل البيانات عند بدء التشغيل
    loadData();
});