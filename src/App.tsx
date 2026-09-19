import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { ShopProvider } from "@/lib/shop-store";
import { ScrollToTop } from "@/components/ScrollToTop";
import { GlobalBackButton } from "@/components/GlobalBackButton";
import { ThemeProvider } from "@/components/theme-provider";
import { CartDrawer } from "@/components/site/CartDrawer";

// Pages
import IndexPage from "./routes/index";
import ShopPage from "./routes/shop";
import CategoryPage from "./routes/category.$slug";
import CollectionPage from "./routes/collection.$slug";
import ProductPage from "./routes/product.$slug";
import CartPage from "./routes/cart";
import CheckoutPage from "./routes/checkout";
import AuthPage from "./routes/auth";
import WishlistPage from "./routes/wishlist";
import AccountPage from "./routes/_authenticated/account";
import OrderDetailPage from "./routes/_authenticated/order.$id";
import TrackOrderPage from "./routes/track-order";
import StoryPage from "./routes/story";
import ContactPage from "./routes/contact";
import FaqsPage from "./routes/faqs";
import ReturnsPage from "./routes/returns";
import ShippingPage from "./routes/shipping";
import PoliciesPage from "./routes/policies";
import AdminPage from "./routes/_authenticated/admin";
import JournalPage from "./routes/journal";
import ArticlePage from "./routes/journal.$slug";

function SiteLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="flex min-h-screen flex-col w-full max-w-full">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {isHomePage && <Footer />}
      <CartDrawer />
      <Toaster position="top-center" duration={1500} />
    </div>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 font-display text-4xl">This page has moved house</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for doesn't exist any more. Let's get you back to the good stuff.
        </p>
        <div className="mt-6">
          <a
            href="/shop"
            className="inline-flex items-center justify-center rounded-sm bg-primary px-5 py-2.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Browse décor
          </a>
        </div>
      </div>
    </div>
  );
}

import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";

function SplashHandler() {
  useEffect(() => {
    // Enforce a strict visual intro duration of 1.8s (1.5 - 2s target)
    // without waiting for API calls or assets
    const timer = setTimeout(() => {
      const splash = document.getElementById("aarohan-splash");
      if (splash && !splash.classList.contains("fade-out")) {
        splash.classList.add("fade-out");
        setTimeout(() => splash.remove(), 800);
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return null;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse font-medium text-muted-foreground">Verifying access...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth?returnTo=/admin" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

const queryClient = new QueryClient();

export function App() {
  // Ensure the splash screen has an absolute maximum fail-safe timeout
  // in case something outside React blocks initialization indefinitely.
  // This satisfies the requirement that it "cannot remain stuck indefinitely".
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      const splash = document.getElementById("aarohan-splash");
      if (splash && !splash.classList.contains("fade-out")) {
        splash.classList.add("fade-out");
        setTimeout(() => splash.remove(), 800);
      }
    }, 5000); // Safety net: max time before forcing splash screen to hide
    return () => clearTimeout(fallbackTimer);
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="aarohan-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SplashHandler />
          <ShopProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route element={<SiteLayout />}>
                  <Route index element={<IndexPage />} />
                  <Route path="shop" element={<ShopPage />} />
                  <Route path="category/:slug" element={<CategoryPage />} />
                  <Route path="collection/:slug" element={<CollectionPage />} />
                  <Route path="product/:slug" element={<ProductPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="auth" element={<AuthPage />} />
                  <Route path="wishlist" element={<WishlistPage />} />

                  {/* Authenticated Routes - we will handle auth guards in components */}
                  <Route path="account" element={<AccountPage />} />
                  <Route path="order/:id" element={<OrderDetailPage />} />

                  <Route path="journal" element={<JournalPage />} />
                  <Route path="journal/:slug" element={<ArticlePage />} />

                  <Route path="track-order" element={<TrackOrderPage />} />
                  <Route path="story" element={<StoryPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="faqs" element={<FaqsPage />} />
                  <Route path="returns" element={<ReturnsPage />} />
                  <Route path="shipping" element={<ShippingPage />} />
                  <Route path="policies" element={<PoliciesPage />} />

                  <Route path="*" element={<NotFoundComponent />} />
                </Route>

                {/* Admin Routes - Completely separate from SiteLayout */}
                <Route 
                  path="/admin/*" 
                  element={
                    <AdminGuard>
                      <AdminPage />
                    </AdminGuard>
                  } 
                />
              </Routes>
            </BrowserRouter>
          </ShopProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
