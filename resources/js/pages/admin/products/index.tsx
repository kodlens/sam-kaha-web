import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import {
    Table,
    Button,
    Input,
    Select,
    Tag,
    Modal,
    Space,
    Popconfirm,
    Switch,
    Card,
    Tooltip,
    message,
    Radio,
    InputNumber,
    Segmented,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    MedicineBoxOutlined,
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined,
    BarcodeOutlined,
    FileProtectOutlined,
    ShoppingCartOutlined,
    SkinOutlined,
    SafetyCertificateOutlined,
    IdcardOutlined,
    InboxOutlined,
} from '@ant-design/icons';
import type { Product, ProductType, UnitOfMeasure } from '@/types/pharmacy';

interface ProductsPageProps {
    products: Product[];
    categories: string[];
    unitsOfMeasure: UnitOfMeasure[];
    filters: {
        search: string;
        product_type: string;
        classification: string;
        category: string;
        vat_status: string;
        status: string;
    };
}

export default function ProductsIndex({
    products,
    categories,
    unitsOfMeasure,
    filters,
}: ProductsPageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.product_type || 'all');
    const [classificationFilter, setClassificationFilter] = useState(filters.classification || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || '');
    const [vatFilter, setVatFilter] = useState(filters.vat_status || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Quick Stock Adjustment Modal state
    const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
    const [stockQty, setStockQty] = useState<number>(0);
    const [stockNotes, setStockNotes] = useState<string>('');
    const [isSubmittingStock, setIsSubmittingStock] = useState<boolean>(false);

    const openStockModal = (product: Product) => {
        setStockModalProduct(product);
        setStockQty(product.total_stock ?? 0);
        setStockNotes('');
    };

    const handleSaveStock = () => {
        if (!stockModalProduct) return;
        setIsSubmittingStock(true);
        router.post(`/admin/products/${stockModalProduct.id}/stock-update`, {
            new_quantity: stockQty,
            notes: stockNotes || 'Stock count update in Product Masterlist',
        }, {
            onSuccess: () => {
                message.success(`Stock for '${stockModalProduct.brand_name}' updated to ${stockQty}.`);
                setStockModalProduct(null);
                setIsSubmittingStock(false);
            },
            onError: (err) => {
                message.error(Object.values(err)[0] as string || 'Failed to update stock');
                setIsSubmittingStock(false);
            },
        });
    };

    // Default base UOM
    const defaultBaseUom = unitsOfMeasure.find((u) => u.short_code === 'pc') || unitsOfMeasure[0];

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<{
        product_type: ProductType;
        brand_name: string;
        generic_name: string;
        dosage_strength: string;
        dosage_form: string;
        category: string;
        sku: string;
        barcode: string;
        classification: 'otc' | 'prescription' | 'dangerous_drug' | 'general';
        requires_prescription: boolean;
        is_vatable: boolean;
        sc_pwd_discountable: boolean;
        reorder_level: number;
        storage_conditions: string;
        description: string;
        is_active: boolean;
        units: {
            unit_of_measure_id: number;
            conversion_factor: number;
            price: number;
            cost: number;
            is_base_unit: boolean;
        }[];
    }>({
        product_type: 'medicine',
        brand_name: '',
        generic_name: '',
        dosage_strength: '500mg',
        dosage_form: 'Tablet',
        category: 'Analgesic',
        sku: '',
        barcode: '',
        classification: 'otc',
        requires_prescription: false,
        is_vatable: true,
        sc_pwd_discountable: true,
        reorder_level: 20,
        storage_conditions: 'Store below 30°C',
        description: '',
        is_active: true,
        units: [
            {
                unit_of_measure_id: defaultBaseUom ? defaultBaseUom.id : 1,
                conversion_factor: 1,
                price: 10.0,
                cost: 6.0,
                is_base_unit: true,
            },
        ],
    });

    const handleSearch = (newType?: string) => {
        const activeType = newType !== undefined ? newType : typeFilter;
        router.get(
            '/admin/products',
            {
                search: search || undefined,
                product_type: activeType !== 'all' ? activeType : undefined,
                classification: classificationFilter || undefined,
                category: categoryFilter || undefined,
                vat_status: vatFilter || undefined,
                status: statusFilter || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleTypeChange = (value: string | number) => {
        const val = String(value);
        setTypeFilter(val);
        handleSearch(val);
    };

    const handleReset = () => {
        setSearch('');
        setTypeFilter('all');
        setClassificationFilter('');
        setCategoryFilter('');
        setVatFilter('');
        setStatusFilter('');
        router.get('/admin/products', {}, { preserveState: true, replace: true });
    };

    const openCreateModal = (presetType: ProductType = 'medicine') => {
        setEditingProduct(null);
        clearErrors();
        reset();

        const initialUomId = defaultBaseUom ? defaultBaseUom.id : unitsOfMeasure[0]?.id || 1;
        const isMed = presetType === 'medicine';
        const isGrocery = presetType === 'grocery';

        setData({
            product_type: presetType,
            brand_name: '',
            generic_name: isMed ? '' : '',
            dosage_strength: isMed ? '500mg' : isGrocery ? '500ml' : '',
            dosage_form: isMed ? 'Tablet' : isGrocery ? 'Bottle' : 'Pack',
            category: isMed ? 'Analgesic' : isGrocery ? 'Toiletries' : 'Medical Supplies',
            sku: (isMed ? 'MED-' : isGrocery ? 'GRO-' : 'SUP-') + Math.floor(1000 + Math.random() * 9000),
            barcode: '',
            classification: isMed ? 'otc' : 'general',
            requires_prescription: false,
            is_vatable: true,
            sc_pwd_discountable: isMed || presetType === 'medical_supply',
            reorder_level: 20,
            storage_conditions: 'Store below 30°C',
            description: '',
            is_active: true,
            units: [
                {
                    unit_of_measure_id: initialUomId,
                    conversion_factor: 1,
                    price: 15.0,
                    cost: 10.0,
                    is_base_unit: true,
                },
            ],
        });
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        clearErrors();

        const formattedUnits = product.units && product.units.length > 0
            ? product.units.map((u) => ({
                  unit_of_measure_id: u.unit_of_measure_id,
                  conversion_factor: u.conversion_factor,
                  price: Number(u.price),
                  cost: u.cost ? Number(u.cost) : 0,
                  is_base_unit: Boolean(u.is_base_unit),
              }))
            : [
                  {
                      unit_of_measure_id: defaultBaseUom ? defaultBaseUom.id : 1,
                      conversion_factor: 1,
                      price: 10.0,
                      cost: 6.0,
                      is_base_unit: true,
                  },
              ];

        setData({
            product_type: product.product_type,
            brand_name: product.brand_name,
            generic_name: product.generic_name || '',
            dosage_strength: product.dosage_strength || '',
            dosage_form: product.dosage_form || '',
            category: product.category || '',
            sku: product.sku,
            barcode: product.barcode || '',
            classification: product.classification,
            requires_prescription: product.requires_prescription,
            is_vatable: product.is_vatable,
            sc_pwd_discountable: product.sc_pwd_discountable,
            reorder_level: product.reorder_level,
            storage_conditions: product.storage_conditions || '',
            description: product.description || '',
            is_active: product.is_active,
            units: formattedUnits,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Ensure at least one unit is marked as base unit
        const hasBaseUnit = data.units.some((u) => u.is_base_unit);
        if (!hasBaseUnit && data.units.length > 0) {
            data.units[0].is_base_unit = true;
        }

        if (editingProduct) {
            put(`/admin/products/${editingProduct.id}`, {
                onSuccess: () => {
                    message.success(`Item '${data.brand_name}' updated.`);
                    setIsModalOpen(false);
                },
            });
        } else {
            post('/admin/products', {
                onSuccess: () => {
                    message.success(`Item '${data.brand_name}' created.`);
                    setIsModalOpen(false);
                },
            });
        }
    };

    const handleToggleStatus = (product: Product) => {
        router.patch(
            `/admin/products/${product.id}/toggle`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    message.success(`Status for '${product.brand_name}' updated.`);
                },
            }
        );
    };

    const handleDelete = (product: Product) => {
        router.delete(`/admin/products/${product.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                message.success(`Item '${product.brand_name}' deleted.`);
            },
        });
    };

    // Multi-unit builder helpers
    const addUnitRow = () => {
        const availableUom = unitsOfMeasure.find(
            (uom) => !data.units.some((row) => row.unit_of_measure_id === uom.id)
        ) || unitsOfMeasure[0];

        setData('units', [
            ...data.units,
            {
                unit_of_measure_id: availableUom ? availableUom.id : 1,
                conversion_factor: 10,
                price: 90.0,
                cost: 55.0,
                is_base_unit: false,
            },
        ]);
    };

    const removeUnitRow = (index: number) => {
        if (data.units.length <= 1) {
            message.warning('At least one unit of measure is required.');
            return;
        }
        const updated = data.units.filter((_, i) => i !== index);
        if (data.units[index].is_base_unit && updated.length > 0) {
            updated[0].is_base_unit = true;
            updated[0].conversion_factor = 1;
        }
        setData('units', updated);
    };

    const updateUnitRow = (index: number, field: string, value: any) => {
        const updated = [...data.units];
        updated[index] = { ...updated[index], [field]: value };
        setData('units', updated);
    };

    const setAsBaseUnit = (selectedIndex: number) => {
        const updated = data.units.map((u, i) => ({
            ...u,
            is_base_unit: i === selectedIndex,
            conversion_factor: i === selectedIndex ? 1 : u.conversion_factor,
        }));
        setData('units', updated);
    };

    // Item count helpers
    const totalMeds = products.filter((p) => p.product_type === 'medicine').length;
    const totalGroceries = products.filter((p) => p.product_type === 'grocery').length;
    const totalSupplies = products.filter((p) => p.product_type === 'medical_supply').length;

    const columns: ColumnsType<Product> = [
        {
            title: 'Item & Formulation Details',
            dataIndex: 'brand_name',
            key: 'brand_name',
            render: (_: string, record: Product) => {
                const isMed = record.product_type === 'medicine';
                const isGrocery = record.product_type === 'grocery';

                return (
                    <div className="flex items-start gap-3">
                        <div
                            className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 mt-0.5 ${
                                isMed
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : isGrocery
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'bg-purple-50 text-purple-600'
                            }`}
                        >
                            {isMed ? (
                                <MedicineBoxOutlined />
                            ) : isGrocery ? (
                                <ShoppingCartOutlined />
                            ) : (
                                <SafetyCertificateOutlined />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900 text-sm">{record.brand_name}</span>
                                {record.dosage_strength && (
                                    <Tag className="text-[10px] font-bold m-0 bg-slate-100 text-slate-700 border-slate-200">
                                        {record.dosage_strength}
                                    </Tag>
                                )}
                            </div>

                            {isMed && record.generic_name ? (
                                <div className="text-xs text-slate-500 font-medium italic mt-0.5">
                                    {record.generic_name} {record.dosage_form ? `• ${record.dosage_form}` : ''}
                                </div>
                            ) : (
                                <div className="text-xs text-slate-500 font-medium mt-0.5">
                                    {record.category || 'Grocery Item'} {record.dosage_form ? `• ${record.dosage_form}` : ''}
                                </div>
                            )}

                            <div className="text-[11px] text-slate-400 mt-0.5">
                                SKU: <span className="font-mono text-slate-600">{record.sku}</span>
                                {record.barcode && (
                                    <span className="ml-2">
                                        Barcode: <span className="font-mono text-slate-600">{record.barcode}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Department',
            dataIndex: 'product_type',
            key: 'product_type',
            render: (type: ProductType, record: Product) => {
                if (type === 'medicine') {
                    return (
                        <div className="space-y-1">
                            <Tag color="green" className="font-bold text-[10px] uppercase px-1.5 py-0.2">
                                💊 Medicine
                            </Tag>
                            {record.classification === 'prescription' ? (
                                <Tag color="orange" className="font-semibold text-[10px] flex items-center gap-1 w-fit">
                                    <FileProtectOutlined /> Rx Prescription
                                </Tag>
                            ) : (
                                <Tag color="blue" className="font-semibold text-[10px]">
                                    OTC
                                </Tag>
                            )}
                        </div>
                    );
                }
                if (type === 'grocery') {
                    return (
                        <Tag color="cyan" className="font-bold text-xs px-2 py-0.5">
                            🛒 Grocery / Care
                        </Tag>
                    );
                }
                return (
                    <Tag color="purple" className="font-bold text-xs px-2 py-0.5">
                        🩹 Medical Supply
                    </Tag>
                );
            },
        },
        {
            title: 'Senior / PWD 20%',
            dataIndex: 'sc_pwd_discountable',
            key: 'sc_pwd_discountable',
            render: (isDiscountable: boolean, record: Product) => (
                <div>
                    {isDiscountable ? (
                        <Tooltip title="Eligible for 20% statutory discount + VAT exemption under RA 9994 (Senior Citizens) & RA 10754 (PWD).">
                            <Tag color="gold" className="font-bold text-[11px] px-2 py-0.5 flex items-center gap-1 w-fit">
                                <IdcardOutlined /> SC/PWD Eligible
                            </Tag>
                        </Tooltip>
                    ) : (
                        <Tooltip title="Standard grocery / non-medical goods are not subject to the 20% medicine discount per BIR rules.">
                            <Tag color="default" className="text-[11px] text-slate-500">
                                Non-Discountable
                            </Tag>
                        </Tooltip>
                    )}
                </div>
            ),
        },
        {
            title: 'Dispensing Units & Pricing',
            key: 'units',
            render: (_: any, record: Product) => (
                <div className="flex flex-wrap gap-1 max-w-sm">
                    {record.units && record.units.length > 0 ? (
                        record.units.map((u) => (
                            <span
                                key={u.id || u.unit_of_measure_id}
                                className={`text-[11px] px-2 py-0.5 rounded-md font-mono font-semibold border ${
                                    u.is_base_unit
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                        : 'bg-slate-50 text-slate-700 border-slate-200'
                                }`}
                            >
                                ₱{Number(u.price).toFixed(2)} / {u.unit_of_measure?.short_code || 'unit'}
                                {u.is_base_unit && <span className="text-[10px] text-emerald-600 ml-1">★ Base</span>}
                            </span>
                        ))
                    ) : (
                        <span className="text-xs text-slate-400">No units set</span>
                    )}
                </div>
            ),
        },
        {
            title: 'Current Stock',
            key: 'stock',
            render: (_: any, record: Product) => {
                const stock = record.total_stock ?? 0;
                const baseUnitName = record.base_unit?.unit_of_measure?.short_code || 'pcs';
                const isOutOfStock = stock <= 0;
                const isLowStock = stock <= record.reorder_level;

                return (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                            <span className={`font-mono font-bold text-xs ${
                                isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-emerald-700'
                            }`}>
                                {stock.toLocaleString()} {baseUnitName}
                            </span>
                            {isOutOfStock ? (
                                <Tag color="error" className="text-[10px] m-0 px-1 py-0">Out of Stock</Tag>
                            ) : isLowStock ? (
                                <Tag color="warning" className="text-[10px] m-0 px-1 py-0">Low Stock</Tag>
                            ) : null}
                        </div>
                        <Button
                            size="small"
                            type="dashed"
                            onClick={() => openStockModal(record)}
                            className="text-[11px] h-6 px-2 text-slate-600 hover:text-emerald-700 hover:border-emerald-500 w-fit"
                        >
                            Update Qty
                        </Button>
                    </div>
                );
            },
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (isActive: boolean, record: Product) => (
                <div className="flex items-center gap-2">
                    <Switch
                        size="small"
                        checked={isActive}
                        onChange={() => handleToggleStatus(record)}
                        className={isActive ? 'bg-emerald-600' : 'bg-slate-300'}
                    />
                    <span className={`text-xs font-semibold ${isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'right',
            render: (_: any, record: Product) => (
                <Space size="small">
                    <Tooltip title="Edit Product">
                        <Button
                            type="text"
                            icon={<EditOutlined className="text-slate-600 hover:text-emerald-600" />}
                            onClick={() => openEditModal(record)}
                        />
                    </Tooltip>

                    <Popconfirm
                        title="Delete Item?"
                        description={`Are you sure you want to delete '${record.brand_name}'?`}
                        onConfirm={() => handleDelete(record)}
                        okText="Yes, Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Delete">
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <AdminLayout
            breadcrumbs={[
                {
                    title: 'Product Masterlist',
                    href: '/admin/products',
                },
            ]}
        >
            <Head title="Product Masterlist - SAM PHARMA" />

            <div className="space-y-5">
                {/* PAGE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Tag color="green" className="font-bold text-[10px] uppercase m-0">
                                Unified Masterlist
                            </Tag>
                            <span className="text-xs text-slate-400 font-semibold">
                                Medicines, Groceries & Supplies
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 m-0">
                            Product Masterlist
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm mt-0.5 m-0">
                            Manage pharmaceutical formulas with Generics Act compliance, alongside toiletries, baby care, and grocery convenience items.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            icon={<ShoppingCartOutlined />}
                            size="large"
                            onClick={() => openCreateModal('grocery')}
                            className="bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 font-bold rounded-xl h-11 px-4"
                        >
                            + Grocery
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            size="large"
                            onClick={() => openCreateModal('medicine')}
                            className="bg-emerald-600 hover:bg-emerald-700 font-bold border-none rounded-xl h-11 px-5 shadow-sm"
                        >
                            + Medicine
                        </Button>
                    </div>
                </div>

                {/* SEGMENTED DEPARTMENT TABS */}
                <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs">
                    <Segmented
                        size="large"
                        value={typeFilter}
                        onChange={handleTypeChange}
                        block
                        options={[
                            { label: `All Items (${products.length})`, value: 'all' },
                            { label: `💊 Medicines (${totalMeds})`, value: 'medicine' },
                            { label: `🛒 Groceries & Toiletries (${totalGroceries})`, value: 'grocery' },
                            { label: `🩹 Medical Supplies (${totalSupplies})`, value: 'medical_supply' },
                        ]}
                    />
                </div>

                {/* SEARCH & FILTERS BAR */}
                <Card className="rounded-2xl border-slate-200 shadow-xs" styles={{ body: { padding: '16px' } }}>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-5">
                            <Input
                                placeholder="Search by Brand, Generic, SKU, Barcode, or Size..."
                                prefix={<SearchOutlined className="text-slate-400" />}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onPressEnter={() => handleSearch()}
                                className="rounded-xl"
                                allowClear
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <Select
                                placeholder="Filter Category"
                                value={categoryFilter || undefined}
                                onChange={(val) => setCategoryFilter(val || '')}
                                className="w-full"
                                allowClear
                                options={[
                                    { label: 'All Categories', value: '' },
                                    ...categories.map((c) => ({ label: c, value: c })),
                                ]}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <Select
                                placeholder="Status"
                                value={statusFilter !== '' ? statusFilter : undefined}
                                onChange={(val) => setStatusFilter(val || '')}
                                className="w-full"
                                allowClear
                                options={[
                                    { label: 'All Statuses', value: '' },
                                    { label: 'Active Only', value: 'active' },
                                    { label: 'Inactive Only', value: 'inactive' },
                                ]}
                            />
                        </div>

                        <div className="sm:col-span-2 flex items-center gap-2">
                            <Button
                                type="primary"
                                onClick={() => handleSearch()}
                                className="bg-slate-800 hover:bg-slate-900 border-none font-bold rounded-xl flex-1"
                            >
                                Filter
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleReset}
                                className="rounded-xl"
                                title="Reset Filters"
                            />
                        </div>
                    </div>
                </Card>

                {/* TABLE CARD */}
                <Card className="rounded-2xl border-slate-200 shadow-xs overflow-hidden" styles={{ body: { padding: 0 } }}>
                    <Table
                        columns={columns}
                        dataSource={products}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showTotal: (total) => `Total ${total} items in catalog`,
                        }}
                    />
                </Card>
            </div>

            {/* CREATE / EDIT PRODUCT MODAL */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-base pb-2 border-b border-slate-100">
                        {data.product_type === 'medicine' ? (
                            <MedicineBoxOutlined className="text-emerald-600" />
                        ) : data.product_type === 'grocery' ? (
                            <ShoppingCartOutlined className="text-sky-600" />
                        ) : (
                            <SafetyCertificateOutlined className="text-purple-600" />
                        )}
                        <span>
                            {editingProduct
                                ? `Edit ${data.brand_name || 'Product'}`
                                : `New ${
                                      data.product_type === 'medicine'
                                          ? 'Medicine'
                                          : data.product_type === 'grocery'
                                          ? 'Grocery Item'
                                          : 'Medical Supply'
                                  }`}
                        </span>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={760}
                className="rounded-2xl"
            >
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* DEPARTMENT SELECTOR RADIO */}
                    <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase">Product Department:</span>
                        <Radio.Group
                            value={data.product_type}
                            onChange={(e) => {
                                const newType = e.target.value as ProductType;
                                setData((prev) => ({
                                    ...prev,
                                    product_type: newType,
                                    sc_pwd_discountable: newType === 'medicine' || newType === 'medical_supply',
                                    classification: newType === 'medicine' ? 'otc' : 'general',
                                    requires_prescription: false,
                                }));
                            }}
                        >
                            <Radio.Button value="medicine" className="font-semibold">💊 Medicine</Radio.Button>
                            <Radio.Button value="grocery" className="font-semibold">🛒 Grocery / Care</Radio.Button>
                            <Radio.Button value="medical_supply" className="font-semibold">🩹 Medical Supply</Radio.Button>
                        </Radio.Group>
                    </div>

                    {/* SECTION 1: PRODUCT DETAILS */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                            1. Item Identification & Details
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                    {data.product_type === 'medicine' ? 'Brand Name *' : 'Item / Brand Name *'}
                                </label>
                                <Input
                                    placeholder={
                                        data.product_type === 'medicine'
                                            ? 'e.g. Biogesic'
                                            : 'e.g. Safeguard Soap / Nature\'s Spring'
                                    }
                                    value={data.brand_name}
                                    onChange={(e) => setData('brand_name', e.target.value)}
                                    status={errors.brand_name ? 'error' : ''}
                                    className="rounded-xl"
                                    required
                                />
                                {errors.brand_name && (
                                    <span className="text-xs text-red-600 mt-1 block">{errors.brand_name}</span>
                                )}
                            </div>

                            {data.product_type === 'medicine' ? (
                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1">
                                        Generic Name * (Active Molecule, RA 6675)
                                    </label>
                                    <Input
                                        placeholder="e.g. Paracetamol"
                                        value={data.generic_name}
                                        onChange={(e) => setData('generic_name', e.target.value)}
                                        status={errors.generic_name ? 'error' : ''}
                                        className="rounded-xl"
                                        required
                                    />
                                    {errors.generic_name && (
                                        <span className="text-xs text-red-600 mt-1 block">{errors.generic_name}</span>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1">
                                        Category (e.g. Toiletries, Beverages, Baby Care)
                                    </label>
                                    <Input
                                        placeholder="e.g. Toiletries & Hygiene"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                    {data.product_type === 'medicine' ? 'Dosage Strength' : 'Net Content / Size'}
                                </label>
                                <Input
                                    placeholder={data.product_type === 'medicine' ? 'e.g. 500mg' : 'e.g. 500ml, 135g, Large'}
                                    value={data.dosage_strength}
                                    onChange={(e) => setData('dosage_strength', e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                    {data.product_type === 'medicine' ? 'Dosage Form' : 'Packaging Type'}
                                </label>
                                <Select
                                    value={data.dosage_form}
                                    onChange={(val) => setData('dosage_form', val)}
                                    className="w-full"
                                    options={
                                        data.product_type === 'medicine'
                                            ? [
                                                  { label: 'Tablet', value: 'Tablet' },
                                                  { label: 'Capsule', value: 'Capsule' },
                                                  { label: 'Syrup', value: 'Syrup' },
                                                  { label: 'Suspension', value: 'Suspension' },
                                                  { label: 'Nebule', value: 'Nebule' },
                                                  { label: 'Drops', value: 'Drops' },
                                                  { label: 'Ointment / Cream', value: 'Ointment / Cream' },
                                              ]
                                            : [
                                                  { label: 'Bottle', value: 'Bottle' },
                                                  { label: 'Bar', value: 'Bar' },
                                                  { label: 'Tube', value: 'Tube' },
                                                  { label: 'Pack', value: 'Pack' },
                                                  { label: 'Can / Tin', value: 'Can' },
                                                  { label: 'Box', value: 'Box' },
                                                  { label: 'Sachet', value: 'Sachet' },
                                              ]
                                    }
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                    {data.product_type === 'medicine' ? 'Therapeutic Class' : 'Brand Line / Variant'}
                                </label>
                                <Input
                                    placeholder={data.product_type === 'medicine' ? 'e.g. Antibiotic' : 'e.g. Pure White / Mint'}
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                    SKU Code *
                                </label>
                                <Input
                                    placeholder="e.g. SAF-WHT-135G"
                                    value={data.sku}
                                    onChange={(e) => setData('sku', e.target.value.toUpperCase())}
                                    status={errors.sku ? 'error' : ''}
                                    className="rounded-xl font-mono text-sm"
                                    required
                                />
                                {errors.sku && <span className="text-xs text-red-600 mt-1 block">{errors.sku}</span>}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                    Barcode (EAN-13 / Scanner)
                                </label>
                                <Input
                                    prefix={<BarcodeOutlined className="text-slate-400" />}
                                    placeholder="4902430123456"
                                    value={data.barcode}
                                    onChange={(e) => setData('barcode', e.target.value)}
                                    className="rounded-xl font-mono text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: SENIOR CITIZEN & TAX SETTINGS */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                            2. Regulatory & Philippine Statutory Discount Rules
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {data.product_type === 'medicine' ? (
                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1">
                                        Prescription Classification
                                    </label>
                                    <Select
                                        value={data.classification}
                                        onChange={(val) => {
                                            setData((prev) => ({
                                                ...prev,
                                                classification: val,
                                                requires_prescription: val !== 'otc',
                                            }));
                                        }}
                                        className="w-full"
                                        options={[
                                            { label: 'OTC (Over-The-Counter)', value: 'otc' },
                                            { label: 'Rx (Prescription Required)', value: 'prescription' },
                                            { label: 'Dangerous Drug / S-2 Controlled', value: 'dangerous_drug' },
                                        ]}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1">
                                        Item Classification
                                    </label>
                                    <Select
                                        value="general"
                                        disabled
                                        className="w-full"
                                        options={[{ label: 'General Consumer Retail', value: 'general' }]}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                    Senior Citizen / PWD 20% Discount Status
                                </label>
                                <Select
                                    value={data.sc_pwd_discountable ? 'eligible' : 'ineligible'}
                                    onChange={(val) => setData('sc_pwd_discountable', val === 'eligible')}
                                    className="w-full"
                                    options={[
                                        { label: 'Eligible (20% Off + VAT Exemption)', value: 'eligible' },
                                        { label: 'Ineligible (Standard Grocery / Retail)', value: 'ineligible' },
                                    ]}
                                />
                            </div>
                        </div>

                        {!data.sc_pwd_discountable && (
                            <div className="p-2 bg-slate-100 rounded-lg text-[11px] text-slate-600">
                                ℹ️ Standard groceries and toiletries are excluded from the 20% Senior/PWD medicine discount per BIR/DTI regulations.
                            </div>
                        )}
                    </div>

                    {/* SECTION 3: MULTI-UNIT PACKAGING & PRICE MATRIX */}
                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                                    3. Dispensing Units & Price Matrix
                                </span>
                                <span className="text-[11px] text-emerald-700">
                                    Set base dispensing price and bulk pack prices (e.g. 1 Bar = ₱52, 3-Pack = ₱150).
                                </span>
                            </div>

                            <Button
                                size="small"
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={addUnitRow}
                                className="border-emerald-600 text-emerald-700 font-bold text-xs rounded-lg"
                            >
                                Add Packaging Tier
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {data.units.map((unitRow, index) => (
                                <div
                                    key={index}
                                    className="p-2.5 bg-white rounded-xl border border-slate-200 flex flex-wrap sm:flex-nowrap items-center gap-2 text-xs"
                                >
                                    <div className="w-full sm:w-44 shrink-0">
                                        <label className="text-[10px] font-bold text-slate-500 block">Unit Type</label>
                                        <Select
                                            size="middle"
                                            value={unitRow.unit_of_measure_id}
                                            onChange={(val) => updateUnitRow(index, 'unit_of_measure_id', val)}
                                            className="w-full"
                                            options={unitsOfMeasure.map((u) => ({
                                                label: `${u.name} (${u.short_code})`,
                                                value: u.id,
                                            }))}
                                        />
                                    </div>

                                    <div className="w-24 shrink-0">
                                        <label className="text-[10px] font-bold text-slate-500 block">
                                            {unitRow.is_base_unit ? 'Base Factor' : 'Qty in Base'}
                                        </label>
                                        <InputNumber
                                            min={1}
                                            disabled={unitRow.is_base_unit}
                                            value={unitRow.conversion_factor}
                                            onChange={(val) => updateUnitRow(index, 'conversion_factor', val || 1)}
                                            className="w-full rounded-lg"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-[100px]">
                                        <label className="text-[10px] font-bold text-slate-500 block">
                                            Selling Price (₱) *
                                        </label>
                                        <InputNumber
                                            min={0}
                                            step={0.25}
                                            value={unitRow.price}
                                            onChange={(val) => updateUnitRow(index, 'price', val || 0)}
                                            className="w-full rounded-lg font-mono font-bold"
                                            prefix="₱"
                                        />
                                    </div>

                                    <div className="w-28 shrink-0">
                                        <label className="text-[10px] font-bold text-slate-500 block">
                                            Base Unit?
                                        </label>
                                        <Button
                                            size="small"
                                            type={unitRow.is_base_unit ? 'primary' : 'default'}
                                            onClick={() => setAsBaseUnit(index)}
                                            className={
                                                unitRow.is_base_unit
                                                    ? 'bg-emerald-600 border-none font-bold text-[10px] w-full'
                                                    : 'text-slate-600 text-[10px] w-full'
                                            }
                                        >
                                            {unitRow.is_base_unit ? '★ Base Unit' : 'Set as Base'}
                                        </Button>
                                    </div>

                                    <div className="shrink-0 pt-3">
                                        <Button
                                            type="text"
                                            danger
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            disabled={unitRow.is_base_unit && data.units.length > 1}
                                            onClick={() => removeUnitRow(index)}
                                            title="Remove unit tier"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MODAL ACTIONS */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                        <Button size="large" onClick={() => setIsModalOpen(false)} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={processing}
                            className="bg-emerald-600 hover:bg-emerald-700 border-none font-bold rounded-xl px-6 shadow-sm"
                        >
                            {editingProduct ? 'Update Item' : 'Save Item'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* QUICK STOCK ADJUSTMENT MODAL */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                        <InboxOutlined className="text-emerald-600 text-lg" />
                        <span>Update Stock Quantity - {stockModalProduct?.brand_name}</span>
                    </div>
                }
                open={Boolean(stockModalProduct)}
                onCancel={() => setStockModalProduct(null)}
                onOk={handleSaveStock}
                confirmLoading={isSubmittingStock}
                okText="Save Stock Count"
                cancelText="Cancel"
                okButtonProps={{ className: 'bg-emerald-600 hover:bg-emerald-700 font-bold' }}
                destroyOnClose
            >
                {stockModalProduct && (
                    <div className="space-y-4 py-2">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                <span>Base Packaging Unit:</span>
                                <span className="font-bold text-slate-700">
                                    {stockModalProduct.base_unit?.unit_of_measure?.name || 'Piece'} ({stockModalProduct.base_unit?.unit_of_measure?.short_code || 'pc'})
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>Recorded Inventory Balance:</span>
                                <span className="font-mono font-bold text-slate-900 text-sm">
                                    {(stockModalProduct.total_stock ?? 0).toLocaleString()} {stockModalProduct.base_unit?.unit_of_measure?.short_code || 'pcs'}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                New Total Stock Quantity ({stockModalProduct.base_unit?.unit_of_measure?.short_code || 'pcs'})
                            </label>
                            <InputNumber
                                min={0}
                                precision={0}
                                value={stockQty}
                                onChange={(val) => setStockQty(val ?? 0)}
                                className="w-full text-lg font-bold"
                                size="large"
                                autoFocus
                            />
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[11px] text-slate-400">Quick count presets:</span>
                                {[10, 50, 100, 200, 500].map((preset) => (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() => setStockQty(preset)}
                                        className="text-xs px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-semibold"
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Reason / Reference Notes
                            </label>
                            <Input
                                placeholder="e.g. Physical inventory count, direct shelf delivery, lot adjustment"
                                value={stockNotes}
                                onChange={(e) => setStockNotes(e.target.value)}
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                                Automatically logs a stock movement record in the inventory ledger with before and after balances.
                            </p>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
