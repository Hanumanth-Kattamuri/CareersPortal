import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Global styles
document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.boxSizing = "border-box";
document.body.style.fontFamily = "'Poppins', sans-serif";
document.body.style.backgroundColor = "#f5f7fb";
document.body.style.color = "#1e293b";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
