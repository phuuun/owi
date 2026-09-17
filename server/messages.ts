import type { Lang } from '../src/types.ts';
import { PLATFORM_LIST } from '../src/lib/platform.ts';

/** Everything the API writes for the user. `message` is shown as-is, so it is translated. */
const ID = {
  invalidBody: 'Kirim satu isian: "url", link postingan yang mau dibaca kolom komentarnya.',
  invalidUrl: 'Link-nya harus alamat http:// atau https:// yang bener.',
  unsupportedPlatform: `OWI baru bisa baca kolom komentar dari ${PLATFORM_LIST.id}.`,
  invalidJson: 'Isi permintaannya harus JSON yang bener.',
  payloadTooLarge: 'Isi permintaannya kegedean.',
  internal: 'Lagi ada error di server.',
  notFound: 'Endpoint-nya nggak ada.',
  /** Topic for a link that resolved to nothing readable. */
  unreadable: 'Kolom Komentar Nggak Kebaca',
};

export const MESSAGES: Record<Lang, typeof ID> = {
  id: ID,
  en: {
    invalidBody: 'Send one field: "url", the link to the post whose comment section should be read.',
    invalidUrl: 'The link has to be a valid http:// or https:// address.',
    unsupportedPlatform: `OWI can only read comment sections on ${PLATFORM_LIST.en}.`,
    invalidJson: 'The request body has to be valid JSON.',
    payloadTooLarge: 'The request body is too large.',
    internal: 'Something went wrong on the server.',
    notFound: 'No such endpoint.',
    unreadable: 'Comment Section Unreadable',
  },
};

/** `Accept-Language: en` switches the reply; anything else stays Indonesian. */
export const langOf = (header: string | undefined): Lang => (header?.trim().toLowerCase().startsWith('en') ? 'en' : 'id');
