'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Phone, 
  Mail, 
  Award, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  ExternalLink, 
  Star, 
  Compass, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { Button } from '../components/UIComponents';

export const WebsitePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'collection' | 'contact'>('home');

  const collections = [
    {
      title: '22K 916 KDM Bridal Jewellery',
      desc: 'Handcrafted wedding necklaces, antique harams, and intricately carved bridal sets.',
      tag: '916 KDM Gold',
      img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'Diamond & Precious Stone Rings',
      desc: 'Certified Solitaire engagement rings, floral gold bands, and gemstone creations.',
      tag: 'Certified Purity',
      img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'Pure Silver Ornaments & Utensils',
      desc: '925 Sterling Silver jewellery, silver pooja items, thalis, lamps, and return gifts.',
      tag: 'Silver 925 / 70',
      img: 'https://images.unsplash.com/photo-1611591475243-458665324267?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'Heavy Gold Bangles & Kadas',
      desc: 'Traditional Bangalore kadaga bangles, rhodium-highlighted bangles, and lightweight daily wear.',
      tag: 'BIS Hallmarked',
      img: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=600&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-charcoal-900 font-sans flex flex-col overflow-y-auto">
      {/* BRAND WEBSITE TOP HEADER BAR */}
      <header className="bg-charcoal-900 text-white sticky top-0 z-40 border-b border-gold-500/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-gold-500/40 p-1 bg-charcoal-800">
              <img src="/logo.png" alt="Azeez Jewels" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold tracking-tight text-white gold-gradient-text">Azeez Jewels</h1>
              <p className="text-[10px] text-gold-400 font-mono tracking-widest uppercase">Official Brand Website • azeezjewels.com</p>
            </div>
          </div>

          {/* WEBSITE NAVIGATION TABS */}
          <nav className="flex gap-1 bg-charcoal-800 p-1 rounded-xl border border-charcoal-700">
            {[
              { id: 'home', label: 'Home' },
              { id: 'about', label: 'About Us' },
              { id: 'collection', label: 'Collection' },
              { id: 'contact', label: 'Contact Us' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-gold-500 text-charcoal-900 shadow-md font-extrabold'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <a 
            href="https://azeezjewels.com" 
            target="_blank" 
            rel="noreferrer" 
            className="hidden md:flex items-center gap-1.5 text-xs font-bold text-gold-400 hover:text-white transition-colors bg-gold-500/10 px-3 py-1.5 rounded-lg border border-gold-500/30"
          >
            <span>azeezjewels.com</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </header>

      {/* WEBSITE TAB 1: HOME PAGE */}
      {activeTab === 'home' && (
        <div className="animate-in fade-in duration-300">
          {/* HERO BANNER SECTION */}
          <div className="relative bg-charcoal-900 text-white overflow-hidden py-20 px-6 border-b border-gold-500/20">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/40 px-4 py-1.5 rounded-full text-gold-400 text-xs font-bold tracking-widest uppercase">
                <Sparkles size={14} /> Dealers in 22 Ct 916 KDM Gold & Silver Ornaments
              </div>

              <h2 className="font-serif text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
                Timeless Elegance, Guaranteed Purity & Fine Craftsmanship
              </h2>

              <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
                Welcome to Azeez Jewels — Shivajinagar’s premier destination for certified 916 Hallmarked Gold, Silverware, and bespoke bridal jewellery creations.
              </p>

              <div className="flex justify-center gap-4 pt-4">
                <Button onClick={() => setActiveTab('collection')} className="shadow-2xl px-8 py-3 text-sm">
                  Explore Collection <ArrowRight size={16} className="ml-2" />
                </Button>
                <Button onClick={() => setActiveTab('contact')} variant="outline" className="border-gold-500/40 text-gold-400 hover:bg-gold-500/10 px-8 py-3 text-sm">
                  Visit Showroom
                </Button>
              </div>
            </div>
          </div>

          {/* KEY BRAND HIGHLIGHTS */}
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: '100% BIS Hallmarked', desc: 'Guaranteed 916 22K & 750 18K purity with official laser-etched HUID codes.', icon: ShieldCheck },
                { title: 'Proprietor Legacy', desc: 'Managed by Azmathulla Khan with trusted customer service since 1991.', icon: Award },
                { title: 'Old Gold Exchange', desc: 'Transparent testing with best market value exchange & buyback rates.', icon: Star },
                { title: 'Custom Order Booking', desc: 'Bespoke jewellery crafted according to your custom weight and design requirements.', icon: Compass }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-app-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-xl bg-gold-50 text-gold-600 flex items-center justify-center mb-4 border border-gold-200">
                      <Icon size={24} />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-charcoal-900 mb-2">{item.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FEATURED COLLECTIONS GRID */}
          <div className="bg-white py-16 border-t border-b border-app-border">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold text-gold-600 uppercase tracking-widest">Our Signature Catalogues</span>
                <h3 className="font-serif text-3xl md:text-4xl font-bold text-charcoal-900 mt-1">Exquisite Jewellery Masterpieces</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {collections.map((c, i) => (
                  <div key={i} className="group bg-[#FAF8F5] rounded-2xl overflow-hidden border border-app-border shadow-sm hover:shadow-2xl transition-all duration-300">
                    <div className="h-52 overflow-hidden relative">
                      <img src={c.img} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <span className="absolute top-3 right-3 bg-charcoal-900/90 text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                        {c.tag}
                      </span>
                    </div>
                    <div className="p-5 space-y-2">
                      <h4 className="font-serif text-lg font-bold text-charcoal-900 group-hover:text-gold-600 transition-colors">{c.title}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WEBSITE TAB 2: ABOUT US */}
      {activeTab === 'about' && (
        <div className="max-w-5xl mx-auto px-6 py-16 animate-in fade-in duration-300 space-y-12">
          <div className="bg-white p-10 rounded-3xl border border-app-border shadow-lg space-y-6">
            <span className="text-xs font-bold text-gold-600 uppercase tracking-widest">About Azeez Jewels</span>
            <h2 className="font-serif text-4xl font-bold text-charcoal-900">A Tradition of Purity & Distinction</h2>
            
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed font-normal">
              <p>
                Azeez Jewels is a celebrated jewellery showroom located in the heart of Shivajinagar, Bangalore. Founded and led by Proprietor <strong>Azmathulla Khan</strong>, our showroom has built decades of customer trust through absolute transparency, certified gold purity, and exquisite artisanal designs.
              </p>
              <p>
                We specialize in 22K 916 KDM Gold ornaments, 18K 750 Hallmark stone jewellery, pure 925 & 70 silver articles, and custom bridal order bookings. Every item in our showroom carries certified laser-etched BIS Hallmark codes.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
              <div className="text-center p-4 bg-gold-50 rounded-2xl border border-gold-100">
                <span className="block font-serif text-3xl font-bold text-gold-700">916 KDM</span>
                <span className="text-[11px] text-charcoal-800 font-bold uppercase tracking-wider">Certified Pure Gold</span>
              </div>
              <div className="text-center p-4 bg-gold-50 rounded-2xl border border-gold-100">
                <span className="block font-serif text-3xl font-bold text-gold-700">100%</span>
                <span className="text-[11px] text-charcoal-800 font-bold uppercase tracking-wider">BIS Hallmarked</span>
              </div>
              <div className="text-center p-4 bg-gold-50 rounded-2xl border border-gold-100">
                <span className="block font-serif text-3xl font-bold text-gold-700">30+ Yrs</span>
                <span className="text-[11px] text-charcoal-800 font-bold uppercase tracking-wider">Customer Trust</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WEBSITE TAB 3: COLLECTION */}
      {activeTab === 'collection' && (
        <div className="max-w-7xl mx-auto px-6 py-16 animate-in fade-in duration-300 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-gold-600 uppercase tracking-widest">Full Showcase Catalogue</span>
            <h2 className="font-serif text-4xl font-bold text-charcoal-900">Azeez Jewels Master Collection</h2>
            <p className="text-xs text-gray-600">Browse our range of certified Gold, Diamond, and Silver ornaments.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { category: 'Gold Necklaces & Harams', items: ['22K Antique Temple Haram', 'Kasumala Gold Necklace', 'Choker Set with Earrings', 'Lightweight Daily Neckwear'] },
              { category: 'Bangles & Kadas', items: ['Solid 916 Bangalore Kadaga', 'Rhodium Cut Fancy Bangles', 'Kids Gold Bangle Set', 'Lightweight Daily Wear'] },
              { category: 'Earrings & Jhumkas', items: ['Traditional Antique Jhumkas', 'Solitaire Stud Earrings', 'Gold Hoop Earrings', 'Drops & Danglers'] },
              { category: 'Rings & Chains', items: ['Men’s Solid Signet Ring', 'Bridal Engagement Rings', 'KDM Machine Gold Chain', 'Rope & Box Link Chains'] },
              { category: 'Silver Ornaments & Articles', items: ['925 Sterling Silver Anklets', 'Silver Pooja Thali & Diya Set', 'Silver Kumkum Box', 'Baby Gift Sets'] },
              { category: 'Order Booking Services', items: ['Custom Weight Manufacturing', 'Gold Price Lock Booking', 'Bridal Trousseau Design', 'Scrap Gold Exchange'] },
            ].map((col, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-app-border shadow-sm hover:shadow-lg transition-all">
                <h3 className="font-serif text-xl font-bold text-charcoal-900 border-b border-gray-100 pb-3 mb-4">{col.category}</h3>
                <ul className="space-y-2.5">
                  {col.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-center text-xs text-gray-700 font-medium">
                      <CheckCircle2 size={14} className="text-gold-600 mr-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WEBSITE TAB 4: CONTACT US */}
      {activeTab === 'contact' && (
        <div className="max-w-5xl mx-auto px-6 py-16 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-app-border shadow-lg space-y-6">
              <span className="text-xs font-bold text-gold-600 uppercase tracking-widest">Get In Touch</span>
              <h2 className="font-serif text-3xl font-bold text-charcoal-900">Visit Our Showroom</h2>
              
              <div className="space-y-4 text-xs font-medium text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold-50 text-gold-600 flex items-center justify-center shrink-0 border border-gold-200">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-charcoal-900 block">Showroom Address</span>
                    <p className="text-gray-600 leading-relaxed">#324, Jumma Masjid Road (OPH Road), Shivajinagar, Bangalore - 560051, Karnataka, India.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold-50 text-gold-600 flex items-center justify-center shrink-0 border border-gold-200">
                    <Phone size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-charcoal-900 block">Phone & WhatsApp</span>
                    <p className="text-gray-600 font-mono">+91 9916667573 (Prop: Azmathulla Khan)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold-50 text-gold-600 flex items-center justify-center shrink-0 border border-gold-200">
                    <Mail size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-charcoal-900 block">Email Inquiry</span>
                    <p className="text-gray-600">azmathkhan7676@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold-50 text-gold-600 flex items-center justify-center shrink-0 border border-gold-200">
                    <Clock size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-charcoal-900 block">Showroom Hours</span>
                    <p className="text-gray-600">Monday - Saturday: 11:00 AM – 9:00 PM | Sunday: 11:00 AM – 4:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* MAP & DOMAIN DETAILS CARD */}
            <div className="bg-charcoal-900 text-white p-8 rounded-3xl border border-gold-500/30 flex flex-col justify-between shadow-2xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gold-500/20 text-gold-400 flex items-center justify-center border border-gold-500/40">
                  <GlobeIcon size={24} />
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">Official Web Portal</h3>
                <p className="text-xs text-gray-300 leading-relaxed font-light">
                  Azeez Jewels official domain: <strong>azeezjewels.com</strong>. Registered & managed for instant customer catalogue access and digital inquiries.
                </p>
              </div>

              <div className="bg-charcoal-800 p-4 rounded-2xl border border-charcoal-700 space-y-2 mt-6">
                <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">Connect Domain</span>
                <p className="font-mono text-xs text-white font-bold">https://azeezjewels.com</p>
                <p className="text-[11px] text-gray-400">DNS Configured • SSL Encrypted</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WEBSITE FOOTER */}
      <footer className="bg-charcoal-900 text-white border-t border-charcoal-800 py-8 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© 2026 Azeez Jewels. All Rights Reserved. Proprietor: Azmathulla Khan</p>
          <div className="flex gap-6 font-mono text-[11px]">
            <span>GSTIN: 29BBGPM2303C1Z4</span>
            <span>Domain: azeezjewels.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const GlobeIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
