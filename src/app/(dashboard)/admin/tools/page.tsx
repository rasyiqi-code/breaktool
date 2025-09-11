'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  ChevronDown,
  Grid3X3,
  List,
  Trash2,
  ChevronRight,
  ChevronUp
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [showSyncDropdown, setShowSyncDropdown] = useState(false);
  const [showSingleProductModal, setShowSingleProductModal] = useState(false);
  const [singleProductUrl, setSingleProductUrl] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  
  // Bulk selection states
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  // Modal states
  const [selectedTool, setSelectedTool] = useState<ToolSubmission | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  
  // Expand/collapse states for list view
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());
  
  // Ref for sync dropdown button
  const syncButtonRef = useRef<HTMLButtonElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSyncDropdown) {
        const target = event.target as Element;
        if (!target.closest('.sync-dropdown')) {
          setShowSyncDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSyncDropdown]);

  // Update dropdown position on scroll/resize
  useEffect(() => {
    if (showSyncDropdown) {
      const handleScroll = () => {
        // Force re-render to update position
        setShowSyncDropdown(prev => prev);
      };

      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [showSyncDropdown]);

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

  const toggleToolExpansion = (toolId: string) => {
    setExpandedTools(prev => {
      const newSet = new Set(prev);
      if (newSet.has(toolId)) {
        newSet.delete(toolId);
      } else {
        newSet.add(toolId);
      }
      return newSet;
    });
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

  const handleSyncProductHunt = async (options: {
    forceSync?: boolean;
    updateExisting?: boolean;
    syncOldData?: boolean;
    syncByDate?: boolean;
    syncSingleProduct?: boolean;
    productUrl?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  } = {}) => {
    setSyncing(true);
    try {
      const response = await fetch('/api/admin/sync-product-hunt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          limit: options.limit || 20,
          forceSync: options.forceSync || false,
          updateExisting: options.updateExisting || false,
          syncOldData: options.syncOldData || false,
          syncByDate: options.syncByDate || false,
          syncSingleProduct: options.syncSingleProduct || false,
          productUrl: options.productUrl,
          startDate: options.startDate,
          endDate: options.endDate
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const message = options.syncOldData 
          ? `Old Data Sync Completed!\n\nUpdated: ${result.result.created} tools with categories\nSkipped: ${result.result.skipped} (no changes needed)\nErrors: ${result.result.errors}`
          : `Product Hunt Sync Completed!\n\nCreated: ${result.result.created} new tools\nSkipped: ${result.result.skipped} (already exist)\nErrors: ${result.result.errors}`;
        
        alert(message);
        
        // Refresh tools list
        await fetchPendingTools();
      } else {
        let errorMessage = 'Failed to sync Product Hunt data';
        try {
          const errorData = await response.json();
          console.error('Sync error details:', errorData);
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch {
          // If response is not JSON, try to get text
          try {
            const errorText = await response.text();
            console.error('Sync error text:', errorText);
            errorMessage = errorText || errorMessage;
          } catch {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error syncing Product Hunt:', error);
      alert(`Failed to sync Product Hunt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncSingleProduct = async () => {
    if (!singleProductUrl.trim()) {
      alert('Please enter a Product Hunt URL');
      return;
    }

    setSyncing(true);
    try {
      await handleSyncProductHunt({
        syncSingleProduct: true,
        productUrl: singleProductUrl.trim()
      });
      setShowSingleProductModal(false);
      setSingleProductUrl('');
    } catch (error) {
      console.error('Error syncing single product:', error);
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

  // Bulk selection functions
  const handleSelectTool = (toolId: string, checked: boolean) => {
    setSelectedTools(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(toolId);
      } else {
        newSet.delete(toolId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allToolIds = getPaginatedTools().map(tool => tool.id);
      setSelectedTools(new Set(allToolIds));
    } else {
      setSelectedTools(new Set());
    }
  };

  const isAllSelected = () => {
    const paginatedTools = getPaginatedTools();
    return paginatedTools.length > 0 && paginatedTools.every(tool => selectedTools.has(tool.id));
  };

  const isIndeterminate = () => {
    const paginatedTools = getPaginatedTools();
    const selectedCount = paginatedTools.filter(tool => selectedTools.has(tool.id)).length;
    return selectedCount > 0 && selectedCount < paginatedTools.length;
  };

  // Bulk action functions
  const handleBulkApprove = async () => {
    if (selectedTools.size === 0) return;
    
    const confirmMessage = `Are you sure you want to approve ${selectedTools.size} tool(s)?`;
    if (!confirm(confirmMessage)) return;

    setBulkActionLoading(true);
    try {
      const response = await fetch('/api/admin/tools/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve',
          toolIds: Array.from(selectedTools)
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully approved ${result.approved} tool(s)`);
        
        // Refresh tools list
        await fetchPendingTools();
        setSelectedTools(new Set());
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve tools');
      }
    } catch (error) {
      console.error('Error bulk approving tools:', error);
      alert(`Failed to approve tools: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedTools.size === 0) return;
    
    const confirmMessage = `Are you sure you want to reject ${selectedTools.size} tool(s)?`;
    if (!confirm(confirmMessage)) return;

    setBulkActionLoading(true);
    try {
      const response = await fetch('/api/admin/tools/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject',
          toolIds: Array.from(selectedTools)
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully rejected ${result.rejected} tool(s)`);
        
        // Refresh tools list
        await fetchPendingTools();
        setSelectedTools(new Set());
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject tools');
      }
    } catch (error) {
      console.error('Error bulk rejecting tools:', error);
      alert(`Failed to reject tools: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkRemove = async () => {
    if (selectedTools.size === 0) return;
    
    const confirmMessage = `Are you sure you want to remove ${selectedTools.size} tool(s) from the tools list?`;
    if (!confirm(confirmMessage)) return;

    setBulkActionLoading(true);
    try {
      const response = await fetch('/api/admin/tools/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'remove',
          toolIds: Array.from(selectedTools)
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully removed ${result.removed} tool(s)`);
        
        // Refresh tools list
        await fetchPendingTools();
        setSelectedTools(new Set());
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove tools');
      }
    } catch (error) {
      console.error('Error bulk removing tools:', error);
      alert(`Failed to remove tools: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setBulkActionLoading(false);
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
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
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
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header Section - Mobile First */}
        <div className="mb-4 sm:mb-6">
          <div className="mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Tool Management</h1>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base">Review and manage tool submissions</p>
          </div>
          
          {/* Action Buttons with Horizontal Scroll on Mobile */}
          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 min-w-max pb-2 -mx-1 px-1">
            {/* Product Hunt Sync Dropdown */}
            <div className="relative sync-dropdown">
              <Button 
                ref={syncButtonRef}
                variant="default" 
                size="sm" 
                disabled={syncing || loading}
                className="bg-orange-500 hover:bg-orange-600 whitespace-nowrap flex-shrink-0"
                onClick={() => setShowSyncDropdown(!showSyncDropdown)}
              >
                <Zap className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${syncing ? 'animate-pulse' : ''}`} />
                <span className="hidden xs:inline">{syncing ? 'Syncing...' : 'Sync Product Hunt'}</span>
                <span className="xs:hidden">{syncing ? 'Sync...' : 'Sync'}</span>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              </Button>
              
              {showSyncDropdown && (
                <div className="fixed inset-0 z-50">
                  {/* Backdrop */}
                  <div 
                    className="absolute inset-0 bg-black bg-opacity-25"
                    onClick={() => setShowSyncDropdown(false)}
                  />
                  {/* Dropdown */}
                  <div 
                    className="absolute w-64 sm:w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                  <div className="py-1">
                    <button
                      className="w-full text-left px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        console.log('Normal Sync clicked - starting...');
                        setShowSyncDropdown(false);
                        handleSyncProductHunt({ limit: 20 });
                      }}
                    >
                      <div className="font-medium">Normal Sync</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Add new tools (skip existing)</div>
                    </button>
                    
                    <button
                      className="w-full text-left px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        console.log('Force Sync clicked - starting...');
                        setShowSyncDropdown(false);
                        handleSyncProductHunt({ forceSync: true, limit: 20 });
                      }}
                    >
                      <div className="font-medium">Force Sync</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Add all tools (including duplicates)</div>
                    </button>
                    
                    <button
                      className="w-full text-left px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Update Existing clicked');
                        setShowSyncDropdown(false);
                        await handleSyncProductHunt({ updateExisting: true, limit: 20 });
                      }}
                    >
                      <div className="font-medium">Update Existing</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Update existing tools with new data</div>
                    </button>
                    
                    <div className="border-t border-gray-200"></div>
                    
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Sync Today\'s Products clicked');
                        const today = new Date().toISOString().split('T')[0];
                        setShowSyncDropdown(false);
                        await handleSyncProductHunt({ 
                          syncByDate: true, 
                          startDate: today,
                        });
                      }}
                    >
                      <div className="font-medium">Sync Today&apos;s Products</div>
                      <div className="text-xs text-gray-500">Get products launched today</div>
                    </button>
                    
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Sync Yesterday\'s Products clicked');
                        const today = new Date();
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        const yesterdayStr = yesterday.toISOString().split('T')[0];
                        const todayStr = today.toISOString().split('T')[0];
                        
                        setShowSyncDropdown(false);
                        await handleSyncProductHunt({ 
                          syncByDate: true, 
                          startDate: yesterdayStr,
                          endDate: todayStr,
                        });
                      }}
                    >
                      <div className="font-medium">Sync Yesterday&apos;s Products</div>
                      <div className="text-xs text-gray-500">Get products launched yesterday</div>
                    </button>
                    
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Sync This Week\'s Products clicked');
                        const today = new Date();
                        const weekAgo = new Date(today);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        const weekAgoStr = weekAgo.toISOString().split('T')[0];
                        const todayStr = today.toISOString().split('T')[0];
                        
                        setShowSyncDropdown(false);
                        await handleSyncProductHunt({ 
                          syncByDate: true, 
                          startDate: weekAgoStr,
                          endDate: todayStr,
                        });
                      }}
                    >
                      <div className="font-medium">Sync This Week&apos;s Products</div>
                      <div className="text-xs text-gray-500">Get products from last 7 days</div>
                    </button>
                    
                    <div className="border-t border-gray-200"></div>
                    
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Single Product clicked');
                        setShowSingleProductModal(true);
                        setShowSyncDropdown(false);
                      }}
                    >
                      <div className="font-medium">Sync Single Product</div>
                      <div className="text-xs text-gray-500">Add specific product by URL</div>
                    </button>
                    
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Sync Old Data clicked');
                        setShowSyncDropdown(false);
                        await handleSyncProductHunt({ syncOldData: true });
                      }}
                    >
                      <div className="font-medium">Sync Old Data</div>
                      <div className="text-xs text-gray-500">Add categories to existing tools</div>
                    </button>
                  </div>
                  </div>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={fetchPendingTools} disabled={loading} className="whitespace-nowrap flex-shrink-0">
              <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">Refresh</span>
              <span className="xs:hidden">↻</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleTestProductHunt} className="bg-blue-500 hover:bg-blue-600 text-white whitespace-nowrap flex-shrink-0">
              <span className="hidden xs:inline">Test PH API</span>
              <span className="xs:hidden">Test</span>
            </Button>
            
            {/* View Mode Toggle */}
            <div className="flex border rounded-md flex-shrink-0">
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('card')}
                className="rounded-r-none border-r px-2 sm:px-3"
              >
                <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none px-2 sm:px-3"
              >
                <List className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
            
            <Button variant="outline" size="sm" className="whitespace-nowrap flex-shrink-0">
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Export</span>
              <span className="xs:hidden">↓</span>
            </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards - Mobile First */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          <Card className="p-3 sm:p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Tools</CardTitle>
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-1 sm:pt-2">
              <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                All submissions
              </p>
            </CardContent>
          </Card>

          <Card className="p-3 sm:p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Pending</CardTitle>
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
            </CardHeader>
            <CardContent className="pt-1 sm:pt-2">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card className="p-3 sm:p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            </CardHeader>
            <CardContent className="pt-1 sm:pt-2">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{stats.approved}</div>
              <p className="text-xs text-muted-foreground">
                Successfully approved
              </p>
            </CardContent>
          </Card>

          <Card className="p-3 sm:p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
            </CardHeader>
            <CardContent className="pt-1 sm:pt-2">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">{stats.rejected}</div>
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

        {/* Bulk Actions - Mobile Responsive */}
        {selectedTools.size > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {selectedTools.size} tool(s) selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTools(new Set())}
                  className="text-blue-600 hover:text-blue-700 w-fit"
                >
                  Clear Selection
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkApprove}
                  disabled={bulkActionLoading}
                  className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkReject}
                  disabled={bulkActionLoading}
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkRemove}
                  disabled={bulkActionLoading}
                  className="text-orange-600 hover:text-orange-700 border-orange-200 hover:border-orange-300"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove All
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tools Display */}
        {viewMode === 'card' ? (
          <div>
            {/* Select All Header - Mobile Responsive */}
            {getPaginatedTools().length > 0 && (
              <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Checkbox
                  checked={isAllSelected()}
                  onCheckedChange={handleSelectAll}
                  ref={(el) => {
                    if (el && 'indeterminate' in el) {
                      (el as HTMLInputElement).indeterminate = isIndeterminate();
                    }
                  }}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select All ({getPaginatedTools().length} tools on this page)
                </span>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {Array.isArray(getPaginatedTools()) && getPaginatedTools().map((tool) => (
                <ToolCard 
                  key={tool.id} 
                  tool={tool} 
                  onStatusChange={handleStatusChange}
                  onViewDetails={handleViewDetails}
                  onEdit={handleEdit}
                  onAddNotes={handleAddNotes}
                  onDelete={handleDelete}
                  isSelected={selectedTools.has(tool.id)}
                  onSelect={(checked) => handleSelectTool(tool.id, checked)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div>
            {/* Select All Header for List View - Mobile Responsive */}
            {getPaginatedTools().length > 0 && (
              <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Checkbox
                  checked={isAllSelected()}
                  onCheckedChange={handleSelectAll}
                  ref={(el) => {
                    if (el && 'indeterminate' in el) {
                      (el as HTMLInputElement).indeterminate = isIndeterminate();
                    }
                  }}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select All ({getPaginatedTools().length} tools on this page)
                </span>
              </div>
            )}
            
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {Array.isArray(getPaginatedTools()) && getPaginatedTools().map((tool) => {
                const isExpanded = expandedTools.has(tool.id);
                return (
                  <div key={tool.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={selectedTools.has(tool.id)}
                          onCheckedChange={(checked) => handleSelectTool(tool.id, checked as boolean)}
                          className="mt-1 flex-shrink-0"
                        />
                        {tool.logo_url && (
                          <Image 
                            src={tool.logo_url} 
                            alt={tool.name}
                            width={48}
                            height={48}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base md:text-lg truncate">{tool.name}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit flex-shrink-0 ${
                                tool.status === 'approved' ? 'bg-green-100 text-green-800' :
                                tool.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {tool.status}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(tool)}
                                className="h-6 px-2 text-xs"
                              >
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(tool)}
                                className="h-6 px-2 text-xs"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleToolExpansion(tool.id)}
                                className="p-1 h-6 w-6 flex-shrink-0"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          

                          {/* Expanded info - only visible when expanded */}
                          {isExpanded && (
                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div className="space-y-2 text-xs sm:text-sm">
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">Category:</span>
                                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                                    {typeof tool.category === 'string' ? tool.category : tool.category?.name || 'Unknown'}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">Company:</span>
                                  <span className="ml-2 text-gray-600 dark:text-gray-400">{tool.company}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">Website URL:</span>
                                  <a 
                                    href={tool.website_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="ml-2 text-blue-600 hover:text-blue-700 underline break-all"
                                  >
                                    {tool.website_url}
                                  </a>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">Submitted by:</span>
                                  <span className="ml-2 text-gray-600 dark:text-gray-400">{tool.submitted_by}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">Date:</span>
                                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                                    {new Date(tool.submitted_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">Full Description:</span>
                                  <p className="mt-1 text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {tool.description}
                                  </p>
                                </div>
                                {tool.review_notes && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Review Notes:</span>
                                    <p className="mt-1 text-gray-600 dark:text-gray-400 leading-relaxed">
                                      {tool.review_notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {tool.status === 'pending' && (
                        <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
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
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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

        {/* Pagination - Mobile Responsive */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-3 sm:gap-4 mt-4 sm:mt-6 md:mt-8">
            <div className="text-xs sm:text-sm text-muted-foreground text-center">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTools.length)} of {filteredTools.length} tools
            </div>
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="text-xs px-2 sm:px-3"
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">‹</span>
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 sm:w-9 sm:h-9 p-0 text-xs sm:text-sm"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 3 && (
                  <>
                    <span className="text-xs text-muted-foreground px-1">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-8 h-8 sm:w-9 sm:h-9 p-0 text-xs sm:text-sm"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="text-xs px-2 sm:px-3"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">›</span>
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

        {/* Single Product Sync Modal - Mobile Responsive */}
        {showSingleProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md shadow-xl mx-2">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Sync Single Product from Product Hunt
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Hunt URL
                  </label>
                  <input
                    type="url"
                    value={singleProductUrl}
                    onChange={(e) => setSingleProductUrl(e.target.value)}
                    placeholder="https://www.producthunt.com/posts/example-product"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter the full Product Hunt URL or just the slug
                  </p>
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSingleProductModal(false);
                      setSingleProductUrl('');
                    }}
                    disabled={syncing}
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSyncSingleProduct}
                    disabled={syncing || !singleProductUrl.trim()}
                    className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
                  >
                    {syncing ? 'Syncing...' : 'Sync Product'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireRole>
  );
}