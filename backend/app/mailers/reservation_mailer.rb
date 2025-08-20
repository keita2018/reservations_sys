# app/mailers/reservation_mailer.rb
class ReservationMailer < ApplicationMailer
  default from: 'no-reply@example.com'

  def confirm(reservation_id)
    @reservation = Reservation.find_by(id: reservation_id)
    return if @reservation.nil? || @reservation.canceled? # 既にキャンセルなら送らない
    mail to: @reservation.user.email, subject: '予約確認'
  end

  def canceled(reservation_id)
    @reservation = Reservation.find_by(id: reservation_id)
    return if @reservation.nil? || !@reservation.canceled? # キャンセル状態でなければ送らない
    mail to: @reservation.user.email, subject: '予約キャンセル確認'
  end

  def reminder(reservation_id)
    @reservation = Reservation.find_by(id: reservation_id)
    return if @reservation.nil? || @reservation.canceled?  # キャンセル済みには送らない
    mail to: @reservation.user.email, subject: '本日のご予約リマインド'
  end
end
