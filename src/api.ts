import axios from 'axios';
import { Game, Stats } from './types';

export const getChessComGames = async (archive: string): Promise<Game[]> => {
  const { data } = await axios.get<{ games: Game[] }>(archive);
  return data.games.map((game: Game) => ({
    url: game.url,
    fen: game.fen,
    white: {
      rating: game.white?.rating ?? 0,
      result: game.white.result,
      username: game.white.username
    },
    black: {
      rating: game.black?.rating ?? 0,
      result: game.black.result,
      username: game.black.username
    },
    time_class: game.time_class,
    end_time: game.end_time
  }));
};

export const getChessComArchives = async (
  username: string
): Promise<string[]> => {
  const { data } = await axios.get<{ archives: string[] }>(
    `https://api.chess.com/pub/player/${username}/games/archives`
  );

  return data.archives.reverse();
};

export const getStats = async (username: string): Promise<Stats> => {
  const { data } = await axios.get<Stats>(
    `https://api.chess.com/pub/player/${username}/stats/`
  );
  return data;
};
