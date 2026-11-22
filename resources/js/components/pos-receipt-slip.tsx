import React from 'react';
import { Button, Tag, Divider } from 'antd';
import { PrinterOutlined, CheckCircleFilled } from '@ant-design/icons';
import type { Transaction } from '@/types/pharmacy';

interface PosReceiptSlipProps {
    transaction: Transaction;
    onPrint?: () => void;
}

export default function PosReceiptSlip({ transaction, onPrint }: PosReceiptSlipProps) {
    const handlePrint = () => {
        if (onPrint) {
            onPrint();
        } else {
            window.print();
        }
    };

    const subtotal = Number(transaction.subtotal || 0);
    const vatableSales = Number(transaction.vatable_sales || 0);
    const vatExemptSales = Number(transaction.vat_exempt_sales || 0);
    const vatAmount = Number(transaction.vat_amount || 0);
    const vatReliefAmount = Number(transaction.vat_relief_amount || 0);
    const discountAmount = Number(transaction.discount_amount || 0);
    const totalAmount = Number(transaction.total_amount || 0);
    const paidAmount = Number(transaction.paid_amount || 0);
    const changeAmount = Number(transaction.change_amount || 0);

    return (
        <div className="flex flex-col items-center">
            {/* Action Bar */}
            <div className="w-full flex justify-end mb-3 no-print">
                <Button
                    type="primary"
                    icon={<PrinterOutlined />}
                    onClick={handlePrint}
                    className="bg-emerald-600 hover:bg-emerald-500 font-bold"
                >
                    Print Official Receipt (80mm)
                </Button>
            </div>

            {/* Thermal POS Receipt Container */}
            <div
                id="printable-pos-receipt"
                className="w-full max-w-[340px] bg-white text-slate-900 font-mono text-[11px] p-5 shadow-md border border-slate-200 rounded-lg selection:bg-emerald-100 leading-snug"
            >
                {/* Pharmacy Header */}
                <div className="text-center pb-2.5 border-b border-dashed border-slate-400">
                    <p className="font-bold text-sm tracking-wide m-0 uppercase">SAM PHARMA & CONVENIENCE</p>
                    <p className="text-[10px] text-slate-600 m-0">Licensed Community Pharmacy</p>
                    <p className="text-[10px] text-slate-500 m-0">FDA LTO No: CDRR-NCR-DS-987654</p>
                    <p className="text-[10px] text-slate-500 m-0">TIN: 000-123-456-00000 VAT Reg.</p>
                    <p className="text-[10px] text-slate-500 m-0">Metro Manila, Philippines</p>
                    <p className="font-bold text-xs mt-1 m-0 text-slate-800">OFFICIAL SALES RECEIPT</p>
                </div>

                {/* Receipt Metadata */}
                <div className="py-2 border-b border-dashed border-slate-300 space-y-0.5 text-[10px]">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Invoice No:</span>
                        <span className="font-bold">{transaction.invoice_number}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Date/Time:</span>
                        <span>{new Date(transaction.created_at || new Date()).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Cashier:</span>
                        <span className="font-semibold">{transaction.cashier?.name || 'Cashier'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Payment:</span>
                        <span className="font-bold uppercase text-emerald-700">{transaction.payment_method}</span>
                    </div>
                    {transaction.payment_reference && (
                        <div className="flex justify-between">
                            <span className="text-slate-500">Ref Code:</span>
                            <span className="font-mono">{transaction.payment_reference}</span>
                        </div>
                    )}
                </div>

                {/* Customer SC / PWD Info (if discount applied) */}
                {transaction.customer_name && (
                    <div className="py-2 border-b border-dashed border-slate-300 text-[10px] space-y-0.5 bg-slate-50 p-1.5 rounded my-1">
                        <p className="font-bold uppercase text-slate-700 m-0 text-[9px]">Senior Citizen / PWD Details (RA 9994/10754)</p>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Name:</span>
                            <span className="font-bold">{transaction.customer_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">ID Number:</span>
                            <span className="font-bold">{transaction.customer_id_number || 'N/A'}</span>
                        </div>
                        {transaction.customer_booklet_number && (
                            <div className="flex justify-between">
                                <span className="text-slate-500">Booklet No:</span>
                                <span>{transaction.customer_booklet_number}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Purchased Items Table */}
                <div className="py-2 border-b border-dashed border-slate-300">
                    <div className="grid grid-cols-12 text-[9px] font-bold text-slate-400 uppercase pb-1 border-b border-slate-200">
                        <span className="col-span-6">Item Description</span>
                        <span className="col-span-3 text-center">Qty / UOM</span>
                        <span className="col-span-3 text-right">Amount</span>
                    </div>

                    <div className="divide-y divide-dotted divide-slate-200 text-[10px]">
                        {transaction.items?.map((item, idx) => (
                            <div key={idx} className="py-1.5 space-y-0.5">
                                <div className="grid grid-cols-12 items-baseline">
                                    <div className="col-span-6">
                                        <p className="font-bold m-0 text-slate-900 leading-tight">
                                            {item.product?.generic_name ? `${item.product.generic_name} (${item.product.brand_name})` : item.product?.brand_name}
                                        </p>
                                        {item.product?.dosage_strength && (
                                            <p className="text-[9px] text-slate-500 m-0">{item.product.dosage_strength}</p>
                                        )}
                                    </div>
                                    <div className="col-span-3 text-center text-slate-700 font-mono">
                                        {item.quantity} {item.unit_of_measure?.short_code || item.unit_of_measure?.name}
                                    </div>
                                    <div className="col-span-3 text-right font-mono font-bold">
                                        ₱{Number(item.total_amount).toFixed(2)}
                                    </div>
                                </div>
                                <div className="text-[9px] text-slate-500 flex justify-between">
                                    <span>@ ₱{Number(item.unit_price).toFixed(2)}</span>
                                    <span>{item.is_vatable ? (discountAmount > 0 && item.sc_pwd_discountable ? 'VAT-Ex/Disc' : 'Vatable') : 'VAT-Exempt'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Amount Totals */}
                <div className="py-2 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                        <span>Gross Subtotal:</span>
                        <span className="font-mono">₱{subtotal.toFixed(2)}</span>
                    </div>

                    {vatReliefAmount > 0 && (
                        <div className="flex justify-between text-blue-700">
                            <span>Less 12% VAT Exemption:</span>
                            <span className="font-mono">-₱{vatReliefAmount.toFixed(2)}</span>
                        </div>
                    )}

                    {discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-semibold">
                            <span>Less 20% SC/PWD Discount:</span>
                            <span className="font-mono">-₱{discountAmount.toFixed(2)}</span>
                        </div>
                    )}

                    <div className="flex justify-between pt-1 border-t border-slate-300 font-bold text-xs bg-slate-100 p-1 rounded">
                        <span>TOTAL AMOUNT DUE:</span>
                        <span className="font-mono text-sm">₱{totalAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between pt-1">
                        <span>Amount Tendered / Paid:</span>
                        <span className="font-mono font-semibold">₱{paidAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                        <span>Change Due:</span>
                        <span className="font-mono text-emerald-700">₱{changeAmount.toFixed(2)}</span>
                    </div>
                </div>

                {/* BIR Tax Breakdown */}
                <div className="py-2 border-b border-dashed border-slate-300 text-[9px] text-slate-500 space-y-0.5">
                    <p className="font-bold uppercase text-slate-400 m-0">BIR Tax Summary:</p>
                    <div className="flex justify-between">
                        <span>Vatable Sales:</span>
                        <span className="font-mono">₱{vatableSales.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>VAT-Exempt Sales:</span>
                        <span className="font-mono">₱{vatExemptSales.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>12% VAT:</span>
                        <span className="font-mono">₱{vatAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>12% VAT Relief:</span>
                        <span className="font-mono">₱{vatReliefAmount.toFixed(2)}</span>
                    </div>
                </div>

                {/* Prescription Details (if applicable) */}
                {transaction.prescription && (
                    <div className="py-2 border-b border-dashed border-slate-300 text-[9px] text-slate-600 space-y-0.5 bg-slate-50 p-1.5 rounded my-1">
                        <p className="font-bold uppercase text-slate-700 m-0">Doctor Prescription (Rx) Compliance</p>
                        <div className="flex justify-between">
                            <span>Physician:</span>
                            <span className="font-bold">Dr. {transaction.prescription.doctor_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>PRC Lic No:</span>
                            <span>{transaction.prescription.doctor_license_no}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Patient:</span>
                            <span>{transaction.prescription.patient_name}</span>
                        </div>
                    </div>
                )}

                {/* Footer Notice */}
                <div className="text-center pt-3 text-[9px] text-slate-400 space-y-0.5">
                    <p className="font-bold text-slate-600 m-0">THANK YOU FOR YOUR PATRONAGE!</p>
                    <p className="m-0">Generics Act of 1988 (RA 6675) Compliant</p>
                    <p className="m-0">This serves as your Official Sales Invoice.</p>
                    <p className="text-[8px] m-0">POS Software: SAM PHARMA POS v2.0</p>
                </div>
            </div>
        </div>
    );
}
