export type InquiryStatus = 'PENDING' | 'ANSWERED';
export type InquiryFilter = 'ALL' | InquiryStatus;

export interface Inquiry {
  id: string;
  userId: number;
  authorName: string;
  title: string;
  content: string;
  createdAt: string;
  status: InquiryStatus;
  answer: string | null;
  answeredAt: string | null;
}

export interface CreateInquiryRequest {
  title: string;
  content: string;
}

export interface InquiryRepository {
  create(body: CreateInquiryRequest): Promise<Inquiry>;
  list(): Promise<Inquiry[]>;
  get(id: string): Promise<Inquiry>;
  adminList(): Promise<Inquiry[]>;
  adminGet(id: string): Promise<Inquiry>;
  answer(id: string, answer: string): Promise<Inquiry>;
}
