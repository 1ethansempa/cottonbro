const cacheHdr = (s: number) => ({
  "Cache-Control": `public, s-maxage=${s}, stale-while-revalidate=600`,
});

export async function cacheableProduct(id: string, _env: unknown) {
  const body = { id, name: "Demo Product", price: 1999 };
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json", ...cacheHdr(300) },
  });
}
