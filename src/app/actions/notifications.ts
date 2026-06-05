"use server";

import { prisma } from '@/lib/prisma';
import { NotificationType, NotificationStatus, MessageType, MessageStatus } from '@prisma/client';
import nodemailer from 'nodemailer';
import { revalidatePath } from 'next/cache';

// Gmail SMTP Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Bildirim Kuyruğuna Ekleme
export async function createNotification(
  recipient: string,
  type: NotificationType,
  content: string
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        recipient,
        type,
        content,
        status: NotificationStatus.PENDING,
      }
    });
    return { success: true, data: notification };
  } catch (error: any) {
    console.error('Bildirim oluşturulamadı:', error);
    return { success: false, error: 'Bildirim havuzuna eklenemedi.' };
  }
}

// Havuzdaki Bekleyen Bildirimleri Gönderen Kron / Tetikleyici Fonksiyon
export async function sendPendingNotifications() {
  try {
    const pendingNotifications = await prisma.notification.findMany({
      where: {
        status: NotificationStatus.PENDING,
        attemptCount: {
          lt: 3 // En fazla 3 deneme
        }
      },
      take: 10 // Her seferinde en fazla 10 adet işleyelim
    });

    if (pendingNotifications.length === 0) {
      return { success: true, message: 'Bekleyen bildirim bulunmamaktadır.' };
    }

    let processedCount = 0;

    for (const notif of pendingNotifications) {
      // Deneme sayısını arttıralım
      await prisma.notification.update({
        where: { id: notif.id },
        data: { attemptCount: { increment: 1 } }
      });

      if (notif.type === NotificationType.EMAIL) {
        try {
          await transporter.sendMail({
            from: `"Nails & Lashes Studio" <${process.env.EMAIL_USER}>`,
            to: notif.recipient,
            subject: 'Nails & Lashes Studio Bildirimi',
            html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">${notif.content}</div>`,
          });

          // Başarılı durumu kaydet
          await prisma.notification.update({
            where: { id: notif.id },
            data: {
              status: NotificationStatus.SENT,
              sentAt: new Date(),
              errorMessage: null
            }
          });
          processedCount++;
        } catch (mailError: any) {
          await prisma.notification.update({
            where: { id: notif.id },
            data: {
              status: NotificationStatus.FAILED,
              errorMessage: mailError.message || 'E-posta gönderim hatası'
            }
          });
        }
      } else if (notif.type === NotificationType.SMS || notif.type === NotificationType.WHATSAPP) {
        // SMS ve WhatsApp entegrasyonu için mock API loglama
        try {
          // Log tablosuna ekle
          await prisma.messageLog.create({
            data: {
              recipient: notif.recipient,
              content: notif.content,
              type: notif.type === NotificationType.SMS ? MessageType.SMS : MessageType.WHATSAPP,
              status: MessageStatus.SENT,
            }
          });

          // Bildirimi başarılı işaretle
          await prisma.notification.update({
            where: { id: notif.id },
            data: {
              status: NotificationStatus.SENT,
              sentAt: new Date(),
              errorMessage: null
            }
          });
          processedCount++;
        } catch (msgError: any) {
          await prisma.notification.update({
            where: { id: notif.id },
            data: {
              status: NotificationStatus.FAILED,
              errorMessage: msgError.message || 'Mesaj gönderim hatası'
            }
          });
        }
      }
    }

    revalidatePath('/[locale]/admin', 'page');
    return { success: true, processed: processedCount };
  } catch (error: any) {
    console.error('Kuyruk işleme hatası:', error);
    return { success: false, error: 'Bildirim havuzu işlenirken bir hata oluştu.' };
  }
}
