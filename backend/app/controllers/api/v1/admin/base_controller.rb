# app/controllers/api/v1/admin/base_controller.rb
class Api::V1::Admin::BaseController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin!

  private
  def require_admin!
    render json: { error: 'forbidden' }, status: :forbidden unless current_user&.admin?
  end
end
