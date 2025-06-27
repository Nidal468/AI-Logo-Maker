'use client';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminLayoutWrapper({ children }) {
  // This wrapper allows us to include the admin layout for all admin routes
  return (
    <>
      <AdminLayout>
        {children}
      </AdminLayout>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}