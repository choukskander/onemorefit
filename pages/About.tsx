
import React, { useRef } from 'react';
import { useApp } from '../AppContext';
import { Award, Target, Users, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const About: React.FC = () => {
  const { t } = useApp();

  const trainers = [
    { name: "Amal Boughdiri", role: "Sports Education teacher & Fitness", img: "https://res.cloudinary.com/dftgawfdc/image/upload/v1774709356/569763260_18331042066232304_7344315289381317254_n._qft45u.jpg", bio: "rpm et spining, Abdos et cross training" },
    { name: "Dali Aniba", role: "Fitness Coach", img: "https://res.cloudinary.com/dftgawfdc/image/upload/v1774709486/503712205_18486622198067241_4670692557767664809_n._mqgdx3.jpg", bio: "Certified Lesmils 🏅💪🏻🏋️ Personal trainer 📒 Football player bodycombat coach" },
    { name: "khaled akida", role: "Fitness Coach", img: "https://res.cloudinary.com/dftgawfdc/image/upload/v1774709664/642504485_18179276815374589_282040092270797325_n._jnmyjv.jpg", bio: "bodycombat coach, bodyattack et pump" },
    { name: "Mustfa Raî", role: "Physical Education Teacher 📚", img: "https://res.cloudinary.com/dftgawfdc/image/upload/v1774710928/Capture_d_%C3%A9cran_2026-03-28_161506_bllrki.png", bio: "Professional Football Coach ⚽️, spinning, TRX, Abdos et circuit" },
    { name: 'Med. amine "Med JC"', role: "Personal trainer", img: "https://res.cloudinary.com/dftgawfdc/image/upload/v1774870353/643593867_18572663719013579_5860835218634155598_n._qdai5b.webp", bio: "Expert en coaching personnel et transformation physique, TRX et Abdos." },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const testimonials = [
    { name: "Hamda.", text: "L'ambiance est imbattable. Chaque cours est un défi et un plaisir à la fois." },
    { name: "Ghada.", text: "Les séances 100% Femmes ont changé ma vie. Je me sens plus forte que jamais." },
    { name: "Med Amin.", text: "Les coachs ici se soucient vraiment de votre technique et de votre progression." },
  ];

  return (
    <div className="animate-in slide-in-from-bottom duration-700">
      {/* Hero Section */}
      <section className="py-20 bg-zinc-950 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-6">{t('nav_about')}</h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">{t('about_desc')}</p>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <Target className="text-yellow-500" size={40} />, title: "Précision", desc: "Nous nous concentrons sur la forme correcte pour des résultats optimaux." },
              { icon: <Award className="text-yellow-500" size={40} />, title: "Excellence", desc: "Équipement haut de gamme et programmes d'entraînement d'élite." },
              { icon: <Users className="text-yellow-500" size={40} />, title: "Communauté", desc: "Un lieu où vous ne vous entraînez jamais seul. Le soutien est notre cœur." }
            ].map((v, i) => (
              <div key={i} className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 text-center hover:border-yellow-500/50 transition-colors">
                <div className="mb-6 flex justify-center">{v.icon}</div>
                <h3 className="text-2xl font-bold text-white uppercase mb-4 tracking-tight">{v.title}</h3>
                <p className="text-zinc-400 leading-relaxed text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trainers */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-4">{t('trainers_title')}</h2>
            <div className="h-1 w-20 bg-yellow-500 mx-auto"></div>
          </div>
          <div className="relative group/nav">
            <button 
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 rounded-full bg-yellow-500 text-black opacity-0 group-hover/nav:opacity-100 transition-opacity hover:scale-110 hidden md:flex"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 rounded-full bg-yellow-500 text-black opacity-0 group-hover/nav:opacity-100 transition-opacity hover:scale-110 hidden md:flex"
            >
              <ChevronRight size={24} />
            </button>

            <div 
              ref={scrollRef}
              className="flex overflow-x-auto gap-8 pb-8 snap-x snap-mandatory scrollbar-hide no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {trainers.map((trainer, i) => (
                <div key={i} className="min-w-[280px] sm:min-w-[320px] snap-center">
                  <div className="group overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 h-full">
                    <div className="aspect-[3/4] overflow-hidden md:grayscale md:group-hover:grayscale-0 transition-all duration-500">
                      <img src={trainer.img} alt={trainer.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-6">
                      <h4 className="text-white font-bold uppercase tracking-tight text-lg mb-1">{trainer.name}</h4>
                      <p className="text-yellow-500 text-[10px] font-bold uppercase tracking-widest mb-3">{trainer.role}</p>
                      <p className="text-zinc-500 text-xs line-clamp-3">{trainer.bio}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-4">{t('testimonials_title')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="relative bg-zinc-900 p-10 rounded-2xl border border-zinc-800">
                <Quote className="absolute top-6 left-6 text-zinc-800" size={40} />
                <p className="relative z-10 text-zinc-300 italic mb-6 leading-relaxed text-sm">"{t.text}"</p>
                <div className="text-yellow-500 font-bold uppercase tracking-widest text-[10px] italic">- {t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
