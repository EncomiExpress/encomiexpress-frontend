import ExcelJS from 'exceljs'
import logo from '../../assets/logo.png'

const BRAND_RED = 'FFCC1818'
// Proporción real del PNG (1504×467) — si no se respeta, el logo queda
// deformado/recortado al forzarlo a un tamaño de otra proporción.
const LOGO_RATIO = 1504 / 467
const LOGO_HEIGHT_PX = 55
const LOGO_WIDTH_PX = Math.round(LOGO_HEIGHT_PX * LOGO_RATIO)
const HEADER_ROW = 6
// Alto de fila por defecto de Excel (15pt ≈ 20px) — se usa para centrar el
// logo verticalmente dentro de la franja del encabezado en vez de dejarlo
// pegado arriba.
const DEFAULT_ROW_PX = 20
// El texto arranca en esta columna: las 3 columnas de ancho mínimo (10
// caracteres ≈ 70px cada una) suman ~210px, más que los ~177px del logo —
// así nunca quedan superpuestos sin importar qué tan angostas terminen
// siendo las columnas de datos.
const TEXT_COL = 4

// theme.palette.primary.main llega como '#RRGGBB' — ExcelJS espera ARGB ('FFRRGGBB').
const toArgb = (hex) => {
  if (!hex || typeof hex !== 'string') return BRAND_RED
  const clean = hex.replace('#', '').toUpperCase()
  return clean.length === 6 ? `FF${clean}` : BRAND_RED
}

// Aclara un color ARGB mezclándolo con blanco, para un fondo de encabezado
// sutil en vez de un bloque sólido del color de marca.
const lightenArgb = (argb, factor = 0.88) => {
  const r = parseInt(argb.slice(2, 4), 16)
  const g = parseInt(argb.slice(4, 6), 16)
  const b = parseInt(argb.slice(6, 8), 16)
  const mix = (c) => Math.round(c + (255 - c) * factor)
  const toHex = (c) => c.toString(16).padStart(2, '0').toUpperCase()
  return `FF${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`
}

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

const loadLogoBuffer = async () => {
  try {
    const response = await fetch(logo)
    return await response.arrayBuffer()
  } catch {
    // si el logo no carga, se sigue sin él
    return null
  }
}

const addSheet = (workbook, name, rows, logoBuffer, headerColor) => {
  const normalizedRows = rows.map(normalizeRow)
  const columnKeys = Object.keys(normalizedRows[0] || {})
  const worksheet = workbook.addWorksheet(name.slice(0, 31))

  const lightFill = lightenArgb(headerColor)
  const headerBandRows = HEADER_ROW - 1
  for (let r = 1; r <= headerBandRows; r++) {
    for (let c = 1; c <= Math.max(columnKeys.length, TEXT_COL + 2); c++) {
      worksheet.getRow(r).getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightFill } }
    }
  }

  if (logoBuffer) {
    const bandHeightPx = headerBandRows * DEFAULT_ROW_PX
    const rowOffset = Math.max(0.15, (bandHeightPx - LOGO_HEIGHT_PX) / 2 / DEFAULT_ROW_PX)
    const imageId = workbook.addImage({ buffer: logoBuffer, extension: 'png' })
    worksheet.addImage(imageId, {
      tl: { col: 0.15, row: rowOffset },
      ext: { width: LOGO_WIDTH_PX, height: LOGO_HEIGHT_PX },
    })
  }
  worksheet.getRow(2).getCell(TEXT_COL).value = 'EncomiExpress'
  worksheet.getRow(2).getCell(TEXT_COL).font = { bold: true, size: 16, color: { argb: headerColor } }
  worksheet.getRow(3).getCell(TEXT_COL).value = name
  worksheet.getRow(3).getCell(TEXT_COL).font = { italic: true, size: 10, color: { argb: 'FF757575' } }
  worksheet.getRow(4).getCell(TEXT_COL).value = `Exportado el ${new Date().toLocaleString('es-CO')}`
  worksheet.getRow(4).getCell(TEXT_COL).font = { size: 9, color: { argb: 'FF9E9E9E' } }

  const headerRow = worksheet.getRow(HEADER_ROW)
  columnKeys.forEach((key, i) => {
    const cell = headerRow.getCell(i + 1)
    cell.value = key
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerColor } }
    cell.alignment = { vertical: 'middle', horizontal: 'left' }
  })
  headerRow.commit()

  normalizedRows.forEach((row, i) => {
    const dataRow = worksheet.getRow(HEADER_ROW + 1 + i)
    columnKeys.forEach((key, colIdx) => {
      dataRow.getCell(colIdx + 1).value = row[key]
    })
    if (i % 2 === 1) {
      dataRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } }
      })
    }
  })

  worksheet.columns = columnKeys.map((key) => {
    const maxLen = Math.max(
      key.length,
      ...normalizedRows.map((row) => String(row[key] ?? '').length)
    )
    return { key, width: Math.min(Math.max(maxLen + 2, 10), 45) }
  })
}

const buildWorkbook = async (sheets, headerColor) => {
  const workbook = new ExcelJS.Workbook()
  const logoBuffer = await loadLogoBuffer()
  sheets.forEach(({ name, rows }) => addSheet(workbook, name, rows, logoBuffer, headerColor))
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

export const exportToExcel = async ({ data = [], fileName = 'reporte', sheetName = 'Datos', sheets = null, themeColor = null }) => {
  const headerColor = toArgb(themeColor)
  const workbook = sheets && Array.isArray(sheets) && sheets.length > 0
    ? await buildWorkbook(sheets, headerColor)
    : await buildWorkbook([{ name: sheetName, rows: data }], headerColor)

  const safeFileName = String(fileName)
    .normalize('NFD')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || 'reporte'

  await downloadWorkbook(workbook, safeFileName)
}
