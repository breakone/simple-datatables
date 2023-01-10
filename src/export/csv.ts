import {
    isObject
} from "../helpers"
import {DataTable} from "../datatable"
/**
 * Export table to CSV
 */
export const exportCSV = function(dataTable: DataTable, userOptions = {}) {
    if (!dataTable.hasHeadings && !dataTable.hasRows) return false

    const defaults = {
        download: true,
        skipColumn: [],
        lineDelimiter: "\n",
        columnDelimiter: ","
    }

    // Check for the options object
    if (!isObject(userOptions)) {
        return false
    }

    const options = {
        ...defaults,
        ...userOptions
    }
    const columnShown = (index: any) => !options.skipColumn.includes(index) && !dataTable.columnSettings.columns[index]?.hidden
    let rows = []
    const headers = dataTable.data.headings.filter((_heading: any, index: any) => columnShown(index)).map((header: any) => header.data)
    // Include headings
    rows[0] = headers

    // Selection or whole table
    // @ts-expect-error TS(2339): Property 'selection' does not exist on type '{ dow... Remove this comment to see the full error message
    if (options.selection) {
        // Page number
        // @ts-expect-error TS(2339): Property 'selection' does not exist on type '{ dow... Remove this comment to see the full error message
        if (!isNaN(options.selection)) {
            // @ts-expect-error TS(2339): Property 'selection' does not exist on type '{ dow... Remove this comment to see the full error message
            rows = rows.concat(dataTable.pages[options.selection - 1].map((row: any) => row.row.filter((_cell: any, index: any) => columnShown(index)).map((cell: any) => cell.text || cell.data)))
        // @ts-expect-error TS(2339): Property 'selection' does not exist on type '{ dow... Remove this comment to see the full error message
        } else if (Array.isArray(options.selection)) {
            // Array of page numbers
            // @ts-expect-error TS(2339): Property 'selection' does not exist on type '{ dow... Remove this comment to see the full error message
            for (let i = 0; i < options.selection.length; i++) {
                // @ts-expect-error TS(2339): Property 'selection' does not exist on type '{ dow... Remove this comment to see the full error message
                rows = rows.concat(dataTable.pages[options.selection[i] - 1].map((row: any) => row.row.filter((_cell: any, index: any) => columnShown(index)).map((cell: any) => cell.text || cell.data)))
            }
        }
    } else {
        rows = rows.concat(dataTable.data.data.map((row: any) => row.filter((_cell: any, index: any) => columnShown(index)).map((cell: any) => cell.text || cell.data)))
    }

    // Only proceed if we have data
    if (rows.length) {
        let str = ""
        rows.forEach(row => {
            row.forEach((cell: any) => {
                if (typeof cell === "string") {
                    cell = cell.trim()
                    cell = cell.replace(/\s{2,}/g, " ")
                    cell = cell.replace(/\n/g, "  ")
                    cell = cell.replace(/"/g, "\"\"")
                    //have to manually encode "#" as encodeURI leaves it as is.
                    cell = cell.replace(/#/g, "%23")
                    if (cell.includes(",")) {
                        cell = `"${cell}"`
                    }
                }
                str += cell + options.columnDelimiter
            })
            // Remove trailing column delimiter
            str = str.trim().substring(0, str.length - 1)

            // Apply line delimiter
            str += options.lineDelimiter
        })

        // Remove trailing line delimiter
        str = str.trim().substring(0, str.length - 1)

        // Download
        if (options.download) {
            // Create a link to trigger the download
            const link = document.createElement("a")
            link.href = encodeURI(`data:text/csv;charset=utf-8,${str}`)
            // @ts-expect-error TS(2339): Property 'filename' does not exist on type '{ down... Remove this comment to see the full error message
            link.download = `${options.filename || "datatable_export"}.csv`

            // Append the link
            document.body.appendChild(link)

            // Trigger the download
            link.click()

            // Remove the link
            document.body.removeChild(link)
        }

        return str
    }

    return false
}
