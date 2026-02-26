import type { Context } from "@netlify/functions";

const WEBHOOK_URL =
  process.env.WEBHOOK_STATS_URL ||
  "https://api.energiaverdewasabi.es/webhook/dashboard/stats";

export default async function handler(_request: Request, _context: Context) {
  try {
    const response = await fetch(WEBHOOK_URL);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Error al obtener datos del webhook" }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Webhook fetch error:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
