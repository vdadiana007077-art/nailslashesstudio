'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getPublicWidgetData } from '@/app/actions/support-widget';
import { Language, ActionType } from '@prisma/client';
import { X, ChevronRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { getSupportActionUrl } from '@/lib/widget-utils';



const GlowingAIStar = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="luxury-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#BF953F" />
        <stop offset="25%" stopColor="#FCF6BA" />
        <stop offset="50%" stopColor="#B38728" />
        <stop offset="75%" stopColor="#FBF5B7" />
        <stop offset="100%" stopColor="#AA771C" />
      </linearGradient>
    </defs>
    <path d="M12 1L14.5 9.5L23 12L14.5 14.5L12 23L9.5 14.5L1 12L9.5 9.5L12 1Z" fill="url(#luxury-gold)" />
    <circle cx="5" cy="5" r="1.5" fill="url(#luxury-gold)" className="animate-ping" style={{ animationDuration: '3s' }} />
    <circle cx="19" cy="19" r="1.5" fill="url(#luxury-gold)" className="animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
    <circle cx="4" cy="18" r="1" fill="url(#luxury-gold)" className="animate-ping" style={{ animationDuration: '3s', animationDelay: '2s' }} />
  </svg>
);

type Question = {
  id: string;
  question: string;
  answer: string;
  buttonText: string;
  actionType: ActionType;
  actionUrl: string | null;
};

type WidgetData = {
  title: string;
  avatar: string | null;
  avatarSize: number;
  pulseAnimation: boolean;
  sparkleAnimation: boolean;
  greeting: string;
  theme: string;
  whatsappNumber?: string | null;
  telegramUrl?: string | null;
  showTooltip?: boolean;
  questions: Question[];
};

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [data, setData] = useState<WidgetData | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const pathname = usePathname();
  const locale = (pathname?.split('/')[1]?.toUpperCase() as Language) || Language.TR;

  const _messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getPublicWidgetData(locale);
        if (res) {
          setData({
             ...res,
             sparkleAnimation: res.sparkleAnimation ?? true,
             showTooltip: res.showTooltip ?? true,
          } as WidgetData);
          
          const visited = localStorage.getItem('nl_support_visited');
          if (!visited) {
            setHasUnread(true);
          }
        }
      } catch (err) {
        console.error('Failed to load support widget data', err);
      }
    }
    loadData();
  }, [locale]);

  const handleOpen = () => {
    setIsOpen(true);
    if (hasUnread) {
      setHasUnread(false);
      localStorage.setItem('nl_support_visited', 'true');
    }
  };

  if (!data) return null;

  const renderActionUrl = (q: Question) => {
    return getSupportActionUrl(q.actionType, locale, q.actionUrl, data.whatsappNumber || '');
  };

  const desktopSize = data.avatarSize || 76;
  const mobileSize = Math.max(64, desktopSize - 12);

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex flex-col items-end transition-transform duration-500 ease-in-out ${!isOpen ? 'support-widget-container' : ''}`}>
      <style>{`
        .has-cookie-banner .support-widget-container {
          transform: translateY(-260px);
        }
        @media (min-width: 768px) {
          .has-cookie-banner .support-widget-container {
            transform: none;
          }
        }
      `}</style>
      
      {/* Widget Container */}
      {isOpen && (
        <div className="mb-4 sm:mb-6 w-[calc(100vw-32px)] sm:w-[400px] bg-white rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 origin-bottom-right border border-gray-100 max-h-[85vh] sm:max-h-[700px] shrink-0" style={{ height: 'auto', minHeight: '400px' }}>
          
          {/* Header */}
          <div 
            className="p-4 sm:p-5 flex items-center justify-between shadow-sm relative z-10 rounded-t-[24px]"
            style={{ background: 'linear-gradient(to right, #D8A7A7, #C68F8F)', color: '#fff' }}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center overflow-hidden shrink-0 border-2 border-white/50 shadow-inner" style={{ backgroundColor: '#C68F8F' }}>
                <GlowingAIStar className="w-3/5 h-3/5 animate-float-glow" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-[15px] sm:text-[16px] tracking-wide leading-tight text-white">{data.title}</h3>
                <span className="text-[11px] text-white/90 mt-0.5 opacity-90">{data.greeting.substring(0, 30)}{data.greeting.length > 30 ? '...' : ''}</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/10 rounded-full transition-colors text-white z-50 relative cursor-pointer flex items-center justify-center">
              <X size={24} className="text-white drop-shadow-md" />
            </button>
          </div>

          {/* Main Body - Accordion Style */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#FAFAFA] flex flex-col gap-5">
            
            {/* Bot Greeting */}
            <div className="flex justify-start items-start">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mr-3 shrink-0 border overflow-hidden shadow-sm"
                style={{ backgroundColor: '#C68F8F', borderColor: '#D8A7A7' }}
              >
                <GlowingAIStar className="w-3/5 h-3/5 animate-float-glow" />
              </div>
              <div className="max-w-[85%] rounded-2xl p-4 text-[13px] sm:text-[14px] leading-relaxed bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100">
                <p className="whitespace-pre-wrap">{data.greeting}</p>
              </div>
            </div>

            {/* Questions Accordion */}
            <div className="flex flex-col gap-3 pl-12 mt-1">
              {data.questions.map(q => (
                <div key={q.id} className="flex flex-col">
                  {/* Question Button */}
                  <button
                    onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                    className={`text-left border text-[13px] sm:text-[14px] font-medium py-3.5 px-4 rounded-xl transition-all duration-300 shadow-sm max-w-full ${expandedId === q.id ? 'text-white' : 'bg-white text-gray-700 hover:shadow-md'}`}
                    style={
                      expandedId === q.id
                        ? { backgroundColor: '#C68F8F', borderColor: '#C68F8F' }
                        : { borderColor: '#e5e7eb' }
                    }
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="leading-snug">{q.question}</span>
                      <ChevronDown 
                        size={18} 
                        className={`shrink-0 transition-transform duration-300 ${expandedId === q.id ? 'rotate-180 text-white' : 'text-gray-400'}`} 
                      />
                    </div>
                  </button>

                  {/* Answer Panel */}
                  {expandedId === q.id && (
                    <div className="mt-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100 text-[13px] sm:text-[14px] leading-relaxed text-gray-700 ml-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="whitespace-pre-wrap">{q.answer}</p>
                      
                      {q.actionType !== 'NONE' && q.buttonText && (
                        <div className="mt-4 pt-3 border-t border-gray-50">
                          <Link 
                            href={renderActionUrl(q)}
                            target={['WHATSAPP_LINK', 'PHONE_CALL'].includes(q.actionType) ? '_blank' : '_self'}
                            className="inline-flex items-center justify-center w-full gap-2 px-4 py-3 rounded-xl text-[13px] font-bold transition-colors shadow-sm text-white"
                            style={{ backgroundColor: '#C68F8F' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#B67C7C';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#C68F8F';
                            }}
                          >
                            {q.buttonText}
                            <ChevronRight size={16} />
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white border-t border-gray-100 p-3">
            <div className="text-center text-[10px] text-gray-400 font-medium tracking-wide">
              ⚡ Powered by N&L Studio AI
            </div>
          </div>
        </div>
      )}

      {/* Premium Glassmorphism Card Button */}
      {!isOpen && (
        <div className="flex flex-col gap-3 items-end">
          
          {/* External Contact Apps (WhatsApp & Telegram) */}
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <a
              href={data.telegramUrl || "https://t.me/nailslashesstudio"} 
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 sm:w-14 sm:h-14 bg-[#2CA5E0] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
              aria-label="Telegram ile İletişime Geç"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.888-.662 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            </a>
            
            <a
              href={`https://wa.me/${data.whatsappNumber?.replace(/[^0-9]/g, '') || '905061155243'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
              aria-label="WhatsApp ile İletişime Geç"
            >
              <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            </a>
          </div>

          <div className="relative group cursor-pointer flex items-center justify-end" onClick={handleOpen}>
            
            {/* First Visit Tooltip */}
            {hasUnread && data.showTooltip && (
              <div className="absolute -top-12 sm:-top-14 right-2 px-4 py-2 sm:py-2.5 bg-[#C68F8F] text-white text-[12px] sm:text-[13px] font-medium rounded-2xl shadow-xl whitespace-nowrap opacity-100 animate-in fade-in slide-in-from-bottom-4 duration-500 before:content-[''] before:absolute before:bottom-[-6px] before:right-6 before:border-l-8 before:border-l-transparent before:border-r-8 before:border-r-transparent before:border-t-8 before:border-t-[#C68F8F]">
                Size nasıl yardımcı olabilirim?
              </div>
            )}
          
          <style>{`
            @keyframes float-glow {
              0%, 100% { transform: scale(1) translateY(0); filter: drop-shadow(0 0 6px rgba(252,246,186,0.4)); }
              50% { transform: scale(1.08) translateY(-1px); filter: drop-shadow(0 0 14px rgba(252,246,186,0.9)); }
            }
            .animate-float-glow {
              animation: float-glow 3s ease-in-out infinite;
            }
          `}</style>

          <div 
            className={`relative rounded-full sm:rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/60 bg-white/95 backdrop-blur-xl flex items-center p-1.5 sm:pr-5 gap-0 sm:gap-3 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.02] hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] active:scale-95`}
          >
            {/* Avatar Container with inline dynamic sizing */}
            <div className="relative flex-shrink-0" style={{ width: `var(--widget-size, ${desktopSize}px)`, height: `var(--widget-size, ${desktopSize}px)` }}>
              <style jsx>{`
                @media (max-width: 640px) {
                  .relative {
                    --widget-size: ${mobileSize}px !important;
                  }
                }
              `}</style>

              {/* Pulse Rings */}
              {data.pulseAnimation && (
                <>
                  <div className="absolute -inset-2 rounded-full bg-[#C68F8F] opacity-[0.15] animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                  <div className="absolute -inset-1 rounded-full bg-[#C68F8F] opacity-[0.25] animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] [animation-delay:0.5s]"></div>
                </>
              )}

              {/* Main Avatar */}
              <div 
                className="w-full h-full rounded-full border-[3px] overflow-hidden relative z-10 flex items-center justify-center shadow-md"
                style={{ backgroundColor: '#C68F8F', borderColor: '#D8A7A7' }}
              >
                <GlowingAIStar className="w-1/2 h-1/2 animate-float-glow" />
              </div>

              {/* Sparkles */}
              {data.sparkleAnimation && (
                <>
                  <div className="absolute -top-1 -right-1 z-20 origin-center animate-[bounce_2s_infinite] drop-shadow-md" style={{ animationDelay: '0s' }}>
                    <svg viewBox="0 0 24 24" className="w-4 h-4 animate-[spin_4s_linear_infinite]" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 1L14.5 9.5L23 12L14.5 14.5L12 23L9.5 14.5L1 12L9.5 9.5L12 1Z" fill="url(#luxury-gold)" />
                    </svg>
                  </div>
                  <div className="absolute bottom-0 -left-1 z-20 origin-center animate-[bounce_2s_infinite] drop-shadow-md" style={{ animationDelay: '1s' }}>
                    <svg viewBox="0 0 24 24" className="w-3 h-3 animate-[spin_5s_linear_infinite_reverse]" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 1L14.5 9.5L23 12L14.5 14.5L12 23L9.5 14.5L1 12L9.5 9.5L12 1Z" fill="url(#luxury-gold)" />
                    </svg>
                  </div>
                </>
              )}
            </div>

            {/* Text Content */}
            <div className="hidden sm:flex flex-col justify-center max-w-[140px] sm:max-w-[160px]">
              <span className="font-bold text-[13px] sm:text-[14px] text-gray-800 leading-tight tracking-wide">{data.title}</span>
              <span className="text-[11px] sm:text-[12px] text-gray-500 truncate leading-snug mt-0.5">{data.greeting}</span>
            </div>

            {/* Chevron icon at the right to indicate clickability */}
            <div className="hidden sm:flex w-6 h-6 rounded-full bg-[#FDF8F8] text-[#C68F8F] items-center justify-center ml-1 flex-shrink-0">
              <ChevronRight size={14} className="ml-0.5" />
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
