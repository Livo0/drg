'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';

export default function EditParticipantPage({ params }) {
  const router = useRouter();
  const { id } = params;
  
  const [participant, setParticipant] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    tier: '',
    isGlobal: true,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [points, setPoints] = useState([]);

  useEffect(() => {
    const fetchParticipant = async () => {
      try {
        const res = await fetch(`/api/participants/${id}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch participant');
        }
        
        const data = await res.json();
        setParticipant(data.participant);
        setFormData({
          username: data.participant.username,
          tier: data.participant.tier,
          isGlobal: data.participant.isGlobal,
        });
      } catch (error) {
        console.error('Error fetching participant:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/events?participantId=${id}`);
        const data = await res.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    const fetchPoints = async () => {
      try {
        const res = await fetch(`/api/points?participantId=${id}`);
        const data = await res.json();
        setPoints(data.points || []);
      } catch (error) {
        console.error('Error fetching points:', error);
      }
    };

    fetchParticipant();
    fetchEvents();
    fetchPoints();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.tier) {
      newErrors.tier = 'Tier is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`/api/participants/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update participant');
      }
      
      router.push('/participants');
    } catch (error) {
      console.error('Error updating participant:', error);
      setErrors({
        ...errors,
        form: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tierOptions = [
    { value: 'R1', label: 'R1' },
    { value: 'R2', label: 'R2' },
    { value: 'R3', label: 'R3' },
    { value: 'R4', label: 'R4' },
    { value: 'R5', label: 'R5' },
  ];

  const eventColumns = [
    { key: 'name', header: 'Event Name' },
    { 
      key: 'startDate', 
      header: 'Start Date',
      render: (row) => new Date(row.startDate).toLocaleDateString()
    },
    { 
      key: 'isActive', 
      header: 'Status',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'default'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
  ];

  const pointColumns = [
    { 
      key: 'event', 
      header: 'Event',
      render: (row) => row.event?.name || 'Unknown Event'
    },
    { 
      key: 'points', 
      header: 'Points',
      render: (row) => (
        <span className="font-medium">{row.points.toFixed(2)}</span>
      )
    },
    { 
      key: 'date', 
      header: 'Date',
      render: (row) => new Date(row.date).toLocaleDateString()
    },
    { 
      key: 'notes', 
      header: 'Notes',
      render: (row) => row.notes || '-'
    },
  ];

  if (loading) {
    return <div className="text-center py-12">Loading participant data...</div>;
  }

  if (!participant) {
    return <div className="text-center py-12">Participant not found</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Participant</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            {errors.form && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                {errors.form}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <Input
                label="Username"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
                required
              />
              
              <Select
                label="Tier"
                id="tier"
                name="tier"
                options={tierOptions}
                value={formData.tier}
                onChange={handleChange}
                error={errors.tier}
                required
              />
              
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    id="isGlobal"
                    name="isGlobal"
                    type="checkbox"
                    checked={formData.isGlobal}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isGlobal" className="ml-2 block text-sm text-gray-700">
                    Make participant global (available for all events)
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push('/participants')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card title="Participant Events">
            {events.length === 0 ? (
              <p className="text-gray-500 py-4">This participant is not part of any events yet.</p>
            ) : (
              <Table
                columns={eventColumns}
                data={events}
                onRowClick={(row) => router.push(`/events/${row._id}`)}
              />
            )}
          </Card>
          
          <Card title="Point History" className="mt-6">
            {points.length === 0 ? (
              <p className="text-gray-500 py-4">No points recorded for this participant yet.</p>
            ) : (
              <Table
                columns={pointColumns}
                data={points}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}