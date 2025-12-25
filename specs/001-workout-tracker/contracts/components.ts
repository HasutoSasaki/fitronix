/**
 * Component Prop Interfaces
 *
 * TypeScript interfaces for all React component props.
 * Ensures type safety and clear component contracts.
 */

import type { ReactNode } from 'react';
import type {
  WorkoutSession,
  Exercise,
  Set as WorkoutSet,
  WorkoutExercise,
  BodyPart,
} from '../types/models';

/**
 * Workout Recording Components
 */

export interface WorkoutRecordingScreenProps {
  onSave: (session: WorkoutSession) => Promise<void>;
  onCancel: () => void;
}

export interface ExerciseInputProps {
  exercises: WorkoutExercise[];
  onAddExercise: (
    exercise: Omit<WorkoutExercise, 'id' | 'sessionId' | 'sets' | 'maxWeight'>
  ) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onUpdateExercise: (
    exerciseId: string,
    updates: Partial<WorkoutExercise>
  ) => void;
}

export interface SetInputProps {
  exerciseId: string;
  sets: WorkoutSet[];
  previousMaxWeight?: number;
  onAddSet: (set: Omit<WorkoutSet, 'id' | 'completedAt'>) => void;
  onRemoveSet: (setId: string) => void;
  onUpdateSet: (setId: string, updates: Partial<WorkoutSet>) => void;
}

export interface SetRowProps {
  set: WorkoutSet;
  setNumber: number;
  onUpdate: (updates: Partial<WorkoutSet>) => void;
  onDelete: () => void;
}

/**
 * Keypad Components (One-Handed Input)
 */

export interface NumericKeypadProps {
  value: number | string;
  onValueChange: (value: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
  mode: 'weight' | 'reps';
  allowDecimal?: boolean;
}

export interface QuickButtonsProps {
  mode: 'weight' | 'reps';
  onSelect: (value: number) => void;
}

/**
 * History Components
 */

export interface HistoryListScreenProps {
  sessions: WorkoutSession[];
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => Promise<void>;
}

export interface HistoryItemProps {
  session: WorkoutSession;
  onClick: () => void;
  onDelete: () => void;
}

export interface WorkoutDetailScreenProps {
  session: WorkoutSession;
  onReuse: () => void;
  onClose: () => void;
}

export interface ExerciseDetailCardProps {
  exercise: WorkoutExercise;
  sets: WorkoutSet[];
}

/**
 * Library Components
 */

export interface ExerciseLibraryScreenProps {
  exercises: Exercise[];
  onAddExercise: () => void;
  onEditExercise: (exercise: Exercise) => void;
  onDeleteExercise: (exerciseId: string) => Promise<void>;
}

export interface ExerciseFormProps {
  exercise?: Exercise;
  onSubmit: (exercise: Omit<Exercise, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
}

export interface ExerciseCardProps {
  exercise: Exercise;
  onEdit: () => void;
  onDelete: () => void;
}

export interface BodyPartFilterProps {
  selectedBodyPart: BodyPart | 'all';
  onSelect: (bodyPart: BodyPart | 'all') => void;
}

/**
 * Timer Components
 */

export interface RestTimerProps {
  onStart: (duration: number) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  isActive: boolean;
  isPaused: boolean;
  remainingTime: number;
}

export interface TimerPresetSelectorProps {
  presets: TimerPreset[];
  selectedPreset?: string;
  onSelectPreset: (presetId: string) => void;
  onCustomDuration: (duration: number) => void;
}

export interface TimerDisplayProps {
  remainingTime: number;
  totalDuration: number;
}

/**
 * Navigation Components
 */

export interface TabBarProps {
  activeTab: 'record' | 'history' | 'library';
  onTabChange: (tab: 'record' | 'history' | 'library') => void;
}

export interface TabItemProps {
  icon: ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

/**
 * Shared/Common Components
 */

export interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'text';
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
  'aria-label'?: string;
}

export interface InputFieldProps {
  value: string | number;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  type?: 'text' | 'number';
  placeholder?: string;
  disabled?: boolean;
  'aria-label': string;
}

export interface SelectProps {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  'aria-label': string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  'aria-label'?: string;
}

export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * Timer Preset Type (referenced above)
 */
export interface TimerPreset {
  id: string;
  duration: number;
  name: string;
}
