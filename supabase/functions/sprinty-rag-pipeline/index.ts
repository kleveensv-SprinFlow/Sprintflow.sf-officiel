diff --git a/supabase/functions/sprinty-rag-pipeline/index.ts b/supabase/functions/sprinty-rag-pipeline/index.ts
new file mode 100644
index 0000000000000000000000000000000000000000..e693771c69fa20a80c1e168a338d57bda7efa0b8
--- /dev/null
+++ b/supabase/functions/sprinty-rag-pipeline/index.ts
@@ -0,0 +1,194 @@
+/* global Deno */
+import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
+import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
+import { corsHeaders } from '../_shared/cors.ts';
+
+const EMBEDDING_MODEL = 'models/text-embedding-004';
+const GENERATION_MODEL = 'models/gemini-1.5-flash';
+
+const SYSTEM_PROMPTS: Record<string, string> = {
+  simplified:
+    "Tu es Sprinty, un assistant sportif qui traduit la science de la performance en conseils simples, actionnables et empathiques. Utilise un ton motivant, évite le jargon et propose des actions concrètes immédiatement applicables.",
+  expert:
+    "Tu es Sprinty Coach, un expert en physiologie de l'effort et en planification de l'entraînement. Tu expliques les mécanismes (métabolisme, biomécanique, monitoring) avec précision, en citant des métriques et recommandations quantifiées.",
+};
+
+interface RagPayload {
+  question?: string;
+  expertiseMode?: 'simplified' | 'expert';
+  matchCount?: number;
+}
+
+async function embedText(text: string, apiKey: string): Promise<number[]> {
+  const response = await fetch(
+    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
+    {
+      method: 'POST',
+      headers: { 'Content-Type': 'application/json' },
+      body: JSON.stringify({
+        model: EMBEDDING_MODEL,
+        content: {
+          parts: [{ text }],
+        },
+      }),
+    }
+  );
+
+  if (!response.ok) {
+    const errorText = await response.text();
+    throw new Error(`Embedding API error: ${response.status} - ${errorText}`);
+  }
+
+  const payload = await response.json();
+  const values = payload?.embedding?.values;
+
+  if (!values || !Array.isArray(values)) {
+    throw new Error('Embedding API returned an unexpected payload.');
+  }
+
+  return values;
+}
+
+async function generateAnswer({
+  systemPrompt,
+  context,
+  question,
+  apiKey,
+  mode,
+}: {
+  systemPrompt: string;
+  context: string;
+  question: string;
+  apiKey: string;
+  mode: 'simplified' | 'expert';
+}): Promise<string> {
+  const response = await fetch(
+    `https://generativelanguage.googleapis.com/v1beta/models/${GENERATION_MODEL}:generateContent?key=${apiKey}`,
+    {
+      method: 'POST',
+      headers: { 'Content-Type': 'application/json' },
+      body: JSON.stringify({
+        systemInstruction: {
+          role: 'system',
+          parts: [{ text: systemPrompt }],
+        },
+        contents: [
+          {
+            role: 'user',
+            parts: [
+              {
+                text: [
+                  'Tu dois répondre en français.',
+                  'Consigne : cite les éléments du contexte lorsque c\'est pertinent et propose un plan d\'action clair.',
+                  'Contexte RAG :',
+                  context || 'Aucun contexte disponible.',
+                  '',
+                  `Question de l'utilisateur : ${question}`,
+                  mode === 'expert'
+                    ? 'Structure : 1) Diagnostic, 2) Analyse, 3) Recommandations mesurables.'
+                    : 'Structure : 1) Comprendre, 2) Conseiller simplement, 3) Encourager.',
+                ].join('\n'),
+              },
+            ],
+          },
+        ],
+        generationConfig: {
+          temperature: mode === 'expert' ? 0.35 : 0.65,
+          topK: 32,
+          topP: 0.95,
+          maxOutputTokens: 1024,
+        },
+      }),
+    }
+  );
+
+  if (!response.ok) {
+    const errorText = await response.text();
+    throw new Error(`Gemini generation error: ${response.status} - ${errorText}`);
+  }
+
+  const payload = await response.json();
+  const textResponse = payload?.candidates?.[0]?.content?.parts
+    ?.map((part: { text?: string }) => part.text ?? '')
+    .join('')
+    .trim();
+
+  if (!textResponse) {
+    throw new Error('La réponse générée est vide.');
+  }
+
+  return textResponse;
+}
+
+serve(async (req) => {
+  if (req.method === 'OPTIONS') {
+    return new Response('ok', { headers: corsHeaders });
+  }
+
+  try {
+    const { question, expertiseMode = 'simplified', matchCount }: RagPayload = await req.json();
+    const sanitizedQuestion = question?.trim();
+
+    if (!sanitizedQuestion) {
+      throw new Error('La question de l\'utilisateur est requise.');
+    }
+
+    const supabaseUrl = Deno.env.get('SUPABASE_URL');
+    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
+    const geminiKey = Deno.env.get('GEMINI_API_KEY');
+
+    if (!supabaseUrl || !supabaseKey || !geminiKey) {
+      throw new Error('Les clés Supabase et Gemini doivent être configurées.');
+    }
+
+    const supabase = createClient(supabaseUrl, supabaseKey, {
+      auth: { persistSession: false, autoRefreshToken: false },
+    });
+
+    const queryEmbedding = await embedText(sanitizedQuestion, geminiKey);
+    const matchesLimit = Math.max(3, Math.min(matchCount ?? (expertiseMode === 'expert' ? 5 : 3), 5));
+
+    const { data: matches, error: matchError } = await supabase.rpc('match_corpus_embeddings', {
+      query_embedding: queryEmbedding,
+      match_count: matchesLimit,
+    });
+
+    if (matchError) {
+      throw matchError;
+    }
+
+    const context = (matches ?? [])
+      .map((item: { content: string; similarity: number }, index: number) =>
+        `Passage ${index + 1} (similarité ${(item.similarity * 100).toFixed(1)}%):\n${item.content}`
+      )
+      .join('\n\n');
+
+    const reply = await generateAnswer({
+      systemPrompt: SYSTEM_PROMPTS[expertiseMode] ?? SYSTEM_PROMPTS.simplified,
+      context,
+      question: sanitizedQuestion,
+      apiKey: geminiKey,
+      mode: expertiseMode,
+    });
+
+    return new Response(
+      JSON.stringify({
+        reply,
+        sources: matches ?? [],
+      }),
+      {
+        status: 200,
+        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
+      }
+    );
+  } catch (error) {
+    console.error('sprinty-rag-pipeline error:', error);
+    return new Response(
+      JSON.stringify({ error: error.message ?? 'Erreur interne du pipeline RAG.' }),
+      {
+        status: 400,
+        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
+      }
+    );
+  }
+});
