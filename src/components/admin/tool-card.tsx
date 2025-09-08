import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  Building,
  User,
  Eye,
  Edit,
  MessageSquare,
  Trash2,
  Calendar,
  Globe,
  FileText
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
  isFromMainTable?: boolean; // Flag to identify if tool is from main Tool table
}

interface ToolCardProps {
  tool: ToolSubmission;
  onStatusChange: (toolId: string, status: 'approved' | 'rejected') => void;
  onViewDetails?: (tool: ToolSubmission) => void;
  onEdit?: (tool: ToolSubmission) => void;
  onAddNotes?: (tool: ToolSubmission) => void;
  onDelete?: (toolId: string) => void;
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
}

export function ToolCard({ 
  tool, 
  onStatusChange, 
  onViewDetails, 
  onEdit, 
  onAddNotes, 
  onDelete,
  isSelected = false,
  onSelect
}: ToolCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <Card className={`group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 hover:from-white hover:to-blue-50/30 ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {onSelect && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={onSelect}
                  className="mr-2"
                />
              )}
              {(tool as { logo_url?: string }).logo_url ? (
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted relative">
                  <Image
                    src={(tool as { logo_url?: string }).logo_url || ''}
                    alt={`${tool.name} logo`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
              )}
              <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {tool.name}
              </CardTitle>
            </div>
            <CardDescription className="line-clamp-2 text-sm text-gray-600 leading-relaxed">
              {tool.description}
            </CardDescription>
          </div>
          <div className="ml-3">
            {getStatusBadge(tool.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tool Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg p-2">
            <Building className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-gray-700">{tool.company}</span>
          </div>
          <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg p-2">
            <User className="w-4 h-4 text-green-600" />
            <span className="text-gray-700">{tool.submitted_by}</span>
          </div>
          <div className="flex items-center gap-2 text-xs bg-gray-50 rounded-lg p-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="text-gray-600">Submitted: {formatDate(tool.submitted_at)}</span>
          </div>
        </div>

        {/* Category and Website */}
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
          >
            {typeof tool.category === 'string' ? tool.category : tool.category?.name || 'Unknown'}
          </Badge>
          {tool.website_url && (
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
            >
              <a href={tool.website_url} target="_blank" rel="noopener noreferrer">
                <Globe className="w-4 h-4 mr-1" />
                Visit
              </a>
            </Button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {onViewDetails && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onViewDetails(tool)}
              className="bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-700 transition-all duration-200"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
          )}
          
          {onEdit && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onEdit(tool)}
              className="bg-white hover:bg-green-50 border-gray-200 hover:border-green-300 text-gray-700 hover:text-green-700 transition-all duration-200"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
          
          {onAddNotes && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onAddNotes(tool)}
              className="bg-white hover:bg-purple-50 border-gray-200 hover:border-purple-300 text-gray-700 hover:text-purple-700 transition-all duration-200"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Notes
            </Button>
          )}
          
          {onDelete && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onDelete(tool.id)}
              className="bg-white hover:bg-red-50 border-gray-200 hover:border-red-300 text-gray-700 hover:text-red-700 transition-all duration-200"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          )}
        </div>

        {/* Status Change Buttons */}
        {tool.status === 'pending' && (
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <Button 
              size="sm" 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
              onClick={() => onStatusChange(tool.id, 'approved')}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
              onClick={() => onStatusChange(tool.id, 'rejected')}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </Button>
          </div>
        )}

        {/* Remove Button for Approved Tools from Main Table */}
        {tool.status === 'approved' && tool.isFromMainTable && (
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <Button 
              size="sm" 
              variant="destructive" 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
              onClick={() => onStatusChange(tool.id, 'rejected')}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Remove from Tools
            </Button>
          </div>
        )}

        {tool.review_notes && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Review Notes</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{tool.review_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
