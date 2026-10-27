import './contact.css';

if (!new URLSearchParams(location.search).has('embed')) {
  const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT || 'https://mwfdtxlqherngwjxbsgq.supabase.co/functions/v1/contact';
  const launcher = document.createElement('button');
  launcher.className = 'contact-launcher';
  launcher.textContent = 'Say hello';
  launcher.setAttribute('aria-haspopup', 'dialog');
  launcher.setAttribute('aria-controls', 'contact-dialog');
  const dialog = document.createElement('dialog');
  dialog.id = 'contact-dialog';
  dialog.className = 'contact-dialog';
  dialog.setAttribute('aria-labelledby', 'contact-title');
  dialog.innerHTML = `<button type="button" class="contact-close" aria-label="Close contact form">×</button>
    <h2 id="contact-title">Say hello.</h2>
    <p>A question, an idea, or just a hello.</p>
    <form>
      <label for="contact-email">Your email</label>
      <input id="contact-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" maxlength="254" required>
      <label for="contact-message">Your message</label>
      <textarea id="contact-message" name="message" placeholder="What’s on your mind?" rows="5" minlength="2" maxlength="5000" required></textarea>
      <div class="contact-trap" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
      <button class="contact-send" type="submit">Send message</button>
      <p class="contact-status" role="status" aria-live="polite"></p>
    </form>`;
  document.body.append(launcher, dialog);
  let opener = launcher;
  function open(trigger) { opener = trigger; if (!dialog.open) dialog.showModal(); }
  launcher.addEventListener('click', () => open(launcher));
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-contact]');
    if (trigger) { event.preventDefault(); open(trigger); }
  });
  dialog.querySelector('.contact-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => opener?.focus());
  const form = dialog.querySelector('form');
  const status = dialog.querySelector('.contact-status');
  let requestId = crypto.randomUUID();
  form.addEventListener('input', () => { requestId = crypto.randomUUID(); });
  const send = dialog.querySelector('.contact-send');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity() || send.disabled) return;
    if (!endpoint) { status.textContent = 'Sending is not available yet. Please try again later.'; return; }
    send.disabled = true;
    send.textContent = 'Sending…';
    status.textContent = '';
    try {
      const response = await fetch(endpoint, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({...Object.fromEntries(new FormData(form)), requestId}),
        signal: AbortSignal.timeout(15000),
      });
      if (response.status === 429) { status.textContent = 'Please wait a little before sending another message.'; return; }
      if (!response.ok || !(await response.json()).ok) throw new Error('Send failed');
      status.textContent = 'Thank you — your message has been sent.';
      form.reset();
      requestId = crypto.randomUUID();
    } catch {
      status.textContent = 'Your message could not be sent. Please try again; your draft is still here.';
    } finally { send.disabled = false; send.textContent = 'Send message'; }
  });
}
