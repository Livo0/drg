'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);
  
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Events', href: '/events', icon: CalendarIcon },
    { name: 'Participants', href: '/participants', icon: UsersIcon },
    { name: 'Leaderboard', href: '/leaderboard', icon: ChartBarIcon },
  ];

  return (
    <>
      {/* Mobile header - fixed at top */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-gray-800 text-white px-4 py-3">
        <h1 className="text-xl font-bold">DRG RECORDS</h1>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Overlay for mobile when menu is open */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`bg-gray-800 text-white h-screen w-64 fixed top-0 left-0 z-50 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out md:static md:flex md:flex-col overflow-y-auto`}
      >
        <div className="px-4 py-6 hidden md:block">
          <h1 className="text-2xl font-bold">DRG RECORDS</h1>
        </div>
        
        {/* Add padding-top on mobile to account for the header */}
        <div className="md:hidden pt-14"></div>
        
        <ul className="mt-4">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-medium ${
                  pathname === item.href
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}