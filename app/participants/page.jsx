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

export default function ParticipantsPage() {
  const router = useRouter();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState(null);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (searchQuery) {
        queryParams.append('query', searchQuery);
      }
      
      if (tierFilter) {
        queryParams.append('tier', tierFilter);
      }
      
      const res = await fetch(`/api/participants?${queryParams.toString()}`);
      const data = await res.json();
      setParticipants(data.participants || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [searchQuery, tierFilter]);

  const handleDeleteClick = (participant) => {
    setParticipantToDelete(participant);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await fetch(`/api/participants/${participantToDelete._id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setParticipants(participants.filter(p => p._id !== participantToDelete._id));
        setIsDeleteModalOpen(false);
        setParticipantToDelete(null);
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || 'Failed to delete participant'}`);
      }
    } catch (error) {
      console.error('Error deleting participant:', error);
      alert('An error occurred while deleting the participant');
    }
  };

  const columns = [
    { key: 'username', header: 'Username' },
    { 
      key: 'tier', 
      header: 'Tier',
      render: (row) => (
        <Badge variant="primary">{row.tier}</Badge>
      )
    },
    { 
      key: 'isGlobal', 
      header: 'Global',
      render: (row) => (
        <Badge variant={row.isGlobal ? 'success' : 'default'}>
          {row.isGlobal ? 'Yes' : 'No'}
        </Badge>
      )
    },
    { 
      key: 'createdAt', 
      header: 'Created At',
      render: (row) => new Date(row.createdAt).toLocaleDateString()
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
              router.push(`/participants/${row._id}`);
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

  const tierOptions = [
    { value: '', label: 'All Tiers' },
    { value: 'R1', label: 'R1' },
    { value: 'R2', label: 'R2' },
    { value: 'R3', label: 'R3' },
    { value: 'R4', label: 'R4' },
    { value: 'R5', label: 'R5' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Participants</h1>
        <Link href="/participants/new">
          <Button className="flex items-center">
            <PlusIcon className="h-5 w-5 mr-1" />
            Add Participant
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search participants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <Select
              options={tierOptions}
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading participants...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table
            columns={columns}
            data={participants}
            onRowClick={(row) => router.push(`/participants/${row._id}`)}
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
            Are you sure you want to delete the participant{' '}
            <span className="font-bold">{participantToDelete?.username}</span>?
          </p>
          <p className="text-sm text-red-600 mt-2">
            This action cannot be undone.
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