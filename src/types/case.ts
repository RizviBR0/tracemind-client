export type ApiCase = {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  targetDate?: string;
  goals: string[];
  constraints: string[];
  tags: string[];
  coverImage?: string;
  media?: string[];
  visibility: "public" | "private";
  status: "Draft" | "Under review" | "Approved" | "Rejected";
  moderationNote?: string;
  moderatedAt?: string;
  moderatedBy?: { _id?: string; name: string };
  averageRating: number;
  reviewCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  ownerId?: { _id?: string; name: string; email?: string };
  publicInsight?: { title: string; summary: string; publishedAt?: string; sourceSessionId?: string };
};

export type PublicCaseDetails = {
  item: ApiCase;
  related: ApiCase[];
  reviews: Array<{ _id: string; rating: number; comment: string; createdAt: string; userId?: { name: string } }>;
};
