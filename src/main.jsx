import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

const container = document.getElementById("root");

try {
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Render error:", error);
  container.innerHTML = `
    <div style="padding:24px;font-family:Inter,system-ui,sans-serif;">
      <h1 style="margin:0 0 8px;">Не удалось загрузить интерфейс</h1>
      <p style="margin:0;">Проверьте, что приложение запущено через <code>npm run dev</code> или <code>npm run build && npm run preview</code>.</p>
    </div>
  `;
}
