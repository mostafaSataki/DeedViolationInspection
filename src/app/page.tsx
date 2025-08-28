'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeedList } from '@/components/deed-list';
import { DeedDetail } from '@/components/deed-detail';
import { FileText, Database, BarChart3 } from 'lucide-react';

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

interface Stats {
  totalDeeds: number;
  analyzedDeeds: number;
  violations: number;
}

export default function Home() {
  const [selectedDeed, setSelectedDeed] = useState<Deed | null>(null);
  const [analyzingDeedId, setAnalyzingDeedId] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({ totalDeeds: 0, analyzedDeeds: 0, violations: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/deeds');
        if (!response.ok) throw new Error('Failed to fetch deeds');
        
        const data = await response.json();
        const deeds = data.deeds;
        
        const totalDeeds = deeds.length;
        const analyzedDeeds = deeds.filter((deed: Deed) => deed.analysis_result !== null).length;
        const violations = deeds.filter((deed: Deed) => 
          deed.analysis_result && deed.analysis_result.includes('ارسال به کارتابل تخلف بازرسی')
        ).length;
        
        setStats({ totalDeeds, analyzedDeeds, violations });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const handleViewDeed = (deed: Deed) => {
    setSelectedDeed(deed);
  };

  const handleAnalyzeDeed = (deedId: string) => {
    setAnalyzingDeedId(deedId);
  };

  const handleAnalyzeFromDetail = async () => {
    if (!selectedDeed) return;
    
    setAnalyzingDeedId(selectedDeed.id);
    try {
      const response = await fetch(`/api/deeds/${selectedDeed.id}/analyze`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to analyze deed');

      const data = await response.json();
      setSelectedDeed(data.deed);
      
      // Refresh stats after analysis
      const statsResponse = await fetch('/api/deeds');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        const deeds = statsData.deeds;
        
        const totalDeeds = deeds.length;
        const analyzedDeeds = deeds.filter((deed: Deed) => deed.analysis_result !== null).length;
        const violations = deeds.filter((deed: Deed) => 
          deed.analysis_result && deed.analysis_result.includes('ارسال به کارتابل تخلف بازرسی')
        ).length;
        
        setStats({ totalDeeds, analyzedDeeds, violations });
      }
    } catch (error) {
      console.error('Error analyzing deed:', error);
    } finally {
      setAnalyzingDeedId(null);
    }
  };

  const handleEditFromDetail = () => {
    setSelectedDeed(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              سیستم تحلیل اسناد ملکی
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-justify leading-relaxed">
            این سیستم با استفاده از هوش مصنوعی، اسناد ملکی را تحلیل کرده و تخلفات احتمالی را بر اساس فلوچارت تعیین شده شناسایی می‌کند.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="text-right" dir="rtl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">کل اسناد</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="text-right">
              <div className="text-2xl font-bold">
                {loadingStats ? (
                  <div className="w-8 h-6 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  stats.totalDeeds
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                اسناد ثبت شده
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-right" dir="rtl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">تحلیل شده</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="text-right">
              <div className="text-2xl font-bold">
                {loadingStats ? (
                  <div className="w-8 h-6 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  stats.analyzedDeeds
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                اسناد تحلیل شده
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-right" dir="rtl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">تخلفات</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="text-right">
              <div className="text-2xl font-bold">
                {loadingStats ? (
                  <div className="w-8 h-6 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  stats.violations
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                تخلفات شناسایی شده
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="deeds" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deeds" className="text-right">مدیریت اسناد</TabsTrigger>
            <TabsTrigger value="analysis" className="text-right">تحلیل سریع</TabsTrigger>
          </TabsList>
          
          <TabsContent value="deeds" className="mt-6">
            <DeedList 
              onAnalyzeDeed={handleAnalyzeDeed}
              onViewDeed={handleViewDeed}
            />
          </TabsContent>
          
          <TabsContent value="analysis" className="mt-6">
            <Card className="text-right" dir="rtl">
              <CardHeader className="text-right">
                <CardTitle>تحلیل سریع سند</CardTitle>
                <CardDescription>
                  برای تحلیل یک سند بدون ذخیره در پایگاه داده، از این بخش استفاده کنید
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-justify leading-relaxed max-w-md mx-auto">
                    این بخش در حال توسعه است. لطفاً از بخش "مدیریت اسناد" برای تحلیل اسناد استفاده کنید.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Deed Detail Modal */}
        {selectedDeed && (
          <DeedDetail
            deed={selectedDeed}
            onClose={() => setSelectedDeed(null)}
            onAnalyze={handleAnalyzeFromDetail}
            onEdit={handleEditFromDetail}
            analyzing={analyzingDeedId === selectedDeed.id}
          />
        )}
      </div>
    </div>
  );
}