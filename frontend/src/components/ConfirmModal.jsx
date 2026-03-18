import React from 'react';
import { X, AlertCircle } from 'lucide-react';

const ConfirmModal = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger" // danger, warning, info
}) => {
    if (!isOpen) return null;

    const typeConfig = {
        danger: {
            icon: <AlertCircle className="text-red-600" size={24} />,
            btnClass: "bg-red-600 hover:bg-red-700 shadow-red-900/20",
            titleClass: "text-red-900"
        },
        warning: {
            icon: <AlertCircle className="text-amber-600" size={24} />,
            btnClass: "bg-amber-800 hover:bg-amber-900 shadow-amber-900/20",
            titleClass: "text-stone-900"
        },
        info: {
            icon: <AlertCircle className="text-blue-600" size={24} />,
            btnClass: "bg-blue-600 hover:bg-blue-700 shadow-blue-900/20",
            titleClass: "text-stone-900"
        }
    };

    const config = typeConfig[type] || typeConfig.danger;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all duration-300">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-stone-900/40 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onCancel}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl shadow-stone-900/40 p-8 sm:p-10 animate-in zoom-in-95 duration-200 ease-out border border-stone-100">
                <button
                    onClick={onCancel}
                    className="absolute top-6 right-6 p-2 text-stone-300 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-all"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-3xl bg-stone-50 flex items-center justify-center mb-6">
                        {config.icon}
                    </div>

                    <h3 className={`text-xl font-black ${config.titleClass} tracking-tight mb-2`}>
                        {title}
                    </h3>
                    <p className="text-stone-500 text-sm font-medium leading-relaxed mb-10">
                        {message}
                    </p>

                    <div className={`grid ${onCancel ? 'grid-cols-2' : 'grid-cols-1'} gap-3 w-full`}>
                        {onCancel && (
                            <button
                                onClick={onCancel}
                                className="px-6 py-4 rounded-2xl bg-stone-50 text-stone-600 font-black text-xs uppercase tracking-widest hover:bg-stone-100 transition-all active:scale-95"
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            onClick={onConfirm}
                            className={`px-6 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 ${config.btnClass}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
