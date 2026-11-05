import React, { useEffect, useRef } from "react";

export interface ShaderMetalSettings {
  metal?: string;
  color?: string;
  ribbons?: number;
  speed?: number;
  iridescence?: number;
  interactive?: boolean;
}

export interface ShaderMetalProps {
  className?: string;
  style?: React.CSSProperties;
  settings?: ShaderMetalSettings;
}

const DEFAULT_SETTINGS: Required<ShaderMetalSettings> = {
  metal: "chrome",
  color: "#F2F3F5",
  ribbons: 3,
  speed: 0.3,
  iridescence: 0.2,
  interactive: true,
};

const vertexShaderSource = `#version 300 es
precision highp float;
layout(location = 0) in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec3 u_baseColor;
uniform float u_ribbons;
uniform float u_speed;
uniform float u_iridescence;
uniform float u_interactive;

// Smooth cubic polynomial noise
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Surface elevation of liquid metal ribbons
float getSurfaceElevation(vec2 uv, float t, vec2 mouse) {
  vec2 p = uv * 2.0 - 1.0;
  p.x *= u_resolution.x / max(u_resolution.y, 1.0);

  // Mouse repulsion wave
  if (u_interactive > 0.5) {
    vec2 m = mouse * 2.0 - 1.0;
    m.x *= u_resolution.x / max(u_resolution.y, 1.0);
    float dist = length(p - m);
    p += normalize(p - m + 0.0001) * exp(-dist * 3.5) * 0.15;
  }

  float h = 0.0;
  float amplitude = 0.45;
  float frequency = 1.35;
  float ribbonFactor = max(1.0, u_ribbons);

  for (float i = 1.0; i <= 4.0; i += 1.0) {
    if (i > ribbonFactor + 1.0) break;
    float wave = sin(p.x * frequency + t * u_speed * 1.5 + i * 1.57) *
                 cos(p.y * (frequency * 0.8) - t * u_speed * 0.9 + i * 2.1);
    wave += noise(p * (frequency * 1.2) + t * (u_speed * 0.4)) * 0.25;
    h += wave * amplitude;
    amplitude *= 0.55;
    frequency *= 1.85;
  }

  return h;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float t = u_time * u_speed;
  vec2 mouse = u_mouse;

  // Compute surface normals using screen-space finite differences
  float eps = 1.5 / max(u_resolution.y, 1.0);
  float hC = getSurfaceElevation(uv, t, mouse);
  float hR = getSurfaceElevation(uv + vec2(eps, 0.0), t, mouse);
  float hU = getSurfaceElevation(uv + vec2(0.0, eps), t, mouse);

  vec3 normal = normalize(vec3((hC - hR) / eps * 0.35, (hC - hU) / eps * 0.35, 1.0));
  vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));

  // Chrome Fresnel term & light reflections
  float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 3.0);
  vec3 lightDir1 = normalize(vec3(0.45, 0.75, 0.85));
  vec3 lightDir2 = normalize(vec3(-0.55, -0.4, 0.65));

  vec3 refVec = reflect(-viewDir, normal);
  float spec1 = pow(max(0.0, dot(refVec, lightDir1)), 32.0);
  float spec2 = pow(max(0.0, dot(refVec, lightDir2)), 16.0);

  // Iridescence spectrum (subtle thin-film effect)
  vec3 irid = 0.5 + 0.5 * cos(6.28318 * (u_iridescence * 1.2 * normal.z + vec3(0.0, 0.33, 0.67) + t * 0.1));

  // Liquid chrome base gradient
  vec3 chromeColor = u_baseColor;
  vec3 metalHigh = mix(vec3(1.0), irid, u_iridescence * 0.6);
  vec3 metalLow = u_baseColor * 0.88;

  // Composite lighting
  vec3 finalColor = mix(metalLow, chromeColor, clamp(normal.y * 0.5 + 0.5, 0.0, 1.0));
  finalColor = mix(finalColor, metalHigh, fresnel * 0.45);
  finalColor += spec1 * 0.35 * metalHigh + spec2 * 0.2 * vec3(0.95);

  // Soft vignette
  float vignette = 1.0 - dot(uv - 0.5, uv - 0.5) * 0.35;
  finalColor *= vignette;

  fragColor = vec4(finalColor, 1.0);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  let cleanHex = hex.replace("#", "").trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map((c) => c + c).join("");
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return [0.949, 0.953, 0.961]; // #F2F3F5 default
  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (num & 255) / 255,
  ];
}

export const ShaderMetal: React.FC<ShaderMetalProps> = ({
  className = "",
  style = {},
  settings = {},
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mergedSettings = { ...DEFAULT_SETTINGS, ...settings };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    if (!gl) {
      // Graceful fallback for non-WebGL2 environments
      canvas.style.backgroundColor = mergedSettings.color;
      return;
    }

    function createShader(type: number, source: string): WebGLShader | null {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.warn("ShaderMetal compile failed:", gl!.getShaderInfoLog(shader));
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("ShaderMetal link failed:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Fullscreen quad buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uBaseColor = gl.getUniformLocation(program, "u_baseColor");
    const uRibbons = gl.getUniformLocation(program, "u_ribbons");
    const uSpeed = gl.getUniformLocation(program, "u_speed");
    const uIridescence = gl.getUniformLocation(program, "u_iridescence");
    const uInteractive = gl.getUniformLocation(program, "u_interactive");

    const baseColorRgb = hexToRgb(mergedSettings.color);
    if (uBaseColor) gl.uniform3fv(uBaseColor, baseColorRgb);
    if (uRibbons) gl.uniform1f(uRibbons, mergedSettings.ribbons);
    if (uSpeed) gl.uniform1f(uSpeed, mergedSettings.speed);
    if (uIridescence) gl.uniform1f(uIridescence, mergedSettings.iridescence);
    if (uInteractive) gl.uniform1f(uInteractive, mergedSettings.interactive ? 1.0 : 0.0);

    let mouseX = 0.5;
    let mouseY = 0.5;
    let targetMouseX = 0.5;
    let targetMouseY = 0.5;

    function handleMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      targetMouseX = (e.clientX - rect.left) / rect.width;
      targetMouseY = 1.0 - (e.clientY - rect.top) / rect.height;
    }

    if (mergedSettings.interactive) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // cap at 1.5 for performance
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl!.viewport(0, 0, w, h);
      }
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });

    let animationFrameId: number;
    const startTime = performance.now();

    function render(now: number) {
      if (!gl || !canvas) return;

      const elapsed = (now - startTime) * 0.001;

      // Smooth mouse lerp
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      gl.useProgram(program);
      if (uResolution) gl.uniform2f(uResolution, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, elapsed);
      if (uMouse) gl.uniform2f(uMouse, mouseX, mouseY);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (mergedSettings.interactive) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      window.removeEventListener("resize", resize);
      if (gl) {
        gl.deleteBuffer(positionBuffer);
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
      }
    };
  }, [
    mergedSettings.color,
    mergedSettings.ribbons,
    mergedSettings.speed,
    mergedSettings.iridescence,
    mergedSettings.interactive,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full h-full pointer-events-none ${className}`}
      style={style}
    />
  );
};

export default ShaderMetal;
