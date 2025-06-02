import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Game Champions Dashboard',
  description: 'Manage game events, participants, and points',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-gray-100">
          <Navbar />
          <main className="flex-1 md:ml-64 p-4 md:p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}