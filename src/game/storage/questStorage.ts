/**
 * @file questStorage.ts
 * @author Hamza Al Farsi
 * @description
 *   Provides a session-based interface for tracking quest progress and paused steps.
 *   Internally uses the global `SessionInfo` object (`sStore`) from session.ts.
 *   Quest status can be: "Not Active", "Active", "Paused", or "Completed".
 * 
 *   Used across the quest logic, NPC interactions, and world-building systems
 *   to enable advanced state tracking, pause/resume behavior, and scene-specific adaptations.
 * 
 * @module QuestStorage
 * @created June 2025
 * @lastModified June 2025
 * 
 * @exports QuestStatus
 * @exports QuestProgress
 */
import { stage } from "../../jetlag/Stage";
import { SessionInfo } from "./session";
import { QuestNames } from "../quests/questNames";

/**
 * Represents the possible status of a quest.
 */
export type QuestStatus = "Not Active" | "Paused" | "Active" | "Completed";

/**
 * Represents the exact location where a quest was paused,
 * allowing it to resume from the same objective and step.
 */
export interface QuestProgress {
    objectiveIndex: number;
    stepIndex: number;
}

/**
 * Retrieves the current status of a quest.
 *
 * @param questName - The quest name (from QuestNames enum)
 * @returns The current status, or "Not Active" if unset
 */
export function getStatus(questName: QuestNames): QuestStatus {
    const s = stage.storage.getSession("sStore") as SessionInfo;
    return (s.questStatus[questName] ?? "Not Active") as QuestStatus;
}

/**
 * Sets or updates the current status of a quest.
 *
 * @param questName - The quest name
 * @param status - One of the defined QuestStatus values
 */
export function setStatus(questName: QuestNames, status: QuestStatus): void {
    const s = stage.storage.getSession("sStore") as SessionInfo;
    s.questStatus[questName] = status;
}

/**
 * Saves the paused progress of a quest to session storage.
 *
 * @param questName - The quest name
 * @param progress - The objective and step index to resume from
 */
export function setPausedProgress(questName: QuestNames, progress: QuestProgress): void {
    const s = stage.storage.getSession("sStore") as SessionInfo;
    s.pausedQuests[questName] = progress;
}

/**
 * Retrieves the paused progress for a specific quest.
 *
 * @param questName - The quest name
 * @returns QuestProgress object or undefined if not paused
 */
export function getPausedProgress(questName: QuestNames): QuestProgress | undefined {
    const s = stage.storage.getSession("sStore") as SessionInfo;
    return s.pausedQuests[questName];
}

/**
 * Removes the paused progress entry for a quest.
 *
 * @param questName - The quest name
 */
export function clearPausedProgress(questName: QuestNames): void {
    const s = stage.storage.getSession("sStore") as SessionInfo;
    delete s.pausedQuests[questName];
}