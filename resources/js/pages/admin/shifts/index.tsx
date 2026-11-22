import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import {
    Table,
    Card,
    Tag,
    Button,
    Input,
    Select,
    DatePicker,
    Space,
    Modal,
    Form,
    InputNumber,
    Tooltip,
    Typography,
    Tabs,
    Badge,
    Row,
    Col,
    Statistic,
    message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    ClockCircleOutlined,
    WalletOutlined,
    DownloadOutlined,
    DollarOutlined,
    SearchOutlined,
    FilterOutlined,
    ReloadOutlined,
    PrinterOutlined,
    ExclamationCircleOutlined,
    CheckCircleOutlined,
    PoweroffOutlined,
    FileTextOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import ShiftReadingSlip from '@/components/shift-reading-slip';
import type { CashierShift, ShiftCashDrop } from '@/types/pharmacy';

const { Title, Text } = Typography;

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface ShiftAuditIndexProps {
    shifts: PaginatedData<CashierShift>;
    metrics: {
        active_open_count: number;
        total_drawer_cash_active: number;
        total_completed_shifts: number;
        net_cash_variance: number;
        today_drops_total: number;
    };
    cashiers: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
    }>;
    filters: {
        cashier_id?: string;
        status?: string;
        discrepancy?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function ShiftAuditIndex({
    shifts,
    metrics,
    cashiers,
    filters,
}: ShiftAuditIndexProps) {
    // Filter states
    const [selectedCashier, setSelectedCashier] = useState<string | undefined>(filters.cashier_id);
    const [selectedStatus, setSelectedStatus] = useState<string | undefined>(filters.status);
    const [selectedDiscrepancy, setSelectedDiscrepancy] = useState<string | undefined>(filters.discrepancy);

    // Selected shift for viewing detailed Z-Reading
    const [activeSlipShift, setActiveSlipShift] = useState<CashierShift | null>(null);
    const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);

    // Admin force-close modal
    const [forceCloseShift, setForceCloseShift] = useState<CashierShift | null>(null);
    const [isForceCloseModalOpen, setIsForceCloseModalOpen] = useState(false);
    const [forceCloseForm] = Form.useForm();

    const handleApplyFilters = () => {
        router.get(
            '/admin/shifts',
            {
                cashier_id: selectedCashier || undefined,
                status: selectedStatus || undefined,
                discrepancy: selectedDiscrepancy || undefined,
            },
            { preserveState: true }
        );
    };

    const handleResetFilters = () => {
        setSelectedCashier(undefined);
        setSelectedStatus(undefined);
        setSelectedDiscrepancy(undefined);
        router.get('/admin/shifts');
    };

    const handleForceCloseSubmit = (values: any) => {
        if (!forceCloseShift) return;
        router.post(
            `/admin/shifts/${forceCloseShift.id}/force-close`,
            {
                closing_cash: values.closing_cash,
                admin_notes: values.admin_notes,
            },
            {
                onSuccess: () => {
                    setIsForceCloseModalOpen(false);
                    setForceCloseShift(null);
                    forceCloseForm.resetFields();
                    message.success('Shift was forcefully closed by administrator.');
                },
                onError: (err) => {
                    message.error(Object.values(err)[0] as string || 'Failed to force close shift');
                },
            }
        );
    };

    const columns: ColumnsType<CashierShift> = [
        {
            title: 'Shift # / Terminal',
            key: 'shift_id',
            width: 140,
            render: (_, record) => (
                <div>
                    <div className="font-mono font-bold text-slate-800 text-sm">
                        Shift #{record.id}
                    </div>
                    <Tag color="cyan" className="font-mono text-[10px] mt-0.5">
                        {record.device_terminal_id || 'TERM-01'}
                    </Tag>
                </div>
            ),
        },
        {
            title: 'Cashier',
            key: 'cashier',
            width: 180,
            render: (_, record) => (
                <div>
                    <p className="font-bold text-slate-800 text-sm m-0 leading-tight">
                        {record.cashier?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-500 m-0">{record.cashier?.email}</p>
                </div>
            ),
        },
        {
            title: 'Shift Period',
            key: 'period',
            width: 180,
            render: (_, record) => (
                <div className="text-xs space-y-0.5">
                    <div className="flex items-center gap-1 text-slate-600">
                        <span className="text-slate-400 font-medium">In:</span>
                        <span>{new Date(record.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(record.opened_at).toLocaleDateString([], { month: 'short', day: 'numeric' })})</span>
                    </div>
                    {record.closed_at ? (
                        <div className="flex items-center gap-1 text-slate-600">
                            <span className="text-slate-400 font-medium">Out:</span>
                            <span>{new Date(record.closed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(record.closed_at).toLocaleDateString([], { month: 'short', day: 'numeric' })})</span>
                        </div>
                    ) : (
                        <Tag color="processing" className="text-[10px] m-0">Currently In Session</Tag>
                    )}
                </div>
            ),
        },
        {
            title: 'Cash Float & Sales',
            key: 'sales',
            width: 200,
            render: (_, record) => (
                <div className="text-xs space-y-0.5">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Starting Float:</span>
                        <span className="font-semibold">₱{Number(record.opening_float).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Cash Sales:</span>
                        <span className="font-semibold text-emerald-600">₱{Number(record.cash_sales_total || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {Number(record.cash_drops_total || 0) > 0 && (
                        <div className="flex justify-between text-amber-600">
                            <span>Vault Drops:</span>
                            <span>-₱{Number(record.cash_drops_total).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Drawer Reconciliation',
            key: 'reconciliation',
            width: 220,
            render: (_, record) => {
                const diff = record.cash_difference !== null && record.cash_difference !== undefined ? Number(record.cash_difference) : null;
                return (
                    <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Expected:</span>
                            <span className="font-mono font-semibold">
                                ₱{Number(record.expected_cash || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        {record.closing_cash !== null && record.closing_cash !== undefined ? (
                            <div className="flex justify-between">
                                <span className="text-slate-500">Counted:</span>
                                <span className="font-mono font-semibold">
                                    ₱{Number(record.closing_cash).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        ) : null}
                        <div>
                            {record.status === 'open' ? (
                                <Tag color="blue" className="text-[10px] font-bold m-0">
                                    Drawer Open • In Progress
                                </Tag>
                            ) : diff !== null ? (
                                Math.abs(diff) < 0.01 ? (
                                    <Tag color="green" className="text-[10px] font-bold m-0 flex items-center gap-1 w-fit">
                                        <CheckCircleOutlined /> Balanced (₱0.00)
                                    </Tag>
                                ) : diff > 0 ? (
                                    <Tag color="gold" className="text-[10px] font-bold m-0 flex items-center gap-1 w-fit">
                                        <ExclamationCircleOutlined /> +₱{diff.toFixed(2)} Overage
                                    </Tag>
                                ) : (
                                    <Tag color="red" className="text-[10px] font-bold m-0 flex items-center gap-1 w-fit">
                                        <ExclamationCircleOutlined /> -₱{Math.abs(diff).toFixed(2)} Shortage
                                    </Tag>
                                )
                            ) : null}
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: 'open' | 'closed') => (
                status === 'open' ? (
                    <Badge status="processing" text={<span className="font-bold text-emerald-600 uppercase text-xs">Open</span>} />
                ) : (
                    <Badge status="default" text={<span className="font-medium text-slate-500 uppercase text-xs">Closed</span>} />
                )
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space orientation="horizontal" size="small">
                    <Button
                        size="small"
                        icon={<FileTextOutlined />}
                        onClick={() => {
                            setActiveSlipShift(record);
                            setIsSlipModalOpen(true);
                        }}
                    >
                        {record.status === 'open' ? 'X-Reading' : 'Z-Reading'}
                    </Button>

                    {record.status === 'open' && (
                        <Tooltip title="Emergency: Force Close Abandoned Shift">
                            <Button
                                size="small"
                                danger
                                icon={<PoweroffOutlined />}
                                onClick={() => {
                                    setForceCloseShift(record);
                                    forceCloseForm.setFieldsValue({
                                        closing_cash: Number(record.expected_cash || record.opening_float),
                                    });
                                    setIsForceCloseModalOpen(true);
                                }}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Home', href: '/admin/dashboard' },
                { title: 'Cashier Shifts & Cash Drawer Audit', href: '/admin/shifts' },
            ]}
        >
            <Head title="Cashier Shifts & Cash Drawer Audit - SAM PHARMA" />

            <div className="space-y-6">
                {/* PAGE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                                <ClockCircleOutlined className="text-xl" />
                            </div>
                            <div>
                                <Title level={4} className="!mb-0 !font-bold text-slate-800">
                                    Cashier Shifts & Cash Drawer Audit
                                </Title>
                                <Text className="text-slate-500 text-xs">
                                    X/Z-Readings, drawer starting float reconciliation, mid-shift vault drops, and over/short variance audit trail.
                                </Text>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => router.reload()}
                        >
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* KPI METRICS OVERVIEW */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="rounded-2xl border border-slate-200 shadow-xs bg-white">
                            <Statistic
                                title={<span className="text-xs font-semibold text-slate-500 uppercase">Active Drawers (In Session)</span>}
                                value={metrics.active_open_count}
                                valueStyle={{ color: metrics.active_open_count > 0 ? '#059669' : '#64748b', fontWeight: 'bold' }}
                                prefix={<ClockCircleOutlined />}
                                suffix={<span className="text-xs text-slate-400 font-normal">terminals</span>}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card className="rounded-2xl border border-slate-200 shadow-xs bg-white">
                            <Statistic
                                title={<span className="text-xs font-semibold text-slate-500 uppercase">Cash in Active Drawers</span>}
                                value={metrics.total_drawer_cash_active}
                                precision={2}
                                valueStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                                prefix="₱"
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card className="rounded-2xl border border-slate-200 shadow-xs bg-white">
                            <Statistic
                                title={<span className="text-xs font-semibold text-slate-500 uppercase">Today's Safe Drops</span>}
                                value={metrics.today_drops_total}
                                precision={2}
                                valueStyle={{ color: '#d97706', fontWeight: 'bold' }}
                                prefix="₱"
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card className="rounded-2xl border border-slate-200 shadow-xs bg-white">
                            <Statistic
                                title={<span className="text-xs font-semibold text-slate-500 uppercase">Net Shift Over / Short Variance</span>}
                                value={metrics.net_cash_variance}
                                precision={2}
                                valueStyle={{
                                    color: Math.abs(metrics.net_cash_variance) < 0.01 ? '#059669' : metrics.net_cash_variance > 0 ? '#d97706' : '#dc2626',
                                    fontWeight: 'bold',
                                }}
                                prefix={metrics.net_cash_variance > 0 ? '+₱' : '₱'}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* FILTER TOOLBAR */}
                <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="w-56">
                            <Select
                                placeholder="Filter by Cashier"
                                allowClear
                                value={selectedCashier}
                                onChange={(val) => setSelectedCashier(val)}
                                className="w-full"
                                options={cashiers.map((c) => ({
                                    value: String(c.id),
                                    label: `${c.name} (${c.role})`,
                                }))}
                            />
                        </div>

                        <div className="w-40">
                            <Select
                                placeholder="Shift Status"
                                allowClear
                                value={selectedStatus}
                                onChange={(val) => setSelectedStatus(val)}
                                className="w-full"
                                options={[
                                    { value: 'open', label: 'In Session (Open)' },
                                    { value: 'closed', label: 'Closed (Z-Reading)' },
                                ]}
                            />
                        </div>

                        <div className="w-48">
                            <Select
                                placeholder="Variance Audit"
                                allowClear
                                value={selectedDiscrepancy}
                                onChange={(val) => setSelectedDiscrepancy(val)}
                                className="w-full"
                                options={[
                                    { value: 'balanced', label: 'Balanced (₱0.00)' },
                                    { value: 'overage', label: 'Cash Overage (+)' },
                                    { value: 'shortage', label: 'Cash Shortage (-)' },
                                ]}
                            />
                        </div>

                        <Button
                            type="primary"
                            icon={<FilterOutlined />}
                            onClick={handleApplyFilters}
                            className="bg-emerald-600 hover:bg-emerald-500 font-semibold"
                        >
                            Filter
                        </Button>

                        <Button onClick={handleResetFilters}>
                            Reset
                        </Button>
                    </div>
                </Card>

                {/* SHIFTS TABLE */}
                <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden p-0">
                    <Table
                        columns={columns}
                        dataSource={shifts.data}
                        rowKey="id"
                        pagination={{
                            current: shifts.current_page,
                            pageSize: shifts.per_page,
                            total: shifts.total,
                            onChange: (page) => {
                                router.get(
                                    '/admin/shifts',
                                    {
                                        ...filters,
                                        page,
                                    },
                                    { preserveState: true }
                                );
                            },
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} cashier shifts`,
                        }}
                        className="overflow-x-auto"
                    />
                </Card>
            </div>

            {/* ========================================================================= */}
            {/* MODAL 1: VIEW DETAILED Z-READING / X-READING SLIP */}
            {/* ========================================================================= */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <FileTextOutlined className="text-emerald-600" />
                        <span>Shift #{activeSlipShift?.id} Official Reading Slip</span>
                    </div>
                }
                open={isSlipModalOpen}
                onCancel={() => {
                    setIsSlipModalOpen(false);
                    setActiveSlipShift(null);
                }}
                footer={null}
                width={420}
                destroyOnClose
            >
                {activeSlipShift && (
                    <ShiftReadingSlip
                        shift={activeSlipShift}
                        type={activeSlipShift.status === 'open' ? 'X-Reading' : 'Z-Reading'}
                    />
                )}
            </Modal>

            {/* ========================================================================= */}
            {/* MODAL 2: ADMIN FORCE CLOSE SHIFT */}
            {/* ========================================================================= */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-red-600 font-bold">
                        <ExclamationCircleOutlined />
                        <span>Admin Override: Force Close Shift #{forceCloseShift?.id}</span>
                    </div>
                }
                open={isForceCloseModalOpen}
                onCancel={() => {
                    setIsForceCloseModalOpen(false);
                    setForceCloseShift(null);
                }}
                footer={null}
                destroyOnClose
            >
                <div className="text-xs text-slate-500 mb-4">
                    Use this emergency action only if a cashier left without closing their shift or the workstation crashed. The shift will be marked as closed with an administrative audit stamp.
                </div>

                <Form form={forceCloseForm} layout="vertical" onFinish={handleForceCloseSubmit}>
                    <Form.Item
                        name="closing_cash"
                        label={<span className="font-semibold text-slate-700">Counted Cash in Drawer (₱ PHP)</span>}
                        rules={[{ required: true, message: 'Please enter actual drawer cash' }]}
                    >
                        <InputNumber
                            min={0}
                            precision={2}
                            prefix="₱"
                            className="w-full text-base font-bold"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="admin_notes"
                        label={<span className="font-semibold text-slate-700">Administrative Reason for Force-Close</span>}
                        rules={[{ required: true, message: 'Please provide justification for emergency closing' }]}
                    >
                        <Input.TextArea rows={3} placeholder="e.g. Cashier was called away on emergency; supervisor counted drawer physically." />
                    </Form.Item>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                        <Button onClick={() => setIsForceCloseModalOpen(false)}>Cancel</Button>
                        <Button type="primary" danger htmlType="submit" className="font-bold">
                            Confirm Force Close
                        </Button>
                    </div>
                </Form>
            </Modal>
        </AdminLayout>
    );
}
