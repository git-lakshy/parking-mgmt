import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ParkingSlot } from '@/types/parking';
import { AlertTriangle } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: ParkingSlot | null;
  onSubmitReport: (slotId: string, reporterName: string, message: string) => void;
}

export const ReportModal = ({ isOpen, onClose, slot, onSubmitReport }: ReportModalProps) => {
  const [reporterName, setReporterName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!slot || !reporterName.trim() || !message.trim()) return;

    setIsSubmitting(true);
    
    try {
      onSubmitReport(slot.id, reporterName, message);
      
      // Reset form
      setReporterName('');
      setMessage('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReporterName('');
    setMessage('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="enterprise-card border-card-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Report Parking Spot
          </DialogTitle>
          <DialogDescription>
            Report an issue with this parking spot for administrator review.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-foreground-secondary">
              Report an issue with parking spot <span className="font-semibold text-foreground">{slot?.number}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reporterName" className="text-sm font-medium text-foreground">
              Your Name
            </Label>
            <Input
              id="reporterName"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              placeholder="Enter your name"
              className="enterprise-card"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium text-foreground">
              Issue Description
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the issue with this parking spot..."
              className="enterprise-card min-h-[100px]"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button"
              variant="secondary" 
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="default"
              className="flex-1 bg-warning hover:bg-warning/90"
              disabled={isSubmitting || !reporterName.trim() || !message.trim()}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};