import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'https://esm.sh/web-push@3.6.7';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    webpush.setVapidDetails(
      'mailto:contact@sprintflow.run',
      Deno.env.get('VITE_VAPID_PUBLIC_KEY') ?? '',
      Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
    );

    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles') // Query profiles to get user info
      .select('id, first_name');

    if (usersError) throw usersError;

    for (const user of users) {
      const userId = user.id;
      const userName = user.first_name || 'Athlète';
      const summaryParts = [`Bonjour ${userName} ! Voici votre bilan du jour :`];

      // 1. Check today's workout
      const today = new Date().toISOString().split('T')[0];
      const { data: workout } = await supabaseAdmin
        .from('workouts')
        .select('tag_seance')
        .eq('user_id', userId)
        .eq('date', today)
        .eq('status', 'planned')
        .single();
      
      if (workout) {
        summaryParts.push(`- N'oubliez pas votre séance **${workout.tag_seance || 'prévue'}** aujourd'hui.`);
      } else {
        summaryParts.push(`- Aucune séance planifiée pour aujourd'hui. C'est peut-être un jour de repos !`);
      }

      // 2. Check last night's sleep
      const { data: sleepData } = await supabaseAdmin
        .from('sleep_data')
        .select('quality_rating')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (sleepData && sleepData.quality_rating < 5) {
        summaryParts.push(`- Votre dernière nuit de sommeil n'était pas optimale. Pensez à bien récupérer.`);
      }

      // TODO: Add nutrition check here if relevant tables exist

      const dailySummaryContent = summaryParts.join('\n');

      // Find or create conversation
      let { data: conversation } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .eq('user_id', userId)
        .single();
      if (!conversation) {
        const { data: newConversation } = await supabaseAdmin
          .from('conversations').insert({ user_id: userId, name: 'Conversation Sprinty' }).select('id').single();
        conversation = newConversation;
      }
      if (!conversation) continue;

      // Insert message and send push notification
      await supabaseAdmin.from('messages').insert({ conversation_id: conversation.id, sender_type: 'ai', content: dailySummaryContent });
      
      const { data: subscriptions } = await supabaseAdmin.from('push_subscriptions').select('subscription').eq('user_id', userId);
      if (subscriptions && subscriptions.length > 0) {
        const notificationPayload = JSON.stringify({ title: 'Sprinty', body: 'Votre bilan quotidien est prêt.' });
        for (const { subscription } of subscriptions) {
          try {
            await webpush.sendNotification(subscription, notificationPayload);
          } catch (e) {
            if (e.statusCode === 410) {
              await supabaseAdmin.from('push_subscriptions').delete().eq('subscription', subscription);
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ message: 'Daily summaries sent successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
