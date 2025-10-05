import React, { Suspense } from "react";

// Lazy-load heavy components
const Plot = React.lazy(() => import("react-plotly.js"));
const Handsontable = React.lazy(() => import("@handsontable/react"));

function App() {
  const data = [
    ["Year", "Sales", "Expenses"],
    ["2019", 1000, 400],
    ["2020", 1170, 460],
    ["2021", 660, 1120],
    ["2022", 1030, 540]
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1>PivotTable & Charts Demo</h1>

      <Suspense fallback={<div>Loading Table...</div>}>
        <div style={{ marginBottom: "40px" }}>
          <Handsontable
            data={data}
            colHeaders={true}
            rowHeaders={true}
            width="600"
            height="200"
            licenseKey="non-commercial-and-evaluation"
          />
        </div>
      </Suspense>

      <Suspense fallback={<div>Loading Chart...</div>}>
        <Plot
          data={[
            { x: ["2019", "2020", "2021", "2022"], y: [1000, 1170, 660, 1030], type: "bar", name: "Sales" },
            { x: ["2019", "2020", "2021", "2022"], y: [400, 460, 1120, 540], type: "bar", name: "Expenses" }
          ]}
          layout={{ width: 600, height: 400, title: "Sales vs Expenses" }}
        />
      </Suspense>
    </div>
  );
}

export default App;
