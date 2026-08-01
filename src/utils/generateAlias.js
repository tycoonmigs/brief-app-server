// src/utils/generateAlias.js
const adjectives = ['Silent', 'Hidden', 'Swift', 'Shadow', 'Cryptic', 'Quiet', 'Rogue', 'Phantom'];
const nouns = ['Fox', 'Wolf', 'Raven', 'Hawk', 'Ghost', 'Cipher', 'Nomad', 'Falcon'];

const generateAlias = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 100);
  return `${adjective}${noun}${number}`; // e.g. "SilentFox82"
};

export default generateAlias;