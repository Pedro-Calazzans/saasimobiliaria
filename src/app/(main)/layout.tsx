import MainLayout from '@/components/main-layout';
import React from 'react';
import { Toaster } from 'react-hot-toast';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <MainLayout>
      <Toaster position="top-right" />
      {children}
    </MainLayout>
  );
};

export default Layout;