import * as XLSX from 'xlsx'

export function downloadExcel(blobData: BlobPart, filename = '가정통신문') {
  const blob = new Blob([blobData], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,',
  })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.replace(/\./g, ' ')
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export function exportToExcel(data: any, fileName: string) {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}

function csvToSheet(csv: string) {
  const rows = csv.split('\n') // 줄바꿈 문자로 각 행 분리
  const data = rows.map((row) => row.split(',')) // 쉼표로 각 열 분리
  const ws = XLSX.utils.aoa_to_sheet(data) // 배열의 배열을 워크시트로 변환

  // 각 셀의 형식을 텍스트로 설정
  for (let R = 0; R !== data.length; ++R) {
    for (let C = 0; C !== data[R].length; ++C) {
      const cell_address = { c: C, r: R }
      const cell_ref = XLSX.utils.encode_cell(cell_address)
      if (ws[cell_ref]) ws[cell_ref].t = 's' // 셀 형식을 문자열로 설정
    }
  }
  return ws
}

export function exportCSVToExcel(csvString: string, fileName: string) {
  // const workbook = XLSX.read(csvString, {type: 'string'});

  //   // Excel 파일로 저장 및 다운로드
  //   XLSX.writeFile(workbook, `${fileName}.xlsx`);

  const ws = csvToSheet(csvString)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data')

  // Excel 파일로 저장 및 다운로드
  XLSX.writeFile(wb, `${fileName}.xlsx`)
}
