export enum OutfitStyle {
  CASUAL = 'Casual',
  BUSINESS = 'Business',
  NIGHT_OUT = 'Night Out'
}

export interface GeneratedOutfit {
  id: string;
  style: OutfitStyle;
  imageUrl: string | null;
  isLoading: boolean;
  error?: string;
}

export interface ImageUploadState {
  file: File | null;
  previewUrl: string | null;
}
