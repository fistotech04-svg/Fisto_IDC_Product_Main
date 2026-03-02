import React, { Suspense, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { Icon } from "@iconify/react";
import * as THREE from "three";
import RenderModel from "./ModelLoaders";

export default function CameraModal({ 
    isOpen, 
    onClose, 
    models, 
    settings, 
    materialSettings, 
    transformValues,
    hiddenMaterials,
    deletedMaterials
}) {
    const [isCapturing, setIsCapturing] = useState(false);
    const [showTakenShot, setShowTakenShot] = useState(null);
    const canvasRef = useRef();

    if (!isOpen) return null;

    const handleTakeShot = () => {
        setIsCapturing(true);
        setTimeout(() => {
            const canvas = document.querySelector('.camera-modal-canvas canvas');
            if (canvas) {
                const dataUrl = canvas.toDataURL("image/png");
                setShowTakenShot(dataUrl);
            }
            setIsCapturing(false);
        }, 100);
    };

    const handleDownload = () => {
        if (!showTakenShot) return;
        const link = document.createElement("a");
        link.href = showTakenShot;
        link.download = `3d-model-shot-${Date.now()}.png`;
        link.click();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[4px] animate-in fade-in duration-300">
            <div className="bg-white w-[65vw] rounded-[1.25vw] shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-300">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-[1.5vw] right-[1.5vw] w-[2.2vw] h-[2.2vw] flex items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer z-50"
                >
                    <Icon icon="heroicons:x-mark" width="1.2vw" />
                </button>

                {/* Header */}
                <div className="p-[2vw] pb-[1.5vw]">
                    <div className="flex items-center gap-[1vw]">
                        <h2 className="text-[1.5vw] font-bold text-gray-800 tracking-tight">3D Model Shot</h2>
                        <div className="flex-1 h-px bg-gray-100"></div>
                    </div>
                    <p className="text-[0.85vw] text-gray-400 mt-[0.4vw] font-medium">
                        <span className="text-red-500">*</span>You can Take a shot of the 3D Model!
                    </p>
                </div>

                {/* Canvas Container */}
                <div className="px-[2vw] pb-[2vw]">
                    <div className={`relative w-full aspect-[16/9] rounded-[1vw] overflow-hidden border border-gray-200 bg-[#f3f4f6] camera-modal-canvas transition-all ${isCapturing ? 'brightness-125' : ''}`}>
                        
                        {/* Checkerboard Background */}
                        <div 
                            className="absolute inset-0 opacity-[0.05]" 
                            style={{ 
                                backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)',
                                backgroundPosition: '0 0, 10px 10px',
                                backgroundSize: '20px 20px'
                            }}
                        ></div>

                        {showTakenShot ? (
                            <div className="absolute inset-0 z-40 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
                                <img src={showTakenShot} className="max-w-[80%] max-h-[70%] object-contain shadow-xl rounded-[0.5vw] bg-white" alt="Shot Preview" />
                                <div className="mt-[2vw] flex gap-[1vw]">
                                    <button 
                                        onClick={() => setShowTakenShot(null)}
                                        className="px-[1.5vw] py-[0.7vw] bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-[0.75vw] font-bold text-[0.85vw] transition-all cursor-pointer"
                                    >
                                        Retake
                                    </button>
                                    <button 
                                        onClick={handleDownload}
                                        className="px-[2.5vw] py-[0.7vw] bg-black hover:bg-zinc-800 text-white rounded-[0.75vw] font-bold text-[0.85vw] flex items-center gap-[0.5vw] transition-all cursor-pointer"
                                    >
                                        <Icon icon="solar:download-outline" width="1.1vw" />
                                        Save Snapshot
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Suspense fallback={null}>
                                <Canvas
                                    shadows
                                    gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
                                    camera={{ position: [0, 1, 5], fov: 40 }}
                                    onCreated={({ gl }) => {
                                        gl.toneMapping = THREE.ACESFilmicToneMapping;
                                        gl.outputColorSpace = THREE.SRGBColorSpace;
                                    }}
                                >
                                    <ambientLight intensity={1} />
                                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
                                    <directionalLight position={[-5, 5, -5]} intensity={0.5} />
                                    
                                    <group>
                                        {models.map((model) => (
                                            <RenderModel
                                                key={model.id}
                                                type={model.type}
                                                url={model.url}
                                                wireframe={false}
                                                modelName={model.name}
                                                transformMode={null} 
                                                transformValues={transformValues}
                                                materialSettings={materialSettings}
                                                hiddenMaterials={new Set([...hiddenMaterials, ...deletedMaterials])}
                                            />
                                        ))}
                                    </group>

                                    <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
                                    
                                    <Environment preset={materialSettings.environment || 'city'} />
                                    
                                    <OrbitControls enableDamping={true} dampingFactor={0.05} />
                                </Canvas>
                            </Suspense>
                        )}
                        
                        {/* Interaction Hint */}
                        {!showTakenShot && (
                            <div className="absolute top-[1vw] right-[1vw] bg-white/50 backdrop-blur-sm px-[0.75vw] py-[0.35vw] rounded-full text-[0.65vw] font-bold text-gray-600 pointer-events-none">
                                Orbit to Rotate • Scroll to Zoom
                            </div>
                        )}

                        {/* Capture Button */}
                        {!showTakenShot && (
                            <div className="absolute bottom-[1.5vw] left-1/2 -translate-x-1/2 z-30">
                                <button 
                                    onClick={handleTakeShot}
                                    className="px-[1.5vw] py-[0.8vw] bg-black text-white rounded-[1vw] flex items-center gap-[0.75vw] shadow-2xl hover:scale-105 active:scale-95 transition-all group cursor-pointer"
                                >
                                    <div className="w-[2.2vw] h-[2.2vw] rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
                                        <Icon icon="solar:camera-outline" width="1.2vw" />
                                    </div>
                                    <div className="flex flex-col items-start leading-tight">
                                        <span className="text-[0.6vw] text-gray-400 font-bold uppercase tracking-wider">Click to</span>
                                        <span className="text-[0.9vw] font-black">Take Shot</span>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
