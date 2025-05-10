import { useEffect, useRef } from 'react';

interface StreamEmbedProps {
  channel: string;
  live: boolean;
  width?: number | string;
  height?: number | string;
  layout?: 'video-with-chat' | 'video';
  parent: string[];
  should_autoplay?: boolean;
}

export default function StreamEmbed({
  channel,
  live,
  width = '100%',
  height = 480,
  layout = 'video',
  parent,
  should_autoplay = true,
}: StreamEmbedProps) {
  const embed_ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!live || !embed_ref.current) return;
    let script = document.getElementById('twitch-embed-script');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('src', 'https://embed.twitch.tv/embed/v1.js');
      script.setAttribute('id', 'twitch-embed-script');
      document.body.appendChild(script);
      script.onload = () => create_embed();
    } else {
      create_embed();
    }
    function create_embed() {
      // @ts-expect-error: Twitch.Embed is not typed in the global window object
      if (window.Twitch && window.Twitch.Embed) {
        // @ts-expect-error: Twitch.Embed is not typed in the global window object
        const embed = new window.Twitch.Embed(embed_ref.current!.id, {
          width,
          height,
          channel,
          layout,
          muted: true,
          parent,
        });
        if (!should_autoplay) {
          embed.addEventListener('videoReady', () => {
            try {
              embed.getPlayer().pause();
            } catch {}
          });
        }
      }
    }
    const ref = embed_ref.current;
    return () => {
      if (ref) ref.innerHTML = '';
    };
  }, [channel, live, width, height, layout, parent, should_autoplay]);

  if (!live) {
    return (
      <div
        className="flex items-center justify-center bg-base-200 rounded-lg h-[240px] w-full"
        aria-label={`Twitch stream for ${channel} is offline`}
      >
        <span className="text-lg">{channel} is currently offline</span>
      </div>
    );
  }

  return (
    <div className="w-full aspect-[16/9] rounded-lg overflow-hidden bg-black">
      <div
        id={`twitch-embed-${channel}`}
        ref={embed_ref}
        style={{ width: '100%', height: '100%' }}
        aria-label={`Twitch stream for ${channel}`}
        className="w-full h-full"
      />
    </div>
  );
} 