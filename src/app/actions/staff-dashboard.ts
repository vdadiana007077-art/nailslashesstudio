"use server";

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { decryptSession } from '@/lib/auth-helpers';

export async function getStaffDashboardData(locale: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('customer_token');
    if (!token) return { success: false, error: 'Oturum bulunamadı!' };

    const session = decryptSession(token.value);
    if (!session || !session.userId) return { success: false, error: 'Oturum bulunamadı!' };

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        staff: true
      }
    });

    if (!user || user.role !== 'STAFF' || !user.staff) {
      return { success: false, error: 'Bu alana sadece personeller erişebilir.' };
    }

    const staffId = user.staff.id;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Bugünkü Randevular
    const todayAppointmentsRaw = await prisma.appointment.findMany({
      where: {
        staffId: staffId,
        date: {
          gte: todayStart,
          lte: todayEnd
        }
        // Tüm statüleri çekelim ki 'Tümü', 'İptal', vb. sekmelerinde görebilsin
      },
      include: {
        service: {
          include: {
            translations: {
              where: { language: 'TR' }
            }
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    const todayAppointments = todayAppointmentsRaw.map(appt => ({
      id: appt.id,
      customerName: appt.customerName,
      serviceName: appt.service.translations[0]?.name || 'Hizmet',
      startTime: appt.startTime,
      endTime: appt.endTime,
      status: appt.status,
      price: parseFloat(appt.priceAtBooking.toString()),
    }));

    // Yaklaşan Randevular (Yarından itibaren)
    const upcomingAppointmentsRaw = await prisma.appointment.findMany({
      where: {
        staffId: staffId,
        date: { gt: todayEnd },
        status: { in: ['PENDING', 'CONFIRMED'] }
      },
      include: {
        service: {
          include: {
            translations: {
              where: { language: 'TR' }
            }
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ],
      take: 10
    });

    const upcomingAppointments = upcomingAppointmentsRaw.map(appt => ({
      id: appt.id,
      customerName: appt.customerName,
      serviceName: appt.service.translations[0]?.name || 'Hizmet',
      date: appt.date.toISOString().split('T')[0],
      startTime: appt.startTime,
      status: appt.status,
    }));

    // Performans (Bu Ay Biten)
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const completedAppts = await prisma.appointment.findMany({
      where: {
        staffId: staffId,
        date: { gte: currentMonthStart },
        status: 'COMPLETED'
      }
    });

    const monthlyCompletedCount = completedAppts.length;
    const monthlyEarnings = completedAppts.reduce((sum, appt) => sum + parseFloat(appt.priceAtBooking.toString()), 0);

    // Günlük (Bugün) Performans
    const todayCompletedAppts = completedAppts.filter(appt => appt.date >= todayStart && appt.date <= todayEnd);
    const dailyCompletedCount = todayCompletedAppts.length;
    const dailyEarnings = todayCompletedAppts.reduce((sum, appt) => sum + parseFloat(appt.priceAtBooking.toString()), 0);

    return {
      success: true,
      data: {
        staff: {
          id: user.staff.id,
          name: user.name,
          image: user.image || user.staff.image,
          specialty: user.staff.specialty
        },
        todayAppointments,
        upcomingAppointments,
        performance: {
          monthlyCompletedCount,
          monthlyEarnings,
          dailyCompletedCount,
          dailyEarnings
        }
      }
    };
  } catch (error) {
    console.error('Staff Dashboard Error:', error);
    return { success: false, error: 'Veriler çekilirken bir hata oluştu.' };
  }
}
