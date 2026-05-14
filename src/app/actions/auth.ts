'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { login as setSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function registerAction(formData: FormData) {
  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const grade = formData.get('grade') as string;

  if (!fullName || !email || !password || !grade) {
    return { error: 'Tüm alanları doldurun.' };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: 'Bu e-posta zaten kullanımda.' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
      grade,
    },
  });

  await setSession({ id: user.id, email: user.email, fullName: user.fullName });
  redirect('/dashboard');
}

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'E-posta ve şifre gereklidir.' };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: 'Geçersiz e-posta veya şifre.' };
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return { error: 'Geçersiz e-posta veya şifre.' };
  }

  await setSession({ id: user.id, email: user.email, fullName: user.fullName });
  redirect('/dashboard');
}
