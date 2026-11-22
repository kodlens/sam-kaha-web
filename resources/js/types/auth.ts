export type UserRole = 'admin' | 'cashier';
export type UserStatus = 'active' | 'inactive';

export type User = {
    id: number;
    name: string;
    fname?: string | null;
    mname?: string | null;
    lname?: string | null;
    sex?: 'male' | 'female' | string;
    email: string;
    avatar?: string;
    role: UserRole;
    status: UserStatus;
    pin?: string | null;
    phone?: string | null;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
