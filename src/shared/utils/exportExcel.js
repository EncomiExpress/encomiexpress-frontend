import ExcelJS from 'exceljs'

const normalizeValue = (value) => {
  if (value === null || value === undefined || value === '') return ''
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (value instanceof Date) return value.toLocaleDateString('es-CO')
  if (Array.isArray(value)) return value.map(normalizeValue).join(', ')
  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([key, item]) => `${key}: ${normalizeValue(item)}`)
      .join(', ')
  }
  return String(value)
}

const normalizeRow = (row) =>
  Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, normalizeValue(value)])
  )

const addSheet = (workbook, name, rows) => {
  const normalizedRows = rows.map(normalizeRow)
  const worksheet = workbook.addWorksheet(name.slice(0, 31))
  worksheet.columns = Object.keys(normalizedRows[0] || {}).map((key) => ({ header: key, key }))
  worksheet.addRows(normalizedRows)
}

const buildWorkbook = (sheets) => {
  const workbook = new ExcelJS.Workbook()
  sheets.forEach(({ name, rows }) => addSheet(workbook, name, rows))
  return workbook
}

const downloadWorkbook = async (workbook, safeFileName) => {
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${safeFileName}.xlsx`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const exportToExcel = async ({ data = [], fileName = 'reporte', sheetName = 'Datos', sheets = null }) => {
  const workbook = sheets && Array.isArray(sheets) && sheets.length > 0
    ? buildWorkbook(sheets)
    : buildWorkbook([{ name: sheetName, rows: data }])

  const safeFileName = String(fileName)
    .normalize('NFD')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || 'reporte'

  await downloadWorkbook(workbook, safeFileName)
}
