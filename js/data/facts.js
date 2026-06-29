export const SPORTS_FACTS = [
  'The fastest recorded soccer shot was 211 km/h (131 mph), struck by Ronny Heberson in 2006.',
  'Michael Jordan was cut from his high school varsity basketball team before becoming an NBA legend.',
  'Pelé is the only player to win three FIFA World Cups (1958, 1962, 1970).',
  'A regulation basketball must bounce between 49 and 54 inches when dropped from 6 feet.',
  'The original FIFA World Cup trophy was permanently awarded to Brazil after their third win in 1970.',
  'Wilt Chamberlain once scored 100 points in a single NBA game — a record that still stands.',
  'The offside rule in football was introduced in 1863, though it has evolved significantly since.',
  'The NBA three-point line was introduced in the 1979–80 season, revolutionizing modern basketball.',
  'Diego Maradona\'s "Hand of God" goal occurred during the 1986 World Cup quarter-final against England.',
  'The Boston Celtics and Los Angeles Lakers have combined for 34 NBA championships.',
  'Cristiano Ronaldo has scored in five different World Cup tournaments — a unique achievement.',
  'A football match lasts 90 minutes, but the average ball is in play for only about 60 minutes.',
  'The Harlem Globetrotters have played in over 120 countries since their founding in 1926.',
  'Lionel Messi has won the Ballon d\'Or a record eight times.',
  'The first official international football match was played between Scotland and England in 1872.',
];

export function getRandomFact() {
  return SPORTS_FACTS[Math.floor(Math.random() * SPORTS_FACTS.length)];
}
