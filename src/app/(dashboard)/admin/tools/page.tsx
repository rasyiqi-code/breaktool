'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequireRole } from '@/components/auth/require-role';
import { ToolCard } from '@/components/admin/tool-card';
import { ToolsFilter } from '@/components/admin/tools-filter';
import { ToolDetailsModal } from '@/components/admin/tool-details-modal';
import { ToolEditModal } from '@/components/admin/tool-edit-modal';
import { ToolNotesModal } from '@/components/admin/tool-notes-modal';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download,
  RefreshCw
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

export default function AdminToolsPage() {
  const [tools, setTools] = useState<ToolSubmission[]>([]);
  const [filteredTools, setFilteredTools] = useState<ToolSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  
  // Modal states
  const [selectedTool, setSelectedTool] = useState<ToolSubmission | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);

  const fetchPendingTools = async () => {
    try {
      const response = await fetch('/api/admin/tools');
      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        // Ensure data is an array
        const toolsArray = Array.isArray(data) ? data : (data.tools || []);
        setTools(toolsArray);
        setFilteredTools(toolsArray); // Initialize filteredTools
      }
    } catch (error) {
      console.error('Error fetching tools:', error);
      setTools([]);
      setFilteredTools([]);
    } finally {
      setLoading(false);
    }
  };

  const filterTools = useCallback(() => {
    // Ensure tools is always an array
    let filtered = Array.isArray(tools) ? tools : [];

    if (searchTerm) {
      filtered = filtered.filter(tool => 
        tool.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.submitted_by?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(tool => tool.status === statusFilter);
    }

    setFilteredTools(filtered);
  }, [tools, searchTerm, statusFilter]);

  useEffect(() => {
    fetchPendingTools();
  }, []);

  useEffect(() => {
    filterTools();
  }, [filterTools]);

  const handleStatusChange = async (toolId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/admin/tools/${toolId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setTools(prev => prev.map(tool => 
          tool.id === toolId 
            ? { ...tool, status: newStatus }
            : tool
        ));
      }
    } catch (error) {
      console.error('Error updating tool status:', error);
    }
  };

  const handleViewDetails = (tool: ToolSubmission) => {
    setSelectedTool(tool);
    setDetailsModalOpen(true);
  };

  const handleEdit = (tool: ToolSubmission) => {
    setSelectedTool(tool);
    setEditModalOpen(true);
  };

  const handleAddNotes = (tool: ToolSubmission) => {
    setSelectedTool(tool);
    setNotesModalOpen(true);
  };

  const handleSaveEdit = async (toolId: string, data: { name: string; description: string; website: string; submittedBy: string; category: string }) => {
    try {
      const response = await fetch(`/api/admin/tools/${toolId}/edit`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedTool = await response.json();
        setTools(prev => prev.map(tool => 
          tool.id === toolId ? updatedTool : tool
        ));
        setFilteredTools(prev => prev.map(tool => 
          tool.id === toolId ? updatedTool : tool
        ));
      } else {
        throw new Error('Failed to update tool');
      }
    } catch (error) {
      console.error('Error updating tool:', error);
      throw error;
    }
  };

  const handleSaveNotes = async (toolId: string, notes: string) => {
    try {
      const response = await fetch(`/api/admin/tools/${toolId}/notes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ review_notes: notes }),
      });

      if (response.ok) {
        const updatedTool = await response.json();
        setTools(prev => prev.map(tool => 
          tool.id === toolId ? updatedTool : tool
        ));
        setFilteredTools(prev => prev.map(tool => 
          tool.id === toolId ? updatedTool : tool
        ));
      } else {
        throw new Error('Failed to update notes');
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      throw error;
    }
  };

  const handleDelete = async (toolId: string) => {
    if (confirm('Are you sure you want to delete this tool submission?')) {
      try {
        const response = await fetch(`/api/admin/tools/${toolId}/delete`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setTools(prev => prev.filter(tool => tool.id !== toolId));
          setFilteredTools(prev => prev.filter(tool => tool.id !== toolId));
        } else {
          throw new Error('Failed to delete tool');
        }
      } catch (error) {
        console.error('Error deleting tool:', error);
        alert('Failed to delete tool. Please try again.');
      }
    }
  };

  // Calculate statistics
  const getStatistics = () => {
    const total = tools.length;
    const pending = tools.filter(tool => tool.status === 'pending').length;
    const approved = tools.filter(tool => tool.status === 'approved').length;
    const rejected = tools.filter(tool => tool.status === 'rejected').length;
    
    return { total, pending, approved, rejected };
  };

  // Pagination logic
  const getPaginatedTools = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTools.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredTools.length / itemsPerPage);
  const stats = getStatistics();

  if (loading) {
    return (
          <RequireRole requiredRoles={['admin', 'super_admin']}>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading tools...</p>
          </div>
        </div>
      </div>
    </RequireRole>
    );
  }

  return (
    <RequireRole requiredRoles={['admin', 'super_admin']}>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Tool Management</h1>
            <p className="text-muted-foreground">Review and manage tool submissions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchPendingTools} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tools</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                All submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <p className="text-xs text-muted-foreground">
                Successfully approved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <p className="text-xs text-muted-foreground">
                Rejected submissions
              </p>
            </CardContent>
          </Card>
        </div>

        <ToolsFilter
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(getPaginatedTools()) && getPaginatedTools().map((tool) => (
            <ToolCard 
              key={tool.id} 
              tool={tool} 
              onStatusChange={handleStatusChange}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onAddNotes={handleAddNotes}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {(!Array.isArray(filteredTools) || filteredTools.length === 0) && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              {!Array.isArray(tools) || tools.length === 0 ? (
                <p>No tools found</p>
              ) : (
                <p>No tools match your filters</p>
              )}
            </div>
            {(!Array.isArray(tools) || tools.length === 0) && (
              <Button onClick={fetchPendingTools}>
                Refresh
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTools.length)} of {filteredTools.length} tools
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Modals */}
        <ToolDetailsModal
          tool={selectedTool}
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedTool(null);
          }}
        />

        <ToolEditModal
          tool={selectedTool}
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedTool(null);
          }}
          onSave={handleSaveEdit}
        />

        <ToolNotesModal
          tool={selectedTool}
          isOpen={notesModalOpen}
          onClose={() => {
            setNotesModalOpen(false);
            setSelectedTool(null);
          }}
          onSave={handleSaveNotes}
        />
      </div>
    </RequireRole>
  );
}
