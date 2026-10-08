import React, { useEffect, useRef } from 'react';

declare const gsap: any;
declare const THREE: any;

export interface SlideItem {
  id?: string | number;
  title: string;
  description: string;
  media: string;
}

export interface LuminaInteractiveListProps {
  slides?: SlideItem[];
  initialIndex?: number;
  onSlideChange?: (index: number, slide: SlideItem) => void;
  className?: string;
  autoSlide?: boolean;
}

const DEFAULT_SLIDES: SlideItem[] = [
  {
    title: "Primary Unit HN-101",
    description: "Cau Giay Smart Facility · Level 1 Direct Access · Keypad PIN Active",
    media: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Unit 2 A-101",
    description: "Thu Duc Central Hub · Ground Floor High Security Bay · Climate Controlled",
    media: "https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Unit 3 A-106",
    description: "Thu Duc Ground Floor · Medium Smart Unit · Digital PIN Keypad",
    media: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Unit 4 A-110",
    description: "Thu Duc Facility · Large Drive-up Storage Bay · Smart Lockers",
    media: "https://images.unsplash.com/photo-1549194388-f61be84a6e9e?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Unit 5 A-102",
    description: "Thu Duc Facility · Mezzanine Floor Automated Lock · 24/7 Monitored",
    media: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Unit 6 A-103",
    description: "Thu Duc Facility · Premium Vault Space · Multi-factor Access",
    media: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
  }
];

export function Component({
  slides = DEFAULT_SLIDES,
  initialIndex = 0,
  onSlideChange,
  className = "",
  autoSlide = true,
}: LuminaInteractiveListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onSlideChangeRef = useRef(onSlideChange);
  onSlideChangeRef.current = onSlideChange;

  useEffect(() => {
    let isDisposed = false;
    let animFrameId: number | null = null;
    let autoSlideTimer: any = null;
    let progressAnimation: any = null;

    // --- DYNAMIC SCRIPT LOADING ---
    const loadScripts = async () => {
      const loadScript = (src: string, globalName: string) =>
        new Promise<void>((res, rej) => {
          if ((window as any)[globalName]) {
            res();
            return;
          }
          if (document.querySelector(`script[src="${src}"]`)) {
            const check = setInterval(() => {
              if ((window as any)[globalName]) {
                clearInterval(check);
                res();
              }
            }, 50);
            setTimeout(() => {
              clearInterval(check);
              rej(new Error(`Timeout waiting for ${globalName}`));
            }, 10000);
            return;
          }
          const s = document.createElement('script');
          s.src = src;
          s.onload = () => {
            setTimeout(() => res(), 100);
          };
          s.onerror = () => rej(new Error(`Failed to load ${src}`));
          document.head.appendChild(s);
        });

      try {
        await loadScript(
          'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
          'gsap'
        );
        await loadScript(
          'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
          'THREE'
        );
      } catch (e) {
        console.error('Failed to load base scripts:', e);
      }

      if (!isDisposed) {
        initApplication();
      }
    };

    const initApplication = async () => {
      if (!containerRef.current || isDisposed) return;
      const root = containerRef.current;

      const SLIDER_CONFIG: any = {
        settings: {
          transitionDuration: 1.8,
          autoSlideSpeed: 6000,
          currentEffect: "glass",
          currentEffectPreset: "Default",
          globalIntensity: 1.0,
          speedMultiplier: 1.0,
          distortionStrength: 1.0,
          colorEnhancement: 1.0,
          glassRefractionStrength: 1.0,
          glassChromaticAberration: 1.0,
          glassBubbleClarity: 1.0,
          glassEdgeGlow: 1.0,
          glassLiquidFlow: 1.0,
          frostIntensity: 1.5,
          frostCrystalSize: 1.0,
          frostIceCoverage: 1.0,
          frostTemperature: 1.0,
          frostTexture: 1.0,
          rippleFrequency: 25.0,
          rippleAmplitude: 0.08,
          rippleWaveSpeed: 1.0,
          rippleRippleCount: 1.0,
          rippleDecay: 1.0,
          plasmaIntensity: 1.2,
          plasmaSpeed: 0.8,
          plasmaEnergyIntensity: 0.4,
          plasmaContrastBoost: 0.3,
          plasmaTurbulence: 1.0,
          timeshiftDistortion: 1.6,
          timeshiftBlur: 1.5,
          timeshiftFlow: 1.4,
          timeshiftChromatic: 1.5,
          timeshiftTurbulence: 1.4,
        },
      };

      // --- GLOBAL STATE ---
      let currentSlideIndex = Math.min(initialIndex, slides.length - 1);
      let isTransitioning = false;
      let shaderMaterial: any, renderer: any, scene: any, camera: any;
      let slideTextures: any[] = [];
      let texturesLoaded = false;
      let sliderEnabled = false;

      const SLIDE_DURATION = () => SLIDER_CONFIG.settings.autoSlideSpeed;
      const PROGRESS_UPDATE_INTERVAL = 50;
      const TRANSITION_DURATION = () => SLIDER_CONFIG.settings.transitionDuration;

      // --- SHADERS ---
      const vertexShader = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
      const fragmentShader = `
          uniform sampler2D uTexture1, uTexture2;
          uniform float uProgress;
          uniform vec2 uResolution, uTexture1Size, uTexture2Size;
          uniform int uEffectType;
          uniform float uGlobalIntensity, uSpeedMultiplier, uDistortionStrength, uColorEnhancement;
          uniform float uGlassRefractionStrength, uGlassChromaticAberration, uGlassBubbleClarity, uGlassEdgeGlow, uGlassLiquidFlow;
          uniform float uFrostIntensity, uFrostCrystalSize, uFrostIceCoverage, uFrostTemperature, uFrostTexture;
          uniform float uRippleFrequency, uRippleAmplitude, uRippleWaveSpeed, uRippleRippleCount, uRippleDecay;
          uniform float uPlasmaIntensity, uPlasmaSpeed, uPlasmaEnergyIntensity, uPlasmaContrastBoost, uPlasmaTurbulence;
          uniform float uTimeshiftDistortion, uTimeshiftBlur, uTimeshiftFlow, uTimeshiftChromatic, uTimeshiftTurbulence;
          varying vec2 vUv;

          vec2 getCoverUV(vec2 uv, vec2 textureSize) {
              vec2 s = uResolution / textureSize;
              float scale = max(s.x, s.y);
              vec2 scaledSize = textureSize * scale;
              vec2 offset = (uResolution - scaledSize) * 0.5;
              return (uv * uResolution - offset) / scaledSize;
          }
          
          vec4 glassEffect(vec2 uv, float progress) {
              float time = progress * 5.0 * uSpeedMultiplier;
              vec2 uv1 = getCoverUV(uv, uTexture1Size); vec2 uv2 = getCoverUV(uv, uTexture2Size);
              float maxR = length(uResolution) * 0.85; float br = progress * maxR;
              vec2 p = uv * uResolution; vec2 c = uResolution * 0.5;
              float d = length(p - c); float nd = d / max(br, 0.001);
              float param = smoothstep(br + 3.0, br - 3.0, d);
              vec4 img;
              if (param > 0.0) {
                    float ro = 0.08 * uGlassRefractionStrength * uDistortionStrength * uGlobalIntensity * pow(smoothstep(0.3 * uGlassBubbleClarity, 1.0, nd), 1.5);
                    vec2 dir = (d > 0.0) ? (p - c) / d : vec2(0.0);
                    vec2 distUV = uv2 - dir * ro;
                    distUV += vec2(sin(time + nd * 10.0), cos(time * 0.8 + nd * 8.0)) * 0.015 * uGlassLiquidFlow * uSpeedMultiplier * nd * param;
                    float ca = 0.02 * uGlassChromaticAberration * uGlobalIntensity * pow(smoothstep(0.3, 1.0, nd), 1.2);
                    img = vec4(texture2D(uTexture2, distUV + dir * ca * 1.2).r, texture2D(uTexture2, distUV + dir * ca * 0.2).g, texture2D(uTexture2, distUV - dir * ca * 0.8).b, 1.0);
                    if (uGlassEdgeGlow > 0.0) {
                      float rim = smoothstep(0.95, 1.0, nd) * (1.0 - smoothstep(1.0, 1.01, nd));
                      img.rgb += rim * 0.08 * uGlassEdgeGlow * uGlobalIntensity;
                    }
              } else { img = texture2D(uTexture2, uv2); }
              vec4 oldImg = texture2D(uTexture1, uv1);
              if (progress > 0.95) img = mix(img, texture2D(uTexture2, uv2), (progress - 0.95) / 0.05);
              return mix(oldImg, img, param);
          }

          void main() {
              gl_FragColor = glassEffect(vUv, uProgress);
          }
      `;

      const updateShaderUniforms = () => {
        if (!shaderMaterial) return;
        const s = SLIDER_CONFIG.settings,
          u = shaderMaterial.uniforms;
        for (const key in s) {
          const uName = 'u' + key.charAt(0).toUpperCase() + key.slice(1);
          if (u[uName]) u[uName].value = s[key];
        }
        u.uEffectType.value = 0;
      };

      const splitText = (text: string) => {
        return text
          .split('')
          .map(
            (char) =>
              `<span style="display: inline-block; opacity: 0;">${
                char === ' ' ? '&nbsp;' : char
              }</span>`
          )
          .join('');
      };

      const updateContent = (idx: number) => {
        if (!slides[idx]) return;
        const titleEl = root.querySelector('#mainTitle') as HTMLElement;
        const descEl = root.querySelector('#mainDesc') as HTMLElement;
        if (titleEl && descEl && typeof gsap !== 'undefined') {
          gsap.to(titleEl.children, {
            y: -15,
            opacity: 0,
            duration: 0.35,
            stagger: 0.015,
            ease: 'power2.in',
          });
          gsap.to(descEl, { y: -10, opacity: 0, duration: 0.3, ease: 'power2.in' });

          setTimeout(() => {
            if (isDisposed || !slides[idx]) return;
            titleEl.innerHTML = splitText(slides[idx].title);
            descEl.textContent = slides[idx].description;

            gsap.set(titleEl.children, { y: 15, opacity: 0 });
            gsap.set(descEl, { y: 15, opacity: 0 });

            gsap.to(titleEl.children, {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.02,
              ease: 'power3.out',
            });
            gsap.to(descEl, {
              y: 0,
              opacity: 1,
              duration: 0.6,
              delay: 0.15,
              ease: 'power3.out',
            });
          }, 350);
        }
      };

      const navigateToSlide = (targetIndex: number) => {
        if (isTransitioning || targetIndex === currentSlideIndex || !slides[targetIndex]) return;
        stopAutoSlideTimer();
        quickResetProgress(currentSlideIndex);

        const currentTexture = slideTextures[currentSlideIndex];
        const targetTexture = slideTextures[targetIndex];
        if (!currentTexture || !targetTexture) return;

        isTransitioning = true;
        shaderMaterial.uniforms.uTexture1.value = currentTexture;
        shaderMaterial.uniforms.uTexture2.value = targetTexture;
        shaderMaterial.uniforms.uTexture1Size.value = currentTexture.userData.size;
        shaderMaterial.uniforms.uTexture2Size.value = targetTexture.userData.size;

        updateContent(targetIndex);

        currentSlideIndex = targetIndex;
        updateCounter(currentSlideIndex);
        updateNavigationState(currentSlideIndex);

        if (onSlideChangeRef.current) {
          onSlideChangeRef.current(targetIndex, slides[targetIndex]);
        }

        if (typeof gsap !== 'undefined') {
          gsap.fromTo(
            shaderMaterial.uniforms.uProgress,
            { value: 0 },
            {
              value: 1,
              duration: TRANSITION_DURATION(),
              ease: 'power2.inOut',
              onComplete: () => {
                shaderMaterial.uniforms.uProgress.value = 0;
                shaderMaterial.uniforms.uTexture1.value = targetTexture;
                shaderMaterial.uniforms.uTexture1Size.value = targetTexture.userData.size;
                isTransitioning = false;
                if (autoSlide) safeStartTimer(100);
              },
            }
          );
        }
      };

      const handleSlideChange = () => {
        if (isTransitioning || !texturesLoaded || !sliderEnabled) return;
        navigateToSlide((currentSlideIndex + 1) % slides.length);
      };

      const createSlidesNavigation = () => {
        const nav = root.querySelector('#slidesNav');
        if (!nav) return;
        nav.innerHTML = '';
        slides.forEach((slide, i) => {
          const item = document.createElement('div');
          item.className = `slide-nav-item${i === currentSlideIndex ? ' active' : ''}`;
          item.dataset.slideIndex = String(i);
          item.innerHTML = `<div class="slide-progress-line"><div class="slide-progress-fill"></div></div><div class="slide-nav-title">${slide.title}</div>`;
          item.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isTransitioning && i !== currentSlideIndex) {
              stopAutoSlideTimer();
              quickResetProgress(currentSlideIndex);
              navigateToSlide(i);
            }
          });
          nav.appendChild(item);
        });
      };

      const updateNavigationState = (idx: number) => {
        root.querySelectorAll('.slide-nav-item').forEach((el, i) => {
          el.classList.toggle('active', i === idx);
        });
      };

      const updateSlideProgress = (idx: number, prog: number) => {
        const el = root.querySelectorAll('.slide-nav-item')[idx]?.querySelector('.slide-progress-fill') as HTMLElement;
        if (el) {
          el.style.width = `${prog}%`;
          el.style.opacity = '1';
        }
      };

      const fadeSlideProgress = (idx: number) => {
        const el = root.querySelectorAll('.slide-nav-item')[idx]?.querySelector('.slide-progress-fill') as HTMLElement;
        if (el) {
          el.style.opacity = '0';
          setTimeout(() => {
            if (el) el.style.width = '0%';
          }, 300);
        }
      };

      const quickResetProgress = (idx: number) => {
        const el = root.querySelectorAll('.slide-nav-item')[idx]?.querySelector('.slide-progress-fill') as HTMLElement;
        if (el) {
          el.style.transition = 'width 0.2s ease-out';
          el.style.width = '0%';
          setTimeout(() => {
            if (el) el.style.transition = 'width 0.1s ease, opacity 0.3s ease';
          }, 200);
        }
      };

      const updateCounter = (idx: number) => {
        const sn = root.querySelector('#slideNumber');
        if (sn) sn.textContent = String(idx + 1).padStart(2, '0');
        const st = root.querySelector('#slideTotal');
        if (st) st.textContent = String(slides.length).padStart(2, '0');
      };

      const startAutoSlideTimer = () => {
        if (!texturesLoaded || !sliderEnabled || !autoSlide) return;
        stopAutoSlideTimer();
        let progress = 0;
        const increment = (100 / SLIDE_DURATION()) * PROGRESS_UPDATE_INTERVAL;
        progressAnimation = setInterval(() => {
          if (!sliderEnabled || isDisposed) {
            stopAutoSlideTimer();
            return;
          }
          progress += increment;
          updateSlideProgress(currentSlideIndex, progress);
          if (progress >= 100) {
            clearInterval(progressAnimation);
            progressAnimation = null;
            fadeSlideProgress(currentSlideIndex);
            if (!isTransitioning) handleSlideChange();
          }
        }, PROGRESS_UPDATE_INTERVAL);
      };

      const stopAutoSlideTimer = () => {
        if (progressAnimation) clearInterval(progressAnimation);
        if (autoSlideTimer) clearTimeout(autoSlideTimer);
        progressAnimation = null;
        autoSlideTimer = null;
      };

      const safeStartTimer = (delay = 0) => {
        stopAutoSlideTimer();
        if (sliderEnabled && texturesLoaded && autoSlide) {
          if (delay > 0) autoSlideTimer = setTimeout(startAutoSlideTimer, delay);
          else startAutoSlideTimer();
        }
      };

      const createFallbackTexture = (label = '') => {
        const c = document.createElement('canvas');
        c.width = 1200;
        c.height = 800;
        const ctx = c.getContext('2d');
        if (ctx) {
          const grad = ctx.createLinearGradient(0, 0, 1200, 800);
          grad.addColorStop(0, '#0f243d');
          grad.addColorStop(1, '#081321');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 1200, 800);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 44px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label || 'Storage Unit', 600, 400);
        }
        const texture = new THREE.CanvasTexture(c);
        texture.minFilter = texture.magFilter = THREE.LinearFilter;
        texture.userData = {
          size: new THREE.Vector2(1200, 800),
        };
        return texture;
      };

      const loadImageTexture = (src: string, fallbackLabel = '') =>
        new Promise<any>((resolve) => {
          if (typeof THREE === 'undefined') {
            resolve(createFallbackTexture(fallbackLabel));
            return;
          }
          if (!src) {
            resolve(createFallbackTexture(fallbackLabel));
            return;
          }
          const l = new THREE.TextureLoader();
          l.setCrossOrigin('anonymous');
          l.load(
            src,
            (t: any) => {
              t.minFilter = t.magFilter = THREE.LinearFilter;
              t.userData = {
                size: new THREE.Vector2(t.image?.width || 1200, t.image?.height || 800),
              };
              resolve(t);
            },
            undefined,
            () => {
              resolve(createFallbackTexture(fallbackLabel));
            }
          );
        });

      const initRenderer = async () => {
        const canvas = root.querySelector('.webgl-canvas') as HTMLCanvasElement;
        if (!canvas || typeof THREE === 'undefined') return;

        const width = root.clientWidth || window.innerWidth;
        const height = root.clientHeight || 440;

        scene = new THREE.Scene();
        camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        shaderMaterial = new THREE.ShaderMaterial({
          uniforms: {
            uTexture1: { value: null },
            uTexture2: { value: null },
            uProgress: { value: 0 },
            uResolution: { value: new THREE.Vector2(width, height) },
            uTexture1Size: { value: new THREE.Vector2(1, 1) },
            uTexture2Size: { value: new THREE.Vector2(1, 1) },
            uEffectType: { value: 0 },
            uGlobalIntensity: { value: 1.0 },
            uSpeedMultiplier: { value: 1.0 },
            uDistortionStrength: { value: 1.0 },
            uColorEnhancement: { value: 1.0 },
            uGlassRefractionStrength: { value: 1.0 },
            uGlassChromaticAberration: { value: 1.0 },
            uGlassBubbleClarity: { value: 1.0 },
            uGlassEdgeGlow: { value: 1.0 },
            uGlassLiquidFlow: { value: 1.0 },
          },
          vertexShader,
          fragmentShader,
        });
        scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shaderMaterial));

        for (const s of slides) {
          try {
            slideTextures.push(await loadImageTexture(s.media, s.title));
          } catch {
            slideTextures.push(createFallbackTexture(s.title));
          }
        }

        if (slideTextures.length >= 2 && !isDisposed) {
          const nextIdx = (currentSlideIndex + 1) % slideTextures.length;
          shaderMaterial.uniforms.uTexture1.value = slideTextures[currentSlideIndex];
          shaderMaterial.uniforms.uTexture2.value = slideTextures[nextIdx];
          shaderMaterial.uniforms.uTexture1Size.value = slideTextures[currentSlideIndex].userData.size;
          shaderMaterial.uniforms.uTexture2Size.value = slideTextures[nextIdx].userData.size;
          texturesLoaded = true;
          sliderEnabled = true;
          updateShaderUniforms();
          root.classList.add('loaded');
          if (autoSlide) safeStartTimer(500);
        }

        const render = () => {
          if (isDisposed) return;
          animFrameId = requestAnimationFrame(render);
          if (renderer && scene && camera) {
            renderer.render(scene, camera);
          }
        };
        render();
      };

      createSlidesNavigation();
      updateCounter(currentSlideIndex);

      const tEl = root.querySelector('#mainTitle');
      const dEl = root.querySelector('#mainDesc');
      if (tEl && dEl && slides[currentSlideIndex]) {
        tEl.innerHTML = splitText(slides[currentSlideIndex].title);
        dEl.textContent = slides[currentSlideIndex].description;
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(
            tEl.children,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.02, ease: 'power3.out', delay: 0.3 }
          );
          gsap.fromTo(
            dEl,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.5 }
          );
        }
      }

      await initRenderer();

      const handleResize = () => {
        if (renderer && shaderMaterial && root) {
          const w = root.clientWidth || window.innerWidth;
          const h = root.clientHeight || 440;
          renderer.setSize(w, h);
          shaderMaterial.uniforms.uResolution.value.set(w, h);
        }
      };

      const handleVisibilityChange = () => {
        if (document.hidden) stopAutoSlideTimer();
        else if (!isTransitioning && autoSlide) safeStartTimer();
      };

      window.addEventListener('resize', handleResize);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        stopAutoSlideTimer();
        if (animFrameId) cancelAnimationFrame(animFrameId);
        if (renderer) {
          renderer.dispose();
        }
      };
    };

    loadScripts();

    return () => {
      isDisposed = true;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (autoSlideTimer) clearTimeout(autoSlideTimer);
      if (progressAnimation) clearInterval(progressAnimation);
    };
  }, [slides, autoSlide]);

  return (
    <main className={`slider-wrapper ${className}`} ref={containerRef}>
      <canvas className="webgl-canvas"></canvas>
      <span className="slide-number" id="slideNumber">
        01
      </span>
      <span className="slide-total" id="slideTotal">
        06
      </span>

      <div className="slide-content">
        <h1 className="slide-title" id="mainTitle"></h1>
        <p className="slide-description" id="mainDesc"></p>
      </div>

      <nav className="slides-navigation" id="slidesNav"></nav>
    </main>
  );
}

export default Component;
