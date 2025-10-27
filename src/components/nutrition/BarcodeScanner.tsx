import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Zap, ZapOff } from 'lucide-react';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string) => void;
}

export function BarcodeScanner({ isOpen, onClose, onScanSuccess }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopScanner();
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      startScanner();
    } else {
      stopScanner();
    }
  }, [isOpen]);

  const startScanner = async () => {
    try {
      setError(null);
      setIsScanning(true);

      if (scannerRef.current) {
        await stopScanner();
      }
      
      const newScanner = new Html5Qrcode('barcode-reader');
      scannerRef.current = newScanner;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      const cameraConfig = { facingMode: "environment" };

      await newScanner.start(
        cameraConfig,
        config,
        (decodedText) => {
          if (mountedRef.current) {
            onScanSuccess(decodedText);
            handleClose();
          }
        },
        (errorMessage) => {
          // Ignore "QR code parse error" which happens continuously
        }
      );

    } catch (err: any) {
      console.error('Error starting scanner:', err);
      if (mountedRef.current) {
        let errorMessage = 'Impossible de démarrer le scanner.';
        if (err.name === 'NotAllowedError') {
          errorMessage = "L'accès à la caméra a été refusé. Veuillez vérifier les permissions de votre navigateur.";
        } else if (err.name === 'NotFoundError') {
          errorMessage = "Aucune caméra compatible n'a été trouvée sur cet appareil.";
        }
        setError(errorMessage);
        setIsScanning(false);
      }
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping the scanner:', err);
      }
      scannerRef.current = null;
    }
    if (mountedRef.current) {
      setIsScanning(false);
      setFlashEnabled(false);
    }
  };
  
  const toggleFlash = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        const newFlashState = !flashEnabled;
        // @ts-ignore - The type definitions for html5-qrcode might not include this method yet
        await scannerRef.current.applyVideoConstraints({
          advanced: [{ torch: newFlashState }]
        });
        setFlashEnabled(newFlashState);
      } catch (err) {
        console.error('Error toggling flash:', err);
        setError("Le flash n'est pas supporté par cette caméra.");
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="bg-gradient-to-r from-green-600 to-green-500 p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Scanner un code-barres</h2>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-green-700 rounded-lg transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-md">
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl aspect-square">
              <div id="barcode-reader" className="w-full h-full"></div>
              
              {!isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4">
                  <Camera className="w-16 h-16 mb-4" />
                  <p className="text-center">Démarrage de la caméra...</p>
                </div>
              )}

              {error && (
                <div className="absolute top-4 left-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}

              {isScanning && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 flex justify-center gap-4">
                      <button
                          onClick={toggleFlash}
                          className={`p-4 rounded-full transition-all ${
                              flashEnabled
                                  ? 'bg-yellow-400 text-black'
                                  : 'bg-white/20 text-white hover:bg-white/30'
                          }`}
                          title={flashEnabled ? 'Éteindre le flash' : 'Allumer le flash'}
                      >
                          {flashEnabled ? (
                              <Zap className="w-6 h-6" />
                          ) : (
                              <ZapOff className="w-6 h-6" />
                          )}
                      </button>
                  </div>
              )}
            </div>

            <p className="text-white text-center mt-6 text-sm">
                {isScanning ? "Pointez votre caméra vers un code-barres" : "Veuillez patienter..."}
            </p>

            <button
                onClick={handleClose}
                className="w-full mt-6 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
                Annuler
            </button>
        </div>
      </div>
    </div>
  );
}
