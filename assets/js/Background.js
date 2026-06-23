export function BGcircleTheme(isEnabled = true, themeVersion = "primary", animationSpeed = "normal") {
  if (!isEnabled) {
    $(".circles").addClass("d-none");
    return;
  }

  $(".circles").toggleClass("d-none", false);
  const validThemes = ["primary", "success", "danger", "warning", "light", "dark", "cv"];
  const validSpeeds = ["slow", "normal", "fast"];

  if (themeVersion.toLowerCase() === "random") {
    const randomThemes = validThemes.filter((theme) => theme !== "dark" && theme !== "light");
    themeVersion = randomThemes[Math.floor(Math.random() * randomThemes.length)];
  }

  const targetSpeed = validSpeeds.includes(animationSpeed.toLowerCase()) ? animationSpeed.toLowerCase() : "normal";
  const targetTheme = validThemes.includes(themeVersion.toLowerCase()) ? themeVersion.toLowerCase() : "primary";

  const $circles = [$(".circle1"), $(".circle2"), $(".circle3")];

  $circles.forEach(($circle, index) => {
    const dataSpeed = $circle.attr("data-speed");
    const isNormal = targetSpeed === "normal";
    if (isNormal) {
      if (dataSpeed) $circle.removeAttr("data-speed");
    } else if (dataSpeed !== targetSpeed) {
      $circle.attr("data-speed", targetSpeed);
    }

    const currentClass = `circle${index + 1}-${targetTheme}`;
    if ($circle.hasClass(currentClass)) return;

    $circle.removeClass(function (i, className) {
      return className.match(/circle\d+-(success|danger|warning|light|dark|cv|primary)/g)?.join(" ") || "";
    });

    $circle.addClass(`circle${index + 1}-${targetTheme}`);
  });
}
