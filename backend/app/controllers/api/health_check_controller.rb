module Api
  class HealthCheckController < ApplicationController
    def ping
      render json: { status: 'ok', message: 'pong from Rails' }
    end
  end
end