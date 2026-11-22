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
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    AppstoreOutlined,
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
    StopOutlined,
    InfoCircleOutlined,
} from '@ant-design/icons';
import type { UnitOfMeasure } from '@/types/pharmacy';

interface UomPageProps {
    uoms: UnitOfMeasure[];
    categories: string[];
    filters: {
        search: string;
        status: string;
        category: string;
    };
}

export default function UomIndex({ uoms, categories, filters }: UomPageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || '');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUom, setEditingUom] = useState<UnitOfMeasure | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        short_code: '',
        category: 'Packaging',
        description: '',
        is_active: true,
    });

    const handleSearch = () => {
        router.get(
            '/admin/uom',
            {
                search: search || undefined,
                status: statusFilter || undefined,
                category: categoryFilter || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setStatusFilter('');
        setCategoryFilter('');
        router.get('/admin/uom', {}, { preserveState: true, replace: true });
    };

    const openCreateModal = () => {
        setEditingUom(null);
        clearErrors();
        reset();
        setData({
            name: '',
            short_code: '',
            category: 'Packaging',
            description: '',
            is_active: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (uom: UnitOfMeasure) => {
        setEditingUom(uom);
        clearErrors();
        setData({
            name: uom.name,
            short_code: uom.short_code,
            category: (uom as any).category || 'Packaging',
            description: uom.description || '',
            is_active: uom.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUom) {
            put(`/admin/uom/${editingUom.id}`, {
                onSuccess: () => {
                    message.success(`Unit '${data.name}' updated successfully.`);
                    setIsModalOpen(false);
                },
            });
        } else {
            post('/admin/uom', {
                onSuccess: () => {
                    message.success(`Unit '${data.name}' created successfully.`);
                    setIsModalOpen(false);
                },
            });
        }
    };

    const handleToggleStatus = (uom: UnitOfMeasure) => {
        router.patch(
            `/admin/uom/${uom.id}/toggle`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    message.success(`Status for '${uom.name}' toggled.`);
                },
            }
        );
    };

    const handleDelete = (uom: UnitOfMeasure) => {
        router.delete(`/admin/uom/${uom.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                message.success(`Unit '${uom.name}' deleted.`);
            },
        });
    };

    const applyPreset = (presetName: string, presetCode: string, presetCat: string) => {
        setData((prev) => ({
            ...prev,
            name: presetName,
            short_code: presetCode,
            category: presetCat,
        }));
    };

    const getCategoryTagColor = (cat?: string | null) => {
        switch (cat) {
            case 'Packaging':
                return 'blue';
            case 'Solid Oral':
                return 'green';
            case 'Liquid':
                return 'cyan';
            case 'Injectable':
                return 'purple';
            case 'Topical':
                return 'orange';
            case 'Inhalation':
                return 'geekblue';
            case 'Medical Supply':
                return 'magenta';
            default:
                return 'default';
        }
    };

    const columns: ColumnsType<UnitOfMeasure> = [
        {
            title: 'Unit Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: any) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                        <AppstoreOutlined />
                    </div>
                    <div>
                        <span className="font-bold text-slate-800 text-sm block">{text}</span>
                        {record.description && (
                            <span className="text-slate-400 text-xs block truncate max-w-xs">
                                {record.description}
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'Short Code',
            dataIndex: 'short_code',
            key: 'short_code',
            render: (code: string) => (
                <Tag color="cyan" className="font-mono text-xs font-semibold px-2 py-0.5">
                    {code}
                </Tag>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (category: string) => (
                <Tag color={getCategoryTagColor(category)} className="font-medium text-xs">
                    {category || 'General'}
                </Tag>
            ),
        },
        {
            title: 'Dispensing Status',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (isActive: boolean, record: UnitOfMeasure) => (
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
            render: (_: any, record: UnitOfMeasure) => (
                <Space size="small">
                    <Tooltip title="Edit Unit">
                        <Button
                            type="text"
                            icon={<EditOutlined className="text-slate-600 hover:text-emerald-600" />}
                            onClick={() => openEditModal(record)}
                        />
                    </Tooltip>

                    <Popconfirm
                        title="Delete Unit of Measure?"
                        description={`Are you sure you want to delete '${record.name}'?`}
                        onConfirm={() => handleDelete(record)}
                        okText="Yes, Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Delete">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                            />
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
                    title: 'Units of Measure (UOM)',
                    href: '/admin/uom',
                },
            ]}
        >
            <Head title="Unit of Measure (UOM) Management - SAM PHARMA" />

            <div className="space-y-5">
                {/* PAGE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Tag color="cyan" className="font-bold text-[10px] uppercase m-0">
                                Admin Inventory Setup
                            </Tag>
                            <span className="text-xs text-slate-400 font-semibold">
                                Module 2
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 m-0">
                            Units of Measure (UOM)
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm mt-0.5 m-0">
                            Configure standard packaging and dispensing units used across medicine catalogs and conversions.
                        </p>
                    </div>

                    <div>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            size="large"
                            onClick={openCreateModal}
                            className="bg-emerald-600 hover:bg-emerald-700 font-bold border-none rounded-xl h-11 px-5 shadow-sm"
                        >
                            Add New Unit
                        </Button>
                    </div>
                </div>

                {/* SEARCH & FILTERS BAR */}
                <Card className="rounded-2xl border-slate-200 shadow-xs" styles={{ body: { padding: '16px' } }}>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-5">
                            <Input
                                placeholder="Search by name, short code, or description..."
                                prefix={<SearchOutlined className="text-slate-400" />}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onPressEnter={handleSearch}
                                className="rounded-xl"
                                allowClear
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <Select
                                placeholder="Filter by Category"
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
                                onClick={handleSearch}
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
                        dataSource={uoms}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showTotal: (total) => `Total ${total} units of measure`,
                        }}
                        className="pharmacy-table"
                    />
                </Card>
            </div>

            {/* CREATE / EDIT MODAL */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-base pb-2 border-b border-slate-100">
                        <AppstoreOutlined className="text-emerald-600" />
                        <span>{editingUom ? 'Edit Unit of Measure' : 'Create New Unit of Measure'}</span>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={520}
                className="rounded-2xl"
            >
                {/* PRESET CHIPS (FOR QUICK CREATION) */}
                {!editingUom && (
                    <div className="my-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                            <InfoCircleOutlined className="text-emerald-600" />
                            <span>Quick Pharmaceutical Presets:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            <Button size="small" onClick={() => applyPreset('Box', 'box', 'Packaging')} className="text-xs rounded-lg">
                                + Box
                            </Button>
                            <Button size="small" onClick={() => applyPreset('Blister Pack', 'blst', 'Packaging')} className="text-xs rounded-lg">
                                + Blister Pack
                            </Button>
                            <Button size="small" onClick={() => applyPreset('Strip', 'strp', 'Packaging')} className="text-xs rounded-lg">
                                + Strip
                            </Button>
                            <Button size="small" onClick={() => applyPreset('Piece / Tablet', 'pc', 'Solid Oral')} className="text-xs rounded-lg">
                                + Piece
                            </Button>
                            <Button size="small" onClick={() => applyPreset('Bottle', 'btl', 'Liquid')} className="text-xs rounded-lg">
                                + Bottle
                            </Button>
                            <Button size="small" onClick={() => applyPreset('Vial', 'vial', 'Injectable')} className="text-xs rounded-lg">
                                + Vial
                            </Button>
                            <Button size="small" onClick={() => applyPreset('Nebule', 'neb', 'Inhalation')} className="text-xs rounded-lg">
                                + Nebule
                            </Button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* UNIT NAME */}
                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                            Unit Name * (e.g. Box, Blister Pack, Piece / Tablet)
                        </label>
                        <Input
                            size="large"
                            placeholder="e.g. Blister Pack"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            status={errors.name ? 'error' : ''}
                            className="rounded-xl"
                            required
                        />
                        {errors.name && (
                            <span className="text-xs text-red-600 mt-1 block">{errors.name}</span>
                        )}
                    </div>

                    {/* SHORT CODE & CATEGORY */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                                Short Code * (e.g. pc, box, blst)
                            </label>
                            <Input
                                size="large"
                                placeholder="e.g. blst"
                                value={data.short_code}
                                onChange={(e) => setData('short_code', e.target.value.toLowerCase())}
                                status={errors.short_code ? 'error' : ''}
                                className="rounded-xl font-mono text-sm"
                                required
                            />
                            {errors.short_code && (
                                <span className="text-xs text-red-600 mt-1 block">{errors.short_code}</span>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                                Form / Category
                            </label>
                            <Select
                                size="large"
                                value={data.category}
                                onChange={(val) => setData('category', val)}
                                className="w-full"
                                options={[
                                    { label: 'Packaging (Box, Strip, Blister)', value: 'Packaging' },
                                    { label: 'Solid Oral (Tablet, Capsule)', value: 'Solid Oral' },
                                    { label: 'Liquid (Syrup, Drops, Solution)', value: 'Liquid' },
                                    { label: 'Injectable (Vial, Ampoule)', value: 'Injectable' },
                                    { label: 'Inhalation (Nebule, Inhaler)', value: 'Inhalation' },
                                    { label: 'Topical (Tube, Ointment)', value: 'Topical' },
                                    { label: 'Powder / Granule (Sachet)', value: 'Powder / Granule' },
                                    { label: 'Medical Supply', value: 'Medical Supply' },
                                ]}
                            />
                        </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                            Description / Dispensing Notes (Optional)
                        </label>
                        <Input.TextArea
                            rows={3}
                            placeholder="e.g. Foil pack containing 10 tablets. Dispensed whole or cut."
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="rounded-xl"
                        />
                    </div>

                    {/* ACTIVE STATUS SWITCH */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                            <span className="font-bold text-xs text-slate-800 block">
                                Enable for Dispensing
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                                Inactive units cannot be assigned to new products.
                            </span>
                        </div>
                        <Switch
                            checked={data.is_active}
                            onChange={(val) => setData('is_active', val)}
                            className={data.is_active ? 'bg-emerald-600' : 'bg-slate-300'}
                        />
                    </div>

                    {/* ACTIONS */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                        <Button
                            size="large"
                            onClick={() => setIsModalOpen(false)}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={processing}
                            className="bg-emerald-600 hover:bg-emerald-700 border-none font-bold rounded-xl px-6 shadow-sm"
                        >
                            {editingUom ? 'Update Unit' : 'Save Unit'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
