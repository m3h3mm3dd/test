import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, UserPlus, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';

interface AddMemberDialogProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onMemberAdded: () => void;
}

export function AddMemberDialog({ 
  projectId, 
  isOpen, 
  onClose,
  onMemberAdded
}: AddMemberDialogProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle form submission
  const handleSubmit = () => {
    // Basic validation
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!firstName) {
      setError('First name is required');
      return;
    }

    // Simulate form submission
    setIsSubmitting(true);
    setError('');

    setTimeout(() => {
      try {
        // Create unique ID for the local member
        const memberId = `local-${Date.now()}`;

        // Get existing project members from localStorage
        const storageKey = 'projectMembers';
        const storedMembersJSON = localStorage.getItem(storageKey);
        const allProjectMembers = storedMembersJSON ? JSON.parse(storedMembersJSON) : {};
        
        // Get members for this specific project
        const projectMembers = allProjectMembers[projectId] || [];
        
        // Check if member with this email already exists
        const memberExists = projectMembers.some(
          (member) => member.email && member.email.toLowerCase() === email.toLowerCase()
        );
        
        if (memberExists) {
          setError('A member with this email already exists');
          setIsSubmitting(false);
          return;
        }
        
        // Add new member
        const newMember = {
          id: memberId,
          email: email,
          User: {
            FirstName: firstName,
            LastName: lastName,
            Email: email,
            Id: memberId
          },
          UserId: memberId,
          Role: 'Member',
          ProjectId: projectId
        };
        
        // Update localStorage
        allProjectMembers[projectId] = [...projectMembers, newMember];
        localStorage.setItem(storageKey, JSON.stringify(allProjectMembers));
        
        // Success
        toast.success('Team member added successfully');
        onMemberAdded();
        onClose();
      } catch (error) {
        console.error('Error adding member:', error);
        setError('Failed to add member. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }, 600); // Simulate network delay
  };

  // Reset form when dialog opens
  const handleReset = () => {
    setEmail('');
    setFirstName('');
    setLastName('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-card rounded-lg border shadow-lg w-full max-w-md overflow-hidden"
        onAnimationStart={handleReset}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <UserPlus className="h-5 w-5 mr-2 text-primary" />
            Add Team Member
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="user@example.com"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="John"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Doe"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Add Member
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}