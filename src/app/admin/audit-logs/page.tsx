import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import { Activity, Mail, User, ShieldAlert, Calendar } from 'lucide-react';

export default async function AuditLogsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
  }

  // Son 100 log kaydını çekelim
  let logs: Array<{ id: string; userEmail: string | null; action: string; details: string | null; createdAt: Date }> = [];
  try {
    logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  } catch (error) {
    console.error("Audit logs veri çekme hatası:", error);
  }

  return (
    <AdminShell title="İşlem Günlükleri (Audit Log)">
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-800">Son Yapılan Eylemler</h3>
                <p className="text-xs text-gray-500 mt-1">Yöneticiler tarafından yapılan en son 100 kritik veritabanı/sistem güncellemesi.</p>
              </div>
            </div>

            {logs.length === 0 ? (
              <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center">
                <ShieldAlert className="text-gray-300 mb-4" size={48} />
                <h4 className="font-bold text-gray-700 mb-1">Kayıt Bulunmamaktadır</h4>
                <p className="text-sm">Henüz kaydedilmiş kritik yönetici işlemi bulunmuyor.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                      <th className="p-4 pl-6">Yönetici</th>
                      <th className="p-4">İşlem / Eylem</th>
                      <th className="p-4">Detaylar</th>
                      <th className="p-4 pr-6">Tarih & Saat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors text-sm">
                        <td className="p-4 pl-6 font-medium text-gray-800">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[var(--color-rose-50)] text-[var(--color-rose-700)] flex items-center justify-center font-bold text-xs">
                              {log.userEmail ? log.userEmail[0].toUpperCase() : 'A'}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-800 text-xs leading-none mb-1">Yönetici</span>
                              <span className="text-[10px] text-gray-400 font-mono leading-none">{log.userEmail || 'admin@nailslashesstudio.com'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-[var(--color-rose-700)] text-xs">
                          <span className="px-3 py-1.5 bg-rose-50/50 rounded-xl border border-rose-100/40">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4 max-w-md">
                          {log.details ? (
                            <div className="bg-gray-50 border border-gray-100 p-3 rounded-2xl text-xs font-mono text-gray-600 max-h-24 overflow-y-auto whitespace-pre-wrap">
                              {log.details}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-xs">Açıklama belirtilmemiş</span>
                          )}
                        </td>
                        <td className="p-4 pr-6">
                          <div className="flex flex-col text-xs text-gray-500">
                            <span className="font-medium text-gray-700 flex items-center gap-1">
                              <Calendar size={12} className="text-gray-400" />
                              {log.createdAt.toLocaleDateString('tr-TR')}
                            </span>
                            <span className="text-[10px] text-gray-400 mt-1 pl-4">
                              {log.createdAt.toLocaleTimeString('tr-TR')}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
    </AdminShell>
  );
}
