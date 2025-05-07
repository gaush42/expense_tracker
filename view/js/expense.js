let currentPage = 1;
document.addEventListener('DOMContentLoaded', () => {
  const expenseForm = document.getElementById('expenseForm');
  const perPageSelect = document.getElementById('expensesPerPage');
    // Set default or stored value
  const savedPerPage = localStorage.getItem('expensesPerPage') || 1;
  perPageSelect.value = savedPerPage;

  perPageSelect.addEventListener('change', () => {
    localStorage.setItem('expensesPerPage', perPageSelect.value);
    currentPage = 1;
    loadExpenses();
  });

  document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadExpenses();
    }
  });

  document.getElementById('nextPage').addEventListener('click', () => {
    currentPage++;
    loadExpenses();
  });
  expenseForm.addEventListener('submit', handleAddExpense);
  loadExpenses();
});

function handleAddExpense(e){
    e.preventDefault()
    const token = localStorage.getItem('token');

    const expense = {
        amount: document.getElementById('amount').value,
        description: document.getElementById('description').value,
        category: document.getElementById('category').value,
    };
    console.log(expense)
    axios.post('/api/addexpense', expense, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(res => {
      //alert('Expense added!');
      e.target.reset();
      loadExpenses();
    })
    .catch(err => alert('Failed to add expense.'));
}
function loadExpenses() {
  const token = localStorage.getItem('token');
  const perPage = localStorage.getItem('expensesPerPage') || 1;

  axios.get(`/api/getexpense?page=${currentPage}&limit=${perPage}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => {
    const { expenses, totalPages } = res.data;
    const tbody = document.getElementById('expensesBody');
    tbody.innerHTML = '';

    expenses.forEach(exp => {
      const dateObj = new Date(exp.createdAt);
      const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getFullYear()}`;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${formattedDate}</td>
        <td>₹${exp.amount}</td>
        <td>${exp.description}</td>
        <td>${exp.category}</td>
        <td>
          <button onclick="handleDeleteExpense(${exp.id})"
          style="background-color: red; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
          Delete
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });

    renderPagination(totalPages);
  })
  .catch(err => {
    console.error('Failed to load expenses', err);
    alert('Failed to load expenses.');
  });
}
/*function loadExpenses(){
    const token = localStorage.getItem('token');
    if (!token) return;

    axios.get('/api/getexpense', {
        headers: {
        Authorization: `Bearer ${token}`
        }
    })
    .then(res => {
        const tbody = document.getElementById('expensesBody');
        if (!tbody) return;
        tbody.innerHTML = ''; // Clear old rows

        res.data.forEach(exp => {
          const dateObj = new Date(exp.createdAt);
          const formattedDate = `${dateObj.getDate().toString()
            .padStart(2, '0')}-${(dateObj.getMonth()+1)
              .toString().padStart(2, '0')}-${dateObj.getFullYear()}`;
            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${formattedDate}</td>
            <td>₹${exp.amount}</td>
            <td>${exp.description}</td>
            <td>${exp.category}</td>
            <td>
                <button onclick="handleDeleteExpense(${exp.id})"
                style="background-color: red; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                Delete
                </button>
            </td>
            `;
            tbody.appendChild(row);
        });
    })
    .catch(err => {
        console.error('Failed to load expenses', err);
        alert('Unauthorized or failed to load expenses.');
    });
}*/
function handleDeleteExpense(expenseId) {
    const token = localStorage.getItem('token');
  
    axios.delete(`/api/deleteexpense/${expenseId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      alert(res.data.message || 'Expense deleted successfully!');
      loadExpenses(); // Refresh the expense list if needed
    })
    .catch(err => {
      console.error(err);
      alert('Failed to delete expense.');
    });
}
function checkPremiumStatus() {
    const token = localStorage.getItem('token');
    if (!token) return;
  
    axios.get('/api/userprofile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      const { isPremium } = res.data;

      const premiumContainer = document.getElementById('premium-status');
      premiumContainer.innerHTML = isPremium
        ? `<span class="premium-badge">🌟 Premium User</span>`
        : `<button id="buyPremium">Buy Premium</button>`;
  
      if (!isPremium) {
        document.getElementById("buyPremium").addEventListener("click", function () {
          window.location.href = '/html/cashfreepay.html';
        });
      }
    })
    .catch(err => {
      console.error('Failed to fetch user profile', err);
    });
}
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/html/login.html'; // or wherever your login page is
}
function gotoLeaderboard(){
    window.location.href = '/html/leaderboard.html';
}
/*async function downloadReport() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const token = localStorage.getItem('token');
    if (!token) return;

  try {
    // 1. Fetch all user expenses
    const res = await axios.get('/api/expenses/all', {
      headers: {
      Authorization: `Bearer ${token}`
      }
    })
    const expenses = res.data;

    const dailyRows = [];
    const monthlyTotals = {};
    const yearlyTotals = {};

    expenses.forEach((exp, index) => {
      const date = new Date(exp.createdAt);
      const day = date.toLocaleDateString();
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const year = `${date.getFullYear()}`;

      // Daily row
      dailyRows.push([
        index + 1,
        day,
        `Rs ${exp.amount}`,
        exp.description,
        exp.category
      ]);

      // Monthly total
      if (!monthlyTotals[month]) monthlyTotals[month] = 0;
      monthlyTotals[month] += parseFloat(exp.amount);

      // Yearly total
      if (!yearlyTotals[year]) yearlyTotals[year] = 0;
      yearlyTotals[year] += parseFloat(exp.amount);
    });

    let y = 20;

    const centerText = (text, size = 16) => {
      doc.setFontSize(size);
      const textWidth = doc.getTextWidth(text);
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.text(text, (pageWidth - textWidth) / 2, y);
      y += 10;
    };

    const addTable = (head, body) => {
      doc.autoTable({
        head: [head],
        body: body,
        startY: y,
        margin: { top: 10 },
        theme: 'striped',
        styles: { fontSize: 10 },
        didDrawPage: data => {
          y = data.cursor.y + 10;
        }
      });
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
    };

    // --- DAILY REPORT ---
    centerText('Daily Report', 16);
    addTable(['#', 'Date', 'Amount', 'Description', 'Category'], dailyRows);

    // --- MONTHLY REPORT ---
    doc.addPage();
    y = 20;
    centerText('Monthly Report', 16);

    /*const monthlyRows = Object.entries(monthlyTotals).map(([month, total], idx) => [
      idx + 1,
      month,
      `₹${total.toFixed(2)}`
    ]);*/
    /*const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthlyRows = Object.entries(monthlyTotals).map(([month, total], idx) => {
      const [year, monthNum] = month.split('-');
      const name = `${monthNames[parseInt(monthNum, 10) - 1]} ${year}`;
      return [
        idx + 1,
        name,
        `Rs ${total.toFixed(2)}`
      ];
    });
    
    addTable(['#', 'Month', 'Total Expense'], monthlyRows);

    // --- YEARLY REPORT ---
    doc.addPage();
    y = 20;
    centerText('Yearly Report', 16);

    const yearlyRows = Object.entries(yearlyTotals).map(([year, total], idx) => [
      idx + 1,
      year,
      `Rs ${total.toFixed(2)}`
    ]);
    addTable(['#', 'Year', 'Total Expense'], yearlyRows);

    doc.save('Expense_Report.pdf');
  } catch (err) {
    console.error('Error generating PDF:', err);
    alert('You are not a Premium User');
  }
}*/
async function reportDownload() {
  const token = localStorage.getItem('token');
  try {
    const res = await axios.get('/api/report/download', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.data.fileUrl) {
      window.open(res.data.fileUrl, '_blank');
    }
  } catch (err) {
    console.error('Download failed:', err);
    alert('Report download failed or you are not a premium user.');
  }
}

function renderPagination(totalPages) {
  const container = document.getElementById('pageNumbers');
  container.innerHTML = '';

  const maxButtonsToShow = 5;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);

  if (endPage - startPage < maxButtonsToShow - 1) {
    startPage = Math.max(1, endPage - maxButtonsToShow + 1);
  }

  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;

  // First page
  if (startPage > 1) {
    const firstBtn = createPageButton(1);
    container.appendChild(firstBtn);
    if (startPage > 2) {
      const dots = document.createElement('span');
      dots.textContent = '...';
      container.appendChild(dots);
    }
  }

  // Page buttons
  for (let i = startPage; i <= endPage; i++) {
    const btn = createPageButton(i);
    container.appendChild(btn);
  }

  // Last page
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const dots = document.createElement('span');
      dots.textContent = '...';
      container.appendChild(dots);
    }
    const lastBtn = createPageButton(totalPages);
    container.appendChild(lastBtn);
  }
}

function createPageButton(page) {
  const btn = document.createElement('button');
  btn.textContent = page;
  btn.className = page === currentPage ? 'active' : '';
  btn.addEventListener('click', () => {
    currentPage = page;
    loadExpenses();
  });
  return btn;
}

window.onload = () => {
    checkPremiumStatus();
    loadExpenses();
};
