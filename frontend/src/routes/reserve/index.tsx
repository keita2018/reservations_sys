// frontend/src/routes/reserve/index.tsx
import { component$, useSignal, $, useVisibleTask$ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';

export default component$(() => {
  const navigate = useNavigate();
  const reservation_at = useSignal(''); // "YYYY-MM-DDTHH:mm"
  const people_count = useSignal(2);
  const phone_number = useSignal('');
  const course = useSignal<'standard' | 'premium' | 'special' | ''>('');
  const food_option = useSignal(false);
  const drink_option = useSignal(false);
  const error = useSignal('');
  const loading = useSignal(false);

  // ← 確認画面から「修正する」で戻ってきたとき復元
  useVisibleTask$(() => {
    try {
      const raw = sessionStorage.getItem('reservationDraft');
      if (!raw) return;
      const d = JSON.parse(raw);
      reservation_at.value = d.reservation_at_local || '';
      people_count.value = d.people_count ?? 2;
      phone_number.value = d.phone_number || '';
      course.value = d.course || '';
      food_option.value = !!d.food_option;
      drink_option.value = !!d.drink_option;
    } catch {}
  });

  const submit$ = $(async (e: Event) => {
    e.preventDefault();
    if (loading.value) return;
    error.value = '';

    // 簡易クライアント検証
    if (!reservation_at.value) return (error.value = '予約日時は必須です');
    if (people_count.value < 1 || people_count.value > 20)
      return (error.value = '人数は1〜20');
    if (!/^\d{10,11}$/.test(phone_number.value))
      return (error.value = '電話番号は10〜11桁');

    // ← ここが重要：POSTせずにドラフト保存して確認画面へ
    const draft = {
      reservation_at_local: reservation_at.value, // 生の "YYYY-MM-DDTHH:mm"
      people_count: people_count.value,
      phone_number: phone_number.value,
      course: course.value || '',
      food_option: food_option.value,
      drink_option: drink_option.value,
    };
    sessionStorage.setItem('reservationDraft', JSON.stringify(draft));
    await navigate('/reserve/confirm/');
  });

  return (
    <div class="mx-auto max-w-lg p-4 space-y-4">
      <h1 class="text-xl font-bold">予約フォーム</h1>
      <form preventdefault:submit onSubmit$={submit$} class="space-y-3">
        <label class="block">
          予約日時
          <input
            class="border p-2 w-full"
            type="datetime-local"
            value={reservation_at.value}
            onInput$={(e) =>
              (reservation_at.value = (e.target as HTMLInputElement).value)
            }
            required
          />
        </label>

        <label class="block">
          人数（1-20）
          <input
            class="border p-2 w-full"
            type="number"
            min={1}
            max={20}
            value={people_count.value}
            onInput$={(e) =>
              (people_count.value = Number(
                (e.target as HTMLInputElement).value,
              ))
            }
            required
          />
        </label>

        <label class="block">
          電話番号（数字のみ）
          <input
            class="border p-2 w-full"
            type="tel"
            value={phone_number.value}
            onInput$={(e) =>
              (phone_number.value = (e.target as HTMLInputElement).value)
            }
            required
            pattern="\d{10,11}"
          />
        </label>

        <label class="block">
          コース（任意）
          <select
            class="border p-2 w-full"
            value={course.value}
            onInput$={(e) =>
              (course.value = (e.target as HTMLSelectElement).value as any)
            }
          >
            <option value="">なし</option>
            <option value="standard">standard</option>
            <option value="premium">premium</option>
            <option value="special">special</option>
          </select>
        </label>

        <label class="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={food_option.value}
            onInput$={(e) =>
              (food_option.value = (e.target as HTMLInputElement).checked)
            }
          />
          食べ放題
        </label>

        <label class="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={drink_option.value}
            onInput$={(e) =>
              (drink_option.value = (e.target as HTMLInputElement).checked)
            }
          />
          飲み放題
        </label>

        {error.value && <p class="text-red-600 text-sm">{error.value}</p>}

        <button class="border px-4 py-2" disabled={loading.value}>
          {loading.value ? '送信中…' : '確認へ進む'}
        </button>
      </form>
    </div>
  );
});
