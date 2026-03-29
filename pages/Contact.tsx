
import React from 'react';
import { useApp } from '../App';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact: React.FC = () => {
  const { t } = useApp();

  return (
    <div className="animate-in fade-in duration-700">
      <section className="py-20 bg-zinc-950 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-4">{t('nav_contact')}</h1>
          <p className="text-xl text-zinc-400">Une question ? Nous sommes là pour vous aider à atteindre le niveau supérieur.</p>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="bg-zinc-900 p-8 md:p-12 rounded-3xl border border-zinc-800 shadow-2xl">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tight mb-8">Envoyer un Message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Nom Complet</label>
                  <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-yellow-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Email</label>
                  <input type="email" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-yellow-500 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Sujet</label>
                <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-yellow-500 transition-colors appearance-none">
                  <option>Demande d'adhésion</option>
                  <option>Offre Entreprise</option>
                  <option>Coaching Personnel</option>
                  <option>Support Général</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Message</label>
                <textarea rows={4} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-yellow-500 transition-colors resize-none"></textarea>
              </div>
              <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-black py-4 rounded-xl uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-yellow-500/10">
                <Send size={18} />
                Envoyer ma demande
              </button>
            </form>
          </div>

          {/* Info & Map */}
          <div className="space-y-12">
            <div className="grid grid-cols-1 gap-8">
              {[
                { icon: <MapPin className="text-yellow-500" />, title: "Adresse", content: "Beni khalled, Tunisia, 8021" },
                { icon: <Mail className="text-yellow-500" />, title: "Email", content: "onemorefitnes80@gmail.com" },
                { icon: <Phone className="text-yellow-500" />, title: "Téléphone", content: "+216 29 248 405" }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start group">
                  <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:border-yellow-500 transition-colors shadow-lg">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-1">{item.title}</h3>
                    <p className="text-white font-bold text-lg">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl overflow-hidden border border-zinc-800 h-80 shadow-2xl relative">
              <iframe
                title="Gym Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9916256937595!2d2.292292615674476!3d48.85837007928746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e2964e34e2d%3A0x8ddca979a741c901!2sTour%20Eiffel!5e0!3m2!1sfr!2sfr!4v1655000000000!5m2!1sfr!2sfr"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(1) invert(0.9)' }}
                allowFullScreen={true}
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
