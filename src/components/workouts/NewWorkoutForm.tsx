  const updateBlock = (id: string, newData: any) => {
    setBlocs(prev =>
      prev.map(b => {
        if (b.id !== id) return b;

        // Si c'est un bloc "course" et que les séries/reps changent, on redimensionne le tableau des chronos
        if (b.type === 'course' && (b.data.series !== newData.series || b.data.reps !== newData.reps)) {
          const newNumSeries = typeof newData.series === 'number' ? Math.max(1, newData.series) : 1;
          const newNumReps = typeof newData.reps === 'number' ? Math.max(1, newData.reps) : 1;
          
          const resizedChronos = produce(newData.chronos || [], draft => {
            while (draft.length < newNumSeries) {
              draft.push(Array(newNumReps).fill(null));
            }
            while (draft.length > newNumSeries) {
              draft.pop();
            }
            draft.forEach((serie, index) => {
              while (draft[index].length < newNumReps) {
                draft[index].push(null);
              }
              while (draft[index].length > newNumReps) {
                draft[index].pop();
              }
            });
          });
          return { ...b, data: { ...newData, chronos: resizedChronos } };
        }
        
        // Pour les autres cas, on met juste à jour les données
        return { ...b, data: newData };
      })
    );
  };
