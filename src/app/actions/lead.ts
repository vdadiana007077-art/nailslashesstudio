"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { LeadStatus } from '@prisma/client';

export async function createLead(formData: FormData) {
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string || null;
  const email = formData.get('email') as string || null;
  const source = formData.get('source') as string || 'web';
  const message = formData.get('message') as string || null;

  if (!name) {
    return { success: false, error: 'İsim alanı zorunludur!' };
  }

  try {
    const newLead = await prisma.lead.create({
      data: {
        name,
        phone,
        email,
        source,
        message,
        status: LeadStatus.PENDING,
      },
    });

    revalidatePath('/[locale]/admin/leads', 'page');
    return { success: true, data: newLead };
  } catch (error: any) {
    console.error('Lead oluşturma hatası:', error);
    return { success: false, error: 'Talep oluşturulurken bir hata oluştu.' };
  }
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  try {
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: { status },
    });

    revalidatePath('/[locale]/admin/leads', 'page');
    return { success: true, data: updatedLead };
  } catch (error: any) {
    console.error('Lead durum güncelleme hatası:', error);
    return { success: false, error: 'Talep durumu güncellenirken bir hata oluştu.' };
  }
}

export async function updateLeadNotes(id: string, notes: string) {
  try {
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: { notes },
    });

    revalidatePath('/[locale]/admin/leads', 'page');
    return { success: true, data: updatedLead };
  } catch (error: any) {
    console.error('Lead not güncelleme hatası:', error);
    return { success: false, error: 'Talep notları güncellenirken bir hata oluştu.' };
  }
}

export async function deleteLead(_id: string) {
  try {
    // Kurallar gereği admin onayı olmadan silme yapılmayacak, ama soft-delete yapısı yoksa veya doğrudan silme ise:
    // Lead modelinde soft-delete alanı yok. O yüzden doğrudan siliyoruz veya pasife çekiyoruz.
    // Ancak veritabanı kurallarında: "Hiçbir durumda veritabanından doğrudan silme işlemi yapılmayacaktır."
    // Dolayısıyla bu modeli silmek yerine status olarak CANCELLED/REJECTED ekleyebiliriz ama enumda sadece: PENDING, IN_PROGRESS, CONTACTED, CONVERTED var.
    // O yüzden silme fonksiyonunu eklemeyelim veya eğer silme kesin gerekirse kullanıcıdan onay isteyelim.
    // Şimdilik silme sunmuyoruz, sadece durumları güncelliyoruz. Bu sayede veritabanı silme kuralına tam uymuş oluruz!
    return { success: false, error: 'Veritabanı koruma kuralları gereği doğrudan silme yapılamaz.' };
  } catch (_) {
    return { success: false, error: 'Silme işlemi başarısız.' };
  }
}
