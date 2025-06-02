'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function EditEventPage({ params }) {
  const router = useRouter();
  const { id } = params;
  
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [participants, setParticipants] = useState([]);
  const [points, setPoints] = useState([]);
  
  const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] = useState(false);
  const [isAddPointsModalOpen, setIsAddPointsModalOpen] = useState(false);
  const [globalParticipants, setGlobalParticipants] = useState([]);
  const [selectedParticipant, setSelectedParticipant] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [pointsFormData, setPointsFormData] = useState({
    participantId: '',
    points: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [pointsErrors, setPointsErrors] = useState({});

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch event');
        }
        
        const data = await res.json();
        setEvent(data.event);
        setFormData({
          name: data.event.name,
          description: data.event.description || '',
          startDate: new Date(data.event.startDate).toISOString().split('T')[0],
          endDate: data.event.endDate 
            ? new Date(data.event.endDate).toISOString().split('T')[0] 
            : '',
          isActive: data.event.isActive,
        });
        
        setParticipants(data.event.participants || []);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPoints = async () => {
      try {
        const res = await fetch(`/api/points?eventId=${id}`);
        const data = await res.json();
        setPoints(data.points || []);
      } catch (error) {
        console.error('Error fetching points:', error);
      }
    };

    fetchEvent();
    fetchPoints();
  }, [id]);

  const fetchGlobalParticipants = async () => {
    try {
      const res = await fetch('/api/participants?isGlobal=true');
      const data = await res.json();
      
      // Filter out participants already in the event
      const eventParticipantIds = participants.map(p => p._id);
      const filteredParticipants = (data.participants || []).filter(
        p => !eventParticipantIds.includes(p._id)
      );
      
      setGlobalParticipants(filteredParticipants);
    } catch (error) {
      console.error('Error fetching global participants:', error);
    }
  };

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

  const handlePointsChange = (e) => {
    const { name, value } = e.target;
    setPointsFormData({
      ...pointsFormData,
      [name]: value,
    });
    
    // Clear error when field is edited
    if (pointsErrors[name]) {
      setPointsErrors({
        ...pointsErrors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date cannot be before start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePointsForm = () => {
    const newErrors = {};
    
    if (!pointsFormData.participantId) {
      newErrors.participantId = 'Participant is required';
    }
    
    if (!pointsFormData.points) {
      newErrors.points = 'Points value is required';
    } else if (isNaN(parseFloat(pointsFormData.points))) {
      newErrors.points = 'Points must be a number';
    }
    
    if (!pointsFormData.date) {
      newErrors.date = 'Date is required';
    }
    
    setPointsErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update event');
      }
      
      router.push('/events');
    } catch (error) {
      console.error('Error updating event:', error);
      setErrors({
        ...errors,
        form: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddParticipant = async () => {
    if (!selectedParticipant) {
      return;
    }
    
    try {
      const res = await fetch(`/api/events/${id}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantId: selectedParticipant }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add participant');
      }
      
      // Refresh event data
      const eventRes = await fetch(`/api/events/${id}`);
      const eventData = await eventRes.json();
      setEvent(eventData.event);
      setParticipants(eventData.event.participants || []);
      
      setIsAddParticipantModalOpen(false);
      setSelectedParticipant('');
    } catch (error) {
      console.error('Error adding participant:', error);
      alert(error.message);
    }
  };

  const handleRemoveParticipant = async (participantId) => {
    try {
      const res = await fetch(`/api/events/${id}/participants?participantId=${participantId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove participant');
      }
      
      // Update local state
      setParticipants(participants.filter(p => p._id !== participantId));
    } catch (error) {
      console.error('Error removing participant:', error);
      alert(error.message);
    }
  };

  const handleAddPoints = async (e) => {
    e.preventDefault();
    
    if (!validatePointsForm()) {
      return;
    }
    
    try {
      const res = await fetch('/api/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: id,
          participantId: pointsFormData.participantId,
          points: parseFloat(pointsFormData.points),
          date: pointsFormData.date,
          notes: pointsFormData.notes,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add points');
      }
      
      // Refresh points data
      const pointsRes = await fetch(`/api/points?eventId=${id}`);
      const pointsData = await pointsRes.json();
      setPoints(pointsData.points || []);
      
      // Reset form and close modal
      setPointsFormData({
        participantId: '',
        points: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setIsAddPointsModalOpen(false);
    } catch (error) {
      console.error('Error adding points:', error);
      setPointsErrors({
        ...pointsErrors,
        form: error.message,
      });
    }
  };

  const participantColumns = [
    { key: 'username', header: 'Username' },
    { 
      key: 'tier', 
      header: 'Tier',
      render: (row) => (
        <Badge variant="primary">{row.tier}</Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Button
          variant="danger"
          className="text-xs py-1 px-2"
          onClick={() => handleRemoveParticipant(row._id)}
        >
          Remove
        </Button>
      ),
    },
  ];

  const pointsColumns = [
    { 
      key: 'participant', 
      header: 'Participant',
      render: (row) => row.participant?.username || 'Unknown'
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
    return <div className="text-center py-12">Loading event data...</div>;
  }

  if (!event) {
    return <div className="text-center py-12">Event not found</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>
      
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
                label="Event Name"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  error={errors.startDate}
                  required
                />
                
                <Input
                  label="End Date (Optional)"
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  error={errors.endDate}
                />
              </div>
              
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Event is active
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push('/events')}
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
          <Card title="Participants">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                Participants ({participants.length})
              </h3>
              <Button
                onClick={() => {
                  fetchGlobalParticipants();
                  setIsAddParticipantModalOpen(true);
                }}
                className="flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Participant
              </Button>
            </div>
            
            {participants.length === 0 ? (
              <p className="text-gray-500 py-4">No participants in this event yet.</p>
            ) : (
              <Table
                columns={participantColumns}
                data={participants}
              />
            )}
          </Card>
          
          <Card title="Points History" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                Points History
              </h3>
              <Button
                onClick={() => setIsAddPointsModalOpen(true)}
                className="flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Points
              </Button>
            </div>
            
            {points.length === 0 ? (
              <p className="text-gray-500 py-4">No points recorded for this event yet.</p>
            ) : (
              <Table
                columns={pointsColumns}
                data={points}
              />
            )}
          </Card>
        </div>
      </div>
      
      {/* Add Participant Modal */}
      <Modal
        isOpen={isAddParticipantModalOpen}
        onClose={() => setIsAddParticipantModalOpen(false)}
        title="Add Participant to Event"
      >
        <div className="mb-4">
          <Input
            placeholder="Search participants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="max-h-60 overflow-y-auto mb-4">
          {globalParticipants.length === 0 ? (
            <p className="text-gray-500 py-2">No available participants found.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {globalParticipants
                .filter(p => 
                  p.username.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(participant => (
                  <li
                    key={participant._id}
                    className={`py-2 px-3 cursor-pointer hover:bg-gray-50 ${
                      selectedParticipant === participant._id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedParticipant(participant._id)}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        checked={selectedParticipant === participant._id}
                        onChange={() => setSelectedParticipant(participant._id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <p className="font-medium">{participant.username}</p>
                        <p className="text-sm text-gray-500">
                          Tier: {participant.tier}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={() => setIsAddParticipantModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddParticipant}
            disabled={!selectedParticipant}
          >
            Add to Event
          </Button>
        </div>
      </Modal>
      
      {/* Add Points Modal */}
      <Modal
        isOpen={isAddPointsModalOpen}
        onClose={() => setIsAddPointsModalOpen(false)}
        title="Add Points"
      >
        {pointsErrors.form && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {pointsErrors.form}
          </div>
        )}
        
        <form onSubmit={handleAddPoints}>
          <div className="mb-4">
            <label htmlFor="participantId" className="block text-sm font-medium text-gray-700 mb-1">
              Participant
            </label>
            <select
              id="participantId"
              name="participantId"
              value={pointsFormData.participantId}
              onChange={handlePointsChange}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                pointsErrors.participantId ? 'border-red-500' : ''
              }`}
              required
            >
              <option value="">Select a participant</option>
              {participants.map(participant => (
                <option key={participant._id} value={participant._id}>
                  {participant.username} (Tier: {participant.tier})
                </option>
              ))}
            </select>
            {pointsErrors.participantId && (
              <p className="mt-1 text-sm text-red-600">{pointsErrors.participantId}</p>
            )}
          </div>
          
          <Input
            label="Points"
            id="points"
            name="points"
            type="number"
            step="0.01"
            value={pointsFormData.points}
            onChange={handlePointsChange}
            error={pointsErrors.points}
            required
          />
          
          <Input
            label="Date"
            id="date"
            name="date"
            type="date"
            value={pointsFormData.date}
            onChange={handlePointsChange}
            error={pointsErrors.date}
            required
          />
          
          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows="2"
              value={pointsFormData.notes}
              onChange={handlePointsChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddPointsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Add Points
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}