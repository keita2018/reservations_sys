import { component$ } from '@builder.io/qwik';
import { useLogout } from '~/lib/auth';

export default component$(() => {
  const logout = useLogout();

  return (
    <header>
      <h1>ホーム</h1>
      <button onClick$={logout}>ログアウト</button>
    </header>
  );
});
