
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useShortlists } from '@/hooks/useShortlists';

interface ShortlistSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
}

const ShortlistSelectionModal: React.FC<ShortlistSelectionModalProps> = ({
  isOpen,
  onClose,
  propertyId
}) => {
  const { shortlists, createShortlist, addPropertyToShortlist } = useShortlists();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newShortlistName, setNewShortlistName] = useState('');
  const [newShortlistDescription, setNewShortlistDescription] = useState('');

  const handleSelectShortlist = async (shortlistId: string) => {
    await addPropertyToShortlist(shortlistId, propertyId);
    onClose();
  };

  const handleCreateAndAdd = async () => {
    if (!newShortlistName.trim()) return;
    
    const newShortlist = await createShortlist(newShortlistName, newShortlistDescription);
    if (newShortlist) {
      await addPropertyToShortlist(newShortlist.id, propertyId);
      setNewShortlistName('');
      setNewShortlistDescription('');
      setShowCreateForm(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Favourites</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!showCreateForm ? (
            <>
              <div className="space-y-2">
                <h3 className="font-medium">Select a favourites list:</h3>
                {shortlists.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {shortlists.map((shortlist) => (
                      <button
                        key={shortlist.id}
                        onClick={() => handleSelectShortlist(shortlist.id)}
                        className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="font-medium">{shortlist.name}</div>
                        {shortlist.description && (
                          <div className="text-sm text-gray-600">{shortlist.description}</div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No favourites lists yet</p>
                )}
              </div>
              
              <Button
                onClick={() => setShowCreateForm(true)}
                variant="outline"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Favourites List
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium">Create New Favourites List:</h3>
              <div className="space-y-3">
                <Input
                  placeholder="Favourites list name"
                  value={newShortlistName}
                  onChange={(e) => setNewShortlistName(e.target.value)}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={newShortlistDescription}
                  onChange={(e) => setNewShortlistDescription(e.target.value)}
                  rows={3}
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleCreateAndAdd}
                    disabled={!newShortlistName.trim()}
                  >
                    Create & Add
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewShortlistName('');
                      setNewShortlistDescription('');
                    }}
                  >
                    Back
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShortlistSelectionModal;
