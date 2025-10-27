import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');

    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = userData.user.id;

    const tablesToDelete = [
      'sommeil_journalier',
      'workout_analyses',
      'repas_journaliers',
      'recettes',
      'objectifs_athletiques',
      'donnees_corporelles',
      'records',
      'workouts',
      'athlete_groups',
      'chat_messages',
      'group_workouts',
      'partnerships',
      'notifications',
    ];

    for (const table of tablesToDelete) {
      try {
        const columnName = table === 'workouts' || table === 'records' ? 'user_id' : 'athlete_id';
        await supabase.from(table).delete().eq(columnName, userId);
      } catch (error) {
        console.error(`Erreur suppression ${table}:`, error);
      }
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Erreur suppression profile:', profileError);
    }

    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      throw new Error(`Erreur suppression utilisateur: ${deleteUserError.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Compte supprimé avec succès' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});