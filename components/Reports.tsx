import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SavedBill, Contractor, CalculatedDeductions, Contract, AuditLog, AuthUser } from '../types';
import { ChevronDownIcon, ChevronRightIcon, PrintIcon, DownloadIcon, CurrencyRupeeIcon } from './Icons';
import * as Papa from 'papaparse';
import { LOGO_URL } from '../constants';

interface ReportsProps {
  savedBills: SavedBill[];
  contractors: Contractor[];
  contracts: Contract[];
  auditLogs: AuditLog[];
  currentUser: AuthUser;
}

type ReportTab = 'details' | 'contractor' | 'contract' | 'monthly' | 'statement' | 'station' | 'deductions' | 'audit' | 'taxSummary';

interface StatementData {
  contractorName: string;
  period: { start: string; end: string };
  bills: SavedBill[];
  summary: {
    grandTotal: number;
    netAmount: number;
    totalDeductions: number;
    deductions: CalculatedDeductions;
  }
}

const Reports: React.FC<ReportsProps> = ({ savedBills, contractors, contracts, auditLogs, currentUser }) => {
  const [activeTab, setActiveTab] = useState<ReportTab>('details');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Filters
  const [selectedContractorId, setSelectedContractorId] = useState<string>('all');
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('all');
  
  // Statement State
  const [statementData, setStatementData] = useState<StatementData | null>(null);
  const reportPrintRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const isAdmin = currentUser.role === 'Admin';

  const routesForFilter = useMemo(() => {
    const routeSet = new Set<string>();
    const relevantContracts = selectedContractorId === 'all'
      ? contracts
      : contracts.filter(c => c.contractor_id === Number(selectedContractorId));
      
    relevantContracts.forEach(c => {
      routeSet.add(`${c.from_location} -> ${c.to_location}`);
    });
    return Array.from(routeSet).sort();
  }, [contracts, selectedContractorId]);

  useEffect(() => {
    if (!routesForFilter.includes(selectedRoute)) {
      setSelectedRoute('all');
    }
  }, [routesForFilter, selectedRoute]);

  const filteredBills = useMemo(() => {
    return savedBills
      .filter(bill => {
        const contractorMatch = selectedContractorId === 'all' || bill.contractor_id === Number(selectedContractorId);
        const searchMatch = !searchQuery || bill.bill_number.toLowerCase().includes(searchQuery.toLowerCase());
        const dateMatch = (!startDate || bill.bill_date >= startDate) && (!endDate || bill.bill_date <= endDate);
        const routeMatch = selectedRoute === 'all' || bill.bill_items.some(item => {
            if (selectedRoute === 'all') return true;
            const contract = contracts.find(c => c.contract_id === item.contract_id);
            if (!contract) return false;
            const routeStr = `${contract.from_location} -> ${contract.to_location}`;
            return routeStr === selectedRoute;
        });
        return contractorMatch && searchMatch && dateMatch && routeMatch;
      })
      .sort((a, b) => new Date(b.bill_date).getTime() - new Date(a.bill_date).getTime());
  }, [savedBills, contracts, selectedContractorId, searchQuery, startDate, endDate, selectedRoute]);
  
  const filteredAuditLogs = useMemo(() => {
    return auditLogs
      .filter(log => {
        const actionMatch = auditActionFilter === 'all' || log.action === auditActionFilter;
        const searchMatch = !searchQuery || log.username.toLowerCase().includes(searchQuery.toLowerCase()) || log.action.toLowerCase().includes(searchQuery.toLowerCase());
        const dateMatch = (!startDate || log.timestamp >= startDate) && (!endDate || new Date(log.timestamp) <= new Date(endDate + 'T23:59:59.999Z'));
        return actionMatch && searchMatch && dateMatch;
      });
  }, [auditLogs, auditActionFilter, searchQuery, startDate, endDate]);

  const uniqueAuditActions = useMemo(() => [...new Set(auditLogs.map(log => log.action))].sort(), [auditLogs]);
  
  const summary = useMemo(() => {
    return filteredBills.reduce((acc, bill) => {
      acc.totalAmount += bill.grandTotal;
      acc.totalDeductions += bill.totalDeductions;
      acc.netAmount += bill.netAmount;
      return acc;
    }, { totalAmount: 0, totalDeductions: 0, netAmount: 0 });
  }, [filteredBills]);

  const contractorSummary = useMemo(() => {
      const summaryMap = new Map<number, { name: string; totalBills: number; grandTotal: number; totalDeductions: number; netAmount: number }>();
      filteredBills.forEach(bill => {
          if (!bill.contractor_id) return;
          if (!summaryMap.has(bill.contractor_id)) {
              summaryMap.set(bill.contractor_id, { name: bill.contractor_name, totalBills: 0, grandTotal: 0, totalDeductions: 0, netAmount: 0 });
          }
          const current = summaryMap.get(bill.contractor_id)!;
          current.totalBills += 1;
          current.grandTotal += bill.grandTotal;
          current.totalDeductions += bill.totalDeductions;
          current.netAmount += bill.netAmount;
      });
      return Array.from(summaryMap.values()).sort((a,b) => b.netAmount - a.netAmount);
  }, [filteredBills]);

  const contractSummary = useMemo(() => {
    const summaryMap = new Map<number, {
        contract: Contract;
        totalTrips: number;
        totalNetKgs: number;
        totalAmount: number;
        billIds: Set<string>;
    }>();

    filteredBills.forEach(bill => {
        bill.bill_items.forEach(item => {
            if (item.contract_id) {
                const contract = contracts.find(c => c.contract_id === item.contract_id);
                if (contract) {
                    if (!summaryMap.has(contract.contract_id)) {
                        summaryMap.set(contract.contract_id, {
                            contract,
                            totalTrips: 0,
                            totalNetKgs: 0,
                            totalAmount: 0,
                            billIds: new Set<string>(),
                        });
                    }
                    const current = summaryMap.get(contract.contract_id)!;
                    current.totalTrips += 1;
                    current.totalNetKgs += item.netKgs;
                    current.totalAmount += item.rs;
                    current.billIds.add(bill.id);
                }
            }
        });
    });

    return Array.from(summaryMap.values()).sort((a,b) => b.totalAmount - a.totalAmount);
  }, [filteredBills, contracts]);


  const monthlySummary = useMemo(() => {
    const summaryMap = new Map<string, { month: string; totalBills: number; grandTotal: number; totalDeductions: number; netAmount: number }>();
    filteredBills.forEach(bill => {
        const month = bill.bill_date.substring(0, 7); // YYYY-MM
        if (!summaryMap.has(month)) {
            summaryMap.set(month, { month, totalBills: 0, grandTotal: 0, totalDeductions: 0, netAmount: 0 });
        }
        const current = summaryMap.get(month)!;
        current.totalBills += 1;
        current.grandTotal += bill.grandTotal;
        current.totalDeductions += bill.totalDeductions;
        current.netAmount += bill.netAmount;
    });
    return Array.from(summaryMap.values()).sort((a, b) => b.month.localeCompare(a.month));
  }, [filteredBills]);

  // Add the return statement with JSX for the component UI
  return (
    <div className="space-y-6">
      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button onClick={() => setActiveTab('details')} className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'details' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}>Detailed Report</button>
          </li>
          <li className="mr-2">
            <button onClick={() => setActiveTab('contractor')} className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'contractor' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}>By Contractor</button>
          </li>
          <li className="mr-2">
            <button onClick={() => setActiveTab('contract')} className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'contract' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}>By Contract</button>
          </li>
          <li className="mr-2">
            <button onClick={() => setActiveTab('monthly')} className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'monthly' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}>By Month</button>
          </li>
          {isAdmin && (
            <li className="mr-2">
              <button onClick={() => setActiveTab('audit')} className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'audit' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}>Audit Log</button>
            </li>
          )}
        </ul>
      </div>

      <div className="card p-4">
        {activeTab === 'audit' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select value={auditActionFilter} onChange={e => setAuditActionFilter(e.target.value)} className="md:col-span-1 p-2 border rounded-md">
              <option value="all">All Actions</option>
              {uniqueAuditActions.map(action => <option key={action} value={action}>{action}</option>)}
            </select>
            <input type="text" placeholder="Search by user or action..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="md:col-span-1 p-2 border rounded-md" />
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="md:col-span-1 p-2 border rounded-md" />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="md:col-span-1 p-2 border rounded-md" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select value={selectedContractorId} onChange={e => setSelectedContractorId(e.target.value)} className="p-2 border rounded-md">
              <option value="all">All Contractors</option>
              {contractors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={selectedRoute} onChange={e => setSelectedRoute(e.target.value)} className="p-2 border rounded-md">
              <option value="all">All Routes</option>
              {routesForFilter.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border rounded-md" />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border rounded-md" />
          </div>
        )}
      </div>

      <div className="card p-4">
        {activeTab === 'details' && <div>Total Bills: {filteredBills.length}</div>}
        {activeTab === 'contractor' && <div>Total Contractors: {contractorSummary.length}</div>}
        {activeTab === 'contract' && <div>Total Contracts: {contractSummary.length}</div>}
        {activeTab === 'monthly' && <div>Total Months: {monthlySummary.length}</div>}
        {activeTab === 'audit' && <div>Total Logs: {filteredAuditLogs.length}</div>}
      </div>

      <div className="overflow-x-auto">
        {activeTab === 'monthly' && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Bills</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grand Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Deductions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlySummary.map(row => (
                <tr key={row.month}>
                  <td className="px-6 py-4 whitespace-nowrap">{row.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.totalBills}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.grandTotal.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.totalDeductions.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.netAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Other tabs would go here */}
      </div>

    </div>
  );
}

export default Reports;