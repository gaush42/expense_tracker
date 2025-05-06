document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', handleSignup);
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
        window.location.href = '/html/login.html';
    })
    .catch(err => {
        console.error(err);
        alert(err.response?.data?.message || 'Signup failed!');
    });
}