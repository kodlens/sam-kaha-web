import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Card,
    Button,
    Tag,
    Row,
    Col,
    Divider,
} from 'antd';
import {
    MedicineBoxOutlined,
    ShoppingCartOutlined,
    LockOutlined,
    ArrowRightOutlined,
    CheckCircleFilled,
    SafetyCertificateFilled,
    BarcodeOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import PharmaLogo from '@/components/pharma-logo';

export default function Welcome() {
    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
            <Head title="Welcome - SAM PHARMA POS" />

            {/* TOP NAVIGATION BAR */}
            <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <PharmaLogo variant="light" />

                    <div className="flex items-center gap-3">
                        <Link href="/login">
                            <Button
                                type="primary"
                                className="bg-emerald-600 hover:bg-emerald-700 font-bold border-none rounded-xl h-10 px-5 shadow-sm"
                            >
                                Sign In to Portal
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* HERO SECTION */}
            <main className="flex-1 flex flex-col justify-center items-center px-4 py-12 sm:py-20 relative overflow-hidden">
                {/* Background glow effects */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full">
                        <SafetyCertificateFilled className="text-emerald-400" />
                        <span>Philippine FDA & BIR Compliant Pharmacy System</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
                        Specialized Pharmacy <br />
                        <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                            POS & Inventory System
                        </span>
                    </h1>

                    <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
                        Designed specifically for Philippine community drugstores and hospital pharmacies. Built-in Generics Act indexing, First-Expired First-Out (FEFO) dispensing, 20% Senior Citizen & PWD benefits, and multi-unit conversions.
                    </p>

                    {/* PORTAL ACCESS CARDS */}
                    <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                        {/* CASHIER TERMINAL CARD */}
                        <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-2xl transition-all shadow-md group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-10 w-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800/50">
                                    <ShoppingCartOutlined className="text-xl" />
                                </div>
                                <Tag color="cyan" className="font-bold text-[10px] m-0 uppercase">
                                    Cashier Role
                                </Tag>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">
                                Cashier POS Terminal
                            </h3>
                            <p className="text-slate-400 text-xs mb-4">
                                Fast dispensing by generic/brand name, barcode scanning, shift cash float, hold carts, and 20% Senior/PWD benefits.
                            </p>
                            <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                                Enter Cashier Terminal <ArrowRightOutlined className="transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>

                        {/* ADMIN HUB CARD */}
                        <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-2xl transition-all shadow-md group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-10 w-10 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800/50">
                                    <MedicineBoxOutlined className="text-xl" />
                                </div>
                                <Tag color="geekblue" className="font-bold text-[10px] m-0 uppercase">
                                    Admin Role
                                </Tag>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">
                                Pharmacy Admin Hub
                            </h3>
                            <p className="text-slate-400 text-xs mb-4">
                                Master UOM setup, generic drug catalog, batch receiving, 30/60/90-day expiry tracking, and cashier shift audits.
                            </p>
                            <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 group-hover:text-blue-300">
                                Access Admin Console <ArrowRightOutlined className="transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>

                    {/* DEMO CREDENTIALS HELPER */}
                    <div className="pt-4 max-w-xl mx-auto">
                        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 flex flex-wrap items-center justify-center gap-3">
                            <span className="font-semibold text-slate-300">Seeded Accounts (Password: a):</span>
                            <span className="text-emerald-400 font-mono">admin@localhost</span>
                            <span>•</span>
                            <span className="text-cyan-400 font-mono">cashier1@localhost</span>
                            <span>•</span>
                            <span className="text-cyan-400 font-mono">cashier2@localhost</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
                <p className="m-0">
                    SAM PHARMA POS & Inventory System • Republic of the Philippines Generics Act (RA 6675) & Senior Citizen Law (RA 9994)
                </p>
            </footer>
        </div>
    );
}
