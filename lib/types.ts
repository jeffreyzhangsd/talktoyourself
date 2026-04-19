export type Recording = {
  id: string;
  timestamp: number;
  duration: number;
  blobUrl: string;
  hasVideo?: boolean;
};
