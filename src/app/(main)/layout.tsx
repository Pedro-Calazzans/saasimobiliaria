import MainLayout from '@/components/main-layout';
import { SupabaseProvider } from '@/components/providers/supabase-provider';
import React from 'react';
import { Toaster } from 'react-hot-toast';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SupabaseProvider>
      <MainLayout>
        <Toaster position="top-right" />
        {children}
      </MainLayout>
    </SupabaseProvider>
  );
};

export default Layout;
