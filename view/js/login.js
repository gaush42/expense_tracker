document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);
});

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
        localStorage.setItem('token', res.data.token);
        window.location.href = '/html/expenses.html';
    })
    .catch(err => {
        console.error(err);
        alert('Login failed!' , err);
    });
}