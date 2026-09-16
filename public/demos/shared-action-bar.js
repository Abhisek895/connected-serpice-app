(function() {
  // Inject CSS
  var style = document.createElement('style');
  style.innerHTML = `
    .recipient-action-bar {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      width: 90%;
      max-width: 384px;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 8px;
      border-radius: 1rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      animation: barSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
    }
    
    @keyframes barSlideUp {
      from { opacity: 0; transform: translate(-50%, 100px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }
    
    .recipient-action-bar-primary {
      flex: 1;
      background-color: #25D366;
      color: white;
      border: none;
      padding: 10px 12px;
      border-radius: 0.75rem;
      font-weight: 500;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 10px 15px -3px rgba(37, 211, 102, 0.2);
      transition: background-color 0.2s;
      text-decoration: none;
    }
    .recipient-action-bar-primary:hover { background-color: #1ebd57; }
    
    .recipient-action-bar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .recipient-action-bar-icon {
      background: rgba(255, 255, 255, 0.05);
      border: none;
      padding: 10px;
      border-radius: 0.75rem;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
      text-decoration: none;
    }
    .recipient-action-bar-icon:hover { background: rgba(255, 255, 255, 0.1); }
    .recipient-action-bar-icon svg { width: 18px; height: 18px; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; fill: none; }
  `;
  document.head.appendChild(style);

  // SVG Icons
  const msgIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/><path d="M11.6 16.8a2.5 2.5 0 0 1-3.2-3.2l3.2 3.2z"/><path d="M11 11a2.5 2.5 0 0 1 3.2-3.2l-3.2 3.2z"/></svg>';
  const shareIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';
  const copyIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  const cameraIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>';

  // Create Container
  var bar = document.createElement('div');
  bar.className = 'recipient-action-bar';
  
  // Primary Button routes to creation flow since it's a static demo
  var createUrl = 'https://ourstory.love/?ref=demo_action_bar';
  
  bar.innerHTML = `
    <div style="flex: 1; position: relative; z-index: 10;">
      <a href="${createUrl}" class="recipient-action-bar-primary">
        ${msgIcon}
        <span class="btn-text" style="margin-left: 4px;">WhatsApp</span>
      </a>
    </div>
    <div class="recipient-action-bar-actions" style="position: relative; z-index: 10;">
      <a href="${createUrl}" class="recipient-action-bar-icon" aria-label="Share">
        ${shareIcon}
      </a>
      <a href="${createUrl}" class="recipient-action-bar-icon" aria-label="Copy">
        ${copyIcon}
      </a>
      <a href="${createUrl}" class="recipient-action-bar-icon" aria-label="Save Image">
        ${cameraIcon}
      </a>
    </div>
  `;
  
  // Remove existing watermark badge if present to avoid overlap
  var oldBadge = document.getElementById('ourstory-badge');
  if (oldBadge) {
    oldBadge.remove();
  }
  
  document.body.appendChild(bar);
})();
