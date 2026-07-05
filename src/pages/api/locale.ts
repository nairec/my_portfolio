import type { APIRoute } from "astro";
import { isLocale } from "../../i18n";

export const POST: APIRoute = async ({ request, cookies }) => {
    const body = await request.json().catch(() => null);
    const next = body?.locale;

    if (!isLocale(next)) {
        return new Response(JSON.stringify({ error: "Invalid locale" }), {
            status: 400,
        });
    }

    cookies.set("locale", next, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        httpOnly: false,
    });

    return new Response(null, { status: 204 });
};
