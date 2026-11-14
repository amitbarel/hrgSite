import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { prefetch } from "./api.js";
import "./tailwind.css";
import "./styles.css";

// כל הנתונים של האתר קטנים, אז טוענים אותם כבר בכניסה
prefetch("/summary", "/games", "/players");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
