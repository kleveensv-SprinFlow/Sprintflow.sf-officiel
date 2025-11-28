import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { WorkoutBlock } from '../types/workout';
import { useAuth } from './useAuth';

export interface FavoriteBlock {
    id: string;
    coach_id: string;
    name: string;
    block_data: WorkoutBlock;
}

export function useFavoriteBlocks() {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<FavoriteBlock[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchFavorites = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('favorite_blocks')
                .select('*')
                .eq('coach_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setFavorites(data || []);
        } catch (err) {
            console.error('Error fetching favorite blocks:', err);
        } finally {
            setLoading(false);
        }
    };

    const addFavorite = async (name: string, block: WorkoutBlock) => {
        if (!user) return;
        try {
            // Remove ID from block data before saving to avoid conflicts on restore
            const { id, ...blockDataWithoutId } = block;

            const { data, error } = await supabase
                .from('favorite_blocks')
                .insert({
                    coach_id: user.id,
                    name,
                    block_data: blockDataWithoutId
                })
                .select()
                .single();

            if (error) throw error;
            setFavorites(prev => [data, ...prev]);
        } catch (err) {
            console.error('Error adding favorite block:', err);
            throw err;
        }
    };

    const deleteFavorite = async (id: string) => {
        try {
            const { error } = await supabase
                .from('favorite_blocks')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setFavorites(prev => prev.filter(f => f.id !== id));
        } catch (err) {
             console.error('Error deleting favorite block:', err);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, [user]);

    return { favorites, loading, addFavorite, deleteFavorite, refresh: fetchFavorites };
}
