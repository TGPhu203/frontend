import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import ReactDOM from "react-dom/client";
import { CartProvider } from "./components/CartContext.tsx";
import { WishlistProvider } from "./components/WishlistContext.tsx";
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <WishlistProvider>
        <CartProvider>
          <App />
        </CartProvider>
        </WishlistProvider>
    </React.StrictMode>
  );