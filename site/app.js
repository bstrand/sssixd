(() => {
  const config = window.SITE_CONFIG;
  const status = window.SITE_STATUS;

  const subject =
    config?.subject ?? "X";

  const answer =
    status?.answer ?? "Unknown";

  const question =
    `Is ${subject} Dead Yet?`;

  document.title = question;

  document
    .getElementById("question")
    .textContent = question;

  document
    .getElementById("answer")
    .textContent = `${answer}.`;

  const time =
    document.getElementById("last-checked");

  if (!status?.checkedAt) {
    time.textContent = "Not yet checked";
    return;
  }

  const checked =
    new Date(status.checkedAt);

  const date =
    new Intl.DateTimeFormat(
      config.locale ?? "en-US",
      {
        timeZone:
          config.timeZone ??
          "America/Detroit",
        month: "long",
        day: "numeric",
        year: "numeric"
      }
    ).format(checked);

  const clock =
    new Intl.DateTimeFormat(
      config.locale ?? "en-US",
      {
        timeZone:
          config.timeZone ??
          "America/Detroit",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short"
      }
    ).format(checked);

  time.textContent =
    `${date}  ${clock}`;
})();