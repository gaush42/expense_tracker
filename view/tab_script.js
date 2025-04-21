let currentDate = new Date();

  function formatDateByTab(tab) {
    const options = {
      daily: { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' },
      monthly: { month: 'long', year: 'numeric' },
      yearly: { year: 'numeric' }
    };

    return currentDate.toLocaleDateString('en-US', options[tab]);
  }

  function updateDisplay() {
    const activeTab = document.querySelector('.tab-button.active').textContent.toLowerCase();

    if (activeTab === 'daily') {
      document.getElementById('date-display').textContent = formatDateByTab('daily');
      document.getElementById('expense-data').innerHTML =
        `Showing expenses for <strong>${formatDateByTab('daily')}</strong>`;
    } else if (activeTab === 'monthly') {
      document.getElementById('monthly-display').textContent = `Month: ${formatDateByTab('monthly')}`;
    } else if (activeTab === 'yearly') {
      document.getElementById('yearly-display').textContent = `Year: ${formatDateByTab('yearly')}`;
    }
  }

  function changeDate(offset) {
    const activeTab = document.querySelector('.tab-button.active').textContent.toLowerCase();

    if (activeTab === 'daily') {
      currentDate.setDate(currentDate.getDate() + offset);
    } else if (activeTab === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + offset);
    } else if (activeTab === 'yearly') {
      currentDate.setFullYear(currentDate.getFullYear() + offset);
    }

    updateDisplay();
  }

  function showTab(event, tabName) {
    // Hide all contents
    document.querySelectorAll('.tab-content').forEach(div => div.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));

    // Show current tab
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');

    updateDisplay();
  }

  document.addEventListener('DOMContentLoaded', updateDisplay);