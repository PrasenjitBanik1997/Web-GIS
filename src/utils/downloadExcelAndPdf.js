import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const jsonToExcel = (json) => {
  const worksheet = XLSX.utils.json_to_sheet(json);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  return blob;
};

// const jsonToPdf = (json) => {
//     const doc = new jsPDF();
//     doc.text(JSON.stringify(json), 10, 10);
//     return doc.output('blob');
//   };


export const downloadExcel = (json, fileName) => {
  const excelBlob = jsonToExcel(json);
  const url = URL.createObjectURL(excelBlob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${fileName}.xlsx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// export const downloadPdf = (json,fileName) => {
//   const pdfBlob = jsonToPdf(json);
//   const url = URL.createObjectURL(pdfBlob);
//   const link = document.createElement('a');
//   link.href = url;
//   link.setAttribute('download', `${fileName}.pdf`);
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// };

// export const downloadPdf = (jsonData, filename) => {
//     const doc = new jsPDF();
//     const columns = Object.keys(jsonData[0]);
//     const rows = jsonData.map(obj => columns.map(col => obj[col]));

//     doc.autoTable({
//       head: [columns],
//       body: rows
//     });

//     doc.save(`${filename}.pdf`);
//   };

export const downloadPdf = (jsonData) => {
  const doc = new jsPDF();
  let fileName = 'Spatial Data of';
  jsonData.forEach((layer, i) => {
    const { layerName, tableData } = layer;
    if (i === 0) {
      fileName = fileName + ' ' + layerName.toUpperCase()
    } else {
      fileName = fileName + '&' + layerName.toUpperCase()
    }
    console.log(fileName)
    doc.setFontSize(18);
    doc.setTextColor('blue')
    doc.text(layerName.toUpperCase(), 5, 10);

    //const tableHeaders = tableData.length > 0 ? (Object.keys(tableData[0]).length >10?Object.keys(tableData[0]).filter((headerName,headerInd)=>headerInd<=9):Object.keys(tableData[0])): ["Message"];
    let tableHeaders = [];
    if (tableData.length > 0) {
      tableHeaders = Object.keys(tableData[0]).length > 10 ? Object.keys(tableData[0]).filter((headerName, headerInd) => headerInd <= 9) : Object.keys(tableData[0])
    } else {
      tableHeaders = ["Message"]
    }
    const tableValues = tableData.length > 0 ? tableData.map(item => Object.values(item).length > 10 ? Object.values(item).filter((val, valInd) => valInd <= 9) : Object.values(item)) : [{ "Message": "No Data Found" }].map(item => Object.values(item));
    doc.autoTable({
      startY: 15,
      head: [tableHeaders],
      body: tableValues,
      margin: { top: 5, left: 5, right: 5, bottom: 5 },
    });

    doc.addPage(); // Add a new page for each layer
  });

  doc.save(`${fileName}.pdf`);
}
