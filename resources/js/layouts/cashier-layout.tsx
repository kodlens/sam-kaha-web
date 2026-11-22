import React, { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Layout,
    Button,
    Avatar,
    Dropdown,
    Tag,
    Space,
} from 'antd';
import type { MenuProps } from 'antd';
import {
    LogoutOutlined,
    ClockCircleOutlined,
    LockOutlined,
    SafetyCertificateOutlined,
    DashboardOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import PharmaLogo from '@/components/pharma-logo';
import type { User } from '@/types';

const { Header, Content } = Layout;

export interface CashierLayoutProps {
    children: React.ReactNode;
    title?: string;
    shiftInfo?: {
        id?: number;
        status?: 'open' | 'closed';
        openedAt?: string;
    } | null;
}

export default function CashierLayout({
    children,
    title = 'POS Terminal',
    shiftInfo = null,
}: CashierLayoutProps) {
    const page = usePage<{ auth?: { user?: User } }>();
    const user = page.props.auth?.user;

    const [currentTime, setCurrentTime] = useState<string>('');

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
                <div className="flex items-center gap-3 sm:gap-6">
                    {/* Live Clock */}
                    <div className="hidden md:flex items-center gap-2 text-slate-300 text-xs font-mono bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                        <ClockCircleOutlined className="text-emerald-400" />
                        <span>{currentTime}</span>
                    </div>

                    {/* Shift Status Indicator */}
                    <div className="flex items-center">
                        {shiftInfo?.status === 'open' ? (
                            <Tag color="green" className="font-bold text-xs py-1 px-2.5 rounded-md flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                                Shift #{shiftInfo.id} Open
                            </Tag>
                        ) : (
                            <Tag color="gold" className="font-bold text-xs py-1 px-2.5 rounded-md">
                                Shift Closed / Standby
                            </Tag>
                        )}
                    </div>

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
        </Layout>
    );
}
