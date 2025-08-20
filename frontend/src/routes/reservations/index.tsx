// // frontend/src/routes/reservations/index.tsx
// import { component$, useSignal, useVisibleTask$, useTask$, $ } from '@builder.io/qwik';
// import { apiFetch } from '~/utils/api';

// type Reservation = {
//   id: string;
//   reservation_at: string;
//   people_count: number;
//   phone_number: string;
//   course?: 'standard' | 'premium' | 'special';
//   food_option: boolean;
//   drink_option: boolean;
//   canceled: boolean;
// };

// export default component$(() => {
//   const list = useSignal<Reservation[]>([]);
//   const msg = useSignal('');
//   const loading = useSignal(false);
//   const cancelingId = useSignal<string | null>(null);

//   const load$ = $(async () => {
//     msg.value = '';
//     loading.value = true;
//     try {
//       const data = await apiFetch<{ reservations: Reservation[] }>(
//         '/api/v1/reservations',
//         { method: 'GET' },
//       );
//       list.value = data.reservations || [];
//     } catch (e: any) {
//       msg.value = e?.message || '取得に失敗しました';
//     } finally {
//       loading.value = false;
//     }
//   });

//   const cancel$ = $(async (id: string) => {
//     msg.value = '';
//     cancelingId.value = id;
//     try {
//       await apiFetch(`/api/v1/reservations/${id}`, { method: 'DELETE' });
//       msg.value = 'キャンセルしました';
//       await load$();
//     } catch (e: any) {
//       // 例：「キャンセル可能期間（3時間前まで）を過ぎています」
//       msg.value = e?.message || 'キャンセルに失敗しました';
//     } finally {
//       cancelingId.value = null;
//     }
//   });

//   useTask$(() => {
//     load$();
//   });

//   return (
//     <div class="p-4 space-y-4">
//       <h1 class="text-xl font-bold">予約一覧</h1>

//       {msg.value && <p class="text-sm">{msg.value}</p>}
//       {loading.value && <p class="text-sm text-gray-600">読み込み中…</p>}

//       {!loading.value && list.value.length === 0 && (
//         <p class="text-sm text-gray-600">予約はまだありません。</p>
//       )}

//       <ul class="space-y-2">
//         {list.value.map((r) => (
//           <li key={r.id} class="border p-3 rounded">
//             <div>日時: {new Date(r.reservation_at).toLocaleString('ja-JP')}</div>
//             <div>人数: {r.people_count}</div>
//             <div>コース: {r.course || 'なし'}</div>
//             <div>状態: {r.canceled ? 'キャンセル済み' : '有効'}</div>
//             {!r.canceled && (
//               <button
//                 class="border px-3 py-1 mt-2 disabled:opacity-50"
//                 disabled={cancelingId.value === r.id}
//                 onClick$={() => cancel$(r.id)}
//               >
//                 {cancelingId.value === r.id ? 'キャンセル中…' : 'キャンセル'}
//               </button>
//             )}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// });

// frontend/src/routes/reservations/index.tsx
import { component$, useResource$, Resource, $, useSignal } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import { apiFetch } from '~/utils/api';

type Reservation = {
  id: string;
  reservation_at: string;
  people_count: number;
  phone_number: string;
  course?: 'standard' | 'premium' | 'special';
  food_option: boolean;
  drink_option: boolean;
  canceled: boolean;
};

export default component$(() => {
  const refresh = useSignal(0);
  const nav = useNavigate();

  const reservationsRes = useResource$(async ({ track, cleanup }) => {
    track(() => refresh.value);

    const controller = new AbortController();
    cleanup(() => controller.abort()); // ページ離脱時に中断

    try {
      const data = await apiFetch<{ reservations: Reservation[] }>(
        '/api/v1/reservations',
        { method: 'GET', signal: controller.signal, timeoutMs: 10000 }
      );
      return data.reservations ?? [];
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (msg.includes('401')) {
        localStorage.removeItem('token');
        await nav('/login/'); // 認証切れは即ログインへ
      }
      throw e; // UI にエラー表示
    }
  });

  const reload$ = $(() => { refresh.value++; });

  return (
    <div class="p-4 space-y-4">
      <h1 class="text-xl font-bold">予約一覧</h1>

      <Resource
        value={reservationsRes}
        onPending={() => <p class="text-sm text-gray-600">読み込み中…</p>}
        onRejected={(err) => (
          <div class="text-sm text-red-600">
            取得に失敗しました：{String(err)}
            <button class="ml-2 underline" onClick$={reload$}>再試行</button>
          </div>
        )}
        onResolved={(list: Reservation[]) =>
          list.length === 0 ? (
            <p class="text-sm text-gray-600">予約はまだありません。</p>
          ) : (
            <ul class="space-y-2">
              {list.map((r) => (
                <li key={r.id} class="border p-3 rounded">
                  <div>日時: {new Date(r.reservation_at).toLocaleString('ja-JP')}</div>
                  <div>人数: {r.people_count}</div>
                  <div>コース: {r.course || 'なし'}</div>
                  <div>状態: {r.canceled ? 'キャンセル済み' : '有効'}</div>
                  {!r.canceled && <CancelButton id={r.id} onDone$={reload$} />}
                </li>
              ))}
            </ul>
          )
        }
      />
    </div>
  );
});

export const CancelButton = component$((props: { id: string; onDone$: () => void }) => {
  const busy = useSignal(false);
  const msg = useSignal('');

  const cancel$ = $(async () => {
    busy.value = true;
    msg.value = '';
    try {
      await apiFetch(`/api/v1/reservations/${props.id}`, { method: 'DELETE', timeoutMs: 10000 });
      msg.value = 'キャンセルしました';
      props.onDone$();
    } catch (e: any) {
      msg.value = String(e?.message || 'キャンセルに失敗しました');
    } finally {
      busy.value = false;
    }
  });

  return (
    <>
      <button class="border px-3 py-1 mt-2 disabled:opacity-50" disabled={busy.value} onClick$={cancel$}>
        {busy.value ? 'キャンセル中…' : 'キャンセル'}
      </button>
      {msg.value && <div class="text-xs mt-1">{msg.value}</div>}
    </>
  );
});
