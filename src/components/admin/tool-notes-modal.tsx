import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, MessageSquare, X } from "lucide-react";

interface ToolSubmission {
  id: string;
  name: string;
  description: string;
  category: string | { name: string };
  website_url: string;
  company: string;
  submitted_by: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  review_notes?: string;
}

interface ToolNotesModalProps {
  tool: ToolSubmission | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (toolId: string, notes: string) => Promise<void>;
}

export function ToolNotesModal({ tool, isOpen, onClose, onSave }: ToolNotesModalProps) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Update notes when tool changes
  useState(() => {
    if (tool) {
      setNotes(tool.review_notes || '');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tool) return;

    setLoading(true);
    try {
      await onSave(tool.id, notes);
      onClose();
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!tool) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6" />
            Review Notes: {tool.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="notes">Review Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your review notes here..."
              rows={8}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              Add any notes, comments, or feedback about this tool submission.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MessageSquare className="w-4 h-4 mr-2" />
              )}
              Save Notes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
