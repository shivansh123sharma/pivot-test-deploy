import React, { useCallback, useState, useMemo } from 'react'
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
// import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
// import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Paper } from '@mui/material';
import TestingData from '../TestingData';


const rows = TestingData;

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

const TableData = () => {
    const [xAxis, setXAxis] = useState('');
    const [yAxis, setYAxis] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });


    const handleChange = (event) => {
        if (event.target.name === 'xAxis') {
            setXAxis(event.target.value);
        } else {
            setYAxis(event.target.value);
        }

    };

    const uniqueXAxis = useMemo(
        () => (xAxis ? _.uniq(rows.map((row) => row[xAxis])).sort((a, b) => a - b) : []),
        [xAxis]
    );
    const uniqueYAxis = useMemo(
        () => (yAxis ? _.uniq(rows.map((row) => row[yAxis])).sort((a, b) => a - b) : []),
        [yAxis]
    );


    // Calculate count matrix
    const countMatrix = useMemo(() => {
        const matrix = {};
        if (xAxis && yAxis) {
            uniqueXAxis.forEach((xValue) => {
                matrix[xValue] = {};
                // console.log('circle',xValue);
                uniqueYAxis.forEach((yValue) => {
                    const count = rows.filter(
                        (row) => row[xAxis] === xValue && row[yAxis] === yValue
                    ).length;
                    // console.log('matrix1',matrix);
                    matrix[xValue][yValue] = count;
                    // console.log('matrix2',matrix);
                });
            });
        }
        

        return matrix;
    }, [xAxis, yAxis, uniqueXAxis, uniqueYAxis]);


    // Function to export data to Excel
    const exportToExcel = () => {
        // Prepare data for the Excel sheet
        const data = [
            [xAxis + '\\' + yAxis, ...uniqueYAxis, 'Total'], // Header row
            ...uniqueXAxis.map((xValue,rowIndex) => [
                xValue,
                ...uniqueYAxis.map((yValue) => countMatrix[xValue][yValue] || 0),
                rowTotals[rowIndex],
            ]),
            ['Total', ...columnTotals, grandTotal],
        ];


        console.log('Export Data:', data);

        // Create a worksheet
        const ws = XLSX.utils.aoa_to_sheet(data);

        // Create a new workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Pivot Data");

        // Export the workbook
        XLSX.writeFile(wb, "pivot_data.xlsx");
    };


    // Sorting logic
    const handleSort = (columnKey) => {
        let direction = 'asc';
        if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key: columnKey, direction });
    };

    // Sorted data for display
    const sortedXAxis = useMemo(() => {
        let sortedData = uniqueXAxis;
        if (sortConfig.key === 'xAxis') {
            sortedData = [...uniqueXAxis].sort((a, b) => {
                if (sortConfig.direction === 'asc') return a.localeCompare(b);
                else return b.localeCompare(a);
            });
        }
        return sortedData;
    }, [uniqueXAxis, sortConfig]);


    const sortedYAxis = useMemo(() => {
        return uniqueYAxis.sort((a, b) => {
            if (sortConfig.key === 'yAxis') {
                if (sortConfig.direction === 'asc') return a.localeCompare(b);
                else return b.localeCompare(a);
            }
            return 0;
        });
    }, [uniqueYAxis, sortConfig]);

    // Calculate total for rows and columns
    const rowTotals = useMemo(() => {
        return uniqueXAxis.reduce((totals, xValue) => {
            const rowTotal = uniqueYAxis.reduce((sum, yValue) => sum + countMatrix[xValue][yValue], 0);
            totals[xValue] = rowTotal;
            return totals;
        }, {});
    }, [uniqueXAxis, uniqueYAxis, countMatrix]);

    const columnTotals = useMemo(() => {
        return uniqueYAxis.reduce((totals, yValue) => {
            const columnTotal = uniqueXAxis.reduce((sum, xValue) => sum + countMatrix[xValue][yValue], 0);
            totals[yValue] = columnTotal;
            return totals;
        }, {});
    }, [uniqueXAxis, uniqueYAxis, countMatrix]);

    const grandTotal = useMemo(() => {
        return uniqueXAxis.reduce((sumX, xValue) => {
            return sumX + uniqueYAxis.reduce((sumY, yValue) => sumY + countMatrix[xValue][yValue], 0);
        }, 0);
    }, [uniqueXAxis, uniqueYAxis, countMatrix]);

    return (
        <div>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="demo-simple-select-label">X-Axis</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    name='xAxis'
                    value={xAxis}
                    label="X-Axis"
                    onChange={handleChange}
                    autoWidth
                >
                    {
                        keys.map((key) => {
                            return <MenuItem key={key} value={key}>{key}</MenuItem>
                        })}

                </Select>
            </FormControl>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="demo-simple-select-label">Y-Axis</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    name='yAxis'
                    value={yAxis}
                    label="Y-Axis"
                    onChange={handleChange}
                    autoWidth
                >
                    {
                        keys.map((key) => {
                            return <MenuItem key={key} value={key}>{key}</MenuItem>
                        })}

                </Select>
            </FormControl>

            <div>
                {/* <table className="pvtTable" border="2px" cellPadding="0" cellSpacing="0" >
                    <thead>
                        <tr>
                            <th></th>
                            <th>{yAxis}</th>
                            {FindUniceOfYAxis()?.map((item) => <th rowSpan='2' key={item}>{item}</th>)}
                        </tr>
                        <tr>
                            <th>{xAxis}</th>
                            <th></th>
                        </tr>
              
                    </thead>
                    <tbody>
                       
                           {FindUniceOfXAxis()?.map((item) => <tr key={item}> <th colSpan="2">{item}</th> </tr>)}
                       
                    </tbody>
                </table> */}
                {/* Pivot Table */}
                {xAxis && yAxis && (
                    <div>
                        <table border="1" cellPadding="5" cellSpacing="0">
                            <thead>
                                <tr>
                                    <th>
                                        <span
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleSort('xAxis')}
                                        >
                                            {xAxis}\{yAxis}
                                            {sortConfig.key === 'xAxis' && sortConfig.direction === 'asc' ? (
                                                <ArrowUpwardIcon />
                                            ) : (
                                                <ArrowDownwardIcon />
                                            )}
                                        </span>
                                    </th>
                                    {uniqueYAxis.map((yValue) => (
                                        <th key={yValue}>{yValue}</th>
                                    ))}
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* {uniqueXAxis.map((xValue) => (
                                    <tr key={xValue}>
                                        <th>{xValue}</th>
                                        {uniqueYAxis.map((yValue) => (
                                            <td key={yValue}>{countMatrix[xValue][yValue]}</td>
                                        ))}
                                    </tr>
                                ))} */}
                                {sortedXAxis.map((xValue) => (
                                    <tr key={xValue}>
                                        <th>
                                            {xValue}

                                        </th>
                                        {uniqueYAxis.map((yValue) => (
                                            <td key={yValue}>{countMatrix[xValue][yValue]}</td>
                                        ))}
                                           <th>{rowTotals[xValue]}</th>
                                    </tr>
                                ))}
                                <tr>
                                    <th>Total</th>
                                    {uniqueYAxis.map((yValue) => (
                                        <th key={yValue}>{columnTotals[yValue]}</th>
                                    ))}
                                    <th>{grandTotal}</th> {/* Grand Total */}
                                </tr>
                            </tbody>
                        </table>

                        {/* MUI TABLE */}
                        {/* <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <span
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleSort('xAxis')}
                                            >
                                                {xAxis}\{yAxis}
                                                {sortConfig.key === 'xAxis' && sortConfig.direction === 'asc' ? (
                                                    <ArrowUpward />
                                                ) : (
                                                    <ArrowDownward />
                                                )}
                                            </span>
                                        </TableCell>
                                        {sortedYAxis.map((yValue) => (
                                            <TableCell key={yValue}>
                                                {yValue}

                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sortedXAxis.map((xValue) => (
                                        <TableRow key={xValue}>
                                            <TableCell>{xValue}</TableCell>
                                            {sortedYAxis.map((yValue) => (
                                                <TableCell key={yValue}>{countMatrix[xValue][yValue]}</TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer> */}

                        <Box sx={{ m: 2 }}>
                            <Button onClick={exportToExcel}>Download as Excel</Button>
                        </Box>
                    </div>
                )}

            </div>

        </div>
    )
}

export default TableData