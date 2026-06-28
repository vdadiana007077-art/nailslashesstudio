"use server";

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { decryptSession } from '@/lib/auth-helpers';

export async function getStaffCashData() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('customer_token');
    if (!token) return { success: false, error: 'Oturum bulunamadı!' };

    const session = decryptSession(token.value);
    if (!session || !session.userId) return { success: false, error: 'Oturum bulunamadı!' };

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { staff: true }
    });

    if (!user || user.role !== 'STAFF' || !user.staff) {
      return { success: false, error: 'Bu alana sadece personeller erişebilir.' };
    }

    const staffId = user.staff.id;

    const staffTransactionsRaw = await prisma.staffTransaction.findMany({
      where: { staffId },
      orderBy: { createdAt: 'desc' }
    });

    // Appointment'ları manuel çekelim
    const appointmentIds = staffTransactionsRaw
      .map(tx => tx.appointmentId)
      .filter((id): id is string => id !== null);

    const appointments = await prisma.appointment.findMany({
      where: { id: { in: appointmentIds } },
      include: {
        service: {
          include: { translations: { where: { language: 'TR' } } }
        }
      }
    });

    const appointmentMap = new Map();
    appointments.forEach(appt => {
      appointmentMap.set(appt.id, appt);
    });

    const currentBalance = staffTransactionsRaw.length > 0 ? Number(staffTransactionsRaw[0].balanceAfter) : 0;

    const staffTransactions = staffTransactionsRaw.map(tx => {
      const appt = tx.appointmentId ? appointmentMap.get(tx.appointmentId) : null;
      return {
        id: tx.id,
        type: tx.type,
        amount: tx.amount.toString(),
        balanceAfter: tx.balanceAfter.toString(),
        paymentMethod: tx.paymentMethod,
        date: tx.date.toISOString(),
        description: tx.description,
        customerName: appt?.customerName || '-',
        serviceName: appt?.service?.translations[0]?.name || '-',
        reservationNumber: appt?.reservationNumber || '-',
      };
    });

    return {
      success: true,
      data: {
        transactions: staffTransactions,
        currentBalance
      }
    };
  } catch (error) {
    console.error('Staff Cash Error:', error);
    return { success: false, error: 'Veriler çekilirken bir hata oluştu.' };
  }
}
