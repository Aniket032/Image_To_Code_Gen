export interface GenerateRequest {
  imageUrl: string;
  generatedImageURL?: string;
  prompt?: string;
  version: number;
  accuracy: number;
}

export type GenerateResponse = {
  object: {
    HtmlWithTailwindcss: string;
    imageUrl: string;
    generatedImageURL?: string;
    accuracy: number;
  };
};

export interface GenerationState {
  status: "idle" | "generating" | "Improvments in Progress" | "completed";
  version: number;
  accuracy: number;
}
