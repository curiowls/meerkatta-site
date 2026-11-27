export const workflows = {
  'ios-capture': {
    label: 'iPhone or iPad · Inspiration', title: 'Keep the idea. Find its place later.',
    scene: 'After a walk, a conversation, or a sudden connection: say enough to remember why it mattered.',
    steps: ['Open MeerKatta and begin a capture.', 'Speak one unfinished thought in your own words.', 'Review the text, save it, and return to it in your Library.'],
    prompt: 'Something I noticed today was… The reason I want to keep it is…',
    habit: 'Return to one saved thought when you next sit down to work.',
  },
  'ios-focus': {
    label: 'iPhone or iPad · Productive focus', title: 'Give that long reply a starting point.',
    scene: 'You know what you mean, but typing and editing keep interrupting you.',
    steps: ['Try your first capture inside MeerKatta.', 'Say the point, the context, and what you need next.', 'Review the result and copy it into your reply. Try the MeerKatta keyboard after completing its setup.'],
    prompt: 'The main thing I want to say is… Here’s the context… Could we…',
    habit: 'Use one recurring long reply as your cue to speak a first draft.',
  },
  'watch-capture': {
    label: 'Apple Watch · Inspiration', title: 'Keep the detail on your wrist. Return on iPhone.',
    scene: 'On the stair stepper, on a walk, or away from your phone: save one passing thought before it disappears.',
    steps: ['Tap the MeerKatta complication on your Watch face to open capture.', 'Tap record, speak the rough detail, and tap stop until you see Safe on your Watch.', 'When it reaches your paired iPhone, read the cleaned note in your Library.'],
    prompt: 'One detail I want to keep for later is… It matters because…',
    habit: 'Review one Watch capture in your iPhone Library when you next sit down.',
    ctaHref: '/use-cases/voice-notes-apple-watch/#setup',
    ctaLabel: 'Set up Apple Watch capture',
  },
  'watch-focus': {
    label: 'Apple Watch · Productive focus', title: 'Speak the rough points now. Send the draft from iPhone.',
    scene: 'An email reply or plan clicks while you are away from your desk. Do not compose it on a small screen—capture the backbone first.',
    steps: ['Open MeerKatta from your Watch face complication and tap record.', 'Speak the main point, context, and next step you want to remember.', 'Wait for transfer and processing on your paired iPhone, then review and copy the cleaned draft.'],
    prompt: 'For Maya’s reply later: the main point is… Also remember to ask…',
    habit: 'Use your Watch to catch the outline before you sit back down at your phone or Mac.',
    ctaHref: '/use-cases/voice-notes-apple-watch/#handoff',
    ctaLabel: 'See Watch-to-iPhone handoff',
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
    const link = add('a', flow.ctaLabel || 'Set up this workflow', 'btn-secondary');
    link.href = flow.ctaHref || `/welcome/?device=${device}&intent=${intent}#first-capture`;
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
