'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, Save, Loader2, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';

interface DeedFormData {
  title: string;
  document_type: string;
  has_inquiry_history: boolean;
  inquiry_date: string;
  deed_date: string;
  uses_tashil_law: boolean;
  inquiry_response_has_issue: boolean;
  text: string;
}

export default function NewDeedPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<DeedFormData>({
    title: '',
    document_type: '',
    has_inquiry_history: false,
    inquiry_date: '',
    deed_date: '',
    uses_tashil_law: false,
    inquiry_response_has_issue: false,
    text: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (field: keyof DeedFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/deeds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create deed');
      }

      const deed = await response.json();
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">سند جدید</h1>
            <p className="text-gray-600 mt-1">ایجاد سند ملکی جدید در سیستم</p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            بازگشت به لیست
          </Button>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات سند</CardTitle>
            <CardDescription>
              لطفاً اطلاعات مربوط به سند ملکی را وارد کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">عنوان سند</Label>
                <Input
                  id="title"
                  placeholder="عنوان سند را وارد کنید"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>

              {/* Document Type */}
              <div className="space-y-2">
                <Label htmlFor="document_type">نوع سند</Label>
                <Select
                  value={formData.document_type}
                  onValueChange={(value) => handleInputChange('document_type', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="نوع سند را انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="booklet">دفترچه‌ای</SelectItem>
                    <SelectItem value="electronic">الکترونیکی</SelectItem>
                    <SelectItem value="other">سایر</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inquiry_date">تاریخ استعلام</Label>
                  <Input
                    id="inquiry_date"
                    type="date"
                    value={formData.inquiry_date}
                    onChange={(e) => handleInputChange('inquiry_date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deed_date">تاریخ تنظیم سند</Label>
                  <Input
                    id="deed_date"
                    type="date"
                    value={formData.deed_date}
                    onChange={(e) => handleInputChange('deed_date', e.target.value)}
                  />
                </div>
              </div>

              {/* Switches */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="has_inquiry_history">سابقه استعلام دارد</Label>
                  <Switch
                    id="has_inquiry_history"
                    checked={formData.has_inquiry_history}
                    onCheckedChange={(checked) => handleInputChange('has_inquiry_history', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="uses_tashil_law">استفاده از قانون تسهیل</Label>
                  <Switch
                    id="uses_tashil_law"
                    checked={formData.uses_tashil_law}
                    onCheckedChange={(checked) => handleInputChange('uses_tashil_law', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="inquiry_response_has_issue">ایراد در پاسخ استعلام</Label>
                  <Switch
                    id="inquiry_response_has_issue"
                    checked={formData.inquiry_response_has_issue}
                    onCheckedChange={(checked) => handleInputChange('inquiry_response_has_issue', checked)}
                  />
                </div>
              </div>

              {/* Deed Text */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="text">متن سند</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-8 px-2"
                  >
                    {isExpanded ? (
                      <>
                        <Minimize2 className="w-4 h-4 ml-1" />
                        کوچک کردن
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-4 h-4 ml-1" />
                        بزرگنمایی
                      </>
                    )}
                  </Button>
                </div>
                <div className={`bg-gray-50 p-4 rounded-lg border transition-all duration-300 ${
                  isExpanded ? 'fixed inset-4 z-50 m-0' : ''
                }`}>
                  <Textarea
                    id="text"
                    placeholder="متن کامل سند را اینجا وارد کنید..."
                    value={formData.text}
                    onChange={(e) => handleInputChange('text', e.target.value)}
                    rows={isExpanded ? 40 : 30}
                    className={`resize-none text-lg leading-relaxed bg-transparent border-none p-0 focus:ring-0 ${
                      isExpanded ? 'h-full' : ''
                    }`}
                    required
                    style={{ 
                      minHeight: isExpanded ? 'calc(100vh - 200px)' : '600px' 
                    }}
                  />
                  {isExpanded && (
                    <div className="absolute top-4 left-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsExpanded(false)}
                      >
                        <Minimize2 className="w-4 h-4 ml-1" />
                        بستن
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p>
                    لطفاً متن کامل سند را با دقت وارد کنید. این متن برای تحلیل هوش مصنوعی استفاده خواهد شد.
                  </p>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  تعداد کاراکترها: {formData.text.length}
                </div>
              </div>

              {/* Error */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={loading || !formData.title || !formData.document_type || !formData.text}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      در حال ذخیره...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 ml-2" />
                      ذخیره سند
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push('/')}
                  disabled={loading}
                >
                  انصراف
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}