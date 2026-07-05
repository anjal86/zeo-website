import { getAdminSession } from '@/server/auth/session';
import { redirect } from 'next/navigation';
import AdminLayoutClient from '@/components/Admin/AdminLayoutClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Zeo Tourism',
  robots: 'noindex, nofollow',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <AdminLayoutClient user={session}>
      {children}
    </AdminLayoutClient>
  );
}
