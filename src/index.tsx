import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css"; // ← Importa o CSS personalizado
import App from "./App";

//const root = ReactDOM.createRoot(document.getElementById("root"));
const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
