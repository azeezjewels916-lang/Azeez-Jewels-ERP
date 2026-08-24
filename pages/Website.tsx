import React from 'react';
import { ExternalLink, Globe, Sparkles, Phone, MapPin } from 'lucide-react';
import { Button } from '../components/UIComponents';

export const WebsitePage: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-[#FAF8F5] p-8 overflow-y-auto font-sans">
      <div className="max-w-4xl mx-auto w-full bg-white rounded-3xl border border-app-border p-10 shadow-luxury space-y-8">
        <div className="flex items-center justify-between border-b border-gold-500/20 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-gold-500/40 p-1 bg-charcoal-900 flex items-center justify-center">
              <img src="/logowithoutbg.png" alt="Azeez Jewels" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold gold-gradient-text">Azeez Jewels Showcase</h2>
              <p className="text-xs text-gray-500 font-mono">Official Marketing Website & Brand Showcase</p>
            </div>
          </div>

          <a 
            href="https://azeezjewels.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-gold-gradient px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
          >
            <span>Open Website (azeezjewels.com)</span>
            <ExternalLink size={14} />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-sand/60 border border-gold-500/20 space-y-2">
            <Sparkles size={20} className="text-gold-500" />
            <h4 className="font-serif text-lg font-bold">22K 916 KDM Gold</h4>
            <p className="text-xs text-gray-500 font-light">Showcasing certified bridal harams, kadagas, and traditional Shivajinagar designs.</p>
          </div>

          <div className="p-6 rounded-2xl bg-sand/60 border border-gold-500/20 space-y-2">
            <Phone size={20} className="text-gold-500" />
            <h4 className="font-serif text-lg font-bold">Online Inquiry</h4>
            <p className="text-xs text-gray-500 font-light">Direct WhatsApp concierge inquiries & rate-lock order booking requests.</p>
          </div>

          <div className="p-6 rounded-2xl bg-sand/60 border border-gold-500/20 space-y-2">
            <MapPin size={20} className="text-gold-500" />
            <h4 className="font-serif text-lg font-bold">Shivajinagar Store</h4>
            <p className="text-xs text-gray-500 font-light">#324 Jumma Masjid Road, Bangalore. Proprietor: Azmathulla Khan.</p>
          </div>
        </div>

        <div className="pt-4 text-center">
          <p className="text-xs text-gray-400 font-mono">
            The brand marketing site runs on port 5174 (`website/` directory).
          </p>
        </div>
      </div>
    </div>
  );
};

export default WebsitePage;
