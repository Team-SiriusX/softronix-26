"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { store } from "@/constants/store";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1c1c1c] text-[#f2efe9] font-sans selection:bg-[#f2efe9] selection:text-[#1c1c1c]">
      <div className="max-w-[100rem] mx-auto px-6 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-24">
          
          {/* Brand & Newsletter */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-8">
             <Link href="/" className="block">
                <h3 className="font-gloock text-4xl md:text-5xl tracking-tight">ECHO</h3>
             </Link>
             <p className="text-[#a59d8f] text-sm leading-relaxed max-w-xs font-light">
                Elevating the modern grooming ritual through nature, science, and design.
             </p>
             
             <div className="pt-8">
                 <h4 className="text-xs font-medium tracking-[0.2em] uppercase opacity-60 mb-6">Stay Updated</h4>
                 <div className="relative border-b border-[#a59d8f]/30 pb-2 group focus-within:border-[#f2efe9] transition-colors">
                     <input 
                        type="email" 
                        placeholder="Email Address" 
                        className="w-full bg-transparent text-sm focus:outline-none placeholder:text-[#a59d8f]/30"
                     />
                     <button className="absolute right-0 top-0 bottom-2 text-[#a59d8f] group-focus-within:text-[#f2efe9] transition-colors">
                        <ArrowRight size={16} />
                     </button>
                 </div>
             </div>
          </div>

          {/* Navigation Columns */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-16 pt-4">
              
              {/* Shop */}
              <div className="space-y-8">
                <h4 className="text-xs font-medium tracking-[0.2em] uppercase opacity-60">Shop</h4>
                <ul className="space-y-4 text-sm font-light text-[#a59d8f]">
                    <li><Link href="/products" className="hover:text-[#f2efe9] transition-colors block w-fit">All Products</Link></li>
                    <li><Link href="/products?category=Bundles" className="hover:text-[#f2efe9] transition-colors block w-fit">Bundles</Link></li>
                    <li><Link href="/products?sort=newest" className="hover:text-[#f2efe9] transition-colors block w-fit">New Arrivals</Link></li>
                    <li><Link href="/products?sort=best-selling" className="hover:text-[#f2efe9] transition-colors block w-fit">Best Sellers</Link></li>
                </ul>
              </div>

              {/* Support */}
              <div className="space-y-8">
                <h4 className="text-xs font-medium tracking-[0.2em] uppercase opacity-60">Support</h4>
                <ul className="space-y-4 text-sm font-light text-[#a59d8f]">
                    <li><Link href="#" className="hover:text-[#f2efe9] transition-colors block w-fit">Contact Us</Link></li>
                    <li><Link href="#" className="hover:text-[#f2efe9] transition-colors block w-fit">Shipping & Returns</Link></li>
                    <li><Link href="#" className="hover:text-[#f2efe9] transition-colors block w-fit">FAQ</Link></li>
                    <li><Link href="#" className="hover:text-[#f2efe9] transition-colors block w-fit">Store Locator</Link></li>
                </ul>
              </div>

              {/* Social / Contact */}
              <div className="space-y-8">
                 <h4 className="text-xs font-medium tracking-[0.2em] uppercase opacity-60">Connect</h4>
                 <div className="flex gap-6">
                    {store.store_info.social_media.instagram && (
                        <a href={store.store_info.social_media.instagram} className="hover:text-[#f2efe9] text-[#a59d8f] transition-colors"><Instagram size={20} strokeWidth={1.5} /></a>
                    )}
                    {store.store_info.social_media.facebook && (
                         <a href={store.store_info.social_media.facebook} className="hover:text-[#f2efe9] text-[#a59d8f] transition-colors"><Facebook size={20} strokeWidth={1.5} /></a>
                    )}
                     {store.store_info.social_media.youtube && (
                         <a href={store.store_info.social_media.youtube} className="hover:text-[#f2efe9] text-[#a59d8f] transition-colors"><Youtube size={20} strokeWidth={1.5} /></a>
                    )}
                 </div>
                 <div className="space-y-2 text-[#a59d8f] text-sm font-light pt-4">
                     <p>{store.store_info.contact.email}</p>
                     <p>{store.store_info.contact.phone}</p>
                 </div>
              </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end border-t border-[#a59d8f]/10 mt-24 pt-8 text-[10px] uppercase tracking-widest text-[#a59d8f]/60 font-medium">
            <p>&copy; {currentYear} {store.store_info.name}. All rights reserved.</p>
            <div className="flex gap-8 md:justify-end">
                <Link href="#" className="hover:text-[#f2efe9] transition-colors">Privacy</Link>
                <Link href="#" className="hover:text-[#f2efe9] transition-colors">Terms</Link>
                <Link href="#" className="hover:text-[#f2efe9] transition-colors">Sitemap</Link>
            </div>
        </div>
        
        {/* Big Text Brand */}
        <div className="w-full text-center mt-32 select-none pointer-events-none opacity-5">
             <span className="text-[12vw] leading-none font-gloock font-bold text-[#f2efe9]">ECHO</span>
        </div>
      </div>
    </footer>
  );
}
