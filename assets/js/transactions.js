// transactions.js - SIMPLIFIED VERSION
const TRANSACTIONS_API = 'https://personal-finance-tracker-seven-gilt.vercel.app/api/v1/transactions';
let allTransactions = [];
let currentPage = 1;
const userData = localStorage.getItem('user');
const user = JSON.parse(userData);
let currentUserId = user.id || 1;
console.log(currentUserId)
const elements = {
    tableBody: document.querySelector('#transaction-table tbody'),
    pagination: document.getElementById('pagination')
};

function setView(viewType) {
    document.querySelectorAll('.toggle-buttons button').forEach(btn => {
        btn.style.background = btn.textContent.includes(viewType) ? '#3498db' : '#f8f9fa';
        btn.style.color = btn.textContent.includes(viewType) ? 'white' : '#333';
    });
    renderTransactions();
}

async function renderTransactions() {
    try {
        const params = new URLSearchParams({
            user_id:currentUserId,
            page: currentPage,
            limit: 20
        });

        const response = await fetch(`${TRANSACTIONS_API}?${params}`);
        const result = await response.json();
        
        allTransactions = result.success ? result.data : [];
        const pagination = result.pagination || {};
        
        renderTable(allTransactions);
        renderPagination(pagination);
        
    } catch (error) {
        console.error('Fetch error:', error);
        elements.tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red">Error loading data</td></tr>';
    }
}

function renderTable(transactions) {
    if (!transactions || transactions.length === 0) {
        elements.tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:#666">No transactions found</td></tr>';
        return;
    }

    elements.tableBody.innerHTML = transactions.map(t => {
        const isIncome = t.type === 'income';
        return `
            <tr>
                <td>${t.date || 'N/A'}</td>
                <td>${isIncome ? '💰 Income' : '💸 Expense'}</td>
                <td>${t.category || 'N/A'}</td>
                <td style="color:${isIncome ? '#28a745' : '#dc3545'};font-weight:bold;">
                    ${isIncome ? '+' : '-'}₹${Math.abs(parseFloat(t.amount || 0)).toLocaleString()}
                </td>
                <td>${t.description || '-'}</td>
            </tr>
        `;
    }).join('');
}

function renderPagination(pagination) {
    elements.pagination.innerHTML = `
        <div style="text-align:center;padding:20px;">
            <button onclick="changePage(-1)" ${currentPage <= 1 ? 'disabled' : ''}>← Previous</button>
            <span style="margin:0 20px;font-weight:bold;">Page ${pagination.page || 1} of ${pagination.total_pages || 1}</span>
            <button onclick="changePage(1)" ${currentPage >= (pagination.total_pages || 1) ? 'disabled' : ''}>Next →</button>
            <div style="margin-top:10px;color:#666;">${allTransactions.length} of ${pagination.total || 0} transactions</div>
        </div>
    `;
}

function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage >= 1) {
        currentPage = newPage;
        renderTransactions();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderTransactions();
    
    window.setView = setView;
    window.renderTransactions = renderTransactions;
    window.changePage = changePage;
});
