import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RecordsForm } from '../components/records/RecordsForm';
import { useRecords } from '../hooks/useRecords';
import { Record } from '../types';

const AddRecordPage: React.FC = () => {
  const navigate = useNavigate();
  const { addRecord } = useRecords();

  const handleSave = async (record: Omit<Record, 'id'>) => {
    try {
      await addRecord(record);
      navigate('/records'); // Rediriger après sauvegarde
    } catch (error) {
      console.error("Erreur lors de l'ajout du record:", error);
      alert("Erreur lors de l'ajout du record. Veuillez réessayer.");
    }
  };

  const handleCancel = () => {
    navigate(-1); // Retourner à la page précédente
  };

  return <RecordsForm 
    records={[]} 
    onSave={handleSave} 
    onCancel={handleCancel} 
  />;
};

export default AddRecordPage;
