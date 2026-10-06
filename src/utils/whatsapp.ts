/**
 * WhatsApp Utility Helper for LifeDrop
 * Formats Pakistani & international numbers to WhatsApp E.164 without '+' or leading '0'
 */

export const formatWhatsAppNumber = (phone: string | undefined | null): string => {
  if (!phone) return '';
  
  // Remove spaces, hyphens, brackets, plus signs
  let clean = phone.replace(/[^0-9]/g, '');
  
  // Strip leading 00
  if (clean.startsWith('00')) {
    clean = clean.substring(2);
  }
  
  // If Pakistani mobile format 03xx (11 digits): 03001234567 -> 923001234567
  if (clean.startsWith('03') && clean.length === 11) {
    clean = '92' + clean.substring(1);
  }
  // If 10 digits starting with 3xx: 3001234567 -> 923001234567
  else if (clean.startsWith('3') && clean.length === 10) {
    clean = '92' + clean;
  }
  // If already starts with 923 and is 12 digits, perfect
  else if (clean.startsWith('92') && clean.length === 12) {
    // Already correct
  }
  
  return clean;
};

/**
 * Universal WhatsApp link (works on mobile app, desktop app, and web)
 */
export const getWhatsAppUrl = (phone: string | undefined | null, message: string): string => {
  const cleanPhone = formatWhatsAppNumber(phone);
  if (!cleanPhone) return '#';
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

/**
 * Direct WhatsApp Web link for desktop browser
 */
export const getWhatsAppWebUrl = (phone: string | undefined | null, message: string): string => {
  const cleanPhone = formatWhatsAppNumber(phone);
  if (!cleanPhone) return '#';
  return `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
};

/**
 * Open WhatsApp directly with fallback logic
 */
export const openWhatsApp = (phone: string | undefined | null, message: string) => {
  const cleanPhone = formatWhatsAppNumber(phone);
  if (!cleanPhone) {
    alert('This donor has not provided a valid phone number.');
    return;
  }
  
  const universalUrl = getWhatsAppUrl(phone, message);
  window.open(universalUrl, '_blank', 'noopener,noreferrer');
};
