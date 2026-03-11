export async function apiLogger(req: Request, handler: () => Promise<Response>) {
  const start = Date.now();

  try {
    const response = await handler();

    console.log(
      `[API] ${req.method} ${req.url} → ${response.status} (${Date.now() - start}ms)`
    );

    return response;
  } catch (err: any) {
    console.error(
      `[API ERROR] ${req.method} ${req.url} → ${err.message} (${Date.now() - start}ms)`
    );

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
