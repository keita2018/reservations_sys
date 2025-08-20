# app/workers/cancel_reservation_worker.rb
class CancelReservationWorker
  include Sidekiq::Worker

  # 再試行回数を制限したい場合（例：最大5回）
  sidekiq_options retry: 5

  def perform(reservation_id)
    reservation = Reservation.find_by(id: reservation_id)

    # 既に存在しない、またはキャンセル済み → 例外を出さずに終了（成功扱い）
    return if reservation.nil? || reservation.canceled?

    # キャンセル処理
    Reservation.transaction do
      reservation.cancel!
      # 必要ならメール通知などの付随処理
    end
  rescue ActiveRecord::RecordInvalid => e
    # 永続的に直らないエラーは再試行しても無意味 → 例外を飲み込んで終了
    Rails.logger.warn("キャンセルジョブを破棄: #{e.class} #{e.message}")
  rescue Net::ReadTimeout, Faraday::TimeoutError => e
    # 一時的なエラーは例外のままにしておく（Sidekiq が再試行）
    raise e
  end
end
