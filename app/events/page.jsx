'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (searchQuery) {
        queryParams.append('query', searchQuery);
      }
      
      if (statusFilter !== '') {
        queryParams.append('active', statusFilter);
      }
      
      const res = await fetch(`/api/events?${queryParams.toString()}`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [searchQuery, statusFilter]);

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await fetch(`/api/events/${eventToDelete._id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setEvents(events.filter(e => e._id !== eventToDelete._id));
        setIsDeleteModalOpen(false);
        setEventToDelete(null);
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || 'Failed to delete event'}`);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('An error occurred while deleting the event');
    }
  };

  const columns = [
    { key: 'name', header: 'Event Name' },
    { 
      key: 'startDate', 
      header: 'Start Date',
      render: (row) => new Date(row.startDate).toLocaleDateString()
    },
    { 
      key: 'endDate', 
      header: 'End Date',
      render: (row) => row.endDate ? new Date(row.endDate).toLocaleDateString() : 'Ongoing'
    },
    { 
      key: 'participants', 
      header: 'Participants',
      render: (row) => row.participants?.length || 0
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
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            className="text-xs py-1 px-2"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/events/${row._id}`);
            }}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            className="text-xs py-1 px-2"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const statusOptions = [
    { value: '', label: 'All Events' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Events</h1>
        <Link href="/events/new">
          <Button className="flex items-center">
            <PlusIcon className="h-5 w-5 mr-1" />
            Create Event
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-black-400" />
              </div>
              <Input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading events...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table
            columns={columns}
            data={events}
            onRowClick={(row) => router.push(`/events/${row._id}`)}
          />
        </div>
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="mb-4">
          <p>
            Are you sure you want to delete the event{' '}
            <span className="font-bold">{eventToDelete?.name}</span>?
          </p>
          <p className="text-sm text-red-600 mt-2">
            This will also delete all points associated with this event. This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}