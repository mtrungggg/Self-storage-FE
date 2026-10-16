import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

// Register GSAP plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrambleTextPlugin);
}

// Time Display Component
export const TimeDisplay = ({ CONFIG = {} }: { CONFIG?: any }) => {
  const [time, setTime] = useState({ hours: '', minutes: '', dayPeriod: '' });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: CONFIG.timeZone || "Asia/Ho_Chi_Minh",
        hour12: true,
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
      };
      const formatter = new Intl.DateTimeFormat("en-US", options);
      const parts = formatter.formatToParts(now);
      
      setTime({
        hours: parts.find(part => part.type === "hour")?.value || '',
        minutes: parts.find(part => part.type === "minute")?.value || '',
        dayPeriod: parts.find(part => part.type === "dayPeriod")?.value || ''
      });
    };

    updateTime();
    const interval = setInterval(updateTime, CONFIG.timeUpdateInterval || 1000);
    return () => clearInterval(interval);
  }, [CONFIG]);

  return (
    <time className="corner-item bottom-right" id="current-time">
      {time.hours}<span className="time-blink">:</span>{time.minutes} {time.dayPeriod}
    </time>
  );
};

// Project Item Component
export const ProjectItem = ({
  project,
  index,
  onMouseEnter,
  onMouseLeave,
  onClick,
  isActive,
  isIdle,
}: {
  project: any;
  index: number;
  onMouseEnter: (index: number, image?: string) => void;
  onMouseLeave: () => void;
  onClick?: (project: any, index: number) => void;
  isActive: boolean;
  isIdle: boolean;
}) => {
  const itemRef = useRef<HTMLLIElement>(null);
  const textRefs = {
    artist: useRef<HTMLSpanElement>(null),
    album: useRef<HTMLSpanElement>(null),
    category: useRef<HTMLSpanElement>(null),
    label: useRef<HTMLSpanElement>(null),
    year: useRef<HTMLSpanElement>(null),
  };

  useEffect(() => {
    if (isActive) {
      // Animate text scramble on hover
      Object.entries(textRefs).forEach(([key, ref]) => {
        if (ref.current) {
          gsap.killTweensOf(ref.current);
          gsap.to(ref.current, {
            duration: 0.8,
            scrambleText: {
              text: project[key] || '',
              chars: "qwerty1337h@ck3r",
              revealDelay: 0.3,
              speed: 0.4
            }
          });
        }
      });
    } else {
      // Reset text
      Object.entries(textRefs).forEach(([key, ref]) => {
        if (ref.current) {
          gsap.killTweensOf(ref.current);
          ref.current.textContent = project[key] || '';
        }
      });
    }
  }, [isActive, project]);

  return (
    <li 
      ref={itemRef}
      className={`project-item ${isActive ? 'active' : ''} ${isIdle ? 'idle' : ''}`}
      onMouseEnter={() => onMouseEnter(index, project.image)}
      onMouseLeave={onMouseLeave}
      onClick={() => onClick && onClick(project, index)}
      data-image={project.image}
    >
      <span ref={textRefs.artist} className="project-data artist hover-text">
        {project.artist}
      </span>
      <span ref={textRefs.album} className="project-data album hover-text">
        {project.album}
      </span>
      <span ref={textRefs.category} className="project-data category hover-text">
        {project.category}
      </span>
      <span ref={textRefs.label} className="project-data label hover-text">
        {project.label}
      </span>
      <span ref={textRefs.year} className="project-data year hover-text">
        {project.year}
      </span>
      {project.actionButton && (
        <span className="project-data action text-right flex justify-end">
          {project.actionButton}
        </span>
      )}
    </li>
  );
};

// Main Portfolio Component
const MusicPortfolio = ({
  PROJECTS_DATA = [],
  LOCATION = {},
  CALLBACKS = {},
  CONFIG = {},
  SOCIAL_LINKS = {},
  className = "",
  headerLabels,
}: {
  PROJECTS_DATA?: any[];
  LOCATION?: any;
  CALLBACKS?: any;
  CONFIG?: any;
  SOCIAL_LINKS?: any;
  className?: string;
  headerLabels?: { artist?: string; album?: string; category?: string; label?: string; year?: string; action?: string };
}) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isIdle, setIsIdle] = useState(true);
  
  const backgroundRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const idleTimerRef = useRef<any>(null);
  const idleAnimationRef = useRef<any>(null);
  const debounceRef = useRef<any>(null);
  const projectItemsRef = useRef<any[]>([]);

  // Preload images
  useEffect(() => {
    PROJECTS_DATA.forEach((project: any) => {
      if (project.image) {
        const img = new Image();
        img.src = project.image;
      }
    });
  }, [PROJECTS_DATA]);

  // Start idle animation
  const startIdleAnimation = useCallback(() => {
    if (idleAnimationRef.current) return;
    
    const timeline = gsap.timeline({
      repeat: -1,
      repeatDelay: 2
    });
    
    projectItemsRef.current.forEach((item, index) => {
      if (!item) return;
      
      const hideTime = 0 + index * 0.05;
      const showTime = 0 + (PROJECTS_DATA.length * 0.05 * 0.5) + index * 0.05;
      
      timeline.to(item, {
        opacity: 0.15,
        duration: 0.1,
        ease: "power2.inOut"
      }, hideTime);
      
      timeline.to(item, {
        opacity: 1,
        duration: 0.1,
        ease: "power2.inOut"
      }, showTime);
    });
    
    idleAnimationRef.current = timeline;
    if (CALLBACKS.onIdleStart) CALLBACKS.onIdleStart();
  }, [PROJECTS_DATA.length, CALLBACKS]);

  // Stop idle animation
  const stopIdleAnimation = useCallback(() => {
    if (idleAnimationRef.current) {
      idleAnimationRef.current.kill();
      idleAnimationRef.current = null;
      
      projectItemsRef.current.forEach(item => {
        if (item) {
          gsap.set(item, { opacity: 1 });
        }
      });
    }
  }, []);

  // Start idle timer
  const startIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    
    idleTimerRef.current = setTimeout(() => {
      if (activeIndex === -1) {
        setIsIdle(true);
        startIdleAnimation();
      }
    }, CONFIG.idleDelay || 4000);
  }, [activeIndex, startIdleAnimation, CONFIG.idleDelay]);

  // Stop idle timer
  const stopIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  // Handle mouse enter on project
  const handleProjectMouseEnter = useCallback((index: number, imageUrl?: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    stopIdleAnimation();
    stopIdleTimer();
    setIsIdle(false);
    
    if (activeIndex === index) return;
    
    setActiveIndex(index);
    if (CALLBACKS.onProjectHover) CALLBACKS.onProjectHover(PROJECTS_DATA[index]);
    
    if (imageUrl && backgroundRef.current) {
      // Show background with animation
      const bg = backgroundRef.current;
      bg.style.transition = "none";
      bg.style.transform = "translate(-50%, -50%) scale(1.15)";
      bg.style.backgroundImage = `url(${imageUrl})`;
      bg.style.opacity = "1";
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bg.style.transition = "opacity 0.6s ease, transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
          bg.style.transform = "translate(-50%, -50%) scale(1.0)";
        });
      });
    }
  }, [activeIndex, stopIdleAnimation, stopIdleTimer, CALLBACKS, PROJECTS_DATA]);

  // Handle mouse leave on project
  const handleProjectMouseLeave = useCallback(() => {
    debounceRef.current = setTimeout(() => {
      if (CALLBACKS.onProjectLeave) CALLBACKS.onProjectLeave();
    }, 50);
  }, [CALLBACKS]);

  // Handle container mouse leave
  const handleContainerMouseLeave = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    setActiveIndex(-1);
    
    if (backgroundRef.current) {
      backgroundRef.current.style.opacity = "0";
    }
    
    if (CALLBACKS.onContainerLeave) CALLBACKS.onContainerLeave();
    startIdleTimer();
  }, [startIdleTimer, CALLBACKS]);

  // Initial idle animation
  useEffect(() => {
    startIdleTimer();
    return () => {
      stopIdleTimer();
      stopIdleAnimation();
    };
  }, [startIdleTimer, stopIdleTimer, stopIdleAnimation]);

  const handleItemClick = (project: any, index: number) => {
    if (CALLBACKS.onProjectClick) {
      CALLBACKS.onProjectClick(project, index);
    }
  };

  return (
    <div className={`music-portfolio-wrapper ${className}`}>
      <main 
        ref={containerRef}
        className={`portfolio-container ${activeIndex !== -1 ? 'has-active' : ''}`}
        onMouseLeave={handleContainerMouseLeave}
      >
        <h1 className="sr-only">Music Portfolio</h1>

        {headerLabels && (
          <div className="hidden md:grid grid-cols-[130px_1.5fr_120px_1.2fr_110px_90px] gap-4 px-5 pb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 border-b border-white/10 mb-1">
            <span>{headerLabels.artist || "CODE"}</span>
            <span>{headerLabels.album || "TYPE"}</span>
            <span>{headerLabels.category || "STATUS"}</span>
            <span>{headerLabels.label || "INFO"}</span>
            <span className="text-right">{headerLabels.year || "RATE"}</span>
            <span className="text-right">{headerLabels.action || "ACTION"}</span>
          </div>
        )}

        <ul className="project-list" role="list">
          {PROJECTS_DATA.map((project: any, index: number) => (
            <ProjectItem
              key={project.id || index}
              project={project}
              index={index}
              onMouseEnter={handleProjectMouseEnter}
              onMouseLeave={handleProjectMouseLeave}
              onClick={handleItemClick}
              isActive={activeIndex === index}
              isIdle={isIdle}
              ref={(el: any) => (projectItemsRef.current[index] = el)}
            />
          ))}
        </ul>
      </main>

      <div 
        ref={backgroundRef}
        className="background-image" 
        id="backgroundImage" 
        role="img" 
        aria-hidden="true"
      />

      <aside className="corner-elements">
        <div className="corner-item top-left flex items-center gap-2">
          <div className="corner-square" aria-hidden="true"></div>
          <span className="text-[10px] uppercase tracking-wider text-white/50">
            {LOCATION.label || "FACILITY UNITS"}
          </span>
        </div>
        <nav className="corner-item top-right">
          {SOCIAL_LINKS.spotify && (
            <a href={SOCIAL_LINKS.spotify} target="_blank" rel="noopener">
              Spotify
            </a>
          )}
          {SOCIAL_LINKS.email && (
            <>
              {SOCIAL_LINKS.spotify && " | "}
              <a href={SOCIAL_LINKS.email}>Email</a>
            </>
          )}
          {SOCIAL_LINKS.x && (
            <>
              {(SOCIAL_LINKS.spotify || SOCIAL_LINKS.email) && " | "}
              <a href={SOCIAL_LINKS.x} target="_blank" rel="noopener">
                X
              </a>
            </>
          )}
        </nav>
        <div className="corner-item bottom-left">
          {LOCATION.latitude && LOCATION.longitude
            ? `${LOCATION.latitude}, ${LOCATION.longitude}`
            : "10.8231° N, 106.6297° E"}
        </div>
        <TimeDisplay CONFIG={CONFIG} />
      </aside>
    </div>
  );
};

export default MusicPortfolio;
