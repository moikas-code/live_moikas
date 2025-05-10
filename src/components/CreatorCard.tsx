import StreamEmbed from './StreamEmbed';

interface CreatorCardProps {
  login: string;
  live: boolean;
  stream: any;
  user: any;
  parent: string[];
}

export default function CreatorCard({ login, live, stream, user, parent }: CreatorCardProps) {
  return (
    <div className="card bg-base-100 shadow-md h-full min-h-[22rem] flex flex-col">
      <figure className="w-full">
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
        <div className="flex-1">
          {live && stream ? (
            <>
              <p className="text-sm font-bold text-green-800 bg-green-100 rounded px-2 py-1 w-fit" style={{letterSpacing: '0.5px'}}>Live: {stream.title}</p>
              <p className="text-xs">Viewers: {stream.viewer_count}</p>
            </>
          ) : (
            <p className="text-sm font-bold text-red-800 bg-red-100 rounded px-2 py-1 w-fit" style={{letterSpacing: '0.5px'}}>Offline</p>
          )}
        </div>
        <a
          href={`https://twitch.tv/${login}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-primary mt-2"
          aria-label={`Visit ${login}'s Twitch channel`}
        >
          Visit Channel
        </a>
      </div>
    </div>
  );
}