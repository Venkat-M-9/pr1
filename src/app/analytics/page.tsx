'use client';

import { useMemo, useState } from 'react';
import PageShell from '@/components/layout/PageShell';
import ChartCard from '@/components/charts/ChartCard';
import FilterBar from '@/components/ui/FilterBar';
import SummaryCard from '@/components/ui/SummaryCard';
import {
  generateRecords,
  aggregateByMonth,
  aggregateByStatus,
  aggregateByCategory,
  aggregateByPriority,
} from '@/lib/mockData';
import { BarChart2, PieChart as PieIcon, TrendingUp, Filter } from 'lucide-react';

export default function AnalyticsPage() {
  const allRecords = useMemo(() => generateRecords(5000), []);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const filteredRecords = useMemo(() => {
    return allRecords.filter(r => {
      if (selectedCategory && r.category !== selectedCategory) return false;
      if (selectedStatus && r.status !== selectedStatus) return false;
      return true;
    });
  }, [allRecords, selectedCategory, selectedStatus]);

  const monthlyTrend = useMemo(() => aggregateByMonth(filteredRecords), [filteredRecords]);
  const statusDist = useMemo(() => aggregateByStatus(filteredRecords), [filteredRecords]);
  const categoryDist = useMemo(() => aggregateByCategory(filteredRecords), [filteredRecords]);
  const priorityDist = useMemo(() => aggregateByPriority(filteredRecords), [filteredRecords]);

  const totalValue = useMemo(() => filteredRecords.reduce((acc, r) => acc + r.value, 0), [filteredRecords]);
  const avgValue = useMemo(
    () => (filteredRecords.length > 0 ? totalValue / filteredRecords.length : 0),
    [filteredRecords, totalValue]
  );

  const filterGroups = [
    {
      id: 'category',
      label: 'Category',
      options: [
        { label: 'Alpha', value: 'alpha' },
        { label: 'Beta', value: 'beta' },
        { label: 'Gamma', value: 'gamma' },
        { label: 'Delta', value: 'delta' },
        { label: 'Epsilon', value: 'epsilon' },
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
        {/* Reusable FilterBar reusing same interaction pattern for Challenge 2 */}
        <FilterBar
          searchQuery=""
          onSearchChange={() => {}}
          searchPlaceholder="Global analytical slice..."
          filters={filterGroups}
          selectedFilters={{ category: selectedCategory, status: selectedStatus }}
          onFilterChange={(id, val) => {
            if (id === 'category') setSelectedCategory(val);
            if (id === 'status') setSelectedStatus(val);
          }}
          onResetFilters={() => {
            setSelectedCategory('');
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
            title="Categories Tracked"
            value={categoryDist.length}
            subtitle="Distinct classifications"
            icon={<PieIcon size={18} />}
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
            title="Category Portfolio Value"
            subtitle="Financial total per category slice"
            data={categoryDist}
            dataKey="value"
            categoryKey="category"
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
            title="Priority Distribution"
            subtitle="Urgency tier concentration"
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
