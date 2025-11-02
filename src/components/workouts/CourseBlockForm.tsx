  const handleFieldChange = (field: keyof Omit<CourseBlockData, 'id' | 'chronos'>, value: any) => {
    const updatedBlock = { ...block, [field]: value };
    
    // Si on change le nombre de séries ou de répétitions, on redimensionne le tableau chronos
    if (field === 'series' || field === 'reps') {
      const newNumSeries = field === 'series' ? (typeof value === 'number' ? value : 1) : (typeof block.series === 'number' ? block.series : 1);
      const newNumReps = field === 'reps' ? (typeof value === 'number' ? value : 1) : (typeof block.reps === 'number' ? block.reps : 1);
      
      const resizedChronos = produce(block.chronos || [], draft => {
        // Ajuster le nombre de séries
        while (draft.length < newNumSeries) {
          draft.push(Array(newNumReps).fill(null));
        }
        while (draft.length > newNumSeries) {
          draft.pop();
        }
        
        // Ajuster le nombre de répétitions dans chaque série
        draft.forEach((serie, index) => {
          while (draft[index].length < newNumReps) {
            draft[index].push(null);
          }
          while (draft[index].length > newNumReps) {
            draft[index].pop();
          }
        });
      });
      
      updatedBlock.chronos = resizedChronos;
    }
    
    onChange(updatedBlock);
  };
