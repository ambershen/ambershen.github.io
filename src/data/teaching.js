// Curated teaching videos. Keep source links and requested start times intact.
export const teachingGroups = [
  {id:'personal',title:'Tutorials & Walkthroughs',description:'Independent tutorials on creative coding, AI tools, and the process of making things.',videos:[
    {title:'Building TouchDesigner visuals with a learning agent',publisher:'Amber Shen · YouTube',youtube:'9q8RADG7Kv4',start:30,summary:'From visual references to TouchDesigner experiments and reusable skills with Hermes Desktop Agent and MiniMax M3.'},
    {title:'I Gave My AI Tutor Voices with Claude + Fish Audio',publisher:'Amber Shen · YouTube',youtube:'DV2_9JqypGo',summary:'Giving an AI tutor a voice with Claude and Fish Audio.'},
  ]},
  {id:'trae',title:'Developer Education',description:'Selected tutorials and technical walkthroughs created for TRAE.',videos:[
    {title:'Build a Mobile App with AI — TRAE SOLO Tutorial',youtube:'8oMr279F8c8',start:38,summary:'Building a mobile app with TRAE SOLO.'},
    {title:'Best Way to Build a Nano Banana App (with TRAE SOLO)',youtube:'9zk741ORViw',summary:'Building a Nano Banana app with TRAE SOLO.'},
    {title:'Intro to SOLO Coder',youtube:'yv7Kad0b0cg',start:167,summary:'An introduction to working with SOLO Coder.'},
    {title:'TRAE Skills Tutorial: How to Create and Use Agent Skills',youtube:'UJNPm6tCrnU',start:1,summary:'Creating and using agent skills, step by step.'},
    {title:'Vibe Coding Videos with TRAE: Create Animations with TRAE + Remotion',youtube:'vsaBixVs0Ic',start:23,summary:'Creating animations with TRAE and Remotion.'},
    {title:'Use Spec to Handle Complexity in Your Project',youtube:'yaLnFcUiFF4',start:187,summary:'Using spec-driven development to work through project complexity in TRAE.'},
    {title:'5 Ways TRAE Agent Can Transform How You Work',youtube:'q-C7Siiyiok',smallThumb:true,summary:'Exploring five ways to use TRAE Agent in a workflow.'},
  ]},
];

// The Teaching page leads with one video, then lists the rest by topic. Videos are named by YouTube id or X url.
export const teachingFeatured = 'DV2_9JqypGo';
export const teachingTopics = [
  {title:'Building apps',videos:['DV2_9JqypGo','8oMr279F8c8','9zk741ORViw']},
  {title:'Creative coding & visuals',videos:['9q8RADG7Kv4','vsaBixVs0Ic']},
  {title:'Agents & skills',videos:['UJNPm6tCrnU','yv7Kad0b0cg','yaLnFcUiFF4','q-C7Siiyiok']},
];
