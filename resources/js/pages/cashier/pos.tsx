import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import CashierLayout from '@/layouts/cashier-layout';
import {
    Input,
    Button,
    Card,
    Tag,
    Badge,
    Empty,
    Modal,
    Space,
    Typography,
    Tooltip,
    InputNumber,
    Form,
    Radio,
    message,
    Drawer,
} from 'antd';
import {
    BarcodeOutlined,
    SearchOutlined,
    ShoppingCartOutlined,
    DeleteOutlined,
    PlusOutlined,
    MinusOutlined,
    IdcardOutlined,
    FileTextOutlined,
    PrinterOutlined,
    PauseCircleOutlined,
    CheckCircleFilled,
    CreditCardOutlined,
    DollarOutlined,
    MobileOutlined,
    SafetyCertificateOutlined,
    MedicineBoxOutlined,
    ShoppingOutlined,
    SkinOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import PosReceiptSlip from '@/components/pos-receipt-slip';
import type {
    CashierShift,
    Product,
    ProductUnit,
    DiscountType,
    HeldCart,
    CartItem,
    Transaction,
} from '@/types/pharmacy';

const { Title, Text } = Typography;

interface PosProps {
    cashier: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    shift: CashierShift | null;
    products: Product[];
    discountTypes: DiscountType[];
    heldCarts: HeldCart[];
}

export default function PosTerminal({
    cashier,
    shift,
    products = [],
    discountTypes = [],
    heldCarts = [],
}: PosProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'medicine' | 'grocery' | 'medical_supply'>('all');
    const searchInputRef = useRef<any>(null);

    // Active Cart
    const [cart, setCart] = useState<CartItem[]>([]);

    // Discount state
    const [selectedDiscountId, setSelectedDiscountId] = useState<number | null>(null);
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    const [discountForm] = Form.useForm();
    const [customerDetails, setCustomerDetails] = useState<{
        name: string;
        idNumber: string;
        bookletNumber: string;
    }>({ name: '', idNumber: '', bookletNumber: '' });

    // Held carts state
    const [isHeldCartsDrawerOpen, setIsHeldCartsDrawerOpen] = useState(false);
    const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
    const [holdForm] = Form.useForm();

    // Checkout state
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [checkoutForm] = Form.useForm();
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gcash' | 'maya' | 'card'>('cash');
    const [tenderedCash, setTenderedCash] = useState<number>(0);
    const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);

    // Completed Transaction & Receipt Modal
    const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

    // Filter products
    const filteredProducts = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return products.filter((p) => {
            // Category filter
            if (selectedCategory !== 'all' && p.product_type !== selectedCategory) {
                return false;
            }

            if (!query) return true;

            // Search matches barcode (product or units), brand, generic, sku
            const matchBrand = p.brand_name.toLowerCase().includes(query);
            const matchGeneric = p.generic_name?.toLowerCase().includes(query) ?? false;
            const matchSku = p.sku.toLowerCase().includes(query);
            const matchProductBarcode = p.barcode?.toLowerCase().includes(query) ?? false;
            const matchUnitBarcode = p.units?.some((u) => u.barcode?.toLowerCase().includes(query)) ?? false;

            return matchBrand || matchGeneric || matchSku || matchProductBarcode || matchUnitBarcode;
        });
    }, [products, searchQuery, selectedCategory]);

    // Check if barcode scanner triggered an exact barcode match
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            // Look for exact barcode match
            for (const prod of products) {
                // Check unit barcodes first
                const matchedUnit = prod.units?.find((u) => u.barcode?.toLowerCase() === query);
                if (matchedUnit && matchedUnit.unit_of_measure) {
                    addToCart(prod, matchedUnit);
                    setSearchQuery('');
                    message.success(`Added ${prod.brand_name} (${matchedUnit.unit_of_measure.name})`);
                    return;
                }
                // Check product barcode
                if (prod.barcode?.toLowerCase() === query) {
                    const defaultUnit = prod.units?.find((u) => u.is_base_unit) || prod.units?.[0];
                    if (defaultUnit && defaultUnit.unit_of_measure) {
                        addToCart(prod, defaultUnit);
                        setSearchQuery('');
                        message.success(`Added ${prod.brand_name}`);
                        return;
                    }
                }
            }
        }
    };

    // Add item to cart
    const addToCart = (product: Product, unit: ProductUnit) => {
        if (!unit.unit_of_measure) return;
        const uom = unit.unit_of_measure;

        const cartId = `${product.id}-${unit.unit_of_measure_id}`;

        setCart((prevCart) => {
            const existingIndex = prevCart.findIndex((item) => item.cart_id === cartId);

            if (existingIndex > -1) {
                // Increment qty
                const updated = [...prevCart];
                const current = updated[existingIndex];
                const newQty = current.quantity + 1;
                updated[existingIndex] = {
                    ...current,
                    quantity: newQty,
                    subtotal: Math.round(newQty * current.unit_price * 100) / 100,
                };
                return updated;
            }

            // Add new item
            const unitPrice = Number(unit.price);
            return [
                ...prevCart,
                {
                    cart_id: cartId,
                    product_id: product.id,
                    product: product,
                    unit_of_measure_id: unit.unit_of_measure_id,
                    unit_of_measure: uom,
                    conversion_factor: unit.conversion_factor,
                    quantity: 1,
                    unit_price: unitPrice,
                    subtotal: unitPrice,
                    requires_prescription: Boolean(product.requires_prescription),
                    is_vatable: Boolean(product.is_vatable),
                    sc_pwd_discountable: Boolean(product.sc_pwd_discountable),
                },
            ];
        });
    };

    // Update cart item quantity
    const updateQuantity = (cartId: string, delta: number) => {
        setCart((prev) =>
            prev
                .map((item) => {
                    if (item.cart_id === cartId) {
                        const newQty = item.quantity + delta;
                        if (newQty <= 0) return null;
                        return {
                            ...item,
                            quantity: newQty,
                            subtotal: Math.round(newQty * item.unit_price * 100) / 100,
                        };
                    }
                    return item;
                })
                .filter(Boolean) as CartItem[]
        );
    };

    // Remove item from cart
    const removeFromCart = (cartId: string) => {
        setCart((prev) => prev.filter((item) => item.cart_id !== cartId));
    };

    // Clear entire cart
    const clearCart = () => {
        setCart([]);
        setSelectedDiscountId(null);
        setCustomerDetails({ name: '', idNumber: '', bookletNumber: '' });
    };

    // Selected Discount Object
    const currentDiscount = useMemo(() => {
        return discountTypes.find((d) => d.id === selectedDiscountId) || null;
    }, [discountTypes, selectedDiscountId]);

    // Live Statutory & Tax Calculations (Philippine Formula)
    const calculation = useMemo(() => {
        let grossSubtotal = 0;
        let vatableSales = 0;
        let vatExemptSales = 0;
        let vatAmount = 0;
        let vatReliefAmount = 0;
        let discountAmount = 0;

        const isScPwd = currentDiscount && currentDiscount.is_statutory && Number(currentDiscount.percentage) > 0;

        for (const item of cart) {
            grossSubtotal += item.subtotal;

            if (isScPwd && item.sc_pwd_discountable) {
                // Statutory SC/PWD on medicines/medical supplies:
                // 1. Strip 12% VAT
                const netPrice = item.is_vatable ? item.subtotal / 1.12 : item.subtotal;
                const relief = item.is_vatable ? item.subtotal - netPrice : 0;
                // 2. Apply 20% discount on net price
                const disc = netPrice * (Number(currentDiscount.percentage) / 100);

                vatExemptSales += netPrice;
                vatReliefAmount += relief;
                discountAmount += disc;
            } else {
                // Regular calculation
                if (item.is_vatable) {
                    const netOfVat = item.subtotal / 1.12;
                    vatableSales += netOfVat;
                    vatAmount += item.subtotal - netOfVat;
                } else {
                    vatExemptSales += item.subtotal;
                }
            }
        }

        const netTotal = Math.max(0, grossSubtotal - vatReliefAmount - discountAmount);

        return {
            grossSubtotal: Math.round(grossSubtotal * 100) / 100,
            vatableSales: Math.round(vatableSales * 100) / 100,
            vatExemptSales: Math.round(vatExemptSales * 100) / 100,
            vatAmount: Math.round(vatAmount * 100) / 100,
            vatReliefAmount: Math.round(vatReliefAmount * 100) / 100,
            discountAmount: Math.round(discountAmount * 100) / 100,
            netTotal: Math.round(netTotal * 100) / 100,
        };
    }, [cart, currentDiscount]);

    // Check if cart contains any prescription items
    const hasPrescriptionItems = useMemo(() => {
        return cart.some((item) => item.requires_prescription);
    }, [cart]);

    // Quick tender bills
    const quickTenderOptions = useMemo(() => {
        const total = calculation.netTotal;
        const roundToNext100 = Math.ceil(total / 100) * 100;
        const roundToNext500 = Math.ceil(total / 500) * 500;
        const roundToNext1000 = Math.ceil(total / 1000) * 1000;

        const options = [total];
        if (roundToNext100 > total && !options.includes(roundToNext100)) options.push(roundToNext100);
        if (roundToNext500 > total && !options.includes(roundToNext500)) options.push(roundToNext500);
        if (roundToNext1000 > total && !options.includes(roundToNext1000)) options.push(roundToNext1000);

        return options;
    }, [calculation.netTotal]);

    // Open Checkout Modal
    const handleOpenCheckout = () => {
        if (!shift || shift.status !== 'open') {
            message.warning('Please open a cashier shift before proceeding to checkout.');
            return;
        }

        if (cart.length === 0) {
            message.warning('Cart is empty. Please add items first.');
            return;
        }

        setTenderedCash(calculation.netTotal);
        checkoutForm.setFieldsValue({
            paid_amount: calculation.netTotal,
            payment_method: 'cash',
        });
        setIsCheckoutModalOpen(true);
    };

    // Submit Checkout
    const handleCheckoutSubmit = async (values: any) => {
        setIsSubmittingCheckout(true);

        const payload = {
            items: cart.map((i) => ({
                product_id: i.product_id,
                unit_of_measure_id: i.unit_of_measure_id,
                conversion_factor: i.conversion_factor,
                quantity: i.quantity,
                unit_price: i.unit_price,
            })),
            discount_type_id: selectedDiscountId,
            customer_name: customerDetails.name || null,
            customer_id_number: customerDetails.idNumber || null,
            customer_booklet_number: customerDetails.bookletNumber || null,
            payment_method: paymentMethod,
            payment_reference: values.payment_reference || null,
            paid_amount: paymentMethod === 'cash' ? Number(values.paid_amount || tenderedCash) : calculation.netTotal,
            notes: values.notes || null,
        };

        try {
            const csrfMeta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
            const csrfToken = csrfMeta?.content;

            const response = await fetch('/cashier/pos/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Checkout failed');
            }

            // Success!
            message.success(`Sale completed! Invoice: ${data.transaction.invoice_number}`);
            setCompletedTransaction(data.transaction);
            setIsCheckoutModalOpen(false);
            clearCart();
            setIsReceiptModalOpen(true);

            // Reload page props in background to sync updated batch stock and shift sales
            router.reload({ only: ['products', 'shift'] });
        } catch (err: any) {
            message.error(err.message || 'Transaction could not be processed.');
        } finally {
            setIsSubmittingCheckout(false);
        }
    };

    // Hold Cart
    const handleHoldCart = (values: any) => {
        if (cart.length === 0) return;

        router.post(
            '/cashier/pos/hold-cart',
            {
                cart_reference: values.cart_reference || `Held Cart (${cart.length} items)`,
                cart_data: cart,
            },
            {
                onSuccess: () => {
                    setIsHoldModalOpen(false);
                    holdForm.resetFields();
                    clearCart();
                    message.success('Cart successfully parked.');
                },
                onError: () => message.error('Failed to park cart.'),
            }
        );
    };

    // Recall Cart
    const handleRecallCart = (held: HeldCart) => {
        setCart(held.cart_data);
        setIsHeldCartsDrawerOpen(false);

        // Delete from server
        router.delete(`/cashier/pos/held-cart/${held.id}`, {
            preserveState: true,
            onSuccess: () => message.success(`Resumed cart "${held.cart_reference}".`),
        });
    };

    return (
        <CashierLayout title="Pharma Express Terminal" shiftInfo={shift}>
            <Head title="Cashier POS Terminal - SAM PHARMA" />

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 h-full min-h-[calc(100vh-5.5rem)]">
                {/* ========================================================================= */}
                {/* LEFT COLUMN: CATALOG SEARCH & DISPENSING SELECTION (7 COLS) */}
                {/* ========================================================================= */}
                <div className="lg:col-span-7 flex flex-col gap-3 h-full overflow-hidden">
                    {/* STANDBY BANNER IF SHIFT CLOSED */}
                    {(!shift || shift.status !== 'open') && (
                        <div className="bg-amber-950/40 border border-amber-600/50 px-4 py-3 rounded-2xl flex items-center justify-between text-amber-300 text-xs shadow-sm">
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping inline-block" />
                                <span className="font-semibold">
                                    Register Drawer Standby: Please click "Open Shift & Starting Float" in the header to activate terminal.
                                </span>
                            </div>
                        </div>
                    )}

                    {/* SEARCH & BARCODE SCANNER BAR */}
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative flex-1 w-full">
                            <Input
                                ref={searchInputRef}
                                size="large"
                                prefix={<SearchOutlined className="text-emerald-400 mr-2" />}
                                suffix={
                                    <Tag color="cyan" className="font-mono text-[10px] m-0">
                                        Scan Barcode / Enter
                                    </Tag>
                                }
                                placeholder="Scan Barcode or Search Generic / Brand / Grocery..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                className="bg-slate-950 border-slate-800 text-white placeholder-slate-500 rounded-xl py-2"
                                autoFocus
                            />
                        </div>

                        {/* CATEGORY FILTER TABS */}
                        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                            {[
                                { key: 'all', label: 'All Items' },
                                { key: 'medicine', label: '💊 Medicines' },
                                { key: 'grocery', label: '🛒 Groceries' },
                                { key: 'medical_supply', label: '🩹 Supplies' },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setSelectedCategory(tab.key as any)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                        selectedCategory === tab.key
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* PRODUCTS GRID / LIST */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                        {filteredProducts.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center text-slate-500">
                                <Empty description={<span className="text-slate-400 text-xs">No products found matching query</span>} />
                            </div>
                        ) : (
                            filteredProducts.map((product) => {
                                const stockBase = product.total_stock_base ?? 0;
                                const isOutOfStock = stockBase <= 0;

                                return (
                                    <div
                                        key={product.id}
                                        className="bg-slate-900 border border-slate-800/90 rounded-2xl p-3 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                    >
                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {/* Brand Name */}
                                                <h4 className="font-bold text-white text-sm m-0 truncate">
                                                    {product.brand_name}
                                                </h4>

                                                {/* Rx Tag */}
                                                {product.requires_prescription && (
                                                    <Tag color="error" className="font-bold text-[10px] m-0 uppercase">
                                                        Rx Required
                                                    </Tag>
                                                )}

                                                {/* Product Type Tag */}
                                                <Tag
                                                    color={
                                                        product.product_type === 'medicine'
                                                            ? 'blue'
                                                            : product.product_type === 'grocery'
                                                            ? 'orange'
                                                            : 'cyan'
                                                    }
                                                    className="text-[10px] m-0 capitalize font-medium"
                                                >
                                                    {product.product_type.replace('_', ' ')}
                                                </Tag>

                                                {/* Stock remaining badge */}
                                                <span
                                                    className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                                                        isOutOfStock
                                                            ? 'bg-red-950 text-red-400 border border-red-800'
                                                            : stockBase <= 20
                                                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                                    }`}
                                                >
                                                    {stockBase} {product.base_unit?.unit_of_measure?.short_code || 'pcs'} left
                                                </span>
                                            </div>

                                            {/* Generic Name & Dosage */}
                                            {product.generic_name && (
                                                <p className="text-xs text-emerald-400 font-semibold m-0 mt-0.5 truncate">
                                                    {product.generic_name} {product.dosage_strength && `• ${product.dosage_strength}`}
                                                </p>
                                            )}

                                            <p className="text-[11px] text-slate-500 m-0 mt-0.5">
                                                SKU: {product.sku} {product.barcode && `| Barcode: ${product.barcode}`}
                                            </p>
                                        </div>

                                        {/* Unit of Measure Action Chips */}
                                        <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap shrink-0">
                                            {product.units?.map((unit) => (
                                                <button
                                                    key={unit.id || unit.unit_of_measure_id}
                                                    type="button"
                                                    disabled={isOutOfStock}
                                                    onClick={() => addToCart(product, unit)}
                                                    className={`px-3 py-1.5 rounded-xl border text-left transition-all group ${
                                                        isOutOfStock
                                                            ? 'bg-slate-800/40 border-slate-800 text-slate-600 cursor-not-allowed'
                                                            : 'bg-slate-950 hover:bg-emerald-600 border-slate-800 hover:border-emerald-500 text-white cursor-pointer active:scale-95'
                                                    }`}
                                                >
                                                    <div className="text-[10px] text-slate-400 group-hover:text-emerald-100 uppercase font-bold leading-tight">
                                                        {unit.unit_of_measure?.name || 'Unit'}
                                                    </div>
                                                    <div className="text-xs font-mono font-bold text-emerald-400 group-hover:text-white leading-tight">
                                                        ₱{Number(unit.price).toFixed(2)}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* RIGHT COLUMN: ACTIVE CART & DISPENSING TOTALS (5 COLS) */}
                {/* ========================================================================= */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between h-full shadow-lg overflow-hidden">
                    {/* CART HEADER */}
                    <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShoppingCartOutlined className="text-emerald-400 text-base" />
                            <h3 className="text-white font-bold text-base m-0">Current Order</h3>
                            <Tag color="cyan" className="font-mono text-xs m-0">
                                {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                            </Tag>
                        </div>

                        <div className="flex items-center gap-1.5">
                            {heldCarts.length > 0 && (
                                <Button
                                    size="small"
                                    icon={<PauseCircleOutlined />}
                                    onClick={() => setIsHeldCartsDrawerOpen(true)}
                                    className="bg-slate-800 border-slate-700 text-amber-400 hover:text-amber-300 font-bold text-xs"
                                >
                                    Held ({heldCarts.length})
                                </Button>
                            )}

                            {cart.length > 0 && (
                                <>
                                    <Button
                                        size="small"
                                        onClick={() => setIsHoldModalOpen(true)}
                                        className="bg-slate-800 border-slate-700 text-slate-300 hover:text-white text-xs"
                                    >
                                        Hold
                                    </Button>
                                    <Button
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={clearCart}
                                        className="text-xs"
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* CART ITEMS LIST */}
                    <div className="flex-1 overflow-y-auto py-2 space-y-2 pr-1">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
                                <ShoppingCartOutlined className="text-4xl text-slate-700 mb-2" />
                                <p className="text-xs text-slate-400 m-0">Order is empty.</p>
                                <p className="text-[11px] text-slate-600 m-0">Scan barcode or click packaging chips to add items.</p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div
                                    key={item.cart_id}
                                    className="bg-slate-950 border border-slate-800/80 rounded-2xl p-2.5 flex items-center justify-between gap-2"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <p className="font-bold text-white text-xs m-0 truncate">
                                                {item.product.brand_name}
                                            </p>
                                            {item.requires_prescription && (
                                                <Tag color="red" className="text-[9px] font-bold m-0 px-1 py-0">Rx</Tag>
                                            )}
                                        </div>
                                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                            <span className="font-mono text-emerald-400 font-semibold">
                                                ₱{item.unit_price.toFixed(2)}
                                            </span>
                                            <span>/ {item.unit_of_measure.name}</span>
                                            {item.conversion_factor > 1 && (
                                                <span className="text-[10px] text-slate-500">
                                                    ({item.conversion_factor} pcs)
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quantity Stepper */}
                                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
                                        <button
                                            type="button"
                                            onClick={() => updateQuantity(item.cart_id, -1)}
                                            className="h-6 w-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
                                        >
                                            <MinusOutlined />
                                        </button>
                                        <span className="font-mono font-bold text-white text-xs w-7 text-center">
                                            {item.quantity}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => updateQuantity(item.cart_id, 1)}
                                            className="h-6 w-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
                                        >
                                            <PlusOutlined />
                                        </button>
                                    </div>

                                    {/* Line Total */}
                                    <div className="text-right shrink-0 min-w-[70px]">
                                        <p className="font-mono font-bold text-white text-xs m-0">
                                            ₱{item.subtotal.toFixed(2)}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => removeFromCart(item.cart_id)}
                                            className="text-[10px] text-slate-500 hover:text-red-400 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* DISCOUNT & TOTALS FOOTER */}
                    <div className="pt-3 border-t border-slate-800 space-y-2">
                        {/* Senior / PWD Discount Button or Applied Tag */}
                        <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
                            {currentDiscount ? (
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-1.5 text-xs text-purple-300">
                                        <IdcardOutlined className="text-purple-400" />
                                        <span className="font-bold">{currentDiscount.name} Applied</span>
                                        {customerDetails.idNumber && (
                                            <span className="text-[10px] text-slate-400">({customerDetails.idNumber})</span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedDiscountId(null);
                                            setCustomerDetails({ name: '', idNumber: '', bookletNumber: '' });
                                        }}
                                        className="text-xs text-red-400 hover:text-red-300 font-bold"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <Button
                                    type="dashed"
                                    size="small"
                                    icon={<IdcardOutlined />}
                                    disabled={cart.length === 0}
                                    onClick={() => setIsDiscountModalOpen(true)}
                                    className="w-full bg-slate-900 border-slate-700 text-purple-300 hover:text-purple-200 font-semibold text-xs"
                                >
                                    Apply Senior Citizen / PWD 20% Discount (RA 9994/10754)
                                </Button>
                            )}
                        </div>

                        {/* Breakdown Summary */}
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between text-slate-400">
                                <span>Gross Subtotal:</span>
                                <span className="font-mono text-slate-300">₱{calculation.grossSubtotal.toFixed(2)}</span>
                            </div>

                            {calculation.vatReliefAmount > 0 && (
                                <div className="flex justify-between text-blue-400">
                                    <span>Less 12% VAT Exemption:</span>
                                    <span className="font-mono">-₱{calculation.vatReliefAmount.toFixed(2)}</span>
                                </div>
                            )}

                            {calculation.discountAmount > 0 && (
                                <div className="flex justify-between text-emerald-400 font-semibold">
                                    <span>Less 20% SC/PWD Discount:</span>
                                    <span className="font-mono">-₱{calculation.discountAmount.toFixed(2)}</span>
                                </div>
                            )}

                            {/* Grand Total */}
                            <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
                                <span className="text-sm font-bold text-white uppercase tracking-wider">Total Amount:</span>
                                <span className="text-2xl font-mono font-bold text-emerald-400">
                                    ₱{calculation.netTotal.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* CHECKOUT BUTTON */}
                        {(!shift || shift.status !== 'open') ? (
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => {
                                    router.post('/cashier/shifts/open', {
                                        opening_float: 2000,
                                        device_terminal_id: 'TERM-01',
                                        notes: 'Active register shift opened',
                                    }, {
                                        onSuccess: () => {
                                            message.success('Shift opened with ₱2,000 float! You can now checkout.');
                                        },
                                        onError: (err) => {
                                            message.error(Object.values(err)[0] as string || 'Failed to open shift');
                                        }
                                    });
                                }}
                                className="w-full h-12 bg-amber-600 hover:bg-amber-500 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg"
                            >
                                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                <span>Click to Open Shift & Enable Checkout</span>
                            </Button>
                        ) : (
                            <Button
                                type="primary"
                                size="large"
                                disabled={cart.length === 0}
                                onClick={handleOpenCheckout}
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 font-bold text-base rounded-2xl shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2"
                            >
                                <span>Pay & Dispense (F9)</span>
                                <span className="font-mono">₱{calculation.netTotal.toFixed(2)}</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* MODAL 1: CHECKOUT & PAYMENT */}
            {/* ========================================================================= */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                        <DollarOutlined className="text-emerald-600" />
                        <span>POS Checkout & Payment</span>
                    </div>
                }
                open={isCheckoutModalOpen}
                onCancel={() => setIsCheckoutModalOpen(false)}
                footer={null}
                width={560}
                destroyOnClose
            >
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mb-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 m-0">Total Net Amount Payable:</p>
                        <p className="text-2xl font-bold font-mono text-emerald-600 m-0">
                            ₱{calculation.netTotal.toFixed(2)}
                        </p>
                    </div>
                    {currentDiscount && (
                        <div className="text-right">
                            <Tag color="purple" className="font-bold m-0">{currentDiscount.name}</Tag>
                            <p className="text-[11px] text-slate-500 m-0 mt-0.5">
                                Total Savings: ₱{(calculation.vatReliefAmount + calculation.discountAmount).toFixed(2)}
                            </p>
                        </div>
                    )}
                </div>

                <Form form={checkoutForm} layout="vertical" onFinish={handleCheckoutSubmit}>
                    {/* Payment Method Selector */}
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-slate-700 mb-2">Select Payment Method</label>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { key: 'cash', label: 'Cash', icon: <DollarOutlined /> },
                                { key: 'gcash', label: 'GCash', icon: <MobileOutlined /> },
                                { key: 'maya', label: 'Maya', icon: <MobileOutlined /> },
                                { key: 'card', label: 'Debit/Card', icon: <CreditCardOutlined /> },
                            ].map((method) => (
                                <button
                                    key={method.key}
                                    type="button"
                                    onClick={() => setPaymentMethod(method.key as any)}
                                    className={`py-2 px-1 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                                        paymentMethod === method.key
                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    <span className="text-base">{method.icon}</span>
                                    <span>{method.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cash Tender & Quick Buttons */}
                    {paymentMethod === 'cash' ? (
                        <div className="space-y-3 mb-4 bg-slate-50/80 p-3 rounded-2xl border border-slate-200">
                            <Form.Item
                                name="paid_amount"
                                label={<span className="font-semibold text-slate-700">Cash Received / Tendered (₱ PHP)</span>}
                                rules={[{ required: true, message: 'Please enter cash tendered' }]}
                                className="!mb-2"
                            >
                                <InputNumber
                                    min={0}
                                    step={10}
                                    precision={2}
                                    prefix="₱"
                                    size="large"
                                    value={tenderedCash}
                                    onChange={(val) => setTenderedCash(Number(val) || 0)}
                                    className="w-full text-xl font-bold font-mono"
                                />
                            </Form.Item>

                            {/* Quick Tender Bills */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs text-slate-500">Quick Tender:</span>
                                {quickTenderOptions.map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => {
                                            setTenderedCash(opt);
                                            checkoutForm.setFieldsValue({ paid_amount: opt });
                                        }}
                                        className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-white border border-slate-300 hover:bg-emerald-50 hover:border-emerald-400 text-slate-700 transition-colors"
                                    >
                                        ₱{opt.toFixed(2)}
                                    </button>
                                ))}
                            </div>

                            {/* Change Due Display */}
                            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                <span className="text-xs font-bold text-slate-600">Change Due to Customer:</span>
                                <span className="text-lg font-mono font-bold text-emerald-600">
                                    ₱{Math.max(0, tenderedCash - calculation.netTotal).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <Form.Item
                            name="payment_reference"
                            label={<span className="font-semibold text-slate-700">{paymentMethod.toUpperCase()} Reference / Approval Code</span>}
                            rules={[{ required: true, message: 'Please input reference or transaction code' }]}
                        >
                            <Input placeholder="e.g. GCash Ref # 123456789" />
                        </Form.Item>
                    )}

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                        <Button onClick={() => setIsCheckoutModalOpen(false)}>Cancel</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isSubmittingCheckout}
                            className="bg-emerald-600 hover:bg-emerald-500 font-bold px-6"
                        >
                            Complete & Print Receipt
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* ========================================================================= */}
            {/* MODAL 2: SENIOR CITIZEN / PWD DISCOUNT FORM */}
            {/* ========================================================================= */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-purple-700 font-bold">
                        <IdcardOutlined />
                        <span>Apply Philippine Statutory Benefit (RA 9994 / RA 10754)</span>
                    </div>
                }
                open={isDiscountModalOpen}
                onCancel={() => setIsDiscountModalOpen(false)}
                footer={null}
                destroyOnClose
            >
                <div className="text-xs text-slate-500 mb-4">
                    Applies 20% statutory discount and removes 12% VAT strictly on medicines and medical supplies. Groceries remain at standard retail prices.
                </div>

                <Form
                    form={discountForm}
                    layout="vertical"
                    initialValues={{ discount_type_id: discountTypes[0]?.id }}
                    onFinish={(values) => {
                        setSelectedDiscountId(values.discount_type_id);
                        setCustomerDetails({
                            name: values.customer_name,
                            idNumber: values.customer_id_number,
                            bookletNumber: values.customer_booklet_number || '',
                        });
                        setIsDiscountModalOpen(false);
                        message.success('Statutory discount applied.');
                    }}
                >
                    <Form.Item
                        name="discount_type_id"
                        label={<span className="font-semibold text-slate-700">Select Statutory Benefit</span>}
                        rules={[{ required: true }]}
                    >
                        <Radio.Group className="flex flex-col gap-2">
                            {discountTypes
                                .filter((d) => d.is_statutory)
                                .map((disc) => (
                                    <Radio key={disc.id} value={disc.id} className="text-xs">
                                        <span className="font-bold">{disc.name}</span>
                                        <span className="text-slate-500 ml-1">({disc.legal_basis || 'Statutory'})</span>
                                    </Radio>
                                ))}
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item
                        name="customer_name"
                        label={<span className="font-semibold text-slate-700">Beneficiary Customer Name</span>}
                        rules={[{ required: true, message: 'Please enter cardholder name' }]}
                    >
                        <Input placeholder="e.g. Roberto Gomez" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-2">
                        <Form.Item
                            name="customer_id_number"
                            label={<span className="font-semibold text-slate-700">OSCA / PWD ID Number</span>}
                            rules={[{ required: true, message: 'Please enter ID number' }]}
                        >
                            <Input placeholder="e.g. SC-NCR-2024-8849" />
                        </Form.Item>

                        <Form.Item
                            name="customer_booklet_number"
                            label={<span className="font-semibold text-slate-700">Purchase Booklet No.</span>}
                        >
                            <Input placeholder="Booklet Page/Ref" />
                        </Form.Item>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                        <Button onClick={() => setIsDiscountModalOpen(false)}>Cancel</Button>
                        <Button type="primary" htmlType="submit" className="bg-purple-600 hover:bg-purple-500 font-bold">
                            Apply 20% Discount & VAT Relief
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* ========================================================================= */}
            {/* MODAL 3: HOLD CART PROMPT */}
            {/* ========================================================================= */}
            <Modal
                title="Hold / Park Current Cart"
                open={isHoldModalOpen}
                onCancel={() => setIsHoldModalOpen(false)}
                footer={null}
                destroyOnClose
            >
                <div className="text-xs text-slate-500 mb-3">
                    Park this transaction temporarily to attend to another customer while the patient is consulting the pharmacist.
                </div>

                <Form form={holdForm} layout="vertical" onFinish={handleHoldCart}>
                    <Form.Item
                        name="cart_reference"
                        label="Reference Tag / Customer Name"
                        rules={[{ required: true, message: 'Please give a reference tag' }]}
                    >
                        <Input placeholder="e.g. Patient consulting Dr. Maria / Looking for vitamins" />
                    </Form.Item>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                        <Button onClick={() => setIsHoldModalOpen(false)}>Cancel</Button>
                        <Button type="primary" htmlType="submit" className="bg-emerald-600 hover:bg-emerald-500 font-bold">
                            Park Cart
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* ========================================================================= */}
            {/* DRAWER: RECALL HELD CARTS */}
            {/* ========================================================================= */}
            <Drawer
                title="Parked / Held Carts"
                placement="right"
                onClose={() => setIsHeldCartsDrawerOpen(false)}
                open={isHeldCartsDrawerOpen}
            >
                {heldCarts.length === 0 ? (
                    <Empty description="No parked carts" />
                ) : (
                    <div className="space-y-3">
                        {heldCarts.map((held) => (
                            <div
                                key={held.id}
                                className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-800 text-sm">{held.cart_reference}</span>
                                    <Tag color="cyan">{held.cart_data?.length || 0} items</Tag>
                                </div>
                                <div className="text-[11px] text-slate-500">
                                    Parked: {new Date(held.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="flex justify-end gap-2 pt-1">
                                    <Button
                                        size="small"
                                        type="primary"
                                        onClick={() => handleRecallCart(held)}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-xs font-bold"
                                    >
                                        Resume Order
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Drawer>

            {/* ========================================================================= */}
            {/* MODAL 4: PRINTABLE OFFICIAL POS THERMAL RECEIPT */}
            {/* ========================================================================= */}
            <Modal
                title="Official Sales Invoice / POS Receipt"
                open={isReceiptModalOpen}
                onCancel={() => {
                    setIsReceiptModalOpen(false);
                    setCompletedTransaction(null);
                }}
                footer={null}
                width={400}
                destroyOnClose
            >
                {completedTransaction && (
                    <PosReceiptSlip
                        transaction={completedTransaction}
                    />
                )}
            </Modal>
        </CashierLayout>
    );
}
