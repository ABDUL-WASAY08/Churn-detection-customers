import { useEffect, useState } from 'react';
import { trainDataStore } from '../zustand/traningdataState';
import { Loader2, Play } from 'lucide-react';
import toast from 'react-hot-toast';

export const UrlInputForm = () => {
    const [dataUrl, setDataUrl] = useState('');

    const {
        loading,
        error,
        startTraining,
        health,
        healthLoading,
        getHealth
    } = trainDataStore();

    useEffect(() => {
        getHealth();
    }, [getHealth]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await startTraining(dataUrl);
        if (result?.message) {
            toast.success(result.message);
        }
    };

    // Backend healthy hai ya nahi
    const isHealthy = health === 200;


    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">

            <form onSubmit={handleSubmit} className="flex gap-3">

                <input
                    type="text"
                    placeholder="Paste Raw CSV Dataset URL here..."
                    value={dataUrl}
                    onChange={(e) => setDataUrl(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800 text-sm"
                />

                <button
                    type="submit"
                    disabled={!isHealthy || loading || healthLoading}
                    className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >

                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Training Model
                        </>
                    ) : healthLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Checking Server
                        </>
                    ) : (
                        <>
                            <Play className="w-5 h-5" />
                            Start Training
                        </>
                    )}

                </button>

            </form>

        </div>
    );
};