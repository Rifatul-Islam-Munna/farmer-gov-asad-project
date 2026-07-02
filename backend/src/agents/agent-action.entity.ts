import mongoose, { HydratedDocument } from 'mongoose';

export const AGENT_ACTION_MODEL = 'AgentAction';

export enum AgentActionType {
  CREATE_FARMER = 'createFarmer',
  CREATE_LISTING = 'createListing',
}

export enum AgentActionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export interface AgentAction {
  type: AgentActionType;
  status: AgentActionStatus;
  agentId: string;
  farmerPhone: string;
  farmerId?: string;
  payload: Record<string, unknown>;
  otpHash: string;
  attempts: number;
  expiresAt: Date;
  completedAt?: Date;
}

export type AgentActionDocument = HydratedDocument<AgentAction>;

export const AgentActionSchema = new mongoose.Schema<AgentAction>(
  {
    type: { type: String, enum: AgentActionType, required: true, index: true },
    status: {
      type: String,
      enum: AgentActionStatus,
      default: AgentActionStatus.PENDING,
      index: true,
    },
    agentId: { type: String, required: true, index: true },
    farmerPhone: { type: String, required: true, index: true },
    farmerId: { type: String, index: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: true },
    completedAt: Date,
  },
  { timestamps: true, autoIndex: true },
);
