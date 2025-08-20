# app/models/reservation.rb
class Reservation < ApplicationRecord
  belongs_to :user

  SLOT_MINUTES = (ENV['RESERVATION_SLOT_MINUTES'] || 60).to_i
  CAPACITY_PER_SLOT = (ENV['RESERVATION_SLOT_CAPACITY'] || 10).to_i
  COURSES = %w[standard premium special].freeze

  validates :reservation_at, presence: true
  validates :people_count, presence: true, inclusion: { in: 1..20 }
  validates :phone_number, presence: true, format: { with: /\A\d{10,11}\z/ }
  validates :course, inclusion: { in: COURSES }, allow_blank: true

  validate :reservation_must_be_future
  validate :slot_capacity_must_be_available, on: :create

  scope :active, -> { where(canceled: false) }

  def slot_range
    start = reservation_at.change(sec: 0)
    start = start - (start.min % SLOT_MINUTES).minutes
    start...(start + SLOT_MINUTES.minutes)
  end

  def can_cancel?(now: Time.current)
    return false if canceled?
    now <= (reservation_at - 3.hours)
  end

  private

  def reservation_must_be_future
    return if reservation_at.blank?
    errors.add(:reservation_at, 'must be in the future') if reservation_at <= Time.current
  end

  def slot_capacity_must_be_available
    return if reservation_at.blank?
    if Reservation.active.where(reservation_at: slot_range).count >= CAPACITY_PER_SLOT
      errors.add(:base, 'The time slot is fully booked')
    end
  end
end
