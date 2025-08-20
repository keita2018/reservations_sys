
module Api
  module V1
    module Auth
      class RegistrationsController < ApplicationController
        respond_to :json
        # skip_before_action :verify_authenticity_token
        # skip_before_action :authenticate_user!, only: [:create]

        def create
          user = User.new(sign_up_params)
          if user.save
            # user.send_confirmation_instructions
            render json: { message: '確認メールを送信しました' }, status: :ok
          else
            render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def sign_up_params
          params.require(:user).permit(:name, :email, :password, :password_confirmation)
        end
      end
    end
  end
end