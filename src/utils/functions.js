import exportFromJSON from "export-from-json"

export const excelParser = () => {
  function exportDataFromJSON(data, newFileName, fileExportType) {
    if (!data) return
    try {
      const fileName = newFileName || "exported-data"
      const exportType = exportFromJSON.types[fileExportType || "xls"]

      exportFromJSON({ data, fileName, exportType })
    } catch (e) {
      throw new Error("Parsing failed!")
    }
  }

  return {
    exportDataFromJSON,
  }
}

export const _buildDownloadCSV = (data, fileName) => {
  const encodedUri = _buildCSV(data)
  const link = document.createElement('a')

  link.setAttribute('href', encodedUri)
  link.setAttribute('download', fileName.concat('.csv'))
  document.body.appendChild(link) // Required for FF
  link.click()
  document.body.removeChild(link)
}

// CSV with Tilde
export const _buildCSV = data => {
  let processdata = "data:text/csv;charset=utf-8,%EF%BB%BF"
  let csvContent = ''
  data.forEach((e, i) => {
    if (e instanceof Array) {
      csvContent += e.join(';').concat('\r\n')
    } else if (e instanceof Object) {
      if (i === 0) {
        csvContent += Object.keys(e).map(o => o.toString().trim()).join(';').concat('\r\n')
      }
      csvContent += Object.values(e).map(o => o.toString().trim()).join(';').concat('\r\n')
    }
  })

  return processdata + encodeURIComponent(csvContent)
}
