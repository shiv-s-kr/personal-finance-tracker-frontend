// budget.js - COMPLETE IMPLEMENTATION
const baseUrl = "http://localhost:8080"
const BUDGET_API = baseUrl+'/api/v1/budgets';
let allBudgets = [];
const userData = localStorage.getItem('user');
const user = JSON.parse(userData);
let currentUserId = user.id || 1;
let editingBudgetId = null;

const elements = {
    category: document.getElementById('category'),
    amount: document.getElementById('amount'),
    successMsg: document.getElementById('success-msg'),
    budgetList: document.getElementById('budget-list')
};

const saveBtn = document.querySelector('#budget-form button');

// ========== UTILITY FUNCTIONS ==========
const validateBudget = () => {
    const category = elements.category.value.trim();
    const amount = parseFloat(elements.amount.value);
    
    if (!category) {
        return 'Please select a category';
    }
    if (isNaN(amount) || amount < 0) {
        return 'Please enter a valid amount (0 or positive)';
    }
    return null;
};

const showMessage = (message, isSuccess = false) => {
    elements.successMsg.textContent = message;
    elements.successMsg.className = isSuccess ? 'success' : 'error';
    elements.successMsg.style.display = 'block';
    setTimeout(() => {
        elements.successMsg.textContent = '';
        elements.successMsg.style.display = 'none';
    }, 4000);
};

const resetForm = () => {
    elements.category.value = '';
    elements.amount.value = '';
    saveBtn.textContent = 'Save Budget';
    editingBudgetId = null;
};

// ========== API FUNCTIONS ==========
async function fetchBudgets() {
    try {
        const params = new URLSearchParams({ user_id: currentUserId });
        const response = await fetch(`${BUDGET_API}?${params}`);
        const result = await response.json();
        return result.success ? result.data || [] : [];
    } catch (error) {
        console.error('Fetch budgets error:', error);
        showMessage('Failed to load budgets', false);
        return [];
    }
}

async function saveBudgetAPI(budgetData) {
    try {
        const response = await fetch(BUDGET_API, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(budgetData)
        });
        return await response.json();
    } catch (error) {
        console.error('Save budget error:', error);
        throw new Error('Network error. Please try again.');
    }
}

async function deleteBudgetAPI(id) {
    try {
        const params = new URLSearchParams({ user_id: currentUserId });
        const response = await fetch(`${BUDGET_API}/${id}?${params}`, {
            method: 'DELETE'
        });
        return await response.json();
    } catch (error) {
        console.error('Delete budget error:', error);
        throw new Error('Network error. Please try again.');
    }
}

// ========== CORE FUNCTIONS ==========
async function saveBudget() {
    const validationError = validateBudget();
    if (validationError) {
        return showMessage(validationError, false);
    }

    // Generate current month (YYYY-MM)
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const budgetData = {
        user_id: currentUserId,
        category: elements.category.value,
        amount: parseFloat(elements.amount.value),
        budget_month: currentMonth
    };

    try {
        const result = await saveBudgetAPI(budgetData);
        
        if (result.success) {
            showMessage(result.message || `Budget for ${currentMonth} saved successfully!`, true);
            resetForm();
            await renderBudgets(); // Refresh list
        } else {
            showMessage(result.error || 'Failed to save budget', false);
        }
    } catch (error) {
        showMessage(error.message, false);
    }
}

function editBudget(id) {
    const budget = allBudgets.find(b => b.id == id);
    if (!budget) {
        return showMessage('Budget not found', false);
    }

    // Populate form
    elements.category.value = budget.category || '';
    elements.amount.value = budget.amount || '';
    
    // Enter edit mode
    editingBudgetId = id;
    saveBtn.textContent = 'Update Budget';
    
    // Scroll to form
    document.querySelector('#budget-form').scrollIntoView({ behavior: 'smooth' });
    showMessage('Edit mode: Update or reset form', true);
}

async function deleteBudget(id) {
    if (!confirm(`Delete ${allBudgets.find(b => b.id == id)?.category} budget?`)) {
        return;
    }

    try {
        const result = await deleteBudgetAPI(id);
        
        if (result.success) {
            showMessage(result.message || 'Budget deleted successfully!', true);
            await renderBudgets(); // Refresh list
        } else {
            showMessage(result.error || 'Failed to delete budget', false);
        }
    } catch (error) {
        showMessage(error.message, false);
    }
}

// ========== RENDER BUDGETS ==========
async function renderBudgets() {
    try {
        allBudgets = await fetchBudgets();
        
        if (!allBudgets || allBudgets.length === 0) {
            elements.budgetList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <p>No budgets set yet</p>
                    <p style="font-size: 14px;">Set your first budget above 👆</p>
                </div>
            `;
            return;
        }

        // Format month names
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        elements.budgetList.innerHTML = `
            <div style="display: grid; 
                       grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
                       gap: 20px; 
                       margin-top: 20px;">
                ${allBudgets.map(budget => {
                    const [year, month] = (budget.budget_month || '').split('-');
                    const monthName = monthNames[parseInt(month) - 1] || month;
                    
                    return `
                    <div style="border: 1px solid #ddd; 
                               padding: 25px; 
                               border-radius: 12px; 
                               background: linear-gradient(135deg, #f8f9ff 0%, #e8f4f8 100%);
                               box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                               transition: transform 0.2s ease;">
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h4 style="margin: 0; color: #2c3e50; font-size: 20px; font-weight: 600;">
                                ${budget.category}
                            </h4>
                            <span style="background: #3498db; color: white; padding: 4px 12px; 
                                        border-radius: 20px; font-size: 12px; font-weight: 500;">
                                ${monthName} ${year}
                            </span>
                        </div>
                        
                        <div style="font-size: 32px; font-weight: bold; color: #e74c3c; 
                                   margin: 10px 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">
                            ₹${parseFloat(budget.amount || 0).toLocaleString('en-IN')}
                        </div>
                        
                        <div style="margin-top: 20px; display: flex; gap: 10px;">
                            <button onclick="editBudget(${budget.id})" 
                                    style="flex: 1; 
                                           background: linear-gradient(45deg, #3498db, #2980b9);
                                           color: white; 
                                           padding: 10px 16px; 
                                           border: none; 
                                           border-radius: 8px; 
                                           cursor: pointer; 
                                           font-weight: 500;
                                           transition: all 0.2s ease;">
                                ✏️ Edit
                            </button>
                            <button onclick="deleteBudget(${budget.id})" 
                                    style="flex: 1; 
                                           background: linear-gradient(45deg, #e74c3c, #c0392b);
                                           color: white; 
                                           padding: 10px 16px; 
                                           border: none; 
                                           border-radius: 8px; 
                                           cursor: pointer; 
                                           font-weight: 500;
                                           transition: all 0.2s ease;">
                                🗑️ Delete
                            </button>
                        </div>
                        
                        <div style="margin-top: 12px; font-size: 12px; color: #7f8c8d;">
                            Created: ${budget.created_date || 'Just now'}
                        </div>
                    </div>
                `}).join('')}
            </div>
        `;
        
    } catch (error) {
        console.error('Render budgets error:', error);
        elements.budgetList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #e74c3c;">
                <p>❌ Error loading budgets</p>
                <p style="font-size: 14px;">Please refresh the page</p>
            </div>
        `;
    }
}

// ========== EVENT LISTENERS ==========
document.addEventListener('DOMContentLoaded', function() {
    // Set initial state
    elements.successMsg.style.display = 'none';
    
    // Load budgets on page load
    renderBudgets();
    
    // Enter key support for amount field
    elements.amount.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveBudget();
        }
    });
    
    // Category change - reset edit mode
    elements.category.addEventListener('change', function() {
        if (editingBudgetId) {
            if (confirm('Switching category will exit edit mode. Continue?')) {
                resetForm();
            }
        }
    });
    
    // Click outside form to exit edit mode
    document.addEventListener('click', function(e) {
        if (editingBudgetId && 
            !e.target.closest('#budget-form') && 
            !e.target.closest('[onclick*="editBudget"]')) {
            if (confirm('Exit edit mode? Changes will be lost.')) {
                resetForm();
            }
        }
    });
});

// Make functions globally available for onclick handlers
window.saveBudget = saveBudget;
window.editBudget = editBudget;
window.deleteBudget = deleteBudget;
window.renderBudgets = renderBudgets;
