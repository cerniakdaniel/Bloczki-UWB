export type BlockType =
  | 'START' | 'STOP' | 'OPERATION'
  | 'INPUT' | 'OUTPUT'
  | 'CONDITION' | 'LOOP_WHILE' | 'LOOP_FOR';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  position_x: number;
  position_y: number;
}

export interface Connection {
  id: string;
  from_block_id: string;
  to_block_id: string;
  label: string;
}

export interface Diagram {
  id: string;
  name: string;
  blocks: Block[];
  connections: Connection[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}