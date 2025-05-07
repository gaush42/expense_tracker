const { jsPDF } = require('jspdf');
const {autoTable} = require('jspdf-autotable');
const fs = require('fs');

const doc = new jsPDF();
autoTable(doc,{
  head: [['ID', 'Name']],
  body: [[1, 'Test'], [2, 'PDF']],
});
const pdf = doc.output();
fs.writeFileSync('test.pdf', pdf, 'binary');