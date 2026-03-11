export async function safeApi(handler: () => Promise<any>) {
  try {
    const result = await handler();
    return Response.json({ success: true, ...result });
  } catch (err: any) {
    console.error("API Error:", err);
    return Response.json(
      { success: false, error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}
