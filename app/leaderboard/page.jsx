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
        return <Badge variant="gold" size="lg" className="w-full sm:w-auto">1st Place 🥇</Badge>;
      case 2:
        return <Badge variant="silver" size="lg" className="w-full sm:w-auto">2nd Place 🥈</Badge>;
      case 3:
        return <Badge variant="bronze" size="lg" className="w-full sm:w-auto">3rd Place 🥉</Badge>;
      default:
        return <Badge size="lg" className="w-full sm:w-auto">{position}th Place</Badge>;
    }
  };

  const getEventName = () => {
    const event = events.find(e => e._id === selectedEvent);
    return event ? event.name : 'Selected Event';
  };

  return (
    <div className="pb-6">
      <h1 className="text-2xl font-bold mb-6 text-black">Leaderboard</h1>
      
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
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600 mb-2"></div>
          <p>Loading leaderboard data...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {leaderboard.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <p className="text-black-500">
                  No points data available for this event yet.
                </p>
              </div>
            </Card>
          ) : (
            <>
              <h2 className="text-xl text-black-100 font-semibold text-center mb-4">
                {getEventName()} - Top Performers
              </h2>
              
              {/* Top 3 Winners - Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* For mobile, show 1st place in full width */}
                {leaderboard.length > 0 && (
                  <div className="sm:hidden col-span-1">
                    <Card key={leaderboard[0].participant._id} className="text-center">
                      <div className="py-4">
                        <div className="mb-3">
                          {getPositionBadge(1)}
                        </div>
                        <div className="flex justify-center mb-3">
                          <div className="p-3 rounded-full bg-yellow-100">
                            <TrophyIcon className="h-10 w-10 text-yellow-600" />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-1 text-black">{leaderboard[0].participant.username}</h3>
                        <p className="text-black-500 mb-3">
                          Tier: <Badge variant="primary">{leaderboard[0].participant.tier}</Badge>
                        </p>
                        <p className="text-3xl font-bold text-yellow-600">
                          {leaderboard[0].totalPoints.toFixed(2)} pts
                        </p>
                      </div>
                    </Card>
                  </div>
                )}
                
                {/* 2nd and 3rd place in mobile, all 3 in desktop */}
                {leaderboard.slice(0, 3).map((item, index) => (
                  // Skip first place on mobile as it's already shown above
                  <div 
                    key={item.participant._id} 
                    className={`col-span-1 ${index === 0 ? 'hidden sm:block' : ''}`}
                  >
                    <Card className="text-center h-full">
                      <div className="py-4">
                        <div className="mb-2">
                          {getPositionBadge(item.rank)}
                        </div>
                        <div className="flex justify-center mb-2">
                          <div className={`p-3 rounded-full ${
                            item.rank === 1 ? 'bg-yellow-100' : 
                            item.rank === 2 ? 'bg-gray-200' : 'bg-amber-100'
                          }`}>
                            <TrophyIcon className={`h-8 w-8 ${
                              item.rank === 1 ? 'text-yellow-600' : 
                              item.rank === 2 ? 'text-gray-600' : 'text-amber-600'
                            }`} />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-1">{item.participant.username}</h3>
                        <p className="text-gray-500 mb-3">
                          Tier: <Badge variant="primary">{item.participant.tier}</Badge>
                        </p>
                        <p className={`text-3xl font-bold ${
                          item.rank === 1 ? 'text-yellow-600' : 
                          item.rank === 2 ? 'text-gray-600' : 'text-amber-600'
                        }`}>
                          {item.totalPoints.toFixed(2)} pts
                        </p>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
              
              {/* Other participants */}
              {leaderboard.length > 3 && (
                <Card title="Other Participants">
                  <div className="divide-y divide-gray-200">
                    {leaderboard.slice(3).map((item) => (
                      <div key={item.participant._id} className="py-4 flex flex-wrap sm:flex-nowrap items-center justify-between">
                        <div className="flex items-center w-full sm:w-auto mb-2 sm:mb-0">
                          <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                            <span className="font-medium">{item.rank}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium truncate">{item.participant.username}</h4>
                            <p className="text-sm text-gray-500">
                              Tier: {item.participant.tier}
                            </p>
                          </div>
                        </div>
                        <div className="text-xl font-bold w-full sm:w-auto text-right">
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