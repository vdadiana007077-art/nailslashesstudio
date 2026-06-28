"use server";

import { prisma } from '@/lib/prisma';
import { requireStaff } from './staffAuth';
import { ApptStatus } from '@prisma/client';

export async function getStaffCalendarAppointments(startDate: Date, endDate: Date) {
  const staff = await requireStaff();

  const appointments = await prisma.appointment.findMany({
    where: {
      staffId: staff.id,
      date: {
        gte: startDate,
        lte: endDate,
      }
    },
    include: {
      customer: true,
      service: {
        include: {
          translations: true
        }
      },
      payment: true,
    },
    orderBy: [
      { date: 'asc' },
      { startTime: 'asc' }
    ]
  });

  return { success: true, data: appointments };
}
