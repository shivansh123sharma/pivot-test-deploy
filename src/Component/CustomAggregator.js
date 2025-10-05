import React from "react";
import PivotTableUI from "react-pivottable/PivotTableUI";
import "react-pivottable/pivottable.css";
// import * as PivotTable from "react-pivottable";
import PivotTable from "react-pivottable/PivotTable";

const CustomAggregator = () => {
  PivotTable.aggregators.CustomSum = function () {
    return (data, rowKey, colKey) => {
      let sum = 0;
      data.forEach((item) => {
        sum += item.value || 0;
      });
      return { value: sum };
    };
  };

  return (
    <PivotTableUI
      data={[{ attr: "A", value: 20 }, { attr: "B", value: 30 }]}
      aggregatorName="CustomSum"
      vals={["value"]}
    />
  );
};

export default CustomAggregator;
