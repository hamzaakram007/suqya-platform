import { LOCALE_STORAGE_KEY } from '@/i18n/config';

/** Runs before paint to avoid rtl/ltr flash on reload. */
export function LocaleScript() {
  const script = `(function(){try{var l=localStorage.getItem("${LOCALE_STORAGE_KEY}");if(l==="en"||l==="ar"){document.documentElement.lang=l;document.documentElement.dir=l==="ar"?"rtl":"ltr";}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
