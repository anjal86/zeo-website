/**
 * Admin fetch helper with cookie auth.
 * Use this for all admin API calls instead of raw fetch() with Bearer tokens.
 */
export async function adminFetch<T = any>(
    url: string,
    options: RequestInit = {},
): Promise<T> {
    const res = await fetch(url, {
        credentials: 'include',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
            ...((options.headers as Record<string, string>) || {}),
        },
        ...options,
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res.json();
}

/**
 * Admin fetch for non-JSON responses (blobs, etc.)
 */
export async function adminFetchRaw(
    url: string,
    options: RequestInit = {},
): Promise<Response> {
    const res = await fetch(url, {
        credentials: 'include',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            ...((options.headers as Record<string, string>) || {}),
        },
        ...options,
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res;
}