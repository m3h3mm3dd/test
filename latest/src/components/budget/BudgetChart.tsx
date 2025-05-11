'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';
import Chart from 'chart.js/auto';

interface BudgetChartProps {
  budget: number;
  used: number;
  resources: any[];
}

export function BudgetChart({ budget, used, resources }: BudgetChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const { theme } = useTheme();
  
  // Group resources by type
  const resourcesByType: { [key: string]: number } = resources.reduce((acc, resource) => {
    const type = resource.Type || 'Other';
    const cost = (resource.UnitCost || 0) * (resource.Total || 0);
    acc[type] = (acc[type] || 0) + cost;
    return acc;
  }, {});

  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    
    // Prepare data
    const types = Object.keys(resourcesByType);
    const costs = Object.values(resourcesByType);
    
    // Colors for resource types
    const backgroundColors = [
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 99, 132, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)'
    ];
    
    // Create chart
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Budget Overview'],
        datasets: [
          {
            label: 'Total Budget',
            data: [budget],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            type: 'bar'
          },
          {
            label: 'Used Budget',
            data: [used],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            type: 'bar'
          },
          ...types.map((type, i) => ({
            label: type,
            data: [resourcesByType[type]],
            backgroundColor: backgroundColors[i % backgroundColors.length],
            borderColor: backgroundColors[i % backgroundColors.length].replace('0.7', '1'),
            borderWidth: 1,
            type: 'bar' as const
          }))
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Amount ($)',
              color: theme === 'dark' ? '#fff' : '#333'
            },
            ticks: {
              color: theme === 'dark' ? '#ddd' : '#333'
            },
            grid: {
              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            ticks: {
              color: theme === 'dark' ? '#ddd' : '#333'
            },
            grid: {
              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        plugins: {
          legend: {
            position: 'top' as const,
            labels: {
              color: theme === 'dark' ? '#ddd' : '#333'
            }
          },
          tooltip: {
            backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            titleColor: theme === 'dark' ? '#fff' : '#000',
            bodyColor: theme === 'dark' ? '#ddd' : '#333',
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            borderWidth: 1
          }
        }
      }
    });
    
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [budget, used, resourcesByType, theme]);

  return (
    <div className="w-full h-80">
      <canvas ref={chartRef} />
    </div>
  );
}