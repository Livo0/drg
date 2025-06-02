'use client';

import { useState, useEffect } from 'react';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { TrophyIcon } from '@heroicons/react/24/outline';

export default function LeaderboardPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        setEvents(data.events || []);
        
        // Set the first active event as default
        const activeEvent = data.events?.find(event => event.isActive);
        if (activeEvent) {
          setSelectedEvent(activeEvent._id);
        } else if (data.events?.length > 0) {
          setSelectedEvent(data.events[0]._id);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!selectedEvent) return;
      
      try {
        setLoading(true);
        const res = await fetch(`/api/points?eventId=${selectedEvent}`);
        const data = await res.json();
        
        // Group points by participant and calculate total
        const pointsByParticipant = {};
        
        data.points.forEach(point => {
          const participantId = point.participant._id;
          
          if (!pointsByParticipant[participantId]) {
            pointsByParticipant[participantId] = {
              participant: point.participant,
              totalPoints: 0,
              pointsHistory: [],
            };
          }
          
          pointsByParticipant[participantId].totalPoints += point.points;
          pointsByParticipant[participantId].pointsHistory.push(point);
        });
        
        // Convert to array and sort by total points
        const leaderboardData = Object.values(pointsByParticipant)
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .map((item, index) => ({
            ...item,
            rank: index + 1,
          }));
        
        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedEvent]);

  const handleEventChange = (e) => {
    setSelectedEvent(e.target.value);
  };

  const eventOptions = [
    { value: '', label: 'Select an event' },
    ...events.map(event => ({
      value: event._id,
      label: event.name,
    })),
  ];

  const getPositionBadge = (position) => {
    switch (position) {
      case 1:
        return <Badge variant="success" className="px-3 py-1">1st Place 🥇</Badge>;
      case 2:
        return <Badge variant="primary" className="px-3 py-1">2nd Place 🥈</Badge>;
      case 3:
        return <Badge variant="warning" className="px-3 py-1">3rd Place 🥉</Badge>;
      default:
        return <Badge className="px-3 py-1">{position}th Place</Badge>;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
      
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="max-w-xs">
          <Select
            label="Select Event"
            options={eventOptions}
            value={selectedEvent}
            onChange={handleEventChange}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">Loading leaderboard data...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {leaderboard.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No points data available for this event yet.
                </p>
              </div>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {leaderboard.slice(0, 3).map((item) => (
                  <Card key={item.participant._id} className="text-center">
                    <div className="py-4">
                      <div className="mb-2">
                        {getPositionBadge(item.rank)}
                      </div>
                      <div className="flex justify-center mb-2">
                        <div className="p-3 rounded-full bg-blue-100">
                          <TrophyIcon className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-1">{item.participant.username}</h3>
                      <p className="text-gray-500 mb-3">
                        Tier: <Badge variant="primary">{item.participant.tier}</Badge>
                      </p>
                      <p className="text-3xl font-bold text-blue-600">
                        {item.totalPoints.toFixed(2)} pts
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
              
              {leaderboard.length > 3 && (
                <Card title="Other Participants">
                  <div className="divide-y divide-gray-200">
                    {leaderboard.slice(3).map((item) => (
                      <div key={item.participant._id} className="py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center mr-4">
                            <span className="font-medium">{item.rank}</span>
                          </div>
                          <div>
                            <h4 className="font-medium">{item.participant.username}</h4>
                            <p className="text-sm text-gray-500">
                              Tier: {item.participant.tier}
                            </p>
                          </div>
                        </div>
                        <div className="text-xl font-bold">
                          {item.totalPoints.toFixed(2)} pts
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}