function LoadLeaderBoard(){
    const token = localStorage.getItem('token');
    axios.get('/api/leaderboard', {
    headers: {
        Authorization: `Bearer ${token}`
    }
    })
    .then(res => {
        const leaderboardBody = document.getElementById('leaderboardBody');
        leaderboardBody.innerHTML = '';

    res.data.forEach((user, index) => {
        const row = document.createElement('tr');

        if (index === 0) row.classList.add('gold');
        else if (index === 1) row.classList.add('silver');
        else if (index === 2) row.classList.add('bronze');

        row.innerHTML = `
        <td>${index + 1}</td>
        <td>${user.User.fullname}</td>
        <td>₹${parseFloat(user.totalExpense).toFixed(2)}</td>
        `;
        leaderboardBody.appendChild(row);
    });
    })
    .catch(err => {
        alert('You must be logged in and a premium user to access the leaderboard.');
    });
}
window.onload = () => {
    LoadLeaderBoard();
};
