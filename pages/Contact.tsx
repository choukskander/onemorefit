
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';

const Contact: React.FC = () => {
  const { t, refreshContacts } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Demande d\'adhésion',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({
    type: null,
    message: ''
  });

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    // Validation côté client
    if (!formData.name.trim()) {
      setSubmitStatus({ type: 'error', message: 'Le nom complet est requis' });
      setIsSubmitting(false);
      return;
    }

    if (!formData.email.trim()) {
      setSubmitStatus({ type: 'error', message: 'L\'email est requis' });
      setIsSubmitting(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setSubmitStatus({ type: 'error', message: 'Veuillez entrer un email valide' });
      setIsSubmitting(false);
      return;
    }

    if (!formData.message.trim()) {
      setSubmitStatus({ type: 'error', message: 'Le message est requis' });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'Votre message a été envoyé avec succès !' });
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: 'Demande d\'adhésion',
          message: ''
        });
        // Refresh contacts in context
        await refreshContacts();
      } else {
        setSubmitStatus({ type: 'error', message: data.error || 'Erreur lors de l\'envoi du message' });
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Erreur de connexion. Veuillez réessayer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Nom Complet</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-yellow-500 transition-colors" 
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-yellow-500 transition-colors" 
                    placeholder="votre.email@exemple.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Sujet</label>
                <select 
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-yellow-500 transition-colors appearance-none"
                >
                  <option value="Demande d'adhésion">Demande d'adhésion</option>
                  <option value="Offre Entreprise">Offre Entreprise</option>
                  <option value="Coaching Personnel">Coaching Personnel</option>
                  <option value="Support Général">Support Général</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Message</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4} 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-yellow-500 transition-colors resize-none" 
                  placeholder="Votre message..."
                ></textarea>
              </div>

              {/* Message de Statut */}
              {submitStatus.type && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${submitStatus.type === 'success' ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                  {submitStatus.type === 'success' ? (
                    <CheckCircle className={submitStatus.type === 'success' ? 'text-green-500' : 'text-red-500'} size={20} />
                  ) : (
                    <AlertCircle className="text-red-500" size={20} />
                  )}
                  <p className={`text-sm font-bold ${submitStatus.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                    {submitStatus.message}
                  </p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black font-black py-4 rounded-xl uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-yellow-500/10"
              >
                <Send size={18} />
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
              </button>
            </form>
          </div>

          {/* Info & Map */}
          <div className="space-y-12">
            <div className="grid grid-cols-1 gap-8">
              {[
                { icon: <MapPin className="text-yellow-500" />, title: "Adresse", content: "One more fitness, MH5Q+J4M, Béni Khalled" },
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
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3230.123456789!2d10.5833!3d36.6833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1302b5c8b8b8b8b8b:0x1234567890abcdef!2sOne%20more%20fitness%2C%20MH5Q%2BJ4M%2C%20B%C3%A9ni%20Khalled!5e0!3m2!1sen!2stn!4v1234567890!5m2!1sen!2stn"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(1) invert(0.9)' }}
                allowFullScreen={true}
                loading="lazy"
              ></iframe>
              <a
                href="https://www.google.com/maps/search/?api=1&query=MH5Q%2BJ4M%20B%C3%A9ni%20Khalled%20Tunisia"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg transition-colors shadow-lg"
              >
                Ouvrir dans Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
