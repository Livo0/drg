'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';

export default function NewParticipantPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    tier: 'R3',
    isGlobal: true,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create participant');
      }
      
      router.push('/participants');
    } catch (error) {
      console.error('Error creating participant:', error);
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Participant</h1>
      
      <Card className="max-w-2xl mx-auto">
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
              {isSubmitting ? 'Creating...' : 'Create Participant'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}