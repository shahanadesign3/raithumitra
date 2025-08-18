import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';

export const useBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBackButton = () => {
      // Define navigation stack
      const navigationStack = {
        '/': null, // Root - exit app
        '/language': '/',
        '/onboarding/location': '/language',
        '/onboarding/crop': '/onboarding/location',
        '/dashboard': '/onboarding/crop',
      };

      const currentPath = location.pathname;
      const previousPath = navigationStack[currentPath as keyof typeof navigationStack];

      if (previousPath) {
        // Navigate to previous screen
        navigate(previousPath);
      } else {
        // Exit app if at root
        App.exitApp();
      }
    };

    // Register back button listener
    let listenerHandle: any;
    App.addListener('backButton', handleBackButton).then((handle) => {
      listenerHandle = handle;
    });

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [navigate, location.pathname]);
};