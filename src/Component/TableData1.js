import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import _ from 'lodash';
import * as XLSX from "xlsx";
import { Button } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import TestingData from '../TestingData';
import styles from './TableData1.module.css'; // Import CSS module


// Sample rows
const rows = TestingData;

// Keys for selection
const keys = [
    "Customer",
    "Project Group",
    "Project ID",
    "Project Type",
    "Sub Project",
    "PM Name",
    "Circle",
    "Site ID",
    "Unique ID",
    "System ID",
    "RFAI Date",
    "NOMINAL AOP",
    "NOMINAL QUARTER",
    "CIRCLE",
    "CELL ID",
    "OLD PMIS ID",
    "REFERENCE ID",
    "SCOPE",
    "2G SITE ID",
    "BAND",
    "BTS TYPE",
    "OEM NAME",
    "TOCO NAME",
    "LOCATORID",
    "POST_RFAI_SURVEY_DATE",
    "MATERIAL_DELIVERY_(MOS)_DATE",
    "INSTALLATION_START_DATE",
    "INSTALLATION_END_DATE",
    "INTEGRATION DATE",
    "SACFA_APPLIED_DATE",
    "EMF_SUBMISSION_DATE",
    "SCFT_COMPLETION_DATE",
    "OA_(COMMERCIAL_TRAFFIC_PUT_ON_AIR)_(MS1)_DATE",
    "RFAI VS MS1",
    "PHYSICAL_AT_ACCEPTANCE_DATE",
    "SOFT_AT_ACCEPTANCE_DATE",
    "SOFT_AT_STATUS",
    "MS1 VS SOFT AT ACCEPTANCE- AGEING",
    "PERFORMANCE_AT_OFFERED_DATE",
    "PERFORMANCE_AT_ACCEPTANCE_DATE2",
    "PERFORMANCE_AT_STATUS",
    "MS1 VS PERFORMANCE AT ACCEPTANCE- AGEING",
    "MAPA_INCLUSION_DATE",
    "MS2 PENDING REASON",
    "MS1 VS MS2 AGEING",
    "CURRENT_STATUS_OF_SITE",
    "ATP NAME",
    "ATP COUNT",
    "INTERNAL RFAI VS MS1-IN DAYS",
    "INTERNAL MS1 VS MS2-IN DAYS",
    "RFAI VS MS1.1",
    "TOTAL  ALLOCATION"
]


const styleTable = {

}

const TableData1 = () => {
    // State variables
    const [xAxes, setXAxes] = useState([]);
    const [yAxes, setYAxes] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Handle select changes
    const handleXAxisChange = (event) => setXAxes(event.target.value);
    const handleYAxisChange = (event) => setYAxes(event.target.value);

    // Get unique values for X and Y axes
    const uniqueXAxis = useMemo(() => {
        return xAxes.length
            ? _.uniq(rows.map((row) => xAxes.map((xAxis) => row[xAxis]).join('-')))
            : [];
    }, [xAxes]);

    console.log('uniqueXAxis' , uniqueXAxis);

    const uniqueYAxis = useMemo(() => {
        return yAxes.length
            ? _.uniq(rows.map((row) => yAxes.map((yAxis) => row[yAxis]).join('-')))
            : [];
    }, [yAxes]);

    // Calculate the count matrix
    const countMatrix = useMemo(() => {
        const matrix = {};
        if (xAxes.length && yAxes.length) {
            uniqueXAxis.forEach((xValue) => {
                matrix[xValue] = {};
                uniqueYAxis.forEach((yValue) => {
                    const count = rows.filter((row) => {
                        const xKey = xAxes.map((xAxis) => row[xAxis]).join('-');
                        const yKey = yAxes.map((yAxis) => row[yAxis]).join('-');
                        // console.log(xKey, yKey, xValue, yValue);
                        return xKey === xValue && yKey === yValue;
                    }).length;
                    matrix[xValue][yValue] = count;
                });
            });
        }
        return matrix;
    }, [xAxes, yAxes, uniqueXAxis, uniqueYAxis]);

    // Sorting logic
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedXAxis = useMemo(() => {
        let sortedData = [...uniqueXAxis];
        if (sortConfig.key === 'xAxis') {
            sortedData.sort((a, b) =>
                sortConfig.direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
            );
        }
        return sortedData;
    }, [uniqueXAxis, sortConfig]);

    // Calculate totals
    const rowTotals = useMemo(() => {
        return sortedXAxis.map((xValue) =>
            uniqueYAxis.reduce((sum, yValue) => sum + countMatrix[xValue][yValue], 0)
        );
    }, [sortedXAxis, uniqueYAxis, countMatrix]);

    const columnTotals = useMemo(() => {
        return uniqueYAxis.map((yValue) =>
            sortedXAxis.reduce((sum, xValue) => sum + countMatrix[xValue][yValue], 0)
        );
    }, [sortedXAxis, uniqueYAxis, countMatrix]);

    const grandTotal = useMemo(() => {
        return sortedXAxis.reduce(
            (sumX, xValue) =>
                sumX + uniqueYAxis.reduce((sumY, yValue) => sumY + countMatrix[xValue][yValue], 0),
            0
        );
    }, [sortedXAxis, uniqueYAxis, countMatrix]);

    // Export to Excel
    const exportToExcel = () => {
        const data = [
            [xAxes.join('-') + '\\' + yAxes.join('-'), ...uniqueYAxis, 'Total'], // Header
            ...sortedXAxis.map((xValue, i) => [
                xValue,
                ...uniqueYAxis.map((yValue) => countMatrix[xValue][yValue] || 0),
                rowTotals[i],
            ]),
            ['Total', ...columnTotals, grandTotal],
        ];

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Pivot Data");
        XLSX.writeFile(wb, "pivot_data.xlsx");
    };

    return (
        <div>
            {/* Multi-Select for X-Axis */}
            <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel>X-Axis</InputLabel>
                <Select
                    multiple
                    value={xAxes}
                    onChange={handleXAxisChange}
                    renderValue={(selected) => selected.join(', ')}
                >
                    {keys.map((key) => (
                        <MenuItem key={key} value={key}>
                            {key}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Multi-Select for Y-Axis */}
            <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel>Y-Axis</InputLabel>
                <Select
                    multiple
                    value={yAxes}
                    onChange={handleYAxisChange}
                    renderValue={(selected) => selected.join(', ')}
                >
                    {keys.map((key) => (
                        <MenuItem key={key} value={key}>
                            {key}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Pivot Table */}
            {xAxes.length > 0 && yAxes.length > 0 && (
                <div>
                    <table border="1" cellPadding="5" cellSpacing="0">
                        <thead>
                            <tr>
                                <th>
                                    <span style={{ cursor: 'pointer' }} onClick={() => handleSort('xAxis')}>
                                        {xAxes.join('-')} \\ {yAxes.join('-')}
                                        {sortConfig.key === 'xAxis' &&
                                            (sortConfig.direction === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                                    </span>
                                </th>
                                {uniqueYAxis.map((yValue) => (
                                    <th key={yValue}>{yValue}</th>
                                ))}
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedXAxis.map((xValue, i) => (
                                <tr key={xValue} className={styles.tableRow}>
                                    <th className={styles.tableRow}>{xValue}</th>
                                    {uniqueYAxis.map((yValue) => (
                                        <td key={yValue} className={styles.tableRow}>
                                            {countMatrix[xValue][yValue]}
                                        </td>
                                    ))}
                                    <th className={styles.tableRow}>{rowTotals[i]}</th>
                                </tr>
                            ))}
                            <tr className={styles.footerRow}>
                                <th>Total</th>
                                {columnTotals.map((total, i) => (
                                    <th key={i} className={styles.tableRow}>
                                        {total}
                                    </th>
                                ))}
                                <th className={styles.tableRow}>{grandTotal}</th>
                            </tr>
                        </tbody>
                    </table>
                    <Box sx={{ m: 2 }}>
                        <Button onClick={exportToExcel}>Download as Excel</Button>
                    </Box>
                </div>
            )}
        </div>
    );
};

export default TableData1;
