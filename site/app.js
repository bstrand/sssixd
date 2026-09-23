(() => {
  const config = window.SITE_CONFIG ?? {};

  const subject = String(config.subject ?? "X").trim();
  const rawAnswer = String(config.answer ?? "No").trim();
  const answer = rawAnswer.replace(/[.!?]+$/, "");
  const checkedAt = config.lastChecked ? new Date(config.lastChecked) : new Date();

  const question = `Is ${subject} Dead?`;
  const answerText = `${answer}.`;

  document.getElementById("question").textContent = question;
  document.getElementById("answer").textContent = answerText;
  document.title = question;

  const timeEl = document.getElementById("last-checked");

  if (Number.isNaN(checkedAt.getTime())) {
    timeEl.textContent = "Unknown";
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
