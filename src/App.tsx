import {
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Download,
  Github,
  Maximize2,
  X,
  Code,
  Heart,
  Grid3X3,
  Columns3,
  Camera,
  ChevronLeft,
  ChevronRight,
  Play,
  Volume2,
  SlidersHorizontal,
  Wrench,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { HTML_TEMPLATE_SOURCE } from './templateHtml';
import {
  PhotoEffectOverlay,
  AnimationType,
} from './components/PhotoEffectOverlay';

export interface PhotoItem {
  id: string;
  title: string;
  category: 'generated' | 'original' | 'curated';
  badgeLabel: string;
  sourceUrl: string;
  imageUrl: string;
  alt: string;
  shortSummary: string;
  naturalDescription: string;
  effectType: AnimationType;
  effectName: string;
  cameraInfo?: {
    gear: string;
    focal: string;
    iso: string;
    location: string;
  };
  initialLikes: number;
}

const PHOTOS: PhotoItem[] = [
  {
    id: 'photo-1',
    title: 'Mike Trout (Angels Legend)',
    category: 'original',
    badgeLabel: 'Original Master',
    sourceUrl: 'https://www.britannica.com/facts/Mike-Trout',
    imageUrl:
      'https://cdn.britannica.com/88/221888-050-7F121E32/Baseball-player-Mike-Trout-2020.jpg',
    alt: 'Baseball player Mike Trout standing on field in uniform',
    shortSummary: 'High-speed MLB sports photography captured in natural Anaheim sunlight.',
    naturalDescription:
      'Standing in the outfield under the blazing Southern California sun, Mike Trout embodies raw athletic concentration. The natural grass of Angel Stadium shimmers in the dry midday heat while red clay and infield chalk dust cling to his uniform from live game action. Natural sunlight catches the stitching of his Angels jersey and the focused intensity in his eyes. Without artificial studio lighting, the image captures the genuine pulse, grit, and history of modern American baseball.',
    effectType: 'baseball-crack',
    effectName: 'Home Run Blast to the Stands (Interactive Bleachers Catch)',
    cameraInfo: {
      gear: 'Canon EOS-1D X Mark III',
      focal: '400mm f/2.8L IS',
      iso: 'ISO 800 &bull; 1/2500s',
      location: 'Angel Stadium, Anaheim, CA',
    },
    initialLikes: 142,
  },
  {
    id: 'photo-2',
    title: 'Cesar the Golden Retriever',
    category: 'original',
    badgeLabel: 'Original Master',
    sourceUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800',
    imageUrl:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop&q=80',
    alt: 'Close-up portrait of Cesar the golden retriever puppy lying on soft green grass',
    shortSummary: 'Organic morning portrait of Cesar the golden retriever with warm backlighting and grass bokeh.',
    naturalDescription:
      'Bathed in the gentle golden rays of early morning sunlight, Cesar the golden retriever puppy rests quietly among dew-kissed blades of spring lawn. Every individual strand of soft honey fur catches the warm backlighting, forming a glowing halo around his floppy ears and dark curious eyes. The soil beneath is cool and damp, grounding the portrait in pure organic serenity. Captured without flashes or artificial bounce cards, Cesar radiates calm breathing, playful energy, and faithful canine companionship.',
    effectType: 'puppy-bounce',
    effectName: 'Play Fetch & Belly Rubs with Cesar 🐾',
    cameraInfo: {
      gear: 'Sony A7R IV',
      focal: '85mm f/1.4 GM',
      iso: 'ISO 200 &bull; 1/800s',
      location: 'Sunnyvale, California',
    },
    initialLikes: 289,
  },
  {
    id: 'photo-3',
    title: 'Pacific Coast Sunset',
    category: 'generated',
    badgeLabel: 'AI Synthesized 1/2',
    sourceUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    imageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    alt: 'Breathtaking coastal sunset over gentle ocean waves with pastel skies',
    shortSummary: 'High-dynamic-range seascape capturing low-tide reflections and salty haze.',
    naturalDescription:
      'A sweeping study in maritime twilight along the rugged Pacific rim. Receding low-tide surf leaves thin, mirror-like sheets of seawater over dark sand, reflecting vivid pastel gradients of coral pink, molten gold, and evening indigo. Frothy sea foam curls softly along the shore, catching the horizontal sun rays while ocean sea spray fills the marine boundary layer with a warm, luminous mist. It evokes the eternal, rhythmic cadence of crashing tides under an open Western sky.',
    effectType: 'ocean-splash',
    effectName: 'Tidal Wave & Salty Water Spray',
    cameraInfo: {
      gear: 'Gemini Imagen 3 Synth',
      focal: '35mm Wide Perspective',
      iso: 'Hyper-Dynamic Twilight',
      location: 'Big Sur Coastline Synthesis',
    },
    initialLikes: 195,
  },
  {
    id: 'photo-4',
    title: 'Baseball Stadium at Dusk',
    category: 'generated',
    badgeLabel: 'AI Synthesized 2/2',
    sourceUrl: 'https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800',
    imageUrl:
      'https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800&auto=format&fit=crop&q=80',
    alt: 'Majestic baseball ballpark infield with glowing stadium floodlights against twilight sky',
    shortSummary: 'Ballpark diamond illuminated by towering floodlights during evening dusk.',
    naturalDescription:
      'The electric stillness of game day just as dusk falls across the stadium bowl. The pristine infield grass is manicured into sharp geometric crosshatch patterns by the grounds crew, set against rich crushed brick dust on the basepaths. High overhead, towering floodlight stanchions begin to hum to life against a deep purple-blue twilight sky. The cool evening air carries the nostalgic scent of freshly mown lawn and evening dew, waiting for the crack of a wooden bat.',
    effectType: 'baseball-crack',
    effectName: '3D WebGL Ballpark Heater & Screen Shatter',
    cameraInfo: {
      gear: 'Gemini Imagen 3 Synth',
      focal: '24mm Ultra-Wide Diamond',
      iso: 'Twilight Stadium Exposure',
      location: 'Championship Park Infield',
    },
    initialLikes: 231,
  },
  {
    id: 'photo-5',
    title: 'Alpine Mountain Peaks',
    category: 'curated',
    badgeLabel: 'Nature & Landscape',
    sourceUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
    imageUrl:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
    alt: 'Majestic jagged mountain peaks covered in snow against deep blue sky',
    shortSummary: 'Glacial granite summits bathed in crisp sub-zero morning light.',
    naturalDescription:
      'Jagged granite monoliths piercing high into the sub-zero troposphere. Freshly fallen powder snow clings tenaciously to sheer vertical couloirs, carved over geological epochs by alpine glaciers and howling summit winds. The thin, ultra-clean atmosphere produces intense optical clarity, casting razor-sharp cobalt shadows across the northern cirques while sun-drenched ridges ignite in blinding crystalline white. An unyielding testament to the quiet, ancient majesty of high alpine wilderness.',
    effectType: 'alpine-frost',
    effectName: 'Sub-Zero Frost & Blizzard Crystals',
    cameraInfo: {
      gear: 'Nikon Z7 II',
      focal: '70-200mm f/2.8 VR S',
      iso: 'ISO 64 &bull; 1/1000s',
      location: 'Swiss Alps, Valais',
    },
    initialLikes: 178,
  },
  {
    id: 'photo-6',
    title: 'Cozy Cafe & Notebook',
    category: 'curated',
    badgeLabel: 'Lifestyle & Ambiance',
    sourceUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb',
    imageUrl:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
    alt: 'Warm coffee cup and notebook on rustic wooden table in gentle sun',
    shortSummary: 'Artisan roast and contemplative morning sunlight through rain-touched glass.',
    naturalDescription:
      'Morning light slants through a rain-flecked window, illuminating delicate wisps of steam rising from a dark roast espresso in a speckled stoneware mug. The rustic wooden tabletop displays natural wood grain, gentle weathering, and rings left by countless slow mornings of reflection. Beside the mug rests an open notebook with raw, cream-colored pages awaiting ink. The composition captures the quiet sanctuary of a neighborhood coffeehouse where time momentarily slows to a peaceful hum.',
    effectType: 'cafe-steam',
    effectName: 'Warm Aromatic Steam & Amber Glow',
    cameraInfo: {
      gear: 'Fujifilm X-T4',
      focal: '35mm f/1.4 XF',
      iso: 'ISO 400 &bull; 1/160s',
      location: 'Seattle, Washington',
    },
    initialLikes: 312,
  },
  {
    id: 'photo-7',
    title: 'City Skyline at Twilight',
    category: 'curated',
    badgeLabel: 'Metropolitan Urban',
    sourceUrl: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82',
    imageUrl:
      'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=800&auto=format&fit=crop&q=80',
    alt: 'City skyline illuminated in blue hour twilight over waterfront reflections',
    shortSummary: 'The iconic blue hour transition where sunset meets architectural neon.',
    naturalDescription:
      'The dramatic twilight threshold where fading daylight yields to the glowing pulse of the metropolis. Glass high-rises mirror the cool deep sapphire of the evening sky, punctuated by thousands of warm tungsten and fluorescent office lights. Across the dark surface of the urban river, neon signs and streetlights create stretched, liquid reflections that ripple with every passing wake. It embodies the sleepless, synchronized rhythm of modern human civilization after dusk.',
    effectType: 'city-pulse',
    effectName: 'Metropolitan Pulse & Neon Flash',
    cameraInfo: {
      gear: 'Leica Q2',
      focal: '28mm Summilux f/1.7',
      iso: 'ISO 1600 &bull; 1/30s',
      location: 'Chicago Riverwalk, IL',
    },
    initialLikes: 264,
  },
  {
    id: 'photo-8',
    title: 'Sunlit Autumn Forest Trail',
    category: 'curated',
    badgeLabel: 'Woodland Sanctuary',
    sourceUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
    imageUrl:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop&q=80',
    alt: 'Lush forest trees with golden sunlight beams piercing the canopy',
    shortSummary: 'Volumetric sunbeams filtering through ancient golden woodland canopies.',
    naturalDescription:
      'Low autumn sunbeams cut through the tall forest canopy in dramatic volumetric shafts of light, illuminating airborne morning mist, spores, and falling needles. The soft forest floor is blanketed by a rich mosaic of copper, amber, and chestnut oak leaves that muffle footsteps and exude a rich, damp earthy scent. The peaceful interplay of warm sun rays and deep mossy shadows creates a cathedral-like sanctuary untouched by modern urgency.',
    effectType: 'autumn-leaves',
    effectName: 'Swirling Autumn Foliage Gust',
    cameraInfo: {
      gear: 'Hasselblad X1D II 50C',
      focal: '45mm f/4 P',
      iso: 'ISO 100 &bull; 1/200s',
      location: 'Black Forest, Germany',
    },
    initialLikes: 219,
  },
  {
    id: 'photo-9',
    title: 'Starry Milky Way Sky',
    category: 'curated',
    badgeLabel: 'Deep Space Cosmos',
    sourceUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86',
    imageUrl:
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80',
    alt: 'Milky Way galaxy night sky over silhouette horizon with countless stars',
    shortSummary: 'The galactic core arcing over an unpolluted Bortle 1 dark desert skyline.',
    naturalDescription:
      'Gazing into deep cosmic time under an authentic Bortle Class 1 dark sky reserve. The galactic core of the Milky Way arcs like a luminous river across the zenith, filled with millions of distant stellar furnaces, pink emission nebulae, and dark interstellar dust lanes silhouetted against cosmic starlight. Down on earth, the desert ridgeline stands in pitch-black relief, reminding the viewer of the rare, quiet vantage point we share as passengers on this blue planet.',
    effectType: 'cosmic-warp',
    effectName: 'Interstellar Warp Speed Velocity',
    cameraInfo: {
      gear: 'Sony A7S III Astro',
      focal: '14mm f/1.8 GM',
      iso: 'ISO 6400 &bull; 20s',
      location: 'Joshua Tree, California',
    },
    initialLikes: 405,
  },
];

type PhotoFilterStyle = 'normal' | 'film' | 'bw' | 'warm' | 'cyber';

export default function App() {
  const [photos] = useState<PhotoItem[]>(PHOTOS);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'generated' | 'original' | 'curated'>('all');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'editorial'>('grid');
  const [filterStyle, setFilterStyle] = useState<PhotoFilterStyle>('normal');

  // Interactive live animation state
  const [activeEffect, setActiveEffect] = useState<{
    type: AnimationType;
    title: string;
  } | null>(null);

  // Likes state
  const [likes, setLikes] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    PHOTOS.forEach((p) => {
      initial[p.id] = p.initialLikes;
    });
    return initial;
  });
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  // UI helpers
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const codeTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Filtered photos
  const filteredPhotos =
    activeCategory === 'all'
      ? photos
      : photos.filter((p) => p.category === activeCategory);

  const currentLightboxPhoto =
    selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;

  // Keyboard controls for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === 'Escape') setSelectedPhotoIndex(null);
      if (e.key === 'ArrowRight') {
        setSelectedPhotoIndex((prev) => (prev! + 1) % photos.length);
      }
      if (e.key === 'ArrowLeft') {
        setSelectedPhotoIndex((prev) => (prev! - 1 + photos.length) % photos.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, photos.length]);

  const toggleLike = (photoId: string) => {
    const isCurrentlyLiked = likedMap[photoId];
    setLikedMap((prev) => ({ ...prev, [photoId]: !isCurrentlyLiked }));
    setLikes((prev) => ({
      ...prev,
      [photoId]: (prev[photoId] || 0) + (isCurrentlyLiked ? -1 : 1),
    }));
  };

  const triggerAnimationForPhoto = (photo: PhotoItem) => {
    setActiveEffect({
      type: photo.effectType,
      title: photo.title,
    });
  };

  const copyToClipboardFallback = (text: string) => {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      return true;
    } catch {
      return false;
    }
  };

  const handleCopyCode = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(HTML_TEMPLATE_SOURCE);
      } else {
        copyToClipboardFallback(HTML_TEMPLATE_SOURCE);
      }
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      const ok = copyToClipboardFallback(HTML_TEMPLATE_SOURCE);
      if (ok) {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2500);
      } else {
        setShowCodeModal(true);
      }
    }
  };

  const handleDownloadClick = () => {
    try {
      const blob = new Blob([HTML_TEMPLATE_SOURCE], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDownloadNotice('Download initiated! If blocked by iframe sandbox, use "Open Tab" to save directly.');
    } catch {
      setDownloadNotice('Iframe sandbox blocked download. Use "Open Tab" to save directly.');
      window.open('/template.html', '_blank');
    }
  };

  const handleSelectAllText = () => {
    if (codeTextareaRef.current) {
      codeTextareaRef.current.focus();
      codeTextareaRef.current.select();
      copyToClipboardFallback(HTML_TEMPLATE_SOURCE);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const getFilterClass = () => {
    switch (filterStyle) {
      case 'film':
        return 'contrast-[1.1] sepia-[0.18] saturate-[1.1]';
      case 'bw':
        return 'grayscale contrast-[1.25] brightness-[0.95]';
      case 'warm':
        return 'sepia-[0.35] saturate-[1.2] hue-rotate-[-10deg]';
      case 'cyber':
        return 'contrast-[1.2] hue-rotate-[25deg] saturate-[1.3]';
      default:
        return 'contrast-100';
    }
  };

  return (
    <div
      id="root-gallery-page"
      className="min-h-screen w-full flex flex-col text-[#e2e8f0] bg-[#0a0a22] selection:bg-[#4da3ff] selection:text-white"
    >
      {/* 1. Sleek Top Bar (Focused, Not cluttered) */}
      <header
        id="gallery-header-bar"
        className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0d0d2e]/90 border-b border-white/10 px-4 sm:px-8 py-3 flex items-center justify-between gap-4 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4da3ff] to-[#9b82ed] p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-[#0d0d2e] rounded-[10px] flex items-center justify-center">
              <Camera className="w-4 h-4 text-[#4da3ff]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                wd.photos
              </span>
              <span className="text-[10px] bg-[#4da3ff]/15 text-[#4da3ff] border border-[#4da3ff]/30 px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider">
                Photo Archive
              </span>
            </div>
            <p className="text-[11px] text-[#8ea4ee] hidden sm:block m-0">
              Curated by Abner Flores &bull; 9 Visual Studies
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="header-view-code-btn"
            onClick={() => setShowCodeModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171755] hover:bg-[#232375] text-white text-xs font-medium rounded-xl border border-white/15 transition-all cursor-pointer shadow-sm"
            title="Inspect HTML template code"
          >
            <Code className="w-3.5 h-3.5 text-[#4da3ff]" />
            <span className="hidden sm:inline">Inspect Code</span>
          </button>

          <button
            id="header-copy-code-btn"
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#202070] hover:bg-[#2c2c8a] text-white text-xs font-medium rounded-xl border border-white/15 transition-all cursor-pointer"
            title="Copy standalone HTML code"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#4da3ff]" />
                <span className="hidden sm:inline">Copy HTML</span>
              </>
            )}
          </button>

          <button
            id="header-download-btn"
            onClick={handleDownloadClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4da3ff] hover:bg-[#3894f8] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            title="Download index.html file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <a
            id="header-open-tab-btn"
            href="/template.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
            title="Open raw HTML file in real browser tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Open Tab</span>
          </a>
        </div>
      </header>

      {/* Download Alert Notice */}
      {downloadNotice && (
        <div className="w-full bg-blue-950/90 border-b border-blue-400/30 px-4 py-2 text-xs text-blue-200 flex items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <span>{downloadNotice}</span>
          </div>
          <button
            onClick={() => setDownloadNotice(null)}
            className="text-white/60 hover:text-white px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Focused Exhibition Intro (Clean, Not an overwhelming website) */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16164d] border border-white/10 text-[#9cb0f5] text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#cfbd21]" />
          <span>Natural Light &amp; Motion Series &bull; 9 Masterpieces</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
          Light, Motion &amp; <span className="text-[#4da3ff]">Natural Optics</span>
        </h1>

        <p className="max-w-2xl mx-auto text-xs sm:text-sm text-[#9cb0f5] leading-relaxed mb-6">
          An authentic visual collection curated by <strong className="text-white">Abner Flores</strong>.
          Every photograph features in-depth natural environment notes and an <strong>interactive physical animation</strong> when clicked!
        </p>

        {/* Feature Notice Callout for User's Animation Request */}
        <div className="max-w-xl mx-auto p-3 rounded-2xl bg-[#141444]/80 border border-[#4da3ff]/30 text-xs text-[#cbd5e1] flex items-center justify-center gap-2 shadow-md">
          <Play className="w-4 h-4 text-[#4da3ff] shrink-0" />
          <span>
            <strong>Absolute Cinema:</strong> Click any photograph to launch its high-octane 60FPS physics animation &amp; sound design! Experience the 104.7 MPH fastball screen shatter on the baseball photos.
          </span>
        </div>
      </section>

      {/* 3. Controls & Filter Bar */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-white/10">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-[#4da3ff] text-white shadow-md shadow-blue-500/20'
                  : 'bg-[#141440] text-[#8ea4ee] hover:text-white border border-white/10'
              }`}
            >
              All Photos ({photos.length})
            </button>
            <button
              onClick={() => setActiveCategory('original')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeCategory === 'original'
                  ? 'bg-[#4da3ff] text-white shadow-md shadow-blue-500/20'
                  : 'bg-[#141440] text-[#8ea4ee] hover:text-white border border-white/10'
              }`}
            >
              Originals (2)
            </button>
            <button
              onClick={() => setActiveCategory('generated')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeCategory === 'generated'
                  ? 'bg-[#9b82ed] text-white shadow-md shadow-purple-500/20'
                  : 'bg-[#141440] text-[#c4b5fd] hover:text-white border border-white/10'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>AI Synthesized (2)</span>
            </button>
            <button
              onClick={() => setActiveCategory('curated')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeCategory === 'curated'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-[#141440] text-[#8ea4ee] hover:text-white border border-white/10'
              }`}
            >
              Curated Studies (5)
            </button>
          </div>

          {/* Color Grade & Layout Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#141440] border border-white/10 px-2.5 py-1.5 rounded-xl text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#4da3ff]" />
              <select
                value={filterStyle}
                onChange={(e) => setFilterStyle(e.target.value as PhotoFilterStyle)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
              >
                <option value="normal" className="bg-[#0e0e33] text-white">Normal Color</option>
                <option value="film" className="bg-[#0e0e33] text-white">35mm Film Look</option>
                <option value="warm" className="bg-[#0e0e33] text-white">Warm Sunset Amber</option>
                <option value="bw" className="bg-[#0e0e33] text-white">Monochrome Black &amp; White</option>
                <option value="cyber" className="bg-[#0e0e33] text-white">Cyber Twilight</option>
              </select>
            </div>

            <div className="flex items-center bg-[#141440] border border-white/10 p-0.5 rounded-xl">
              <button
                onClick={() => setLayoutMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  layoutMode === 'grid' ? 'bg-[#4da3ff] text-white' : 'text-[#8ea4ee] hover:text-white'
                }`}
                title="Card Grid"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayoutMode('editorial')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  layoutMode === 'editorial' ? 'bg-[#4da3ff] text-white' : 'text-[#8ea4ee] hover:text-white'
                }`}
                title="Editorial Story View"
              >
                <Columns3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Main Exhibition Cards (Each with rich natural description paragraph & animation trigger) */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex-1">
        <div
          id="gallery-items-container"
          className={
            layoutMode === 'editorial'
              ? 'flex flex-col gap-10'
              : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          }
        >
          {filteredPhotos.map((item) => {
            const originalIndex = photos.findIndex((p) => p.id === item.id);
            const isLiked = !!likedMap[item.id];
            const currentLikes = likes[item.id] || item.initialLikes;

            return (
              <article
                key={item.id}
                id={`photo-card-${item.id}`}
                className={`group flex rounded-2xl overflow-hidden bg-[#11113c] border border-white/10 hover:border-white/25 shadow-xl hover:shadow-2xl transition-all duration-300 ${
                  layoutMode === 'editorial'
                    ? 'flex-col lg:flex-row items-stretch'
                    : 'flex-col'
                }`}
              >
                {/* Photo Viewer (Click triggers custom animation!) */}
                <div
                  className={`relative overflow-hidden bg-[#18184e] cursor-pointer ${
                    layoutMode === 'editorial'
                      ? 'w-full lg:w-5/12 aspect-[4/3] lg:aspect-auto min-h-[280px]'
                      : 'aspect-[4/3]'
                  }`}
                  onClick={() => triggerAnimationForPhoto(item)}
                  title="Click to trigger interactive screen animation!"
                >
                  <img
                    id={`img-${item.id}`}
                    src={item.imageUrl}
                    alt={item.alt}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${getFilterClass()}`}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80';
                    }}
                  />

                  {/* Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md backdrop-blur-md ${
                        item.category === 'generated'
                          ? 'bg-[#9b82ed]/90 text-white'
                          : item.category === 'original'
                          ? 'bg-[#4da3ff]/90 text-white'
                          : 'bg-black/60 text-[#cbd5e1]'
                      }`}
                    >
                      {item.badgeLabel}
                    </span>
                  </div>

                  {/* Interactive Play Animation Trigger Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-[#4da3ff] text-white flex items-center justify-center shadow-lg shadow-blue-500/50 mb-2 transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-5 h-5 ml-0.5 fill-white" />
                    </div>
                    <span className="text-xs font-black text-white tracking-wide drop-shadow">
                      Trigger Animation
                    </span>
                    <span className="text-[11px] text-blue-200 mt-0.5 font-medium">
                      {item.effectName}
                    </span>
                  </div>

                  {/* Quick Expand Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhotoIndex(originalIndex);
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer"
                    title="Enlarge in high-res lightbox"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Card Content & In-Depth Natural Description */}
                <div className="p-5 flex flex-col justify-between flex-1 gap-3 bg-[#11113c]">
                  <div>
                    {/* Title and Heart Counter */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-bold text-white group-hover:text-[#4da3ff] transition-colors leading-snug">
                          {item.title}
                        </h2>
                        {item.cameraInfo && (
                          <p className="text-[11px] text-[#8ea4ee] m-0 mt-0.5">
                            {item.cameraInfo.gear} &bull; {item.cameraInfo.location}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(item.id);
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isLiked
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : 'bg-white/5 hover:bg-white/10 text-[#9cb0f5] border border-white/10'
                        }`}
                        title="Favorite this work"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 transition-transform ${
                            isLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''
                          }`}
                        />
                        <span>{currentLikes}</span>
                      </button>
                    </div>

                    {/* NATURAL DESCRIPTION PARAGRAPH (The requested natural paragraph!) */}
                    <div className="mt-3 p-3 rounded-xl bg-[#0d0d2e] border border-white/5 text-xs text-[#cbd5e1] leading-relaxed">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#4da3ff] uppercase tracking-wider mb-1.5">
                        <Camera className="w-3 h-3" />
                        <span>Natural Environmental &amp; Lighting Notes</span>
                      </div>
                      <p className="m-0 text-[#b9c8e8] font-normal leading-relaxed text-[12px]">
                        {item.naturalDescription}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom Footer: Trigger Button & Lightbox link */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      onClick={() => triggerAnimationForPhoto(item)}
                      className="px-3 py-1.5 bg-[#1a1a60] hover:bg-[#25257d] text-white text-xs font-semibold rounded-xl border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3 h-3 text-[#4da3ff] fill-[#4da3ff]" />
                      <span>Cinema FX</span>
                    </button>

                    <button
                      onClick={() => setSelectedPhotoIndex(originalIndex)}
                      className="text-xs text-[#8ea4ee] hover:text-white transition-colors cursor-pointer hover:underline"
                    >
                      View High-Res
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {/* 5. Clean, Minimalist Footer */}
      <footer
        id="gallery-footer"
        className="w-full bg-[#07071a] border-t border-white/10 py-8 px-4 sm:px-8 mt-12 text-center text-xs text-[#8ea4ee]"
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-white font-bold">
            <Camera className="w-4 h-4 text-[#4da3ff]" />
            <span>wd.photos</span>
            <span className="text-[#8ea4ee] font-normal">&bull; Curated by Abner Flores</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#9cb0f5]">
            <a
              href="https://github.com/AbnerFlores27/wd.photos"
              target="_blank"
              rel="noreferrer"
              className="text-[#cfbd21] hover:underline flex items-center gap-1"
            >
              <Github className="w-3.5 h-3.5" />
              <span>AbnerFlores27 / wd.photos</span>
            </a>
            <button
              onClick={() => setShowCodeModal(true)}
              className="hover:text-white cursor-pointer underline"
            >
              Inspect Source Code
            </button>
          </div>
        </div>
      </footer>

      {/* INTERACTIVE FULL-SCREEN ANIMATION OVERLAY (Cracked screen, etc.) */}
      <PhotoEffectOverlay
        effectType={activeEffect?.type || null}
        photoTitle={activeEffect?.title || ''}
        onClose={() => setActiveEffect(null)}
      />

      {/* HIGH-RESOLUTION LIGHTBOX MODAL */}
      {currentLightboxPhoto && selectedPhotoIndex !== null && (
        <div
          id="photo-lightbox-modal"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          <div
            id="lightbox-card"
            className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0f0f35] border border-white/20 rounded-2xl overflow-hidden shadow-2xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#141444]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#4da3ff]">
                  {selectedPhotoIndex + 1} / {photos.length}
                </span>
                <h3 className="text-sm font-bold text-white truncate max-w-[18rem] sm:max-w-md">
                  {currentLightboxPhoto.title}
                </h3>
              </div>
              <button
                id="close-lightbox-btn"
                onClick={() => setSelectedPhotoIndex(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Lightbox Image View with Next/Prev Controls */}
            <div className="relative flex-1 min-h-0 bg-black flex items-center justify-center overflow-hidden">
              <img
                src={currentLightboxPhoto.imageUrl}
                alt={currentLightboxPhoto.alt}
                className={`max-h-[58vh] max-w-full object-contain ${getFilterClass()}`}
              />

              {/* Prev Button */}
              <button
                id="lightbox-prev-btn"
                onClick={() =>
                  setSelectedPhotoIndex(
                    (selectedPhotoIndex - 1 + photos.length) % photos.length
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer"
                title="Previous photo (Arrow Left)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Next Button */}
              <button
                id="lightbox-next-btn"
                onClick={() =>
                  setSelectedPhotoIndex((selectedPhotoIndex + 1) % photos.length)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer"
                title="Next photo (Arrow Right)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Natural Description in Lightbox */}
            <div className="p-4 bg-[#11113d] border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex-1 pr-2">
                <p className="text-[#cbd5e1] font-medium m-0 mb-1 leading-relaxed">
                  {currentLightboxPhoto.naturalDescription}
                </p>
                {currentLightboxPhoto.cameraInfo && (
                  <p className="text-[11px] text-[#8ea4ee] m-0">
                    <strong>Gear:</strong> {currentLightboxPhoto.cameraInfo.gear} &bull;{' '}
                    <strong>Optics:</strong> {currentLightboxPhoto.cameraInfo.focal} &bull;{' '}
                    <strong>Location:</strong> {currentLightboxPhoto.cameraInfo.location}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => triggerAnimationForPhoto(currentLightboxPhoto)}
                  className="px-3 py-1.5 bg-[#4da3ff] hover:bg-[#328bf5] text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Play Effect</span>
                </button>

                <button
                  onClick={() => toggleLike(currentLightboxPhoto.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold cursor-pointer ${
                    likedMap[currentLightboxPhoto.id]
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      likedMap[currentLightboxPhoto.id] ? 'fill-rose-500 text-rose-500' : ''
                    }`}
                  />
                  <span>{likes[currentLightboxPhoto.id] || currentLightboxPhoto.initialLikes}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CODE INSPECT MODAL */}
      {showCodeModal && (
        <div
          id="code-view-modal"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
          onClick={() => setShowCodeModal(false)}
        >
          <div
            id="code-view-card"
            className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#111144] border border-white/20 rounded-2xl p-4 sm:p-6 text-left shadow-2xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-[#4da3ff]" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">Full Gallery Template Code</h3>
                  <p className="text-[11px] text-[#8ea4ee]">Ready for wd.photos / index.html / Replit</p>
                </div>
              </div>
              <button
                id="close-code-modal-btn"
                onClick={() => setShowCodeModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="mt-3 text-xs text-[#b8c5ff]">
              Because browser iframe security blocks automatic file downloads, you can directly grab the code here:
            </p>

            <div className="mt-2 flex-1 min-h-0 relative">
              <textarea
                ref={codeTextareaRef}
                readOnly
                value={HTML_TEMPLATE_SOURCE}
                onClick={handleSelectAllText}
                className="w-full h-72 sm:h-80 bg-black/70 font-mono text-[11px] sm:text-xs text-emerald-300 p-3.5 rounded-xl border border-white/15 focus:outline-none focus:ring-2 focus:ring-[#4da3ff] resize-none selection:bg-[#4da3ff] selection:text-white"
                spellCheck={false}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  id="modal-select-all-btn"
                  onClick={handleSelectAllText}
                  className="px-3.5 py-2 bg-[#25257a] hover:bg-[#323296] text-white text-xs font-semibold rounded-xl border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-[#4da3ff]" />
                  <span>{copiedCode ? 'Copied to Clipboard!' : 'Select All & Copy'}</span>
                </button>

                <a
                  id="modal-open-tab-btn"
                  href="/template.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Full Browser Tab (Ctrl+S)</span>
                </a>
              </div>

              <button
                id="close-code-modal-bottom-btn"
                onClick={() => setShowCodeModal(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
