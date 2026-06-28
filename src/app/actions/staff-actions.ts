"use server";

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { decryptSession } from '@/lib/auth-helpers';
import { ApptStatus, PaymentMethod, TransType } from '@prisma/client';
import { logAction } from './audit';

/**
 * Mevcut giriş yapmış personeli döner
 */
async function getCurrentStaff() {
  const cookieStore = await cookies();
  const token = cookieStore.get('customer_token');
  if (!token) return null;

  const session = decryptSession(token.value);
  if (!session || !session.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { staff: true }
  });

  if (!user || user.role !== 'STAFF' || !user.staff) return null;

  return user.staff;
}

export async function updateAppointmentStatusByStaff(
  appointmentId: string, 
  status: ApptStatus,
  finalPrice?: number,
  paymentMethod?: PaymentMethod
) {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return { success: false, error: 'Yetkisiz işlem. Lütfen tekrar giriş yapın.' };
    }

    // Randevuyu bul ve personele ait mi diye kontrol et
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      return { success: false, error: 'Randevu bulunamadı.' };
    }

    if (appointment.staffId !== staff.id) {
      return { success: false, error: 'Sadece kendi randevularınızda işlem yapabilirsiniz.' };
    }

    // Eğer randevu zaten tamamlandıysa ve tekrar tamamlandı atılmaya çalışılıyorsa engelle
    if (appointment.status === 'COMPLETED' && status === 'COMPLETED') {
        return { success: false, error: 'Bu randevu zaten tamamlanmış ve tahsilatı alınmış.' };
    }

    // Güncelleme Verisi
    const updateData: any = {
      status: status
    };

    // Eğer işlem Tamamlandı ise ve tahsilat alınıyorsa
    if (status === 'COMPLETED') {
      if (finalPrice !== undefined && finalPrice >= 0) {
        updateData.priceAtBooking = finalPrice.toString();
      }
    }

    // Transaction bloğuyla hem randevuyu güncelle hem kasa kaydı gir
    const updatedAppointment = await prisma.$transaction(async (tx) => {
      
      // 1. Randevuyu Güncelle
      const appt = await tx.appointment.update({
        where: { id: appointmentId },
        data: updateData
      });

      // 2. Randevu Geçmişine Log At
      await tx.appointmentStatusHistory.create({
        data: {
          appointmentId: appt.id,
          status: status,
          notes: status === 'COMPLETED' ? `Personel tarafından ödeme alındı (${finalPrice} TL)` : `Personel durumu değiştirdi: ${status}`
        }
      });

      // 3. Eğer işlem COMPLETED ise Muhasebeye (Transaction) işle
      if (status === 'COMPLETED' && paymentMethod && finalPrice !== undefined) {
        
        // Önce varsayılan veya uygun bir Kategori bul/oluştur (örn: "Hizmet Gelirleri")
        let category = await tx.transactionCategory.findFirst({
          where: { type: TransType.INCOME, name: 'Hizmet Gelirleri' }
        });

        if (!category) {
          category = await tx.transactionCategory.create({
            data: { name: 'Hizmet Gelirleri', type: TransType.INCOME, isActive: true }
          });
        }

        // Ödeme Yöntemi Türkçeleştirme
        let paymentStr = 'Nakit';
        if (paymentMethod === 'CARD') paymentStr = 'Kredi Kartı';
        else if (paymentMethod === 'TRANSFER') paymentStr = 'Havale';
        else if (paymentMethod === 'ONLINE') paymentStr = 'Online';

        const desc = appt.reservationNumber 
          ? `Rezervasyon ${appt.reservationNumber} ödemesi - ${paymentStr}`
          : `Rezervasyon ödemesi - ${paymentStr}`;

        // Şirket Kasa hareketi (Transaction)
        await tx.transaction.create({
          data: {
            categoryId: category.id,
            type: TransType.INCOME,
            amount: finalPrice.toString(),
            paymentMethod: paymentMethod,
            date: new Date(),
            description: desc,
            appointmentId: appt.id,
            staffId: staff.id,
            locationId: appt.locationId
          }
        });

        // Personel Kasa Hareketi (StaffTransaction)
        const lastStaffTx = await tx.staffTransaction.findFirst({
          where: { staffId: staff.id },
          orderBy: { createdAt: 'desc' }
        });
        
        const prevBalance = lastStaffTx ? Number(lastStaffTx.balanceAfter) : 0;
        const newBalance = prevBalance + finalPrice;

        await tx.staffTransaction.create({
          data: {
            staffId: staff.id,
            type: 'COLLECTION',
            amount: finalPrice.toString(),
            balanceAfter: newBalance.toString(),
            paymentMethod: paymentMethod,
            date: new Date(),
            appointmentId: appt.id,
            description: desc,
          }
        });
      }

      return appt;
    });

    await logAction('Personel Randevu Güncelledi', `Randevu: ${appointmentId}, Yeni Durum: ${status}, Alınan Para: ${finalPrice || 0}`);

    // Next.js Client Component serialization sorunu için Decimal vb objeleri sadeleştirelim
    const safeData = JSON.parse(JSON.stringify(updatedAppointment));

    return { success: true, data: safeData };
  } catch (error: any) {
    console.error('Staff Action Error:', error);
    return { success: false, error: 'İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.' };
  }
}
