import confetti from "canvas-confetti";

export function celebrate(origin: { x: number; y: number } = { x: 0.5, y: 0.45 }) {
  const colors = ["#3fd8e0", "#a98bff", "#ffc75a", "#ffffff"];
  confetti({ particleCount: 90, spread: 70, origin, colors, scalar: 0.9 });
  window.setTimeout(
    () => confetti({ particleCount: 60, spread: 110, origin, colors, scalar: 0.7 }),
    180,
  );
}
