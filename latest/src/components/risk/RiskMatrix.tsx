'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface RiskMatrixProps {
  risks: any[];
  onRiskClick: (risk: any) => void;
}

export function RiskMatrix({ risks, onRiskClick }: RiskMatrixProps) {
  // Group risks by probability and impact
  const riskMatrix = useMemo(() => {
    const matrix: { [key: string]: any[] } = {};
    
    // Initialize the matrix
    for (let p = 10; p >= 1; p--) {
      for (let i = 1; i <= 10; i++) {
        const key = `P${p}-I${i}`;
        matrix[key] = [];
      }
    }
    
    // Fill the matrix with risks
    risks.forEach(risk => {
      const p = Math.round(risk.Probability * 10);
      const i = risk.Impact;
      const key = `P${p}-I${i}`;
      
      if (matrix[key]) {
        matrix[key].push(risk);
      }
    });
    
    return matrix;
  }, [risks]);

  // Get color for a cell based on severity
  const getCellColor = (p: number, i: number) => {
    const severity = (p / 10) * i;
    
    if (severity >= 7) return 'bg-red-100 dark:bg-red-900';
    if (severity >= 5) return 'bg-orange-100 dark:bg-orange-900';
    if (severity >= 3) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-green-100 dark:bg-green-900';
  };
  
  // Get text color for a cell based on severity
  const getCellTextColor = (p: number, i: number) => {
    const severity = (p / 10) * i;
    
    if (severity >= 7) return 'text-red-800 dark:text-red-100';
    if (severity >= 5) return 'text-orange-800 dark:text-orange-100';
    if (severity >= 3) return 'text-yellow-800 dark:text-yellow-100';
    return 'text-green-800 dark:text-green-100';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 border text-center text-sm font-medium">Probability / Impact</th>
            {Array.from({ length: 10 }, (_, i) => i + 1).map(i => (
              <th key={i} className="p-2 border text-center text-sm font-medium">
                {i}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }, (_, i) => 10 - i).map(p => (
            <tr key={p}>
              <th className="p-2 border text-center text-sm font-medium">
                {p * 10}%
              </th>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(i => {
                const key = `P${p}-I${i}`;
                const cellRisks = riskMatrix[key] || [];
                
                return (
                  <td
                    key={i}
                    className={`p-0 border ${getCellColor(p, i)} hover:opacity-90 transition-opacity`}
                  >
                    <div className="relative min-h-16 min-w-16 p-2">
                      {cellRisks.length > 0 ? (
                        <div className="flex flex-col items-center justify-center h-full">
                          {cellRisks.slice(0, 3).map((risk, idx) => (
                            <motion.button
                              key={risk.Id}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`mb-1 px-2 py-1 rounded-md text-xs font-medium ${getCellTextColor(p, i)} hover:bg-white/10`}
                              onClick={() => onRiskClick(risk)}
                            >
                              {risk.Name.length > 15 ? `${risk.Name.substring(0, 15)}...` : risk.Name}
                            </motion.button>
                          ))}
                          {cellRisks.length > 3 && (
                            <span className={`text-xs font-medium ${getCellTextColor(p, i)}`}>
                              +{cellRisks.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-xs text-gray-500">-</span>
                        </div>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="mt-6 flex items-center justify-center space-x-6">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-100 dark:bg-green-900 mr-2" />
          <span className="text-sm">Low Risk (1-3)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900 mr-2" />
          <span className="text-sm">Medium Risk (3-5)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-orange-100 dark:bg-orange-900 mr-2" />
          <span className="text-sm">High Risk (5-7)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-100 dark:bg-red-900 mr-2" />
          <span className="text-sm">Critical Risk (7-10)</span>
        </div>
      </div>
    </div>
  );
}