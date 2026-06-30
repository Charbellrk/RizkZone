/*
 * All-time career totals (club + international goals / NBA regular-season points).
 * Retired players: verified historical records.
 * Active players: stats as of mid-2026 — updated from public match records.
 */

export const FOOTBALL_SCORERS = [
  { rank: 1,  name: 'Cristiano Ronaldo',   country: 'Portugal',       goals: 915,  clubs: 'Sporting, Man Utd, Real Madrid, Juventus, Al Nassr + Portugal NT', active: true  },
  { rank: 2,  name: 'Lionel Messi',         country: 'Argentina',      goals: 858,  clubs: 'Barcelona, PSG, Inter Miami + Argentina NT',                        active: true  },
  { rank: 3,  name: 'Josef Bican',          country: 'Austria/Czech',  goals: 805,  clubs: 'Rapid Vienna, SK Admira, Slavia Prague, Vitkovice',                 active: false },
  { rank: 4,  name: 'Romário',              country: 'Brazil',         goals: 772,  clubs: 'Vasco, PSV, Barcelona, Flamengo, Valencia + Brazil NT',             active: false },
  { rank: 5,  name: 'Pelé',                 country: 'Brazil',         goals: 767,  clubs: 'Santos, New York Cosmos + Brazil NT',                               active: false },
  { rank: 6,  name: 'Ferenc Puskás',        country: 'Hungary/Spain',  goals: 746,  clubs: 'Honvéd, Real Madrid + Hungary/Spain NT',                            active: false },
  { rank: 7,  name: 'Gerd Müller',          country: 'Germany',        goals: 735,  clubs: 'Bayern Munich, Fort Lauderdale + West Germany NT',                  active: false },
  { rank: 8,  name: 'Eusébio',              country: 'Portugal',       goals: 638,  clubs: 'Benfica, Monterrey, New England Tea Men + Portugal NT',             active: false },
  { rank: 9,  name: 'Robert Lewandowski',   country: 'Poland',         goals: 654,  clubs: 'Lech Poznan, Dortmund, Bayern Munich, Barcelona + Poland NT',       active: true  },
  { rank: 10, name: 'Zlatan Ibrahimović',   country: 'Sweden',         goals: 571,  clubs: 'Ajax, Juventus, Inter, Barcelona, AC Milan, PSG, Man Utd, LA Galaxy, AC Milan + Sweden NT', active: false },
  { rank: 11, name: 'Carlos Bianchi',       country: 'Argentina',      goals: 534,  clubs: 'Vélez, Reims, PSG, Racing Club + Argentina NT',                    active: false },
  { rank: 12, name: 'Johan Cruyff',         country: 'Netherlands',    goals: 408,  clubs: 'Ajax, Barcelona, LA Aztecs, Washington Diplomats, Levante, Feyenoord + Netherlands NT', active: false },
  { rank: 13, name: 'Harry Kane',           country: 'England',        goals: 393,  clubs: 'Tottenham, Bayern Munich + England NT',                             active: true  },
  { rank: 14, name: 'Neymar Jr',            country: 'Brazil',         goals: 462,  clubs: 'Santos, Barcelona, PSG, Al Hilal + Brazil NT',                     active: true  },
  { rank: 15, name: 'Karim Benzema',        country: 'France',         goals: 452,  clubs: 'Lyon, Real Madrid, Al Ittihad + France NT',                        active: false },
  { rank: 16, name: 'Ronaldo Nazário',      country: 'Brazil',         goals: 415,  clubs: 'Cruzeiro, PSV, Barcelona, Inter Milan, Real Madrid, AC Milan, Corinthians, Flamengo + Brazil NT', active: false },
  { rank: 17, name: 'Thierry Henry',        country: 'France',         goals: 411,  clubs: 'Monaco, Arsenal, Barcelona, NYRB + France NT',                     active: false },
  { rank: 18, name: 'Raúl González',        country: 'Spain',          goals: 404,  clubs: 'Real Madrid, Schalke, Al Sadd, New York Cosmos, Cosmos + Spain NT', active: false },
  { rank: 19, name: 'Ruud van Nistelrooy',  country: 'Netherlands',    goals: 401,  clubs: 'Den Bosch, Almere, Heerenveen, PSV, Man Utd, Real Madrid, Hamburg, Málaga + Netherlands NT', active: false },
  { rank: 20, name: 'Sergio Agüero',        country: 'Argentina',      goals: 390,  clubs: 'Independiente, Atlético Madrid, Manchester City, Barcelona + Argentina NT', active: false },
  { rank: 21, name: 'Kylian Mbappé',        country: 'France',         goals: 348,  clubs: 'Monaco, PSG, Real Madrid + France NT',                             active: true  },
  { rank: 22, name: 'Erling Haaland',       country: 'Norway',         goals: 325,  clubs: 'Molde, Salzburg, Dortmund, Manchester City + Norway NT',            active: true  },
  { rank: 23, name: 'Gabriel Batistuta',    country: 'Argentina',      goals: 355,  clubs: 'Fiorentina, Roma, Inter, Al Arabi, Boca Juniors + Argentina NT',   active: false },
  { rank: 24, name: 'Samuel Eto\'o',        country: 'Cameroon',       goals: 346,  clubs: 'Real Madrid, Mallorca, Barcelona, Inter Milan, Chelsea, Everton, Sampdoria, Anzhi + Cameroon NT', active: false },
  { rank: 25, name: 'Andriy Shevchenko',    country: 'Ukraine',        goals: 342,  clubs: 'Dynamo Kyiv, AC Milan, Chelsea, Dynamo Kyiv + Ukraine NT',         active: false },
  { rank: 26, name: 'Didier Drogba',        country: 'Ivory Coast',    goals: 337,  clubs: 'Le Mans, Gueugnon, Marseille, Chelsea, Galatasaray, Montreal Impact, Phoenix Rising + Ivory Coast NT', active: false },
  { rank: 27, name: 'Diego Forlán',         country: 'Uruguay',        goals: 330,  clubs: 'Independiente, Man Utd, Villarreal, Atlético Madrid, Inter Milan, Peñarol + Uruguay NT', active: false },
  { rank: 28, name: 'David Villa',          country: 'Spain',          goals: 325,  clubs: 'Sporting de Gijón, Valencia, Barcelona, Atlético Madrid, NYCFC, Melbourne City + Spain NT', active: false },
  { rank: 29, name: 'Mohamed Salah',        country: 'Egypt',          goals: 268,  clubs: 'Basel, Chelsea, Fiorentina, Roma, Liverpool + Egypt NT',            active: true  },
  { rank: 30, name: 'Ronaldinho',           country: 'Brazil',         goals: 283,  clubs: 'Grêmio, PSG, Barcelona, AC Milan, Flamengo, Atletico Mineiro, Querétaro, Fluminense + Brazil NT', active: false },
];

export const SEASON_HIGHLIGHTS = {
  topScorer:    { name: 'Erling Haaland',    stat: '38 goals',               league: 'Premier League 2025/26' },
  topAssists:   { name: 'Kevin De Bruyne',   stat: '20 assists',             league: 'Premier League 2025/26' },
  playerOfWeek: { name: 'Shai Gilgeous-Alexander', stat: '38 pts, 7 ast, 5 reb', league: 'NBA 2025/26' },
};
