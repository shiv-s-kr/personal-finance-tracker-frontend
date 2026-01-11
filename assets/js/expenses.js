// expenses.js - COMPLETE CRUD
const EXPENSE_API = 'http://localhost:8080/api/v1/expenses';
let allExpenses = [];
let editMode = false;
let editingExpenseId = null;
const userData = localStorage.getItem('user');
const user = JSON.parse(userData);
let currentUserId = user.id || 1;

let currentPage = 1;
let totalPages = 1;
let currentLimit = 10;

const elements = {
    amount: document.getElementById('expense-amount'),
    category: document.getElementById('expense-category'),
    date: document.getElementById('expense-date'),
    desc: document.getElementById('expense-desc'),
    successMsg: document.getElementById('success-msg'),
    search: document.getElementById('search'),
    filterCategory: document.getElementById('filter-category'),
    startDate: document.getElementById('start-date'),
    endDate: document.getElementById('end-date'),
    tableBody: document.querySelector('#expense-table tbody')
};

const addExpenseBtn = document.querySelector('#add-expense-form button');

// ========== UTILS ==========
const validateForm = () => {
    const amount = parseFloat(elements.amount.value);
    const category = elements.category.value.trim();
    const date = elements.date.value;
    if (isNaN(amount) || amount <= 0) return 'Valid amount required';
    if (!category) return 'Select category';
    if (!date) return 'Select date';
    return null;
};

const showMessage = (message, isSuccess = false) => {
    elements.successMsg.textContent = message;
    elements.successMsg.className = isSuccess ? 'success' : 'error';
    setTimeout(() => elements.successMsg.textContent = '', 3000);
};

const resetForm = () => {
    elements.amount.value = '';
    elements.category.value = '';
    elements.date.value = '';
    elements.desc.value = '';
};

// ========== API CALLS ==========
async function fetchExpenses(page = 1, limit = 10) {
    try {
        const params = new URLSearchParams({ page, limit, user_id: currentUserId });
        const response = await fetch(`${EXPENSE_API}?${params}`);
        const result = await response.json();
        return result.success ? result : { data: [], pagination: {} };
    } catch (error) {
        console.error('Fetch error:', error);
        return { data: [], pagination: {} };
    }
}

// ========== CRUD ==========
async function addExpense() {
    if (editMode) return updateExpense();

    const error = validateForm();
    if (error) return showMessage(error, false);

    const expenseData = {
        user_id: currentUserId,
        amount: parseFloat(elements.amount.value),
        category: elements.category.value,
        date: elements.date.value,
        description: elements.desc.value
    };

    try {
        const response = await fetch(EXPENSE_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expenseData)
        });
        const result = await response.json();
        
        if (result.success) {
            showMessage('Expense added!', true);
            resetForm();
            renderExpenses();
        } else {
            showMessage(result.error, false);
        }
    } catch (error) {
        showMessage('Network error', false);
    }
}

function editExpense(id) {
    const expense = allExpenses.find(e => e.id == id);
    if (!expense) return showMessage('Expense not found', false);

    elements.amount.value = expense.amount;
    elements.category.value = expense.category;
    elements.date.value = expense.date;
    elements.desc.value = expense.description || '';

    editMode = true;
    editingExpenseId = id;
    addExpenseBtn.textContent = 'Update Expense';
    addExpenseBtn.onclick = updateExpense;
    
    document.querySelector('#add-expense-form').scrollIntoView();
    showMessage('Edit mode activated', true);
}

async function updateExpense() {
    const error = validateForm();
    if (error) return showMessage(error, false);

    const expenseData = {
        user_id: currentUserId,
        amount: parseFloat(elements.amount.value),
        category: elements.category.value,
        date: elements.date.value,
        description: elements.desc.value
    };

    try {
        const response = await fetch(`${EXPENSE_API}/${editingExpenseId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expenseData)
        });
        const result = await response.json();
        
        if (result.success) {
            showMessage('Expense updated!', true);
            exitEditMode();
            renderExpenses();
        } else {
            showMessage(result.error, false);
        }
    } catch (error) {
        showMessage('Network error', false);
    }
}

function exitEditMode() {
    if (editMode && !confirm('Exit edit mode?')) return;
    editMode = false;
    editingExpenseId = null;
    addExpenseBtn.textContent = 'Add Expense';
    addExpenseBtn.onclick = addExpense;
    resetForm();
}

async function deleteExpense(id) {
    if (!confirm('Delete this expense?')) return;
    try {
        const response = await fetch(`${EXPENSE_API}/${id}?user_id=${currentUserId}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
            showMessage('Expense deleted!', true);
            renderExpenses();
        }
    } catch (error) {
        showMessage('Network error', false);
    }
}

// ========== RENDERING ==========
function filterExpenses(expenses) {
    const search = elements.search.value.toLowerCase();
    const categoryFilter = elements.filterCategory.value;
    const startDate = elements.startDate.value;
    const endDate = elements.endDate.value;

    return expenses.filter(expense => {
        const matchesSearch = !search || 
            (expense.description && expense.description.toLowerCase().includes(search));
        const matchesCategory = !categoryFilter || expense.category === categoryFilter;
        const matchesDate = (!startDate || expense.date >= startDate) && 
                           (!endDate || expense.date <= endDate);
        return matchesSearch && matchesCategory && matchesDate;
    });
}

async function renderExpenses() {
    try {
        const result = await fetchExpenses(currentPage, currentLimit);
        allExpenses = result.data || [];
        const pagination = result.pagination || {};

        // Auto-create pagination
        let paginationDiv = document.querySelector('.pagination-controls');
        if (!paginationDiv) {
            paginationDiv = document.createElement('div');
            paginationDiv.className = 'pagination-controls';
            paginationDiv.style.cssText = 'margin-top:20px;text-align:center;padding:15px;';
            document.querySelector('#expense-table').parentNode.appendChild(paginationDiv);
        }

        paginationDiv.innerHTML = `
            <button id="prev-expense" style="padding:8px 16px;margin:0 5px;border:1px solid #ddd;background:white; color:black; border-radius:4px;cursor:pointer;" ${currentPage <= 1 ? 'disabled' : ''}>Previous</button>
            <span id="expense-page-info" style="margin:0 15px;font-weight:bold;font-size:16px;">Page ${currentPage}</span>
            <button id="next-expense" style="padding:8px 16px;margin:0 5px;border:1px solid #ddd;background:white;color:black; border-radius:4px;cursor:pointer;" ${currentPage >= (pagination.total_pages || 1) ? 'disabled' : ''}>Next</button>
            <span style="margin-left:20px;color:#666;">Showing ${allExpenses.length} of ${pagination.total || 0}</span>
        `;

        document.getElementById('prev-expense').onclick = () => changeExpensePage(-1);
        document.getElementById('next-expense').onclick = () => changeExpensePage(1);

        const filtered = filterExpenses(allExpenses);
        elements.tableBody.innerHTML = filtered.map(expense => `
            <tr>
                <td>${expense.date || 'N/A'}</td>
                <td>${expense.category || 'N/A'}</td>
                <td>₹${parseFloat(expense.amount || 0).toLocaleString()}</td>
                <td>${expense.description || 'N/A'}</td>
                <td>
                    <button onclick="editExpense(${expense.id})" class="btn-edit">Edit</button>
                    <button onclick="deleteExpense(${expense.id})" class="btn-delete">Delete</button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="5" style="text-align:center">No expenses</td></tr>';
    } catch (error) {
        console.error('Render error:', error);
    }
}

function changeExpensePage(direction) {
    const newPage = currentPage + direction;
    if (newPage >= 1) {
        currentPage = newPage;
        renderExpenses();
    }
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
    elements.date.valueAsDate = new Date();
    renderExpenses();
    
    elements.search.addEventListener('input', () => { currentPage = 1; renderExpenses(); });
    elements.filterCategory.addEventListener('change', () => { currentPage = 1; renderExpenses(); });
    elements.startDate.addEventListener('change', () => { currentPage = 1; renderExpenses(); });
    elements.endDate.addEventListener('change', () => { currentPage = 1; renderExpenses(); });
});
