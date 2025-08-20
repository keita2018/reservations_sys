# app/jobs/reservation_cancellation_job.rb
class ReservationCancellationJob < ApplicationJob
  queue_as :mailers

  # 一時的エラーは再試行（必要に応じて調整）
  retry_on Net::OpenTimeout, Net::ReadTimeout, wait: 10.seconds, attempts: 5
  retry_on IOError, OpenSSL::SSL::SSLError, wait: 20.seconds, attempts: 5

  # 永続エラーは破棄（ActiveRecord::RecordNotFound など）
  discard_on ActiveRecord::RecordNotFound

  def perform(reservation_id)
    # 見つからないなら例外ではなく捨てる設計にしたい場合は find_by を使う
    reservation = Reservation.find_by(id: reservation_id)
    # 既に削除・未存在 or まだキャンセルされていない → 仕事なし＝成功終了
    return if reservation.nil? || !reservation.canceled?

    # Mailer は id でも reservation でもOK。実装に合わせて。
    ReservationMailer.canceled(reservation).deliver_now
  end
end
