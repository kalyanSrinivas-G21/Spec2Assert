"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";

interface Vertex3D {
  x: number;
  y: number;
  z: number;
}

interface Face {
  indices: [number, number, number];
  baseShade: number; // 0 to 4 to give varied electric blue shades to different facets
}

interface ShapeDefinition {
  name: string;
  tag: string;
  description: string;
  vertices: [number, number, number][];
  faces: [number, number, number][];
}

const PHI = (1 + Math.sqrt(5)) / 2;

// Define 5 distinct high-tech polyhedral geometries
const POLYGON_SHAPES: ShapeDefinition[] = [
  {
    name: "ICOSAHEDRAL_TENSOR",
    tag: "GEODESIC_20F",
    description: "20-Facet Geodesic Neural Polyhedron",
    vertices: [
      [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
      [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
      [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
    ].map(([x, y, z]): [number, number, number] => {
      const len = Math.sqrt(x * x + y * y + z * z);
      return [x / len, y / len, z / len];
    }),
    faces: [
      [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
      [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
      [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
    ],
  },
  {
    name: "STELLATED_OCTAHEDRON",
    tag: "MERKABA_STAR_24F",
    description: "24-Facet Kepler-Poinsot Star Polyhedron",
    vertices: (() => {
      const octV: [number, number, number][] = [
        [1.0, 0.0, 0.0], [-1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0], [0.0, -1.0, 0.0],
        [0.0, 0.0, 1.0], [0.0, 0.0, -1.0],
      ];
      const octF: [number, number, number][] = [
        [0, 2, 4], [2, 1, 4], [1, 3, 4], [3, 0, 4],
        [2, 0, 5], [1, 2, 5], [3, 1, 5], [0, 3, 5],
      ];
      const apexV: [number, number, number][] = octF.map(([a, b, c]): [number, number, number] => {
        const s = 1.45;
        return [
          ((octV[a][0] + octV[b][0] + octV[c][0]) / 3) * s,
          ((octV[a][1] + octV[b][1] + octV[c][1]) / 3) * s,
          ((octV[a][2] + octV[b][2] + octV[c][2]) / 3) * s,
        ];
      });
      return [...octV, ...apexV];
    })(),
    faces: (() => {
      const octF = [
        [0, 2, 4], [2, 1, 4], [1, 3, 4], [3, 0, 4],
        [2, 0, 5], [1, 2, 5], [3, 1, 5], [0, 3, 5],
      ];
      const starF: [number, number, number][] = [];
      octF.forEach((f, i) => {
        const apex = 6 + i;
        starF.push([f[0], f[1], apex], [f[1], f[2], apex], [f[2], f[0], apex]);
      });
      return starF;
    })(),
  },
  {
    name: "HEXAGONAL_DIAMOND",
    tag: "BIPYRAMID_12F",
    description: "12-Facet Crystalline Diamond Bipyramid",
    vertices: (() => {
      const verts: [number, number, number][] = [[0, 1.25, 0], [0, -1.25, 0]];
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        verts.push([Math.cos(ang) * 0.95, 0, Math.sin(ang) * 0.95]);
      }
      return verts;
    })(),
    faces: (() => {
      const f: [number, number, number][] = [];
      for (let i = 0; i < 6; i++) {
        const nxt = (i + 1) % 6;
        f.push([0, 2 + i, 2 + nxt]);
        f.push([1, 2 + nxt, 2 + i]);
      }
      return f;
    })(),
  },
  {
    name: "QUANTUM_OCTAHEDRON",
    tag: "DUAL_PYRAMID_8F",
    description: "8-Facet High-Density Dual Pyramidal Lattice",
    vertices: [
      [1.15, 0, 0], [-1.15, 0, 0],
      [0, 1.15, 0], [0, -1.15, 0],
      [0, 0, 1.15], [0, 0, -1.15],
    ],
    faces: [
      [0, 2, 4], [2, 1, 4], [1, 3, 4], [3, 0, 4],
      [2, 0, 5], [1, 2, 5], [3, 1, 5], [0, 3, 5],
    ],
  },
  {
    name: "CYBER_DODECA_MESH",
    tag: "HYPER_POLYTOPE_24F",
    description: "24-Facet Rhombic Dodecahedral Mesh",
    vertices: [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
      [1.4, 0, 0], [-1.4, 0, 0],
      [0, 1.4, 0], [0, -1.4, 0],
      [0, 0, 1.4], [0, 0, -1.4],
    ].map(([x, y, z]): [number, number, number] => {
      const len = Math.sqrt(x * x + y * y + z * z);
      return [x / len, y / len, z / len];
    }),
    faces: [
      [8, 1, 2], [8, 2, 6], [8, 6, 5], [8, 5, 1],
      [9, 3, 0], [9, 0, 4], [9, 4, 7], [9, 7, 3],
      [10, 2, 3], [10, 3, 7], [10, 7, 6], [10, 6, 2],
      [11, 0, 1], [11, 1, 5], [11, 5, 4], [11, 4, 0],
      [12, 5, 6], [12, 6, 7], [12, 7, 4], [12, 4, 5],
      [13, 2, 1], [13, 1, 0], [13, 0, 3], [13, 3, 2],
    ],
  },
];

// Rich palette of Electric Blue shades
const ELECTRIC_BLUE_SHADES = [
  { fill: "rgba(0, 102, 255, 0.45)", stroke: "#0066FF", glow: "rgba(0, 102, 255, 0.8)" },
  { fill: "rgba(0, 163, 255, 0.55)", stroke: "#00A3FF", glow: "rgba(0, 163, 255, 0.9)" },
  { fill: "rgba(56, 189, 248, 0.65)", stroke: "#38BDF8", glow: "rgba(56, 189, 248, 1.0)" },
  { fill: "rgba(14, 116, 244, 0.40)", stroke: "#0E74F4", glow: "rgba(14, 116, 244, 0.7)" },
  { fill: "rgba(96, 165, 250, 0.50)", stroke: "#60A5FA", glow: "rgba(96, 165, 250, 0.85)" },
  { fill: "rgba(2, 56, 160, 0.60)", stroke: "#0052CC", glow: "rgba(0, 82, 204, 0.75)" },
];

export default function ThinkingPolygon() {
  // Pick a different shape randomly every time component mounts
  const [shapeIndex, setShapeIndex] = useState(0);

  useEffect(() => {
    // Select a random shape index between 0 and POLYGON_SHAPES.length - 1
    const randomIdx = Math.floor(Math.random() * POLYGON_SHAPES.length);
    setShapeIndex(randomIdx);
  }, []);

  const activeShape = POLYGON_SHAPES[shapeIndex];

  // Rotation angles state
  const [angles, setAngles] = useState({ yaw: 0.4, pitch: 0.3, roll: 0.1 });
  const [pulse, setPulse] = useState(1);
  const [activeFacetGlint, setActiveFacetGlint] = useState<number | null>(null);

  // Animation frame loop
  useEffect(() => {
    let animId: number;
    let t = 0;

    const loop = () => {
      t += 0.025;
      setAngles((prev) => ({
        yaw: prev.yaw + 0.018,
        pitch: prev.pitch + 0.012,
        roll: prev.roll + 0.007,
      }));
      setPulse(1 + 0.05 * Math.sin(t * 3));

      // Trigger random facet neural firing glint
      if (Math.random() < 0.15) {
        const randFace = Math.floor(Math.random() * activeShape.faces.length);
        setActiveFacetGlint(randFace);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [activeShape]);

  // Projected 2D coordinates and depth sorted faces
  const { renderedFaces, projectedVertices } = useMemo(() => {
    const { yaw, pitch, roll } = angles;
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cx = Math.cos(pitch);
    const sx = Math.sin(pitch);
    const cr = Math.cos(roll);
    const sr = Math.sin(roll);

    const scaleBase = 85 * pulse;
    const cxCenter = 175;
    const cyCenter = 120;
    const focalLength = 3.5;

    // Rotate and project all vertices
    const rotated = activeShape.vertices.map(([vx, vy, vz]) => {
      // Y-axis rotation (yaw)
      const x1 = vx * cy + vz * sy;
      const z1 = -vx * sy + vz * cy;

      // X-axis rotation (pitch)
      const y2 = vy * cx - z1 * sx;
      const z2 = vy * sx + z1 * cx;

      // Z-axis rotation (roll)
      const x3 = x1 * cr - y2 * sr;
      const y3 = x1 * sr + y2 * cr;

      // Perspective projection
      const depth = focalLength / (focalLength + z2);
      const px = cxCenter + x3 * scaleBase * depth;
      const py = cyCenter + y3 * scaleBase * depth;

      return { x: px, y: py, z: z2 };
    });

    // Light source vector from upper-left front
    const lx = 0.45;
    const ly = -0.65;
    const lz = 0.85;
    const lightLen = Math.sqrt(lx * lx + ly * ly + lz * lz);
    const nlx = lx / lightLen;
    const nly = ly / lightLen;
    const nlz = lz / lightLen;

    // Map each face with Painter's depth sorting
    const facesWithDepth = activeShape.faces.map((indices, fIdx) => {
      const v0 = rotated[indices[0]];
      const v1 = rotated[indices[1]];
      const v2 = rotated[indices[2]];

      const zAvg = (v0.z + v1.z + v2.z) / 3;

      // 2D cross product for face normal z-component (front/back face orientation)
      const ax = v1.x - v0.x;
      const ay = v1.y - v0.y;
      const bx = v2.x - v0.x;
      const by = v2.y - v0.y;
      const normalZ = ax * by - ay * bx;

      // Lighting intensity calculation
      const baseLighting = Math.min(1.0, Math.max(0.15, (normalZ > 0 ? 0.75 : 0.35) + 0.35 * Math.sin(fIdx + angles.yaw)));

      // Select electric blue shade
      const shadeGroup = ELECTRIC_BLUE_SHADES[fIdx % ELECTRIC_BLUE_SHADES.length];
      const isGlinting = activeFacetGlint === fIdx;

      return {
        fIdx,
        indices,
        zAvg,
        points: `${v0.x.toFixed(1)},${v0.y.toFixed(1)} ${v1.x.toFixed(1)},${v1.y.toFixed(1)} ${v2.x.toFixed(1)},${v2.y.toFixed(1)}`,
        fill: isGlinting
          ? "rgba(186, 230, 253, 0.95)" // Neon white-blue neural glint
          : shadeGroup.fill,
        stroke: isGlinting ? "#38BDF8" : shadeGroup.stroke,
        strokeWidth: isGlinting ? 2.0 : 1.0,
        opacity: normalZ > 0 ? 0.92 : 0.45,
        isGlinting,
      };
    });

    // Sort from farthest (lowest z) to closest (highest z)
    facesWithDepth.sort((a, b) => a.zAvg - b.zAvg);

    return {
      renderedFaces: facesWithDepth,
      projectedVertices: rotated,
    };
  }, [angles, pulse, activeShape, activeFacetGlint]);

  const cycleShape = () => {
    setShapeIndex((prev) => (prev + 1) % POLYGON_SHAPES.length);
  };

  return (
    <div className="w-full border border-zinc-900 bg-black/90 p-4 flex flex-col gap-3 relative overflow-hidden select-none">
      {/* Top Telemetry Header for Active AI Geometry */}
      <div className="flex items-center justify-between text-[11px] font-mono border-b border-zinc-900 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 animate-ping inline-block" />
          <span className="text-blue-400 font-bold tracking-wider">{activeShape.name}</span>
          <span className="text-zinc-600">//</span>
          <span className="text-zinc-400 text-[10px]">{activeShape.tag}</span>
        </div>

        <button
          onClick={cycleShape}
          title="Click to cycle thinking topology"
          className="border border-zinc-800 hover:border-blue-500/70 bg-zinc-950 px-2 py-0.5 text-[10px] text-zinc-400 hover:text-blue-400 transition-colors flex items-center gap-1"
        >
          <span>MORPH_TOPOLOGY</span>
          <span className="text-blue-500 font-bold">[{shapeIndex + 1}/{POLYGON_SHAPES.length}]</span>
        </button>
      </div>

      {/* Hero 3D Polygonal Canvas */}
      <div className="relative flex items-center justify-center h-64 w-full overflow-hidden bg-radial from-blue-950/20 via-black to-black">
        {/* Subtle ambient electric blue radial backdrop */}
        <div className="absolute w-72 h-72 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        {/* Outer Rotating Cyber Gyro Rings */}
        <svg className="absolute w-full h-full pointer-events-none" viewBox="0 0 350 240">
          <circle
            cx="175"
            cy="120"
            r="105"
            fill="none"
            stroke="rgba(0, 102, 255, 0.15)"
            strokeWidth="1"
            strokeDasharray="4 6"
            className="animate-[spin_20s_linear_infinite]"
          />
          <circle
            cx="175"
            cy="120"
            r="120"
            fill="none"
            stroke="rgba(56, 189, 248, 0.10)"
            strokeWidth="0.75"
            strokeDasharray="8 8"
            className="animate-[spin_30s_linear_infinite_reverse]"
          />
        </svg>

        {/* 3D Polyhedral SVG Rendering */}
        <svg
          viewBox="0 0 350 240"
          className="w-full h-full relative z-10 drop-shadow-[0_0_20px_rgba(0,102,255,0.35)]"
        >
          {/* Depth-sorted Facets with Electric Blue Shading */}
          <g>
            {renderedFaces.map((f) => (
              <polygon
                key={f.fIdx}
                points={f.points}
                fill={f.fill}
                stroke={f.stroke}
                strokeWidth={f.strokeWidth}
                strokeLinejoin="round"
                opacity={f.opacity}
                className="transition-colors duration-150"
              />
            ))}
          </g>

          {/* Vertex Node Glows */}
          <g>
            {projectedVertices.map((v, i) => {
              if (v.z < -0.2) return null; // Front-facing vertices only for high clarity
              return (
                <circle
                  key={i}
                  cx={v.x}
                  cy={v.y}
                  r={v.z > 0.4 ? 2.5 : 1.5}
                  fill="#38BDF8"
                  className="filter drop-shadow-[0_0_6px_#0066FF]"
                />
              );
            })}
          </g>
        </svg>

        {/* Holographic Scanlines / Corner Reticles */}
        <div className="absolute top-2 left-2 text-[9px] font-mono text-zinc-600">
          DIM_3D: TENSOR_ROT_XYZ
        </div>
        <div className="absolute top-2 right-2 text-[9px] font-mono text-blue-500/80 animate-pulse">
          AI_STATE: COMPUTING_SVA
        </div>
        <div className="absolute bottom-2 left-2 text-[9px] font-mono text-zinc-600">
          SHADES: 6_ELECTRIC_BLUE_CHANNELS
        </div>
        <div className="absolute bottom-2 right-2 text-[9px] font-mono text-zinc-500">
          RESONANCE: {(pulse * 94.8).toFixed(1)}%
        </div>
      </div>

      {/* Sub-text telemetry */}
      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-zinc-900 pt-1.5">
        <span>{activeShape.description}</span>
        <span className="text-blue-400">FPS: 60 // GPU_ACCELERATED</span>
      </div>
    </div>
  );
}

export { ThinkingPolygon };
