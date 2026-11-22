import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import {
    Table,
    Button,
    Input,
    Select,
    Tag,
    Modal,
    Space,
    Card,
    Tooltip,
    message,
    InputNumber,
    Row,
    Col,
    Statistic,
    Tabs,
    Divider,
    Alert,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    PercentageOutlined,
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    ReloadOutlined,
    IdcardOutlined,
    BookOutlined,
    SafetyCertificateOutlined,
    FileTextOutlined,
    PrinterOutlined,
    CalculatorOutlined,
    CheckCircleFilled,
    InfoCircleOutlined,
} from '@ant-design/icons';
import type { DiscountType, Product, StatutoryDiscountLog } from '@/types/pharmacy';

interface DiscountsPageProps {
    discountTypes: DiscountType[];
    logs: StatutoryDiscountLog[];
    products: Product[];
    metrics: {
        totalDiscountGiven: number;
        totalVatReliefGiven: number;
        totalBeneficiarySales: number;
        seniorCount: number;
        pwdCount: number;
    };
    filters: {
        search: string;
        discount_code: string;
    };
}

export default function DiscountsIndex({
    discountTypes,
    logs,
    products,
    metrics,
    filters,
}: DiscountsPageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [discountCodeFilter, setDiscountCodeFilter] = useState(filters.discount_code || '');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<DiscountType | null>(null);

    // Live Formula Sandbox state
    const [calcProductId, setCalcProductId] = useState<number>(products[0]?.id || 1);
    const [calcQuantity, setCalcQuantity] = useState<number>(10);
    const [calcDiscountCode, setCalcDiscountCode] = useState<string>('SC');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        code: '',
        percentage: 10.0,
        is_vat_exempt: false,
        requires_id: false,
        requires_booklet: false,
        applies_to: 'all',
        description: '',
        is_active: true,
    });

    const handleSearch = () => {
        router.get(
            '/admin/discounts',
            {
                search: search || undefined,
                discount_code: discountCodeFilter || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setDiscountCodeFilter('');
        router.get('/admin/discounts', {}, { preserveState: true, replace: true });
    };

    const openCreateModal = () => {
        setEditingDiscount(null);
        clearErrors();
        reset();
        setData({
            name: '',
            code: 'PROMO_' + Math.floor(100 + Math.random() * 900),
            percentage: 5.0,
            is_vat_exempt: false,
            requires_id: false,
            requires_booklet: false,
            applies_to: 'all',
            description: '',
            is_active: true,
        });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (discount: DiscountType) => {
        setEditingDiscount(discount);
        clearErrors();
        setData({
            name: discount.name,
            code: discount.code,
            percentage: Number(discount.percentage),
            is_vat_exempt: discount.is_vat_exempt,
            requires_id: discount.requires_id,
            requires_booklet: discount.requires_booklet,
            applies_to: discount.applies_to,
            description: discount.description || '',
            is_active: discount.is_active,
        });
        setIsCreateModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingDiscount) {
            put(`/admin/discounts/${editingDiscount.id}`, {
                onSuccess: () => {
                    message.success(`Discount rule '${data.name}' updated.`);
                    setIsCreateModalOpen(false);
                },
            });
        } else {
            post('/admin/discounts', {
                onSuccess: () => {
                    message.success(`Discount rule '${data.name}' created.`);
                    setIsCreateModalOpen(false);
                },
            });
        }
    };

    const handleToggleStatus = (discount: DiscountType) => {
        router.patch(
            `/admin/discounts/${discount.id}/toggle`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    message.success(`Status for '${discount.name}' toggled.`);
                },
            }
        );
    };

    // Calculate sandbox product
    const selectedCalcProduct = products.find((p) => p.id === calcProductId) || products[0];
    const calcBasePrice = selectedCalcProduct?.base_unit?.price
        ? Number(selectedCalcProduct.base_unit.price)
        : 10.0;
    const calcGrossTotal = calcBasePrice * calcQuantity;

    // Sandbox computation logic
    let calcNetOfVat = calcGrossTotal;
    let calcVatRelief = 0.0;
    let calcDiscountAmount = 0.0;
    let calcFinalDue = calcGrossTotal;

    const isBeneficiary = calcDiscountCode === 'SC' || calcDiscountCode === 'PWD';
    const isEligible = selectedCalcProduct?.sc_pwd_discountable;

    if (isBeneficiary && isEligible) {
        if (selectedCalcProduct?.is_vatable) {
            calcNetOfVat = calcGrossTotal / 1.12;
            calcVatRelief = calcGrossTotal - calcNetOfVat;
        } else {
            calcNetOfVat = calcGrossTotal;
            calcVatRelief = 0;
        }
        calcDiscountAmount = calcNetOfVat * 0.20;
        calcFinalDue = calcNetOfVat - calcDiscountAmount;
    } else if (calcDiscountCode === 'STAFF') {
        calcDiscountAmount = calcGrossTotal * 0.10;
        calcFinalDue = calcGrossTotal - calcDiscountAmount;
    }

    // Table 1: BIR Audit Log Columns
    const logColumns: ColumnsType<StatutoryDiscountLog> = [
        {
            title: 'Date & Time',
            dataIndex: 'recorded_at',
            key: 'recorded_at',
            render: (recordedAt: string) => (
                <div className="font-mono text-xs text-slate-800">
                    <span className="font-bold block">
                        {new Date(recordedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        })}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                        {new Date(recordedAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                </div>
            ),
        },
        {
            title: 'Beneficiary & ID Details',
            key: 'customer',
            render: (_: any, record: StatutoryDiscountLog) => (
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{record.customer_name}</span>
                        <Tag
                            color={record.discount_type?.code === 'SC' ? 'gold' : 'blue'}
                            className="text-[10px] font-bold uppercase m-0"
                        >
                            {record.discount_type?.code === 'SC' ? 'Senior' : 'PWD'}
                        </Tag>
                    </div>
                    <div className="text-xs text-slate-600 font-mono mt-0.5">
                        ID: <span className="font-semibold text-slate-800">{record.id_number}</span>
                    </div>
                    {record.booklet_number && (
                        <div className="text-[11px] text-slate-400 font-mono">
                            Booklet: <span className="text-slate-600">{record.booklet_number}</span>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Gross Total',
            dataIndex: 'gross_amount',
            key: 'gross_amount',
            render: (gross: string | number) => (
                <span className="font-mono text-xs font-semibold text-slate-600">
                    ₱{Number(gross).toFixed(2)}
                </span>
            ),
        },
        {
            title: '12% VAT Waived',
            dataIndex: 'vat_relief_amount',
            key: 'vat_relief_amount',
            render: (vatRelief: string | number) => (
                <span className="font-mono text-xs font-semibold text-purple-700">
                    -₱{Number(vatRelief).toFixed(2)}
                </span>
            ),
        },
        {
            title: '20% Discount Given',
            dataIndex: 'discount_amount',
            key: 'discount_amount',
            render: (discount: string | number) => (
                <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    -₱{Number(discount).toFixed(2)}
                </span>
            ),
        },
        {
            title: 'Net Amount Paid',
            dataIndex: 'net_amount',
            key: 'net_amount',
            render: (net: string | number) => (
                <span className="font-mono text-sm font-extrabold text-emerald-700">
                    ₱{Number(net).toFixed(2)}
                </span>
            ),
        },
        {
            title: 'Cashier Staff',
            dataIndex: 'cashier_name',
            key: 'cashier_name',
            render: (cashierName: string) => (
                <span className="text-xs text-slate-600 font-medium">
                    {cashierName || 'Staff'}
                </span>
            ),
        },
    ];

    // Table 2: Discount Rules Columns
    const ruleColumns: ColumnsType<DiscountType> = [
        {
            title: 'Discount Name & Legal Basis',
            key: 'name',
            render: (_: any, record: DiscountType) => (
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{record.name}</span>
                        {record.is_statutory && (
                            <Tag color="cyan" className="text-[10px] font-bold uppercase m-0">
                                Statutory Law
                            </Tag>
                        )}
                    </div>
                    {record.legal_basis && (
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                            {record.legal_basis}
                        </div>
                    )}
                    {record.description && (
                        <div className="text-[11px] text-slate-400 mt-0.5 max-w-md">
                            {record.description}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            render: (code: string) => (
                <Tag color="geekblue" className="font-mono font-bold text-xs">
                    {code}
                </Tag>
            ),
        },
        {
            title: 'Rate',
            dataIndex: 'percentage',
            key: 'percentage',
            render: (percentage: string | number) => (
                <span className="font-mono font-extrabold text-sm text-slate-900">
                    {Number(percentage)}%
                </span>
            ),
        },
        {
            title: 'Tax Exemption',
            dataIndex: 'is_vat_exempt',
            key: 'is_vat_exempt',
            render: (isExempt: boolean) => (
                <Tag color={isExempt ? 'purple' : 'default'} className="font-semibold text-xs">
                    {isExempt ? '12% VAT-Exempt' : 'Vatable Sales'}
                </Tag>
            ),
        },
        {
            title: 'Verification Requirements',
            key: 'requirements',
            render: (_: any, record: DiscountType) => (
                <div className="space-y-0.5 text-xs">
                    {record.requires_id && (
                        <Tag color="blue" className="text-[10px] m-0 mr-1">
                            Valid ID Required
                        </Tag>
                    )}
                    {record.requires_booklet && (
                        <Tag color="green" className="text-[10px] m-0">
                            Booklet Entry Required
                        </Tag>
                    )}
                    {!record.requires_id && !record.requires_booklet && (
                        <span className="text-slate-400 text-xs">None</span>
                    )}
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (isActive: boolean, record: DiscountType) => (
                <div>
                    {record.is_statutory ? (
                        <Tag color="success" className="font-bold text-xs">
                            Mandatory Law (Active)
                        </Tag>
                    ) : (
                        <Button
                            size="small"
                            type={isActive ? 'primary' : 'default'}
                            className={isActive ? 'bg-emerald-600 border-none text-xs' : 'text-xs'}
                            onClick={() => handleToggleStatus(record)}
                        >
                            {isActive ? 'Active' : 'Inactive'}
                        </Button>
                    )}
                </div>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'right',
            render: (_: any, record: DiscountType) => (
                <Tooltip title={record.is_statutory ? 'Statutory laws cannot be edited' : 'Edit Rule'}>
                    <Button
                        type="text"
                        disabled={record.is_statutory}
                        icon={<EditOutlined />}
                        onClick={() => openEditModal(record)}
                    />
                </Tooltip>
            ),
        },
    ];

    return (
        <AdminLayout
            breadcrumbs={[
                {
                    title: 'Senior & PWD Discounts',
                    href: '/admin/discounts',
                },
            ]}
        >
            <Head title="Discounts & Statutory Benefits (RA 9994) - SAM PHARMA" />

            <div className="space-y-5">
                {/* PAGE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Tag color="purple" className="font-bold text-[10px] uppercase m-0">
                                Philippine Statutory Benefits
                            </Tag>
                            <span className="text-xs text-slate-400 font-semibold">
                                RA 9994 (Senior) & RA 10754 (PWD)
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 m-0">
                            Discounts & BIR Statutory Compliance
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm mt-0.5 m-0">
                            Automated 20% statutory discount, 12% VAT-exemption deduction, purchase booklet logs, and BIR tax audit ledger.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            size="large"
                            onClick={openCreateModal}
                            className="bg-emerald-600 hover:bg-emerald-700 font-bold border-none rounded-xl h-11 px-5 shadow-sm"
                        >
                            New Promo Rule
                        </Button>
                    </div>
                </div>

                {/* STATUTORY SUMMARY KPI METRICS */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="rounded-2xl border-slate-200 shadow-xs">
                            <Statistic
                                title={<span className="font-bold text-slate-500 text-xs uppercase">Total 20% Discount Given</span>}
                                value={metrics.totalDiscountGiven}
                                precision={2}
                                prefix={<span className="text-amber-600 font-bold mr-1">₱</span>}
                                valueStyle={{ fontWeight: 900, color: '#b45309' }}
                            />
                            <div className="mt-2 text-xs text-slate-400">
                                Statutory savings to beneficiaries
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card className="rounded-2xl border-slate-200 shadow-xs">
                            <Statistic
                                title={<span className="font-bold text-slate-500 text-xs uppercase">Total 12% VAT Waived</span>}
                                value={metrics.totalVatReliefGiven}
                                precision={2}
                                prefix={<span className="text-purple-600 font-bold mr-1">₱</span>}
                                valueStyle={{ fontWeight: 900, color: '#7e22ce' }}
                            />
                            <div className="mt-2 text-xs text-slate-400">
                                BIR tax exemption relief
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card className="rounded-2xl border-slate-200 shadow-xs">
                            <Statistic
                                title={<span className="font-bold text-slate-500 text-xs uppercase">Senior Citizens Served</span>}
                                value={metrics.seniorCount}
                                prefix={<IdcardOutlined className="text-emerald-600 mr-1" />}
                                valueStyle={{ fontWeight: 900, color: '#0f172a' }}
                            />
                            <div className="mt-2 text-xs text-slate-400">
                                Validated OSCA booklets
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card className="rounded-2xl border-slate-200 shadow-xs">
                            <Statistic
                                title={<span className="font-bold text-slate-500 text-xs uppercase">PWDs Served</span>}
                                value={metrics.pwdCount}
                                prefix={<SafetyCertificateOutlined className="text-blue-600 mr-1" />}
                                valueStyle={{ fontWeight: 900, color: '#0f172a' }}
                            />
                            <div className="mt-2 text-xs text-slate-400">
                                Validated PWD booklets
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* TABS CONTAINER */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                    <Tabs
                        defaultActiveKey="ledger"
                        items={[
                            {
                                key: 'ledger',
                                label: (
                                    <span className="flex items-center gap-2 font-bold text-sm px-2">
                                        <FileTextOutlined /> BIR Senior & PWD Audit Ledger
                                    </span>
                                ),
                                children: (
                                    <div className="space-y-4 pt-2">
                                        {/* FILTER BAR */}
                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                                            <div className="sm:col-span-6">
                                                <Input
                                                    placeholder="Search by customer name, OSCA/PWD ID, or booklet #..."
                                                    prefix={<SearchOutlined className="text-slate-400" />}
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                    onPressEnter={handleSearch}
                                                    className="rounded-xl"
                                                    allowClear
                                                />
                                            </div>

                                            <div className="sm:col-span-3">
                                                <Select
                                                    placeholder="Filter Discount Type"
                                                    value={discountCodeFilter || undefined}
                                                    onChange={(val) => setDiscountCodeFilter(val || '')}
                                                    className="w-full"
                                                    allowClear
                                                    options={[
                                                        { label: 'All Discount Types', value: '' },
                                                        { label: 'Senior Citizen (SC)', value: 'SC' },
                                                        { label: 'Person with Disability (PWD)', value: 'PWD' },
                                                    ]}
                                                />
                                            </div>

                                            <div className="sm:col-span-3 flex items-center gap-2">
                                                <Button
                                                    type="primary"
                                                    onClick={handleSearch}
                                                    className="bg-slate-800 hover:bg-slate-900 border-none font-bold rounded-xl flex-1"
                                                >
                                                    Filter
                                                </Button>
                                                <Button
                                                    icon={<ReloadOutlined />}
                                                    onClick={handleReset}
                                                    className="rounded-xl"
                                                />
                                            </div>
                                        </div>

                                        <Table
                                            columns={logColumns}
                                            dataSource={logs}
                                            rowKey="id"
                                            pagination={{
                                                pageSize: 10,
                                                showTotal: (total) => `Total ${total} statutory entries logged`,
                                            }}
                                        />
                                    </div>
                                ),
                            },
                            {
                                key: 'rules',
                                label: (
                                    <span className="flex items-center gap-2 font-bold text-sm px-2">
                                        <PercentageOutlined /> Discount Rules & Policies
                                    </span>
                                ),
                                children: (
                                    <div className="pt-2">
                                        <Table
                                            columns={ruleColumns}
                                            dataSource={discountTypes}
                                            rowKey="id"
                                            pagination={false}
                                        />
                                    </div>
                                ),
                            },
                            {
                                key: 'calculator',
                                label: (
                                    <span className="flex items-center gap-2 font-bold text-sm px-2">
                                        <CalculatorOutlined /> Philippine Formula Sandbox
                                    </span>
                                ),
                                children: (
                                    <div className="pt-3 max-w-4xl space-y-4">
                                        <Alert
                                            type="info"
                                            showIcon
                                            icon={<InfoCircleOutlined />}
                                            message="How Philippine Pharmacy Law Mandates the 20% Discount"
                                            description="Under Bureau of Internal Revenue (BIR) Revenue Regulations No. 7-2010 and RA 9994 / RA 10754: For vatable medicines, the 12% Value Added Tax is stripped FIRST (Price / 1.12), and the 20% discount is applied to the net-of-VAT amount. For VAT-exempt medicines (such as prescribed maintenance drugs for hypertension and diabetes), the 20% applies directly to the retail price. Non-medical groceries receive 0% statutory discount."
                                            className="rounded-2xl border-sky-200 bg-sky-50 text-sky-900"
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                                            {/* LEFT: CONTROLS */}
                                            <div className="space-y-4">
                                                <span className="font-extrabold text-slate-800 text-sm block uppercase tracking-wider">
                                                    1. Select Item & Quantity
                                                </span>

                                                <div>
                                                    <label className="text-xs font-bold text-slate-700 block mb-1">
                                                        Product from Catalog
                                                    </label>
                                                    <Select
                                                        size="large"
                                                        value={calcProductId}
                                                        onChange={(val) => setCalcProductId(val)}
                                                        className="w-full"
                                                        options={products.map((p) => ({
                                                            label: `${p.product_type === 'medicine' ? '💊' : '🛒'} ${p.brand_name} (₱${Number(p.base_unit?.price || 10).toFixed(2)})`,
                                                            value: p.id,
                                                        }))}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-xs font-bold text-slate-700 block mb-1">
                                                            Quantity (pcs)
                                                        </label>
                                                        <InputNumber
                                                            size="large"
                                                            min={1}
                                                            max={500}
                                                            value={calcQuantity}
                                                            onChange={(val) => setCalcQuantity(val || 1)}
                                                            className="w-full rounded-xl"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-xs font-bold text-slate-700 block mb-1">
                                                            Customer Status
                                                        </label>
                                                        <Select
                                                            size="large"
                                                            value={calcDiscountCode}
                                                            onChange={(val) => setCalcDiscountCode(val)}
                                                            className="w-full"
                                                            options={[
                                                                { label: 'Senior Citizen (20%)', value: 'SC' },
                                                                { label: 'PWD (20%)', value: 'PWD' },
                                                                { label: 'Staff (10%)', value: 'STAFF' },
                                                                { label: 'Regular Customer (0%)', value: 'NONE' },
                                                            ]}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Department:</span>
                                                        <span className="font-bold uppercase text-slate-800">
                                                            {selectedCalcProduct?.product_type}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Tax Type:</span>
                                                        <span className="font-bold text-slate-800">
                                                            {selectedCalcProduct?.is_vatable ? '12% Vatable' : 'VAT-Exempt (TRAIN Law)'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">SC 20% Eligible:</span>
                                                        <span className={`font-bold ${selectedCalcProduct?.sc_pwd_discountable ? 'text-emerald-600' : 'text-red-500'}`}>
                                                            {selectedCalcProduct?.sc_pwd_discountable ? 'YES (Medicine/Supply)' : 'NO (Standard Grocery)'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* RIGHT: COMPUTATION BREAKDOWN */}
                                            <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
                                                <div>
                                                    <span className="font-extrabold text-slate-800 text-sm block uppercase tracking-wider mb-3">
                                                        2. Step-by-Step Calculation
                                                    </span>

                                                    <div className="space-y-2.5 text-xs">
                                                        <div className="flex justify-between pb-1 border-b border-slate-100">
                                                            <span className="text-slate-600">Gross Price (₱{calcBasePrice.toFixed(2)} × {calcQuantity}):</span>
                                                            <span className="font-mono font-bold text-slate-800">
                                                                ₱{calcGrossTotal.toFixed(2)}
                                                            </span>
                                                        </div>

                                                        {isBeneficiary && isEligible && selectedCalcProduct?.is_vatable && (
                                                            <div className="flex justify-between text-purple-700 pb-1 border-b border-slate-100">
                                                                <span>Less 12% VAT Waiver (÷ 1.12):</span>
                                                                <span className="font-mono font-bold">
                                                                    -₱{calcVatRelief.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className="flex justify-between pb-1 border-b border-slate-100">
                                                            <span className="text-slate-600">Net of VAT Selling Base:</span>
                                                            <span className="font-mono font-bold text-slate-800">
                                                                ₱{calcNetOfVat.toFixed(2)}
                                                            </span>
                                                        </div>

                                                        <div className="flex justify-between text-amber-700 pb-1 border-b border-slate-100">
                                                            <span>Less Statutory 20% Discount:</span>
                                                            <span className="font-mono font-extrabold">
                                                                -₱{calcDiscountAmount.toFixed(2)}
                                                            </span>
                                                        </div>

                                                        {!selectedCalcProduct?.sc_pwd_discountable && isBeneficiary && (
                                                            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
                                                                ⚠️ <strong>Notice:</strong> This item is classified as a grocery item, so the 20% medical discount does not apply.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-slate-200 mt-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-extrabold text-slate-800 text-sm">
                                                            Total Due from Customer:
                                                        </span>
                                                        <span className="font-mono text-2xl font-black text-emerald-600">
                                                            ₱{calcFinalDue.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ),
                            },
                        ]}
                    />
                </div>
            </div>

            {/* CREATE / EDIT DISCOUNT RULE MODAL */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-base pb-2 border-b border-slate-100">
                        <PercentageOutlined className="text-emerald-600" />
                        <span>{editingDiscount ? 'Edit Discount Policy' : 'Create Custom Discount Rule'}</span>
                    </div>
                }
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                footer={null}
                width={520}
                className="rounded-2xl"
            >
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                            Rule Name * (e.g. Employee Discount, Holiday Promo)
                        </label>
                        <Input
                            placeholder="e.g. Holiday Weekend Promo"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            status={errors.name ? 'error' : ''}
                            className="rounded-xl"
                            required
                        />
                        {errors.name && <span className="text-xs text-red-600 mt-1 block">{errors.name}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                                Rule Code *
                            </label>
                            <Input
                                placeholder="HOLIDAY"
                                value={data.code}
                                disabled={Boolean(editingDiscount)}
                                onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                className="rounded-xl font-mono text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                                Discount Percentage (%) *
                            </label>
                            <InputNumber
                                min={0}
                                max={100}
                                value={data.percentage}
                                onChange={(val) => setData('percentage', val || 0)}
                                className="w-full rounded-xl"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                            Eligible Products
                        </label>
                        <Select
                            value={data.applies_to}
                            onChange={(val) => setData('applies_to', val)}
                            className="w-full"
                            options={[
                                { label: 'All Products (Medicines & Groceries)', value: 'all' },
                                { label: 'Medicines & Medical Supplies Only', value: 'medicines_and_supplies' },
                                { label: 'Groceries Only', value: 'groceries_only' },
                            ]}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                            Description / Policy Notes
                        </label>
                        <Input.TextArea
                            rows={3}
                            placeholder="e.g. Valid until Dec 31 for loyalty club members."
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="rounded-xl"
                        />
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                        <Button size="large" onClick={() => setIsCreateModalOpen(false)} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={processing}
                            className="bg-emerald-600 hover:bg-emerald-700 border-none font-bold rounded-xl px-6 shadow-sm"
                        >
                            {editingDiscount ? 'Update Policy' : 'Save Policy'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
