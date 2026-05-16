import type { PlasmoCSConfig } from "plasmo";
import { matchesKeywords, inferRole, type ScrapedProfile } from "~lib/filter";

export const config: PlasmoCSConfig = {
  matches: ["https://www.linkedin.com/*"],
  run_at: "document_idle",
};

const MAX_BATCH = 20;

// TODO: LinkedIn changes class names often. Tune these selectors when scraping breaks.
function scrape(): ScrapedProfile[] {
  const cards = document.querySelectorAll<HTMLElement>(
    'li.reusable-search__result-container, div.entity-result'
  );
  const out: ScrapedProfile[] = [];
  cards.forEach((card) => {
    const link = card.querySelector<HTMLAnchorElement>('a[href*="/in/"]');
    const nameEl = card.querySelector<HTMLElement>('.entity-result__title-text a span[aria-hidden="true"]');
    const headlineEl = card.querySelector<HTMLElement>('.entity-result__primary-subtitle');
    const statusEl = card.querySelector<HTMLElement>('button.artdeco-button span');
    if (!link || !nameEl) return;
    const profileUrl = link.href.split("?")[0];
    out.push({
      profileUrl,
      name: nameEl.innerText.trim(),
      headline: headlineEl?.innerText.trim() ?? "",
      connectionStatus: statusEl?.innerText.trim() ?? "",
    });
  });
  return out.slice(0, MAX_BATCH);
}

/** Autofill LinkedIn's compose textarea. We never click Send. */
function autofillMessage(text: string): boolean {
  const box = document.querySelector<HTMLElement>(
    'div.msg-form__contenteditable[contenteditable="true"], textarea[name="message"]'
  );
  if (!box) return false;
  if (box instanceof HTMLTextAreaElement) {
    box.value = text;
    box.dispatchEvent(new Event("input", { bubbles: true }));
  } else {
    box.focus();
    box.innerText = text;
    box.dispatchEvent(new InputEvent("input", { bubbles: true }));
  }
  return true;
}

// Bridge from popup → content script
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "SCRAPE") {
    const all = scrape();
    sendResponse({ all, matched: all.filter(matchesKeywords).map((p) => ({ ...p, role: inferRole(p.headline) })) });
    return true;
  }
  if (msg.type === "AUTOFILL") {
    sendResponse({ ok: autofillMessage(msg.text) });
    return true;
  }
});
