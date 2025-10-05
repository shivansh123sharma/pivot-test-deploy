import React, { useState } from "react";
import PivotTableUI from "react-pivottable/PivotTableUI";
import "react-pivottable/pivottable.css";
import Select from "react-select";
import PivotTable from "react-pivottable/PivotTable";
import * as XLSX from "xlsx";
import Plot from 'react-plotly.js';
import createPlotlyRenderers from 'react-pivottable/PlotlyRenderers';
import { min } from "lodash";
import "./CustomPivotTable.css";

// import TestingData from "../TestingData";

// Sample data
// const data = [
//   { Attribute: "A", Category: "X", Value: 10 },
//   { Attribute: "B", Category: "Y", Value: 20 },
//   { Attribute: "C", Category: "Z", Value: 30 },
// ];

const CustomPivotTable = ({ data }) => {
  // Available fields for selection
  const fields = [
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
  ];

  // State to store selected rows and columns
  const [rows, setRows] = useState([]);
  const [cols, setCols] = useState([]);
  const [pivotState, setPivotState] = useState({
    rows: [],
    cols: [],
    vals: ["Value"],
    aggregatorName: "Sum",
  });
  const [outputType, setOutputType] = useState("Table"); // For Type selection

  // Handle row and column selection
  const handleRowChange = (selectedOptions) => {
    setRows(selectedOptions.map((opt) => opt.value));
    setPivotState((prev) => ({ ...prev, rows: selectedOptions.map((opt) => opt.value) }));
  };

  const handleColChange = (selectedOptions) => {
    setCols(selectedOptions.map((opt) => opt.value));
    setPivotState((prev) => ({ ...prev, cols: selectedOptions.map((opt) => opt.value) }));
  };

  // Handle type selection (Table, Chart, etc.)
  const handleTypeChange = (selectedOption) => {
    setOutputType(selectedOption.value);
  };

  const handleDownload = () => {
    // Find the rendered pivot table in the DOM
    const table = document.querySelector(".pvtTable");
    if (!table) {
      alert("No table to export!");
      return;
    }

    // Convert the HTML table to a worksheet
    const workbook = XLSX.utils.table_to_book(table);
    XLSX.writeFile(workbook, "PivotTable.xlsx"); // Save the Excel file
  };

  // PivotTable Plotly Renderers
  const plotlyRenderers = createPlotlyRenderers();

  // Extract dynamic x and y data based on rows and columns
  const getChartData = () => {
    // Aggregate data based on rows and columns
    const xData = data.map((item) => item[rows[0]]); // Select x data from selected rows
    const yData = data.map((item) => item[cols[0]]); // Select y data from selected columns

    return { x: xData, y: yData };
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: 'flex' ,justifyContent:'space-between',gap:'20px'}}>
        <div style={{width:350}}>
          {/* Row Selection */}
          <label>Select Rows:</label>
          <Select
            options={fields.map((field) => ({ value: field, label: field }))}
            isMulti
            value={rows.map((row) => ({ value: row, label: row }))}
            onChange={handleRowChange}
          />
        </div>

        <div style={{width:350}}>
          {/* Column Selection */}
          <label style={{ marginTop: "10px" }}>Select Columns:</label>
          <Select
            options={fields.map((field) => ({ value: field, label: field }))}
            isMulti
            value={cols.map((col) => ({ value: col, label: col }))}
            onChange={handleColChange}
          />
        </div>

        <div style={{width:350}}>
          {/* Output Type Selector (Table, Chart, etc.) */}
          <label style={{ marginTop: "10px" }}>Select Output Type:</label>
          <Select
            options={[
              { value: "Table", label: "Table" },
              { value: "Bar", label: "Bar Chart" },
              // { value: "Line", label: "Line Chart" },
            ]}
            value={{ value: outputType, label: outputType }}
            onChange={handleTypeChange}
          />
        </div>
      </div>


      {/* Pivot Table */}
      {/* <PivotTableUI
        data={data}
        onChange={(s) => setPivotState(s)}
        {...pivotState}
        renderers={PivotTableUI.renderers}
      /> */}
      {/* Pivot Table */}
      <div style={{}}>
        {outputType === "Table" && (
          <PivotTable
            data={data}
            rows={rows}
            cols={cols}
            // vals={["Value"]}
            aggregatorName="Count"
            rendererName="Table"
          />
        )}

        {(outputType === "Bar" || outputType === "Line") && (
          <Plot
            data={[
              {
                x: getChartData().x, // Dynamically change x-axis
                y: getChartData().y, // Dynamically change y-axis
                type: outputType.toLowerCase(),
                mode: "lines+markers",
                marker: { color: "blue" },
              },
            ]}
            layout={{
              title: `${outputType} Chart`,
              xaxis: { title: rows[0] || "Category" },
              yaxis: { title: cols[0] || "Value" },
            }}
          />
        )}
      </div>
      <button onClick={handleDownload}>Download Table</button>
    </div>
  );
};

export default CustomPivotTable;
