"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight, Sparkles } from "lucide-react";

interface Translation {
  name: string;
  description: string | null;
  slug?: string | null;
}

interface Service {
  id: string;
  duration: number;
  price: any;
  translations: Translation[];
}

interface Category {
  id: string;
  translations: Translation[];
  services: Service[];
}

interface ServiceExplorerProps {
  categories: Category[];
  locale: string;
}

export default function ServiceExplorer({ categories, locale }: ServiceExplorerProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    categories[0]?.id || ""
  );

  const activeCategory = categories.find((c) => c.id === activeCategoryId);
  const activeCategoryName = activeCategory?.translations[0]?.name || "";
  const activeCategoryDesc = activeCategory?.translations[0]?.description || "";

  return (
    <div className="w-full flex flex-col gap-12">
      {/* 🧭 Category Navigation Tabs */}
      <div className="flex overflow-x-auto pb-4 scrollbar-none gap-3 -mx-6 px-6 md:mx-0 md:px-0 justify-start md:justify-center">
        {categories.map((category) => {
          const categoryName = category.translations[0]?.name || "Kategori";
          const isActive = category.id === activeCategoryId;

          return (
            <button
              key={category.id}
              onClick={() => setActiveCategoryId(category.id)}
              className={`whitespace-nowrap px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide uppercase transition-all duration-300 cursor-pointer ${
                isActive
                  ? "bg-[var(--color-primary-500)] text-white shadow-[0_6px_20px_rgba(197,139,139,0.25)] hover:shadow-[0_8px_25px_rgba(197,139,139,0.4)]"
                  : "bg-white/75 text-[var(--color-text-main)] border border-[var(--color-primary-300)]/20 hover:bg-white hover:border-[var(--color-primary-400)]"
              }`}
            >
              {categoryName}
            </button>
          );
        })}
      </div>

      {/* 🌟 Category Showcase & Services */}
      {activeCategory && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start animate-fade-up">
          {/* Category Description Info */}
          <div className="lg:col-span-1 lg:sticky lg:top-32 flex flex-col gap-6">
            <div className="inline-flex self-start items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-primary-400)]/20 bg-[var(--color-primary-300)]/30 text-xs font-bold text-[var(--color-primary-600)] uppercase tracking-widest">
              <Sparkles size={12} /> Seçkin Bakım
            </div>
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-text-main)] italic tracking-tight">
              {activeCategoryName}
            </h3>
            <p className="text-[var(--color-text-muted)] font-light leading-relaxed text-base">
              {activeCategoryDesc.replace(/<[^>]*>?/gm, "") ||
                `${activeCategoryName} alanında profesyonel uygulamalarımız ve uzman ekibimizle kendinizi şımartın.`}
            </p>
            {activeCategory.translations[0]?.slug && (
              <Link
                href={`/${locale}/services/${activeCategory.translations[0].slug}`}
                className="inline-flex items-center gap-2 text-[var(--color-primary-600)] font-bold text-sm hover:text-[var(--color-text-main)] transition-colors group tracking-wide mt-2"
              >
                Tüm Detayları Gör{" "}
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1.5 transition-transform duration-300"
                />
              </Link>
            )}
          </div>

          {/* Services Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            {activeCategory.services.length === 0 ? (
              <div className="col-span-2 text-center text-[var(--color-text-muted)] py-16 bg-white/40 border border-[var(--color-primary-300)]/25 rounded-3xl">
                Bu kategoride henüz hizmet bulunmuyor.
              </div>
            ) : (
              activeCategory.services.map((service) => {
                const serviceName = service.translations[0]?.name || "İsimsiz Hizmet";
                const serviceDesc = service.translations[0]?.description || "";

                return (
                  <div
                    key={service.id}
                    className="group relative flex flex-col justify-between bg-white/75 border border-[var(--color-primary-300)]/20 hover:border-[var(--color-primary-400)] p-8 rounded-[2rem] transition-all duration-500 hover:-translate-y-1 shadow-[0_8px_30px_rgba(197,139,139,0.03)] hover:shadow-[0_20px_45px_rgba(197,139,139,0.08)] bg-gradient-to-b from-white/95 to-white/60"
                  >
                    <div>
                      <h4 className="text-xl font-bold text-[var(--color-text-main)] group-hover:text-[var(--color-primary-600)] transition-colors duration-300 tracking-tight leading-snug">
                        {serviceName}
                      </h4>
                      <p className="text-[var(--color-text-muted)] text-sm font-light mt-3 leading-relaxed line-clamp-3">
                        {serviceDesc.replace(/<[^>]*>?/gm, "")}
                      </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-[var(--color-primary-300)]/15 flex flex-col gap-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] text-xs font-semibold">
                          <Clock size={14} className="text-[var(--color-primary-500)]" />
                          <span>{service.duration} Dk</span>
                        </div>
                        <span className="font-serif font-bold text-2xl text-[var(--color-primary-600)] tracking-tight">
                          {Number(service.price)}₺
                        </span>
                      </div>

                      <Link
                        href={`/${locale}/booking?serviceId=${service.id}`}
                        className="w-full py-3.5 bg-[var(--color-primary-300)]/30 hover:bg-[var(--color-primary-500)] text-[var(--color-primary-600)] hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 text-center cursor-pointer shadow-sm hover:shadow-md"
                      >
                        Randevu Al
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
