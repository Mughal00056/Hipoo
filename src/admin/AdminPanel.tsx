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

export const AdminPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
          X
        </button>
        <h1 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-white">Admin Panel</h1>
        
        <div className="mb-6 border-b pb-4">
            <h2 className="text-lg font-semibold mb-2">Payment Settings</h2>
            <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={easypaisa} onChange={e => setEasypaisa(e.target.value)} placeholder="Easypaisa Number" className="p-2 border rounded" />
                <input value={jazzcash} onChange={e => setJazzcash(e.target.value)} placeholder="JazzCash Number" className="p-2 border rounded" />
                <input value={crypto} onChange={e => setCrypto(e.target.value)} placeholder="Crypto Address" className="p-2 border rounded" />
                <button onClick={handleUpdatePayment} className="px-4 py-2 bg-indigo-600 text-white rounded">Save Payment Details</button>
            </div>
        </div>

        <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Manage Products</h2>
            {products.map(product => (
                <div key={product.id} className="border p-4 rounded mb-2 space-y-2">
                    <input className="font-bold w-full" value={product.title} onChange={e => setProducts(products.map(p => p.id === product.id ? {...p, title: e.target.value} : p))} />
                    <input className="w-full text-xs" value={product.previewImage} onChange={e => setProducts(products.map(p => p.id === product.id ? {...p, previewImage: e.target.value} : p))} placeholder="Image URL" />
                    <textarea className="w-full text-xs" value={product.description} onChange={e => setProducts(products.map(p => p.id === product.id ? {...p, description: e.target.value} : p))} />
                    <input className="w-full text-xs" type="number" value={product.price} onChange={e => setProducts(products.map(p => p.id === product.id ? {...p, price: Number(e.target.value)} : p))} />
                    <button onClick={() => handleUpdateProduct(product)} className="px-4 py-1 bg-green-600 text-white rounded text-sm">Save</button>
                </div>
            ))}
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
