import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Star, 
  HardDrive, 
  Check, 
  Calendar, 
  Lock, 
  Unlock, 
  ArrowRight, 
  Send, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  Award,
  ShoppingBag
} from 'lucide-react';
import { Product, Review, UserProfile } from '../types';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  isPurchased: boolean;
  onAddReview: (productId: string, review: Omit<Review, 'id' | 'date'>) => void;
  user: UserProfile;
  setIsAuthModalOpen: (open: boolean) => void;
  onOpenImage?: (imageUrl: string) => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  isPurchased,
  onAddReview,
  user,
  setIsAuthModalOpen,
  onOpenImage
}: ProductDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewText, setNewReviewText] = useState<string>('');
  const [customUsername, setCustomUsername] = useState<string>('');
  const [reviewError, setReviewError] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  const [isPaymentInitiated, setIsPaymentInitiated] = useState<boolean>(false);
  // Custom User Personalisation and Order inputs
  const [quantity, setQuantity] = useState<number>(1);
  const [imageUrl, setImageUrl] = useState<string>('https://example.com/image.jpg');
  const [personalisationText, setPersonalisationText] = useState<string>('CONQUEROR RANK PUSH');
  const [contactNumber, setContactNumber] = useState<string>('+923001234567');
  const [emailAddress, setEmailAddress] = useState<string>(user.email || 'user@gmail.com');
  const [additionalInstructions, setAdditionalInstructions] = useState<string>('');

  // Live real-time confirmation sandbox tracking states
  const [orderId, setOrderId] = useState<string>('#AV-1025');
  const [orderStatus, setOrderStatus] = useState<string>('Pending Verification');
  const [countdown, setCountdown] = useState<number>(120); // starts at 02:00
  const [isCounting, setIsCounting] = useState<boolean>(true); // start countdown timer immediately

  // Real-time ticker counting logic
  React.useEffect(() => {
    let interval: any = null;
    if (isCounting && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            return 120; // reset/loop backup values seamlessly for high-fidelity simulation
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCounting, countdown]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalName = customUsername.trim() || user.name || 'Anonymous User';

    if (!newReviewText.trim()) {
      setReviewError('Review text cannot be left blank.');
      return;
    }

    onAddReview(product.id, {
      username: finalName,
      rating: newReviewRating,
      text: newReviewText.trim()
    });

    setNewReviewText('');
    setCustomUsername('');
    setNewReviewRating(5);
    setReviewError('');
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  return (
    <div id="modal-container" className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Dark Dim Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm"
      />

      {/* Main card panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 2, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Head header close */}
        <div className="absolute top-4 right-4 z-10">
          <button
            id={`modal-close-btn-${product.id}`}
            onClick={onClose}
            className="p-2 bg-white/90 dark:bg-zinc-900/90 text-zinc-505 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-full border border-zinc-200/60 dark:border-zinc-800 transition-colors shadow-sm cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll area */}
        <div className="overflow-y-auto flex-1">
          {/* Main top visual banner */}
          <div 
            onClick={() => onOpenImage?.(product.previewImage)}
            className="relative aspect-[21/9] w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden cursor-zoom-in group/image"
            title="Click to view full image"
          >
            <img
              src={product.previewImage}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/30 to-transparent" />
            <div className="absolute top-4 left-4 bg-zinc-950/60 backdrop-blur-md opacity-0 group-hover/image:opacity-100 transition-opacity text-white text-[10px] font-mono py-1 px-2.5 rounded-lg border border-white/10">
              🔍 Click to open full-screen preview
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <span className="px-2.5 py-1 text-[10px] font-mono font-medium tracking-wider bg-indigo-600 text-white rounded-lg uppercase shadow-sm">
                {product.category}
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-sans font-bold text-white tracking-tight mt-2.5">
                {product.title}
              </h2>
            </div>
          </div>

          {/* Grid distribution */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Primary left hand tabs section */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Tab Toggles */}
              <div className="flex border-b border-zinc-100 dark:border-zinc-900">
                <button
                  id="tab-details-toggle"
                  onClick={() => setActiveTab('details')}
                  className={`pb-3 text-sm font-sans font-semibold border-b-2 px-4 transition-colors cursor-pointer ${
                    activeTab === 'details'
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                  }`}
                >
                  Product Details
                </button>
                <button
                  id="tab-reviews-toggle"
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-3 text-sm font-sans font-semibold border-b-2 px-4 transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'reviews'
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                  }`}
                >
                  Reviews ({product.reviews.length})
                </button>
              </div>

              {/* Dynamic Body content */}
              {activeTab === 'details' ? (
                <div className="space-y-6">
                  {/* Long description blocks */}
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-2">Description Overview</h4>
                    <p className="text-sm sm:text-base text-zinc-650 dark:text-zinc-350 leading-relaxed whitespace-pre-line bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-900/50">
                      {product.description}
                    </p>
                  </div>

                  {/* Custom Detail Image & Spotlight Text from Admin Panel */}
                  {product.detailImageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-zinc-150 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/40">
                      <img 
                        src={product.detailImageUrl} 
                        alt={product.title + " Details Highlight"} 
                        className="w-full h-auto object-cover max-h-[350px] transition-transform duration-300 hover:scale-[1.01]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {product.detailText && (
                    <div className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-150 dark:border-zinc-900 p-4 rounded-xl">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">Extended Overview</h4>
                      <p className="text-sm text-zinc-650 dark:text-zinc-350 leading-relaxed whitespace-pre-line">
                        {product.detailText}
                      </p>
                    </div>
                  )}



                  {/* PRODUCT DETAILS CUSTOMIZATION FORM */}
                  <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-indigo-650 dark:bg-indigo-400 rounded-full" />
                      <h4 className="text-sm font-mono font-black uppercase tracking-wider text-zinc-950 dark:text-white">PRODUCT DETAILS</h4>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl p-4 sm:p-5 border border-zinc-200 dark:border-zinc-800/80 space-y-4">
                      {/* Title display */}
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block font-mono mb-1">Title</span>
                        <div className="w-full text-xs font-sans font-bold p-3 bg-zinc-200/50 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-850 rounded-xl text-zinc-850 dark:text-zinc-300">
                          {product.title}
                        </div>
                      </div>

                      {/* Side by side Price & Delivery Time */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase block font-mono mb-1">Price</span>
                          <div className="w-full text-xs font-mono font-black p-3 bg-zinc-200/50 dark:bg-zinc-955 border border-zinc-205 dark:border-zinc-850 rounded-xl text-indigo-600 dark:text-indigo-400">
                            Rs {product.price === 0 ? 500 : Math.round(product.price * 140) * quantity}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase block font-mono mb-1">Delivery Time</span>
                          <div className="w-full text-xs font-sans font-semibold p-3 bg-zinc-200/50 dark:bg-zinc-955 border border-zinc-205 dark:border-zinc-850 rounded-xl text-zinc-700 dark:text-zinc-300">
                            5 Minutes - 2 Hours
                          </div>
                        </div>
                      </div>



                      {/* Image URL Input */}
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block font-mono mb-1">Image URL</span>
                        <input
                          type="text"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="w-full text-xs p-3 bg-white dark:bg-[#040404] border border-zinc-200 dark:border-zinc-805 rounded-xl focus:border-indigo-500 outline-none text-zinc-800 dark:text-zinc-250 placeholder-zinc-400"
                        />
                      </div>

                      {/* Personalisation Text Input */}
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block font-mono mb-1">Personalisation Text</span>
                        <input
                          type="text"
                          value={personalisationText}
                          onChange={(e) => setPersonalisationText(e.target.value)}
                          placeholder="Enter Thumbnail Text"
                          className="w-full text-xs p-3 bg-white dark:bg-[#040404] border border-zinc-205 dark:border-zinc-805 rounded-xl focus:border-indigo-500 outline-none text-zinc-855 dark:text-zinc-150 placeholder-zinc-400 font-medium"
                        />
                      </div>

                      {/* Contact Number Input */}
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block font-mono mb-1">Contact Number</span>
                        <input
                          type="text"
                          value={contactNumber}
                          onChange={(e) => setContactNumber(e.target.value)}
                          placeholder="+92XXXXXXXXXX"
                          className="w-full text-xs p-3 bg-white dark:bg-[#040404] border border-zinc-205 dark:border-zinc-805 rounded-xl focus:border-indigo-500 outline-none text-zinc-855 dark:text-zinc-100 placeholder-zinc-400 font-mono"
                        />
                      </div>

                      {/* Email Address Input */}
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block font-mono mb-1">Email Address</span>
                        <input
                          type="email"
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          placeholder="user@gmail.com"
                          className="w-full text-xs p-3 bg-white dark:bg-[#040404] border border-zinc-205 dark:border-zinc-805 rounded-xl focus:border-indigo-500 outline-none text-zinc-855 dark:text-zinc-100 placeholder-zinc-400 font-mono"
                        />
                      </div>

                      {/* Additional Instructions */}
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block font-mono mb-1">Additional Instructions</span>
                        <textarea
                          value={additionalInstructions}
                          onChange={(e) => setAdditionalInstructions(e.target.value)}
                          placeholder="[ Textarea ]"
                          rows={3}
                          className="w-full text-xs p-3 bg-white dark:bg-[#040404] border border-zinc-205 dark:border-zinc-805 rounded-xl focus:border-indigo-500 outline-none text-zinc-855 dark:text-zinc-100 placeholder-zinc-400 leading-relaxed"
                        />
                      </div>

                      {/* Quantity adjuster */}
                      <div className="flex items-center justify-between py-2 border-t border-zinc-200/50 dark:border-zinc-800/80 mt-1 select-none">
                        <span className="text-[10px] font-mono font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest">
                          Quantity
                        </span>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                            className="w-7.5 h-7.5 rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 font-black text-sm text-zinc-700 dark:text-zinc-300 flex items-center justify-center transition-transform active:scale-90"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-xs text-zinc-900 dark:text-white">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity(prev => Math.min(99, prev + 1))}
                            className="w-7.5 h-7.5 rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 font-black text-sm text-zinc-700 dark:text-zinc-300 flex items-center justify-center transition-transform active:scale-90"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Action Triggers */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            onAddToCart({
                              ...product,
                              title: `${product.title} (Qty: ${quantity})`
                            });
                          }}
                          className="py-2.5 bg-zinc-200/55 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 font-sans font-bold text-xs rounded-xl transition-all cursor-pointer text-center text-zinc-800 dark:text-zinc-100 active:scale-98"
                        >
                          Add To Cart
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const randomIdNum = Math.floor(1000 + Math.random() * 9000);
                            setOrderId(`#AV-${randomIdNum}`);
                            setCountdown(120); // reset counting
                            setOrderStatus('Pending Verification');
                            setIsPaymentInitiated(true);
                            // Trigger actual underlying purchase/checkout logic
                            onBuyNow({
                              ...product,
                              title: `${product.title} (Qty: ${quantity})`
                            });
                          }}
                          className="py-2.5 bg-indigo-600 hover:bg-indigo-500 font-sans font-black text-xs rounded-xl text-white transition-all cursor-pointer text-center active:scale-98 shadow-md shadow-indigo-550/10"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Reviews List */}
                  <div className="space-y-4">
                    {product.reviews.length === 0 ? (
                      <div className="p-6 text-center border-2 border-dashed border-zinc-150 dark:border-zinc-900 rounded-2xl">
                        <MessageSquare className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                        <p className="text-sm font-medium text-zinc-500">There are no client review logs for this product yet.</p>
                        <p className="text-xs text-zinc-400 mt-1">Be the first to leave feedback below!</p>
                      </div>
                    ) : (
                      product.reviews.map((rev) => (
                        <div key={rev.id} className="p-4 bg-zinc-50/60 dark:bg-zinc-900/40 rounded-xl border border-zinc-100 dark:border-zinc-900/60">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              {rev.avatar ? (
                                <img src={rev.avatar} className="w-7 h-7 rounded-full object-cover" alt={rev.username} />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
                                  {rev.username.charAt(0)}
                                </div>
                              )}
                              <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">{rev.username}</span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400">{rev.date}</span>
                          </div>
                          
                          {/* Stars */}
                          <div className="flex gap-0.5 mb-1.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating ? 'text-amber-400 fill-current' : 'text-zinc-200 dark:text-zinc-800'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-350 leading-relaxed">
                            {rev.text}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Review Form */}
                  <div className="border-t border-zinc-100 dark:border-zinc-900 pt-6">
                    <h4 className="text-sm font-sans font-bold text-zinc-900 dark:text-zinc-100 mb-3.5 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      Submit Your Product Review
                    </h4>

                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      {/* Name Selector */}
                      <div>
                        <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wide mb-1.5">Your Name / Username</label>
                        <input
                          id="review-name-input"
                          type="text"
                          value={customUsername}
                          onChange={(e) => setCustomUsername(e.target.value)}
                          placeholder="e.g. Alexa, Robert Full-Stack, Guest Creator"
                          className="w-full text-sm p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-450 transition-all"
                        />
                      </div>

                      {/* Rating Selector */}
                      <div>
                        <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wide mb-1.5">Your Rating Scale</label>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((stars) => (
                            <button
                              id={`select-star-btn-${stars}`}
                              key={stars}
                              type="button"
                              onClick={() => setNewReviewRating(stars)}
                              className="p-1 hover:scale-115 transition-transform text-amber-400 cursor-pointer"
                            >
                              <Star className={`w-6 h-6 ${stars <= newReviewRating ? 'fill-current' : 'stroke-zinc-300 dark:stroke-zinc-700'}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Textbox */}
                      <div>
                        <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wide mb-1.5">Review message</label>
                        <textarea
                          id="review-message-textarea"
                          value={newReviewText}
                          onChange={(e) => {
                            setNewReviewText(e.target.value);
                            setReviewError('');
                          }}
                          placeholder="Write down details on format, styling quality, and documentation satisfaction..."
                          rows={3}
                          className="w-full text-sm p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-205 dark:border-zinc-800 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-all"
                        />
                      </div>

                      {reviewError && (
                        <p className="text-xs text-red-500 font-medium">{reviewError}</p>
                      )}
                      
                      {reviewSuccess && (
                        <p className="text-xs text-emerald-500 font-semibold">Your review was submitted! Thank you for the support.</p>
                      )}

                      <button
                        id="submit-review-btn"
                        type="submit"
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-sans font-semibold py-2 px-4 rounded-xl transition-colors cursor-pointer"
                      >
                        <span>Send Review</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>

                </div>
              )}

            </div>
            {/* Sticky/Side Action Panel */}
            <div className="space-y-6 lg:border-l lg:border-zinc-150 lg:dark:border-zinc-900 lg:pl-6">
              
              {!isPaymentInitiated ? (
                <div className="rounded-3xl p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-center py-10 space-y-4 bg-zinc-50/30 dark:bg-zinc-950/20 backdrop-blur-xs select-none">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <ShoppingBag className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-mono font-black uppercase tracking-wider text-zinc-900 dark:text-white">Active Custom Workspace</h5>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-550 max-w-[220px] mx-auto leading-relaxed">
                      Please customize your product specifications below and click <strong className="text-indigo-650 dark:text-indigo-400">Buy Now</strong> to unlock the Live Real-time Verification Desk.
                    </p>
                  </div>
                </div>
              ) : (
                /* LIVE VERIFICATION CARD */
                <div className="rounded-3xl p-5 border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/5 backdrop-blur-md relative overflow-hidden space-y-4">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold font-mono">
                      Live Verification Desk
                    </span>
                  </div>
                  <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400">
                    AV-DESK
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Order ID */}
                  <div>
                    <span className="text-[10px] text-zinc-450 dark:text-zinc-500 uppercase block font-mono">Order ID</span>
                    <span className="font-mono text-sm font-black text-zinc-900 dark:text-white block mt-0.5">
                      {orderId}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <span className="text-[10px] text-zinc-450 dark:text-zinc-500 uppercase block font-mono">Status</span>
                    <span className="inline-block px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider mt-1 animate-pulse">
                      Pending Verification
                    </span>
                  </div>

                  {/* Contact Number */}
                  <div>
                    <span className="text-[10px] text-zinc-450 dark:text-zinc-500 uppercase block font-mono font-mono font-mono">Contact Number</span>
                    <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 block mt-0.5 font-mono font-mono">
                      {contactNumber || "+92XXXXXXXXXX"}
                    </span>
                  </div>

                  {/* Uploaded Image Preview */}
                  <div>
                    <span className="text-[10px] text-zinc-455 dark:text-zinc-500 uppercase block font-mono mb-1.5">Reference Image</span>
                    <div className="h-28 w-full rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800/80 bg-zinc-100 dark:bg-zinc-950 relative group">
                      <img 
                        src={imageUrl || product.previewImage} 
                        className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-300 group-hover:scale-105" 
                        alt="Sandbox Upload Preview" 
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-mono text-white bg-zinc-900/80 py-1 px-2.5 rounded border border-white/10 uppercase font-black">
                          Preview Active
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Personalisation Text */}
                  <div>
                    <span className="text-[10px] text-zinc-455 dark:text-zinc-500 uppercase block font-mono mb-1">Personalisation Text</span>
                    <span className="font-mono text-[11px] font-black text-indigo-650 dark:text-indigo-400 block mt-1 bg-indigo-50/50 dark:bg-indigo-950/30 py-1.5 px-2.5 rounded-lg border border-indigo-100/30 dark:border-indigo-550/10">
                      "{personalisationText || "CONQUEROR RANK PUSH"}"
                    </span>
                  </div>

                  {/* Countdown timer */}
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex justify-between items-center bg-zinc-100/60 dark:bg-zinc-900/40 p-2 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
                      <div>
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase block font-mono">Countdown</span>
                        <span className="font-mono text-base font-black text-red-650 dark:text-red-400 tabular-nums">
                          {formatCountdown(countdown)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-ping mr-1.5" />
                        <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                          Active Loop
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status text */}
                  <div className="pt-2 text-center">
                    <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-550 uppercase tracking-widest leading-normal animate-pulse">
                      Waiting For Admin Confirmation...
                    </p>
                  </div>
                </div>
              </div>
              )}

              {/* Standard action parameters in owned products style */}
              {isPurchased && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                  <p className="text-xs font-semibold text-emerald-500 flex items-center gap-1.5 justify-center">
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Item Unlocked</span>
                  </p>
                  <a
                    href={product.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    <span>Download File ({product.provider})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Hiding old panel buttons with empty space */}
              <div className="hidden">

                {isPurchased ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-emerald-500 flex items-center gap-1.5 justify-center py-1 bg-emerald-500/10 rounded-lg">
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Unlocked & Active Sandbox License Owned</span>
                    </p>
                    <a
                      id="unlocked-download-anchor"
                      href={product.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-sm rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      <span>Download File Asset ({product.provider})</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  <>
                    {/* Buy now */}
                    <button
                      id="details-buy-btn"
                      onClick={() => onBuyNow(product)}
                      className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-850 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-sans font-bold text-sm rounded-xl active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <span>Purchase License Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Add to Cart */}
                    <button
                      id="details-add-to-cart-btn"
                      onClick={() => onAddToCart(product)}
                      className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-sans font-semibold text-xs rounded-xl active:scale-98 transition-all cursor-pointer"
                    >
                      Add to Shopping Cart
                    </button>
                  </>
                )}
              </div>

            </div>

          </div>
        </div>

      </motion.div>
    </div>
  );
}
