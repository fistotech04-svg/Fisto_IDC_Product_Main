import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";

export default function ModelGalleryModal({ isOpen, onClose, onSelectModel }) {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedModel, setSelectedModel] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchModels();
        }
    }, [isOpen]);

    const fetchModels = async () => {
        try {
            setLoading(true);
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
                const response = await axios.get(`${backendUrl}/api/3d-models/get-models`, {
                    params: { emailId: user.emailId }
                });
                setModels(response.data.models || []);
            }
        } catch (error) {
            console.error("Failed to fetch models:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const filteredModels = models.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleReplaceClick = () => {
        if (selectedModel) {
            onSelectModel(selectedModel);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-300">
            <div className="bg-white w-[70vw] h-[40vw] rounded-[0.75vw] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header Section */}
                <div className="p-[1.5vw] pb-[1vw] flex items-start justify-between">
                    <div>
                        <h2 className="text-[1.5vw] font-bold text-gray-800 tracking-tight">3D Model Gallery</h2>
                        <p className="text-[0.85vw] text-gray-500 mt-[0.2vw] font-medium">Select a professional popup design to get start</p>
                    </div>
                    <div className="flex items-center gap-[0.75vw] pt-[0.25vw]">
                        {/* Search Bar */}
                        <div className="relative group">
                            <Icon 
                                icon="bitcoin-icons:search-outline" 
                                className="absolute left-[0.6vw] top-1/2 -translate-y-1/2 text-gray-400 w-[1.1vw] h-[1.1vw]" 
                            />
                            <input 
                                type="text" 
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-[2.2vw] pr-[1vw] py-[0.5vw] w-[20vw] bg-white border border-gray-300 rounded-full text-[0.8vw] focus:outline-none focus:border-indigo-500 transition-all"
                            />
                        </div>
                        {/* Filter Button */}
                        <button className="flex items-center gap-[0.4vw] px-[1vw] py-[0.5vw] border border-gray-300 rounded-full text-[0.8vw] font-medium text-gray-600 hover:bg-gray-50 transition-all">
                            <Icon icon="mi:filter" className="w-[1vw] h-[1vw]" />
                            Filter
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 mx-[1.5vw]"></div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto px-[1.5vw] py-[1.2vw] custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-[10vw] gap-[1vw]">
                            <div className="w-[3vw] h-[3vw] border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-[1vw] text-gray-500 font-medium">Fetching Models...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-6 gap-[1vw] pb-[2vw]">
                            {(filteredModels.length > 0 ? filteredModels : Array(12).fill(null)).map((model, idx) => (
                                <div 
                                    key={idx}
                                    onClick={() => model && setSelectedModel(model)}
                                    className={`group cursor-pointer flex flex-col items-center gap-[0.5vw] transition-all`}
                                >
                                    <div className={`relative w-full aspect-[4/3] rounded-[0.5vw] overflow-hidden bg-[#F3F3F3] flex items-center justify-center transition-all ${
                                        selectedModel?.name === model?.name && model
                                            ? 'ring-[0.15vw] ring-indigo-500 ring-offset-1' 
                                            : ''
                                    }`}>
                                        {model?.thumbnailUrl ? (
                                            <img 
                                                src={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${model.thumbnailUrl}`} 
                                                alt={model.name}
                                                className="w-full h-full object-contain p-[0.75vw]"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-[0.5vw] text-gray-300">
                                                <Icon icon="solar:box-minimalistic-broken" className="w-[3.5vw] h-[3.5vw]" />
                                            </div>
                                        )}
                                        {selectedModel?.name === model?.name && model && (
                                            <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none"></div>
                                        )}
                                    </div>
                                    <span className="text-[0.8vw] font-medium text-gray-600">
                                        {model ? model.name.replace(/\.[^/.]+$/, "") : "Machine"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                <div className="p-[1.5vw] pt-0 flex items-center justify-end gap-[0.75vw] mt-auto">
                    <button 
                        onClick={onClose}
                        className="flex items-center cursor-pointer gap-[0.5vw] px-[1.5vw] py-[0.6vw] border border-gray-300 rounded-[0.4vw] text-[0.85vw] font-semibold text-gray-800 hover:bg-gray-50 active:scale-95 transition-all"
                    >
                        Close
                    </button>
                    <button 
                        disabled={!selectedModel}
                        onClick={handleReplaceClick}
                        className={`flex items-center cursor-pointer gap-[0.5vw] px-[2vw] py-[0.6vw] rounded-[0.4vw] text-[0.85vw] font-semibold shadow-sm transition-all active:scale-95 ${
                            selectedModel 
                                ? 'bg-black text-white hover:bg-zinc-800' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        Replace Model
                    </button>
                </div>

                <style>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 0.4vw;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #d1d1d1;
                        border-radius: 1vw;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #a1a1a1;
                    }
                `}</style>
            </div>
        </div>
    );
}
