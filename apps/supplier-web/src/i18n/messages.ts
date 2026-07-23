import { messagesFor, type Locale } from '@suqya/i18n';

export function getMessages(locale: Locale) {
  return messagesFor(locale);
}
