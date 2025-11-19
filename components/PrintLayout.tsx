import React from 'react';
import { SavedBill, CalculatedDeductions, BillingSettings } from '../types.ts';
import { LOGO_URL } from '../constants.ts';

interface PrintLayoutProps {
    bills: SavedBill[];
    printRef: React.RefObject<HTMLDivElement>;
    settings: BillingSettings;
}

const PrintLayout: React.FC<PrintLayoutProps> = ({ bills, printRef, settings }) => {
    if (!bills || bills.length === 0) return null;
    
    return (
        <div className="absolute top-0 left-[-9999px] -z-10" aria-hidden="true">
            <div ref={printRef}>
                {bills.map((bill, index) => {
                    const DEDUCTION_CONFIG = [
                        { key: 'penalty', label: `Penalty for days delay @ Rs. ${settings.DEDUCTIONS.PENALTY_PER_DAY}/- per day`},
                        { key: 'income_tax', label: `Income Tax @ ${settings.DEDUCTIONS.INCOME_TAX_RATE * 100}% (I.T.O)`},
                        { key: 'tajveed_ul_quran', label: `Tajveed-ul Quran @ Rs. ${settings.DEDUCTIONS.TAJVEED_UL_QURAN_RATE} per 1000/-`},
                        { key: 'education_cess', label: `Education Cess @ ${settings.DEDUCTIONS.EDUCATION_CESS_RATE * 100}% income Tax`},
                        { key: 'klc', label: `K.L.C @ ${settings.DEDUCTIONS.KLC_RATE * 100}%`},
                        { key: 'sd_current', label: `S.D Current bill @${settings.DEDUCTIONS.SD_CURRENT_RATE * 100}%`},
                        { key: 'gst_current', label: `GST Current bill @${settings.DEDUCTIONS.GST_CURRENT_RATE * 100}%`},
                    ];

                    const defaultCertPoints = [
                        { id: '1', text: 'The amount claimed in the bill is claimed for the first time.' },
                        { id: '2', text: 'The Amount of this bill was not claimed previously' },
                        { id: '3', text: 'The above mentioned Qty has actually been lifted by the Contractor.' },
                        { id: '4', text: 'Verified statements are attached' },
                        { id: '5', text: 'The bill prepared is correct.' },
                        { id: '6', text: 'The bill prepared have been claimed in accordance with the sanctioned rates.' },
                        { id: '7', text: 'The amount of shortage has been recovered from the bill in full from contractor (if any).' },
                        { id: '8', text: 'If any deduction in the taxes imposed by this bill is required, the Department should be informed accordingly' },
                    ];
                    
                    const certPointsToRender = bill.certification_points && bill.certification_points.length > 0
                        ? bill.certification_points
                        : defaultCertPoints;
                    
                    let deductionCounter = 0;

                    return (
                        <div key={bill.id} className="bg-white" style={{ width: '210mm', minHeight: '297mm', pageBreakAfter: index < bills.length - 1 ? 'always' : 'auto' }}>
                             <div className="p-10 font-sans text-gray-800" style={{ fontSize: '10px' }}>
                                {/* Header */}
                                <header className="relative pb-4 border-b-2 border-gray-300">
                                     <div className="absolute top-0 right-0">
                                        <p className="text-xs font-semibold text-gray-500">Transportation bill</p>
                                    </div>
                                    <div className="w-20 mx-auto mb-2">
                                         <img src={LOGO_URL} alt="Logo" className="w-16 h-16 object-contain" />
                                    </div>
                                    <div className="text-center">
                                        <h1 className="text-base font-bold">Azad Govt of the State of Jammu & Kashmir</h1>
                                        <h2 className="text-sm font-bold">Directorate of Food</h2>
                                        <h3 className="text-xs font-bold">D-151 Satellite Town, Rwp</h3>
                                    </div>
                                </header>
                                
                                {/* Bill Info */}
                                <section className="grid grid-cols-3 gap-6 mt-6 text-xs">
                                    <div className="col-span-2">
                                        <p className="text-gray-500 font-bold text-xs mb-1">Bill to</p>
                                        <p className="font-semibold text-base text-gray-900">{bill.contractor_name}</p>
                                        <p className="text-gray-600 mt-1">Sanctioned No: {bill.sanctioned_no || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="grid grid-cols-2 gap-x-2">
                                            <p className="text-gray-500 font-bold">Bill #</p>
                                            <p className="font-semibold text-gray-800">{bill.bill_number}</p>
                                            <p className="text-gray-500 font-bold">Bill date</p>
                                            <p className="font-semibold text-gray-800">{new Date(bill.bill_date).toLocaleDateString()}</p>
                                            <p className="text-gray-500 font-bold">Bill period</p>
                                            <p className="font-semibold text-gray-800">{bill.bill_period || 'N/A'}</p>
                                        </div>
                                    </div>
                                </section>

                                {/* Bill Items Table */}
                                <section className="mt-6">
                                    <table className="w-full text-xs">
                                        <thead >
                                            <tr className="text-left font-bold text-gray-600 bg-gray-100">
                                                <th className="p-2 w-10">S#</th>
                                                <th className="p-2">From</th>
                                                <th className="p-2">To</th>
                                                <th className="p-2 text-right">Bags</th>
                                                <th className="p-2 text-right">Net KGs</th>
                                                <th className="p-2 text-right">Rate/Kg</th>
                                                <th className="p-2 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bill.bill_items.map((item, index) => (
                                                <tr key={item.id} className="border-b border-gray-100 even:bg-gray-50">
                                                    <td className="p-2 text-center font-medium text-gray-500">{index + 1}</td>
                                                    <td className="p-2">{item.from}</td>
                                                    <td className="p-2">{item.to}</td>
                                                    <td className="p-2 text-right">{item.bags}</td>
                                                    <td className="p-2 text-right">{item.netKgs.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                                    <td className="p-2 text-right font-mono">{item.rate_per_kg.toFixed(4)}</td>
                                                    <td className="p-2 text-right font-semibold">Rs. {item.rs.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </section>
                                
                               <div className="mt-6">
                                    {/* Deductions Table */}
                                    <section>
                                        <h3 className="font-bold mb-2 text-gray-600 text-sm">Deductions</h3>
                                        <table className="w-full text-xs">
                                            <tbody>
                                                {DEDUCTION_CONFIG.map((d) => {
                                                    const value = Number(bill.deductions[d.key as keyof CalculatedDeductions] || 0);
                                                    if (value > 0) {
                                                        deductionCounter++;
                                                        return (
                                                            <tr key={d.key} className="border-b border-gray-100">
                                                                <td className="py-1 text-gray-600 w-8 text-center">{deductionCounter}.</td>
                                                                <td className="py-1 text-gray-600 w-full">{d.label}</td>
                                                                <td className="py-1 text-gray-800 text-right whitespace-nowrap">Rs. {value.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                                            </tr>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                                {(bill.custom_deductions?.length > 0 && bill.custom_deductions[0]?.value > 0 ? bill.custom_deductions : [{label: bill.deductions.others_description, value: bill.deductions.others, id: '1'}]).map((cd) => {
                                                    if (cd.value > 0) {
                                                        deductionCounter++;
                                                        return (
                                                            <tr key={cd.id} className="border-b border-gray-100">
                                                                <td className="py-1 text-gray-600 w-8 text-center">{deductionCounter}.</td>
                                                                <td className="py-1 text-gray-600">{cd.label}</td>
                                                                <td className="py-1 text-gray-800 text-right">Rs. {(cd.value || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                                            </tr>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                            </tbody>
                                        </table>
                                    </section>

                                    {/* Financial Summary */}
                                    <section className="mt-6">
                                        <div className="w-2/3 ml-auto space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Grand total:</span>
                                                <span className="font-semibold text-gray-800">Rs. {bill.grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total deductions:</span>
                                                <span className="font-semibold text-gray-800">(-) Rs. {bill.totalDeductions.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                            </div>
                                            <div className="flex justify-between border-t-2 border-gray-800 pt-2 mt-2">
                                                <span className="font-bold text-base text-gray-900">Net amount payable</span>
                                                <span className="font-bold text-base text-gray-900">Rs. {bill.netAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                                
                                <p className="text-xs mt-4 text-gray-600"><span className="font-bold">In words:</span> {bill.amountInWords}</p>
                                
                                <section className="mt-8 border-t border-gray-200 pt-4">
                                    <h3 className="font-bold text-gray-600 mb-2 text-sm">Certification</h3>
                                    <ol className="list-decimal list-outside pl-5 space-y-1 text-gray-600 text-xs">
                                        {certPointsToRender.map(point => <li key={point.id}>{point.text}</li>)}
                                    </ol>
                                    <p className="mt-4 text-gray-600 text-xs">Countersigned and forwarded to the Accounts Officer AJK Council Secretariate Accounts Office Islamabad for pre-audit and payments please. The Cheque may be issued in favour of Contractor and delivered to the authorized official of this Directorate.</p>
                                </section>
                                
                                <footer className="mt-32">
                                    <div className="flex justify-between text-center text-xs">
                                        <div className="w-1/3"><p className="pt-2 border-t border-gray-400 font-semibold">Accounts Officer Food</p><p className="font-normal text-gray-500">(AJK) Rawalpindi</p></div>
                                        <div className="w-1/3"><p className="pt-2 border-t border-gray-400 font-semibold">Assistant Director Food(DDO)</p><p className="font-normal text-gray-500">(AJK) Rawalpindi</p></div>
                                    </div>
                                    <p className="text-center text-gray-400 mt-12 text-[9px]">Generated by FDBMS</p>
                                </footer>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PrintLayout;