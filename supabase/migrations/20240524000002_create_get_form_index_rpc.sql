-- Function to calculate the Form Index (Indice de Forme)
-- Returns: JSON containing the current score (0-100) and the trend
create or replace function public.get_form_index(p_user_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_logs record;
  v_total_score numeric := 0;
  v_count integer := 0;
  v_weighted_sum numeric := 0;
  v_weight_total numeric := 0;
  v_daily_score numeric;
  v_result json;
  v_today date := current_date;
  v_log_date date;
  v_days_back integer := 6; -- 7 days total including today
  v_weight numeric;
begin
  -- Fetch logs for the last 7 days
  for i in 0..v_days_back loop
    v_log_date := v_today - i;
    v_weight := (v_days_back - i + 1); -- Simple linear weight: today=7, yesterday=6...
    
    select * into v_logs
    from public.wellness_log
    where user_id = p_user_id and date = v_log_date;
    
    if found then
      -- Calculate daily score (Average of available metrics)
      -- Metrics: Sleep (0-100), Energy (0-100), Mood (0-100), Stress (100-0), Fatigue (100-0)
      -- Note: Stress and Fatigue are "negative" metrics (higher is worse), so we invert them (100 - val).
      
      v_daily_score := (
        coalesce(v_logs.ressenti_sommeil, 50) + 
        coalesce(v_logs.energie_subjective, 50) + 
        coalesce(v_logs.humeur_subjective, 50) + 
        (100 - coalesce(v_logs.stress_level, 50)) + 
        (100 - coalesce(v_logs.muscle_fatigue, 50))
      ) / 5.0;
      
      v_weighted_sum := v_weighted_sum + (v_daily_score * v_weight);
      v_weight_total := v_weight_total + v_weight;
      v_count := v_count + 1;
    end if;
  end loop;

  if v_weight_total > 0 then
    v_total_score := round(v_weighted_sum / v_weight_total);
  else
    v_total_score := 0; -- No data
  end if;

  v_result := json_build_object(
    'score', v_total_score,
    'days_tracked', v_count
  );

  return v_result;
end;
$$;

comment on function public.get_form_index is 'Calcule l''indice de forme sur 7 jours (moyenne pondérée par récence)';
