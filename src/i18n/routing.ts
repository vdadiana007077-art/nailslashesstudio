/**
 * Navigation helpers (Link, redirect, usePathname, useRouter, getPathname).
 * Bu dosya createNavigation kullanır ve next-intl/navigation import eder.
 * Middleware bu dosyayı DEĞİL, routing-config.ts dosyasını import etmelidir.
 */
import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing-config';

// Re-export routing config for backward compatibility
export {routing} from './routing-config';

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
