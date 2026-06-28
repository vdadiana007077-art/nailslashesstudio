"use server";

import { prisma } from '@/lib/prisma';
import { requireStaff } from './staffAuth';
import { ApptStatus } from '@prisma/client';
import { getStaffFinanceSummary } from './staffFinance';

export async function getStaffDashboardData() {
  const staff = await requireStaff();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Fetch appointments
  const appointments = await prisma.appointment.findMany({
    where: {
      staffId: staff.id,
    },
    include: {
      customer: true,
      service: {
        include: {
          translations: true
        }
      },
      payment: true,
      location: true
    },
    orderBy: [
      { date: 'asc' },
      { startTime: 'asc' }
    ]
  });

  // Filter today and upcoming
  const todayAppointments = appointments.filter(a => {
    const apptDate = new Date(a.date);
    return apptDate >= today && apptDate < tomorrow;
  });

  const upcomingAppointments = appointments.filter(a => {
    const apptDate = new Date(a.date);
    return apptDate >= tomorrow && a.status !== ApptStatus.COMPLETED && a.status !== ApptStatus.PAID && a.status !== ApptStatus.CANCELLED && a.status !== ApptStatus.NO_SHOW;
  });

  // Completed stats for today
  const completedToday = todayAppointments.filter(a => 
    a.status === ApptStatus.COMPLETED || a.status === ApptStatus.PAID
  ).length;

  // Get finance summary (we already built this in phase 2)
  const financeResult = await getStaffFinanceSummary(staff.id);
  const finance = financeResult.success ? financeResult.data : null;

  return {
    success: true,
    data: {
      staff,
      todayAppointments,
      upcomingAppointments,
      stats: {
        todayCount: todayAppointments.length,
        completedToday,
        upcomingCount: upcomingAppointments.length,
      },
      finance
    }
  };
}
