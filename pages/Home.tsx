
import React from 'react';
import { useApp } from '../App';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, Dumbbell, Zap, Bike } from 'lucide-react';
import { ClassType } from '../types';

const Home: React.FC = () => {
  const { t } = useApp();

  const featured = [
    { 
      type: ClassType.Spinning, 
      icon: <Bike />, 
      // IMAGE SPINNING : Conséquence de votre demande précédente
      img: 'https://res.cloudinary.com/dftgawfdc/image/upload/v1774707365/generated_image_62efab04-23e4-4d53-a412-a756e8ade73b_gdjfmj.png',
      desc: "Cardio intense en salle avec jeux de lumières réactifs et musiques puissantes."
    },
    { 
      type: ClassType.CrossTraining, 
      icon: <Zap />, 
      // IMAGE CROSS TRAINING : Inchangée (Saut explosif)
      img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop',
      desc: "Sauts explosifs et mouvements fonctionnels pour une puissance brute."
    },
    { 
      type: ClassType.Bodycombat, 
      icon: <Activity />, 
      // IMAGE BODYCOMBAT : Mise à jour avec la nouvelle photo demandée
      img: 'https://res.cloudinary.com/dftgawfdc/image/upload/v1770298924/IMG_20260205_144103_cl7xmo.jpg',
      desc: "Libérez le guerrier en vous. Arts martiaux à haute intensité pour un cardio ultime."
    },
  ];

  return (
    <div className="animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=1920" 
            alt="Gym background" 
            className="w-full h-full object-cover brightness-[0.35] contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-60"></div>
          <div className="absolute inset-0 bg-gradient-t from-zinc-950 to-transparent"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-block px-4 py-1 border border-yellow-500/50 rounded-full text-yellow-500 text-[10px] font-bold tracking-[0.4em] uppercase mb-8 animate-pulse">
            Bienvenue chez One More Fit +
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight uppercase tracking-tighter italic">
            ONE MORE <span className="text-yellow-500">REP.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 mb-10 font-medium max-w-2xl mx-auto leading-relaxed">
            {t('hero_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/reservations" 
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-10 py-4 rounded-full font-black text-sm uppercase transition-all flex items-center justify-center group shadow-xl shadow-yellow-500/10"
            >
              {t('make_reservation')}
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/schedule" 
              className="bg-zinc-100 hover:bg-white text-black px-10 py-4 rounded-full font-black text-sm uppercase transition-all"
            >
              {t('view_schedule')}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Classes */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-yellow-500 font-bold uppercase tracking-[0.3em] text-[10px]">Entraînement Professionnel</span>
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mt-2 italic">NOS PROGRAMMES <span className="text-yellow-500">PHARE</span></h2>
            </div>
            <Link to="/schedule" className="text-zinc-500 hover:text-white font-bold uppercase text-[10px] tracking-[0.2em] transition-colors border-b border-zinc-800 pb-1">
              Voir tout le planning
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((item, idx) => (
              <div key={idx} className="group relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-yellow-500/50 transition-all duration-500 shadow-2xl">
                <div className="aspect-[4/5] overflow-hidden">
                  <img 
                    src={item.img} 
                    alt={item.type} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-[0.7] group-hover:brightness-100" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-90"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-yellow-500 rounded-lg text-black">
                        {React.cloneElement(item.icon as React.ReactElement, { size: 20, className: 'text-black' })}
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white italic">{item.type}</h3>
                  </div>
                  <p className="text-zinc-400 text-xs mb-6 leading-relaxed opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    {item.desc}
                  </p>
                  <Link to="/schedule" className="bg-white/10 backdrop-blur-md text-white font-bold uppercase text-[10px] tracking-widest px-4 py-2 rounded-full inline-flex items-center hover:bg-yellow-500 hover:text-black transition-all">
                    Vérifier disponibilités <ArrowRight size={12} className="ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-zinc-900 border-y border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Membres Actifs", val: "500+" },
              { label: "Cours Hebdo", val: "40+" },
              { label: "Coachs Experts", val: "12" },
              { label: "Satisfaction", val: "99%" }
            ].map((stat, i) => (
              <div key={i} className="text-center p-8 bg-zinc-950 rounded-2xl border border-zinc-800 group hover:border-yellow-500 transition-colors">
                <div className="text-3xl font-black text-yellow-500 italic mb-2">{stat.val}</div>
                <div className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest group-hover:text-zinc-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
