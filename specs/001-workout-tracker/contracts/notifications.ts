/**
 * Notifications API Contracts
 *
 * TypeScript interfaces for Capacitor Local Notifications API wrapper.
 * Handles lock screen timer notifications with action buttons.
 */

import type { LocalNotificationSchema, LocalNotificationDescriptor, ActionPerformed } from '@capacitor/local-notifications';

/**
 * Timer notification manager interface
 */
export interface ITimerNotificationManager {
  /**
   * Request notification permission from user
   * Must be called before scheduling notifications
   * @returns Promise<boolean> - true if granted, false otherwise
   */
  requestPermission(): Promise<boolean>;

  /**
   * Check if notification permission is granted
   * @returns Promise<boolean> - current permission status
   */
  checkPermission(): Promise<boolean>;

  /**
   * Schedule a timer countdown notification
   * Displays on lock screen with pause/resume/skip buttons
   * @param config - Timer notification configuration
   * @returns Promise<number> - Notification ID for later updates/cancellation
   */
  scheduleTimerNotification(config: TimerNotificationConfig): Promise<number>;

  /**
   * Update an existing timer notification (e.g., remaining time)
   * @param id - Notification ID
   * @param updates - Updated notification data
   * @returns Promise<void>
   */
  updateTimerNotification(id: number, updates: Partial<TimerNotificationConfig>): Promise<void>;

  /**
   * Cancel a scheduled or ongoing notification
   * @param id - Notification ID
   * @returns Promise<void>
   */
  cancelNotification(id: number): Promise<void>;

  /**
   * Schedule a "rest complete" notification with sound + vibration
   * Fired when timer reaches 0
   * @param config - Rest complete notification configuration
   * @returns Promise<number> - Notification ID
   */
  scheduleRestCompleteNotification(config: RestCompleteNotificationConfig): Promise<number>;

  /**
   * Listen to notification action performed events
   * Triggered when user taps action buttons (pause, resume, skip)
   * @param callback - Callback function receiving action data
   * @returns Promise<void>
   */
  addActionListener(callback: (action: TimerActionPerformed) => void): Promise<void>;

  /**
   * Remove action listener
   * @returns Promise<void>
   */
  removeActionListener(): Promise<void>;
}

/**
 * Timer notification configuration
 */
export interface TimerNotificationConfig {
  /**
   * Notification title (e.g., "休憩タイマー")
   */
  title: string;

  /**
   * Notification body (e.g., "残り 60秒")
   */
  body: string;

  /**
   * Remaining time in seconds (for display)
   */
  remainingTime: number;

  /**
   * Total duration in seconds
   */
  totalDuration: number;

  /**
   * Timer state: 'running' | 'paused'
   */
  state: 'running' | 'paused';

  /**
   * Action buttons to display
   */
  actions: TimerNotificationAction[];

  /**
   * Ongoing notification (stays visible, not dismissible)
   */
  ongoing?: boolean;

  /**
   * Silent notification (no sound/vibration during countdown)
   */
  silent?: boolean;
}

/**
 * Timer notification action button
 */
export interface TimerNotificationAction {
  /**
   * Action ID (e.g., 'pause', 'resume', 'skip')
   */
  id: 'pause' | 'resume' | 'skip';

  /**
   * Button title (Japanese label)
   */
  title: string;

  /**
   * Optional icon (Android only)
   */
  icon?: string;
}

/**
 * Rest complete notification configuration
 */
export interface RestCompleteNotificationConfig {
  /**
   * Notification title (e.g., "休憩終了")
   */
  title: string;

  /**
   * Notification body (e.g., "次のセットを開始しましょう")
   */
  body: string;

  /**
   * Sound to play (default system sound if not specified)
   */
  sound?: string;

  /**
   * Vibration pattern (Android) in milliseconds
   * Example: [500, 200, 500] = vibrate 500ms, pause 200ms, vibrate 500ms
   */
  vibrate?: number[];

  /**
   * Schedule time (defaults to immediate if not specified)
   */
  schedule?: {
    at: Date;
  };
}

/**
 * Timer action performed event
 */
export interface TimerActionPerformed {
  /**
   * Notification ID
   */
  notificationId: number;

  /**
   * Action ID that was tapped ('pause' | 'resume' | 'skip')
   */
  actionId: 'pause' | 'resume' | 'skip';

  /**
   * Input value (not used for timer actions)
   */
  inputValue?: string;
}

/**
 * Notification permission status
 */
export type NotificationPermissionStatus = 'granted' | 'denied' | 'prompt';

/**
 * Error types for notification operations
 */
export class NotificationError extends Error {
  constructor(message: string, public code: NotificationErrorCode) {
    super(message);
    this.name = 'NotificationError';
  }
}

export enum NotificationErrorCode {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NOT_FOUND = 'NOT_FOUND',
  INVALID_CONFIG = 'INVALID_CONFIG',
  SCHEDULE_FAILED = 'SCHEDULE_FAILED',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Constants
 */
export const TIMER_ACTIONS = {
  PAUSE: {
    id: 'pause' as const,
    title: '一時停止',
  },
  RESUME: {
    id: 'resume' as const,
    title: '再開',
  },
  SKIP: {
    id: 'skip' as const,
    title: 'スキップ',
  },
} as const;

export const DEFAULT_VIBRATION_PATTERN = [500, 200, 500, 200, 500] as const;
