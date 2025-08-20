# app/jobs/reminder_mail_job.rb
class ReminderMailJob < ApplicationJob
  queue_as :mailers
  def perform
    today = Time.zone.today
    Reservation.active.where(reservation_at: today.all_day).find_each do |r|
      ReservationMailer.reminder(r.id).deliver_now
    end
  end
end
