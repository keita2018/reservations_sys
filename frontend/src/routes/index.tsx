import { component$, useVisibleTask$, useSignal } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import { $ } from '@builder.io/qwik';

export default component$(() => {
  const ready = useSignal(false);
  const tokenHead = useSignal<string | null>(null);
  const navigate = useNavigate();

  // ログインチェック（表示前にリダイレクト）
  useVisibleTask$(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login/');
      return; // 未ログインならログインページへ
    }
    tokenHead.value = token.slice(0, 16);
    ready.value = true;
  });

  const logout = $(async () => {

    // ★サーバ側で revoke するならコメント外して使う（任意）
    // try {
    //   await fetch('http://localhost:3001/api/v1/auth/sign_out', {
    //     method: 'DELETE',
    //     headers: {
    //       'Accept': 'application/json',
    //       'Content-Type': 'application/json',
    //       ...(token ? { Authorization: `Bearer ${token}` } : {}),
    //     },
    //   });
    // } catch (e) {
    //   // 失敗してもクライアント側は確実にログアウトさせる
    // }

    localStorage.removeItem('token');
    await navigate('/login/');
  });

  const handleReserveClick = $(async () => {
    await navigate('/reserve/');
  });

  const handleCancelClick = $(async () => {
    await navigate('/reservations/');
  });

  // ログイン確認が終わるまで一瞬だけローディング（任意）
  if (!ready.value) {
    return <p style={{ padding: '1rem' }}>Loading…</p>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <header style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>ようこそ レストラン予約システムへ</h1>
        {/* <span style={{ opacity: 0.6 }}>token: {tokenHead.value}…</span> */}
        <button onClick$={logout} style={{ marginLeft: 'auto' }}>
          ログアウト
        </button>
      </header>

      <main style={{ display: 'flex', gap: '0.75rem' }}>
        <button type="button" onClick$={handleReserveClick}>予約する</button>
        <button type="button" onClick$={handleCancelClick}>予約をキャンセルする</button>
      </main>
    </div>
  );
});

