'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
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
  RefreshCw,
  Zap,
  Grid3X3,
  List,
  ExternalLink
} from "lucide-react";

interface ToolSubmission {
  id: string;
  name: string;
  description: string;
  category: string | { name: string };
  website_url: string;
  logo_url?: string;
  company: string;
  submitted_by: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  review_notes?: string;
  isFromMainTable?: boolean; // Flag to identify if tool is from main Tool table
}

export default function AdminToolsPage() {
  const [tools, setTools] = useState<ToolSubmission[]>([]);
  const [filteredTools, setFilteredTools] = useState<ToolSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  
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
      // Find the tool to get its isFromMainTable flag
      const tool = tools.find(t => t.id === toolId);
      if (!tool) return;

      const response = await fetch(`/api/admin/tools/${toolId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          isFromMainTable: tool.isFromMainTable || false
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.deleted) {
          // Tool was deleted, remove from list
          setTools(prev => prev.filter(t => t.id !== toolId));
          setFilteredTools(prev => prev.filter(t => t.id !== toolId));
        } else if (result.tool) {
          // Tool was approved and created in main table
          const formattedTool = {
            id: result.tool.id,
            name: result.tool.name,
            description: result.tool.description || '',
            category: result.tool.category,
            website_url: result.tool.website || '',
            company: result.tool.submittedBy || 'Unknown',
            submitted_by: result.tool.submittedBy || 'Unknown',
            submitted_at: result.tool.createdAt,
            status: 'approved' as const,
            review_notes: result.tool.description,
            isFromMainTable: true
          };
          
          setTools(prev => prev.map(t => 
            t.id === toolId ? formattedTool : t
          ));
          setFilteredTools(prev => prev.map(t => 
            t.id === toolId ? formattedTool : t
          ));
        } else {
          // Regular status update
          setTools(prev => prev.map(t => 
            t.id === toolId 
              ? { ...t, status: newStatus }
              : t
          ));
          setFilteredTools(prev => prev.map(t => 
            t.id === toolId 
              ? { ...t, status: newStatus }
              : t
          ));
        }
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

  const handleSyncProductHunt = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/admin/sync-product-hunt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ limit: 20 }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Product Hunt Sync Completed!\n\nCreated: ${result.result.created} new tools\nSkipped: ${result.result.skipped} (already exist)\nErrors: ${result.result.errors}`);
        
        // Refresh tools list
        await fetchPendingTools();
      } else {
        const error = await response.json();
        console.error('Sync error details:', error);
        throw new Error(error.error || 'Failed to sync Product Hunt data');
      }
    } catch (error) {
      console.error('Error syncing Product Hunt:', error);
      alert(`Failed to sync Product Hunt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSyncing(false);
    }
  };


  const handleTestProductHunt = async () => {
    try {
      const response = await fetch('/api/admin/test-product-hunt');
      if (response.ok) {
        const result = await response.json();
        console.log('Product Hunt test result:', result);
        
        if (result.success) {
          alert(`Product Hunt API Test: SUCCESS!\n\nConfig:\n- API URL: ${result.config.apiUrl}\n- Has Token: ${result.config.hasToken}\n- Sync Enabled: ${result.config.syncEnabled}\n- Token Length: ${result.config.tokenLength}\n\nTest Data:\n- Status: ${result.testData.status}\n- Posts Count: ${result.testData.postsCount}\n- First Post: ${result.testData.firstPost?.name || 'None'}`);
        } else {
          alert(`Product Hunt API Test: FAILED!\n\nError: ${result.error}\n\nDetails: ${JSON.stringify(result.details, null, 2)}`);
        }
      } else {
        const error = await response.json();
        alert(`Test failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error testing Product Hunt:', error);
      alert(`Test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleSyncProductHunt} 
              disabled={syncing || loading}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Zap className={`w-4 h-4 mr-2 ${syncing ? 'animate-pulse' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Product Hunt'}
            </Button>
            <Button variant="outline" size="sm" onClick={fetchPendingTools} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleTestProductHunt} className="bg-blue-500 hover:bg-blue-600 text-white">
              Test PH API
            </Button>
            
            {/* View Mode Toggle */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('card')}
                className="rounded-r-none border-r"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            
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

        {/* Tools Display */}
        {viewMode === 'card' ? (
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
        ) : (
          <div className="space-y-4">
            {Array.isArray(getPaginatedTools()) && getPaginatedTools().map((tool) => (
              <div key={tool.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {tool.logo_url && (
                      <Image 
                        src={tool.logo_url} 
                        alt={tool.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{tool.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {tool.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <a 
                          href={tool.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Website</span>
                        </a>
                        <span>Submitted by: {tool.submitted_by}</span>
                        <span>Date: {new Date(tool.submitted_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tool.status === 'approved' ? 'bg-green-100 text-green-800' :
                      tool.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {tool.status}
                    </span>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(tool)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(tool)}
                      >
                        Edit
                      </Button>
                      {tool.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(tool.id, 'approved')}
                            className="text-green-600 hover:text-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(tool.id, 'rejected')}
                            className="text-red-600 hover:text-red-700"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
