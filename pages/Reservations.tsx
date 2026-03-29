
import React, { useState } from 'react';
import { useApp } from '../App';
import { GYM_SCHEDULE, DAYS_FR_TO_EN } from '../constants';
import { CheckCircle2, AlertCircle, Users, Clock, Loader2, Calendar, ShieldX } from 'lucide-react';
import { GymClass, User } from '../types';

const Reservations: React.FC = () => {
  const { 
    t, user, setUser, 
    registeredUsers, setRegisteredUsers, 
    reservations, setReservations, 
    waitlist, setWaitlist, language 
  } = useApp();

  const getTodayInFrench = () => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const todayIndex = new Date().getDay();
    return days[todayIndex];
  };

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedDay, setSelectedDay] = useState<string>(getTodayInFrench());
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const daysList = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      if (isLoginMode) {
        const existingUser = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (existingUser) {
          // VÉRIFICATION COMPTE BLOQUÉ
          if (existingUser.blocked) {
            setMessage({ type: 'error', text: "Votre compte a été suspendu par l'administrateur." });
            setIsSubmitting(false);
            return;
          }

          // VÉRIFICATION MOT DE PASSE
          if (existingUser.password !== password) {
            setMessage({ type: 'error', text: "Mot de passe incorrect." });
            setIsSubmitting(false);
            return;
          }

          setUser(existingUser);
          setMessage({ type: 'success', text: `Ravi de vous revoir, ${existingUser.name || existingUser.email}!` });
          setTimeout(() => {
              setMessage(null);
              if (existingUser.email === 'admin@gmail.com') {
                  window.location.hash = '#/admin';
              }
          }, 1500); // Raccourci le délai pour l'admin
        } else {
          setMessage({ type: 'error', text: "Compte inexistant. Veuillez d'abord vous inscrire." });
        }
      } else {
        const alreadyExists = registeredUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
        if (alreadyExists) {
          setMessage({ type: 'error', text: "Cet email est déjà utilisé. Veuillez vous connecter." });
        } else {
          const newUser: User = { email, name, password };
          setRegisteredUsers([...registeredUsers, newUser]);
          setUser(newUser);
          setMessage({ type: 'success', text: "Bienvenue au club ! Votre compte a été créé." });
          setTimeout(() => {
              setMessage(null);
              if (newUser.email === 'admin@gmail.com') {
                  window.location.hash = '#/admin';
              }
          }, 1500);
        }
      }
      setIsSubmitting(false);
    }, 800);
  };

  const getSpotsFilled = (classId: string) => {
    return reservations.filter(r => r.classId === classId).length;
  };

  const isAlreadyReserved = (classId: string) => {
    return user && reservations.some(r => r.classId === classId && r.userEmail === user.email);
  };

  // Retourne l'état temporel d'un cours : 'available' | 'in_progress' | 'past'
  const CLASS_DURATION_MINUTES = 60; // Durée par défaut d'un cours

  const getClassStatus = (classDay: string, classTime: string): 'available' | 'in_progress' | 'past' => {
    const today = getTodayInFrench();
    if (classDay !== today) return 'available'; // Autre jour = disponible

    const now = new Date();
    const [hours, minutes] = classTime.split(':').map(Number);

    const classStart = new Date();
    classStart.setHours(hours, minutes, 0, 0);

    const classEnd = new Date(classStart);
    classEnd.setMinutes(classEnd.getMinutes() + CLASS_DURATION_MINUTES);

    if (now < classStart) return 'available';
    if (now >= classStart && now < classEnd) return 'in_progress';
    return 'past';
  };

  const handleBook = (gymClass: GymClass) => {
    if (!user) return;
    const status = getClassStatus(gymClass.day, gymClass.time);
    if (status === 'in_progress') {
      setMessage({ type: 'error', text: "Ce cours est actuellement en cours, la réservation est fermée." });
      return;
    }
    if (status === 'past') {
      setMessage({ type: 'error', text: "Ce cours est déjà terminé, vous ne pouvez plus le réserver." });
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      const filled = getSpotsFilled(gymClass.id);
      
      if (isAlreadyReserved(gymClass.id)) {
        setMessage({ type: 'error', text: t('already_reserved') });
        setIsSubmitting(false);
        return;
      }

      if (filled >= gymClass.capacity) {
        setWaitlist([...waitlist, { userEmail: user.email, classId: gymClass.id }]);
        setMessage({ type: 'success', text: t('waitlist_success') });
      } else {
        const newReservation = {
          id: Math.random().toString(36).substr(2, 9),
          userEmail: user.email,
          classId: gymClass.id,
          timestamp: Date.now()
        };
        setReservations([...reservations, newReservation]);
        setMessage({ type: 'success', text: t('reservation_success') });
      }
      
      setIsSubmitting(false);
      setTimeout(() => setMessage(null), 5000);
    }, 800);
  };

  const dayClasses = GYM_SCHEDULE.filter(c => c.day === selectedDay).sort((a,b) => a.time.localeCompare(b.time));

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 animate-in fade-in duration-500">
        <div className="bg-zinc-900 p-8 md:p-12 rounded-3xl border border-zinc-800 shadow-2xl max-w-md w-full relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl"></div>
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-white uppercase italic mb-2 tracking-tighter">
              {isLoginMode ? "Connectez-vous" : "Créez votre compte"}
            </h1>
            <p className="text-zinc-500 text-sm">
              {isLoginMode ? "Accédez à votre planning personnalisé." : "Rejoignez la communauté One More Fit +"}
            </p>
          </div>

          {message && message.type === 'error' && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl flex items-center gap-3 animate-in slide-in-from-top text-xs font-bold uppercase tracking-tight">
              {message.text.includes("suspendu") ? <ShieldX size={18} /> : <AlertCircle size={18} />}
              {message.text}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {!isLoginMode && (
              <div className="animate-in slide-in-from-left duration-300">
                <label className="block text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-3">Nom complet</label>
                <input 
                  type="text" 
                  required={!isLoginMode}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-yellow-500 transition-all font-medium"
                  placeholder="John Doe"
                />
              </div>
            )}
            <div>
              <label className="block text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-3">Adresse Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-yellow-500 transition-all font-medium"
                placeholder="vous@exemple.com"
              />
            </div>
            <div>
              <label className="block text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-3">Mot de passe</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-yellow-500 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-black py-4 rounded-xl uppercase tracking-widest transition-all shadow-xl shadow-yellow-500/10 flex justify-center items-center"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (isLoginMode ? "Se connecter" : "S'inscrire")}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-zinc-800 text-center">
            <button 
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setMessage(null);
              }}
              className="text-yellow-500 text-[10px] uppercase font-black tracking-[0.2em] hover:text-white transition-colors"
            >
              {isLoginMode ? "Pas de compte ? Inscrivez-vous" : "Déjà membre ? Connectez-vous"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 px-4 max-w-7xl mx-auto animate-in slide-in-from-right duration-500">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-yellow-500" size={16} />
            <span className="text-yellow-500 font-bold uppercase tracking-[0.3em] text-[10px]">Planning du {selectedDay} {selectedDay === getTodayInFrench() && "(Aujourd'hui)"}</span>
          </div>
          <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">{t('nav_reservations')}</h1>
          <p className="text-zinc-500 mt-4 text-sm">Prêt pour un nouveau défi, <span className="text-zinc-200 font-bold">{user.name || user.email.split('@')[0]}</span> ?</p>
        </div>
        <div className="flex bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {daysList.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                selectedDay === day ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-zinc-500 hover:text-white'
              }`}
            >
              {language === 'en' ? DAYS_FR_TO_EN[day] : day}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className={`mb-10 p-5 rounded-2xl flex items-center gap-4 animate-in fade-in zoom-in duration-300 ${
          message.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <p className="font-bold text-sm tracking-tight">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-white font-black uppercase text-xl italic mb-8 flex items-center gap-3">
            Cours de {selectedDay}
            <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
          </h2>
          {dayClasses.map((item) => {
            const filled = getSpotsFilled(item.id);
            const isFull = filled >= item.capacity;
            const reserved = isAlreadyReserved(item.id);
            const classStatus = getClassStatus(item.day, item.time);
            const isInProgress = classStatus === 'in_progress';
            const isPast = classStatus === 'past';
            const isUnavailable = isInProgress || isPast;

            return (
              <div 
                key={item.id} 
                className={`bg-zinc-900 rounded-3xl p-8 border transition-all duration-300 ${
                  isPast
                    ? 'border-zinc-800/40 opacity-55'
                    : isInProgress
                      ? 'border-orange-500/30 shadow-lg shadow-orange-500/5'
                      : reserved 
                        ? 'border-yellow-500/50 shadow-2xl shadow-yellow-500/5' 
                        : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-3 mb-4">
                      <div className={`flex items-center text-[10px] font-black uppercase tracking-widest ${
                        isPast ? 'text-zinc-600' : isInProgress ? 'text-orange-400' : 'text-yellow-500'
                      }`}>
                        <Clock size={16} className="mr-2" />
                        {item.time}
                      </div>
                      <div className={`flex items-center text-[10px] font-black uppercase tracking-widest ${isFull ? 'text-zinc-600' : 'text-zinc-400'}`}>
                        <Users size={16} className="mr-2" />
                        {filled} / {item.capacity}
                      </div>
                      {isInProgress && (
                        <span className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-orange-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse inline-block"></span>
                          En cours
                        </span>
                      )}
                      {isPast && (
                        <span className="bg-zinc-800 text-zinc-500 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-zinc-700">
                          Terminé
                        </span>
                      )}
                    </div>
                    <h3 className={`text-3xl font-black uppercase tracking-tight italic mb-3 ${
                      isPast ? 'text-zinc-500' : isInProgress ? 'text-orange-200' : 'text-white'
                    }`}>{item.name}</h3>
                    <p className="text-zinc-500 text-sm max-w-md leading-relaxed">
                        Session intensive de {item.type} pour sculpter votre corps et renforcer votre mental.
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {isPast ? (
                      <div className="bg-zinc-800/50 text-zinc-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase border border-zinc-700/50 flex items-center gap-3">
                        <Clock size={16} /> Cours terminé
                      </div>
                    ) : isInProgress ? (
                      <div className="bg-orange-500/10 text-orange-400 px-6 py-3 rounded-xl font-black text-[10px] uppercase border border-orange-500/30 flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                        En cours
                      </div>
                    ) : reserved ? (
                      <div className="bg-yellow-500/10 text-yellow-500 px-6 py-3 rounded-xl font-black text-[10px] uppercase italic border border-yellow-500/30 flex items-center gap-3">
                        <CheckCircle2 size={16} /> {t('already_reserved')}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleBook(item)}
                        disabled={isSubmitting}
                        className={`w-full sm:w-auto px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                          isFull 
                            ? 'bg-zinc-800 text-zinc-500 border border-zinc-700' 
                            : 'bg-white text-black hover:bg-yellow-500 shadow-xl'
                        } disabled:opacity-50`}
                      >
                        {isSubmitting ? (
                          <Loader2 className="animate-spin" size={20} />
                        ) : (
                          isFull ? t('join_waitlist') : t('reserve_now')
                        )}
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="mt-8 bg-zinc-950 h-2 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 ease-out ${
                          isPast ? 'bg-zinc-800' : isInProgress ? 'bg-orange-500/60' : isFull ? 'bg-zinc-700' : 'bg-yellow-500'
                        }`} 
                        style={{ width: `${isInProgress ? 100 : (filled / item.capacity) * 100}%` }}
                    />
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-8 lg:sticky lg:top-28">
            <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
                <h3 className="text-white font-black uppercase text-xl italic mb-8">Tableau de Bord</h3>
                <div className="space-y-6">
                    <div className="flex justify-between items-center py-4 border-b border-zinc-800 text-sm">
                        <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Mes Réservations</span>
                        <span className="text-white font-black italic">{reservations.filter(r => r.userEmail === user.email).length}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-zinc-800 text-sm">
                        <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">En attente</span>
                        <span className="text-white font-black italic">{waitlist.filter(w => w.userEmail === user.email).length}</span>
                    </div>
                </div>
                <button 
                  onClick={() => setUser(null)}
                  className="mt-10 w-full py-4 rounded-xl border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all font-black text-[10px] uppercase tracking-widest"
                >
                    Se déconnecter
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Reservations;
