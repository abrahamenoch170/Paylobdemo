// Minimal AI store stub for components that reference it
// In the Next.js app, AiPanel manages its own state directly

let _openAi: () => void = () => {};

export function useAiStore(selector: (state: { openAi: () => void }) => any) {
  return selector({ openAi: _openAi });
}
