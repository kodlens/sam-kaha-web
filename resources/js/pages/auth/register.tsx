import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button, Input, Select, Alert } from 'antd';
import {
    UserOutlined,
    MailOutlined,
    LockOutlined,
    PhoneOutlined,
    SafetyCertificateFilled,
} from '@ant-design/icons';
import PharmaLogo from '@/components/pharma-logo';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        fname: '',
        mname: '',
        lname: '',
        sex: 'male',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register');
    };

    const hasGlobalErrors = Object.keys(errors).length > 0;

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col lg:flex-row">
            <Head title="Staff Registration - SAM PHARMA" />

            {/* LEFT COLUMN: BRAND & PHARMACY SHOWCASE */}
            <div className="lg:w-5/12 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <Link href="/" className="inline-block mb-10">
                        <PharmaLogo variant="light" />
                    </Link>

                    <div className="space-y-4 max-w-md">
                        <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full">
                            <SafetyCertificateFilled className="text-emerald-400" />
                            <span>Staff Account Setup</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                            Pharmacy Staff & Cashier Portal
                        </h1>

                        <p className="text-slate-300 text-sm leading-relaxed">
                            Create your staff account to access the express POS terminal or pharmacy administration dashboard.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 pt-8 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                    <span>SAM PHARMA POS Engine</span>
                    <span className="font-semibold text-white">v1.0 (PH FDA Compliant)</span>
                </div>
            </div>

            {/* RIGHT COLUMN: REGISTRATION FORM */}
            <div className="lg:w-7/12 bg-slate-50/50 p-6 sm:p-12 lg:p-16 flex flex-col justify-center overflow-y-auto">
                <div className="max-w-xl w-full mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Register Staff Member
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                Enter your personal details to create your system user
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-slate-400 block">Already have an account?</span>
                            <Link href="/login" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">
                                Sign In →
                            </Link>
                        </div>
                    </div>

                    {hasGlobalErrors && (
                        <Alert
                            type="error"
                            showIcon
                            message="Please correct the highlighted errors below."
                            className="rounded-xl border-red-200"
                        />
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        {/* NAME FIELDS */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">First Name *</label>
                                <Input
                                    size="large"
                                    placeholder="Juan"
                                    value={data.fname}
                                    onChange={(e) => setData('fname', e.target.value)}
                                    status={errors.fname ? 'error' : ''}
                                    className="rounded-xl"
                                    required
                                />
                                {errors.fname && <span className="text-xs text-red-600 mt-1 block">{errors.fname}</span>}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">Middle Name</label>
                                <Input
                                    size="large"
                                    placeholder="Santos"
                                    value={data.mname}
                                    onChange={(e) => setData('mname', e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">Last Name *</label>
                                <Input
                                    size="large"
                                    placeholder="Dela Cruz"
                                    value={data.lname}
                                    onChange={(e) => setData('lname', e.target.value)}
                                    status={errors.lname ? 'error' : ''}
                                    className="rounded-xl"
                                    required
                                />
                                {errors.lname && <span className="text-xs text-red-600 mt-1 block">{errors.lname}</span>}
                            </div>
                        </div>

                        {/* SEX & PHONE */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">Biological Sex</label>
                                <Select
                                    size="large"
                                    value={data.sex}
                                    onChange={(val) => setData('sex', val)}
                                    className="w-full"
                                    options={[
                                        { label: 'Male', value: 'male' },
                                        { label: 'Female', value: 'female' },
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
                                <Input
                                    size="large"
                                    prefix={<PhoneOutlined className="text-slate-400" />}
                                    placeholder="0917 123 4567"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>
                        </div>

                        {/* EMAIL */}
                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
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
                            {errors.email && <span className="text-xs text-red-600 mt-1 block">{errors.email}</span>}
                        </div>

                        {/* PASSWORDS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">Password *</label>
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
                                {errors.password && <span className="text-xs text-red-600 mt-1 block">{errors.password}</span>}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">Confirm Password *</label>
                                <Input.Password
                                    size="large"
                                    prefix={<LockOutlined className="text-slate-400" />}
                                    placeholder="••••••••"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="rounded-xl"
                                    required
                                />
                            </div>
                        </div>

                        {/* SUBMIT BUTTON */}
                        <div className="pt-2">
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                loading={processing}
                                className="w-full bg-emerald-700 hover:bg-emerald-800 font-black text-sm h-12 rounded-xl shadow-md border-none"
                            >
                                Complete Registration
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
