import { PRIMARY_SKILLS, SKILL_LEVELS } from './parse'

const FIRST = ['Ada', 'Linus', 'Grace', 'Alan', 'Margaret', 'Dennis', 'Barbara', 'Ken', 'Radia', 'Tim', 'Hedy', 'Guido', 'Katherine', 'Bjarne', 'Frances', 'Yukihiro', 'Shafi', 'Brendan', 'Sophie', 'Anders', 'Priya', 'Kiran', 'Sita', 'Ramesh', 'Aarav', 'Mina']
const LAST = ['Lovelace', 'Torvalds', 'Hopper', 'Turing', 'Hamilton', 'Ritchie', 'Liskov', 'Thompson', 'Perlman', 'Berners-Lee', 'Lamarr', 'van Rossum', 'Johnson', 'Stroustrup', 'Allen', 'Matsumoto', 'Goldwasser', 'Eich', 'Wilson', 'Hejlsberg', 'Shrestha', 'Thapa', 'Gurung', 'Rai', 'Karki', 'Adhikari']

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

let counter = 0

export function makeDemoParticipant() {
  counter += 1
  const name = `${pick(FIRST)} ${pick(LAST)}`
  const github = `${name.split(' ')[0].toLowerCase()}${counter}`
  const r = Math.random()
  return {
    id: `gh:${github}`,
    name,
    github,
    timestamp: new Date().toISOString(),
    level: r < 0.25 ? SKILL_LEVELS[0] : r < 0.6 ? SKILL_LEVELS[1] : SKILL_LEVELS[2],
    skill: pick(PRIMARY_SKILLS),
    track: pick(['AI Focus', 'Open Source', 'Web3', 'Climate']),
  }
}
