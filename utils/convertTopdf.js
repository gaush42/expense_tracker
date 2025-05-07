const { jsPDF } = require('jspdf');
const {autoTable} = require('jspdf-autotable');
const fs = require('fs');
const path = require('path');

function convertToPdf(expenses, filePath) {
  const doc = new jsPDF();
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
        autoTable(doc,{
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
    const monthNames = [
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
  doc.save(filePath);
}

module.exports = convertToPdf;