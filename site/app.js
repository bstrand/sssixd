(() => {
  const config = window.SITE_CONFIG ?? {};
  const status = window.SITE_STATUS ?? {};

  const subject = String(config.subject ?? "X").trim();
  const rawAnswer = String(status.answer ?? "Unknown").trim();
  const answer = rawAnswer.replace(/[.!?]+$/, "");
  const checkedAt = status.checkedAt ? new Date(status.checkedAt) : null;

  const question = `Is ${subject} Dead?`;
  document.getElementById("question").textContent = question;
  document.getElementById("answer").textContent = `${answer}.`;
  document.title = question;

  const timeEl = document.getElementById("last-checked");

  if (!checkedAt || Number.isNaN(checkedAt.getTime())) {
    timeEl.textContent = "Never";
    timeEl.removeAttribute("datetime");
    return;
  }

  timeEl.dateTime = checkedAt.toISOString();

  const locale = config.locale || "en-US";
  const timeZone = config.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const datePart = new Intl.DateTimeFormat(locale, {
    timeZone,
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(checkedAt);

  const timePart = new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(checkedAt);

  timeEl.textContent = `${datePart}  ${timePart}`;
})();
