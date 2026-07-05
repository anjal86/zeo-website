/**
 * Admin fetch helper with cookie auth.
 * Use this for all admin API calls instead of raw fetch() with Bearer tokens.
 *
 * Defaults: credentials=include, X-Requested-With, Content-Type=application/json.
 * Caller headers are merged on top of defaults.
 * For FormData uploads, use adminFetchRaw and omit Content-Type.
 */
export async function adminFetch<T = any>(
    url: string,
    options: RequestInit = {},
): Promise<T> {
    const { headers: callerHeaders, ...rest } = options;
    const res = await fetch(url, {
        credentials: 'include',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
            ...(callerHeaders as Record<string, string>),
        },
        ...rest,
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res.json();
}

/**
 * Admin fetch returning raw Response. No forced Content-Type, so FormData uploads work.
 * credentials=include and X-Requested-With are always set.
 * Caller headers are merged on top of defaults.
 */
export async function adminFetchRaw(
    url: string,
    options: RequestInit = {},
): Promise<Response> {
    const { headers: callerHeaders, ...rest } = options;
    const res = await fetch(url, {
        credentials: 'include',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            ...(callerHeaders as Record<string, string>),
        },
        ...rest,
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res;
}