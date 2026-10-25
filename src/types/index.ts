export type InputType = "voice" | "text";
export type IdeaStatus = "processed" | "unprocessed";
export type ThoughtType = "idea" | "task" | "question" | "reminder" | "note";

export interface IdeaLink {
  ideaId: string;
  reason: string;
  source: "ai" | "user";
}

export type ThoughtLink = { id?: string; ideaId?: string; why?: string; reason?: string };

export interface BackLink {
  ideaId: string;
  reason: string;
}

export interface Idea {
  id: string;
  title: string;
  summary: string;
  originalText: string;
  category: string;
  type?: ThoughtType;
  tags?: string[];
  links: IdeaLink[];
  backlinks: BackLink[];
  done?: boolean;
  dumpId?: string;
  inputType: InputType;
  status: IdeaStatus;
  isExample?: boolean;
  createdAt: number; // timestamp in milliseconds
  updatedAt: number; // timestamp in milliseconds
}

export interface DumpRecord {
  id: string;
  text: string;
  createdAt: number;
  example?: boolean;
}

export type RawDump = DumpRecord;

export interface Category {
  id: string;
  name: string;
  ideaCount: number;
  color: string;
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  createdAt: number;
}

export interface ProcessIdeaResponse {
  idea: Idea;
  ideas?: Idea[];
  isNewCategory: boolean;
  category: string;
  dumpId?: string;
}

export interface AskAIResponse {
  answer: string;
  ideaIds: string[];
}
