import React from 'react';
import { SavedBill, CalculatedDeductions, BillingSettings } from '../types';

interface AuditPrintLayoutProps {
    bill: SavedBill | null;
    printRef: React.RefObject<HTMLDivElement>;
    settings: BillingSettings;
}

const AuditPrintLayout: React.FC<AuditPrintLayoutProps> = ({ bill, printRef, settings }) => {
    if (!bill) return null;

    const DEDUCTION_CONFIG = [
        { key: 'penalty', label: `Penalty for days delay @${settings.DEDUCTIONS.PENALTY_PER_DAY}/- per day`},
        { key: 'income_tax', label: `Income Tax @ ${settings.DEDUCTIONS.INCOME_TAX_RATE * 100}% (I.T.O)`},
        { key: 'tajveed_ul_quran', label: `Tajveed-ul Quran @ Rs. ${settings.DEDUCTIONS.TAJVEED_UL_QURAN_RATE} per 1000/-`},
        { key: 'education_cess', label: `Education Cess @ ${settings.DEDUCTIONS.EDUCATION_CESS_RATE * 100}% income Tax`},
        { key: 'klc', label: `K.L.C @ ${settings.DEDUCTIONS.KLC_RATE * 100}%`},
        { key: 'sd_current', label: `S.D Current bill @${settings.DEDUCTIONS.SD_CURRENT_RATE * 100}%`},
        { key: 'gst_current', label: `GST Current bill @${settings.DEDUCTIONS.GST_CURRENT_RATE * 100}%`},
    ];

    let deductionCounter = 0;

    return (
        <div className="absolute top-0 left-[-9999px] -z-10" aria-hidden="true">
            <div ref={printRef} style={{ width: '210mm', minHeight: '297mm' }} className="bg-white p-8 font-sans text-xs">
                <div className="text-center mb-8">
                    <h1 className="text-xl font-bold">Audit summary</h1>
                    <p className="font-semibold">Bill #{bill.bill_number} for {bill.contractor_name}</p>
                </div>

                 <table className="w-full text-sm border-collapse">
                    <tbody>
                        <tr className="border-b">
                            <td className="py-3 font-semibold text-gray-700">Grand total amount</td>
                            <td className="py-3 text-right font-bold text-lg text-gray-900">Rs. {bill.grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        </tr>
                        
                        <tr>
                            <td colSpan={2} className="pt-4 pb-2 font-semibold text-gray-700">Deductions breakdown:</td>
                        </tr>
                        
                        {DEDUCTION_CONFIG.map(d => {
                            const value = Number(bill.deductions[d.key as keyof CalculatedDeductions] || 0);
                            if (value > 0) {
                                deductionCounter++;
                                return (
                                     <tr key={d.key}>
                                        <td className="pl-4 py-1 text-gray-600">{deductionCounter}. {d.label}</td>
                                        <td className="py-1 text-right font-mono text-gray-800">(-) Rs. {value.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                     </tr>
                                );
                            }
                            return null;
                        })}
                        
                        {bill.custom_deductions?.map(cd => {
                            if(cd.value > 0) {
                                deductionCounter++;
                                return (
                                <tr key={cd.id}>
                                    <td className="pl-4 py-1 text-gray-600">{deductionCounter}. {cd.label}</td>
                                    <td className="py-1 text-right font-mono text-gray-800">(-) Rs. {(cd.value || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                </tr>
                                )
                            }
                            return null;
                        })}

                         <tr className="border-t font-semibold">
                            <td className="py-3 text-red-700">Total deductions</td>
                            <td className="py-3 text-right font-bold text-lg text-red-700">(-) Rs. {bill.totalDeductions.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        </tr>

                        <tr className="border-t-2 border-black font-bold text-xl">
                            <td className="py-4 text-indigo-800">Net amount payable</td>
                            <td className="py-4 text-right text-indigo-800">Rs. {bill.netAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        </tr>
                        
                        <tr>
                            <td colSpan={2} className="pt-4 text-sm">
                                <span className="font-bold">In words:</span> {bill.amountInWords}
                            </td>
                        </tr>
                    </tbody>
                 </table>
                
                 <footer className="mt-32 flex justify-between text-center text-xs">
                    <div>
                        <p className="pt-2 border-t border-black font-semibold">Prepared By</p>
                    </div>
                    <div>
                        <p className="pt-2 border-t border-black font-semibold">Checked By</p>
                    </div>
                    <div>
                        <p className="pt-2 border-t border-black font-semibold">Approved By</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AuditPrintLayout;