# app/controllers/api/v1/reservations_controller.rb
class Api::V1::ReservationsController < ApplicationController
  before_action :authenticate_user!

  def index
    reservations = current_user.reservations.order(reservation_at: :desc)
    render json: { reservations: reservations.as_json(only: %i[id reservation_at people_count phone_number course food_option drink_option canceled]) }
  end

  def show
    r = current_user.reservations.find(params[:id])
    render json: r.as_json(only: %i[id reservation_at people_count phone_number course food_option drink_option canceled])
  end

  def create
    r = current_user.reservations.new(reservation_params)
    if r.save
      ReservationConfirmationJob.perform_later(r.id)
      render json: { id: r.id }, status: :created
    else
      render json: { errors: r.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    r = current_user.reservations.find(params[:id])
    unless r.can_cancel?
      return render json: { error: 'キャンセル可能期間（3時間前まで）を過ぎています' }, status: :forbidden
    end
    r.update!(canceled: true)
    ReservationCancellationJob.perform_later(r.id)
    head :no_content
  end

  private
  def reservation_params
    params.require(:reservation).permit(:reservation_at, :people_count, :phone_number, :course, :food_option, :drink_option)
  end
end
