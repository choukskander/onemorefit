
import React, { useState } from 'react';
import { useApp } from '../App';
import { GYM_SCHEDULE } from '../constants';
import { Users, BookOpen, Ban, Trash2, ShieldCheck, Search, PlusCircle, CheckCircle, Clock } from 'lucide-react';
import { Reservation, User } from '../types';

const AdminDashboard: React.FC = () => {
  const { 
    user, registeredUsers, setRegisteredUsers, 
    reservations, setReservations, 
    waitlist, setWaitlist 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'reservations'>('users');
  const [userSearch, setUserSearch] = useState('');
  const [resSearch, setResSearch] = useState('');
  
  // States pour ajout manuel de réservation
  const [showAddRes, setShowAddRes] = useState(false);
  const [manualUserEmail, setManualUserEmail] = useState('');
  const [manualClassId, setManualClassId] = useState('');

  // --- VÉRIFICATION DE SÉCURITÉ ---
  // On utilise le contexte global puisque la page de connexion vérifie maintenant les mots de passe de façon sécurisée
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
    { label: "En attente", value: waitlist.length, icon: <Clock size={20} />, color: "text-purple-500" },
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
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
            activeTab === 'users' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
          }`}
        >
          Gestion Membres
        </button>
        <button 
          onClick={() => setActiveTab('reservations')}
          className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
            activeTab === 'reservations' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
          }`}
        >
          Gestion Réservations
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

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-zinc-950 border-b border-zinc-800">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-500 tracking-widest">Utilisateur</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-500 tracking-widest">Statut</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-zinc-500 tracking-widest text-right">Actions</th>
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
                      {u.blocked ? (
                        <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-red-500/20">Bloqué</span>
                      ) : (
                        <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-green-500/20">Actif</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right space-x-3">
                      <button 
                        onClick={() => toggleBlockUser(u.email)}
                        className={`p-2 rounded-lg border transition-all ${
                          u.blocked ? 'border-green-500/30 text-green-500 bg-green-500/5 hover:bg-green-500/20' : 'border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500/20'
                        }`}
                        title={u.blocked ? "Débloquer" : "Bloquer"}
                      >
                        {u.blocked ? <ShieldCheck size={18} /> : <Ban size={18} />}
                      </button>
                      <button 
                        onClick={() => deleteUser(u.email)}
                        className="p-2 rounded-lg border border-zinc-700 text-zinc-500 bg-zinc-800 hover:border-red-500 hover:text-red-500 transition-all"
                        title="Supprimer définitivement"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-8 py-20 text-center text-zinc-500 italic uppercase text-xs tracking-widest">
                        Aucun utilisateur trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
                        {GYM_SCHEDULE.map(c => (
                            <option key={c.id} value={c.id}>{c.day} - {c.time} - {c.name}</option>
                        ))}
                    </select>
                    <button type="submit" className="bg-white text-black font-black uppercase text-[10px] py-4 rounded-xl hover:bg-yellow-500 transition-colors">
                        Valider Inscription
                    </button>
                </form>
            </div>
          )}

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
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
                  const gClass = GYM_SCHEDULE.find(c => c.id === r.classId);
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
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
