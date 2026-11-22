<?php

namespace App\Services;

class PhilippineDiscountService
{
    public const VAT_RATE = 0.12;
    public const SENIOR_PWD_DISCOUNT_RATE = 0.20;

    /**
     * Calculate itemized breakdown for a transaction given cart items and discount settings.
     *
     * @param array $items Array of items: ['price' => float, 'quantity' => int, 'is_vatable' => bool, 'sc_pwd_discountable' => bool, 'name' => string]
     * @param string $discountCode 'NONE', 'SC', 'PWD', 'STAFF', etc.
     * @param float $customPercentage If custom promo discount
     * @return array
     */
    public function calculate(array $items, string $discountCode = 'NONE', float $customPercentage = 0.0): array
    {
        $discountCode = strtoupper($discountCode);
        $isSeniorOrPwd = in_array($discountCode, ['SC', 'PWD', 'SENIOR', 'SENIOR_CITIZEN']);

        $grossTotal = 0.0;
        $vatableSales = 0.0;
        $vatAmount = 0.0;
        $vatExemptSales = 0.0;
        $vatReliefAmount = 0.0;
        $discountTotal = 0.0;
        $netPayable = 0.0;

        $processedItems = [];

        foreach ($items as $item) {
            $unitPrice = (float) ($item['price'] ?? 0);
            $qty = (int) ($item['quantity'] ?? 1);
            $isVatable = (bool) ($item['is_vatable'] ?? true);
            $isDiscountable = (bool) ($item['sc_pwd_discountable'] ?? true);

            $lineGross = $unitPrice * $qty;
            $grossTotal += $lineGross;

            $lineVatExempt = 0.0;
            $lineVatAmount = 0.0;
            $lineVatableSales = 0.0;
            $lineDiscount = 0.0;
            $lineVatRelief = 0.0;

            if ($isSeniorOrPwd && $isDiscountable) {
                // PHILIPPINE SENIOR / PWD STATUTORY BENEFIT (RA 9994 / RA 10754)
                if ($isVatable) {
                    // Step 1: Strip 12% VAT
                    $netOfVatUnitPrice = $unitPrice / (1 + self::VAT_RATE);
                    $lineVatExempt = $netOfVatUnitPrice * $qty;
                    $lineVatRelief = $lineGross - $lineVatExempt; // 12% VAT waived
                } else {
                    // Already VAT-exempt (e.g. TRAIN Law hypertension/diabetes med)
                    $lineVatExempt = $lineGross;
                    $lineVatRelief = 0.0;
                }

                // Step 2: Apply 20% discount on Net of VAT price
                $lineDiscount = $lineVatExempt * self::SENIOR_PWD_DISCOUNT_RATE;
                $lineNet = $lineVatExempt - $lineDiscount;

                $vatExemptSales += $lineVatExempt;
                $vatReliefAmount += $lineVatRelief;
                $discountTotal += $lineDiscount;
                $netPayable += $lineNet;

                $processedItems[] = array_merge($item, [
                    'line_gross' => round($lineGross, 2),
                    'vat_exempt' => round($lineVatExempt, 2),
                    'vat_relief' => round($lineVatRelief, 2),
                    'discount_amount' => round($lineDiscount, 2),
                    'line_net' => round($lineNet, 2),
                    'discount_applied' => '20% SC/PWD + VAT-Exempt',
                ]);
            } else {
                // REGULAR / GROCERY / NON-SENIOR ITEM
                if ($isVatable) {
                    $netOfVatUnitPrice = $unitPrice / (1 + self::VAT_RATE);
                    $lineVatableSales = $netOfVatUnitPrice * $qty;
                    $lineVatAmount = $lineGross - $lineVatableSales;

                    $vatableSales += $lineVatableSales;
                    $vatAmount += $lineVatAmount;
                } else {
                    $vatExemptSales += $lineGross;
                }

                // Apply custom promo or staff discount if applicable
                if ($customPercentage > 0) {
                    $lineDiscount = $lineGross * ($customPercentage / 100);
                    $discountTotal += $lineDiscount;
                }

                $lineNet = $lineGross - $lineDiscount;
                $netPayable += $lineNet;

                $processedItems[] = array_merge($item, [
                    'line_gross' => round($lineGross, 2),
                    'vat_exempt' => round($lineVatExempt, 2),
                    'vat_relief' => 0.0,
                    'discount_amount' => round($lineDiscount, 2),
                    'line_net' => round($lineNet, 2),
                    'discount_applied' => $customPercentage > 0 ? "{$customPercentage}% Promo" : 'None',
                ]);
            }
        }

        return [
            'gross_total' => round($grossTotal, 2),
            'vatable_sales' => round($vatableSales, 2),
            'vat_amount' => round($vatAmount, 2),
            'vat_exempt_sales' => round($vatExemptSales, 2),
            'vat_relief_amount' => round($vatReliefAmount, 2),
            'discount_total' => round($discountTotal, 2),
            'net_payable' => round($netPayable, 2),
            'discount_type' => $discountCode,
            'items' => $processedItems,
        ];
    }
}
