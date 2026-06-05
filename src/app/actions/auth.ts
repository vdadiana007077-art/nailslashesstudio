"use server";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAdmin(formData: FormData) {
  const password = formData.get('password');
  
  // Basit güvenlik: Şifreyi çevre değişkeninden alıyoruz, yoksa geçici bir şifre
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "nails123";

  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set('admin_token', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 hafta geçerli
      path: '/',
    });
    return { success: true };
  } else {
    return { success: false, error: "Hatalı şifre!" };
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
  redirect('/tr/admin/login');
}
