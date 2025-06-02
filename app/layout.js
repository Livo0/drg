import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Dragons Lair',
  description: 'Manage game events, participants, and points',
};

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
          <Navbar />
          {/* Add padding-top on mobile for the fixed header */}
          <main className="flex-1 p-4 md:p-8 pt-16 md:pt-4 w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}