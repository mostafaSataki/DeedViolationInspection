'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  Eye,
  Play
} from 'lucide-react';
import { DeedForm } from './deed-form';

interface Deed {
  id: string;
  title: string;
  document_type: string;
  has_inquiry_history: boolean;
  inquiry_date: string | null;
  deed_date: string | null;
  uses_tashil_law: boolean;
  inquiry_response_has_issue: boolean;
  text: string;
  analysis_result: string | null;
  analysis_date: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DeedListProps {
  onAnalyzeDeed?: (deedId: string) => void;
  onViewDeed?: (deed: Deed) => void;
}

export function DeedList({ onAnalyzeDeed, onViewDeed }: DeedListProps) {
  const router = useRouter();
  const [deeds, setDeeds] = useState<Deed[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingDeed, setEditingDeed] = useState<Deed | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const fetchDeeds = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/deeds?${params}`);
      if (!response.ok) throw new Error('Failed to fetch deeds');

      const data = await response.json();
      setDeeds(data.deeds);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching deeds:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeeds();
  }, [currentPage, searchTerm]);

  const handleSaveDeed = async (deedData: any) => {
    try {
      const url = deedData.id 
        ? `/api/deeds/${deedData.id}`
        : '/api/deeds';
      
      const method = deedData.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deedData),
      });

      if (!response.ok) throw new Error('Failed to save deed');

      setEditingDeed(null);
      fetchDeeds();
    } catch (error) {
      console.error('Error saving deed:', error);
    }
  };

  const handleDeleteDeed = async (id: string) => {
    if (!confirm('آیا از حذف این سند مطمئن هستید؟')) return;

    try {
      const response = await fetch(`/api/deeds/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete deed');

      fetchDeeds();
    } catch (error) {
      console.error('Error deleting deed:', error);
    }
  };

  const handleAnalyzeDeed = async (id: string) => {
    setAnalyzingId(id);
    try {
      const response = await fetch(`/api/deeds/${id}/analyze`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to analyze deed');

      fetchDeeds();
      if (onAnalyzeDeed) onAnalyzeDeed(id);
    } catch (error) {
      console.error('Error analyzing deed:', error);
    } finally {
      setAnalyzingId(null);
    }
  };

  const getAnalysisIcon = (result: string | null) => {
    if (!result) return <FileText className="w-4 h-4 text-gray-400" />;
    if (result.includes('پایان (تخلفی شناسایی نشد)')) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (result.includes('ارسال به کارتابل تخلف بازرسی')) {
      return <XCircle className="w-4 h-4 text-red-600" />;
    } else {
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getAnalysisVariant = (result: string | null) => {
    if (!result) return 'secondary';
    if (result.includes('پایان (تخلفی شناسایی نشد)')) {
      return 'default';
    } else if (result.includes('ارسال به کارتابل تخلف بازرسی')) {
      return 'destructive';
    } else {
      return 'secondary';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'booklet': return 'دفترچه‌ای';
      case 'electronic': return 'الکترونیکی';
      case 'other': return 'سایر';
      default: return type;
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">مدیریت اسناد</h2>
          <p className="text-gray-600 mt-1">لیست تمام اسناد ثبت شده در سیستم</p>
        </div>
        
        <Button onClick={() => router.push('/new-deed')}>
          <Plus className="w-4 h-4 ml-2" />
          سند جدید
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="جستجو در اسناد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {/* Deeds Table */}
      <Card>
        <CardHeader className="text-right">
          <CardTitle>اسناد</CardTitle>
          <CardDescription>
            {deeds.length} سند یافت شد
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="mr-2">در حال بارگذاری...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">عنوان</TableHead>
                    <TableHead className="text-right">نوع سند</TableHead>
                    <TableHead className="text-right">تاریخ ایجاد</TableHead>
                    <TableHead className="text-right">وضعیت تحلیل</TableHead>
                    <TableHead className="text-right">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deeds.map((deed) => (
                    <TableRow key={deed.id}>
                      <TableCell className="font-medium text-right">
                        <div className="flex items-center gap-2">
                          <span>{deed.title}</span>
                          {getAnalysisIcon(deed.analysis_result)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">
                          {getDocumentTypeLabel(deed.document_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {new Date(deed.createdAt).toLocaleDateString('fa-IR')}
                      </TableCell>
                      <TableCell className="text-right">
                        {deed.analysis_result ? (
                          <Badge variant={getAnalysisVariant(deed.analysis_result)}>
                            {deed.analysis_result.length > 30 
                              ? deed.analysis_result.substring(0, 30) + '...' 
                              : deed.analysis_result
                            }
                          </Badge>
                        ) : (
                          <Badge variant="secondary">تحلیل نشده</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 flex-row-reverse">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewDeed && onViewDeed(deed)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAnalyzeDeed(deed.id)}
                            disabled={analyzingId === deed.id}
                          >
                            {analyzingId === deed.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                          </Button>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingDeed(deed)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DeedForm
                                deed={editingDeed || undefined}
                                onSave={handleSaveDeed}
                                onCancel={() => setEditingDeed(null)}
                              />
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteDeed(deed.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                قبلی
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                بعدی
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}