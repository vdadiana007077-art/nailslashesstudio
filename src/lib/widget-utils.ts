import { ActionType, Language } from '@prisma/client';

export function getSupportActionUrl(
  actionType: ActionType, 
  locale: Language, 
  actionUrl: string | null, 
  whatsappNumber: string
): string {
  const loc = locale.toLowerCase();
  const defaultWaText = encodeURIComponent('Merhaba, N&L Studio hizmetleri hakkında bilgi almak istiyorum.');

  switch (actionType) {
    case 'BOOKING_LINK':
    case 'AVAILABILITY_LINK':
      return locale === Language.TR ? '/booking' : `/${loc}/booking`;

    case 'SERVICE_LIST':
      switch (locale) {
        case Language.TR: return `/hizmetlerimiz`;
        case Language.EN: return `/en/services`;
        case Language.DE: return `/de/dienstleistungen`;
        case Language.RU: return `/ru/uslugi`;
        default: return `/${loc}/services`;
      }

    case 'LOCATION_LINK':
      switch (locale) {
        case Language.TR: return `/iletisim`;
        case Language.EN: return `/en/contact`;
        case Language.DE: return `/de/kontakt`;
        case Language.RU: return `/ru/kontakty`;
        default: return `/${loc}/contact`;
      }

    case 'WHATSAPP_LINK':
      return `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${defaultWaText}`;

    case 'PHONE_CALL':
      return `tel:${whatsappNumber}`;

    case 'EMAIL_LINK':
      return `mailto:info@nailslashesstudio.com`;

    default:
      if (actionUrl) {
        let finalUrl = actionUrl;
        if (finalUrl.includes('{locale}')) {
          finalUrl = finalUrl.replace('{locale}', loc);
        }
        
        // Eğer link http ile başlamıyorsa ve / ile de başlamıyorsa başına / ekle
        // Bu sayede /hizmetlerimiz/booking gibi bağıl URL hatalarının önüne geçilir
        if (!finalUrl.startsWith('http') && !finalUrl.startsWith('mailto:') && !finalUrl.startsWith('tel:') && !finalUrl.startsWith('/')) {
          finalUrl = '/' + finalUrl;
        }
        
        return finalUrl;
      }
      return '#';
  }
}
