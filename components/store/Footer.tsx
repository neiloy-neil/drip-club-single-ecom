import Link from "next/link";
import { Mail, MapPin, Phone, MessageCircle, Share2, Music } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-drip-muted pt-16 pb-8 border-t border-drip-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* About DRIP */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-2xl tracking-tight">DRIP</h3>
            <p className="text-sm text-drip-text-muted leading-relaxed max-w-xs">
              Wear Your Story. Modern Bangladeshi clothing for the bold and elegant. We blend minimal aesthetics with premium quality.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-drip-surface flex items-center justify-center hover:bg-drip-gold hover:text-white transition-colors shadow-sm">
                <Share2 className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-drip-surface flex items-center justify-center hover:bg-drip-gold hover:text-white transition-colors shadow-sm">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-drip-surface flex items-center justify-center hover:bg-drip-gold hover:text-white transition-colors shadow-sm">
                <Music className="w-5 h-5" /> {/* TikTok icon placeholder */}
              </a>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h4 className="font-bold uppercase tracking-wider text-sm">Shop</h4>
            <ul className="space-y-2 text-sm text-drip-text-muted">
              <li><Link href="/shop" className="hover:text-drip-gold transition-colors">All Products</Link></li>
              <li><Link href="/shop?category=men" className="hover:text-drip-gold transition-colors">Men</Link></li>
              <li><Link href="/shop?category=women" className="hover:text-drip-gold transition-colors">Women</Link></li>
              <li><Link href="/shop?sort=newest" className="hover:text-drip-gold transition-colors">New Arrivals</Link></li>
              <li><Link href="/shop?category=sale" className="hover:text-drip-error transition-colors">Sale</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div className="space-y-4">
            <h4 className="font-bold uppercase tracking-wider text-sm">Help</h4>
            <ul className="space-y-2 text-sm text-drip-text-muted">
              <li><Link href="/track" className="hover:text-drip-gold transition-colors">Track Order</Link></li>
              <li><Link href="/faq" className="hover:text-drip-gold transition-colors">FAQ & Shipping</Link></li>
              <li><Link href="/returns" className="hover:text-drip-gold transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="/size-guide" className="hover:text-drip-gold transition-colors">Size Guide</Link></li>
              <li><Link href="/contact" className="hover:text-drip-gold transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact / Newsletter */}
          <div className="space-y-4">
            <h4 className="font-bold uppercase tracking-wider text-sm">Join The Club</h4>
            <p className="text-sm text-drip-text-muted">Subscribe for 10% off your first order and exclusive access to new drops.</p>
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="flex-1 bg-drip-surface border border-drip-border px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-drip-gold"
              />
              <button type="submit" className="bg-drip-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-drip-gold transition-colors">
                Subscribe
              </button>
            </form>
            <div className="pt-4 space-y-2 text-sm text-drip-text-muted">
              <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@drip.com.bd</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +880 1700 000000</p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-drip-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-drip-text-muted text-center md:text-left">
            &copy; {new Date().getFullYear()} DRIP. Made in Bangladesh 🇧🇩. All rights reserved.
          </p>
          <div className="flex gap-4 items-center">
            {/* Payment & Delivery Badges */}
            <span className="text-[10px] font-bold uppercase tracking-widest text-drip-text-muted">Payments:</span>
            <div className="flex gap-2 text-xs font-mono font-medium text-drip-text-muted bg-drip-surface px-2 py-1 rounded">bKash</div>
            <div className="flex gap-2 text-xs font-mono font-medium text-drip-text-muted bg-drip-surface px-2 py-1 rounded">Nagad</div>
            <div className="flex gap-2 text-xs font-mono font-medium text-drip-text-muted bg-drip-surface px-2 py-1 rounded">COD</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
