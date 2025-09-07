'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@stackframe/stack';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RequireRole } from '@/components/auth/require-role';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Building, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  FileText,
  X,
  User,
  Link
} from 'lucide-react';
import Image from 'next/image';

interface ClaimableTool {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  logoUrl: string | null;
  category: { name: string } | null;
  submittedBy: string | null;
  createdAt: string;
  hasPendingClaim: boolean;
  existingClaim: {
    id: string;
    status: string;
    createdAt: string;
  } | null;
}

interface OwnershipClaim {
  id: string;
  tool: {
    id: string;
    name: string;
    website: string | null;
    logoUrl: string | null;
  };
  claimType: string;
  companyName: string | null;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewNotes: string | null;
}

export default function ClaimOwnershipPage() {
  const user = useUser();
  const [tools, setTools] = useState<ClaimableTool[]>([]);
  const [claims, setClaims] = useState<OwnershipClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTool, setSelectedTool] = useState<ClaimableTool | null>(null);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Claim form state
  const [claimType, setClaimType] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [businessRegistration, setBusinessRegistration] = useState('');
  const [proofOfOwnership, setProofOfOwnership] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Only fetch claims, not tools
      const claimsResponse = await fetch('/api/vendor/claim-ownership');

      if (claimsResponse.ok) {
        const claimsData = await claimsResponse.json();
        setClaims(claimsData.claims || []);
      } else {
        const errorText = await claimsResponse.text();
        console.error('Failed to load claims:', errorText);
        
        if (claimsResponse.status === 401) {
          setError('Please log in to access this page');
        } else if (claimsResponse.status === 403) {
          setError('Vendor access required. Please contact admin to get vendor permissions.');
        } else {
          setError('Failed to load claims. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async (searchQuery: string = searchTerm) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vendor/claimable-tools-simple?search=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setTools(data.tools || []);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to search tools');
      }
    } catch (error) {
      console.error('Error searching tools:', error);
      setError('Failed to search tools');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // Debounced search - only search when user types
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch(searchTerm);
      } else {
        // Clear tools when search is empty
        setTools([]);
        setError(null);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, handleSearch]);

  const handleClaimTool = (tool: ClaimableTool) => {
    setSelectedTool(tool);
    setContactEmail(user?.primaryEmail || '');
    setShowClaimForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleSubmitClaim = async () => {
    if (!selectedTool) return;

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch('/api/vendor/claim-ownership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId: selectedTool.id,
          claimType,
          companyName,
          contactEmail,
          contactPhone,
          website,
          businessRegistration,
          proofOfOwnership,
          additionalInfo
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Ownership claim submitted successfully!');
        setShowClaimForm(false);
        setSelectedTool(null);
        // Reset form
        setClaimType('');
        setCompanyName('');
        setContactPhone('');
        setWebsite('');
        setBusinessRegistration('');
        setProofOfOwnership('');
        setAdditionalInfo('');
        // Refresh data
        await fetchData();
      } else {
        setError(data.error || 'Failed to submit claim');
      }
    } catch (error) {
      console.error('Error submitting claim:', error);
      setError('Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading && !searchTerm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RequireRole requiredRoles={['vendor', 'admin', 'super_admin']}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground dark:text-white">Claim Tool Ownership</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-2">
            Claim ownership of tools that you own or represent
          </p>
        </div>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for tools to claim... (live search)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Type to search for tools you want to claim ownership of. Results will appear automatically.
            </p>
          </CardContent>
        </Card>

        {/* My Claims */}
        {claims.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                My Ownership Claims
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {claims.map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {claim.tool.logoUrl && (
                        <Image
                          src={claim.tool.logoUrl}
                          alt={claim.tool.name}
                          width={40}
                          height={40}
                          className="rounded-lg"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold">{claim.tool.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {claim.claimType} • {claim.companyName || 'No company name'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Submitted: {new Date(claim.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(claim.status)}
                      {claim.reviewNotes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {claim.reviewNotes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Search Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tools.length === 0 && !searchTerm ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Search for Tools</h3>
                <p className="text-muted-foreground">
                  Use the search box above to find tools you want to claim ownership of.
                </p>
              </div>
            ) : tools.length === 0 && searchTerm ? (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tools found</h3>
                <p className="text-muted-foreground">
                  No tools match your search for &quot;{searchTerm}&quot;. Try different keywords.
                </p>
              </div>
            ) : loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Searching for tools...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((tool) => (
                  <div key={tool.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-start space-x-3">
                      {tool.logoUrl && (
                        <Image
                          src={tool.logoUrl}
                          alt={tool.name}
                          width={48}
                          height={48}
                          className="rounded-lg"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{tool.name}</h3>
                        {tool.category && (
                          <Badge variant="outline" className="text-xs mb-2">
                            {tool.category.name}
                          </Badge>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {tool.description}
                        </p>
                        {tool.website && (
                          <a
                            href={tool.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Visit Website
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      {tool.hasPendingClaim ? (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Claim Pending
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleClaimTool(tool)}
                          className="w-full"
                        >
                          Claim Ownership
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Claim Form Modal */}
        {showClaimForm && selectedTool && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-3xl max-h-[95vh] overflow-y-auto shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
              <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-secondary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary" />
                      Claim Ownership: {selectedTool.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Provide your details to claim ownership of this tool
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowClaimForm(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                {/* Tool Info */}
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border">
                  {selectedTool.logoUrl && (
                    <Image
                      src={selectedTool.logoUrl}
                      alt={selectedTool.name}
                      width={48}
                      height={48}
                      className="rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{selectedTool.name}</h3>
                    {selectedTool.category && (
                      <Badge variant="outline" className="text-xs">
                        {selectedTool.category.name}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                  {/* Claim Type & Company Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="claimType" className="text-sm font-medium">
                        Claim Type <span className="text-red-500">*</span>
                      </Label>
                      <Select value={claimType} onValueChange={setClaimType}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select claim type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              Owner
                            </div>
                          </SelectItem>
                          <SelectItem value="representative">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Representative
                            </div>
                          </SelectItem>
                          <SelectItem value="affiliate">
                            <div className="flex items-center gap-2">
                              <Link className="h-4 w-4" />
                              Affiliate
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyName" className="text-sm font-medium">
                        Company Name
                      </Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Your company name"
                        className="h-11"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail" className="text-sm font-medium">
                        Contact Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPhone" className="text-sm font-medium">
                        Contact Phone
                      </Label>
                      <Input
                        id="contactPhone"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="h-11"
                      />
                    </div>
                  </div>

                  {/* Website & Business Registration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-sm font-medium">
                        Company Website
                      </Label>
                      <Input
                        id="website"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://yourcompany.com"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessRegistration" className="text-sm font-medium">
                        Business Registration
                      </Label>
                      <Input
                        id="businessRegistration"
                        value={businessRegistration}
                        onChange={(e) => setBusinessRegistration(e.target.value)}
                        placeholder="Business registration number"
                        className="h-11"
                      />
                    </div>
                  </div>

                  {/* Proof of Ownership */}
                  <div className="space-y-2">
                    <Label htmlFor="proofOfOwnership" className="text-sm font-medium">
                      Proof of Ownership (URL)
                    </Label>
                    <Input
                      id="proofOfOwnership"
                      value={proofOfOwnership}
                      onChange={(e) => setProofOfOwnership(e.target.value)}
                      placeholder="Link to proof document or website"
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Provide a link to documentation that proves your ownership or relationship to this tool
                    </p>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-2">
                    <Label htmlFor="additionalInfo" className="text-sm font-medium">
                      Additional Information
                    </Label>
                    <Textarea
                      id="additionalInfo"
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      placeholder="Any additional information to support your claim..."
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Provide any additional context or information that supports your ownership claim
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowClaimForm(false)}
                    disabled={submitting}
                    className="h-11 px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitClaim}
                    disabled={submitting || !claimType || !contactEmail}
                    className="h-11 px-6"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Submit Claim
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </RequireRole>
  );
}
