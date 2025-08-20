# app/jobs/reservation_confirmation_job.rb
class ReservationConfirmationJob < ApplicationJob
  queue_as :mailers
  def perform(reservation_id)
    ReservationMailer.confirm(reservation_id).deliver_now
  end
end
