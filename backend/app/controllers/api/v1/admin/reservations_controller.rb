# app/controllers/api/v1/admin/reservations_controller.rb
class Api::V1::Admin::ReservationsController < Api::V1::Admin::BaseController
  def index
    q = Reservation.all
    q = q.where('reservation_at >= ?', Time.zone.parse(params[:date_from])) if params[:date_from].present?
    q = q.where('reservation_at <= ?', Time.zone.parse(params[:date_to]).end_of_day) if params[:date_to].present?
    q = q.where(canceled: ActiveModel::Type::Boolean.new.cast(params[:canceled])) if params.key?(:canceled)
    q = q.order(reservation_at: :desc)

    page  = (params[:page] || 1).to_i
    limit = [(params[:limit] || 20).to_i, 100].min
    total = q.count
    records = q.limit(limit).offset((page - 1) * limit)

    render json: {
      total:, page:, limit:,
      reservations: records.as_json(
        only: %i[id reservation_at people_count phone_number course food_option drink_option canceled],
        include: { user: { only: %i[id email] } }
      )
    }
  end
end
