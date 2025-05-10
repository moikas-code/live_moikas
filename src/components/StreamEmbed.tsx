import { useEffect, useRef } from 'react';

interface stream_embed_props {
  channel: string;
  live: boolean;
  width?: number | string;
  height?: number | string;
  layout?: 'video-with-chat' | 'video';
  parent: string[];
}

export default function stream_embed({
  channel,
  live,
  width = '100%',
  height = 480,
  layout = 'video',
  parent,
}: stream_embed_props) {
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
      // @ts-ignore
      if (window.Twitch && window.Twitch.Embed) {
        // @ts-ignore
        new window.Twitch.Embed(embed_ref.current!.id, {
          width,
          height,
          channel,
          layout,
          muted: true,
          parent,
        });
      }
    }
    return () => {
      if (embed_ref.current) embed_ref.current.innerHTML = '';
    };
  }, [channel, live, width, height, layout, parent]);

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
    <div
      id={`twitch-embed-${channel}`}
      ref={embed_ref}
      style={{ width, height }}
      aria-label={`Twitch stream for ${channel}`}
      className="rounded-lg overflow-hidden"
    />
  );
} 