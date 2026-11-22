import React, { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Layout,
    Button,
    Avatar,
    Dropdown,
    Tag,
    Modal,
    Input,
    InputNumber,
    Form,
    Select,
    message,
    Tooltip,
} from 'antd';
import type { MenuProps } from 'antd';
import {
    LogoutOutlined,
    ClockCircleOutlined,
    DashboardOutlined,
    DownloadOutlined,
    FileTextOutlined,
    PoweroffOutlined,
    WalletOutlined,
    PlusCircleOutlined,
} from '@ant-design/icons';
import PharmaLogo from '@/components/pharma-logo';
import ShiftReadingSlip from '@/components/shift-reading-slip';
import type { User } from '@/types';
import type { CashierShift } from '@/types/pharmacy';

const { Header, Content } = Layout;

export interface CashierLayoutProps {
    children: React.ReactNode;
    title?: string;
    shiftInfo?: CashierShift | null;
}

export default function CashierLayout({
    children,
    title = 'POS Terminal',
    shiftInfo = null,
}: CashierLayoutProps) {
    const page = usePage<{ auth?: { user?: User }; flash?: { success?: string; error?: string } }>();
    const user = page.props.auth?.user;

    const [currentTime, setCurrentTime] = useState<string>('');

    // Modal states
    const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState(false);
    const [isCashDropModalOpen, setIsCashDropModalOpen] = useState(false);
    const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false);
    const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
    const [readingType, setReadingType] = useState<'X-Reading' | 'Z-Reading'>('X-Reading');

    // Forms
    const [openShiftForm] = Form.useForm();
    const [cashDropForm] = Form.useForm();
    const [closeShiftForm] = Form.useForm();

    // Denomination breakdown state for End Shift modal
    const [denominations, setDenominations] = useState<{
        d1000: number;
        d500: number;
        d200: number;
        d100: number;
        d50: number;
        d20: number;
        coins: number;
    }>({
        d1000: 0,
        d500: 0,
        d200: 0,
        d100: 0,
        d50: 0,
        d20: 0,
        coins: 0,
    });

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(
                now.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                })
            );
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
        router.post('/logout');
    };

    // Calculate counted total from denominations
    const calculatedClosingCash =
        denominations.d1000 * 1000 +
        denominations.d500 * 500 +
        denominations.d200 * 200 +
        denominations.d100 * 100 +
        denominations.d50 * 50 +
        denominations.d20 * 20 +
        (Number(denominations.coins) || 0);

    const expectedCashValue = shiftInfo
        ? Number(shiftInfo.expected_cash ?? Number(shiftInfo.opening_float) + Number(shiftInfo.cash_sales_total || 0) - Number(shiftInfo.cash_drops_total || 0))
        : 0;

    const countedDiff = calculatedClosingCash - expectedCashValue;

    // Handle Open Shift submission
    const handleOpenShift = (values: any) => {
        router.post(
            '/cashier/shifts/open',
            {
                opening_float: values.opening_float,
                device_terminal_id: values.device_terminal_id || 'TERM-01',
                notes: values.notes,
            },
            {
                onSuccess: () => {
                    setIsOpenShiftModalOpen(false);
                    openShiftForm.resetFields();
                    message.success('Shift opened successfully!');
                },
                onError: (errors) => {
                    message.error(Object.values(errors)[0] as string || 'Failed to open shift');
                },
            }
        );
    };

    // Handle Cash Drop submission
    const handleCashDrop = (values: any) => {
        if (!shiftInfo) return;
        router.post(
            `/cashier/shifts/${shiftInfo.id}/drop`,
            {
                type: values.type,
                amount: values.amount,
                reason: values.reason,
                manager_pin: values.manager_pin,
            },
            {
                onSuccess: () => {
                    setIsCashDropModalOpen(false);
                    cashDropForm.resetFields();
                    message.success('Cash movement recorded successfully!');
                },
                onError: (errors) => {
                    message.error(Object.values(errors)[0] as string || 'Failed to record cash drop');
                },
            }
        );
    };

    // Handle Close Shift submission
    const handleCloseShift = (values: any) => {
        if (!shiftInfo) return;
        router.post(
            `/cashier/shifts/${shiftInfo.id}/close`,
            {
                closing_cash: calculatedClosingCash > 0 ? calculatedClosingCash : values.manual_closing_cash,
                denomination_breakdown: {
                    '1000': denominations.d1000,
                    '500': denominations.d500,
                    '200': denominations.d200,
                    '100': denominations.d100,
                    '50': denominations.d50,
                    '20': denominations.d20,
                    'coins': denominations.coins,
                },
                notes: values.notes,
            },
            {
                onSuccess: () => {
                    setIsCloseShiftModalOpen(false);
                    closeShiftForm.resetFields();
                    message.success('Shift closed successfully. Z-Reading report generated.');
                },
                onError: (errors) => {
                    message.error(Object.values(errors)[0] as string || 'Failed to close shift');
                },
            }
        );
    };

    const userDropdownItems: MenuProps['items'] = [
        {
            key: 'info',
            label: (
                <div className="py-1 px-1">
                    <p className="font-bold text-slate-800 text-sm m-0 leading-tight">{user?.name}</p>
                    <p className="text-xs text-slate-500 m-0 mt-0.5">{user?.email}</p>
                    <div className="mt-1.5 flex items-center gap-1">
                        <Tag color="cyan" className="text-[10px] font-bold m-0 uppercase">
                            Cashier
                        </Tag>
                        {user?.role === 'admin' && (
                            <Tag color="geekblue" className="text-[10px] font-bold m-0 uppercase">
                                Admin Access
                            </Tag>
                        )}
                    </div>
                </div>
            ),
            disabled: true,
        },
        { type: 'divider' },
        ...(user?.role === 'admin'
            ? [
                  {
                      key: 'admin-dashboard',
                      icon: <DashboardOutlined className="text-emerald-600" />,
                      label: <Link href="/admin/dashboard">Go to Admin Hub</Link>,
                  },
                  {
                      key: 'admin-shifts',
                      icon: <ClockCircleOutlined className="text-cyan-600" />,
                      label: <Link href="/admin/shifts">Shift Audit History</Link>,
                  },
                  { type: 'divider' as const },
              ]
            : []),
        {
            key: 'logout',
            icon: <LogoutOutlined className="text-red-500" />,
            label: <span className="text-red-600 font-semibold">Sign Out</span>,
            onClick: handleLogout,
        },
    ];

    const drawerActionsMenu: MenuProps['items'] = [
        {
            key: 'drop',
            icon: <DownloadOutlined className="text-amber-500" />,
            label: 'Record Cash Drop / Payout',
            onClick: () => setIsCashDropModalOpen(true),
        },
        {
            key: 'x-reading',
            icon: <FileTextOutlined className="text-teal-500" />,
            label: 'View / Print X-Reading Slip',
            onClick: () => {
                setReadingType('X-Reading');
                setIsReadingModalOpen(true);
            },
        },
        { type: 'divider' },
        {
            key: 'close-shift',
            icon: <PoweroffOutlined className="text-red-500" />,
            label: <span className="text-red-600 font-bold">End Shift & Z-Reading</span>,
            onClick: () => setIsCloseShiftModalOpen(true),
        },
    ];

    return (
        <Layout className="min-h-screen bg-slate-900 font-sans flex flex-col">
            {/* CASHIER TOP BAR */}
            <Header className="bg-slate-950 px-4 sm:px-6 h-16 border-b border-slate-800 flex items-center justify-between z-30 shrink-0">
                {/* BRAND & POS TITLE */}
                <div className="flex items-center gap-4">
                    <Link href="/cashier/pos" className="flex items-center">
                        <PharmaLogo variant="light" />
                    </Link>

                    <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800">
                        <Tag color="cyan" className="font-bold text-xs uppercase px-2 py-0.5">
                            Terminal Active
                        </Tag>
                        <span className="text-slate-400 text-xs font-semibold">
                            {title}
                        </span>
                    </div>
                </div>

                {/* SHIFT & TIME STATUS */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Live Clock */}
                    <div className="hidden md:flex items-center gap-2 text-slate-300 text-xs font-mono bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                        <ClockCircleOutlined className="text-emerald-400" />
                        <span>{currentTime}</span>
                    </div>

                    {/* SHIFT CONTROLS */}
                    {shiftInfo?.status === 'open' ? (
                        <div className="flex items-center gap-2">
                            {/* Drawer Cash Pill */}
                            <Tooltip title="Current Cash in Register Drawer (Float + Cash Sales - Drops)">
                                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 font-mono text-xs">
                                    <WalletOutlined className="text-emerald-400" />
                                    <span>Drawer: ₱{Number(shiftInfo.current_drawer_cash || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </Tooltip>

                            {/* Dropdown Action Pill */}
                            <Dropdown menu={{ items: drawerActionsMenu }} trigger={['click']} placement="bottomRight">
                                <Button
                                    size="small"
                                    type="primary"
                                    className="bg-emerald-600 hover:bg-emerald-500 font-bold text-xs h-8 flex items-center gap-1 shadow-sm"
                                >
                                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                    <span>Shift #{shiftInfo.id} Active</span>
                                </Button>
                            </Dropdown>
                        </div>
                    ) : (
                        <Button
                            type="primary"
                            icon={<PlusCircleOutlined />}
                            onClick={() => setIsOpenShiftModalOpen(true)}
                            className="bg-amber-600 hover:bg-amber-500 border-amber-500 text-white font-bold text-xs h-8 shadow-sm flex items-center gap-1"
                        >
                            Open Shift & Starting Float
                        </Button>
                    )}

                    {/* Cashier Account Dropdown */}
                    <Dropdown menu={{ items: userDropdownItems }} trigger={['click']} placement="bottomRight">
                        <div className="flex items-center gap-2 cursor-pointer py-1 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors select-none text-white">
                            <Avatar className="bg-emerald-600 text-white font-bold text-xs h-7 w-7">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
                            </Avatar>
                            <span className="hidden sm:block text-xs font-bold truncate max-w-[120px]">
                                {user?.name || 'Cashier'}
                            </span>
                        </div>
                    </Dropdown>
                </div>
            </Header>

            {/* MAIN CASHIER WORKSPACE */}
            <Content className="flex-1 flex flex-col p-3 sm:p-4 bg-slate-950 overflow-hidden">
                {children}
            </Content>

            {/* ========================================================================= */}
            {/* MODAL 1: OPEN SHIFT & STARTING FLOAT */}
            {/* ========================================================================= */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                        <WalletOutlined className="text-emerald-600" />
                        <span>Open Cashier Shift & Starting Float</span>
                    </div>
                }
                open={isOpenShiftModalOpen}
                onCancel={() => setIsOpenShiftModalOpen(false)}
                footer={null}
                destroyOnClose
            >
                <div className="mt-2 text-xs text-slate-500 mb-4">
                    Count and record the initial cash float (small bills & coins) placed in the cash register drawer before opening POS sales.
                </div>

                <Form form={openShiftForm} layout="vertical" onFinish={handleOpenShift} initialValues={{ opening_float: 2000, device_terminal_id: 'TERM-01' }}>
                    <Form.Item
                        name="opening_float"
                        label={<span className="font-semibold text-slate-700">Starting Cash Float (₱ PHP)</span>}
                        rules={[{ required: true, message: 'Please enter starting float amount' }]}
                    >
                        <InputNumber
                            min={0}
                            step={50}
                            precision={2}
                            prefix="₱"
                            className="w-full text-lg font-bold"
                            size="large"
                        />
                    </Form.Item>

                    {/* Quick Float Presets */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs text-slate-500">Quick Presets:</span>
                        {[1000, 2000, 2500, 5000].map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                onClick={() => openShiftForm.setFieldsValue({ opening_float: preset })}
                                className="px-2.5 py-1 text-xs font-bold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
                            >
                                ₱{preset.toLocaleString()}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Form.Item
                            name="device_terminal_id"
                            label={<span className="font-semibold text-slate-700">Terminal ID</span>}
                        >
                            <Select
                                options={[
                                    { value: 'TERM-01', label: 'TERM-01 (Main Counter)' },
                                    { value: 'TERM-02', label: 'TERM-02 (Express / OTC)' },
                                    { value: 'TERM-03', label: 'TERM-03 (Drive-Thru / Night)' },
                                ]}
                            />
                        </Form.Item>

                        <Form.Item
                            name="notes"
                            label={<span className="font-semibold text-slate-700">Shift Notes (Optional)</span>}
                        >
                            <Input placeholder="e.g. Morning Opening" />
                        </Form.Item>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                        <Button onClick={() => setIsOpenShiftModalOpen(false)}>Cancel</Button>
                        <Button type="primary" htmlType="submit" className="bg-emerald-600 hover:bg-emerald-500 font-bold">
                            Open Shift & Start POS
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* ========================================================================= */}
            {/* MODAL 2: CASH DROP / PETTY CASH OUT */}
            {/* ========================================================================= */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                        <DownloadOutlined className="text-amber-600" />
                        <span>Record Cash Drop / Cash Disbursement</span>
                    </div>
                }
                open={isCashDropModalOpen}
                onCancel={() => setIsCashDropModalOpen(false)}
                footer={null}
                destroyOnClose
            >
                <div className="mt-2 text-xs text-slate-500 mb-4">
                    Record cash removed from the drawer for safe drops, store emergency expenses, or change replenishment.
                </div>

                <Form form={cashDropForm} layout="vertical" onFinish={handleCashDrop} initialValues={{ type: 'drop_to_vault' }}>
                    <Form.Item
                        name="type"
                        label={<span className="font-semibold text-slate-700">Movement Type</span>}
                        rules={[{ required: true }]}
                    >
                        <Select
                            options={[
                                { value: 'drop_to_vault', label: 'Vault Drop (Excess Cash to Safe)' },
                                { value: 'petty_cash_expense', label: 'Petty Cash Expense (Supplies/Store emergency)' },
                                { value: 'float_replenishment', label: 'Float Replenishment (Adding change from safe)' },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="amount"
                        label={<span className="font-semibold text-slate-700">Amount (₱ PHP)</span>}
                        rules={[{ required: true, message: 'Please enter drop amount' }]}
                    >
                        <InputNumber
                            min={0.01}
                            precision={2}
                            prefix="₱"
                            className="w-full text-base font-bold"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="reason"
                        label={<span className="font-semibold text-slate-700">Reason / Description</span>}
                        rules={[{ required: true, message: 'Please specify reason for cash movement' }]}
                    >
                        <Input placeholder="e.g. Excess cash drop to manager vault, or bought thermal rolls" />
                    </Form.Item>

                    <Form.Item
                        name="manager_pin"
                        label={<span className="font-semibold text-slate-700">Manager Authorization PIN (Optional)</span>}
                    >
                        <Input.Password maxLength={6} placeholder="Enter 4-digit supervisor PIN if required" />
                    </Form.Item>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                        <Button onClick={() => setIsCashDropModalOpen(false)}>Cancel</Button>
                        <Button type="primary" htmlType="submit" className="bg-amber-600 hover:bg-amber-500 font-bold">
                            Confirm Cash Movement
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* ========================================================================= */}
            {/* MODAL 3: END SHIFT & Z-READING (DENOMINATION COUNT) */}
            {/* ========================================================================= */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                        <PoweroffOutlined className="text-red-600" />
                        <span>End Shift & Perform Official Z-Reading</span>
                    </div>
                }
                open={isCloseShiftModalOpen}
                onCancel={() => setIsCloseShiftModalOpen(false)}
                footer={null}
                width={620}
                destroyOnClose
            >
                <div className="mt-1 text-xs text-slate-500 mb-3">
                    Perform physical cash count of drawer bills and coins. The system compares counted total against expected drawer cash to record any overage or shortage.
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 m-0">System Expected Cash in Drawer:</p>
                        <p className="text-xl font-bold font-mono text-slate-900 m-0">
                            ₱{expectedCashValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500 m-0">Counted Cash (Physical):</p>
                        <p className="text-xl font-bold font-mono text-emerald-600 m-0">
                            ₱{calculatedClosingCash.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="text-right pl-3 border-l border-slate-200">
                        <p className="text-xs text-slate-500 m-0">Discrepancy Variance:</p>
                        <div className="mt-0.5">
                            {Math.abs(countedDiff) < 0.01 ? (
                                <Tag color="green" className="font-bold m-0">Balanced (₱0.00)</Tag>
                            ) : countedDiff > 0 ? (
                                <Tag color="gold" className="font-bold m-0">+₱{countedDiff.toFixed(2)} Over</Tag>
                            ) : (
                                <Tag color="red" className="font-bold m-0">-₱{Math.abs(countedDiff).toFixed(2)} Short</Tag>
                            )}
                        </div>
                    </div>
                </div>

                {/* Currency Denomination Counter */}
                <div className="border border-slate-200 rounded-xl p-3 mb-4">
                    <p className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Philippine Peso Bill & Coin Counter</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        {/* 1000 */}
                        <div className="bg-slate-100 p-2 rounded-lg flex items-center justify-between">
                            <span className="font-bold text-blue-700">₱1,000</span>
                            <div className="flex items-center gap-1">
                                <span className="text-slate-400">×</span>
                                <InputNumber
                                    min={0}
                                    size="small"
                                    value={denominations.d1000}
                                    onChange={(v) => setDenominations((prev) => ({ ...prev, d1000: Number(v) || 0 }))}
                                    className="w-16 text-right font-mono font-bold"
                                />
                            </div>
                        </div>

                        {/* 500 */}
                        <div className="bg-slate-100 p-2 rounded-lg flex items-center justify-between">
                            <span className="font-bold text-amber-600">₱500</span>
                            <div className="flex items-center gap-1">
                                <span className="text-slate-400">×</span>
                                <InputNumber
                                    min={0}
                                    size="small"
                                    value={denominations.d500}
                                    onChange={(v) => setDenominations((prev) => ({ ...prev, d500: Number(v) || 0 }))}
                                    className="w-16 text-right font-mono font-bold"
                                />
                            </div>
                        </div>

                        {/* 200 */}
                        <div className="bg-slate-100 p-2 rounded-lg flex items-center justify-between">
                            <span className="font-bold text-emerald-600">₱200</span>
                            <div className="flex items-center gap-1">
                                <span className="text-slate-400">×</span>
                                <InputNumber
                                    min={0}
                                    size="small"
                                    value={denominations.d200}
                                    onChange={(v) => setDenominations((prev) => ({ ...prev, d200: Number(v) || 0 }))}
                                    className="w-16 text-right font-mono font-bold"
                                />
                            </div>
                        </div>

                        {/* 100 */}
                        <div className="bg-slate-100 p-2 rounded-lg flex items-center justify-between">
                            <span className="font-bold text-violet-700">₱100</span>
                            <div className="flex items-center gap-1">
                                <span className="text-slate-400">×</span>
                                <InputNumber
                                    min={0}
                                    size="small"
                                    value={denominations.d100}
                                    onChange={(v) => setDenominations((prev) => ({ ...prev, d100: Number(v) || 0 }))}
                                    className="w-16 text-right font-mono font-bold"
                                />
                            </div>
                        </div>

                        {/* 50 */}
                        <div className="bg-slate-100 p-2 rounded-lg flex items-center justify-between">
                            <span className="font-bold text-rose-600">₱50</span>
                            <div className="flex items-center gap-1">
                                <span className="text-slate-400">×</span>
                                <InputNumber
                                    min={0}
                                    size="small"
                                    value={denominations.d50}
                                    onChange={(v) => setDenominations((prev) => ({ ...prev, d50: Number(v) || 0 }))}
                                    className="w-16 text-right font-mono font-bold"
                                />
                            </div>
                        </div>

                        {/* 20 */}
                        <div className="bg-slate-100 p-2 rounded-lg flex items-center justify-between">
                            <span className="font-bold text-orange-600">₱20</span>
                            <div className="flex items-center gap-1">
                                <span className="text-slate-400">×</span>
                                <InputNumber
                                    min={0}
                                    size="small"
                                    value={denominations.d20}
                                    onChange={(v) => setDenominations((prev) => ({ ...prev, d20: Number(v) || 0 }))}
                                    className="w-16 text-right font-mono font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Loose Coins Total */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between">
                        <span className="font-bold text-slate-700 text-xs">Loose Coins Total (₱20, ₱10, ₱5, ₱1, ¢25):</span>
                        <div className="flex items-center gap-1">
                            <span className="text-slate-400 font-mono">₱</span>
                            <InputNumber
                                min={0}
                                precision={2}
                                size="small"
                                value={denominations.coins}
                                onChange={(v) => setDenominations((prev) => ({ ...prev, coins: Number(v) || 0 }))}
                                className="w-28 text-right font-mono font-bold"
                            />
                        </div>
                    </div>
                </div>

                <Form form={closeShiftForm} layout="vertical" onFinish={handleCloseShift}>
                    <Form.Item
                        name="notes"
                        label={<span className="font-semibold text-slate-700">Discrepancy Explanation / Closing Remarks</span>}
                    >
                        <Input.TextArea rows={2} placeholder="Explain reason if there is any cash shortage or overage..." />
                    </Form.Item>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                        <Button onClick={() => setIsCloseShiftModalOpen(false)}>Cancel</Button>
                        <Button
                            type="primary"
                            danger
                            htmlType="submit"
                            icon={<PoweroffOutlined />}
                            className="font-bold"
                        >
                            Finalize Z-Reading & Close Shift
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* ========================================================================= */}
            {/* MODAL 4: PRINTABLE X-READING / Z-READING SLIP */}
            {/* ========================================================================= */}
            <Modal
                title={readingType === 'X-Reading' ? 'X-Reading Interim Shift Report' : 'Z-Reading Official End-of-Shift Report'}
                open={isReadingModalOpen}
                onCancel={() => setIsReadingModalOpen(false)}
                footer={null}
                width={400}
                destroyOnClose
            >
                {shiftInfo && (
                    <ShiftReadingSlip
                        shift={shiftInfo}
                        type={readingType}
                    />
                )}
            </Modal>
        </Layout>
    );
}
