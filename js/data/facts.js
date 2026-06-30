export const SPORTS_FACTS = [
  // ── Football ──────────────────────────────────────────────────────────────
  'The fastest recorded soccer shot was 211 km/h (131 mph), struck by Ronny Heberson in 2006.',
  'Pelé is the only player to win three FIFA World Cups (1958, 1962, 1970).',
  'The original FIFA World Cup trophy was permanently awarded to Brazil after their third win in 1970.',
  'The offside rule in football was introduced in 1863, though it has evolved significantly since.',
  'Diego Maradona\'s "Hand of God" goal occurred during the 1986 World Cup quarter-final against England.',
  'Cristiano Ronaldo has scored in five different FIFA World Cup tournaments — a unique achievement.',
  'A football match lasts 90 minutes, but the average ball is in play for only about 60 minutes.',
  'Lionel Messi has won the Ballon d\'Or a record eight times.',
  'The first official international football match was played between Scotland and England in 1872.',
  'The 1950 World Cup final was watched by 199,854 fans at the Maracanã — the largest crowd in football history.',
  'Ronaldo (R9) scored 15 goals in World Cup finals tournaments, the most by any player until Miroslav Klose surpassed him.',
  'A standard football weighs between 410 and 450 grams (14–16 oz) and must be 68–70 cm in circumference.',
  'Zinedine Zidane won every major title in club and international football except the UEFA Champions League as a player — he then won it three times as a manager.',
  'Cameroon became the first African team to reach a World Cup quarter-final, at Italy 1990.',
  'The fastest goal in a World Cup match was scored by Hakan Şükür of Turkey — just 11 seconds into the 2002 third-place play-off.',
  'Only eight countries have ever won the FIFA World Cup — Brazil, Germany, Italy, Argentina, France, Uruguay, England, and Spain.',
  'Barcelona\'s tiki-taka style between 2008 and 2012, under Pep Guardiola, is widely considered the greatest era of club football.',
  'Roberto Carlos\'s free-kick against France in 1997 defied physics — the ball curved so sharply that even the goalkeeper stepped aside.',
  'At the 2014 World Cup, Germany beat Brazil 7–1 in the semi-final on Brazilian soil — an event Brazilians still call "O Mineirazo."',
  'Mohamed Salah scored in five consecutive Premier League seasons for Liverpool, cementing himself as one of the Premier League\'s greatest-ever players.',

  // ── Basketball ────────────────────────────────────────────────────────────
  'Michael Jordan was cut from his high school varsity basketball team before becoming an NBA legend.',
  'A regulation basketball must bounce between 49 and 54 inches when dropped from 6 feet.',
  'Wilt Chamberlain once scored 100 points in a single NBA game — a record that still stands.',
  'The NBA three-point line was introduced in the 1979–80 season, revolutionizing modern basketball.',
  'The Boston Celtics and Los Angeles Lakers have combined for 34 NBA championships.',
  'The Harlem Globetrotters have played in over 120 countries since their founding in 1926.',
  'LeBron James became the NBA\'s all-time leading scorer in February 2023, surpassing Kareem Abdul-Jabbar\'s 38-year record.',
  'Stephen Curry holds the all-time record for three-pointers made in NBA history, surpassing Ray Allen in 2021.',
  'The first NBA game was played on November 1, 1946, between the Toronto Huskies and the New York Knickerbockers.',
  'Basketball was invented in December 1891 by Dr. James Naismith, who used two peach baskets as the original hoops.',
  'Shaquille O\'Neal is one of the most dominant centers in NBA history — he once went 0-for-11 from the free-throw line in a single game.',
  'The shortest player in NBA history was Muggsy Bogues at just 5 ft 3 in (1.60 m).',
  'The NBA Finals MVP award is named the Bill Russell Trophy — after the Celtics legend who won 11 championships in 13 seasons.',
  'Giannis Antetokounmpo came to the NBA from Greece with almost no money — he became a two-time MVP and a champion by 2021.',
  'Kobe Bryant wore jersey number 24 late in his career because he felt it was one number higher than 23 — Michael Jordan\'s number — meaning he was constantly striving for more.',
  'The longest game in NBA history lasted 78 minutes of play across six overtimes — the Indianapolis Olympians vs. Rochester Royals in 1951.',
  'In 1992, the United States Olympic "Dream Team" — featuring Jordan, Magic, Bird, and others — won gold by an average margin of 44 points per game.',
  'Nikola Jokić is the only center to win three MVP awards since the Bill Russell era.',
  'The Golden State Warriors set the all-time NBA record for wins in a regular season with 73 in 2015–16.',
  'A basketball rim is exactly 10 feet (3.05 m) above the floor — a standard that has never changed since the sport was invented.',
];

export function getRandomFact() {
  return SPORTS_FACTS[Math.floor(Math.random() * SPORTS_FACTS.length)];
}
