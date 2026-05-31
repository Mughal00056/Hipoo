import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Sparkles, 
  Heart, 
  ShoppingBag, 
  TrendingUp, 
  Filter, 
  Star, 
  RotateCcw, 
  ArrowRight, 
  Search, 
  SlidersHorizontal,
  ChevronDown,
  Info,
  CheckCircle,
  Clock,
  ShieldAlert
} from 'lucide-react';

import { Product, CartItem, UserProfile, DownloadProvider, Review } from './types';
import { INITIAL_PRODUCTS } from './data';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';

export default function App() {
  // Theme Configuration (Light vs Dark)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const cached = localStorage.getItem('aether-theme');
    if (cached === 'light' || cached === 'dark') return cached;
    return 'dark'; // Cool, high-contrast dark theme by default
  });

  // Products Data
  const [products, setProducts] = useState<Product[]>(() => {
    const cached = localStorage.getItem('aether-products');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  // Shopping Cart Products
  const [cart, setCart] = useState<CartItem[]>(() => {
    const cached = localStorage.getItem('aether-cart');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Logged-in User Profile
  const [user, setUser] = useState<UserProfile>(() => {
    const cached = localStorage.getItem('aether-user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Return default guest state
      }
    }
    return {
      email: '',
      name: '',
      avatar: '',
      isLoggedIn: false,
      wishlistIds: [],
      purchasedProducts: []
    };
  });

  // UI Visibility States
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Search & Filter state variables
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(149);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);

  // Checkout meta-state passed from Cart checkout trigger
  const [appliedPromo, setAppliedPromo] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Welcome Toast banner setting
  const [showToast, setShowToast] = useState<string>('');

  // Settle theme transformations on root document
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('aether-theme', theme);
  }, [theme]);

  // Synchronizers to local storage
  useEffect(() => {
    localStorage.setItem('aether-products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('aether-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('aether-user', JSON.stringify(user));
  }, [user]);

  // Trigger quick alerts
  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => {
      setShowToast('');
    }, 4000);
  };

  // Add to Wishlist Toggle
  const handleToggleWishlist = (productId: string) => {
    if (!user.isLoggedIn) {
      triggerToast('🔒 Please setup your Account Credentials to save favorites!');
      setIsAuthModalOpen(true);
      return;
    }

    const exists = user.wishlistIds.includes(productId);
    const updatedWishlist = exists
      ? user.wishlistIds.filter(id => id !== productId)
      : [...user.wishlistIds, productId];

    setUser(prev => ({
      ...prev,
      wishlistIds: updatedWishlist
    }));

    triggerToast(exists ? '💔 Item removed from saved Wishlist.' : '❤️ Saved to your Wishlist!');
  };

  // Direct remove from wishlist inside dashboard
  const handleRemoveFromWishlist = (productId: string) => {
    setUser(prev => ({
      ...prev,
      wishlistIds: prev.wishlistIds.filter(id => id !== productId)
    }));
    triggerToast('💔 Item removed from saved Wishlist.');
  };

  // Add to Cart Action
  const handleAddToCart = (product: Product) => {
    // Check if product exists in cart
    const exists = cart.some(item => item.product.id === product.id);
    if (exists) {
      triggerToast('💼 Item is already inside your shopping cart!');
      setIsCartOpen(true);
      return;
    }

    // Check if user already owns it
    const alreadyOwns = user.purchasedProducts.some(p => p.productId === product.id);
    if (alreadyOwns) {
      triggerToast('🔑 You already purchased a lifetime license for this file!');
      return;
    }

    setCart(prev => [...prev, { product }]);
    triggerToast('🛒 Product added to shopping cart!');
  };

  // Quick single item Buy Now action
  const handleBuyNow = (product: Product) => {
    // Check if already owned
    const alreadyOwns = user.purchasedProducts.some(p => p.productId === product.id);
    if (alreadyOwns) {
      setSelectedProduct(product);
      triggerToast('🔑 You already own this asset! Direct download link unlocked.');
      return;
    }

    // Put alone inside cart and launch checkout directly
    const inCart = cart.some(item => item.product.id === product.id);
    if (!inCart) {
      setCart([{ product }]);
    }
    setAppliedPromo('');
    setDiscountAmount(0);
    setIsCheckoutOpen(true);
  };

  // Remove checkout item
  const handleRemoveItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // From Cart Drawer: Continue to Secure Checkout
  const handleTriggerCheckout = (discountCode: string, discAmt: number) => {
    setAppliedPromo(discountCode);
    setDiscountAmount(discAmt);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Checkout Payment cleared callback
  const handlePurchaseSuccess = (email: string, itemsPaid: { id: string; price: number; title: string; downloadUrl: string; provider: DownloadProvider }[]) => {
    const currentDateStr = new Date().toISOString().split('T')[0];
    
    // Convert paid items into lifetime license logs
    const newPurchases = itemsPaid.map(item => ({
      id: `purch-${Math.random().toString(36).substring(2, 7)}-${Date.now().toString().slice(-4)}`,
      productId: item.id,
      productTitle: item.title,
      purchaseDate: currentDateStr,
      amountPaid: item.price,
      downloadUrl: item.downloadUrl,
      provider: item.provider,
      unlockToken: `LIC-CODE-${item.provider.toUpperCase().split(' ')[0]}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    }));

    setUser(prev => ({
      ...prev,
      email: prev.email || email,
      isLoggedIn: true,
      name: prev.name || email.split('@')[0],
      avatar: prev.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
      purchasedProducts: [...prev.purchasedProducts, ...newPurchases]
    }));

    // Reset shopping cart
    setCart([]);
    triggerToast('🎉 Payment Verified! Digital links unlocked successfully.');
  };

  // Review Submissions Action
  const handleAddReview = (productId: string, newReview: Omit<Review, 'id' | 'date'>) => {
    const currentDate = new Date().toISOString().split('T')[0];
    const generatedId = `rev-${Math.random().toString(36).substring(2, 6)}-${Date.now()}`;
    
    const configuredReview: Review = {
      ...newReview,
      id: generatedId,
      date: currentDate
    };

    setProducts(prevProducts => {
      return prevProducts.map(prod => {
        if (prod.id !== productId) return prod;

        const updatedReviews = [configuredReview, ...prod.reviews];
        const sumRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
        const newAverageRating = parseFloat((sumRating / updatedReviews.length).toFixed(1));

        return {
          ...prod,
          reviews: updatedReviews,
          reviewsCount: updatedReviews.length,
          rating: newAverageRating
        };
      });
    });

    // Mirror change inside selectedDetail too, if active
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct(prev => {
        if (!prev) return null;
        const updatedReviews = [configuredReview, ...prev.reviews];
        const sumRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
        const newAverageRating = parseFloat((sumRating / updatedReviews.length).toFixed(1));
        return {
          ...prev,
          reviews: updatedReviews,
          reviewsCount: updatedReviews.length,
          rating: newAverageRating
        };
      });
    }

    triggerToast('⭐ Thank you for writing feedback. Review recorded live!');
  };

  // Sign In custom profile
  const handleLoginSuccess = (name: string, email: string, avatar: string) => {
    setUser(prev => ({
      ...prev,
      name,
      email,
      avatar,
      isLoggedIn: true
    }));
    triggerToast(`👋 Welcome back, ${name}! Your dev hub is initialized.`);
  };

  // Edit core credentials profile metrics
  const handleUpdateProfile = (name: string, email: string) => {
    setUser(prev => ({
      ...prev,
      name,
      email
    }));
    triggerToast('⚙️ Profile metrics synchronized correctly!');
  };

  // Account Logout Actions
  const handleLogout = () => {
    setUser({
      email: '',
      name: '',
      avatar: '',
      isLoggedIn: false,
      wishlistIds: [],
      purchasedProducts: []
    });
    setCart([]);
    triggerToast('🚪 Logged out safely.');
  };

  // Dynamic Filtering Logic
  const filteredProducts = products.filter(product => {
    // 1. Text Search matches title, tags, and category description
    const textQuery = searchQuery.toLowerCase().trim();
    const matchesKeyword = !textQuery || 
      product.title.toLowerCase().includes(textQuery) ||
      product.shortDescription.toLowerCase().includes(textQuery) ||
      product.tags.some(tag => tag.toLowerCase().includes(textQuery));

    // 2. Category Match
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;

    // 3. Price Match
    const matchesPrice = product.price <= maxPrice;

    // 4. Rating Match
    const matchesRating = product.rating >= minRating;

    return matchesKeyword && matchesCategory && matchesPrice && matchesRating;
  });

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
    }
    if (sortBy === 'price_asc') {
      return a.price - b.price;
    }
    if (sortBy === 'price_desc') {
      return b.price - a.price;
    }
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    // Default Sorting: Featured
    return b.reviewsCount - a.reviewsCount;
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setMaxPrice(149);
    setMinRating(0);
    setSortBy('featured');
    triggerToast('🔄 Filters restored to catalog defaults!');
  };

  // Featured and trending asset definitions
  const trendingAssets = products.filter(p => p.rating >= 4.8).slice(0, 3);

  return (
    <div className={`min-h-screen transition-colors duration-200 bg-zinc-50 text-zinc-900 dark:bg-[#050505] dark:text-slate-200 ${theme === 'dark' ? 'dark' : ''}`}>
      
      {/* Top Welcome Notification Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 16, x: '-50%' }}
            exit={{ opacity: 0, y: -40, x: '-50%' }}
            className="fixed top-0 left-1 /2 z-50 transform -translate-x-1/2 flex items-center gap-2 px-4.5 py-3 rounded-xl bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-sans font-semibold shadow-2xl border border-zinc-800 dark:border-zinc-200"
          >
            <span>{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main header Navigation */}
      <Navbar
        theme={theme}
        setTheme={setTheme}
        cart={cart}
        setIsCartOpen={setIsCartOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        user={user}
        setIsAuthModalOpen={setIsAuthModalOpen}
        setIsDashboardOpen={setIsDashboardOpen}
        onLogout={handleLogout}
        onBrandClick={() => {
          setActiveCategory('All');
          setSearchQuery('');
        }}
      />

      {/* Hero Head Banner */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pb-20 sm:pt-20 border-b border-zinc-200/50 dark:border-white/10 bg-white dark:bg-[#050505] transition-colors">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-5 dark:opacity-[0.03]">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-indigo-500 blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-violet-500 blur-3xl animate-bounce duration-10000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium tracking-wide bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 rounded-full border border-indigo-100/30 dark:border-indigo-500/25 mb-6 uppercase">
            <Sparkles className="w-3.5 h-3.5 animate-spin duration-3000" />
            <span>Encrypted Delivery Enforcer Ready</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tight leading-none text-zinc-900 dark:text-white max-w-4xl mx-auto uppercase">
            Build Faster with Premium <span className="bg-gradient-to-r from-indigo-600 via-violet-550 to-fuchsia-600 bg-clip-text text-transparent">Digital Assets</span>
          </h1>

          <p className="mt-4.5 text-base sm:text-lg text-zinc-500 dark:text-slate-450 max-w-2xl mx-auto">
            Browse premium React templates, figma UI kits, security backend scripts, and expert Gemini prompts. Experience secure instant unlocks delivered via Dropbox, Drive, or CDNs.
          </p>

          {/* Quick Mobile Search Bar Input */}
          <div className="mt-8 max-w-lg mx-auto md:hidden relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4.5 w-4.5 text-zinc-550 dark:text-zinc-500" />
            </div>
            <input
              id="mobile-search-banner"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search UI components, templates..."
              className="w-full pl-9.5 pr-4 py-3 text-xs bg-zinc-100 dark:bg-zinc-900 border border-transparent rounded-xl outline-none text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Highlights of platform */}
          <div className="mt-10 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 border-t border-zinc-100 dark:border-white/10">
            <div className="p-3 text-center bg-zinc-50 dark:bg-white/[0.02] rounded-xl border border-zinc-150/40 dark:border-white/10">
              <span className="block font-mono text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">0%</span>
              <span className="text-[10px] font-mono text-zinc-405 dark:text-slate-400 uppercase tracking-widest mt-0.5">Upload Bulk Bloat</span>
            </div>
            <div className="p-3 text-center bg-zinc-50 dark:bg-white/[0.02] rounded-xl border border-zinc-150/40 dark:border-white/10">
              <span className="block font-sans text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">PRO</span>
              <span className="text-[10px] font-mono text-zinc-405 dark:text-slate-400 uppercase tracking-widest mt-0.5">External links</span>
            </div>
            <div className="p-3 text-center bg-zinc-50 dark:bg-white/[0.02] rounded-xl border border-zinc-150/40 dark:border-white/10">
              <span className="block font-mono text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">100%</span>
              <span className="text-[10px] font-mono text-zinc-405 dark:text-slate-400 uppercase tracking-widest mt-0.5">SSL Secured Portal</span>
            </div>
            <div className="p-3 text-center bg-zinc-50 dark:bg-white/[0.02] rounded-xl border border-zinc-150/40 dark:border-white/10">
              <span className="block font-mono text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">LIFETIME</span>
              <span className="text-[10px] font-mono text-zinc-405 dark:text-slate-400 uppercase tracking-widest mt-0.5">Free product updates</span>
            </div>
          </div>

        </div>
      </section>

      {/* Primary catalog dashboard layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Secondary Navigation with active filters and filters toggles */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Side FILTER SYSTEM desktop panel */}
          <aside className="w-full lg:w-64 shrink-0 bg-white dark:bg-[#070707] p-5 rounded-2xl border border-zinc-200/80 dark:border-white/10 space-y-6 lg:sticky lg:top-24">
            
            <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-white/10 font-sans">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-zinc-450 dark:text-slate-400">
                <SlidersHorizontal className="w-4.5 h-4.5 text-indigo-500" />
                <span>Filters</span>
              </div>
              
              <button
                id="reset-filters-anchor"
                onClick={handleResetFilters}
                className="text-[10.5px] font-sans font-bold text-indigo-550 hover:text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-0.5"
                title="Settle filter defaults"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Price Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-400 font-mono text-[10px] uppercase">Max Price Cap:</span>
                <span className="font-mono text-zinc-900 dark:text-indigo-400">${maxPrice}</span>
              </div>
              <input
                id="filter-price-slider"
                type="range"
                min="0"
                max="149"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-450"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                <span>$0 (Free)</span>
                <span>$149+</span>
              </div>
            </div>

            {/* Minimum Client Star Ratings threshold */}
            <div className="space-y-2">
              <span className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">Min Stars Rating:</span>
              <div className="flex flex-col gap-1.5">
                {[0, 4, 4.5, 4.8].map((score) => {
                  const isActive = minRating === score;
                  return (
                    <button
                      id={`star-filter-btn-${score}`}
                      key={score}
                      onClick={() => setMinRating(score)}
                      className={`text-left text-xs p-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-semibold border border-indigo-150/40 dark:border-indigo-500/30'
                          : 'bg-transparent text-zinc-500 dark:text-slate-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-950 dark:hover:text-white border border-transparent'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {score === 0 ? (
                          <span>Any Customer Score</span>
                        ) : (
                          <>
                            <span>{score}+ Stars rating</span>
                            <span className="flex text-amber-400 font-bold">★</span>
                          </>
                        )}
                      </span>
                      {score > 0 && (
                        <span className="text-[10px] text-zinc-400 dark:text-slate-500 font-mono">
                          {products.filter(p => p.rating >= score).length} items
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delivery channel info flag */}
            <div className="p-3.5 bg-zinc-50 dark:bg-white/[0.015] rounded-xl border border-zinc-150/40 dark:border-white/10 space-y-1">
              <span className="text-[9px] font-mono uppercase bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded font-bold">Instant Release</span>
              <p className="text-[10px] text-zinc-[505] dark:text-slate-400 leading-normal">
                No storage account signup requested. Secure direct download assets unlock instantly in your browser on cleared checkout actions.
              </p>
            </div>

            {/* Pro Membership Banner */}
            <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl">
              <p className="text-xs font-semibold text-indigo-300 font-sans">Pro Membership</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal font-sans">
                Get 20% off all assets and early access to drops.
              </p>
              <button 
                onClick={() => {
                  if (user.isLoggedIn) {
                    triggerToast("💎 You have a virtual Pro Membership active!");
                  } else {
                    setIsAuthModalOpen(true);
                  }
                }}
                className="w-full mt-3 bg-white/10 hover:bg-white/20 py-2 rounded-lg text-[11px] font-bold text-white transition-all cursor-pointer text-center"
              >
                Upgrade Now
              </button>
            </div>

          </aside>

          {/* Right catalog items list */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Catalog Grid Bar Header */}
            <div className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-3 bg-white dark:bg-white/[0.02] p-4 border border-zinc-200/50 dark:border-white/10 rounded-2xl">
              <div>
                <p className="text-xs font-mono text-zinc-505 dark:text-slate-400 uppercase">Assets Catalogue</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-sm font-sans font-bold text-zinc-800 dark:text-white">
                    {sortedProducts.length} premium element{sortedProducts.length !== 1 ? 's' : ''} found
                  </span>
                  {activeCategory !== 'All' && (
                    <span className="text-xs font-mono bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded text-zinc-500 dark:text-slate-300 border border-transparent dark:border-white/10">
                      in {activeCategory}
                    </span>
                  )}
                </div>
              </div>

              {/* Sorting triggers */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-zinc-405 font-mono text-[10px] uppercase shrink-0 dark:text-slate-400">Sort By:</span>
                <select
                  id="sort-products-picker"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-zinc-500/5 border border-zinc-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-medium font-sans outline-none focus:border-indigo-500 select-none text-zinc-850 dark:text-slate-200 cursor-pointer"
                >
                  <option className="bg-white dark:bg-[#0a0a0a]" value="featured">🔥 High Rating</option>
                  <option className="bg-white dark:bg-[#0a0a0a]" value="newest">📅 Newest Arrivals</option>
                  <option className="bg-white dark:bg-[#0a0a0a]" value="price_asc">📈 Price: Low to High</option>
                  <option className="bg-white dark:bg-[#0a0a0a]" value="price_desc">📉 Price: High to Low</option>
                  <option className="bg-white dark:bg-[#0a0a0a]" value="rating">⭐ Average Stars Scored</option>
                </select>
              </div>
            </div>

            {/* Sorted list grids */}
            {sortedProducts.length === 0 ? (
              <div className="py-24 text-center space-y-4 bg-white dark:bg-zinc-950 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-900">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-350 dark:text-zinc-650 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-sans font-bold text-zinc-900 dark:text-zinc-50">No files matched search bounds!</h4>
                  <p className="text-xs text-zinc-455 dark:text-zinc-400 max-w-sm mx-auto">
                    Try shifting your pricing threshold slider, checking other filter tags, or tweaking prompt texts.
                  </p>
                </div>
                <button
                  id="not-found-reset-btn"
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Restore Search Catalog Defaults
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                <AnimatePresence mode="popLayout">
                  {sortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpenDetails={setSelectedProduct}
                      onAddToCart={handleAddToCart}
                      onBuyNow={handleBuyNow}
                      isWishlisted={user.wishlistIds.includes(product.id)}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Trending assets section */}
            {searchQuery === '' && activeCategory === 'All' && (
              <div className="pt-8 border-t border-zinc-200/50 dark:border-white/5">
                <div className="flex items-center gap-2 mb-6 font-sans">
                  <TrendingUp className="w-4.5 h-4.5 text-indigo-500" />
                  <h3 className="font-display font-black text-xs sm:text-sm uppercase tracking-wide text-zinc-900 dark:text-slate-205">Trending High-Rated Assets</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {trendingAssets.map(asset => (
                    <div
                      id={`trending-card-${asset.id}`}
                      key={asset.id}
                      onClick={() => setSelectedProduct(asset)}
                      className="p-3.5 bg-white dark:bg-white/[0.015] hover:bg-zinc-100/10 dark:hover:bg-white/5 rounded-xl border border-zinc-200/50 dark:border-white/10 cursor-pointer flex gap-3.5 transition-colors group"
                    >
                      <img
                        src={asset.previewImage}
                        alt={asset.title}
                        className="w-16 h-12 object-cover rounded-lg shrink-0 border border-zinc-105 dark:border-white/10"
                      />
                      <div className="min-w-0 pr-1 flex flex-col justify-center font-sans">
                        <span className="text-[9.5px] font-mono text-zinc-400 uppercase tracking-widest">{asset.category}</span>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {asset.title}
                        </h4>
                        <div className="flex items-center gap-1 text-[10.5px] text-amber-400 mt-0.5">
                          <span>★ {asset.rating}</span>
                          <span className="text-zinc-400">({asset.reviewsCount} reviews)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Recent Purchase Activity / Mini Widget */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-zinc-200/50 dark:border-white/5 pt-8 gap-4 font-mono text-[10px]">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-1.5">
              <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#050505] bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">A</div>
              <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#050505] bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold">B</div>
              <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#050505] bg-amber-500 flex items-center justify-center text-[10px] text-white font-bold">C</div>
            </div>
            <p className="text-zinc-500 dark:text-slate-400 text-xs font-sans">
              <span className="text-zinc-900 dark:text-white font-semibold">4.8k+ creators</span> recently updated their assets library
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-[#070707] rounded-full border border-zinc-200 dark:border-[#1a1a1a] text-[10px] text-zinc-400 leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Cloud Sync Active
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-[#070707] rounded-full border border-zinc-200 dark:border-[#1a1a1a] text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">
              v2.4.1
            </div>
          </div>
        </div>

      </main>

      {/* Footer Branding */}
      <footer className="border-t border-zinc-200/60 dark:border-white/10 bg-white dark:bg-[#0a0a0a] transition-colors py-10 mt-16 text-xs text-zinc-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <span className="font-sans font-bold text-sm text-zinc-750 dark:text-white uppercase tracking-tighter">
              Aether<span className="text-indigo-550 font-light">Vault</span>
            </span>
            <p className="text-[10px] mt-1 text-zinc-450 dark:text-slate-500">© 2026 Sandbox Enforcer Marketplace. All rights reserved. Created in Cloud Native Workspace.</p>
          </div>

          <div className="flex gap-4.5 text-[10px] font-semibold text-zinc-500">
            <span>PCI-DSS Secured Gateway</span>
            <span>•</span>
            <span>External-Link Enforcer Policy</span>
            <span>•</span>
            <span>No-Blob Zero Uploads</span>
          </div>
        </div>
      </footer>

      {/* RENDER MODAL OUTLETS */}
      
      {/* 1. Shopping Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cart={cart}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onTriggerCheckout={handleTriggerCheckout}
          />
        )}
      </AnimatePresence>

      {/* 2. Secure Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            cart={cart}
            subtotal={cart.reduce((sum, item) => sum + item.product.price, 0)}
            discountAmount={discountAmount}
            discountCode={appliedPromo}
            onPurchaseSuccess={handlePurchaseSuccess}
            userEmail={user.email}
          />
        )}
      </AnimatePresence>

      {/* 3. Authentication Setup Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </AnimatePresence>

      {/* 4. Customer User Dashboard Portal */}
      <AnimatePresence>
        {isDashboardOpen && (
          <Dashboard
            isOpen={isDashboardOpen}
            onClose={() => setIsDashboardOpen(false)}
            user={user}
            allProducts={products}
            onRemoveFromWishlist={handleRemoveFromWishlist}
            onAddToCart={handleAddToCart}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </AnimatePresence>

      {/* 5. Product Detail Modal panel */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            isPurchased={user.purchasedProducts.some(p => p.productId === selectedProduct.id)}
            onAddReview={handleAddReview}
            user={user}
            setIsAuthModalOpen={setIsAuthModalOpen}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
