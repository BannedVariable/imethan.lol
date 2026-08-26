import { type ReactNode, useEffect, useState, useRef } from 'react';
import {
  Check,
  Code2,
  Copy,
  ExternalLink,
  GitBranch,
  GitFork,
  Github,
  Globe2,
  Home,
  Mail,
  MessageCircle,
  Send,
  Star,
  Terminal,
} from 'lucide-react';
import {
  Link,
  Route,
  Router as WouterRouter,
  Switch,
  useLocation,
} from 'wouter';

const assetPath = (filename: string) => {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}images/${filename}`;
};

// Type definitions
type DiscordPresence = {
  username: string;
  displayName: string;
  avatar: string;
  banner?: string;
  status: string;
  activities: any[];
};

type SteamProfile = {
  personaname: string;
  steamid: string;
  profileurl: string;
  avatar: string;
  avatarfull: string;
  personastate: number;
  gameextrainfo?: string;
};

async function fetchDiscordPresence(): Promise<DiscordPresence | null> {
  try {
    const response = await fetch('https://api.lanyard.rest/v1/users/1482184416879972505');
    if (!response.ok) throw new Error('Failed to fetch Discord presence');
    
    const data = await response.json();
    
    if (!data.success || !data.data) return null;
    
    const { discord_user, status, activities } = data.data;
    
    console.log('Discord user data:', discord_user);
    
    // Build avatar URL
    const avatarUrl = discord_user.avatar 
      ? `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.webp?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(discord_user.id) % 6}.png`;
    
    return {
      username: discord_user.username,
      displayName: discord_user.display_name || discord_user.username,
      avatar: avatarUrl,
      banner: undefined,
      status: status || 'offline',
      activities: activities || [],
    };
  } catch (error) {
    console.error('Error fetching Discord presence:', error);
    return null;
  }
}

function useDiscordPresence() {
  const [presence, setPresence] = useState<DiscordPresence | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPresence = async () => {
      setLoading(true);
      const data = await fetchDiscordPresence();
      setPresence(data);
      setLoading(false);
    };

    fetchPresence();
    const interval = setInterval(fetchPresence, 30000);
    return () => clearInterval(interval);
  }, []);

  return { presence, loading };
}

async function fetchSteamProfile(): Promise<SteamProfile | null> {
  try {
    const encodedUrl = encodeURIComponent('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=467FD5D3FDD4485E6CF352E86027C13B&steamids=76561199048843282&format=json');
    const response = await fetch(`https://api.allorigins.win/raw?url=${encodedUrl}`);
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    console.log('Steam profile data:', data.response.players[0]);
    return data.response.players[0] || null;
  } catch (error) {
    console.error('Error fetching Steam profile:', error);
    return null;
  }
}

type LinkButtonProps = {
  href: string;
  icon: ReactNode;
  lowerText: string;
  upperText?: string;
  testId: string;
};

function LinkButton({
  href,
  icon,
  lowerText,
  upperText,
  testId,
}: LinkButtonProps) {
  return (
    <a
      className="link-button"
      href={href}
      target="_blank"
      rel="noreferrer"
      data-testid={testId}
    >
      <span className="link-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="link-text-container">
        <span className="link-text-upper">{upperText}</span>
        <span className="link-text-lower">{lowerText}</span>
      </span>
    </a>
  );
}

function PageTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return null;
}

function Navbar() {
  const [location] = useLocation();
  const links = [
    { name: 'home', href: '/', exact: true },
    { name: 'about', href: '/about' },
    { name: 'projects', href: '/projects' },
  ];

  return (
    <nav className="navbar" aria-label="Primary navigation" data-testid="nav-primary">
      <Link
        href="/"
        className="navbar-brand"
        data-testid="link-brand"
        aria-label="imethan.lol home"
      >
        imethan.lol
      </Link>
      <div className="navbar-links">
        {links.map((item) => {
          const active = item.exact
            ? location === item.href
            : location.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={active ? 'navbar-link navbar-link-active' : 'navbar-link'}
              data-testid={`link-nav-${item.name}`}
              aria-current={active ? 'page' : undefined}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer" data-testid="footer">
    </footer>
  );
}

function DiscordCard() {
  const { presence, loading } = useDiscordPresence();

  if (loading || !presence) {
    return (
      <a
        className="discord-card"
        href="https://discord.com/users/1081551899397992509"
        target="_blank"
        rel="noreferrer"
        data-testid="link-discord-profile"
      >
        <img
          className="discord-card-banner"
          src={assetPath('discord-banner.png')}
          alt=""
          data-testid="img-discord-banner"
        />
        <MessageCircle
          className="discord-card-icon"
          size={20}
          aria-hidden="true"
        />
        <div className="discord-card-avatar-wrapper">
          <img
            className="discord-card-avatar"
            src={assetPath('discord-avatar.png')}
            alt="avatar"
            data-testid="img-discord-avatar"
          />
          <span className="discord-status" aria-label="offline" />
        </div>
        <div className="discord-card-content">
          <div className="discord-card-name" data-testid="text-discord-name">
            Loading...
          </div>
          <div className="discord-card-username" data-testid="text-discord-username">
            @bannedvariable
          </div>
        </div>
      </a>
    );
  }

  return (
    <a
      className="discord-card"
      href="https://discord.com/users/1482184416879972505"
      target="_blank"
      rel="noreferrer"
      data-testid="link-discord-profile"
    >
      <img
        className="discord-card-banner"
        src={presence.banner || assetPath('bnerror.gif')}
        alt=""
        data-testid="img-discord-banner"
        onError={(e) => {
          (e.target as HTMLImageElement).src = assetPath('bnerror.gif');
        }}
      />
      <div className="discord-card-avatar-wrapper">
        <img
          className="discord-card-avatar"
          src={presence.avatar}
          alt="avatar"
          data-testid="img-discord-avatar"
          onError={(e) => {
            (e.target as HTMLImageElement).src = assetPath('discord-avatar.png');
          }}
        />
        <span 
          className="discord-status" 
          aria-label={presence.status}
          style={{
            backgroundColor: presence.status === 'online' ? '#3ba55d' : 
                           presence.status === 'idle' ? '#faa61a' :
                           presence.status === 'dnd' ? '#f04747' :
                           '#747f8d'
          }}
        />
      </div>
      <div className="discord-card-content">
        <div className="discord-card-name" data-testid="text-discord-name">
          {presence.displayName}
        </div>
        <div className="discord-card-username" data-testid="text-discord-username">
          @{presence.username}
        </div>
      </div>
    </a>
  );
}

function CustomMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [volume, setVolume] = useState(1);

  const playlist = [
    {
      name: 'NO IM NOT YA FRIEND SO GET AWAY',
      artist: 'comehelpglo',
      url: `${import.meta.env.BASE_URL}songs/NO IM NOT YA FRIEND SO GET AWAY_spotdown.org.mp3`,
      image: `${import.meta.env.BASE_URL}songs/images.jpg`,
    },
    {
      name: 'Runaway',
      artist: 'Linkin Park',
      url: `${import.meta.env.BASE_URL}songs/Runaway_spotdown.org.mp3`,
      image: `${import.meta.env.BASE_URL}songs/images (1).jpg`,
    },
  ];

  const song = playlist[currentSongIndex];

  // Auto-play on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      // Try to autoplay
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Autoplay started');
            setIsPlaying(true);
          })
          .catch((error) => {
            console.log('Autoplay failed, waiting for user interaction:', error);
            // Autoplay is blocked, wait for user interaction
            const playOnClick = () => {
              audio.play();
              setIsPlaying(true);
              document.removeEventListener('click', playOnClick);
              document.removeEventListener('touchstart', playOnClick);
            };
            document.addEventListener('click', playOnClick);
            document.addEventListener('touchstart', playOnClick);
          });
      }
    }
  }, []);

  // Handle song change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTime(0);
    setDuration(0);
    audio.load();
    
    if (isPlaying) {
      audio.play().catch(() => console.log('Play prevented'));
    }
  }, [currentSongIndex]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playNextSong = () => {
    setCurrentSongIndex((prev) => (prev + 1) % playlist.length);
    setCurrentTime(0);
  };

  const playPrevSong = () => {
    setCurrentSongIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // SVG Icons - Proper music player icons
  const ShuffleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 1 23 7 17 7"></polyline>
      <polyline points="1 23 1 17 7 17"></polyline>
      <path d="M20 4L4 20"></path>
      <path d="M20 4L20 14"></path>
      <path d="M4 20L14 20"></path>
    </svg>
  );

  const PrevIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 6h2v12H6z"></path>
      <path d="M17.59 6.41L16.17 7.83 19.34 11H4v2h15.34l-3.17 3.17 1.41 1.41L21 12z"></path>
    </svg>
  );

  const PlayIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z"></path>
    </svg>
  );

  const PauseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 4h4v16H6V4z"></path>
      <path d="M14 4h4v16h-4V4z"></path>
    </svg>
  );

  const NextIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 18h2V6h-2z"></path>
      <path d="M6.41 6.41L7.83 7.83 4.66 11H20v2H4.66l3.17 3.17-1.41 1.41L3 12z"></path>
    </svg>
  );

  const VolumeIcon = () => {
    if (volume === 0) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3z"></path>
          <line x1="23" y1="9" x2="17" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round"></line>
          <line x1="17" y1="9" x2="23" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round"></line>
        </svg>
      );
    } else if (volume < 0.5) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02z"></path>
        </svg>
      );
    } else {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
        </svg>
      );
    }
  };

  return (
    <div 
      style={{ 
        position: 'fixed',
        top: '10px',
        left: '20px',
        zIndex: 50,
        color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        width: 'fit-content',
      }}
    >
      {/* Album Cover */}
      <img
        src={song.image}
        alt={song.name}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '8px',
          objectFit: 'cover',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
      />

      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '200px', paddingRight: '6px' }}>
        {/* Song Info */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '1px' }}>
            {song.name}
          </div>
          <div style={{ fontSize: '10px', color: '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {song.artist}
          </div>
        </div>

        {/* Progress Bar with Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '9px', color: '#666', minWidth: '24px' }}>{formatTime(currentTime)}</span>
          <div style={{ flex: 1, position: 'relative', height: '2px' }}>
            {/* Progress fill only */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: '#fff',
                width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                transition: 'width 0.1s linear',
              }}
            />
            {/* Interactive slider */}
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => {
                if (audioRef.current) {
                  audioRef.current.currentTime = parseFloat(e.target.value);
                  setCurrentTime(parseFloat(e.target.value));
                }
              }}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                cursor: 'pointer',
                WebkitAppearance: 'none',
                appearance: 'none',
                background: 'transparent',
                outline: 'none',
                zIndex: 5,
                margin: 0,
                padding: 0,
              } as React.CSSProperties}
              className="music-player-slider"
            />
          </div>
          <span style={{ fontSize: '9px', color: '#666', minWidth: '24px', textAlign: 'right' }}>{formatTime(duration)}</span>
        </div>

        {/* Volume Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '9px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px' }}>
            <VolumeIcon />
          </span>
          <div style={{ flex: 1, position: 'relative', height: '2px', minWidth: '60px' }}>
            {/* Volume fill */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: '#fff',
                width: `${volume * 100}%`,
                transition: 'width 0.1s linear',
              }}
            />
            {/* Interactive slider */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => {
                const newVolume = parseFloat(e.target.value);
                setVolume(newVolume);
                if (audioRef.current) {
                  audioRef.current.volume = newVolume;
                }
              }}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                cursor: 'pointer',
                WebkitAppearance: 'none',
                appearance: 'none',
                background: 'transparent',
                outline: 'none',
                zIndex: 5,
                margin: 0,
                padding: 0,
              } as React.CSSProperties}
              className="music-player-slider"
            />
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
          <button
            onClick={playPrevSong}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '4px 6px',
              transition: 'all 0.2s',
              opacity: 0.6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
          >
            <PrevIcon />
          </button>

          <button
            onClick={togglePlay}
            style={{
              background: '#fff',
              border: 'none',
              color: '#000',
              padding: '6px 8px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '36px',
              minHeight: '36px',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            onClick={playNextSong}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '4px 6px',
              transition: 'all 0.2s',
              opacity: 0.6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
          >
            <NextIcon />
          </button>
        </div>
      </div>

      {/* Hidden Audio */}
      <audio
        ref={audioRef}
        src={song.url}
        volume={volume}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          console.log('Duration loaded:', e.currentTarget.duration);
          setDuration(e.currentTarget.duration);
        }}
        onEnded={() => {
          setIsPlaying(false);
          playNextSong();
        }}
        crossOrigin="anonymous"
      />
    </div>
  );
}

function HomePage() {
  return (
    <div className="centered" data-testid="page-home">
      <PageTitle title="imethan.lol" />
      <h1 className="hero-title" data-testid="text-home-heading">
        Hello, i'm <span className="accent-gradient">Ethan</span>.
      </h1>
      <p data-testid="text-home-intro">
        I am a self-taught software developer with experience in a wide range of
        programming languages and technologies. I learned most of my skills on my
        own through building projects, experimenting, and figuring things out as
        I go, I am pretty comfortable adapting to new tools and stacks quickly. I
        focus on writing solid, clean code and keep improving by just building
        things and learning from what breaks or works well.
      </p>
      <h2 data-testid="text-contact-heading">Where to contact me</h2>
      <DiscordCard />
      <h2 data-testid="text-code-heading">My Socials</h2>
      <div className="link-container" data-testid="list-code-links">
        <LinkButton
          href="https://github.com/BannedVariable"
          upperText="Github"
          lowerText="BannedVariable"
          icon={<Github size={20} />}
          testId="link-github"
        />
        <LinkButton
          href="https://steamcommunity.com/id/ImVariable/"
          upperText="Steam"
          lowerText="ImVariable"
          icon={
            <img 
              src={assetPath('Steam_Symbol_1.png')} 
              alt="Steam" 
              style={{ width: 20, height: 20 }}
            />
          }
          testId="link-steam"
        />
      </div>
    </div>
  );
}

function AboutPage() {
  const languages = [
    ['https://isocpp.org', 'C++', <Terminal size={20} />, 'cpp'],
    ['https://rust-lang.org', 'Rust', <Code2 size={20} />, 'rust'],
    [
      'https://dotnet.microsoft.com/en-us/languages/csharp',
      'C#',
      <Code2 size={20} />,
      'csharp',
    ],
    ['https://go.dev', 'Go', <Globe2 size={20} />, 'go'],
    ['https://www.python.org', 'Python', <Terminal size={20} />, 'python'],
    ['https://luau.org', 'LuaU', <Code2 size={20} />, 'luau'],
    [
      'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      'JavaScript',
      <Code2 size={20} />,
      'javascript',
    ],
    ['https://www.typescriptlang.org', 'TypeScript', <Code2 size={20} />, 'typescript'],
  ] as const;
  const frameworks = [
    ['https://react.dev', 'React', <Code2 size={20} />, 'react'],
    ['https://tailwindcss.com', 'Tailwind', <Code2 size={20} />, 'tailwind'],
    ['https://www.electronjs.org', 'Electron', <Terminal size={20} />, 'electron'],
    ['https://v2.tauri.app', 'Tauri', <Terminal size={20} />, 'tauri'],
    ['https://expressjs.com', 'Express', <Code2 size={20} />, 'express'],
  ] as const;

  return (
    <div className="centered" data-testid="page-about">
      <PageTitle title="imethan.lol - about" />
      <h1 data-testid="text-about-heading">About me</h1>
      <p data-testid="text-about-intro">
        I'm Ethan — a web designer, software engineer, and reverse engineer.
      </p>
      <p data-testid="text-about-web-design">
        For web design, I focus on modern tech stacks: <span className="accent-gradient">Three.js</span>, <span className="accent-gradient">HTML</span>, and <span className="accent-gradient">TypeScript</span> to build immersive interactive experiences.
      </p>
      <p data-testid="text-about-software-engineering">
        For software engineering, I primarily work with <span className="accent-gradient">C++</span> — because, as you know, it's superior.
      </p>
      <p data-testid="text-about-reverse-engineering">
        For reverse engineering, I specialize in <span className="accent-gradient">IDA Pro</span> and <span className="accent-gradient">SQL databases</span> to analyze and understand complex systems.
      </p>
      <h2 className="tech-heading" data-testid="text-tech-heading">
        Tech
      </h2>
      <p data-testid="text-tech-intro">
        A collection of the languages, frameworks, libraries, and technologies I've worked with.
      </p>
      <h3 data-testid="text-languages-heading">Languages</h3>
      <div className="link-container" data-testid="list-languages">
        {languages.map(([href, label, icon, id]) => (
          <LinkButton
            key={id}
            href={href}
            lowerText={label}
            icon={icon}
            testId={`link-language-${id}`}
          />
        ))}
      </div>
      <h3 data-testid="text-frameworks-heading">Libraries &amp; Frameworks</h3>
      <div className="link-container" data-testid="list-frameworks">
        {frameworks.map(([href, label, icon, id]) => (
          <LinkButton
            key={id}
            href={href}
            lowerText={label}
            icon={icon}
            testId={`link-framework-${id}`}
          />
        ))}
      </div>
    </div>
  );
}

type Project = {
  id: string;
  url: string;
  name: string;
  description: string;
  language: string;
  languageColor: string;
  stars: number;
  forks: number;
};

const localProjects: Project[] = [
  {
    id: 'imethan-lol',
    url: 'https://github.com/BannedVariable/Portfolio',
    name: 'imethan.lol',
    description: 'My personal portfolio website source code.',
    language: 'TypeScript',
    languageColor: '#3178c6',
    stars: 0,
    forks: 0,
  },
];

function ProjectCard({ project }: { project: Project }) {
  return (
    <a
      className="project-card"
      href={project.url}
      target="_blank"
      rel="noreferrer"
      data-testid={`card-project-${project.id}`}
    >
      <ExternalLink
        className="project-icon"
        size={15}
        aria-hidden="true"
      />
      <h3 className="project-title" data-testid={`text-project-title-${project.id}`}>
        {project.name}
      </h3>
      <p
        className="project-description"
        data-testid={`text-project-description-${project.id}`}
      >
        {project.description || 'An open-source project by Theo.'}
      </p>
      <div className="project-bottom-container">
        <span className="project-lang">
          <span
            className="project-lang-dot"
            style={{ backgroundColor: project.languageColor }}
          />
          {project.language || 'Various'}
        </span>
        <span className="project-stars">
          <Star size={12} className="project-faicon" aria-hidden="true" />
          {project.stars || 0}
        </span>
        <span className="project-forks">
          <GitFork size={12} className="project-faicon" aria-hidden="true" />
          {project.forks || 0}
        </span>
      </div>
    </a>
  );
}

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProjects(localProjects);
    }, 650);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="centered" data-testid="page-projects">
      <PageTitle title="imethan.lol - projects" />
      <h2 data-testid="text-projects-heading">Open source projects</h2>
      <div className="project-container" data-testid="list-projects">
        {projects.length === 0 ? (
          <div className="project-placeholder" data-testid="status-projects-loading">
            <span className="sr-only">Loading projects</span>
            <LoaderIcon />
          </div>
        ) : (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        )}
      </div>
    </div>
  );
}

function LoaderIcon() {
  return (
    <svg
      className="spinner"
      width="20"
      height="20"
      viewBox="0 0 512 512"
      fill="none"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M222.7 32.1c5 16.9-4.6 34.8-21.5 39.8C121.8 95.6 64 169.1 64 256c0 106 86 192 192 192s192-86 192-192c0-86.9-57.8-160.4-137.1-184.1c-16.9-5-26.6-22.9-21.5-39.8s22.9-26.6 39.8-21.5C434.9 42.1 512 140 512 256c0 141.4-114.6 256-256 256S0 397.4 0 256C0 140 77.1 42.1 182.9 10.6c16.9-5 34.8 4.6 39.8 21.5z"
      />
    </svg>
  );
}

function NotFoundPage() {
  return (
    <div className="centered" data-testid="page-not-found">
      <PageTitle title="imethan.lol - 404" />
      <h1 className="accent hero-title" data-testid="text-404-heading">
        404
      </h1>
      <p data-testid="text-404-message">
        Looks like this page wasn't found... if you think this is a mistake
        please contact me!
      </p>
      <a
        className="link-button"
        href="/"
        target="_blank"
        rel="noreferrer"
        data-testid="link-404-home"
      >
        <span className="link-icon" aria-hidden="true">
          <Home size={20} />
        </span>
        <span className="link-text-container">
          <span className="link-text-upper" />
          <span className="link-text-lower">Home</span>
        </span>
      </a>
    </div>
  );
}

function TermsPage() {
  return (
    <div className="centered legal-copy" data-testid="page-terms">
      <PageTitle title="Terms of Service" />
      <h1 className="hero-title" data-testid="text-terms-heading">
        Terms of Service
      </h1>
      <p data-testid="text-terms-intro">
        By inviting or using this Discord bot, you agree to these Terms of
        Service.
      </p>
      <h2>Use of the Bot</h2>
      <p>
        This bot is designed to help detect common, known scam images shared in
        Discord servers. Detection is provided on a best effort basis and is
        not guaranteed to identify every scam or malicious image.
      </p>
      <h2>Availability</h2>
      <p>
        The bot may be updated, modified, temporarily unavailable, or
        permanently discontinued at any time without notice.
      </p>
      <h2>Responsibility</h2>
      <p>
        Server owners and moderators remain responsible for moderating their
        own communities. The bot is intended as an aid and should not be relied
        upon as the sole moderation tool.
      </p>
      <h2>Termination</h2>
      <p>
        Access to the bot may be restricted or revoked for any server or user
        if it is abused or used in a way that negatively affects the service.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about these Terms can be sent to{' '}
        <a href="mailto:contact@imethan.lol" data-testid="link-terms-contact">
          contact@imethan.lol
        </a>
        .
      </p>
    </div>
  );
}

function PrivacyPage() {
  return (
    <div className="centered legal-copy" data-testid="page-privacy">
      <PageTitle title="Privacy Policy" />
      <h1 className="hero-title" data-testid="text-privacy-heading">
        Privacy Policy
      </h1>
      <p data-testid="text-privacy-intro">
        This Privacy Policy explains what information the bot stores and how it
        is used.
      </p>
      <h2>Information Stored</h2>
      <p>The bot stores only the information required to operate:</p>
      <ul>
        <li>Discord server (guild) IDs.</li>
        <li>Server invite links when configured by administrators.</li>
      </ul>
      <h2>Image Processing</h2>
      <p>
        Image attachments are scanned using Optical Character Recognition (OCR)
        to detect common, known scam images. Images are processed only for the
        duration of the scan and are immediately discarded afterwards. The bot
        does not permanently store image attachments.
      </p>
      <h2>Data Usage</h2>
      <p>
        Stored data is used solely to provide the bot's functionality and is not
        sold or shared with third parties except where required by law.
      </p>
      <h2>Data Removal</h2>
      <p>
        When the bot is removed from a server, stored data associated with that
        server may be deleted. Server administrators may also request removal of
        stored data by contacting the developer.
      </p>
      <h2>Contact</h2>
      <p>
        If you have any questions about this Privacy Policy, contact{' '}
        <a href="mailto:contact@imethan.lol" data-testid="link-privacy-contact">
          contact@imethan.lol
        </a>
        .
      </p>
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  return (
    <div className="app-shell">
      <video
        autoPlay
        muted
        loop
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.1,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <source src={assetPath('makima.mp4')} type="video/mp4" />
      </video>
      <CustomMusicPlayer />
      <Navbar />
      <main key={location} className="page-transition">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/projects" component={ProjectsPage} />
          <Route path="/scam-detector/terms" component={TermsPage} />
          <Route path="/scam-detector/privacy" component={PrivacyPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Router />
    </WouterRouter>
  );
}

export default App;
