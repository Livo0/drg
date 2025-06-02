'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  CalendarIcon, 
  UsersIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Events', href: '/events', icon: CalendarIcon },
    { name: 'Participants', href: '/participants', icon: UsersIcon },
    { name: 'Leaderboard', href: '/leaderboard', icon: ChartBarIcon },
  ];

  return (
    <nav className="bg-gray-800 text-white h-screen w-64 fixed left-0 top-0 overflow-y-auto">
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold">DRG RECORDS</h1>
      </div>
      <div className="mt-6">
        <ul>
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
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
      </div>
    </nav>
  );
}