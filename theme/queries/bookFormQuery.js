export const GET_CUSTOM_FORM=`query support($slug: String!) {
  support {
    custom_form(slug: $slug) {
      id
      application_id
      description
      header_image
      inputs
      login_required
      should_notify
      slug
      success_message
      title
    }
  }
}`;

export const POST_CUSTOM_FORM = `mutation SubmitCustomForm($slug: String!, $customFormSubmissionPayloadInput: CustomFormSubmissionPayloadInput!) {
    submitCustomForm(slug: $slug, customFormSubmissionPayloadInput: $customFormSubmissionPayloadInput) {
      message
      ticket {
        category {
          display
        }
      }
    }
  }
`;