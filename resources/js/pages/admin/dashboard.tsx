import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import {
    Card,
    Row,
    Col,
    Statistic,
    Tag,
    Button,
    Alert,
} from 'antd';
import {
    TeamOutlined,
    MedicineBoxOutlined,
    HistoryOutlined,
    DollarOutlined,
    ShoppingCartOutlined,
    AppstoreOutlined,
    ArrowRightOutlined,
    AlertOutlined,
    SafetyCertificateFilled,
} from '@ant-design/icons';

interface AdminDashboardProps {
    metrics: {
        totalCashiers: number;
        totalProducts: number;
        nearExpiryCount: number;
        todaySales: number;
    };
    recentShifts?: any[];
}

export default function AdminDashboard({ metrics }: AdminDashboardProps) {
    return (
        <AdminLayout
            breadcrumbs={[
                {
                    title: 'Pharmacy Overview',
                    href: '/admin/dashboard',
                },
            ]}
        >
            <div className="space-y-6">
                <Head title="Pharmacy Admin Dashboard - SAM PHARMA" />

                {/* HERO BANNER */}
                <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-emerald-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Tag color="green" className="font-bold text-xs uppercase m-0 px-2 py-0.5">
                                Central Admin Center
                            </Tag>
                            <span className="text-emerald-400 text-xs font-semibold">
                                Republic of the Philippines (FDA & BIR Compliant)
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white m-0">
                            Pharmacy Management Hub
                        </h1>
                        <p className="text-slate-300 text-sm mt-1 m-0 max-w-xl">
                            Real-time overview of cashiers, dispensing activity, FEFO expiry tracking, and Philippine statutory compliance.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/cashier/pos">
                            <Button
                                type="primary"
                                size="large"
                                icon={<ShoppingCartOutlined />}
                                className="bg-emerald-600 hover:bg-emerald-700 font-bold border-none rounded-xl h-12 px-6 shadow-md shadow-emerald-900/50"
                            >
                                Launch POS Terminal
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* STATISTIC METRIC CARDS */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="rounded-2xl border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
                            <Statistic
                                title={<span className="font-bold text-slate-500 text-xs uppercase">Today's Total Sales</span>}
                                value={metrics?.todaySales || 0}
                                precision={2}
                                prefix={<span className="text-emerald-600 font-bold mr-1">₱</span>}
                                valueStyle={{ fontWeight: 900, color: '#0f172a' }}
                            />
                            <div className="mt-2 text-xs text-slate-400">
                                Gross pharmacy dispensing volume
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card className="rounded-2xl border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
                            <Statistic
                                title={<span className="font-bold text-slate-500 text-xs uppercase">Active Cashiers</span>}
                                value={metrics?.totalCashiers || 0}
                                prefix={<TeamOutlined className="text-blue-500 mr-1" />}
                                valueStyle={{ fontWeight: 900, color: '#0f172a' }}
                            />
                            <div className="mt-2 text-xs text-slate-400">
                                Cash register staff accounts
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card className="rounded-2xl border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
                            <Statistic
                                title={<span className="font-bold text-slate-500 text-xs uppercase">Medicines & Items</span>}
                                value={metrics?.totalProducts || 0}
                                prefix={<MedicineBoxOutlined className="text-teal-600 mr-1" />}
                                valueStyle={{ fontWeight: 900, color: '#0f172a' }}
                            />
                            <div className="mt-2 text-xs text-slate-400">
                                Catalog master records
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card className="rounded-2xl border-slate-200 shadow-xs hover:border-amber-300 transition-all">
                            <Statistic
                                title={<span className="font-bold text-slate-500 text-xs uppercase">Near Expiry Alerts (FEFO)</span>}
                                value={metrics?.nearExpiryCount || 0}
                                prefix={<HistoryOutlined className="text-amber-500 mr-1" />}
                                valueStyle={{ fontWeight: 900, color: metrics?.nearExpiryCount > 0 ? '#b45309' : '#0f172a' }}
                            />
                            <div className="mt-2 text-xs text-slate-400">
                                Batches within $\le 90$ days
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* QUICK MODULE ACCESS CARDS */}
                <div>
                    <h2 className="text-lg font-bold text-slate-800 mb-3">
                        Pharmacy Configuration Modules
                    </h2>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                            <Card className="rounded-2xl border-slate-200 shadow-xs h-full flex flex-col justify-between hover:shadow-md transition-all">
                                <div>
                                    <div className="h-10 w-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
                                        <AppstoreOutlined className="text-xl" />
                                    </div>
                                    <h3 className="font-bold text-base text-slate-900 m-0">
                                        Unit of Measure (UOM)
                                    </h3>
                                    <p className="text-slate-500 text-xs mt-1">
                                        Configure dispensing units (Box, Blister Pack, Strip, Piece, Bottle) and unit conversions per medication.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100">
                                    <Link href="/admin/uom" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
                                        Manage UOM Units <ArrowRightOutlined />
                                    </Link>
                                </div>
                            </Card>
                        </Col>

                        <Col xs={24} md={8}>
                            <Card className="rounded-2xl border-slate-200 shadow-xs h-full flex flex-col justify-between hover:shadow-md transition-all">
                                <div>
                                    <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                                        <MedicineBoxOutlined className="text-xl" />
                                    </div>
                                    <h3 className="font-bold text-base text-slate-900 m-0">
                                        Product Masterlist
                                    </h3>
                                    <p className="text-slate-500 text-xs mt-1">
                                        Generics Act indexing (Generic Name + Brand Name), Rx classifications, and dosage forms.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100">
                                    <span className="text-xs font-bold text-slate-400">
                                        Coming in Module 3
                                    </span>
                                </div>
                            </Card>
                        </Col>

                        <Col xs={24} md={8}>
                            <Card className="rounded-2xl border-slate-200 shadow-xs h-full flex flex-col justify-between hover:shadow-md transition-all">
                                <div>
                                    <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
                                        <SafetyCertificateFilled className="text-xl" />
                                    </div>
                                    <h3 className="font-bold text-base text-slate-900 m-0">
                                        Senior Citizen & PWD Rules
                                    </h3>
                                    <p className="text-slate-500 text-xs mt-1">
                                        Philippine statutory 20% discount rules, 12% VAT exemption, and booklet audit logging.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100">
                                    <span className="text-xs font-bold text-slate-400">
                                        Coming in Module 5
                                    </span>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        </AdminLayout>
    );
}
