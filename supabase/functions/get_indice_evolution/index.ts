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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      throw new Error("Unauthorized");
    }

    // --- 1. Fetch all records for the user ---
    const { data: allRecords, error: recordsError } = await supabase
      .from("records")
      .select("exercice_id, value, date")
      .eq("user_id", user.id)
      .not("exercice_id", "is", null)
      .order("date", { ascending: false });
      
    if (recordsError) throw recordsError;

    if (!allRecords || allRecords.length === 0) {
      return new Response(JSON.stringify({
        indice: 0,
        context: { message: "Enregistrez des records pour calculer votre évolution." }
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    
    // --- 2. Group records by exercise and find recent/best ---
    const exerciseData: Record<string, { recent: number; best: number; name?: string }> = {};

    for (const record of allRecords) {
      const { exercice_id, value, date } = record;
      if (!exerciseData[exercice_id]) {
        exerciseData[exercice_id] = { recent: 0, best: 0 };
      }

      // Update best record
      if (value > exerciseData[exercice_id].best) {
        exerciseData[exercice_id].best = value;
      }
      
      // Update recent record if it's within the last 90 days and the first one we find (since they are sorted by date)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      if (new Date(date) > ninetyDaysAgo && exerciseData[exercice_id].recent === 0) {
         exerciseData[exercice_id].recent = value;
      }
    }

    // --- 3. Calculate evolution scores ---
    const evolutionScores: { exercice_id: string; score: number }[] = [];
    for (const exId in exerciseData) {
      const data = exerciseData[exId];
      // Use the best record if no recent one is available for a baseline
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

    // --- 4. Fetch exercise names for context ---
    const { data: exercices, error: exercicesError } = await supabase
      .from("exercices_reference")
      .select("id, name")
      .in('id', evolutionScores.map(s => s.exercice_id));
      
    if (exercicesError) throw exercicesError;
    const exMap = new Map(exercices.map(e => [e.id, e.name]));

    // --- 5. Final Calculation and Contextual Data ---
    const totalScore = evolutionScores.reduce((sum, s) => sum + s.score, 0);
    const indice = Math.round(totalScore / evolutionScores.length);
    
    const sortedByScore = evolutionScores.sort((a, b) => b.score - a.score);
    const topProgress = sortedByScore.slice(0, 3).map(s => ({ name: exMap.get(s.exercice_id), score: s.score }));
    const bottomProgress = sortedByScore.slice(-3).map(s => ({ name: exMap.get(s.exercice_id), score: s.score }));

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
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});