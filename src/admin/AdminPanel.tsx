import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc, setDoc } from 'firebase/firestore';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export const AdminPanel: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onProductsUpdated?: (products: Product[]) => void;
}> = ({ isOpen, onClose, onProductsUpdated }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [easypaisa, setEasypaisa] = useState('');
  const [jazzcash, setJazzcash] = useState('');
  const [crypto, setCrypto] = useState('');

  // Tab & promo controls state
  const [activeTab, setActiveTab] = useState<'payment' | 'products' | 'users' | 'promo' | 'reviews'>('payment');
  const [promos, setPromos] = useState<{ code: string; percent: number; description?: string }[]>([]);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoPercent, setNewPromoPercent] = useState<number>(20);
  const [newPromoDesc, setNewPromoDesc] = useState('');

  if (!isOpen) return null;

  useEffect(() => {
    const fetchData = async () => {
      // Fetch users
      const usersCol = collection(db, 'users');
      const userSnap = await getDocs(usersCol);
      const userList: UserProfile[] = [];
      userSnap.forEach((doc) => {
        const data = doc.data();
        userList.push({
          id: doc.id,
          email: data.email || '',
          name: data.name || '',
          isAdmin: data.isAdmin || false,
        });
      });
      setUsers(userList);

      // Fetch products (attempt to load from firestore, fallback to initial)
      const productsCol = collection(db, 'products');
      const productSnap = await getDocs(productsCol);
      if (productSnap.empty) {
        setProducts(INITIAL_PRODUCTS);
      } else {
        const productList: Product[] = [];
        productSnap.forEach((doc) => productList.push(doc.data() as Product));
        setProducts(productList);
      }

      // Fetch payment details
      const details = await import('../firebase').then(f => f.getPaymentDetails());
      setEasypaisa(details.easypaisaNumber);
      setJazzcash(details.jazzcashNumber);
      setCrypto(details.cryptoAddress);

      // Fetch dynamic promo codes
      try {
        const promoList = await import('../firebase').then(f => f.getPromoCodes());
        setPromos(promoList || []);
      } catch (err) {
        console.warn('Unable to retrieve admin promos:', err);
      }
      
      setIsLoading(false);
    };
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleUpdatePayment = async () => {
    await import('../firebase').then(f => f.updatePaymentDetails({ easypaisaNumber: easypaisa, jazzcashNumber: jazzcash, cryptoAddress: crypto }));
    alert('Payment details updated!');
  };

  const handleToggleAdmin = async (user: UserProfile) => {
    const userRef = doc(db, 'users', user.id);
    await updateDoc(userRef, { isAdmin: !user.isAdmin });
    setUsers(users.map(u => u.id === user.id ? {...u, isAdmin: !u.isAdmin} : u));
  };
  
  const handleUpdateProduct = async (product: Product) => {
    const productRef = doc(db, 'products', product.id);
    await setDoc(productRef, product);
    alert(`Product ${product.title} updated!`);
    if (onProductsUpdated) {
      onProductsUpdated(products);
    }
  };

  // Promo operations
  const handleAddPromo = () => {
    const code = newPromoCode.trim().toUpperCase();
    if (!code) return;
    if (promos.some(p => p.code === code)) {
      alert('This promo code already exists!');
      return;
    }
    const updated = [...promos, { 
      code, 
      percent: newPromoPercent, 
      description: newPromoDesc || `${newPromoPercent}% direct discount coupon` 
    }];
    setPromos(updated);
    setNewPromoCode('');
    setNewPromoDesc('');
  };

  const handleDeletePromo = (codeToDelete: string) => {
    const updated = promos.filter(p => p.code !== codeToDelete);
    setPromos(updated);
  };

  const handleSavePromos = async () => {
    try {
      await import('../firebase').then(f => f.updatePromoCodes(promos));
      alert('Promotional discount codes successfully saved and synced live!');
    } catch (err) {
      alert('Failed to save promo codes: ' + err);
    }
  };

  // Flattened Reviews for overall moderation
  const flatReviews: { productId: string; productTitle: string; reviewId: string; username: string; rating: number; text: string; date: string }[] = [];
  products.forEach(p => {
    if (p.reviews && Array.isArray(p.reviews)) {
      p.reviews.forEach(r => {
        flatReviews.push({
          productId: p.id,
          productTitle: p.title,
          reviewId: r.id,
          username: r.username,
          rating: r.rating,
          text: r.text,
          date: r.date
        });
      });
    }
  });

  const handleModerateDeleteReview = async (productId: string, reviewId: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this verified user review? It will instantly re-aggregate rating counts.')) return;

    const updatedProducts = products.map(prod => {
      if (prod.id !== productId) return prod;

      const updatedReviews = prod.reviews.filter(r => r.id !== reviewId);
      const sumRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
      const newAverageRating = updatedReviews.length > 0 
        ? parseFloat((sumRating / updatedReviews.length).toFixed(1)) 
        : 5.0;

      return {
        ...prod,
        reviews: updatedReviews,
        reviewsCount: updatedReviews.length,
        rating: newAverageRating
      };
    });

    const targetProduct = updatedProducts.find(p => p.id === productId);
    if (targetProduct) {
      try {
        const productRef = doc(db, 'products', productId);
        await setDoc(productRef, targetProduct);
        setProducts(updatedProducts);
        alert('Review moderated! Product document successfully re-indexed in Firestore.');
        if (onProductsUpdated) {
          onProductsUpdated(updatedProducts);
        }
      } catch (error) {
        alert('Database write failed: ' + error);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative border border-zinc-200 dark:border-zinc-805">
        <button id="admin-close-btn" onClick={onClose} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer font-bold font-sans">
          X
        </button>
        <h1 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-white">Admin Management Panel</h1>
        
        {/* Navigation Tab Header bar */}
        <div className="flex gap-2.5 overflow-x-auto pb-3 mb-6 border-b border-zinc-150 dark:border-zinc-850 scrollbar-none snap-x font-sans">
          <button
            onClick={() => setActiveTab('payment')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'payment'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-850 dark:text-zinc-300'
            }`}
          >
            💳 Billing Gateway
          </button>
          
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'products'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-850 dark:text-zinc-300'
            }`}
          >
            📦 Assets Catalogue ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('promo')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'promo'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-850 dark:text-zinc-300'
            }`}
          >
            🔥 Promo Coupons ({promos.length})
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-850 dark:text-zinc-300'
            }`}
          >
            ⭐ Review Moderation ({flatReviews.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-850 dark:text-zinc-300'
            }`}
          >
            👥 User Registry ({users.length})
          </button>
        </div>

        {isLoading ? (
          <p className="text-zinc-500 font-sans text-xs">Syncing workspace accounts with Firestore safety node...</p>
        ) : (
          <div className="font-sans">
            
            {/* TABS VIEW CONTROL SWITCHES */}

            {activeTab === 'payment' && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-zinc-805 dark:text-zinc-200 uppercase tracking-wider">Gateway Transfer Details (EasyPaisa / JazzCash / Wallet)</h2>
                <div className="space-y-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-[10px] font-mono mb-1 text-zinc-400">EASYPAISA PHONE NUMBER</label>
                       <input value={easypaisa} onChange={e => setEasypaisa(e.target.value)} placeholder="Easypaisa Number" className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white" />
                    </div>
                    <div>
                       <label className="block text-[10px] font-mono mb-1 text-zinc-405">JAZZCASH PHONE NUMBER</label>
                       <input value={jazzcash} onChange={e => setJazzcash(e.target.value)} placeholder="JazzCash Number" className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white" />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-[10px] font-mono mb-1 text-zinc-405">CRYPTOCURRENCY WALLET ADDRESS</label>
                       <input value={crypto} onChange={e => setCrypto(e.target.value)} placeholder="Crypto Address" className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-mono text-zinc-900 dark:text-white" />
                    </div>
                    <div className="md:col-span-2">
                       <button onClick={handleUpdatePayment} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors active:scale-98">
                         Save Gateway Payment Settings
                       </button>
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-6">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-bold">Manage Assets Catalogue</h2>
                <div className="space-y-4">
                {products.map(product => (
                    <div key={product.id} className="border border-zinc-200 dark:border-zinc-850 p-5 bg-zinc-50 dark:bg-zinc-900/20 rounded-2xl relative space-y-3">
                        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-850 pb-2 mb-2">
                            <span className="text-xs font-mono font-bold text-indigo-650 dark:text-indigo-400">Product Registration ID: {product.id}</span>
                            <span className="text-xs px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-full font-bold uppercase">{product.category}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">Asset Name / Title</label>
                                <input 
                                  className="font-bold w-full text-xs p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded text-zinc-900 dark:text-white outline-none" 
                                  value={product.title} 
                                  onChange={e => setProducts(products.map(p => p.id === product.id ? {...p, title: e.target.value} : p))} 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">Asset Category</label>
                                <select
                                  className="w-full text-xs p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded text-zinc-900 dark:text-white outline-none animate-none"
                                  value={product.category}
                                  onChange={e => setProducts(products.map(p => p.id === product.id ? {...p, category: e.target.value as any} : p))}
                                >
                                  <option value="Web Templates">Web Templates</option>
                                  <option value="UI Kits">UI Kits</option>
                                  <option value="Scripts">Scripts</option>
                                  <option value="Plugins">Plugins</option>
                                  <option value="Graphics">Graphics</option>
                                  <option value="SaaS Tools">SaaS Tools</option>
                                  <option value="AI Prompts">AI Prompts</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">Price (USD)</label>
                                <input 
                                  className="w-full text-xs p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded text-zinc-900 dark:text-white outline-none" 
                                  type="number"
                                  value={product.price} 
                                  onChange={e => setProducts(products.map(p => p.id === product.id ? {...p, price: Number(e.target.value)} : p))} 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">Preview Image Link</label>
                                <input 
                                  className="w-full text-xs p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded text-zinc-900 dark:text-white outline-none" 
                                  value={product.previewImage} 
                                  onChange={e => setProducts(products.map(p => p.id === product.id ? {...p, previewImage: e.target.value} : p))} 
                                  placeholder="Image URL" 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">Secure Download URL</label>
                                <input 
                                  className="w-full text-xs p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded text-indigo-650 dark:text-indigo-400 font-mono outline-none" 
                                  value={product.downloadUrl} 
                                  onChange={e => setProducts(products.map(p => p.id === product.id ? {...p, downloadUrl: e.target.value} : p))} 
                                  placeholder="Download url link" 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">Cloud Provider</label>
                                <select
                                  className="w-full text-xs p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded text-zinc-900 dark:text-white outline-none animate-none"
                                  value={product.provider}
                                  onChange={e => setProducts(products.map(p => p.id === product.id ? {...p, provider: e.target.value as any} : p))}
                                >
                                  <option value="Google Drive">Google Drive</option>
                                  <option value="Dropbox">Dropbox</option>
                                  <option value="GitHub">GitHub</option>
                                  <option value="CDN">CDN</option>
                                  <option value="S3 Buckets">S3 Buckets</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">File Size</label>
                                <input 
                                  className="w-full text-xs p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded text-zinc-900 dark:text-white outline-none" 
                                  value={product.fileSize || ''} 
                                  onChange={e => setProducts(products.map(p => p.id === product.id ? {...p, fileSize: e.target.value} : p))} 
                                  placeholder="e.g. 15.4 MB" 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">File Format & Version</label>
                                <div className="flex gap-2">
                                  <input 
                                    className="w-1/2 text-xs p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded text-zinc-900 dark:text-white outline-none" 
                                    value={product.fileFormat || ''} 
                                    onChange={e => setProducts(products.map(p => p.id === product.id ? {...p, fileFormat: e.target.value} : p))} 
                                    placeholder="e.g. ZIP" 
                                  />
                                  <input 
                                    className="w-1/2 text-xs p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded text-zinc-900 dark:text-white outline-none" 
                                    value={product.version || ''} 
                                    onChange={e => setProducts(products.map(p => p.id === product.id ? {...p, version: e.target.value} : p))} 
                                    placeholder="e.g. v1.0.0" 
                                  />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase font-mono text-zinc-405 mb-1">Short Description</label>
                            <input 
                              className="w-full text-xs p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded text-zinc-900 dark:text-zinc-200 outline-none"
                              value={product.shortDescription || ''}
                              onChange={e => setProducts(products.map(p => p.id === product.id ? {...p, shortDescription: e.target.value} : p))}
                              placeholder="Short tagline description"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase font-mono text-zinc-405 mb-1">Detailed Narrative (Full Description)</label>
                            <textarea 
                              rows={3}
                              className="w-full text-xs p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded text-zinc-900 dark:text-zinc-200 outline-none" 
                              value={product.description} 
                              onChange={e => setProducts(products.map(p => p.id === product.id ? {...p, description: e.target.value} : p))} 
                            />
                        </div>

                        <button 
                          onClick={() => handleUpdateProduct(product)} 
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-550 text-white rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                        >
                          Save Product Details
                        </button>
                    </div>
                ))}
                </div>
              </div>
            )}

            {activeTab === 'promo' && (
              <div className="space-y-6">
                <div className="flex border-b border-zinc-100 dark:border-zinc-850 pb-3 justify-between items-center flex-wrap gap-2">
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Dynamic Promotional Coupons Manager</h2>
                  <button 
                    onClick={handleSavePromos} 
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all active:scale-95 cursor-pointer"
                  >
                    Sync & Save Coupons Live
                  </button>
                </div>

                {/* Add Promo Code form */}
                <div className="bg-zinc-50 dark:bg-zinc-900/30 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-350">Add New Active Promo Code</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">COUPON CODE CODEWORD</label>
                      <input 
                        type="text" 
                        value={newPromoCode}
                        onChange={e => setNewPromoCode(e.target.value)}
                        placeholder="e.g. FIFTYOFF"
                        className="w-full p-2.5 bg-white dark:bg-zinc-955 border border-zinc-250 dark:border-zinc-800 rounded-lg text-xs font-mono uppercase text-zinc-900 dark:text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">DISCOUNT VALUE (%)</label>
                      <input 
                        type="number" 
                        min={1} 
                        max={100}
                        value={newPromoPercent}
                        onChange={e => setNewPromoPercent(Number(e.target.value))}
                        className="w-full p-2.5 bg-white dark:bg-zinc-955 border border-zinc-250 dark:border-zinc-800 rounded-lg text-xs font-semibold text-zinc-900 dark:text-white outline-none"
                      />
                    </div>
                    <div>
                      <button 
                        onClick={handleAddPromo}
                        className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-all active:scale-98"
                      >
                        + Register Promo Code
                      </button>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">OPTIONAL BRIEF DESCRIPTION / HEADLINE</label>
                      <input 
                        type="text" 
                        value={newPromoDesc}
                        onChange={e => setNewPromoDesc(e.target.value)}
                        placeholder="e.g. Golden season pass coupon, subtracting 50% from aggregate checkout payload"
                        className="w-full p-2.5 bg-white dark:bg-zinc-955 border border-zinc-250 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Promo Code list */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-bold">Currently Registered Coupon Codewords</h3>
                  {promos.length === 0 ? (
                    <p className="text-zinc-500 text-xs italic pl-1">No coupons active. Fallback welcomes are working by default in background.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {promos.map((p, idx) => (
                        <div key={idx} className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl flex justify-between items-center shadow-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-55 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-100/50 dark:border-indigo-900/30">
                                {p.code}
                              </span>
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                {p.percent}% Off
                              </span>
                            </div>
                            <span className="block text-[10px] text-zinc-400 mt-1">{p.description || 'Verified discount code active.'}</span>
                          </div>
                          <button 
                            onClick={() => handleDeletePromo(p.code)} 
                            className="p-1 px-2.5 bg-red-50 hover:bg-red-105 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-[10px] font-bold rounded cursor-pointer transition-all"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider border-b border-zinc-150 dark:border-zinc-850 pb-3">Review Moderation Console</h2>
                {flatReviews.length === 0 ? (
                  <p className="text-zinc-500 text-xs italic pl-1">No verified ratings submitted across asset registration files yet.</p>
                ) : (
                  <div className="space-y-3.5">
                    {flatReviews.map((r, i) => (
                      <div key={i} className="p-4 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-850 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1 fill-zinc-900 text-zinc-900 dark:text-zinc-50 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-zinc-800 dark:text-white">⭐ {r.rating} / 5</span>
                            <span className="font-mono text-[10px] text-zinc-400">by {r.username}</span>
                            <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">[{r.date}]</span>
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-350 bg-white dark:bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-205/50 dark:border-zinc-800/60 leading-relaxed">
                            {r.text}
                          </p>
                          <span className="block text-[9px] font-semibold uppercase tracking-wider text-indigo-650 dark:text-indigo-400 pt-0.5 font-bold">
                            Target File: {r.productTitle} (ID: {r.productId})
                          </span>
                        </div>
                        <button 
                          onClick={() => handleModerateDeleteReview(r.productId, r.reviewId)}
                          className="px-3.5 py-1.5 shrink-0 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                        >
                          Delete Feedback
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-150 uppercase tracking-wider border-b border-zinc-150 dark:border-zinc-850 pb-2">User Accounts Permission Registry</h2>
                <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-850 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead>
                      <tr className="bg-zinc-55 dark:bg-zinc-900/50 text-zinc-505 dark:text-zinc-400 uppercase tracking-wider font-mono text-[9px] border-b border-zinc-200 dark:border-zinc-800">
                        <th className="p-3">User Email Address</th>
                        <th className="p-3">User Custom Name</th>
                        <th className="p-3 text-right">System Administrator Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                          <td className="p-3 font-mono font-semibold dark:text-zinc-300">{user.email}</td>
                          <td className="p-3 text-zinc-800 dark:text-zinc-300">{user.name}</td>
                          <td className="p-3 text-right">
                            <span className={`inline-block mr-2 px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded ${user.isAdmin ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200/50' : 'bg-zinc-105 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                              {user.isAdmin ? 'Admin Root' : 'Customer'}
                            </span>
                            <button onClick={() => handleToggleAdmin(user)} className="px-2.5 py-1 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white font-sans text-[10px] font-semibold rounded cursor-pointer transition-colors">Toggle</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};
