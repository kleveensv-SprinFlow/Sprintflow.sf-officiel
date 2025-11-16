import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const getSimpleReply = (keyword) => {
  switch (keyword) {
    case 'planning':
      return "Bien sûr ! Pour voir votre planning, vous pouvez consulter l'onglet 'Planning'. Il vous montrera toutes vos séances à venir.";
    case 'record':
      return "Vos records sont la preuve de votre progression ! Allez dans la section 'Performances' pour voir tous vos exploits.";
    case 'nutrition':
      return "Une bonne nutrition est la clé. Dans l'onglet 'Nutrition', vous pouvez suivre vos repas et vous assurer que vous avez assez d'énergie.";
    case 'sommeil':
      return "Le sommeil, c'est la base de la récupération. Consultez votre journal de sommeil pour voir si vous vous reposez assez.";
    default:
      return "Je ne suis pas encore entraîné pour répondre à cela. Essayez de me poser une question sur votre planning, vos records ou votre nutrition !";
  }
};

const getExpertReply = (keyword) => {
  switch (keyword) {
    case 'planning':
      return "La périodisation de votre entraînement est accessible via l'onglet 'Planning'. Vous y trouverez la structure de vos microcycles et mésocycles.";
    case 'record':
      return "Vos performances maximales sont enregistrées dans la section 'Performances'. C'est le meilleur indicateur de vos adaptations neuromusculaires.";
    case 'nutrition':
      return "Le suivi de vos macronutriments est essentiel. L'onglet 'Nutrition' vous permet de quantifier vos apports énergétiques pour optimiser la supercompensation.";
    case 'sommeil':
      return "L'analyse de vos cycles de sommeil est disponible dans la section dédiée. Un sommeil de qualité est fondamental pour la régulation hormonale et la synthèse protéique.";
    default:
      return "Ma base de connaissances est en cours d'extension. Je peux actuellement fournir des informations sur la périodisation (planning), les performances (records) et le suivi nutritionnel.";
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, expertiseMode } = await req.json();
    if (!messages || !Array.isArray(messages) || !expertiseMode) {
      throw new Error('Les messages et le mode expertise sont requis.');
    }

    const lastUserMessage = messages[messages.length - 1]?.text.toLowerCase() || '';
    let replyText = '';

    if (lastUserMessage.includes('planning')) {
      replyText = expertiseMode === 'expert' ? getExpertReply('planning') : getSimpleReply('planning');
    } else if (lastUserMessage.includes('record') || lastUserMessage.includes('performance')) {
      replyText = expertiseMode === 'expert' ? getExpertReply('record') : getSimpleReply('record');
    } else if (lastUserMessage.includes('nutrition') || lastUserMessage.includes('manger')) {
      replyText = expertiseMode === 'expert' ? getExpertReply('nutrition') : getSimpleReply('nutrition');
    } else if (lastUserMessage.includes('sommeil') || lastUserMessage.includes('dormi')) {
      replyText = expertiseMode === 'expert' ? getExpertReply('sommeil') : getSimpleReply('sommeil');
    } else {
      replyText = expertiseMode === 'expert' ? getExpertReply('default') : getSimpleReply('default');
    }

    return new Response(JSON.stringify({ reply: replyText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
