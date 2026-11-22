import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button, Input, Checkbox, Alert } from 'antd';
import {
    LoginOutlined,
    MailOutlined,
    LockOutlined,
    ArrowLeftOutlined,
    SafetyCertificateFilled,
    UserOutlined,
} from '@ant-design/icons';
import PharmaLogo from '@/components/pharma-logo';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    const quickFill = (email: string) => {
        setData({
            email,
            password: 'a',
            remember: true,
        });
    };

    const hasGlobalErrors = Object.keys(errors).length > 0;

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col lg:flex-row">
            <Head title="Sign In - SAM PHARMA" />

            {/* LEFT COLUMN: BRAND & VALUE SHOWCASE */}
            <div className="lg:w-5/12 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
                            <PharmaLogo variant="light" />
                        </Link>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-200 hover:text-white transition-colors bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-sm"
                        >
                            <ArrowLeftOutlined />
                            <span>Home</span>
                        </Link>
                    </div>

                    <div className="pt-8 lg:pt-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-400/30">
                            <SafetyCertificateFilled className="text-emerald-400" />
                            <span>Secured POS Gateway</span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                            Pharmacy Terminal <br />
                            <span className="text-emerald-400">Sign In</span>
                        </h2>

                        <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                            Access your cashier shift terminal or admin management console.
                        </p>
                    </div>

                    {/* QUICK DEMO LOGIN SHORTCUTS */}
                    <div className="pt-4 space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                            Quick-Fill Accounts (Password: a):
                        </span>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => quickFill('admin@localhost')}
                                className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg font-mono font-medium border border-white/15 transition-colors cursor-pointer"
                            >
                                Admin (Juan Dela Cruz)
                            </button>
                            <button
                                type="button"
                                onClick={() => quickFill('cashier1@localhost')}
                                className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg font-mono font-medium border border-white/15 transition-colors cursor-pointer"
                            >
                                Cashier 1 (Grace)
                            </button>
                            <button
                                type="button"
                                onClick={() => quickFill('cashier2@localhost')}
                                className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg font-mono font-medium border border-white/15 transition-colors cursor-pointer"
                            >
                                Cashier 2 (Carlo)
                            </button>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 pt-8 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                    <span>SAM PHARMA POS Engine</span>
                    <span className="font-semibold text-white">v1.0 (PH FDA Compliant)</span>
                </div>
            </div>

            {/* RIGHT COLUMN: SIGN IN FORM */}
            <div className="lg:w-7/12 bg-slate-50/50 p-6 sm:p-12 lg:p-16 flex flex-col justify-center overflow-y-auto">
                <div className="max-w-md w-full mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Welcome Back
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                Enter your credentials to access your session
                            </p>
                        </div>
                    </div>

                    {hasGlobalErrors && (
                        <Alert
                            type="error"
                            showIcon
                            message="Invalid credentials. Please verify your email and password."
                            className="rounded-xl border-red-200"
                        />
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                                Email Address
                            </label>
                            <Input
                                size="large"
                                type="email"
                                prefix={<MailOutlined className="text-slate-400" />}
                                placeholder="name@pharmacy.ph"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                status={errors.email ? 'error' : ''}
                                className="rounded-xl"
                                required
                            />
                            {errors.email && (
                                <span className="text-xs text-red-600 mt-1 block">{errors.email}</span>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-bold text-slate-700 block">
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                            <Input.Password
                                size="large"
                                prefix={<LockOutlined className="text-slate-400" />}
                                placeholder="••••••••"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                status={errors.password ? 'error' : ''}
                                className="rounded-xl"
                                required
                            />
                            {errors.password && (
                                <span className="text-xs text-red-600 mt-1 block">{errors.password}</span>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <Checkbox
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="text-xs text-slate-600"
                            >
                                Remember me for 30 days
                            </Checkbox>
                        </div>

                        <div className="pt-2">
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                loading={processing}
                                icon={<LoginOutlined />}
                                className="w-full bg-emerald-700 hover:bg-emerald-800 font-black text-sm h-12 rounded-xl shadow-md border-none"
                            >
                                Sign In to Terminal
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
