document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const expenseForm = document.getElementById('expenseForm');
  
    if (signupForm){
        signupForm.addEventListener('submit', handleSignup);
        console.log("signup")
    }
    if (loginForm){
        loginForm.addEventListener('submit', handleLogin);
        console.log("login")
    }
    if (expenseForm) {
      expenseForm.addEventListener('submit', handleAddExpense);
      loadExpenses(); // Optional: auto-load on expense page
    }
});

function handleSignup(e){
    e.preventDefault();

    const fullName = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!fullName || !email || !password) {
        alert('Please fill out all fields.');
        return;
    }

    axios.post('/api/signup', {
        fullname: fullName,
        email: email,
        password: password
    })
    .then(res => {
        alert(res.data.message || 'Signup successful!');
        document.getElementById('signupForm').reset();
    })
    .catch(err => {
        console.error(err);
        alert(err.response?.data?.message || 'Signup failed!');
    });
}
function handleLogin(e){
    e.preventDefault()

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        alert('Please fill out all fields.');
    }
    axios.post('/api/login', {
        email: email,
        password: password
    })
    .then(res => {
        //alert(res.data.message || 'Login successful!');
        //document.getElementById('loginForm').reset();
        //console.log('Login response:', res.data);
        //localStorage.setItem('userId', res.data.user.id);
        localStorage.setItem('token', res.data.token);
        window.location.href = '/expenses.html';
    })
    .catch(err => {
        console.error(err);
        alert('Login failed!');
    });
}
function handleAddExpense(e){
    e.preventDefault()
    const token = localStorage.getItem('token');
    //const userId = localStorage.getItem('userId')
    const expense = {
        amount: document.getElementById('amount').value,
        description: document.getElementById('description').value,
        category: document.getElementById('category').value,
        //userId
    };
    console.log(expense)
    axios.post('/api/addexpense', expense, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(res => {
      alert('Expense added!');
      e.target.reset();
      loadExpenses();
    })
    .catch(err => alert('Failed to add expense.'));
}
function loadExpenses(){
    const token = localStorage.getItem('token');
    if (!token) return;

    axios.get('/api/getexpense', {
        headers: {
        Authorization: `Bearer ${token}`
        }
    })
    .then(res => {
        const list = document.getElementById('expenses');
        if (!list) return;
        list.innerHTML = '';

        res.data.forEach(exp => {
        const li = document.createElement('li');
        li.innerHTML = `
            ₹${exp.amount} - ${exp.description} [${exp.category}]
            <button onclick="handleDeleteExpense(${exp.id})"
            style="background-color: red; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
            Delete
            </button>
        `;
        list.appendChild(li);
        });
    })
    .catch(err => {
        console.error('Failed to load expenses', err);
        alert('Unauthorized or failed to load expenses.');
    });
}
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
      alert(err.response?.data?.message || 'Failed to delete expense.');
    });
}