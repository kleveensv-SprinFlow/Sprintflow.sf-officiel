import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UpdateNotification() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log(`Service Worker enregistré : ${swUrl}`);
    },
    onRegisterError(error) {
      console.error('Erreur lors de l\'enregistrement du Service Worker:', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      toast.info('Mise à jour téléchargée. Application en cours de rechargement...', {
        position: 'bottom-center',
        autoClose: 2500,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: 'dark',
        onClose: () => {
          updateServiceWorker(true);
        },
      });
    }
  }, [needRefresh, updateServiceWorker]);

  return <ToastContainer />;
}

export default UpdateNotification;