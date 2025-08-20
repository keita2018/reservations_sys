import { $ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';

export const useLogout = () => {
  const navigate = useNavigate();

  return $(async () => {
    // 必要なら Rails の sign_out API 呼び出し
    // await fetch('http://localhost:3001/api/v1/auth/sign_out', {
    //   method: 'DELETE',
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
    //   }
    // });

    // JWT削除
    localStorage.removeItem('token');

    // ログインページへ
    navigate('/login');
  });
};
