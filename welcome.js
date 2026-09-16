import {workflows} from './workflow.js';
const params = new URLSearchParams(location.search);
const device = params.get('device');
const intent = params.get('intent');
const flow = workflows[`${device}-${intent}`];
const target = document.querySelector('#selected-workflow');
if (flow && target) {
  target.hidden = false;
  target.className = 'workflow-result';
  const title = document.createElement('h3');
  title.textContent = flow.title;
  const label = document.createElement('p');
  label.className = 'eyebrow';label.textContent=flow.label;
  const prompt = document.createElement('p');prompt.textContent=`Your first try: “${flow.prompt}”`;
  const habit = document.createElement('p');habit.textContent=flow.habit;
  const change = document.createElement('a');change.href='/use-cases/#finder-title';change.textContent='Choose a different workflow →';
  const scene = document.createElement('p');scene.textContent=flow.scene;
  const steps = document.createElement('ol');
  flow.steps.forEach(text => {const step=document.createElement('li');step.textContent=text;steps.append(step);});
  target.append(label,title,scene,steps,prompt,habit,change);
  document.querySelectorAll('[data-device-guide]').forEach(guide => guide.hidden=guide.dataset.deviceGuide!==device);
}
