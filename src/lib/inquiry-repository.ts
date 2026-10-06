import type { CreateInquiryRequest, Inquiry, InquiryRepository } from '../types/inquiry';

export const INQUIRY_STORAGE_KEY = 'customer-center-inquiries-v2';
// v1 has no owner. Keep it untouched rather than assign someone else's inquiry
// to whichever account signs in first. All new records use this shared v2 store.
interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
interface Session {
  userId: number | null;
  accessToken: string | null;
  name: string | null;
  role: string | null;
}

export function createLocalInquiryRepository(
  storage: Storage,
  getSession: () => Session,
): InquiryRepository {
  let writes: Promise<unknown> = Promise.resolve();
  const requireSession = (admin = false) => {
    const session = getSession();
    if (session.userId == null || !session.accessToken) throw new Error('로그인이 필요합니다.');
    if (admin && session.role !== 'ADMIN') throw new Error('관리자만 이용할 수 있습니다.');
    return { ...session, userId: session.userId };
  };
  const read = async (): Promise<Inquiry[]> => {
    const raw = await storage.getItem(INQUIRY_STORAGE_KEY);
    if (!raw) return [];
    const data: unknown = JSON.parse(raw);
    if (
      !Array.isArray(data) ||
      !data.every(
        (item) =>
          item &&
          typeof item.id === 'string' &&
          typeof item.userId === 'number' &&
          typeof item.authorName === 'string' &&
          typeof item.title === 'string' &&
          typeof item.content === 'string' &&
          typeof item.createdAt === 'string' &&
          (item.status === 'PENDING' || item.status === 'ANSWERED') &&
          (item.answer === null || typeof item.answer === 'string') &&
          (item.answeredAt === null || typeof item.answeredAt === 'string'),
      )
    )
      throw new Error('문의 데이터를 읽지 못했습니다. 저장 공간을 확인해 주세요.');
    return data;
  };
  const mutate = <T>(action: () => Promise<T>): Promise<T> => {
    const result = writes.then(action);
    writes = result.catch(() => undefined);
    return result;
  };
  const find = (items: Inquiry[], id: string) => {
    const item = items.find((row) => row.id === id);
    if (!item) throw new Error('문의를 찾을 수 없습니다.');
    return item;
  };
  const ensureSameSession = (session: Session, admin = false) => {
    const current = requireSession(admin);
    if (current.userId !== session.userId || current.accessToken !== session.accessToken) {
      throw new Error('로그인 정보가 변경되었습니다. 다시 시도해 주세요.');
    }
  };
  return {
    async create(body: CreateInquiryRequest) {
      const session = requireSession();
      const title = body.title.trim();
      const content = body.content.trim();
      if (!title || !content || title.length > 100 || content.length > 5000) {
        throw new Error('제목은 1~100자, 내용은 1~5,000자로 입력해 주세요.');
      }
      return mutate(async () => {
        const items = await read();
        ensureSameSession(session);
        const item: Inquiry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          userId: session.userId,
          authorName: session.name || '사용자',
          title,
          content,
          createdAt: new Date().toISOString(),
          status: 'PENDING',
          answer: null,
          answeredAt: null,
        };
        await storage.setItem(INQUIRY_STORAGE_KEY, JSON.stringify([item, ...items]));
        return item;
      });
    },
    async list() {
      const session = requireSession();
      await writes;
      const items = await read();
      ensureSameSession(session);
      return items.filter((item) => item.userId === session.userId);
    },
    async get(id) {
      return find(await this.list(), id);
    },
    async adminList() {
      const session = requireSession(true);
      await writes;
      const items = await read();
      ensureSameSession(session, true);
      return items;
    },
    async adminGet(id) {
      return find(await this.adminList(), id);
    },
    async answer(id, value) {
      const session = requireSession(true);
      const answer = value.trim();
      if (!answer || answer.length > 5000) throw new Error('답변은 1~5,000자로 입력해 주세요.');
      return mutate(async () => {
        const items = await read();
        ensureSameSession(session, true);
        const item = find(items, id);
        if (item.status === 'ANSWERED') throw new Error('이미 답변이 등록된 문의입니다.');
        const updated: Inquiry = {
          ...item,
          answer,
          status: 'ANSWERED',
          answeredAt: new Date().toISOString(),
        };
        await storage.setItem(
          INQUIRY_STORAGE_KEY,
          JSON.stringify(items.map((row) => (row.id === id ? updated : row))),
        );
        return updated;
      });
    },
  };
}
