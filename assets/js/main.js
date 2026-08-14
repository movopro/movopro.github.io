document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".hero");
  const heroContent = document.querySelector("[data-tilt]");
  const heroBg = document.querySelector(".hero__bg");
  const heroImage = document.querySelector(".hero__frame img");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!hero || !heroContent || reduceMotion || !canHover) return;

  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let rafId = null;

  const animate = () => {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    heroContent.style.transform =
      `rotateY(${currentX * 7}deg) rotateX(${currentY * -7}deg) translateZ(0)`;

    if (heroBg) {
      heroBg.style.transform =
        `scale(1.05) translate(${currentX * -14}px, ${currentY * -14}px)`;
    }

    if (heroImage) {
      heroImage.style.transform =
        `scale(1.1) translate(${currentX * -10}px, ${currentY * -10}px)`;
    }

    rafId = requestAnimationFrame(animate);
  };

  hero.addEventListener("mousemove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    targetX = (x - 0.5) * 2;
    targetY = (y - 0.5) * 2;

    if (!rafId) animate();
  });

  hero.addEventListener("mouseleave", () => {
    targetX = 0;
    targetY = 0;
  });
});
