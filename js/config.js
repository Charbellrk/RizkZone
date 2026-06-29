export const API_BASE = 'https://www.thesportsdb.com/api/v1/json/3';

export const FOOTBALL_LEAGUES = {
  all: { id: null, name: 'All Leagues' },
  premier: { id: '4328', name: 'Premier League' },
  laliga: { id: '4335', name: 'La Liga' },
  seriea: { id: '4332', name: 'Serie A' },
  bundesliga: { id: '4331', name: 'Bundesliga' },
  ligue1: { id: '4334', name: 'Ligue 1' },
  champions: { id: '4480', name: 'Champions League' },
  worldcup: { id: '4429', name: 'FIFA World Cup' },
};

export const NBA_LEAGUE_ID = '4387';

export const MATCH_LIMIT_GUEST = 9;
export const MATCH_LIMIT_USER = 15;

export const LEAGUE_IDS = Object.values(FOOTBALL_LEAGUES)
  .filter((l) => l.id)
  .map((l) => l.id);
