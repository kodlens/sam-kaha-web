import React, { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Layout,
    Menu,
    Button,
    Avatar,
    Dropdown,
    Tag,
    Breadcrumb,
    Drawer,
} from 'antd';
import type { MenuProps } from 'antd';
import {
    DashboardOutlined,
    AppstoreOutlined,
    MedicineBoxOutlined,
    HistoryOutlined,
    PercentageOutlined,
    ClockCircleOutlined,
    TeamOutlined,
    FileTextOutlined,
    ShoppingCartOutlined,
    SettingOutlined,
    LogoutOutlined,
    HomeOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import PharmaLogo from '@/components/pharma-logo';
import type { BreadcrumbItem, User } from '@/types';
import { home } from '@/routes';

const { Header, Sider, Content } = Layout;

export interface AdminLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AdminLayout({
    children,
    breadcrumbs = [],
}: AdminLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isMobileScreen, setIsMobileScreen] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth < 1024 : false
    );

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobileScreen(mobile);
            if (!mobile) {
                setMobileOpen(false);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleToggleSidebar = () => {
        if (isMobileScreen) {
            setMobileOpen((prev) => !prev);
        } else {
            setCollapsed((prev) => !prev);
        }
    };

    const page = usePage<{ auth?: { user?: User } }>();
    const user = page.props.auth?.user;

    const handleLogout = () => {
        router.post('/logout');
    };

    const sidebarMenuItems: MenuProps['items'] = [
        {
            key: '/admin/dashboard',
            icon: <DashboardOutlined className="text-emerald-400" />,
            label: <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)}>Dashboard Overview</Link>,
        },
        {
            key: '/cashier/pos',
            icon: <ShoppingCartOutlined className="text-teal-400" />,
            label: <Link href="/cashier/pos" onClick={() => setMobileOpen(false)}>Open POS Terminal</Link>,
        },
        { type: 'divider' },
        {
            key: '/admin/uom',
            icon: <AppstoreOutlined className="text-sky-400" />,
            label: <Link href="/admin/uom" onClick={() => setMobileOpen(false)}>Units of Measure (UOM)</Link>,
        },
        {
            key: '/admin/products',
            icon: <MedicineBoxOutlined className="text-emerald-400" />,
            label: <span className="text-zinc-400 cursor-not-allowed" onClick={() => setMobileOpen(false)}>Medicine Masterfile</span>,
        },
        {
            key: '/admin/batches',
            icon: <HistoryOutlined className="text-amber-400" />,
            label: <span className="text-zinc-400 cursor-not-allowed" onClick={() => setMobileOpen(false)}>Batches & Expiry (FEFO)</span>,
        },
        {
            key: '/admin/discounts',
            icon: <PercentageOutlined className="text-purple-400" />,
            label: <span className="text-zinc-400 cursor-not-allowed" onClick={() => setMobileOpen(false)}>Senior / PWD Discounts</span>,
        },
        {
            key: '/admin/shifts',
            icon: <ClockCircleOutlined className="text-cyan-400" />,
            label: <span className="text-zinc-400 cursor-not-allowed" onClick={() => setMobileOpen(false)}>Cashier Shifts (X/Z)</span>,
        },
        {
            key: '/admin/staff',
            icon: <TeamOutlined className="text-blue-400" />,
            label: <span className="text-zinc-400 cursor-not-allowed" onClick={() => setMobileOpen(false)}>Staff & Cashiers</span>,
        },
        {
            key: '/admin/reports',
            icon: <FileTextOutlined className="text-rose-400" />,
            label: <span className="text-zinc-400 cursor-not-allowed" onClick={() => setMobileOpen(false)}>BIR & FDA Reports</span>,
        },
        { type: 'divider' },
        {
            key: '/settings/profile',
            icon: <SettingOutlined />,
            label: <Link href="/settings/profile" onClick={() => setMobileOpen(false)}>System Settings</Link>,
        },
    ];

    const userDropdownItems: MenuProps['items'] = [
        {
            key: 'info',
            label: (
                <div className="py-1 px-1">
                    <p className="font-bold text-slate-800 text-sm m-0 leading-tight">{user?.name}</p>
                    <p className="text-xs text-slate-500 m-0 mt-0.5">{user?.email}</p>
                    <div className="mt-1.5">
                        <Tag color="geekblue" className="text-[10px] font-bold m-0 uppercase">
                            Pharmacy Admin
                        </Tag>
                    </div>
                </div>
            ),
            disabled: true,
        },
        { type: 'divider' },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: <Link href="/settings/profile">System Settings</Link>,
        },
        {
            key: 'pos-link',
            icon: <ShoppingCartOutlined />,
            label: <Link href="/cashier/pos">Launch POS</Link>,
        },
        { type: 'divider' },
        {
            key: 'logout',
            icon: <LogoutOutlined className="text-red-500" />,
            label: <span className="text-red-600 font-semibold">Sign Out</span>,
            onClick: handleLogout,
        },
    ];

    const renderSidebarInner = (isDrawer: boolean = false) => (
        <div className="flex flex-col h-full bg-[#18181b]">
            {/* BRAND HEADER */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-zinc-800 shrink-0">
                <Link
                    href="/admin/dashboard"
                    onClick={() => isDrawer && setMobileOpen(false)}
                    className="flex items-center gap-2 overflow-hidden"
                >
                    <PharmaLogo variant="light" collapsed={!isDrawer && collapsed} />
                </Link>

                {isDrawer ? (
                    <Button
                        type="text"
                        icon={<CloseOutlined className="text-zinc-400 hover:text-white" />}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center p-1 h-8 w-8"
                    />
                ) : null}
            </div>

            {(!collapsed || isDrawer) ? (
                <div className="px-4 py-2 mx-3 my-3 bg-emerald-950/40 rounded-xl border border-emerald-900/60 text-white shrink-0">
                    <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                        Pharmacy Administration
                    </div>
                    <div className="text-xs text-zinc-300 font-semibold mt-0.5">
                        Central Management Hub
                    </div>
                </div>
            ) : null}

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-2">
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={[window.location.pathname]}
                    items={sidebarMenuItems}
                    style={{ backgroundColor: 'transparent' }}
                    className="border-none font-semibold text-sm"
                />
            </div>
        </div>
    );

    return (
        <Layout hasSider={!isMobileScreen} className="min-h-screen bg-slate-100 font-sans w-full overflow-x-hidden">
            {/* DESKTOP SIDEBAR */}
            {!isMobileScreen && (
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    width={250}
                    collapsedWidth={80}
                    style={{
                        backgroundColor: '#18181b',
                        height: '100vh',
                        position: 'sticky',
                        top: 0,
                        left: 0,
                    }}
                    className="shadow-md z-30 border-r border-zinc-800 flex flex-col shrink-0"
                >
                    {renderSidebarInner(false)}
                </Sider>
            )}

            {/* MOBILE DRAWER */}
            <Drawer
                placement="left"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                width={280}
                styles={{
                    body: { padding: 0, backgroundColor: '#18181b', height: '100%' },
                    header: { display: 'none' },
                }}
            >
                {renderSidebarInner(true)}
            </Drawer>

            {/* MAIN CONTENT AREA */}
            <Layout className="flex flex-col flex-1 min-w-0 w-full overflow-x-hidden">
                <Header
                    style={{ backgroundColor: '#ffffff', lineHeight: 'normal' }}
                    className="sticky top-0 z-20 flex items-center justify-between h-16 px-3 sm:px-6 border-b border-slate-200/90 shadow-xs w-full"
                >
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                        {/* Sidebar Toggle */}
                        <Button
                            type="text"
                            icon={
                                isMobileScreen ? (
                                    <MenuUnfoldOutlined className="text-lg" />
                                ) : collapsed ? (
                                    <MenuUnfoldOutlined className="text-base" />
                                ) : (
                                    <MenuFoldOutlined className="text-base" />
                                )
                            }
                            onClick={handleToggleSidebar}
                            title={isMobileScreen ? 'Open Navigation Menu' : collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                            aria-label="Toggle Sidebar Menu"
                            className="text-slate-700 hover:text-slate-900 flex items-center justify-center p-2 rounded-lg"
                        />

                        {isMobileScreen && (
                            <div className="flex items-center">
                                <Link href="/admin/dashboard" className="flex items-center">
                                    <PharmaLogo variant="dark" collapsed={true} />
                                </Link>
                            </div>
                        )}

                        <div className="hidden sm:block min-w-0">
                            <Breadcrumb
                                items={[
                                    {
                                        href: '/admin/dashboard',
                                        title: (
                                            <span className="flex items-center gap-1 font-semibold text-slate-500">
                                                <HomeOutlined />
                                                <span>Admin</span>
                                            </span>
                                        ),
                                    },
                                    ...breadcrumbs.map((b) => ({
                                        href: typeof b.href === 'string' ? b.href : undefined,
                                        title: <span className="font-semibold text-slate-800">{b.title}</span>,
                                    })),
                                ]}
                            />
                        </div>
                    </div>

                    {/* TOPBAR RIGHT ACTIONS */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <Link href="/cashier/pos">
                            <Button
                                type="primary"
                                icon={<ShoppingCartOutlined />}
                                className="bg-emerald-600 hover:bg-emerald-700 border-none font-semibold text-xs h-9 rounded-lg shadow-sm"
                            >
                                <span className="hidden md:inline">Open</span> POS Terminal
                            </Button>
                        </Link>

                        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

                        {/* User Profile Dropdown */}
                        <Dropdown menu={{ items: userDropdownItems }} trigger={['click']} placement="bottomRight">
                            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer py-1 px-2 rounded-xl hover:bg-slate-100 transition-colors select-none">
                                <Avatar
                                    src={user?.avatar}
                                    className="bg-emerald-700 text-white font-bold ring-2 ring-emerald-500/20 shrink-0"
                                >
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                </Avatar>
                                <div className="hidden md:block text-left leading-tight">
                                    <span className="text-xs font-bold text-slate-800 block truncate max-w-[130px]">
                                        {user?.name || 'Admin Pharmacist'}
                                    </span>
                                    <span className="text-[10px] text-emerald-600 font-bold block uppercase tracking-wider">
                                        Admin
                                    </span>
                                </div>
                            </div>
                        </Dropdown>
                    </div>
                </Header>

                {/* CONTENT INJECTOR */}
                <Content className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-7xl mx-auto min-w-0 overflow-y-auto">
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}
