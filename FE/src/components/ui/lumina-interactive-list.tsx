import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

// Ensure global objects are populated for dynamic scripts
if (typeof window !== 'undefined') {
  (window as any).THREE = THREE;
  (window as any).gsap = gsap;
}

export interface SlideItem {
  id?: string | number;
  unitCode?: string;
  title: string;
  description: string;
  facilityName?: string;
  badge?: string;
  media: string;
}

export interface LuminaInteractiveListProps {
  slides?: SlideItem[];
  initialIndex?: number;
  onSlideChange?: (index: number, slide: SlideItem) => void;
  className?: string;
  autoSlide?: boolean;
}

function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return !!(gl && typeof (gl as any).getParameter === 'function');
  } catch (e) {
    return false;
  }
}

export function Component({
  slides = [],
  initialIndex = 0,
  onSlideChange,
  className = "",
  autoSlide = false,
}: LuminaInteractiveListProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onSlideChangeRef = useRef(onSlideChange);
  onSlideChangeRef.current = onSlideChange;
  const navigateToSlideRef = useRef<((idx: number) => void) | null>(null);

  // Sync external index changes (e.g. from unit selector dropdown or URL)
  useEffect(() => {
    if (
      navigateToSlideRef.current &&
      typeof initialIndex === 'number' &&
      initialIndex >= 0
    ) {
      navigateToSlideRef.current(initialIndex);
    }
  }, [initialIndex]);

  useEffect(() => {
    let isDisposed = false;
    let animFrameId: number | null = null;
    let cleanupListeners: (() => void) | null = null;
    let activeTween: any = null;

    // --- SCRIPT LOADING ---
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
        if (!(window as any).gsap) {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js', 'gsap');
        }
        if (!(window as any).THREE) {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'THREE');
        }
      } catch (e) {
        (window as any).THREE = THREE;
        (window as any).gsap = gsap;
      }

      initApplication();
    };

    const initApplication = async () => {
      if (!containerRef.current || isDisposed) return;
      const root = containerRef.current;
      const effectiveSlides = slides || [];
      if (effectiveSlides.length === 0) return;

      const TRANSITION_DURATION = 1.3;

      // --- STATE ---
      let currentSlideIndex = Math.min(Math.max(0, initialIndex), effectiveSlides.length - 1);
      let isTransitioning = false;

      const splitText = (text: string) => {
        return text
          .split('')
          .map(
            (char) =>
              `<span style="display: inline-block; opacity: 0;">${char === ' ' ? '&nbsp;' : char}</span>`
          )
          .join('');
      };

      // --- 6 TYPOGRAPHY ANIMATION STYLES PER SLIDE ---
      const updateContent = (idx: number) => {
        const titleEl = root.querySelector('#mainTitle') as HTMLElement;
        const descEl = root.querySelector('#mainDesc') as HTMLElement;
        const g = (window as any).gsap || gsap;

        if (titleEl && descEl && g) {
          // Animate out previous text
          g.to(titleEl.children, { y: -20, opacity: 0, duration: 0.35, stagger: 0.015, ease: "power2.in" });
          g.to(descEl, { y: -10, opacity: 0, duration: 0.25, ease: "power2.in" });

          setTimeout(() => {
            if (isDisposed) return;
            titleEl.innerHTML = splitText(effectiveSlides[idx].title);
            descEl.textContent = effectiveSlides[idx].description;

            g.set(titleEl.children, { opacity: 0 });
            g.set(descEl, { y: 20, opacity: 0 });

            const children = titleEl.children;
            switch (idx % 6) {
              case 0: // Stagger Up
                g.set(children, { y: 20 });
                g.to(children, { y: 0, opacity: 1, duration: 0.7, stagger: 0.025, ease: "power3.out" });
                g.to(descEl, { y: 0, opacity: 1, duration: 0.7, delay: 0.15, ease: "power3.out" });
                break;
              case 1: // Stagger Down
                g.set(children, { y: -20 });
                g.to(children, { y: 0, opacity: 1, duration: 0.7, stagger: 0.025, ease: "back.out(1.7)" });
                g.to(descEl, { y: 0, opacity: 1, duration: 0.7, delay: 0.15, ease: "power3.out" });
                break;
              case 2: // Blur Reveal
                g.set(children, { filter: "blur(8px)", scale: 1.3, y: 0 });
                g.to(children, {
                  filter: "blur(0px)",
                  scale: 1,
                  opacity: 1,
                  duration: 0.8,
                  stagger: { amount: 0.4, from: "random" },
                  ease: "power2.out",
                });
                g.to(descEl, { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power2.out" });
                break;
              case 3: // Scale In
                g.set(children, { scale: 0, y: 0 });
                g.to(children, { scale: 1, opacity: 1, duration: 0.55, stagger: 0.04, ease: "back.out(1.5)" });
                g.to(descEl, { y: 0, opacity: 1, duration: 0.7, delay: 0.15, ease: "power3.out" });
                break;
              case 4: // Rotate X (Flip)
                g.set(children, { rotationX: 90, y: 0, transformOrigin: "50% 50%" });
                g.to(children, { rotationX: 0, opacity: 1, duration: 0.7, stagger: 0.035, ease: "power2.out" });
                g.to(descEl, { y: 0, opacity: 1, duration: 0.7, delay: 0.15, ease: "power2.out" });
                break;
              case 5: // Side Reveal
                g.set(children, { x: 26, y: 0 });
                g.to(children, { x: 0, opacity: 1, duration: 0.7, stagger: 0.025, ease: "power3.out" });
                g.to(descEl, { y: 0, opacity: 1, duration: 0.7, delay: 0.15, ease: "power3.out" });
                break;
              default:
                g.set(children, { y: 20 });
                g.to(children, { y: 0, opacity: 1, duration: 0.7, stagger: 0.025, ease: "power3.out" });
                g.to(descEl, { y: 0, opacity: 1, duration: 0.7, delay: 0.15, ease: "power3.out" });
            }
          }, 350);
        }
      };

      const updateNavigationState = (idx: number) => {
        root.querySelectorAll(".slide-nav-item").forEach((el, i) =>
          el.classList.toggle("active", i === idx)
        );
      };

      const updateCounter = (idx: number) => {
        const sn = root.querySelector("#slideNumber");
        if (sn) sn.textContent = String(idx + 1).padStart(2, "0");
        const st = root.querySelector("#slideTotal");
        if (st) st.textContent = String(effectiveSlides.length).padStart(2, "0");
      };

      let navigateToSlide = (targetIndex: number) => {};

      // Navigation Bar with user unit cards (Thumbnail + Unit Code + Facility)
      const createSlidesNavigation = () => {
        const nav = root.querySelector("#slidesNav");
        if (!nav) return;
        nav.innerHTML = "";
        effectiveSlides.forEach((slide, i) => {
          const item = document.createElement("button");
          item.type = "button";
          item.className = `slide-nav-item${i === currentSlideIndex ? " active" : ""}`;
          item.dataset.slideIndex = String(i);
          item.innerHTML = `
            <div class="slide-nav-thumb-wrap">
              <img src="${slide.media}" alt="${slide.title}" class="slide-nav-thumb" />
            </div>
            <div class="slide-nav-info">
              <div class="slide-nav-title">${slide.title}</div>
              <div class="slide-nav-sub">${slide.facilityName || 'Storage Unit'}</div>
            </div>
          `;
          item.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isTransitioning && i !== currentSlideIndex) {
              navigateToSlide(i);
            }
          });
          nav.appendChild(item);
        });
      };

      const canvas = root.querySelector(".webgl-canvas") as HTMLCanvasElement;
      if (!canvas || isDisposed) return;

      // Try WebGL first, fallback to 2D Canvas if unavailable or disabled
      let canUseWebGL = false;
      let renderer: any, scene: any, camera: any, shaderMaterial: any;
      let slideTextures: any[] = [];

      try {
        if (isWebGLAvailable()) {
          const w = root.clientWidth || window.innerWidth;
          const h = root.clientHeight && root.clientHeight > 50 ? root.clientHeight : 440;
          renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
          renderer.setSize(w, h);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          scene = new THREE.Scene();
          camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
          canUseWebGL = true;
        }
      } catch (err) {
        canUseWebGL = false;
        console.warn("WebGL not available or context creation failed; using high-performance 2D Canvas engine:", err);
      }

      if (canUseWebGL && renderer && scene && camera) {
        // =========================================================
        // PATH A: WebGL Shader Pipeline (Active when WebGL is available)
        // =========================================================
        const vertexShader = `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `;

        const fragmentShader = `
          uniform sampler2D uTexture1, uTexture2;
          uniform float uProgress;
          uniform vec2 uResolution, uTexture1Size, uTexture2Size;
          varying vec2 vUv;

          vec2 getCoverUV(vec2 uv, vec2 textureSize) {
            vec2 s = uResolution / textureSize;
            float scale = max(s.x, s.y);
            vec2 scaledSize = textureSize * scale;
            vec2 offset = (uResolution - scaledSize) * 0.5;
            return (uv * uResolution - offset) / scaledSize;
          }

          vec4 glassEffect(vec2 uv, float progress) {
            float time = progress * 4.0;
            vec2 uv1 = getCoverUV(uv, uTexture1Size);
            vec2 uv2 = getCoverUV(uv, uTexture2Size);
            float maxR = length(uResolution) * 0.85;
            float br = progress * maxR;
            vec2 p = uv * uResolution;
            vec2 c = uResolution * 0.5;
            float d = length(p - c);
            float nd = d / max(br, 0.001);

            // Valid smoothstep (edge0 < edge1)
            float param = 1.0 - smoothstep(br - 16.0, br + 16.0, d);
            vec4 img;
            if (param > 0.0) {
              float ro = 0.07 * pow(smoothstep(0.2, 1.0, nd), 1.4);
              vec2 dir = (d > 0.0) ? (p - c) / d : vec2(0.0);
              vec2 distUV = uv2 - dir * ro;
              distUV += vec2(sin(time + nd * 8.0), cos(time * 0.8 + nd * 7.0)) * 0.012 * nd * param;
              float ca = 0.018 * pow(smoothstep(0.2, 1.0, nd), 1.2);
              img = vec4(
                texture2D(uTexture2, distUV + dir * ca * 1.2).r,
                texture2D(uTexture2, distUV + dir * ca * 0.2).g,
                texture2D(uTexture2, distUV - dir * ca * 0.8).b,
                1.0
              );
              float rim = smoothstep(0.92, 1.0, nd) * (1.0 - smoothstep(1.0, 1.02, nd));
              img.rgb += rim * 0.16;
            } else {
              img = texture2D(uTexture2, uv2);
            }
            vec4 oldImg = texture2D(uTexture1, uv1);
            if (progress > 0.95) img = mix(img, texture2D(uTexture2, uv2), (progress - 0.95) / 0.05);
            return mix(oldImg, img, param);
          }

          void main() {
            gl_FragColor = glassEffect(vUv, uProgress);
          }
        `;

        try {
          const w = root.clientWidth || window.innerWidth;
          const h = root.clientHeight && root.clientHeight > 50 ? root.clientHeight : 440;

          shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
              uTexture1: { value: null },
              uTexture2: { value: null },
              uProgress: { value: 0 },
              uResolution: { value: new THREE.Vector2(w, h) },
              uTexture1Size: { value: new THREE.Vector2(1200, 800) },
              uTexture2Size: { value: new THREE.Vector2(1200, 800) },
            },
            vertexShader,
            fragmentShader,
          });

          scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shaderMaterial));

          const loader = new THREE.TextureLoader();
          loader.setCrossOrigin('anonymous');

          const loadTex = (src: string, fallbackTitle: string) =>
            new Promise<any>((res) => {
              loader.load(
                src,
                (t: any) => {
                  t.minFilter = t.magFilter = THREE.LinearFilter;
                  t.userData = { size: new THREE.Vector2(t.image?.width || 1200, t.image?.height || 800) };
                  res(t);
                },
                undefined,
                () => {
                  // Resilient fallback canvas texture
                  const c = document.createElement('canvas');
                  c.width = 1200;
                  c.height = 800;
                  const ct = c.getContext('2d');
                  if (ct) {
                    const g = ct.createLinearGradient(0, 0, 1200, 800);
                    g.addColorStop(0, '#091322');
                    g.addColorStop(0.5, '#152948');
                    g.addColorStop(1, '#060d19');
                    ct.fillStyle = g;
                    ct.fillRect(0, 0, 1200, 800);
                    ct.fillStyle = '#ffffff';
                    ct.font = 'bold 36px sans-serif';
                    ct.textAlign = 'center';
                    ct.fillText(fallbackTitle || 'Storage Unit', 600, 400);
                  }
                  const ft = new THREE.CanvasTexture(c);
                  ft.userData = { size: new THREE.Vector2(1200, 800) };
                  res(ft);
                }
              );
            });

          for (const s of effectiveSlides) {
            slideTextures.push(await loadTex(s.media, s.title));
          }

          if (slideTextures.length > 0 && !isDisposed) {
            const nextIdx = (currentSlideIndex + 1) % slideTextures.length;
            shaderMaterial.uniforms.uTexture1.value = slideTextures[currentSlideIndex];
            shaderMaterial.uniforms.uTexture2.value = slideTextures[nextIdx] || slideTextures[currentSlideIndex];
            shaderMaterial.uniforms.uTexture1Size.value = slideTextures[currentSlideIndex].userData.size;
            shaderMaterial.uniforms.uTexture2Size.value = (slideTextures[nextIdx] || slideTextures[currentSlideIndex]).userData.size;
            root.classList.add("loaded");
          }

          const render = () => {
            if (isDisposed) return;
            animFrameId = requestAnimationFrame(render);
            if (renderer && scene && camera) renderer.render(scene, camera);
          };
          render();

          navigateToSlide = (targetIndex: number) => {
            if (isTransitioning || targetIndex === currentSlideIndex) return;

            const curr = slideTextures[currentSlideIndex];
            const next = slideTextures[targetIndex];
            if (!curr || !next || !shaderMaterial) return;

            isTransitioning = true;
            shaderMaterial.uniforms.uTexture1.value = curr;
            shaderMaterial.uniforms.uTexture2.value = next;
            shaderMaterial.uniforms.uTexture1Size.value = curr.userData.size;
            shaderMaterial.uniforms.uTexture2Size.value = next.userData.size;

            updateContent(targetIndex);
            currentSlideIndex = targetIndex;
            updateCounter(currentSlideIndex);
            updateNavigationState(currentSlideIndex);

            if (onSlideChangeRef.current) {
              onSlideChangeRef.current(currentSlideIndex, effectiveSlides[currentSlideIndex]);
            }

            const g = (window as any).gsap || gsap;
            g.fromTo(
              shaderMaterial.uniforms.uProgress,
              { value: 0 },
              {
                value: 1,
                duration: TRANSITION_DURATION,
                ease: "power2.inOut",
                onComplete: () => {
                  if (isDisposed || !shaderMaterial) return;
                  shaderMaterial.uniforms.uProgress.value = 0;
                  shaderMaterial.uniforms.uTexture1.value = next;
                  shaderMaterial.uniforms.uTexture1Size.value = next.userData.size;
                  isTransitioning = false;
                },
              }
            );
          };

          navigateToSlideRef.current = navigateToSlide;

          const onResize = () => {
            if (!renderer || !shaderMaterial) return;
            const w = root.clientWidth || window.innerWidth;
            const h = root.clientHeight && root.clientHeight > 50 ? root.clientHeight : 440;
            renderer.setSize(w, h);
            shaderMaterial.uniforms.uResolution.value.set(w, h);
          };

          window.addEventListener("resize", onResize);
          const ro = new ResizeObserver(() => onResize());
          ro.observe(root);

          cleanupListeners = () => {
            window.removeEventListener("resize", onResize);
            ro.disconnect();
            if (renderer) renderer.dispose();
          };
        } catch (e) {
          console.warn("WebGL initialization encountered an error:", e);
        }
      } else {
        // =========================================================
        // PATH B: High-Performance 2D Canvas Engine (100% Reliable & Smooth)
        // =========================================================
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const loadedImages: (HTMLImageElement | null)[] = effectiveSlides.map(() => null);

        const drawCover = (img: HTMLImageElement, w: number, h: number, scale = 1.0) => {
          const nw = img.naturalWidth || 1200;
          const nh = img.naturalHeight || 800;
          const ratio = Math.max(w / nw, h / nh) * scale;
          const ox = (w - nw * ratio) * 0.5;
          const oy = (h - nh * ratio) * 0.5;
          ctx.drawImage(img, 0, 0, nw, nh, ox, oy, nw * ratio, nh * ratio);
        };

        const drawFallback = (title: string, w: number, h: number) => {
          const grad = ctx.createLinearGradient(0, 0, w, h);
          grad.addColorStop(0, '#091322');
          grad.addColorStop(0.5, '#152948');
          grad.addColorStop(1, '#060d19');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          for (let x = 0; x < w; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
          }
          for (let y = 0; y < h; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
          }
        };

        let currentProgress = 0;
        let transitioningFromIndex = currentSlideIndex;
        let transitioningToIndex = currentSlideIndex;

        const render2D = () => {
          if (isDisposed) return;
          const w = root.clientWidth || window.innerWidth;
          const h = root.clientHeight && root.clientHeight > 50 ? root.clientHeight : 440;
          const dpr = Math.min(window.devicePixelRatio || 1, 2);

          if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
          }

          ctx.save();
          ctx.scale(dpr, dpr);
          ctx.clearRect(0, 0, w, h);

          const fromImg = loadedImages[transitioningFromIndex];
          const toImg = loadedImages[transitioningToIndex];

          // 1. Draw base slide
          if (fromImg && fromImg.complete && fromImg.naturalWidth > 0) {
            drawCover(fromImg, w, h, 1.0);
          } else {
            drawFallback(effectiveSlides[transitioningFromIndex].title, w, h);
          }

          // 2. If transitioning, draw expanding circular reveal with ripple
          if (isTransitioning && currentProgress > 0) {
            const maxRadius = Math.sqrt(w * w + h * h) * 0.85;
            const currentR = currentProgress * maxRadius;

            ctx.save();
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, currentR, 0, Math.PI * 2);
            ctx.clip();

            if (toImg && toImg.complete && toImg.naturalWidth > 0) {
              const zoom = 1.08 - currentProgress * 0.08;
              drawCover(toImg, w, h, zoom);
            } else {
              drawFallback(effectiveSlides[transitioningToIndex].title, w, h);
            }

            // Glass boundary ring with glow
            if (currentProgress < 0.98) {
              const ringAlpha = Math.sin(currentProgress * Math.PI) * 0.7;
              ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha})`;
              ctx.lineWidth = 4;
              ctx.stroke();

              ctx.strokeStyle = `rgba(29, 95, 229, ${ringAlpha * 0.6})`;
              ctx.lineWidth = 8;
              ctx.stroke();
            }

            ctx.restore();
          }

          // Vignette overlay
          const vignette = ctx.createLinearGradient(0, h * 0.35, 0, h);
          vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
          vignette.addColorStop(0.7, 'rgba(0, 0, 0, 0.45)');
          vignette.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
          ctx.fillStyle = vignette;
          ctx.fillRect(0, 0, w, h);

          ctx.restore();
        };

        effectiveSlides.forEach((slide, idx) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = slide.media;
          img.onload = () => {
            loadedImages[idx] = img;
            if (idx === currentSlideIndex) render2D();
          };
          img.onerror = () => {
            const imgFallback = new Image();
            imgFallback.src = slide.media;
            imgFallback.onload = () => {
              loadedImages[idx] = imgFallback;
              if (idx === currentSlideIndex) render2D();
            };
          };
        });

        render2D();

        navigateToSlide = (targetIndex: number) => {
          if (isTransitioning || targetIndex === currentSlideIndex) return;

          isTransitioning = true;
          transitioningFromIndex = currentSlideIndex;
          transitioningToIndex = targetIndex;
          currentProgress = 0;

          updateContent(targetIndex);
          updateCounter(targetIndex);
          updateNavigationState(targetIndex);

          if (onSlideChangeRef.current) {
            onSlideChangeRef.current(targetIndex, effectiveSlides[targetIndex]);
          }

          const g = (window as any).gsap || gsap;
          const progState = { p: 0 };
          activeTween = g.to(progState, {
            p: 1,
            duration: TRANSITION_DURATION,
            ease: "power2.inOut",
            onUpdate: () => {
              currentProgress = progState.p;
              render2D();
            },
            onComplete: () => {
              currentSlideIndex = targetIndex;
              transitioningFromIndex = targetIndex;
              currentProgress = 0;
              isTransitioning = false;
              render2D();
            },
          });
        };

        navigateToSlideRef.current = navigateToSlide;

        const onResize = () => render2D();
        window.addEventListener("resize", onResize);
        const ro = new ResizeObserver(() => render2D());
        ro.observe(root);

        cleanupListeners = () => {
          window.removeEventListener("resize", onResize);
          ro.disconnect();
          if (activeTween) activeTween.kill();
        };

        root.classList.add("loaded");
      }

      createSlidesNavigation();
      updateCounter(currentSlideIndex);

      // Initial text content & animation
      const tEl = root.querySelector('#mainTitle') as HTMLElement;
      const dEl = root.querySelector('#mainDesc') as HTMLElement;
      if (tEl && dEl) {
        tEl.innerHTML = splitText(effectiveSlides[currentSlideIndex].title);
        dEl.textContent = effectiveSlides[currentSlideIndex].description;
        const g = (window as any).gsap || gsap;
        g.fromTo(tEl.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.025, ease: "power3.out", delay: 0.3 });
        g.fromTo(dEl, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.5 });
      }
    };

    loadScripts();

    return () => {
      isDisposed = true;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (activeTween) activeTween.kill();
      if (cleanupListeners) cleanupListeners();
    };
  }, [slides]);

  return (
    <main className={`slider-wrapper ${className}`} ref={containerRef}>
      <canvas className="webgl-canvas"></canvas>
      <span className="slide-number" id="slideNumber">01</span>
      <span className="slide-total" id="slideTotal">
        {String(slides?.length || 0).padStart(2, "0")}
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
export { Component as LuminaInteractiveList };
