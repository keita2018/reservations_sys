class Api::V1::Auth::ConfirmationsController < Devise::ConfirmationsController
  respond_to :json
  # skip_before_action :verify_authenticity_token
  # skip_before_action :authenticate_user!, only: [:show]

  # def show
  #   self.resource = resource_class.confirm_by_token(params[:confirmation_token])

  #   if resource.errors.empty?
  #     redirect_to 'http://localhost:5174/login' # Qwik 側へリダイレクト
  #   else
  #     render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
  #   end
  # end
  def show
    self.resource = resource_class.confirm_by_token(params[:confirmation_token].to_s)
    if resource.errors.empty?
      redirect_to "#{ENV.fetch('FRONTEND_URL', 'http://localhost:5174')}/login?confirm_status=ok"
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_content
    end
  end
end
