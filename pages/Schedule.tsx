
import React from 'react';
import { useApp } from '../AppContext';
import { DAYS_FR_TO_EN } from '../constants';
import { Link } from 'react-router-dom';
// Added Dumbbell icon to the lucide-react imports
import { Clock, Users, Dumbbell } from 'lucide-react';

const Schedule: React.FC = () => {
  const { language, t, reservations, gymClasses } = useApp();

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const getSpotsFilled = (classId: string) => {
    return reservations.filter(r => r.classId === classId).length;
  };

  return (
    <div className="py-16 px-4 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-yellow-500 font-bold uppercase tracking-[0.3em] text-[10px]">Weekly Planning</span>
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter mt-2 leading-none">{t('nav_schedule')}</h1>
          <p className="text-zinc-500 mt-4 text-sm max-w-md mx-auto">Choose your battle. Book your spot in advance to secure equipment.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {days.map((day) => {
            const dayClasses = gymClasses.filter(c => c.day === day).sort((a, b) => a.time.localeCompare(b.time));
            const displayDay = language === 'en' ? DAYS_FR_TO_EN[day] : day;

            return (
              <div key={day} className="flex flex-col bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 h-full">
                <div className="bg-zinc-800/50 px-4 py-4 text-center border-b border-zinc-800">
                  <span className="text-white font-black uppercase tracking-[0.2em] text-[10px] italic">{displayDay}</span>
                </div>
                <div className="p-3 space-y-3 flex-grow min-h-[450px]">
                  {dayClasses.map((item) => {
                    const filled = getSpotsFilled(item.id);
                    const isFull = filled >= item.capacity;

                    return (
                      <Link
                        key={item.id}
                        to="/reservations"
                        className={`block p-4 rounded-xl transition-all group ${isFull
                            ? 'bg-zinc-950 border border-zinc-900 opacity-60'
                            : 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-800 hover:border-yellow-500/40'
                          }`}
                      >
                        <div className="flex items-center text-yellow-500 mb-2">
                          <Clock size={14} className="mr-2" />
                          <span className="text-[10px] font-black tracking-widest uppercase italic">{item.time}</span>
                        </div>
                        <h4 className="text-white font-black text-xs uppercase tracking-tight mb-4 group-hover:text-yellow-500 transition-colors">
                          {item.name}
                        </h4>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center text-zinc-500 text-[9px] uppercase font-black">
                            <Users size={12} className="mr-1.5" />
                            <span>{filled}/{item.capacity}</span>
                          </div>
                          {isFull ? (
                            <span className="text-red-500/70 font-black text-[8px] uppercase tracking-tighter italic">COMPLET</span>
                          ) : (
                            <span className="text-yellow-500 font-black text-[8px] uppercase tracking-tighter italic">JOIN</span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                  {dayClasses.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                      <Dumbbell size={32} className="text-zinc-600 mb-2" />
                      <span className="text-zinc-600 text-[9px] uppercase font-black italic tracking-widest">Rest Day</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-20 bg-zinc-900 border border-zinc-800 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-yellow-500 rounded-3xl flex items-center justify-center text-black shadow-2xl shadow-yellow-500/20 rotate-3">
              <Users size={40} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-white font-black text-2xl uppercase tracking-tight italic">Ready for One More?</h3>
              <p className="text-zinc-500 text-sm mt-1">Join the elite community of fitness warriors.</p>
            </div>
          </div>
          <Link to="/reservations" className="bg-white text-black px-12 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-yellow-500 transition-all hover:scale-105 shadow-xl">
            Book My Spot
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
