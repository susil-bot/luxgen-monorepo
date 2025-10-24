import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Snackbar, SnackbarItem, SnackbarType } from './Snackbar';

interface SnackbarContextType {
  showSnackbar: (message: string, type?: SnackbarType, duration?: number, action?: { label: string; onClick: () => void }) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  hideSnackbar: (id: string) => void;
  clearAll: () => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

interface SnackbarProviderProps {
  children: ReactNode;
  maxSnackbars?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({
  children,
  maxSnackbars = 5,
  position = 'top-right',
}) => {
  const [snackbars, setSnackbars] = useState<SnackbarItem[]>([]);

  const showSnackbar = useCallback((
    message: string,
    type: SnackbarType = 'info',
    duration: number = 5000,
    action?: { label: string; onClick: () => void }
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newSnackbar: SnackbarItem = {
      id,
      message,
      type,
      duration,
      action,
    };

    setSnackbars(prev => {
      const updated = [...prev, newSnackbar];
      // Keep only the most recent snackbars
      return updated.slice(-maxSnackbars);
    });
  }, [maxSnackbars]);

  const showSuccess = useCallback((message: string, duration?: number) => {
    showSnackbar(message, 'success', duration);
  }, [showSnackbar]);

  const showError = useCallback((message: string, duration?: number) => {
    showSnackbar(message, 'error', duration);
  }, [showSnackbar]);

  const showWarning = useCallback((message: string, duration?: number) => {
    showSnackbar(message, 'warning', duration);
  }, [showSnackbar]);

  const showInfo = useCallback((message: string, duration?: number) => {
    showSnackbar(message, 'info', duration);
  }, [showSnackbar]);

  const hideSnackbar = useCallback((id: string) => {
    setSnackbars(prev => prev.filter(snackbar => snackbar.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setSnackbars([]);
  }, []);

  const contextValue: SnackbarContextType = {
    showSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideSnackbar,
    clearAll,
  };

  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
      
      {/* Render all snackbars */}
      <div className="fixed z-50 pointer-events-none">
        {snackbars.map((snackbar, index) => {
          const adjustedPosition = position.includes('top') 
            ? position.replace('top', 'top') as any
            : position.replace('bottom', 'bottom') as any;
          
          const offset = index * 80; // Stack snackbars with offset
          const positionStyle = adjustedPosition.includes('top')
            ? `top-${4 + index * 20}`
            : `bottom-${4 + index * 20}`;
          
          return (
            <Snackbar
              key={snackbar.id}
              open={true}
              message={snackbar.message}
              type={snackbar.type}
              duration={snackbar.duration}
              position={adjustedPosition}
              action={snackbar.action}
              onClose={() => hideSnackbar(snackbar.id)}
              className="pointer-events-auto"
              style={{
                transform: adjustedPosition.includes('top') 
                  ? `translateY(${offset}px)` 
                  : `translateY(-${offset}px)`,
              }}
            />
          );
        })}
      </div>
    </SnackbarContext.Provider>
  );
};
