'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Calendar,
  Edit,
  Play,
  AlertCircle,
  X
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

interface DeedDetailProps {
  deed: Deed;
  onClose: () => void;
  onAnalyze?: () => void;
  onEdit?: () => void;
  analyzing?: boolean;
}

export function DeedDetail({ 
  deed, 
  onClose, 
  onAnalyze, 
  onEdit, 
  analyzing = false 
}: DeedDetailProps) {
  const [showFullText, setShowFullText] = useState(false);

  const getAnalysisIcon = (result: string | null) => {
    if (!result) return <FileText className="w-6 h-6 text-gray-400" />;
    if (result.includes('پایان (تخلفی شناسایی نشد)')) {
      return <CheckCircle className="w-6 h-6 text-green-600" />;
    } else if (result.includes('ارسال به کارتابل تخلف بازرسی')) {
      return <XCircle className="w-6 h-6 text-red-600" />;
    } else {
      return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{deed.title}</h2>
              <p className="text-gray-600 mt-1">جزئیات سند</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">اطلاعات پایه</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">نوع سند</p>
                    <Badge variant="outline" className="mt-1">
                      {getDocumentTypeLabel(deed.document_type)}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">تاریخ ایجاد</p>
                    <p className="font-medium">{formatDate(deed.createdAt)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">تاریخ به‌روزرسانی</p>
                    <p className="font-medium">{formatDate(deed.updatedAt)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">تاریخ استعلام</p>
                    <p className="font-medium">{formatDate(deed.inquiry_date)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">تاریخ تنظیم سند</p>
                    <p className="font-medium">{formatDate(deed.deed_date)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">وضعیت‌ها</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">سابقه استعلام</span>
                    <Badge variant={deed.has_inquiry_history ? "default" : "secondary"}>
                      {deed.has_inquiry_history ? 'دارد' : 'ندارد'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">قانون تسهیل</span>
                    <Badge variant={deed.uses_tashil_law ? "default" : "secondary"}>
                      {deed.uses_tashil_law ? 'استفاده شده' : 'استفاده نشده'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ایراد در استعلام</span>
                    <Badge variant={deed.inquiry_response_has_issue ? "destructive" : "default"}>
                      {deed.inquiry_response_has_issue ? 'دارد' : 'ندارد'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={onAnalyze}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <>
                      <div className="w-4 h-4 ml-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      در حال تحلیل...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 ml-2" />
                      تحلیل سند
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={onEdit}
                >
                  <Edit className="w-4 h-4 ml-2" />
                  ویرایش سند
                </Button>
              </div>
            </div>

            {/* Content and Analysis */}
            <div className="lg:col-span-2 space-y-4">
              {/* Analysis Result */}
              {deed.analysis_result && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getAnalysisIcon(deed.analysis_result)}
                      نتیجه تحلیل
                    </CardTitle>
                    {deed.analysis_date && (
                      <CardDescription>
                        تاریخ تحلیل: {formatDate(deed.analysis_date)}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Badge variant={getAnalysisVariant(deed.analysis_result)} className="text-sm">
                        {deed.analysis_result}
                      </Badge>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 text-sm text-gray-700">
                          توضیح نتیجه:
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {deed.analysis_result.includes('پایان (تخلفی شناسایی نشد)') && (
                            'سند مورد بررسی هیچ‌گونه تخلفی ندارد و符合 تمام شرایط قانونی می‌باشد.'
                          )}
                          {deed.analysis_result.includes('نوع سند غیر دفترچه‌ای') && (
                            'سند از نوع دفترچه‌ای نیست و باید به کارتابل تخلف بازرسی ارسال شود.'
                          )}
                          {deed.analysis_result.includes('تعهدات تضامنی قانون تسهیل') && (
                            'در سند، تعهدات تضامنی طرفین مطابق قانون تسهیل قید نشده است.'
                          )}
                          {deed.analysis_result.includes('کاربری مسکونی') && (
                            'از متن سند استنباط می‌شود که ملک دارای کاربری مسکونی یا عرصه و اعیان می‌باشد.'
                          )}
                          {deed.analysis_result.includes('ایراد در پاسخ استعلام') && (
                            'در پاسخ استعلام از مرجع قابل قبول، ایراد وجود دارد.'
                          )}
                          {deed.analysis_result.includes('مشروط بودن معامله') && (
                            'معامله به شرایطی در آینده موکول شده است.'
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Deed Text */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">متن سند</CardTitle>
                  <CardDescription>
                    متن کامل سند ملکی
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-6 rounded-lg border">
                    <div className="max-h-96 overflow-y-auto">
                      <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                        {showFullText ? deed.text : truncateText(deed.text, 1000)}
                      </p>
                    </div>
                    
                    {deed.text.length > 1000 && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setShowFullText(!showFullText)}
                        className="mt-4 p-0 h-auto"
                      >
                        {showFullText ? 'نمایش کمتر' : 'نمایش بیشتر'}
                      </Button>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    تعداد کاراکترها: {deed.text.length}
                  </div>
                </CardContent>
              </Card>

              {!deed.analysis_result && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    این سند هنوز تحلیل نشده است. برای تحلیل سند و شناسایی تخلفات احتمالی، روی دکمه "تحلیل سند" کلیک کنید.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}