
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateProperties } from '@/scripts/generateProperties';

const GeneratePropertiesButton: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const properties = await generateProperties();
      if (properties) {
        toast({
          title: "Success",
          description: `Generated ${properties.length} property listings successfully!`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate properties. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={handleGenerate} 
      disabled={isGenerating}
      className="mb-4"
    >
      {isGenerating ? 'Generating...' : 'Generate Sample Properties'}
    </Button>
  );
};

export default GeneratePropertiesButton;
