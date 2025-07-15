'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Utensils } from 'lucide-react';

interface DashboardData {
  totalProperties: number;
  newLeadsThisMonth: number;
  scheduledVisits: number;
  conversionRate: number;
}

const DashboardCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
    </CardHeader>
    <CardContent>
      <div className="h-8 bg-gray-300 rounded w-1/4 mb-2"></div>
      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
    </CardContent>
  </Card>
);

const DashboardCard = ({ title, value, note }: { title: string, value: string, note: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{note}</p>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [propertiesRes, leadsRes, visitsRes] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('leads').select('id, funnel_stage, created_at').eq('user_id', user.id),
        supabase.from('visits').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
      ]);

      if (propertiesRes.error || leadsRes.error || visitsRes.error) {
        toast.error('Erro ao carregar dados do dashboard.');
        console.error('Properties Error:', propertiesRes.error);
        console.error('Leads Error:', leadsRes.error);
        console.error('Visits Error:', visitsRes.error);
        setLoading(false);
        return;
      }

      const totalProperties = propertiesRes.count ?? 0;
      const allLeads = leadsRes.data ?? [];
      const newLeadsThisMonth = allLeads.filter(lead => new Date(lead.created_at) >= new Date(firstDayOfMonth)).length;
      const scheduledVisits = visitsRes.count ?? 0;
      
      const wonLeads = allLeads.filter(lead => lead.funnel_stage === 'Fechado').length;
      const conversionRate = allLeads.length > 0 ? (wonLeads / allLeads.length) * 100 : 0;

      setData({
        totalProperties,
        newLeadsThisMonth,
        scheduledVisits,
        conversionRate,
      });

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading || !data ? (
          <>
            <DashboardCardSkeleton />
            <DashboardCardSkeleton />
            <DashboardCardSkeleton />
            <DashboardCardSkeleton />
          </>
        ) : (
          <>
            <DashboardCard 
              title="Total de Imóveis" 
              value={data.totalProperties.toString()} 
              note="Imóveis cadastrados na plataforma" 
            />
            <DashboardCard 
              title="Novos Leads (Mês)" 
              value={`+${data.newLeadsThisMonth}`} 
              note="Leads recebidos no mês atual" 
            />
            <DashboardCard 
              title="Visitas Agendadas" 
              value={data.scheduledVisits.toString()} 
              note="Total de visitas na agenda" 
            />
            <DashboardCard 
              title="Taxa de Conversão" 
              value={`${data.conversionRate.toFixed(1)}%`} 
              note="De todos os leads" 
            />
          </>
        )}
      </div>
    </div>
  );
}
