import { getStaffCashData } from '@/app/actions/staff-cash';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Clock, CreditCard, Banknote } from 'lucide-react';
import Link from 'next/link';

export default async function StaffCashPage() {
  const result = await getStaffCashData();

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 font-medium">{result.error || 'Veri bulunamadı.'}</p>
        <Link href="/tr/staff" className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold">Geri Dön</Link>
      </div>
    );
  }

  const { transactions, currentBalance } = result.data;

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'CARD': return <CreditCard size={14} />;
      case 'CASH': return <Banknote size={14} />;
      default: return <Wallet size={14} />;
    }
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'CARD': return 'Kredi Kartı';
      case 'CASH': return 'Nakit';
      case 'TRANSFER': return 'Havale/EFT';
      default: return method;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* HEADER */}
      <div className="bg-white px-4 py-4 sticky top-0 z-20 shadow-sm flex items-center justify-between border-b border-gray-100">
        <Link href="/tr/staff" className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="text-center">
          <h1 className="text-sm font-black text-gray-900 tracking-tight">Kasam</h1>
          <p className="text-[10px] text-gray-400 font-medium">İşlem ve Tahsilat Geçmişi</p>
        </div>
        <div className="w-10 h-10"></div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6 mt-2">
        {/* Bakiye Özeti */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
              <Wallet size={24} className="text-white" />
            </div>
            <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider mb-1">Mevcut Kasa Bakiyesi</p>
            <p className="text-4xl font-black tracking-tight">₺{currentBalance.toLocaleString('tr-TR')}</p>
          </div>
        </div>

        {/* İşlem Listesi */}
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Kasa Hareketleri</h2>
          
          {transactions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock size={20} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-500 font-medium">Henüz hiçbir kasa hareketi bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx: any) => {
                const isIncome = tx.type === 'COLLECTION' || Number(tx.amount) > 0; // Collection her zaman gelir
                return (
                  <div key={tx.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm relative overflow-hidden group">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                    
                    <div className="flex justify-between items-start mb-2 pl-2">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{tx.customerName}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{tx.serviceName}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-base font-black ${isIncome ? 'text-emerald-600' : 'text-rose-600'} flex items-center justify-end gap-1`}>
                          {isIncome ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {isIncome ? '+' : '-'}₺{Number(tx.amount).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 pl-2">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase bg-gray-50 px-2 py-1 rounded-lg w-max">
                          {getPaymentIcon(tx.paymentMethod)} {getPaymentLabel(tx.paymentMethod)}
                        </span>
                        {tx.reservationNumber !== '-' && (
                          <span className="text-[10px] font-semibold text-[var(--color-rose-600)]">#{tx.reservationNumber}</span>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p className="text-[9px] text-gray-400 uppercase font-bold mb-0.5">İşlem Sonrası Bakiye</p>
                        <p className="text-xs font-bold text-gray-700">₺{Number(tx.balanceAfter).toLocaleString('tr-TR')}</p>
                      </div>
                    </div>
                    
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
