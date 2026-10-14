export const SCENE_FIELDS = {
  everyday: [
    { key: 'based', label: 'Based in', placeholder: 'Your city' },
    { key: 'obsession', label: 'Little obsession', placeholder: 'The tiny thing you could talk about for hours' },
    { key: 'ask', label: 'Ask me about', placeholder: 'An easy way into your world' }
  ],
  creative: [
    { key: 'curiosity', label: 'Currently curious about', placeholder: 'A question you keep coming back to' },
    { key: 'making', label: 'On my workbench', placeholder: 'What are you experimenting with?' },
    { key: 'invitation', label: 'Let’s make', placeholder: 'An invitation for your next creative accomplice' }
  ],
  afterhours: [
    { key: 'zodiac', label: 'Zodiac', placeholder: 'Your sign' },
    { key: 'drink', label: 'Favorite drink', placeholder: 'Your usual order' },
    { key: 'mbti', label: 'MBTI', placeholder: 'Your four letters' }
  ]
};

// Upgrade the original prototype once, preserving personalized copy and URLs.
export function upgradeScenes(state) {
  let changed = false;
  for (const scene of state.scenes) {
    if (scene.kind) continue;
    changed = true;
    scene.kind = scene.id === 'creative' ? 'creative' : scene.id === 'afterhours' ? 'afterhours' : 'everyday';
    scene.details = {};
    if (scene.id === 'creative' && scene.title === 'Good ideas start with hello.' && scene.bio === 'I’m Amber. I love exploring where creativity and technology meet. Here’s a little of what I’m making.') {
      scene.eyebrow = 'LOOKING FOR A CREATIVE ACCOMPLICE';
      scene.title = 'What if we made something weird?';
      scene.bio = 'A little playground for ideas that don’t quite fit in a job title.';
      scene.details = { curiosity: 'Can everyday objects become playful little interfaces?', making: 'A bag charm with a whole little world inside it.', invitation: 'Something whimsical with code, art, and your weirdest idea.' };
      const portfolio = state.scenes.flatMap(s => s.links).find(l => l.url === 'https://ambershen.world/');
      scene.links = [{ label: 'Peek at this experiment', url: 'https://github.com/ambershen/nfc-tag-me' }, ...(portfolio ? [{ label: 'More things I’ve made', url: portfolio.url }] : [])];
    }
    if (scene.id === 'afterhours' && scene.title === 'A little more me.' && scene.bio === 'For the conversations that wander, the songs on repeat, and the people you’re happy you met. Add your favorite links here.') {
      scene.eyebrow = 'FOR A LITTLE OFFLINE CHEMISTRY';
      scene.title = 'You had me at hello.';
      scene.bio = 'You tapped the charm. Now make the first move.';
      const instagram = state.scenes.flatMap(s => s.links).find(l => /^https:\/\/(www\.)?instagram\.com\//.test(l.url));
      scene.links = instagram ? [{ label: 'Continue the plot on Instagram', url: instagram.url }] : [];
    }
  }
  return changed;
}
