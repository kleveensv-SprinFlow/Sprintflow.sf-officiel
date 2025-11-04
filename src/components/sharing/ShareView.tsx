import React, { useRef } from 'react';
import usePhotoUpload from '../../hooks/usePhotoUpload';
import { X, Upload, Share2 } from 'lucide-react';
import Watermark from '../Watermark';
import { toast } from 'react-toastify';

interface ShareViewProps {
  onClose: () => void;
}

const ShareView: React.FC<ShareViewProps> = ({ onClose }) => {
  const { image, triggerFileSelect, handleFileChange } = usePhotoUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleShare = () => {
    if (!image) {
      toast.error('Veuillez d-abord choisir une photo.');
      return;
    }
    // Simuler l'action de partage
    console.log('Sharing image:', image);
    toast.success('Exploit partagé avec succès !');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-11/12 max-w-md relative flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold text-center mb-4">Partager un Exploit</h2>
        <div className="flex-grow aspect-w-1 aspect-h-1 w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
          {image ? (
            <div className="relative">
              <img src={image} alt="Aperçu de l'exploit" className="max-h-64 object-contain" />
              <Watermark />
            </div>
          ) : (
            <div className="text-center">
              <Upload size={48} className="mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Aucune image sélectionnée</p>
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
          accept="image/*"
        />
        <button
          onClick={triggerFileSelect}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Choisir une photo
        </button>
        <button
          onClick={handleShare}
          disabled={!image}
          className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center disabled:bg-gray-400"
        >
          <Share2 size={20} className="mr-2" />
          Partager
        </button>
      </div>
    </div>
  );
};

export default ShareView;