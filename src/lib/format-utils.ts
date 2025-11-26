/**
 * Utility functions for formatting data
 */

/**
 * Format currency in Vietnamese format
 * @param amount - Amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(2600000) // "2.600.000₫"
 * formatCurrency(2600000, { symbol: 'đ' }) // "2.600.000đ"
 * formatCurrency(2600000, { showSymbol: false }) // "2.600.000"
 */
export function formatCurrency(
    amount: number | null | undefined,
    options: {
        symbol?: '₫' | 'đ' | 'VND';
        showSymbol?: boolean;
        symbolPosition?: 'before' | 'after';
    } = {}
): string {
    const {
        symbol = '₫',
        showSymbol = true,
        symbolPosition = 'after'
    } = options;

    const value = amount ?? 0;

    // Format number with Vietnamese locale (uses . as thousand separator)
    const formatted = new Intl.NumberFormat('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);

    if (!showSymbol) {
        return formatted;
    }

    return symbolPosition === 'before'
        ? `${symbol} ${formatted}`
        : `${formatted}${symbol}`;
}

/**
 * Format number with Vietnamese locale
 */
export function formatNumber(value: number | null | undefined): string {
    return new Intl.NumberFormat('vi-VN').format(value ?? 0);
}

/**
 * Format percentage
 */
export function formatPercent(value: number | null | undefined, decimals: number = 1): string {
    const num = value ?? 0;
    return `${num.toFixed(decimals)}%`;
}

/**
 * Format date to Vietnamese format
 */
export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (format === 'long') {
        return d.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    return d.toLocaleDateString('vi-VN');
}

/**
 * Format month/year from YYYY-MM to "Tháng M, YYYY"
 */
export function formatMonthYear(monthString: string): string {
    const [year, month] = monthString.split('-');
    return `Tháng ${parseInt(month)}, ${year}`;
}
