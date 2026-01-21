export interface Generation {
  id: string;
  cityId: string;
  prompt: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  result?: string;
  imageUrl?: string;
  model?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    retries?: number;
    error?: string;
    processingTime?: number;
  };
}

export interface Comparison {
  id: string;
  cityId: string;
  leftGeneration: Generation;
  rightGeneration: Generation;
  winner?: 'left' | 'right' | 'tie';
  criteria?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GenerationQueue {
  id: string;
  generations: Generation[];
  status: 'idle' | 'processing' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
}