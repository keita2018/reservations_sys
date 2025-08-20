// frontend/src/routes/reserve/confirm.tsx
import { component$, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import { apiFetch, toOffsetISO } from '~/utils/api';

type Draft = {
  reservation_at_local: string; // "YYYY-MM-DDTHH:mm" (datetime-local の値)
  people_count: number;
  phone_number: string;
  course: '' | 'standard' | 'premium' | 'special';
  food_option: boolean;
  drink_option: boolean;
};

export default component$(() => {
  const navigate = useNavigate();
  const draft = useSignal<Draft | null>(null);
  const error = useSignal('');
  const loading = useSignal(false);

  useVisibleTask$(() => {
    try {
      const raw = sessionStorage.getItem('reservationDraft');
      if (!raw) {
        navigate('/reserve');
        return;
      }
      draft.value = JSON.parse(raw) as Draft;
    } catch {
      navigate('/reserve');
    }
  });

  const confirm$ = $(async () => {
    if (!draft.value) return;
    error.value = '';
    loading.value = true;

    try {
      const body = {
        reservation: {
          // ここでローカル時刻→オフセット付きISO（例: +09:00）へ変換して送信
          reservation_at: toOffsetISO(draft.value.reservation_at_local),
          people_count: draft.value.people_count,
          phone_number: draft.value.phone_number,
          course: draft.value.course || undefined,
          food_option: draft.value.food_option,
          drink_option: draft.value.drink_option,
        },
      };

      await apiFetch<{ id: string }>('/api/v1/reservations', {
        method: 'POST',
        body,
      });

      // 成功したらドラフトは掃除
      sessionStorage.removeItem('reservationDraft');
      await navigate('/reserve/complete/');
    } catch (e: any) {
      error.value = e?.message || '予約に失敗しました';
    } finally {
      loading.value = false;
    }
  });

  const back$ = $(async () => {
    // ドラフトは残したまま戻る（/reserve 側で復元して使う）
    await navigate('/reserve/');
  });

  if (!draft.value) {
    return (
      <div class="p-4">
        <p>読み込み中…</p>
      </div>
    );
  }

  // 表示用に日時をローカル表示（確認しやすいように）
  const displayDateTime = new Date(
    toOffsetISO(draft.value.reservation_at_local),
  ).toLocaleString('ja-JP');

  return (
    <div class="max-w-lg mx-auto p-4 space-y-4">
      <h1 class="text-xl font-bold">予約内容の確認</h1>

      <div class="border rounded p-3 space-y-1">
        <div>日時：{displayDateTime}</div>
        <div>人数：{draft.value.people_count}</div>
        <div>電話：{draft.value.phone_number}</div>
        <div>コース：{draft.value.course || 'なし'}</div>
        <div>食べ放題：{draft.value.food_option ? 'あり' : 'なし'}</div>
        <div>飲み放題：{draft.value.drink_option ? 'あり' : 'なし'}</div>
      </div>

      {error.value && <p class="text-sm text-red-600">{error.value}</p>}

      <div class="flex gap-3">
        <button
          class="border px-4 py-2"
          type="button"
          disabled={loading.value}
          onClick$={back$}
        >
          修正する
        </button>
        <button
          class="border px-4 py-2 bg-blue-600 text-white disabled:opacity-50"
          type="button"
          disabled={loading.value}
          onClick$={confirm$}
        >
          {loading.value ? '送信中…' : '確定する'}
        </button>
      </div>
    </div>
  );
});
