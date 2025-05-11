'use client';

import {
  ArrowUpDown,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface RiskTableProps {
  risks: any[];
  onRiskClick: (risk: any) => void;
  userRole: string | null;
}

export function RiskTable({ risks, onRiskClick, userRole }: RiskTableProps) {
  const [sortBy, setSortBy] = useState<string>('severity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortedRisks = () => {
    return [...risks].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.Name?.toLowerCase() || '';
          bValue = b.Name?.toLowerCase() || '';
          break;
        case 'category':
          aValue = a.Category?.toLowerCase() || '';
          bValue = b.Category?.toLowerCase() || '';
          break;
        case 'probability':
          aValue = a.Probability || 0;
          bValue = b.Probability || 0;
          break;
        case 'impact':
          aValue = a.Impact || 0;
          bValue = b.Impact || 0;
          break;
        case 'severity':
          aValue = a.Severity || 0;
          bValue = b.Severity || 0;
          break;
        case 'status':
          aValue = a.Status?.toLowerCase() || '';
          bValue = b.Status?.toLowerCase() || '';
          break;
        case 'date':
          aValue = new Date(a.IdentifiedDate).getTime();
          bValue = new Date(b.IdentifiedDate).getTime();
          break;
        default:
          aValue = a.Severity || 0;
          bValue = b.Severity || 0;
      }
      
      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const getSeverityLabel = (severity: number) => {
    if (severity >= 7) return "Critical";
    if (severity >= 5) return "High";
    if (severity >= 3) return "Medium";
    return "Low";
  };
  
  const getSeverityIcon = (severity: number) => {
    if (severity >= 7) return <XCircle className="h-4 w-4 text-red-500" />;
    if (severity >= 5) return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    if (severity >= 3) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };
  
  const sortedRisks = getSortedRisks();

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-white/5">
            <th className="p-3 text-left border font-medium text-sm">
              <Button
                variant="ghost"
                size="sm"
                className="font-medium"
                onClick={() => handleSort('name')}
              >
                Name <ArrowUpDown className="h-4 w-4" />
              </Button>
            </th>
            <th className="p-3 text-left border font-medium text-sm">
              <Button
                variant="ghost"
                size="sm"
                className="font-medium"
                onClick={() => handleSort('category')}
              >
                Category <ArrowUpDown className="h-4 w-4" />
              </Button>
            </th>
            <th className="p-3 text-center border font-medium text-sm">
              <Button
                variant="ghost"
                size="sm"
                className="font-medium"
                onClick={() => handleSort('probability')}
              >
                Probability <ArrowUpDown className="h-4 w-4" />
              </Button>
            </th>
            <th className="p-3 text-center border font-medium text-sm">
              <Button
                variant="ghost"
                size="sm"
                className="font-medium"
                onClick={() => handleSort('impact')}
              >
                Impact <ArrowUpDown className="h-4 w-4" />
              </Button>
            </th>
            <th className="p-3 text-center border font-medium text-sm">
              <Button
                variant="ghost"
                size="sm"
                className="font-medium"
                onClick={() => handleSort('severity')}
              >
                Severity <ArrowUpDown className="h-4 w-4" />
              </Button>
            </th>
            <th className="p-3 text-center border font-medium text-sm">
              <Button
                variant="ghost"
                size="sm"
                className="font-medium"
                onClick={() => handleSort('status')}
              >
                Status <ArrowUpDown className="h-4 w-4" />
              </Button>
            </th>
            <th className="p-3 text-center border font-medium text-sm">
              <Button
                variant="ghost"
                size="sm"
                className="font-medium"
                onClick={() => handleSort('date')}
              >
                Identified <ArrowUpDown className="h-4 w-4" />
              </Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedRisks.map((risk) => (
            <tr 
              key={risk.Id} 
              className="hover:bg-white/5 cursor-pointer transition-colors"
              onClick={() => onRiskClick(risk)}
            >
              <td className="p-3 border">{risk.Name}</td>
              <td className="p-3 border">{risk.Category}</td>
              <td className="p-3 border text-center">{Math.round(risk.Probability * 100)}%</td>
              <td className="p-3 border text-center">{risk.Impact}/10</td>
              <td className="p-3 border">
                <div className="flex items-center justify-center gap-1">
                  {getSeverityIcon(risk.Severity)}
                  <span>{risk.Severity.toFixed(1)} - {getSeverityLabel(risk.Severity)}</span>
                </div>
              </td>
              <td className="p-3 border text-center">{risk.Status}</td>
              <td className="p-3 border text-center">{format(new Date(risk.IdentifiedDate), 'PP')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}