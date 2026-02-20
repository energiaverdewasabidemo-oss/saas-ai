import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CallData {
  call_id: string;
  lead_name: string;
  phone?: string;
  classification?: "Positivo" | "Neutro" | "Negativo" | "No Contestados" | "Buzón";
  duration_seconds?: number;
  answered?: boolean;
  metadata?: Record<string, any>;
}

interface UpdateMetricsData {
  total_calls?: number;
  answered_calls?: number;
  total_duration_seconds?: number;
  total_filtered?: number;
  agents_count?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const path = url.pathname;

    if (path.endsWith("/calls") && req.method === "POST") {
      const callData: CallData = await req.json();

      const { data, error } = await supabaseAdmin
        .from("calls")
        .insert({
          call_id: callData.call_id,
          lead_name: callData.lead_name,
          phone: callData.phone,
          classification: callData.classification,
          duration_seconds: callData.duration_seconds || 0,
          answered: callData.answered || false,
          metadata: callData.metadata || {},
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path.endsWith("/metrics") && req.method === "POST") {
      const metricsData: UpdateMetricsData = await req.json();

      const { data: currentMetrics } = await supabaseAdmin
        .from("dashboard_metrics")
        .select("*")
        .maybeSingle();

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (metricsData.total_calls !== undefined) {
        updateData.total_calls = metricsData.total_calls;
      }
      if (metricsData.answered_calls !== undefined) {
        updateData.answered_calls = metricsData.answered_calls;
      }
      if (metricsData.total_duration_seconds !== undefined) {
        updateData.total_duration_seconds = metricsData.total_duration_seconds;
      }
      if (metricsData.total_filtered !== undefined) {
        updateData.total_filtered = metricsData.total_filtered;
      }
      if (metricsData.agents_count !== undefined) {
        updateData.agents_count = metricsData.agents_count;
      }

      let result;
      if (currentMetrics) {
        const { data, error } = await supabaseAdmin
          .from("dashboard_metrics")
          .update(updateData)
          .eq("id", currentMetrics.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabaseAdmin
          .from("dashboard_metrics")
          .insert(updateData)
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return new Response(JSON.stringify({ success: true, data: result }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        error: "Not found",
        message: "Supported endpoints: POST /manage-calls/calls, POST /manage-calls/metrics",
      }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
