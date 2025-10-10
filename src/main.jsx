import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Import all providers
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ProductProvider } from "./context/ProductContext";
import { VendorProvider } from "./context/VendorContext";
import { NotificationProvider } from "./context/NotificationContext";
import { PromotionProvider } from "./context/PromotionContext";
import { ReviewProvider } from "./context/ReviewContext";
import { AnalyticsProvider } from "./context/AnalyticsContext";
import { AIProvider } from "./context/AIContext";
import { SocialProvider } from "./context/SocialContext";
import { ARProvider } from "./context/ARContext";
import { CategoryProvider } from "./context/CategoryContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <ProductProvider>
        <AIProvider>
          <SocialProvider>
            <ARProvider>
              <NotificationProvider>
                <PromotionProvider>
                  <ReviewProvider>
                    <AnalyticsProvider>
                      <VendorProvider>
                        <CartProvider>
                          <WishlistProvider>
                            <CategoryProvider>
                              <App />
                            </CategoryProvider>
                          </WishlistProvider>
                        </CartProvider>
                      </VendorProvider>
                    </AnalyticsProvider>
                  </ReviewProvider>
                </PromotionProvider>
              </NotificationProvider>
            </ARProvider>
          </SocialProvider>
        </AIProvider>
      </ProductProvider>
    </AuthProvider>
  </React.StrictMode>
);
