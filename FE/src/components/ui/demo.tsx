import MusicPortfolio from "@/components/ui/music-portfolio";

export default function DemoOne() {
  const projectsData = [
    {
      id: 1,
      artist: "YOUNG BROKE & LONELY",
      album: "LONELY BOY",
      category: "SINGLE",
      label: "SELF RELEASED",
      year: "2024",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: 2,
      artist: "YOUNG BROKE & LONELY",
      album: "IN YOUR MEMORY",
      category: "SINGLE",
      label: "SELF RELEASED",
      year: "2024",
      image: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: 3,
      artist: "YOUNG BROKE & LONELY",
      album: "WHO AM I?",
      category: "SINGLE",
      label: "SELF RELEASED",
      year: "2023",
      image: "https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: 4,
      artist: "YOUNG BROKE & LONELY",
      album: "SINGLE MOM",
      category: "SINGLE",
      label: "SELF RELEASED",
      year: "2023",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: 5,
      artist: "YOUNG BROKE & LONELY",
      album: "GHOST",
      category: "SINGLE",
      label: "SELF RELEASED",
      year: "2023",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: 6,
      artist: "YOUNG BROKE & LONELY",
      album: "DIFFICULTY",
      category: "SINGLE",
      label: "SELF RELEASED",
      year: "2022",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
    },
  ];

  const config = {
    timeZone: "America/New_York",
    timeUpdateInterval: 1000,
    idleDelay: 4000,
    debounceDelay: 100
  };

  const socialLinks = {
    spotify: "https://spotify.com/user/demo",
    email: "mailto:demo@filip.fyi",
    x: "https://x.com/demo"
  };

  const location = {
    latitude: "40.7128° N",
    longitude: "74.0060° W",
    display: true
  };

  const callbacks = {
    onProjectHover: (project: any) => console.log('Hovering:', project),
    onProjectLeave: () => console.log('Left project'),
    onContainerLeave: () => console.log('Left container'),
    onIdleStart: () => console.log('Idle animation started'),
    onThemeChange: (theme: any) => console.log(`Theme changed to: ${theme}`)
  };

  return (
    <MusicPortfolio
      PROJECTS_DATA={projectsData}
      CONFIG={config}
      SOCIAL_LINKS={socialLinks}
      LOCATION={location}
      CALLBACKS={callbacks}
    />
  );
}
