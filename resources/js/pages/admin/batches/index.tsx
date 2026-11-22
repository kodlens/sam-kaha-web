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
    Popconfirm,
    Card,
    Tooltip,
    message,
    InputNumber,
    DatePicker,
    Alert,
    Row,
    Col,
    Statistic,
    Progress,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    HistoryOutlined,
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    ReloadOutlined,
    WarningOutlined,
    StopOutlined,
    CheckCircleOutlined,
    DollarOutlined,
    InboxOutlined,
    MedicineBoxOutlined,
    ShoppingCartOutlined,
    SafetyCertificateOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { Product, ProductBatch } from '@/types/pharmacy';

interface BatchesPageProps {
    batches: ProductBatch[];
    products: Product[];
    metrics: {
        totalBatches: number;
        totalUnitsInStock: number;
        totalInventoryValue: number;
        criticalExpiryCount: number;
        nearExpiryCount: number;
        expiredCount: number;
        quarantinedCount: number;
    };
    filters: {
        search: string;
        status: string;
        urgency: string;
        product_id: string;
    };
}

export default function BatchesIndex({
    batches,
    products,
    metrics,
    filters,
}: BatchesPageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [urgencyFilter, setUrgencyFilter] = useState(filters.urgency || '');

    const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [selectedBatchForAdjust, setSelectedBatchForAdjust] = useState<ProductBatch | null>(null);

    const {
        data: stockInData,
        setData: setStockInData,
        post: postStockIn,
        processing: stockInProcessing,
        errors: stockInErrors,
        reset: resetStockIn,
        clearErrors: clearStockInErrors,
    } = useForm({
        product_id: products[0]?.id || 1,
        batch_number: '',
        expiry_date: '',
        manufacturing_date: '',
        received_date: new Date().toISOString().split('T')[0],
        quantity_received: 100,
        unit_cost: 10.0,
        supplier_name: 'United Laboratories (Unilab)',
        supplier_invoice_no: '',
        notes: '',
    });

    const {
        data: adjustData,
        setData: setAdjustData,
        post: postAdjust,
        processing: adjustProcessing,
        errors: adjustErrors,
        reset: resetAdjust,
    } = useForm({
        quantity_remaining: 0,
        reason: 'Recount audit adjustment',
    });

    const handleSearch = (newUrgency?: string, newStatus?: string) => {
        router.get(
            '/admin/batches',
            {
                search: search || undefined,
                status: newStatus !== undefined ? (newStatus !== 'all' ? newStatus : undefined) : (statusFilter !== 'all' ? statusFilter : undefined),
                urgency: newUrgency !== undefined ? (newUrgency !== '' ? newUrgency : undefined) : (urgencyFilter !== '' ? urgencyFilter : undefined),
            },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setStatusFilter('all');
        setUrgencyFilter('');
        router.get('/admin/batches', {}, { preserveState: true, replace: true });
    };

    const openStockInModal = () => {
        clearStockInErrors();
        resetStockIn();
        const randomBatchNo = 'LOT-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);
        // Default expiry date 1 year from now
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        setStockInData({
            product_id: products[0]?.id || 1,
            batch_number: randomBatchNo,
            expiry_date: oneYearFromNow.toISOString().split('T')[0],
            manufacturing_date: new Date().toISOString().split('T')[0],
            received_date: new Date().toISOString().split('T')[0],
            quantity_received: 100,
            unit_cost: 12.0,
            supplier_name: 'United Laboratories (Unilab)',
            supplier_invoice_no: 'INV-' + Math.floor(10000 + Math.random() * 90000),
            notes: '',
        });
        setIsStockInModalOpen(true);
    };

    const handleStockInSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postStockIn('/admin/batches', {
            onSuccess: () => {
                message.success(`Stock received for Batch '${stockInData.batch_number}'.`);
                setIsStockInModalOpen(false);
            },
        });
    };

    const openAdjustModal = (batch: ProductBatch) => {
        setSelectedBatchForAdjust(batch);
        setAdjustData({
            quantity_remaining: batch.quantity_remaining,
            reason: 'Physical count audit reconciliation',
        });
        setIsAdjustModalOpen(true);
    };

    const handleAdjustSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBatchForAdjust) return;

        postAdjust(`/admin/batches/${selectedBatchForAdjust.id}/adjust`, {
            onSuccess: () => {
                message.success(`Stock updated for Batch '${selectedBatchForAdjust.batch_number}'.`);
                setIsAdjustModalOpen(false);
            },
        });
    };

    const handleToggleQuarantine = (batch: ProductBatch) => {
        router.patch(
            `/admin/batches/${batch.id}/quarantine`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    message.success(`Quarantine status updated for Batch '${batch.batch_number}'.`);
                },
            }
        );
    };

    const columns: ColumnsType<ProductBatch> = [
        {
            title: 'Product & Formulation',
            key: 'product',
            render: (_: any, record: ProductBatch) => {
                const prod = record.product;
                const isMed = prod?.product_type === 'medicine';

                return (
                    <div className="flex items-start gap-3">
                        <div
                            className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-base shrink-0 mt-0.5 ${
                                isMed ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                            }`}
                        >
                            {isMed ? <MedicineBoxOutlined /> : <ShoppingCartOutlined />}
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-slate-900 text-sm">
                                    {prod?.brand_name || 'Product'}
                                </span>
                                {prod?.dosage_strength && (
                                    <Tag className="text-[10px] font-bold m-0 bg-slate-100 text-slate-700">
                                        {prod.dosage_strength}
                                    </Tag>
                                )}
                            </div>
                            <div className="text-xs text-slate-500 italic">
                                {isMed ? prod?.generic_name : prod?.category}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                                SKU: {prod?.sku}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Batch / Lot No.',
            dataIndex: 'batch_number',
            key: 'batch_number',
            render: (batchNo: string, record: ProductBatch) => (
                <div>
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200">
                        {batchNo}
                    </span>
                    {record.supplier_invoice_no && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Ref: {record.supplier_invoice_no}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Expiration & FEFO Priority',
            key: 'expiry_date',
            render: (_: any, record: any) => {
                const days = record.days_until_expiry;
                const isExpired = days <= 0;
                const isCritical = days > 0 && days <= 30;
                const isWarning = days > 30 && days <= 90;

                return (
                    <div>
                        <div className="font-semibold text-xs text-slate-800">
                            {new Date(record.expiry_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </div>
                        <div className="mt-0.5">
                            {isExpired ? (
                                <Tag color="error" className="font-bold text-[10px] m-0">
                                    Expired ({Math.abs(days)}d ago)
                                </Tag>
                            ) : isCritical ? (
                                <Tag color="red" className="font-bold text-[10px] m-0 animate-pulse">
                                    🚨 Expires in {days}d (FEFO #1)
                                </Tag>
                            ) : isWarning ? (
                                <Tag color="warning" className="font-bold text-[10px] m-0">
                                    ⚠️ {days} days left
                                </Tag>
                            ) : (
                                <Tag color="success" className="font-medium text-[10px] m-0">
                                    Good ({days}d remaining)
                                </Tag>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Stock Remaining',
            key: 'stock',
            render: (_: any, record: any) => {
                const remaining = record.quantity_remaining;
                const received = record.quantity_received || remaining;
                const percent = Math.min(100, Math.round((remaining / received) * 100));

                return (
                    <div className="w-32">
                        <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-800 mb-0.5">
                            <span>{remaining} pcs</span>
                            <span className="text-[10px] text-slate-400">/{received}</span>
                        </div>
                        <Progress
                            percent={percent}
                            size="small"
                            showInfo={false}
                            strokeColor={remaining <= 10 ? '#ef4444' : percent <= 30 ? '#f59e0b' : '#10b981'}
                        />
                    </div>
                );
            },
        },
        {
            title: 'Cost & Valuation',
            key: 'cost',
            render: (_: any, record: any) => (
                <div className="font-mono text-xs">
                    <span className="text-slate-500 block">₱{Number(record.unit_cost).toFixed(2)}/pc</span>
                    <span className="font-bold text-slate-800 block mt-0.5">
                        ₱{(Number(record.unit_cost) * record.quantity_remaining).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </span>
                </div>
            ),
        },
        {
            title: 'Dispensing Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: any) => {
                if (status === 'quarantined') {
                    return (
                        <Tag color="purple" className="font-bold text-xs flex items-center gap-1 w-fit">
                            <StopOutlined /> Quarantined
                        </Tag>
                    );
                }
                if (record.days_until_expiry <= 0 || status === 'expired') {
                    return (
                        <Tag color="red" className="font-bold text-xs">
                            ❌ Expired (Locked)
                        </Tag>
                    );
                }
                if (record.quantity_remaining <= 0 || status === 'depleted') {
                    return (
                        <Tag color="default" className="text-xs">
                            Depleted
                        </Tag>
                    );
                }
                if (record.days_until_expiry <= 90) {
                    return (
                        <Tag color="gold" className="font-bold text-xs">
                            Near Expiry
                        </Tag>
                    );
                }
                return (
                    <Tag color="green" className="font-semibold text-xs">
                        Active (Sellable)
                    </Tag>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'right',
            render: (_: any, record: ProductBatch) => (
                <Space size="small">
                    <Tooltip title="Stock Count Adjustment">
                        <Button
                            size="small"
                            onClick={() => openAdjustModal(record)}
                            className="text-xs font-semibold rounded-lg"
                        >
                            Adjust
                        </Button>
                    </Tooltip>

                    <Tooltip title={record.status === 'quarantined' ? 'Lift Quarantine' : 'Quarantine Batch'}>
                        <Button
                            size="small"
                            type={record.status === 'quarantined' ? 'primary' : 'default'}
                            danger={record.status !== 'quarantined'}
                            onClick={() => handleToggleQuarantine(record)}
                            className="text-xs rounded-lg font-semibold"
                        >
                            {record.status === 'quarantined' ? 'Unlock' : 'Quarantine'}
                        </Button>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <AdminLayout
            breadcrumbs={[
                {
                    title: 'Batches & Expiry (FEFO)',
                    href: '/admin/batches',
                },
            ]}
        >
            <Head title="Batches & Expiry Management (FEFO) - SAM PHARMA" />

            <div className="space-y-5">
                {/* PAGE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Tag color="amber" className="font-bold text-[10px] uppercase m-0">
                                FEFO Inventory Engine
                            </Tag>
                            <span className="text-xs text-slate-400 font-semibold">
                                Module 4
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 m-0">
                            Batch / Lot & Expiry Management
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm mt-0.5 m-0">
                            First-Expired, First-Out (FEFO) dispensing order, expiration alerts, quarantine containment, and stock valuation.
                        </p>
                    </div>

                    <div>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            size="large"
                            onClick={openStockInModal}
                            className="bg-emerald-600 hover:bg-emerald-700 font-bold border-none rounded-xl h-11 px-5 shadow-sm"
                        >
                            Receive Stock (New Batch)
                        </Button>
                    </div>
                </div>

                {/* CRITICAL EXPIRY ALERT BANNER */}
                {(metrics.criticalExpiryCount > 0 || metrics.expiredCount > 0) && (
                    <Alert
                        type="error"
                        showIcon
                        icon={<WarningOutlined className="text-xl" />}
                        message={
                            <span className="font-bold text-sm text-red-950">
                                Urgent Expiry Notification: {metrics.criticalExpiryCount} batch(es) expiring in $\le 30$ days and {metrics.expiredCount} expired batch(es) detected.
                            </span>
                        }
                        description="Under Philippine FDA guidelines, expired medications must immediately be segregated into the Quarantine Bin and removed from active cashier dispensing."
                        className="rounded-2xl border-red-300 bg-red-50/90 shadow-xs"
                    />
                )}

                {/* SUMMARY METRIC KPI CARDS */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="rounded-2xl border-slate-200 shadow-xs">
                            <Statistic
                                title={<span className="font-bold text-slate-500 text-xs uppercase">Inventory Valuation</span>}
                                value={metrics.totalInventoryValue}
                                precision={2}
                                prefix={<span className="text-emerald-600 font-bold mr-1">₱</span>}
                                valueStyle={{ fontWeight: 900, color: '#0f172a' }}
                            />
                            <div className="mt-2 text-xs text-slate-400">
                                Across {metrics.totalUnitsInStock} total units on hand
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card className="rounded-2xl border-slate-200 shadow-xs">
                            <Statistic
                                title={<span className="font-bold text-slate-500 text-xs uppercase">Critical Expiry (≤ 30 Days)</span>}
                                value={metrics.criticalExpiryCount}
                                prefix={<WarningOutlined className="text-red-500 mr-1" />}
                                valueStyle={{ fontWeight: 900, color: metrics.criticalExpiryCount > 0 ? '#dc2626' : '#0f172a' }}
                            />
                            <div className="mt-2 text-xs text-slate-400">
                                Immediate priority dispensing
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card className="rounded-2xl border-slate-200 shadow-xs">
                            <Statistic
                                title={<span className="font-bold text-slate-500 text-xs uppercase">Near Expiry (≤ 90 Days)</span>}
                                value={metrics.nearExpiryCount}
                                prefix={<HistoryOutlined className="text-amber-500 mr-1" />}
                                valueStyle={{ fontWeight: 900, color: metrics.nearExpiryCount > 0 ? '#d97706' : '#0f172a' }}
                            />
                            <div className="mt-2 text-xs text-slate-400">
                                Monitor for supplier returns
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card className="rounded-2xl border-slate-200 shadow-xs">
                            <Statistic
                                title={<span className="font-bold text-slate-500 text-xs uppercase">Expired / Quarantined</span>}
                                value={metrics.expiredCount + metrics.quarantinedCount}
                                prefix={<StopOutlined className="text-purple-600 mr-1" />}
                                valueStyle={{
                                    fontWeight: 900,
                                    color: (metrics.expiredCount + metrics.quarantinedCount) > 0 ? '#7e22ce' : '#0f172a',
                                }}
                            />
                            <div className="mt-2 text-xs text-slate-400">
                                Segregated from POS
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* SEARCH & FILTER BAR */}
                <Card className="rounded-2xl border-slate-200 shadow-xs" styles={{ body: { padding: '16px' } }}>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-5">
                            <Input
                                placeholder="Search by batch number, medicine name, supplier, or invoice..."
                                prefix={<SearchOutlined className="text-slate-400" />}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onPressEnter={() => handleSearch()}
                                className="rounded-xl"
                                allowClear
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <Select
                                placeholder="Filter Expiry Urgency"
                                value={urgencyFilter || undefined}
                                onChange={(val) => {
                                    setUrgencyFilter(val || '');
                                    handleSearch(val || '', statusFilter);
                                }}
                                className="w-full"
                                allowClear
                                options={[
                                    { label: 'All Urgencies', value: '' },
                                    { label: '🚨 Critical (≤ 30 Days Left)', value: '30_days' },
                                    { label: '⚠️ Warning (≤ 60 Days Left)', value: '60_days' },
                                    { label: '⚠️ Advisory (≤ 90 Days Left)', value: '90_days' },
                                ]}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <Select
                                placeholder="Status"
                                value={statusFilter !== 'all' ? statusFilter : undefined}
                                onChange={(val) => {
                                    setStatusFilter(val || 'all');
                                    handleSearch(urgencyFilter, val || 'all');
                                }}
                                className="w-full"
                                allowClear
                                options={[
                                    { label: 'All Statuses', value: 'all' },
                                    { label: 'Active', value: 'active' },
                                    { label: 'Near Expiry', value: 'near_expiry' },
                                    { label: 'Expired', value: 'expired' },
                                    { label: 'Quarantined', value: 'quarantined' },
                                ]}
                            />
                        </div>

                        <div className="sm:col-span-2 flex items-center gap-2">
                            <Button
                                type="primary"
                                onClick={() => handleSearch()}
                                className="bg-slate-800 hover:bg-slate-900 border-none font-bold rounded-xl flex-1"
                            >
                                Filter
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleReset}
                                className="rounded-xl"
                                title="Reset Filters"
                            />
                        </div>
                    </div>
                </Card>

                {/* BATCHES TABLE */}
                <Card className="rounded-2xl border-slate-200 shadow-xs overflow-hidden" styles={{ body: { padding: 0 } }}>
                    <Table
                        columns={columns}
                        dataSource={batches}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showTotal: (total) => `Total ${total} inventory batches tracked`,
                        }}
                    />
                </Card>
            </div>

            {/* RECEIVE STOCK (NEW BATCH) MODAL */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-base pb-2 border-b border-slate-100">
                        <InboxOutlined className="text-emerald-600 text-lg" />
                        <span>Receive New Inventory Stock (Batch Inflow)</span>
                    </div>
                }
                open={isStockInModalOpen}
                onCancel={() => setIsStockInModalOpen(false)}
                footer={null}
                width={680}
                className="rounded-2xl"
            >
                <form onSubmit={handleStockInSubmit} className="space-y-4 pt-2">
                    {/* PRODUCT SELECTOR */}
                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                            Select Product *
                        </label>
                        <Select
                            size="large"
                            showSearch
                            optionFilterProp="label"
                            value={stockInData.product_id}
                            onChange={(val) => setStockInData('product_id', val)}
                            className="w-full"
                            options={products.map((p) => ({
                                label: `${p.brand_name} ${p.generic_name ? `(${p.generic_name})` : ''} ${p.dosage_strength || ''}`,
                                value: p.id,
                            }))}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                                Batch / Lot Number * (from box packaging)
                            </label>
                            <Input
                                size="large"
                                placeholder="e.g. LOT-2026-B10"
                                value={stockInData.batch_number}
                                onChange={(e) => setStockInData('batch_number', e.target.value.toUpperCase())}
                                status={stockInErrors.batch_number ? 'error' : ''}
                                className="rounded-xl font-mono text-sm"
                                required
                            />
                            {stockInErrors.batch_number && (
                                <span className="text-xs text-red-600 mt-1 block">{stockInErrors.batch_number}</span>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                                Expiration Date * (Must be in the future)
                            </label>
                            <Input
                                size="large"
                                type="date"
                                value={stockInData.expiry_date}
                                onChange={(e) => setStockInData('expiry_date', e.target.value)}
                                status={stockInErrors.expiry_date ? 'error' : ''}
                                className="rounded-xl"
                                required
                            />
                            {stockInErrors.expiry_date && (
                                <span className="text-xs text-red-600 mt-1 block">{stockInErrors.expiry_date}</span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                                Quantity Received * (In Base Units / Pieces)
                            </label>
                            <InputNumber
                                size="large"
                                min={1}
                                value={stockInData.quantity_received}
                                onChange={(val) => setStockInData('quantity_received', val || 1)}
                                className="w-full rounded-xl"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                                Unit Cost Price * (₱ per base unit)
                            </label>
                            <InputNumber
                                size="large"
                                min={0}
                                step={0.25}
                                value={stockInData.unit_cost}
                                onChange={(val) => setStockInData('unit_cost', val || 0)}
                                className="w-full rounded-xl font-mono font-bold"
                                prefix="₱"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                                Pharmaceutical Supplier
                            </label>
                            <Input
                                size="large"
                                placeholder="e.g. United Laboratories / Zuellig Pharma"
                                value={stockInData.supplier_name}
                                onChange={(e) => setStockInData('supplier_name', e.target.value)}
                                className="rounded-xl"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                                Delivery Receipt / Invoice No.
                            </label>
                            <Input
                                size="large"
                                placeholder="e.g. INV-99014"
                                value={stockInData.supplier_invoice_no}
                                onChange={(e) => setStockInData('supplier_invoice_no', e.target.value)}
                                className="rounded-xl font-mono text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                            Receiving Notes / Storage Location
                        </label>
                        <Input.TextArea
                            rows={2}
                            placeholder="e.g. Stored in Main Shelf Bay B-2."
                            value={stockInData.notes}
                            onChange={(e) => setStockInData('notes', e.target.value)}
                            className="rounded-xl"
                        />
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                        <Button size="large" onClick={() => setIsStockInModalOpen(false)} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={stockInProcessing}
                            className="bg-emerald-600 hover:bg-emerald-700 border-none font-bold rounded-xl px-6 shadow-sm"
                        >
                            Confirm Stock-In
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* STOCK RECONCILIATION / ADJUSTMENT MODAL */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-base pb-2 border-b border-slate-100">
                        <EditOutlined className="text-amber-500" />
                        <span>Adjust Stock Quantity — Lot: {selectedBatchForAdjust?.batch_number}</span>
                    </div>
                }
                open={isAdjustModalOpen}
                onCancel={() => setIsAdjustModalOpen(false)}
                footer={null}
                width={480}
                className="rounded-2xl"
            >
                <form onSubmit={handleAdjustSubmit} className="space-y-4 pt-2">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div>
                            <span className="text-slate-500">Product:</span>{' '}
                            <span className="font-bold text-slate-800">{selectedBatchForAdjust?.product?.brand_name}</span>
                        </div>
                        <div>
                            <span className="text-slate-500">Current Recorded Stock:</span>{' '}
                            <span className="font-mono font-bold text-slate-800">{selectedBatchForAdjust?.quantity_remaining} pcs</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                            New Physical Count Quantity *
                        </label>
                        <InputNumber
                            size="large"
                            min={0}
                            value={adjustData.quantity_remaining}
                            onChange={(val) => setAdjustData('quantity_remaining', val || 0)}
                            className="w-full rounded-xl"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                            Reason for Stock Adjustment *
                        </label>
                        <Select
                            size="large"
                            value={adjustData.reason}
                            onChange={(val) => setAdjustData('reason', val)}
                            className="w-full"
                            options={[
                                { label: 'Physical count audit reconciliation', value: 'Physical count audit reconciliation' },
                                { label: 'Damaged / broken ampoule or bottle', value: 'Damaged / broken ampoule or bottle' },
                                { label: 'Supplier return / recall', value: 'Supplier return / recall' },
                                { label: 'Expired medicine write-off disposal', value: 'Expired medicine write-off disposal' },
                                { label: 'Inventory theft / shrinkage', value: 'Inventory theft / shrinkage' },
                            ]}
                        />
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                        <Button size="large" onClick={() => setIsAdjustModalOpen(false)} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={adjustProcessing}
                            className="bg-slate-900 hover:bg-black border-none font-bold rounded-xl px-6 shadow-sm"
                        >
                            Save Adjustment
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
