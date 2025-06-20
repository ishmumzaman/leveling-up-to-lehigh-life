/**
 * @file questStorage.ts
 * @author Hamza Al Farsi
 * @description
 *   Handles persistent tracking of quest status and progress using browser sessionStorage.
 *   This module provides read/write utilities to manage each quest's active state and
 *   exact progression point across objectives and steps.
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
 * @exports QuestStorage
 */

/**
 * Represents the status of a quest.
 */
export type QuestStatus = "Not Active" | "Paused" | "Active" | "Completed";

/**
 * Represents a paused quest's position.
 */
export interface QuestProgress {
    objectiveIndex: number;
    stepIndex: number;
}

/**
 * Manages quest progress and status using sessionStorage.
 */
export class QuestStorage {
    private static statusKey = "questStatuses";
    private static progressKey = "pausedProgress";

    /**
     * Returns the status of all quests.
     */
    static getStatuses(): Record<string, QuestStatus> {
        const json = sessionStorage.getItem(this.statusKey);
        return json ? JSON.parse(json) : {};
    }

    /**
     * Gets the status of a specific quest.
     * @param questName - Name of the quest
     */
    static getStatus(questName: string): QuestStatus {
        return this.getStatuses()[questName] ?? "Not Active";
    }

    /**
     * Sets the status of a quest.
     * @param questName - Name of the quest
     * @param status - Status to assign
     */
    static setStatus(questName: string, status: QuestStatus): void {
        const statuses = this.getStatuses();
        statuses[questName] = status;
        sessionStorage.setItem(this.statusKey, JSON.stringify(statuses));
    }

    /**
     * Returns all quest progress records.
     */
    static getProgress(): Record<string, QuestProgress> {
        const json = sessionStorage.getItem(this.progressKey);
        return json ? JSON.parse(json) : {};
    }

    /**
     * Returns saved progress for a specific quest.
     * @param questName - Name of the quest
     */
    static getProgressFor(questName: string): QuestProgress | null {
        return this.getProgress()[questName] ?? null;
    }

    /**
     * Saves the progress of a quest.
     * @param questName - Name of the quest
     * @param progress - Object with objectiveIndex and stepIndex
     */
    static saveProgress(questName: string, progress: QuestProgress): void {
        const fullProgress = this.getProgress();
        fullProgress[questName] = progress;
        sessionStorage.setItem(this.progressKey, JSON.stringify(fullProgress));
    }
}
