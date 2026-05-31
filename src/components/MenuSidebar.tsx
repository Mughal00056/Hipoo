import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Image as ImageIcon, Sparkles, AlertCircle, CheckCircle, Database } from 'lucide-react';
import { Product } from '../types';

interface MenuSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
  productsCount: number;
}

const CATEGORIES = [
  'Web Templates',
  'UI Kits',
  'Scripts',
  'Plugins',
  'Graphics',
  'SaaS Tools',
  'AI Prompts'
];

export default function MenuSidebar({
  isOpen,
  onClose,
  onAddProduct,
  productsCount
}: MenuSidebarProps) {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [thumbnailName, setThumbnailName] = useState(''); // Short metadata description
  const [category, setCategory] = useState('Web Templates');
  const [price, setPrice] = useState('19');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!title.trim()) {
      setError('Please provide an asset title/name.');
      return;
    }
    if (!imageUrl.trim()) {
      setError('Please provide an image / PNG URL for the thumbnail.');
      return;
    }

    // Attempt to validate URL or fallback
    let finalImg = imageUrl.trim();
    if (!finalImg.startsWith('http://') && !finalImg.startsWith('https://')) {
      // If it's a relative path/name in design, allow it, but warn
      if (finalImg.endsWith('.png') || finalImg.endsWith('.jpg') || finalImg.endsWith('.jpeg') || finalImg.endsWith('.webp')) {
        // Safe relative image
      } else {
        setError('Please enter a valid image URL beginning with http://, https:// or standard path.');
        return;
      }
    }

    const priceNum = parseFloat(price) || 0;

    const newProduct: Product = {
      id: `custom-prod-${Date.now()}`,
      title: title.trim(),
      shortDescription: thumbnailName.trim() || `${title.trim()} custom premium design asset. Fully customizable thumbnail and structure.`,
      description: `Custom uploaded asset sandbox mockup. This item was created live in the AetherVault editor sandbox using the "Add Custom Thumbnail" portal center.\n\nAll variables, file sizes, and responsive grids have been constructed automatically to align with your design requirements. Feel free to load, wish-save, or purchase this simulated asset license directly in the catalog list.`,
      category: category as any,
      price: priceNum,
      rating: 5.0,
      reviewsCount: 1,
      tags: ['Customized', category, 'Added Asset', 'Sandbox Client'],
      previewImage: finalImg,
      downloadUrl: 'https://drive.google.com/drive/folders/custom_asset_mockup_download_vault',
      provider: 'Dropbox',
      dateCreated: new Date().toISOString().split('T')[0],
      features: [
        'Custom template generated inside control panel',
        'Direct download configuration enabled',
        'Responsive layout mock design presentation scale',
        'High resolution PNG custom thumbnail render'
      ],
      fileSize: '5 MB',
      fileFormat: 'PNG / ZIP File',
      version: '1.0.0',
      reviews: [
        {
          id: `custom-rev-${Date.now()}`,
          username: 'System Evaluator',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
          rating: 5,
          text: 'Custom metadata evaluated successfully. Thumbnail loaded cleanly into the grid!',
          date: new Date().toISOString().split('T')[0]
        }
      ]
    };

    onAddProduct(newProduct);
    setSuccess(true);
    
    // Clear fields
    setTitle('');
    setImageUrl('');
    setThumbnailName('');
    
    // Auto reset dismiss success
    setTimeout(() => {
      setSuccess(false);
    }, 4500);
  };

  return (
    <div id="menu-sidebar-backdrop" className="fixed inset-0 z-50 overflow-hidden">
      {/* Dim Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/75 backdrop-blur-xs"
      />

      <div className="absolute inset-y-0 left-0 max-w-full flex pr-10">
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="w-screen max-w-md bg-white dark:bg-zinc-950 border-r border-zinc-150 dark:border-zinc-900 shadow-2xl flex flex-col h-full"
        >
          {/* Header */}
          <div className="px-5 py-6 border-b border-zinc-150 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-650/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-sans font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-tight">Sandbox Workspace Control</h3>
                <p className="text-[10px] font-mono text-zinc-400 uppercase">Manage Custom Elements</p>
              </div>
            </div>
            
            <button
              id="close-menu-sidebar-btn"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrolling Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* Catalog Info badge */}
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-905/30 rounded-xl">
              <span className="text-[9px] font-mono leading-none bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold uppercase">Sandbox Telemetry</span>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 mt-2 leading-relaxed">
                Currently, there are <strong className="text-indigo-600 dark:text-indigo-400">{productsCount}</strong> responsive database assets mounted in the catalog view.
              </p>
            </div>

            {/* Asset Adder form */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-650 dark:text-indigo-400" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Add New Design Thumbnail</h4>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                
                {/* 1. Name */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-450 dark:text-zinc-400 uppercase tracking-wider mb-1">Asset Name / Title</label>
                  <input
                    id="form-add-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Neo-Brutalist Dashboard Kit"
                    className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white transition-colors"
                  />
                </div>

                {/* 2. PNG URL (preview image) */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-450 dark:text-zinc-400 uppercase tracking-wider mb-1">PNG Image URL (Thumbnail)</label>
                  <div className="relative">
                    <input
                      id="form-add-image-url"
                      type="text"
                      required
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="e.g. https://images.unsplash.com/photo-..."
                      className="w-full text-xs p-2.5 pl-9 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white transition-colors"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-1">Provide a web-address (e.g., Unsplash or custom link) for the design thumbnail matrix.</p>
                </div>

                {/* 3. Short metadata description / Thumbnail name */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-450 dark:text-zinc-400 uppercase tracking-wider mb-1">Thumbnail Short Descriptor</label>
                  <input
                    id="form-add-thumbnail-name"
                    type="text"
                    value={thumbnailName}
                    onChange={(e) => setThumbnailName(e.target.value)}
                    placeholder="e.g. Modern UI widgets with transparent glassmorphism layout"
                    className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white transition-colors"
                  />
                </div>

                {/* 4. Category selection */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-450 dark:text-zinc-400 uppercase tracking-wider mb-1">Select Category</label>
                  <select
                    id="form-add-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-205 dark:border-zinc-800 rounded-xl outline-none text-zinc-900 dark:text-white transition-colors cursor-pointer"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* 5. Pricing simulation */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-450 dark:text-zinc-400 uppercase tracking-wider mb-1">Simulated Valuation ($)</label>
                  <input
                    id="form-add-price"
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 29"
                    className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white transition-colors"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-1.5 p-2 bg-red-500/10 text-red-500 text-[10px] rounded-lg leading-normal">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-start gap-1.5 p-2.5 bg-emerald-500/10 text-emerald-500 text-[10px] rounded-lg leading-normal">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Successfully appended new asset! It is now loaded into the digital assets directory.</span>
                  </div>
                )}

                <button
                  id="submit-custom-product-form-btn"
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Mount New Asset Sandbox</span>
                </button>

              </form>
            </div>

            {/* Quick tips */}
            <div className="pt-4 border-t border-zinc-150 dark:border-zinc-900 text-[10px] text-zinc-450 dark:text-zinc-500 space-y-1 rounded bg-zinc-50/50 dark:bg-zinc-900/10 p-3 leading-relaxed">
              <span className="font-bold text-zinc-650 dark:text-zinc-400 block uppercase">Sandbox Tip</span>
              <p>Once you add custom assets, they stay active in your browser tab's local cache. They will instantly look and act like our premium built-in components!</p>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
