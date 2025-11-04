
import { useState, useCallback } from 'react';

const usePhotoUpload = () => {
  const [image, setImage] = useState<string | null>(null);

  const triggerFileSelect = useCallback(() => {
    document.getElementById('file-upload')?.click();
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  return {
    image,
    setImage,
    triggerFileSelect,
    handleFileChange,
  };
};

export default usePhotoUpload;
