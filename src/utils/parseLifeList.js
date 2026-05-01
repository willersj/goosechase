function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

export function parseLifeListCSV(csvText) {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) throw new Error('CSV file appears to be empty or invalid.')

  const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, '').toLowerCase())
  const commonIdx = headers.findIndex(h => h === 'common name')
  const sciIdx = headers.findIndex(h => h === 'scientific name')

  if (commonIdx === -1) {
    throw new Error('Could not find "Common Name" column. Make sure this is an eBird data export CSV.')
  }

  const common = new Set()
  const sci = new Set()

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i])
    const name = cols[commonIdx]?.trim()
    if (name) common.add(name.toLowerCase())
    if (sciIdx !== -1) {
      const sname = cols[sciIdx]?.trim()
      if (sname) sci.add(sname.toLowerCase())
    }
  }

  if (common.size === 0) throw new Error('No species found in the CSV file.')

  return { common, sci, count: common.size }
}
