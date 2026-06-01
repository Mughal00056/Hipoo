import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc, setDoc, query, getDoc } from 'firebase/firestore';
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
      
      setIsLoading(false);
    };
    fetchData();
  }, []);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative border border-zinc-200 dark:border-zinc-800">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer font-bold font-sans">
          X
        </button>
        <h1 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-white">Admin Management Panel</h1>
        
        <div className="mb-6 border-b border-zinc-150 dark:border-zinc-850 pb-5">
            <h2 className="text-lg font-semibold mb-2 text-zinc-805 dark:text-zinc-200">Gateway Transfer Details (EasyPaisa / JazzCash / Wallet)</h2>
            <div className="space-y-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-[10px] font-mono mb-1 text-zinc-400">EASYPAISA PHONE NUMBER</label>
                   <input value={easypaisa} onChange={e => setEasypaisa(e.target.value)} placeholder="Easypaisa Number" className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs" />
                </div>
                <div>
                   <label className="block text-[10px] font-mono mb-1 text-zinc-405">JAZZCASH PHONE NUMBER</label>
                   <input value={jazzcash} onChange={e => setJazzcash(e.target.value)} placeholder="JazzCash Number" className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs" />
                </div>
                <div className="md:col-span-2">
                   <label className="block text-[10px] font-mono mb-1 text-zinc-405">CRYPTOCURRENCY WALLET ADDRESS</label>
                   <input value={crypto} onChange={e => setCrypto(e.target.value)} placeholder="Crypto Address" className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-mono" />
                </div>
                <div className="md:col-span-2">
                   <button onClick={handleUpdatePayment} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">
                     Save Gateway Payment Settings
                   </button>
                </div>
            </div>
        </div>

        <div className="mb-6">
            <h2 className="text-lg font-bold mb-3 text-zinc-900 dark:text-zinc-100">Manage Assets Catalogue</h2>
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
                              className="font-bold w-full text-xs p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded text-zinc-900 dark:text-white" 
                              value={product.title} 
                              onChange={e => setProducts(products.map(p => p.id === product.id ? {...p, title: e.target.value} : p))} 
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">Asset Category</label>
                            <select
                              className="w-full text-xs p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded text-zinc-900 dark:text-white outline-none"
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
                              className="w-full text-xs p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded text-zinc-900 dark:text-white" 
                              type="number"
                              value={product.price} 
                              onChange={e => setProducts(products.map(p => p.id === product.id ? {...p, price: Number(e.target.value)} : p))} 
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">Preview Image Link</label>
                            <input 
                              className="w-full text-xs p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded text-zinc-900 dark:text-white" 
                              value={product.previewImage} 
                              onChange={e => setProducts(products.map(p => p.id === product.id ? {...p, previewImage: e.target.value} : p))} 
                              placeholder="Image URL" 
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">Secure Download URL</label>
                            <input 
                              className="w-full text-xs p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded text-indigo-650 dark:text-indigo-400 font-mono" 
                              value={product.downloadUrl} 
                              onChange={e => setProducts(products.map(p => p.id === product.id ? {...p, downloadUrl: e.target.value} : p))} 
                              placeholder="Download url link" 
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">Cloud Provider</label>
                            <select
                              className="w-full text-xs p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded text-zinc-900 dark:text-white outline-none"
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
                              className="w-full text-xs p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded text-zinc-900 dark:text-white" 
                              value={product.fileSize || ''} 
                              onChange={e => setProducts(products.map(p => p.id === product.id ? {...p, fileSize: e.target.value} : p))} 
                              placeholder="e.g. 15.4 MB" 
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">File Format & Version</label>
                            <div className="flex gap-2">
                              <input 
                                className="w-1/2 text-xs p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded text-zinc-900 dark:text-white" 
                                value={product.fileFormat || ''} 
                                onChange={e => setProducts(products.map(p => p.id === product.id ? {...p, fileFormat: e.target.value} : p))} 
                                placeholder="e.g. ZIP" 
                              />
                              <input 
                                className="w-1/2 text-xs p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded text-zinc-900 dark:text-white" 
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
                          className="w-full text-xs p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded text-zinc-900 dark:text-zinc-200"
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
                      Save Product details
                    </button>
                </div>
            ))}
            </div>
        </div>

        {isLoading ? (
          <p className="text-zinc-500">Loading users...</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="p-2 border-b">Email</th>
                <th className="p-2 border-b">Name</th>
                <th className="p-2 border-b">Admin</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="p-2 border-b">{user.email}</td>
                  <td className="p-2 border-b">{user.name}</td>
                  <td className="p-2 border-b">
                    {user.isAdmin ? 'Yes' : 'No'}
                    <button onClick={() => handleToggleAdmin(user)} className="ml-2 px-2 py-1 bg-zinc-200 rounded text-xs">Toggle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
