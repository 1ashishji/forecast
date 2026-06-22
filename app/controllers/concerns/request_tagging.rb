module RequestTagging
  extend ActiveSupport::Concern

  included do
    around_action :tag_logger_with_request_id
  end

  private

  def tag_logger_with_request_id
    request_id = request.request_id

    if logger.respond_to?(:tagged)
      logger.tagged(request_id) do
        yield
      end
    else
      yield
    end
  rescue => e
    Rails.logger.error("Request tagging failed: #{e.message}")
    yield
  end
end