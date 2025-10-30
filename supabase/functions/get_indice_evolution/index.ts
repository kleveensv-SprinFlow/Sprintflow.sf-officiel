import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { data: allRecords, error: recordsError } = await supabase
      .from("records")
      .select("exercice_id, value, date")
      .eq("user_id", user.id)
      .not("exercice_id", "is", null)
      .order("date", { ascending: false });
      
    if (recordsError) {
      console.error("Records error:", recordsError);
      throw new Error(`Database error: ${recordsError.message}`);
    }

    if (!allRecords || allRecords.length === 0) {
      return new Response(JSON.stringify({
        indice: 0,
        context: { message: "Enregistrez des records pour calculer votre évolution." }
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    
    const exerciseData: Record<string, { recent: number; best: number }> = {};

    for (const record of allRecords) {
      const { exercice_id, value, date } = record;
      if (!exercice_id || !value) continue;
      
      if (!exerciseData[exercice_id]) {
        exerciseData[exercice_id] = { recent: 0, best: 0 };
      }

      if (value > exerciseData[exercice_id].best) {
        exerciseData[exercice_id].best = value;
      }
      
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      if (new Date(date) > ninetyDaysAgo && exerciseData[exercice_id].recent === 0) {
         exerciseData[exercice_id].recent = value;
      }
    }

    const evolutionScores: { exercice_id: string; score: number }[] = [];
    for (const exId in exerciseData) {
      const data = exerciseData[exId];
      const recent = data.recent > 0 ? data.recent : data.best;
      
      if (data.best > 0) {
        const score = Math.round((recent / data.best) * 100);
        evolutionScores.push({ exercice_id: exId, score });
      }
    }

    if (evolutionScores.length === 0) {
      return new Response(JSON.stringify({
        indice: 0,
        context: { message: "Pas assez de données récentes pour calculer l'évolution." }
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: exercices, error: exercicesError } = await supabase
      .from("exercices_reference")
      .select("id, name")
      .in('id', evolutionScores.map(s => s.exercice_id));
      
    if (exercicesError) {
      console.error("Exercices error:", exercicesError);
    }
    
    const exMap = new Map((exercices || []).map(e => [e.id, e.name]));

    const totalScore = evolutionScores.reduce((sum, s) => sum + s.score, 0);
    const indice = Math.round(totalScore / evolutionScores.length);
    
    const sortedByScore = evolutionScores.sort((a, b) => b.score - a.score);
    const topProgress = sortedByScore.slice(0, 3).map(s => ({ name: exMap.get(s.exercice_id) || 'Inconnu', score: s.score }));
    const bottomProgress = sortedByScore.slice(-3).map(s => ({ name: exMap.get(s.exercice_id) || 'Inconnu', score: s.score }));

    return new Response(
      JSON.stringify({
        indice,
        context: {
          topProgress,
          bottomProgress,
          exercicesCount: evolutionScores.length
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
