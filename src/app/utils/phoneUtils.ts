export interface CountryCode {
    name: string;
    code: string;
    flag: string;
    pattern?: string; // Regex pattern for local number validation
    placeholder?: string;
}

export const countryCodes: CountryCode[] = [
    { name: 'India', code: '+91', flag: '🇮🇳', pattern: '^[6-9]\\d{9}$', placeholder: '9876543210' },
    { name: 'United States', code: '+1', flag: '🇺🇸', pattern: '^\\d{10}$', placeholder: '2015550123' },
    { name: 'United Kingdom', code: '+44', flag: '🇬🇧', pattern: '^\\d{10}$', placeholder: '7700900123' },
    { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪', pattern: '^\\d{9}$', placeholder: '501234567' },
    { name: 'Canada', code: '+1', flag: '🇨🇦', pattern: '^\\d{10}$', placeholder: '4165550123' },
    { name: 'Australia', code: '+61', flag: '🇦🇺', pattern: '^\\d{9}$', placeholder: '412345678' },
    { name: 'Singapore', code: '+65', flag: '🇸🇬', pattern: '^[89]\\d{7}$', placeholder: '81234567' },
    { name: 'Germany', code: '+49', flag: '🇩🇪', pattern: '^\\d{10,11}$', placeholder: '15123456789' },
    { name: 'France', code: '+33', flag: '🇫🇷', pattern: '^[1-9]\\d{8}$', placeholder: '612345678' },
    { name: 'Japan', code: '+81', flag: '🇯🇵', pattern: '^\\d{10}$', placeholder: '9012345678' },
];

export const formatE164 = (countryCode: string, localNumber: string): string => {
    // Remove all non-digit characters from local number
    const cleanedLocal = localNumber.replace(/\D/g, '');
    return `${countryCode}${cleanedLocal}`;
};

export const parseE164 = (e164: string): { countryCode: string; localNumber: string } => {
    if (!e164) return { countryCode: '', localNumber: '' };

    // Try to find matching country code from the list (longest match first)
    const sortedCodes = [...countryCodes].sort((a, b) => b.code.length - a.code.length);

    for (const item of sortedCodes) {
        if (e164.startsWith(item.code)) {
            return {
                countryCode: item.code,
                localNumber: e164.slice(item.code.length)
            };
        }
    }

    return { countryCode: '', localNumber: e164 };
};
