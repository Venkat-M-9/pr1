'use client';

import { useMemo, useState } from 'react';
import PageShell from '@/components/layout/PageShell';
import ChartCard from '@/components/charts/ChartCard';
import FilterBar from '@/components/ui/FilterBar';
import SummaryCard from '@/components/ui/SummaryCard';
import { useDataContext } from '@/context/DataContext';
import {
  aggregateByMonth,
  aggregateByStatus,
  aggregateByPriority,
} from '@/lib/mockData';
import { BarChart2, PieChart as PieIcon, TrendingUp, Filter, AlertTriangle } from 'lucide-react';

export default function AnalyticsPage() {
  const { records: allRecords } = useDataContext();

  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const filteredRecords = useMemo(() => {
    return allRecords.filter(r => {
      if (selectedPriority && r.priority !== selectedPriority) return false;
      if (selectedStatus && r.status !== selectedStatus) return false;
      return true;
    });
  }, [allRecords, selectedPriority, selectedStatus]);

  const monthlyTrend = useMemo(() => aggregateByMonth(filteredRecords), [filteredRecords]);
  const statusDist = useMemo(() => aggregateByStatus(filteredRecords), [filteredRecords]);
  const priorityDist = useMemo(() => aggregateByPriority(filteredRecords), [filteredRecords]);

  const totalValue = useMemo(() => filteredRecords.reduce((acc, r) => acc + r.value, 0), [filteredRecords]);
  const avgValue = useMemo(
    () => (filteredRecords.length > 0 ? totalValue / filteredRecords.length : 0),
    [filteredRecords, totalValue]
  );

  const highValCount = useMemo(
    () => filteredRecords.filter(r => r.priority === 'critical' || r.priority === 'high').length,
    [filteredRecords]
  );

  const filterGroups = [
    {
      id: 'priority',
      label: 'Priority',
      options: [
        { label: 'Low (<$25k)', value: 'low' },
        { label: 'Medium ($25k-$50k)', value: 'medium' },
        { label: 'High ($50k-$75k)', value: 'high' },
        { label: 'Critical ($75k+)', value: 'critical' },
      ],
    },
    {
      id: 'status',
      label: 'Status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Pending', value: 'pending' },
        { label: 'Archived', value: 'archived' },
      ],
    },
  ];

  return (
    <PageShell
      title="Analytics & Insights"
      description="Visual metrics aggregated live from the 5,000 record dataset."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Analytics' }]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Reusable FilterBar reusing same interaction pattern */}
        <FilterBar
          searchQuery=""
          onSearchChange={() => {}}
          searchPlaceholder="Global analytical slice..."
          filters={filterGroups}
          selectedFilters={{ priority: selectedPriority, status: selectedStatus }}
          onFilterChange={(id, val) => {
            if (id === 'priority') setSelectedPriority(val);
            if (id === 'status') setSelectedStatus(val);
          }}
          onResetFilters={() => {
            setSelectedPriority('');
            setSelectedStatus('');
          }}
        />

        {/* Summary Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <SummaryCard
            title="Analyzed Records"
            value={filteredRecords.length.toLocaleString()}
            subtitle="Matching active slice"
            icon={<Filter size={18} />}
          />
          <SummaryCard
            title="Total Volume Value"
            value={`$${(totalValue / 1000000).toFixed(2)}M`}
            subtitle="Cumulative value"
            icon={<TrendingUp size={18} />}
          />
          <SummaryCard
            title="Average Record Value"
            value={`$${Math.round(avgValue).toLocaleString()}`}
            subtitle="Per item average"
            icon={<BarChart2 size={18} />}
          />
          <SummaryCard
            title="High / Critical Records"
            value={highValCount.toLocaleString()}
            subtitle="Financial evaluation >= $50k"
            icon={<AlertTriangle size={18} color="#c5221f" />}
          />
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
          <ChartCard
            title="Monthly Creation Volume"
            subtitle="Aggregated record count over time"
            data={monthlyTrend}
            dataKey="count"
            categoryKey="month"
            type="line"
          />
          <ChartCard
            title="Monthly Portfolio Value ($)"
            subtitle="Financial total cumulative per month"
            data={monthlyTrend}
            dataKey="value"
            categoryKey="month"
            type="bar"
          />
          <ChartCard
            title="Status Proportion"
            subtitle="Operational breakdown"
            data={statusDist}
            dataKey="count"
            categoryKey="status"
            type="pie"
          />
          <ChartCard
            title="Money-Based Priority Breakdown"
            subtitle="Urgency tier concentration derived from valuation"
            data={priorityDist}
            dataKey="count"
            categoryKey="priority"
            type="bar"
          />
        </div>
      </div>
    </PageShell>
  );
}
