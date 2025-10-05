import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading App...</div>}>
      <App />
    </Suspense>
  </React.StrictMode>
);
