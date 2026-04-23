 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { GYM_SCHEDULE } from '../constants';
import { Users, BookOpen, Ban, Trash2, ShieldCheck, Search, PlusCircle, CheckCircle } from 'lucide-react';
import { Reservation, User } from '../types';
import { Mail, CalendarPlus, Send, History } from 'lucide-react';

const API_URL = (import.meta as any).env.VITE_API_URL || '';

const AdminDashboard: React.FC = () => {
  const {
    user, registeredUsers, setRegisteredUsers,
    reservations, setReservations,
    gymClasses, setGymClasses,
    contacts, setContacts,
    refreshContacts
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'reservations' | 'schedule' | 'contacts'>('users');
  const [userSearch, setUserSearch] = useState('');
  const [resSearch, setResSearch] = useState('');

  const [manualUserEmail, setManualUserEmail] = useState('');
  const [manualClassId, setManualClassId] = useState('');
  const [showAddRes, setShowAddRes] = useState(false);

  // States pour gestion du planning
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '',
    type: 'Pump',
    day: 'Lundi',
    time: '08:00',
    capacity: 20
  });

  // States pour abonnements
  const [editingSub, setEditingSub] = useState<string | null>(null);
  const [subStatusMsg, setSubStatusMsg] = useState<{ email: string, text: string, type: 'success' | 'error' } | null>(null);

  const navigate = useNavigate();

  // --- VÉRIFICATION DE SÉCURITÉ & REDIRECTION ---
  useEffect(() => {
  // Si l'utilisateur se déconnecte, on le renvoie à l'accueil sans alerte
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'contacts') {
      refreshContacts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Si pas admin, on affiche le message d'accès refusé (cas de lien direct sans être admin)
  if (!user || user.email !== 'admin@gmail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 p-10 rounded-3xl text-center max-w-md">
          <Ban size={64} className="text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Accès Refusé</h2>
          <p className="text-zinc-400 text-sm">Veuillez vous connecter avec le compte administrateur pour accéder à cette zone.</p>
        </div>
      </div>
    );
  }

  // --- ACTIONS UTILISATEURS ---
  const toggleBlockUser = (email: string) => {
    setRegisteredUsers(registeredUsers.map(u =>
      u.email === email ? { ...u, blocked: !u.blocked } : u
    ));
  };

  const deleteUser = (email: string) => {
    if (window.confirm(`Supprimer définitivement le compte ${email} ?`)) {
      setRegisteredUsers(registeredUsers.filter(u => u.email !== email));
      // Nettoyer ses réservations aussi
      setReservations(reservations.filter(r => r.userEmail !== email));
    }
  };

  // --- ACTIONS ABONNEMENTS ---
  const handleUpdateSubscription = async (email: string, monthsToAdd: number) => {
    const targetUser = registeredUsers.find(u => u.email === email);
    if (!targetUser) return;

    let baseDate = new Date();
    // Si l'abonnement actuel est encore futur, on ajoute à partir de cette date
    if (targetUser.subscriptionEndDate && new Date(targetUser.subscriptionEndDate) > new Date()) {
      baseDate = new Date(targetUser.subscriptionEndDate);
    }

    baseDate.setMonth(baseDate.getMonth() + monthsToAdd);
    const newEndDate = baseDate.toISOString().split('T')[0];

    try {
      const resp = await fetch(`${API_URL}/api/users/${email}/subscription`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionEndDate: newEndDate })
      });

      if (!resp.ok) throw new Error("Erreur de mise à jour");

      // Update local state
      setRegisteredUsers(registeredUsers.map(u =>
        u.email === email ? { ...u, subscriptionEndDate: newEndDate } : u
      ));

      setSubStatusMsg({ email, text: `Abonnement prolongé jusqu'au ${newEndDate}`, type: 'success' });
      setTimeout(() => setSubStatusMsg(null), 3000);
      setEditingSub(null);
    } catch (err) {
      setSubStatusMsg({ email, text: "Erreur de connexion au serveur", type: 'error' });
      setTimeout(() => setSubStatusMsg(null), 3000);
    }
  };

  const sendManualReminder = async (email: string) => {
    setSubStatusMsg({ email, text: "Envoi du rappel...", type: 'success' });
    try {
      const resp = await fetch(`${API_URL}/api/send-reminder/${email}`, { method: 'POST' });
      const data = await resp.json();

      if (!resp.ok) throw new Error(data.error || "Erreur d'envoi");

      setSubStatusMsg({ email, text: "📧 Rappel envoyé avec succès !", type: 'success' });
    } catch (err: any) {
      setSubStatusMsg({ email, text: `❌ ${err.message}`, type: 'error' });
    }
    setTimeout(() => setSubStatusMsg(null), 4000);
  };

  const handleSetSpecificDate = async (email: string, dateStr: string) => {
    try {
      setSubStatusMsg({ email, text: "Mise à jour...", type: 'success' });
      const resp = await fetch(`${API_URL}/api/users/${email}/subscription`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionEndDate: dateStr })
      });

      if (!resp.ok) throw new Error("Erreur serveur");

      setRegisteredUsers(registeredUsers.map(u =>
        u.email === email ? { ...u, subscriptionEndDate: dateStr } : u
      ));

      setSubStatusMsg({ email, text: "📅 Date enregistrée !", type: 'success' });
    } catch (err) {
      setSubStatusMsg({ email, text: "Erreur de mise à jour", type: 'error' });
    }
    setTimeout(() => setSubStatusMsg(null), 3000);
  };

  // --- ACTIONS RÉSERVATIONS ---
  const cancelReservation = (id: string) => {
    if (window.confirm("Annuler cette réservation ?")) {
      setReservations(reservations.filter(r => r.id !== id));
    }
  };

  const addManualReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUserEmail || !manualClassId) return;

    // Vérifier si l'utilisateur existe
    const targetUser = registeredUsers.find(u => u.email.toLowerCase() === manualUserEmail.toLowerCase());
    if (!targetUser) {
      alert("Cet utilisateur n'existe pas encore.");
      return;
    }

    const newRes: Reservation = {
      id: Math.random().toString(36).substr(2, 9),
      userEmail: targetUser.email,
      classId: manualClassId,
      timestamp: Date.now()
    };

    setReservations([...reservations, newRes]);
    setShowAddRes(false);
    setManualUserEmail('');
    setManualClassId('');
    alert("Réservation ajoutée avec succès !");
  };

  // --- ACTIONS PLANNING ---
  const deleteClass = (id: string) => {
    if (window.confirm("Supprimer ce cours du planning ? Cela n'affectera pas les réservations passées mais empêchera les nouvelles.")) {
      setGymClasses(gymClasses.filter(c => c.id !== id));
    }
  };

  const addClass = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `class-${Math.random().toString(36).substr(2, 9)}`;
    const classToAdd = { ...newClass, id, capacity: Number(newClass.capacity) } as any;
    setGymClasses([...gymClasses, classToAdd]);
    setShowAddClass(false);
    setNewClass({ name: '', type: 'Pump', day: 'Lundi', time: '08:00', capacity: 20 });
    alert("Cours ajouté au planning !");
  };

  // --- ACTIONS CONTACTS ---
  const deleteContact = async (id: string) => {
    if (window.confirm("Supprimer ce message de contact ?")) {
      try {
        const resp = await fetch(`${API_URL}/api/contacts/${id}`, {
          method: 'DELETE'
        });
        if (resp.ok) {
          setContacts(contacts.filter(contact => contact.id !== id));
        } else {
          alert("Erreur lors de la suppression du contact.");
        }
      } catch (err) {
        console.error("Erreur suppression:", err);
      }
    }
  };

  // --- FILTRES ---
  const filteredUsers = registeredUsers.filter(u =>
    u.email !== 'admin@gmail.com' && (
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase()))
    )
  );

  const filteredReservations = reservations.filter(r =>
    r.userEmail.toLowerCase().includes(resSearch.toLowerCase())
  ).sort((a, b) => b.timestamp - a.timestamp);

  // --- STATISTIQUES ---
  const stats = [
    { label: "Membres", value: registeredUsers.length - 1, icon: <Users size={20} />, color: "text-blue-500" },
    { label: "Réservations", value: reservations.length, icon: <BookOpen size={20} />, color: "text-yellow-500" },
  ];

  return (
    <div className="py-16 px-4 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-12">
        <span className="text-yellow-500 font-bold uppercase tracking-[0.3em] text-[10px]">Espace Administrateur</span>
        <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter mt-2 leading-none">Console de Gestion</h1>
      </div>

      {/* Cartes Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((s, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">{s.label}</p>
              <p className="text-4xl font-black text-white italic">{s.value}</p>
            </div>
            <div className={`p-4 bg-zinc-950 rounded-2xl ${s.color}`}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 sm:flex-none sm:px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
            }`}
        >
          <span className="hidden sm:inline">Gestion </span>Membres
        </button>
        <button
          onClick={() => setActiveTab('reservations')}
          className={`flex-1 sm:flex-none sm:px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'reservations' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
            }`}
        >
          <span className="hidden sm:inline">Gestion </span>Réservations
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 sm:flex-none sm:px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'schedule' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
            }`}
        >
          <span className="hidden sm:inline">Gestion </span>Planning
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex-1 sm:flex-none sm:px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'contacts' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
            }`}
        >
          <span className="hidden sm:inline">Gestion </span>Contacts
        </button>
      </div>

      {/* CONTENU USERS */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input
              type="text"
              placeholder="Rechercher un membre par nom ou email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-5 pl-14 pr-6 text-white focus:outline-none focus:border-yellow-500 transition-all font-medium"
            />
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-zinc-950 border-b border-zinc-800">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest text-left">Utilisateur</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest text-left">Abonnement</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest text-left">Statut</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredUsers.map((u) => (
                  <tr key={u.email} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="text-white font-black italic">{u.name || "N/A"}</p>
                      <p className="text-zinc-500 text-xs">{u.email}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2 min-w-[140px]">
                        <input
                          type="date"
                          value={u.subscriptionEndDate || ''}
                          onChange={(e) => handleSetSpecificDate(u.email, e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all cursor-pointer font-mono"
                        />

                        <div className="flex items-center justify-between px-1">
                          {u.subscriptionEndDate && (
                            <p className={`text-[9px] uppercase font-black ${new Date(u.subscriptionEndDate) < new Date() ? 'text-red-500' : 'text-zinc-500'}`}>
                              {new Date(u.subscriptionEndDate) < new Date() ? '• Expiré' : '• Actif'}
                            </p>
                          )}

                          {subStatusMsg?.email === u.email && (
                            <p className={`text-[9px] font-bold ${subStatusMsg.type === 'success' ? 'text-green-500' : 'text-red-500'} animate-pulse`}>
                              {subStatusMsg.text}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {u.blocked ? (
                        <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-red-500/20">Bloqué</span>
                      ) : (
                        <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-green-500/20">Actif</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right space-x-2">
                      {/* Section Abonnement Rapide */}
                      <div className="inline-flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                        <button
                          onClick={() => handleUpdateSubscription(u.email, 1)}
                          className="px-2 py-1 text-[8px] font-black text-zinc-400 hover:text-yellow-500 hover:bg-zinc-900 rounded transition-all"
                          title="+1 mois"
                        >+1m</button>
                        <button
                          onClick={() => handleUpdateSubscription(u.email, 2)}
                          className="px-2 py-1 text-[8px] font-black text-zinc-400 hover:text-yellow-500 hover:bg-zinc-900 rounded transition-all"
                          title="+2 mois"
                        >+2m</button>
                        <button
                          onClick={() => handleUpdateSubscription(u.email, 12)}
                          className="px-2 py-1 text-[8px] font-black text-zinc-400 hover:text-yellow-500 hover:bg-zinc-900 rounded transition-all"
                          title="+1 an"
                        >+1a</button>
                      </div>

                      <button
                        onClick={() => sendManualReminder(u.email)}
                        disabled={!u.subscriptionEndDate}
                        className={`p-2 rounded-lg border transition-all ${u.subscriptionEndDate ? 'border-blue-500/30 text-blue-500 bg-blue-500/5 hover:bg-blue-500/20' : 'border-zinc-800 text-zinc-700 opacity-50 cursor-not-allowed'
                          }`}
                        title="Envoyer rappel email"
                      >
                        <Mail size={16} />
                      </button>

                      <button
                        onClick={() => toggleBlockUser(u.email)}
                        className={`p-2 rounded-lg border transition-all ${u.blocked ? 'border-green-500/30 text-green-500 bg-green-500/5 hover:bg-green-500/20' : 'border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500/20'
                          }`}
                        title={u.blocked ? "Débloquer" : "Bloquer"}
                      >
                        {u.blocked ? <ShieldCheck size={16} /> : <Ban size={16} />}
                      </button>

                      <button
                        onClick={() => deleteUser(u.email)}
                        className="p-2 rounded-lg border border-zinc-700 text-zinc-500 bg-zinc-800 hover:border-red-500 hover:text-red-500 transition-all"
                        title="Supprimer définitivement"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-zinc-500 italic uppercase text-xs tracking-widest">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredUsers.length === 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-12 text-center text-zinc-500 italic uppercase text-xs tracking-widest">
                Aucun utilisateur trouvé
              </div>
            )}
            {filteredUsers.map((u) => (
              <div key={u.email} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-black italic truncate">{u.name || "N/A"}</p>
                    <p className="text-zinc-500 text-xs truncate">{u.email}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => toggleBlockUser(u.email)}
                      className={`p-2 rounded-xl border transition-all ${u.blocked ? 'border-green-500/30 text-green-500 bg-green-500/5 hover:bg-green-500/20' : 'border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500/20'
                        }`}
                    >
                      {u.blocked ? <ShieldCheck size={18} /> : <Ban size={18} />}
                    </button>
                    <button
                      onClick={() => deleteUser(u.email)}
                      className="p-2 rounded-xl border border-zinc-700 text-zinc-500 bg-zinc-800 hover:border-red-500 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Sub info Mobile */}
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest flex items-center gap-2">
                      <History size={12} /> Expiration
                    </span>
                    <input
                      type="date"
                      value={u.subscriptionEndDate || ''}
                      onChange={(e) => handleSetSpecificDate(u.email, e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] text-white focus:border-yellow-500 outline-none"
                    />
                  </div>

                  {subStatusMsg?.email === u.email && (
                    <p className={`text-[10px] font-bold text-center mb-3 ${subStatusMsg.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                      {subStatusMsg.text}
                    </p>
                  )}

                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => handleUpdateSubscription(u.email, 1)}
                      className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 py-2 rounded font-black text-[9px] border border-zinc-800 transition-colors"
                    >+1m</button>
                    <button
                      onClick={() => handleUpdateSubscription(u.email, 2)}
                      className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 py-2 rounded font-black text-[9px] border border-zinc-800 transition-colors"
                    >+2m</button>
                    <button
                      onClick={() => handleUpdateSubscription(u.email, 12)}
                      className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 py-2 rounded font-black text-[9px] border border-zinc-800 transition-colors"
                    >+1a</button>
                    <button
                      onClick={() => sendManualReminder(u.email)}
                      disabled={!u.subscriptionEndDate}
                      className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 py-2 rounded font-black text-[9px] border border-blue-500/20 transition-colors disabled:opacity-30 disabled:grayscale"
                    >
                      MAIL
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENU RÉSERVATIONS */}
      {activeTab === 'reservations' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input
                type="text"
                placeholder="Rechercher par email utilisateur..."
                value={resSearch}
                onChange={(e) => setResSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-5 pl-14 pr-6 text-white focus:outline-none focus:border-yellow-500 transition-all font-medium"
              />
            </div>
            <button
              onClick={() => setShowAddRes(!showAddRes)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all"
            >
              <PlusCircle size={20} />
              Ajout Manuel
            </button>
          </div>

          {showAddRes && (
            <div className="bg-zinc-900 border border-yellow-500/30 p-8 rounded-3xl animate-in slide-in-from-top">
              <h3 className="text-white font-black uppercase text-sm italic mb-6">Ajouter une réservation</h3>
              <form onSubmit={addManualReservation} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input
                  type="email"
                  required
                  placeholder="Email du membre..."
                  value={manualUserEmail}
                  onChange={(e) => setManualUserEmail(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl py-4 px-5 text-white focus:border-yellow-500 outline-none"
                />
                <select
                  required
                  value={manualClassId}
                  onChange={(e) => setManualClassId(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl py-4 px-5 text-white focus:border-yellow-500 outline-none"
                >
                  <option value="">Choisir un cours...</option>
                  {gymClasses.map(c => (
                    <option key={c.id} value={c.id}>{c.day} - {c.time} - {c.name}</option>
                  ))}
                </select>
                <button type="submit" className="bg-white text-black font-black uppercase text-[10px] py-4 rounded-xl hover:bg-yellow-500 transition-colors">
                  Valider Inscription
                </button>
              </form>
            </div>
          )}

          {/* Desktop Table */}
          <div className="hidden md:block bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-zinc-950 border-b border-zinc-800">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-500 tracking-widest">Cours</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-500 tracking-widest">Utilisateur</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-500 tracking-widest">Date Réservation</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-500 tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredReservations.map((r) => {
                  const gClass = gymClasses.find(c => c.id === r.classId);
                  return (
                    <tr key={r.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-8 py-6">
                        <p className="text-white font-black italic">{gClass?.name}</p>
                        <p className="text-yellow-500 text-[10px] uppercase font-bold tracking-widest">{gClass?.day} à {gClass?.time}</p>
                      </td>
                      <td className="px-8 py-6 text-zinc-400 text-sm">
                        {r.userEmail}
                      </td>
                      <td className="px-8 py-6 text-zinc-600 text-xs font-medium">
                        {new Date(r.timestamp).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => cancelReservation(r.id)}
                          className="p-2 rounded-lg border border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredReservations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-zinc-500 italic uppercase text-xs tracking-widest">
                      Aucune réservation trouvée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredReservations.length === 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-12 text-center text-zinc-500 italic uppercase text-xs tracking-widest">
                Aucune réservation trouvée
              </div>
            )}
            {filteredReservations.map((r) => {
              const gClass = gymClasses.find(c => c.id === r.classId);
              return (
                <div key={r.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-black italic truncate">{gClass?.name}</p>
                    <p className="text-yellow-500 text-[10px] uppercase font-bold tracking-widest">{gClass?.day} à {gClass?.time}</p>
                    <p className="text-zinc-400 text-xs mt-1 truncate">{r.userEmail}</p>
                    <p className="text-zinc-600 text-[10px] mt-1">{new Date(r.timestamp).toLocaleString('fr-FR')}</p>
                  </div>
                  <div className="shrink-0">
                    <button
                      onClick={() => cancelReservation(r.id)}
                      className="p-3 rounded-xl border border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTENU PLANNING */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-white font-black uppercase text-xl italic flex items-center gap-3">
              Planning Hebdomadaire
              <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
            </h2>
            <button
              onClick={() => setShowAddClass(!showAddClass)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 transition-all"
            >
              <PlusCircle size={20} />
              Ajouter un Cours
            </button>
          </div>

          {showAddClass && (
            <div className="bg-zinc-900 border border-yellow-500/30 p-8 rounded-3xl animate-in slide-in-from-top">
              <h3 className="text-white font-black uppercase text-sm italic mb-6">Nouveau Cours</h3>
              <form onSubmit={addClass} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Nom du cours</label>
                   <input
                    type="text"
                    required
                    placeholder="ex: Body Pump Ultra"
                    value={newClass.name}
                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:border-yellow-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Type</label>
                  <select
                    value={newClass.type}
                    onChange={(e) => setNewClass({ ...newClass, type: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:border-yellow-500 outline-none"
                  >
                    <option value="Pump">Pump</option>
                    <option value="HIT">HIT</option>
                    <option value="Bodycombat">Bodycombat</option>
                    <option value="Spinning">Spinning</option>
                    <option value="100% Femmes">100% Femmes</option>
                    <option value="Abdos">Abdos</option>
                    <option value="Cross Training">Cross Training</option>
                    <option value="TRX">TRX</option>
                    <option value="Body Balance">Body Balance</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Jour</label>
                  <select
                    value={newClass.day}
                    onChange={(e) => setNewClass({ ...newClass, day: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:border-yellow-500 outline-none"
                  >
                    <option value="Lundi">Lundi</option>
                    <option value="Mardi">Mardi</option>
                    <option value="Mercredi">Mercredi</option>
                    <option value="Jeudi">Jeudi</option>
                    <option value="Vendredi">Vendredi</option>
                    <option value="Samedi">Samedi</option>
                    <option value="Dimanche">Dimanche</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Heure</label>
                  <input
                    type="time"
                    required
                    value={newClass.time}
                    onChange={(e) => setNewClass({ ...newClass, time: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:border-yellow-500 outline-none"
                  />
                </div>
                <div className="space-y-2 lg:col-span-1">
                   <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Capacité</label>
                   <div className="flex gap-2">
                      <input
                        type="number"
                        required
                        value={newClass.capacity}
                        onChange={(e) => setNewClass({ ...newClass, capacity: Number(e.target.value) })}
                        className="flex-grow bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:border-yellow-500 outline-none"
                      />
                      <button type="submit" className="bg-white text-black font-black uppercase text-[10px] px-6 rounded-xl hover:bg-yellow-500 transition-colors">
                        OK
                      </button>
                   </div>
                </div>
              </form>
            </div>
          )}

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-950 border-b border-zinc-800">
                  <tr>
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Cours</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Type</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Horaire</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Capacité</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {gymClasses.sort((a,b) => {
                    const days = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
                    if (a.day !== b.day) return days.indexOf(a.day) - days.indexOf(b.day);
                    return a.time.localeCompare(b.time);
                  }).map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-8 py-6">
                        <p className="text-white font-black italic">{c.name}</p>
                      </td>
                      <td className="px-8 py-6">
                         <span className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-zinc-700">{c.type}</span>
                      </td>
                      <td className="px-8 py-6 text-yellow-500 font-bold text-xs">
                        {c.day} @ {c.time}
                      </td>
                      <td className="px-8 py-6 text-zinc-500 text-xs font-mono">
                        {c.capacity} pers.
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => deleteClass(c.id)}
                          className="p-2 rounded-lg border border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {gymClasses.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-zinc-500 italic uppercase text-xs tracking-widest">
                        Le planning est vide
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU CONTACTS */}
      {activeTab === 'contacts' && (
        <div className="space-y-6">
          {/* Desktop Table */}
          <div className="hidden md:block bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-zinc-950 border-b border-zinc-800">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Nom</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Email</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Sujet</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Message</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Date</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {contacts.filter(c => c.email && c.email.trim() !== '').map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="text-white font-black italic">{c.name}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-blue-400 text-sm underline">{c.email}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-yellow-500 font-bold text-[10px]">{c.subject}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-zinc-400 text-xs max-w-xs truncate">{c.message}</p>
                    </td>
                    <td className="px-8 py-6 text-zinc-500 text-xs">
                      {new Date(c.createdAt).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => deleteContact(c.id)}
                        className="p-2 rounded-lg border border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500/20 transition-all"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {contacts.filter(c => c.email).length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-zinc-500 italic uppercase text-xs tracking-widest">
                      Aucune demande de contact avec email valide
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {contacts.filter(c => c.email && c.email.trim() !== '').map((c) => (
              <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="min-w-0">
                    <p className="text-white font-black italic text-lg truncate">{c.name}</p>
                    <a href={`mailto:${c.email}`} className="text-blue-400 text-xs underline truncate block mt-1">{c.email}</a>
                  </div>
                  <button
                    onClick={() => deleteContact(c.id)}
                    className="flex-shrink-0 p-3 rounded-xl border border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500/20 transition-all"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800/50 mb-4">
                  <p className="text-yellow-500 font-black text-[10px] uppercase tracking-widest mb-2">{c.subject}</p>
                  <p className="text-zinc-400 text-sm leading-relaxed">{c.message}</p>
                </div>

                <div className="flex justify-between items-center text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
                  <span>Reçu le</span>
                  <span>{new Date(c.createdAt).toLocaleString('fr-FR')}</span>
                </div>
              </div>
            ))}
            
            {contacts.filter(c => c.email && c.email.trim() !== '').length === 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 text-center text-zinc-500 italic uppercase text-xs tracking-widest">
                Aucune demande de contact
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
