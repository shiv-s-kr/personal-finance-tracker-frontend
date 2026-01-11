// income.js - COMPLETE SOLUTION
const API_BASE = 'https://personal-finance-tracker-seven-gilt.vercel.app/api/v1/income';
let allIncomes = [];
let editMode = false;
let editingIncomeId = null;
const userData = localStorage.getItem('user');
const user = JSON.parse(userData);
let currentUserId = user.id || 1;
let currentPage = 1;
let totalPages = 1;
let currentLimit = 10;


// DOM Elements
const elements = {
    source: document.getElementById('income-source'),
    amount: document.getElementById('income-amount'),
    frequency: document.getElementById('income-frequency'),
    date: document.getElementById('income-date'),
    desc: document.getElementById('income-desc'),
    successMsg: document.getElementById('success-msg'),
    search: document.getElementById('search'),
    filterSource: document.getElementById('filter-source'),
    startDate: document.getElementById('start-date'),
    endDate: document.getElementById('end-date'),
    tableBody: document.querySelector('#income-table tbody')
};

const addIncomeBtn = document.querySelector('#add-income-form button');

// ========== UTILITY FUNCTIONS ==========
const validateForm = () => {
    const source = elements.source.value.trim();
    const amount = parseFloat(elements.amount.value);
    const frequency = elements.frequency.value.trim();
    const date = elements.date.value;

    if (!source) return 'Please select income source';
    if (isNaN(amount) || amount <= 0) return 'Enter valid positive amount';
    if (!frequency) return 'Please select frequency';
    if (!date) return 'Please select date';

    return null;
};

const showMessage = (message, isSuccess = false) => {
    elements.successMsg.textContent = message;
    elements.successMsg.className = isSuccess ? 'success' : 'error';
    setTimeout(() => elements.successMsg.textContent = '', 4000);
};

const resetForm = () => {
    elements.source.value = '';
    elements.amount.value = '';
    elements.frequency.value = '';
    elements.desc.value = '';
};

// ========== API FUNCTIONS ==========
async function fetchIncomes(page = 1, limit = 10) {
    try {
        const params = new URLSearchParams({ page, limit });
        const response = await fetch(`${API_BASE}?${params}`);
        const result = await response.json();
        return result.success ? result : { data: [], pagination: {} };
    } catch (error) {
        console.error('Fetch error:', error);
        return { data: [], pagination: {} };
    }
}

async function createIncome(data) {
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        throw new Error('Network error');
    }
}

async function updateIncomeAPI(id, data) {
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        throw new Error('Network error');
    }
}

async function deleteIncomeAPI(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE'
        });
        return await response.json();
    } catch (error) {
        throw new Error('Network error');
    }
}

// ========== CRUD OPERATIONS ==========
async function addIncome() {
    if (editMode) return updateIncome();

    const error = validateForm();
    if (error) return showMessage(error, false);

    const incomeData = {
        user_id: currentUserId,
        source: elements.source.value,
        amount: parseFloat(elements.amount.value),
        frequency: elements.frequency.value,
        date: elements.date.value,
        description : elements.desc.value
    };

    try {
        const result = await createIncome(incomeData);
        if (result.success) {
            showMessage('Income added successfully!', true);
            resetForm();
            renderIncome();
        } else {
            showMessage(result.error || 'Failed to add income', false);
        }
    } catch (error) {
        showMessage(error.message, false);
    }
}

async function updateIncome() {
    const error = validateForm();
    if (error) return showMessage(error, false);

    const incomeData = {
        user_id: currentUserId,
        source: elements.source.value,
        amount: parseFloat(elements.amount.value),
        frequency: elements.frequency.value,
        date: elements.date.value,
        description: elements.desc.value
    };

    try {
        const result = await updateIncomeAPI(editingIncomeId, incomeData);
        if (result.success) {
            showMessage('Income updated successfully!', true);
            editMode = false;
            editingIncomeId = "";
            addIncomeBtn.textContent = 'Add Income';
            resetForm();
            exitEditMode();
            renderIncome();
        } else {
            showMessage(result.error || 'Update failed', false);
        }
    } catch (error) {
        showMessage(error.message, false);
    }
}

function editIncome(id) {
    const income = allIncomes.find(i => i.id == id);
    if (!income) return showMessage('Income not found', false);

    // Populate ALL form fields
    elements.source.value = income.source || '';
    elements.amount.value = income.amount || '';
    elements.frequency.value = income.frequency || '';
    elements.desc.value = income.description || '';

    // Scroll to form
    document.querySelector('#add-income-form').scrollIntoView({ behavior: 'smooth' });

    // Enter EDIT MODE
    editMode = true;
    editingIncomeId = id;
    addIncomeBtn.textContent = 'Update Income';
    addIncomeBtn.onclick = updateIncome;


    showMessage('Edit mode - Update or Cancel', true);

}

function exitEditMode() {
    const confirmExit = !editMode;

    if (!confirmExit) return;

    addIncomeBtn.textContent = 'Add Income';
    addIncomeBtn.onclick = addIncome;
    editMode = false;
    editingIncomeId = null;
    resetForm();
}

async function deleteIncome(id) {
    if (editMode && editingIncomeId !== id) {
        const confirmExit = confirm("Exit edit mode first?");
        if (!confirmExit) return;
        exitEditMode();
    }

    if (!confirm('Delete this income?')) return;

    try {
        const result = await deleteIncomeAPI(id);
        if (result.success) {
            showMessage('Income deleted!', true);
            renderIncome();
        } else {
            showMessage(result.error || 'Delete failed', false);
        }
    } catch (error) {
        showMessage(error.message, false);
    }
}

// ========== RENDER & FILTERING ==========
function filterIncomes(incomes) {
    const search = elements.search.value.toLowerCase();
    const sourceFilter = elements.filterSource.value;
    const startDate = elements.startDate.value;
    const endDate = elements.endDate.value;

    return incomes.filter(income => {
        const matchesSearch = !search ||
            (income.source && income.source.toLowerCase().includes(search));
        const matchesSource = !sourceFilter || income.source === sourceFilter;
        const incomeDate = income.date || '';
        const matchesDateRange =
            (!startDate || incomeDate >= startDate) &&
            (!endDate || incomeDate <= endDate);

        return matchesSearch && matchesSource && matchesDateRange;
    });
}

async function renderIncome() {
    try {
        const result = await fetchIncomes(currentPage, currentLimit);
        allIncomes = result.data || [];
        const pagination = result.pagination || {};
        
        // Update DOM pagination elements (create if not exist)
        let pageInfo = document.getElementById('page-info');
        let pageSummary = document.getElementById('page-summary');
        let prevBtn = document.getElementById('prev-btn');
        let nextBtn = document.getElementById('next-btn');
        
        if (!pageInfo) {
            const paginationDiv = document.createElement('div');
            paginationDiv.className = 'pagination-controls';
            paginationDiv.style.cssText = 'margin-top:20px;text-align:center;padding:15px;';
            paginationDiv.innerHTML = `
                <button id="prev-btn" style="padding:8px 16px;margin:0 5px;border:1px solid #ddd;background:white; color:black; border-radius:4px;cursor:pointer;">Previous</button>
                <span id="page-info" style="margin:0 15px;font-weight:bold;font-size:16px;"></span>
                <button id="next-btn" style="padding:8px 16px;margin:0 5px;border:1px solid #ddd;background:white;  color:black; border-radius:4px;cursor:pointer;">Next</button>
                <span id="page-summary" style="margin-left:20px;color:#666;"></span>
            `;
            elements.tableBody.parentNode.parentNode.appendChild(paginationDiv);
            pageInfo = document.getElementById('page-info');
            pageSummary = document.getElementById('page-summary');
            prevBtn = document.getElementById('prev-btn');
            nextBtn = document.getElementById('next-btn');
        }
        
        // Update page info
        pageInfo.textContent = `Page ${pagination.page || currentPage}`;
        pageSummary.textContent = `Showing ${allIncomes.length} of ${pagination.total || 0} records`;
        
        // Update buttons
        prevBtn.disabled = (pagination.page || currentPage) <= 1;
        nextBtn.disabled = (pagination.page || currentPage) >= (pagination.total_pages || 1);
        prevBtn.onclick = () => changePage(-1);
        nextBtn.onclick = () => changePage(1);
        
        // Render table
        const filtered = filterIncomes(allIncomes);
        elements.tableBody.innerHTML = filtered.map(income => `
            <tr>
                <td>${income.date || 'N/A'}</td>
                <td>${income.source || 'N/A'}</td>
                <td>₹${parseFloat(income.amount || 0).toLocaleString()}</td>
                <td>${income.frequency || 'N/A'}</td>
                <td>${income.description || 'N/A'}</td>
                <td>
                    <button onclick="editIncome(${income.id})" class="btn-edit">Edit</button>
                    <button onclick="deleteIncome(${income.id})" class="btn-delete">Delete</button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="7" style="text-align:center">No incomes found</td></tr>';
        
    } catch (error) {
        console.error('Render error:', error);
    }
}

function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage >= 1) {
        currentPage = newPage;
        renderIncome();
    }
}


// ========== EVENT LISTENERS ==========
document.addEventListener('DOMContentLoaded', () => {
    // Set default date
    elements.date.valueAsDate = new Date();

    // Load initial data
    renderIncome();

    // Real-time filtering
    elements.search.addEventListener('input', () => { currentPage = 1; renderIncome(); });
    elements.filterSource.addEventListener('change', () => { currentPage = 1; renderIncome(); });
    elements.startDate.addEventListener('change', () => { currentPage = 1; renderIncome(); });
    elements.endDate.addEventListener('change', () => { currentPage = 1; renderIncome(); });
    // Enter key support
    elements.amount.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (editMode) updateIncome();
            else addIncome();
        }
    });

    // Click outside to cancel edit
    document.addEventListener('click', (e) => {
        if (editMode && !e.target.closest('#add-income-form')) {
            exitEditMode();
        }
    });
});
