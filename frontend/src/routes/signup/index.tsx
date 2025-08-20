import { component$ } from '@builder.io/qwik';
import { useStore, useSignal } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import { $, useVisibleTask$ } from '@builder.io/qwik';

export default component$(() => {
  const name = useSignal('');
  const email = useSignal('');
  const password = useSignal('');
  const passwordConfirmation = useSignal('');

  const errorMessage = useSignal('');
  const navigate = useNavigate();

  const handleSubmit = $(async (e: Event) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3001/api/v1/auth/sign_up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            name: name.value,
            email: email.value,
            password: password.value,
            password_confirmation: passwordConfirmation.value,
          }
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error('登録失敗:', err);
        errorMessage.value = err.message || '登録に失敗しました。';
        return;
      }

      navigate('/login');
    } catch (error) {
      errorMessage.value = '通信エラーが発生しました';
      console.error('Fetch エラー:', error); 
    }
  });

  return (
    <div>
      <h1>新規登録</h1>
      <form onSubmit$={handleSubmit}>
        <input type="text" placeholder="名前" bind:value={name} />
        <input type="email" placeholder="メールアドレス" bind:value={email} />
        <input type="password" placeholder="パスワード" bind:value={password} />
        <input type="password" placeholder="パスワード確認" bind:value={passwordConfirmation} />
        <button type="submit">登録</button>
        {errorMessage.value && <p style={{ color: 'red' }}>{errorMessage.value}</p>}
      </form>
    </div>
  );
});
