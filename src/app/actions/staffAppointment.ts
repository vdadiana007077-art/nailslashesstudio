"use server";

import { prisma } from '@/lib/prisma';
import { ApptStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { logAction } from './audit';

// Helper for status updates
async function updateStatus(appointmentId: string, status: ApptStatus, notes: string) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) throw new Error('Randevu bulunamadı');

    await prisma.$transaction(async (tx) => {
      await tx.appointment.update({
        where: { id: appointmentId },
        data: { status }
      });

      await tx.appointmentStatusHistory.create({
        data: {
          appointmentId,
          status,
          notes
        }
      });
      
      // If cancelled or no show, free the slot
      if ((status === ApptStatus.CANCELLED || status === ApptStatus.NO_SHOW) && appointment.locationId) {
        const slot = await tx.appointmentSlot.findFirst({
          where: {
            locationId: appointment.locationId,
            staffId: appointment.staffId || null,
            date: appointment.date,
            time: appointment.startTime,
          },
        });

        if (slot && slot.bookedCount > 0) {
          await tx.appointmentSlot.update({
            where: { id: slot.id },
            data: { bookedCount: { decrement: 1 } },
          });
        }
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error(`Randevu durum güncelleme hatası (${status}):`, error);
    return { success: false, error: error.message || 'Durum güncellenemedi' };
  } finally {
    revalidatePath('/', 'layout');
  }
}

export async function markArrived(appointmentId: string) {
  // await requireStaff(); // Check staff
  await logAction('Randevu Durumu: Geldi', `Appointment ID: ${appointmentId}`);
  return updateStatus(appointmentId, ApptStatus.ARRIVED, 'Müşteri salona geldi.');
}

export async function markStarted(appointmentId: string) {
  // await requireStaff();
  await logAction('Randevu Durumu: Başladı', `Appointment ID: ${appointmentId}`);
  return updateStatus(appointmentId, ApptStatus.STARTED, 'İşleme başlandı.');
}

export async function markCompleted(appointmentId: string) {
  // await requireStaff();
  await logAction('Randevu Durumu: Tamamlandı', `Appointment ID: ${appointmentId}`);
  return updateStatus(appointmentId, ApptStatus.COMPLETED, 'İşlem tamamlandı.');
}

// markPaid is often handled by collectAppointmentPayment directly,
// but if they just want to mark it without collection details:
export async function markPaid(appointmentId: string) {
  // await requireStaff();
  await logAction('Randevu Durumu: Ödendi', `Appointment ID: ${appointmentId}`);
  return updateStatus(appointmentId, ApptStatus.PAID, 'Ödeme alındı.');
}

export async function markNoShow(appointmentId: string) {
  // await requireStaff();
  await logAction('Randevu Durumu: Gelmedi (No-Show)', `Appointment ID: ${appointmentId}`);
  return updateStatus(appointmentId, ApptStatus.NO_SHOW, 'Müşteri randevuya gelmedi.');
}

export async function markCancelled(appointmentId: string, reason?: string) {
  // await requireStaff();
  await logAction('Randevu Durumu: İptal Edildi', `Appointment ID: ${appointmentId}`);
  return updateStatus(appointmentId, ApptStatus.CANCELLED, reason || 'Randevu iptal edildi.');
}
