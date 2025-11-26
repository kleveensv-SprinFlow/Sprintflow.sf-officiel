// hibp-check/index.ts
interface RequestPayload {
  password: string;
}

const toHexUpper = (buf: ArrayBuffer): string => {
  const bytes = new Uint8Array(buf);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
};

const sha1Hex = async (input: string): Promise<string> => {
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  return toHexUpper(hashBuffer);
};

const checkPwned = async (sha1HexUpper: string): Promise<boolean> => {
  const prefix = sha1HexUpper.slice(0, 5);
  const suffix = sha1HexUpper.slice(5);
  const url = `https://api.pwnedpasswords.com/range/${prefix}`;

  const res = await fetch(url, {
    headers: {
      // HIBP recommends a user-agent; include minimal UA
      'User-Agent': 'supabase-hibp-check/1.0'
    }
  });

  if (!res.ok) {
    // If HIBP is unavailable, be conservative: treat as not pwned (or choose to fail closed)
    // Here we choose to fail open (not blocked) but return a warning in response.
    throw new Error(`HIBP lookup failed with status ${res.status}`);
  }

  const text = await res.text();
  // Response lines: "HASH_SUFFIX:COUNT"
  const lines = text.split('\n');
  for (const line of lines) {
    const [lineSuffix] = line.split(':');
    if (lineSuffix?.trim().toUpperCase() === suffix) {
      return true; // found in breached DB
    }
  }
  return false;
};

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ ok: false, reason: 'method_not_allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    const body = await req.json().catch(() => null) as RequestPayload | null;
    if (!body || typeof body.password !== 'string') {
      return new Response(JSON.stringify({ ok: false, reason: 'invalid_payload' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const password = body.password;
    if (password.length === 0) {
      return new Response(JSON.stringify({ ok: false, reason: 'empty_password' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Compute SHA-1
    const hash = await sha1Hex(password);

    // Check HIBP
    let pwned = false;
    try {
      pwned = await checkPwned(hash);
    } catch (err) {
      // HIBP errors: return 503 to indicate external dependency failure
      console.error('HIBP lookup error:', err);
      return new Response(JSON.stringify({ ok: false, reason: 'hibp_unavailable' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    }

    if (pwned) {
      return new Response(JSON.stringify({ ok: false, reason: 'pwned' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Unexpected error in hibp-check:', err);
    return new Response(JSON.stringify({ ok: false, reason: 'internal_error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});