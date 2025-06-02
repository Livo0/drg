'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import { 
  CalendarIcon, 
  UsersIcon, 
  TrophyIcon,
  ArrowTrendingUpIcon 
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalParticipants: 0,
    recentPoints: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch events
        const eventsRes = await fetch('/api/events');
        const eventsData = await eventsRes.json();
        const events = eventsData.events || [];
        
        // Fetch participants
        const participantsRes = await fetch('/api/participants');
        const participantsData = await participantsRes.json();
        const participants = participantsData.participants || [];
        
        // Fetch recent points
        const pointsRes = await fetch('/api/points');
        const pointsData = await pointsRes.json();
        const points = pointsData.points || [];
        
        setStats({
          totalEvents: events.length,
          activeEvents: events.filter(event => event.isActive).length,
          totalParticipants: participants.length,
          recentPoints: points.slice(0, 5),
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading dashboard data...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-black-700">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-blue-50 border border-blue-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500 text-white mr-4">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-black">{stats.totalEvents}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-green-50 border border-green-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500 text-white mr-4">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Events</p>
              <p className="text-2xl font-bold text-black">{stats.activeEvents}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-purple-50 border border-purple-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-500 text-white mr-4">
              <UsersIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Participants</p>
              <p className="text-2xl font-bold text-black">{stats.totalParticipants}</p>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Activity">
          {stats.recentPoints.length === 0 ? (
            <p className="text-gray-500 py-4">No recent point activities</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {stats.recentPoints.map((point) => (
                <li key={point._id} className="py-3">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 mr-3">
                      <TrophyIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-black-100">
                        {point.participant.username} earned {point.points} points
                      </p>
                      <p className="text-sm text-gray-500">
                        in {point.event.name} on {new Date(point.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        
        <Card title="Quick Links">
          <div className="space-y-4 py-2">
            <Link
              href="/events/new"
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-400">Create New Event</p>
                <p className="text-sm text-black-500">Set up a new game event</p>
              </div>
            </Link>
            
            <Link
              href="/participants/new"
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3">
                <UsersIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-400">Add New Participant</p>
                <p className="text-sm text-black-500">Register a new participant</p>
              </div>
            </Link>
            
            <Link
              href="/leaderboard"
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                <ArrowTrendingUpIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-400">View Leaderboard</p>
                <p className="text-sm text-black-500">See top performers</p>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}