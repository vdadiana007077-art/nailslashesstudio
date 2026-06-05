'use client';

import { useState } from 'react';
import { createLead } from '@/app/actions/lead';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

type Props = {
  locale: string;
};

export default function ContactForm({ locale }: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);
    formData.append('source', 'İletişim Sayfası');

    try {
      const res = await createLead(formData);
      if (res.success) {
        setStatus({
          type: 'success',
          message: locale === 'tr' 
            ? 'Mesajınız başarıyla iletildi! En kısa sürede size geri dönüş yapacağız.' 
            : 'Your message has been sent successfully! We will get back to you shortly.'
        });
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus({
          type: 'error',
          message: res.error || (locale === 'tr' ? 'Bir hata oluştu, lütfen tekrar deneyin.' : 'An error occurred, please try again.')
        });
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: locale === 'tr' ? 'Bağlantı hatası oluştu.' : 'Connection error occurred.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status && (
        <div 
          className={`p-4 rounded-2xl flex items-start gap-3 border animate-fade-up ${
            status.type === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
              : 'bg-rose-50 border-rose-100 text-rose-800'
          }`}
        >
          {status.type === 'success' ? <CheckCircle2 className="shrink-0 mt-0.5" size={18} /> : <AlertCircle className="shrink-0 mt-0.5" size={18} />}
          <p className="text-xs md:text-sm font-medium leading-relaxed">{status.message}</p>
        </div>
      )}

      {/* Name Input */}
      <div>
        <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
          {locale === 'tr' ? 'Adınız Soyadınız' : 'Full Name'} <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          placeholder={locale === 'tr' ? 'Örn: Selin Yılmaz' : 'e.g. John Doe'}
          className="w-full px-5 py-3.5 bg-white border border-[var(--color-primary-300)]/30 rounded-2xl text-sm text-[var(--color-text-main)] placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)]/30 transition-all"
        />
      </div>

      {/* Email and Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
            {locale === 'tr' ? 'E-Posta Adresiniz' : 'Email Address'}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="name@example.com"
            className="w-full px-5 py-3.5 bg-white border border-[var(--color-primary-300)]/30 rounded-2xl text-sm text-[var(--color-text-main)] placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)]/30 transition-all"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
            {locale === 'tr' ? 'Telefon Numaranız' : 'Phone Number'}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="+90 555 123 4567"
            className="w-full px-5 py-3.5 bg-white border border-[var(--color-primary-300)]/30 rounded-2xl text-sm text-[var(--color-text-main)] placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)]/30 transition-all"
          />
        </div>
      </div>

      {/* Message Textarea */}
      <div>
        <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
          {locale === 'tr' ? 'Mesajınız' : 'Your Message'}
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder={locale === 'tr' ? 'Sorularınızı veya taleplerinizi yazabilirsiniz...' : 'Write your questions or details here...'}
          className="w-full px-5 py-3.5 bg-white border border-[var(--color-primary-300)]/30 rounded-2xl text-sm text-[var(--color-text-main)] placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)]/30 transition-all resize-none"
        ></textarea>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-gray-950 hover:bg-black disabled:bg-gray-400 text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            {locale === 'tr' ? 'GÖNDERİLİYOR...' : 'SENDING...'}
          </>
        ) : (
          <>
            <Send size={16} />
            {locale === 'tr' ? 'MESAJI GÖNDER' : 'SEND MESSAGE'}
          </>
        )}
      </button>
    </form>
  );
}
