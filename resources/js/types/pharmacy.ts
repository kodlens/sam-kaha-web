export type UnitOfMeasure = {
    id: number;
    name: string; // e.g. 'Box', 'Strip', 'Piece', 'Bottle', 'Bar', 'Can'
    short_code: string; // e.g. 'box', 'strp', 'pc', 'btl', 'bar', 'can'
    category?: string | null;
    description?: string | null;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
};

export type ProductType = 'medicine' | 'grocery' | 'medical_supply';

export type DrugClassification = 'otc' | 'prescription' | 'dangerous_drug' | 'general';

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
    product_type: ProductType;
    brand_name: string;
    generic_name?: string | null; // Nullable for groceries & consumer goods
    dosage_strength?: string | null; // 500mg for meds or 500ml/135g for groceries
    dosage_form?: string | null; // Tablet/Capsule for meds; Bar/Bottle/Pack for groceries
    category?: string | null;
    sku: string;
    barcode?: string | null;
    classification: DrugClassification;
    requires_prescription: boolean;
    is_vatable: boolean;
    sc_pwd_discountable: boolean; // True for medicines & medical supplies, False for standard groceries
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
    manufacturing_date?: string | null;
    received_date?: string | null;
    quantity_received?: number;
    quantity_remaining: number;
    unit_cost: number;
    supplier_name?: string | null;
    supplier_invoice_no?: string | null;
    status: 'active' | 'near_expiry' | 'expired' | 'quarantined' | 'depleted';
    notes?: string | null;
    days_until_expiry?: number;
    computed_status?: string;
    total_cost_value?: number;
    product?: Product;
    created_at?: string;
    updated_at?: string;
};

export type ShiftCashDrop = {
    id: number;
    cashier_shift_id: number;
    cashier_id: number;
    type: 'drop_to_vault' | 'petty_cash_expense' | 'float_replenishment';
    amount: number | string;
    reason: string;
    authorized_by?: number | null;
    authorizer?: { id: number; name: string } | null;
    created_at: string;
};

export type CashierShift = {
    id: number;
    cashier_id: number;
    device_terminal_id?: string;
    opening_float: number | string;
    cash_sales_total?: number | string;
    non_cash_sales_total?: number | string;
    cash_drops_total?: number | string;
    closing_cash?: number | string | null;
    expected_cash?: number | string | null;
    cash_difference?: number | string | null;
    current_drawer_cash?: number;
    is_over_short?: 'in_progress' | 'balanced' | 'overage' | 'shortage';
    denomination_breakdown?: Record<string, number> | null;
    status: 'open' | 'closed';
    opened_at: string;
    closed_at?: string | null;
    notes?: string | null;
    cashier?: {
        id: number;
        name: string;
        email: string;
        role?: string;
    };
    cash_drops?: ShiftCashDrop[];
    created_at?: string;
    updated_at?: string;
};

export type DiscountType = {
    id: number;
    name: string;
    code: string;
    percentage: number | string;
    is_vat_exempt: boolean;
    requires_id: boolean;
    requires_booklet: boolean;
    applies_to: 'medicines_and_supplies' | 'all' | 'groceries_only';
    is_statutory: boolean;
    legal_basis?: string | null;
    description?: string | null;
    is_active: boolean;
};

export type StatutoryDiscountLog = {
    id: number;
    discount_type_id: number;
    customer_name: string;
    id_number: string;
    booklet_number?: string | null;
    gross_amount: number | string;
    vat_exempt_amount: number | string;
    vat_relief_amount: number | string;
    discount_amount: number | string;
    net_amount: number | string;
    cashier_name?: string | null;
    cashier_id?: number | null;
    recorded_at: string;
    discount_type?: DiscountType;
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
