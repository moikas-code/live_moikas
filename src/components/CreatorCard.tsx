import StreamEmbed from './StreamEmbed';
import Link from 'next/link';

interface CreatorCardProps {
  login: string;
  live: boolean;
  stream: any;
  user: any;
  parent: string[];
}

export default function CreatorCard({ login, live, stream, user, parent }: CreatorCardProps) {
  const channel_url = `https://twitch.tv/${login}`;
  return (
    <Link href={channel_url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${login}'s Twitch channel`} className="block h-full">
      <div className="card bg-base-100 shadow-md h-full min-h-[22rem] flex flex-col transition-transform duration-200 hover:shadow-xl hover:scale-105 cursor-pointer">
        <figure className="w-full flex flex-col items-center">
          {user?.profile_image_url && (
            <img
              src={user.profile_image_url}
              alt={user.display_name || login}
              className="w-20 h-20 rounded-full border-2 border-base-300 shadow mb-2 object-cover"
              loading="lazy"
            />
          )}
          <StreamEmbed
            channel={login}
            live={live}
            width="100%"
            height={240}
            parent={parent}
          />
        </figure>
        <div className="card-body p-4 flex flex-col flex-1">
          <h2 className="card-title text-lg">{user?.display_name || login}</h2>
          {user?.description && (
            <p className="text-xs text-base-content/60 mb-2 text-center">{user.description}</p>
          )}
          <div className="flex-1">
            {live && stream ? (
              <>
                <p className="text-sm font-bold text-green-800 bg-green-100 rounded px-2 py-1 w-fit" style={{letterSpacing: '0.5px'}}>Live: {stream.title}</p>
                {stream.game_name && (
                  <p className="text-xs text-purple-800 bg-purple-100 rounded px-2 py-1 w-fit mb-1" style={{letterSpacing: '0.5px'}}>{stream.game_name}</p>
                )}
                <p className="text-xs">Viewers: {stream.viewer_count}</p>
              </>
            ) : (
              <p className="text-sm font-bold text-red-800 bg-red-100 rounded px-2 py-1 w-fit" style={{letterSpacing: '0.5px'}}>Offline</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}