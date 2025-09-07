import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, X } from "lucide-react";

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

interface ToolEditModalProps {
  tool: ToolSubmission | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (toolId: string, data: { name: string; description: string; website: string; submittedBy: string; category: string }) => Promise<void>;
}

const categories = [
  'Productivity',
  'Design',
  'Development',
  'Marketing',
  'Analytics',
  'Communication',
  'Project Management',
  'Finance',
  'HR',
  'Sales',
  'Customer Support',
  'Other'
];

export function ToolEditModal({ tool, isOpen, onClose, onSave }: ToolEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    company: '',
    website_url: '',
    category: ''
  });
  const [loading, setLoading] = useState(false);

  // Update form data when tool changes
  useState(() => {
    if (tool) {
      setFormData({
        name: tool.name || '',
        description: tool.description || '',
        company: tool.company || '',
        website_url: tool.website_url || '',
        category: typeof tool.category === 'string' ? tool.category : tool.category?.name || ''
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tool) return;

    setLoading(true);
    try {
      await onSave(tool.id, {
        name: formData.name,
        description: formData.description,
        website: formData.website_url,
        submittedBy: formData.company,
        category: formData.category
      });
      onClose();
    } catch (error) {
      console.error('Error saving tool:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!tool) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Save className="w-6 h-6" />
            Edit Tool: {tool.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tool Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter tool name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Enter company name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                type="url"
                value={formData.website_url}
                onChange={(e) => handleInputChange('website_url', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter tool description"
              rows={4}
              required
            />
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
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
