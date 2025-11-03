import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Créer un client Supabase côté serveur avec le service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Récupérer le JWT depuis l'en-tête Authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Pas d\'en-tête Authorization');
    }

    // Extraire le token
    const token = authHeader.replace('Bearer ', '');

    // Vérifier le token et récupérer l'utilisateur
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Erreur auth:', authError);
      throw new Error('Non authentifié');
    }

    console.log('User ID:', user.id);

    // Récupérer le profil avec le service role (bypass RLS)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, first_name, last_name, email, photo_url, phone, height, weight, body_fat_percentage, personal_records, training_frequency, dietary_preferences, created_at, updated_at, discipline, sexe, date_de_naissance, role_specifique, license_number')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Erreur profil:', profileError);
      throw profileError;
    }

    if (!profile) {
      return new Response(
        JSON.stringify({ error: 'Profil non trouvé' }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('Profil trouvé:', profile.id);

    return new Response(
      JSON.stringify(profile),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Erreur dans get-user-profile:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erreur interne' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
