"use server";

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { hashPassword, verifyPassword, encryptSession, decryptSession } from '@/lib/auth-helpers';
import { LoginType, Language } from '@prisma/client';
import { logAction } from './audit';

/**
 * Yeni müşteri kaydı oluşturur.
 */
export async function registerCustomer(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string || null;
  const password = formData.get('password') as string;
  const passwordConfirm = formData.get('passwordConfirm') as string;
  const kvkkConsent = formData.get('kvkkConsent') === 'true';
  const newsletterConsent = formData.get('newsletterConsent') === 'true';
  const locale = (formData.get('locale') as string || 'tr').toLowerCase();

  if (!name || !email || !password) {
    return { success: false, error: 'Ad soyad, e-posta ve şifre alanları zorunludur!' };
  }

  if (password !== passwordConfirm) {
    return { success: false, error: 'Şifreler uyuşmuyor!' };
  }

  if (!kvkkConsent) {
    return { success: false, error: 'KVKK aydınlatma metnini onaylamanız gerekmektedir!' };
  }

  try {
    // E-posta mükerrerlik kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      if (existingUser.loginType === LoginType.GOOGLE) {
        return { success: false, error: 'Bu e-posta adresi ile daha önce Google hesabınızla giriş yapmıştınız. Lütfen "Google ile Devam Et" butonunu kullanarak giriş yapın.' };
      }
      if (existingUser.loginType === LoginType.APPLE) {
        return { success: false, error: 'Bu e-posta adresi ile daha önce Apple hesabınızla giriş yapmıştınız. Lütfen "Apple ile Devam Et" butonunu kullanarak giriş yapın.' };
      }
      return { success: false, error: 'Bu e-posta adresiyle kayıtlı bir hesap zaten mevcut. Giriş yapmayı deneyin veya şifrenizi sıfırlayın.' };
    }

    const hashedPassword = hashPassword(password);

    // Kullanıcıyı veritabanında oluştur
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        loginType: LoginType.MANUAL,
        marketingConsent: newsletterConsent
      }
    });

    // Eğer bültene abone olmak istediyse, Subscriber tablosuna da kaydet
    if (newsletterConsent) {
      const languageEnum = locale.toUpperCase() as Language;
      await prisma.subscriber.create({
        data: {
          email,
          language: languageEnum,
          marketingConsent: true,
          userId: newUser.id,
          isActive: true
        }
      });
    }

    // HTTP-Only Çerez Set Etme
    const cookieStore = await cookies();
    cookieStore.set('customer_token', encryptSession({ userId: newUser.id }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 gün
      path: '/'
    });

    await logAction('Müşteri Kaydoldu', `ID: ${newUser.id}, İsim: ${name}, E-Posta: ${email}`);

    return { success: true, data: { id: newUser.id, name: newUser.name, email: newUser.email } };
  } catch (error: any) {
    console.error('Müşteri kayıt hatası:', error);
    return { success: false, error: 'Kayıt işlemi sırasında bir hata oluştu.' };
  }
}

/**
 * Manuel müşteri girişi yapar.
 */
export async function loginCustomer(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'E-posta ve şifre zorunludur!' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return { success: false, error: 'Bu e-posta adresiyle kayıtlı bir hesap bulunamadı!' };
    }

    if (user.loginType === LoginType.GOOGLE) {
      return { success: false, error: 'Bu hesap Google ile oluşturulmuş. Lütfen "Google ile Devam Et" butonunu kullanın.' };
    }

    if (user.loginType === LoginType.APPLE) {
      return { success: false, error: 'Bu hesap Apple ile oluşturulmuş. Lütfen "Apple ile Devam Et" butonunu kullanın.' };
    }

    if (!user.password) {
      return { success: false, error: 'Bu hesapta şifre tanımlanmamış. Lütfen sosyal giriş butonlarını kullanın.' };
    }

    const isMatch = verifyPassword(password, user.password);
    if (!isMatch) {
      return { success: false, error: 'Geçersiz şifre! Lütfen tekrar deneyin.' };
    }

    // HTTP-Only Çerez Set Etme
    const cookieStore = await cookies();
    cookieStore.set('customer_token', encryptSession({ userId: user.id }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 gün
      path: '/'
    });

    await logAction('Müşteri Giriş Yaptı', `ID: ${user.id}, İsim: ${user.name}`);

    return { success: true, data: { id: user.id, name: user.name, email: user.email } };
  } catch (error: any) {
    console.error('Müşteri giriş hatası:', error);
    return { success: false, error: 'Giriş yapılırken bir hata oluştu.' };
  }
}

/**
 * Giriş yapmış olan müşterinin oturumunu kapatır.
 */
export async function logoutCustomer() {
  const cookieStore = await cookies();
  cookieStore.delete('customer_token');
  return { success: true };
}

/**
 * Mevcut giriş yapmış olan müşterinin bilgilerini ve randevularını çerezden çözer.
 */
export async function getCurrentCustomer() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('customer_token');
    if (!token) return null;

    const session = decryptSession(token.value);
    if (!session || !session.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        appointments: {
          include: {
            service: {
              include: {
                translations: true
              }
            },
            staff: true
          },
          orderBy: {
            date: 'desc'
          }
        },
        subscriber: true
      }
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      loginType: user.loginType,
      hasPassword: !!user.password,
      marketingConsent: user.marketingConsent,
      appointments: user.appointments.map(appt => ({
        id: appt.id,
        serviceName: appt.service.translations[0]?.name || 'Hizmet',
        staffName: appt.staff?.name || 'Uzman Belirtilmedi',
        date: appt.date.toISOString().split('T')[0],
        startTime: appt.startTime,
        endTime: appt.endTime,
        status: appt.status,
        price: appt.priceAtBooking.toString(),
        locationId: appt.locationId,
        serviceId: appt.serviceId,
        staffId: appt.staffId
      })),
      subscriberActive: user.subscriber?.isActive || false
    };
  } catch (error) {
    console.error('Müşteri çözümlenemedi:', error);
    return null;
  }
}

/**
 * Google/Apple ile giriş yapmış müşteriye manuel şifre ekler.
 */
export async function addPasswordToSocialAccount(password: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('customer_token');
    if (!token) return { success: false, error: 'Oturum bulunamadı!' };

    const session = decryptSession(token.value);
    if (!session || !session.userId) return { success: false, error: 'Oturum bulunamadı!' };

    const hashedPassword = hashPassword(password);

    await prisma.user.update({
      where: { id: session.userId },
      data: {
        password: hashedPassword
      }
    });

    await logAction('Müşteri Şifre Ekledi', `User ID: ${session.userId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Şifre ekleme hatası:', error);
    return { success: false, error: 'Şifre eklenirken bir hata oluştu.' };
  }
}

/**
 * Müşteri e-bülten veya pazarlama iznini günceller.
 */
export async function updateCustomerMarketing(newsletterConsent: boolean, locale: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('customer_token');
    if (!token) return { success: false, error: 'Oturum bulunamadı!' };

    const session = decryptSession(token.value);
    if (!session || !session.userId) return { success: false, error: 'Oturum bulunamadı!' };

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { subscriber: true }
    });

    if (!user) return { success: false, error: 'Kullanıcı bulunamadı!' };

    // 1. User tablosunda güncelle
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        marketingConsent: newsletterConsent
      }
    });

    // 2. Subscriber tablosunda güncelle veya ekle/çıkar
    if (user.subscriber) {
      await prisma.subscriber.update({
        where: { id: user.subscriber.id },
        data: {
          isActive: newsletterConsent,
          marketingConsent: newsletterConsent,
          unsubscribedAt: newsletterConsent ? null : new Date()
        }
      });
    } else if (newsletterConsent && user.email) {
      const languageEnum = locale.toUpperCase() as Language;
      await prisma.subscriber.create({
        data: {
          email: user.email,
          language: languageEnum,
          marketingConsent: true,
          userId: user.id,
          isActive: true
        }
      });
    }

    await logAction('Müşteri Pazarlama İzni Güncellendi', `ID: ${user.id}, İzin: ${newsletterConsent}`);
    return { success: true };
  } catch (error: any) {
    console.error('Pazarlama izni güncelleme hatası:', error);
    return { success: false, error: 'Ayarlar güncellenirken hata oluştu.' };
  }
}

export async function saveCookieConsent(necessary: boolean, analytics: boolean, marketing: boolean) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('customer_token');
    if (!token) return { success: false, error: 'Oturum bulunamadı!' };

    const session = decryptSession(token.value);
    if (!session || !session.userId) return { success: false, error: 'Oturum bulunamadı!' };

    const consentId = `consent_${session.userId}`;

    await prisma.cookieConsent.upsert({
      where: { userId: session.userId },
      update: {
        necessary,
        analytics,
        marketing
      },
      create: {
        userId: session.userId,
        consentId,
        necessary,
        analytics,
        marketing
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Çerez izni kaydetme hatası:', error);
    return { success: false, error: 'Çerez tercihleri kaydedilemedi.' };
  }
}
