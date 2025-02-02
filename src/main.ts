import { getInput } from '@actions/core';
import * as fs from 'fs';
import { getStats } from './api';
import { Stats } from './types';
import {
  commitFile,
  END_TOKEN,
  formatGamesTable,
  formatStatsTable,
  getGames,
  INFO_LINE,
  setFailure,
  START_TOKEN
} from './uti';

// Public parameters
export const CHESS_USERNAME = getInput('CHESS_USERNAME');
export const GAMES_SIZE = parseInt(getInput('GAMES_SIZE')) || 10;
export const SHOW_DATE = getInput('SHOW_DATE') === 'true';
export const SHOW_FEN = getInput('SHOW_FEN') === 'true';
export const COMMIT_MSG = getInput('COMMIT_MSG');
export const IS_DEBUG = getInput('IS_DEBUG') === 'true';
export const FILE_NAME = getInput('FILE_NAME');
export const SHOW_STATS = getInput('SHOW_STATS') === 'true';
export const SHOW_TIME_CLASS = getInput('SHOW_TIME_CLASS') === 'true';

async function run(): Promise<void> {
  try {
    const content: string[] = [];

    if (SHOW_STATS) {
      const stats: Stats = await getStats(CHESS_USERNAME);
      content.push(formatStatsTable(stats));
    }

    const games = await getGames(CHESS_USERNAME, GAMES_SIZE);
    if (games.length === 0) {
      throw new Error('No games found!');
    }
    content.push(
      formatGamesTable(
        games,
        CHESS_USERNAME,
        SHOW_DATE,
        SHOW_FEN,
        SHOW_TIME_CLASS
      )
    );

    console.log(games.length + ' games found!');

    // Write the games to the README.md file
    const readmeContent = fs.readFileSync('./' + FILE_NAME, 'utf-8');

    const startIndex = readmeContent.indexOf(START_TOKEN);
    if (startIndex === -1) {
      throw new Error(
        `Couldn't find the START_TOKEN ${START_TOKEN} - Exiting!`
      );
    }

    const endIndex = readmeContent.indexOf(END_TOKEN);
    if (endIndex === -1) {
      throw new Error(`Couldn't find the END_TOKEN ${END_TOKEN} - Exiting!`);
    }

    const oldPart = readmeContent.slice(startIndex, endIndex);

    const readmeSafeParts = readmeContent.split(oldPart);

    const newReadme = `${
      readmeSafeParts[0]
    }${START_TOKEN}\n${INFO_LINE}\n${content.join('\n')}\n${
      readmeSafeParts[1]
    }`;

    fs.writeFileSync('./' + FILE_NAME, newReadme);
    if (!IS_DEBUG) {
      try {
        await commitFile();
      } catch (err) {
        if (err instanceof Error) {
          throw err;
        } else {
          throw new Error("Couldn't commit the file");
        }
      }
    }

    console.log('Successfully updated the README file!');
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'The action failed with an Unknown error';

    setFailure(errorMessage);
  }
}

run();
