'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, X } from 'lucide-react';

interface DeedFormData {
  id?: string;
  title: string;
  document_type: string;
  has_inquiry_history: boolean;
  inquiry_date: string;
  deed_date: string;
  uses_tashil_law: boolean;
  inquiry_response_has_issue: boolean;
  text: string;
}

interface DeedFormProps {
  deed?: DeedFormData;
  onSave: (deed: DeedFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function DeedForm({ deed, onSave, onCancel, loading = false }: DeedFormProps) {
  const [formData, setFormData] = useState<DeedFormData>({
    id: deed?.id,
    title: deed?.title || '',
    document_type: deed?.document_type || '',
    has_inquiry_history: deed?.has_inquiry_history || false,
    inquiry_date: deed?.inquiry_date || '',
    deed_date: deed?.deed_date || '',
    uses_tashil_law: deed?.uses_tashil_law || false,
    inquiry_response_has_issue: deed?.inquiry_response_has_issue || false,
    text: deed?.text || '',
  });

  const handleInputChange = (field: keyof DeedFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {deed?.id ? 'ویرایش سند' : 'سند جدید'}
        </CardTitle>
        <CardDescription>
          {deed?.id 
            ? 'اطلاعات سند را ویرایش کنید'
            : 'اطلاعات سند جدید را وارد کنید'
          }
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
          <div className="grid grid-cols-2 gap-4">
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
            <Label htmlFor="text">متن سند</Label>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <Textarea
                id="text"
                placeholder="متن کامل سند را اینجا وارد کنید..."
                value={formData.text}
                onChange={(e) => handleInputChange('text', e.target.value)}
                rows={20}
                className="resize-none text-lg leading-relaxed bg-transparent border-none p-0 focus:ring-0"
                required
                style={{ minHeight: '400px' }}
              />
            </div>
            <div className="text-xs text-gray-400">
              تعداد کاراکترها: {formData.text.length}
            </div>
          </div>

          {/* Action Buttons */}
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
                  ذخیره
                </>
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
            >
              <X className="w-4 h-4 ml-2" />
              انصراف
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}