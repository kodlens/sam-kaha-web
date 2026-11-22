export type UnitOfMeasure = {
    id: number;
    name: string; // e.g. 'Box', 'Strip', 'Piece', 'Bottle'
    short_code: string; // e.g. 'box', 'strp', 'pc', 'btl'
    category?: string | null;
    description?: string | null;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
};

export type DrugClassification = 'otc' | 'prescription' | 'dangerous_drug';

export type ProductUnit = {
    id?: number;
    product_id?: number;
    unit_of_measure_id: number;
    conversion_factor: number;
    price: number | string;
    cost?: number | string | null;
    barcode?: string | null;
    is_base_unit: boolean;
    unit_of_measure?: UnitOfMeasure;
};

export type Product = {
    id: number;
    brand_name: string;
    generic_name: string;
    dosage_strength?: string | null; // e.g. '500mg', '120mg/5ml'
    dosage_form?: string | null; // e.g. 'Tablet', 'Syrup', 'Capsule'
    category?: string | null;
    sku: string;
    barcode?: string | null;
    classification: DrugClassification;
    requires_prescription: boolean;
    is_vatable: boolean;
    reorder_level: number;
    storage_conditions?: string | null;
    description?: string | null;
    is_active: boolean;
    full_name?: string;
    units?: ProductUnit[];
    base_unit?: ProductUnit;
    created_at?: string;
    updated_at?: string;
};

export type ProductBatch = {
    id: number;
    product_id: number;
    batch_number: string;
    expiry_date: string;
    quantity: number;
    unit_cost: number;
    supplier_name?: string | null;
    status: 'active' | 'near_expiry' | 'expired' | 'quarantined';
};

export type CashierShift = {
    id: number;
    cashier_id: number;
    cashier_name: string;
    opening_float: number;
    closing_cash?: number | null;
    expected_cash?: number | null;
    cash_difference?: number | null;
    status: 'open' | 'closed';
    opened_at: string;
    closed_at?: string | null;
};

export type PhilippineDiscountType = 'none' | 'senior_citizen' | 'pwd' | 'regular_promo';

export type PrescriptionInfo = {
    doctor_name: string;
    doctor_license_no: string;
    doctor_ptr_no?: string;
    patient_name: string;
    patient_age?: number;
    patient_address?: string;
};
