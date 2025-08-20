
// // src/utils/api.ts
// export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

// // SSRでも落ちないように localStorage をガード
// function authHeader(): Record<string, string> {
//   if (typeof window === 'undefined') return {};
//   const token = window.localStorage.getItem('token');
//   return token ? { Authorization: `Bearer ${token}` } : {};
// }

// export async function apiFetch<T = unknown>(
//   path: string,
//   init: Omit<RequestInit, 'body' | 'headers'> & { body?: any; headers?: Record<string, string> } = {}
// ): Promise<T> {
//   const headers: Record<string, string> = {
//     'Content-Type': 'application/json',
//     ...authHeader(),
//     ...(init.headers ?? {}),
//   };

//   const body =
//     init.body !== undefined && typeof init.body !== 'string'
//       ? JSON.stringify(init.body)
//       : init.body;

//   const res = await fetch(`${API_BASE}${path}`, { ...init, headers, body });

//   const isNoContent = res.status === 204;
//   const text = isNoContent ? '' : await res.text();

//   if (!res.ok) {
//     let msg = res.statusText;
//     try {
//       const json = text ? JSON.parse(text) : {};
//       msg = json?.error || (Array.isArray(json?.errors) ? json.errors.join(', ') : msg);
//     } catch {}
//     throw new Error(msg || 'Request failed');
//   }

//   return (isNoContent ? ({} as T) : (text ? JSON.parse(text) : {})) as T;
// }

// /**
//  * <input type="datetime-local"> の値（例 "2025-08-15T19:00"）を
//  * ローカルタイムのオフセット付き ISO へ（例 "+09:00" 付き）変換
//  */
// export function toOffsetISO(local: string): string {
//   // "YYYY-MM-DDTHH:mm" を安全に分解して作る（Safari対策）
//   const m = local.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
//   if (!m) return new Date(local).toISOString(); // フォールバック

//   const [ , y, mo, d, h, mi ] = m.map(Number);
//   const dt = new Date(y, mo - 1, d, h, mi, 0);

//   const pad = (n: number) => `${Math.floor(Math.abs(n))}`.padStart(2, '0');
//   const tzMin = -dt.getTimezoneOffset(); // JSTなら +540
//   const sign = tzMin >= 0 ? '+' : '-';
//   const hh = pad(tzMin / 60);
//   const mm = pad(tzMin % 60);

//   const yyyy = dt.getFullYear();
//   const MM = pad(dt.getMonth() + 1);
//   const dd = pad(dt.getDate());
//   const HH = pad(dt.getHours());
//   const mmin = pad(dt.getMinutes());
//   const ss = pad(dt.getSeconds());

//   return `${yyyy}-${MM}-${dd}T${HH}:${mmin}:${ss}${sign}${hh}:${mm}`;
// }

// // 便利ヘルパ（任意）
// export const api = {
//   get: <T>(p: string) => apiFetch<T>(p, { method: 'GET' }),
//   post: <T>(p: string, body?: any) => apiFetch<T>(p, { method: 'POST', body }),
//   del:  <T>(p: string) => apiFetch<T>(p, { method: 'DELETE' }),
// };


// src/utils/api.ts
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

// 追加：timeoutMs / signal を扱える型
type Opts = Omit<RequestInit, 'body' | 'headers' | 'signal'> & {
  body?: any;
  headers?: Record<string, string>;
  timeoutMs?: number;          // ← 追加：デフォルト 10 秒
  signal?: AbortSignal | null; // ← 追加：上位の signal を伝播したい時に使用
};

// SSRでも落ちないように localStorage をガード
function authHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = window.localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T = unknown>(
  path: string,
  init: Opts = {}
): Promise<T> {
  const {
    headers: extraHeaders,
    body: rawBody,
    timeoutMs = 10000,         // ← デフォルト 10 秒
    signal: upstreamSignal,
    ...rest
  } = init;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...authHeader(),
    ...(extraHeaders ?? {}),
  };

  const body =
    rawBody !== undefined && typeof rawBody !== 'string'
      ? JSON.stringify(rawBody)
      : rawBody;

  // 追加：タイムアウト + 外部 signal を束ねる
  const controller = new AbortController();
  const abortOnUpstream = () => controller.abort();
  if (upstreamSignal) upstreamSignal.addEventListener('abort', abortOnUpstream, { once: true });
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...rest,
      headers,
      body,
      signal: controller.signal,
    });

    const isNoContent = res.status === 204;
    const text = isNoContent ? '' : await res.text();

    if (!res.ok) {
      let msg = res.statusText;
      try {
        const json = text ? JSON.parse(text) : {};
        msg = json?.error || (Array.isArray(json?.errors) ? json.errors.join(', ') : msg);
      } catch {}
      throw new Error(msg || `HTTP ${res.status}`);
    }

    return (isNoContent ? ({} as T) : (text ? JSON.parse(text) : {})) as T;
  } catch (e: any) {
    // 追加：Pendingを確実にエラー化
    if (e?.name === 'AbortError') throw new Error('タイムアウトしました');
    throw new Error(e?.message || 'ネットワークエラー');
  } finally {
    clearTimeout(timer);
    if (upstreamSignal) upstreamSignal.removeEventListener('abort', abortOnUpstream);
  }
}

/**
 * <input type="datetime-local"> の値（例 "2025-08-15T19:00"）を
 * ローカルタイムのオフセット付き ISO へ（例 "+09:00" 付き）変換
 */
export function toOffsetISO(local: string): string {
  // "YYYY-MM-DDTHH:mm" を安全に分解して作る（Safari対策）
  const m = local.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!m) return new Date(local).toISOString(); // フォールバック

  const [ , y, mo, d, h, mi ] = m.map(Number);
  const dt = new Date(y, mo - 1, d, h, mi, 0);

  const pad = (n: number) => `${Math.floor(Math.abs(n))}`.padStart(2, '0');
  const tzMin = -dt.getTimezoneOffset(); // JSTなら +540
  const sign = tzMin >= 0 ? '+' : '-';
  const hh = pad(tzMin / 60);
  const mm = pad(tzMin % 60);

  const yyyy = dt.getFullYear();
  const MM = pad(dt.getMonth() + 1);
  const dd = pad(dt.getDate());
  const HH = pad(dt.getHours());
  const mmin = pad(dt.getMinutes());
  const ss = pad(dt.getSeconds());

  return `${yyyy}-${MM}-${dd}T${HH}:${mmin}:${ss}${sign}${hh}:${mm}`;
}

// 便利ヘルパ（任意）：第2引数のオプションも渡せるように拡張
export const api = {
  get:  <T>(p: string, o?: Omit<Opts, 'method' | 'body'>) => apiFetch<T>(p, { ...o, method: 'GET' }),
  post: <T>(p: string, body?: any, o?: Omit<Opts, 'method' | 'body'>) =>
    apiFetch<T>(p, { ...o, method: 'POST', body }),
  del:  <T>(p: string, o?: Omit<Opts, 'method' | 'body'>) =>
    apiFetch<T>(p, { ...o, method: 'DELETE' }),
};
