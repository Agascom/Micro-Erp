import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 3000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map(toast => (
                    <div 
                        key={toast.id}
                        className={`
                            px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[300px] animate-slideIn
                            ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : ''}
                            ${toast.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : ''}
                            ${toast.type === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-200' : ''}
                        `}
                    >
                        <span className="material-symbols-outlined">
                            {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
                        </span>
                        <p className="font-medium text-sm">{toast.message}</p>
                        <button 
                            onClick={() => removeToast(toast.id)}
                            className="ml-auto hover:opacity-70"
                        >
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
