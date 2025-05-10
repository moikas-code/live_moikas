import Image from 'next/image';
import type { StreamData, UserData } from '@/app/page';

interface CreatorCardProps {
  login: string;
  live: boolean;
  stream: StreamData | null;
  user: UserData | null;
  affiliate?: boolean;
  onViewStream?: () => void;
}

export default function CreatorCard({ login, live, stream, user, affiliate, onViewStream }: CreatorCardProps) {
  // Helper to get the formatted thumbnail URL
  const get_thumbnail_url = (url: string) =>
    url.replace('{width}', '480').replace('{height}', '270');

  return (
    <div
      className="relative h-full"
      role={onViewStream ? 'button' : undefined}
      tabIndex={onViewStream ? 0 : undefined}
      onClick={
        onViewStream
          ? (e) => {
              e.stopPropagation();
              e.preventDefault();
              onViewStream();
            }
          : undefined
      }
      onKeyDown={
        onViewStream
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onViewStream();
              }
            }
          : undefined
      }
      style={onViewStream ? { cursor: 'pointer' } : {}}
      aria-label={onViewStream ? `Select ${user?.display_name || login} as main stream` : undefined}
    >
      <div className="card bg-base-100 shadow-md h-full min-h-[22rem] flex flex-col transition-transform duration-200 hover:shadow-xl hover:scale-105">
        <figure className="w-full flex flex-col items-center">
          {/* Thumbnail with live badge overlay */}
          <div className="relative w-full">
            {live && stream && (
              <span
                className="absolute top-2 right-2 z-10 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg"
                style={{ letterSpacing: '0.5px' }}
              >
                Live
              </span>
            )}
            {live && stream && stream.thumbnail_url ? (
              <Image
                src={get_thumbnail_url(stream.thumbnail_url)}
                alt={`Stream thumbnail for ${user?.display_name || login}`}
                width={480}
                height={270}
                className="rounded-lg w-full h-auto object-cover mb-2"
                style={{ aspectRatio: '16/9', maxWidth: '100%' }}
                loading="lazy"
              />
            ) : (
              <div
                className="flex items-center justify-center bg-base-200 rounded-lg w-full mb-2"
                style={{ height: 180, minHeight: 120 }}
              >
                <span className="text-base-content/60 text-sm">{login} is currently offline</span>
              </div>
            )}
          </div>
        </figure>
        <div className="card-body p-4 flex flex-col flex-1">
          <div className="flex items-center gap-3 mb-2">
            {user?.profile_image_url && (
              <Image
                src={user.profile_image_url}
                alt={user.display_name || login}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-base-300 object-cover"
                loading="lazy"
              />
            )}
            <h2 className="text-sm m-0 flex items-center gap-2">
              {user?.display_name || login}
              {affiliate && (
                <span className="ml-1 px-2 py-0.5 rounded bg-yellow-200 text-yellow-900 text-xs font-semibold border border-yellow-400">Affiliate</span>
              )}
            </h2>
          </div>
          <div className="flex-1">
            {live && stream ? (
              <>
                <p
                  className="text-xs text-green-800 bg-green-100 rounded px-2 py-1 w-fit mb-1 truncate text-ellipsis w-full"
                  style={{ letterSpacing: '0.5px' }}
                >
                  {stream.title}
                </p>
                {stream.game_name && (
                  <p
                    className="text-xs text-purple-800 bg-purple-100 rounded px-2 py-1 w-fit mb-1 truncate"
                    style={{ letterSpacing: '0.5px' }}
                  >
                    {stream.game_name}
                  </p>
                )}
                <p className="text-xs">Viewers: {stream.viewer_count}</p>
              </>
            ) : (
              <p
                className="text-sm font-bold text-red-800 bg-red-100 rounded px-2 py-1 w-fit"
                style={{ letterSpacing: '0.5px' }}
              >
                Offline
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}