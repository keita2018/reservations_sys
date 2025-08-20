
import { component$, $, useSignal } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';

export default component$(() => {
  const email = useSignal('');
  const password = useSignal('');
  const errorMessage = useSignal('');
  const navigate = useNavigate();

  const handleLogin = $(async (e: Event) => {
    e.preventDefault();
    errorMessage.value = '';

    try {
      console.log('[login] start', { email: email.value });

      const res = await fetch('http://localhost:3001/api/v1/auth/sign_in', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        // Devise 側は user[...] で受ける想定
        body: JSON.stringify({ user: { email: email.value, password: password.value } }),
      });

      console.log('[login] res.ok?', res.ok, 'status=', res.status);

      if (!res.ok) {
        let msg = 'ログインに失敗しました。';
        try {
          const err = await res.json();
          console.log('[login] error body=', err);
          msg = err.message || err.error || msg;
        } catch (e) {
          console.warn('[login] error body parse failed', e);
        }
        errorMessage.value = msg;
        return;
      }

      // 1) まずヘッダーからトークンを試す
      let token = res.headers.get('Authorization')?.replace(/^Bearer\s+/, '') || null;
      console.log('[login] header token =', token?.slice(0, 16));

      // 2) ヘッダーに無ければ JSON 本文から
      let data: any = null;
      if (!token) {
        try {
          data = await res.json();
          console.log('[login] body data =', data);
          token = data?.token ?? null;
        } catch (e) {
          console.warn('[login] body parse failed', e);
        }
      }

      if (!token) {
        errorMessage.value = 'トークンが取得できませんでした。';
        console.error('[login] no token in header/body');
        return;
      }

      localStorage.setItem('token', token);
      console.log('[login] token saved to localStorage (head)=', localStorage.getItem('token')?.slice(0, 16));

      // ここで明示的に localStorage を読んで確認
      const check = localStorage.getItem('token');
      if (!check) {
        errorMessage.value = 'localStorage への保存に失敗しました。';
        console.error('[login] localStorage empty');
        return;
      }

      // 画面遷移をログ付きで
      console.log('[login] navigate to /');
      try {
        await navigate('/'); // Qwik のナビゲート
      } catch (e) {
        console.error('[login] navigate failed', e);
        errorMessage.value = '画面遷移に失敗しました。';
      }
    } catch (e) {
      console.error('[login] fetch failed', e);
      errorMessage.value = '通信エラーが発生しました。';
    }
  });

  return (
    <div>
      <h1>ログイン</h1>
      <form preventdefault:submit onSubmit$={handleLogin}>
        <input type="email" placeholder="メールアドレス" bind:value={email} />
        <input type="password" placeholder="パスワード" bind:value={password} />
        <button type="submit">ログイン</button>
      </form>
      {errorMessage.value && <p style={{ color: 'red' }}>{errorMessage.value}</p>}
    </div>
  );
});
