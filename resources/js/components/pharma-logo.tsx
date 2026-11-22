import React from 'react';
import { MedicineBoxOutlined } from '@ant-design/icons';

interface PharmaLogoProps {
    className?: string;
    variant?: 'dark' | 'light';
    collapsed?: boolean;
}

export default function PharmaLogo({
    className = '',
    variant = 'light',
    collapsed = false,
}: PharmaLogoProps) {
    const isLight = variant === 'light';

    return (
        <div className={`inline-flex items-center gap-2.5 font-bold tracking-tight select-none ${className}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
                <MedicineBoxOutlined className="text-xl" />
            </div>

            {!collapsed && (
                <div className="flex flex-col leading-none">
                    <span className={`text-base font-extrabold tracking-tight ${isLight ? 'text-white' : 'text-slate-900'}`}>
                        SAM<span className="text-emerald-500">PHARMA</span>
                    </span>
                    <span className={`text-[10px] font-semibold tracking-wider uppercase mt-0.5 ${isLight ? 'text-emerald-400/90' : 'text-slate-500'}`}>
                        Pharmacy POS & Rx
                    </span>
                </div>
            )}
        </div>
    );
}
