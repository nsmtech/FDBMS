import React, { useState, useMemo, useEffect } from 'react';
import { SavedBill, AuthUser, Contract, SavedGrindingBill, FlourMill, UnifiedBill } from '../types';
import { EditIcon, CashIcon, WalletIcon, DatabaseIcon, DocumentTextIcon, ReportIcon, PlusIcon, ArrowRightIcon, UserGroupIcon, TruckIcon, CurrencyRupeeIcon, BuildingOfficeIcon } from './Icons';

type AppView = 'dashboard' | 'newBill' | 'allBills' | 'reports' | 'agOffice' | 'grindingBills';

interface DashboardProps {
    currentUser: AuthUser;
    setCurrentView: (view: AppView) => void;
    onNewBill: () => void;
    savedBills: SavedBill[];
    sanctionedBudget: number;
    setSanctionedBudget: (value: number) => void;
    savedGrindingBills: SavedGrindingBill[];
    grindingSanctionedBudget: number;
    setGrindingSanctionedBudget: (value: number) => void;
    flourMills: FlourMill[];
    contracts: Contract[];
    canCreateAndEdit: boolean;
}

const BudgetSummary: React.FC<{
    savedBills: SavedBill[];
    sanctionedBudget: number;
    setSanctionedBudget: (value: number) => void;
    isAdmin: boolean;
}> = ({ savedBills, sanctionedBudget, setSanctionedBudget, isAdmin }) => {
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [budgetInput, setBudgetInput] = useState(sanctionedBudget.toString());
    
    const consumedBudget = useMemo(() => {
        return savedBills.reduce((sum, bill) => sum + bill.netAmount, 0);
    }, [savedBills]);

    const balance = sanctionedBudget - consumedBudget;
    const consumedPercentage = sanctionedBudget > 0 ? (consumedBudget / sanctionedBudget) * 100 : 0;
    
    const handleBudgetSave = () => {
        const newBudgetValue = parseFloat(budgetInput);
        if (!isNaN(newBudgetValue) && newBudgetValue >= 0) {
            setSanctionedBudget(newBudgetValue);
        }
        setIsEditingBudget(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleBudgetSave();
        } else if (e.key === 'Escape') {
            setBudgetInput(sanctionedBudget.toString());
            setIsEditingBudget(false);
        }
    }

    return (
        <div>
            <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-4">TPT Budget Overview</h3>
            
            <div className="space-y-3 text-base mb-4">
                 <div className="flex flex-wrap justify-between items-center gap-x-2 gap-y-1 group">
                    <span className="text-[var(--color-text-light)] flex items-center"><DatabaseIcon className="h-4 w-4 mr-2 text-[var(--color-text-light)]"/>Sanctioned Budget:</span>
                     {isEditingBudget ? (
                         <input
                             type="number"
                             value={budgetInput}
                             onChange={e => setBudgetInput(e.target.value)}
                             onBlur={handleBudgetSave}
                             onKeyDown={handleKeyDown}
                             className="w-40 text-right px-2 py-0.5"
                             autoFocus
                         />
                     ) : (
                         <div className="flex items-center gap-2">
                            <span className="font-semibold text-[var(--color-text-main)]">Rs. {sanctionedBudget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            {isAdmin && <button onClick={() => { setBudgetInput(sanctionedBudget.toString()); setIsEditingBudget(true); }} className="text-[var(--color-text-light)] hover:text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity"><EditIcon /></button>}
                         </div>
                     )}
                </div>
                 <div className="flex flex-wrap justify-between items-center gap-x-2 gap-y-1">
                    <span className="text-[var(--color-text-light)] flex items-center"><CashIcon className="h-4 w-4 mr-2 text-[var(--color-text-light)]"/>Amount Consumed:</span>
                    <span className="font-semibold text-orange-500">Rs. {consumedBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                 <div className="flex flex-wrap justify-between items-center gap-x-2 gap-y-1">
                    <span className="text-[var(--color-text-light)] flex items-center"><WalletIcon className="h-4 w-4 mr-2 text-[var(--color-text-light)]"/>Remaining Balance:</span>
                    <span className={`font-semibold ${balance < 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-primary)]'}`}>Rs. {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </div>

            <div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div 
                        className="bg-[var(--color-primary)] h-2.5 rounded-full" 
                        style={{ width: `${Math.min(consumedPercentage, 100)}%` }}
                    ></div>
                </div>
                <p className="text-sm text-right text-[var(--color-text-light)] mt-1">{consumedPercentage.toFixed(1)}% Consumed</p>
            </div>
        </div>
    );
};


const GrindingBudgetSummary: React.FC<{
    savedGrindingBills: SavedGrindingBill[];
    grindingSanctionedBudget: number;
    setGrindingSanctionedBudget: (value: number) => void;
    isAdmin: boolean;
}> = ({ savedGrindingBills, grindingSanctionedBudget, setGrindingSanctionedBudget, isAdmin }) => {
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [budgetInput, setBudgetInput] = useState(grindingSanctionedBudget.toString());

    const consumedBudget = useMemo(() => {
        return savedGrindingBills.reduce((sum, bill) => sum + bill.finalAmountToMill, 0);
    }, [savedGrindingBills]);

    const balance = grindingSanctionedBudget - consumedBudget;
    const consumedPercentage = grindingSanctionedBudget > 0 ? (consumedBudget / grindingSanctionedBudget) * 100 : 0;

    const handleBudgetSave = () => {
        const newBudgetValue = parseFloat(budgetInput);
        if (!isNaN(newBudgetValue) && newBudgetValue >= 0) {
            setGrindingSanctionedBudget(newBudgetValue);
        }
        setIsEditingBudget(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleBudgetSave();
        else if (e.key === 'Escape') {
            setBudgetInput(grindingSanctionedBudget.toString());
            setIsEditingBudget(false);
        }
    };

    return (
        <div>
            <h3 className="text-lg font-bold text-green-800 mb-4">Grinding Budget Overview</h3>
            <div className="space-y-3 text-base mb-4">
                <div className="flex flex-wrap justify-between items-center gap-x-2 gap-y-1 group">
                    <span className="text-gray-500 flex items-center"><DatabaseIcon className="h-4 w-4 mr-2"/>Sanctioned Budget:</span>
                    {isEditingBudget ? (
                        <input type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} onBlur={handleBudgetSave} onKeyDown={handleKeyDown} className="w-40 text-right px-2 py-0.5" autoFocus />
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">Rs. {grindingSanctionedBudget.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            {isAdmin && <button onClick={() => { setBudgetInput(grindingSanctionedBudget.toString()); setIsEditingBudget(true); }} className="text-gray-400 hover:text-green-600 opacity-0 group-hover:opacity-100 transition-opacity"><EditIcon /></button>}
                        </div>
                    )}
                </div>
                <div className="flex flex-wrap justify-between items-center gap-x-2 gap-y-1">
                    <span className="text-gray-500 flex items-center"><CashIcon className="h-4 w-4 mr-2"/>Amount Consumed:</span>
                    <span className="font-semibold text-orange-500">Rs. {consumedBudget.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex flex-wrap justify-between items-center gap-x-2 gap-y-1">
                    <span className="text-gray-500 flex items-center"><WalletIcon className="h-4 w-4 mr-2"/>Remaining Balance:</span>
                    <span className={`font-semibold ${balance < 0 ? 'text-red-600' : 'text-green-700'}`}>Rs. {balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
            </div>
            <div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${Math.min(consumedPercentage, 100)}%` }}></div>
                </div>
                <p className="text-sm text-right text-gray-500 mt-1">{consumedPercentage.toFixed(1)}% Consumed</p>
            </div>
        </div>
    );
};


const StatCard: React.FC<{icon: React.ReactNode; title: string; value: string | number; color: string; delay?: string;}> = ({ icon, title, value, color, delay = '0ms' }) => (
    <div className="card p-5 flex items-center gap-4 animate-fade-in" style={{animationDelay: delay}}>
        <div className={`p-3 rounded-full bg-[${color}]/10 text-[${color}]`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-[var(--color-text-light)]">{title}</p>
            <p className="text-2xl font-bold text-[var(--color-text-main)]">{value}</p>
        </div>
    </div>
);

const ActionButton: React.FC<{icon: React.ReactNode; title: string; description: string; onClick: () => void;}> = ({ icon, title, description, onClick }) => (
    <button onClick={onClick} className="w-full text-left p-4 rounded-lg bg-slate-50 hover:bg-slate-100 hover:border-[var(--color-primary)]/50 transition-all duration-200 group border border-[var(--color-border)] flex justify-between items-center">
        <div className="flex items-center">
            <div className="mr-4 text-[var(--color-primary)]">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-[var(--color-text-main)]">{title}</h4>
                <p className="text-sm text-[var(--color-text-light)]">{description}</p>
            </div>
        </div>
        <ArrowRightIcon className="h-6 w-6 text-gray-400 group-hover:text-[var(--color-primary)] transition-colors transform group-hover:translate-x-1" />
    </button>
);

const TopPayeesChart: React.FC<{
    savedBills: SavedBill[];
    savedGrindingBills: SavedGrindingBill[];
}> = ({ savedBills, savedGrindingBills }) => {
    const topPayees = useMemo(() => {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const payeeAmounts = new Map<string, number>();

        savedBills.forEach(bill => {
            if (new Date(bill.bill_date) >= ninetyDaysAgo) {
                const amount = payeeAmounts.get(bill.contractor_name) || 0;
                payeeAmounts.set(bill.contractor_name, amount + bill.netAmount);
            }
        });

        savedGrindingBills.forEach(bill => {
            if (new Date(bill.billDate) >= ninetyDaysAgo) {
                const amount = payeeAmounts.get(bill.flourMillName) || 0;
                payeeAmounts.set(bill.flourMillName, amount + bill.finalAmountToMill);
            }
        });

        if (payeeAmounts.size === 0) {
            return [];
        }

        const sortedPayees = Array.from(payeeAmounts.entries())
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount);
            
        return sortedPayees.slice(0, 5);
    }, [savedBills, savedGrindingBills]);

    if (topPayees.length === 0) {
        return <div className="h-full flex items-center justify-center"><p className="text-center text-gray-500 py-10">No payment activity in the last 90 days.</p></div>;
    }

    const maxAmount = topPayees[0].amount;

    return (
        <div className="space-y-4">
            {topPayees.map((payee, index) => (
                <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-gray-700 truncate pr-4">{payee.name}</span>
                        <span className="font-mono font-medium text-gray-500">Rs. {payee.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div 
                            className="bg-[var(--color-primary)] h-2.5 rounded-full" 
                            style={{ width: `${(payee.amount / maxAmount) * 100}%` }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const RecentActivity: React.FC<{
    savedBills: SavedBill[];
    savedGrindingBills: SavedGrindingBill[];
    setCurrentView: (view: AppView) => void;
}> = ({ savedBills, savedGrindingBills, setCurrentView }) => {
    const recentActivity = useMemo(() => {
        const allBills: UnifiedBill[] = [
            ...savedBills.map(b => ({ ...b, billType: 'transportation' as const })),
            ...savedGrindingBills.map(b => ({ ...b, billType: 'grinding' as const })),
        ];
        allBills.sort((a, b) => {
            const dateA = new Date(a.billType === 'transportation' ? a.bill_date : a.billDate).getTime();
            const dateB = new Date(b.billType === 'transportation' ? b.bill_date : b.billDate).getTime();
            return dateB - dateA;
        });
        return allBills.slice(0, 5);
    }, [savedBills, savedGrindingBills]);

    if (recentActivity.length === 0) {
        return <div className="h-full flex items-center justify-center"><p className="text-center text-gray-500 py-10">No recent bills found.</p></div>;
    }
    
    return (
        <div className="flex flex-col h-full">
            <ul className="space-y-3 flex-1">
                {recentActivity.map(bill => (
                    <li key={bill.id} className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${bill.billType === 'transportation' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                            {bill.billType === 'transportation' ? <TruckIcon className="h-5 w-5" /> : <BuildingOfficeIcon className="h-5 w-5 mr-0" />}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-semibold truncate text-gray-800">
                                {bill.billType === 'transportation' ? bill.contractor_name : bill.flourMillName}
                            </p>
                            <p className="text-xs text-gray-500">
                                {bill.billType === 'transportation' ? bill.bill_number : bill.billNumber}
                            </p>
                        </div>
                        <div className="text-right">
                             <p className="text-sm font-bold text-gray-800">
                                Rs. {(bill.billType === 'transportation' ? bill.netAmount : bill.finalAmountToMill).toLocaleString(undefined, {maximumFractionDigits: 0})}
                            </p>
                            <p className="text-xs text-gray-500">
                                {new Date(bill.billType === 'transportation' ? bill.bill_date : bill.billDate).toLocaleDateString('en-CA')}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
             <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2">
                <button onClick={() => setCurrentView('allBills')} className="w-full text-center px-3 py-2 text-sm font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors">
                    View All TPT Bills
                </button>
                <button onClick={() => setCurrentView('grindingBills')} className="w-full text-center px-3 py-2 text-sm font-semibold text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors">
                    View Grinding Bills
                </button>
            </div>
        </div>
    );
};

const AGOfficeStats: React.FC<{savedBills: SavedBill[], savedGrindingBills: SavedGrindingBill[], setCurrentView: (view: AppView) => void}> = ({ savedBills, savedGrindingBills, setCurrentView }) => {
    const { sentToday, processedToday } = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const allBills = [...savedBills, ...savedGrindingBills];
        return {
            sentToday: allBills.filter(b => b.agOfficeSentAt?.startsWith(todayStr)).length,
            processedToday: allBills.filter(b => b.agOfficeProcessedAt?.startsWith(todayStr)).length,
        }
    }, [savedBills, savedGrindingBills]);

    return (
        <div className="card p-6 bg-amber-50 border-amber-200 animate-fade-in" style={{animationDelay: '700ms'}}>
            <h3 className="text-lg font-bold text-amber-800 mb-4">AG Office Daily Summary</h3>
            <div className="flex justify-around items-center text-center">
                <div>
                    <p className="text-4xl font-extrabold text-amber-700">{sentToday}</p>
                    <p className="text-sm font-semibold text-amber-600">Bills Sent Today</p>
                </div>
                <div>
                    <p className="text-4xl font-extrabold text-green-700">{processedToday}</p>
                    <p className="text-sm font-semibold text-green-600">Bills Processed Today</p>
                </div>
            </div>
            <button onClick={() => setCurrentView('agOffice')} className="mt-6 w-full flex items-center justify-center gap-2 text-sm font-bold text-amber-800 bg-amber-200/50 hover:bg-amber-200/80 rounded-lg py-2.5 transition-colors">
                Go to AG Office Tray <ArrowRightIcon className="h-5 w-5"/>
            </button>
        </div>
    );
}


const Dashboard: React.FC<DashboardProps> = ({ currentUser, setCurrentView, onNewBill, savedBills, sanctionedBudget, setSanctionedBudget, savedGrindingBills, grindingSanctionedBudget, setGrindingSanctionedBudget, flourMills, contracts, canCreateAndEdit }) => {
    const isAdmin = currentUser.role === 'Admin';
    const isAGOfficeUser = currentUser.role === 'AG Office';

    const stats = useMemo(() => {
        const totalNetAmount = savedBills.reduce((sum, bill) => sum + bill.netAmount, 0);
        const uniqueContractors = new Set(contracts.map(c => c.contractor_name)).size;
        return {
            totalBills: savedBills.length,
            totalNetAmount: `Rs. ${totalNetAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            totalContractors: uniqueContractors,
            totalContracts: contracts.length,
        };
    }, [savedBills, contracts]);
    
    const grindingStats = useMemo(() => {
        const totalNetAmount = savedGrindingBills.reduce((sum, bill) => sum + bill.finalAmountToMill, 0);
        return {
            totalBills: savedGrindingBills.length,
            totalNetAmount: `Rs. ${totalNetAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            totalFlourMills: flourMills.length,
        };
    }, [savedGrindingBills, flourMills]);

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-[var(--color-text-main)]">Dashboard</h1>
                <p className="text-lg text-[var(--color-text-light)] mt-1">Welcome back, {currentUser.username}! Here's an overview of your billing activity.</p>
            </div>
            
            {(isAdmin || isAGOfficeUser) && (
                <div className="mb-8">
                    <AGOfficeStats savedBills={savedBills} savedGrindingBills={savedGrindingBills} setCurrentView={setCurrentView} />
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card p-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                         <BudgetSummary 
                            savedBills={savedBills}
                            sanctionedBudget={sanctionedBudget}
                            setSanctionedBudget={setSanctionedBudget}
                            isAdmin={isAdmin}
                        />
                         <GrindingBudgetSummary
                            savedGrindingBills={savedGrindingBills}
                            grindingSanctionedBudget={grindingSanctionedBudget}
                            setGrindingSanctionedBudget={setGrindingSanctionedBudget}
                            isAdmin={isAdmin}
                         />
                    </div>
                </div>

                <div className="card p-6 flex flex-col justify-between animate-fade-in" style={{animationDelay: '100ms'}}>
                    <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        {canCreateAndEdit && (
                             <ActionButton 
                                icon={<PlusIcon />}
                                title="Create New Bill"
                                description="Start a new transportation bill."
                                onClick={() => {
                                    onNewBill();
                                    setCurrentView('newBill');
                                }}
                            />
                        )}
                         <ActionButton 
                            icon={<DatabaseIcon className="h-5 w-5" />}
                            title="Manage All Bills"
                            description="View, edit or delete existing bills."
                            onClick={() => setCurrentView('allBills')}
                        />
                         <ActionButton 
                            icon={<ReportIcon className="h-5 w-5" />}
                            title="View Reports"
                            description="Analyze billing data and trends."
                            onClick={() => setCurrentView('reports')}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Transportation At a Glance</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    <StatCard 
                        icon={<DocumentTextIcon className="h-6 w-6" />}
                        title="Total Bills Created"
                        value={stats.totalBills}
                        color="var(--color-primary)"
                        delay="200ms"
                    />
                     <StatCard 
                        icon={<CurrencyRupeeIcon className="h-6 w-6" />}
                        title="Total Net Paid"
                        value={stats.totalNetAmount}
                        color="var(--color-primary)"
                        delay="300ms"
                    />
                     <StatCard 
                        icon={<UserGroupIcon />}
                        title="Total Contractors"
                        value={stats.totalContractors}
                        color="var(--color-accent)"
                        delay="400ms"
                    />
                     <StatCard 
                        icon={<TruckIcon />}
                        title="Active Contracts"
                        value={stats.totalContracts}
                        color="var(--color-danger)"
                        delay="500ms"
                    />
                </div>
            </div>
            
            <div className="mt-8">
                <h2 className="text-2xl font-bold text-green-800 mb-4">Grinding Bills At a Glance</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    <StatCard 
                        icon={<DocumentTextIcon className="h-6 w-6" />}
                        title="Total Grinding Bills"
                        value={grindingStats.totalBills}
                        color="#059669" /* green-600 */
                        delay="200ms"
                    />
                    <StatCard 
                        icon={<CurrencyRupeeIcon className="h-6 w-6" />}
                        title="Total Grinding Net Paid"
                        value={grindingStats.totalNetAmount}
                        color="#059669" /* green-600 */
                        delay="300ms"
                    />
                    <StatCard 
                        icon={<BuildingOfficeIcon className="h-6 w-6 mr-0" />}
                        title="Total Flour Mills"
                        value={grindingStats.totalFlourMills}
                        color="#047857" /* green-700 */
                        delay="400ms"
                    />
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 card p-6 animate-fade-in" style={{animationDelay: '600ms'}}>
                    <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-4">Top Payees (Last 90 Days)</h3>
                    <TopPayeesChart savedBills={savedBills} savedGrindingBills={savedGrindingBills} />
                </div>
                <div className="lg:col-span-2 card p-6 animate-fade-in" style={{animationDelay: '700ms'}}>
                    <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-4">Recent Activity</h3>
                    <RecentActivity savedBills={savedBills} savedGrindingBills={savedGrindingBills} setCurrentView={setCurrentView} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;