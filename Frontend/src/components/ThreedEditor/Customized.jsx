import React, { useState } from "react";
import { Icon } from "@iconify/react";

// --- Reusable UI Components (Matched to PreDefined.jsx) ---

const Accordion = ({ title, icon: iconName, children, isOpen, onToggle, iconSize = "1.04vw" }) => {
  return (
    <div className="bg-white rounded-[0.75vw] shadow-sm border border-gray-100 overflow-hidden mb-[0.75vw] transition-all duration-200 hover:shadow-md">
      <div
        className={`flex items-center justify-between px-[1vw] py-[0.85vw] bg-white cursor-pointer select-none transition-colors duration-200 ${
          isOpen ? "border-b border-gray-100" : ""
        }`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-[0.75vw] text-gray-800 font-semibold text-[0.85vw]">
          {iconName && <Icon icon={iconName} width={iconSize} height={iconSize} className="text-gray-500" />}
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-[0.75vw] text-gray-400">
          <button
            className="hover:text-[#5d5efc] hover:bg-indigo-50 p-[0.25vw] rounded-[0.35vw] transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
           <Icon icon="ix:reset" width="0.85vw" height="0.85vw" />
          </button>
          <Icon
            icon="heroicons:chevron-down"
            className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            width="0.85vw"
            height="0.85vw"
          />
        </div>
      </div>

      <div
        className={`bg-white transition-[max-height] duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-[1.25vw] pt-[0.5vw]">{children}</div>
      </div>
    </div>
  );
};

const SectionHeader = ({ label, showLine = true }) => (
  <div className="flex items-center gap-[0.75vw] mb-[1vw] mt-[0.5vw]">
    <span className="text-[0.8vw] font-semibold text-gray-900 whitespace-nowrap">
      {label}
    </span>
    {showLine && <div className="h-[0.05vw] bg-gray-100 w-full flex-1"></div>}
  </div>
);

const CustomSlider = ({ label, value, onChange, unit = "%" }) => {
  return (
    <div className="flex items-center justify-between mb-[1.25vw] last:mb-0 h-[1.75vw]">
      <div className="w-[6vw] text-[0.75vw] font-medium text-gray-600 shrink-0 flex items-center justify-between pr-[0.5vw]">
        {label} <span>:</span>
      </div>
      <div className="relative flex-1 h-[0.4vw] bg-gray-100 rounded-full cursor-pointer group touch-none">
        {/* Fill */}
        <div
          className="absolute top-0 left-0 h-full bg-[#5d5efc] rounded-full transition-all duration-75"
          style={{ width: `${value}%` }}
        ></div>
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-[0.9vw] h-[0.9vw] bg-[#5d5efc] border-[0.15vw] border-white rounded-full shadow-md hover:scale-110 transition-transform duration-100"
          style={{ left: `${value}%`, marginLeft: "-0.45vw" }}
        ></div>
        {/* Input Range (Hidden overlay for functionality) */}
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
        />
      </div>
      <div className="w-[2.5vw] text-right text-[0.62vw] font-medium text-gray-500 tabular-nums">
        {value} <span className="text-[0.75vw] ml-[0.15vw] text-gray-400">{unit}</span>
      </div>
    </div>
  );
};

// Adapted StackedSliderBox to match new sizing
const StackedSliderBox = ({ label, val, onChange, children }) => (
  <div className="mb-[1.5vw]">
    <div className="text-[0.68vw] font-medium text-gray-600 mb-[0.75vw] flex items-center justify-between">
      {label} :
    </div>
    <div className="flex items-center gap-[1vw]">
      {/* Reusing CustomSlider logic but horizontal layout inside flex */}
      <div className="relative flex-1 h-[0.4vw] bg-gray-100 rounded-full cursor-pointer group touch-none">
        <div
          className="absolute top-0 left-0 h-full bg-[#5d5efc] rounded-full transition-all duration-75"
          style={{ width: `${val}%` }}
        ></div>
        <div
          className="absolute top-1/2 -translate-y-1/2 w-[0.9vw] h-[0.9vw] bg-[#5d5efc] border-[0.15vw] border-white rounded-full shadow-md hover:scale-110 transition-transform duration-100"
          style={{ left: `${val}%`, marginLeft: "-0.45vw" }}
        ></div>
        <input
          type="range"
          min="0"
          max="100"
          value={val}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
        />
      </div>
      {/* Value Display */}
      <div className="w-[2.5vw] text-right text-[0.62vw] font-medium text-gray-500 tabular-nums">
        {val} <span className="text-[0.52vw] ml-[0.15vw] text-gray-400">%</span>
      </div>
      {/* Extra Child (Box/Image) */}
      {children}
    </div>
  </div>
);


const NumberStepper = ({ label, value, axisLabel, compact }) => {
  return (
    <div
      className={`flex items-center ${
        label ? "justify-between" : "justify-center"
      } ${compact ? "gap-[0.25vw]" : "gap-[0.5vw] mb-[0.75vw]"}`}
    >
      {label && (
        <div className={`font-medium text-gray-600 ${compact ? "text-[0.65vw] w-[6vw]" : "text-[0.68vw] w-[6vw]"}`}>
           {label} :
        </div>
      )}

      <div className={`flex items-center ${compact ? "gap-[0.25vw]" : "gap-[0.5vw]"}`}>
        {axisLabel && (
          <span className={`${compact ? "text-[0.65vw] w-[0.75vw]" : "text-[0.58vw]"} text-gray-500 uppercase text-center font-bold`}>
            {axisLabel}:
          </span>
        )}
        <button 
          className={`text-gray-400 hover:text-[#5d5efc] transition-colors ${compact ? "" : "p-[0.15vw] hover:bg-indigo-50 rounded"}`}
        >
          <Icon
            icon="heroicons:chevron-left"
            width={compact ? "0.65vw" : "0.85vw"}
            height={compact ? "0.65vw" : "0.85vw"}
          />
        </button>
        <div
          className={`${
            compact ? "px-[0.4vw] py-[0.15vw] min-w-[1.65vw] text-[0.6vw] rounded" : "px-[0.75vw] py-[0.4vw] min-w-[2.3vw] text-[0.65vw] rounded-[0.35vw]"
          } border border-gray-200 text-gray-700 font-semibold text-center bg-white shadow-sm hover:border-[#5d5efc] transition-colors`}
        >
          {value}
        </div>
        <button 
          className={`text-gray-400 hover:text-[#5d5efc] transition-colors ${compact ? "" : "p-[0.15vw] hover:bg-indigo-50 rounded"}`}
        >
          <Icon
            icon="heroicons:chevron-right"
            width={compact ? "0.65vw" : "0.85vw"}
            height={compact ? "0.65vw" : "0.85vw"}
          />
        </button>
      </div>
    </div>
  );
};

export default function Customized() {
  const [openPanel, setOpenPanel] = useState("factor"); // "factor", "position", or "lightning"

  const handlePanelToggle = (panelName) => {
    setOpenPanel(openPanel === panelName ? null : panelName);
  };

  const [pos, setPos] = useState({ x: 210, y: 210, z: 210 });
  const [lightPos, setLightPos] = useState({ x: 210, y: 210, z: 210 });
  const [factors, setFactors] = useState({
    alpha: 35,
    metallic: 35,
    roughness: 35,
    normalMap: 35,
    bump: 35,
    scale: 35,
    rotation: 35,
    specular: 35,
    reflection: 35,
    shadow: 35,
    softness: 35,
    ao: 35,
  });

  // --- ACTIONS ---
  const updateFactor = (key, val) =>
    setFactors((prev) => ({ ...prev, [key]: val }));
  const updatePos = (axis, delta) =>
    setPos((prev) => ({ ...prev, [axis]: prev[axis] + delta }));
  const updateLightPos = (axis, delta) =>
    setLightPos((prev) => ({ ...prev, [axis]: prev[axis] + delta }));

  return (
    <div className="flex flex-col gap-[0.25vw] pb-[2.5vw]">
      {/* --- FACTOR ADJUSTMENT COMPONENT --- */}
      <Accordion
        title="Factor Adjustment"
        icon="icon-park-outline:texture-two"
        isOpen={openPanel === "factor"}
        onToggle={() => handlePanelToggle("factor")}
      >
        <div className="space-y-[1.5vw]">
            {/* Color & Transparency Section */}
            <div>
                <SectionHeader label="Color & Transparency" />
                <div className="flex items-center justify-between mb-[1.25vw] mt-[1vw]">
                    <span className="text-[0.75vw] font-medium text-gray-600 w-[6vw]">
                    Factor :
                    </span>
                    <div className="flex items-center gap-[0.65vw] flex-1">
                    <div className="w-[2vw] h-[2vw] bg-black rounded-[0.35vw] border border-gray-200 shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-tr from-white/10 to-transparent"></div>
                    </div>
                    <div className="flex-1 flex items-center justify-between border border-gray-200 rounded-[0.35vw] px-[0.75vw] py-[0.4vw] bg-white shadow-sm">
                        <span className="text-[0.65vw] text-gray-600 font-medium tracking-wide font-mono">#000000</span>
                        <span className="text-[0.65vw] text-gray-400 font-medium">100%</span>
                    </div>
                    </div>
                </div>

                <CustomSlider
                    label="Alpha Blend"
                    value={factors.alpha}
                    onChange={(v) => updateFactor("alpha", v)}
                />
            </div>

            {/* Surface Finish Section */}
            <div>
                <SectionHeader label="Surface Finish" />
                <div className="space-y-[0.5vw]">
                    <StackedSliderBox
                        label="Metallic"
                        val={factors.metallic}
                        onChange={(v) => updateFactor("metallic", v)}
                    >
                        <div className="w-[2.25vw] h-[2.25vw] bg-gray-50 rounded-[0.25vw] border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors shrink-0 text-gray-400">
                        <Icon icon="heroicons:arrow-up-tray" width="0.85vw" height="0.85vw" />
                        </div>
                    </StackedSliderBox>

                    <StackedSliderBox
                        label="Roughness"
                        val={factors.roughness}
                        onChange={(v) => updateFactor("roughness", v)}
                    >
                        <div className="w-[2.25vw] h-[2.25vw] rounded-[0.25vw] border border-gray-200 overflow-hidden shrink-0">
                        <img
                            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%238b6f47' width='100' height='100'/%3E%3Cline x1='0' y1='0' x2='100' y2='100' stroke='%23704d1f' stroke-width='2'/%3E%3Cline x1='100' y1='0' x2='0' y2='100' stroke='%23704d1f' stroke-width='2'/%3E%3C/svg%3E"
                            alt="roughness"
                            className="w-full h-full object-cover"
                        />
                        </div>
                    </StackedSliderBox>
                </div>
            </div>

            {/* Surface Detail Section */}
            <div>
                <SectionHeader label="Surface Detail" />
                <div className="space-y-[0.5vw]">
                    <StackedSliderBox
                        label="Normal Map"
                        val={factors.normalMap}
                        onChange={(v) => updateFactor("normalMap", v)}
                    >
                        <div className="w-[2.25vw] h-[2.25vw] rounded-[0.25vw] border border-gray-200 overflow-hidden shrink-0">
                        <img
                            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%238b6f47' width='100' height='100'/%3E%3C/svg%3E"
                            alt="normal"
                            className="w-full h-full object-cover"
                        />
                        </div>
                    </StackedSliderBox>

                    <StackedSliderBox
                        label="Bump"
                        val={factors.bump}
                        onChange={(v) => updateFactor("bump", v)}
                    >
                        <div className="w-[2.25vw] h-[2.25vw] rounded-[0.25vw] border border-gray-200 overflow-hidden shrink-0">
                        <img
                            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%238b6f47' width='100' height='100'/%3E%3C/svg%3E"
                            alt="bump"
                            className="w-full h-full object-cover"
                        />
                        </div>
                    </StackedSliderBox>
                </div>
            </div>

            {/* Texture Placement Section */}
            <div>
                <SectionHeader label="Texture Placement" />
                <div className="space-y-[0.25vw]">
                    <CustomSlider
                        label="Scale"
                        value={factors.scale}
                        onChange={(v) => updateFactor("scale", v)}
                    />
                    <CustomSlider
                        label="Rotation"
                        value={factors.rotation}
                        onChange={(v) => updateFactor("rotation", v)}
                    />
                </div>

                <div className="flex items-center justify-between mt-[1.5vw]">
                    <span className="text-[0.65vw] font-medium text-gray-600 w-[6vw]">
                        Offset :
                    </span>
                    <div className="flex gap-[0.35vw] flex-1 justify-end">
                        <NumberStepper value={pos.x} axisLabel="X" compact />
                        <NumberStepper value={pos.y} axisLabel="Y" compact />
                    </div>
                </div>
            </div>
        </div>
      </Accordion>

      {/* 2. Position Section (Updated) */}
      <Accordion
        title="Model Position"
        icon="hugeicons:3d-move"
        iconSize="1.25vw"
        isOpen={openPanel === "position"}
        onToggle={() => handlePanelToggle("position")}
      >
        <div className="flex flex-col gap-[0.25vw] pb-[0.5vw]">
           {/* Move Row */}
           <div className="flex items-end justify-between py-[0.5vw] px-[0.25vw]">
              <span className="text-[0.75vw] font-medium text-gray-600 w-[3.5vw] mb-[0.25vw]">Move :</span>
              <div className="flex gap-[0.5vw]">
                 {["X", "Y", "Z"].map((axis) => (
                    <div key={axis} className="flex flex-col items-center gap-[0.35vw]">
                       <span className="text-[0.6vw] font-semibold text-gray-400 uppercase">{axis}</span>
                       <NumberStepper value={210} compact />
                    </div>
                 ))}
              </div>
           </div>

           {/* Rotate Row - with subtle background */}
           <div className="flex items-end justify-between py-[0.5vw] px-[0.25vw] bg-gray-50 rounded-[0.5vw]">
              <span className="text-[0.75vw] font-medium text-gray-600 w-[3.5vw] mb-[0.25vw]">Rotate :</span>
              <div className="flex gap-[0.5vw]">
                 {["X", "Y", "Z"].map((axis) => (
                    <div key={axis} className="flex flex-col items-center gap-[0.35vw]">
                       <span className="text-[0.6vw] font-semibold text-gray-400 uppercase">{axis}</span>
                       <NumberStepper value={210} compact />
                    </div>
                 ))}
              </div>
           </div>

           {/* Scale Row */}
           <div className="flex items-end justify-between py-[0.5vw] px-[0.25vw]">
              <span className="text-[0.75vw] font-medium text-gray-600 w-[3.5vw] mb-[0.25vw]">Scale :</span>
              <div className="flex gap-[0.5vw]">
                 {["X", "Y", "Z"].map((axis) => (
                    <div key={axis} className="flex flex-col items-center gap-[0.35vw]">
                       <span className="text-[0.6vw] font-semibold text-gray-400 uppercase">{axis}</span>
                       <NumberStepper value={210} compact />
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </Accordion>

      {/* --- LIGHTNING CONTROLS --- */}
      <Accordion
        title="Lightning Controls"
        icon="ix:light-dark"
        isOpen={openPanel === "lightning"}
        onToggle={() => handlePanelToggle("lightning")}
      >
        {/* Visual Preview Box */}
        <div className="relative bg-[#f8fafc] h-[9.375vw] rounded-[0.5vw] border border-gray-100 mb-[1.5vw] flex flex-col items-center justify-center shadow-inner overflow-hidden group">
            <div className="absolute top-[1vw] left-[1vw] text-amber-400 drop-shadow-sm">
            <Icon icon="heroicons:sun" width="1.25vw" height="1.25vw" />
            </div>
            <div className="flex flex-col items-center text-gray-300 group-hover:text-gray-400 transition-colors">
            <Icon icon="heroicons:cube" width="2.08vw" height="2.08vw" className="stroke-1" />
            <span className="text-[0.58vw] mt-[0.5vw] font-medium tracking-wide uppercase">Model Preview</span>
            </div>
            <div className="absolute inset-0 bg-linear-to-br from-white/60 via-transparent to-indigo-50/10 pointer-events-none"></div>
        </div>

        <div className="flex justify-center gap-[0.5vw] mb-[2vw]">
            <NumberStepper value={lightPos.x} axisLabel="X" compact />
            <NumberStepper value={lightPos.y} axisLabel="Y" compact />
            <NumberStepper value={lightPos.z} axisLabel="Z" compact />
        </div>

        <div className="space-y-[1.5vw]">
            <div>
                <SectionHeader label="Lighting & Reflection" />
                <div className="space-y-[0.25vw]">
                    <CustomSlider
                        label="Specular"
                        value={factors.specular}
                        onChange={(v) => updateFactor("specular", v)}
                    />
                    <CustomSlider
                        label="Reflection"
                        value={factors.reflection}
                        onChange={(v) => updateFactor("reflection", v)}
                    />
                </div>
            </div>

            <div>
                <SectionHeader label="Adjust Shadow" />
                <div className="space-y-[0.25vw]">
                    <CustomSlider
                        label="Shadow"
                        value={factors.shadow}
                        onChange={(v) => updateFactor("shadow", v)}
                    />
                    <CustomSlider
                        label="Softness"
                        value={factors.softness}
                        onChange={(v) => updateFactor("softness", v)}
                    />
                    <CustomSlider
                        label="AO"
                        value={factors.ao}
                        onChange={(v) => updateFactor("ao", v)}
                    />
                </div>
            </div>
        </div>
      </Accordion>
    </div>
  );
}
