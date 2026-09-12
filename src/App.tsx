import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { useState } from "react";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MobileTabBar } from "@/components/site/MobileTabBar";
import { SearchDialog } from "@/components/site/SearchDialog";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { ShopProvider } from "@/lib/shop-store";
import { ScrollToTop } from "@/components/ScrollToTop";
import { GlobalBackButton } from "@/components/GlobalBackButton";

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
import CareersPage from "./routes/careers";
import AdminPage from "./routes/_authenticated/admin";

function SiteLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col w-full max-w-full overflow-x-hidden">
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">
        <GlobalBackButton />
        <Outlet />
      </main>
      <Footer />
      <MobileTabBar onSearch={() => setSearchOpen(true)} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <Toaster position="top-center" />
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

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ShopProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route element={<SiteLayout />}>
                <Route path="/" element={<IndexPage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/collection/:slug" element={<CollectionPage />} />
                <Route path="/product/:slug" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                
                {/* Authenticated Routes - we will handle auth guards in components */}
                <Route path="/account" element={<AccountPage />} />
                <Route path="/order/:id" element={<OrderDetailPage />} />
                <Route path="/admin" element={<AdminPage />} />
                
                <Route path="/track-order" element={<TrackOrderPage />} />
                <Route path="/story" element={<StoryPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faqs" element={<FaqsPage />} />
                <Route path="/returns" element={<ReturnsPage />} />
                <Route path="/shipping" element={<ShippingPage />} />
                <Route path="/policies" element={<PoliciesPage />} />
                <Route path="/careers" element={<CareersPage />} />
                
                <Route path="*" element={<NotFoundComponent />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ShopProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
