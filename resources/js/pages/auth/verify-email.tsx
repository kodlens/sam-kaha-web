import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button, Alert } from 'antd';
import {
    MailOutlined,
    ArrowLeftOutlined,
    SafetyCertificateFilled,
    CheckCircleFilled,
} from '@ant-design/icons';
import PharmaLogo from '@/components/pharma-logo';

interface VerifyEmailProps {
    status?: string;
}

export default function VerifyEmail({ status }: VerifyEmailProps) {
    const { post, processing } = useForm({});

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/email/verification-notification');
    };

    const verificationLinkSent = status === 'verification-link-sent';

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col lg:flex-row">
            <Head title="Verify Email - SAM PHARMA" />

            {/* LEFT COLUMN: BRAND SHOWCASE */}
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
                            <span>Account Security & Verification</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                            Verify your email to <span className="text-emerald-400">secure</span> your staff account.
                        </h1>

                        <p className="text-slate-300 text-sm sm:text-base mt-4 leading-relaxed max-w-md">
                            Verifying your email confirms your identity for audit trails, shift reconciliation, and system permissions.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 pt-8 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                    <span>SAM PHARMA POS Engine</span>
                    <span className="font-semibold text-white">v1.0 (PH FDA Compliant)</span>
                </div>
            </div>

            {/* RIGHT COLUMN: VERIFICATION FORM */}
            <div className="lg:w-7/12 bg-slate-50/50 p-6 sm:p-12 lg:p-16 flex flex-col justify-center overflow-y-auto">
                <div className="max-w-md w-full mx-auto space-y-6">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            Verify Email Address
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Thanks for signing up! Before getting started, please verify your email address by clicking the link we just sent to you.
                        </p>
                    </div>

                    {verificationLinkSent && (
                        <Alert
                            type="success"
                            showIcon
                            icon={<CheckCircleFilled />}
                            message="A new verification link has been sent to your email address."
                            className="rounded-xl border-emerald-200 bg-emerald-50 text-emerald-800"
                        />
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={processing}
                            icon={<MailOutlined />}
                            className="w-full bg-emerald-700 hover:bg-emerald-800 font-black text-sm h-12 rounded-xl shadow-md border-none"
                        >
                            Resend Verification Email
                        </Button>

                        <div className="text-center pt-2">
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="text-xs text-slate-500 hover:text-red-600 font-semibold transition-colors"
                            >
                                Sign Out
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
