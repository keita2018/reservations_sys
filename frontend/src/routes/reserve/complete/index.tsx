import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export default component$(() => (
  <div class="p-4 text-center">
    <h1 class="text-2xl font-bold mb-4">予約が完了しました</h1>
    <p class="mb-6">確認メールをご確認ください。</p>
    <div class="flex gap-4 justify-center">
      <Link href="/" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        ホームに戻る
      </Link>
      <Link href="/reservations" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
        予約一覧を見る
      </Link>
    </div>
  </div>
));
