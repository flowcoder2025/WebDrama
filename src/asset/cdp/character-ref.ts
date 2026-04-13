import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { RefStore } from "../../common/types.js";

const REF_FILE = "character-refs.json";

export function loadRefStore(projectDir: string): RefStore {
  const filepath = resolve(projectDir, REF_FILE);
  if (!existsSync(filepath)) {
    return { characters: {} };
  }
  const raw = readFileSync(filepath, "utf-8");
  return JSON.parse(raw) as RefStore;
}

export function saveRefStore(projectDir: string, store: RefStore): void {
  const filepath = resolve(projectDir, REF_FILE);
  writeFileSync(filepath, JSON.stringify(store, null, 2), "utf-8");
}

export function updateCharacterReference(
  store: RefStore,
  characterId: string,
  referenceImageUrl: string,
  referenceName: string,
): RefStore {
  return {
    characters: {
      ...store.characters,
      [characterId]: {
        characterId,
        referenceImageUrl,
        referenceName,
        registeredAt: new Date().toISOString(),
      },
    },
  };
}

export function getCharacterReferenceIds(store: RefStore, characterId: string): string[] {
  return store.characters[characterId] ? [characterId] : [];
}

export function hasReference(store: RefStore, characterId: string): boolean {
  return !!store.characters[characterId];
}

export function getReferenceName(store: RefStore, characterId: string): string {
  return store.characters[characterId]?.referenceName ?? "";
}
