export async function POST(request) {
  try {
    const { json } = await request.json();
    const parsed = JSON.parse(json);
    const formatted = JSON.stringify(parsed, null, 2);
    return Response.json({ formatted });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}
