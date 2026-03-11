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
    const [bgColor, setBgColor] = useState('transparent');
    const [customColor, setCustomColor] = useState('#D7D8E8');
    const [opacity, setOpacity] = useState(100);
    const [selectedFrame, setSelectedFrame] = useState('free');
    const [zoom, setZoom] = useState(50);

    // Export panel state
    const [imageName, setImageName] = useState('');
    const [selectedResolution, setSelectedResolution] = useState('medium');
    const [exportFormat, setExportFormat] = useState('jpg');

    const canvasRef = useRef();
    const glRef    = useRef(null);
    const sceneRef = useRef(null);
    const camRef   = useRef(null);

    if (!isOpen) return null;

    const handleTakeShot = () => {
        setIsCapturing(true);
        setTimeout(() => {
            const gl     = glRef.current;
            const scene  = sceneRef.current;
            const camera = camRef.current;

            if (gl && scene && camera) {
                const domCanvas = gl.domElement;
                const dpr       = gl.getPixelRatio();
                const origW     = domCanvas.width  / dpr;
                const origH     = domCanvas.height / dpr;
                const ratio     = origW / origH;

                // Render at 2048px (longest side) for a crisp capture
                const CAPTURE_PX = 2048;
                const capW = ratio >= 1 ? CAPTURE_PX : Math.round(CAPTURE_PX * ratio);
                const capH = ratio >= 1 ? Math.round(CAPTURE_PX / ratio) : CAPTURE_PX;

                // Temporarily switch to 1:1 pixel ratio to avoid double-scaling
                gl.setPixelRatio(1);
                gl.setSize(capW, capH, false);
                gl.render(scene, camera);

                const dataUrl = domCanvas.toDataURL('image/png');

                // Restore original size
                gl.setPixelRatio(dpr);
                gl.setSize(origW, origH, false);
                gl.render(scene, camera);

                setShowTakenShot(dataUrl);
            } else {
                // Fallback: grab whatever canvas is on screen
                const canvas = document.querySelector('.camera-modal-canvas canvas');
                if (canvas) setShowTakenShot(canvas.toDataURL('image/png'));
            }
            setIsCapturing(false);
        }, 200);
    };

    // Resolution → max dimension in px
    const resolutionPxMap = { low: 720, medium: 1024, high: 2048, ultra: 4096 };

    // Format → MIME + extension
    const formatMeta = {
        png:  { mime: 'image/png',  ext: 'png'  },
        jpg:  { mime: 'image/jpeg', ext: 'jpg'  },
        webp: { mime: 'image/webp', ext: 'webp' },
        pdf:  { mime: 'image/png',  ext: 'png'  }, // PDF not natively downloadable; export as PNG
    };

    const handleExport = () => {
        if (!showTakenShot) return;

        const targetPx  = resolutionPxMap[selectedResolution] || 1024;
        const { mime, ext } = formatMeta[exportFormat] || formatMeta.jpg;
        const name = imageName.trim() || `3d-snapshot-${Date.now()}`;

        const img = new Image();
        img.onload = () => {
            // Preserve aspect ratio — longest side = targetPx
            const ratio = img.width / img.height;
            let w, h;
            if (ratio >= 1) {
                w = targetPx;
                h = Math.round(targetPx / ratio);
            } else {
                h = targetPx;
                w = Math.round(targetPx * ratio);
            }

            const offscreen = document.createElement('canvas');
            offscreen.width  = w;
            offscreen.height = h;
            const ctx = offscreen.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, w, h);

            const dataUrl = offscreen.toDataURL(mime, 0.95);
            const link = document.createElement('a');
            link.href     = dataUrl;
            link.download = `${name}.${ext}`;
            link.click();
            // Modal stays open after export
        };
        img.src = showTakenShot;
    };

    const bgPresets = [
        { id: 'transparent', type: 'pattern', value: 'transparent' },
        { id: 'white', type: 'color', value: '#FFFFFF' },
        { id: 'gray', type: 'color', value: '#E5E7EB' },
        { id: 'black', type: 'color', value: '#111827' },
        { id: 'gradient1', type: 'gradient', value: 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 100%)' },
        { id: 'gradient2', type: 'gradient', value: 'linear-gradient(135deg, #60a5fa 33%, #f472b6 66%, #fbbf24 100%)' },
    ];

    const frames = [
        { id: 'free', label: 'Free size', icon: 'heroicons:square-3-stack-3d' },
        { id: 'instagram', label: 'Instagram', icon: 'ri:instagram-line' },
        { id: 'instagram2', label: 'Instagram', icon: 'ri:instagram-line' },
    ];

    const resolutions = [
        { id: 'low',    label: 'Low',    sub: '720px' },
        { id: 'medium', label: 'Medium', sub: '1024px' },
        { id: 'high',   label: 'High',   sub: '2048px' },
        { id: 'ultra',  label: 'Ultra',  sub: '4096px' },
    ];

    const formats = ['PNG', 'JPG', 'WEBP', 'PDF'];

    const getBgStyles = () => {
        if (bgColor === 'transparent') {
            return {
                backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb), linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb)',
                backgroundPosition: '0 0, 10px 10px',
                backgroundSize: '20px 20px',
                backgroundColor: '#ffffff'
            };
        }
        if (bgColor === 'custom') {
            return { backgroundColor: customColor, opacity: opacity / 100 };
        }
        const preset = bgPresets.find(p => p.id === bgColor);
        if (preset?.type === 'gradient') {
            return { background: preset.value };
        }
        return { backgroundColor: preset?.value || '#FFFFFF' };
    };

    const getFrameStyles = () => {
        switch (selectedFrame) {
            case 'instagram': return 'aspect-square mx-auto';
            case 'instagram2': return 'aspect-square mx-auto';
            default: return 'w-full aspect-[4/3]';
        }
    };

    // ─── Export View (after capture) ────────────────────────────────────────────
    if (showTakenShot) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300">
                <div className="bg-white w-[60vw] h-[85vh] rounded-[0.75vw] shadow-2xl flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-300">

                    {/* Export Header */}
                    <div className="px-[1.5vw] pt-[1.5vw] pb-[1vw] flex items-start justify-between">
                        <div className="flex-1 flex flex-col">
                            <div className="flex items-center gap-[1vw] w-full">
                                <h2 className="text-[1.3vw] font-bold text-gray-800 tracking-tight whitespace-nowrap">Export 3D Snapshot</h2>
                                <div className="flex-1 h-px bg-gray-200 mt-[0.2vw]"></div>
                            </div>
                            <p className="text-[0.8vw] text-gray-400 mt-[0.2vw] font-medium leading-tight">
                                You can Save / Share the 3D Models Image in various Methods
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="ml-[1.5vw] w-[2.2vw] h-[2.2vw] flex items-center justify-center rounded-[0.5vw] border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer shadow-sm group"
                        >
                            <Icon icon="heroicons:x-mark" width="1.3vw" className="group-hover:scale-110 transition-transform" />
                        </button>
                    </div>

                    {/* Export Body */}
                    <div className="flex flex-1 px-[1.5vw] pb-[1.5vw] gap-[1.5vw] overflow-hidden">

                        {/* Left — Image Preview */}
                        <div className="flex-[1.8] flex flex-col gap-[1vw]">
                            <div
                                className="flex-1 rounded-[0.75vw] border border-gray-200 overflow-hidden shadow-inner"
                                style={{
                                    backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb), linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb)',
                                    backgroundPosition: '0 0, 10px 10px',
                                    backgroundSize: '20px 20px',
                                    backgroundColor: '#ffffff'
                                }}
                            >
                                <img
                                    src={showTakenShot}
                                    className="w-full h-full object-contain"
                                    alt="Captured Snapshot"
                                />
                            </div>

                            {/* Retake Button */}
                            <button
                                onClick={() => setShowTakenShot(null)}
                                className="flex items-center gap-[0.5vw] px-[1.2vw] py-[0.6vw] bg-[#5d5efc] hover:bg-[#4a4be0] text-white rounded-[0.7vw] font-semibold text-[0.8vw] transition-all cursor-pointer shadow-md hover:translate-y-[-2px] active:translate-y-0 w-fit"
                            >
                                <Icon icon="solar:camera-outline" width="1.1vw" />
                                Retake
                            </button>
                        </div>

                        {/* Right — Export Controls */}
                        <div className="w-[20vw] flex flex-col gap-[1.2vw] overflow-y-auto">

                            {/* Image Name */}
                            <div className="space-y-[0.7vw]">
                                <div className="flex items-center gap-[0.8vw]">
                                    <span className="text-[0.9vw] font-bold text-gray-800 whitespace-nowrap">Background Color</span>
                                    <div className="flex-1 h-[0.1vw] rounded-full bg-gray-300"></div>
                                </div>
                                <div className="flex items-center gap-[0.5vw] border border-gray-200 rounded-[0.6vw] px-[0.8vw] h-[2.6vw] bg-white focus-within:border-[#5d5efc] transition-all shadow-sm">
                                    <input
                                        type="text"
                                        value={imageName}
                                        onChange={(e) => setImageName(e.target.value)}
                                        placeholder="Name of the Image"
                                        className="flex-1 bg-transparent border-none outline-none text-[0.8vw] text-gray-600 font-medium placeholder:text-gray-400"
                                    />
                                    <button
                                        onClick={() => {}}
                                        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                    >
                                        <Icon icon="heroicons:pencil-square" width="1vw" />
                                    </button>
                                </div>
                            </div>

                            {/* Image Resolution */}
                            <div className="space-y-[0.7vw]">
                                <div className="flex items-center gap-[0.8vw]">
                                    <span className="text-[0.9vw] font-bold text-gray-800 whitespace-nowrap">Image resolution</span>
                                    <div className="flex-1 h-[0.1vw] rounded-full bg-gray-300"></div>
                                </div>
                                <div className="grid grid-cols-4 gap-[0.4vw]">
                                    {resolutions.map((res) => (
                                        <button
                                            key={res.id}
                                            onClick={() => setSelectedResolution(res.id)}
                                            className={`flex flex-col items-center justify-center py-[0.55vw] rounded-[0.6vw] border transition-all cursor-pointer text-center ${
                                                selectedResolution === res.id
                                                    ? 'bg-black border-black text-white shadow-md'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                                            }`}
                                        >
                                            <span className="text-[0.75vw] font-semibold leading-tight">{res.label}</span>
                                            <span className={`text-[0.6vw] font-medium leading-tight mt-[0.1vw] ${selectedResolution === res.id ? 'text-gray-300' : 'text-gray-400'}`}>
                                                ({res.sub})
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Export Format */}
                            <div className="space-y-[0.7vw]">
                                <div className="flex items-center gap-[0.8vw]">
                                    <span className="text-[0.9vw] font-bold text-gray-800 whitespace-nowrap">Export Image As</span>
                                    <div className="flex-1 h-[0.1vw] rounded-full bg-gray-300"></div>
                                </div>
                                <p className="text-[0.7vw] text-red-400 font-medium leading-tight">
                                    * You can Export / Share the 3D Models Image in various Methods
                                </p>
                                <div className="grid grid-cols-4 gap-[0.4vw]">
                                    {formats.map((fmt) => (
                                        <button
                                            key={fmt}
                                            onClick={() => setExportFormat(fmt.toLowerCase())}
                                            className={`py-[0.55vw] rounded-[0.6vw] border text-[0.75vw] font-semibold transition-all cursor-pointer ${
                                                exportFormat === fmt.toLowerCase()
                                                    ? 'bg-black border-black text-white shadow-md'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                                            }`}
                                        >
                                            {fmt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-[0.6vw] pt-[3vw]">
                                <button
                                    onClick={handleExport}
                                    className="w-full py-[0.8vw] bg-black hover:bg-zinc-800 text-white rounded-[0.7vw] font-semibold text-[0.85vw] flex items-center justify-center gap-[0.6vw] transition-all cursor-pointer shadow-lg hover:translate-y-[-2px] active:translate-y-0"
                                >
                                    <Icon icon="solar:download-outline" width="1.1vw" />
                                    Export as {exportFormat.toUpperCase()}
                                </button>
                                <button
                                    className="w-full py-[0.8vw] bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-[0.7vw] font-semibold text-[0.85vw] flex items-center justify-center gap-[0.6vw] transition-all cursor-pointer shadow-sm hover:translate-y-[-2px] active:translate-y-0"
                                >
                                    <Icon icon="solar:gallery-outline" width="1.1vw" />
                                    Add to Image Gallery
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Capture View (default) ──────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300">
            <div className="bg-white w-[60vw] h-[85vh] rounded-[0.75vw] shadow-2xl flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* Header */}
                <div className="p-[1.5vw] flex items-center justify-between">
                    <div className="flex-1 flex flex-col">
                        <div className="flex items-center gap-[1vw] w-full">
                            <h2 className="text-[1.3vw] font-bold text-gray-800 tracking-tight whitespace-nowrap">3D Snapshot</h2>
                            <div className="flex-1 h-px bg-gray-200 mt-[0.2vw]"></div>
                        </div>
                        <p className="text-[0.8vw] text-gray-400 mt-[0.2vw] font-medium leading-tight">
                            Capture high-quality images of your 3D model instantly
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="ml-[1.5vw] w-[2.2vw] h-[2.2vw] flex items-center justify-center rounded-[0.5vw] border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer shadow-sm group"
                    >
                        <Icon icon="heroicons:x-mark" width="1.3vw" className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                <div className="flex flex-1 px-[1.5vw] pb-[1.5vw] gap-[1.5vw] overflow-hidden">
                    {/* Left Column - Canvas */}
                    <div className="flex-[1.8] flex flex-col gap-[1vw]">
                        <div className={`relative flex-1 rounded-[0.75vw] border border-gray-300 overflow-hidden camera-modal-canvas shadow-inner ${isCapturing ? 'brightness-110' : ''}`} style={getBgStyles()}>
                            <div className={`relative w-full h-full flex items-center justify-center ${getFrameStyles()}`}>
                                <Suspense fallback={null}>
                                    <Canvas
                                        shadows
                                        gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
                                        camera={{ position: [0, 1, 5], fov: 40 }}
                                        onCreated={({ gl, scene, camera }) => {
                                            glRef.current    = gl;
                                            sceneRef.current = scene;
                                            camRef.current   = camera;
                                            gl.toneMapping = THREE.ACESFilmicToneMapping;
                                            gl.outputColorSpace = THREE.SRGBColorSpace;
                                        }}
                                    >
                                        {bgColor !== 'transparent' && bgColor !== 'gradient1' && bgColor !== 'gradient2' && (
                                            <color attach="background" args={[bgColor === 'custom' ? customColor : bgPresets.find(p => p.id === bgColor)?.value || '#ffffff']} />
                                        )}
                                        
                                        <ambientLight intensity={1.5} />
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
                                                    isSelectionDisabled={true}
                                                    shouldClone={true}
                                                />
                                            ))}
                                        </group>

                                        <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
                                        <Environment preset={materialSettings.environment || 'city'} />
                                        <OrbitControls enableDamping={true} dampingFactor={0.05} />
                                    </Canvas>
                                </Suspense>

                                {/* Zoom Controls Overlay */}
                                <div className="absolute bottom-[1vw] right-[1vw] bg-white/90 backdrop-blur-md rounded-[0.8vw] shadow-lg border border-gray-100 flex items-center p-[0.3vw] gap-[0.3vw]">
                                    <button className="p-[0.4vw] hover:bg-gray-100 rounded-[0.5vw] text-gray-500 transition-colors">
                                        <Icon icon="heroicons:magnifying-glass" width="1vw" strokeWidth={2.5} />
                                    </button>
                                    <div className="flex items-center gap-[0.3vw] px-[0.4vw] border-l border-gray-100">
                                        <span className="text-[0.7vw] font-black text-gray-700 w-[2.2vw] text-center">{zoom}%</span>
                                        <Icon icon="heroicons:chevron-down" width="0.7vw" className="text-gray-400" />
                                    </div>
                                    <button className="p-[0.4vw] hover:bg-gray-100 rounded-[0.5vw] text-gray-500 transition-colors">
                                        <Icon icon="heroicons:magnifying-glass" width="1vw" strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Controls */}
                    <div className="flex-1 flex flex-col gap-[1.5vw] w-[20vw]">
                        
                        {/* Background Color Section */}
                        <div className="space-y-[1vw]">
                            <div className="flex items-center gap-[0.8vw]">
                                <span className="text-[0.9vw] font-bold text-gray-800 whitespace-nowrap">Background Color</span>
                                <div className="flex-1 h-[0.1vw] rounded-full bg-gray-300"></div>
                            </div>
                            
                            <div className="grid grid-cols-6 gap-[0.8vw]">
                                {bgPresets.map((preset) => (
                                    <button
                                        key={preset.id}
                                        onClick={() => setBgColor(preset.id)}
                                        className={`aspect-square rounded-[0.6vw] border-[0.15vw] transition-all hover:scale-105 active:scale-95 ${
                                            bgColor === preset.id ? 'border-[#5d5efc] scale-110 shadow-md ring-4 ring-[#5d5efc]/10' : 'border-gray-200 shadow-sm'
                                        }`}
                                        style={preset.id === 'transparent' ? {
                                            backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb), linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb)',
                                            backgroundPosition: '0 0, 4px 4px',
                                            backgroundSize: '8px 8px',
                                            backgroundColor: '#ffffff'
                                        } : preset.type === 'gradient' ? {
                                            background: preset.value
                                        } : {
                                            backgroundColor: preset.value
                                        }}
                                    />
                                ))}
                            </div>

                            <div className="flex items-center gap-[1vw] pt-[0.2vw]">
                                <span className="text-[0.85vw] text-gray-500 font-bold whitespace-nowrap">Custom :</span>
                                <div className="flex-1 flex items-center gap-[0.6vw]">
                                    <div 
                                        className={`w-[2.5vw] h-[2.5vw] rounded-[0.6vw] border-2 cursor-pointer shadow-sm transition-all ${bgColor === 'custom' ? 'border-[#5d5efc] ring-4 ring-[#5d5efc]/10' : 'border-gray-200 hover:border-gray-300'}`}
                                        style={{ backgroundColor: customColor }}
                                        onClick={() => setBgColor('custom')}
                                    />
                                    <div className="flex-1 flex items-center h-[2.5vw] gap-[0.6vw] border border-gray-200 rounded-[0.6vw] px-[0.8vw] bg-gray-50/50 focus-within:bg-white focus-within:border-[#5d5efc] transition-all">
                                        <input 
                                            type="text" 
                                            value={customColor} 
                                            onChange={(e) => {
                                                setCustomColor(e.target.value);
                                                setBgColor('custom');
                                            }}
                                            className="w-full bg-transparent border-none outline-none text-[0.8vw] font-semibold text-gray-700 uppercase"
                                            placeholder="#FFFFFF"
                                        />
                                        <span className="text-[0.75vw] font-semibold text-gray-400 border-l border-gray-200 pl-[0.6vw] flex items-center h-full">{opacity}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Frames Section */}
                        <div className="flex-1 flex flex-col gap-[1vw]">
                            <div className="flex items-center gap-[0.8vw]">
                                <span className="text-[0.9vw] font-bold text-gray-800 whitespace-nowrap">Frames</span>
                                <div className="flex-1 h-[0.1vw] rounded-full bg-gray-300"></div>
                            </div>

                            <div className="flex-1 border border-gray-300 rounded-[0.75vw] bg-gray-50/20 p-[0.75vw] grid grid-cols-3 gap-[0.75vw]">
                                {frames.map((frame) => (
                                    <button
                                        key={frame.id}
                                        onClick={() => setSelectedFrame(frame.id)}
                                        className={`flex flex-col items-center justify-center gap-[0.8vw] p-[0.8vw] rounded-[0.75vw] border-[0.15vw] transition-all group relative ${
                                            selectedFrame === frame.id 
                                            ? 'bg-white border-[#5d5efc] shadow-lg -translate-y-[2px]' 
                                            : 'bg-white/60 border-transparent hover:bg-white hover:border-gray-200'
                                        }`}
                                    >
                                        <div className={`w-[3vw] h-[3vw] rounded-[0.8vw] border-[0.1vw] border-dashed flex items-center justify-center ${
                                            selectedFrame === frame.id ? 'border-[#5d5efc] bg-[#5d5efc]/5 text-[#5d5efc]' : 'border-gray-300 bg-gray-50 text-gray-400 group-hover:bg-gray-100'
                                        }`}>
                                            {frame.id.includes('instagram') ? (
                                                <Icon icon="ri:instagram-line" width="1.4vw" />
                                            ) : (
                                                <div className="w-[1.2vw] h-[0.8vw] border border-current rounded-[0.1vw]" />
                                            )}
                                        </div>
                                        <span className={`text-[0.7vw] font-semibold tracking-tight ${selectedFrame === frame.id ? 'text-[#5d5efc]' : 'text-gray-500'}`}>
                                            {frame.label}
                                        </span>
                                    </button>
                                ))}
                                {/* Decorative empty spots */}
                                {[1,2,3].map(i => (
                                    <div key={i} className="aspect-square rounded-[1.2vw] bg-gray-100/40 border border-dashed border-gray-200" />
                                ))}
                            </div>
                        </div>

                        {/* Capture Button */}
                        <button 
                            onClick={handleTakeShot}
                            disabled={isCapturing}
                            className="w-full py-[0.75vw] cursor-pointer bg-black text-white rounded-[0.8vw] flex items-center justify-center gap-[1vw] shadow-[0_1.5vw_3vw_-1vw_rgba(0,0,0,0.3)] hover:bg-zinc-800 hover:translate-y-[-2px] active:translate-y-0 active:scale-[0.98] transition-all group disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                        >
                            <div className="w-[2.6vw] h-[2.6vw] rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all border border-white/5 shadow-inner">
                                <Icon icon="solar:camera-outline" width="1.4vw" />
                            </div>
                            <span className="text-[0.9vw] font-semibold tracking-tight">Capture Image for Export</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
