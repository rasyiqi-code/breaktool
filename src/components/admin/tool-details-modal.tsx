import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  User, 
  ExternalLink, 
  Calendar,
  FileText,
  Globe
} from "lucide-react";

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

interface ToolDetailsModalProps {
  tool: ToolSubmission | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ToolDetailsModal({ tool, isOpen, onClose }: ToolDetailsModalProps) {
  if (!tool) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            Tool Details: {tool.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              {getStatusBadge(tool.status)}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Tool Name</label>
                <p className="text-sm">{tool.name}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Company</label>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm">{tool.company}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <Badge variant="outline">
                  {typeof tool.category === 'string' ? tool.category : tool.category?.name || 'Unknown'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Website</label>
                {tool.website_url ? (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={tool.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {tool.website_url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No website provided</p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{tool.description}</p>
            </div>
          </div>

          {/* Submission Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Submission Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Submitted By</label>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm">{tool.submitted_by}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Submitted At</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm">{formatDate(tool.submitted_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Review Notes */}
          {tool.review_notes && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Review Notes</label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{tool.review_notes}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {tool.website_url && (
              <Button asChild>
                <a href={tool.website_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Website
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
