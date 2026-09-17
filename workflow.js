export const workflows = {
  'ios-capture': {
    label: 'iPhone · Inspiration', title: 'Keep the idea. Find its place later.',
    scene: 'After a walk, a conversation, or a sudden connection: say enough to remember why it mattered.',
    steps: ['Open MeerKatta and begin a capture.', 'Speak one unfinished thought in your own words.', 'Review the text, save it, and return to it in your Library.'],
    prompt: 'Something I noticed today was… The reason I want to keep it is…',
    habit: 'Return to one saved thought when you next sit down to work.',
  },
  'ios-focus': {
    label: 'iPhone · Productive focus', title: 'Give that long reply a starting point.',
    scene: 'You know what you mean, but composing on a small keyboard keeps interrupting you.',
    steps: ['Try your first capture inside MeerKatta.', 'Say the point, the context, and what you need next.', 'Review the result and copy it into your reply. Try the MeerKatta keyboard after completing its setup.'],
    prompt: 'The main thing I want to say is… Here’s the context… Could we…',
    habit: 'Use one recurring long reply as your cue to speak a first draft.',
  },
  'mac-capture': {
    label: 'Mac · Inspiration', title: 'Catch the side thought without changing direction.',
    scene: 'A useful idea arrives while you’re working on something else. Give it a home and return to your focus.',
    steps: ['Open capture in MeerKatta.', 'Say the idea and why it matters without trying to finish it.', 'Save it in your Library, then return to the work in front of you.'],
    prompt: 'An idea for later… This connects to… The next thing to explore is…',
    habit: 'Review your saved thoughts at the end of one work session.',
  },
  'mac-focus': {
    label: 'Mac · Productive focus', title: 'Start the draft before editing the sentence.',
    scene: 'A blank email, document, or AI prompt is waiting. You can explain the intent before you can phrase it.',
    steps: ['Focus the destination text field after completing MeerKatta’s permissions setup.', 'Use your configured shortcut and speak the goal, context, and constraints.', 'Review the inserted draft for meaning and details before sending or running it.'],
    prompt: 'What I’m trying to achieve is… The important context is… Please keep…',
    habit: 'Pick one daily writing task and begin with a spoken draft.',
  },
};

const form = document.querySelector('#workflow-finder');
const result = document.querySelector('#workflow-result');
if (form && result) {
  const showWorkflow = (focus = false) => {
    const data = new FormData(form);
    const device = data.get('device');
    const intent = data.get('intent');
    const flow = workflows[`${device}-${intent}`];
    if (!flow) return;
    result.replaceChildren();
    const add = (tag, text, className) => {
      const node = document.createElement(tag);
      node.textContent = text;
      if (className) node.className = className;
      result.append(node);
      return node;
    };
    add('p', flow.label, 'eyebrow');
    add('h3', flow.title);
    add('p', flow.scene);
    const list = add('ol', '');
    flow.steps.forEach(step => {
      const item = document.createElement('li');
      item.textContent = step;
      list.append(item);
    });
    add('p', `Try this now: “${flow.prompt}”`);
    add('p', `Make it a habit: ${flow.habit}`);
    const link = add('a', 'Set up this workflow', 'btn-secondary');
    link.href = `/welcome/?device=${device}&intent=${intent}#first-capture`;
    if (focus) result.focus();
  };
  const params = new URLSearchParams(location.search);
  const selected = `${params.get('device')}-${params.get('intent')}`;
  if (workflows[selected]) {
    for (const name of ['device', 'intent']) {
      const field = form.elements.namedItem(name);
      field.value = params.get(name);
    }
    showWorkflow();
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    showWorkflow(true);
  });
}
