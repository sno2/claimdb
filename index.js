/** @typedef {{ location: string; name: string; defendant: string; deadline?: string; description: string; link: string; source: number; status: number }} ClassAction */

import data from "./data.json" assert { type: "json" };

/** @type {Date} */
export const timeUpdated = new Date(data.timeUpdated);

/** @type {ClassAction[]} */
export const actions = data.actions;
