import { writable } from 'svelte/store';
import { dev } from '$app/environment';
// Environment
export const api = 'https://api.deepwoken.co'
//
export const data = writable({
    talents: {},
    mantras: {},
    weapons: {},
    enchants: {}
}); 
export const tagStats = writable({
    categorized: {},
    lastUpdated: null,
    isLoading: true
});
export const isPrivate = writable(false);
// User data
export const user = writable();
export const builds = writable([]);
//
export const preShrineStore = writable();
export const postShrineStore = writable();
//
export const tagsStore = writable([]);
export const statsStore = writable();
export const racialStatsStore = writable({});
export const attributesStore = writable();
export const takenTalentsStore = writable();
export const takenMantrasStore = writable();
export const takenRollableMantrasStore = writable([]);
export const takenWeapon = writable();
export const takenEnchant = writable();
export const takenMotif = writable();
//
export const mantraModifications = writable({});
export const favoritedTalents = writable([]);
//
export const notes = writable("");
// export const talents = writable({})