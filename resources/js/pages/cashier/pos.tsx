import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import CashierLayout from '@/layouts/cashier-layout';
import {
    Input,
    Button,
    Card,
    Tag,
    Badge,
    Empty,
    Modal,
    Space,
    Typography,
    Tooltip,
} from 'antd';
import {
    BarcodeOutlined,
    SearchOutlined,
    ShoppingCartOutlined,
    DeleteOutlined,
    PlusOutlined,
    MinusOutlined,
    IdcardOutlined,
    FileTextOutlined,
    PrinterOutlined,
    PauseCircleOutlined,
    CheckCircleFilled,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface PosProps {
    cashier: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    shift: any;
}

export default function PosTerminal({ cashier, shift }: PosProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'medicines' | 'groceries' | 'supplies'>('all');
    const [isSeniorModalOpen, setIsSeniorModalOpen] = useState(false);
    const [scIdNumber, setScIdNumber] = useState('');
    const [scCustomerName, setScCustomerName] = useState('');
    const [isSeniorApplied, setIsSeniorApplied] = useState(false);

    return (
        <CashierLayout title="Pharma Express Terminal" shiftInfo={shift}>
            <Head title="Cashier POS Terminal - SAM PHARMA" />

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 h-full min-h-[calc(100vh-5.5rem)]">
                {/* LEFT AREA: SEARCH & MEDICINE DISPENSING SELECTION (7 COLS) */}
                <div className="lg:col-span-7 flex flex-col gap-3 h-full">
                    {/* SEARCH & BARCODE BAR */}
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative flex-1 w-full">
                            <Input
                                size="large"
                                prefix={<SearchOutlined className="text-emerald-400 mr-2" />}
                                suffix={
                                    <Tag color="cyan" className="font-mono text-[10px] m-0">
                                        Scan / F2
                                    </Tag>
                                }
                                placeholder="Search by Generic Name, Brand, Grocery item, or Scan Barcode..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-slate-950 border-slate-800 text-white placeholder-slate-500 rounded-xl py-2"
                                autoFocus
                            />
                        </div>

                        {/* CATEGORY FILTER PILLS */}
                        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('all')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    selectedCategory === 'all'
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                            >
                                All Items
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('medicines')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    selectedCategory === 'medicines'
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                            >
                                💊 Medicines
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('groceries')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    selectedCategory === 'groceries'
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                            >
                                🛒 Groceries
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('supplies')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    selectedCategory === 'supplies'
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                            >
                                🩹 Supplies
                            </button>
                        </div>
                    </div>

                    {/* MEDICINE CATALOG DISPLAY */}
                    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-center items-center text-center">
                        <div className="max-w-md p-6 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-800/40">
                                <BarcodeOutlined className="text-2xl" />
                            </div>
                            <h3 className="text-white font-bold text-base mb-1">
                                Ready for Barcode Scanning or Generic Search
                            </h3>
                            <p className="text-slate-400 text-xs mb-4">
                                Products and batches will be managed in Module 2 (UOM) and Module 3 (Medicine Masterfile). When medicines are scanned or typed, they will appear here with FEFO expiry dates.
                            </p>
                            <div className="flex items-center justify-center gap-2">
                                <Tag color="blue">Generic Act Ready</Tag>
                                <Tag color="green">FEFO Automated</Tag>
                                <Tag color="purple">Multi-UOM Supported</Tag>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT AREA: ACTIVE DISPENSING CART (5 COLS) */}
                <div className="lg:col-span-5 flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    {/* CART HEADER */}
                    <div className="p-3 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                        <div className="flex items-center gap-2">
                            <ShoppingCartOutlined className="text-emerald-400 text-lg" />
                            <span className="font-bold text-white text-sm">
                                Current Dispensing Order
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                size="small"
                                icon={<PauseCircleOutlined />}
                                className="bg-slate-800 border-slate-700 text-slate-300 hover:text-white text-xs rounded-lg"
                            >
                                Hold Cart
                            </Button>
                        </div>
                    </div>

                    {/* CART ITEMS LIST */}
                    <div className="flex-1 p-4 overflow-y-auto flex flex-col justify-center items-center">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <div className="text-slate-400 text-xs">
                                    <p className="m-0 font-semibold text-slate-300">Cart is Empty</p>
                                    <p className="m-0 mt-1">Scan a barcode or search a medicine to begin checkout.</p>
                                </div>
                            }
                        />
                    </div>

                    {/* STATUTORY DISCOUNT SECTION (PHILIPPINES SENIOR / PWD) */}
                    <div className="p-3 bg-slate-950/80 border-t border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                <IdcardOutlined className="text-amber-400" />
                                PH Statutory Benefit (RA 9994 / RA 10754)
                            </span>
                            <Button
                                size="small"
                                type={isSeniorApplied ? 'primary' : 'default'}
                                className={
                                    isSeniorApplied
                                        ? 'bg-amber-600 border-none font-bold text-xs'
                                        : 'bg-slate-800 border-slate-700 text-amber-400 font-bold text-xs'
                                }
                                onClick={() => setIsSeniorModalOpen(true)}
                            >
                                {isSeniorApplied ? 'Senior/PWD Applied' : '+ Apply 20% SC/PWD'}
                            </Button>
                        </div>

                        {isSeniorApplied && (
                            <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg p-2 text-[11px] text-amber-200 flex items-center justify-between">
                                <div>
                                    <span className="font-bold block">SC/PWD: {scCustomerName || 'Juan Dela Cruz'}</span>
                                    <span className="text-amber-400/80">ID: {scIdNumber || 'SC-12345'}</span>
                                </div>
                                <Button
                                    size="small"
                                    type="text"
                                    danger
                                    className="text-xs p-0 h-auto"
                                    onClick={() => setIsSeniorApplied(false)}
                                >
                                    Remove
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* CART SUMMARY & CHECKOUT BUTTONS */}
                    <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Subtotal (Gross)</span>
                            <span className="font-mono text-slate-200">₱0.00</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>VAT Exemption (12%)</span>
                            <span className="font-mono text-slate-200">-₱0.00</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>SC / PWD Discount (20%)</span>
                            <span className="font-mono text-amber-400">-₱0.00</span>
                        </div>

                        <div className="h-px bg-slate-800 my-2" />

                        <div className="flex items-center justify-between text-base font-extrabold text-white">
                            <span>Net Total Due</span>
                            <span className="font-mono text-2xl text-emerald-400">₱0.00</span>
                        </div>

                        <div className="pt-2 grid grid-cols-2 gap-2">
                            <Button
                                size="large"
                                className="bg-slate-800 border-slate-700 text-slate-300 hover:text-white font-bold rounded-xl"
                            >
                                Hold [F9]
                            </Button>
                            <Button
                                size="large"
                                type="primary"
                                icon={<CheckCircleFilled />}
                                className="bg-emerald-600 hover:bg-emerald-700 border-none font-bold rounded-xl shadow-lg shadow-emerald-900/40"
                            >
                                Pay / Print [F12]
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* SENIOR / PWD DISCOUNT MODAL */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                        <IdcardOutlined className="text-amber-500" />
                        Senior Citizen / PWD 20% Discount
                    </div>
                }
                open={isSeniorModalOpen}
                onCancel={() => setIsSeniorModalOpen(false)}
                onOk={() => {
                    setIsSeniorApplied(true);
                    setIsSeniorModalOpen(false);
                }}
                okText="Apply Benefit"
                okButtonProps={{ className: 'bg-emerald-600 hover:bg-emerald-700 font-bold' }}
            >
                <div className="space-y-3 py-2">
                    <p className="text-xs text-slate-600 m-0">
                        Under RA 9994 (Senior Citizens) & RA 10754 (PWD), eligible Filipino customers are entitled to a 20% discount and 12% VAT exemption on prescription and essential medicines.
                    </p>

                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                            Customer / Patient Name
                        </label>
                        <Input
                            placeholder="e.g. Maria Corazon Santos"
                            value={scCustomerName}
                            onChange={(e) => setScCustomerName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                            OSCA / PWD ID Number *
                        </label>
                        <Input
                            placeholder="e.g. OSCA-NCR-2024-98765"
                            value={scIdNumber}
                            onChange={(e) => setScIdNumber(e.target.value)}
                        />
                    </div>
                </div>
            </Modal>
        </CashierLayout>
    );
}
