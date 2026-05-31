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

  // Splash Screen Active State
  const [isSplashActive, setIsSplashActive] = useState<boolean>(true);
  const [splashProgress, setSplashProgress] = useState<number>(0);
  const [splashLogIndex, setSplashLogIndex] = useState<number>(0);

  // Top Slider Active Announcement State
  const [announcementIndex, setAnnouncementIndex] = useState<number>(0);

  // Spotlight Product Slider State
  const [spotlightIndex, setSpotlightIndex] = useState<number>(0);

  const SPLASH_LOGS = [
    "Initializing secure digital asset sandbox...",
    "Connecting to AetherVault secure mirrors...",
    "Decrypting file ingestion keys...",
    "Validating secure download protocol bounds...",
    "Setting up local sandbox storage variables...",
    "Active sync confirmed. Decrypted portal live!"
  ];

  const ANNOUNCEMENTS = [
    "🔥 EXCLUSIVE PROMO: Get 25% OFF on all React templates & UI kits using code VAULT25!",
    "⚡ SECURE SECRETS: Direct Dropbox & Drive browser unlocks, no registered logins requested!",
    "🛡️ SANDBOX GUARANTEE: Lightweight, verified, production-ready source scripts!",
    "💎 ACTIVE SPOTLIGHTS: Upgraded catalog features direct source updates every week!"
  ];

  // Splash and Top Bar Announcement timer configurations
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let logInterval: NodeJS.Timeout;

    progressInterval = setInterval(() => {
      setSplashProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setIsSplashActive(false), 550);
          return 100;
        }
        const step = Math.floor(Math.random() * 9) + 7;
        return Math.min(prev + step, 100);
      });
    }, 110);

    logInterval = setInterval(() => {
      setSplashLogIndex((prev) => (prev < SPLASH_LOGS.length - 1 ? prev + 1 : prev));
    }, 320);

    const announcementTimer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);

    const spotlightTimer = setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % 3); // rotate among top 3 assets
    }, 6000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(logInterval);
      clearInterval(announcementTimer);
      clearInterval(spotlightTimer);
    };
  }, []);

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
  const spotlightProducts = products.filter(p => p.rating >= 4.7).slice(0, 3);

  return (
    <div className={`min-h-screen transition-colors duration-200 bg-zinc-50 text-zinc-900 dark:bg-[#050505] dark:text-slate-200 ${theme === 'dark' ? 'dark' : ''}`}>
      
      {/* 0. Luxury Sci-Fi Splash Screen loading overlay */}
      <AnimatePresence>
        {isSplashActive && (
          <motion.div
            id="aether-splash-screen"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              scale: 1.05,
              filter: "blur(8px)",
              transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
            }}
            className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#050505] text-white overflow-hidden p-6 select-none"
          >
            {/* Background cyber mesh ambient lights */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

            <div className="max-w-md w-full text-center space-y-8 relative">
              {/* Spinning Logo Container */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-fuchsia-600 p-[1.5px] shadow-2xl shadow-indigo-500/30 flex items-center justify-center relative group"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-fuchsia-600 blur-md opacity-50" />
                <div className="w-full h-full rounded-2xl bg-zinc-950 flex items-center justify-center text-white relative z-10">
                  <Sparkles className="w-8 h-8 text-indigo-400 stroke-[1.8] animate-pulse" />
                </div>
              </motion.div>

              {/* Title Header paired with tracking effects */}
              <div className="space-y-2 font-display">
                <motion.h1
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="font-black text-3xl sm:text-4xl tracking-tighter uppercase"
                >
                  Aether<span className="text-indigo-500 font-light">Vault</span>
                </motion.h1>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase"
                >
                  Premium Digital Artifacts Marketplace
                </motion.p>
              </div>

              {/* Progress Bar Loader & Labels */}
              <div className="space-y-4 pt-4">
                <div className="relative h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
                    style={{ width: `${splashProgress}%` }}
                    transition={{ ease: "easeOut" }}
                  />
                </div>
                
                {/* Micro numbers and interactive status logs */}
                <div className="flex items-center justify-between font-mono text-[9.5px]">
                  <div className="w-4/5 text-left text-zinc-400 truncate flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping shrink-0" />
                    <span>{SPLASH_LOGS[splashLogIndex]}</span>
                  </div>
                  <span className="text-zinc-300 font-bold ml-2 shrink-0">{splashProgress}%</span>
                </div>
              </div>

              {/* Secure sandbox protocol banner */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 0.6 }}
                className="text-[8px] font-mono tracking-widest text-zinc-600 uppercase pt-10"
              >
                Encrypted Connection SSL Secured • Build v2.4.1
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Announcement Sliding Promo Bar */}
      <div id="top-promo-slider" className="w-full bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 dark:from-zinc-950 dark:via-indigo-950/40 dark:to-zinc-950 border-b border-indigo-500/10 dark:border-white/5 py-2.5 sm:py-3 relative overflow-hidden text-white px-4">
        {/* Animated glowing border ray */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-pulse" />
        
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-mono relative">
          
          {/* Previous Arrow Control */}
          <button 
            onClick={() => setAnnouncementIndex((prev) => (prev === 0 ? ANNOUNCEMENTS.length - 1 : prev - 1))}
            className="p-1 hover:text-indigo-400 dark:hover:text-amber-400 transition-colors shrink-0 text-slate-400 cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded"
            title="Previous Announcement Item"
            aria-label="Previous Promo Notification"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
          </button>

          {/* Central Animated Text Content Area */}
          <div className="flex-1 overflow-hidden min-w-0 mx-4 h-5 flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={announcementIndex}
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="text-center text-[10px] sm:text-xs font-semibold text-slate-100 tracking-wide flex items-center justify-center gap-2 select-none"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="truncate">{ANNOUNCEMENTS[announcementIndex]}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next Arrow Control */}
          <button 
            onClick={() => setAnnouncementIndex((next) => (next + 1) % ANNOUNCEMENTS.length)}
            className="p-1 hover:text-indigo-400 dark:hover:text-amber-400 transition-colors shrink-0 text-slate-400 cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded"
            title="Next Announcement Item"
            aria-label="Next Promo Notification"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
          </button>
          
        </div>
      </div>
      
      {/* Top Welcome Notification Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 16, x: '-50%' }}
            exit={{ opacity: 0, y: -40, x: '-50%' }}
            className="fixed top-0 left-1/2 z-50 transform -translate-x-1/2 flex items-center gap-2 px-4.5 py-3 rounded-xl bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-sans font-semibold shadow-2xl border border-zinc-800 dark:border-zinc-200"
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
        
        {/* Spotlight Carousel Banner - Smooth Animated Slider of Top Rated Assets */}
        {searchQuery === '' && spotlightProducts.length > 0 && (
          <div id="catalog-spotlight-carousel" className="mb-10 bg-gradient-to-br from-indigo-950/40 via-[#070707] to-zinc-950 border border-indigo-500/10 dark:border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
            {/* Spotlight labels */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-indigo-500/10 blur-[90px] pointer-events-none -mr-20 -mt-20" />
            <div className="absolute -left-10 -bottom-10 w-64 h-64 rounded-full bg-violet-500/5 blur-[80px] pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                <span className="text-[11px] font-mono tracking-widest text-indigo-400 dark:text-indigo-300 uppercase font-black">Featured Spotlights</span>
              </div>
              
              {/* Sliding dot indicators */}
              <div className="flex items-center gap-2">
                {spotlightProducts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSpotlightIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      spotlightIndex === idx ? 'w-6 bg-indigo-500' : 'w-2 bg-zinc-700 dark:bg-white/10'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Sliding Container with slide & crossfade effect */}
            <div className="relative min-h-[290px] sm:min-h-[240px] md:min-h-[220px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={spotlightIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center"
                >
                  {/* Left Column for product image preview */}
                  <div className="md:col-span-4 relative group shrink-0">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-fuchsia-500/20 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
                    <img
                      src={spotlightProducts[spotlightIndex].previewImage}
                      alt={spotlightProducts[spotlightIndex].title}
                      className="w-full h-44 sm:h-48 md:h-40 object-cover rounded-2xl border border-white/5 shadow-md relative z-10 select-none pointer-events-none"
                    />
                    <div className="absolute top-3 left-3 bg-indigo-600 text-white font-mono text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider z-20">
                      {spotlightProducts[spotlightIndex].category}
                    </div>
                  </div>

                  {/* Right Column for content summaries */}
                  <div className="md:col-span-8 flex flex-col justify-between h-full space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-yellow-400 text-xs">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <span className="text-zinc-500 dark:text-zinc-400 font-mono">({spotlightProducts[spotlightIndex].reviewsCount} Verified)</span>
                      </div>
                      
                      <h3 className="text-xl sm:text-2xl font-display font-black text-zinc-900 dark:text-white leading-tight uppercase tracking-tight">
                        {spotlightProducts[spotlightIndex].title}
                      </h3>
                      
                      <p className="text-xs sm:text-sm text-zinc-500 dark:text-slate-400 max-w-xl leading-relaxed">
                        {spotlightProducts[spotlightIndex].shortDescription}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {spotlightProducts[spotlightIndex].tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] font-mono bg-zinc-100 dark:bg-white/5 border border-zinc-200/50 dark:border-white/5 py-1 px-2.5 rounded-md text-zinc-600 dark:text-slate-400">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Interactive Triggers */}
                    <div className="flex items-center gap-3.5 pt-2 border-t border-zinc-100 dark:border-white/5">
                      <span className="text-xl font-display font-black text-indigo-600 dark:text-indigo-400">
                        {spotlightProducts[spotlightIndex].price === 0 ? '$FREE' : `$${spotlightProducts[spotlightIndex].price}`}
                      </span>
                      
                      <button
                        onClick={() => setSelectedProduct(spotlightProducts[spotlightIndex])}
                        className="px-4.5 py-2 bg-zinc-900 border border-white/5 hover:bg-zinc-805 text-zinc-100 text-xs font-semibold rounded-xl active:scale-98 transition-all cursor-pointer font-sans"
                      >
                        Inspect Resource
                      </button>

                      <button
                        onClick={() => handleBuyNow(spotlightProducts[spotlightIndex])}
                        className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 text-xs font-bold rounded-xl active:scale-98 transition-all cursor-pointer font-sans shadow-md shadow-indigo-500/10"
                      >
                        Instant Checkout
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Next/Prev buttons overlay */}
            <div className="absolute right-6 bottom-6 flex items-center gap-2 z-20">
              <button
                onClick={() => setSpotlightIndex((prev) => (prev === 0 ? spotlightProducts.length - 1 : prev - 1))}
                className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-slate-400 hover:text-white flex items-center justify-center border border-white/5 transition-all active:scale-90 cursor-pointer"
                title="Swipe Spotlight Left"
                aria-label="Previous Slide Item"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <button
                onClick={() => setSpotlightIndex((prev) => (prev + 1) % spotlightProducts.length)}
                className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-slate-400 hover:text-white flex items-center justify-center border border-white/5 transition-all active:scale-90 cursor-pointer"
                title="Swipe Spotlight Right"
                aria-label="Next Slide Item"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Secondary Navigation with active filters and filters toggles */}
        <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Mobile Filter Toggle Button */}
          <div className="w-full lg:hidden mb-1">
            <button
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-2xl cursor-pointer text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-white/5 active:scale-99 transition-all text-zinc-850 dark:text-zinc-200"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
                <span className="font-mono uppercase tracking-wider text-[11px]">Search Filters</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-500 dark:text-slate-400 font-sans">
                <span>{isMobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isMobileFiltersOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>
          </div>

          {/* Side FILTER SYSTEM desktop panel */}
          <aside className={`shrink-0 bg-white dark:bg-[#070707] p-5 rounded-2xl border border-zinc-200/80 dark:border-white/10 space-y-6 lg:sticky lg:top-24 w-full lg:w-64 transition-all duration-300 ${
            isMobileFiltersOpen ? 'block' : 'hidden lg:block'
          }`}>
            
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
