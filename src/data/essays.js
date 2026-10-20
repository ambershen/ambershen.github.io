import marketingBody from '../../experiments/petal-study/most-tech-startups-are-bad-at-marketing.txt?raw';
import articleBody from '../../experiments/petal-study/code-has-always-been-art.txt?raw';
import hotNerdsBody from '../../experiments/petal-study/tech-storytelling-hot-nerds.txt?raw';
// Essays / newsletter issues, oldest first. Bodies are plain text files.
export const articles=[
  {title:'Code Has Always Been Art (We Just Forgot)',route:'#writing/code-has-always-been-art',body:articleBody},
  {title:'Tech storytelling in 2026 belongs to hot nerds',route:'#writing/tech-storytelling-in-2026-belongs-to-hot-nerds',body:hotNerdsBody,
    headings:['The old deal','AI Killed the Stereotype','Tech storytelling in East×West','How to be a Hot Nerd in 2026'],
    subheadings:['书呆子 vs hot nerd','Kung Fu Masters vs Stage-Ready Founders','How both cultures are shifting'],
    bullets:['Socially awkward','Aesthetically challenged','More comfortable with terminals than humans','The opposite of having an aura.']},
  {title:'most tech startups are bad at marketing.',route:'#writing/most-tech-startups-are-bad-at-marketing',body:marketingBody}
];
