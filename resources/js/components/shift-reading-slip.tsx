import React from 'react';
import { Button, Tag, Divider } from 'antd';
import { PrinterOutlined, CheckCircleOutlined, WarningOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { CashierShift } from '@/types/pharmacy';

interface ShiftReadingSlipProps {
    shift: CashierShift;
    type?: 'X-Reading' | 'Z-Reading';
    onPrint?: () => void;
}

export default function ShiftReadingSlip({
    shift,
    type = shift.status === 'open' ? 'X-Reading' : 'Z-Reading',
    onPrint,
}: ShiftReadingSlipProps) {
    const handlePrint = () => {
        if (onPrint) {
            onPrint();
        } else {
            window.print();
        }
    };

    const openingFloat = Number(shift.opening_float || 0);
    const cashSales = Number(shift.cash_sales_total || 0);
    const nonCashSales = Number(shift.non_cash_sales_total || 0);
    const grossSales = cashSales + nonCashSales;
    const cashDrops = Number(shift.cash_drops_total || 0);
    const expectedCash = Number(shift.expected_cash ?? (openingFloat + cashSales - cashDrops));
    const closingCash = shift.closing_cash !== null && shift.closing_cash !== undefined ? Number(shift.closing_cash) : null;
    const cashDiff = shift.cash_difference !== null && shift.cash_difference !== undefined ? Number(shift.cash_difference) : null;

    const diffStatus = cashDiff === null
        ? 'in_progress'
        : Math.abs(cashDiff) < 0.01
        ? 'balanced'
        : cashDiff > 0
        ? 'overage'
        : 'shortage';

    return (
        <div className="flex flex-col items-center">
            {/* Action Bar */}
            <div className="w-full flex justify-end mb-3 no-print">
                <Button
                    type="primary"
                    icon={<PrinterOutlined />}
                    onClick={handlePrint}
                    className="bg-emerald-600 hover:bg-emerald-500 font-semibold"
                >
                    Print Thermal Slip (80mm)
                </Button>
            </div>

            {/* Thermal Receipt Paper Container */}
            <div
                id="printable-shift-slip"
                className="w-full max-w-[340px] bg-white text-slate-900 font-mono text-xs p-5 shadow-md border border-slate-200 rounded-lg selection:bg-emerald-100"
            >
                {/* Header */}
                <div className="text-center pb-3 border-b border-dashed border-slate-400">
                    <p className="font-bold text-base tracking-wide m-0 uppercase">SAM PHARMA POS</p>
                    <p className="text-[11px] text-slate-600 m-0">Community Pharmacy & Groceries</p>
                    <p className="text-[10px] text-slate-500 m-0">TIN: 000-123-456-00000 VAT</p>
                    <p className="text-[10px] text-slate-500 m-0">Metro Manila, Philippines</p>
                    <div className="my-2 py-0.5 px-2 bg-slate-900 text-white font-bold text-xs inline-block rounded">
                        OFFICIAL {type.toUpperCase()}
                    </div>
                    <p className="text-[10px] text-slate-500 m-0">
                        {type === 'Z-Reading' ? 'FINAL SHIFT SUMMARY REPORT' : 'INTERIM SHIFT READING'}
                    </p>
                </div>

                {/* Shift Metadata */}
                <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Shift Number:</span>
                        <span className="font-bold">#{shift.id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Terminal ID:</span>
                        <span className="font-bold">{shift.device_terminal_id || 'TERM-01'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Cashier:</span>
                        <span className="font-bold">{shift.cashier?.name || 'Cashier'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Shift Status:</span>
                        <span className={`font-bold uppercase ${shift.status === 'open' ? 'text-emerald-700' : 'text-blue-700'}`}>
                            {shift.status}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Opened At:</span>
                        <span>{new Date(shift.opened_at).toLocaleString()}</span>
                    </div>
                    {shift.closed_at && (
                        <div className="flex justify-between">
                            <span className="text-slate-500">Closed At:</span>
                            <span>{new Date(shift.closed_at).toLocaleString()}</span>
                        </div>
                    )}
                </div>

                {/* Sales Breakdown */}
                <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1.5 text-[11px]">
                    <p className="font-bold uppercase text-[10px] text-slate-400 tracking-wider m-0">Sales Activity</p>
                    <div className="flex justify-between">
                        <span>(+) Cash Sales:</span>
                        <span className="font-bold">₱{cashSales.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>(+) Non-Cash (GCash/Card):</span>
                        <span className="font-bold">₱{nonCashSales.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-dotted border-slate-300 font-bold">
                        <span>Total Gross Sales:</span>
                        <span>₱{grossSales.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* Cash Drawer Flow */}
                <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1.5 text-[11px]">
                    <p className="font-bold uppercase text-[10px] text-slate-400 tracking-wider m-0">Cash Drawer Reconciliation</p>
                    <div className="flex justify-between">
                        <span>(+) Opening Float:</span>
                        <span className="font-semibold">₱{openingFloat.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>(+) Cash Collected:</span>
                        <span className="font-semibold">₱{cashSales.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                        <span>(-) Cash Drops / Payouts:</span>
                        <span className="font-semibold">-₱{cashDrops.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-dotted border-slate-300 font-bold bg-slate-50 p-1 rounded">
                        <span>Expected Drawer Cash:</span>
                        <span>₱{expectedCash.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {closingCash !== null && (
                        <div className="flex justify-between font-bold bg-slate-100 p-1 rounded">
                            <span>Counted Cash (Physical):</span>
                            <span>₱{closingCash.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                        </div>
                    )}
                </div>

                {/* Discrepancy Status */}
                {closingCash !== null && cashDiff !== null && (
                    <div className="py-2.5 border-b border-dashed border-slate-300 text-center">
                        <div className="flex justify-between items-center text-xs font-bold mb-1">
                            <span>Variance (Over / Short):</span>
                            <span
                                className={`text-sm ${
                                    diffStatus === 'balanced'
                                        ? 'text-emerald-700'
                                        : diffStatus === 'overage'
                                        ? 'text-amber-700'
                                        : 'text-red-700'
                                }`}
                            >
                                {cashDiff > 0 ? `+₱${cashDiff.toFixed(2)}` : `₱${cashDiff.toFixed(2)}`}
                            </span>
                        </div>
                        <div className="text-[11px]">
                            {diffStatus === 'balanced' && (
                                <span className="text-emerald-700 font-bold flex items-center justify-center gap-1">
                                    <CheckCircleOutlined /> DRAWER PERFECTLY BALANCED
                                </span>
                            )}
                            {diffStatus === 'overage' && (
                                <span className="text-amber-700 font-bold flex items-center justify-center gap-1">
                                    <WarningOutlined /> CASH OVERAGE (+₱{cashDiff.toFixed(2)})
                                </span>
                            )}
                            {diffStatus === 'shortage' && (
                                <span className="text-red-700 font-bold flex items-center justify-center gap-1">
                                    <CloseCircleOutlined /> CASH SHORTAGE (-₱{Math.abs(cashDiff).toFixed(2)})
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Denomination Breakdown (if provided) */}
                {shift.denomination_breakdown && Object.keys(shift.denomination_breakdown).length > 0 && (
                    <div className="py-2.5 border-b border-dashed border-slate-300 text-[10px] space-y-1">
                        <p className="font-bold uppercase text-slate-400 m-0">Counted Denominations:</p>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-slate-600">
                            {Object.entries(shift.denomination_breakdown).map(([denom, count]) => {
                                if (Number(count) <= 0) return null;
                                return (
                                    <div key={denom} className="flex justify-between">
                                        <span>₱{denom}:</span>
                                        <span className="font-bold">{count} {denom === 'coins' ? 'PHP' : 'pcs'}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Cash Drops Detail (if any) */}
                {shift.cash_drops && shift.cash_drops.length > 0 && (
                    <div className="py-2.5 border-b border-dashed border-slate-300 text-[10px] space-y-1">
                        <p className="font-bold uppercase text-slate-400 m-0">Shift Drops / Disbursements:</p>
                        {shift.cash_drops.map((drop) => (
                            <div key={drop.id} className="border-b border-dotted border-slate-200 pb-1">
                                <div className="flex justify-between font-bold">
                                    <span className="capitalize">{drop.type.replace(/_/g, ' ')}</span>
                                    <span>₱{Number(drop.amount).toFixed(2)}</span>
                                </div>
                                <p className="text-slate-500 m-0 italic truncate">{drop.reason}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Signatures */}
                <div className="pt-6 pb-2 text-[10px] space-y-6">
                    <div>
                        <div className="border-b border-slate-400 w-3/4 mx-auto" />
                        <p className="text-center text-slate-500 mt-1 m-0">Cashier Signature</p>
                    </div>
                    <div>
                        <div className="border-b border-slate-400 w-3/4 mx-auto" />
                        <p className="text-center text-slate-500 mt-1 m-0">Pharmacist / Supervisor Signature</p>
                    </div>
                </div>

                {/* Footer Notice */}
                <div className="text-center pt-3 text-[9px] text-slate-400 border-t border-dashed border-slate-300">
                    <p className="m-0">System Generated Report • SAM PHARMA POS</p>
                    <p className="m-0">Retain this slip for BIR audit reconciliation.</p>
                </div>
            </div>
        </div>
    );
}
